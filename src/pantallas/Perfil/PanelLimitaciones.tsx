/**
 * Ejercicios que este participante no debe hacer.
 *
 * El cliente lo pide así: *"una limitación no debe ser sólo texto"*. El texto
 * de §2 explica el porqué —"hombro derecho"— y esta lista es la parte que la
 * app comprueba: al asignar uno de estos ejercicios, el coach recibe un aviso
 * con las alternativas equivalentes.
 */

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { dejarDeEvitar, evitar } from '../../logica/limitaciones'
import type { Repositorio } from '../../datos/repositorio'
import type { Participante } from '../../dominio/tipos'

interface Props {
  readonly participante: Participante
  readonly repositorio: Repositorio
  readonly onGuardar: (cambios: Participante) => Promise<void>
}

export function PanelLimitaciones({ participante, repositorio, onGuardar }: Props) {
  const ejercicios = useLiveQuery(() => repositorio.listarEjercicios(), [repositorio])
  const [elegido, setElegido] = useState('')

  const biblioteca = [...(ejercicios ?? [])].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es'),
  )
  const evitados = participante.ejerciciosEvitados ?? []
  const restringidos = biblioteca.filter((ejercicio) => evitados.includes(ejercicio.id))

  async function anadir(evento: React.FormEvent) {
    evento.preventDefault()
    if (!elegido) return
    await onGuardar(evitar(participante, elegido))
    setElegido('')
  }

  return (
    <section className="panel">
      <div className="panel__cabecera">
        <h2 className="panel__titulo">Ejercicios a evitar</h2>
        <span className="panel__nota">Avisa al programar</span>
      </div>

      {restringidos.length === 0 ? (
        <p className="nota">Sin ejercicios restringidos.</p>
      ) : (
        <div className="limitacion">
          {restringidos.map((ejercicio) => (
            <span key={ejercicio.id} className="limitacion__alternativas">
              <span style={{ flex: 1 }}>{ejercicio.nombre}</span>
              <button
                type="button"
                className="filtro"
                aria-label={`Quitar ${ejercicio.nombre}`}
                onClick={() => onGuardar(dejarDeEvitar(participante, ejercicio.id))}
              >
                Quitar
              </button>
            </span>
          ))}
        </div>
      )}

      <form style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }} onSubmit={anadir}>
        <label className="campo-texto" style={{ flex: 1 }}>
          <span className="etiqueta-campo">Añadir restricción</span>
          <select
            value={elegido}
            onChange={(e) => setElegido(e.target.value)}
            aria-label="Ejercicio a evitar"
          >
            <option value="">Elegir…</option>
            {biblioteca
              .filter((ejercicio) => !evitados.includes(ejercicio.id))
              .map((ejercicio) => (
                <option key={ejercicio.id} value={ejercicio.id}>
                  {ejercicio.nombre}
                </option>
              ))}
          </select>
        </label>
        <button type="submit" className="boton-guardar" disabled={!elegido}>
          Evitar
        </button>
      </form>
    </section>
  )
}
