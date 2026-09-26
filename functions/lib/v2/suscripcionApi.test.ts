import { afterEach, describe, expect, it, vi } from 'vitest'
import { sqliteD1 } from '../../../pruebas-v2/d1'
import type { Contexto } from '../../../shared/v2/contratos'
import { bloqueoPorSuscripcion, rutaDeSuscripcion } from './suscripcionApi'
import type { EntornoV2 } from './seguridad'

const ORIGEN = 'https://santiago-fitness-method.pages.dev'
const STRIPE = { STRIPE_SECRET_KEY: 'sk_test_local', STRIPE_WEBHOOK_SECRET: 'whsec_local', SFM_ENV: 'local' }

function ctx(rol: 'coach' | 'cliente'): Contexto {
  return { rol, identidad: rol === 'coach' ? 'coach@sfm.invalid' : 'lucia', nombre: 'x', expiraEn: 0, validadoEn: 0, entorno: 'local', medios: false }
}

describe('rutas de suscripción', () => {
  const bases: ReturnType<typeof sqliteD1>[] = []
  afterEach(() => { while (bases.length) bases.pop()!.cerrar(); vi.unstubAllGlobals() })

  async function preparar(extra: Partial<EntornoV2> = {}) {
    const local = sqliteD1(); bases.push(local)
    await local.db.prepare("INSERT INTO clientes (id, nombre, creado_en, actualizado_en) VALUES ('lucia', 'Lucía', 1, 1)").run()
    const env = { ACCESO: local.db, ...extra } as unknown as EntornoV2
    const pedir = (rol: 'coach' | 'cliente', ruta: string, cuerpo?: unknown, cliente = 'lucia') =>
      rutaDeSuscripcion(new Request(`${ORIGEN}/x${ruta}`, cuerpo === undefined ? {} : { method: 'POST', body: JSON.stringify(cuerpo) }),
        env, ctx(rol), rol === 'coach' && cliente === '' ? 'coach:coach@sfm.invalid' : cliente, ruta)
    return { pedir }
  }

  it('ignora rutas ajenas y protege las del coach sin Stripe configurado', async () => {
    const { pedir } = await preparar()
    expect(await pedir('cliente', '/inicio')).toBeNull()
    const mia: unknown = await (await pedir('cliente', '/suscripcion'))!.json()
    expect(mia).toMatchObject({ clienteId: 'lucia', pagosDisponibles: false, acceso: { estado: 'sin_suscripcion' } })
    expect((await pedir('cliente', '/suscripcion/exento', { exento: true }))!.status).toBe(404)
    expect((await pedir('cliente', '/suscripciones'))!.status).toBe(404)
    expect((await pedir('cliente', '/suscripcion/pagar', {}))!.status).toBe(503)
    expect((await pedir('coach', '/suscripcion/exento', { exento: true }, ''))!.status).toBe(400)
    expect((await pedir('coach', '/suscripcion/exento', { exento: 'si' }))!.status).toBe(400)
    expect((await pedir('coach', '/suscripcion/exento', { exento: true }))!.status).toBe(200)
    const todas = await (await pedir('coach', '/suscripciones', undefined, ''))!.json() as { suscripciones: { clienteId: string }[] }
    expect(todas.suscripciones.find((x) => x.clienteId === 'lucia')).toMatchObject({ exento: true })
    expect((await pedir('coach', '/precios', undefined, ''))!.status).toBe(503)
  })

  it('con Stripe: valida el precio, convierte errores de Stripe en 502 y rechaza rutas desconocidas', async () => {
    const llamadas: string[] = []
    vi.stubGlobal('fetch', async (entrada: RequestInfo | URL) => {
      const ruta = new URL(String(entrada)).pathname
      llamadas.push(ruta)
      if (ruta === '/v1/prices') return new Response(JSON.stringify({ object: 'list', data: [], has_more: false }), { status: 200 })
      return new Response(JSON.stringify({ error: { type: 'api_error', message: 'caído' } }), { status: 500 })
    })
    const { pedir } = await preparar(STRIPE)
    expect(await (await pedir('coach', '/precios', undefined, ''))!.json()).toEqual({ precios: [] })
    expect((await pedir('coach', '/suscripcion/asignar-precio', { precioId: 'no-es-precio' }))!.status).toBe(400)
    expect((await pedir('coach', '/suscripcion/pausar', {}))!.status).toBe(409)
    expect((await pedir('coach', '/suscripcion/desconocida', {}))!.status).toBe(404)
    expect((await pedir('cliente', '/suscripcion/gestionar', {}))!.status).toBe(409)
    expect((await pedir('coach', '/suscripcion/enlace-de-pago', {}))!.status).toBe(409)
    // Un precio que Stripe no encuentra no se guarda.
    expect((await pedir('coach', '/suscripcion/asignar-precio', { precioId: 'price_x' }))!.status).toBe(400)
    expect(llamadas).toContain('/v1/prices/price_x')
    // Stripe caído: mensaje genérico y 502, sin filtrar el error.
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ error: { type: 'invalid_request_error', message: 'interno' } }), { status: 400 }))
    const caido = await pedir('coach', '/precios', undefined, '')
    expect(caido!.status).toBe(502)
    expect(await caido!.json()).toEqual({ error: 'Stripe no respondió. Inténtalo de nuevo en un momento.' })
  })

  it('solo lectura: bloquea al cliente sin acceso sólo con Stripe encendido, nunca al coach', async () => {
    const local = sqliteD1(); bases.push(local)
    await local.db.prepare("INSERT INTO clientes (id, nombre, creado_en, actualizado_en) VALUES ('lucia', 'Lucía', 1, 1)").run()
    const apagado = { ACCESO: local.db } as unknown as EntornoV2
    const encendido = { ACCESO: local.db, ...STRIPE } as unknown as EntornoV2
    expect(await bloqueoPorSuscripcion(apagado, ctx('cliente'), 'lucia')).toBeNull()
    expect(await bloqueoPorSuscripcion(encendido, ctx('coach'), 'lucia')).toBeNull()
    const bloqueo = await bloqueoPorSuscripcion(encendido, ctx('cliente'), 'lucia')
    expect(bloqueo?.status).toBe(402)
    expect(await bloqueo!.json()).toMatchObject({ acceso: { estado: 'sin_suscripcion', puedeEntrenar: false } })
    const ahora = Math.floor(Date.now() / 1000)
    await local.db.prepare("INSERT INTO suscripciones (cliente_id, stripe_subscription_id, estado, periodo_fin, actualizado_en) VALUES ('lucia', 'sub_1', 'past_due', ?, 1)")
      .bind(ahora - 3600).run()
    // Cobro fallido reciente: sigue en gracia y puede entrenar.
    expect(await bloqueoPorSuscripcion(encendido, ctx('cliente'), 'lucia')).toBeNull()
    await local.db.prepare("UPDATE suscripciones SET periodo_fin=? WHERE cliente_id='lucia'").bind(ahora - 30 * 86400).run()
    expect((await bloqueoPorSuscripcion(encendido, ctx('cliente'), 'lucia'))?.status).toBe(402)
    await local.db.prepare("UPDATE suscripciones SET exento=1 WHERE cliente_id='lucia'").run()
    expect(await bloqueoPorSuscripcion(encendido, ctx('cliente'), 'lucia')).toBeNull()
  })
})
