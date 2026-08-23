import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Coach } from './Coach'
import { baseDePrueba } from '../../pruebas/base'
import { RepositorioLocal } from '../../datos/repositorioLocal'
import { sembrar } from '../../datos/semilla'
import { idDeDia } from '../../datos/semilla'
import { crearSlot } from '../../logica/plantilla'
import { LAT_PULLDOWN, PRESS_INCLINADO_CONVERGENTE } from '../../datos/semilla/biblioteca'
import { evitar } from '../../logica/limitaciones'
import { sembrarParticipante } from '../../pruebas/participante'

let repositorio: RepositorioLocal
let participanteId: string

beforeEach(async () => {
  const db = baseDePrueba(`prueba-coach-${crypto.randomUUID()}`)
  repositorio = new RepositorioLocal(db)
  await sembrar(repositorio)
  participanteId = (await sembrarParticipante(repositorio)).id
})

async function abrirUpperA() {
  render(<Coach repositorio={repositorio} />)
  await userEvent.click(await screen.findByRole('button', { name: 'Upper A' }))
  await screen.findByLabelText('Ejercicio de la posición 1')
}

describe('reemplazar un ejercicio (§23)', () => {
  test('cambiar el ejercicio no destruye la estructura del entrenamiento', async () => {
    // Arrange: la posición 2 es hipertrofia, 3 series, 6–15 reps, 120 s
    await abrirUpperA()
    const antes = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[1]

    // Act: se cambia el press convergente por el lat pulldown
    await userEvent.selectOptions(
      screen.getByLabelText('Ejercicio de la posición 2'),
      LAT_PULLDOWN.id,
    )

    // Assert: sólo cambia el ejercicio
    await waitFor(async () => {
      const despues = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[1]
      expect(despues.ejercicioId).toBe(LAT_PULLDOWN.id)
      expect(despues.estimulo).toBe(antes.estimulo)
      expect(despues.seriesObjetivo).toBe(antes.seriesObjetivo)
      expect(despues.repMin).toBe(antes.repMin)
      expect(despues.repMax).toBe(antes.repMax)
      expect(despues.descansoSegundos).toBe(antes.descansoSegundos)
      expect(despues.orden).toBe(antes.orden)
    })
  })
})

describe('ajustar un ejercicio (§23)', () => {
  test('el coach puede cambiar las series sin tocar lo demás', async () => {
    // Arrange
    await abrirUpperA()

    // Act
    const campo = screen.getByLabelText('Series del ejercicio 1')
    await userEvent.clear(campo)
    await userEvent.type(campo, '5')

    // Assert
    await waitFor(async () => {
      const slot = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[0]
      expect(slot.seriesObjetivo).toBe(5)
      expect(slot.ejercicioId).toBe('press-banca-15-smith')
    })
  })
})

describe('definir los días que faltan (§28)', () => {
  test('añadir el primer ejercicio de Lower A lo marca como fuerza', async () => {
    // Arrange: §28 deja Lower A sin ejercicios a propósito
    render(<Coach repositorio={repositorio} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Lower A' }))

    // Act
    await userEvent.selectOptions(
      await screen.findByLabelText('Ejercicio a añadir'),
      PRESS_INCLINADO_CONVERGENTE.id,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

    // Assert: §4 — la posición 1 es de fuerza
    await waitFor(async () => {
      const plantilla = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'lower-a')))!
      expect(plantilla.slots).toHaveLength(1)
      expect(plantilla.slots[0].orden).toBe(1)
      expect(plantilla.slots[0].estimulo).toBe('fuerza')
      expect(plantilla.slots[0].ejercicioId).toBe(PRESS_INCLINADO_CONVERGENTE.id)
    })
  })
})

