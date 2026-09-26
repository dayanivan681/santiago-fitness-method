/**
 * Regla de acceso de la suscripción.
 *
 * Lógica pura: recibe la fila de `suscripciones` y la hora, y dice si el
 * cliente puede entrenar. El servidor decide con esto; la interfaz sólo lo
 * refleja. Stripe da el estado del cobro; aquí se añade la gracia, la pausa del
 * coach y los clientes exentos.
 */

import type { EstadoDeAcceso } from '../../shared/v2/suscripcion'

export type { EstadoDeAcceso }

/** Días que un cliente sigue entrenando después de un cobro fallido. */
export const DIAS_DE_GRACIA = 7

const SEGUNDOS_POR_DIA = 24 * 60 * 60

export type FilaSuscripcion = {
  precio_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  estado: string | null
  periodo_fin: number | null
  cancelar_al_final: number
  pausada: number
  exento: number
}

/** Estados de Stripe que nunca llegaron a cobrarse: no hay nada que mantener. */
const SIN_COBRO = new Set(['incomplete', 'incomplete_expired'])

/** Estados de Stripe con el cobro al día. */
const AL_DIA = new Set(['active', 'trialing'])

/** Estados de Stripe que Stripe sigue reintentando o que quedaron sin pagar. */
const IMPAGADA = new Set(['past_due', 'unpaid'])

export function estadoDeAcceso(fila: FilaSuscripcion | null, ahora: number): EstadoDeAcceso {
  if (fila?.exento) return { estado: 'exenta', puedeEntrenar: true }
  if (!fila?.stripe_subscription_id || !fila.estado || SIN_COBRO.has(fila.estado)) {
    return { estado: 'sin_suscripcion', puedeEntrenar: false }
  }
  if (fila.pausada || fila.estado === 'paused') return { estado: 'pausada', puedeEntrenar: false }

  const fin = fila.periodo_fin ?? 0
  if (AL_DIA.has(fila.estado) && ahora < fin) return { estado: 'activa', puedeEntrenar: true }

  // Una suscripción al día con el periodo vencido sólo ocurre si se perdió un
  // webhook; se trata como impagada para no cortar a nadie por un fallo nuestro.
  if (AL_DIA.has(fila.estado) || IMPAGADA.has(fila.estado)) {
    const graciaHasta = fin + DIAS_DE_GRACIA * SEGUNDOS_POR_DIA
    if (ahora < graciaHasta) return { estado: 'gracia', puedeEntrenar: true, graciaHasta }
  }
  return { estado: 'vencida', puedeEntrenar: false }
}

/** Forma mínima de una suscripción de Stripe que usa esta app. */
export type SuscripcionStripe = {
  id: string
  status: string
  customer: string | { id: string }
  cancel_at_period_end: boolean
  pause_collection: unknown
  items: { data: ReadonlyArray<{ current_period_end: number; price: { id: string } }> }
}

export type CamposDeStripe = Pick<
  FilaSuscripcion,
  'stripe_subscription_id' | 'stripe_customer_id' | 'estado' | 'periodo_fin' | 'cancelar_al_final' | 'pausada' | 'precio_id'
>

/** Traduce la suscripción de Stripe a las columnas que controla Stripe. */
export function filaDesdeStripe(sub: SuscripcionStripe): CamposDeStripe {
  const item = sub.items.data[0]
  return {
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    estado: sub.status,
    periodo_fin: item?.current_period_end ?? null,
    cancelar_al_final: sub.cancel_at_period_end ? 1 : 0,
    pausada: sub.pause_collection ? 1 : 0,
    precio_id: item?.price.id ?? null,
  }
}
