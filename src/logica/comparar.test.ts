import { describe, test, expect } from 'vitest'
import { compararSeries, mejorSerie } from './comparar'
import { RANGO_POR_ESTIMULO } from '../dominio/estimulo'
import type { SerieComparable } from '../dominio/tipos'

const serie = (cargaTotalLb: number, reps: number, rir = 2): SerieComparable => ({
  cargaTotalLb,
  reps,
  rir,
  tecnica: 'buena',
})

const FUERZA = RANGO_POR_ESTIMULO.fuerza // 1–5
const HIPERTROFIA = RANGO_POR_ESTIMULO.hipertrofia // 6–15
const RESISTENCIA = RANGO_POR_ESTIMULO.resistencia // 15–20

describe('compararSeries — fuerza (§10)', () => {
  test('manda la carga: más peso gana aunque baje una repetición', () => {
    // Arrange
    const masPesado = serie(225, 3)
    const masLigero = serie(215, 4)

    // Act
    const resultado = compararSeries(masPesado, masLigero, FUERZA)

    // Assert
    expect(resultado).toBeGreaterThan(0)
  })

  test('a igual carga, gana el que hizo más repeticiones', () => {
    expect(compararSeries(serie(225, 5), serie(225, 3), FUERZA)).toBeGreaterThan(0)
  })
})

describe('compararSeries — hipertrofia (§11)', () => {
  test('subir carga y reiniciar en el rango bajo es mejor que quedarse en el rango alto', () => {
    // §11: al dominar el rango alto se sube la carga y se reinicia cerca del bajo.
    // Arrange
    const subioCarga = serie(105, 8)
    const dominabaRangoAlto = serie(100, 15)

    // Act
    const resultado = compararSeries(subioCarga, dominabaRangoAlto, HIPERTROFIA)

    // Assert
    expect(resultado).toBeGreaterThan(0)
  })

  test('una carga que no se sostuvo dentro del rango no supera a la que sí', () => {
    // Arrange: 4 reps queda por debajo del mínimo de hipertrofia (6)
    const intentoFallido = serie(135, 4)
    const trabajoReal = serie(100, 12)

    // Act
    const resultado = compararSeries(intentoFallido, trabajoReal, HIPERTROFIA)

    // Assert: no puede convertirse en la mejor referencia sólo por pesar más
    expect(resultado).toBeLessThan(0)
  })

  test('a igual carga y reps, gana quien demostró más capacidad en reserva', () => {
    // §14: el RIR se lee junto con carga y reps. Mismas 12 reps con RIR 3
    // implica más capacidad que con RIR 0.
    const conReserva = serie(100, 12, 3)
    const alFallo = serie(100, 12, 0)

    expect(compararSeries(conReserva, alFallo, HIPERTROFIA)).toBeGreaterThan(0)
  })

  test('dos series idénticas empatan', () => {
    expect(compararSeries(serie(100, 10, 2), serie(100, 10, 2), HIPERTROFIA)).toBe(0)
  })
})

describe('compararSeries — resistencia (§12)', () => {
  test('quedarse por debajo de 15 reps no supera al trabajo dentro del rango', () => {
    const cargaAlta = serie(60, 10)
    const dentroDelRango = serie(40, 18)

    expect(compararSeries(cargaAlta, dentroDelRango, RESISTENCIA)).toBeLessThan(0)
  })
})

describe('mejorSerie (§9)', () => {
  test('devuelve la mejor serie del conjunto', () => {
    // Arrange
    const series = [serie(100, 8), serie(100, 12), serie(95, 15)]

    // Act
    const mejor = mejorSerie(series, HIPERTROFIA)

    // Assert
    expect(mejor).toEqual(serie(100, 12))
  })

  test('un día malo posterior no desplaza a la mejor referencia', () => {
    // §9: la sesión mala se guarda, pero la mejor referencia previa se conserva.
    // Arrange
    const historial = [serie(100, 12), serie(80, 6)] // la segunda es el día malo

    // Act
    const mejor = mejorSerie(historial, HIPERTROFIA)

    // Assert
    expect(mejor).toEqual(serie(100, 12))
  })

  test('devuelve undefined cuando no hay historial', () => {
    expect(mejorSerie([], HIPERTROFIA)).toBeUndefined()
  })
})
