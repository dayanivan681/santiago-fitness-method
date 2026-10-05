import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BibliotecaCoach } from './BibliotecaCoach'
import { ContextoBiblioteca } from './contextoBiblioteca'
import { ServicioCoach } from './servicio'
import { useBibliotecaDelCoach } from './useBibliotecaDelCoach'

// En jsdom no hay lienzo: el primer cuadro del GIF se simula como un JPEG.
vi.mock('../datos/imagen', () => ({
  reducirImagen: async (b: Blob) => (b.type === 'image/gif' ? new Blob(['cuadro'], { type: 'image/jpeg' }) : b),
}))

afterEach(cleanup)
beforeEach(() => {
  let n = 0
  URL.createObjectURL = vi.fn(() => `blob:${++n}`)
  URL.revokeObjectURL = vi.fn()
})

function Panel({ servicio }: { servicio: ServicioCoach }) {
  return <ContextoBiblioteca.Provider value={useBibliotecaDelCoach(servicio)}><BibliotecaCoach /></ContextoBiblioteca.Provider>
}
const gif = (bytes = 10) => new File([new Uint8Array(bytes)], 'mov.gif', { type: 'image/gif' })

async function nuevoConGif(servicio: ServicioCoach, archivo: File) {
  render(<Panel servicio={servicio} />)
  fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/ }))
  fireEvent.click(within(screen.getByRole('dialog')).getByText('Nuevo'))
  const f = screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  fireEvent.change(within(f).getByLabelText('Nombre'), { target: { value: 'Remo con movimiento' } })
  fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'cable' } })
  fireEvent.change(within(f).getByLabelText('Músculo principal'), { target: { value: 'espalda' } })
  fireEvent.change(within(f).getByLabelText(/Foto de la máquina/), { target: { files: [archivo] } })
  return f
}

it('un GIF muestra la animación en la vista previa y guarda foto fija + animación', async () => {
  const servicio = new ServicioCoach(true)
  const subirFoto = vi.spyOn(servicio.biblioteca, 'subirFoto')
  const subirAnimacion = vi.spyOn(servicio.biblioteca, 'subirAnimacion')
  const f = await nuevoConGif(servicio, gif())
  expect(await within(f).findByText('Animación')).toBeInTheDocument()
  expect(within(f).getByAltText('Animación elegida')).toBeInTheDocument()
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect((subirFoto.mock.calls[0][1] as Blob).type).toBe('image/jpeg')
  expect((subirAnimacion.mock.calls[0][1] as Blob).type).toBe('image/gif')
  const [creado] = await servicio.biblioteca.listar()
  expect(creado).toMatchObject({ tieneFoto: true, tieneAnimacion: true })
  // En la lista: insignia «GIF» y la foto fija, nunca la animación.
  const fila = (await screen.findByText('Remo con movimiento')).closest('button')!
  expect(within(fila).getByText('GIF')).toBeInTheDocument()
  expect(fila.querySelector('img')!.getAttribute('src')).not.toBe(servicio.biblioteca.urlDeAnimacion(creado))
})

it('un GIF de más de 5 MB se rechaza con ayuda para reducirlo', async () => {
  const f = await nuevoConGif(new ServicioCoach(true), gif(5 * 1024 * 1024 + 1))
  expect(await within(f).findByText(/El GIF pesa más de 5 MB.*ezgif\.com/)).toBeInTheDocument()
  expect(within(f).queryByText('Animación')).toBeNull()
})

it('si falla la animación, el ejercicio no se duplica y el reintento sólo sube lo pendiente', async () => {
  const servicio = new ServicioCoach(true)
  const crear = vi.spyOn(servicio.biblioteca, 'crear')
  const subirAnimacion = vi.spyOn(servicio.biblioteca, 'subirAnimacion').mockRejectedValueOnce(new Error('Sin red'))
  const f = await nuevoConGif(servicio, gif())
  await within(f).findByText('Animación')
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  expect(await within(f).findByText(/Sin red.*vuelve a intentar para subir la foto o la animación/)).toBeInTheDocument()
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(crear).toHaveBeenCalledTimes(1)
  expect(subirAnimacion).toHaveBeenCalledTimes(2)
  expect(await servicio.biblioteca.listar()).toHaveLength(1)
})

it('cambiar el GIF por una foto normal quita la animación', async () => {
  const servicio = new ServicioCoach(true)
  const creado = await servicio.biblioteca.crear({
    referenciaCatalogo: null, nombre: 'Con GIF', equipo: 'cable', movimiento: 'coach-con-gif', musculoPrimario: 'espalda',
    musculosSecundarios: [], tipoCarga: 'pesoMaquina', incrementoMinimoLb: 10, pesoBaseMaquinaLb: null, explicacionCorta: '',
  })
  await servicio.biblioteca.subirFoto(creado.id, new Blob(['f'], { type: 'image/jpeg' }))
  await servicio.biblioteca.subirAnimacion(creado.id, gif())
  render(<Panel servicio={servicio} />)
  fireEvent.click((await screen.findByText('Con GIF')).closest('button')!)
  const ficha = await screen.findByRole('dialog', { name: 'Con GIF' })
  fireEvent.click(within(ficha).getByRole('button', { name: 'Editar' }))
  const f = screen.getByRole('dialog', { name: 'Editar ejercicio' })
  expect(within(f).getByText('Animación')).toBeInTheDocument()
  fireEvent.change(within(f).getByLabelText(/Foto de la máquina/), { target: { files: [new File(['x'], 'f.jpg', { type: 'image/jpeg' })] } })
  await waitFor(() => expect(within(f).queryByText('Animación')).toBeNull())
  fireEvent.click(within(f).getByRole('button', { name: 'Guardar cambios' }))
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Editar ejercicio' })).toBeNull())
  expect((await servicio.biblioteca.listar())[0]).toMatchObject({ tieneFoto: true, tieneAnimacion: false })
})
