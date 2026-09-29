/**
 * Ampliación pedida por el coach en su correo del 2026-09-26: «unilateral» y
 * «prensa para piernas 45 grados».
 *
 * Son identidades de su Biblioteca Maestra (C191, C194…). El bloque B quedó
 * en «Mantener genérico» (12 respuestas, confirmado por el dueño 2026-09-28).
 * Usan el mismo id que la fundación del catálogo maestro.
 *
 * Los músculos, el patrón de movimiento y los perfiles de carga son ESTIMADOS,
 * igual que los de las 33 fichas originales: el PDF no los fija. Están en
 * ESTIMADOS-A-CONFIRMAR.md. Fotos: dominio público y generación IA;
 * procedencia, prompts y revisión en public/ejercicios/PROCEDENCIA.md.
 *
 * §16: cada variante unilateral es una fila propia. No comparte historial con
 * su versión a dos brazos o dos piernas; sólo el `movimiento`, que es lo que la
 * ofrece como alternativa equivalente.
 */

import type { Ejercicio } from '../../../dominio/tipos'
import type { PerfilCarga } from '../../../dominio/carga'
import { nombreDe } from '../../../../shared/ejercicios-base'
import { DISCOS_POR_LADO, MANCUERNAS, PESO_CORPORAL, STACK } from './cargas'

/** Landmine: los discos van en un solo extremo de la barra; se registra lo cargado. */
const LANDMINE: PerfilCarga = {
  tipoCarga: 'total',
  incrementoMinimoLb: 5,
}

export const PRENSA_45: Ejercicio = {
  id: 'sfm-catalog-c191',
  movimiento: 'sentadilla',
  nombre: nombreDe('sfm-catalog-c191'),
  equipo: 'maquinaTradicional',
  angulo: '45°',
  imagen: '/ejercicios/prensa.jpg',
  explicacionCorta: 'Prensa inclinada a 45°. No despegar la cadera del respaldo al bajar ni bloquear las rodillas arriba.',
  musculoPrimario: 'cuadriceps',
  musculosSecundarios: ['gluteos'],
  ...DISCOS_POR_LADO,
}

export const PRENSA_UNILATERAL: Ejercicio = {
  id: 'sfm-catalog-c194',
  movimiento: 'sentadilla',
  nombre: nombreDe('sfm-catalog-c194'),
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/sfm-catalog-c194.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Una pierna cada vez, pie centrado en la plataforma. Misma profundidad con las dos piernas.',
  musculoPrimario: 'cuadriceps',
  musculosSecundarios: ['gluteos'],
  ...DISCOS_POR_LADO,
}

export const EXTENSION_CUADRICEPS_UNILATERAL: Ejercicio = {
  id: 'sfm-catalog-c196',
  movimiento: 'extension-rodilla',
  nombre: nombreDe('sfm-catalog-c196'),
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/sfm-catalog-c196.jpg',
  explicacionCorta: 'Una pierna cada vez. Estirar del todo arriba y aguantar un instante antes de bajar.',
  musculoPrimario: 'cuadriceps',
  musculosSecundarios: [],
  ...STACK,
}

export const PESO_MUERTO_UNILATERAL_MANCUERNA: Ejercicio = {
  id: 'sfm-catalog-c203',
  movimiento: 'bisagra-cadera',
  nombre: nombreDe('sfm-catalog-c203'),
  equipo: 'mancuernas',
  imagen: '/ejercicios/sfm-catalog-c203.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Apoyado en una pierna, cadera atrás y espalda neutra; la otra pierna sube en línea con el torso.',
  musculoPrimario: 'femoral',
  musculosSecundarios: ['gluteos', 'core'],
  ...MANCUERNAS,
}

export const FLY_UNILATERAL_CABLE: Ejercicio = {
  id: 'sfm-catalog-c037',
  movimiento: 'apertura-pecho',
  nombre: nombreDe('sfm-catalog-c037'),
  equipo: 'cable',
  imagen: '/ejercicios/sfm-catalog-c037.jpg',
  explicacionCorta: 'Un brazo cada vez, codo ligeramente flexionado y fijo. Cerrar el brazo delante del pecho.',
  musculoPrimario: 'pecho',
  musculosSecundarios: ['deltoideAnterior'],
  ...STACK,
}

