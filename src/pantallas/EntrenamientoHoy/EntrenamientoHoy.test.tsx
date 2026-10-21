import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { EntrenamientoHoy } from './EntrenamientoHoy'
import { Entrenamiento } from './Entrenamiento'
import { useMemoria } from '../../aplicacion/memoria'
import { useControlDescanso } from '../../aplicacion/contextoDescanso'
import { ProveedorDescanso } from '../../aplicacion/ProveedorDescanso'
import { Descanso } from '../../componentes/Descanso'
import { baseDePrueba } from '../../pruebas/base'
import { RepositorioPilotoDePrueba as RepositorioLocal } from '../../pruebas/base'
import { sembrar } from '../../datos/semilla'
import { idDeDia } from '../../datos/semilla'
import { sembrarParticipante } from '../../pruebas/participante'
import { fechaDeHoy } from '../../datos/repositorio'
import { idBorrador } from '../../logica/borrador'
import { evitar } from '../../logica/limitaciones'
import { actualizarSlot, anadirSlot, MAX_EJERCICIOS_POR_DIA } from '../../logica/plantilla'
import type { PlantillaDia } from '../../dominio/tipos'
import { PRESS_BANCA_15_SMITH } from '../../datos/semilla/biblioteca'
import { unir } from '../../../shared/superseries'

let repositorio: RepositorioLocal
let participanteId: string

const PRESS = 'Press inclinado bajo (15°) en Smith'

/** Sesión anterior: 45 lb por lado × 5 reps con RIR 2 en el press de banca. */
async function sembrarSesionAnterior(fecha = '2026-01-05') {
  await repositorio.crearSesion({
    id: 'sesion-anterior',
    participanteId,
    plantillaDiaId: idDeDia(participanteId, 'upper-a'),
    fecha,
  })
  await repositorio.registrarSerie({
    id: 'serie-anterior',
    sesionId: 'sesion-anterior',
    ejercicioId: PRESS_BANCA_15_SMITH.id,
    numeroSerie: 1,
    pesoRegistradoLb: 45,
    repsRealizadas: 5,
    rir: 2,
  })
}

/** La clave del borrador de la posición 1 de Upper A. */
function idDeLaPrimeraSerie(numeroSerie = 1) {
  return idBorrador({
    participanteId,
    fecha: fechaDeHoy(),
    plantillaDiaId: idDeDia(participanteId, 'upper-a'),
    orden: 1,
    numeroSerie,
  })
}

/**
 * El armazón que monta `App`: resumen del día y modo entrenamiento comparten el
 * día elegido y el ejercicio en curso, y el cronómetro cuelga de fuera de los
 * dos para que no se detenga al cambiar de pantalla.
 */
function FinDescanso() {
  const { estado } = useControlDescanso()
  return <span hidden data-testid="fin-descanso">{estado.estado === 'activo' ? estado.terminaEn : ''}</span>
}
function Pantalla() {
  const memoriaDia = useMemoria<string | null>(null)
  const memoriaAbierta = useMemoria(0)
  const [entrenando, setEntrenando] = useState(false)

  return (
    <ProveedorDescanso>
      {entrenando ? (
        <Entrenamiento
          repositorio={repositorio}
          memoriaDia={memoriaDia}
          memoriaAbierta={memoriaAbierta}
          onSalir={() => setEntrenando(false)}
        />
      ) : (
        <EntrenamientoHoy
          repositorio={repositorio}
          memoriaDia={memoriaDia}
          onComenzar={() => setEntrenando(true)}
        />
      )}
      <Descanso />
      <FinDescanso />
    </ProveedorDescanso>
  )
}

/**
 * Elegir el día y entrar a entrenar.
 *
 * Registrar una serie ya no ocurre en Hoy: Hoy dice qué toca y el registro vive
 * en el modo entrenamiento, así que estas pruebas empiezan donde empieza el
 * participante.
 */
async function abrirUpperA() {
  render(<Pantalla />)
  await userEvent.click(await screen.findByRole('button', { name: 'Upper A' }))
  await userEvent.click(
    await screen.findByRole('button', { name: /Comenzar entrenamiento|^Continuar/ }),
  )
  await screen.findByText(PRESS)
}

/** El resumen del día, sin entrar a entrenar. */
async function abrirResumen() {
  render(<Pantalla />)
  await userEvent.click(await screen.findByRole('button', { name: 'Upper A' }))
  await screen.findByText(PRESS)
}

beforeEach(async () => {
  const db = baseDePrueba(`prueba-ui-${crypto.randomUUID()}`)
  repositorio = new RepositorioLocal(db)
  await sembrar(repositorio)
  participanteId = (await sembrarParticipante(repositorio)).id
})

describe('el entrenamiento ya viene cargado (§3)', () => {
  test('Hoy cuenta sólo sesiones cerradas esta semana y se actualiza tras terminar', async () => {
    await abrirResumen()
    expect(screen.getByText('Semana: 0 de 4 sesiones')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Comenzar entrenamiento' }))
    await userEvent.click(await screen.findByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await userEvent.click(await screen.findByRole('button', { name: 'Terminar sesión' }))
    await screen.findByRole('heading', { name: 'Sesión completada' })
    await userEvent.click(screen.getByRole('button', { name: 'Volver a Hoy' }))
    expect(await screen.findByText('Semana: 1 de 4 sesiones')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Sesiones de la semana' })).toHaveAttribute('aria-valuenow', '1')
  })

  test('diez toques rápidos en peso guardan el último valor una sola vez', async () => {
    await abrirUpperA()
    const subir = screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`)
    for (let n = 0; n < 10; n++) fireEvent.click(subir)
    const campo = screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`)
    expect(campo.querySelector('.numero-paso__actual')).toHaveTextContent('25')
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)
    const sesiones = await repositorio.listarSesiones(participanteId)
    const series = await repositorio.listarSeriesDeSesion(sesiones.find(s => s.fecha === fechaDeHoy())!.id)
    expect(series).toHaveLength(1)
    expect(series[0].pesoRegistradoLb).toBe(25)
  })

  test('muestra los 5 ejercicios de Upper A sin que el participante escriba nada', async () => {
    // El plan del día se lee en el resumen; entrenar enseña uno a la vez.
    await abrirResumen()

    // §29: los cinco ejercicios, con Military Press ya retirado
    expect(screen.getByText(PRESS)).toBeInTheDocument()
    expect(screen.getByText('Press convergente inclinado')).toBeInTheDocument()
    expect(screen.getByText('Lat pulldown')).toBeInTheDocument()
    expect(screen.getByText('Hip thrust con barra')).toBeInTheDocument()
    expect(screen.getByText('Elevación lateral con mancuernas')).toBeInTheDocument()
    expect(screen.queryByText(/Military Press/i)).not.toBeInTheDocument()
  })

  test('las series y el rango de reps ya están definidos', async () => {
    await abrirResumen()

    // §4 y §10: el primer ejercicio es de fuerza, rango 1–5
    expect(screen.getByText('4 series · 1–5 reps')).toBeInTheDocument()
  })

  test('antes de entrenar, el participante toca un ejercicio de su sesión y ve su ficha', async () => {
    // Petición del coach (correo del 2026-09-26): al lado de cada ejercicio de
    // la rutina, un cuadro que el participante toca para ver ese ejercicio.
    await abrirResumen()

    fireEvent.click(screen.getByRole('button', { name: `Ver ${PRESS}` }))

    const ficha = await screen.findByRole('dialog', { name: PRESS })
    // La ficha reproduce la animación del catálogo base; la foto queda de respaldo.
    expect(ficha.querySelector('img')?.getAttribute('src')).toMatch(/^\/ejercicios\/animaciones\/press-banca-15-smith\.gif\?v=/)
    expect(within(ficha).getByText(PRESS_BANCA_15_SMITH.explicacionCorta)).toBeInTheDocument()

    fireEvent.click(within(ficha).getByRole('button', { name: 'Cerrar' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: PRESS })).not.toBeInTheDocument())
    // Ver la ficha no empieza la sesión.
    expect(screen.getByRole('button', { name: 'Comenzar entrenamiento' })).toBeInTheDocument()
  })
})

