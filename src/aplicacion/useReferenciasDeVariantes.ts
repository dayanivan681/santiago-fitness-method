/**
 * Última referencia de cada variante, para la hoja de cambio.
 * Guía del proyecto §16: cada variante conserva su propio historial. Verlo al
 * elegir es lo que hace útil el cambio — si no, se elige a ciegas.
 *
 * Se consulta sólo al abrir la hoja: cargarlo para las cinco tarjetas del día
 * serían decenas de lecturas que nadie mira.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { derivarReferencias } from '../datos/referencias'
import type { Repositorio } from '../datos/repositorio'
import type { RangoReps } from '../dominio/estimulo'
import type { Ejercicio } from '../dominio/tipos'

export function useReferenciasDeVariantes(
  repositorio: Repositorio,
  variantes: readonly Ejercicio[],
  rango: RangoReps,
): ReadonlyMap<string, string> {
  const referencias = useLiveQuery(async () => {
    const pares = await Promise.all(
      variantes.map(async (variante) => {
        const historial = await repositorio.historialDeEjercicio(variante.id)
        const { ultimaSesion } = derivarReferencias(variante.id, historial, variante, rango)
        return [variante.id, describir(ultimaSesion[0], variante)] as const
      }),
    )
    return new Map(pares)
  }, [repositorio, variantes.map((v) => v.id).join(), rango.min, rango.max])

  return referencias ?? new Map()
}

function describir(
  serie: { readonly cargaTotalLb: number; readonly reps: number } | undefined,
  ejercicio: Ejercicio,
): string {
  if (!serie) return 'Sin historial'

  const base = ejercicio.pesoBaseMaquinaLb ?? 0
  const registrado =
    ejercicio.tipoCarga === 'porLado'
      ? (serie.cargaTotalLb - base) / 2
      : ejercicio.tipoCarga === 'discosAnadidos'
        ? serie.cargaTotalLb - base
        : serie.cargaTotalLb

  const peso = Math.round(registrado * 100) / 100
  return `${peso} lb × ${serie.reps}`
}
