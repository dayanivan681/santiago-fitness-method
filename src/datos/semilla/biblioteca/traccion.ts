/**
 * Tracción: espalda y bíceps.
 * §21: los remos ya trabajan deltoide posterior, así que va como secundario y
 * no suma al volumen directo.
 */

import type { Ejercicio } from '../../../dominio/tipos'
import { BARRA_OLIMPICA, MANCUERNAS, PESO_CORPORAL, STACK } from './cargas'

export const LAT_PULLDOWN: Ejercicio = {
  id: 'lat-pulldown-maquina',
  movimiento: 'jalon-vertical',
  nombre: 'Lat pulldown',
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/lat-pulldown-maquina.jpg',
  explicacionCorta:
    'Jalón al pecho. Llevar los codos hacia abajo y atrás, sin balancear el torso.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps', 'deltoidePosterior'],
  tipoCarga: 'pesoMaquina',
  incrementoMinimoLb: 10, // estimado: salto del stack
}

export const JALON_AGARRE_CERRADO: Ejercicio = {
  id: 'jalon-agarre-cerrado',
  movimiento: 'jalon-vertical',
  nombre: 'Jalón agarre cerrado',
  equipo: 'cable',
  imagen: '/ejercicios/jalon-agarre-cerrado.jpg',
  explicacionCorta: 'Agarre estrecho y neutro. Más recorrido y algo más de bíceps que el ancho.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps'],
  ...STACK,
}

export const DOMINADAS: Ejercicio = {
  id: 'dominadas',
  movimiento: 'jalon-vertical',
  nombre: 'Dominadas',
  equipo: 'barraLibre',
  imagen: '/ejercicios/dominadas.jpg',
  explicacionCorta: 'Peso corporal o lastre. Subir hasta pasar la barbilla sin dar impulso.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps'],
  ...PESO_CORPORAL,
}

export const REMO_BARRA: Ejercicio = {
  id: 'remo-barra',
  movimiento: 'remo-horizontal',
  nombre: 'Remo con barra',
  equipo: 'barraLibre',
  imagen: '/ejercicios/remo-barra.jpg',
  explicacionCorta: 'Torso inclinado y espalda neutra. Llevar la barra al abdomen bajo.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps', 'deltoidePosterior'],
  ...BARRA_OLIMPICA,
}

export const REMO_SENTADO_CABLE: Ejercicio = {
  id: 'remo-sentado-cable',
  movimiento: 'remo-horizontal',
  nombre: 'Remo sentado en polea',
  equipo: 'cable',
  imagen: '/ejercicios/remo-sentado-cable.jpg',
  explicacionCorta: 'Pecho alto y quieto. Tirar con los codos, no con las manos.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps', 'deltoidePosterior'],
  ...STACK,
}

export const REMO_MANCUERNA: Ejercicio = {
  id: 'remo-mancuerna',
  movimiento: 'remo-horizontal',
  nombre: 'Remo con mancuerna a una mano',
  equipo: 'mancuernas',
  imagen: '/ejercicios/remo-mancuerna.jpg',
  explicacionCorta: 'Apoyado en el banco. Subir la mancuerna hacia la cadera sin rotar el torso.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps', 'deltoidePosterior'],
  ...MANCUERNAS,
}

export const CURL_BARRA: Ejercicio = {
  id: 'curl-barra',
  movimiento: 'curl-biceps',
  nombre: 'Curl con barra',
  equipo: 'barraLibre',
  imagen: '/ejercicios/curl-barra.jpg',
  explicacionCorta: 'Codos pegados al cuerpo. Subir sin balancear la espalda.',
  musculoPrimario: 'biceps',
  musculosSecundarios: [],
  ...BARRA_OLIMPICA,
}

export const CURL_MANCUERNAS: Ejercicio = {
  id: 'curl-mancuernas',
  movimiento: 'curl-biceps',
  nombre: 'Curl con mancuernas',
  equipo: 'mancuernas',
  imagen: '/ejercicios/curl-mancuernas.jpg',
  explicacionCorta: 'Supinar al subir. Bajar controlado hasta estirar del todo.',
  musculoPrimario: 'biceps',
  musculosSecundarios: [],
  ...MANCUERNAS,
}

export const CURL_MARTILLO: Ejercicio = {
  id: 'curl-martillo',
  movimiento: 'curl-biceps',
  nombre: 'Curl martillo',
  equipo: 'mancuernas',
  imagen: '/ejercicios/curl-martillo.jpg',
  explicacionCorta: 'Agarre neutro, palmas enfrentadas. Carga más el braquial.',
  musculoPrimario: 'biceps',
  musculosSecundarios: [],
  ...MANCUERNAS,
}

export const TRACCION: readonly Ejercicio[] = [
  LAT_PULLDOWN,
  JALON_AGARRE_CERRADO,
  DOMINADAS,
  REMO_BARRA,
  REMO_SENTADO_CABLE,
  REMO_MANCUERNA,
  CURL_BARRA,
  CURL_MANCUERNAS,
  CURL_MARTILLO,
]
