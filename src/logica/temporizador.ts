/**
 * Estado del descanso entre series.
 *
 * El tiempo restante se deriva de un instante final absoluto, no de ir restando
 * un segundo por tick. Es la diferencia entre un cronómetro que aguanta y uno
 * que miente: iOS y los navegadores frenan los temporizadores cuando la pestaña
 * pasa a segundo plano, así que un contador que decrementa se queda corto
 * justo cuando el participante deja el móvil en el banco. Con `terminaEn` el
 * reloj se recalcula solo al volver.
 *
 * Este módulo es puro a propósito: decide, no dibuja ni programa intervalos.
 * La parte de React vive en `src/aplicacion/ProveedorDescanso.tsx`.
 *
 * OJO: esto es el cronómetro *visible*. El descanso que guarda el historial
 * (§5) se sigue derivando de las marcas de tiempo de cada serie y no tiene nada
 * que ver con esto. Son dos conceptos distintos y deben seguir separados.
 */

export type EstadoDescanso =
  | { readonly estado: 'inactivo' }
  | { readonly estado: 'activo'; readonly terminaEn: number; readonly ejercicioId: string }
  | { readonly estado: 'terminado'; readonly ejercicioId: string }

export const DESCANSO_INACTIVO: EstadoDescanso = { estado: 'inactivo' }

/** §12: el descanso se puede alargar sin pelearse con el cronómetro. */
export const PRORROGA_SEGUNDOS = 30

/** Cuándo el cronómetro empieza a avisar de verdad. */
export const SEGUNDOS_DE_AVISO = 10

/**
 * Arranca el descanso de un ejercicio.
 *
 * Un descanso de cero segundos no arranca nada: el coach que lo deja a cero
 * está diciendo que ahí no se descansa, y un cronómetro a 0:00 sería ruido.
 */
export function iniciarDescanso(
  ejercicioId: string,
  segundos: number,
  ahora: number,
): EstadoDescanso {
  if (!Number.isFinite(segundos) || segundos <= 0) return DESCANSO_INACTIVO

  return { estado: 'activo', terminaEn: ahora + segundos * 1000, ejercicioId }
}

/**
 * Añade 30 segundos.
 *
 * Desde `terminado` vuelve a arrancar contando desde ahora: si ya se agotó, lo
 * que quiere el participante es medio minuto más, no revivir un instante que
 * ya pasó.
 */
export function prorrogarDescanso(estado: EstadoDescanso, ahora: number): EstadoDescanso {
  if (estado.estado === 'activo') {
    return { ...estado, terminaEn: estado.terminaEn + PRORROGA_SEGUNDOS * 1000 }
  }

  if (estado.estado === 'terminado') {
    return {
      estado: 'activo',
      terminaEn: ahora + PRORROGA_SEGUNDOS * 1000,
      ejercicioId: estado.ejercicioId,
    }
  }

  return estado
}

/** Pasa a `terminado` cuando se agota. Idempotente: llamarlo de más no rompe. */
export function avanzarDescanso(estado: EstadoDescanso, ahora: number): EstadoDescanso {
  if (estado.estado !== 'activo') return estado
  if (estado.terminaEn > ahora) return estado

  return { estado: 'terminado', ejercicioId: estado.ejercicioId }
}

/** Segundos que quedan, nunca negativos. Redondea hacia arriba: 0,4 s aún es 1. */
export function segundosRestantes(estado: EstadoDescanso, ahora: number): number {
  if (estado.estado !== 'activo') return 0

  return Math.max(0, Math.ceil((estado.terminaEn - ahora) / 1000))
}
