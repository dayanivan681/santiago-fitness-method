/**
 * El contrato del cronómetro y su contexto.
 *
 * Vive aparte del proveedor porque un fichero que exporta a la vez un
 * componente y funciones sueltas rompe el refresco en caliente. El componente
 * está en `ProveedorDescanso.tsx`; aquí sólo el tipo, el contexto y el hook.
 */

import { createContext, useContext } from 'react'
import { DESCANSO_INACTIVO, type EstadoDescanso } from '../logica/temporizador'

export interface ControlDescanso {
  readonly estado: EstadoDescanso
  readonly restantes: number
  /** Arranca el descanso de un ejercicio. Con cero segundos no hace nada. */
  readonly arrancar: (ejercicioId: string, segundos: number) => void
  readonly prorrogar: () => void
  readonly terminar: () => void
  /**
   * Si la barra de progreso de la sesión ocupa el hueco de abajo.
   *
   * El cronómetro y esa barra son los dos fijos al fondo; sin saberlo, uno se
   * comería al otro. Lo declara la pantalla de entrenamiento, que es la única
   * que sabe si hay una sesión abierta.
   */
  readonly barraDeSesion: boolean
  readonly declararBarraDeSesion: (visible: boolean) => void
}

/**
 * Control inerte por defecto.
 *
 * Un componente montado fuera del proveedor no debe reventar: simplemente no
 * hay cronómetro.
 */
export const CONTROL_INERTE: ControlDescanso = {
  estado: DESCANSO_INACTIVO,
  restantes: 0,
  arrancar: () => {},
  prorrogar: () => {},
  terminar: () => {},
  barraDeSesion: false,
  declararBarraDeSesion: () => {},
}

export const ContextoDescanso = createContext<ControlDescanso>(CONTROL_INERTE)

export function useControlDescanso(): ControlDescanso {
  return useContext(ContextoDescanso)
}
