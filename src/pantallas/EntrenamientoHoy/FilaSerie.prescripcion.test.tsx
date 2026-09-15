import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { RepositorioMemoria } from '../../nube/memoria'
import { idBorrador } from '../../logica/borrador'
import { FilaSerie } from './FilaSerie'
import { BIBLIOTECA_INICIAL } from '../../datos/semilla/biblioteca'
import { aCargaTotalLb } from '../../dominio/carga'
const ejercicio = BIBLIOTECA_INICIAL[0]
const props = { numeroSerie: 1, ejercicio, repMin: 8, repMax: 12, conEtiquetas: true, onGuardar: vi.fn(), onCorregir: vi.fn() }
const peso = () => screen.getByLabelText(`Peso de la serie 1 de ${ejercicio.nombre}`)
const reps = () => screen.getByLabelText(`Reps de la serie 1 de ${ejercicio.nombre}`)
const referencia = { cargaTotalLb: aCargaTotalLb(20, ejercicio), reps: 5, rir: 2, tecnica: 'buena' as const }
const registrada = { id: 'serie', sesionId: 'sesion', ejercicioId: ejercicio.id, numeroSerie: 1, pesoRegistradoLb: 27.5, repsRealizadas: 7, rir: 2 }
afterEach(cleanup)
it('precarga la sugerencia del Coach sobre el historial y usa el rango actual', () => {
  render(<FilaSerie {...props} referencia={referencia} pesoSugeridoLb={42.5} />)
  expect(peso()).toHaveTextContent('42.5')
  expect(reps()).toHaveTextContent('8')
})
it('cero es una sugerencia válida; sin sugerencia usa el historial y acota las reps', () => {
  const { rerender } = render(<FilaSerie {...props} referencia={{ ...referencia, reps: 15 }} pesoSugeridoLb={0} />)
  expect(peso()).toHaveTextContent('0'); expect(reps()).toHaveTextContent('12')
  rerender(<FilaSerie {...props} referencia={referencia} />)
  expect(peso()).toHaveTextContent('20')
})
it('respeta la serie guardada, las cifras usadas hoy y la edición del Cliente', () => {
  render(<FilaSerie {...props} pesoSugeridoLb={42.5} registrada={registrada} />)
  expect(peso()).toHaveTextContent('27.5'); expect(reps()).toHaveTextContent('7')
  cleanup()
  render(<FilaSerie {...props} pesoSugeridoLb={42.5} partida={registrada} />)
  expect(peso()).toHaveTextContent('27.5')
  cleanup()
  const vista = render(<FilaSerie {...props} pesoSugeridoLb={42.5} />)
  fireEvent.click(screen.getByLabelText(`Subir peso de la serie 1 de ${ejercicio.nombre}`))
  const editado = peso().textContent
  vista.rerender(<FilaSerie {...props} pesoSugeridoLb={50} />)
  expect(peso().textContent).toBe(editado)
})
it('cierra opciones con botón, Escape o toque exterior y conserva la nota', async () => {
  const { container } = render(<FilaSerie {...props} />)
  const menu = container.querySelector('details')!
  const abrir = async () => { await userEvent.click(screen.getByText('Más opciones')); await waitFor(() => expect(menu.open).toBe(true)) }
  await abrir()
  await userEvent.type(screen.getByLabelText(`Nota de la serie 1 de ${ejercicio.nombre}`), 'Sin molestias')
  await userEvent.click(screen.getByRole('button', { name: 'Cerrar opciones' }))
  expect(menu.open).toBe(false); expect(screen.getByText('Más opciones')).toHaveFocus()
  await abrir(); expect(screen.getByLabelText(`Nota de la serie 1 de ${ejercicio.nombre}`)).toHaveValue('Sin molestias')
  await userEvent.keyboard('{Escape}'); expect(menu.open).toBe(false)
  await abrir(); fireEvent.pointerDown(document.body); expect(menu.open).toBe(false)
})

it('un borrador recuperado conserva lo escrito frente a una nueva sugerencia', async () => {
  const repo = new RepositorioMemoria()
  const clave = { participanteId: 'qa', fecha: '2026-09-15', plantillaDiaId: 'dia', orden: 1 }
  await repo.guardarBorrador({ ...clave, id: idBorrador({ ...clave, numeroSerie: 1 }), numeroSerie: 1,
    pesoRegistradoLb: 32.5, repsRealizadas: 7, rir: 2, guardadoEn: new Date().toISOString() })
  render(<FilaSerie {...props} pesoSugeridoLb={42.5} repositorio={repo} claveDeBorrador={clave} />)
  await waitFor(() => expect(peso()).toHaveTextContent('32.5'))
  expect(reps()).toHaveTextContent('7')
})