describe('quitar un ejercicio (§23)', () => {
  test('renumera las posiciones para que no queden huecos', async () => {
    // Arrange
    await abrirUpperA()

    // Act: se quita el primero
    await userEvent.click(screen.getAllByRole('button', { name: 'Quitar' })[0])

    // Assert
    await waitFor(async () => {
      const plantilla = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!
      expect(plantilla.slots).toHaveLength(4)
      expect(plantilla.slots.map((s) => s.orden)).toEqual([1, 2, 3, 4])
      expect(plantilla.slots[0].ejercicioId).toBe(PRESS_INCLINADO_CONVERGENTE.id)
    })
  })

  test('Upper A tiene 5 ejercicios y todavía admite más', async () => {
    // El cliente pide sesiones de 5 a 8: cinco ya no significa lleno.
    await abrirUpperA()

    expect(await screen.findByLabelText('Ejercicio a añadir')).toBeInTheDocument()
    expect(screen.getByText(/Añadir ejercicio 6 de 8/)).toBeInTheDocument()
  })

  test('avisa al llegar a los 8 y no deja añadir un noveno', async () => {
    // Arrange: se completa Upper A hasta el máximo
    const plantilla = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!
    await repositorio.guardarPlantilla({
      ...plantilla,
      slots: [
        ...plantilla.slots,
        crearSlot(6, PRESS_INCLINADO_CONVERGENTE.id, 'hipertrofia', 3),
        crearSlot(7, LAT_PULLDOWN.id, 'hipertrofia', 3),
        crearSlot(8, LAT_PULLDOWN.id, 'hipertrofia', 3),
      ],
    })

    // Act
    await abrirUpperA()

    // Assert
    expect(screen.queryByLabelText('Ejercicio a añadir')).not.toBeInTheDocument()
    expect(screen.getByText(/máximo de 8 ejercicios/)).toBeInTheDocument()
  })
})

describe('limitaciones conectadas con la programación (punto G)', () => {
  // Las dominadas no están en Upper A: sirven para probar el aviso al asignar
  // un ejercicio nuevo sin duplicar ninguno de los que ya tiene el día.
  const DOMINADAS = 'dominadas'

  /** El perfil pasa a decir que este ejercicio hay que evitarlo. */
  async function prohibir(ejercicioId: string) {
    const participante = await repositorio.participanteActual()
    await repositorio.guardarParticipante(evitar(participante!, ejercicioId))
  }

  test('avisa al coach cuando asigna un ejercicio que el perfil dice evitar', async () => {
    // Arrange
    await prohibir(DOMINADAS)
    await abrirUpperA()

    // Act
    await userEvent.selectOptions(
      screen.getByLabelText('Ejercicio de la posición 2'),
      DOMINADAS,
    )

    // Assert
    expect(await screen.findByText(/El perfil dice evitar/)).toBeInTheDocument()
  })

  test('avisa, pero no bloquea: la decisión es del coach', async () => {
    // Un aviso no puede impedir programar; el coach sabe por qué lo hace.
    await prohibir(DOMINADAS)
    await abrirUpperA()

    await userEvent.selectOptions(
      screen.getByLabelText('Ejercicio de la posición 2'),
      DOMINADAS,
    )

    await waitFor(async () => {
      const plantilla = await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a'))
      expect(plantilla!.slots[1].ejercicioId).toBe(DOMINADAS)
    })
  })

  test('propone alternativas equivalentes y basta un toque para cambiarlas', async () => {
    // Arrange: prohibidas las dominadas, quedan las otras del mismo jalón
    await prohibir(DOMINADAS)
    await abrirUpperA()
    await userEvent.selectOptions(
      screen.getByLabelText('Ejercicio de la posición 2'),
      DOMINADAS,
    )
    await screen.findByText(/El perfil dice evitar/)

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Jalón agarre cerrado' }))

    // Assert: se asigna la alternativa y el aviso desaparece
    await waitFor(async () => {
      const plantilla = await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a'))
      expect(plantilla!.slots[1].ejercicioId).toBe('jalon-agarre-cerrado')
    })
    await waitFor(() =>
      expect(screen.queryByText(/El perfil dice evitar/)).not.toBeInTheDocument(),
    )
  })

  test('un ejercicio ya programado también queda marcado', async () => {
    // La limitación puede llegar después de haber armado el día.
    await prohibir(PRESS_INCLINADO_CONVERGENTE.id)

    await abrirUpperA()

    expect(await screen.findByText(/El perfil dice evitar/)).toBeInTheDocument()
  })

  test('sin limitaciones no aparece ningún aviso', async () => {
    await abrirUpperA()

    expect(screen.queryByText(/El perfil dice evitar/)).not.toBeInTheDocument()
  })
})

