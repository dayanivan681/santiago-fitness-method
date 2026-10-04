/**
 * Orden y agrupación de las alternativas equivalentes (§16, §23).
 *
 * Con la Biblioteca Maestra un movimiento puede tener 16 variantes: sin orden,
 * la ficha era una nube de nombres. Aquí se decide qué va primero —lo que la
 * persona ya conoce, luego lo que tiene a mano en el mismo equipo— y cómo se
 * agrupa el resto para leerlo en el teléfono.
 */

import type { Ejercicio, Equipo } from '../dominio/tipos'

/**
 * De más a menos relevante: las ya entrenadas (si se conoce el historial), las
 * del mismo equipo que `ejercicio` y el resto, cada tramo por nombre.
 */
export function ordenarAlternativas(
  ejercicio: Ejercicio,
  alternativas: readonly Ejercicio[],
  entrenadas?: ReadonlySet<string>,
): Ejercicio[] {
  const tramo = (otra: Ejercicio) => {
    if (entrenadas?.has(otra.id)) return 0
    return otra.equipo === ejercicio.equipo ? 1 : 2
  }
  return [...alternativas].sort(
    (a, b) => tramo(a) - tramo(b) || a.nombre.localeCompare(b.nombre, 'es'),
  )
}

/** Grupos por equipo en el orden en que aparece cada equipo en la lista. */
export function agruparPorEquipo(
  alternativas: readonly Ejercicio[],
): (readonly [Equipo, readonly Ejercicio[]])[] {
  const grupos = new Map<Equipo, readonly Ejercicio[]>()
  for (const alternativa of alternativas) {
    grupos.set(alternativa.equipo, [...(grupos.get(alternativa.equipo) ?? []), alternativa])
  }
  return [...grupos.entries()]
}
