/**
 * Hoja para cambiar la variante asignada.
 * Guía del proyecto §23 ("el participante puede seleccionar la variante
 * asignada"; cambiarla no destruye la estructura) y §16 (cada variante
 * conserva su propio historial).
 */

import { useState } from 'react'
import { etiquetaEquipo } from '../../componentes/ImagenEjercicio'
import { useReferenciasDeVariantes } from '../../aplicacion/useReferenciasDeVariantes'
import { useCapa } from '../../aplicacion/useCapa'
import { debeEvitarse } from '../../logica/limitaciones'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import type { AlcanceDelCambio } from '../../aplicacion/useEntrenamiento'
import type { Repositorio } from '../../datos/repositorio'
import type { RangoReps } from '../../dominio/estimulo'
import type { Ejercicio, Participante } from '../../dominio/tipos'

const ETIQUETA_CARGA = {
  total: 'Carga total',
  porLado: 'Carga por lado',
  discosAnadidos: 'Discos añadidos',
  pesoMaquina: 'Peso de máquina',
} as const

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
  const referencias = useReferenciasDeVariantes(repositorio, variantes, rango)
  const cerrar = useCapa(true, onCerrar)

  // El caso corriente —la máquina está ocupada— es de un día, así que ése es
  // el valor por defecto. Fijar la variante en la plantilla se pide a mano.
  const [alcance, setAlcance] = useState<AlcanceDelCambio>('soloHoy')

  return (
    <div className="hoja" role="dialog" aria-label="Variante asignada">
      <button type="button" className="hoja__fondo" onClick={cerrar} aria-label="Cerrar" />

      <div className="hoja__panel">
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

        {variantes.map((variante) => (
          <button
            key={variante.id}
            type="button"
            className={
              variante.id === actualId ? 'variante variante--activa' : 'variante'
            }
            aria-pressed={variante.id === actualId}
            onClick={() => onElegir(variante.id, alcance)}
          >
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span className="variante__nombre">{variante.nombre}</span>
              <span className="variante__meta">
                {etiquetaEquipo(variante.equipo)} · {ETIQUETA_CARGA[variante.tipoCarga]}
                {variante.id === asignadaId && ' · En la plantilla'}
                {debeEvitarse(variante.id, participante) && ' · El perfil dice evitarlo'}
              </span>
            </span>
            <span className="variante__ref">
              <span>{referencias.get(variante.id) ?? '—'}</span>
              <span className="etiqueta-campo">Historial propio</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
