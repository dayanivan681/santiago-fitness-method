import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { HojaCapa } from './HojaCapa'
import { Hoja } from '../producto/ui'
import { RESPALDO_CIERRE_MS } from '../aplicacion/usePresencia'

/**
 * Cierre animado de las dos hojas (pulido UI, fase 3), con un navegador que
 * sí anima: la hoja pinta su salida y sólo después se desmonta.
 */

type ConAnimaciones = { getAnimations?: () => Animation[] }
const prototipo = Element.prototype as unknown as ConAnimaciones
const original = prototipo.getAnimations

beforeEach(() => {
  prototipo.getAnimations = () => []
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  prototipo.getAnimations = original
})

/** Un botón que abre la hoja y la desmonta cuando la hoja avisa. */
function ConHoja({ tipo, alCerrar = () => {} }: { readonly tipo: 'cliente' | 'coach'; readonly alCerrar?: () => void }) {
  const [abierta, setAbierta] = useState(false)
  const cerrar = () => {
    alCerrar()
    setAbierta(false)
  }
  return (
    <>
      <button type="button" onClick={() => setAbierta(true)}>
        Abrir
      </button>
      {abierta &&
        (tipo === 'cliente' ? (
          <HojaCapa etiqueta="Prueba" titulo="Prueba" onCerrar={cerrar}>
            <p className="dentro">Contenido</p>
          </HojaCapa>
        ) : (
          <Hoja titulo="Prueba" cerrar={cerrar}>
            <input type="file" aria-label="Foto" />
          </Hoja>
        ))}
    </>
  )
}

describe('hoja del cliente (HojaCapa)', () => {
  const panel = () => document.querySelector('.hoja__panel') as HTMLElement

  it('al cerrar pinta la salida y, al terminar, se desmonta y devuelve el foco', () => {
    render(<ConHoja tipo="cliente" />)
    const abrir = screen.getByRole('button', { name: 'Abrir' })
    abrir.focus()
    fireEvent.click(abrir)

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(screen.getByRole('dialog')).toHaveClass('hoja--saliendo')
    fireEvent.animationEnd(panel())
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(abrir)
  })

  it('una animación de dentro (un ✓, un aviso) no cierra la hoja', () => {
    render(<ConHoja tipo="cliente" />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    fireEvent.keyDown(document, { key: 'Escape' })

    fireEvent.animationEnd(document.querySelector('.dentro') as HTMLElement)

    expect(screen.getByRole('dialog')).toHaveClass('hoja--saliendo')
  })

  it('Escape dos veces cierra una sola vez y el respaldo cierra sin animationend', () => {
    vi.useFakeTimers()
    const alCerrar = vi.fn()
    render(<ConHoja tipo="cliente" alCerrar={alCerrar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.keyDown(document, { key: 'Escape' })
    act(() => vi.advanceTimersByTime(RESPALDO_CIERRE_MS))

    expect(alCerrar).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('hoja del coach (<Hoja> con <dialog>)', () => {
  const dialogo = () => document.querySelector('dialog') as HTMLDialogElement

  it('el botón Cerrar pinta la salida; al terminar se desmonta y devuelve el foco', () => {
    const alCerrar = vi.fn()
    render(<ConHoja tipo="coach" alCerrar={alCerrar} />)
    const abrir = screen.getByRole('button', { name: 'Abrir' })
    abrir.focus()
    fireEvent.click(abrir)

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(dialogo()).toHaveClass('sfm-hoja--saliendo')
    expect(alCerrar).not.toHaveBeenCalled()

    fireEvent.animationEnd(dialogo())
    expect(alCerrar).toHaveBeenCalledTimes(1)
    expect(document.querySelector('dialog')).toBeNull()
    expect(document.activeElement).toBe(abrir)
  })

  it('Escape no cierra de golpe: evita el cierre nativo y sale animada', () => {
    render(<ConHoja tipo="coach" />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    const evento = new Event('cancel', { cancelable: true })
    act(() => {
      dialogo().dispatchEvent(evento)
    })

    expect(evento.defaultPrevented).toBe(true)
    expect(dialogo()).toHaveClass('sfm-hoja--saliendo')
  })

  it('cancelar el selector de fotos no cierra ni empieza a salir', () => {
    const alCerrar = vi.fn()
    render(<ConHoja tipo="coach" alCerrar={alCerrar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    fireEvent(screen.getByLabelText('Foto'), new Event('cancel', { bubbles: true, cancelable: true }))

    expect(dialogo()).not.toHaveClass('sfm-hoja--saliendo')
    expect(alCerrar).not.toHaveBeenCalled()
  })

  it('con movimiento reducido cierra al momento', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
    const alCerrar = vi.fn()
    render(<ConHoja tipo="coach" alCerrar={alCerrar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }))

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(alCerrar).toHaveBeenCalledTimes(1)
    expect(document.querySelector('dialog')).toBeNull()
  })
})
