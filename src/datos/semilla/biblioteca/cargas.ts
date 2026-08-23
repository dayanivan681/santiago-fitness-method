/**
 * Perfiles de carga habituales del gimnasio.
 * Guía del proyecto §13 (incrementos en libras) y §17 (tipo de carga).
 *
 * TODOS SON ESTIMADOS. Los pesos de barra y los saltos de cada máquina se
 * confirman con el equipo delante durante el piloto (§27) — ver
 * ESTIMADOS-A-CONFIRMAR.md. Afectan a lo que la app sugiere al subir carga.
 */

import type { PerfilCarga } from '../../../dominio/carga'

/** Barra olímpica: se cargan discos a cada lado sobre 45 lb de barra. */
export const BARRA_OLIMPICA: PerfilCarga = {
  tipoCarga: 'porLado',
  pesoBaseMaquinaLb: 45,
  incrementoMinimoLb: 5,
}

/** Barra Z / EZ, más ligera que la olímpica. */
export const BARRA_Z: PerfilCarga = {
  tipoCarga: 'porLado',
  pesoBaseMaquinaLb: 25,
  incrementoMinimoLb: 5,
}

/** Mancuernas: el número es el de una mano; suelen saltar de 5 en 5. */
export const MANCUERNAS: PerfilCarga = {
  tipoCarga: 'porLado',
  incrementoMinimoLb: 10,
}

/** Máquina de stack: el número que marca el pin ya es la carga total. */
export const STACK: PerfilCarga = {
  tipoCarga: 'pesoMaquina',
  incrementoMinimoLb: 10,
}

/** Plate-loaded: discos por lado, sin peso propio reseñable. */
export const DISCOS_POR_LADO: PerfilCarga = {
  tipoCarga: 'porLado',
  incrementoMinimoLb: 5,
}

/**
 * Peso corporal: se registra sólo el lastre añadido. 0 significa el propio
 * cuerpo, que es una referencia perfectamente válida para progresar en reps.
 */
export const PESO_CORPORAL: PerfilCarga = {
  tipoCarga: 'discosAnadidos',
  incrementoMinimoLb: 5,
}
