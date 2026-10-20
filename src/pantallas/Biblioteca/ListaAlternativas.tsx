/**
 * Alternativas equivalentes de la ficha, como lista de teléfono (§16, §23).
 *
 * Con 16 variantes de un movimiento, una nube de chips no se lee: aquí se ven
 * las 3 más relevantes y el resto se despliega en el mismo sitio, agrupado por
 * equipo. No abre otra hoja: apilar diálogos en el móvil desorienta.
 */

import { useId, useState } from 'react'
import { etiquetaEquipo } from '../../dominio/etiquetas'
import { agruparPorEquipo, ordenarAlternativas } from '../../logica/alternativas'
import type { Ejercicio } from '../../dominio/tipos'
import { Icono } from '../../producto/ui'

/** Las que caben a la vista sin hacer scroll dentro de la ficha. */
const VISIBLES = 3

interface Props {
  readonly ejercicio: Ejercicio
  /** Variantes del mismo movimiento, sin el ejercicio abierto. */
  readonly alternativas: readonly Ejercicio[]
  /** Con historial, las ya entrenadas van primero. */
  readonly entrenadas?: ReadonlySet<string>
  readonly onElegir: (ejercicio: Ejercicio) => void
}

export function ListaAlternativas({ ejercicio, alternativas, entrenadas, onElegir }: Props) {
  const [desplegada, setDesplegada] = useState(false)
  const ordenadas = ordenarAlternativas(ejercicio, alternativas, entrenadas)
  const total = ordenadas.length

  if (total === 0) {
    return (
      <div className="hoja__seccion">
        <span className="etiqueta-campo">Alternativas</span>
        <p className="hoja__texto">No hay otra variante de este movimiento.</p>
      </div>
    )
  }

  return (
    <div className="alternativas hoja__seccion">
      <span className="etiqueta-campo">Alternativas ({total})</span>
      {desplegada
        ? agruparPorEquipo(ordenadas).map(([equipo, suyas]) => (
            <GrupoDeEquipo key={equipo} titulo={etiquetaEquipo(equipo)} ejercicios={suyas} onElegir={onElegir} />
          ))
        : ordenadas.slice(0, VISIBLES).map((alternativa) => (
            <FilaAlternativa key={alternativa.id} ejercicio={alternativa} onElegir={onElegir} />
          ))}
      {total > VISIBLES && (
        <button
          type="button"
          className="alternativas__mas"
          aria-expanded={desplegada}
          onClick={() => setDesplegada(!desplegada)}
        >
          {desplegada ? 'Ver menos' : `Ver las ${total} alternativas`}
        </button>
      )}
    </div>
  )
}

/** Subtítulo «Mancuernas · 3» y sus filas. */
function GrupoDeEquipo({
  titulo,
  ejercicios,
  onElegir,
}: {
  readonly titulo: string
  readonly ejercicios: readonly Ejercicio[]
  readonly onElegir: (ejercicio: Ejercicio) => void
}) {
  return (
    <>
      <p className="alternativas__grupo">
        {titulo} · {ejercicios.length}
      </p>
      {ejercicios.map((alternativa) => (
        <FilaAlternativa key={alternativa.id} ejercicio={alternativa} onElegir={onElegir} />
      ))}
    </>
  )
}

/**
 * Toda la fila se toca. El nombre accesible es sólo el del ejercicio; el
 * equipo va como descripción para no alargar lo que lee el lector de pantalla.
 */
function FilaAlternativa({
  ejercicio,
  onElegir,
}: {
  readonly ejercicio: Ejercicio
  readonly onElegir: (ejercicio: Ejercicio) => void
}) {
  const id = useId()
  return (
    <button
      type="button"
      className="variante"
      aria-labelledby={`${id}-nombre`}
      aria-describedby={`${id}-equipo`}
      onClick={() => onElegir(ejercicio)}
    >
      <span className="variante__texto">
        <span id={`${id}-nombre`} className="variante__nombre">
          {ejercicio.nombre}
        </span>
        <span id={`${id}-equipo`} className="variante__meta">
          {etiquetaEquipo(ejercicio.equipo)}
        </span>
      </span>
      <span className="variante__chevron" aria-hidden="true">
        <Icono nombre="flecha" size={18} />
      </span>
    </button>
  )
}
