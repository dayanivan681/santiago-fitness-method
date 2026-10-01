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

/**
 * Escala del eje vertical ajustada a los valores, no desde 0: pasar de 25 a
 * 30 lb tiene que verse como una subida. Un paso de margen arriba y abajo,
 * redondeada a `paso`, con al menos `rangoMinimo` de alto y nunca negativa.
 */
export function escalaDe(valores: readonly number[], paso: number, rangoMinimo: number): { min: number; max: number } {
  const bajo = Math.min(...valores) - paso
  const alto = Math.max(...valores) + paso
  const centro = (bajo + alto) / 2
  const [lo, hi] = alto - bajo < rangoMinimo ? [centro - rangoMinimo / 2, centro + rangoMinimo / 2] : [bajo, alto]
  const min = Math.max(0, Math.floor(lo / paso) * paso)
  return { min, max: Math.max(min + rangoMinimo, Math.ceil(hi / paso) * paso) }
}

/** El ejercicio de la serie más reciente: es el que la persona quiere ver al abrir su progreso. */
export function ejercicioMasReciente(
  series: readonly { readonly ejercicioId: string; readonly fecha: string; readonly numeroSerie: number; readonly instante?: string }[],
): string | undefined {
  const clave = (x: (typeof series)[number]) => `${x.fecha}|${x.instante ?? ''}|${String(x.numeroSerie).padStart(4, '0')}`
  return series.reduce<(typeof series)[number] | undefined>((mejor, x) => (!mejor || clave(x) > clave(mejor) ? x : mejor), undefined)
    ?.ejercicioId
}
