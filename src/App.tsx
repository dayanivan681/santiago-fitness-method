import { useCallback, useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { repositorio } from './aplicacion/repositorio'
import { sembrar } from './datos/semilla'
import { AltaParticipante } from './pantallas/Alta/AltaParticipante'
import { EntrenamientoHoy } from './pantallas/EntrenamientoHoy/EntrenamientoHoy'
import { Biblioteca } from './pantallas/Biblioteca/Biblioteca'
import { Historial } from './pantallas/Historial/Historial'
import { Perfil } from './pantallas/Perfil/Perfil'
import { Coach } from './pantallas/Coach/Coach'
import { useCapa } from './aplicacion/useCapa'

type Seccion = 'hoy' | 'biblioteca' | 'historial' | 'perfil'

/** §25: entrenar va primero; lo demás queda detrás. */
const PESTANAS: readonly { readonly id: Seccion; readonly etiqueta: string }[] = [
  { id: 'hoy', etiqueta: 'Hoy' },
  { id: 'biblioteca', etiqueta: 'Biblioteca' },
  { id: 'historial', etiqueta: 'Historial' },
  { id: 'perfil', etiqueta: 'Perfil' },
]

export function App() {
  const [listo, setListo] = useState(false)
  const [seccion, setSeccion] = useState<Seccion>('hoy')
  // El coach no es una pestaña: se entra desde Perfil → Estructura de 4 días,
  // porque editar plantillas no es algo que se haga entrenando (§25).
  const [coachAbierto, setCoachAbierto] = useState(false)

  useEffect(() => {
    sembrar(repositorio).then(() => setListo(true))
  }, [])

  // `undefined` es "todavía cargando" y `null` es "no hay nadie dado de alta":
  // sin distinguirlos, la pantalla de alta parpadearía en cada arranque.
  const participante = useLiveQuery(
    () => repositorio.participanteActual().then((encontrado) => encontrado ?? null),
    [],
  )

  const cerrarCoach = useCallback(() => setCoachAbierto(false), [])
  const volverDeCoach = useCapa(coachAbierto, cerrarCoach)

  if (!listo || participante === undefined) return <p className="aviso">Preparando…</p>

  // Instalación nueva: no hay a quién entrenar hasta que el coach lo dé de alta.
  if (participante === null) {
    return (
      <div className="app">
        <AltaParticipante />
      </div>
    )
  }

  if (coachAbierto) {
    return (
      <div className="app">
        <Coach onVolver={volverDeCoach} />
      </div>
    )
  }

  return (
    <div className="app">
      {seccion === 'hoy' && <EntrenamientoHoy />}
      {seccion === 'biblioteca' && <Biblioteca />}
      {seccion === 'historial' && <Historial />}
      {seccion === 'perfil' && <Perfil onAbrirCoach={() => setCoachAbierto(true)} />}

      <nav className="pestanas" aria-label="Secciones">
        {PESTANAS.map(({ id, etiqueta }) => (
          <button
            key={id}
            type="button"
            className={
              seccion === id ? 'pestanas__boton pestanas__boton--activo' : 'pestanas__boton'
            }
            aria-current={seccion === id ? 'page' : undefined}
            onClick={() => setSeccion(id)}
          >
            <span className="pestanas__marca" />
            {etiqueta}
          </button>
        ))}
      </nav>
    </div>
  )
}
