import 'fake-indexeddb/auto'
import { useState } from 'react'
import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EntrenamientoHoy } from './EntrenamientoHoy'
import { Entrenamiento } from './Entrenamiento'
import { ProveedorDescanso } from '../../aplicacion/ProveedorDescanso'
import { Descanso } from '../../componentes/Descanso'
import { useMemoria } from '../../aplicacion/memoria'
import { baseDePrueba } from '../../pruebas/base'
import { RepositorioLocal } from '../../datos/repositorioLocal'
import { sembrar } from '../../datos/semilla'
import { sembrarParticipante } from '../../pruebas/participante'

/**
 * El corte entre Hoy y el modo entrenamiento.
 *
 * Hasta M2 eran la misma pantalla: se abría la app y ya estaban delante los
 * campos de la primera serie. Lo que se comprueba aquí es que ahora son dos
 * cosas distintas —Hoy dice qué toca, entrenar registra— y que el paso de una a
 * otra no pierde el sitio.
 */

let repositorio: RepositorioLocal
const PRESS = 'Press inclinado bajo (15°) en Smith'

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
    </ProveedorDescanso>
  )
}

async function abrirHoy() {
  render(<Pantalla />)
  await userEvent.click(await screen.findByRole('button', { name: 'Upper A' }))
  await screen.findByText(PRESS)
}

async function entrar() {
  await abrirHoy()
  await userEvent.click(
    await screen.findByRole('button', { name: /Comenzar entrenamiento|^Continuar/ }),
  )
  await screen.findByText(PRESS)
}

beforeEach(async () => {
  const db = baseDePrueba(`prueba-hoy-${crypto.randomUUID()}`)
  repositorio = new RepositorioLocal(db)
  await sembrar(repositorio)
  await sembrarParticipante(repositorio)
})

describe('Hoy dice qué toca, no lo registra', () => {
  test('resume el día sin abrir un solo campo de serie', async () => {
    await abrirHoy()

    // El plan completo, legible de un vistazo.
    expect(screen.getByText(/5 ejercicios · 16 series/)).toBeInTheDocument()
    expect(screen.getByText('Lat pulldown')).toBeInTheDocument()

    // Y ni un control de registro: eso es lo que la convertía en formulario.
    expect(screen.queryByLabelText(`Peso de la serie 1 de ${PRESS}`)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(`Guardar la serie 1 de ${PRESS}`)).not.toBeInTheDocument()
  })

  test('sin sesión empezada, la única acción es comenzar', async () => {
    await abrirHoy()

    expect(
      screen.getByRole('button', { name: 'Comenzar entrenamiento' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Continuar/ })).not.toBeInTheDocument()
  })

  test('con una sesión empezada, invita a continuar y dice por dónde va', async () => {
    // Arrange: una serie registrada abre la sesión del día.
    await entrar()
    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))
    await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)

    // Act: volver al resumen.
    await userEvent.click(screen.getByRole('button', { name: 'Volver al resumen del día' }))

    // Assert
    expect(
      await screen.findByRole('button', { name: 'Continuar · 1 de 16 series' }),
    ).toBeInTheDocument()
  })
})

describe('el modo entrenamiento enseña un ejercicio a la vez', () => {
  test('sólo el ejercicio en curso, con su sitio en el día', async () => {
    await entrar()

    expect(screen.getByText('Ejercicio 1 de 5')).toBeInTheDocument()
    // Los otros cuatro no están en pantalla; el siguiente sí se anuncia.
    expect(screen.queryByText('Lat pulldown')).not.toBeInTheDocument()
    expect(screen.getByText('Press convergente inclinado')).toBeInTheDocument()
  })

  test('la lista del día lleva a cualquiera de los cinco', async () => {
    await entrar()

    await userEvent.click(screen.getByRole('button', { name: 'Ejercicios del día' }))
    const hoja = await screen.findByRole('dialog', { name: 'Ejercicios del día' })
    await userEvent.click(within(hoja).getByRole('button', { name: /Lat pulldown/ }))

    expect(await screen.findByText('Ejercicio 3 de 5')).toBeInTheDocument()
  })

  test('sólo se abre la serie que toca; las siguientes esperan en una línea', async () => {
    // Cuatro bloques de steppers abiertos a la vez eran el formulario que había
    // que quitar. Abrir una que no toca sigue siendo posible, tocándola.
    await entrar()

    expect(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`)).toBeInTheDocument()
    expect(screen.queryByLabelText(`Peso de la serie 2 de ${PRESS}`)).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText(`Abrir la serie 2 de ${PRESS}`))

    expect(screen.getByLabelText(`Peso de la serie 2 de ${PRESS}`)).toBeInTheDocument()
  })

  test('al guardar una serie, la siguiente pasa a estar abierta sola', async () => {
    await entrar()

    await userEvent.click(screen.getByLabelText(`Guardar la serie 1 de ${PRESS}`))

    expect(
      await screen.findByLabelText(`Peso de la serie 2 de ${PRESS}`),
    ).toBeInTheDocument()
  })
})

describe('teclado: peso → reps → guardar', () => {
  test('la tecla de retorno anuncia lo que hace en cada campo', async () => {
    await entrar()

    await userEvent.click(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`))
    const peso = await screen.findByRole('spinbutton', { name: `Peso de la serie 1 de ${PRESS}` })
    // «Siguiente» y no «Hecho»: después del peso vienen las reps.
    expect(peso).toHaveAttribute('enterkeyhint', 'next')
    expect(peso).toHaveAttribute('inputmode', 'decimal')
  })

  test('Intro en el peso salta a las reps sin cerrar el teclado', async () => {
    await entrar()

    await userEvent.click(screen.getByLabelText(`Peso de la serie 1 de ${PRESS}`))
    await userEvent.keyboard('{Enter}')

    const reps = await screen.findByRole('spinbutton', { name: `Reps de la serie 1 de ${PRESS}` })
    expect(reps).toHaveAttribute('enterkeyhint', 'done')
    expect(reps).toHaveFocus()
  })

  test('Intro en las reps guarda la serie', async () => {
    await entrar()

    await userEvent.click(screen.getByLabelText(`Reps de la serie 1 de ${PRESS}`))
    await userEvent.keyboard('{Enter}')

    expect(await screen.findByLabelText(`Editar la serie 1 de ${PRESS}`)).toBeInTheDocument()
  })
})
