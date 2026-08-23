/**
 * Miniatura del ejercicio en la pantalla de entrenamiento.
 *
 * Iniciales y equipo, no foto: entrenando ya sabes qué ejercicio toca y las
 * iniciales se leen de un vistazo. La foto vive en la Biblioteca, que es donde
 * §15 la necesita — para identificar un ejercicio que no conoces.
 *
 * El color lo pone el estímulo, igual que el punto y la etiqueta.
 */

import { etiquetaEquipo } from './ImagenEjercicio'
import type { Estimulo } from '../dominio/estimulo'
import type { Ejercicio } from '../dominio/tipos'

interface Props {
  readonly ejercicio: Ejercicio
  readonly estimulo: Estimulo
}

export function Miniatura({ ejercicio, estimulo }: Props) {
  return (
    <span className="miniatura" aria-hidden="true">
      <span className={`miniatura__iniciales tinta--${estimulo}`}>
        {iniciales(ejercicio.nombre)}
      </span>
      <span className="miniatura__equipo">{etiquetaEquipo(ejercicio.equipo)}</span>
    </span>
  )
}

/** Dos letras: "Press banca 15° Smith" → PB, "Lat pulldown" → LP. */
function iniciales(nombre: string): string {
  return nombre
    .replace(/[^\p{L}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join('')
}
