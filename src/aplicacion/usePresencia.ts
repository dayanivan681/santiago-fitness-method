/**
 * Presencia de una hoja: sale animada y sólo después se desmonta.
 *
 * Antes las hojas desaparecían de golpe: el padre las quitaba del árbol en el
 * mismo instante del cierre. Aquí el cierre pasa por «saliendo» (la hoja pinta
 * su animación de salida) y el aviso al padre llega al terminar.
 *
 * Garantías, porque una hoja a medio cerrar es el peor estado posible:
 * - un solo cierre aunque se pida dos veces;
 * - si no llega `animationend`, un temporizador de respaldo cierra igual;
 * - si la hoja se desmonta antes (se navegó), no queda ningún callback ni
 *   temporizador pendiente;
 * - con «reducir movimiento», o donde no hay animaciones (sin
 *   `getAnimations`), el cierre es inmediato.
 *
 * Quien cierra sigue siendo el mismo de siempre (`useCapa`, el botón Atrás,
 * Escape, el fondo): esto sólo se intercala entre la petición y el desmontaje.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/** Igual que `--mov-hoja-cierre` en `src/index.css`. */
export const CIERRE_MS = 180
/** Margen sobre la animación: el respaldo nunca debe adelantarse a ella. */
export const RESPALDO_CIERRE_MS = CIERRE_MS + 80

function cierreInmediato(): boolean {
  const reducir =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const sinAnimaciones =
    typeof Element === 'undefined' || typeof Element.prototype.getAnimations !== 'function'
  return reducir || sinAnimaciones
}

export interface Presencia {
  /** La hoja está pintando su salida: añadir la clase y no aceptar más toques. */
  readonly saliendo: boolean
  /** Pide el cierre. Idempotente. */
  readonly salir: () => void
  /** Para `onAnimationEnd` del elemento que anima la salida. */
  readonly alTerminarAnimacion: () => void
}

export function usePresencia(alCerrar: () => void): Presencia {
  const [saliendo, setSaliendo] = useState(false)
  const callback = useRef(alCerrar)
  const pedido = useRef(false)
  const terminado = useRef(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    callback.current = alCerrar
  }, [alCerrar])

  const terminar = useCallback(() => {
    if (terminado.current) return
    terminado.current = true
    clearTimeout(temporizador.current)
    temporizador.current = undefined
    callback.current()
  }, [])

  const salir = useCallback(() => {
    if (pedido.current) return
    pedido.current = true
    if (cierreInmediato()) {
      terminar()
      return
    }
    setSaliendo(true)
    temporizador.current = setTimeout(terminar, RESPALDO_CIERRE_MS)
  }, [terminar])

  const alTerminarAnimacion = useCallback(() => {
    if (pedido.current) terminar()
  }, [terminar])

  // Desmontada a mitad de la salida (se navegó): nada queda pendiente.
  useEffect(
    () => {
      // StrictMode ensaya setup → cleanup → setup conservando los refs.
      // El segundo montaje sigue vivo y debe poder terminar el cierre.
      terminado.current = false
      return () => {
        terminado.current = true
        clearTimeout(temporizador.current)
      }
    },
    [],
  )

  return { saliendo, salir, alTerminarAnimacion }
}