describe('referencia del entrenamiento anterior (§7)', () => {
  test('muestra lo que hizo la última vez y su mejor referencia', async () => {
    // Arrange
    await sembrarSesionAnterior()

    // Act
    await abrirUpperA()

    // Assert: §9 — con una sola sesión, última y mejor coinciden pero se
    // muestran por separado porque son datos distintos.
    expect(await screen.findAllByText('45 lb/lado × 5 · RIR 2')).not.toHaveLength(0)
    expect(screen.getByText('Mejor referencia')).toBeInTheDocument()
  })

  test('el peso arranca en la referencia y el participante la ajusta antes de guardar (§6)', async () => {
    // §6: la app no impone el peso. El punto de partida es lo que hizo la última
    // vez — visible en el propio campo y repetido debajo — y sólo se registra
    // cuando el participante toca Guardar.
    // Arrange
    await sembrarSesionAnterior()
    await abrirUpperA()

    // Assert
    expect(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`)).toHaveTextContent('45')
    // Una, no cuatro: sólo está abierta la serie que toca. Las otras tres
    // esperan en una línea con su punto de partida.
    expect(screen.getAllByText(/Anterior: 45 lb\/lado × 5 · RIR 2/)).toHaveLength(1)

    // Nada queda registrado mientras no se confirme
    expect(await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)).toHaveLength(1)
  })

  test('el paso del peso es el incremento real de la máquina (§13, §17)', async () => {
    // El Smith sube de 5 lb totales, o sea 2.5 lb por lado.
    await sembrarSesionAnterior()
    await abrirUpperA()

    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))

    expect(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`)).toHaveTextContent('47.5')
  })
})

describe('registrar una serie (§5, §19)', () => {
  test('guarda lo ajustado y la deja marcada como hecha', async () => {
    // Arrange
    await abrirUpperA()

    // Act: dos toques de subida y una repetición más
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert
    await waitFor(async () => {
      const historial = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)
      expect(historial).toHaveLength(1)
      expect(historial[0].pesoRegistradoLb).toBe(2.5)
      expect(historial[0].repsRealizadas).toBe(2)
    })
  })

  test('evalúa la serie contra la referencia anterior (§8)', async () => {
    // Arrange: la última vez fueron 45 lb/lado × 5 reps
    await sembrarSesionAnterior()
    await abrirUpperA()

    // Act: mismo peso, una repetición más
    await userEvent.click(screen.getByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert: §8 — misma carga + más reps = progreso
    expect(await screen.findByText('Progreso')).toBeInTheDocument()
  })
})

describe('cambiar la variante asignada (§16, §23)', () => {
  test('ofrece las variantes del mismo movimiento', async () => {
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Cambiar variante' })[0])

    // Assert: otras variantes del press de pecho, cada una con su historial
    expect(await screen.findByText('Variante asignada')).toBeInTheDocument()
    expect(screen.getByText('Press de banca plano con barra')).toBeInTheDocument()
    expect(screen.getAllByText('Historial propio').length).toBeGreaterThan(1)
  })

  test('por defecto el cambio vale sólo para hoy: la plantilla no se toca', async () => {
    // El motivo corriente para cambiar es puntual — la máquina está ocupada —,
    // así que no puede reescribir el entrenamiento del participante.
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Cambiar variante' })[0])
    await userEvent.click(await screen.findByText('Press de banca plano con barra'))

    // Assert: hoy se entrena la otra, la plantilla sigue con la suya.
    // Se comprueba con la hoja ya cerrada: dentro también hay un "Sólo hoy",
    // que es el selector de alcance.
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByText('Sólo hoy')).toBeInTheDocument()
    })
    const plantilla = await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a'))
    expect(plantilla!.slots[0].ejercicioId).toBe(PRESS_BANCA_15_SMITH.id)
  })

  test('fijarla sí cambia la plantilla, sin romper la estructura (§23)', async () => {
    // Arrange
    await abrirUpperA()
    const antes = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[0]

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Cambiar variante' })[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Fijar en la plantilla' }))
    await userEvent.click(screen.getByText('Press de banca plano con barra'))

    // Assert: cambia el ejercicio, se conserva todo lo demás
    await waitFor(async () => {
      const despues = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!.slots[0]
      expect(despues.ejercicioId).toBe('press-banca-barra')
      expect(despues.estimulo).toBe(antes.estimulo)
      expect(despues.seriesObjetivo).toBe(antes.seriesObjetivo)
      expect(despues.repMin).toBe(antes.repMin)
      expect(despues.repMax).toBe(antes.repMax)
    })
    // Y no queda además un cambio de un día que la pise
    expect(await repositorio.listarSustituciones(participanteId, fechaDeHoy())).toHaveLength(0)
  })

  test('volver a la variante asignada deshace el cambio del día', async () => {
    // Arrange: hoy se cambió a otra
    await abrirUpperA()
    await userEvent.click(screen.getAllByRole('button', { name: 'Cambiar variante' })[0])
    await userEvent.click(await screen.findByText('Press de banca plano con barra'))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByText('Sólo hoy')).toBeInTheDocument()
    })

    // Act: se vuelve a la que tiene asignada
    await userEvent.click(screen.getAllByRole('button', { name: 'Cambiar variante' })[0])
    await userEvent.click(await screen.findByText(PRESS))

    // Assert: la tarjeta deja de estar marcada y no queda rastro del cambio
    await waitFor(() => expect(screen.queryByText('Sólo hoy')).not.toBeInTheDocument())
    expect(await repositorio.listarSustituciones(participanteId, fechaDeHoy())).toHaveLength(0)
  })

})

describe('un día sin ejercicios (§28)', () => {
  test('lo dice y explica dónde se arregla', async () => {
    // Ya no pasa de fábrica —los cuatro días vienen con estimados—, pero el
    // coach puede vaciar uno y entonces hay que decirlo, no dejar la pantalla
    // en blanco.
    // Arrange
    const lowerA = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'lower-a')))!
    await repositorio.guardarPlantilla({ ...lowerA, slots: [] })

    // Act
    render(<Pantalla />)
    await userEvent.click(await screen.findByRole('button', { name: 'Lower A' }))

    // Assert
    expect(await screen.findByText(/todavía no tiene ejercicios definidos/)).toBeInTheDocument()
  })
})

describe('los cuatro días vienen listos para entrenar', () => {
  test('ninguno abre vacío: §4 en los cuatro', async () => {
    // Antes, tres de cada cuatro días abrían diciendo "no tiene ejercicios
    // definidos", que se lee como una app rota y no como una decisión pendiente.
    render(<Pantalla />)

    for (const dia of ['Upper A', 'Lower A', 'Upper B', 'Lower B']) {
      await userEvent.click(await screen.findByRole('button', { name: dia }))
      expect(
        screen.queryByText(/todavía no tiene ejercicios definidos/),
        `${dia} abre vacío`,
      ).not.toBeInTheDocument()
    }
  })

  test('cada día sigue la estructura de §4: fuerza, hipertrofia y resistencia', async () => {
    for (const dia of ['lower-a', 'upper-b', 'lower-b']) {
      const plantilla = (await repositorio.obtenerPlantilla(idDeDia(participanteId, dia)))!
      expect(plantilla.slots.map((s) => s.estimulo), dia).toEqual([
        'fuerza',
        'hipertrofia',
        'hipertrofia',
        'hipertrofia',
        'resistencia',
      ])
    }
  })

  test('no repiten el mismo ejercicio dentro del día', async () => {
    for (const dia of ['upper-a', 'lower-a', 'upper-b', 'lower-b']) {
      const plantilla = (await repositorio.obtenerPlantilla(idDeDia(participanteId, dia)))!
      const ejercicios = plantilla.slots.map((s) => s.ejercicioId)
      expect(new Set(ejercicios).size, dia).toBe(ejercicios.length)
    }
  })
})

