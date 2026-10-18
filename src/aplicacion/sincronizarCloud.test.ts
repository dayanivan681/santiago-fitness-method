import 'fake-indexeddb/auto'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { repositorioDePrueba } from '../pruebas/base'
import { sincronizarConfiguracionCloud } from './sincronizarCloud'

describe('frontera cloud del cliente', () => {
  afterEach(() => {
    window.localStorage.removeItem('sfm_cliente_id')
    vi.unstubAllGlobals()
  })

  test('sincroniza perfil y rutina administrada sin aceptar un cliente desde la URL', async () => {
    const repositorio = repositorioDePrueba()
    const fetch = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe('/api/cliente')
      expect(init?.credentials).toBe('same-origin')
      expect(url).not.toContain('cliente_id')
      return new Response(
        JSON.stringify({
          profile: {
            id: 'qa-role-split',
            nombre: 'QA Role Split',
            sexo: 'masculino',
            edad: 31,
            estaturaCm: 180,
            pesoCorporalLb: 190,
            objetivo: 'Verificar round-trip',
            frecuenciaEntrenamiento: 4,
            limitaciones: 'Rodilla',
            notas: 'Gestionado por coach',
            ejerciciosEvitados: [],
          },
          routines: [
            {
              id: 'qa-role-split|upper-a',
              nombre: 'Upper A',
              orden: 1,
              slots: [
                {
                  orden: 1,
                  ejercicioId: 'press-banca-15-smith',
                  estimulo: 'fuerza',
                  seriesObjetivo: 4,
                  repMin: 1,
                  repMax: 5,
                  descansoSegundos: 180,
                  progresionFijada: 'subirCarga',
                  grupo: 'A',
                },
              ],
            },
          ],
          preview: true,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    })
    vi.stubGlobal('fetch', fetch)

    const resultado = await sincronizarConfiguracionCloud(repositorio)

    expect(resultado).toEqual({ clienteId: 'qa-role-split', preview: true })
    expect(await repositorio.participanteActual()).toMatchObject({
      id: 'qa-role-split',
      nombre: 'QA Role Split',
    })
    expect(await repositorio.listarPlantillas('qa-role-split')).toEqual([
      expect.objectContaining({
        id: 'qa-role-split|upper-a',
        participanteId: 'qa-role-split',
        slots: [expect.objectContaining({ progresionFijada: 'subirCarga', grupo: 'A' })],
      }),
    ])
  })

  test('si la API no autoriza, conserva el fallback local y no escribe una identidad', async () => {
    const repositorio = repositorioDePrueba()
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"error":"Acceso requerido"}', { status: 401 })))

    expect(await sincronizarConfiguracionCloud(repositorio)).toBeNull()
    expect(await repositorio.participanteActual()).toBeUndefined()
  })
})
