import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { FilaSerie } from './FilaSerie'
import { BIBLIOTECA_INICIAL } from '../../datos/semilla/biblioteca'

/**
 * Estados de guardar una serie (pulido UI, fase 2): pendiente, error y
 * reintento. El éxito lo pinta el padre cuando la serie ya está registrada.
 */
afterEach(cleanup)

const ejercicio = BIBLIOTECA_INICIAL[0]
const etiqueta = `serie 1 de ${ejercicio.nombre}`
const boton = () => screen.getByRole('button', { name: `Guardar la ${etiqueta}` })

function montar(onGuardar: () => Promise<void>) {
  render(
    <FilaSerie
      numeroSerie={1}
      ejercicio={ejercicio}
      repMin={1}
      conEtiquetas
      onGuardar={onGuardar}
      onCorregir={vi.fn()}
    />,
  )
}

it('un doble toque registra la serie una sola vez y se ve que está guardando', async () => {
  let terminar = () => {}
  const onGuardar = vi.fn(() => new Promise<void>((r) => { terminar = r }))
  montar(onGuardar)

  fireEvent.click(boton())
  fireEvent.click(boton())

  expect(onGuardar).toHaveBeenCalledTimes(1)
  expect(boton()).toHaveTextContent('Guardando…')
  expect(boton()).toHaveAttribute('aria-busy', 'true')
  terminar()
  await waitFor(() => expect(boton()).not.toHaveAttribute('aria-busy', 'true'))
})

it('si falla, conserva lo tecleado, lo dice y ofrece «Reintentar»', async () => {
  const onGuardar = vi
    .fn<() => Promise<void>>()
    .mockRejectedValueOnce(new Error('Sin conexión con el teléfono'))
    .mockResolvedValueOnce(undefined)
  montar(onGuardar)
  fireEvent.click(screen.getByRole('button', { name: `Subir peso de la ${etiqueta}` }))
  const peso = screen.getByRole('button', { name: `Peso de la ${etiqueta}` })
  const antes = peso.textContent

  fireEvent.click(boton())

  expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión con el teléfono')
  expect(boton()).toHaveTextContent('Reintentar')
  expect(screen.getByRole('button', { name: `Peso de la ${etiqueta}` }).textContent).toBe(antes)

  fireEvent.click(boton())
  await waitFor(() => expect(onGuardar).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
})
