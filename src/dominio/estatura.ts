/**
 * Estatura en pies y pulgadas.
 *
 * El modelo guarda centímetros — es una sola magnitud y no acumula error al
 * redondear. Pies y pulgadas son la forma de mostrarla y de escribirla, igual
 * que §13 hace con las libras: la unidad de la pantalla no tiene por qué ser la
 * unidad del dato.
 */

const CM_POR_PULGADA = 2.54
const PULGADAS_POR_PIE = 12

export interface PiesYPulgadas {
  readonly pies: number
  readonly pulgadas: number
}

export function aPiesYPulgadas(centimetros: number): PiesYPulgadas {
  const totalPulgadas = Math.round(centimetros / CM_POR_PULGADA)
  return {
    pies: Math.floor(totalPulgadas / PULGADAS_POR_PIE),
    pulgadas: totalPulgadas % PULGADAS_POR_PIE,
  }
}

export function aCentimetros({ pies, pulgadas }: PiesYPulgadas): number {
  return Math.round((pies * PULGADAS_POR_PIE + pulgadas) * CM_POR_PULGADA)
}

/** Formato del diseño: 5′ 9″ con prima y doble prima, no comillas. */
export function formatearEstatura(centimetros: number): string {
  const { pies, pulgadas } = aPiesYPulgadas(centimetros)
  return `${pies}′ ${pulgadas}″`
}
