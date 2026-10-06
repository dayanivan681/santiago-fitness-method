/**
 * Animaciones del catálogo base: dos fotogramas de free-exercise-db (dominio
 * público bajo Unlicense) con corte seco, en `public/ejercicios/animaciones/`.
 * Procedencia de cada una en public/ejercicios/PROCEDENCIA.md.
 *
 * Sólo ejercicios cuyo movimiento coincide con la ficha. 11 unilaterales con
 * foto generada no tienen equivalente libre fiel y siguen con la foto fija:
 * una animación de otra variante enseñaría un ejercicio distinto.
 *
 * Igual que los GIF del coach, sólo se reproducen en la ficha. Listas, Hoy y
 * miniaturas siguen con `imagen`, que funciona sin conexión.
 */

import type { Ejercicio } from '../../../dominio/tipos'

export const RUTA_ANIMACIONES_BASE = '/ejercicios/animaciones/'

export const IDS_CON_ANIMACION_BASE: ReadonlySet<string> = new Set([
  // Empuje
  'press-banca-15-smith',
  'press-inclinado-convergente',
  'press-banca-barra',
  'press-banca-mancuernas',
  'press-pecho-convergente',
  'pec-deck',
  'fondos-triceps',
  'extension-triceps-polea',
  'press-frances-barra-z',
  'elevacion-lateral-mancuernas',
  'elevacion-lateral-polea',
  // Tracción
  'lat-pulldown-maquina',
  'jalon-agarre-cerrado',
  'dominadas',
  'remo-barra',
  'remo-sentado-cable',
  'remo-mancuerna',
  'curl-barra',
  'curl-mancuernas',
  'curl-martillo',
  // Pierna
  'hip-thrust-barra',
  'sentadilla-barra',
  'prensa',
  'hack-squat',
  'extension-cuadriceps',
  'zancadas-mancuernas',
  'peso-muerto-rumano',
  'curl-femoral-tumbado',
  'curl-femoral-sentado',
  'patada-gluteo-polea',
  'abduccion-maquina',
  'elevacion-talones-pie',
  'elevacion-talones-sentado',
  // Ampliación unilateral
  'sfm-catalog-c191',
  'sfm-catalog-c196',
  'sfm-catalog-c037',
  'sfm-catalog-c103',
  'sfm-catalog-c154',
  'sfm-catalog-c165',
  'sfm-catalog-c162',
  'sfm-catalog-c056',
  'sfm-catalog-c137',
  'sfm-catalog-c142',
  'sfm-catalog-c071',
  'sfm-catalog-c256',
  // Kettlebell en vez de mancuerna, mismo patrón: aprobado por el dueño (2026-10-05).
  'sfm-catalog-c203',
])

/** La ficha con su animación, si el catálogo base tiene una validada. */
export function conAnimacionBase(ejercicio: Ejercicio): Ejercicio {
  return IDS_CON_ANIMACION_BASE.has(ejercicio.id)
    ? { ...ejercicio, animacion: `${RUTA_ANIMACIONES_BASE}${ejercicio.id}.gif` }
    : ejercicio
}

/** Las animaciones del catálogo son horizontales; las del coach, verticales 3:4. */
export const esAnimacionBase = (animacion: string): boolean => animacion.startsWith(RUTA_ANIMACIONES_BASE)
