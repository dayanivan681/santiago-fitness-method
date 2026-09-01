import { describe, test, expect, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { ProveedorDescanso } from '../aplicacion/ProveedorDescanso'
import { useControlDescanso } from '../aplicacion/contextoDescanso'
import { Descanso, VARIABLE_ALTO } from './Descanso'

/**
 * QA-MOB-01 — el cronómetro no puede taparle nada al participante.
 *
 * La barra es fija, así que flota sobre el contenido. Lo que impide que se
 * coma la última serie guardada y su "Editar" es que publique su altura y que
 * la pantalla reserve ese hueco. Aquí se protege la mitad que se puede probar
 * sin motor de maquetación: que la altura se publica al arrancar y se retira al
 * parar. Que `.contenido` la consuma lo cubre `shellMovil.test.ts`.
 */

const ALTO_SIMULADO = 66

function Disparador() {
  const { arrancar, terminar } = useControlDescanso()
  return (
    <>
      <button type="button" onClick={() => arrancar('press-banca', 180)}>
        Arrancar
      </button>
      <button type="button" onClick={terminar}>
        Parar
      </button>
    </>
  )
}

function montar() {
  // jsdom no maqueta: la barra mediría 0 y no habría nada que publicar.
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    height: ALTO_SIMULADO,
    width: 300,
    top: 0,
    left: 0,
    right: 300,
    bottom: ALTO_SIMULADO,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
  return render(
    <ProveedorDescanso>
      <Disparador />
      <Descanso />
    </ProveedorDescanso>,
  )
}

const variable = () => document.documentElement.style.getPropertyValue(VARIABLE_ALTO)
const pulsar = (nombre: string) =>
  act(() => screen.getByRole('button', { name: nombre }).click())

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  document.documentElement.style.removeProperty(VARIABLE_ALTO)
})

describe('el cronómetro reserva su propio hueco (QA-MOB-01)', () => {
  test('sin descanso en marcha no reserva nada', () => {
    montar()

    expect(variable()).toBe('')
  })

  test('al arrancar publica su altura para que la pantalla le deje sitio', () => {
    // Arrange
    montar()

    // Act
    pulsar('Arrancar')

    // Assert
    expect(variable()).toBe(`${ALTO_SIMULADO}px`)
  })

  test('al parar retira la reserva y no deja un hueco muerto', () => {
    // Arrange
    montar()
    pulsar('Arrancar')
    expect(variable()).toBe(`${ALTO_SIMULADO}px`)

    // Act
    pulsar('Parar')

    // Assert
    expect(variable()).toBe('')
  })

  test('desmontar la app tampoco deja la reserva puesta', () => {
    // Cerrar sesión desmonta todo: si la variable sobreviviera, la siguiente
    // pantalla arrancaría con un hueco al final que nadie explica.
    // Arrange
    const { unmount } = montar()
    pulsar('Arrancar')

    // Act
    unmount()

    // Assert
    expect(variable()).toBe('')
  })
})
