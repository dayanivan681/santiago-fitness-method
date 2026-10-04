import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ImagenConMovimiento } from './ImagenConMovimiento'
import { PRESS_BANCA_15_SMITH } from '../datos/semilla/biblioteca'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const conGif = { ...PRESS_BANCA_15_SMITH, animacion: '/api/v2/biblioteca/coach-ej-x/animacion?v=1' }
const src = (c: HTMLElement) => c.querySelector('img')!.getAttribute('src')
const movimientoReducido = (reducir: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reducir && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))

it('reproduce el GIF en la ficha y, si no carga (sin conexión), vuelve a la foto fija', () => {
  movimientoReducido(false)
  const { container } = render(<ImagenConMovimiento ejercicio={conGif} className="hoja__imagen" />)
  expect(src(container)).toBe(conGif.animacion)
  fireEvent.error(container.querySelector('img')!)
  expect(src(container)).toBe(conGif.imagen)
})

it('con «reducir movimiento» muestra la foto y un botón para ver el GIF', () => {
  movimientoReducido(true)
  const { container } = render(<ImagenConMovimiento ejercicio={conGif} className="hoja__imagen" />)
  expect(src(container)).toBe(conGif.imagen)
  fireEvent.click(screen.getByRole('button', { name: 'Ver movimiento' }))
  expect(src(container)).toBe(conGif.animacion)
})

it('sin animación es la foto de siempre, sin botón', () => {
  movimientoReducido(true)
  const { container } = render(<ImagenConMovimiento ejercicio={PRESS_BANCA_15_SMITH} className="hoja__imagen" />)
  expect(src(container)).toBe(PRESS_BANCA_15_SMITH.imagen)
  expect(screen.queryByRole('button')).toBeNull()
})
