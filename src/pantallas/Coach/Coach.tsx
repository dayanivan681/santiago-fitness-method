/**
 * Pantalla de coach.
 * Guía del proyecto §23 (reemplazar un ejercicio sin destruir la estructura) y
 * §28 (confirmar los ejercicios de Lower A, Upper B y Lower B).
 *
 * No es una pestaña: se entra desde Perfil → Estructura de 4 días, porque
 * editar plantillas no es algo que se haga entrenando (§25).
 */

import { useState } from 'react'
import { useCoach } from '../../aplicacion/useCoach'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { Cabecera } from '../../componentes/Cabecera'
import { MAX_EJERCICIOS_POR_DIA } from '../../logica/plantilla'
import { EditorSlot } from './EditorSlot'
import type { Repositorio } from '../../datos/repositorio'

interface Props {
  readonly repositorio?: Repositorio
  readonly onVolver?: () => void
}

export function Coach({ repositorio = repositorioPorDefecto, onVolver }: Props = {}) {
  const { datos, cargando, elegirPlantilla, reemplazar, ajustar, anadir, quitar } =
    useCoach(repositorio)
  const [ejercicioAAnadir, setEjercicioAAnadir] = useState('')

  if (cargando) return <p className="aviso">Cargando…</p>
  if (!datos) return <p className="aviso">No hay plantillas configuradas.</p>

  const { plantilla, plantillas, ejercicios, participante } = datos
  const slots = [...plantilla.slots].sort((a, b) => a.orden - b.orden)
  const estaLleno = slots.length >= MAX_EJERCICIOS_POR_DIA

  return (
    <>
      <Cabecera kicker="Estructura de 4 días" titulo="Coach" meta={plantilla.nombre} />

      <div className="contenido">
        <nav className="filtros" aria-label="Día a editar">
          {plantillas.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={opcion.id === plantilla.id ? 'filtro filtro--activo' : 'filtro'}
              aria-pressed={opcion.id === plantilla.id}
              onClick={() => elegirPlantilla(opcion.id)}
            >
              {opcion.nombre}
            </button>
          ))}
        </nav>

        <p className="nota" style={{ marginTop: 12 }}>
          Cambiar un ejercicio conserva las series, el rango y el descanso. Cada variante
          guarda su propio historial, así que el nuevo empieza con el suyo.
        </p>

        <div className="pila" style={{ marginTop: 10 }}>
          {slots.map((slot) => (
            <EditorSlot
              key={slot.orden}
              slot={slot}
              ejercicios={ejercicios}
              participante={participante}
              onReemplazar={(ejercicioId) => reemplazar(slot.orden, ejercicioId)}
              onAjustar={(cambios) => ajustar(slot.orden, cambios)}
              onQuitar={() => quitar(slot.orden)}
            />
          ))}
        </div>

        {estaLleno ? (
          <p className="nota" style={{ marginTop: 12 }}>
            {plantilla.nombre} ya tiene el máximo de {MAX_EJERCICIOS_POR_DIA} ejercicios.
            Quita uno para cambiarlo por otro.
          </p>
        ) : (
          <form
            style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 12 }}
            onSubmit={(evento) => {
              evento.preventDefault()
              if (!ejercicioAAnadir) return
              anadir(ejercicioAAnadir)
              setEjercicioAAnadir('')
            }}
          >
            <label className="campo-texto" style={{ flex: 1 }}>
              <span className="etiqueta-campo">
                Añadir ejercicio {slots.length + 1} de {MAX_EJERCICIOS_POR_DIA}
              </span>
              <select
                value={ejercicioAAnadir}
                onChange={(e) => setEjercicioAAnadir(e.target.value)}
                aria-label="Ejercicio a añadir"
              >
                <option value="">Elegir…</option>
                {ejercicios.map((ejercicio) => (
                  <option key={ejercicio.id} value={ejercicio.id}>
                    {ejercicio.nombre}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="boton-guardar" disabled={!ejercicioAAnadir}>
              Añadir
            </button>
          </form>
        )}

        {onVolver && (
          <button
            type="button"
            className="boton-guardar boton-guardar--secundario"
            style={{ width: '100%', height: 40, justifyContent: 'center', marginTop: 16 }}
            onClick={onVolver}
          >
            Volver a perfil
          </button>
        )}
      </div>
    </>
  )
}
