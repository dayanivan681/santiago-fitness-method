import { describe, expect, it } from 'vitest'
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