export const LANDMINE_PRESS_UNILATERAL: Ejercicio = {
  id: 'sfm-catalog-c103',
  movimiento: 'press-hombro',
  nombre: nombreDe('sfm-catalog-c103'),
  equipo: 'barraLibre',
  imagen: '/ejercicios/sfm-catalog-c103.jpg',
  explicacionCorta: 'Barra anclada en una esquina. Empujar con una mano hacia arriba y adelante sin arquear la espalda.',
  musculoPrimario: 'deltoideAnterior',
  musculosSecundarios: ['pecho', 'triceps'],
  ...LANDMINE,
}

export const EXTENSION_UNILATERAL_SOBRE_CABEZA_MANCUERNA: Ejercicio = {
  id: 'sfm-catalog-c154',
  movimiento: 'extension-triceps',
  nombre: nombreDe('sfm-catalog-c154'),
  equipo: 'mancuernas',
  imagen: '/ejercicios/sfm-catalog-c154.jpg',
  explicacionCorta: 'Mancuerna en una mano por encima de la cabeza. Codo quieto; sólo baja y sube el antebrazo.',
  musculoPrimario: 'triceps',
  musculosSecundarios: [],
  ...MANCUERNAS,
}

export const EXTENSION_UNILATERAL_SOBRE_CABEZA_CABLE: Ejercicio = {
  id: 'sfm-catalog-c165',
  movimiento: 'extension-triceps',
  nombre: nombreDe('sfm-catalog-c165'),
  equipo: 'cable',
  imagen: '/ejercicios/sfm-catalog-c165.jpg',
  explicacionCorta: 'De espaldas a la polea, un brazo cada vez. Codo apuntando arriba y quieto; estirar el brazo del todo.',
  musculoPrimario: 'triceps',
  musculosSecundarios: [],
  ...STACK,
}

export const PUSHDOWN_UNILATERAL_NEUTRO: Ejercicio = {
  id: 'sfm-catalog-c161',
  movimiento: 'extension-triceps',
  nombre: nombreDe('sfm-catalog-c161'),
  equipo: 'cable',
  angulo: 'neutro',
  imagen: '/ejercicios/sfm-catalog-c161.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Un brazo cada vez, palma mirando hacia dentro. Codo pegado al costado; sólo se mueve el antebrazo.',
  musculoPrimario: 'triceps',
  musculosSecundarios: [],
  ...STACK,
}

export const PUSHDOWN_UNILATERAL_SUPINADO: Ejercicio = {
  id: 'sfm-catalog-c162',
  movimiento: 'extension-triceps',
  nombre: nombreDe('sfm-catalog-c162'),
  equipo: 'cable',
  angulo: 'supinado',
  imagen: '/ejercicios/sfm-catalog-c162.jpg',
  explicacionCorta: 'Un brazo cada vez, palma hacia arriba. Codo pegado al costado; sólo se mueve el antebrazo.',
  musculoPrimario: 'triceps',
  musculosSecundarios: [],
  ...STACK,
}

export const JALON_UNILATERAL_POLEA_ALTA: Ejercicio = {
  id: 'sfm-catalog-c056',
  movimiento: 'jalon-vertical',
  nombre: nombreDe('sfm-catalog-c056'),
  equipo: 'cable',
  imagen: '/ejercicios/sfm-catalog-c056.jpg',
  explicacionCorta: 'Un brazo cada vez desde la polea alta. Llevar el codo hacia la cadera sin girar el torso.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps'],
  ...STACK,
}

export const PREACHER_CURL_MANCUERNA_UNILATERAL: Ejercicio = {
  id: 'sfm-catalog-c137',
  movimiento: 'curl-biceps',
  nombre: nombreDe('sfm-catalog-c137'),
  equipo: 'mancuernas',
  imagen: '/ejercicios/sfm-catalog-c137.jpg',
  explicacionCorta: 'Brazo apoyado en el banco predicador. Subir sin despegar el codo y bajar controlado hasta estirar.',
  musculoPrimario: 'biceps',
  musculosSecundarios: [],
  ...MANCUERNAS,
}

