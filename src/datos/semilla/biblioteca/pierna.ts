/**
 * Pierna: cuádriceps, femoral, glúteos y pantorrillas.
 * §22: el femenino prioriza glúteo, pierna y femoral, así que estos son los que
 * más falta hacen para definir Lower A y Lower B (§28).
 */

import type { Ejercicio } from '../../../dominio/tipos'
import { BARRA_OLIMPICA, DISCOS_POR_LADO, MANCUERNAS, STACK } from './cargas'

export const HIP_THRUST_BARRA: Ejercicio = {
  id: 'hip-thrust-barra',
  movimiento: 'extension-cadera',
  nombre: 'Hip thrust con barra',
  equipo: 'barraLibre',
  imagen: '/ejercicios/hip-thrust-barra.jpg',
  explicacionCorta:
    'Espalda alta apoyada en el banco, barra sobre la cadera. Subir hasta alinear el tronco.',
  musculoPrimario: 'gluteos',
  musculosSecundarios: ['femoral', 'cuadriceps'],
  ...BARRA_OLIMPICA,
}

export const SENTADILLA_BARRA: Ejercicio = {
  id: 'sentadilla-barra',
  movimiento: 'sentadilla',
  nombre: 'Sentadilla con barra',
  equipo: 'barraLibre',
  imagen: '/ejercicios/sentadilla-barra.jpg',
  explicacionCorta: 'Bajar con la espalda neutra hasta romper la paralela si la movilidad lo permite.',
  musculoPrimario: 'cuadriceps',
  musculosSecundarios: ['gluteos', 'femoral'],
  ...BARRA_OLIMPICA,
}

export const PRENSA: Ejercicio = {
  id: 'prensa',
  movimiento: 'sentadilla',
  nombre: 'Prensa de piernas',
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/prensa.jpg',
  explicacionCorta: 'No despegar la cadera del respaldo al bajar. No bloquear las rodillas arriba.',
  musculoPrimario: 'cuadriceps',
  musculosSecundarios: ['gluteos'],
  ...DISCOS_POR_LADO,
}

export const HACK_SQUAT: Ejercicio = {
  id: 'hack-squat',
  movimiento: 'sentadilla',
  nombre: 'Hack squat',
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/hack-squat.jpg',
  explicacionCorta: 'Espalda pegada al respaldo. Bajada controlada, sin rebotar abajo.',
  musculoPrimario: 'cuadriceps',
  musculosSecundarios: ['gluteos'],
  ...DISCOS_POR_LADO,
}

export const EXTENSION_CUADRICEPS: Ejercicio = {
  id: 'extension-cuadriceps',
  movimiento: 'extension-rodilla',
  nombre: 'Extensión de cuádriceps',
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/extension-cuadriceps.jpg',
  explicacionCorta: 'Estirar del todo arriba y aguantar un instante antes de bajar.',
  musculoPrimario: 'cuadriceps',
  musculosSecundarios: [],
  ...STACK,
}

export const ZANCADAS_MANCUERNAS: Ejercicio = {
  id: 'zancadas-mancuernas',
  movimiento: 'sentadilla',
  nombre: 'Zancadas con mancuernas',
  equipo: 'mancuernas',
  imagen: '/ejercicios/zancadas-mancuernas.jpg',
  explicacionCorta: 'Paso largo y torso vertical. Empujar con el talón de la pierna delantera.',
  musculoPrimario: 'cuadriceps',
  musculosSecundarios: ['gluteos', 'femoral'],
  ...MANCUERNAS,
}

export const PESO_MUERTO_RUMANO: Ejercicio = {
  id: 'peso-muerto-rumano',
  movimiento: 'bisagra-cadera',
  nombre: 'Peso muerto rumano',
  equipo: 'barraLibre',
  imagen: '/ejercicios/peso-muerto-rumano.jpg',
  explicacionCorta: 'Llevar la cadera atrás con las piernas casi rectas. Parar cuando tire el femoral.',
  musculoPrimario: 'femoral',
  musculosSecundarios: ['gluteos', 'espalda'],
  ...BARRA_OLIMPICA,
}

export const CURL_FEMORAL_TUMBADO: Ejercicio = {
  id: 'curl-femoral-tumbado',
  movimiento: 'curl-femoral',
  nombre: 'Curl femoral tumbado',
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/curl-femoral-tumbado.jpg',
  explicacionCorta: 'Cadera pegada al banco. Subir el talón hacia el glúteo sin despegar.',
  musculoPrimario: 'femoral',
  musculosSecundarios: [],
  ...STACK,
}

export const CURL_FEMORAL_SENTADO: Ejercicio = {
  id: 'curl-femoral-sentado',
  movimiento: 'curl-femoral',
  nombre: 'Curl femoral sentado',
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/curl-femoral-sentado.jpg',
  explicacionCorta: 'Con la cadera flexionada el femoral trabaja más estirado que tumbado.',
  musculoPrimario: 'femoral',
  musculosSecundarios: [],
  ...STACK,
}

export const PATADA_GLUTEO_POLEA: Ejercicio = {
  id: 'patada-gluteo-polea',
  movimiento: 'extension-cadera',
  nombre: 'Patada de glúteo en polea',
  equipo: 'cable',
  imagen: '/ejercicios/patada-gluteo-polea.jpg',
  explicacionCorta: 'Llevar la pierna atrás sin arquear la zona lumbar. Apretar arriba.',
  musculoPrimario: 'gluteos',
  musculosSecundarios: [],
  ...STACK,
}

export const ABDUCCION_MAQUINA: Ejercicio = {
  id: 'abduccion-maquina',
  movimiento: 'abduccion-cadera',
  nombre: 'Abducción en máquina',
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/abduccion-maquina.jpg',
  explicacionCorta: 'Abrir las piernas contra la resistencia. Inclinar el torso al frente aísla más.',
  musculoPrimario: 'gluteos',
  musculosSecundarios: [],
  ...STACK,
}

export const ELEVACION_TALONES_PIE: Ejercicio = {
  id: 'elevacion-talones-pie',
  movimiento: 'gemelo',
  nombre: 'Elevación de talones de pie',
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/elevacion-talones-pie.jpg',
  explicacionCorta: 'Recorrido completo: bajar el talón del todo y subir hasta la punta.',
  musculoPrimario: 'pantorrillas',
  musculosSecundarios: [],
  ...STACK,
}

export const ELEVACION_TALONES_SENTADO: Ejercicio = {
  id: 'elevacion-talones-sentado',
  movimiento: 'gemelo',
  nombre: 'Elevación de talones sentado',
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/elevacion-talones-sentado.jpg',
  explicacionCorta: 'Con la rodilla doblada trabaja más el sóleo que de pie.',
  musculoPrimario: 'pantorrillas',
  musculosSecundarios: [],
  ...DISCOS_POR_LADO,
}

export const PIERNA: readonly Ejercicio[] = [
  HIP_THRUST_BARRA,
  SENTADILLA_BARRA,
  PRENSA,
  HACK_SQUAT,
  EXTENSION_CUADRICEPS,
  ZANCADAS_MANCUERNAS,
  PESO_MUERTO_RUMANO,
  CURL_FEMORAL_TUMBADO,
  CURL_FEMORAL_SENTADO,
  PATADA_GLUTEO_POLEA,
  ABDUCCION_MAQUINA,
  ELEVACION_TALONES_PIE,
  ELEVACION_TALONES_SENTADO,
]
