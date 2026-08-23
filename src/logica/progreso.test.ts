import { describe, test, expect } from 'vitest'
import { evaluarSerie } from './progreso'
import type { SerieComparable, Tecnica } from '../dominio/tipos'

const serie = (
  cargaTotalLb: number,
  reps: number,
  rir = 2,
  tecnica: Tecnica = 'buena',
): SerieComparable => ({ cargaTotalLb, reps, rir, tecnica })

const referencia = serie(100, 10)

describe('evaluarSerie — las cinco reglas de §8', () => {
  test('misma carga + más reps = progreso', () => {
    expect(evaluarSerie(serie(100, 12), referencia)).toBe('progreso')
  })

  test('más carga + mismas reps = progreso', () => {
    expect(evaluarSerie(serie(105, 10), referencia)).toBe('progreso')
  })

  test('más carga + más reps = progreso claro', () => {
    expect(evaluarSerie(serie(105, 12), referencia)).toBe('progresoClaro')
  })

  test('misma carga + mismas reps = mantuvo', () => {
    expect(evaluarSerie(serie(100, 10), referencia)).toBe('mantuvo')
  })

  test('menos carga y menos reps = día por debajo de referencia', () => {
    expect(evaluarSerie(serie(95, 8), referencia)).toBe('debajo')
  })
})

describe('evaluarSerie — casos que §8 no enumera', () => {
  test('más carga con menos reps es cambio de carga, no regresión', () => {
    // §8 no ordena este caso: subir peso y bajar reps es una decisión, no un retroceso.
    expect(evaluarSerie(serie(115, 6), referencia)).toBe('cambioDeCarga')
  })

  test('menos carga con más reps también es cambio de carga', () => {
    expect(evaluarSerie(serie(85, 15), referencia)).toBe('cambioDeCarga')
  })

  test('misma carga con menos reps queda por debajo', () => {
    expect(evaluarSerie(serie(100, 8), referencia)).toBe('debajo')
  })

  test('menos carga con mismas reps queda por debajo', () => {
    expect(evaluarSerie(serie(90, 10), referencia)).toBe('debajo')
  })
})

describe('la técnica entra en la decisión', () => {
  test('más reps con peor técnica no es progreso', () => {
    // El cliente lo pide explícito: "una mejora aparente con peor técnica no
    // debe contarse como progreso automático".
    // Arrange: la referencia se hizo con buena técnica
    const hoy = serie(100, 12, 2, 'deficiente')

    // Act + Assert: sube en reps, pero a costa de la ejecución
    expect(evaluarSerie(hoy, referencia)).toBe('cambioDeCarga')
  })

  test('más carga con peor técnica tampoco', () => {
    expect(evaluarSerie(serie(110, 10, 2, 'aceptable'), referencia)).toBe('cambioDeCarga')
  })

  test('mejorar la técnica no penaliza', () => {
    expect(evaluarSerie(serie(100, 12, 2, 'excelente'), referencia)).toBe('progreso')
  })

  test('con la misma técnica, las reglas de §8 no cambian', () => {
    expect(evaluarSerie(serie(100, 12, 2, 'buena'), referencia)).toBe('progreso')
  })
})