export const CURL_UNILATERAL_CABLE: Ejercicio = {
  id: 'sfm-catalog-c142',
  movimiento: 'curl-biceps',
  nombre: nombreDe('sfm-catalog-c142'),
  equipo: 'cable',
  imagen: '/ejercicios/sfm-catalog-c142.jpg',
  explicacionCorta: 'Un brazo cada vez desde la polea baja. Codo fijo al costado; subir sin balancear el cuerpo.',
  musculoPrimario: 'biceps',
  musculosSecundarios: [],
  ...STACK,
}

export const PRESS_UNILATERAL_CONVERGENTE: Ejercicio = {
  id: 'sfm-catalog-c026',
  movimiento: 'press-pecho',
  nombre: nombreDe('sfm-catalog-c026'),
  equipo: 'convergente',
  imagen: '/ejercicios/sfm-catalog-c026.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Un brazo cada vez en una máquina con brazos independientes. Seguir el arco de empuje delante del pecho sin separar la espalda del respaldo; la imagen muestra una variante inclinada.',
  musculoPrimario: 'pecho',
  musculosSecundarios: ['deltoideAnterior', 'triceps'],
  ...STACK,
}

export const PULLDOWN_UNILATERAL_CONVERGENTE: Ejercicio = {
  id: 'sfm-catalog-c059',
  movimiento: 'jalon-vertical',
  nombre: nombreDe('sfm-catalog-c059'),
  equipo: 'convergente',
  imagen: '/ejercicios/sfm-catalog-c059.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Tirar de una palanca superior llevando el codo hacia el costado. La imagen muestra una variante sentada de lado, con la mano libre en el soporte fijo y el torso estable.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps'],
  ...DISCOS_POR_LADO,
}

export const REMO_SENTADO_UNILATERAL_CABLE: Ejercicio = {
  id: 'sfm-catalog-c071',
  movimiento: 'remo-horizontal',
  nombre: nombreDe('sfm-catalog-c071'),
  equipo: 'cable',
  imagen: '/ejercicios/sfm-catalog-c071.jpg',
  explicacionCorta: 'Un brazo cada vez desde la polea baja, torso estable. Llevar el agarre hacia las costillas sin balancearse.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps'],
  ...STACK,
}

export const REMO_UNILATERAL_MAQUINA: Ejercicio = {
  id: 'sfm-catalog-c077',
  movimiento: 'remo-horizontal',
  nombre: nombreDe('sfm-catalog-c077'),
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/sfm-catalog-c077.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Un brazo cada vez en una máquina con palancas independientes. Tirar hacia las costillas sin girar el torso.',
  musculoPrimario: 'espalda',
  musculosSecundarios: ['biceps'],
  ...DISCOS_POR_LADO,
}

export const ELEVACION_LATERAL_UNILATERAL_CABLE: Ejercicio = {
  id: 'sfm-catalog-c107',
  movimiento: 'elevacion-lateral',
  nombre: nombreDe('sfm-catalog-c107'),
  equipo: 'cable',
  imagen: '/ejercicios/sfm-catalog-c107.jpg',
  imagenGenerada: true,
  explicacionCorta: 'De pie junto a la polea baja, elevar un brazo hacia el costado hasta la altura del hombro. Codo ligeramente flexionado y torso estable.',
  musculoPrimario: 'deltoideLateral',
  musculosSecundarios: [],
  ...STACK,
}

export const CURL_UNILATERAL_MAQUINA: Ejercicio = {
  id: 'sfm-catalog-c147',
  movimiento: 'curl-biceps',
  nombre: nombreDe('sfm-catalog-c147'),
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/sfm-catalog-c147.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Un brazo cada vez, brazo apoyado y codo fijo. Flexionar sin despegar el brazo del apoyo y bajar controlado.',
  musculoPrimario: 'biceps',
  musculosSecundarios: [],
  ...STACK,
}

export const HIP_THRUST_UNILATERAL: Ejercicio = {
  id: 'sfm-catalog-c217',
  movimiento: 'extension-cadera',
  nombre: nombreDe('sfm-catalog-c217'),
  equipo: 'pesoCorporal',
  imagen: '/ejercicios/sfm-catalog-c217.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Espalda alta apoyada en un banco, un pie en el suelo y el otro elevado. Subir la cadera sin arquear la espalda ni girar la pelvis.',
  musculoPrimario: 'gluteos',
  musculosSecundarios: ['femoral', 'core'],
  ...PESO_CORPORAL,
}

