/**
 * Evaluación de progreso contra la referencia.
 * Guía del proyecto §8.
 */

import { TECNICAS, type SerieComparable } from '../dominio/tipos'

export type ResultadoProgreso =
  | 'progresoClaro' // más carga + más reps
  | 'progreso' // misma carga + más reps, o más carga + mismas reps
  | 'mantuvo' // misma carga + mismas reps
  | 'debajo' // día por debajo de la referencia
  | 'cambioDeCarga' // una dimensión sube y la otra baja

/**
 * §8 enumera cinco casos y deja cuatro sin ordenar. Los que empeoran en una
 * dimensión sin mejorar en ninguna caen en `debajo`; los que suben carga a costa
 * de repeticiones (o al revés) son una decisión de entrenamiento, no un
 * retroceso, y se etiquetan `cambioDeCarga` para no penalizarlos.
 */
export function evaluarSerie(
  hoy: SerieComparable,
  referencia: SerieComparable,
): ResultadoProgreso {
  const deltaCarga = Math.sign(hoy.cargaTotalLb - referencia.cargaTotalLb)
  const deltaReps = Math.sign(hoy.reps - referencia.reps)

  // El cliente lo pide explícito: "una mejora aparente con peor técnica no debe
  // contarse como progreso automático". Más peso o más reps a costa de la
  // ejecución no es progreso; es un cambio que hay que mirar.
  if (empeoroLaTecnica(hoy, referencia) && (deltaCarga > 0 || deltaReps > 0)) {
    return 'cambioDeCarga'
  }

  if (deltaCarga > 0 && deltaReps > 0) return 'progresoClaro'
  if (deltaCarga === 0 && deltaReps === 0) return 'mantuvo'
  if ((deltaCarga === 0 && deltaReps > 0) || (deltaCarga > 0 && deltaReps === 0)) {
    return 'progreso'
  }
  if (deltaCarga > 0 || deltaReps > 0) return 'cambioDeCarga'
  return 'debajo'
}

/** Peor técnica = más abajo en la escala `TECNICAS`, que va de mejor a peor. */
function empeoroLaTecnica(hoy: SerieComparable, referencia: SerieComparable): boolean {
  return TECNICAS.indexOf(hoy.tecnica) > TECNICAS.indexOf(referencia.tecnica)
}

/** Etiqueta en español para mostrar el resultado al participante. */
export const ETIQUETA_PROGRESO: Readonly<Record<ResultadoProgreso, string>> = {
  progresoClaro: 'Progreso claro',
  progreso: 'Progreso',
  mantuvo: 'Mantuvo',
  debajo: 'Por debajo de la referencia',
  cambioDeCarga: 'Cambio de carga',
}

/** Versión corta para las filas del historial, donde el ancho es escaso (§18). */
export const ETIQUETA_PROGRESO_CORTA: Readonly<Record<ResultadoProgreso, string>> = {
  progresoClaro: 'Progreso+',
  progreso: 'Progreso',
  mantuvo: 'Mantuvo',
  debajo: 'Bajo ref.',
  cambioDeCarga: 'Cambio carga',
}
