import type { SesionDelHistorial } from '../aplicacion/useHistorial'
import { aComparable } from '../dominio/serie'
import { esEfectiva, type Ejercicio } from '../dominio/tipos'

export interface PuntoProgreso {
  readonly fecha: string
  readonly pesoLb: number
  readonly porLado: boolean
  readonly reps: number
  readonly rir: number
}

/** Una mejor serie efectiva por sesión, con los valores vigentes tras correcciones. */
export function puntosDeProgreso(sesiones: readonly SesionDelHistorial[], ejercicio: Ejercicio): PuntoProgreso[] {
  return [...sesiones].sort((a, b) => a.fecha.localeCompare(b.fecha)).flatMap(sesion => {
    const mejor = sesion.series.filter(esEfectiva).reduce<typeof sesion.series[number] | undefined>((actual, serie) => {
      if (!actual) return serie
      const a = aComparable(actual, ejercicio)
      const b = aComparable(serie, ejercicio)
      return b.cargaTotalLb > a.cargaTotalLb || (b.cargaTotalLb === a.cargaTotalLb && b.reps > a.reps) ? serie : actual
    }, undefined)
    return mejor ? [{ fecha: sesion.fecha, pesoLb: mejor.pesoRegistradoLb, porLado: ejercicio.tipoCarga === 'porLado', reps: mejor.repsRealizadas, rir: mejor.rir }] : []
  })
}

export function resumenDeProgreso(puntos: readonly PuntoProgreso[]) {
  const primero = puntos[0]
  const ultimo = puntos.at(-1)
  if (!primero || !ultimo) return null
  return { primero, ultimo, diferenciaPeso: ultimo.pesoLb - primero.pesoLb, diferenciaReps: ultimo.reps - primero.reps }
}
