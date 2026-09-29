// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { sqliteD1 } from '../../../pruebas-v2/d1'
import { plan } from '../../../pruebas-v2/fixtures'
import type { Contexto } from '../../../shared/v2/contratos'
import { aplicar } from './datos'
import { rutaDeBiblioteca } from './bibliotecaApi'
import type { EntornoV2 } from './seguridad'

const ORIGEN = 'https://santiago-fitness-method.pages.dev/x'
const JPEG = new Uint8Array([255, 216, 255, 224, 0, 16, 74, 70, 73, 70])
const PNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
const GIF = new Uint8Array([71, 73, 70, 56, 57, 97, 1, 0])

const ctx = (rol: 'coach' | 'cliente'): Contexto => ({
  rol,
  identidad: rol === 'coach' ? 'coach@sfm.invalid' : 'test-a',
  nombre: 'x',
  expiraEn: 0,
  validadoEn: 0,
  entorno: 'local',
  medios: true,
})

function fakeR2() {
  const objetos = new Map<string, { bytes: ArrayBuffer; contentType?: string }>()
  return {
    objetos,
    async put(clave: string, bytes: ArrayBuffer, o?: { httpMetadata?: { contentType?: string } }) {
      objetos.set(clave, { bytes, contentType: o?.httpMetadata?.contentType })
    },
    async get(clave: string) {
      const o = objetos.get(clave)
      return o ? { body: o.bytes, httpMetadata: { contentType: o.contentType } } : null
    },
  }
}

const nuevo = {
  referenciaCatalogo: 'C012',
  nombre: 'Jalón neutro',
  equipo: 'cable',
  movimiento: 'jalon-vertical',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps'],
  tipoCarga: 'pesoMaquina',
  incrementoMinimoLb: 5,
  explicacionCorta: 'Tira hacia el pecho.',
}

let local: ReturnType<typeof sqliteD1>
let r2: ReturnType<typeof fakeR2>
let env: EntornoV2

beforeEach(() => {
  local = sqliteD1()
  r2 = fakeR2()
  env = { ACCESO: local.db, FOTOS: r2 } as unknown as EntornoV2
  local.ejecutar("INSERT INTO clientes(id,nombre,creado_en,actualizado_en) VALUES('test-a','A',1,1)")
})
afterEach(() => local.cerrar())

function pedir(rol: 'coach' | 'cliente', metodo: string, ruta: string, cuerpo?: BodyInit | object) {
  const init: RequestInit = { method: metodo }
  if (cuerpo !== undefined) {
    const crudo = cuerpo instanceof Uint8Array || typeof cuerpo === 'string'
    init.body = crudo ? (cuerpo as BodyInit) : JSON.stringify(cuerpo)
  }
  return rutaDeBiblioteca(new Request(ORIGEN + ruta, init), env, ctx(rol), ruta)
}

async function crear() {
  const r = (await pedir('coach', 'POST', '/biblioteca', nuevo))!
  expect(r.status).toBe(201)
  return ((await r.json()) as { ejercicio: { id: string } }).ejercicio.id
}

describe('rutas de biblioteca', () => {
  it('ignora rutas ajenas', async () => {
    expect(await pedir('coach', 'GET', '/inicio')).toBeNull()
    expect(await pedir('coach', 'GET', '/bibliotecas')).toBeNull()
  })

  it('el coach crea y ambos roles leen sólo los activos', async () => {
    const id = await crear()
    expect(id).toMatch(/^coach-ej-[0-9a-f-]{36}$/)
    for (const rol of ['coach', 'cliente'] as const) {
      const { ejercicios } = (await (await pedir(rol, 'GET', '/biblioteca'))!.json()) as { ejercicios: { id: string; tieneFoto: boolean; referenciaCatalogo: string }[] }
      expect(ejercicios).toHaveLength(1)
      expect(ejercicios[0]).toMatchObject({ id, tieneFoto: false, referenciaCatalogo: 'C012', musculosSecundarios: ['biceps'] })
    }
  })

  it('el cliente no crea, no edita ni sube fotos', async () => {
    const id = await crear()
    expect((await pedir('cliente', 'POST', '/biblioteca', nuevo))!.status).toBe(403)
    expect((await pedir('cliente', 'PATCH', `/biblioteca/${id}`, { nombre: 'Otro' }))!.status).toBe(403)
    expect((await pedir('cliente', 'PUT', `/biblioteca/${id}/foto`, JPEG))!.status).toBe(403)
    expect(r2.objetos.size).toBe(0)
    expect((await pedir('cliente', 'GET', '/biblioteca'))!.status).toBe(200)
  })

  it('valida el cuerpo y las rutas', async () => {
    const id = await crear()
    expect((await pedir('coach', 'POST', '/biblioteca', { ...nuevo, nombre: '' }))!.status).toBe(400)
    expect((await pedir('coach', 'PATCH', `/biblioteca/${id}`, { equipo: 'kettlebell' }))!.status).toBe(400)
    expect((await pedir('coach', 'PATCH', '/biblioteca/press-banca-barra', { nombre: 'x' }))!.status).toBe(404)
    expect((await pedir('coach', 'PATCH', `/biblioteca/coach-ej-${'0'.repeat(8)}-0000-0000-0000-${'0'.repeat(12)}`, { nombre: 'x' }))!.status).toBe(404)
    expect((await pedir('coach', 'DELETE', `/biblioteca/${id}`))!.status).toBe(404)
  })

  it('edita y archiva sin borrar la fila', async () => {
    const id = await crear()
    const editado = (await (await pedir('coach', 'PATCH', `/biblioteca/${id}`, { nombre: 'Jalón agarre neutro', musculosSecundarios: [] }))!.json()) as { ejercicio: { nombre: string; musculosSecundarios: string[]; equipo: string } }
    expect(editado.ejercicio).toMatchObject({ nombre: 'Jalón agarre neutro', musculosSecundarios: [], equipo: 'cable', explicacionCorta: 'Tira hacia el pecho.', referenciaCatalogo: 'C012' })
    await pedir('coach', 'PATCH', `/biblioteca/${id}`, { activo: false })
    const { ejercicios } = (await (await pedir('cliente', 'GET', '/biblioteca'))!.json()) as { ejercicios: unknown[] }
    expect(ejercicios).toEqual([])
    expect(await local.db.prepare('SELECT COUNT(*) n FROM ejercicios_coach').first('n')).toBe(1)
    await pedir('coach', 'PATCH', `/biblioteca/${id}`, { activo: true })
    expect(((await (await pedir('cliente', 'GET', '/biblioteca'))!.json()) as { ejercicios: unknown[] }).ejercicios).toHaveLength(1)
  })
})