describe('corregir deja rastro (§19)', () => {
  test('guarda los valores anteriores en vez de borrarlos', async () => {
    // El cliente pide corregir "sin perder auditoría del historial".
    // Arrange: se registra una serie con un peso equivocado
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    // La serie guardada deja de ser editable en el sitio: aparece "Editar".
    // Esperar a ese botón, y no sólo al dato en la base, es lo que garantiza
    // que la tarjeta ya se repintó.
    const editar = await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)
    const [original] = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)

    // Act: se corrige subiendo una repetición
    await userEvent.click(editar)
    await userEvent.click(await screen.findByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert: el valor equivocado sigue estando, no desaparece
    await waitFor(async () => {
      const [corregida] = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)
      expect(corregida.repsRealizadas).toBe(original.repsRealizadas + 1)
      expect(corregida.correcciones).toHaveLength(1)
      expect(corregida.correcciones![0].repsRealizadas).toBe(original.repsRealizadas)
    })

    // Y sigue habiendo una sola serie: corregir no duplica
    expect(await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)).toHaveLength(1)
  })
})

describe('limitaciones del perfil al cambiar de variante (punto G)', () => {
  test('marca la variante que el perfil dice evitar', async () => {
    // Arrange: el perfil prohíbe el press con barra
    const participante = await repositorio.participanteActual()
    await repositorio.guardarParticipante(evitar(participante!, 'press-banca-barra'))
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Cambiar variante' })[0])

    // Assert: sigue estando —avisar no es bloquear—, pero marcada
    expect(await screen.findByText(/El perfil dice evitarlo/)).toBeInTheDocument()
  })
})

describe('un día de ocho ejercicios (criterios 2 y 10)', () => {
  test('la pantalla los muestra todos, sin cambiar código', async () => {
    // Arrange: el coach arma un día de ocho desde la propia app
    const ocho = (await repositorio.listarEjercicios()).slice(0, MAX_EJERCICIOS_POR_DIA)
    const vacia: PlantillaDia = {
      id: idDeDia(participanteId, 'lower-a'),
      participanteId,
      nombre: 'Lower A',
      orden: 2,
      slots: [],
    }
    const lleno = ocho.reduce<PlantillaDia>(
      (plantilla, ejercicio) => anadirSlot(plantilla, ejercicio.id),
      vacia,
    )
    await repositorio.guardarPlantilla(lleno)

    // Act
    render(<Pantalla />)
    await userEvent.click(await screen.findByRole('button', { name: 'Lower A' }))

    // Assert: los ocho, cada uno con su plan a la vista
    for (const ejercicio of ocho) {
      expect(await screen.findByText(ejercicio.nombre), ejercicio.nombre).toBeInTheDocument()
    }
    expect(lleno.slots).toHaveLength(MAX_EJERCICIOS_POR_DIA)
  })
})

describe('temporizador de descanso (criterio 5)', () => {
  /** Los campos de la serie son <output>, que también tienen rol de estado. */
  const cronometro = () =>
    screen.queryByRole('status', { name: 'Temporizador de descanso' })

  test('guardar una serie de trabajo inicia el descanso prescrito', async () => {
    // El cronómetro arranca después del guardado; el descanso medido sigue
    // derivándose de las marcas de tiempo de las series.
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    // Assert
    expect(await screen.findByRole('status', { name: 'Temporizador de descanso' })).toHaveTextContent('3:00')
  })

  test('guardar un calentamiento también inicia el descanso de ese ejercicio', async () => {
    // Se aplica a cada serie nueva, según la duración indicada por el Coach.
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(
      screen.getByLabelText(`Marcar la serie 1 de ${PRESS} como calentamiento`),
    )
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    // Assert
    expect(await screen.findByRole('status', { name: 'Temporizador de descanso' })).toHaveTextContent('3:00')
  })

  test('corregir una serie ya guardada no arranca el descanso', async () => {
    // La corrección no es una serie nueva: no toca descansar por ella.
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)
    await userEvent.click(await screen.findByRole('button', { name: 'Omitir' }))
    await waitFor(() => expect(cronometro()).not.toBeInTheDocument())

    // Act
    await userEvent.click(screen.getByLabelText(`Editar la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText(`Editar la serie 1 de ${PRESS}`)).toBeInTheDocument(),
    )
    expect(cronometro()).not.toBeInTheDocument()
  })

  test('respeta la duración del Coach, no reinicia al corregir y sustituye al guardar otra serie', async () => {
    const plantilla = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!
    await repositorio.guardarPlantilla(actualizarSlot(plantilla, 1, { descansoSegundos: 75 }))
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await waitFor(() => expect(screen.getByRole('status', { name: 'Temporizador de descanso' })).toHaveTextContent('1:15'))
    await userEvent.click(screen.getByRole('button', { name: 'Añadir 30 segundos' }))
    const fin = screen.getByTestId('fin-descanso').textContent
    await userEvent.click(screen.getByLabelText(`Editar la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)
    expect(screen.getByTestId('fin-descanso')).toHaveTextContent(fin!)
    await userEvent.click(screen.getByLabelText(`Guardar la serie 2 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 2 de ${PRESS}`)
    expect(screen.getAllByRole('status', { name: 'Temporizador de descanso' })).toHaveLength(1)
    expect(Number(screen.getByTestId('fin-descanso').textContent)).toBeLessThan(Number(fin))
  })

  test('un guardado pendiente o fallido no inicia descanso y el doble toque no duplica la serie', async () => {
    await abrirUpperA()
    let fallar!: () => void
    const pendiente = new Promise<void>((_, reject) => { fallar = () => reject(new Error('Fallo al guardar')) })
    const guardar = vi.spyOn(repositorio, 'registrarSerie').mockReturnValueOnce(pendiente)
    const boton = screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`)
    fireEvent.click(boton)
    fireEvent.click(boton)
    await waitFor(() => expect(guardar).toHaveBeenCalledTimes(1))
    expect(cronometro()).not.toBeInTheDocument()
    fallar()
    await screen.findByText('Fallo al guardar')
    expect(cronometro()).not.toBeInTheDocument()
    guardar.mockRestore()
  })

  test('guardar con descanso de cero no muestra temporizador', async () => {
    const plantilla = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!
    await repositorio.guardarPlantilla(actualizarSlot(plantilla, 1, { descansoSegundos: 0 }))
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)
    expect(cronometro()).not.toBeInTheDocument()
  })

  test('el pulso sólo aparece cuando queda poco, no durante todo el descanso', async () => {
    // Latía los tres minutos enteros de un descanso de fuerza (§12). Un
    // parpadeo constante en el borde cansa y deja de significar nada.
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Descanso' })[0])

    // Assert: arranca en 180 s, muy lejos del aviso
    const cronometro = await screen.findByRole('status', { name: 'Temporizador de descanso' })
    expect(cronometro).not.toHaveClass('descanso--acabando')
  })

  test('lo activa y lo desactiva el participante', async () => {
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Descanso' })[0])

    // Assert
    expect(
      await screen.findByRole('status', { name: 'Temporizador de descanso' }),
    ).toHaveTextContent('Descanso')

    // Y se apaga cuando él quiere, sin esperar a que termine
    await userEvent.click(screen.getByRole('button', { name: 'Omitir' }))
    await waitFor(() => expect(cronometro()).not.toBeInTheDocument())
  })
})

describe('la recomendación que fijó el coach (V1)', () => {
  test('manda sobre la que calcularía la app, y se ve de quién es', async () => {
    // Arrange: con 45 lb × 5 la app propondría subir reps; el coach dice mantener
    await sembrarSesionAnterior()
    const plantilla = (await repositorio.obtenerPlantilla(idDeDia(participanteId, 'upper-a')))!
    await repositorio.guardarPlantilla(
      actualizarSlot(plantilla, 1, { progresionFijada: 'mantener' }),
    )

    // Act
    await abrirUpperA()

    // Assert
    expect(await screen.findByText(/Mantener · del coach/)).toBeInTheDocument()
  })
})

describe('entrada rápida — tocar el valor para escribirlo directo (reduce pulsaciones)', () => {
  test('tocar el peso lo abre para escribirlo, en vez de sumar de a poco', async () => {
    // Sin referencia el peso arranca en 0: subir hasta 135 lb a golpes de ±2.5
    // serían 54 toques. Escribirlo directo es el atajo real.
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`))
    const campo = await screen.findByLabelText(`Peso de la serie 1 de ${PRESS}`)
    await userEvent.clear(campo)
    await userEvent.type(campo, '135')
    await userEvent.tab()

    // Assert: el valor escrito queda y se guarda tal cual
    await waitFor(() =>
      expect(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`)).toHaveTextContent('135'),
    )
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await waitFor(async () => {
      const [serie] = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)
      expect(serie.pesoRegistradoLb).toBe(135)
    })
  })

  test('tocar las reps también las abre para escribirlas directo', async () => {
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getByLabelText(`Reps de la serie 1 de ${PRESS}`))
    const campo = await screen.findByLabelText(`Reps de la serie 1 de ${PRESS}`)
    await userEvent.clear(campo)
    await userEvent.type(campo, '8')
    await userEvent.tab()

    // Assert
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await waitFor(async () => {
      const [serie] = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)
      expect(serie.repsRealizadas).toBe(8)
    })
  })

  test('las series ya guardadas no se abren al tocarlas: se editan con el botón Editar', async () => {
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    // Act
    await userEvent.click(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`))

    // Assert: sigue siendo texto fijo, no aparece un campo de escritura
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  test('escribir un peso negativo se recorta a cero', async () => {
    await abrirUpperA()

    await userEvent.click(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`))
    const campo = await screen.findByLabelText(`Peso de la serie 1 de ${PRESS}`)
    // fireEvent.change en vez de userEvent.type: tipear el "-" carácter a
    // carácter en un <input type="number"> deja el valor vacío a medio camino
    // y userEvent se queda esperando un estado que nunca llega.
    fireEvent.change(campo, { target: { value: '-20' } })
    await userEvent.tab()

    await waitFor(() =>
      expect(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`)).toHaveTextContent('0'),
    )
  })
})

