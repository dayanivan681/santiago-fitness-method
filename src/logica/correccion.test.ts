import { describe, test, expect } from 'vitest'
import { aplicarCorreccion, deshacerCorreccion, puedeDeshacerse } from './correccion'
import type { SerieRegistrada } from '../dominio/tipos'

const serie = (parcial: Partial<SerieRegistrada> = {}): SerieRegistrada => ({
  id: 'a',
  sesionId: 's1',
  ejercicioId: 'press-banca-15-smith',
  numeroSerie: 1,
  pesoRegistradoLb: 45,
  repsRealizadas: 10,
  rir: 2,
  instante: '2026-08-20T10:00:00.000Z',
  ...parcial,
})

describe('corregir deja rastro (§19)', () => {
  test('los valores nuevos entran y los viejos se apilan', () => {
    // Arrange + Act
    const corregida = aplicarCorreccion(serie(), { pesoRegistradoLb: 50, repsRealizadas: 8, rir: 1 })

    // Assert
    expect(corregida.pesoRegistradoLb).toBe(50)
    expect(corregida.correcciones).toHaveLength(1)
    expect(corregida.correcciones![0].pesoRegistradoLb).toBe(45)
    expect(corregida.correcciones![0].repsRealizadas).toBe(10)
  })

  test('conserva el instante original para no falsear el descanso (§5)', () => {
    const corregida = aplicarCorreccion(serie(), { pesoRegistradoLb: 50, repsRealizadas: 10, rir: 2 })

    expect(corregida.instante).toBe('2026-08-20T10:00:00.000Z')
  })

  test('corregir dos veces apila dos entradas, no sustituye la primera', () => {
    const una = aplicarCorreccion(serie(), { pesoRegistradoLb: 50, repsRealizadas: 10, rir: 2 })
    const dos = aplicarCorreccion(una, { pesoRegistradoLb: 55, repsRealizadas: 10, rir: 2 })

    expect(dos.correcciones!.map((c) => c.pesoRegistradoLb)).toEqual([45, 50])
  })

  test('no muta la serie original', () => {
    const original = serie()

    aplicarCorreccion(original, { pesoRegistradoLb: 99, repsRealizadas: 1, rir: 0 })

    expect(original.pesoRegistradoLb).toBe(45)
    expect(original.correcciones).toBeUndefined()
  })
})

describe('deshacer la última corrección', () => {
  test('sin correcciones no hay nada que deshacer', () => {
    expect(puedeDeshacerse(serie())).toBe(false)
    expect(deshacerCorreccion(serie())).toEqual(serie())
  })

  test('devuelve los valores anteriores', () => {
    // Arrange: se corrigió 45 → 50 por error
    const corregida = aplicarCorreccion(serie(), { pesoRegistradoLb: 50, repsRealizadas: 8, rir: 1 })

    // Act
    const deshecha = deshacerCorreccion(corregida)

    // Assert
    expect(deshecha.pesoRegistradoLb).toBe(45)
    expect(deshecha.repsRealizadas).toBe(10)
    expect(deshecha.rir).toBe(2)
  })

  test('deshacer NO borra la auditoría: el rastro crece', () => {
    // §19 prohíbe perder lo registrado, y una reversión también es un hecho.
    const corregida = aplicarCorreccion(serie(), { pesoRegistradoLb: 50, repsRealizadas: 8, rir: 1 })

    const deshecha = deshacerCorreccion(corregida)

    expect(deshecha.correcciones).toHaveLength(2)
    expect(deshecha.correcciones!.map((c) => c.motivo)).toEqual(['correccion', 'reversion'])
    // Y sigue constando por dónde pasó: 45 original, 50 el valor revertido
    expect(deshecha.correcciones!.map((c) => c.pesoRegistradoLb)).toEqual([45, 50])
  })

  test('una vez deshecha, no se puede volver a deshacer', () => {
    // La serie ya está en los valores previos; no queda corrección pendiente.
    const deshecha = deshacerCorreccion(
      aplicarCorreccion(serie(), { pesoRegistradoLb: 50, repsRealizadas: 8, rir: 1 }),
    )

    expect(puedeDeshacerse(deshecha)).toBe(false)
    expect(deshacerCorreccion(deshecha)).toEqual(deshecha)
  })

  test('tras corregir de nuevo vuelve a poder deshacerse', () => {
    const deshecha = deshacerCorreccion(
      aplicarCorreccion(serie(), { pesoRegistradoLb: 50, repsRealizadas: 8, rir: 1 }),
    )

    const otraVez = aplicarCorreccion(deshecha, { pesoRegistradoLb: 60, repsRealizadas: 8, rir: 1 })

    expect(puedeDeshacerse(otraVez)).toBe(true)
    expect(otraVez.correcciones).toHaveLength(3)
  })

  test('también devuelve la técnica y el calentamiento', () => {
    const corregida = aplicarCorreccion(serie({ tecnica: 'buena' }), {
      pesoRegistradoLb: 45,
      repsRealizadas: 10,
      rir: 2,
      tecnica: 'deficiente',
      esCalentamiento: true,
    })

    const deshecha = deshacerCorreccion(corregida)

    expect(deshecha.tecnica).toBe('buena')
    expect(deshecha.esCalentamiento).toBeUndefined()
  })

  test('conserva el instante original al deshacer (§5)', () => {
    const corregida = aplicarCorreccion(serie(), { pesoRegistradoLb: 50, repsRealizadas: 8, rir: 1 })

    expect(deshacerCorreccion(corregida).instante).toBe('2026-08-20T10:00:00.000Z')
  })
})