describe('foto del ejercicio', () => {
  it('el coach sube, ambos roles la reciben con caché', async () => {
    const id = await crear()
    const subida = (await pedir('coach', 'PUT', `/biblioteca/${id}/foto`, PNG))!
    expect(subida.status).toBe(200)
    expect(((await subida.json()) as { ejercicio: { tieneFoto: boolean } }).ejercicio.tieneFoto).toBe(true)
    expect(r2.objetos.has(`biblioteca/${id}`)).toBe(true)
    const foto = (await pedir('cliente', 'GET', `/biblioteca/${id}/foto`))!
    expect(foto.status).toBe(200)
    expect(foto.headers.get('Content-Type')).toBe('image/png')
    expect(foto.headers.get('Cache-Control')).toContain('max-age')
  })

  it('rechaza firma inválida y más de 5 MB', async () => {
    const id = await crear()
    expect((await pedir('coach', 'PUT', `/biblioteca/${id}/foto`, GIF))!.status).toBe(400)
    const grande = new Uint8Array(5 * 1024 * 1024 + 1)
    grande.set(JPEG)
    expect((await pedir('coach', 'PUT', `/biblioteca/${id}/foto`, grande))!.status).toBe(413)
    expect(r2.objetos.size).toBe(0)
    expect(((await (await pedir('cliente', 'GET', '/biblioteca'))!.json()) as { ejercicios: { tieneFoto: boolean }[] }).ejercicios[0]!.tieneFoto).toBe(false)
  })

  it('devuelve 404 sin foto o sin ejercicio y 503 sin almacenamiento', async () => {
    const id = await crear()
    expect((await pedir('cliente', 'GET', `/biblioteca/${id}/foto`))!.status).toBe(404)
    expect((await pedir('coach', 'PUT', `/biblioteca/coach-ej-${'a'.repeat(8)}-aaaa-aaaa-aaaa-${'a'.repeat(12)}/foto`, JPEG))!.status).toBe(404)
    env = { ACCESO: local.db } as unknown as EntornoV2
    expect((await pedir('coach', 'PUT', `/biblioteca/${id}/foto`, JPEG))!.status).toBe(503)
  })
})

describe('planes con ejercicios del coach', () => {
  const contexto = ctx('coach')
  const conEjercicio = (ejercicioId: string) => ({
    ...plan,
    dias: plan.dias.map((d, i) => (i === 0 ? { ...d, slots: d.slots.map((s, j) => (j === 0 ? { ...s, ejercicioId } : s)) } : d)),
  })
  const op = (datos: unknown, revision = 0) => ({ opId: crypto.randomUUID(), tipo: 'plan' as const, id: 'programa', datos, revision, eliminado: false })

  it('publica un plan con un ejercicio activo del coach', async () => {
    const id = await crear()
    const r = await aplicar(local.db, 'test-a', contexto, op(conEjercicio(id)))
    expect(r.confirmacion).toBeTruthy()
  })

  it('rechaza ids coach-ej inexistentes y archivados; los del catálogo fijo pasan', async () => {
    await expect(
      aplicar(local.db, 'test-a', contexto, op(conEjercicio(`coach-ej-${'b'.repeat(8)}-bbbb-bbbb-bbbb-${'b'.repeat(12)}`))),
    ).rejects.toMatchObject({ status: 400 })
    const id = await crear()
    await pedir('coach', 'PATCH', `/biblioteca/${id}`, { activo: false })
    await expect(aplicar(local.db, 'test-a', contexto, op(conEjercicio(id)))).rejects.toMatchObject({ status: 400 })
    expect((await aplicar(local.db, 'test-a', contexto, op(plan))).confirmacion).toBeTruthy()
  })
})