describe('RIR — el tope de la escala se ve como "5+" (§14)', () => {
  test('ciclar hasta el tope lo muestra con el signo más', async () => {
    // Arrange
    await abrirUpperA()
    const rir = screen.getByLabelText(`RIR de la serie 1 de ${PRESS}`)

    // Act: parte de 2, seis toques la llevan al tope (2→3→4→5→0→1→2→3→4→5)
    for (let i = 0; i < 3; i++) await userEvent.click(rir)

    // Assert
    expect(rir).toHaveTextContent('5+')
  })
})

describe('la recomendación dice cuánto, no sólo qué (§6)', () => {
  test('al subir reps propone el número concreto', async () => {
    // Arrange: 3 reps queda dentro del rango de fuerza (1–5) y por debajo del
    // tope, que es cuando §11 manda progresar en repeticiones.
    await repositorio.crearSesion({
      id: 'previa',
      participanteId,
      plantillaDiaId: idDeDia(participanteId, 'upper-a'),
      fecha: '2026-01-05',
    })
    await repositorio.registrarSerie({
      id: 'previa-1',
      sesionId: 'previa',
      ejercicioId: PRESS_BANCA_15_SMITH.id,
      numeroSerie: 1,
      pesoRegistradoLb: 45,
      repsRealizadas: 3,
      rir: 2,
    })

    // Act
    await abrirUpperA()

    // Assert: el rótulo solo no dice cuántas
    expect(await screen.findByText(/Objetivo: 4 reps con el mismo peso/)).toBeInTheDocument()
  })

  test('al subir carga propone el peso y el incremento', async () => {
    // Arrange: dos series al tope del rango de fuerza con RIR 1 dominan la carga
    await repositorio.crearSesion({
      id: 'dominada',
      participanteId,
      plantillaDiaId: idDeDia(participanteId, 'upper-a'),
      fecha: '2026-01-05',
    })
    for (const numeroSerie of [1, 2, 3, 4]) {
      await repositorio.registrarSerie({
        id: `dominada-${numeroSerie}`,
        sesionId: 'dominada',
        ejercicioId: PRESS_BANCA_15_SMITH.id,
        numeroSerie,
        pesoRegistradoLb: 45,
        repsRealizadas: 5,
        rir: 1,
      })
    }

    // Act
    await abrirUpperA()

    // Assert: §13 y §17 — el Smith sube 5 lb totales, 2.5 por lado
    expect(await screen.findByText(/Objetivo: 47\.5 lb\/lado \(\+2\.5\/lado\)/)).toBeInTheDocument()
  })

  test('sin referencia no inventa ningún número', async () => {
    // Primera vez con el ejercicio: no hay de dónde sacar peso ni reps.
    await abrirUpperA()

    expect(screen.getByText('Primera vez')).toBeInTheDocument()
    expect(screen.queryByText(/Objetivo:/)).not.toBeInTheDocument()
  })
})

