import type { SesionDelHistorial } from '../aplicacion/useHistorial'
import { aComparable } from '../dominio/serie'
import { formatearRir } from '../dominio/rir'
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
  return {
    primero,
    ultimo,
    diferenciaPeso: ultimo.pesoLb - primero.pesoLb,
    diferenciaReps: ultimo.reps - primero.reps,
    // §7 «Por RIR»: una mejora sólo cuenta con un esfuerzo comparable.
    rirPrimero: primero.rir,
    rirUltimo: ultimo.rir,
  }
}

/**
 * Cómo cambió el esfuerzo entre la primera y la última sesión, para el titular.
 * Menos RIR al final es más esfuerzo; más RIR con más carga es la mejora clara.
 */
export function textoDeEsfuerzo(rirPrimero: number, rirUltimo: number): string {
  if (rirPrimero === rirUltimo) return `con el mismo esfuerzo (RIR ${formatearRir(rirUltimo)})`
  const tramo = `RIR ${formatearRir(rirPrimero)} → ${formatearRir(rirUltimo)}`
  return rirUltimo < rirPrimero ? `con más esfuerzo (${tramo})` : `con menos esfuerzo (${tramo})`
}

/** Más días que esto entre dos sesiones seguidas es una pausa que se marca. */
export const UMBRAL_HUECO_DIAS = 14
const MS_POR_DIA = 24 * 60 * 60 * 1000

export interface HuecoDeTiempo {
  /** Índices de los dos puntos que separa la pausa. */
  readonly desde: number
  readonly hasta: number
  readonly dias: number
  readonly semanas: number
  /** Corto, para la gráfica: «3 sem». */
  readonly texto: string
}

/** Días entre dos fechas ISO (YYYY-MM-DD), en UTC: sin saltos por horario de verano. */
function diasEntre(desde: string, hasta: string): number {
  return Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / MS_POR_DIA)
}

/**
 * Las pausas largas entre sesiones seguidas.
 *
 * Los puntos van separados por sesión, no por tiempo (así cada uno conserva su
 * zona táctil de 48 px), y entonces tres semanas sin entrenar no se verían.
 * Santiago razona por semanas: el hueco se marca y se nombra en semanas.
 */
export function huecosDeTiempo(puntos: readonly PuntoProgreso[], umbralDias = UMBRAL_HUECO_DIAS): HuecoDeTiempo[] {
  return puntos.slice(1).flatMap((punto, i) => {
    const dias = diasEntre(puntos[i].fecha, punto.fecha)
    if (dias <= umbralDias) return []
    const semanas = Math.round(dias / 7)
    return [{ desde: i, hasta: i + 1, dias, semanas, texto: `${semanas} sem` }]
  })
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
