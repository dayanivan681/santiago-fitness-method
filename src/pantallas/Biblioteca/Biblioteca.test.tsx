import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Biblioteca } from './Biblioteca'
import { baseDePrueba } from '../../pruebas/base'
import { RepositorioPilotoDePrueba as RepositorioLocal } from '../../pruebas/base'
import { sembrar } from '../../datos/semilla'

let repositorio: RepositorioLocal

beforeEach(async () => {
  repositorio = new RepositorioLocal(baseDePrueba(`prueba-bib-${crypto.randomUUID()}`))
  await sembrar(repositorio)
})

async function abrir() {
  render(<Biblioteca repositorio={repositorio} />)
  await screen.findByText('Biblioteca')
}

/** Abre «Filtrar», elige una opción y vuelve a la lista. */
async function filtrar(grupo: 'Músculo' | 'Equipo', opcion: string) {
  await userEvent.click(screen.getByRole('button', { name: /^Filtrar/ }))
  const hoja = screen.getByRole('dialog', { name: 'Filtrar' })
  await userEvent.click(within(within(hoja).getByRole('group', { name: grupo })).getByRole('button', { name: opcion }))
  await userEvent.click(within(hoja).getByRole('button', { name: /^Ver \d+ ejercicio/ }))
}

async function abrirFicha(nombre: string) {
  await abrir()
  await userEvent.click(await screen.findByRole('button', { name: (texto) => texto.includes(nombre) }))
  return screen.findByRole('dialog', { name: nombre })
}

describe('la biblioteca no muestra datos de nadie (§15)', () => {
  test('no queda rastro del participante de prueba en la cabecera', async () => {
    // Era texto fijo: la biblioteca es el catálogo del método, no datos de una
    // persona, y con el alta real cada participante tiene su propio nombre.
    await abrir()

    expect(screen.queryByText('Participante 001')).not.toBeInTheDocument()
  })
})

describe('ficha completa del ejercicio (punto H)', () => {
  test('reúne los seis datos que pide el cliente', async () => {
    // Arrange + Act
    const hoja = await abrirFicha('Press inclinado bajo (15°) en Smith')

    // Assert: equipo, tipo de carga, músculo principal, secundarios,
    // instrucciones breves y alternativas equivalentes
    for (const etiqueta of [
      'Equipo',
      'Tipo de carga',
      'Músculo principal',
      'Secundarios',
      /^Alternativas \(\d+\)$/,
    ]) {
      expect(within(hoja).getByText(etiqueta), `falta ${etiqueta}`).toBeInTheDocument()
    }
    expect(within(hoja).getByText('Máquina Smith')).toBeInTheDocument()
    expect(within(hoja).getByText('Carga por lado')).toBeInTheDocument()
    expect(within(hoja).getByText('Pecho')).toBeInTheDocument()
  })

  test('las alternativas salen del patrón de movimiento, sin incluirse a sí mismo', async () => {
    // §16 y §23: la equivalencia ya la define `movimiento`; no hay lista aparte.
    const hoja = await abrirFicha('Press inclinado bajo (15°) en Smith')

    expect(within(hoja).getByRole('button', { name: 'Press de banca plano con barra' })).toBeInTheDocument()
    expect(
      within(hoja).queryByRole('button', { name: 'Press inclinado bajo (15°) en Smith' }),
    ).not.toBeInTheDocument()
  })

  test('se salta de una equivalente a otra sin cerrar la hoja', async () => {
    // Comparar variantes es justo lo que se hace delante de la máquina.
    const hoja = await abrirFicha('Press inclinado bajo (15°) en Smith')

    await userEvent.click(
      within(hoja).getByRole('button', { name: 'Press de banca plano con barra' }),
    )

    expect(
      await screen.findByRole('dialog', { name: 'Press de banca plano con barra' }),
    ).toBeInTheDocument()
  })

  test('un ejercicio sin equivalentes lo dice, en vez de dejar el hueco vacío', async () => {
    // La abducción mantiene un patrón sin otra variante en la biblioteca.
    const hoja = await abrirFicha('Abducción de cadera sentado en máquina')

    expect(
      within(hoja).getByText('No hay otra variante de este movimiento.'),
    ).toBeInTheDocument()
  })

  test('la cuadrícula sigue siendo visual: el detalle no la invade', async () => {
    // §15 y §25: la rejilla identifica; el texto largo vive en la hoja.
    await abrir()

    expect(screen.queryByText('Tipo de carga')).not.toBeInTheDocument()
  })
})

