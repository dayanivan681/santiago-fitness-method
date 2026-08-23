/**
 * Recomendación para el siguiente entrenamiento.
 * Guía del proyecto §6 (la app no impone el peso), §10–13.
 *
 * El análisis del cliente pide cuatro salidas legibles —Mantener, Subir reps,
 * Subir carga mínima, Revisar-reducir— y que la decisión no salga sólo de
 * comparar números: entra el RIR, el rango objetivo y cuántas series se
 * completaron.
 *
 * IMPORTANTE (§6): esto es una pista, nunca una imposición. La pantalla muestra
 * la referencia anterior, el participante escribe lo que realmente hizo y el
 * análisis viene después.
 */

import {
  aPesoRegistradoLb,
  incrementoRegistradoLb,
  incrementoTotalLb,
  type PerfilCarga,
} from '../dominio/carga'
import type { Estimulo, RangoReps } from '../dominio/estimulo'
import type { SerieComparable } from '../dominio/tipos'
import { mejorSerie } from './comparar'

/** Se considera dominada una carga cuando queda como mucho una repetición en reserva. */
const RIR_DOMINADO = 1

export type Sugerencia =
  | { readonly tipo: 'sinReferencia' }
  /** La carga pudo con él: no llegó ni al mínimo del rango. */
  | { readonly tipo: 'revisarReducir' }
  /** Llegó al tope del rango pero sin dominarlo. Consolidar la carga. */
  | { readonly tipo: 'mantener' }
  | { readonly tipo: 'subirReps'; readonly repsObjetivo: number }
  | {
      readonly tipo: 'subirCarga'
      readonly incrementoRegistradoLb: number
      readonly pesoRegistradoSugeridoLb: number
      /** Sólo en hipertrofia: §11 es el único que manda reiniciar en el rango bajo. */
      readonly repsObjetivo?: number
    }

export interface ContextoSugerencia {
  readonly rango: RangoReps
  readonly perfil: PerfilCarga
  readonly estimulo: Estimulo
  /** Series que pedía el plan ese día: sin esto no se sabe si dominó la carga. */
  readonly seriesObjetivo: number
}

/**
 * §10: "No subir peso simplemente por subir" — la carga sólo se mueve al
 * dominar el rango. §11: primero se progresa en repeticiones y al dominar el
 * rango alto se sube ligeramente reiniciando en el bajo.
 */
export function siguienteObjetivo(
  ultimaSesion: readonly SerieComparable[],
  { rango, perfil, estimulo, seriesObjetivo }: ContextoSugerencia,
): Sugerencia {
  const efectivas = ultimaSesion
  if (efectivas.length === 0) return { tipo: 'sinReferencia' }

  // Si alguna serie no alcanzó el mínimo del rango, la carga fue excesiva.
  if (efectivas.some((serie) => serie.reps < rango.min)) {
    return { tipo: 'revisarReducir' }
  }

  if (domina(efectivas, rango, seriesObjetivo)) {
    const referencia = mejorSerie(efectivas, rango)!
    const nuevaCargaTotalLb = referencia.cargaTotalLb + incrementoTotalLb(perfil)
    return {
      tipo: 'subirCarga',
      incrementoRegistradoLb: incrementoRegistradoLb(perfil),
      pesoRegistradoSugeridoLb: redondear(aPesoRegistradoLb(nuevaCargaTotalLb, perfil)),
      ...(estimulo === 'hipertrofia' ? { repsObjetivo: rango.min } : {}),
    }
  }

  const referencia = mejorSerie(efectivas, rango)!
  // Llegó al tope pero sin dominarlo: la carga se sostiene otra sesión.
  if (referencia.reps >= rango.max) return { tipo: 'mantener' }

  return { tipo: 'subirReps', repsObjetivo: referencia.reps + 1 }
}

/**
 * Dominar la carga, tal como se acordó con el cliente: **todas** las series que
 * pedía el plan en el tope del rango y ninguna con más de una repetición en
 * reserva. Con que la mejor serie llegara al tope no basta — eso premiaba una
 * serie buena entre cuatro flojas.
 */
function domina(
  series: readonly SerieComparable[],
  rango: RangoReps,
  seriesObjetivo: number,
): boolean {
  const enElTope = series.filter((serie) => serie.reps >= rango.max).length
  return enElTope >= seriesObjetivo && series.every((serie) => serie.rir <= RIR_DOMINADO)
}

/** Etiquetas del análisis del cliente, tal cual las pidió. */
export const ETIQUETA_SUGERENCIA: Readonly<Record<Sugerencia['tipo'], string>> = {
  sinReferencia: 'Primera vez',
  revisarReducir: 'Revisar / reducir',
  mantener: 'Mantener',
  subirReps: 'Subir reps',
  subirCarga: 'Subir carga mínima',
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}
