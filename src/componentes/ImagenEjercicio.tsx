/**
 * §15: la biblioteca es visual y sirve para identificar el ejercicio sin
 * conocer los nombres técnicos. Mientras no haya fotos reales del gimnasio,
 * se muestra un marcador con la inicial y el equipo — informativo, no decorativo.
 */

import type { Ejercicio, Equipo } from '../dominio/tipos'

const ETIQUETA_EQUIPO: Readonly<Record<Equipo, string>> = {
  smith: 'Smith',
  convergente: 'Convergente',
  cable: 'Cable',
  mancuernas: 'Mancuernas',
  barraLibre: 'Barra libre',
  maquinaTradicional: 'Máquina',
}

export function etiquetaEquipo(equipo: Equipo): string {
  return ETIQUETA_EQUIPO[equipo]
}

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
      <span className="imagen-ejercicio__equipo">{ETIQUETA_EQUIPO[ejercicio.equipo]}</span>
    </div>
  )
}
