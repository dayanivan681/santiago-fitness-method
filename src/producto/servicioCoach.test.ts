import { afterEach, describe, expect, it, vi } from 'vitest'
import { ServicioCoach } from './servicio'

const respuesta = (cuerpo: unknown, status = 200, etiqueta?: string) =>
  new Response(status === 304 ? null : JSON.stringify(cuerpo), {
    status,
    headers: etiqueta ? { ETag: etiqueta } : {},
  })

const cambio = (cursor: number) => ({
  tipo: 'entrenamiento',
  id: `e-${cursor}`,
  datos: {},
  revision: 1,
  cursor,
  opId: `op-${cursor}`,
  actor: 'cliente:ana',
  eliminado: false,
})

afterEach(() => vi.restoreAllMocks())

describe('ServicioCoach no relee lo que ya tiene', () => {
  it('la lista de clientes se pide con la etiqueta y un 304 devuelve la copia guardada', async () => {
    const clientes = [{ perfil: { id: 'ana' }, plan: { dias: [] }, revision: 1 }]
    const fetchEspia = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(respuesta({ clientes }, 200, '"cl-1"'))
      .mockResolvedValueOnce(respuesta(null, 304, '"cl-1"'))
    const servicio = new ServicioCoach(false)

    expect(await servicio.listar()).toEqual(clientes)
    expect(await servicio.listar()).toEqual(clientes)

    const cabeceras = fetchEspia.mock.calls[1][1]?.headers as Record<string, string>
    expect(cabeceras['If-None-Match']).toBe('"cl-1"')
  })

  it('el historial de un cliente sólo pide lo posterior al último cursor', async () => {
    const fetchEspia = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(respuesta({ cambios: [cambio(1), cambio(2)], cursor: 2, mas: false }))
      .mockResolvedValueOnce(respuesta({ cambios: [], cursor: 2, mas: false }))
      .mockResolvedValueOnce(respuesta({ cambios: [cambio(3)], cursor: 3, mas: false }))
    const servicio = new ServicioCoach(false)

    expect((await servicio.cambios('ana')).map((c) => c.cursor)).toEqual([1, 2])
    expect((await servicio.cambios('ana')).map((c) => c.cursor)).toEqual([1, 2])
    expect((await servicio.cambios('ana')).map((c) => c.cursor)).toEqual([1, 2, 3])

    const cursores = fetchEspia.mock.calls.map(([url]) => new URL(String(url)).searchParams.get('cursor'))
    expect(cursores).toEqual(['0', '2', '2'])
  })
})
