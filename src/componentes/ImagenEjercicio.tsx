/**
 * §15: la biblioteca es visual y sirve para identificar el ejercicio sin
 * conocer los nombres técnicos. Mientras no haya fotos reales del gimnasio,
 * se muestra un marcador con la inicial y el equipo — informativo, no decorativo.
 */

import { etiquetaEquipo } from '../dominio/etiquetas'
import type { Ejercicio } from '../dominio/tipos'

interface Props {
  readonly ejercicio: Ejercicio
}

export function ImagenEjercicio({ ejercicio }: Props) {
  if (ejercicio.imagen) {
    return <img className="imagen-ejercicio" src={ejercicio.imagen} alt={ejercicio.nombre} />
  }

  return (
    <div className="imagen-ejercicio imagen-ejercicio--marcador" aria-hidden="true">
      <span className="imagen-ejercicio__inicial">{ejercicio.nombre.charAt(0)}</span>
      <span className="imagen-ejercicio__equipo">{etiquetaEquipo(ejercicio.equipo)}</span>
    </div>
  )
}
