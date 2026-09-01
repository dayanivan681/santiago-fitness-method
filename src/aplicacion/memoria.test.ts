import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMemoria } from './memoria'

describe('memoria de sección', () => {
  it('arranca con el valor inicial', () => {
    const { result } = renderHook(() => useMemoria<string | null>(null))

    expect(result.current.valor).toBeNull()
  })

  it('recuerda lo último elegido', () => {
    // Arrange
    const { result } = renderHook(() => useMemoria<string | null>(null))

    // Act
    act(() => result.current.recordar('lower-a'))

    // Assert
    expect(result.current.valor).toBe('lower-a')
  })

  it('mantiene la misma función entre repintados', () => {
    // Si cambiara, los efectos que la usan como dependencia se dispararían solos.
    const { result, rerender } = renderHook(() => useMemoria(0))
    const primera = result.current.recordar

    rerender()

    expect(result.current.recordar).toBe(primera)
  })
})