describe('ordenar el día', () => {
  test('el coach sube un ejercicio y el día se guarda en el orden nuevo', async () => {
    // Su especificación V1 pide los días editables y ordenables.
    // Arrange
    await abrirUpperA()
    const antes = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Subir el ejercicio 2' }))

    // Assert: el segundo pasa a primero y las posiciones siguen sin huecos
    await waitFor(async () => {
      const despues = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots
      expect(despues[0].ejercicioId).toBe(antes[1].ejercicioId)
      expect(despues[1].ejercicioId).toBe(antes[0].ejercicioId)
      expect(despues.map((slot) => slot.orden)).toEqual([1, 2, 3, 4, 5])
    })
  })

  test('el ejercicio se lleva su programación al cambiar de sitio (§23)', async () => {
    // Arrange: la posición 1 es de fuerza, 4 series, 1–5 reps
    await abrirUpperA()
    const primero = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[0]

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Bajar el ejercicio 1' }))

    // Assert
    await waitFor(async () => {
      const despues = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[1]
      expect(despues.ejercicioId).toBe(primero.ejercicioId)
      expect(despues.estimulo).toBe(primero.estimulo)
      expect(despues.seriesObjetivo).toBe(primero.seriesObjetivo)
      expect(despues.descansoSegundos).toBe(primero.descansoSegundos)
    })
  })

  test('el primero no puede subir ni el último bajar', async () => {
    await abrirUpperA()

    expect(screen.getByRole('button', { name: 'Subir el ejercicio 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Bajar el ejercicio 5' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Bajar el ejercicio 1' })).toBeEnabled()
  })
})

describe('la progresión la puede fijar el coach (V1)', () => {
  test('por defecto la decide la app', async () => {
    await abrirUpperA()

    expect(screen.getByLabelText('Progresión del ejercicio 1')).toHaveValue('')
  })

  test('fijarla queda guardada en el día', async () => {
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.selectOptions(
      screen.getByLabelText('Progresión del ejercicio 1'),
      'mantener',
    )

    // Assert: se guarda sin tocar el resto de la programación
    await waitFor(async () => {
      const slot = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[0]
      expect(slot.progresionFijada).toBe('mantener')
      expect(slot.seriesObjetivo).toBe(4)
    })
  })

  test('se puede devolver a automática', async () => {
    await abrirUpperA()
    await userEvent.selectOptions(
      screen.getByLabelText('Progresión del ejercicio 1'),
      'mantener',
    )
    await waitFor(async () => {
      expect((await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[0].progresionFijada).toBe(
        'mantener',
      )
    })

    await userEvent.selectOptions(screen.getByLabelText('Progresión del ejercicio 1'), '')

    await waitFor(async () => {
      const slot = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[0]
      expect(slot.progresionFijada).toBeUndefined()
    })
  })
})

describe('abrir el día que se pidió', () => {
  test('el coach entra en el día que tocó, no siempre en el primero', async () => {
    // Antes se descartaba el día elegido y siempre aparecía Upper A, con lo que
    // había que volver a buscar el día dentro.
    render(<Coach repositorio={repositorio} plantillaId={idDeDia(participanteId, 'lower-b')} />)

    // Sale como filtro activo y en la cabecera: el coach ve dónde está.
    expect(
      await screen.findByRole('button', { name: 'Lower B', pressed: true }),
    ).toBeInTheDocument()
  })

  test('sin día concreto entra en el primero de la rotación (§28)', async () => {
    render(<Coach repositorio={repositorio} />)

    expect(await screen.findByRole('button', { name: 'Upper A', pressed: true })).toBeInTheDocument()
  })
})
