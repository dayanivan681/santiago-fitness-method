import { describe, test, expect } from 'vitest'
import { calcularDescansos, segundosEntre } from './descanso'
import type { SerieRegistrada } from '../dominio/tipos'

const serie = (numeroSerie: number, instante?: string): SerieRegistrada => ({
  id: `s${numeroSerie}`,
  sesionId: 'sesion',
  ejercicioId: 'press',
  numeroSerie,
  pesoRegistradoLb: 100,
  repsRealizadas: 10,
  rir: 2,
  instante,
})

describe('segundosEntre', () => {
  test('cuenta los segundos entre dos instantes', () => {
    expect(segundosEntre('2026-08-18T10:00:00.000Z', '2026-08-18T10:01:30.000Z')).toBe(90)
  })

  test('nunca devuelve un valor negativo si los relojes se cruzan', () => {
    expect(segundosEntre('2026-08-18T10:01:30.000Z', '2026-08-18T10:00:00.000Z')).toBe(0)
  })
})

describe('calcularDescansos (§5)', () => {
  test('el descanso de una serie es el tiempo desde la anterior', () => {
    // Arrange: serie 1 a las 10:00, serie 2 a las 10:02
    const series = [
      serie(1, '2026-08-18T10:00:00.000Z'),
      serie(2, '2026-08-18T10:02:00.000Z'),
    ]

    // Act
    const descansos = calcularDescansos(series)

    // Assert
    expect(descansos.get(2)).toBe(120)
  })

  test('la primera serie no tiene descanso previo', () => {
    const series = [serie(1, '2026-08-18T10:00:00.000Z')]

    expect(calcularDescansos(series).has(1)).toBe(false)
  })

  test('ordena por número de serie aunque lleguen desordenadas', () => {
    // Arrange
    const series = [
      serie(3, '2026-08-18T10:06:00.000Z'),
      serie(1, '2026-08-18T10:00:00.000Z'),
      serie(2, '2026-08-18T10:03:00.000Z'),
    ]

    // Act
    const descansos = calcularDescansos(series)

    // Assert
    expect(descansos.get(2)).toBe(180)
    expect(descansos.get(3)).toBe(180)
  })

  test('omite las series antiguas que no guardaron el instante', () => {
    // Las series registradas antes de que existiera este dato no deben
    // inventarse un descanso.
    const series = [serie(1), serie(2, '2026-08-18T10:02:00.000Z')]

    expect(calcularDescansos(series).has(2)).toBe(false)
  })

  test('devuelve un mapa vacío si no hay series', () => {
    expect(calcularDescansos([]).size).toBe(0)
  })
})
