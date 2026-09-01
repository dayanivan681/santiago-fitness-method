/**
 * El cronómetro de descanso, uno solo y para toda la app.
 *
 * Vive aquí y no dentro de `EntrenamientoHoy` porque el descanso no se detiene
 * cuando el participante mira la biblioteca o su historial entre serie y serie.
 * Al colgar de `App`, cambiar de pestaña no lo desmonta.
 *
 * Sólo hay un intervalo y un estado: arrancar otra vez sustituye al anterior,
 * así que no pueden coexistir dos cuentas atrás.
 *
 * El tiempo se recalcula siempre desde `terminaEn`; el intervalo únicamente
 * provoca el repintado. Además se recalcula al volver a primer plano, porque
 * los navegadores frenan los temporizadores en pestañas ocultas y el tick
 * podría llegar tarde.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ContextoDescanso,
  type ControlDescanso,
} from './contextoDescanso'
import {
  avanzarDescanso,
  DESCANSO_INACTIVO,
  iniciarDescanso,
  prorrogarDescanso,
  segundosRestantes,
  type EstadoDescanso,
} from '../logica/temporizador'

interface Props {
  readonly children: ReactNode
}

export function ProveedorDescanso({ children }: Props) {
  const [estado, setEstado] = useState<EstadoDescanso>(DESCANSO_INACTIVO)
  const [restantes, setRestantes] = useState(0)
  const [barraDeSesion, setBarraDeSesion] = useState(false)
  const intervalo = useRef<ReturnType<typeof setInterval> | null>(null)

  const detener = useCallback(() => {
    if (intervalo.current === null) return
    clearInterval(intervalo.current)
    intervalo.current = null
  }, [])

  // Un solo efecto gobierna el intervalo: se crea al activarse y se destruye al
  // apagarse o al desmontar. Sin esto, cerrar sesión dejaría un tick huérfano.
  useEffect(() => {
    if (estado.estado !== 'activo') {
      detener()
      return
    }

    const refrescar = () => {
      const ahora = Date.now()
      setRestantes(segundosRestantes(estado, ahora))
      setEstado((actual) => avanzarDescanso(actual, ahora))
    }

    refrescar()
    intervalo.current = setInterval(refrescar, 1000)

    // Volver de segundo plano: el tick pudo llegar tarde, así que se recalcula
    // en cuanto la pestaña vuelve a ser visible.
    document.addEventListener('visibilitychange', refrescar)

    return () => {
      detener()
      document.removeEventListener('visibilitychange', refrescar)
    }
  }, [estado, detener])

  const control = useMemo<ControlDescanso>(
    () => ({
      estado,
      restantes,
      arrancar: (ejercicioId, segundos) => {
        setEstado(iniciarDescanso(ejercicioId, segundos, Date.now()))
      },
      prorrogar: () => setEstado((actual) => prorrogarDescanso(actual, Date.now())),
      terminar: () => setEstado(DESCANSO_INACTIVO),
      barraDeSesion,
      declararBarraDeSesion: setBarraDeSesion,
    }),
    [estado, restantes, barraDeSesion],
  )

  return <ContextoDescanso.Provider value={control}>{children}</ContextoDescanso.Provider>
}
