/**
 * Conversión de una serie registrada a serie comparable.
 *
 * Vive en un sitio único a propósito: antes cada pantalla repetía la aritmética
 * de carga de §17 por su cuenta, y basta con que una olvide un campo —la técnica,
 * el peso base de la barra— para que el veredicto de esa pantalla mienta.
 */

import { aCargaTotalLb, type PerfilCarga } from './carga'
import { TECNICA_POR_DEFECTO, type SerieComparable, type SerieRegistrada } from './tipos'

export function aComparable(
  serie: SerieRegistrada,
  perfil: PerfilCarga,
): SerieComparable {
  return {
    cargaTotalLb: aCargaTotalLb(serie.pesoRegistradoLb, perfil),
    reps: serie.repsRealizadas,
    rir: serie.rir,
    tecnica: serie.tecnica ?? TECNICA_POR_DEFECTO,
  }
}
