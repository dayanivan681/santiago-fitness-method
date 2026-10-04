/**
 * Qué ejercicios ha entrenado ya el participante, para poner delante las
 * alternativas que conoce. Sin participante (Biblioteca sin nadie entrenando)
 * no se consulta nada.
 */

import { useLiveQuery } from '../nube/eventos'
import type { Repositorio } from '../datos/repositorio'

export function useEjerciciosEntrenados(
  repositorio: Repositorio | undefined,
  participanteId: string | undefined,
): ReadonlySet<string> | undefined {
  return useLiveQuery(async () => {
    if (!repositorio || !participanteId) return undefined
    return new Set(await repositorio.idsDeEjerciciosConHistorial(participanteId))
  }, [repositorio, participanteId])
}
