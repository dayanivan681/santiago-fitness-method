/**
 * Sustituciones del día.
 * Guía del proyecto §23 (el participante elige la variante asignada sin
 * destruir la estructura) y §16 (cada variante conserva su historial).
 *
 * El cliente distingue dos cosas que antes eran una sola: cambiar de variante
 * **hoy**, porque la máquina está ocupada, y **fijar** otra variante en la
 * plantilla. Lo primero es lo habitual y no debe tocar la plantilla.
 */

import type { PlantillaDia, Sustitucion } from '../dominio/tipos'

/**
 * Identidad de una sustitución: participante + fecha + día + posición.
 *
 * No entra el ejercicio elegido a propósito. Así, cambiar de opinión dos veces
 * en la misma sesión pisa la sustitución anterior en vez de acumular dos.
 *
 * El participante sí entra: sin él, dos personas entrenando el mismo día
 * compartirían el cambio de máquina.
 */
export function idSustitucion(
  participanteId: string,
  fecha: string,
  plantillaDiaId: string,
  orden: number,
): string {
  return `${participanteId}|${fecha}|${plantillaDiaId}|${orden}`
}

/** La plantilla tal y como se entrena hoy. No modifica la guardada. */
export function aplicarSustituciones(
  plantilla: PlantillaDia,
  sustituciones: readonly Sustitucion[],
): PlantillaDia {
  const delDia = sustituciones.filter((s) => s.plantillaDiaId === plantilla.id)
  if (delDia.length === 0) return plantilla

  const ejercicioPorOrden = new Map(delDia.map((s) => [s.orden, s.ejercicioId]))

  return {
    ...plantilla,
    // Sólo cambia el ejercicio: series, rango, estímulo y descanso se quedan (§23).
    slots: plantilla.slots.map((slot) => {
      const ejercicioId = ejercicioPorOrden.get(slot.orden)
      return ejercicioId ? { ...slot, ejercicioId } : slot
    }),
  }
}
