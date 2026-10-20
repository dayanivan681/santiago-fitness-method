/**
 * Edición de las plantillas de día.
 * Guía del proyecto §4 (estructura sugerida), §23 (el coach reemplaza
 * ejercicios), §28 (los días que faltan por definir).
 *
 * Todo devuelve una plantilla nueva: editar nunca muta la existente.
 */

import {
  DESCANSO_POR_DEFECTO_SEGUNDOS,
  RANGO_POR_ESTIMULO,
  estimuloSugerido,
  type Estimulo,
  type RangoReps,
} from '../dominio/estimulo'
import type { PlantillaDia, SlotPlantilla } from '../dominio/tipos'
import { MAX_BLOQUES, puedeAnadir } from '../../shared/superseries'

/**
 * El cliente pide sesiones de 5 a 8 ejercicios: la estructura de §4 orienta,
 * pero no puede ser un tope técnico. Ocho es el máximo que él fija.
 */
/**
 * Tope de ejercicios sueltos: 8 bloques. Con bi-series o tri-series una sesión
 * llega a 12 ejercicios (`shared/superseries`), y `anadirSlot` aplica las dos.
 */
export const MAX_EJERCICIOS_POR_DIA = MAX_BLOQUES

/** Crea un slot con los valores por defecto de su estímulo (§10–12). */
export function crearSlot(
  orden: number,
  ejercicioId: string,
  estimulo: Estimulo,
  seriesObjetivo: number,
): SlotPlantilla {
  const rango = RANGO_POR_ESTIMULO[estimulo]
  return {
    orden,
    ejercicioId,
    estimulo,
    seriesObjetivo,
    repMin: rango.min,
    repMax: rango.max,
    descansoSegundos: DESCANSO_POR_DEFECTO_SEGUNDOS[estimulo],
  }
}

/**
 * §23: "Cambiar un ejercicio no debe destruir la estructura del entrenamiento."
 * Sólo se toca el ejercicio; series, rango, estímulo y descanso siguen igual.
 *
 * El historial tampoco se mezcla: el ejercicio nuevo trae el suyo propio (§16).
 */
export function reemplazarEjercicio(
  plantilla: PlantillaDia,
  orden: number,
  nuevoEjercicioId: string,
): PlantillaDia {
  return actualizarSlot(plantilla, orden, { ejercicioId: nuevoEjercicioId })
}

/** Ajustes finos del coach: series, rango de reps, descanso o estímulo (§23). */
export function actualizarSlot(
  plantilla: PlantillaDia,
  orden: number,
  cambios: Partial<Omit<SlotPlantilla, 'orden'>>,
): PlantillaDia {
  if (!plantilla.slots.some((slot) => slot.orden === orden)) {
    throw new Error(`La posición ${orden} no existe en ${plantilla.nombre}`)
  }

  return {
    ...plantilla,
    slots: plantilla.slots.map((slot) =>
      slot.orden === orden ? {
        ...slot,
        ...(cambios.ejercicioId && cambios.ejercicioId !== slot.ejercicioId ? { pesoSugeridoLb: undefined } : {}),
        ...cambios, orden: slot.orden,
      } : slot,
    ),
  }
}

/**
 * Añade un ejercicio al final del día. El estímulo sale de la posición según §4
 * —y de `ESTIMULO_POR_DEFECTO` a partir de la sexta—, que es lo que permite
 * llenar los días (§28) sin que el coach tenga que acordarse de la estructura.
 * Siempre puede cambiarlo después.
 */
export function anadirSlot(plantilla: PlantillaDia, ejercicioId: string): PlantillaDia {
  if (!puedeAnadir(plantilla.slots)) {
    throw new Error(
      `${plantilla.nombre} ya tiene el máximo de ${MAX_EJERCICIOS_POR_DIA} ejercicios`,
    )
  }

  const orden = plantilla.slots.length + 1
  const estimulo = estimuloSugerido(orden)
  const seriesPorDefecto = estimulo === 'fuerza' ? 4 : 3

  return {
    ...plantilla,
    slots: [...plantilla.slots, crearSlot(orden, ejercicioId, estimulo, seriesPorDefecto)],
  }
}

/**
 * Rango de repeticiones con el que se está entrenando un ejercicio, buscándolo
 * en las plantillas. Lo necesita el historial (§18) para saber cuál es la mejor
 * referencia, porque el comparador depende del rango (§10–12).
 *
 * Si el ejercicio ya no está en ninguna plantilla — el coach pudo sustituirlo
 * (§23) — se recurre al rango de hipertrofia, que es el que cubre el grueso de
 * la estructura de §4.
 */
export function rangoDeEjercicio(
  plantillas: readonly PlantillaDia[],
  ejercicioId: string,
): RangoReps {
  for (const plantilla of plantillas) {
    const slot = plantilla.slots.find((s) => s.ejercicioId === ejercicioId)
    if (slot) return { min: slot.repMin, max: slot.repMax }
  }
  return RANGO_POR_ESTIMULO.hipertrofia
}
