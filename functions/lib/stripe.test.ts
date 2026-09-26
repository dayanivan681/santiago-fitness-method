import { afterEach, describe, expect, it } from 'vitest'
import Stripe from 'stripe'
import { sqliteD1 } from '../../pruebas-v2/d1'
import {
  accionDelCoach, asignarPrecio, crearPago, crearPortal, crearStripe, leerSuscripcion,
  marcarExento, procesarWebhook, stripeConfigurado, suscripcionesDeClientes,
} from './stripe'

const SECRETO = 'whsec_prueba_local'
const ENV = { SFM_ENV: 'local', STRIPE_SECRET_KEY: 'sk_test_local', STRIPE_WEBHOOK_SECRET: SECRETO }
const ORIGEN = 'https://santiago-fitness-method.pages.dev'
const DIA = 24 * 60 * 60
const ahora = () => Math.floor(Date.now() / 1000)

type Llamada = { metodo: string; ruta: string; cuerpo: URLSearchParams }

/** Stripe de mentira: responde como la API real a las rutas que usa la app. */
function stripeFalso() {
  const llamadas: Llamada[] = []
  const suscripciones = new Map<string, Record<string, unknown>>()
  const sub = (id: string, cambios: Record<string, unknown> = {}) => ({
    id, object: 'subscription', status: 'active', customer: 'cus_1', cancel_at_period_end: false,
    pause_collection: null, metadata: { cliente_id: 'lucia' },
    items: { data: [{ current_period_end: ahora() + 30 * DIA, price: { id: 'price_mensual' } }] }, ...cambios,
  })
  const fetchFalso = async (entrada: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(entrada))
    const metodo = init?.method ?? 'GET'
    const cuerpo = new URLSearchParams(typeof init?.body === 'string' ? init.body : '')
    llamadas.push({ metodo, ruta: url.pathname, cuerpo })
    const r = (datos: unknown, status = 200) => new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json' } })
    const ruta = url.pathname
    if (ruta === '/v1/prices/price_mensual') return r({ id: 'price_mensual', object: 'price', active: true, type: 'recurring' })
    if (ruta.startsWith('/v1/prices/')) return r({ error: { type: 'invalid_request_error', message: 'No such price' } }, 404)
    if (ruta === '/v1/prices') return r({ object: 'list', data: [{ id: 'price_mensual', object: 'price', unit_amount: 8000, currency: 'usd',
      recurring: { interval: 'month' }, product: { id: 'prod_1', object: 'product', name: 'Coaching mensual' } }], has_more: false })
    if (ruta === '/v1/checkout/sessions') return r({ id: 'cs_1', object: 'checkout.session', url: 'https://checkout.stripe.com/c/pay/cs_1' })
    if (ruta === '/v1/billing_portal/sessions') return r({ id: 'bps_1', object: 'billing_portal.session', url: 'https://billing.stripe.com/p/session/bps_1' })
    const m = ruta.match(/^\/v1\/subscriptions\/(\w+)$/)
    if (m) {
      const actual = suscripciones.get(m[1]) ?? sub(m[1])
      if (metodo === 'POST') {
        const siguiente = { ...actual }
        if (cuerpo.has('pause_collection[behavior]')) siguiente.pause_collection = { behavior: cuerpo.get('pause_collection[behavior]') }
        if (cuerpo.get('pause_collection') === '') siguiente.pause_collection = null
        if (cuerpo.has('cancel_at_period_end')) siguiente.cancel_at_period_end = cuerpo.get('cancel_at_period_end') === 'true'
        suscripciones.set(m[1], siguiente)
        return r(siguiente)
      }
      return r(actual)
    }
    return r({ error: { message: `ruta no simulada ${ruta}` } }, 404)
  }
  return { llamadas, suscripciones, sub, stripe: crearStripe(ENV, fetchFalso as typeof fetch) }
}

async function evento(tipo: string, objeto: unknown, id = `evt_${Math.random().toString(36).slice(2)}`, secreto = SECRETO) {
  const payload = JSON.stringify({ id, object: 'event', type: tipo, data: { object: objeto }, api_version: '2026-08-26.dahlia', created: ahora() })
  const firma = await new Stripe('sk_test_x').webhooks.generateTestHeaderStringAsync({
    payload, secret: secreto, cryptoProvider: Stripe.createSubtleCryptoProvider(),
  })
  return new Request(`${ORIGEN}/api/stripe/webhook`, { method: 'POST', body: payload, headers: { 'stripe-signature': firma } })
}

