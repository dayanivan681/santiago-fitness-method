/**
 * Última referencia de cada variante, para la hoja de cambio.
 * Guía del proyecto §16: cada variante conserva su propio historial. Verlo al
 * elegir es lo que hace útil el cambio — si no, se elige a ciegas.
 *
 * Se consulta sólo al abrir la hoja: cargarlo para las cinco tarjetas del día
 * serían decenas de lecturas que nadie mira.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { describirSerie } from '../logica/ultimaVez'
import { derivarReferencias } from '../datos/referencias'
import type { Repositorio } from '../datos/repositorio'
import type { RangoReps } from '../dominio/estimulo'
import type { Ejercicio } from '../dominio/tipos'

export function useReferenciasDeVariantes(
  repositorio: Repositorio,
  participanteId: string,
  variantes: readonly Ejercicio[],
  rango: RangoReps,
): ReadonlyMap<string, string> {
  const referencias = useLiveQuery(async () => {
    const pares = await Promise.all(
      variantes.map(async (variante) => {
        const historial = await repositorio.historialDeEjercicio(participanteId, variante.id)
        const { ultimaSesion } = derivarReferencias(variante.id, historial, variante, rango)
        const primera = ultimaSesion[0]
        return [
          variante.id,
          primera ? describirSerie(primera, variante) : 'Sin historial',
        ] as const
      }),
    )
    return new Map(pares)
  }, [repositorio, participanteId, variantes.map((v) => v.id).join(), rango.min, rango.max])

  return referencias ?? new Map()
}

