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
import { formatearRir } from '../dominio/rir'
import type { SerieComparable } from '../dominio/tipos'

/** Por encima de esto se resume el recorrido en vez de listar cada serie. */
const SERIES_PARA_DETALLAR = 3

/** Dos decimales como mucho: 42.5 lb sí, 42.499999 no. */
function pesoDe(serie: SerieComparable, perfil: PerfilCarga): number {
  return Math.round(aPesoRegistradoLb(serie.cargaTotalLb, perfil) * 100) / 100
}

/** "lb/lado" cuando el participante carga cada lado por separado. */
function unidadDe(perfil: PerfilCarga): string {
  return perfil.tipoCarga === 'porLado' ? 'lb/lado' : 'lb'
}

/**
 * Una serie suelta, en el formato único de la app.
 *
 * Estaba copiado tres veces —tarjeta, historial y hoja de variantes— y las tres
 * copias diferían: una partía la unidad ("135/lado lb"), otra se comía el
 * "/lado" y enseñaba el peso por lado como si fuera el total, que es decirle al
 * participante que cargue la mitad. Ahora hay una sola.
 */
export function describirSerie(
  serie: SerieComparable,
  perfil: PerfilCarga,
  opciones: { readonly conRir?: boolean } = {},
): string {
  const base = `${pesoDe(serie, perfil)} ${unidadDe(perfil)} × ${serie.reps}`
  return opciones.conRir ? `${base} · RIR ${formatearRir(serie.rir)}` : base
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

  const unidad = unidadDe(perfil)
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

  // Con muchas series y pesos todos distintos, detallar cada una se va a tres
  // líneas en un móvil de 320 px. A partir de cuatro se resume el recorrido:
  // dice lo mismo que importa —cuántas y de cuánto a cuánto— en dos líneas.
  if (series.length > SERIES_PARA_DETALLAR) {
    const menor = Math.min(...pesos)
    const mayor = Math.max(...pesos)
    return `${series.length} series · ${menor}–${mayor} ${unidad}`
  }

  // Con pesos distintos la unidad se dice una vez al final: repetirla en cada
  // serie no cabe en una línea de móvil.
  return `${series.map((_, i) => `${pesos[i]} × ${reps[i]}`).join(' · ')} ${unidad}`
}