describe('autosave del borrador y recuperación', () => {
  test('lo ajustado sobrevive a cerrar y reabrir la app', async () => {
    // El cliente pide recuperación si la app se cierra: entre ajustar el peso y
    // tocar Guardar puede sonar el teléfono o el móvil matar la pestaña.
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await waitFor(async () => {
      expect(await repositorio.obtenerBorrador(idDeLaPrimeraSerie())).toBeDefined()
    })

    // Act: se cierra y se vuelve a abrir
    cleanup()
    await abrirUpperA()

    // Assert: el ajuste sigue ahí, sin haberlo registrado en el historial
    await waitFor(() =>
      expect(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`)).toHaveTextContent('2.5'),
    )
    expect(screen.getByLabelText(`Reps de la serie 1 de ${PRESS}`)).toHaveTextContent('2')
    expect(await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)).toHaveLength(0)
  })

  test('no guarda borrador de una serie que nadie tocó', async () => {
    // Si lo hiciera, mañana ese borrador pisaría la referencia del día.
    await abrirUpperA()

    await waitFor(() => expect(screen.getByText(PRESS)).toBeInTheDocument())

    expect(await repositorio.obtenerBorrador(idDeLaPrimeraSerie())).toBeUndefined()
  })

  test('el borrador desaparece al registrar la serie de verdad', async () => {
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))
    await waitFor(async () => {
      expect(await repositorio.obtenerBorrador(idDeLaPrimeraSerie())).toBeDefined()
    })

    // Act
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert
    await waitFor(async () => {
      expect(await repositorio.obtenerBorrador(idDeLaPrimeraSerie())).toBeUndefined()
    })
    expect(await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)).toHaveLength(1)
  })

  test('cada serie tiene su propio borrador', async () => {
    // Sin la posición y el número en la clave, se pisarían entre ellas.
    await abrirUpperA()

    // La serie 2 no toca todavía: se abre tocándola.
    await userEvent.click(screen.getByLabelText(`Abrir la serie 2 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 2 de ${PRESS}`))

    await waitFor(async () => {
      expect(await repositorio.obtenerBorrador(idDeLaPrimeraSerie())).toBeUndefined()
      expect(
        await repositorio.obtenerBorrador(idDeLaPrimeraSerie(2)),
      ).toBeDefined()
    })
  })
})

describe('deshacer una corrección (§19)', () => {
  test('devuelve los valores y deja constancia de la vuelta atrás', async () => {
    // Arrange: se guarda una serie y se corrige subiendo una repetición
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await userEvent.click(await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`))
    await userEvent.click(await screen.findByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    const deshacer = await screen.findByLabelText(`Deshacer la corrección de la serie 1 de ${PRESS}`)

    // Act
    await userEvent.click(deshacer)

    // Assert: vuelve a 1 repetición y el rastro guarda las dos cosas
    await waitFor(async () => {
      const [serie] = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)
      expect(serie.repsRealizadas).toBe(1)
      expect(serie.correcciones).toHaveLength(2)
      expect(serie.correcciones!.map((c) => c.motivo)).toEqual(['correccion', 'reversion'])
    })
  })

  test('sin corrección previa no ofrece deshacer', async () => {
    await abrirUpperA()

    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    expect(
      screen.queryByLabelText(`Deshacer la corrección de la serie 1 de ${PRESS}`),
    ).not.toBeInTheDocument()
  })

  test('deshecha una vez, no vuelve a ofrecerse', async () => {
    // La serie ya está en los valores previos: no queda nada que echar atrás.
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await userEvent.click(await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`))
    await userEvent.click(await screen.findByLabelText(`Subir reps de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    await userEvent.click(
      await screen.findByLabelText(`Deshacer la corrección de la serie 1 de ${PRESS}`),
    )

    await waitFor(() =>
      expect(
        screen.queryByLabelText(`Deshacer la corrección de la serie 1 de ${PRESS}`),
      ).not.toBeInTheDocument(),
    )
  })
})

describe('la siguiente serie parte de lo que se acaba de levantar', () => {
  test('la serie 2 arranca en el peso de la serie 1 de hoy, no en el de la semana pasada', async () => {
    // Arrange: la última vez fueron 45 lb/lado, pero hoy se está levantando 50
    await sembrarSesionAnterior()
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`))
    const campo = await screen.findByLabelText(`Peso de la serie 1 de ${PRESS}`)
    fireEvent.change(campo, { target: { value: '50' } })
    await userEvent.tab()

    // Act
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    // Assert: lo de hoy manda sobre la referencia de la sesión anterior
    await waitFor(() =>
      expect(screen.getByLabelText(`Peso de la serie 2 de ${PRESS}`)).toHaveTextContent('50'),
    )
  })

  test('sin nada registrado hoy, sigue partiendo de la sesión anterior (§7)', async () => {
    await sembrarSesionAnterior()

    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Abrir la serie 2 de ${PRESS}`))

    expect(screen.getByLabelText(`Peso de la serie 2 de ${PRESS}`)).toHaveTextContent('45')
  })

  test('el calentamiento no arrastra su peso a la serie siguiente', async () => {
    // Arrancar la serie de trabajo con el peso de la aproximación sería justo
    // lo contrario de lo que hace falta.
    // Arrange
    await sembrarSesionAnterior()
    await abrirUpperA()
    await userEvent.click(
      screen.getByLabelText(`Marcar la serie 1 de ${PRESS} como calentamiento`),
    )
    await userEvent.click(screen.getByLabelText(`Bajar peso de la serie 1 de ${PRESS}`))

    // Act
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    // Assert: la serie 2 sigue en la referencia real, no en la del calentamiento
    expect(screen.getByLabelText(`Peso de la serie 2 de ${PRESS}`)).toHaveTextContent('45')
  })
})

describe('confirmación al guardar una serie', () => {
  test('la serie guardada queda marcada como hecha, con aviso para lectores de pantalla', async () => {
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert
    const confirmacion = await screen.findByRole('status', { name: `Serie 1 de ${PRESS}` })
    expect(confirmacion).toHaveTextContent('Guardada')
  })
})

describe('el ejercicio terminado se pliega y pasa el turno', () => {
  /** Upper A: el press es de fuerza con 4 series; el segundo es hipertrofia. */
  async function completarElPrimerEjercicio() {
    await abrirUpperA()
    // Las tres primeras dejan el botón "Editar" a la vista…
    for (const numeroSerie of [1, 2, 3]) {
      await userEvent.click(screen.getByLabelText(`Guardar la serie ${numeroSerie} de ${PRESS}`))
      await screen.findByLabelText(`Editar la serie ${numeroSerie} de ${PRESS}`)
    }
    // …y con la cuarta la tarjeta se pliega, así que no hay nada que esperar ahí.
    await userEvent.click(screen.getByLabelText(`Guardar la serie 4 de ${PRESS}`))
  }

  test('al completar la última serie se pliega y se abre el siguiente', async () => {
    // Es lo que se hace en el gimnasio: terminas y pasas al que toca.
    // Arrange + Act
    await completarElPrimerEjercicio()

    // Assert: el press ya no muestra sus series y el siguiente sí
    await waitFor(() =>
      expect(
        screen.queryByLabelText(`Guardar la serie 1 de ${PRESS}`),
      ).not.toBeInTheDocument(),
    )
    expect(
      await screen.findByLabelText('Guardar la serie 1 de Press convergente inclinado'),
    ).toBeInTheDocument()
  })

  test('la cuenta del ejercicio terminado sigue a la vista en la lista del día', async () => {
    // Pasar al siguiente no puede esconder el dato: 4/4 tiene que poder verse.
    await completarElPrimerEjercicio()
    await screen.findByText('Press convergente inclinado')

    await userEvent.click(screen.getByRole('button', { name: 'Ejercicios del día' }))

    const hoja = await screen.findByRole('dialog', { name: 'Ejercicios del día' })
    const fila = within(hoja).getByRole('button', { name: (texto) => texto.includes(PRESS) })
    await waitFor(() => expect(fila).toHaveTextContent('4/4'))
  })

  test('se puede volver al ejercicio terminado para corregir', async () => {
    // Arrange
    await completarElPrimerEjercicio()
    await waitFor(() =>
      expect(screen.queryByLabelText(`Guardar la serie 1 de ${PRESS}`)).not.toBeInTheDocument(),
    )

    // Act: la lista del día lleva a cualquiera de los cinco.
    await userEvent.click(screen.getByRole('button', { name: 'Ejercicios del día' }))
    const hoja = await screen.findByRole('dialog', { name: 'Ejercicios del día' })
    await userEvent.click(
      within(hoja).getByRole('button', { name: (texto) => texto.includes(PRESS) }),
    )

    // Assert
    expect(await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)).toBeInTheDocument()
  })

  test('no se pliega mientras queden series por hacer', async () => {
    await abrirUpperA()

    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    expect(screen.getByLabelText(`Guardar la serie 2 de ${PRESS}`)).toBeInTheDocument()
  })
})

