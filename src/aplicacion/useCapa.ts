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

import { useCallback, useEffect, useRef } from 'react'

interface EstadoDeCapa {
  readonly capa: true
}

function hayEntradaDeCapa(): boolean {
  return (window.history.state as EstadoDeCapa | null)?.capa === true
}

export function useCapa(abierta: boolean, alCerrar: () => void): () => void {
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
