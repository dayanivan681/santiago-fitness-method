import { describe, test, expect } from 'vitest'
import {
  seriesDirectasPorMusculo,
  seriesIndirectasPorMusculo,
  objetivoSemanal,
  estadoVolumen,
} from './volumen'
import type { Ejercicio, SerieRegistrada } from '../dominio/tipos'

const ejercicio = (id: string, primario: Ejercicio['musculoPrimario'], secundarios: Ejercicio['musculosSecundarios'] = []): Ejercicio => ({
  id,
  movimiento: id,
  nombre: id,
  equipo: 'maquinaTradicional',
  imagen: '',
  explicacionCorta: '',
  musculoPrimario: primario,
  musculosSecundarios: secundarios,
  tipoCarga: 'total',
  incrementoMinimoLb: 5,
})

const serieDe = (ejercicioId: string, numeroSerie: number): SerieRegistrada => ({
  id: `${ejercicioId}-${numeroSerie}`,
  sesionId: 's1',
  ejercicioId,
  numeroSerie,
  pesoRegistradoLb: 100,
  repsRealizadas: 10,
  rir: 2,
})

// Un press de pecho ya trabaja bastante deltoide anterior (§21)
const pressBanca = ejercicio('press-banca', 'pecho', ['deltoideAnterior', 'triceps'])
const remo = ejercicio('remo', 'espalda', ['deltoidePosterior', 'biceps'])
const elevacionLateral = ejercicio('elevacion-lateral', 'deltoideLateral')

const biblioteca = new Map([
  [pressBanca.id, pressBanca],
  [remo.id, remo],
  [elevacionLateral.id, elevacionLateral],
])

describe('seriesDirectasPorMusculo (§21)', () => {
  test('cuenta cada serie sólo para el músculo primario', () => {
    // Arrange: 3 series de press de banca
    const series = [serieDe('press-banca', 1), serieDe('press-banca', 2), serieDe('press-banca', 3)]

    // Act
    const directas = seriesDirectasPorMusculo(series, biblioteca)

    // Assert
    expect(directas.pecho).toBe(3)
  })

  test('no suma los compuestos como serie completa a los músculos secundarios', () => {
    // §21: el press ya trabaja deltoide anterior, los remos ya trabajan el posterior.
    // No se duplica trabajo innecesariamente.
    // Arrange
    const series = [serieDe('press-banca', 1), serieDe('remo', 1)]

    // Act
    const directas = seriesDirectasPorMusculo(series, biblioteca)

    // Assert
    expect(directas.deltoideAnterior ?? 0).toBe(0)
    expect(directas.deltoidePosterior ?? 0).toBe(0)
    expect(directas.triceps ?? 0).toBe(0)
    expect(directas.biceps ?? 0).toBe(0)
  })

  test('la elevación lateral sí cuenta como trabajo directo de deltoide lateral', () => {
    const series = [serieDe('elevacion-lateral', 1), serieDe('elevacion-lateral', 2)]

    expect(seriesDirectasPorMusculo(series, biblioteca).deltoideLateral).toBe(2)
  })

  test('ignora series de ejercicios que no están en la biblioteca', () => {
    const series = [serieDe('fantasma', 1)]

    expect(seriesDirectasPorMusculo(series, biblioteca)).toEqual({})
  })
})

describe('seriesIndirectasPorMusculo (§21)', () => {
  test('registra el trabajo secundario por separado, como información', () => {
    // Arrange
    const series = [serieDe('press-banca', 1), serieDe('press-banca', 2)]

    // Act
    const indirectas = seriesIndirectasPorMusculo(series, biblioteca)

    // Assert
    expect(indirectas.deltoideAnterior).toBe(2)
    expect(indirectas.triceps).toBe(2)
    expect(indirectas.pecho ?? 0).toBe(0)
  })
})

describe('objetivoSemanal (§20, §22)', () => {
  test('el pecho masculino apunta a 8–10 series', () => {
    expect(objetivoSemanal('masculino', 'pecho')).toEqual({ min: 8, max: 10 })
  })

  test('el pecho femenino apunta a 6 series', () => {
    expect(objetivoSemanal('femenino', 'pecho')).toEqual({ min: 6, max: 6 })
  })

  test('espalda, cuádriceps, glúteos y femoral comparten objetivo 8–10', () => {
    for (const musculo of ['espalda', 'cuadriceps', 'gluteos', 'femoral'] as const) {
      expect(objetivoSemanal('femenino', musculo)).toEqual({ min: 8, max: 10 })
    }
  })

  test('bíceps, tríceps y deltoide lateral apuntan a 4–6 series directas', () => {
    for (const musculo of ['biceps', 'triceps', 'deltoideLateral'] as const) {
      expect(objetivoSemanal('masculino', musculo)).toEqual({ min: 4, max: 6 })
    }
  })
})

describe('estadoVolumen — los cuatro estados del cliente (§20)', () => {
  test('distingue falta, dentro, cumplido y revisar recuperación', () => {
    // Pecho masculino apunta a 8–10 series
    expect(estadoVolumen('masculino', 'pecho', 5)).toBe('falta')
    expect(estadoVolumen('masculino', 'pecho', 9)).toBe('dentro')
    expect(estadoVolumen('masculino', 'pecho', 10)).toBe('cumplido')
    expect(estadoVolumen('masculino', 'pecho', 14)).toBe('revisarRecuperacion')
  })

  test('justo en el mínimo ya está dentro del objetivo', () => {
    expect(estadoVolumen('masculino', 'pecho', 8)).toBe('dentro')
  })

  test('devuelve sinObjetivo para músculos que §20 no lista', () => {
    expect(estadoVolumen('masculino', 'core', 4)).toBe('sinObjetivo')
  })
})

describe('el calentamiento no cuenta (§20, §21)', () => {
  test('una serie de calentamiento no suma volumen directo', () => {
    // Arrange: tres series de press, la primera de aproximación
    const series = [
      { ...serieDe('press-banca', 1), esCalentamiento: true },
      serieDe('press-banca', 2),
      serieDe('press-banca', 3),
    ]

    // Act
    const directas = seriesDirectasPorMusculo(series, biblioteca)

    // Assert: si contara, el volumen semanal saldría inflado
    expect(directas.pecho).toBe(2)
  })

  test('tampoco suma trabajo indirecto', () => {
    const series = [{ ...serieDe('press-banca', 1), esCalentamiento: true }]

    expect(seriesIndirectasPorMusculo(series, biblioteca).triceps ?? 0).toBe(0)
  })
})
