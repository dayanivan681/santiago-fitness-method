import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AltaParticipante } from './AltaParticipante'
import { baseDePrueba } from '../../pruebas/base'
import { RepositorioLocal } from '../../datos/repositorioLocal'

let repositorio: RepositorioLocal

beforeEach(() => {
  repositorio = new RepositorioLocal(baseDePrueba(`prueba-alta-${crypto.randomUUID()}`))
})

function abrir() {
  render(<AltaParticipante repositorio={repositorio} />)
}

/**
 * El alta no termina al guardar el participante: después crea sus cuatro días.
 * Esperar sólo al participante deja esas escrituras en vuelo, y el test acaba
 * mientras la base se está usando.
 */
async function altaCompletada() {
  const participante = await waitFor(async () => {
    const encontrado = await repositorio.participanteActual()
    expect(encontrado).toBeDefined()
    return encontrado!
  })

  await waitFor(async () => {
    // §28: Upper A · Lower A · Upper B · Lower B
    expect(await repositorio.listarPlantillas(participante.id)).toHaveLength(4)
  })

  return participante
}

describe('alta del participante (criterio 1)', () => {
  test('con escribir el nombre basta: el resto son estimados', async () => {
    // Su criterio pide darlo de alta en menos de dos minutos.
    // Arrange
    abrir()

    // Act
    await userEvent.type(screen.getByLabelText('Nombre'), 'Santiago')
    await userEvent.click(screen.getByRole('button', { name: 'Crear participante' }))

    // Assert
    const participante = await altaCompletada()
    expect(participante.nombre).toBe('Santiago')
    expect(participante.frecuenciaEntrenamiento).toBe(4)
  })

  test('nace con sus cuatro días de §28, no con una estructura compartida', async () => {
    // Arrange
    abrir()

    // Act
    await userEvent.type(screen.getByLabelText('Nombre'), 'Santiago')
    await userEvent.click(screen.getByRole('button', { name: 'Crear participante' }))

    // Assert
    const participante = await altaCompletada()
    const dias = await repositorio.listarPlantillas(participante.id)
    expect(dias.map((dia) => dia.nombre)).toEqual([
      'Upper A',
      'Lower A',
      'Upper B',
      'Lower B',
    ])
    // Y son suyos: el id lleva su participante dentro (§23)
    expect(dias.every((dia) => dia.participanteId === participante.id)).toBe(true)
  })

  test('el coach ajusta los estimados en el mismo formulario', async () => {
    // Arrange
    abrir()

    // Act
    await userEvent.type(screen.getByLabelText('Nombre'), 'Ana')
    await userEvent.selectOptions(screen.getByLabelText('Sexo'), 'femenino')
    const peso = screen.getByLabelText('Peso (lb)')
    await userEvent.clear(peso)
    await userEvent.type(peso, '140')
    await userEvent.click(screen.getByRole('button', { name: 'Crear participante' }))

    // Assert
    const participante = await altaCompletada()
    expect(participante.sexo).toBe('femenino')
    expect(participante.pesoCorporalLb).toBe(140)
  })

  test('sin nombre no crea nada y dice por qué', async () => {
    // Arrange
    abrir()

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Crear participante' }))

    // Assert: el aviso está y la base sigue vacía
    expect(
      await screen.findByText('Escribe el nombre del participante.'),
    ).toBeInTheDocument()
    expect(await repositorio.participanteActual()).toBeUndefined()
  })

  test('avisa de todo lo que falta a la vez', async () => {
    // Corregir de uno en uno sería una pérdida de tiempo en el móvil.
    abrir()

    const edad = screen.getByLabelText('Edad')
    await userEvent.clear(edad)
    await userEvent.type(edad, '0')
    await userEvent.click(screen.getByRole('button', { name: 'Crear participante' }))

    expect(await screen.findByText('Escribe el nombre del participante.')).toBeInTheDocument()
    expect(screen.getByText(/La edad debe estar entre/)).toBeInTheDocument()
  })

  test('los ocho datos de §2 están en el alta', async () => {
    abrir()

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
})

describe('restaurar una copia desde el alta', () => {
  test('un móvil nuevo puede recuperar los datos sin dar de alta a nadie', async () => {
    // Es el caso para el que existe la copia: dispositivo nuevo o navegador
    // borrado. Si sólo se pudiera restaurar desde Perfil —que necesita un
    // participante— la copia no serviría justo cuando hace falta.
    // Arrange
    const copia = {
      version: 1,
      exportadoEn: '2026-08-24T10:00:00.000Z',
      participante: {
        id: 'abc',
        nombre: 'Santiago',
        sexo: 'masculino',
        edad: 30,
        estaturaCm: 175,
        pesoCorporalLb: 175,
        objetivo: 'Ganar fuerza',
        frecuenciaEntrenamiento: 4,
        limitaciones: '',
      },
      plantillas: [],
      sesiones: [],
      series: [],
      progreso: [],
      sustituciones: [],
    }
    abrir()

    // Act
    await userEvent.upload(
      screen.getByLabelText('Archivo de copia'),
      new File([JSON.stringify(copia)], 'copia.json', { type: 'application/json' }),
    )

    // Assert
    await waitFor(async () => {
      expect((await repositorio.participanteActual())?.nombre).toBe('Santiago')
    })
  })

  test('un archivo que no es una copia no crea a nadie', async () => {
    abrir()

    await userEvent.upload(
      screen.getByLabelText('Archivo de copia'),
      new File(['{"otra":"cosa"}'], 'notas.json', { type: 'application/json' }),
    )

    expect(
      await screen.findByText('Ese archivo no es una copia de esta app.'),
    ).toBeInTheDocument()
    expect(await repositorio.participanteActual()).toBeUndefined()
  })
})
