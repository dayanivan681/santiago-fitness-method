import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { repositorio } from './aplicacion/repositorio'
import { ProveedorDescanso } from './aplicacion/ProveedorDescanso'
import { Descanso } from './componentes/Descanso'
import {
  IconoBiblioteca,
  IconoHistorial,
  IconoHoy,
  IconoPerfil,
} from './componentes/IconosNavegacion'
import { sincronizarConfiguracionCloud } from './aplicacion/sincronizarCloud'
import { sembrar } from './datos/semilla'
import { AltaParticipante } from './pantallas/Alta/AltaParticipante'
import { EntrenamientoHoy } from './pantallas/EntrenamientoHoy/EntrenamientoHoy'
import { Biblioteca } from './pantallas/Biblioteca/Biblioteca'
import { Historial } from './pantallas/Historial/Historial'
import { Perfil } from './pantallas/Perfil/Perfil'

type Seccion = 'hoy' | 'biblioteca' | 'historial' | 'perfil'

/** §25: entrenar va primero; lo demás queda detrás. */
const PESTANAS: readonly {
  readonly id: Seccion
  readonly etiqueta: string
  readonly Icono: (props: { readonly className?: string }) => React.ReactElement
}[] = [
  { id: 'hoy', etiqueta: 'Hoy', Icono: IconoHoy },
  { id: 'biblioteca', etiqueta: 'Biblioteca', Icono: IconoBiblioteca },
  { id: 'historial', etiqueta: 'Historial', Icono: IconoHistorial },
  { id: 'perfil', etiqueta: 'Perfil', Icono: IconoPerfil },
]

export function App() {
  const [listo, setListo] = useState(false)
  const [vistaPrevia, setVistaPrevia] = useState(false)
  const [seccion, setSeccion] = useState<Seccion>('hoy')

  useEffect(() => {
    let cancelado = false
    void (async () => {
      await sembrar(repositorio)
      const cloud = await sincronizarConfiguracionCloud(repositorio)
      if (cancelado) return
      setVistaPrevia(cloud?.preview === true)
      setListo(true)
    })()
    return () => {
      cancelado = true
    }
  }, [])

  // `undefined` es "todavía cargando" y `null` es "no hay nadie dado de alta":
  // sin distinguirlos, la pantalla de alta parpadearía en cada arranque.
  const participante = useLiveQuery(
    () => repositorio.participanteActual().then((encontrado) => encontrado ?? null),
    [],
  )

  if (!listo || participante === undefined) return <p className="aviso">Preparando…</p>

  // Instalación nueva: no hay a quién entrenar hasta que el coach lo dé de alta.
  if (participante === null) {
    return (
      <div className="app">
        <AltaParticipante />
      </div>
    )
  }

  return (
    // El cronómetro cuelga de aquí, no de la pantalla de entrenamiento: el
    // descanso no se detiene porque el participante mire la biblioteca entre
    // serie y serie. Al colgar de App, cambiar de pestaña no lo desmonta.
    <ProveedorDescanso>
    <div className="app">
      {seccion === 'hoy' && <EntrenamientoHoy />}
      {seccion === 'biblioteca' && <Biblioteca />}
      {seccion === 'historial' && <Historial />}
      {seccion === 'perfil' && <Perfil vistaPrevia={vistaPrevia} soloParticipante />}

      <nav className="pestanas" aria-label="Secciones">
        {PESTANAS.map(({ id, etiqueta, Icono }) => (
          <button
            key={id}
            type="button"
            className={
              seccion === id ? 'pestanas__boton pestanas__boton--activo' : 'pestanas__boton'
            }
            aria-current={seccion === id ? 'page' : undefined}
            onClick={() => setSeccion(id)}
          >
            <Icono className="pestanas__icono" />
            <span className="pestanas__etiqueta">{etiqueta}</span>
          </button>
        ))}
      </nav>

      <Descanso />
    </div>
    </ProveedorDescanso>
  )
}
