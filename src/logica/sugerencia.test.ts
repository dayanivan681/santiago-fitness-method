import { describe, test, expect } from 'vitest'
import { siguienteObjetivo, type ContextoSugerencia } from './sugerencia'
import { RANGO_POR_ESTIMULO } from '../dominio/estimulo'
import type { PerfilCarga } from '../dominio/carga'
import type { SerieComparable } from '../dominio/tipos'

const serie = (cargaTotalLb: number, reps: number, rir = 2): SerieComparable => ({
  cargaTotalLb,
  reps,
  rir,
  tecnica: 'buena',
})

const perfil = (parcial: Partial<PerfilCarga> = {}): PerfilCarga => ({
  tipoCarga: 'total',
  incrementoMinimoLb: 2.5,
  ...parcial,
})

const contexto = (parcial: Partial<ContextoSugerencia> = {}): ContextoSugerencia => ({
  rango: RANGO_POR_ESTIMULO.hipertrofia, // 6–15
  perfil: perfil(),
  estimulo: 'hipertrofia',
  seriesObjetivo: 3,
  ...parcial,
})

const FUERZA = RANGO_POR_ESTIMULO.fuerza // 1–5

describe('sin historial', () => {
  test('no sugiere nada la primera vez', () => {
    expect(siguienteObjetivo([], contexto()).tipo).toBe('sinReferencia')
  })
})

describe('revisar / reducir', () => {
  test('si una serie no llega al mínimo del rango, la carga fue excesiva', () => {
    // Arrange: el rango es 6–15 y la última serie se quedó en 4
    const ultima = [serie(100, 10), serie(100, 8), serie(100, 4)]

    // Act + Assert
    expect(siguienteObjetivo(ultima, contexto()).tipo).toBe('revisarReducir')
  })
})

describe('subir reps (§11)', () => {
  test('dentro del rango, sugiere una repetición más', () => {
    const ultima = [serie(100, 12), serie(100, 11), serie(100, 10)]

    expect(siguienteObjetivo(ultima, contexto())).toEqual({
      tipo: 'subirReps',
      repsObjetivo: 13,
    })
  })

  test('no sugiere subir peso sólo por subir (§10)', () => {
    const ultima = [serie(225, 3), serie(225, 3)]

    expect(
      siguienteObjetivo(ultima, contexto({ rango: FUERZA, estimulo: 'fuerza', seriesObjetivo: 4 }))
        .tipo,
    ).toBe('subirReps')
  })
})

describe('mantener — llegó al tope pero sin dominar', () => {
  test('una sola serie en el tope no basta para subir carga', () => {
    // Arrange: 3 series objetivo y sólo la primera llegó a 15
    const ultima = [serie(100, 15, 1), serie(100, 12, 1), serie(100, 10, 1)]

    // Act + Assert: premiar una serie buena entre tres flojas sería un error
    expect(siguienteObjetivo(ultima, contexto()).tipo).toBe('mantener')
  })

  test('todas en el tope pero con reserva de sobra tampoco basta', () => {
    // RIR 3 en todas: llegó al tope sin apretar, la carga aún no está dominada
    const ultima = [serie(100, 15, 3), serie(100, 15, 3), serie(100, 15, 3)]

    expect(siguienteObjetivo(ultima, contexto()).tipo).toBe('mantener')
  })
})

describe('subir carga mínima — dominó el rango', () => {
  test('todas las series en el tope y con RIR bajo', () => {
    // Arrange: las 3 series objetivo a 15 reps con RIR 1
    const ultima = [serie(100, 15, 1), serie(100, 15, 1), serie(100, 15, 0)]

    // Act
    const sugerencia = siguienteObjetivo(ultima, contexto())

    // Assert: §11 — sube la carga y reinicia en el rango bajo
    expect(sugerencia).toEqual({
      tipo: 'subirCarga',
      incrementoRegistradoLb: 2.5,
      pesoRegistradoSugeridoLb: 102.5,
      repsObjetivo: 6,
    })
  })

  test('reparte el incremento por lado cuando la carga es por lado (§13 + §17)', () => {
    const ultima = [serie(90, 15, 1), serie(90, 15, 1)]
    const convergente = perfil({ tipoCarga: 'porLado', incrementoMinimoLb: 2.5 })

    expect(
      siguienteObjetivo(ultima, contexto({ perfil: convergente, seriesObjetivo: 2 })),
    ).toEqual({
      tipo: 'subirCarga',
      incrementoRegistradoLb: 1.25,
      pesoRegistradoSugeridoLb: 46.25,
      repsObjetivo: 6,
    })
  })

  test('en fuerza no manda reiniciar en el rango bajo', () => {
    // §11 es el único que pide reiniciar; §10 no dice nada de eso.
    const ultima = [serie(225, 5, 1), serie(225, 5, 1)]

    expect(
      siguienteObjetivo(
        ultima,
        contexto({ rango: FUERZA, estimulo: 'fuerza', seriesObjetivo: 2 }),
      ),
    ).toEqual({
      tipo: 'subirCarga',
      incrementoRegistradoLb: 2.5,
      pesoRegistradoSugeridoLb: 227.5,
    })
  })

  test('una sesión incompleta no cuenta como dominada', () => {
    // Dos series perfectas, pero el plan pedía cuatro
    const ultima = [serie(100, 15, 1), serie(100, 15, 1)]

    expect(siguienteObjetivo(ultima, contexto({ seriesObjetivo: 4 })).tipo).toBe('mantener')
  })
})

describe('el coach fija la recomendación', () => {
  // Su V1 la pide "siempre editable por el coach": la app propone, él decide.
  const ultima = [serie(100, 12), serie(100, 11), serie(100, 10)]

  test('sin fijar nada, decide la app', () => {
    expect(siguienteObjetivo(ultima, contexto()).tipo).toBe('subirReps')
  })

  test('lo que fija el coach manda sobre lo que calcula la app', () => {
    expect(siguienteObjetivo(ultima, contexto({ fijada: 'mantener' })).tipo).toBe('mantener')
  })

  test('fijar subir carga trae el peso calculado, no sólo la etiqueta', () => {
    // Si sólo mostrara el rótulo, el participante se quedaría sin saber cuánto.
    expect(siguienteObjetivo(ultima, contexto({ fijada: 'subirCarga' }))).toEqual({
      tipo: 'subirCarga',
      incrementoRegistradoLb: 2.5,
      pesoRegistradoSugeridoLb: 102.5,
      repsObjetivo: 6,
    })
  })

  test('fijar subir reps propone una más que la mejor de la última vez', () => {
    expect(siguienteObjetivo(ultima, contexto({ fijada: 'subirReps' }))).toEqual({
      tipo: 'subirReps',
      repsObjetivo: 13,
    })
  })

  test('sin referencia sigue siendo la primera vez, aunque el coach fije algo', () => {
    // No hay de dónde sacar el peso ni las reps: fingir un objetivo sería peor.
    expect(siguienteObjetivo([], contexto({ fijada: 'subirCarga' })).tipo).toBe('sinReferencia')
  })
})
