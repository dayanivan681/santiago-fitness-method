/**
 * Comportamiento de las capas que se superponen a la pantalla: la hoja de
 * variantes y el editor del coach.
 *
 * Instalada como app, sin esto el botón atrás de Android cerraría la app entera
 * en mitad de un entrenamiento en vez de cerrar la capa. Y el fondo seguiría
 * desplazándose bajo la hoja, que es de las cosas que peor se sienten en móvil.
 *
 * Devuelve la función de cierre que debe usar la interfaz: cerrar desde un
 * botón tiene que retroceder en el historial, o quedaría una entrada colgando
 * y el siguiente "atrás" no haría nada.
 */

import { useCallback, useEffect, useRef, type RefObject } from 'react'

interface EstadoDeCapa {
  readonly capa: true
}

function hayEntradaDeCapa(): boolean {
  return (window.history.state as EstadoDeCapa | null)?.capa === true
}

export function useCapa(
  abierta: boolean,
  alCerrar: () => void,
  /** El panel de la capa, para llevarle el foco al abrir y devolverlo al cerrar. */
  contenedor?: RefObject<HTMLElement | null>,
): () => void {
  // En una ref para que cambiar el callback no reinstale el efecto.
  const cerrar = useRef(alCerrar)
  useEffect(() => {
    cerrar.current = alCerrar
  }, [alCerrar])

  useEffect(() => {
    if (!abierta) return

    // El guardia importa: en desarrollo React monta el efecto dos veces y sin
    // él se acumularían entradas de historial que nadie puede retirar.
    if (!hayEntradaDeCapa()) {
      window.history.pushState({ capa: true } satisfies EstadoDeCapa, '')
    }

    const alPulsarAtras = () => cerrar.current()
    window.addEventListener('popstate', alPulsarAtras)
    return () => window.removeEventListener('popstate', alPulsarAtras)
  }, [abierta])

  useBloqueoDeFondo(abierta)
  useEscape(abierta, cerrar)
  useFoco(abierta, contenedor)

  return useCallback(() => {
    // Retroceder dispara `popstate`, que es quien cierra: un solo camino de
    // cierre para el botón atrás y para la interfaz.
    if (hayEntradaDeCapa()) window.history.back()
    else cerrar.current()
  }, [])
}

/** El fondo no se mueve mientras hay una capa encima. */
function useBloqueoDeFondo(abierta: boolean): void {
  useEffect(() => {
    if (!abierta) return

    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [abierta])
}

/** Escape cierra, como cualquier diálogo. */
function useEscape(abierta: boolean, cerrar: RefObject<() => void>): void {
  useEffect(() => {
    if (!abierta) return

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') cerrar.current()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [abierta, cerrar])
}

/**
 * El foco entra en la capa al abrirla y vuelve a su sitio al cerrarla.
 *
 * Sin lo primero, quien navega con teclado o lector sigue en la página de
 * detrás y no se entera de que hay una hoja abierta. Sin lo segundo, al cerrar
 * el foco cae al principio del documento y hay que recorrerlo entero otra vez.
 */
function useFoco(abierta: boolean, contenedor?: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!abierta || !contenedor) return

    const previo = document.activeElement as HTMLElement | null
    const panel = contenedor.current
    const primero = panel?.querySelector<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    ;(primero ?? panel)?.focus()

    return () => {
      // Sólo si sigue en el documento: la pantalla pudo cambiar debajo.
      if (previo?.isConnected) previo.focus()
    }
  }, [abierta, contenedor])
}
