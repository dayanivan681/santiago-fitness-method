import type { TIPOS_DE_CARGA } from "../../shared/v2/biblioteca";

/** Los mismos textos que la app del cliente: una sola fuente, en el dominio. */
export { ETIQUETA_EQUIPO, NOMBRE_MUSCULO as ETIQUETA_MUSCULO } from "../dominio/etiquetas";

/** Cada forma de cargar el peso, con una frase de ejemplo en lenguaje sencillo. */
export const OPCION_CARGA: Record<(typeof TIPOS_DE_CARGA)[number], { titulo: string; ejemplo: string }> = {
  total: { titulo: "Todo el peso junto", ejemplo: "Anota todo lo que mueve. Ej.: una mancuerna de 40 lb → 40." },
  porLado: { titulo: "Lo de cada lado", ejemplo: "Anota lo de un solo lado. Ej.: discos de 45 lb en cada lado → 45." },
  discosAnadidos: { titulo: "Solo los discos que añade", ejemplo: "No cuenta el peso de la máquina. Ej.: añade 20 lb de discos → 20." },
  pesoMaquina: { titulo: "El número de la pila", ejemplo: "Anota el número que marca la pila de pesas. Ej.: pin en el 80 → 80." },
};
