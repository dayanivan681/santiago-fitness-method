/**
 * Limitaciones del perfil conectadas con la programación.
 *
 * El cliente lo resume así: *"una limitación no debe ser sólo texto"*. Si el
 * perfil dice evitar un ejercicio, la app tiene que avisar al asignarlo y
 * proponer alternativas equivalentes.
 *
 * El texto libre de §2 se queda —es donde se explica el porqué—, y junto a él
 * va la lista de ejercicios concretos, que es la parte que la app puede
 * comprobar.
 */

import type { Ejercicio, Participante } from '../dominio/tipos'

/** ¿El perfil dice evitar este ejercicio? */
export function debeEvitarse(ejercicioId: string, participante: Participante): boolean {
  return (participante.ejerciciosEvitados ?? []).includes(ejercicioId)
}

/**
 * Alternativas equivalentes a un ejercicio: mismo patrón de movimiento (§16) y
 * permitidas por el perfil. Proponer otra que también está prohibida sería
 * peor que no proponer nada.
 */
export function alternativasEquivalentes(
  ejercicio: Ejercicio,
  biblioteca: readonly Ejercicio[],
  participante: Participante,
): readonly Ejercicio[] {
  return biblioteca.filter(
    (otro) =>
      otro.movimiento === ejercicio.movimiento &&
      otro.id !== ejercicio.id &&
      !debeEvitarse(otro.id, participante),
  )
}

/** Añade un ejercicio a la lista de evitados. Devuelve un perfil nuevo (§2). */
export function evitar(participante: Participante, ejercicioId: string): Participante {
  if (debeEvitarse(ejercicioId, participante)) return participante

  return {
    ...participante,
    ejerciciosEvitados: [...(participante.ejerciciosEvitados ?? []), ejercicioId],
  }
}

export function dejarDeEvitar(
  participante: Participante,
  ejercicioId: string,
): Participante {
  return {
    ...participante,
    ejerciciosEvitados: (participante.ejerciciosEvitados ?? []).filter(
      (id) => id !== ejercicioId,
    ),
  }
}
