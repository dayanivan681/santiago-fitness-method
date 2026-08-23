/**
 * Las cuatro salidas de progresión, tal como las nombró el cliente.
 *
 * Viven en el dominio y no en la lógica porque son vocabulario del método: la
 * lógica decide cuál toca, el coach puede fijar otra (su V1 la quiere "siempre
 * editable"), y la pantalla las rotula. Los tres usan la misma lista.
 */

export const PROGRESIONES = [
  'mantener',
  'subirReps',
  'subirCarga',
  'revisarReducir',
] as const

export type TipoDeProgresion = (typeof PROGRESIONES)[number]
