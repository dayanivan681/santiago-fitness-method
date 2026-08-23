import { describe, test, expect, afterEach, vi } from 'vitest'
import { fechaDeHoy, fechaHaceDias, nuevoId } from './repositorio'

const FORMATO_UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('nuevoId', () => {
  test('genera identificadores únicos', () => {
    const ids = new Set(Array.from({ length: 500 }, nuevoId))

    expect(ids.size).toBe(500)
  })

  test('sigue funcionando sin crypto.randomUUID (§27)', () => {
    // Es el caso real de probar la app en el gimnasio desde el móvil por la
    // red local: http:// no es contexto seguro y randomUUID no existe.
    // Arrange
    vi.stubGlobal('crypto', {
      getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto),
    })

    // Act
    const id = nuevoId()

    // Assert
    expect(id).toMatch(FORMATO_UUID_V4)
  })

  test('el recambio también genera identificadores únicos', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto),
    })

    const ids = new Set(Array.from({ length: 500 }, nuevoId))

    expect(ids.size).toBe(500)
  })
})

describe('fechas', () => {
  test('fechaDeHoy usa el día local, no el UTC', () => {
    // Arrange: 23:30 hora local. Con UTC el día podría saltar al siguiente y
    // la sesión se guardaría con fecha equivocada.
    const casiMedianoche = new Date(2026, 7, 18, 23, 30)

    // Act + Assert
    expect(fechaDeHoy(casiMedianoche)).toBe('2026-08-18')
  })

  test('fechaHaceDias retrocede el número de días pedido', () => {
    const hoy = new Date(2026, 7, 18, 12, 0)

    expect(fechaHaceDias(6, hoy)).toBe('2026-08-12')
  })

  test('la ventana de 7 días incluye hoy y los seis anteriores', () => {
    const hoy = new Date(2026, 7, 18, 12, 0)

    expect(fechaDeHoy(hoy)).toBe('2026-08-18')
    expect(fechaHaceDias(7 - 1, hoy)).toBe('2026-08-12')
  })
})
