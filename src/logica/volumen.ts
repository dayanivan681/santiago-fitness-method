/**
 * Volumen semanal por músculo.
 * Guía del proyecto §20 (objetivos), §21 (directas vs indirectas), §22 (sexo).
 */

import type { RangoReps } from '../dominio/estimulo'
import { esEfectiva, type Ejercicio, type Musculo, type SerieRegistrada, type Sexo } from '../dominio/tipos'

export type ConteoPorMusculo = Partial<Record<Musculo, number>>
/**
 * Los cuatro estados que pide el cliente, en vez de números sueltos.
 * "Revisar recuperación" no es un error: es trabajo por encima del objetivo,
 * que puede ser deliberado pero conviene mirar.
 */
export type EstadoVolumen =
  | 'falta'
  | 'dentro'
  | 'cumplido'
  | 'revisarRecuperacion'
  | 'sinObjetivo'

export const ETIQUETA_VOLUMEN: Readonly<Record<EstadoVolumen, string>> = {
  falta: 'Falta volumen',
  dentro: 'Dentro del objetivo',
  cumplido: 'Objetivo cumplido',
  revisarRecuperacion: 'Revisar recuperación',
  sinObjetivo: 'Sin objetivo',
}

type ObjetivosPorMusculo = Partial<Record<Musculo, RangoReps>>

/** §20: los objetivos que no dependen del sexo. */
const OBJETIVO_BASE: ObjetivosPorMusculo = {
  espalda: { min: 8, max: 10 },
  cuadriceps: { min: 8, max: 10 },
  gluteos: { min: 8, max: 10 },
  femoral: { min: 8, max: 10 },
  biceps: { min: 4, max: 6 },
  triceps: { min: 4, max: 6 },
  deltoideLateral: { min: 4, max: 6 },
}

/**
 * §20 sólo diferencia el pecho por sexo (masculino 8–10, femenino 6). El énfasis
 * de §22 se expresa ajustando estos objetivos por participante, que es
 * justamente lo que §22 pide dejar editable.
 */
export const OBJETIVO_SERIES_SEMANALES: Readonly<Record<Sexo, ObjetivosPorMusculo>> = {
  masculino: { ...OBJETIVO_BASE, pecho: { min: 8, max: 10 } },
  femenino: { ...OBJETIVO_BASE, pecho: { min: 6, max: 6 } },
}

export function objetivoSemanal(sexo: Sexo, musculo: Musculo): RangoReps | undefined {
  return OBJETIVO_SERIES_SEMANALES[sexo][musculo]
}

/**
 * §21: sólo el músculo primario suma, y el calentamiento no cuenta. No se
 * cuenta un compuesto como serie completa para todo lo que involucra — el press ya trabaja deltoide anterior y
 * los remos ya trabajan el posterior, así que duplicarlo inflaría el volumen.
 */
export function seriesDirectasPorMusculo(
  series: readonly SerieRegistrada[],
  biblioteca: ReadonlyMap<string, Ejercicio>,
): ConteoPorMusculo {
  return series.filter(esEfectiva).reduce<ConteoPorMusculo>((conteo, serie) => {
    const ejercicio = biblioteca.get(serie.ejercicioId)
    if (!ejercicio) return conteo
    return sumarUno(conteo, ejercicio.musculoPrimario)
  }, {})
}

/**
 * El trabajo secundario se registra aparte, como información. No cuenta contra
 * los objetivos de §20 pero permite ver de un vistazo por qué un músculo no
 * necesita más series directas (§21).
 */
export function seriesIndirectasPorMusculo(
  series: readonly SerieRegistrada[],
  biblioteca: ReadonlyMap<string, Ejercicio>,
): ConteoPorMusculo {
  return series.filter(esEfectiva).reduce<ConteoPorMusculo>((conteo, serie) => {
    const ejercicio = biblioteca.get(serie.ejercicioId)
    if (!ejercicio) return conteo
    return ejercicio.musculosSecundarios.reduce(sumarUno, conteo)
  }, {})
}

export function estadoVolumen(
  sexo: Sexo,
  musculo: Musculo,
  seriesDirectas: number,
): EstadoVolumen {
  const objetivo = objetivoSemanal(sexo, musculo)
  if (!objetivo) return 'sinObjetivo'
  if (seriesDirectas < objetivo.min) return 'falta'
  if (seriesDirectas > objetivo.max) return 'revisarRecuperacion'
  if (seriesDirectas === objetivo.max) return 'cumplido'
  return 'dentro'
}

function sumarUno(conteo: ConteoPorMusculo, musculo: Musculo): ConteoPorMusculo {
  return { ...conteo, [musculo]: (conteo[musculo] ?? 0) + 1 }
}
