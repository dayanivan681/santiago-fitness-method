/**
 * Progreso físico: medidas y fotos con fecha.
 *
 * El cliente lo pide en su especificación V1. La decisión de producto que va
 * con ello: **la foto se queda en el dispositivo**. Mientras no haya cuentas,
 * eso resuelve el consentimiento y los permisos que él mismo pregunta.
 *
 * La app enseña la variación con su signo y no la califica: si bajar de cintura
 * o subir de peso es bueno depende del objetivo, y eso lo lee el coach.
 */

import type { Medidas, RegistroDeProgreso } from '../dominio/tipos'

/** Las medidas que se piden, en el orden en el que se toman. */
export const MEDIDAS: readonly {
  readonly clave: keyof Medidas
  readonly etiqueta: string
  readonly unidad: string
}[] = [
  // "Peso corporal" y no "Peso": la ficha de §2 ya tiene un campo Peso, y
  // dos etiquetas iguales en la misma pantalla no dicen cuál es cuál.
  { clave: 'pesoCorporalLb', etiqueta: 'Peso corporal', unidad: 'lb' },
  { clave: 'cinturaPulgadas', etiqueta: 'Cintura', unidad: 'in' },
  { clave: 'pechoPulgadas', etiqueta: 'Pecho', unidad: 'in' },
  { clave: 'brazoPulgadas', etiqueta: 'Brazo', unidad: 'in' },
  { clave: 'musloPulgadas', etiqueta: 'Muslo', unidad: 'in' },
]

/** De más reciente a más antiguo: lo que se mira es cómo estoy ahora. */
export function ordenarProgreso(
  registros: readonly RegistroDeProgreso[],
): readonly RegistroDeProgreso[] {
  return [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha))
}

/**
 * Diferencia con la medición anterior, con signo. Sin las dos no hay nada que
 * comparar, y una décima es toda la precisión que da una cinta métrica.
 */
export function variacion(
  actual: Medidas,
  anterior: Medidas | undefined,
  clave: keyof Medidas,
): number | undefined {
  const hoy = actual[clave]
  const antes = anterior?.[clave]
  if (hoy === undefined || antes === undefined) return undefined

  return redondearDecima(hoy - antes)
}

/**
 * A una décima, simétrico respecto al cero.
 *
 * `Math.round` empuja el medio hacia arriba, así que −1.65 daría −1.6 mientras
 * que +1.65 daría +1.7: la misma diferencia mostrada de dos maneras según el
 * signo. Se redondea la magnitud y se le devuelve el signo.
 */
function redondearDecima(valor: number): number {
  const signo = Math.sign(valor)
  return (signo * Math.round(Math.abs(valor) * 10)) / 10
}

/** Una fila con la fecha y nada más no cuenta nada; no se guarda. */
export function hayAlgoQueGuardar(medidas: Medidas, tieneFoto: boolean): boolean {
  if (tieneFoto) return true
  return Object.values(medidas).some((valor) => valor !== undefined)
}
