import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ImagenConMovimiento } from './ImagenConMovimiento'
import { BIBLIOTECA_INICIAL, PRESS_BANCA_15_SMITH } from '../datos/semilla/biblioteca'

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

it('un ejercicio con GIF se muestra en cuadro vertical; la foto normal no cambia', () => {
  movimientoReducido(false)
  const { container, rerender } = render(<ImagenConMovimiento ejercicio={conGif} className="hoja__imagen" />)
  expect(container.querySelector('img')!.className).toBe('hoja__imagen hoja__imagen--movimiento')
  rerender(<ImagenConMovimiento ejercicio={PRESS_BANCA_15_SMITH} className="hoja__imagen" />)
  expect(container.querySelector('img')!.className).toBe('hoja__imagen')
})

it('la animación del catálogo base sale horizontal y, sin conexión, vuelve a la foto', () => {
  movimientoReducido(false)
  const base = BIBLIOTECA_INICIAL.find((e) => e.id === PRESS_BANCA_15_SMITH.id)!
  const { container } = render(<ImagenConMovimiento ejercicio={base} className="hoja__imagen" />)
  expect(src(container)).toMatch(/^\/ejercicios\/animaciones\/press-banca-15-smith\.gif\?v=[0-9a-f]{8}$/)
  expect(container.querySelector('img')!.className).toBe('hoja__imagen hoja__imagen--movimiento-horizontal')
  fireEvent.error(container.querySelector('img')!)
  expect(src(container)).toBe(PRESS_BANCA_15_SMITH.imagen)
})

describe('notas bajo la imagen', () => {
  const NOTA_IA = /generada con IA/
  const NOTA_EQUIPO = 'La animación usa kettlebell; el ejercicio es el mismo con mancuerna.'
  const c203 = BIBLIOTECA_INICIAL.find((e) => e.id === 'sfm-catalog-c203')!
  const c217 = BIBLIOTECA_INICIAL.find((e) => e.id === 'sfm-catalog-c217')!

  it('C203 animado: sin nota de IA (el GIF es de fotos reales) y con el aviso de equipo', () => {
    movimientoReducido(false)
    render(<ImagenConMovimiento ejercicio={c203} className="hoja__imagen" />)
    expect(screen.queryByText(NOTA_IA)).toBeNull()
    expect(screen.getByText(NOTA_EQUIPO)).toBeInTheDocument()
  })

  it('C203 con movimiento reducido: se ve la foto IA, con su nota y sin el aviso de equipo', () => {
    movimientoReducido(true)
    render(<ImagenConMovimiento ejercicio={c203} className="hoja__imagen" />)
    expect(screen.getByText(NOTA_IA)).toBeInTheDocument()
    expect(screen.queryByText(NOTA_EQUIPO)).toBeNull()
  })

  it('si el GIF no carga y vuelve a la foto IA, aparece su nota', () => {
    movimientoReducido(false)
    const { container } = render(<ImagenConMovimiento ejercicio={c203} className="hoja__imagen" />)
    fireEvent.error(container.querySelector('img')!)
    expect(screen.getByText(NOTA_IA)).toBeInTheDocument()
    expect(screen.queryByText(NOTA_EQUIPO)).toBeNull()
  })

  it('un ejercicio IA sin animación (C217) lleva la nota, como siempre', () => {
    movimientoReducido(false)
    render(<ImagenConMovimiento ejercicio={c217} className="hoja__imagen" />)
    expect(screen.getByText(NOTA_IA)).toBeInTheDocument()
  })

  it('una animación sin aviso (press en Smith) y la del coach no llevan notas', () => {
    movimientoReducido(false)
    const smith = BIBLIOTECA_INICIAL.find((e) => e.id === PRESS_BANCA_15_SMITH.id)!
    const { container, rerender } = render(<ImagenConMovimiento ejercicio={smith} className="hoja__imagen" />)
    expect(container.querySelector('p')).toBeNull()
    rerender(<ImagenConMovimiento ejercicio={{ ...conGif, imagenGenerada: true }} className="hoja__imagen" />)
    expect(container.querySelector('p')).toBeNull()
  })
})
