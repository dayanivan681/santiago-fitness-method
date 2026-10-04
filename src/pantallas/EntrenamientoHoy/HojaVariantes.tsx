/**
 * Hoja para cambiar la variante asignada.
 * Guía del proyecto §23 ("el participante puede seleccionar la variante
 * asignada"; cambiarla no destruye la estructura) y §16 (cada variante
 * conserva su propio historial).
 */

import { Fragment, useRef, useState } from 'react'
import { etiquetaCarga, etiquetaEquipo } from '../../dominio/etiquetas'
import { useReferenciasDeVariantes } from '../../aplicacion/useReferenciasDeVariantes'
import { useCapa } from '../../aplicacion/useCapa'
import { debeEvitarse } from '../../logica/limitaciones'
import { agruparPorEquipo, ordenarAlternativas } from '../../logica/alternativas'
import { useEjerciciosEntrenados } from '../../aplicacion/useEjerciciosEntrenados'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import type { AlcanceDelCambio } from '../../aplicacion/useEntrenamiento'
import type { Repositorio } from '../../datos/repositorio'
import type { RangoReps } from '../../dominio/estimulo'
import type { Ejercicio, Participante } from '../../dominio/tipos'

const ALCANCES = [
  ['soloHoy', 'Sólo hoy'],
  ['fijar', 'Fijar en la plantilla'],
] as const satisfies readonly (readonly [AlcanceDelCambio, string])[]

interface Props {
  readonly variantes: readonly Ejercicio[]
  /** La que se está entrenando hoy, que puede no ser la de la plantilla. */
  readonly actualId: string
  /** La que tiene asignada la plantilla: elegirla deshace el cambio del día. */
  readonly asignadaId: string
  readonly rango: RangoReps
  /** Punto G: sus limitaciones también valen aquí, no sólo al programar. */
  readonly participante: Participante
  readonly repositorio?: Repositorio
  readonly onElegir: (ejercicioId: string, alcance: AlcanceDelCambio) => void
  readonly onCerrar: () => void
}

export function HojaVariantes({
  variantes,
  actualId,
  asignadaId,
  rango,
  participante,
  repositorio = repositorioPorDefecto,
  onElegir,
  onCerrar,
}: Props) {
  const referencias = useReferenciasDeVariantes(
    repositorio,
    participante.id,
    variantes,
    rango,
  )
  const panel = useRef<HTMLDivElement>(null)
  const cerrar = useCapa(true, onCerrar, panel)

  // El caso corriente —la máquina está ocupada— es de un día, así que ése es
  // el valor por defecto. Fijar la variante en la plantilla se pide a mano.
  const [alcance, setAlcance] = useState<AlcanceDelCambio>('soloHoy')

  // Con 16 variantes la lista era larga y sin orden: arriba la de hoy y la de
  // la plantilla, luego las ya entrenadas y el resto agrupado por equipo.
  const entrenadas = useEjerciciosEntrenados(repositorio, participante.id)
  const fijadas = [actualId, asignadaId]
    .filter((id, i, ids) => ids.indexOf(id) === i)
    .flatMap((id) => variantes.filter((v) => v.id === id))
  const actual = fijadas[0] ?? variantes[0]
  const resto = ordenarAlternativas(
    actual,
    variantes.filter((v) => !fijadas.includes(v)),
    entrenadas,
  )
  const conHistorial = resto.filter((v) => entrenadas?.has(v.id))
  const sinHistorial = resto.filter((v) => !entrenadas?.has(v.id))

  const fila = (variante: Ejercicio) => (
    <button
      key={variante.id}
      type="button"
      className={variante.id === actualId ? 'variante variante--activa' : 'variante'}
      aria-pressed={variante.id === actualId}
      onClick={() => onElegir(variante.id, alcance)}
    >
      <span className="variante__texto">
        <span className="variante__nombre">{variante.nombre}</span>
        <span className="variante__meta">
          {etiquetaEquipo(variante.equipo)} · {etiquetaCarga(variante.tipoCarga, variante.equipo)}
          {variante.id === asignadaId && ' · En la plantilla'}
          {debeEvitarse(variante.id, participante) && ' · El perfil dice evitarlo'}
        </span>
      </span>
      <span className="variante__ref">
        <span>{referencias.get(variante.id) ?? '—'}</span>
        <span className="etiqueta-campo">Historial propio</span>
      </span>
    </button>
  )

  return (
    <div className="hoja" role="dialog" aria-modal="true" aria-label="Variante asignada">
      {/* El fondo también cierra, pero con su propio nombre: dos botones
          "Cerrar" en el mismo diálogo confunden a quien usa lector de pantalla. */}
      <button
        type="button"
        className="hoja__fondo"
        onClick={cerrar}
        aria-label="Cerrar tocando fuera"
      />

      <div className="hoja__panel" ref={panel} tabIndex={-1}>
        <div className="hoja__cabecera">
          <h2 className="hoja__titulo">Variante asignada</h2>
          <button type="button" className="hoja__cerrar" onClick={cerrar}>
            Cerrar
          </button>
        </div>

        <div className="filtros" role="group" aria-label="Alcance del cambio">
          {ALCANCES.map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              className={valor === alcance ? 'filtro filtro--activo' : 'filtro'}
              aria-pressed={valor === alcance}
              onClick={() => setAlcance(valor)}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        <p className="hoja__texto">
          {alcance === 'soloHoy'
            ? 'Cambio de un día: mañana vuelve la variante asignada. Cada una conserva su propio historial.'
            : 'Queda asignada en la plantilla a partir de hoy. No rompe la estructura del día.'}
        </p>

        {fijadas.map(fila)}
        {conHistorial.length > 0 && (
          <p className="alternativas__grupo">Ya entrenadas · {conHistorial.length}</p>
        )}
        {conHistorial.map(fila)}
        {agruparPorEquipo(sinHistorial).map(([equipo, suyas]) => (
          <Fragment key={equipo}>
            <p className="alternativas__grupo">
              {etiquetaEquipo(equipo)} · {suyas.length}
            </p>
            {suyas.map(fila)}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
