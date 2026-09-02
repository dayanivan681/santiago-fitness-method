/**
 * Resumen de "Última vez": qué se levantó la última vez en este ejercicio.
 *
 * Hasta ahora la tarjeta enseñaba `ultimaSesion[0]`, es decir la PRIMERA serie
 * de la última sesión. En un ejercicio de cuatro series eso es engañoso: se lee
 * como "lo último que hiciste" cuando en realidad es lo primero, y normalmente
 * lo más flojo.
 *
 * El formato se elige según lo que de verdad varió, para decir lo máximo en una
 * línea —que es todo el sitio que hay en el móvil—:
 *
 *   todo igual          3 × 135 lb × 10
 *   mismo peso          135 lb × 10, 10, 8
 *   pesos distintos     135 × 10 · 140 × 8 · 140 × 6
 *
 * No decide nada sobre progresión ni escribe en ningún sitio: es sólo lectura,
 * derivada del historial ya guardado.
 */

import { aPesoRegistradoLb, type PerfilCarga } from '../dominio/carga'
import type { SerieComparable } from '../dominio/tipos'

/** Dos decimales como mucho: 42.5 lb sí, 42.499999 no. */
function pesoDe(serie: SerieComparable, perfil: PerfilCarga): number {
  return Math.round(aPesoRegistradoLb(serie.cargaTotalLb, perfil) * 100) / 100
}

/**
 * `null` cuando no hay nada que enseñar. Quien llama decide si escribe
 * "Sin historial" o esconde la sección; aquí no se inventa un valor.
 */
export function resumirUltimaVez(
  series: readonly SerieComparable[],
  perfil: PerfilCarga,
): string | null {
  if (series.length === 0) return null

  const unidad = perfil.tipoCarga === 'porLado' ? 'lb/lado' : 'lb'
  const pesos = series.map((serie) => pesoDe(serie, perfil))
  const reps = series.map((serie) => serie.reps)

  const mismoPeso = pesos.every((peso) => peso === pesos[0])
  const mismasReps = reps.every((r) => r === reps[0])

  if (mismoPeso && mismasReps) {
    const cuantas = series.length > 1 ? `${series.length} × ` : ''
    return `${cuantas}${pesos[0]} ${unidad} × ${reps[0]}`
  }

  if (mismoPeso) {
    return `${pesos[0]} ${unidad} × ${reps.join(', ')}`
  }

  // Con pesos distintos la unidad se dice una vez al final: repetirla en cada
  // serie no cabe en una línea de móvil.
  return `${series.map((_, i) => `${pesos[i]} × ${reps[i]}`).join(' · ')} ${unidad}`
}
