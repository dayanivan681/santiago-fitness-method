import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PanelProgreso } from './PanelProgreso'
import { BaseDatosSantiago } from '../../datos/esquema'
import { RepositorioLocal } from '../../datos/repositorioLocal'
import { sembrarParticipante } from '../../pruebas/participante'
import type { Participante } from '../../dominio/tipos'

let repositorio: RepositorioLocal
let participante: Participante

// jsdom no tiene URLs de objeto y la miniatura las necesita.
beforeEach(async () => {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: () => 'blob:prueba',
    revokeObjectURL: () => {},
  })
  repositorio = new RepositorioLocal(
    new BaseDatosSantiago(`prueba-progreso-${crypto.randomUUID()}`),
  )
  participante = await sembrarParticipante(repositorio)
})

async function abrir() {
  render(<PanelProgreso participante={participante} repositorio={repositorio} />)
  await screen.findByText('Progreso')
}

async function anotar(campo: string, valor: string) {
  const entrada = screen.getByLabelText(campo)
  await userEvent.clear(entrada)
  await userEvent.type(entrada, valor)
}

describe('medidas y fotos con fecha (V1)', () => {
  test('guarda una medida con su fecha', async () => {
    // Arrange
    await abrir()

    // Act
    await anotar('Fecha', '2026-08-01')
    await anotar('Cintura (in)', '34')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar medición' }))

    // Assert
    await waitFor(async () => {
      const [registro] = await repositorio.listarProgreso(participante.id)
      expect(registro.fecha).toBe('2026-08-01')
      expect(registro.medidas.cinturaPulgadas).toBe(34)
    })
  })

  test('una fila sin medidas ni foto no se guarda', async () => {
    // Sólo la fecha no cuenta nada.
    await abrir()

    await userEvent.click(screen.getByRole('button', { name: 'Guardar medición' }))

    expect(await screen.findByText('Apunta al menos una medida o una foto.')).toBeInTheDocument()
    expect(await repositorio.listarProgreso(participante.id)).toHaveLength(0)
  })

  test('enseña la variación respecto a la medición anterior', async () => {
    // Arrange: en agosto la cintura estaba en 34
    await abrir()
    await anotar('Fecha', '2026-08-01')
    await anotar('Cintura (in)', '34')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar medición' }))
    await screen.findByText('1 ago')

    // Act: en septiembre está en 32
    await anotar('Fecha', '2026-09-01')
    await anotar('Cintura (in)', '32')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar medición' }))

    // Assert: la diferencia se muestra con su signo, sin calificarla
    expect(await screen.findByText('−2 in')).toBeInTheDocument()
  })

  test('lo más reciente aparece primero', async () => {
    await abrir()
    await anotar('Fecha', '2026-08-01')
    await anotar('Peso corporal (lb)', '180')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar medición' }))
    await screen.findByText('1 ago')

    await anotar('Fecha', '2026-09-01')
    await anotar('Peso corporal (lb)', '175')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar medición' }))
    await screen.findByText('1 sep')

    const fechas = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(fechas).toEqual(['1 sep', '1 ago'])
  })

  test('guarda la foto en el dispositivo y la muestra', async () => {
    // Arrange
    await abrir()
    const foto = new File(['imagen'], 'progreso.jpg', { type: 'image/jpeg' })

    // Act
    await userEvent.upload(screen.getByLabelText('Foto'), foto)
    await userEvent.click(screen.getByRole('button', { name: 'Guardar medición' }))

    // Assert
    await waitFor(async () => {
      const [registro] = await repositorio.listarProgreso(participante.id)
      expect(registro.tieneFoto).toBe(true)
      expect(await repositorio.obtenerFotoDeProgreso(registro.id)).toBeDefined()
    })
    expect(await screen.findByAltText(/Foto de progreso/)).toBeInTheDocument()
  })

  test('se puede borrar una medición equivocada, con su foto', async () => {
    // Arrange
    await abrir()
    await userEvent.upload(
      screen.getByLabelText('Foto'),
      new File(['imagen'], 'progreso.jpg', { type: 'image/jpeg' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Guardar medición' }))
    const borrar = await screen.findByRole('button', { name: /Borrar la medición/ })
    const [registro] = await repositorio.listarProgreso(participante.id)

    // Act
    await userEvent.click(borrar)

    // Assert: no queda ni el registro ni la imagen ocupando sitio
    await waitFor(async () => {
      expect(await repositorio.listarProgreso(participante.id)).toHaveLength(0)
    })
    expect(await repositorio.obtenerFotoDeProgreso(registro.id)).toBeUndefined()
  })

  test('sin mediciones lo dice, en vez de dejar el hueco vacío', async () => {
    await abrir()

    expect(screen.getByText('Todavía no hay mediciones.')).toBeInTheDocument()
  })
})
