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
import type { TipoDeProgresion } from '../dominio/progresion'
import type { SerieComparable } from '../dominio/tipos'
import { mejorSerie } from './comparar'

/** Se considera dominada una carga cuando queda como mucho una repetición en reserva. */
const RIR_DOMINADO = 1

export type Sugerencia =
  /** Todavía no hay con qué comparar; no es una decisión. */
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
  /**
   * Recomendación fijada por el coach.
   *
   * Su especificación V1 la quiere *"siempre editable por el coach"*: la app
   * calcula, él decide. Los números —peso objetivo, repeticiones— se siguen
   * calculando, así que fijarla cambia la decisión, no la deja sin objetivo.
   */
  readonly fijada?: TipoDeProgresion
}

/**
 * §10: "No subir peso simplemente por subir" — la carga sólo se mueve al
 * dominar el rango. §11: primero se progresa en repeticiones y al dominar el
 * rango alto se sube ligeramente reiniciando en el bajo.
 */
export function siguienteObjetivo(
  ultimaSesion: readonly SerieComparable[],
  contexto: ContextoSugerencia,
): Sugerencia {
  // Sin nada con qué comparar no hay recomendación posible, ni siquiera fijada:
  // no habría de dónde sacar el peso ni las repeticiones.
  if (ultimaSesion.length === 0) return { tipo: 'sinReferencia' }

  return conNumeros(contexto.fijada ?? decidir(ultimaSesion, contexto), ultimaSesion, contexto)
}

/** Qué toca según los datos, cuando el coach no ha fijado nada. */
function decidir(
  efectivas: readonly SerieComparable[],
  { rango, seriesObjetivo }: ContextoSugerencia,
): TipoDeProgresion {
  // Si alguna serie no alcanzó el mínimo del rango, la carga fue excesiva.
  if (efectivas.some((serie) => serie.reps < rango.min)) return 'revisarReducir'

  if (domina(efectivas, rango, seriesObjetivo)) return 'subirCarga'

  const referencia = mejorSerie(efectivas, rango)!
  // Llegó al tope pero sin dominarlo: la carga se sostiene otra sesión.
  if (referencia.reps >= rango.max) return 'mantener'

  return 'subirReps'
}

/**
 * Pone los números a la decisión.
 *
 * Va aparte de `decidir` para que fijar la recomendación no cueste el objetivo:
 * el coach elige qué toca y la app calcula igualmente el peso y las
 * repeticiones. Un rótulo sin cifras dejaría al participante sin saber cuánto.
 */
function conNumeros(
  tipo: TipoDeProgresion,
  efectivas: readonly SerieComparable[],
  { rango, perfil, estimulo }: ContextoSugerencia,
): Sugerencia {
  const referencia = mejorSerie(efectivas, rango)!

  if (tipo === 'subirCarga') {
    const nuevaCargaTotalLb = referencia.cargaTotalLb + incrementoTotalLb(perfil)
    return {
      tipo: 'subirCarga',
      incrementoRegistradoLb: incrementoRegistradoLb(perfil),
      pesoRegistradoSugeridoLb: redondear(aPesoRegistradoLb(nuevaCargaTotalLb, perfil)),
      ...(estimulo === 'hipertrofia' ? { repsObjetivo: rango.min } : {}),
    }
  }

  if (tipo === 'subirReps') {
    return { tipo: 'subirReps', repsObjetivo: referencia.reps + 1 }
  }

  return { tipo }
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
