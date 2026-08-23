/**
 * Comparación de series.
 * Guía del proyecto §9 (mejor referencia), §10–12 (lógica por estímulo), §14 (RIR).
 */

import type { RangoReps } from '../dominio/estimulo'
import type { SerieComparable } from '../dominio/tipos'

/**
 * Ordena dos series dentro de un rango de repeticiones.
 * Devuelve > 0 si `a` es mejor que `b`, < 0 si es peor, 0 si empatan.
 *
 * §10, §11 y §12 describen el mismo patrón aplicado a rangos distintos: se
 * progresa en repeticiones dentro del rango y, al dominar el tope, se sube la
 * carga y se reinicia cerca del rango bajo. Por eso el estímulo entra aquí como
 * su rango y no como tres algoritmos separados.
 *
 * La primera regla es la que evita el error clásico: una carga que no se
 * sostuvo dentro del rango no puede convertirse en la mejor referencia sólo por
 * pesar más. Un intento fallido de 135 lb × 4 no supera a 100 lb × 12 en
 * hipertrofia (§11: "reiniciar cerca del rango inferior" presupone haber
 * establecido la carga).
 */
export function compararSeries(
  a: SerieComparable,
  b: SerieComparable,
  rango: RangoReps,
): number {
  const aDentroDelRango = a.reps >= rango.min
  const bDentroDelRango = b.reps >= rango.min
  if (aDentroDelRango !== bDentroDelRango) return aDentroDelRango ? 1 : -1

  if (a.cargaTotalLb !== b.cargaTotalLb) return a.cargaTotalLb - b.cargaTotalLb
  if (a.reps !== b.reps) return a.reps - b.reps

  // §14: el RIR se lee junto con carga y reps, nunca aislado. A igual carga y
  // repeticiones, quien terminó con más reserva demostró más capacidad.
  return a.rir - b.rir
}

/**
 * La mejor serie de un conjunto. §9: un día malo se guarda pero no desplaza a
 * la mejor referencia previa, así que esto se calcula siempre sobre el
 * historial completo y nunca se sobrescribe.
 */
export function mejorSerie(
  series: readonly SerieComparable[],
  rango: RangoReps,
): SerieComparable | undefined {
  return series.reduce<SerieComparable | undefined>(
    (mejor, serie) =>
      mejor === undefined || compararSeries(serie, mejor, rango) > 0 ? serie : mejor,
    undefined,
  )
}