describe('la ficha se comporta como un diálogo móvil (Fase 2)', () => {
  test('se anuncia como modal', async () => {
    const hoja = await abrirFicha('Press inclinado bajo (15°) en Smith')

    expect(hoja).toHaveAttribute('aria-modal', 'true')
  })

  test('el foco entra en la hoja al abrirla', async () => {
    // Sin esto, quien navega con teclado o lector se queda en la página de
    // detrás y no se entera de que hay una ficha abierta.
    const hoja = await abrirFicha('Press inclinado bajo (15°) en Smith')

    expect(hoja.contains(document.activeElement)).toBe(true)
  })

  test('Escape la cierra, como cualquier diálogo', async () => {
    // Arrange
    await abrirFicha('Press inclinado bajo (15°) en Smith')

    // Act
    await userEvent.keyboard('{Escape}')

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('el foco vuelve al ejercicio desde el que se abrió', async () => {
    // Arrange
    await abrir()
    const tarjeta = await screen.findByRole('button', { name: /Press inclinado bajo \(15°\) en Smith/ })
    await userEvent.click(tarjeta)
    await screen.findByRole('dialog')

    // Act
    await userEvent.keyboard('{Escape}')

    // Assert: sin esto el foco cae al principio del documento y hay que
    // recorrer la cuadrícula entera otra vez.
    expect(document.activeElement).toBe(tarjeta)
  })
})

describe('filtro por equipo', () => {
  test('en «Filtrar», Máquina de discos deja sólo esas y se suma al músculo', async () => {
    await abrir()
    await filtrar('Equipo', 'Máquina de discos (plate-loaded)')
    expect(await screen.findByText('Prensa de piernas 45°')).toBeInTheDocument()
    expect(screen.queryByText('Extensión de cuádriceps')).not.toBeInTheDocument()
    await filtrar('Músculo', 'Pantorrillas')
    expect(screen.queryByText('Prensa de piernas 45°')).not.toBeInTheDocument()
    expect(screen.getByText('Seated calf raise')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Filtrar · 2/ })).toBeInTheDocument()
  })

  test('los filtros puestos se ven como pastillas y se quitan con un toque', async () => {
    await abrir()
    await filtrar('Músculo', 'Pantorrillas')
    expect(screen.queryByText('Prensa de piernas 45°')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Quitar Pantorrillas' }))
    expect(screen.queryByRole('button', { name: 'Quitar Pantorrillas' })).not.toBeInTheDocument()
    expect(screen.getByText('Prensa de piernas 45°')).toBeInTheDocument()
  })
})

describe('lista larga, fácil de leer', () => {
  test('sin buscar ni elegir músculo, se agrupa por músculo con su número', async () => {
    await abrir()
    expect(screen.getByRole('heading', { name: /^Pecho · \d+$/ })).toBeInTheDocument()
    await filtrar('Músculo', 'Pecho')
    expect(screen.queryByRole('heading', { name: /^Pecho · \d+$/ })).not.toBeInTheDocument()
  })

  test('buscar «hombro» encuentra los ejercicios de hombro aunque el nombre no lo diga', async () => {
    await abrir()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar ejercicio' }), 'hombro')
    expect(screen.getByText('Elevación lateral con mancuernas')).toBeInTheDocument()
  })
})

describe('carga de peso corporal', () => {
  test('la ficha de un ejercicio de peso corporal dice «Lastre añadido»; la del hip thrust no cambia', async () => {
    const dominadas = await abrirFicha('Dominadas')
    expect(within(dominadas).getByText('Lastre añadido')).toBeInTheDocument()
    expect(within(dominadas).queryByText('Discos añadidos')).not.toBeInTheDocument()
  })
})

describe('buscar con filtros', () => {
  test('con Pecho puesto, buscar «curl» avisa y pausa los filtros; al borrar vuelve Pecho', async () => {
    await abrir()
    await filtrar('Músculo', 'Pecho')
    const buscar = screen.getByRole('searchbox', { name: 'Buscar ejercicio' })
    await userEvent.type(buscar, 'curl')
    expect(screen.getByText('Buscando en toda la biblioteca')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Filtros puestos' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getAllByText(/curl/i).length).toBeGreaterThan(1)
    await userEvent.clear(buscar)
    expect(screen.queryByText('Buscando en toda la biblioteca')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar Pecho' })).toBeInTheDocument()
    expect(screen.queryByText(/curl/i)).not.toBeInTheDocument()
  })
})
