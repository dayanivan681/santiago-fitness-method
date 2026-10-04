import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BibliotecaCoach } from './BibliotecaCoach'
import { ContextoBiblioteca } from './contextoBiblioteca'
import { ServicioCoach } from './servicio'
import { useBibliotecaDelCoach } from './useBibliotecaDelCoach'

// jsdom no decodifica vídeo: se simula el conversor y se comprueba lo que la pantalla le pide.
const conversor = vi.hoisted(() => ({
  videoAGif: vi.fn(),
  cerrar: vi.fn(),
}))
vi.mock('../datos/videoAGif', async (original) => ({
  ...(await original<typeof import('../datos/videoAGif')>()),
  abrirVideo: async () => ({ video: { videoWidth: 1280, duration: 10 }, cerrar: conversor.cerrar }),
  videoAGif: conversor.videoAGif,
}))

afterEach(cleanup)
beforeEach(() => {
  let n = 0
  URL.createObjectURL = vi.fn(() => `blob:${++n}`)
  URL.revokeObjectURL = vi.fn()
  conversor.videoAGif.mockReset()
  conversor.cerrar.mockReset()
})

function Panel({ servicio }: { servicio: ServicioCoach }) {
  return <ContextoBiblioteca.Provider value={useBibliotecaDelCoach(servicio)}><BibliotecaCoach /></ContextoBiblioteca.Provider>
}
const video = (bytes = 100) => new File([new Uint8Array(bytes)], 'press.mov', { type: 'video/quicktime' })

function abrirConVideo(servicio: ServicioCoach, archivo = video()) {
  render(<Panel servicio={servicio} />)
  fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/ }))
  fireEvent.click(within(screen.getByRole('dialog')).getByText('Nuevo'))
  const f = screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  fireEvent.change(within(f).getByLabelText('Nombre'), { target: { value: 'Push Press' } })
  fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'barraLibre' } })
  fireEvent.change(within(f).getByLabelText('Músculo principal'), { target: { value: 'deltoideAnterior' } })
  const input = within(f).getByLabelText(/Foto de la máquina/) as HTMLInputElement
  expect(input).toHaveAttribute('accept', 'image/*,video/*')
  fireEvent.change(input, { target: { files: [archivo] } })
  return f
}

it('un vídeo abre el recorte con valores ya puestos y crea el GIF con el tramo elegido', async () => {
  conversor.videoAGif.mockImplementation(async (_v, _o, progreso: (f: number) => void) => {
    progreso(0.5)
    return { gif: new Blob(['g'], { type: 'image/gif' }), fija: new Blob(['j'], { type: 'image/jpeg' }) }
  })
  const servicio = new ServicioCoach(true)
  const subirAnimacion = vi.spyOn(servicio.biblioteca, 'subirAnimacion')
  const f = abrirConVideo(servicio)
  const vista = within(f).getByLabelText('Vídeo elegido') as HTMLVideoElement
  Object.defineProperty(vista, 'duration', { value: 10 })
  fireEvent.loadedMetadata(vista)
  expect(within(f).getByRole('button', { name: '3 s' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(f).getByRole('button', { name: 'Normal' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.change(within(f).getByRole('slider'), { target: { value: '2.5' } })
  fireEvent.click(within(f).getByRole('button', { name: '4 s' }))
  fireEvent.click(within(f).getByRole('button', { name: 'Lenta' }))
  fireEvent.click(within(f).getByRole('button', { name: 'Crear GIF' }))
  expect(await within(f).findByText('Animación')).toBeInTheDocument()
  expect(conversor.videoAGif.mock.calls[0][1]).toEqual({ inicio: 2.5, duracion: 4, velocidad: 'lenta' })
  expect(conversor.cerrar).toHaveBeenCalled()
  expect(within(f).queryByRole('button', { name: 'Crear GIF' })).toBeNull()
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect((subirAnimacion.mock.calls[0][1] as Blob).type).toBe('image/gif')
  expect((await servicio.biblioteca.listar())[0]).toMatchObject({ tieneFoto: true, tieneAnimacion: true })
})

it('si el vídeo no se puede leer lo dice y deja elegir otro', async () => {
  const { ErrorVideo } = await import('../datos/videoAGif')
  conversor.videoAGif.mockRejectedValue(new ErrorVideo('No pudimos leer ese vídeo.'))
  const f = abrirConVideo(new ServicioCoach(true))
  fireEvent.click(within(f).getByRole('button', { name: 'Crear GIF' }))
  expect(await within(f).findByText(/No pudimos leer ese vídeo\. Prueba con otro vídeo/)).toBeInTheDocument()
  fireEvent.click(within(f).getByRole('button', { name: 'Cancelar' }))
  expect(within(f).getByText('Elegir foto o vídeo')).toBeInTheDocument()
})

it('rechaza vídeos enormes antes de intentar convertirlos', () => {
  const grande = video(10)
  Object.defineProperty(grande, 'size', { value: 201 * 1024 * 1024 })
  const f = abrirConVideo(new ServicioCoach(true), grande)
  expect(within(f).getByText(/El vídeo es demasiado grande/)).toBeInTheDocument()
  expect(within(f).queryByRole('button', { name: 'Crear GIF' })).toBeNull()
})