describe('barra de progreso de la sesión', () => {
  test('dice cuántas series llevas mientras entrenas', async () => {
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert
    const barra = await screen.findByRole('progressbar', { name: 'Progreso de la sesión' })
    await waitFor(() => expect(barra).toHaveTextContent('1 de 16 series'))
  })

  test('lleva el botón de terminar, sin bajar a buscarlo', async () => {
    // §19: la cierra el participante. Antes había que llegar al final de la
    // lista de ocho ejercicios para encontrar el botón.
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    await screen.findByRole('progressbar', { name: 'Progreso de la sesión' })
    expect(screen.getByRole('button', { name: 'Terminar sesión' })).toBeInTheDocument()
  })

  test('no aparece antes de empezar: no hay sesión que resumir', async () => {
    await abrirUpperA()

    expect(
      screen.queryByRole('progressbar', { name: 'Progreso de la sesión' }),
    ).not.toBeInTheDocument()
  })

  test('desaparece al terminar la sesión', async () => {
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByRole('progressbar', { name: 'Progreso de la sesión' })

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Terminar sesión' }))

    // Assert
    await waitFor(() =>
      expect(
        screen.queryByRole('progressbar', { name: 'Progreso de la sesión' }),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByText(/Sesión terminada/)).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Temporizador de descanso' })).not.toBeInTheDocument()
  })
})

describe('el cronómetro convive con la barra de sesión', () => {
  test('con sesión abierta se aparta para no taparla', async () => {
    // Los dos son fijos al fondo: sin esto el cronómetro se comía la barra.
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByRole('progressbar', { name: 'Progreso de la sesión' })

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Descanso' })[0])

    // Assert
    const cronometro = await screen.findByRole('status', { name: 'Temporizador de descanso' })
    expect(cronometro).not.toHaveClass('descanso--sin-barra')
  })

  test('sin sesión empezada ocupa el sitio de la barra', async () => {
    await abrirUpperA()

    await userEvent.click(screen.getAllByRole('button', { name: 'Descanso' })[0])

    const cronometro = await screen.findByRole('status', { name: 'Temporizador de descanso' })
    expect(cronometro).toHaveClass('descanso--sin-barra')
  })

  test('sigue visible al cambiar de ejercicio', async () => {
    // Se descansa mirando el siguiente ejercicio, no la tarjeta que acabas de
    // terminar: el cronómetro no puede desaparecer al navegar.
    await abrirUpperA()
    await userEvent.click(screen.getAllByRole('button', { name: 'Descanso' })[0])
    await screen.findByRole('status', { name: 'Temporizador de descanso' })

    // Cambiar de ejercicio: la fila «Siguiente» del final del ejercicio.
    await userEvent.click(
      screen.getByRole('button', { name: /Press convergente inclinado/ }),
    )
    await screen.findByText('Press convergente inclinado')

    expect(
      screen.getByRole('status', { name: 'Temporizador de descanso' }),
    ).toBeInTheDocument()
  })
})

describe('ficha del ejercicio desde el entrenamiento (fases 4 y 5)', () => {
  test('se abre sin salir de la sesión', async () => {
    // Delante de la máquina se consulta el ejercicio sin perder el sitio.
    await abrirUpperA()

    await userEvent.click(screen.getAllByRole('button', { name: 'Ficha' })[0])

    const ficha = await screen.findByRole('dialog', { name: PRESS })
    expect(within(ficha).getByText('Músculo principal')).toBeInTheDocument()
    expect(within(ficha).getByText(/^Alternativas \(\d+\)$/)).toBeInTheDocument()
  })

  test('abrirla y cerrarla NO pierde lo que llevas tecleado', async () => {
    // Es la condición que pide el plan: consultar la ficha no puede costarte la
    // serie a medio escribir.
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Subir reps de la serie 1 de ${PRESS}`))

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Ficha' })[0])
    const ficha = await screen.findByRole('dialog', { name: PRESS })
    await userEvent.click(within(ficha).getByRole('button', { name: 'Cerrar' }))

    // Assert
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: PRESS })).not.toBeInTheDocument(),
    )
    expect(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`)).toHaveTextContent('2.5')
    expect(screen.getByLabelText(`Reps de la serie 1 de ${PRESS}`)).toHaveTextContent('2')
  })

  test('muestra el historial de esa variante, no el de otra (§16)', async () => {
    // Arrange: 45 lb/lado × 5 la última vez con el Smith
    await sembrarSesionAnterior()
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Ficha' })[0])

    // Assert
    const ficha = await screen.findByRole('dialog', { name: PRESS })
    expect(within(ficha).getByText('Historial de esta variante')).toBeInTheDocument()
    expect(within(ficha).getByText(/45\/lado lb × 5/)).toBeInTheDocument()
  })

  test('una variante sin historial lo dice, en vez de dejar el hueco vacío', async () => {
    await abrirUpperA()

    await userEvent.click(screen.getAllByRole('button', { name: 'Ficha' })[0])

    const ficha = await screen.findByRole('dialog', { name: PRESS })
    expect(within(ficha).getByText('Todavía sin entrenar.')).toBeInTheDocument()
  })

  test('cada alternativa aparece una sola vez y React no avisa de claves duplicadas', async () => {
    const errorDeConsola = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    try {
      await abrirUpperA()

      await userEvent.click(screen.getAllByRole('button', { name: 'Ficha' })[0])

      const ficha = await screen.findByRole('dialog', { name: PRESS })
      expect(
        within(ficha).getAllByRole('button', { name: 'Press de banca plano con barra' }),
      ).toHaveLength(1)
      expect(errorDeConsola.mock.calls.flat().join(' ')).not.toContain(
        'Encountered two children with the same key',
      )
    } finally {
      errorDeConsola.mockRestore()
    }
  })
})

describe('avisar de que se recuperó un borrador', () => {
  test('al volver, dice que lo que ves lo dejaste tú a medias', async () => {
    // Sin aviso aparecen números que el participante no recuerda haber escrito
    // y no sabe si son suyos o una sugerencia de la app.
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))
    await waitFor(async () => {
      expect(await repositorio.obtenerBorrador(idDeLaPrimeraSerie())).toBeDefined()
    })

    // Act
    cleanup()
    await abrirUpperA()

    // Assert
    expect(await screen.findByText('Recuperado sin guardar')).toBeInTheDocument()
  })

  test('sin borrador no avisa de nada', async () => {
    await abrirUpperA()

    expect(screen.queryByText('Recuperado sin guardar')).not.toBeInTheDocument()
  })

  test('el aviso se va al guardar la serie', async () => {
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))
    await waitFor(async () => {
      expect(await repositorio.obtenerBorrador(idDeLaPrimeraSerie())).toBeDefined()
    })
    cleanup()
    await abrirUpperA()
    await screen.findByText('Recuperado sin guardar')

    // Act
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert
    await waitFor(() =>
      expect(screen.queryByText('Recuperado sin guardar')).not.toBeInTheDocument(),
    )
  })
})

describe('teclado móvil (Fase 2)', () => {
  test('el peso pide un teclado decimal y las reps uno numérico', async () => {
    // El peso lleva decimales (2.5 lb por lado); las repeticiones no. Pedir el
    // teclado que toca ahorra un cambio de modo en cada serie.
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`))

    // Assert
    expect(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`)).toHaveAttribute(
      'inputmode',
      'decimal',
    )

    await userEvent.click(screen.getByLabelText(`Reps de la serie 1 de ${PRESS}`))
    expect(screen.getByLabelText(`Reps de la serie 1 de ${PRESS}`)).toHaveAttribute(
      'inputmode',
      'numeric',
    )
  })
})

