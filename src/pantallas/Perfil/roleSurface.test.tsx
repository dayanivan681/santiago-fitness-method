import 'fake-indexeddb/auto'
import { afterEach, describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Perfil } from './Perfil'
import { repositorioDePrueba } from '../../pruebas/base'
import { sembrar } from '../../datos/semilla'
import { sembrarParticipante } from '../../pruebas/participante'

describe('superficie del participante', () => {
  afterEach(() => window.localStorage.removeItem('sfm_cliente_id'))

  test('no expone edición de coach, restricciones ni estructura de rutina', async () => {
    const repositorio = repositorioDePrueba()
    await sembrar(repositorio)
    await sembrarParticipante(repositorio)

    render(<Perfil repositorio={repositorio} soloParticipante />)

    await screen.findByText('Participante')
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Ejercicio a evitar')).not.toBeInTheDocument()
    expect(screen.queryByText('Estructura de 4 días')).not.toBeInTheDocument()
    expect(screen.queryByText(/Editable por el coach/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cerrar sesión' })).toHaveAttribute('href', '/salir')
  })
})
