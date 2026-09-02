import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Historial } from './Historial'
import { baseDePrueba } from '../../pruebas/base'
import { RepositorioLocal } from '../../datos/repositorioLocal'
import { sembrar } from '../../datos/semilla'
import { idDeDia } from '../../datos/semilla'
import { sembrarParticipante } from '../../pruebas/participante'
import { PRESS_BANCA_15_SMITH } from '../../datos/semilla/biblioteca'

let repositorio: RepositorioLocal
let participanteId: string

const PRESS = 'Press banca 15° Smith'

beforeEach(async () => {
  repositorio = new RepositorioLocal(baseDePrueba(`prueba-hist-${crypto.randomUUID()}`))
  await sembrar(repositorio)
  participanteId = (await sembrarParticipante(repositorio)).id

  // Una sesión cerrada, de hace semanas: el caso en el que se descubre tarde
  // que un número está mal.
  await repositorio.crearSesion({
    id: 's1',
    participanteId,
    plantillaDiaId: idDeDia(participanteId, 'upper-a'),
    fecha: '2026-07-01',
    completadaEn: '2026-07-01T11:00:00.000Z',
  })
  await repositorio.registrarSerie({
    id: 'serie-1',
    sesionId: 's1',
    ejercicioId: PRESS_BANCA_15_SMITH.id,
    numeroSerie: 1,
    pesoRegistradoLb: 45,
    repsRealizadas: 10,
    rir: 2,
    instante: '2026-07-01T10:00:00.000Z',
  })
})

async function abrirSesion() {
  render(<Historial repositorio={repositorio} />)
  await userEvent.click(await screen.findByRole('button', { name: /1 jul/ }))
  return screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)
}

describe('corregir una sesión ya completada (§19)', () => {
  test('la sesión del historial se abre para corregirla', async () => {
    // Antes sólo se podía corregir el mismo día.
    expect(await abrirSesion()).toBeInTheDocument()
  })

  test('la corrección apila el valor anterior, no lo borra', async () => {
    // Arrange
    await userEvent.click(await abrirSesion())

    // Act
    await userEvent.click(await screen.findByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert
    await waitFor(async () => {
      const [serie] = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)
      expect(serie.repsRealizadas).toBe(11)
      expect(serie.correcciones).toHaveLength(1)
      expect(serie.correcciones![0].repsRealizadas).toBe(10)
    })
  })

  test('conserva el instante original para no falsear el descanso (§5)', async () => {
    await userEvent.click(await abrirSesion())
    await userEvent.click(await screen.findByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    await waitFor(async () => {
      const [serie] = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)
      expect(serie.instante).toBe('2026-07-01T10:00:00.000Z')
    })
  })

  test('se puede deshacer sin perder el rastro', async () => {
    // Arrange: corregida por error
    await userEvent.click(await abrirSesion())
    await userEvent.click(await screen.findByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Act
    await userEvent.click(
      await screen.findByLabelText(`Deshacer la corrección de la serie 1 de ${PRESS}`),
    )

    // Assert: vuelve a 10 y consta que hubo corrección y reversión
    await waitFor(async () => {
      const [serie] = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)
      expect(serie.repsRealizadas).toBe(10)
      expect(serie.correcciones!.map((c) => c.motivo)).toEqual(['correccion', 'reversion'])
    })
  })

  test('corregir no duplica la serie', async () => {
    await userEvent.click(await abrirSesion())
    await userEvent.click(await screen.findByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    await waitFor(async () => {
      expect(
        await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id),
      ).toHaveLength(1)
    })
  })
})

describe('el formato de peso es el mismo en toda la app', () => {
  test('dice "lb/lado" cuando la carga es por lado', async () => {
    // El press en Smith es de carga por lado. Su copia del formateador se
    // comía el sufijo y enseñaba 45 —el peso de UN lado— como si fuera el
    // total: leído así, el participante cargaría la mitad de lo que hizo.
    render(<Historial repositorio={repositorio} />)

    // Aparece en varios sitios (resumen y fila); basta con que ninguno use el
    // formato viejo.
    expect((await screen.findAllByText('45 lb/lado × 10')).length).toBeGreaterThan(0)
    expect(screen.queryByText(/45\/lado lb/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^45 lb × 10$/)).not.toBeInTheDocument()
  })

  test('la mejor referencia y la última sesión usan ese mismo formato', async () => {
    render(<Historial repositorio={repositorio} />)
    await screen.findByText('Mejor referencia')

    // Aparece en el resumen y en la fila de la sesión.
    expect((await screen.findAllByText(/45 lb\/lado × 10/)).length).toBeGreaterThan(1)
  })

  test('una sesión con pesos distintos los enseña todos, no sólo el primero', async () => {
    // Arrange: la copia anterior tomaba series[0] y daba por hecho que el resto
    // pesaba igual, así que una subida a media sesión desaparecía del resumen.
    await repositorio.registrarSerie({
      id: 'serie-2',
      sesionId: 's1',
      ejercicioId: PRESS_BANCA_15_SMITH.id,
      numeroSerie: 2,
      pesoRegistradoLb: 50,
      repsRealizadas: 8,
      rir: 1,
      instante: '2026-07-01T10:05:00.000Z',
    })

    // Act
    render(<Historial repositorio={repositorio} />)

    // Assert
    expect(await screen.findByText('45 × 10 · 50 × 8 lb/lado')).toBeInTheDocument()
  })
})