describe('Última vez (Phase 1A)', () => {
  /** Varias series de una misma sesión anterior, con el peso que se le pase. */
  async function sembrarSesionDe(
    fecha: string,
    series: readonly { peso: number; reps: number; calentamiento?: boolean }[],
    ejercicioId: string = PRESS_BANCA_15_SMITH.id,
  ) {
    const sesionId = `sesion-${fecha}-${ejercicioId}`
    await repositorio.crearSesion({
      id: sesionId,
      participanteId,
      plantillaDiaId: idDeDia(participanteId, 'upper-a'),
      fecha,
    })
    await Promise.all(
      series.map((s, indice) =>
        repositorio.registrarSerie({
          id: `${sesionId}-${indice}`,
          sesionId,
          ejercicioId,
          numeroSerie: indice + 1,
          pesoRegistradoLb: s.peso,
          repsRealizadas: s.reps,
          rir: 2,
          esCalentamiento: s.calentamiento,
        }),
      ),
    )
  }

  const ultimaVez = async () => {
    const bloque = (await screen.findByText('Última vez')).parentElement!
    return within(bloque).getByText(/.+/, { selector: '.referencia__valor, .referencia__vacio' })
  }

  test('sin historial lo dice, en vez de inventarse un guion', async () => {
    // Antes ponía "—", que se lee como un dato que falta y no como "aún no hay".
    await abrirUpperA()

    expect(await screen.findByText('Sin historial')).toBeInTheDocument()
  })

  test('con una ejecución anterior muestra peso y repeticiones', async () => {
    // Arrange
    await sembrarSesionAnterior()

    // Act
    await abrirUpperA()

    // Assert: 45 lb por lado, tal como se cargó la barra.
    expect(await screen.findByText('45 lb/lado × 5')).toBeInTheDocument()
  })

  test('con varias series iguales las agrupa', async () => {
    await sembrarSesionDe('2026-01-05', [
      { peso: 45, reps: 5 },
      { peso: 45, reps: 5 },
      { peso: 45, reps: 5 },
    ])

    await abrirUpperA()

    expect(await screen.findByText('3 × 45 lb/lado × 5')).toBeInTheDocument()
  })

  test('con repeticiones que caen las lista, que es lo informativo', async () => {
    await sembrarSesionDe('2026-01-05', [
      { peso: 45, reps: 5 },
      { peso: 45, reps: 5 },
      { peso: 45, reps: 3 },
    ])

    await abrirUpperA()

    expect(await screen.findByText('45 lb/lado × 5, 5, 3')).toBeInTheDocument()
  })

  test('el calentamiento de la sesión anterior no cuenta como referencia', async () => {
    // §20–21: se guarda, pero no es la marca de nada.
    await sembrarSesionDe('2026-01-05', [
      { peso: 20, reps: 10, calentamiento: true },
      { peso: 45, reps: 5 },
    ])

    await abrirUpperA()

    expect(await screen.findByText('45 lb/lado × 5')).toBeInTheDocument()
    expect(screen.queryByText(/20 lb\/lado/)).not.toBeInTheDocument()
  })

  test('sólo la última sesión, no una mezcla de todas', async () => {
    // Arrange: dos sesiones distintas del mismo ejercicio
    await sembrarSesionDe('2026-01-05', [{ peso: 40, reps: 8 }])
    await sembrarSesionDe('2026-01-12', [{ peso: 45, reps: 5 }])

    // Act
    await abrirUpperA()

    // Assert
    expect(await screen.findByText('45 lb/lado × 5')).toBeInTheDocument()
    expect(screen.queryByText(/40 lb\/lado/)).not.toBeInTheDocument()
  })

  test('un borrador sin guardar no es una ejecución anterior', async () => {
    // Los borradores viven en otra tabla justamente para esto.
    await repositorio.guardarBorrador({
      id: idDeLaPrimeraSerie(),
      participanteId,
      fecha: fechaDeHoy(),
      plantillaDiaId: idDeDia(participanteId, 'upper-a'),
      orden: 1,
      numeroSerie: 1,
      pesoRegistradoLb: 999,
      repsRealizadas: 99,
      rir: 0,
      guardadoEn: new Date().toISOString(),
    })

    await abrirUpperA()

    // El borrador SÍ vuelve a la serie editable de hoy —para eso existe— pero
    // no puede colarse como referencia de la sesión anterior.
    expect(await screen.findByText('Sin historial')).toBeInTheDocument()
    const bloque = (await screen.findByText('Última vez')).parentElement!
    expect(within(bloque).queryByText(/999/)).not.toBeInTheDocument()
  })

  test('lo guardado hoy tampoco: la sesión de hoy no es su propia referencia', async () => {
    // Arrange
    await sembrarSesionAnterior()
    await abrirUpperA()
    expect(await screen.findByText('45 lb/lado × 5')).toBeInTheDocument()

    // Act: se guarda una serie de hoy con otro peso
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert: "Última vez" sigue mirando a la sesión anterior
    await waitFor(async () => {
      expect(await ultimaVez()).toHaveTextContent('45 lb/lado × 5')
    })
  })

  test('la referencia es de la variante, no del movimiento', async () => {
    // §16: cada variante conserva su propio historial. Lo levantado en otra
    // máquina no puede aparecer como referencia de ésta.
    await sembrarSesionDe('2026-01-05', [{ peso: 80, reps: 6 }], 'press-banca-plano-barra')

    await abrirUpperA()

    expect(await screen.findByText('Sin historial')).toBeInTheDocument()
    expect(screen.queryByText(/80 lb/)).not.toBeInTheDocument()
  })

  test('es sólo lectura: no hay nada que tocar en el bloque', async () => {
    await sembrarSesionAnterior()
    await abrirUpperA()

    const bloque = (await screen.findByText('Última vez')).parentElement!
    expect(within(bloque).queryByRole('button')).not.toBeInTheDocument()
    expect(within(bloque).queryByRole('textbox')).not.toBeInTheDocument()
  })
})

describe('cierre de sesión (Phase 1B)', () => {
  const barra = () => screen.queryByRole('progressbar', { name: 'Progreso de la sesión' })

  test('el progreso aparece al guardar la primera serie y va contando', async () => {
    // Antes de guardar nada no hay sesión abierta, así que tampoco barra.
    await abrirUpperA()
    expect(barra()).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    const progreso = await screen.findByRole('progressbar', { name: 'Progreso de la sesión' })
    // Crear la sesión y registrar su primera serie son dos escrituras. La
    // consulta reactiva puede observar brevemente la sesión todavía en 0 antes
    // de recibir la serie; esperamos el estado final que prometió Guardar.
    await waitFor(() => {
      expect(progreso).toHaveAttribute('aria-valuenow', '1')
      expect(progreso).toHaveTextContent('1 de 16 series')
    })
  })

  test('la serie guardada se distingue de la pendiente', async () => {
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    // Assert: la 1 pasa a tener "Editar"; la 2 sigue con "Guardar".
    expect(await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)).toBeInTheDocument()
    expect(screen.getByLabelText(`Guardar la serie 2 de ${PRESS}`)).toBeInTheDocument()
  })

  test('terminar la sesión la cierra y lo dice', async () => {
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByRole('progressbar', { name: 'Progreso de la sesión' })

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Terminar sesión' }))

    // Assert: la barra se retira y la pantalla confirma
    expect(
      await screen.findByText('Sesión terminada. Lo registrado ya está en el historial.'),
    ).toBeInTheDocument()
    await waitFor(() => expect(barra()).not.toBeInTheDocument())
  })

  test('la sesión queda registrada con su hora de cierre', async () => {
    // Arrange
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByRole('progressbar', { name: 'Progreso de la sesión' })

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Terminar sesión' }))

    // Assert
    await waitFor(async () => {
      const sesiones = await repositorio.listarSesiones(participanteId)
      expect(sesiones.filter((s) => s.fecha === fechaDeHoy())).toHaveLength(1)
      expect(sesiones.find((s) => s.fecha === fechaDeHoy())?.completadaEn).toBeDefined()
    })
  })

  test('guardar varias series no crea varias sesiones', async () => {
    // La sesión se busca por fecha y día antes de crearla: guardar de nuevo,
    // navegar o recargar tiene que reutilizar la misma.
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)
    await userEvent.click(screen.getByLabelText(`Guardar la serie 2 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 2 de ${PRESS}`)

    const sesiones = await repositorio.listarSesiones(participanteId)
    expect(sesiones.filter((s) => s.fecha === fechaDeHoy())).toHaveLength(1)
  })

  test('volver a montar la pantalla tampoco duplica la sesión', async () => {
    // Equivale a recargar la app o volver desde otra pestaña.
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    cleanup()
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 2 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 2 de ${PRESS}`)

    const sesiones = await repositorio.listarSesiones(participanteId)
    expect(sesiones.filter((s) => s.fecha === fechaDeHoy())).toHaveLength(1)
  })

  test('un borrador sin guardar no abre sesión ni cuenta como progreso', async () => {
    // Arrange: se toca un valor, que dispara el autosave del borrador
    await abrirUpperA()
    await userEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${PRESS}`))
    await waitFor(async () => {
      expect(await repositorio.obtenerBorrador(idDeLaPrimeraSerie())).toBeDefined()
    })

    // Assert: sigue sin haber sesión ni barra
    expect(barra()).not.toBeInTheDocument()
    expect(await repositorio.listarSesiones(participanteId)).toHaveLength(0)
  })

  test('el calentamiento cuenta como serie hecha pero no como referencia', async () => {
    // La lógica vigente: se guarda y se ve, pero no arrastra el progreso a
    // engaño ni se convierte en la marca del ejercicio.
    await abrirUpperA()
    await userEvent.click(
      screen.getByLabelText(`Marcar la serie 1 de ${PRESS} como calentamiento`),
    )
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    const progreso = await screen.findByRole('progressbar', { name: 'Progreso de la sesión' })
    expect(progreso).toBeInTheDocument()
    const series = await repositorio.historialDeEjercicio(participanteId, PRESS_BANCA_15_SMITH.id)
    expect(series.filter((s) => s.esCalentamiento)).toHaveLength(1)
  })
})

