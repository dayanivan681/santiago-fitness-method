/**
 * Cómo se nombran en pantalla los conceptos del método.
 *
 * Viven juntas y en el dominio porque las usan varias pantallas: la biblioteca,
 * la hoja de variantes, la tarjeta del ejercicio y el volumen semanal. Tenerlas
 * repetidas en cada una hacía que se fueran separando entre sí.
 */

import type { TipoCarga } from './carga'
import type { Musculo } from './tipos'

/** §17: cómo se interpreta el número que teclea el participante. */
export const ETIQUETA_CARGA: Readonly<Record<TipoCarga, string>> = {
  total: 'Carga total',
  porLado: 'Carga por lado',
  discosAnadidos: 'Discos añadidos',
  pesoMaquina: 'Peso de máquina',
}

/** §20–21: los músculos con objetivo y los que reciben trabajo indirecto. */
export const NOMBRE_MUSCULO: Readonly<Record<Musculo, string>> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  cuadriceps: 'Cuádriceps',
  gluteos: 'Glúteos',
  femoral: 'Femoral',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  deltoideLateral: 'Deltoide lateral',
  deltoideAnterior: 'Deltoide anterior',
  deltoidePosterior: 'Deltoide posterior',
  pantorrillas: 'Pantorrillas',
  core: 'Core',
}
