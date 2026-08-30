/**
 * Pantalla de perfil.
 * Guía del proyecto §2 (todo editable por el coach), §20–22 (el volumen semanal
 * vive aquí, en segundo plano según §25) y §28 (la estructura de 4 días).
 */

import { usePerfil } from '../../aplicacion/usePerfil'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { Cabecera } from '../../componentes/Cabecera'
import { FichaParticipante } from './FichaParticipante'
import { PanelLimitaciones } from './PanelLimitaciones'
import { PanelProgreso } from './PanelProgreso'
import { PanelRespaldo } from './PanelRespaldo'
import { PanelVolumen } from './PanelVolumen'
import type { Repositorio } from '../../datos/repositorio'

interface Props {
  readonly repositorio?: Repositorio
  /** La consola puede abrir una sesión normal de preview; no añade permisos. */
  readonly vistaPrevia?: boolean
  /** La ruta principal es sólo participante; tests/legacy pueden renderizar la ficha coach. */
  readonly soloParticipante?: boolean
}

export function Perfil({
  repositorio = repositorioPorDefecto,
  vistaPrevia = false,
  soloParticipante = false,
}: Props = {}) {
  const { participante, cargando, guardar } = usePerfil(repositorio)

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
          <FichaParticipante
            participante={participante}
            repositorio={repositorio}
            onGuardar={guardar}
            editable={!soloParticipante}
          />

          {/* Datos del cuerpo juntos: la ficha y cómo va cambiando. */}
          <PanelProgreso participante={participante} repositorio={repositorio} />

          {/* Punto G: la limitación del perfil se conecta con la programación. */}
          <PanelLimitaciones
            participante={participante}
            repositorio={repositorio}
            onGuardar={guardar}
            soloLectura={soloParticipante}
          />

          <PanelVolumen repositorio={repositorio} />

          <PanelRespaldo participante={participante} repositorio={repositorio} />

          <p className="nota">
            Tu identidad y rutina llegan del panel del coach y se sincronizan desde la
            nube. Series, historial, fotos y progreso se guardan localmente en este
            dispositivo durante este release.
          </p>

          {/* El acceso lo resuelve el middleware del borde, no la app: por eso
              es un enlace a /salir y no un botón con lógica propia. Allí se
              revoca la sesión en el servidor y se borra la cookie. */}
          <p className="nota">
            <a className="enlace" href="/salir">
              Cerrar sesión
            </a>
            {vistaPrevia && (
              <> · <a className="enlace" href="/salir?volver=admin">Salir de vista previa</a></>
            )}
          </p>
        </div>
      </div>
    </>
  )
}
