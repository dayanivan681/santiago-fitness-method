/**
 * Pantalla de perfil.
 * Guía del proyecto §2 (todo editable por el coach), §20–22 (el volumen semanal
 * vive aquí, en segundo plano según §25) y §28 (la estructura de 4 días).
 */

import { Esqueleto } from '../../componentes/Esqueleto'
import { usePerfil } from '../../aplicacion/usePerfil'
import { repositorio as repositorioPorDefecto } from '../../aplicacion/repositorio'
import { FichaParticipante } from './FichaParticipante'
import { PanelLimitaciones } from './PanelLimitaciones'
import { PanelProgreso } from './PanelProgreso'
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

  if (cargando) return <Esqueleto etiqueta="Cargando tu perfil" />
  if (!participante) return <p className="aviso">No hay participante configurado.</p>

  return (
    <>
      <div className="contenido">
        <header className="pantalla">
          <h1 className="pantalla__titulo">{participante.nombre}</h1>
          <p className="pantalla__sub">
            {participante.frecuenciaEntrenamiento} días por semana
          </p>
        </header>

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


          {/* Sin detalles de almacenamiento: al participante le importa de dónde
              viene su rutina y dónde queda lo que entrena, no en qué se guarda.
              Y no se promete sincronización entre dispositivos, que no existe. */}
          <p className="nota">
            Tu programa llega de tu coach. Tu entrenamiento se registra en este
            dispositivo.
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