describe('pestañas de días', () => {
  test('el selector de días lleva su propio modificador y el número de días', async () => {
    render(<EntrenamientoHoy repositorio={repositorio} />)
    const nav = await screen.findByRole('navigation', { name: 'Día de entrenamiento' })
    const dias = within(nav).getAllByRole('button').length
    expect(nav).toHaveClass('filtros', 'filtros--dias')
    expect(nav).toHaveAttribute('data-dias', String(dias))
  })
})

describe('bi-series: se alterna sin descanso y se descansa al cerrar la ronda', () => {
  const CONVERGENTE = 'Press convergente inclinado'
  const cronometro = () => screen.queryByRole('status', { name: 'Temporizador de descanso' })

  /** Upper A con el press y el convergente unidos en la bi-serie A (4 series, 3 min). */
  async function conBiSerie() {
    const plantillas = await repositorio.listarPlantillas(participanteId)
    const upper = plantillas.find((p) => p.id === idDeDia(participanteId, 'upper-a'))!
    await repositorio.guardarPlantilla({ ...upper, slots: unir(upper.slots, 0) })
  }

  async function guardar(numeroSerie: number, nombre: string) {
    await userEvent.click(await screen.findByLabelText(`Guardar la serie ${numeroSerie} de ${nombre}`))
  }

  test('Hoy muestra el grupo con su etiqueta', async () => {
    await conBiSerie()
    await abrirResumen()
    const grupo = screen.getByRole('group', { name: 'Bi-serie A' })
    expect(within(grupo).getByText(PRESS)).toBeInTheDocument()
    expect(within(grupo).getByText(CONVERGENTE)).toBeInTheDocument()
    expect(within(grupo).getByText(/^A2 · 4 series/)).toBeInTheDocument()
  })

  test('A1 → B1 sin descanso → descanso del grupo → A2', async () => {
    await conBiSerie()
    await abrirUpperA()
    expect(screen.getByText('Bi-serie A · Ronda 1 de 4')).toBeInTheDocument()
    expect(screen.getByText('A1 de 2')).toBeInTheDocument()

    await guardar(1, PRESS)
    expect(await screen.findByLabelText(`Guardar la serie 1 de ${CONVERGENTE}`)).toBeInTheDocument()
    expect(screen.getByText('A2 de 2')).toBeInTheDocument()
    expect(cronometro()).not.toBeInTheDocument()

    await guardar(1, CONVERGENTE)
    await waitFor(() => expect(cronometro()).toHaveTextContent('3:00'))
    expect(await screen.findByLabelText(`Guardar la serie 2 de ${PRESS}`)).toBeInTheDocument()
    expect(screen.getByText('Bi-serie A · Ronda 2 de 4')).toBeInTheDocument()
  })

  test('empezar la ronda siguiente durante el descanso lo cierra: no sigue contando en B', async () => {
    await conBiSerie()
    await abrirUpperA()
    await guardar(1, PRESS)
    await guardar(1, CONVERGENTE)
    await waitFor(() => expect(cronometro()).toBeInTheDocument())

    // No espera a que acabe: arranca A2 con el descanso aún en marcha.
    await guardar(2, PRESS)
    expect(await screen.findByLabelText(`Guardar la serie 2 de ${CONVERGENTE}`)).toBeInTheDocument()
    await waitFor(() => expect(cronometro()).not.toBeInTheDocument())
  })

  test('tras la última ronda pasa al siguiente bloque', async () => {
    await conBiSerie()
    await abrirUpperA()
    for (const n of [1, 2, 3, 4]) {
      await guardar(n, PRESS)
      await guardar(n, CONVERGENTE)
    }
    expect(await screen.findByLabelText('Guardar la serie 1 de Lat pulldown')).toBeInTheDocument()
    expect(screen.getByText('Ejercicio 3 de 5')).toBeInTheDocument()
  })

  test('navegar a mano a B y guardar cierra la ronda y vuelve a A', async () => {
    await conBiSerie()
    await abrirUpperA()
    const tira = screen.getByRole('navigation', { name: 'Bi-serie A' })
    await userEvent.click(within(tira).getByRole('button', { name: /^A2/ }))
    await guardar(1, CONVERGENTE)
    expect(await screen.findByRole('status', { name: 'Temporizador de descanso' })).toBeInTheDocument()
    expect(await screen.findByLabelText(`Guardar la serie 1 de ${PRESS}`)).toBeInTheDocument()
  })

  test('al recargar a mitad de la ronda se retoma en el punto del flujo', async () => {
    await conBiSerie()
    await abrirUpperA()
    await guardar(1, PRESS)
    await screen.findByLabelText(`Guardar la serie 1 de ${CONVERGENTE}`)
    cleanup()
    await abrirUpperA()
    expect(await screen.findByLabelText(`Guardar la serie 1 de ${CONVERGENTE}`)).toBeInTheDocument()
    expect(screen.getByText('A2 de 2')).toBeInTheDocument()
  })

  test('corregir una serie no mueve el flujo', async () => {
    await conBiSerie()
    await abrirUpperA()
    await guardar(1, PRESS)
    await screen.findByLabelText(`Guardar la serie 1 de ${CONVERGENTE}`)
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Bi-serie A' })).getByRole('button', { name: /^A1/ }))
    await userEvent.click(await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`))
    await guardar(1, PRESS)
    await waitFor(() => expect(screen.getByLabelText(`Editar la serie 1 de ${PRESS}`)).toBeInTheDocument())
    expect(screen.queryByLabelText(`Guardar la serie 1 de ${CONVERGENTE}`)).not.toBeInTheDocument()
    expect(cronometro()).not.toBeInTheDocument()
  })
})

describe('el gesto de deslizar se puede descubrir', () => {
  const PISTA = 'Desliza a los lados para cambiar de ejercicio'
  beforeEach(() => localStorage.removeItem('sfm:pista-deslizar-vista'))

  test('la primera vez se explica, y no vuelve a salir', async () => {
    await abrirUpperA()
    expect(screen.getByText(PISTA)).toBeInTheDocument()
    cleanup()
    // Visto una vez (cerrada o usada): en este dispositivo no se repite.
    localStorage.setItem('sfm:pista-deslizar-vista', '1')
    await abrirUpperA()
    expect(screen.queryByText(PISTA)).not.toBeInTheDocument()
  })

  test('se cierra sola a los pocos segundos y queda recordada', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      await abrirUpperA()
      expect(screen.getByText(PISTA)).toBeInTheDocument()
      await vi.advanceTimersByTimeAsync(5100)
      await waitFor(() => expect(screen.queryByText(PISTA)).not.toBeInTheDocument())
      expect(localStorage.getItem('sfm:pista-deslizar-vista')).toBe('1')
    } finally {
      vi.useRealTimers()
    }
  })

  test('los puntos marcan cuántos ejercicios hay y cuál es el actual', async () => {
    await abrirUpperA()
    const puntos = document.querySelectorAll('.entreno__punto')
    expect(puntos).toHaveLength(5)
    expect(puntos[0]).toHaveClass('entreno__punto--actual')
  })
})

describe('las series pendientes muestran el objetivo, no un valor que parezca hecho', () => {
  test('sin peso de partida, sólo el rango de reps del coach', async () => {
    await abrirUpperA()
    // Upper A empieza por el press de fuerza: 1–5 reps, sin historial.
    const pendientes = document.querySelectorAll('.serie__pendiente-valor')
    expect(pendientes.length).toBeGreaterThan(0)
    for (const p of pendientes) {
      expect(p).toHaveTextContent('1–5 reps')
      expect(p).not.toHaveTextContent(/0 lb/)
    }
  })
})
