/**
 * Empuje: pecho, tríceps y deltoide lateral.
 * §16: cada variante es una fila propia y no comparte historial con las demás.
 */

import type { Ejercicio } from '../../../dominio/tipos'
import { nombreDe } from '../../../../shared/ejercicios-base'
import { BARRA_OLIMPICA, BARRA_Z, DISCOS_POR_LADO, MANCUERNAS, PESO_CORPORAL, STACK } from './cargas'

export const PRESS_BANCA_15_SMITH: Ejercicio = {
  id: 'press-banca-15-smith',
  movimiento: 'press-pecho',
  nombre: nombreDe('press-banca-15-smith'),
  equipo: 'smith',
  angulo: '15°',
  imagen: '/ejercicios/press-banca-15-smith.jpg',
  explicacionCorta:
    'Banco a 15°, barra guiada. Bajar controlado al pecho alto y empujar sin bloquear del todo.',
  musculoPrimario: 'pecho',
  musculosSecundarios: ['deltoideAnterior', 'triceps'],
  tipoCarga: 'porLado',
  pesoBaseMaquinaLb: 25, // estimado: barra del Smith, varía según modelo
  incrementoMinimoLb: 5, // estimado: discos de 2.5 lb por lado
}

export const PRESS_INCLINADO_CONVERGENTE: Ejercicio = {
  id: 'press-inclinado-convergente',
  movimiento: 'press-pecho',
  nombre: nombreDe('press-inclinado-convergente'),
  equipo: 'convergente',
  angulo: 'inclinado',
  imagen: '/ejercicios/press-inclinado-convergente.jpg',
  explicacionCorta:
    'Máquina convergente, agarre a la altura del pecho alto. Las manos se juntan al empujar.',
  musculoPrimario: 'pecho',
  musculosSecundarios: ['deltoideAnterior', 'triceps'],
  ...DISCOS_POR_LADO,
}

export const PRESS_BANCA_BARRA: Ejercicio = {
  id: 'press-banca-barra',
  movimiento: 'press-pecho',
  nombre: nombreDe('press-banca-barra'),
  equipo: 'barraLibre',
  angulo: 'plano',
  imagen: '/ejercicios/press-banca-barra.jpg',
  explicacionCorta: 'Banco plano, barra libre. Bajar al esternón y empujar en línea recta.',
  musculoPrimario: 'pecho',
  musculosSecundarios: ['deltoideAnterior', 'triceps'],
  ...BARRA_OLIMPICA,
}

export const PRESS_BANCA_MANCUERNAS: Ejercicio = {
  id: 'press-banca-mancuernas',
  movimiento: 'press-pecho',
  nombre: nombreDe('press-banca-mancuernas'),
  equipo: 'mancuernas',
  angulo: 'plano',
  imagen: '/ejercicios/press-banca-mancuernas.jpg',
  explicacionCorta: 'Banco plano. Más recorrido que con barra; controlar la bajada.',
  musculoPrimario: 'pecho',
  musculosSecundarios: ['deltoideAnterior', 'triceps'],
  ...MANCUERNAS,
}

export const PRESS_PECHO_CONVERGENTE: Ejercicio = {
  id: 'press-pecho-convergente',
  movimiento: 'press-pecho',
  nombre: nombreDe('press-pecho-convergente'),
  equipo: 'convergente',
  angulo: 'plano',
  imagen: '/ejercicios/press-pecho-convergente.jpg',
  explicacionCorta: 'Máquina de press a la altura del pecho medio, sentado y con espalda apoyada.',
  musculoPrimario: 'pecho',
  musculosSecundarios: ['deltoideAnterior', 'triceps'],
  ...DISCOS_POR_LADO,
}

export const PEC_DECK: Ejercicio = {
  id: 'pec-deck',
  movimiento: 'apertura-pecho',
  nombre: nombreDe('pec-deck'),
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/pec-deck.jpg',
  explicacionCorta: 'Aperturas sentado. Juntar los brazos al frente sin encoger los hombros.',
  musculoPrimario: 'pecho',
  musculosSecundarios: [],
  ...STACK,
}

export const FONDOS_TRICEPS: Ejercicio = {
  id: 'fondos-triceps',
  movimiento: 'extension-triceps',
  nombre: nombreDe('fondos-triceps'),
  equipo: 'barraLibre',
  imagen: '/ejercicios/fondos-triceps.jpg',
  explicacionCorta: 'Torso vertical y codos pegados para cargar el tríceps. Peso corporal o lastre.',
  musculoPrimario: 'triceps',
  musculosSecundarios: ['pecho', 'deltoideAnterior'],
  ...PESO_CORPORAL,
}

export const EXTENSION_TRICEPS_POLEA: Ejercicio = {
  id: 'extension-triceps-polea',
  movimiento: 'extension-triceps',
  nombre: nombreDe('extension-triceps-polea'),
  equipo: 'cable',
  imagen: '/ejercicios/extension-triceps-polea.jpg',
  explicacionCorta: 'Codos fijos al costado. Sólo se mueve el antebrazo.',
  musculoPrimario: 'triceps',
  musculosSecundarios: [],
  ...STACK,
}

export const PRESS_FRANCES: Ejercicio = {
  id: 'press-frances-barra-z',
  movimiento: 'extension-triceps',
  nombre: nombreDe('press-frances-barra-z'),
  equipo: 'barraLibre',
  imagen: '/ejercicios/press-frances.jpg',
  explicacionCorta: 'Tumbado, bajar la barra hacia la frente manteniendo los codos quietos.',
  musculoPrimario: 'triceps',
  musculosSecundarios: [],
  ...BARRA_Z,
}

export const ELEVACION_LATERAL_MANCUERNAS: Ejercicio = {
  id: 'elevacion-lateral-mancuernas',
  movimiento: 'elevacion-lateral',
  nombre: nombreDe('elevacion-lateral-mancuernas'),
  equipo: 'mancuernas',
  imagen: '/ejercicios/elevacion-lateral-mancuernas.jpg',
  explicacionCorta:
    'Subir los brazos a los lados hasta la altura del hombro, sin encoger el trapecio.',
  musculoPrimario: 'deltoideLateral',
  musculosSecundarios: [],
  ...MANCUERNAS,
}

export const ELEVACION_LATERAL_POLEA: Ejercicio = {
  id: 'elevacion-lateral-polea',
  movimiento: 'elevacion-lateral',
  nombre: nombreDe('elevacion-lateral-polea'),
  equipo: 'cable',
  imagen: '/ejercicios/elevacion-lateral-polea.jpg',
  explicacionCorta: 'Tensión constante en todo el recorrido, al contrario que con mancuernas.',
  musculoPrimario: 'deltoideLateral',
  musculosSecundarios: [],
  ...STACK,
}

export const EMPUJE: readonly Ejercicio[] = [
  PRESS_BANCA_15_SMITH,
  PRESS_INCLINADO_CONVERGENTE,
  PRESS_BANCA_BARRA,
  PRESS_BANCA_MANCUERNAS,
  PRESS_PECHO_CONVERGENTE,
  PEC_DECK,
  FONDOS_TRICEPS,
  EXTENSION_TRICEPS_POLEA,
  PRESS_FRANCES,
  ELEVACION_LATERAL_MANCUERNAS,
  ELEVACION_LATERAL_POLEA,
]
