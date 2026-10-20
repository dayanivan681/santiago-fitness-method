import { afterEach, describe, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { useRef } from 'react'
import { useArrastrarParaCerrar, useDeslizarHorizontal } from './gestos'
import { conTransicion, direccionEntre } from './transiciones'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

/** jsdom no tiene `Touch`: basta un evento con las listas que leen los gestos. */
function tocar(el: Element, tipo: string, x: number, y: number) {
  const evento = new Event(tipo, { bubbles: true, cancelable: true })
  const punto = [{ clientX: x, clientY: y }]
  Object.assign(evento, { touches: tipo === 'touchend' ? [] : punto, changedTouches: punto })
  el.dispatchEvent(evento)
}

function Hoja({ cerrar }: { cerrar: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useArrastrarParaCerrar(ref, cerrar)
  return <div ref={ref} data-testid="hoja" style={{ height: 600 }} />
}

function Zona(props: { anterior: () => void; siguiente: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useDeslizarHorizontal(ref, props)
  return <div ref={ref} data-testid="zona" />
}

describe('transiciones', () => {
  test('la dirección sale de la profundidad de la ruta', () => {
    expect(direccionEntre('/demo/cliente', '/demo/cliente/entrenar')).toBe('adelante')
    expect(direccionEntre('/demo/cliente/entrenar', '/demo/cliente')).toBe('atras')
    expect(direccionEntre('/demo/cliente/progreso', '/demo/cliente/biblioteca')).toBe('lateral')
    // Hoy está un nivel por encima de las otras pestañas, pero sigue siendo un cambio de pestaña.
    expect(direccionEntre('/demo/cliente', '/demo/cliente/progreso')).toBe('lateral')
    expect(direccionEntre('/', '/biblioteca')).toBe('lateral')
    expect(direccionEntre('/admin', '/admin/clientes')).toBe('lateral')
    expect(direccionEntre('/admin/clientes', '/admin/clientes/ana')).toBe('adelante')
  })
  test('sin View Transitions el cambio se aplica al momento', () => {
    const actualizar = vi.fn()
    conTransicion('adelante', actualizar)
    expect(actualizar).toHaveBeenCalledOnce()
  })
})

describe('arrastrar una hoja hacia abajo', () => {
  test('lo bastante lejos, se cierra', () => {
    vi.useFakeTimers()
    const cerrar = vi.fn()
    const { getByTestId } = render(<Hoja cerrar={cerrar} />)
    const hoja = getByTestId('hoja')
    tocar(hoja, 'touchstart', 100, 100)
    tocar(hoja, 'touchmove', 100, 140)
    tocar(hoja, 'touchmove', 100, 320)
    expect(hoja.style.transform).toBe('translateY(220px)')
    tocar(hoja, 'touchend', 100, 320)
    vi.runAllTimers()
    expect(cerrar).toHaveBeenCalledOnce()
  })
  test('un poco, vuelve a su sitio', () => {
    const cerrar = vi.fn()
    const { getByTestId } = render(<Hoja cerrar={cerrar} />)
    const hoja = getByTestId('hoja')
    tocar(hoja, 'touchstart', 100, 100)
    tocar(hoja, 'touchmove', 100, 130)
    // Lento: sin velocidad suficiente para cerrar.
    tocar(hoja, 'touchend', 100, 130)
    expect(hoja.style.transform).toBe('')
    expect(cerrar).not.toHaveBeenCalled()
  })
  test('hacia arriba es scroll, no cierre', () => {
    const cerrar = vi.fn()
    const { getByTestId } = render(<Hoja cerrar={cerrar} />)
    const hoja = getByTestId('hoja')
    tocar(hoja, 'touchstart', 100, 300)
    tocar(hoja, 'touchmove', 100, 100)
    tocar(hoja, 'touchend', 100, 100)
    expect(hoja.style.transform).toBe('')
    expect(cerrar).not.toHaveBeenCalled()
  })
})

describe('deslizar en horizontal', () => {
  test('a la izquierda va al siguiente y a la derecha al anterior', () => {
    const anterior = vi.fn()
    const siguiente = vi.fn()
    const { getByTestId } = render(<Zona anterior={anterior} siguiente={siguiente} />)
    const zona = getByTestId('zona')
    tocar(zona, 'touchstart', 300, 200)
    tocar(zona, 'touchend', 150, 210)
    expect(siguiente).toHaveBeenCalledOnce()
    tocar(zona, 'touchstart', 100, 200)
    tocar(zona, 'touchend', 260, 195)
    expect(anterior).toHaveBeenCalledOnce()
  })
  test('un gesto vertical o corto no cambia de ejercicio', () => {
    const anterior = vi.fn()
    const siguiente = vi.fn()
    const { getByTestId } = render(<Zona anterior={anterior} siguiente={siguiente} />)
    const zona = getByTestId('zona')
    tocar(zona, 'touchstart', 300, 100)
    tocar(zona, 'touchend', 220, 400)
    tocar(zona, 'touchstart', 300, 100)
    tocar(zona, 'touchend', 260, 100)
    expect(siguiente).not.toHaveBeenCalled()
    expect(anterior).not.toHaveBeenCalled()
  })
})
