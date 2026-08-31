/**
 * Plantillas de los 4 días.
 * Guía del proyecto §28 (estructura actual) y §29 (Upper A).
 *
 * La definición de ejercicios vive en `shared/plantillas-base.ts`: es la misma
 * que usa D1 para que la semilla local y la programación cloud no diverjan.
 */

import type { PlantillaDia } from '../../dominio/tipos'
import { PLANTILLAS_BASE, type PlantillaBase } from '../../../shared/plantillas-base'

type PlantillaSinDueno = Omit<PlantillaDia, 'participanteId'>

function desdeBase(plantilla: PlantillaBase): PlantillaSinDueno {
  return {
    id: plantilla.slug,
    nombre: plantilla.nombre,
    orden: plantilla.orden,
    slots: plantilla.slots.map((slot) => ({ ...slot })),
  }
}

/** §29: Upper A tal como está definido hoy. Sin Military Press. */
export const UPPER_A = desdeBase(PLANTILLAS_BASE[0])

/** Estimados actuales pendientes de confirmación final del cliente. */
export const LOWER_A = desdeBase(PLANTILLAS_BASE[1])
export const UPPER_B = desdeBase(PLANTILLAS_BASE[2])
export const LOWER_B = desdeBase(PLANTILLAS_BASE[3])

/** §28: la estructura actual de 4 días. */
const SIN_DUENO: readonly PlantillaSinDueno[] = PLANTILLAS_BASE.map(desdeBase)

/**
 * Identificador del día de un participante.
 *
 * Lleva el participante dentro porque el id es la clave primaria: con un
 * `upper-a` a secas, dar de alta a la segunda persona sobrescribiría los días
 * de la primera.
 */
export function idDeDia(participanteId: string, dia: string): string {
  return `${participanteId}|${dia}`
}

/**
 * Los cuatro días de §28 para un participante concreto.
 *
 * Se crean al darlo de alta y no al arrancar la app: son *su* estructura, que
 * el coach ajustará para él (§23), no un catálogo compartido.
 */
export function plantillasIniciales(participanteId: string): readonly PlantillaDia[] {
  return SIN_DUENO.map((plantilla) => ({
    ...plantilla,
    participanteId,
    id: idDeDia(participanteId, plantilla.id),
  }))
}
