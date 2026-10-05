import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraficaProgreso } from './GraficaProgreso'
import type { PuntoProgreso } from '../logica/progresoGrafica'

const puntos: PuntoProgreso[] = [180,190,200,200,210].map((pesoLb,i) => ({fecha:`2026-09-${12+i}`,pesoLb,porLado:false,reps:i===2||i===4?10:12,rir:i===2?5:2}))
describe('gráfica de progreso', () => {
  it('dibuja cinco puntos por panel, resume +30 y selecciona el último', () => {
    render(<GraficaProgreso puntos={puntos} />)
    expect(screen.getByRole('heading',{level:2})).toHaveTextContent('+30')
    const imagenes = screen.getAllByRole('img')
    expect(imagenes).toHaveLength(2)
    expect(imagenes[0].querySelectorAll('circle')).toHaveLength(5)
    expect(screen.getByRole('status')).toHaveTextContent('210 lb × 10 · RIR 2')
    expect(screen.getAllByRole('button',{pressed:true})).toHaveLength(2)
  })
  it('permite elegir con teclado y muestra el RIR 5+', async () => {
    render(<GraficaProgreso puntos={puntos} />)
    const boton = screen.getByRole('button',{name:/200 lb por 10 repeticiones.*Peso/})
    boton.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent('200 lb × 10 · RIR 5+')
  })
  it('avisa con cero y una sesión', () => {
    const {rerender} = render(<GraficaProgreso puntos={[]} />)
    expect(screen.getByText(/segunda sesión/)).toBeInTheDocument()
    rerender(<GraficaProgreso puntos={puntos.slice(0,1)} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
  it('muestra lb/lado y permite tocar cada panel', async () => {
    render(<GraficaProgreso puntos={puntos.map(p=>({...p,porLado:true}))} />)
    await userEvent.click(screen.getByRole('button',{name:/180 lb\/lado.*Repeticiones/}))
    expect(screen.getByRole('status')).toHaveTextContent('180 lb/lado × 12')
  })
  it('resume repeticiones cuando no cambia el peso y actualiza datos corregidos', () => {
    const {rerender} = render(<GraficaProgreso puntos={[{...puntos[0],reps:8},{...puntos[1],pesoLb:180}]} />)
    expect(screen.getByRole('heading',{level:2})).toHaveTextContent('de 8 a 12 repeticiones (+4)')
    rerender(<GraficaProgreso puntos={puntos} />)
    expect(within(screen.getByRole('status')).getByText(/210 lb/)).toBeInTheDocument()
  })
})

describe('escala y desplazamiento', () => {
  it('la escala muestra el mínimo y el máximo de los valores, no 0', () => {
    const dos: PuntoProgreso[] = [25, 30].map((pesoLb, i) => ({ fecha: `2026-09-${10 + i}`, pesoLb, porLado: false, reps: 10, rir: 2 }))
    const { container } = render(<GraficaProgreso puntos={dos} />)
    const escalas = [...container.querySelectorAll('.grafica-progreso__escala')].map(e => e.textContent)
    expect(escalas.slice(0, 2)).toEqual(['35', '20'])
    expect(container.querySelector('svg text')?.textContent).not.toBe('0')
  })

  it('con muchas sesiones se abre al final y los dos paneles se desplazan juntos', () => {
    const muchos: PuntoProgreso[] = Array.from({ length: 10 }, (_, i) => ({ fecha: `2026-08-${10 + i}`, pesoLb: 100 + i * 5, porLado: false, reps: 10, rir: 2 }))
    const ancho = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollWidth')
    Object.defineProperty(Element.prototype, 'scrollWidth', { configurable: true, get: () => 600 })
    try {
      const { container } = render(<GraficaProgreso puntos={muchos} />)
      const [peso, reps] = [...container.querySelectorAll<HTMLDivElement>('.grafica-progreso__scroll')]
      expect(peso.scrollLeft).toBe(600)
      expect(reps.scrollLeft).toBe(600)
      peso.scrollLeft = 120
      peso.dispatchEvent(new Event('scroll'))
      expect(reps.scrollLeft).toBe(120)
    } finally {
      if (ancho) Object.defineProperty(Element.prototype, 'scrollWidth', ancho)
    }
  })
})

describe('huecos de tiempo y RIR a la vista', () => {
  /** El panel mide lo que mediría la tarjeta en un teléfono de 375 px. */
  function conAncho(ancho: number) {
    vi.stubGlobal('ResizeObserver', class {
      readonly cb: ResizeObserverCallback
      constructor(cb: ResizeObserverCallback) { this.cb = cb }
      observe() { this.cb([{ contentRect: { width: ancho } } as ResizeObserverEntry], this as unknown as ResizeObserver) }
      disconnect() {}
    })
  }
  afterEach(() => vi.unstubAllGlobals())

  const conPausa: PuntoProgreso[] = ['2026-08-01', '2026-08-05', '2026-08-09', '2026-08-30', '2026-09-03'].map((fecha, i) => ({
    fecha, pesoLb: 100 + i * 5, porLado: false, reps: 10, rir: [3, 3, 2, 2, 1][i],
  }))
  const rires = (c: HTMLElement) => [...c.querySelectorAll('.grafica-progreso__rir')].map(t => t.textContent)

  it('a 375 px, con 5 puntos, cada punto de Peso lleva su RIR y Repeticiones no lo repite', () => {
    conAncho(343)
    const { container } = render(<GraficaProgreso puntos={conPausa} />)
    const [peso, reps] = screen.getAllByRole('img')
    expect(rires(peso as unknown as HTMLElement)).toEqual(['RIR 3', 'RIR 3', 'RIR 2', 'RIR 2', 'RIR 1'])
    expect(rires(reps as unknown as HTMLElement)).toEqual([])
    expect(rires(container)).toHaveLength(5)
  })

  it('con 12 puntos sólo el seleccionado lleva el RIR, y sigue al tocar otro', async () => {
    conAncho(343)
    const doce: PuntoProgreso[] = Array.from({ length: 12 }, (_, i) => ({ fecha: `2026-08-${10 + i}`, pesoLb: 100 + i, porLado: false, reps: 10, rir: i === 3 ? 5 : 2 }))
    const { container } = render(<GraficaProgreso puntos={doce} />)
    expect(rires(container)).toEqual(['RIR 2'])
    await userEvent.click(screen.getByRole('button', { name: /103 lb por 10 repeticiones.*Peso/ }))
    expect(rires(container)).toEqual(['RIR 5+'])
  })

  it('una pausa de 3 semanas: tramo discontinuo, «3 sem» y el lector lo dice', () => {
    conAncho(343)
    const { container } = render(<GraficaProgreso puntos={conPausa} />)
    expect(container.querySelectorAll('.grafica-progreso__linea--hueco')).toHaveLength(2)
    expect([...container.querySelectorAll('.grafica-progreso__hueco')].map(t => t.textContent)).toEqual(['3 sem', '3 sem'])
    expect(screen.getAllByRole('img')[0]).toHaveAttribute('aria-label', expect.stringContaining('Con 1 pausa de 3 semanas.'))
  })

  it('con sitio, la etiqueta completa «3 sem sin entrenar» y las fechas a los dos lados', () => {
    conAncho(900)
    const { container } = render(<GraficaProgreso puntos={conPausa} />)
    expect(container.querySelector('.grafica-progreso__hueco')).toHaveTextContent('3 sem sin entrenar')
    const fechas = [...container.querySelectorAll('svg')][0].querySelectorAll('.grafica-progreso__fecha')
    expect([...fechas].map(f => f.textContent)).toHaveLength(4)
  })

  it('el titular compara el esfuerzo del primer y el último punto', () => {
    conAncho(343)
    render(<GraficaProgreso puntos={conPausa} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('(+20), con más esfuerzo (RIR 3 → 1)')
  })
})
