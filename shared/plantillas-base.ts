/**
 * Fuente canónica de las cuatro plantillas actuales del piloto.
 *
 * Este módulo no depende ni de React ni de Cloudflare: lo consumen tanto la
 * semilla local (Dexie) como la frontera cloud (D1). Mantener los datos aquí
 * evita que el coach y el participante reciban programaciones distintas.
 */

export type EstimuloBase = 'fuerza' | 'hipertrofia' | 'resistencia'

export type SlotBase = {
  readonly orden: number
  readonly ejercicioId: string
  readonly estimulo: EstimuloBase
  readonly seriesObjetivo: number
  readonly repMin: number
  readonly repMax: number
  readonly descansoSegundos: number
}

export type PlantillaBase = {
  readonly slug: 'upper-a' | 'lower-a' | 'upper-b' | 'lower-b'
  readonly nombre: 'Upper A' | 'Lower A' | 'Upper B' | 'Lower B'
  readonly orden: 1 | 2 | 3 | 4
  readonly slots: readonly SlotBase[]
}

const POR_ESTIMULO: Readonly<
  Record<EstimuloBase, Omit<SlotBase, 'orden' | 'ejercicioId' | 'estimulo'>>
> = {
  fuerza: { seriesObjetivo: 4, repMin: 1, repMax: 5, descansoSegundos: 180 },
  hipertrofia: { seriesObjetivo: 3, repMin: 6, repMax: 15, descansoSegundos: 120 },
  resistencia: { seriesObjetivo: 3, repMin: 15, repMax: 20, descansoSegundos: 60 },
}

function slot(orden: number, ejercicioId: string, estimulo: EstimuloBase): SlotBase {
  return { orden, ejercicioId, estimulo, ...POR_ESTIMULO[estimulo] }
}

export const PLANTILLAS_BASE: readonly PlantillaBase[] = [
  {
    slug: 'upper-a',
    nombre: 'Upper A',
    orden: 1,
    slots: [
      slot(1, 'press-banca-15-smith', 'fuerza'),
      slot(2, 'press-inclinado-convergente', 'hipertrofia'),
      slot(3, 'lat-pulldown-maquina', 'hipertrofia'),
      slot(4, 'hip-thrust-barra', 'hipertrofia'),
      slot(5, 'elevacion-lateral-mancuernas', 'resistencia'),
    ],
  },
  {
    slug: 'lower-a',
    nombre: 'Lower A',
    orden: 2,
    slots: [
      slot(1, 'sentadilla-barra', 'fuerza'),
      slot(2, 'prensa', 'hipertrofia'),
      slot(3, 'curl-femoral-tumbado', 'hipertrofia'),
      slot(4, 'patada-gluteo-polea', 'hipertrofia'),
      slot(5, 'elevacion-talones-pie', 'resistencia'),
    ],
  },
  {
    slug: 'upper-b',
    nombre: 'Upper B',
    orden: 3,
    slots: [
      slot(1, 'remo-barra', 'fuerza'),
      slot(2, 'press-pecho-convergente', 'hipertrofia'),
      slot(3, 'jalon-agarre-cerrado', 'hipertrofia'),
      slot(4, 'curl-mancuernas', 'hipertrofia'),
      slot(5, 'extension-triceps-polea', 'resistencia'),
    ],
  },
  {
    slug: 'lower-b',
    nombre: 'Lower B',
    orden: 4,
    slots: [
      slot(1, 'peso-muerto-rumano', 'fuerza'),
      slot(2, 'hack-squat', 'hipertrofia'),
      slot(3, 'hip-thrust-barra', 'hipertrofia'),
      slot(4, 'extension-cuadriceps', 'hipertrofia'),
      slot(5, 'elevacion-talones-sentado', 'resistencia'),
    ],
  },
]
