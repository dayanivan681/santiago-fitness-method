import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EjercicioCoachNuevo } from '../../shared/v2/biblioteca'
import { ServicioBiblioteca } from './servicioBiblioteca'
import { ServicioCoach } from './servicio'

const nuevo: EjercicioCoachNuevo = {
  referenciaCatalogo: 'C012',
  nombre: 'Jalón neutro',
  equipo: 'cable',
  movimiento: 'jalon-vertical',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps'],
  tipoCarga: 'pesoMaquina',
  incrementoMinimoLb: 5,
  pesoBaseMaquinaLb: null,
  explicacionCorta: 'Tira hacia el pecho.',
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:foto-demo')
})

describe('ServicioBiblioteca en demo', () => {
  it('crea, lista, edita y archiva en memoria sin llamar a la red', async () => {
    const fetchEspia = vi.spyOn(globalThis, 'fetch')
    const servicio = new ServicioBiblioteca(true)
    const creado = await servicio.crear(nuevo)
    expect(creado.id).toMatch(/^coach-ej-[0-9a-f-]{36}$/)
    expect(await servicio.listar()).toHaveLength(1)

    const editado = await servicio.editar(creado.id, { nombre: 'Jalón agarre neutro' })
    expect(editado).toMatchObject({ nombre: 'Jalón agarre neutro', equipo: 'cable', explicacionCorta: 'Tira hacia el pecho.' })

    await servicio.archivar(creado.id)
    expect(await servicio.listar()).toEqual([])
    expect(fetchEspia).not.toHaveBeenCalled()
  })

  it('la foto es un enlace local: no se sube nada', async () => {
    const servicio = new ServicioBiblioteca(true)
    const creado = await servicio.crear(nuevo)
    expect(servicio.urlDeFoto(creado)).toBeNull()
    const conFoto = await servicio.subirFoto(creado.id, new Blob(['x'], { type: 'image/jpeg' }))
    expect(conFoto.tieneFoto).toBe(true)
    expect(servicio.urlDeFoto(conFoto)).toBe('blob:foto-demo')
  })

  it('rechaza editar un id desconocido', async () => {
    await expect(new ServicioBiblioteca(true).editar('coach-ej-x', { nombre: 'a' })).rejects.toThrow('Ejercicio no disponible.')
  })

  it('el cliente de la demo también ve el ejercicio del coach', async () => {
    const coach = new ServicioCoach(true)
    const creado = await coach.biblioteca.crear(nuevo)
    const repo = await coach.repoDemo('demo-persona-1')
    expect((await repo.obtenerEjercicio(creado.id))?.nombre).toBe('Jalón neutro')
    const otro = await coach.biblioteca.crear({ ...nuevo, nombre: 'Otro' })
    expect((await (await coach.repoDemo('demo-persona-1')).obtenerEjercicio(otro.id))?.nombre).toBe('Otro')
  })
})

describe('ServicioBiblioteca real', () => {
  const respuesta = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status })
  const ejercicio = { ...nuevo, id: 'coach-ej-a', tieneFoto: false, activo: true, creadoEn: 1, actualizadoEn: 2 }

  it('habla con /admin/api/v2/biblioteca y sube la foto como cuerpo binario', async () => {
    const llamadas: { url: string; metodo: string; tipo?: string }[] = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (entrada, init) => {
      const cabeceras = new Headers(init?.headers)
      llamadas.push({ url: new URL(String(entrada)).pathname, metodo: init?.method ?? 'GET', tipo: cabeceras.get('Content-Type') ?? undefined })
      return respuesta(init?.method === 'GET' ? { ejercicios: [ejercicio] } : { ejercicio })
    })
    const servicio = new ServicioBiblioteca(false)
    expect(await servicio.listar()).toHaveLength(1)
    await servicio.crear(nuevo)
    await servicio.editar('coach-ej-a', { nombre: 'x' })
    await servicio.subirFoto('coach-ej-a', new Blob(['x'], { type: 'image/jpeg' }))
    await servicio.archivar('coach-ej-a')
    expect(llamadas.map((l) => `${l.metodo} ${l.url}`)).toEqual([
      'GET /admin/api/v2/biblioteca',
      'POST /admin/api/v2/biblioteca',
      'PATCH /admin/api/v2/biblioteca/coach-ej-a',
      'PUT /admin/api/v2/biblioteca/coach-ej-a/foto',
      'PATCH /admin/api/v2/biblioteca/coach-ej-a',
    ])
    expect(llamadas[3].tipo).toBe('image/jpeg')
    expect(servicio.urlDeFoto(ejercicio)).toBe('/admin/api/v2/biblioteca/coach-ej-a/foto?v=2')
  })

  it('muestra el error del servidor si la foto no es válida', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(respuesta({ error: 'Usa una fotografía JPEG, PNG o WebP.' }, 400))
    await expect(new ServicioBiblioteca(false).subirFoto('coach-ej-a', new Blob(['x'], { type: 'image/gif' }))).rejects.toThrow('Usa una fotografía JPEG, PNG o WebP.')
  })
})
