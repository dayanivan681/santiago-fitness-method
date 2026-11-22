/**
 * Valores de una serie que casi seguro son un error de tecleo.
 *
 * No es una regla de entrenamiento: no decide cuánto debe levantar nadie. Sólo
 * frena lo que la QA del 20 de noviembre vio pasar — escribir detrás del valor
 * que ya había («5» → «5135» → «51359») y guardar 51.359 lb/lado, que además se
 * copiaron solas a las series siguientes.
 *
 * Dos niveles:
 * - **tope**: imposible para una persona; no se guarda y se pide revisarlo.
 * - **raro**: posible pero improbable; se guarda sólo si el participante lo
 *   confirma. Más del doble de lo de partida (con al menos 20 lb de salto,
 *   para no preguntar por pasar de 5 a 12,5 lb en una mancuerna) o, sin
 *   referencia, por encima de un umbral alto por tipo de carga.
 *
 * Los umbrales son una propuesta para revisar con el dueño y Santiago.
 */

export type Anomalia = 'tope' | 'raro'

/** Por encima de esto ningún registro es real (lb por lado o lb totales). */
export const TOPE_PESO_LB = { porLado: 1000, total: 2000 } as const

/** Sin referencia, pedir confirmación por encima de esto. */
export const UMBRAL_PESO_SIN_REFERENCIA_LB = { porLado: 400, total: 1000 } as const

/** Salto mínimo para preguntar aunque se doble: evita avisar en pesos pequeños. */
export const SALTO_MINIMO_LB = 20

export const TOPE_REPS = 200
/** Sin tope prescrito, más de esto se pregunta. */
export const UMBRAL_REPS_SIN_TOPE = 50

export function anomaliaDePeso(
  peso: number,
  { partida, porLado }: { readonly partida: number; readonly porLado: boolean },
): Anomalia | null {
  const clave = porLado ? 'porLado' : 'total'
  if (!Number.isFinite(peso) || peso > TOPE_PESO_LB[clave]) return 'tope'
  if (partida > 0) {
    return peso > partida * 2 && peso - partida >= SALTO_MINIMO_LB ? 'raro' : null
  }
  return peso > UMBRAL_PESO_SIN_REFERENCIA_LB[clave] ? 'raro' : null
}

/**
 * `repMax` de 100 o más significa «sin tope prescrito» (así lo usa `FilaSerie`).
 * Con tope, se pregunta por encima del doble (y al menos 10 más que el tope).
 */
export function anomaliaDeReps(reps: number, repMax: number): Anomalia | null {
  if (!Number.isFinite(reps) || reps > TOPE_REPS) return 'tope'
  const umbral = repMax >= 100 ? UMBRAL_REPS_SIN_TOPE : Math.max(repMax * 2, repMax + 10)
  return reps > umbral ? 'raro' : null
}

/**
 * Lo que se teclea en un campo numérico: dígitos y un separador decimal (punto
 * o coma, que es lo que saca el teclado de iOS en español). `null` si está
 * vacío o no es un número: el campo conserva entonces el valor anterior.
 */
export function leerNumero(texto: string): number | null {
  const limpio = texto.trim().replace(',', '.')
  if (limpio === '' || limpio === '.') return null
  const valor = Number(limpio)
  return Number.isFinite(valor) ? valor : null
}

/**
 * Si lo tecleado se acepta: como mucho 4 cifras enteras y, si se permiten,
 * 2 decimales. Una tecla que no cumple se ignora y el campo queda como estaba.
 */
export function esTecleoValido(texto: string, decimales: boolean): boolean {
  const patron = decimales ? /^\d{0,4}([.,]\d{0,2})?$/ : /^\d{0,4}$/
  return patron.test(texto)
}
