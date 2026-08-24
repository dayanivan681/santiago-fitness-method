import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EntrenamientoHoy } from './EntrenamientoHoy'
import { baseDePrueba } from '../../pruebas/base'
import { RepositorioLocal } from '../../datos/repositorioLocal'
import { sembrar } from '../../datos/semilla'
import { idDeDia } from '../../datos/semilla'
import { sembrarParticipante } from '../../pruebas/participante'
import { fechaDeHoy } from '../../datos/repositorio'
import { idBorrador } from '../../logica/borrador'
import { evitar } from '../../logica/limitaciones'
import { actualizarSlot, anadirSlot, MAX_EJERCICIOS_POR_DIA } from '../../logica/plantilla'
import type { PlantillaDia } from '../../dominio/tipos'
import { PRESS_BANCA_15_SMITH } from '../../datos/semilla/biblioteca'

let repositorio: RepositorioLocal
let participanteId: string

const PRESS = 'Press banca 15° Smith'

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

/** El primer ejercicio viene desplegado; los demás hay que abrirlos. */
async function abrirUpperA() {
  render(<EntrenamientoHoy repositorio={repositorio} />)
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
  test('muestra los 5 ejercicios de Upper A sin que el participante escriba nada', async () => {
    await abrirUpperA()

    // §29: los cinco ejercicios, con Military Press ya retirado
    expect(screen.getByText(PRESS)).toBeInTheDocument()
    expect(screen.getByText('Press inclinado convergente')).toBeInTheDocument()
    expect(screen.getByText('Lat pulldown')).toBeInTheDocument()
    expect(screen.getByText('Hip thrust con barra')).toBeInTheDocument()
    expect(screen.getByText('Elevación lateral')).toBeInTheDocument()
    expect(screen.queryByText(/Military Press/i)).not.toBeInTheDocument()
  })

  test('las series y el rango de reps ya están definidos', async () => {
    await abrirUpperA()

    // §4 y §10: el primer ejercicio es de fuerza, rango 1–5
    expect(screen.getByText('4 series · 1–5 reps')).toBeInTheDocument()
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
    expect(await screen.findAllByText('45/lado lb × 5 · RIR 2')).not.toHaveLength(0)
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
    expect(screen.getAllByText(/Anterior: 45\/lado lb × 5 · RIR 2/)).toHaveLength(4)

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
    expect(screen.getByText('Press banca plano con barra')).toBeInTheDocument()
    expect(screen.getAllByText('Historial propio').length).toBeGreaterThan(1)
  })

  test('por defecto el cambio vale sólo para hoy: la plantilla no se toca', async () => {
    // El motivo corriente para cambiar es puntual — la máquina está ocupada —,
    // así que no puede reescribir el entrenamiento del participante.
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Cambiar variante' })[0])
    await userEvent.click(await screen.findByText('Press banca plano con barra'))

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
    await userEvent.click(screen.getByText('Press banca plano con barra'))

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
    await userEvent.click(await screen.findByText('Press banca plano con barra'))
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

describe('días sin definir (§28)', () => {
  test('avisa que Lower A todavía no tiene ejercicios', async () => {
    render(<EntrenamientoHoy repositorio={repositorio} />)

    await userEvent.click(await screen.findByRole('button', { name: 'Lower A' }))

    expect(await screen.findByText(/todavía no tiene ejercicios definidos/)).toBeInTheDocument()
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
    render(<EntrenamientoHoy repositorio={repositorio} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Lower A' }))

    // Assert: los ocho, cada uno con su plan a la vista
    for (const ejercicio of ocho) {
      expect(await screen.findByText(ejercicio.nombre), ejercicio.nombre).toBeInTheDocument()
    }
    expect(lleno.slots).toHaveLength(MAX_EJERCICIOS_POR_DIA)
  })
})

describe('temporizador manual (criterio 5)', () => {
  /** Los campos de la serie son <output>, que también tienen rol de estado. */
  const cronometro = () =>
    screen.queryByRole('status', { name: 'Temporizador de descanso' })

  test('guardar una serie no arranca el cronómetro', async () => {
    // El cliente lo pide manual: antes saltaba solo al guardar. Ojo, esto no es
    // el descanso *medido* de §5, que se sigue derivando de las marcas de tiempo.
    // Arrange
    await abrirUpperA()

    // Act
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    // Assert
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
    await userEvent.click(screen.getByRole('button', { name: 'Listo' }))
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
    expect(await screen.findByText(/Objetivo: 47\.5\/lado lb \(\+2\.5\/lado\)/)).toBeInTheDocument()
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
