/**
 * Tipo de carga e incrementos.
 * Guía del proyecto §13 (incrementos, todo en libras) y §17 (tipo de carga).
 *
 * Estas funciones reciben sólo el perfil de carga y no el Ejercicio completo,
 * para que `tipos.ts` pueda depender de este módulo sin ciclo.
 */

/**
 * §17: la app debe distinguir cómo se interpreta el número que escribe el
 * participante. Es especialmente importante en convergentes y plate-loaded.
 */
export type TipoCarga =
  | 'total' // el número es la carga total
  | 'porLado' // el número es lo que lleva cada lado
  | 'discosAnadidos' // discos añadidos sobre el peso propio de la máquina
  | 'pesoMaquina' // número del stack de la máquina

export interface PerfilCarga {
  readonly tipoCarga: TipoCarga
  /** Incremento mínimo que permite el equipo, expresado en carga TOTAL (lb). */
  readonly incrementoMinimoLb: number
  /**
   * Peso propio del equipo antes de añadir discos: la barra del Smith, la barra
   * libre, el carro de una convergente (§17). Se suma en `porLado` y en
   * `discosAnadidos`, que son los dos casos donde el participante registra sólo
   * lo que añadió.
   */
  readonly pesoBaseMaquinaLb?: number
}

/** §13: "Ideal: +2.5 lb total cuando el equipo lo permita." */
export const INCREMENTO_IDEAL_LB = 2.5

/**
 * Convierte el número que escribió el participante a carga total en libras.
 * Sin esto, dos variantes no serían comparables entre sí ni consigo mismas
 * si cambia la forma de cargarlas (§17).
 */
export function aCargaTotalLb(pesoRegistradoLb: number, perfil: PerfilCarga): number {
  const base = perfil.pesoBaseMaquinaLb ?? 0
  switch (perfil.tipoCarga) {
    case 'porLado':
      return pesoRegistradoLb * 2 + base
    case 'discosAnadidos':
      return pesoRegistradoLb + base
    case 'total':
    case 'pesoMaquina':
      return pesoRegistradoLb
  }
}

/** Operación inversa de `aCargaTotalLb`: de carga total al número que se escribe. */
export function aPesoRegistradoLb(cargaTotalLb: number, perfil: PerfilCarga): number {
  const base = perfil.pesoBaseMaquinaLb ?? 0
  switch (perfil.tipoCarga) {
    case 'porLado':
      return (cargaTotalLb - base) / 2
    case 'discosAnadidos':
      return cargaTotalLb - base
    case 'total':
    case 'pesoMaquina':
      return cargaTotalLb
  }
}

/**
 * §13: incremento a aplicar, en carga total.
 *
 * Si el equipo no baja de 2.5 lb, se usa su mínimo. Si permite pasos más finos,
 * se busca el múltiplo de ese paso más cercano al ideal sin pasarse — §13 pide
 * "preferencia por incrementos pequeños", así que se redondea hacia abajo.
 */
export function incrementoTotalLb(perfil: PerfilCarga): number {
  const minimo = perfil.incrementoMinimoLb
  if (minimo <= 0) {
    throw new Error('El incremento mínimo del equipo debe ser mayor que cero (§13)')
  }
  if (minimo >= INCREMENTO_IDEAL_LB) return minimo

  const pasos = Math.max(1, Math.floor(INCREMENTO_IDEAL_LB / minimo))
  return redondear(pasos * minimo)
}

/**
 * El incremento tal como lo vive el participante en el número que escribe.
 * En `porLado`, los +2.5 lb totales de §13 son +1.25 lb en cada lado.
 */
export function incrementoRegistradoLb(perfil: PerfilCarga): number {
  const total = incrementoTotalLb(perfil)
  return redondear(perfil.tipoCarga === 'porLado' ? total / 2 : total)
}

/** Evita el ruido de coma flotante en cargas (0.1 + 0.2 y compañía). */
function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}
