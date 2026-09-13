import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { useState } from 'react'
import { ProveedorDescanso } from './ProveedorDescanso'
import { useControlDescanso } from './contextoDescanso'
import { Descanso } from '../componentes/Descanso'

/**
 * El cronómetro global.
 *
 * Lo que se protege aquí es la razón de haberlo sacado de la pantalla de
 * entrenamiento: el descanso no se detiene porque el participante se vaya a la
 * biblioteca a mirar el siguiente ejercicio.
 */

const CRONOMETRO = { name: 'Temporizador de descanso' }

/** Dispara el descanso y desaparece, como haría una pantalla al desmontarse. */
function Disparador({ segundos = 180, ejercicio = 'press-banca' }) {
  const { arrancar } = useControlDescanso()
  return (
    <button type="button" onClick={() => arrancar(ejercicio, segundos)}>
      Arrancar
    </button>
  )
}

/** Dos "pestañas" que se sustituyen, con el cronómetro colgando de fuera. */
function Aplicacion({ segundos = 180 }) {
  const [seccion, setSeccion] = useState<'hoy' | 'biblioteca'>('hoy')
  return (
    <ProveedorDescanso>
      {seccion === 'hoy' ? <Disparador segundos={segundos} /> : <p>Biblioteca</p>}
      <button type="button" onClick={() => setSeccion('biblioteca')}>
        Ir a Biblioteca
      </button>
      <Descanso />
    </ProveedorDescanso>
  )
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function pulsar(nombre: string) {
  act(() => {
    screen.getByRole('button', { name: nombre }).click()
  })
}

function avanzar(segundos: number) {
  act(() => {
    vi.advanceTimersByTime(segundos * 1000)
  })
}

describe('cronómetro global', () => {
  test('sigue corriendo al cambiar de pestaña', () => {
    // Es la razón de sacarlo de EntrenamientoHoy: antes, mirar la biblioteca
    // entre serie y serie desmontaba la pantalla y mataba el descanso.
    // Arrange
    render(<Aplicacion />)
    pulsar('Arrancar')
    expect(screen.getByRole('status', CRONOMETRO)).toHaveTextContent('3:00')

    // Act: la pantalla que lo arrancó desaparece
    pulsar('Ir a Biblioteca')
    avanzar(60)

    // Assert
    expect(screen.getByRole('status', CRONOMETRO)).toHaveTextContent('2:00')
  })

  test('no arranca con un descanso de cero segundos', () => {
    // Un coach que deja el descanso a cero está diciendo que ahí no se descansa.
    render(<Aplicacion segundos={0} />)

    pulsar('Arrancar')

    expect(screen.queryByRole('status', CRONOMETRO)).not.toBeInTheDocument()
  })

  test('arrancar otra vez reinicia el mismo cronómetro, no añade otro', () => {
    // Arrange
    render(<Aplicacion />)
    pulsar('Arrancar')
    avanzar(120)
    expect(screen.getByRole('status', CRONOMETRO)).toHaveTextContent('1:00')

    // Act: se guarda otra serie
    pulsar('Arrancar')

    // Assert: uno solo, y contando de nuevo
    expect(screen.getAllByRole('status', CRONOMETRO)).toHaveLength(1)
    expect(screen.getByRole('status', CRONOMETRO)).toHaveTextContent('3:00')
  })

  test('+30s alarga el descanso sin reiniciarlo', () => {
    // Arrange
    render(<Aplicacion />)
    pulsar('Arrancar')
    avanzar(150)
    expect(screen.getByRole('status', CRONOMETRO)).toHaveTextContent('0:30')

    // Act
    pulsar('Añadir 30 segundos')

    // Assert
    expect(screen.getByRole('status', CRONOMETRO)).toHaveTextContent('1:00')
  })

  test('Omitir lo apaga en el acto', () => {
    render(<Aplicacion />)
    pulsar('Arrancar')

    pulsar('Omitir')

    expect(screen.queryByRole('status', CRONOMETRO)).not.toBeInTheDocument()
  })

  test('al agotarse lo dice con palabras, no sólo con color', () => {
    // Quien no distingue el rojo tiene que enterarse igual.
    // Arrange
    render(<Aplicacion segundos={60} />)
    pulsar('Arrancar')

    // Act
    avanzar(61)

    // Assert
    expect(screen.getByRole('status', CRONOMETRO)).toHaveTextContent('Descanso terminado')
  })

  test('desmontar la app no deja el intervalo suelto', () => {
    // Arrange
    const { unmount } = render(<Aplicacion />)
    pulsar('Arrancar')

    // Act
    unmount()

    // Assert: sin temporizadores pendientes tras cerrar sesión o salir
    expect(vi.getTimerCount()).toBe(0)
  })
})
