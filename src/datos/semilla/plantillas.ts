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
  SENTADILLA_BARRA,
  PRENSA,
  CURL_FEMORAL_TUMBADO,
  PATADA_GLUTEO_POLEA,
  ELEVACION_TALONES_PIE,
  REMO_BARRA,
  PRESS_PECHO_CONVERGENTE,
  JALON_AGARRE_CERRADO,
  CURL_MANCUERNAS,
  EXTENSION_TRICEPS_POLEA,
  PESO_MUERTO_RUMANO,
  HACK_SQUAT,
  EXTENSION_CUADRICEPS,
  ELEVACION_TALONES_SENTADO,
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

/**
 * ESTIMADOS PENDIENTES DE CONFIRMAR.
 *
 * §28 deja los ejercicios exactos de estos tres días sin decidir. Venían vacíos
 * por no inventar nada, pero el resultado es que tres de cada cuatro días la app
 * abría diciendo "todavía no tiene ejercicios definidos" — que se lee como una
 * app rota, no como una decisión pendiente.
 *
 * Se rellenan con una propuesta siguiendo la estructura de §4 —fuerza, tres de
 * hipertrofia y una de resistencia— usando ejercicios que ya están en la
 * biblioteca. **El coach los cambia desde la pantalla Coach en cualquier
 * momento**, que es exactamente lo que §23 pide poder hacer.
 */
export const LOWER_A: PlantillaSinDueno = {
  id: 'lower-a',
  nombre: 'Lower A',
  orden: 2,
  slots: [
    crearSlot(1, SENTADILLA_BARRA.id, 'fuerza', 4),
    crearSlot(2, PRENSA.id, 'hipertrofia', 3),
    crearSlot(3, CURL_FEMORAL_TUMBADO.id, 'hipertrofia', 3),
    crearSlot(4, PATADA_GLUTEO_POLEA.id, 'hipertrofia', 3),
    crearSlot(5, ELEVACION_TALONES_PIE.id, 'resistencia', 3),
  ],
}

export const UPPER_B: PlantillaSinDueno = {
  id: 'upper-b',
  nombre: 'Upper B',
  orden: 3,
  slots: [
    // Empieza por tracción: Upper A ya carga el empuje en la posición de fuerza.
    crearSlot(1, REMO_BARRA.id, 'fuerza', 4),
    crearSlot(2, PRESS_PECHO_CONVERGENTE.id, 'hipertrofia', 3),
    crearSlot(3, JALON_AGARRE_CERRADO.id, 'hipertrofia', 3),
    crearSlot(4, CURL_MANCUERNAS.id, 'hipertrofia', 3),
    crearSlot(5, EXTENSION_TRICEPS_POLEA.id, 'resistencia', 3),
  ],
}

export const LOWER_B: PlantillaSinDueno = {
  id: 'lower-b',
  nombre: 'Lower B',
  orden: 4,
  slots: [
    // Bisagra de cadera, para no repetir la sentadilla de Lower A.
    crearSlot(1, PESO_MUERTO_RUMANO.id, 'fuerza', 4),
    crearSlot(2, HACK_SQUAT.id, 'hipertrofia', 3),
    crearSlot(3, HIP_THRUST_BARRA.id, 'hipertrofia', 3),
    crearSlot(4, EXTENSION_CUADRICEPS.id, 'hipertrofia', 3),
    crearSlot(5, ELEVACION_TALONES_SENTADO.id, 'resistencia', 3),
  ],
}

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
