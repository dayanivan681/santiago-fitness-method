import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Perfil } from './Perfil'
import { baseDePrueba } from '../../pruebas/base'
import { RepositorioLocal } from '../../datos/repositorioLocal'
import { sembrar } from '../../datos/semilla'
import { sembrarParticipante } from '../../pruebas/participante'
import { exportarRespaldo } from '../../datos/respaldo'
import { PanelRespaldo } from './PanelRespaldo'

let repositorio: RepositorioLocal

// jsdom no tiene URLs de objeto y la vista previa de la foto las necesita.
beforeEach(() => {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: () => 'blob:prueba',
    revokeObjectURL: () => {},
  })
})

beforeEach(async () => {
  const db = baseDePrueba(`prueba-perfil-${crypto.randomUUID()}`)
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

describe('foto de perfil (V1)', () => {
  const retrato = () => new File(['imagen'], 'retrato.jpg', { type: 'image/jpeg' })

  test('sin foto muestra las iniciales, no un hueco vacío', async () => {
    // La foto es opcional: lo normal al empezar es no tenerla.
    await abrir()

    expect(await screen.findByText('P0')).toBeInTheDocument()
    expect(screen.getByLabelText('Foto de perfil')).toBeInTheDocument()
  })

  test('el coach la añade y queda guardada en el dispositivo', async () => {
    // Arrange
    await abrir()

    // Act
    await userEvent.upload(screen.getByLabelText('Foto de perfil'), retrato())

    // Assert
    await waitFor(async () => {
      const participante = await repositorio.participanteActual()
      expect(await repositorio.obtenerFotoDePerfil(participante!.id)).toBeDefined()
    })
  })

  test('se puede quitar', async () => {
    // Arrange
    await abrir()
    await userEvent.upload(screen.getByLabelText('Foto de perfil'), retrato())
    const quitar = await screen.findByRole('button', { name: 'Quitar' })

    // Act
    await userEvent.click(quitar)

    // Assert
    await waitFor(async () => {
      const participante = await repositorio.participanteActual()
      expect(await repositorio.obtenerFotoDePerfil(participante!.id)).toBeUndefined()
    })
  })

  test('sigue estando después de cerrar y reabrir la app', async () => {
    // Es una foto guardada en el dispositivo, no algo de la sesión en curso.
    // Arrange
    await abrir()
    await userEvent.upload(screen.getByLabelText('Foto de perfil'), retrato())
    await screen.findByRole('button', { name: 'Quitar' })

    // Act: se cierra la pantalla y se vuelve a entrar
    cleanup()
    await abrir()

    // Assert
    expect(await screen.findByRole('button', { name: 'Quitar' })).toBeInTheDocument()
    expect(screen.queryByText('P0')).not.toBeInTheDocument()
  })

  test('reemplazarla no deja la anterior acumulada', async () => {
    // Arrange
    await abrir()
    await userEvent.upload(screen.getByLabelText('Foto de perfil'), retrato())
    await screen.findByRole('button', { name: 'Quitar' })

    // Act
    await userEvent.upload(
      screen.getByLabelText('Foto de perfil'),
      new File(['otra'], 'otra.jpg', { type: 'image/jpeg' }),
    )

    // Assert: una sola foto para ese participante
    const participante = await repositorio.participanteActual()
    await waitFor(async () => {
      expect(await repositorio.obtenerFotoDePerfil(participante!.id)).toBeDefined()
    })
    expect(screen.getAllByRole('button', { name: 'Quitar' })).toHaveLength(1)
  })

  test('es distinta de las fotos de progreso: no aparece como medición', async () => {
    // Son dos cosas: ésta identifica, aquéllas documentan la evolución.
    await abrir()

    await userEvent.upload(screen.getByLabelText('Foto de perfil'), retrato())

    expect(await screen.findByText('Todavía no hay mediciones.')).toBeInTheDocument()
  })
})

describe('copia de seguridad fuera de la experiencia del cliente', () => {
  test('el perfil ya no la ofrece', async () => {
    // Fase 1C: deja de ser algo que el participante deba entender. El código
    // sigue en el repositorio, pero no tiene puerta de entrada en su app.
    await abrir()

    expect(screen.queryByText(/Copia de seguridad/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Archivo de copia')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Descargar copia/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Restaurar copia/i)).not.toBeInTheDocument()
  })

  test('el perfil no explica dónde se guardan los datos por dentro', async () => {
    // El copy técnico tampoco pertenece a la experiencia del cliente.
    await abrir()

    expect(screen.queryByText(/Los datos viven sólo en este dispositivo/)).not.toBeInTheDocument()
    expect(
      await screen.findByText(/Tu programa llega de tu coach/),
    ).toBeInTheDocument()
  })

  test('no promete sincronización entre dispositivos', async () => {
    // Lo que no existe no se anuncia.
    await abrir()

    expect(screen.queryByText(/sincroniza/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/nube/i)).not.toBeInTheDocument()
  })
})

/**
 * El panel sigue existiendo y funcionando: lo que se retira en la Fase 1C es su
 * sitio en la app del cliente, no el código. Se prueba montándolo directamente
 * para no perder la cobertura de importación y restauración.
 */
describe('panel de copia (conservado, sin montar en la app)', () => {
  async function abrirPanel() {
    const participante = (await repositorio.participanteActual())!
    render(<PanelRespaldo participante={participante} repositorio={repositorio} />)
    await screen.findByLabelText('Archivo de copia')
    return participante
  }

  test('un archivo que no es una copia se rechaza sin tocar nada', async () => {
    // Restaurar basura encima de meses de entrenamiento no tendría vuelta atrás.
    // Arrange
    await abrirPanel()
    const basura = new File(['{"cualquier":"cosa"}'], 'notas.json', {
      type: 'application/json',
    })

    // Act
    await userEvent.upload(screen.getByLabelText('Archivo de copia'), basura)

    // Assert
    expect(
      await screen.findByText('Ese archivo no es una copia de esta app.'),
    ).toBeInTheDocument()
    expect((await repositorio.participanteActual())?.nombre).toBe('Participante 001')
  })

  test('un archivo ilegible tampoco rompe la app', async () => {
    await abrirPanel()

    await userEvent.upload(
      screen.getByLabelText('Archivo de copia'),
      new File(['esto no es json'], 'roto.json', { type: 'application/json' }),
    )

    expect(await screen.findByText('No se pudo leer el archivo.')).toBeInTheDocument()
  })

  test('restaurar una copia válida devuelve los datos', async () => {
    // Arrange: una copia hecha con otro nombre
    const actual = await abrirPanel()
    const copia = await exportarRespaldo(repositorio, actual.id)
    const conOtroNombre = {
      ...copia,
      participante: { ...copia.participante, nombre: 'Santiago Restaurado' },
    }

    // Act
    await userEvent.upload(
      screen.getByLabelText('Archivo de copia'),
      new File([JSON.stringify(conOtroNombre)], 'copia.json', { type: 'application/json' }),
    )

    // Assert
    expect(await screen.findByText('Copia restaurada.')).toBeInTheDocument()
    await waitFor(async () => {
      expect((await repositorio.participanteActual())?.nombre).toBe('Santiago Restaurado')
    })
  })
})

describe('cierre de sesión', () => {
  test('cierra sesión contra el borde, no dentro de la app', async () => {
    // Tiene que apuntar a /salir, donde el middleware revoca la sesión en el
    // servidor. Si lo resolviera la app, bastaría con conservar la cookie para
    // seguir entrando.
    await abrir()

    const enlace = screen.getByRole('link', { name: 'Cerrar sesión' })

    expect(enlace).toHaveAttribute('href', '/salir')
  })
})
