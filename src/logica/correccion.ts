/**
 * Corregir una serie sin perder el rastro.
 * Guía del proyecto §19 (nada de lo registrado se pierde).
 *
 * El cliente lo pidió así: corregir *"sin perder auditoría del historial"*. Por
 * eso el valor equivocado no se sobrescribe, se apila con su hora. Y deshacer
 * tampoco borra: apila otra entrada más, marcada como reversión, para que quede
 * constancia de que hubo una corrección y de que se echó atrás.
 *
 * Vive aquí y no dentro de una pantalla porque se corrige desde dos sitios —el
 * entrenamiento de hoy y el historial— y dos copias de esta regla acabarían
 * separándose.
 */

import type { SerieRegistrada, Tecnica, ValoresDeSerie } from '../dominio/tipos'

/** Lo que se puede cambiar al corregir. */
export interface ValoresCorregidos {
  readonly nota?: string
  readonly pesoRegistradoLb: number
  readonly repsRealizadas: number
  readonly rir: number
  readonly tecnica?: Tecnica
  readonly esCalentamiento?: boolean
}

/**
 * La serie con los valores nuevos y los viejos apilados.
 *
 * Conserva el `instante` original a propósito: el descanso de §5 se deriva de
 * esas marcas de tiempo, y volver a sellarlas al corregir un número diría que
 * se descansó hasta el momento de la corrección, que es falso.
 */
export function aplicarCorreccion(
  serie: SerieRegistrada,
  valores: ValoresCorregidos,
  ahora = new Date(),
): SerieRegistrada {
  return {
    ...serie,
    ...valores,
    correcciones: [
      ...(serie.correcciones ?? []),
      instantanea(serie, 'correccion', ahora),
    ],
  }
}

/**
 * ¿Hay una corrección que deshacer?
 *
 * Sólo si la última entrada del rastro es una corrección. Si ya es una
 * reversión, la serie está en los valores previos y no queda nada que echar
 * atrás.
 */
export function puedeDeshacerse(serie: SerieRegistrada): boolean {
  const ultima = (serie.correcciones ?? []).at(-1)
  return ultima !== undefined && (ultima.motivo ?? 'correccion') === 'correccion'
}

/**
 * Devuelve la serie a como estaba antes de la última corrección.
 *
 * El rastro **crece**, no se recorta: se apila lo que había justo antes de
 * deshacer, marcado como reversión. Recortarlo sería borrar historial, que es
 * justo lo que §19 prohíbe.
 */
export function deshacerCorreccion(
  serie: SerieRegistrada,
  ahora = new Date(),
): SerieRegistrada {
  const previas = serie.correcciones ?? []
  const ultima = previas.at(-1)
  if (!puedeDeshacerse(serie) || !ultima) return serie

  return {
    ...serie,
    pesoRegistradoLb: ultima.pesoRegistradoLb,
    repsRealizadas: ultima.repsRealizadas,
    rir: ultima.rir,
    tecnica: ultima.tecnica,
    nota: ultima.nota,
    esCalentamiento: ultima.esCalentamiento,
    correcciones: [...previas, instantanea(serie, 'reversion', ahora)],
  }
}

/** Foto de los valores que se sustituyen, para el rastro. */
function instantanea(
  serie: SerieRegistrada,
  motivo: ValoresDeSerie['motivo'],
  ahora: Date,
): ValoresDeSerie {
  return {
    pesoRegistradoLb: serie.pesoRegistradoLb,
    repsRealizadas: serie.repsRealizadas,
    rir: serie.rir,
    tecnica: serie.tecnica,
    nota: serie.nota,
    esCalentamiento: serie.esCalentamiento,
    corregidaEn: ahora.toISOString(),
    motivo,
  }
}