describe('configuración', () => {
  it('falla cerrado sin claves, con clave real sin aprobación y en producción sin habilitar', () => {
    expect(stripeConfigurado({})).toBe(false)
    expect(stripeConfigurado({ STRIPE_SECRET_KEY: 'sk_test_x' })).toBe(false)
    expect(stripeConfigurado(ENV)).toBe(true)
    expect(stripeConfigurado({ ...ENV, STRIPE_SECRET_KEY: 'sk_live_x' })).toBe(false)
    expect(stripeConfigurado({ ...ENV, STRIPE_SECRET_KEY: 'sk_live_x', STRIPE_MODO_REAL: 'true' })).toBe(true)
    expect(stripeConfigurado({ ...ENV, SFM_ENV: 'production' })).toBe(false)
    expect(stripeConfigurado({ ...ENV, SFM_ENV: 'production', STRIPE_HABILITADO: 'true' })).toBe(true)
    expect(() => crearStripe({})).toThrow('Los pagos no están disponibles')
  })
})

describe('suscripciones con Stripe simulado', () => {
  const bases: ReturnType<typeof sqliteD1>[] = []
  afterEach(() => { while (bases.length) bases.pop()!.cerrar() })

  async function preparar() {
    const local = sqliteD1(); bases.push(local)
    for (const id of ['lucia', 'marcos']) {
      await local.db.prepare('INSERT INTO clientes (id, nombre, creado_en, actualizado_en) VALUES (?, ?, 1, 1)').bind(id, id).run()
    }
    await local.db.prepare("INSERT INTO cuentas (cliente_id, email, creada_en) VALUES ('lucia', 'lucia@example.test', 1)").run()
    return { db: local.db, ...stripeFalso() }
  }

  it('sólo acepta precios recurrentes que existen en Stripe', async () => {
    const { db, stripe } = await preparar()
    await expect(asignarPrecio(db, stripe, 'lucia', 'price_inventado')).rejects.toThrow('Ese precio no existe')
    await asignarPrecio(db, stripe, 'lucia', 'price_mensual')
    expect((await leerSuscripcion(db, 'lucia'))?.precio_id).toBe('price_mensual')
  })

  it('el pago exige plan elegido y lleva cliente y email a Checkout', async () => {
    const { db, stripe, llamadas } = await preparar()
    await expect(crearPago(db, stripe, 'lucia', ORIGEN)).rejects.toThrow('todavía no ha elegido el plan')
    await asignarPrecio(db, stripe, 'lucia', 'price_mensual')
    expect(await crearPago(db, stripe, 'lucia', ORIGEN)).toBe('https://checkout.stripe.com/c/pay/cs_1')
    const checkout = llamadas.find((l) => l.ruta === '/v1/checkout/sessions')!.cuerpo
    expect(checkout.get('mode')).toBe('subscription')
    expect(checkout.get('client_reference_id')).toBe('lucia')
    expect(checkout.get('subscription_data[metadata][cliente_id]')).toBe('lucia')
    expect(checkout.get('customer_email')).toBe('lucia@example.test')
    expect(checkout.get('line_items[0][price]')).toBe('price_mensual')
    await expect(crearPortal(db, stripe, 'lucia', ORIGEN)).rejects.toThrow('Todavía no hay pagos')
  })

  it('webhook: rechaza firmas falsas, guarda el pago, ignora repeticiones y no crea dos suscripciones', async () => {
    const { db, stripe, llamadas, sub } = await preparar()
    await asignarPrecio(db, stripe, 'lucia', 'price_mensual')
    const falso = await evento('checkout.session.completed', {}, 'evt_falso', 'whsec_otro')
    expect(await procesarWebhook(falso, db, stripe, SECRETO)).toBe(400)
    expect(await procesarWebhook(new Request(`${ORIGEN}/x`, { method: 'POST', body: '{}' }), db, stripe, SECRETO)).toBe(400)

    const completado = { id: 'cs_1', object: 'checkout.session', mode: 'subscription', subscription: 'sub_1', client_reference_id: 'lucia' }
    expect(await procesarWebhook(await evento('checkout.session.completed', completado, 'evt_1'), db, stripe, SECRETO)).toBe(200)
    expect(await leerSuscripcion(db, 'lucia')).toMatchObject({ stripe_subscription_id: 'sub_1', estado: 'active', stripe_customer_id: 'cus_1' })
    const lecturas = llamadas.filter((l) => l.ruta === '/v1/subscriptions/sub_1').length
    expect(await procesarWebhook(await evento('checkout.session.completed', completado, 'evt_1'), db, stripe, SECRETO)).toBe(200)
    expect(llamadas.filter((l) => l.ruta === '/v1/subscriptions/sub_1').length).toBe(lecturas)

    await expect(crearPago(db, stripe, 'lucia', ORIGEN)).rejects.toThrow('Ya hay una suscripción en curso')
    expect(await crearPortal(db, stripe, 'lucia', ORIGEN)).toBe('https://billing.stripe.com/p/session/bps_1')
    void sub
  })

  it('webhook: el estado se relee de Stripe y una suscripción no cambia de cliente', async () => {
    const { db, stripe, suscripciones, sub } = await preparar()
    suscripciones.set('sub_1', sub('sub_1', { status: 'past_due' }))
    // El evento dice "active" pero Stripe ya dice "past_due": gana Stripe.
    await procesarWebhook(await evento('customer.subscription.updated', sub('sub_1')), db, stripe, SECRETO)
    expect((await leerSuscripcion(db, 'lucia'))?.estado).toBe('past_due')

    suscripciones.set('sub_1', sub('sub_1', { metadata: { cliente_id: 'marcos' } }))
    await procesarWebhook(await evento('customer.subscription.updated', sub('sub_1')), db, stripe, SECRETO)
    expect(await leerSuscripcion(db, 'marcos')).toBeNull()

    suscripciones.set('sub_x', sub('sub_x', { metadata: { cliente_id: 'no-existe' } }))
    expect(await procesarWebhook(await evento('customer.subscription.created', sub('sub_x')), db, stripe, SECRETO)).toBe(200)
    expect(await leerSuscripcion(db, 'no-existe')).toBeNull()
  })

  it('el coach pausa, reanuda, cancela al final y marca exento; ve a todos sus clientes', async () => {
    const { db, stripe } = await preparar()
    await expect(accionDelCoach(db, stripe, 'lucia', 'pausar')).rejects.toThrow('no tiene una suscripción')
    await procesarWebhook(await evento('checkout.session.completed',
      { id: 'cs_1', object: 'checkout.session', mode: 'subscription', subscription: 'sub_1', client_reference_id: 'lucia' }), db, stripe, SECRETO)

    await accionDelCoach(db, stripe, 'lucia', 'pausar')
    expect((await leerSuscripcion(db, 'lucia'))?.pausada).toBe(1)
    await accionDelCoach(db, stripe, 'lucia', 'reanudar')
    expect((await leerSuscripcion(db, 'lucia'))?.pausada).toBe(0)
    await accionDelCoach(db, stripe, 'lucia', 'cancelar')
    expect((await leerSuscripcion(db, 'lucia'))?.cancelar_al_final).toBe(1)
    await accionDelCoach(db, stripe, 'lucia', 'mantener')
    expect((await leerSuscripcion(db, 'lucia'))?.cancelar_al_final).toBe(0)

    await marcarExento(db, 'marcos', true)
    // Un evento de Stripe nunca borra la decisión de exento del coach.
    await procesarWebhook(await evento('customer.subscription.updated', { id: 'sub_1' }), db, stripe, SECRETO)
    const todas = await suscripcionesDeClientes(db)
    expect(todas.find((s) => s.clienteId === 'lucia')?.acceso.estado).toBe('activa')
    expect(todas.find((s) => s.clienteId === 'marcos')).toMatchObject({ exento: true, acceso: { estado: 'exenta' } })
  })

  it('lista los precios activos con su nombre', async () => {
    const { stripe } = await preparar()
    const { listarPrecios } = await import('./stripe')
    expect(await listarPrecios(stripe)).toEqual([{ id: 'price_mensual', nombre: 'Coaching mensual', importe: 8000, moneda: 'usd', intervalo: 'month' }])
  })
})

describe('webhook en el middleware', () => {
  const llamar = async (env: Record<string, unknown>, init: RequestInit = { method: 'POST', body: '{}' }) => {
    const { onRequest } = await import('../_middleware')
    return onRequest({
      request: new Request(`${ORIGEN}/api/stripe/webhook`, init),
      env,
      next: async () => new Response('shell'),
    } as unknown as Parameters<typeof onRequest>[0])
  }

  it('sin claves no existe; con claves sólo acepta POST firmado aunque Stripe no mande Origin', async () => {
    expect((await llamar({})).status).toBe(404)
    const local = sqliteD1()
    try {
      const env = { ...ENV, ACCESO: local.db }
      expect((await llamar(env, { method: 'GET' })).status).toBe(405)
      expect((await llamar(env)).status).toBe(400)
      const firmado = await evento('invoice.created', { id: 'in_1' }, 'evt_mw')
      expect((await llamar(env, { method: 'POST', body: await firmado.text(), headers: firmado.headers })).status).toBe(200)
    } finally {
      local.cerrar()
    }
  })
})
