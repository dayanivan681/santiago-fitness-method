/**
 * Tiempo de descanso entre series.
 * Guía del proyecto §5 (el descanso forma parte del registro serie por serie),
 * §12 (la resistencia usa descansos más cortos), §18 (aparece en el historial).
 *
 * El descanso no se escribe: se mide. §1 pide registrar el entrenamiento sin
 * perder tiempo, y un cuarto campo que teclear entre series iría en contra.
 * Cada serie guarda el instante en que se registró y el descanso se deriva de
 * ahí — un dato en bruto en vez de uno calculado, que es lo que §19 favorece.
 */

import type { SerieRegistrada } from '../dominio/tipos'

/** Segundos entre dos instantes ISO. Nunca negativo. */
export function segundosEntre(desde: string, hasta: string): number {
  const diferenciaMs = new Date(hasta).getTime() - new Date(desde).getTime()
  return Math.max(0, Math.round(diferenciaMs / 1000))
}

/**
 * Descanso previo a cada serie, en segundos, indexado por número de serie.
 * La primera serie no aparece: no hay nada antes de ella.
 */
export function calcularDescansos(
  series: readonly SerieRegistrada[],
): ReadonlyMap<number, number> {
  const ordenadas = [...series].sort((a, b) => a.numeroSerie - b.numeroSerie)

  return ordenadas.reduce((descansos, serie, indice) => {
    const anterior = ordenadas[indice - 1]
    if (!anterior?.instante || !serie.instante) return descansos

    return new Map(descansos).set(
      serie.numeroSerie,
      segundosEntre(anterior.instante, serie.instante),
    )
  }, new Map<number, number>())
}

/** Formato corto para pantalla: 90 → "1:30". */
export function formatearSegundos(segundos: number): string {
  const minutos = Math.floor(segundos / 60)
  const resto = segundos % 60
  return `${minutos}:${String(resto).padStart(2, '0')}`
}
