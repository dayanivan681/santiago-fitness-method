/**
 * Pantalla de perfil.
 * Guía del proyecto §2 (todo editable por el coach), §20–22 (el volumen semanal
 * vive aquí, en segundo plano según §25) y §28 (la estructura de 4 días).
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { usePerfil } from '../../aplicacion/usePerfil'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { Cabecera } from '../../componentes/Cabecera'
import { FichaParticipante } from './FichaParticipante'
import { PanelLimitaciones } from './PanelLimitaciones'
import { PanelProgreso } from './PanelProgreso'
import { PanelVolumen } from './PanelVolumen'
import type { Repositorio } from '../../datos/repositorio'

interface Props {
  readonly repositorio?: Repositorio
  readonly onAbrirCoach?: (plantillaId: string) => void
}

export function Perfil({ repositorio = repositorioPorDefecto, onAbrirCoach }: Props = {}) {
  const { participante, cargando, guardar } = usePerfil(repositorio)
  const plantillas = useLiveQuery(() => repositorio.listarPlantillas(), [repositorio])

  if (cargando) return <p className="aviso">Cargando…</p>
  if (!participante) return <p className="aviso">No hay participante configurado.</p>

  return (
    <>
      <Cabecera
        kicker="Perfil"
        titulo={participante.nombre}
        meta={`${participante.frecuenciaEntrenamiento} días / semana`}
      />

      <div className="contenido">
        <div className="pila">
          <FichaParticipante participante={participante} onGuardar={guardar} />

          {/* Datos del cuerpo juntos: la ficha y cómo va cambiando. */}
          <PanelProgreso participante={participante} repositorio={repositorio} />

          {/* Punto G: la limitación del perfil se conecta con la programación. */}
          <PanelLimitaciones
            participante={participante}
            repositorio={repositorio}
            onGuardar={guardar}
          />

          <PanelVolumen repositorio={repositorio} />

          <section className="panel">
            <div className="panel__cabecera">
              <h2 className="panel__titulo">Estructura de 4 días</h2>
              <span className="panel__nota">Editar</span>
            </div>

            {(plantillas ?? []).map((plantilla) => (
              <button
                key={plantilla.id}
                type="button"
                className="dia"
                onClick={() => onAbrirCoach?.(plantilla.id)}
              >
                <span className="dia__nombre">{plantilla.nombre}</span>
                <span className="dia__nota">
                  {plantilla.slots.length === 0
                    ? 'Por confirmar'
                    : `${plantilla.slots.length} ejercicios`}
                </span>
              </button>
            ))}
          </section>

          <p className="nota">
            Guardado local en el dispositivo durante el piloto. Después: cuenta por
            participante, acceso del coach y sincronización.
          </p>
        </div>
      </div>
    </>
  )
}
