import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { useMemoria } from './memoria'
import { Biblioteca } from '../pantallas/Biblioteca/Biblioteca'
import { baseDePrueba } from '../pruebas/base'
import { RepositorioPilotoDePrueba as RepositorioLocal } from '../pruebas/base'
import { sembrar } from '../datos/semilla'
import type { Musculo } from '../dominio/tipos'

/**
 * Contexto de sección entre visitas.
 *
 * Cambiar de pestaña desmonta la pantalla —para no dejar vivas cuatro consultas
 * de Dexie a la vez— pero lo que el participante eligió no puede perderse: en
 * el gimnasio, volver de la ficha de un ejercicio y encontrarse el filtro
 * reseteado obliga a repetir el gesto cada vez.
 *
 * Se monta el mismo montaje que hace `App`: la memoria arriba, la pantalla
 * desmontándose de verdad.
 */

let repositorio: RepositorioLocal

beforeEach(async () => {
  repositorio = new RepositorioLocal(baseDePrueba(`prueba-ctx-${crypto.randomUUID()}`))
  await sembrar(repositorio)
})

/** Dos pestañas que se sustituyen, con la memoria colgando por encima. */
function Aplicacion({ conMemoria }: { readonly conMemoria: boolean }) {
  const [seccion, setSeccion] = useState<'biblioteca' | 'otra'>('biblioteca')
  const filtro = useMemoria<Musculo | 'todos'>('todos')

  return (
    <>
      {seccion === 'biblioteca' ? (
        <Biblioteca repositorio={repositorio} memoriaFiltro={conMemoria ? filtro : undefined} />
      ) : (
        <p>Otra sección</p>
      )}
      <button type="button" onClick={() => setSeccion('otra')}>
        Ir a otra
      </button>
      <button type="button" onClick={() => setSeccion('biblioteca')}>
        Volver
      </button>
    </>
  )
}

async function filtrarPorPecho() {
  await screen.findByText('Biblioteca')
  await userEvent.click(await screen.findByRole('button', { name: /^Filtrar/ }))
  const hoja = screen.getByRole('dialog', { name: 'Filtrar' })
  await userEvent.click(within(within(hoja).getByRole('group', { name: 'Músculo' })).getByRole('button', { name: 'Pecho' }))
  await userEvent.click(within(hoja).getByRole('button', { name: /^Ver \d+ ejercicio/ }))
  expect(screen.getByRole('button', { name: 'Quitar Pecho' })).toBeInTheDocument()
}

describe('contexto de sección', () => {
  test('volver a Biblioteca conserva el filtro elegido', async () => {
    // Arrange
    render(<Aplicacion conMemoria />)
    await filtrarPorPecho()

    // Act: la pantalla se desmonta y se vuelve a montar
    await userEvent.click(screen.getByRole('button', { name: 'Ir a otra' }))
    expect(screen.queryByRole('button', { name: 'Quitar Pecho' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }))

    // Assert
    expect(await screen.findByRole('button', { name: 'Quitar Pecho' })).toBeInTheDocument()
  })

  test('sin memoria se pierde: es exactamente lo que arregla el cambio', async () => {
    // La otra mitad de la prueba anterior. Sin esto, pasaría igual si la
    // memoria no hiciera nada.
    render(<Aplicacion conMemoria={false} />)
    await filtrarPorPecho()

    await userEvent.click(screen.getByRole('button', { name: 'Ir a otra' }))
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }))

    await screen.findByRole('button', { name: /^Filtrar/ })
    expect(screen.queryByRole('button', { name: 'Quitar Pecho' })).not.toBeInTheDocument()
  })
})
