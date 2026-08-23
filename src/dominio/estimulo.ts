/**
 * Estímulos de entrenamiento y sus rangos de repeticiones.
 * Guía del proyecto §4 (estructura de los 5 ejercicios) y §10–12 (lógica por estímulo).
 */

export type Estimulo = 'fuerza' | 'hipertrofia' | 'resistencia'

export interface RangoReps {
  readonly min: number
  readonly max: number
}

/**
 * Estructura sugerida de la sesión, por posición.
 * Ejercicio 1 fuerza · 2, 3 y 4 hipertrofia · 5 resistencia (§4).
 *
 * Es una **plantilla, no un límite**: el análisis del cliente pide sesiones de 5
 * a 8 ejercicios sin que la estructura las frene. Las posiciones que no estén
 * aquí toman `ESTIMULO_POR_DEFECTO`, y el coach cambia cualquiera (§23).
 */
export const ESTIMULO_POR_POSICION: readonly Estimulo[] = [
  'fuerza',
  'hipertrofia',
  'hipertrofia',
  'hipertrofia',
  'resistencia',
]

/** Para las posiciones más allá de la estructura sugerida (6 a 8). */
export const ESTIMULO_POR_DEFECTO: Estimulo = 'hipertrofia'

/**
 * Estímulo sugerido para una posición. Nunca falla: fuera de la estructura
 * devuelve el valor por defecto en vez de dejar el slot sin estímulo.
 */
export function estimuloSugerido(orden: number): Estimulo {
  return ESTIMULO_POR_POSICION[orden - 1] ?? ESTIMULO_POR_DEFECTO
}

/**
 * Rangos por defecto al crear un slot. §10 fuerza 1–5 · §11 hipertrofia 6–15 ·
 * §12 resistencia "generalmente 15+". El coach puede ajustarlos por slot (§23),
 * por eso son un punto de partida y no una constante rígida.
 */
export const RANGO_POR_ESTIMULO: Readonly<Record<Estimulo, RangoReps>> = {
  fuerza: { min: 1, max: 5 },
  hipertrofia: { min: 6, max: 15 },
  resistencia: { min: 15, max: 20 },
}

/** §12: la resistencia usa descansos más cortos. Valores de arranque, editables. */
export const DESCANSO_POR_DEFECTO_SEGUNDOS: Readonly<Record<Estimulo, number>> = {
  fuerza: 180,
  hipertrofia: 120,
  resistencia: 60,
}
