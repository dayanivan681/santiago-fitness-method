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

/**
 * Versión de cada GIF en su URL: los primeros 8 caracteres de su sha256 (el mismo
 * de procedencia.json). `/ejercicios/*` se sirve `immutable`, así que reemplazar un
 * GIF sin cambiar su versión dejaría el viejo en los teléfonos; la prueba de
 * animaciones.test.ts compara cada versión con el archivo y falla si no coinciden.
 */
export const VERSION_ANIMACION_BASE: Readonly<Record<string, string>> = {
  'press-banca-15-smith': '3b881697',
  'press-inclinado-convergente': '261e27c1',
  'press-banca-barra': '2cb5af65',
  'press-banca-mancuernas': '40fceb99',
  'press-pecho-convergente': 'e7293987',
  'pec-deck': 'af73b294',
  'fondos-triceps': '4d4f224a',
  'extension-triceps-polea': '9654c95a',
  'press-frances-barra-z': 'cb61f7f8',
  'elevacion-lateral-mancuernas': '2c4ecd03',
  'elevacion-lateral-polea': 'e90963b5',
  'lat-pulldown-maquina': '1dfde621',
  'jalon-agarre-cerrado': 'ed09e863',
  'dominadas': '103186b7',
  'remo-barra': 'e46da9a1',
  'remo-sentado-cable': '72132ec5',
  'remo-mancuerna': 'a39196c6',
  'curl-barra': '16dc19aa',
  'curl-mancuernas': '4cd1cd85',
  'curl-martillo': '6e9560ae',
  'hip-thrust-barra': 'd5724ff9',
  'sentadilla-barra': '6a82eb7d',
  'prensa': '56ed9167',
  'hack-squat': '98244ca3',
  'extension-cuadriceps': 'f333e6e7',
  'zancadas-mancuernas': 'd34b3940',
  'peso-muerto-rumano': '463d3bdf',
  'curl-femoral-tumbado': '7b20e108',
  'curl-femoral-sentado': '863b9ea6',
  'patada-gluteo-polea': 'cd4cf1f8',
  'abduccion-maquina': '7232446e',
  'elevacion-talones-pie': '76f5d4ec',
  'elevacion-talones-sentado': 'c8d03689',
  'sfm-catalog-c191': '56ed9167',
  'sfm-catalog-c196': '900f47f0',
  'sfm-catalog-c037': '4de10652',
  'sfm-catalog-c103': '058a0e88',
  'sfm-catalog-c154': '17910126',
  'sfm-catalog-c165': 'ef09418c',
  'sfm-catalog-c162': '7806aca4',
  'sfm-catalog-c056': '5e9506e3',
  'sfm-catalog-c137': '3024c018',
  'sfm-catalog-c142': 'c959c48e',
  'sfm-catalog-c071': '54ff6889',
  'sfm-catalog-c256': '52b7c996',
  'sfm-catalog-c203': '555d39ec',
}

/** Avisos bajo la animación cuando muestra algo distinto de la ficha. */
export const NOTAS_ANIMACION_BASE: Readonly<Record<string, string>> = {
  'sfm-catalog-c203': 'La animación usa kettlebell; el ejercicio es el mismo con mancuerna.',
}

/** La ficha con su animación, si el catálogo base tiene una validada. */
export function conAnimacionBase(ejercicio: Ejercicio): Ejercicio {
  if (!IDS_CON_ANIMACION_BASE.has(ejercicio.id)) return ejercicio
  const nota = NOTAS_ANIMACION_BASE[ejercicio.id]
  return {
    ...ejercicio,
    animacion: `${RUTA_ANIMACIONES_BASE}${ejercicio.id}.gif?v=${VERSION_ANIMACION_BASE[ejercicio.id]}`,
    ...(nota ? { notaAnimacion: nota } : {}),
  }
}

/** Las animaciones del catálogo son horizontales; las del coach, verticales 3:4. */
export const esAnimacionBase = (animacion: string): boolean => animacion.startsWith(RUTA_ANIMACIONES_BASE)
