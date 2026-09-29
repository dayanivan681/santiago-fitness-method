import type { EQUIPOS, MUSCULOS, TIPOS_DE_CARGA } from "../../shared/v2/biblioteca";

export const ETIQUETA_EQUIPO: Record<(typeof EQUIPOS)[number], string> = {
  smith: "Máquina Smith",
  convergente: "Máquina convergente",
  cable: "Polea / cable",
  mancuernas: "Mancuernas",
  barraLibre: "Barra libre",
  maquinaTradicional: "Máquina de pesas",
  pesoCorporal: "Peso corporal",
};

export const ETIQUETA_MUSCULO: Record<(typeof MUSCULOS)[number], string> = {
  pecho: "Pecho",
  espalda: "Espalda",
  cuadriceps: "Cuádriceps",
  gluteos: "Glúteos",
  femoral: "Femorales",
  biceps: "Bíceps",
  triceps: "Tríceps",
  deltoideLateral: "Hombro (lateral)",
  deltoideAnterior: "Hombro (frontal)",
  deltoidePosterior: "Hombro (trasero)",
  pantorrillas: "Pantorrillas",
  core: "Abdomen y core",
};

/** Cada forma de cargar el peso, con una frase de ejemplo en lenguaje sencillo. */
export const OPCION_CARGA: Record<(typeof TIPOS_DE_CARGA)[number], { titulo: string; ejemplo: string }> = {
  total: { titulo: "Todo el peso junto", ejemplo: "Anota todo lo que mueve. Ej.: una mancuerna de 40 lb → 40." },
  porLado: { titulo: "Lo de cada lado", ejemplo: "Anota lo de un solo lado. Ej.: discos de 45 lb en cada lado → 45." },
  discosAnadidos: { titulo: "Solo los discos que añade", ejemplo: "No cuenta el peso de la máquina. Ej.: añade 20 lb de discos → 20." },
  pesoMaquina: { titulo: "El número de la pila", ejemplo: "Anota el número que marca la pila de pesas. Ej.: pin en el 80 → 80." },
};
