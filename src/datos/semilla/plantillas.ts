/**
 * Plantillas de los 4 días.
 * Guía del proyecto §28 (estructura actual) y §29 (Upper A).
 *
 * §28 dice que los ejercicios exactos de cada día todavía deben confirmarse
 * antes de considerarlos plantilla fija. Por eso sólo Upper A viene cargado:
 * los otros tres días se crean vacíos y se llenan desde la pantalla Coach
 * durante el piloto, en vez de inventar ejercicios que nadie ha acordado.
 */

import { crearSlot } from '../../logica/plantilla'
import type { PlantillaDia } from '../../dominio/tipos'

type PlantillaSinDueno = Omit<PlantillaDia, 'participanteId'>
import {
  ELEVACION_LATERAL_MANCUERNAS,
  HIP_THRUST_BARRA,
  LAT_PULLDOWN,
  PRESS_BANCA_15_SMITH,
  PRESS_INCLINADO_CONVERGENTE,
} from './biblioteca'

/** §29: Upper A tal como está definido hoy. Sin Military Press. */
export const UPPER_A: PlantillaSinDueno = {
  id: 'upper-a',
  nombre: 'Upper A',
  orden: 1,
  slots: [
    crearSlot(1, PRESS_BANCA_15_SMITH.id, 'fuerza', 4),
    crearSlot(2, PRESS_INCLINADO_CONVERGENTE.id, 'hipertrofia', 3),
    crearSlot(3, LAT_PULLDOWN.id, 'hipertrofia', 3),
    crearSlot(4, HIP_THRUST_BARRA.id, 'hipertrofia', 3),
    crearSlot(5, ELEVACION_LATERAL_MANCUERNAS.id, 'resistencia', 3),
  ],
}

/** §28: pendientes de confirmar. Se completan desde la pantalla Coach. */
export const LOWER_A: PlantillaSinDueno = { id: 'lower-a', nombre: 'Lower A', orden: 2, slots: [] }
export const UPPER_B: PlantillaSinDueno = { id: 'upper-b', nombre: 'Upper B', orden: 3, slots: [] }
export const LOWER_B: PlantillaSinDueno = { id: 'lower-b', nombre: 'Lower B', orden: 4, slots: [] }

/** §28: la estructura actual de 4 días. */
const SIN_DUENO: readonly PlantillaSinDueno[] = [
  UPPER_A,
  LOWER_A,
  UPPER_B,
  LOWER_B,
]

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
