import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { repositorio } from './aplicacion/repositorio'
import { ProveedorDescanso } from './aplicacion/ProveedorDescanso'
import { useMemoria } from './aplicacion/memoria'
import { restaurarDesplazamiento } from './aplicacion/desplazamiento'
import type { Musculo } from './dominio/tipos'
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
import { Entrenamiento } from './pantallas/EntrenamientoHoy/Entrenamiento'
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

  /*
   * Modo entrenamiento.
   *
   * Vive en la pestaña Hoy: salir a la Biblioteca durante el descanso y volver
   * te devuelve al ejercicio donde estabas, como en cualquier app. No se
   * persiste a propósito: tras recargar se aterriza en el resumen con
   * «Continuar», que es honesto y no abre una pantalla completa por sorpresa.
   */
  const [entrenando, setEntrenando] = useState(false)

  /*
   * Contexto de cada sección.
   *
   * Las pantallas se desmontan al cambiar de pestaña —mantenerlas montadas
   * dejaría vivas las consultas de Dexie de las cuatro—, así que lo que el
   * participante eligió vive aquí arriba y se lo devolvemos al volver. Es
   * estado de navegación y muere con la pestaña: no se guarda en ningún sitio.
   */
  const diaDeHoy = useMemoria<string | null>(null)
  const ejercicioAbierto = useMemoria(0)
  const filtroBiblioteca = useMemoria<Musculo | 'todos'>('todos')
  const ejercicioHistorial = useMemoria<string | null>(null)

  // Volver a una sección la deja donde se dejó, no arriba del todo.
  const desplazamientos = useRef<Partial<Record<Seccion, number>>>({})
  const irA = (destino: Seccion) => {
    desplazamientos.current = { ...desplazamientos.current, [seccion]: window.scrollY }
    setSeccion(destino)
  }
  useLayoutEffect(
    () => restaurarDesplazamiento(window, desplazamientos.current[seccion] ?? 0),
    [seccion],
  )

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

  /*
   * Arranque.
   *
   * Antes era un `<p>` suelto: la app aparecía de golpe encima, con el marco,
   * la cabecera y las pestañas entrando a la vez. Abierta desde la pantalla de
   * inicio eso se lee como una web cargando. Ahora se pinta ya el armazón
   * definitivo —mismo fondo, mismo ancho— y sólo cambia el contenido.
   *
   * Sin rueda giratoria: la base es local y esto dura un parpadeo; una rueda
   * sugeriría una espera que no existe.
   */
  if (!listo || participante === undefined) {
    return (
      <div className="app app--arrancando">
        <p className="arranque" role="status">
          Preparando…
        </p>
      </div>
    )
  }

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
    <div className={vistaPrevia ? 'app app--vista-previa' : 'app'}>
      {vistaPrevia && (
        /*
         * Cambio de modo, no «modo desarrollador».
         *
         * Dice de quién es la vista que se está mirando, que es lo único que el
         * coach necesita saber, y ofrece la vuelta. Nada de «impersonación»,
         * «preview» ni «sesión técnica»: por dentro es una sesión normal, y por
         * fuera tiene que leerse como cambiar de modo dentro del producto.
         */
        <aside className="vista-previa" aria-label="Vista previa del cliente">
          <span>Vista de {participante.nombre}</span>
          <a href="/salir?volver=admin">Volver al Coach</a>
        </aside>
      )}
      {seccion === 'hoy' &&
        (entrenando ? (
          <Entrenamiento
            memoriaDia={diaDeHoy}
            memoriaAbierta={ejercicioAbierto}
            onSalir={() => setEntrenando(false)}
          />
        ) : (
          <EntrenamientoHoy memoriaDia={diaDeHoy} onComenzar={() => setEntrenando(true)} />
        ))}
      {seccion === 'biblioteca' && <Biblioteca memoriaFiltro={filtroBiblioteca} />}
      {seccion === 'historial' && <Historial memoriaEjercicio={ejercicioHistorial} />}
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
            onClick={() => irA(id)}
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
