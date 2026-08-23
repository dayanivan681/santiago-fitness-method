/**
 * Edición de un ejercicio dentro de un día.
 * Guía del proyecto §23: el coach puede reemplazarlo y ajustar series, rango y
 * descanso. Reemplazar no toca el resto de la configuración del slot.
 */

import { etiquetaEquipo } from '../../componentes/ImagenEjercicio'
import { alternativasEquivalentes, debeEvitarse } from '../../logica/limitaciones'
import { ETIQUETA_SUGERENCIA } from '../../logica/sugerencia'
import { PROGRESIONES, type TipoDeProgresion } from '../../dominio/progresion'
import type { Direccion } from '../../logica/plantilla'
import type { Ejercicio, Participante, SlotPlantilla } from '../../dominio/tipos'
import type { Estimulo } from '../../dominio/estimulo'

const ETIQUETA_ESTIMULO: Readonly<Record<Estimulo, string>> = {
  fuerza: 'Fuerza',
  hipertrofia: 'Hipertrofia',
  resistencia: 'Resistencia',
}

interface Props {
  readonly slot: SlotPlantilla
  readonly ejercicios: readonly Ejercicio[]
  /** Sus limitaciones son las que se comprueban al asignar (punto G). */
  readonly participante: Participante
  readonly onReemplazar: (ejercicioId: string) => void
  readonly onAjustar: (cambios: Partial<Omit<SlotPlantilla, 'orden'>>) => void
  readonly onQuitar: () => void
  /** Ordenar el día es parte de programarlo: §4 lo ordena por exigencia. */
  readonly onMover: (direccion: Direccion) => void
  readonly esElPrimero: boolean
  readonly esElUltimo: boolean
}

export function EditorSlot({
  slot,
  ejercicios,
  participante,
  onReemplazar,
  onAjustar,
  onQuitar,
  onMover,
  esElPrimero,
  esElUltimo,
}: Props) {
  const etiqueta = `ejercicio ${slot.orden}`
  const asignado = ejercicios.find((ejercicio) => ejercicio.id === slot.ejercicioId)
  const prohibido = asignado && debeEvitarse(asignado.id, participante)

  return (
    <article className="panel">
      <header className="panel__cabecera">
        <span className={`etiqueta etiqueta--${slot.estimulo}`}>
          {slot.orden}. {ETIQUETA_ESTIMULO[slot.estimulo]}
        </span>
        <span className="orden-slot">
          <button
            type="button"
            className="orden-slot__boton"
            aria-label={`Subir el ${etiqueta}`}
            disabled={esElPrimero}
            onClick={() => onMover('arriba')}
          >
            ↑
          </button>
          <button
            type="button"
            className="orden-slot__boton"
            aria-label={`Bajar el ${etiqueta}`}
            disabled={esElUltimo}
            onClick={() => onMover('abajo')}
          >
            ↓
          </button>
          <button type="button" className="hoja__cerrar" onClick={onQuitar}>
            Quitar
          </button>
        </span>
      </header>

      <label className="campo-texto">
        <span className="etiqueta-campo">Ejercicio</span>
        <select
          value={slot.ejercicioId}
          onChange={(e) => onReemplazar(e.target.value)}
          aria-label={`Ejercicio de la posición ${slot.orden}`}
        >
          {ejercicios.map((ejercicio) => (
            <option key={ejercicio.id} value={ejercicio.id}>
              {ejercicio.nombre} · {etiquetaEquipo(ejercicio.equipo)}
            </option>
          ))}
        </select>
      </label>

      {/* Punto G: la limitación avisa, pero no bloquea. Programar es del coach. */}
      {prohibido && asignado && (
        <div className="limitacion">
          <span>El perfil dice evitar {asignado.nombre}.</span>
          <Alternativas
            ejercicio={asignado}
            ejercicios={ejercicios}
            participante={participante}
            onElegir={onReemplazar}
          />
        </div>
      )}

      <div className="rejilla-datos">
        <label className="campo-texto">
          <span className="etiqueta-campo">Series</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={slot.seriesObjetivo}
            onChange={(e) => onAjustar({ seriesObjetivo: Number(e.target.value) })}
            aria-label={`Series del ${etiqueta}`}
          />
        </label>

        <label className="campo-texto">
          <span className="etiqueta-campo">Reps mín.</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={slot.repMin}
            onChange={(e) => onAjustar({ repMin: Number(e.target.value) })}
            aria-label={`Repeticiones mínimas del ${etiqueta}`}
          />
        </label>

        <label className="campo-texto">
          <span className="etiqueta-campo">Reps máx.</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={slot.repMax}
            onChange={(e) => onAjustar({ repMax: Number(e.target.value) })}
            aria-label={`Repeticiones máximas del ${etiqueta}`}
          />
        </label>

        {/* Su V1 pide la progresión "siempre editable por el coach". */}
        <label className="campo-texto">
          <span className="etiqueta-campo">Progresión</span>
          <select
            value={slot.progresionFijada ?? ''}
            onChange={(e) =>
              onAjustar({
                progresionFijada: (e.target.value || undefined) as TipoDeProgresion | undefined,
              })
            }
            aria-label={`Progresión del ${etiqueta}`}
          >
            <option value="">Automática</option>
            {PROGRESIONES.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ETIQUETA_SUGERENCIA[tipo]}
              </option>
            ))}
          </select>
        </label>

        <label className="campo-texto">
          <span className="etiqueta-campo">Descanso (s)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="15"
            value={slot.descansoSegundos}
            onChange={(e) => onAjustar({ descansoSegundos: Number(e.target.value) })}
            aria-label={`Descanso del ${etiqueta}`}
          />
        </label>
      </div>
    </article>
  )
}

/** §16 y §23: las equivalentes salen del patrón de movimiento, no de una lista aparte. */
function Alternativas({
  ejercicio,
  ejercicios,
  participante,
  onElegir,
}: {
  readonly ejercicio: Ejercicio
  readonly ejercicios: readonly Ejercicio[]
  readonly participante: Participante
  readonly onElegir: (ejercicioId: string) => void
}) {
  const alternativas = alternativasEquivalentes(ejercicio, ejercicios, participante)
  if (alternativas.length === 0) {
    return <span className="limitacion__nota">No hay equivalentes en la biblioteca.</span>
  }

  return (
    <span className="limitacion__alternativas">
      <span className="etiqueta-campo">Equivalentes</span>
      {alternativas.map((alternativa) => (
        <button
          key={alternativa.id}
          type="button"
          className="filtro"
          onClick={() => onElegir(alternativa.id)}
        >
          {alternativa.nombre}
        </button>
      ))}
    </span>
  )
}
