/**
 * Transiciones de pantalla al estilo de una app nativa.
 *
 * Una web cambia de pantalla con un corte seco; iOS desliza hacia dentro al
 * avanzar y hacia fuera al volver, y funde al cambiar de pestaña. Aquí se usa
 * la View Transitions API (Safari 18+, Chrome): el navegador fotografía la
 * pantalla vieja, se pinta la nueva y el CSS anima entre las dos.
 *
 * Sin la API, o con «Reducir movimiento», el cambio es inmediato como siempre.
 */
import { useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, type Location } from 'react-router'

export type Direccion = 'adelante' | 'atras' | 'lateral'

type DocumentoConTransiciones = Document & {
  startViewTransition?: (actualizar: () => void) => { finished: Promise<void> }
}

function profundidad(ruta: string): number {
  return ruta.split('/').filter(Boolean).length
}

/**
 * Las raíces de la barra de pestañas (Hoy, Biblioteca, Progreso, Clientes) del
 * cliente y del coach, reales o de demo. Hoy es la base y las demás cuelgan de
 * ella, pero entre pestañas no se avanza ni se vuelve: se cambia.
 */
const PESTANA = /^(\/demo\/(cliente|coach)|\/admin)?(\/(biblioteca|progreso|clientes))?\/?$/

/** Entre pestañas, fundido; más profunda = avanzar; menos = volver. */
export function direccionEntre(desde: string, hacia: string): Direccion {
  if (PESTANA.test(desde) && PESTANA.test(hacia)) return 'lateral'
  const a = profundidad(desde)
  const b = profundidad(hacia)
  return b > a ? 'adelante' : b < a ? 'atras' : 'lateral'
}

export function movimientoReducido(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

function suscribirMovimiento(cambio: () => void) {
  if (typeof matchMedia !== 'function') return () => {}
  const consulta = matchMedia('(prefers-reduced-motion: reduce)')
  consulta.addEventListener('change', cambio)
  return () => consulta.removeEventListener('change', cambio)
}

export function useMovimientoReducido(): boolean {
  return useSyncExternalStore(suscribirMovimiento, movimientoReducido, () => true)
}

/**
 * Cambia lo que se ve dentro de una transición. `actualizar` tiene que pintar
 * de forma síncrona (setState envuelto en flushSync lo hace).
 */
export function conTransicion(direccion: Direccion, actualizar: () => void) {
  const documento = document as DocumentoConTransiciones
  if (!documento.startViewTransition || movimientoReducido()) {
    actualizar()
    return
  }
  document.documentElement.dataset.transicion = direccion
  const transicion = documento.startViewTransition(() => flushSync(actualizar))
  void transicion.finished.finally(() => {
    delete document.documentElement.dataset.transicion
  })
}

/**
 * La ubicación que se pinta va un paso por detrás de la real: cuando cambia la
 * ruta, se fotografía la pantalla actual y sólo entonces se pinta la nueva.
 * Los cambios de búsqueda o de estado en la misma ruta no se animan.
 */
export function useUbicacionConTransicion(): Location {
  const ubicacion = useLocation()
  const [mostrada, setMostrada] = useState(ubicacion)
  useLayoutEffect(() => {
    if (ubicacion.key === mostrada.key) return
    if (ubicacion.pathname === mostrada.pathname) {
      // Sincroniza con el historial del navegador, que es externo a React.
      // oxlint-disable-next-line react/set-state-in-effect
      setMostrada(ubicacion)
      return
    }
    conTransicion(direccionEntre(mostrada.pathname, ubicacion.pathname), () => setMostrada(ubicacion))
  }, [ubicacion, mostrada])
  return mostrada
}
