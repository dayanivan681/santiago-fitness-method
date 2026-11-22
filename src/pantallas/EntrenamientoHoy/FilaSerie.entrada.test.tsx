import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { FilaSerie } from './FilaSerie'
import { BIBLIOTECA_INICIAL } from '../../datos/semilla/biblioteca'
import type { NuevaSerie } from '../../aplicacion/useEntrenamiento'

/**
 * QA del 20 de noviembre, fallo 1: lo tecleado iba detrás del valor («5» →
 * «5135» → «51359»), borrarlo dejaba un 0 delante («01080») y se guardaron
 * 51.359 lb/lado sin ningún aviso.
 */
afterEach(cleanup)

const ejercicio = { ...BIBLIOTECA_INICIAL[0], tipoCarga: 'total' as const }
const etiqueta = `serie 1 de ${ejercicio.nombre}`

function montar(pesoSugeridoLb = 135, repMax = 12) {
  const onGuardar = vi.fn<(valores: NuevaSerie) => Promise<void>>().mockResolvedValue(undefined)
  render(
    <FilaSerie
      numeroSerie={1}
      ejercicio={ejercicio}
      repMin={8}
      repMax={repMax}
      pesoSugeridoLb={pesoSugeridoLb}
      conEtiquetas
      onGuardar={onGuardar}
      onCorregir={vi.fn()}
    />,
  )
  return onGuardar
}

const abrirPeso = async () => {
  await userEvent.click(screen.getByRole('button', { name: `Peso de la ${etiqueta}` }))
  return screen.getByRole('textbox', { name: `Peso de la ${etiqueta}` }) as HTMLInputElement
}
const guardar = () => userEvent.click(screen.getByRole('button', { name: `Guardar la ${etiqueta}` }))

it('al abrir el peso queda todo seleccionado: lo que se escribe lo sustituye', async () => {
  const onGuardar = montar(135)
  const campo = await abrirPeso()

  expect(campo).toHaveFocus()
  expect(campo.selectionStart).toBe(0)
  expect(campo.selectionEnd).toBe(campo.value.length)

  await userEvent.keyboard('140')
  expect(campo.value).toBe('140')
  await userEvent.tab()
  await guardar()
  await waitFor(() => expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ pesoRegistradoLb: 140 })))
})

it('vaciar el campo no deja un 0 delante y, si se sale vacío, vuelve el valor anterior', async () => {
  montar(135)
  const campo = await abrirPeso()

  await userEvent.clear(campo)
  expect(campo.value).toBe('')
  await userEvent.type(campo, '1080')
  expect(campo.value).toBe('1080')

  await userEvent.clear(campo)
  await userEvent.tab()
  expect(screen.getByRole('button', { name: `Peso de la ${etiqueta}` })).toHaveTextContent('135')
})

it('acepta la coma decimal del teclado en español e ignora letras y una quinta cifra', async () => {
  const onGuardar = montar(10)
  const campo = await abrirPeso()

  await userEvent.keyboard('12,5')
  expect(campo.value).toBe('12,5')
  await userEvent.clear(campo)
  await userEvent.type(campo, '51359a')
  expect(campo.value).toBe('5135')
  await userEvent.clear(campo)
  await userEvent.type(campo, '12,5')
  await userEvent.tab()
  await guardar()
  await waitFor(() => expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ pesoRegistradoLb: 12.5 })))
})

it('más del doble del peso de partida pide confirmación antes de guardar', async () => {
  const onGuardar = montar(135)
  const campo = await abrirPeso()
  await userEvent.keyboard('1350')
  await userEvent.tab()

  await guardar()
  expect(screen.getByRole('alert')).toHaveTextContent('1350 lb es más del doble de 135 lb. ¿Es correcto?')
  expect(onGuardar).not.toHaveBeenCalled()

  await userEvent.click(screen.getByRole('button', { name: 'Sí, guardar' }))
  await waitFor(() => expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ pesoRegistradoLb: 1350 })))
  expect(campo).not.toBeInTheDocument()
})

it('«Corregir» reabre el peso y cambiar el número retira el aviso', async () => {
  const onGuardar = montar(135)
  await abrirPeso()
  await userEvent.keyboard('1350')
  await userEvent.tab()
  await guardar()

  await userEvent.click(screen.getByRole('button', { name: 'Corregir' }))
  const campo = screen.getByRole('textbox', { name: `Peso de la ${etiqueta}` })
  await userEvent.keyboard('140')
  await userEvent.tab()
  expect(screen.queryByRole('alert')).toBeNull()
  expect(campo).not.toBeInTheDocument()
  await guardar()
  await waitFor(() => expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ pesoRegistradoLb: 140 })))
})

it('un peso imposible no se guarda ni con confirmación', async () => {
  const onGuardar = montar(135)
  await abrirPeso()
  await userEvent.keyboard('5135')
  await userEvent.tab()
  await guardar()

  expect(screen.getByRole('alert')).toHaveTextContent('5135 lb parece un error')
  expect(screen.queryByRole('button', { name: 'Sí, guardar' })).toBeNull()
  expect(onGuardar).not.toHaveBeenCalled()
})

it('las reps también se seleccionan al abrirlas y avisan si se salen mucho del rango', async () => {
  const onGuardar = montar(135, 12)
  await userEvent.click(screen.getByRole('button', { name: `Reps de la ${etiqueta}` }))
  const campo = screen.getByRole('textbox', { name: `Reps de la ${etiqueta}` }) as HTMLInputElement
  expect(campo.selectionEnd).toBe(campo.value.length)
  expect(campo).toHaveAttribute('inputmode', 'numeric')

  await userEvent.keyboard('80')
  expect(campo.value).toBe('80')
  await userEvent.keyboard('{Enter}')
  expect(screen.getByRole('alert')).toHaveTextContent('80 reps son muchas más de las previstas')
  expect(onGuardar).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Sí, guardar' }))
  await waitFor(() => expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ repsRealizadas: 80 })))
})
