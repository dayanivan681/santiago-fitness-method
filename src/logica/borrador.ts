/**
 * Identidad de un borrador de serie.
 *
 * El cliente pide que lo tecleado sobreviva a cerrar la app. Para recuperarlo
 * hay que saber a qué hueco pertenece: qué participante, qué día del calendario,
 * qué día de la rotación, qué posición dentro de ese día y qué número de serie.
 *
 * Sin la posición, dos ejercicios del mismo día se pisarían el borrador. Sin la
 * fecha, el de ayer reaparecería hoy.
 */

export interface ClaveDeBorrador {
  readonly participanteId: string
  readonly fecha: string
  readonly plantillaDiaId: string
  readonly orden: number
  readonly numeroSerie: number
}

export function idBorrador(clave: ClaveDeBorrador): string {
  return [
    clave.participanteId,
    clave.fecha,
    clave.plantillaDiaId,
    clave.orden,
    clave.numeroSerie,
  ].join('|')
}
