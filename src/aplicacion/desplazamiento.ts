/**
 * Devolver cada sección al punto donde se dejó.
 *
 * El detalle que lo complica: la pantalla se monta antes de tener sus datos
 * —Dexie responde un instante después—, así que en el momento del montaje la
 * página todavía es corta y `scrollTo` se queda corto o directamente en cero.
 * Por eso no basta con un intento: se insiste durante unos fotogramas hasta
 * que el contenido llega y la posición es alcanzable, y se deja de insistir en
 * cuanto se consigue o se agota el margen.
 *
 * También se para si el visitante se desplaza por su cuenta: pelearse con el
 * dedo del usuario sería peor que no restaurar nada.
 */

/** ~0,5 s a 60 fps: si el contenido no ha llegado, ya no llega por esperar. */
const FOTOGRAMAS_MAXIMOS = 30

export interface Ventana {
  readonly scrollY: number
  scrollTo(x: number, y: number): void
  requestAnimationFrame(callback: () => void): number
}

/** Devuelve la función de cancelación, para el cleanup del efecto. */
export function restaurarDesplazamiento(ventana: Ventana, objetivo: number): () => void {
  let cancelado = false

  if (objetivo <= 0) {
    ventana.scrollTo(0, 0)
    return () => {
      cancelado = true
    }
  }

  let intentos = 0
  const intentar = () => {
    if (cancelado) return

    ventana.scrollTo(0, objetivo)
    intentos += 1
    if (Math.round(ventana.scrollY) < objetivo && intentos < FOTOGRAMAS_MAXIMOS) {
      ventana.requestAnimationFrame(intentar)
    }
  }

  intentar()
  return () => {
    cancelado = true
  }
}
