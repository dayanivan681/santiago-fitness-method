/**
 * Cómo se nombran en pantalla los conceptos del método.
 *
 * Viven juntas y en el dominio porque las usan varias pantallas: la biblioteca,
 * la hoja de variantes, la tarjeta del ejercicio y el volumen semanal. Tenerlas
 * repetidas en cada una hacía que se fueran separando entre sí.
 */

import type { TipoCarga } from './carga'
import type { Equipo, Musculo } from './tipos'

/** §17: cómo se interpreta el número que teclea el participante. */
export const ETIQUETA_CARGA: Readonly<Record<TipoCarga, string>> = {
  total: 'Carga total',
  porLado: 'Carga por lado',
  discosAnadidos: 'Discos añadidos',
  pesoMaquina: 'Peso de máquina',
}

/**
 * §20–21: los músculos con objetivo y los que reciben trabajo indirecto.
 *
 * Única fuente de textos: el panel del coach (`producto/etiquetasBiblioteca.ts`)
 * los reexporta. Antes cada lado tenía los suyos y Santiago veía «Hombro
 * (frontal)» en su panel y «Deltoide anterior» en la app del cliente.
 */
export const NOMBRE_MUSCULO: Readonly<Record<Musculo, string>> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  cuadriceps: 'Cuádriceps',
  gluteos: 'Glúteos',
  femoral: 'Femorales',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  deltoideLateral: 'Hombro (lateral)',
  deltoideAnterior: 'Hombro (frontal)',
  deltoidePosterior: 'Hombro (trasero)',
  pantorrillas: 'Pantorrillas',
  core: 'Abdomen y core',
  aductores: 'Aductores',
}

/** §16: el equipo forma parte de la identidad del ejercicio, no es un adorno. */
export const ETIQUETA_EQUIPO: Readonly<Record<Equipo, string>> = {
  smith: 'Máquina Smith',
  convergente: 'Máquina convergente',
  cable: 'Polea / cable',
  mancuernas: 'Mancuernas',
  barraLibre: 'Barra libre',
  maquinaTradicional: 'Máquina de pila (selectorizada)',
  maquinaDiscos: 'Máquina de discos (plate-loaded)',
  pesoCorporal: 'Peso corporal',
}

/**
 * Cómo se lee el tipo de carga de un ejercicio concreto. En peso corporal
 * (y en dominadas o fondos, que la semilla guarda con barra) «discos añadidos»
 * es el lastre: chaleco, cinturón o mancuerna entre los pies.
 */
export function etiquetaCarga(tipoCarga: TipoCarga, equipo: Equipo): string {
  if (tipoCarga === 'discosAnadidos' && (equipo === 'pesoCorporal' || equipo === 'barraLibre')) return 'Lastre añadido'
  return ETIQUETA_CARGA[tipoCarga]
}

export function etiquetaEquipo(equipo: Equipo): string {
  return ETIQUETA_EQUIPO[equipo]
}
