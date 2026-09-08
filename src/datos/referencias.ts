/**
 * Derivación de las dos referencias de un ejercicio.
 * Guía del proyecto §7 (referencia anterior), §9 (un día malo no borra el progreso),
 * §17 (normalización de carga), §19 (historial append-only).
 */

import type { PerfilCarga } from '../dominio/carga'
import { aComparable } from '../dominio/serie'
import type { RangoReps } from '../dominio/estimulo'
import {
  esEfectiva,
  type ReferenciasEjercicio,
  type SerieRegistrada,
} from '../dominio/tipos'
import { mejorSerie } from '../logica/comparar'

/** Una serie del historial junto a la fecha de su sesión. */
export interface SerieConFecha extends SerieRegistrada {
  readonly fecha: string
}

/**
 * §9 es explícito: `ultimaSesion` y `mejor` son dos datos diferentes.
 *
 * Ambos se derivan del historial completo en cada lectura en vez de guardarse
 * como estado mutable. Así es imposible que se desincronicen, y un día malo
 * (§9) no puede pisar la mejor referencia porque ésta se recalcula sobre todo
 * lo registrado, no sobre lo último.
 */
export function derivarReferencias(
  ejercicioId: string,
  todoElHistorial: readonly SerieConFecha[],
  perfil: PerfilCarga,
  rango: RangoReps,
): ReferenciasEjercicio {
  // El calentamiento se guarda pero no es referencia de nada: si contara,
  // la "última sesión" mostraría la serie de aproximación en vez del trabajo.
  const historial = todoElHistorial.filter(esEfectiva)

  if (historial.length === 0) {
    return { ejercicioId, ultimaSesion: [] }
  }

  const fechaUltimaSesion = historial.reduce(
    (masReciente, serie) => (serie.fecha > masReciente ? serie.fecha : masReciente),
    historial[0].fecha,
  )

  const ultimaSesion = historial
    .filter((serie) => serie.fecha === fechaUltimaSesion)
    .slice()
    .sort((a, b) => a.numeroSerie - b.numeroSerie)
    .map((serie) => aComparable(serie, serie.carga ?? perfil))

  const mejor = mejorSerie(
    historial.map((serie) => aComparable(serie, serie.carga ?? perfil)),
    rango,
  )

  return { ejercicioId, ultimaSesion, mejor, fechaUltimaSesion }
}

