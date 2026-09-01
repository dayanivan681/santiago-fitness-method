import { describe, expect, it, vi } from 'vitest'
import { restaurarDesplazamiento, type Ventana } from './desplazamiento'

/**
 * Lo que se protege: que volver a una sección no se quede arriba del todo sólo
 * porque la lista todavía no había cargado cuando se intentó restaurar.
 */

/** Una ventana falsa cuyo alto crece cuando "llegan los datos". */
function ventanaFalsa(altoMaximo: number) {
  const pendientes: (() => void)[] = []
  const ventana = {
    scrollY: 0,
    /** Hasta dónde deja bajar el contenido que hay ahora mismo. */
    alcanzable: 0,
    scrollTo(_x: number, y: number) {
      // Como el navegador: no se puede desplazar más allá del contenido.
      ventana.scrollY = Math.min(y, ventana.alcanzable)
    },
    requestAnimationFrame(callback: () => void) {
      pendientes.push(callback)
      return pendientes.length
    },
  }
  return {
    ventana: ventana as Ventana & { alcanzable: number },
    /** Simula que llegó el contenido y la página ya es larga. */
    cargar: () => {
      ventana.alcanzable = altoMaximo
    },
    fotograma: () => pendientes.splice(0).forEach((seguir) => seguir()),
    pendientes: () => pendientes.length,
  }
}

describe('restaurar el desplazamiento', () => {
  it('insiste hasta que el contenido llega', () => {
    // Arrange: la página todavía está vacía, así que no se puede bajar
    const { ventana, cargar, fotograma } = ventanaFalsa(400)

    // Act
    restaurarDesplazamiento(ventana, 400)
    expect(ventana.scrollY).toBe(0) // el primer intento se queda corto
    cargar()
    fotograma()

    // Assert
    expect(ventana.scrollY).toBe(400)
  })

  it('deja de insistir en cuanto lo consigue', () => {
    const { ventana, cargar, pendientes } = ventanaFalsa(400)
    cargar()

    restaurarDesplazamiento(ventana, 400)

    expect(ventana.scrollY).toBe(400)
    expect(pendientes()).toBe(0)
  })

  it('se rinde en vez de insistir para siempre', () => {
    // Si el contenido nunca llega —la sección se quedó vacía— no puede quedar
    // un bucle de fotogramas corriendo debajo.
    const { ventana, fotograma, pendientes } = ventanaFalsa(400)

    restaurarDesplazamiento(ventana, 400)
    for (let i = 0; i < 60; i += 1) fotograma()

    expect(pendientes()).toBe(0)
  })

  it('cancelar corta la insistencia', () => {
    // Arrange
    const { ventana, cargar, fotograma } = ventanaFalsa(400)
    const cancelar = restaurarDesplazamiento(ventana, 400)

    // Act: la sección cambia otra vez antes de que llegue el contenido
    cancelar()
    cargar()
    fotograma()

    // Assert: no se restaura una posición que ya no toca
    expect(ventana.scrollY).toBe(0)
  })

  it('el objetivo cero sube del todo y no programa nada', () => {
    const { ventana, pendientes } = ventanaFalsa(400)
    const scrollTo = vi.spyOn(ventana, 'scrollTo')

    restaurarDesplazamiento(ventana, 0)

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    expect(pendientes()).toBe(0)
  })
})
