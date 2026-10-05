/**
 * Filtros de la Biblioteca, compartidos por el cliente y el coach.
 *
 * Con 336 ejercicios, explorar sin buscar necesita orden: sin músculo elegido
 * la lista se agrupa por músculo principal. Buscar manda sobre los filtros:
 * quien escribe «smith» quiere el Smith, no el Smith dentro de Pecho.
 */

import { NOMBRE_MUSCULO } from '../dominio/etiquetas'
import { coincide } from './busqueda'
import type { Ejercicio, Equipo, Musculo } from '../dominio/tipos'

export const TODOS = 'todos'
export type FiltroMusculo = Musculo | typeof TODOS
export type FiltroEquipo = Equipo | typeof TODOS

export interface FiltrosBiblioteca {
  readonly musculo: FiltroMusculo
  readonly equipo: FiltroEquipo
  /** Sólo en el coach: «Solo mis ejercicios». */
  readonly soloMios: boolean
}

export const SIN_FILTROS: FiltrosBiblioteca = { musculo: TODOS, equipo: TODOS, soloMios: false }

/** Cuántos filtros hay puestos, para «Filtrar · 2». */
export function cuantosFiltros(filtros: FiltrosBiblioteca): number {
  return [filtros.musculo !== TODOS, filtros.equipo !== TODOS, filtros.soloMios].filter(Boolean).length
}

export function aplicarFiltros(
  ejercicios: readonly Ejercicio[],
  filtros: FiltrosBiblioteca,
  esPropio: (ejercicio: Ejercicio) => boolean = () => false,
): Ejercicio[] {
  return ejercicios.filter(
    (e) =>
      (filtros.musculo === TODOS || e.musculoPrimario === filtros.musculo) &&
      (filtros.equipo === TODOS || e.equipo === filtros.equipo) &&
      (!filtros.soloMios || esPropio(e)),
  )
}

/** `termino` ya normalizado. Con algo escrito, los filtros quedan en pausa. */
export function visiblesDeBiblioteca(
  ejercicios: readonly Ejercicio[],
  termino: string,
  filtros: FiltrosBiblioteca,
  esPropio?: (ejercicio: Ejercicio) => boolean,
): Ejercicio[] {
  const lista = termino
    ? ejercicios.filter((e) => coincide(e, termino))
    : aplicarFiltros(ejercicios, filtros, esPropio)
  return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

/** Grupos por músculo principal, por nombre del músculo; dentro, el orden recibido. */
export function agruparPorMusculo(
  ejercicios: readonly Ejercicio[],
): (readonly [Musculo, readonly Ejercicio[]])[] {
  const grupos = new Map<Musculo, readonly Ejercicio[]>()
  for (const e of ejercicios) {
    grupos.set(e.musculoPrimario, [...(grupos.get(e.musculoPrimario) ?? []), e])
  }
  return [...grupos.entries()].sort(([a], [b]) =>
    NOMBRE_MUSCULO[a].localeCompare(NOMBRE_MUSCULO[b], 'es'),
  )
}
