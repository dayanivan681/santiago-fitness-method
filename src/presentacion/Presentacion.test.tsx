import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Presentacion } from './Presentacion'

describe('Presentación de la app', () => {
  it('explica el flujo actual sin presentar funciones futuras como disponibles', () => {
    render(<Presentacion />)

    expect(screen.getByRole('heading', { name: 'Cómo la usa el participante' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cómo la usa el coach' })).toBeInTheDocument()
    expect(screen.getByText(/La consola Coach\/Admin está protegida por Cloudflare Access/)).toBeInTheDocument()
    expect(
      screen.getByText(/series, sesiones, fotos y progreso siguen locales/),
    ).toBeInTheDocument()
  })

  it('muestra únicamente capturas identificadas como pantallas reales', () => {
    render(<Presentacion />)

    expect(screen.getByAltText(/Pantalla real de Entrenamiento de hoy/)).toHaveAttribute(
      'src',
      '/presentacion/hoy.png',
    )
    expect(screen.queryByAltText('Pantalla Coach real editando Upper A')).not.toBeInTheDocument()
    expect(screen.getByAltText('Biblioteca real con ejercicios e imágenes')).toHaveAttribute(
      'src',
      '/presentacion/biblioteca.png',
    )
  })

  it('enlaza todos los llamados a la aplicación real', () => {
    render(<Presentacion />)

    const cierre = screen.getByRole('contentinfo')
    expect(within(cierre).getByRole('link', { name: 'Abrir Santiago Fitness Method' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getAllByRole('link', { name: /Abrir/ }).every((link) => link.getAttribute('href') === '/')).toBe(true)
  })
})
