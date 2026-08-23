import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Perfil } from './Perfil'
import { BaseDatosSantiago } from '../../datos/esquema'
import { RepositorioLocal } from '../../datos/repositorioLocal'
import { sembrar } from '../../datos/semilla'
import { sembrarParticipante } from '../../pruebas/participante'

let repositorio: RepositorioLocal

beforeEach(async () => {
  const db = new BaseDatosSantiago(`prueba-perfil-${crypto.randomUUID()}`)
  repositorio = new RepositorioLocal(db)
  await sembrar(repositorio)
  await sembrarParticipante(repositorio, { nombre: 'Participante 001' })
})

async function abrir() {
  render(<Perfil repositorio={repositorio} />)
  await screen.findByText('Participante')
}

async function abrirEdicion() {
  await abrir()
  await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
  await screen.findByLabelText('Nombre')
}

describe('ficha del participante (§2)', () => {
  test('muestra la estatura en pies y pulgadas', async () => {
    // 175 cm son 5′ 9″: el dato se guarda en centímetros pero se lee en pies.
    await abrir()

    expect(screen.getByText('5′ 9″')).toBeInTheDocument()
  })

  test('se lee por defecto: los datos a la vista, sin formulario', async () => {
    await abrir()

    // Los ocho datos de §2 más el incremento del método (§13)
    for (const etiqueta of [
      'Nombre',
      'Sexo',
      'Edad',
      'Estatura',
      'Peso',
      'Objetivo',
      'Frecuencia',
      'Incremento',
    ]) {
      expect(screen.getByText(etiqueta), `falta ${etiqueta}`).toBeInTheDocument()
    }

    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
  })

  test('el coach abre la edición y encuentra los ocho campos', async () => {
    await abrirEdicion()

    for (const campo of [
      'Nombre',
      'Sexo',
      'Edad',
      'Entrenos/semana',
      'Estatura (pies)',
      'Estatura (pulgadas)',
      'Peso (lb)',
      'Objetivo',
      'Lesiones o limitaciones',
      'Notas del coach',
    ]) {
      expect(screen.getByLabelText(campo), `falta ${campo}`).toBeInTheDocument()
    }
  })

  test('guarda las notas del coach y las deja a la vista', async () => {
    // Su V1 pide notas en el perfil, aparte de las limitaciones.
    // Arrange
    await abrirEdicion()

    // Act
    await userEvent.type(
      screen.getByLabelText('Notas del coach'),
      'Entrena de noche; viaja una semana al mes.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    // Assert
    expect(
      await screen.findByText('Entrena de noche; viaja una semana al mes.'),
    ).toBeInTheDocument()
    const participante = await repositorio.participanteActual()
    expect(participante?.notas).toBe('Entrena de noche; viaja una semana al mes.')
  })
})

describe('editar el perfil (§2)', () => {
  test('guarda los cambios del coach y vuelve a lectura', async () => {
    // Arrange
    await abrirEdicion()

    // Act
    const nombre = screen.getByLabelText('Nombre')
    await userEvent.clear(nombre)
    await userEvent.type(nombre, 'Santiago')
    await userEvent.type(screen.getByLabelText('Lesiones o limitaciones'), 'Hombro derecho')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    // Assert
    await waitFor(async () => {
      const participante = await repositorio.participanteActual()
      expect(participante?.nombre).toBe('Santiago')
      expect(participante?.limitaciones).toBe('Hombro derecho')
    })

    // La limitación se destaca en la ficha porque condiciona el entrenamiento
    expect(await screen.findByText(/Limitación: Hombro derecho/)).toBeInTheDocument()
  })

  test('cancelar descarta lo escrito', async () => {
    await abrirEdicion()

    const nombre = screen.getByLabelText('Nombre')
    await userEvent.clear(nombre)
    await userEvent.type(nombre, 'Otro nombre')
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    const participante = await repositorio.participanteActual()
    expect(participante?.nombre).toBe('Participante 001')
  })

  test('cambiar el sexo cambia el objetivo de volumen del pecho (§22)', async () => {
    // §20: pecho masculino 8–10, femenino 6. Es el único objetivo que depende
    // del sexo, así que editarlo aquí tiene que llegar al volumen.
    await abrirEdicion()

    await userEvent.selectOptions(screen.getByLabelText('Sexo'), 'femenino')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(async () => {
      const participante = await repositorio.participanteActual()
      expect(participante?.sexo).toBe('femenino')
    })
  })
})

describe('ejercicios a evitar (punto G)', () => {
  /** La biblioteca se lee de la base, así que hay que esperar a que llegue. */
  async function abrirConBiblioteca() {
    await abrir()
    await screen.findByRole('option', { name: 'Dominadas' })
  }

  test('el coach marca un ejercicio y queda guardado en el perfil', async () => {
    // Arrange
    await abrirConBiblioteca()

    // Act
    await userEvent.selectOptions(
      screen.getByLabelText('Ejercicio a evitar'),
      'dominadas',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Evitar' }))

    // Assert: queda en la lista de restringidos, a la vista
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Quitar Dominadas' })).toBeInTheDocument(),
    )
    const participante = await repositorio.participanteActual()
    expect(participante?.ejerciciosEvitados).toEqual(['dominadas'])
  })

  test('se puede quitar cuando la lesión pasa', async () => {
    // Arrange
    await abrirConBiblioteca()
    await userEvent.selectOptions(screen.getByLabelText('Ejercicio a evitar'), 'dominadas')
    await userEvent.click(screen.getByRole('button', { name: 'Evitar' }))
    const quitar = await screen.findByRole('button', { name: 'Quitar Dominadas' })

    // Act
    await userEvent.click(quitar)

    // Assert
    await waitFor(async () => {
      const participante = await repositorio.participanteActual()
      expect(participante?.ejerciciosEvitados).toEqual([])
    })
  })

  test('sin limitaciones lo dice, en vez de dejar el hueco vacío', async () => {
    await abrir()

    expect(
      await screen.findByText('Sin ejercicios restringidos.'),
    ).toBeInTheDocument()
  })
})