export const CALF_RAISE_UNILATERAL: Ejercicio = {
  id: 'sfm-catalog-c256',
  movimiento: 'gemelo',
  nombre: nombreDe('sfm-catalog-c256'),
  equipo: 'pesoCorporal',
  imagen: '/ejercicios/sfm-catalog-c256.jpg',
  explicacionCorta: 'De pie sobre una pierna y con apoyo para el equilibrio, elevar el talón y bajar controlado. La otra pierna no empuja.',
  musculoPrimario: 'pantorrillas',
  musculosSecundarios: [],
  ...PESO_CORPORAL,
}

export const PRESS_UNILATERAL_PECHO_CABLE: Ejercicio = {
  id: 'sfm-catalog-c031',
  movimiento: 'press-pecho',
  nombre: nombreDe('sfm-catalog-c031'),
  equipo: 'cable',
  imagen: '/ejercicios/sfm-catalog-c031.jpg',
  imagenGenerada: true,
  explicacionCorta: 'De espaldas a la polea a la altura del pecho, empujar un agarre hacia delante. Codo flexionado al inicio, torso estable y sin girar.',
  musculoPrimario: 'pecho',
  musculosSecundarios: ['deltoideAnterior', 'triceps'],
  ...STACK,
}

export const PRESS_UNILATERAL_HOMBRO_MAQUINA: Ejercicio = {
  id: 'sfm-catalog-c102',
  movimiento: 'press-hombro',
  nombre: nombreDe('sfm-catalog-c102'),
  equipo: 'maquinaTradicional',
  imagen: '/ejercicios/sfm-catalog-c102.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Un brazo cada vez en una máquina de hombro con palancas independientes. Empujar arriba sin arquear la espalda y bajar controlado.',
  musculoPrimario: 'deltoideAnterior',
  musculosSecundarios: ['triceps', 'deltoideLateral'],
  ...STACK,
}

export const PESO_MUERTO_RUMANO_UNILATERAL_CABLE: Ejercicio = {
  id: 'sfm-catalog-c204',
  movimiento: 'bisagra-cadera',
  nombre: nombreDe('sfm-catalog-c204'),
  equipo: 'cable',
  imagen: '/ejercicios/sfm-catalog-c204.jpg',
  imagenGenerada: true,
  explicacionCorta: 'Sobre una pierna, sostener con una mano el agarre de la polea baja. Llevar la cadera atrás con espalda neutra mientras la otra pierna se extiende atrás.',
  musculoPrimario: 'femoral',
  musculosSecundarios: ['gluteos', 'core'],
  ...STACK,
}

export const AMPLIACION_UNILATERAL: readonly Ejercicio[] = [
  PRENSA_45,
  PRENSA_UNILATERAL,
  EXTENSION_CUADRICEPS_UNILATERAL,
  PESO_MUERTO_UNILATERAL_MANCUERNA,
  FLY_UNILATERAL_CABLE,
  LANDMINE_PRESS_UNILATERAL,
  EXTENSION_UNILATERAL_SOBRE_CABEZA_MANCUERNA,
  EXTENSION_UNILATERAL_SOBRE_CABEZA_CABLE,
  PUSHDOWN_UNILATERAL_NEUTRO,
  PUSHDOWN_UNILATERAL_SUPINADO,
  JALON_UNILATERAL_POLEA_ALTA,
  PREACHER_CURL_MANCUERNA_UNILATERAL,
  CURL_UNILATERAL_CABLE,
  PRESS_UNILATERAL_CONVERGENTE,
  PULLDOWN_UNILATERAL_CONVERGENTE,
  REMO_SENTADO_UNILATERAL_CABLE,
  REMO_UNILATERAL_MAQUINA,
  ELEVACION_LATERAL_UNILATERAL_CABLE,
  CURL_UNILATERAL_MAQUINA,
  HIP_THRUST_UNILATERAL,
  CALF_RAISE_UNILATERAL,
  PRESS_UNILATERAL_PECHO_CABLE,
  PRESS_UNILATERAL_HOMBRO_MAQUINA,
  PESO_MUERTO_RUMANO_UNILATERAL_CABLE,
]
