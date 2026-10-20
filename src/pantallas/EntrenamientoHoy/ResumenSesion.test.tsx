import { afterEach, expect, test, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { ContadorResumen } from './ResumenSesion'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

test('cuenta por fotogramas hasta el valor final y cancela al desmontar', () => {
  const cuadros = new Map<number, FrameRequestCallback>()
  let id = 0
  vi.stubGlobal('requestAnimationFrame', vi.fn((f: FrameRequestCallback) => { cuadros.set(++id, f); return id }))
  const cancelar = vi.fn((n: number) => cuadros.delete(n))
  vi.stubGlobal('cancelAnimationFrame', cancelar)
  const avanzar = (ahora: number) => act(() => { const pendientes = [...cuadros.values()]; cuadros.clear(); pendientes.forEach(f => f(ahora)) })
  const { unmount } = render(<ContadorResumen valor={20} demora={60} />)
  expect(screen.getByLabelText('20')).toHaveTextContent('0')
  avanzar(0)
  avanzar(60)
  expect(screen.getByLabelText('20')).toHaveTextContent('0')
  avanzar(360)
  expect(screen.getByLabelText('20')).toHaveTextContent('18')
  avanzar(660)
  expect(screen.getByLabelText('20')).toHaveTextContent('20')
  expect(cuadros.size).toBe(0)
  unmount()
  expect(cancelar).toHaveBeenCalled()
})

test('con movimiento reducido pinta directamente el valor final, sin programar cuadros', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  const cuadro = vi.fn()
  vi.stubGlobal('requestAnimationFrame', cuadro)
  render(<ContadorResumen valor={37} />)
  expect(screen.getByLabelText('37')).toHaveTextContent('37')
  expect(cuadro).not.toHaveBeenCalled()
})

test('cancelar a mitad no deja fotogramas pendientes', () => {
  vi.stubGlobal('requestAnimationFrame', () => 25)
  const cancelar = vi.fn()
  vi.stubGlobal('cancelAnimationFrame', cancelar)
  const { unmount } = render(<ContadorResumen valor={10} />)
  unmount()
  expect(cancelar).toHaveBeenCalledWith(25)
})

test('activar Reducir movimiento durante la cuenta cancela y muestra el final', () => {
  let reducido = false
  let cambiar: (() => void) | undefined
  vi.stubGlobal('matchMedia', () => ({ matches: reducido,
    addEventListener: (_: string, fn: () => void) => { cambiar = fn }, removeEventListener: vi.fn() }))
  vi.stubGlobal('requestAnimationFrame', () => 42)
  const cancelar = vi.fn()
  vi.stubGlobal('cancelAnimationFrame', cancelar)
  render(<ContadorResumen valor={18} />)
  act(() => { reducido = true; cambiar?.() })
  expect(screen.getByLabelText('18')).toHaveTextContent('18')
  expect(cancelar).toHaveBeenCalledWith(42)
})
