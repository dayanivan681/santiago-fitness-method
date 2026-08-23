/**
 * Historial por ejercicio.
 * Guía del proyecto §16 (cada variante el suyo), §18 (fecha, series, peso,
 * reps, RIR, descanso, mejor referencia y última sesión) y §19 (nada se pierde).
 */

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { derivarReferencias, type SerieConFecha } from '../datos/referencias'
import type { Repositorio } from '../datos/repositorio'
import { ID_PARTICIPANTE_PILOTO } from '../datos/semilla'
import { rangoDeEjercicio } from '../logica/plantilla'
import type { Ejercicio, ReferenciasEjercicio } from '../dominio/tipos'

export interface SesionDelHistorial {
  readonly fecha: string
  readonly series: readonly SerieConFecha[]
  /** Sin cerrar: se quedó a medias o se olvidó terminarla. */
  readonly sinTerminar: boolean
}

export interface DatosHistorial {
  /** Sólo los ejercicios que ya se han entrenado; el resto no tiene nada que contar. */
  readonly entrenados: readonly Ejercicio[]
  readonly ejercicio?: Ejercicio
  readonly referencias?: ReferenciasEjercicio
  /** Sesiones de más reciente a más antigua (§19: el historial se acumula). */
  readonly sesiones: readonly SesionDelHistorial[]
}

export function useHistorial(repositorio: Repositorio) {
  const [ejercicioIdElegido, elegirEjercicio] = useState<string | null>(null)

  const datos = useLiveQuery(async (): Promise<DatosHistorial> => {
    const [ids, ejercicios, plantillas] = await Promise.all([
      repositorio.idsDeEjerciciosConHistorial(),
      repositorio.listarEjercicios(),
      repositorio.listarPlantillas(),
    ])

    const entrenados = ejercicios
      .filter((ejercicio) => ids.includes(ejercicio.id))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

    const ejercicio =
      entrenados.find((e) => e.id === ejercicioIdElegido) ?? entrenados[0]
    if (!ejercicio) return { entrenados, sesiones: [] }

    const historial = await repositorio.historialDeEjercicio(ejercicio.id)
    const rango = rangoDeEjercicio(plantillas, ejercicio.id)
    const sesiones = await repositorio.listarSesiones(ID_PARTICIPANTE_PILOTO)
    const cerradas = new Set(
      sesiones.filter((s) => s.completadaEn).map((s) => s.fecha),
    )

    return {
      entrenados,
      ejercicio,
      referencias: derivarReferencias(ejercicio.id, historial, ejercicio, rango),
      sesiones: agruparPorFecha(historial, cerradas),
    }
  }, [repositorio, ejercicioIdElegido])

  return { datos, cargando: datos === undefined, elegirEjercicio }
}

/** §18: el historial se lee por sesiones, de la más reciente hacia atrás. */
function agruparPorFecha(
  historial: readonly SerieConFecha[],
  cerradas: ReadonlySet<string>,
): SesionDelHistorial[] {
  const porFecha = historial.reduce((mapa, serie) => {
    const previas = mapa.get(serie.fecha) ?? []
    return new Map(mapa).set(serie.fecha, [...previas, serie])
  }, new Map<string, SerieConFecha[]>())

  return [...porFecha.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, series]) => ({
      fecha,
      series: [...series].sort((a, b) => a.numeroSerie - b.numeroSerie),
      sinTerminar: !cerradas.has(fecha),
    }))
}
