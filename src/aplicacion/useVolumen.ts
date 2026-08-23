/**
 * Volumen semanal por músculo.
 * Guía del proyecto §20 (objetivos), §21 (directas vs indirectas), §22 (sexo).
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { fechaDeHoy, fechaHaceDias, type Repositorio } from '../datos/repositorio'
import { ID_PARTICIPANTE_PILOTO } from '../datos/semilla'
import {
  estadoVolumen,
  objetivoSemanal,
  seriesDirectasPorMusculo,
  seriesIndirectasPorMusculo,
  type EstadoVolumen,
} from '../logica/volumen'
import type { Musculo, Sexo } from '../dominio/tipos'
import type { RangoReps } from '../dominio/estimulo'

/**
 * Ventana móvil de 7 días. §20 habla de volumen semanal; contar los últimos
 * siete días evita que el lunes por la mañana el panel aparezca vacío.
 */
export const DIAS_DE_LA_VENTANA = 7

/** Orden en el que §20 enumera los músculos con objetivo. */
const MUSCULOS_CON_OBJETIVO: readonly Musculo[] = [
  'pecho',
  'espalda',
  'cuadriceps',
  'gluteos',
  'femoral',
  'biceps',
  'triceps',
  'deltoideLateral',
]

export const NOMBRE_MUSCULO: Readonly<Record<Musculo, string>> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  cuadriceps: 'Cuádriceps',
  gluteos: 'Glúteos',
  femoral: 'Femoral',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  deltoideLateral: 'Deltoide lateral',
  deltoideAnterior: 'Deltoide anterior',
  deltoidePosterior: 'Deltoide posterior',
  pantorrillas: 'Pantorrillas',
  core: 'Core',
}

export interface FilaVolumen {
  readonly musculo: Musculo
  readonly directas: number
  readonly indirectas: number
  readonly objetivo?: RangoReps
  readonly estado: EstadoVolumen
}

export interface DatosVolumen {
  readonly sexo: Sexo
  readonly desde: string
  readonly hasta: string
  readonly conObjetivo: readonly FilaVolumen[]
  /** Trabajo que no cuenta contra ningún objetivo pero conviene ver (§21). */
  readonly otros: readonly FilaVolumen[]
  readonly totalSeries: number
}

export function useVolumen(repositorio: Repositorio) {
  const datos = useLiveQuery(async (): Promise<DatosVolumen | null> => {
    const desde = fechaHaceDias(DIAS_DE_LA_VENTANA - 1)
    const hasta = fechaDeHoy()

    const [participante, ejercicios, series] = await Promise.all([
      repositorio.obtenerParticipante(ID_PARTICIPANTE_PILOTO),
      repositorio.listarEjercicios(),
      repositorio.seriesEntreFechas(desde, hasta),
    ])
    if (!participante) return null

    const biblioteca = new Map(ejercicios.map((ejercicio) => [ejercicio.id, ejercicio]))
    const directas = seriesDirectasPorMusculo(series, biblioteca)
    const indirectas = seriesIndirectasPorMusculo(series, biblioteca)

    const fila = (musculo: Musculo): FilaVolumen => ({
      musculo,
      directas: directas[musculo] ?? 0,
      indirectas: indirectas[musculo] ?? 0,
      objetivo: objetivoSemanal(participante.sexo, musculo),
      estado: estadoVolumen(participante.sexo, musculo, directas[musculo] ?? 0),
    })

    const otrosMusculos = [
      ...new Set([...Object.keys(directas), ...Object.keys(indirectas)] as Musculo[]),
    ].filter((musculo) => !MUSCULOS_CON_OBJETIVO.includes(musculo))

    return {
      sexo: participante.sexo,
      desde,
      hasta,
      conObjetivo: MUSCULOS_CON_OBJETIVO.map(fila),
      otros: otrosMusculos.map(fila).sort((a, b) => b.directas - a.directas),
      totalSeries: series.length,
    }
  }, [repositorio])

  return { datos, cargando: datos === undefined }
}
