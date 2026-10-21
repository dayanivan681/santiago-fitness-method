import { act, cleanup, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RESPALDO_CIERRE_MS, usePresencia } from './usePresencia'

/**
 * Controlador de presencia de las hojas (pulido UI, fase 3): la hoja sale
 * animada y sólo entonces se desmonta, sin cierres dobles ni callbacks
 * colgando.
 */

type ConAnimaciones = { getAnimations?: () => Animation[] }
const prototipo = Element.prototype as unknown as ConAnimaciones
const original = prototipo.getAnimations
const movimientoReducido = (reducir: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: reducir && q.includes('reduce'),
    media: q,
    addEventListener() {},
    removeEventListener() {},
  }))

beforeEach(() => {
  vi.useFakeTimers()
  // jsdom no trae getAnimations: se simula un navegador que sí anima.
  prototipo.getAnimations = () => []
  movimientoReducido(false)
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  prototipo.getAnimations = original
})

describe('usePresencia', () => {
  it.each([false, true])('cierra tras el montaje doble de StrictMode, movimiento reducido=%s', (reducir) => {
    movimientoReducido(reducir)
    const alCerrar = vi.fn()
    const { result } = renderHook(() => usePresencia(alCerrar), { wrapper: StrictMode })
    act(() => result.current.salir())
    act(() => vi.advanceTimersByTime(RESPALDO_CIERRE_MS))
    expect(alCerrar).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('pedir el cierre dos veces cierra una sola vez', () => {
    const alCerrar = vi.fn()
    const { result } = renderHook(() => usePresencia(alCerrar))

    act(() => {
      result.current.salir()
      result.current.salir()
    })
    expect(result.current.saliendo).toBe(true)
    act(() => result.current.alTerminarAnimacion())
    act(() => result.current.alTerminarAnimacion())
    act(() => vi.advanceTimersByTime(RESPALDO_CIERRE_MS * 2))

    expect(alCerrar).toHaveBeenCalledTimes(1)
  })

  it('si no llega animationend, el temporizador de respaldo cierra igual', () => {
    const alCerrar = vi.fn()
    const { result } = renderHook(() => usePresencia(alCerrar))

    act(() => result.current.salir())
    act(() => vi.advanceTimersByTime(RESPALDO_CIERRE_MS - 1))
    expect(alCerrar).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))

    expect(alCerrar).toHaveBeenCalledTimes(1)
  })

  it('navegar mientras se cierra (la hoja se desmonta) no deja el callback pendiente', () => {
    const alCerrar = vi.fn()
    const { result, unmount } = renderHook(() => usePresencia(alCerrar))

    act(() => result.current.salir())
    unmount()
    act(() => vi.advanceTimersByTime(RESPALDO_CIERRE_MS * 2))

    expect(alCerrar).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('con movimiento reducido cierra al momento, sin pasar por «saliendo»', () => {
    movimientoReducido(true)
    const alCerrar = vi.fn()
    const { result } = renderHook(() => usePresencia(alCerrar))

    act(() => result.current.salir())

    expect(alCerrar).toHaveBeenCalledTimes(1)
    expect(result.current.saliendo).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('donde no hay animaciones (sin getAnimations) también cierra al momento', () => {
    delete prototipo.getAnimations
    const alCerrar = vi.fn()
    const { result } = renderHook(() => usePresencia(alCerrar))

    act(() => result.current.salir())

    expect(alCerrar).toHaveBeenCalledTimes(1)
  })

  it('usa siempre el callback más reciente', () => {
    const primero = vi.fn()
    const segundo = vi.fn()
    const { result, rerender } = renderHook(({ fn }) => usePresencia(fn), { initialProps: { fn: primero } })

    rerender({ fn: segundo })
    act(() => result.current.salir())
    act(() => result.current.alTerminarAnimacion())

    expect(primero).not.toHaveBeenCalled()
    expect(segundo).toHaveBeenCalledTimes(1)
  })
})
