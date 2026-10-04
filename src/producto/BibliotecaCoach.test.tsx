import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { plan, perfil } from '../../pruebas-v2/fixtures'
import { BibliotecaCoach } from './BibliotecaCoach'
import { ContextoBiblioteca } from './contextoBiblioteca'
import { EditorPlan } from './EditorPlan'
import { ServicioCoach } from './servicio'
import { useBibliotecaDelCoach } from './useBibliotecaDelCoach'

afterEach(cleanup)
beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:foto')
  URL.revokeObjectURL = vi.fn()
})

function Panel({ servicio, hijo }: { servicio: ServicioCoach; hijo: React.ReactNode }) {
  const valor = useBibliotecaDelCoach(servicio)
  return <ContextoBiblioteca.Provider value={valor}>{hijo}</ContextoBiblioteca.Provider>
}

const abrirHoja = () => {
  fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/ }))
  return screen.getByRole('dialog', { name: 'Añadir ejercicio' })
}

it('cancelar el selector de foto conserva la hoja y todos los datos; permite guardar sin foto', async () => {
  const servicio = new ServicioCoach(true)
  const crear = vi.spyOn(servicio.biblioteca, 'crear')
  const subirFoto = vi.spyOn(servicio.biblioteca, 'subirFoto')
  render(<Panel servicio={servicio} hijo={<BibliotecaCoach />} />)
  fireEvent.click(within(abrirHoja()).getByText('Nuevo'))
  const f = screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  fireEvent.change(within(f).getByLabelText('Nombre'), { target: { value: 'Mi remo al cancelar foto' } })
  fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'cable' } })
  fireEvent.change(within(f).getByLabelText('Músculo principal'), { target: { value: 'espalda' } })
  fireEvent.click(within(f).getByLabelText('Bíceps'))
  fireEvent.click(within(f).getByLabelText(/Lo de cada lado/))
  fireEvent.change(within(f).getByLabelText('Salto mínimo entre pesos (lb)'), { target: { value: '2.5' } })
  fireEvent.change(within(f).getByLabelText('Peso de la barra o del carro (lb)'), { target: { value: '45' } })
  fireEvent.change(within(f).getByLabelText('Cómo se hace'), { target: { value: 'Mantén la espalda recta.' } })

  // El cancel del input de archivos se propaga hasta el dialog: no es su cierre.
  fireEvent(within(f).getByLabelText(/Foto de la máquina/), new Event('cancel', { bubbles: true }))

  expect(screen.getByRole('dialog', { name: 'Añadir ejercicio' })).toBe(f)
  expect(f).toHaveAttribute('open')
  expect(within(f).getByLabelText('Nombre')).toHaveValue('Mi remo al cancelar foto')
  expect(within(f).getByLabelText('Equipo')).toHaveValue('cable')
  expect(within(f).getByLabelText('Músculo principal')).toHaveValue('espalda')
  expect(within(f).getByLabelText('Bíceps')).toBeChecked()
  expect(within(f).getByLabelText(/Lo de cada lado/)).toBeChecked()
  expect(within(f).getByLabelText('Salto mínimo entre pesos (lb)')).toHaveValue('2.5')
  expect(within(f).getByLabelText('Peso de la barra o del carro (lb)')).toHaveValue('45')
  expect(within(f).getByLabelText('Cómo se hace')).toHaveValue('Mantén la espalda recta.')
  expect(crear).not.toHaveBeenCalled()
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect((await servicio.biblioteca.listar())[0]).toMatchObject({
    nombre: 'Mi remo al cancelar foto', musculosSecundarios: ['biceps'],
    incrementoMinimoLb: 2.5, pesoBaseMaquinaLb: 45, tieneFoto: false,
  })
  expect(subirFoto).not.toHaveBeenCalled()
})

it.each(['cancel', 'Cerrar'])('la hoja sigue cerrando con %s cuando se pide explícitamente', (accion) => {
  render(<Panel servicio={new ServicioCoach(true)} hijo={<BibliotecaCoach />} />)
  const hoja = abrirHoja()
  if (accion === 'cancel') fireEvent(hoja, new Event('cancel', { cancelable: true }))
  else fireEvent.click(within(hoja).getByRole('button', { name: 'Cerrar' }))
  expect(screen.queryByRole('dialog')).toBeNull()
})

it('por «De mi catálogo»: busca una ficha, rellena nombre y equipo y queda como «Tuyo»', async () => {
  const servicio = new ServicioCoach(true)
  render(<Panel servicio={servicio} hijo={<BibliotecaCoach />} />)
  const hoja = abrirHoja()
  fireEvent.click(within(hoja).getByText('De mi catálogo'))
  const catalogo = screen.getByRole('dialog', { name: 'De mi catálogo' })
  fireEvent.change(within(catalogo).getByRole('textbox', { name: 'Buscar en mi catálogo' }), { target: { value: 'goblet' } })
  fireEvent.click(within(catalogo).getByText('Goblet squat'))

  const formulario = screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  expect(within(formulario).getByLabelText('Nombre')).toHaveValue('Goblet squat')
  expect(within(formulario).getByLabelText('Equipo')).toHaveValue('')

  // Falta el equipo (el PDF no lo trae para esta ficha): no guarda y lo dice.
  fireEvent.click(within(formulario).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  expect(await within(formulario).findByText('Elige el equipo.')).toBeInTheDocument()

  fireEvent.change(within(formulario).getByLabelText('Músculo principal'), { target: { value: 'cuadriceps' } })
  fireEvent.change(within(formulario).getByLabelText('Equipo'), { target: { value: 'mancuernas' } })
  fireEvent.click(within(formulario).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

  const tarjeta = (await screen.findAllByText('Tuyo'))[0].closest('article')!
  expect(within(tarjeta).getByRole('heading', { name: 'Goblet squat' })).toBeInTheDocument()
  expect((await servicio.biblioteca.listar())[0]).toMatchObject({ referenciaCatalogo: 'C173', musculoPrimario: 'cuadriceps' })
})

it('por «Nuevo»: formulario en blanco, hereda el movimiento de «Se parece a…» y sube la foto', async () => {
  const servicio = new ServicioCoach(true)
  render(<Panel servicio={servicio} hijo={<BibliotecaCoach />} />)
  fireEvent.click(within(abrirHoja()).getByText('Nuevo'))
  const f = screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  expect(within(f).getByLabelText('Nombre')).toHaveValue('')
  fireEvent.change(within(f).getByLabelText('Nombre'), { target: { value: 'Remo en mi máquina' } })
  fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'maquinaTradicional' } })
  fireEvent.change(within(f).getByLabelText('Músculo principal'), { target: { value: 'espalda' } })
  fireEvent.change(within(f).getByLabelText(/Se parece a/), { target: { value: 'sfm-catalog-c191' } })
  const foto = new File(['x'], 'maquina.jpg', { type: 'image/jpeg' })
  fireEvent.change(within(f).getByLabelText(/Foto de la máquina/), { target: { files: [foto] } })
  await waitFor(() => expect(within(f).getByAltText('Foto elegida')).toBeInTheDocument())
  fireEvent(within(f).getByLabelText(/Foto de la máquina/), new Event('cancel', { bubbles: true }))
  expect(screen.getByRole('dialog', { name: 'Añadir ejercicio' })).toBe(f)
  expect(within(f).getByAltText('Foto elegida')).toBeInTheDocument()
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

  const [creado] = await servicio.biblioteca.listar()
  expect(creado).toMatchObject({ nombre: 'Remo en mi máquina', tieneFoto: true })
  expect(creado.movimiento).not.toBe('')
  expect(document.querySelector('article img[src="blob:foto"]')).not.toBeNull()
})

it('valida el nombre y las opciones de carga traen una frase de ejemplo', async () => {
  render(<Panel servicio={new ServicioCoach(true)} hijo={<BibliotecaCoach />} />)
  fireEvent.click(within(abrirHoja()).getByText('Nuevo'))
  const f = screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  expect(within(f).getByText(/discos de 45 lb en cada lado/)).toBeInTheDocument()
  fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'cable' } })
  fireEvent.change(within(f).getByLabelText('Músculo principal'), { target: { value: 'espalda' } })
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  expect(await within(f).findByText('Escribe el nombre.')).toBeInTheDocument()
})

it('edita y archiva un ejercicio propio; las fichas fijas no tienen esas acciones', async () => {
  const servicio = new ServicioCoach(true)
  await servicio.biblioteca.crear({
    referenciaCatalogo: null, nombre: 'Mi remo', equipo: 'cable', movimiento: 'coach-mi-remo', musculoPrimario: 'espalda',
    musculosSecundarios: [], tipoCarga: 'pesoMaquina', incrementoMinimoLb: 5, pesoBaseMaquinaLb: null, explicacionCorta: '',
  })
  render(<Panel servicio={servicio} hijo={<BibliotecaCoach />} />)
  expect(await screen.findAllByRole('button', { name: 'Editar' })).toHaveLength(1)

  fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
  const editar = screen.getByRole('dialog', { name: 'Editar ejercicio' })
  fireEvent.change(within(editar).getByLabelText('Nombre'), { target: { value: 'Mi remo sentado' } })
  fireEvent(within(editar).getByLabelText(/Foto de la máquina/), new Event('cancel', { bubbles: true }))
  expect(screen.getByRole('dialog', { name: 'Editar ejercicio' })).toBe(editar)
  expect(within(editar).getByLabelText('Nombre')).toHaveValue('Mi remo sentado')
  fireEvent.click(within(editar).getByRole('button', { name: 'Guardar cambios' }))
  expect(await screen.findByRole('heading', { name: 'Mi remo sentado' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Archivar' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Archivar ejercicio' })).getByRole('button', { name: 'Archivar' }))
  await waitFor(() => expect(screen.queryByRole('heading', { name: 'Mi remo sentado' })).toBeNull())
  expect(await servicio.biblioteca.listar()).toEqual([])
})

it('el editor de planes ofrece los ejercicios del coach con su foto y la insignia «Tuyo»', async () => {
  const servicio = new ServicioCoach(true)
  const creado = await servicio.biblioteca.crear({
    referenciaCatalogo: null, nombre: 'Prensa de mi gimnasio', equipo: 'maquinaTradicional', movimiento: 'coach-prensa', musculoPrimario: 'cuadriceps',
    musculosSecundarios: [], tipoCarga: 'pesoMaquina', incrementoMinimoLb: 10, pesoBaseMaquinaLb: null, explicacionCorta: '',
  })
  await servicio.biblioteca.subirFoto(creado.id, new Blob(['x'], { type: 'image/jpeg' }))
  const cambiar = vi.fn()
  render(<Panel servicio={servicio} hijo={<EditorPlan plan={plan} perfil={perfil} onChange={cambiar} />} />)
  await waitFor(() => fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/ })))
  const hoja = screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  fireEvent.change(within(hoja).getByRole('textbox', { name: 'Buscar ejercicio' }), { target: { value: 'mi gimnasio' } })
  const opcion = await within(hoja).findByText('Prensa de mi gimnasio')
  expect(opcion.closest('button')!.querySelector('img')).toHaveAttribute('src', 'blob:foto')
  expect(within(opcion.closest('button')!).getByText('Tuyo')).toBeInTheDocument()
  fireEvent.click(opcion)
  expect(cambiar.mock.calls.at(-1)![0].dias[0].slots.at(-1).ejercicioId).toBe(creado.id)
})

async function abrirCatalogoHack() {
  const servicio = new ServicioCoach(true)
  const crear = vi.spyOn(servicio.biblioteca, 'crear')
  render(<Panel servicio={servicio} hijo={<BibliotecaCoach />} />)
  fireEvent.click(within(abrirHoja()).getByText('De mi catálogo'))
  const catalogo = screen.getByRole('dialog', { name: 'De mi catálogo' })
  fireEvent.change(within(catalogo).getByRole('textbox', { name: 'Buscar en mi catálogo' }), { target: { value: 'hack squat' } })
  fireEvent.click(within(catalogo).getByText('Hack squat'))
  const f = screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'maquinaTradicional' } })
  fireEvent.change(within(f).getByLabelText('Músculo principal'), { target: { value: 'cuadriceps' } })
  return { servicio, crear, f }
}

it('no deja crear un ejercicio con el nombre de otro de la biblioteca', async () => {
  const { crear, f } = await abrirCatalogoHack()
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  expect(await within(f).findByText(/Ya hay un ejercicio llamado «Hack squat»/)).toBeInTheDocument()
  expect(crear).not.toHaveBeenCalled()
})

it('compara sin acentos, mayúsculas ni espacios sobrantes', async () => {
  const { crear, f } = await abrirCatalogoHack()
  fireEvent.change(within(f).getByLabelText('Nombre'), { target: { value: '  HACK  squat ' } })
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  expect(await within(f).findByText(/Ya hay un ejercicio llamado/)).toBeInTheDocument()
  expect(crear).not.toHaveBeenCalled()
})

it('al renombrar a un nombre distinto sí guarda', async () => {
  const { servicio, crear, f } = await abrirCatalogoHack()
  fireEvent.change(within(f).getByLabelText('Nombre'), { target: { value: 'Hack squat 45°' } })
  fireEvent.click(within(f).getByRole('button', { name: 'Añadir a mi biblioteca' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(crear).toHaveBeenCalledTimes(1)
  expect((await servicio.biblioteca.listar())[0]).toMatchObject({ nombre: 'Hack squat 45°' })
})

it('editar un ejercicio propio sin cambiar su nombre guarda sin el aviso, pero no puede tomar el de otro', async () => {
  const servicio = new ServicioCoach(true)
  await servicio.biblioteca.crear({
    referenciaCatalogo: null, nombre: 'Mi remo', equipo: 'cable', movimiento: 'coach-mi-remo', musculoPrimario: 'espalda',
    musculosSecundarios: [], tipoCarga: 'pesoMaquina', incrementoMinimoLb: 5, pesoBaseMaquinaLb: null, explicacionCorta: '',
  })
  render(<Panel servicio={servicio} hijo={<BibliotecaCoach />} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))
  const editar = screen.getByRole('dialog', { name: 'Editar ejercicio' })
  fireEvent.change(within(editar).getByLabelText('Nombre'), { target: { value: 'Hack squat' } })
  fireEvent.click(within(editar).getByRole('button', { name: 'Guardar cambios' }))
  expect(await within(editar).findByText(/Ya hay un ejercicio llamado «Hack squat»/)).toBeInTheDocument()
  fireEvent.change(within(editar).getByLabelText('Nombre'), { target: { value: 'Mi remo' } })
  fireEvent.change(within(editar).getByLabelText('Cómo se hace'), { target: { value: 'Con la espalda recta.' } })
  fireEvent.click(within(editar).getByRole('button', { name: 'Guardar cambios' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect((await servicio.biblioteca.listar())[0]).toMatchObject({ nombre: 'Mi remo', explicacionCorta: 'Con la espalda recta.' })
})

it('filtra por músculo y por equipo; el buscador manda sobre los filtros', async () => {
  render(<Panel servicio={new ServicioCoach(true)} hijo={<BibliotecaCoach />} />)
  const titulos = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
  fireEvent.click(screen.getByRole('button', { name: 'Pecho' }))
  expect(titulos()).toContain('Press de banca plano con barra')
  expect(titulos()).not.toContain('Prensa de piernas 45°')
  fireEvent.change(screen.getByRole('combobox', { name: 'Equipo' }), { target: { value: 'maquinaTradicional' } })
  expect(titulos()).toContain('Pec deck / fly de pecho')
  expect(titulos()).not.toContain('Press de banca plano con barra')
  fireEvent.change(screen.getByRole('textbox', { name: 'Buscar en biblioteca' }), { target: { value: 'prensa' } })
  expect(titulos()).toContain('Prensa de piernas 45°')
})

it('con «Peso corporal», la opción de discos se explica como lastre', async () => {
  render(<Panel servicio={new ServicioCoach(true)} hijo={<BibliotecaCoach />} />)
  fireEvent.click(within(abrirHoja()).getByText('Nuevo'))
  const f = screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  expect(within(f).getByText('Solo los discos que añade')).toBeInTheDocument()
  fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'pesoCorporal' } })
  expect(within(f).getByText('Lastre que añades')).toBeInTheDocument()
  expect(within(f).getByText(/Chaleco de 20 lb → 20/)).toBeInTheDocument()
})

it('al buscar, los filtros quedan en pausa con un aviso y vuelven al borrar', () => {
  render(<Panel servicio={new ServicioCoach(true)} hijo={<BibliotecaCoach />} />)
  fireEvent.click(screen.getByRole('button', { name: 'Pecho' }))
  const buscar = screen.getByRole('textbox', { name: 'Buscar en biblioteca' })
  fireEvent.change(buscar, { target: { value: 'curl' } })
  expect(screen.getByText('Buscando en toda la biblioteca')).toBeInTheDocument()
  expect(screen.getByRole('navigation', { name: 'Filtrar por músculo' })).toHaveAttribute('aria-disabled', 'true')
  expect(screen.getByRole('navigation', { name: 'Filtrar por músculo' })).toHaveClass('filtro--en-pausa')
  const titulos = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
  expect(titulos().some((t) => /curl/i.test(t ?? ''))).toBe(true)
  fireEvent.change(buscar, { target: { value: '' } })
  expect(screen.queryByText('Buscando en toda la biblioteca')).toBeNull()
  expect(screen.getByRole('button', { name: 'Pecho' })).toHaveAttribute('aria-pressed', 'true')
  expect(titulos()).toContain('Press de banca plano con barra')
  expect(titulos().some((t) => /curl/i.test(t ?? ''))).toBe(false)
})

describe('detalles del QA en iPhone', () => {
  const abrirNuevo = () => {
    render(<Panel servicio={new ServicioCoach(true)} hijo={<BibliotecaCoach />} />)
    fireEvent.click(within(abrirHoja()).getByText('Nuevo'))
    return screen.getByRole('dialog', { name: 'Añadir ejercicio' })
  }
  const cargaMarcada = (f: HTMLElement) =>
    (within(f).getAllByRole('radio') as HTMLInputElement[]).find((r) => r.checked)!.closest('label')!.textContent

  it('el selector de foto es un botón de la app: «Elegir foto» y, con vista previa, «Cambiar foto»', async () => {
    const f = abrirNuevo()
    expect(within(f).getByText('Elegir foto o vídeo')).toBeInTheDocument()
    const input = within(f).getByLabelText(/Foto de la máquina/) as HTMLInputElement
    expect(input).toHaveClass('solo-lectores')
    expect(input).toHaveAttribute('accept', 'image/*,video/*')
    fireEvent.change(input, { target: { files: [new File(['x'], 'm.jpg', { type: 'image/jpeg' })] } })
    expect(await within(f).findByText('Cambiar foto o vídeo')).toBeInTheDocument()
    expect(within(f).queryByText('Elegir foto o vídeo')).toBeNull()
    expect(f).not.toHaveTextContent(/no file selected/i)
  })

  it('cancelar la foto conserva «Añadir ejercicio» abierto y sin error', async () => {
    const f = abrirNuevo()
    fireEvent.change(within(f).getByLabelText(/Nombre/), { target: { value: 'Mi prensa' } })
    fireEvent.change(within(f).getByLabelText(/Foto de la máquina/), { target: { files: [] } })
    expect(screen.getByRole('dialog', { name: 'Añadir ejercicio' })).toBeInTheDocument()
    expect(within(f).getByLabelText(/Nombre/)).toHaveValue('Mi prensa')
    expect(within(f).queryByRole('alert')).toBeNull()
    expect(within(f).getByText('Elegir foto o vídeo')).toBeInTheDocument()
  })

  it('la carga sigue al equipo mientras el coach no la toque', () => {
    const f = abrirNuevo()
    fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'maquinaTradicional' } })
    expect(cargaMarcada(f)).toMatch('El número de la pila')
    fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'maquinaDiscos' } })
    expect(cargaMarcada(f)).toMatch('Solo los discos que añade')
    fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'barraLibre' } })
    expect(cargaMarcada(f)).toMatch('Lo de cada lado')
    fireEvent.click(within(f).getByText('Todo el peso junto'))
    fireEvent.change(within(f).getByLabelText('Equipo'), { target: { value: 'maquinaTradicional' } })
    expect(cargaMarcada(f)).toMatch('Todo el peso junto')
  })

  it('cuenta en singular y en plural', () => {
    render(<Panel servicio={new ServicioCoach(true)} hijo={<BibliotecaCoach />} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar en biblioteca' }), { target: { value: 'Dominadas' } })
    expect(screen.getByText('1 ejercicio')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar en biblioteca' }), { target: { value: 'press' } })
    expect(screen.getByText(/^\d+ ejercicios$/)).toBeInTheDocument()
  })

  it('sin resultados explica qué hacer, con búsqueda y con filtros', () => {
    render(<Panel servicio={new ServicioCoach(true)} hijo={<BibliotecaCoach />} />)
    const buscar = screen.getByRole('textbox', { name: 'Buscar en biblioteca' })
    fireEvent.change(buscar, { target: { value: 'zzz' } })
    expect(screen.getByText(/No hay ejercicios con “zzz”/)).toBeInTheDocument()
    expect(screen.getByText(/crea uno con «Añadir ejercicio»/)).toBeInTheDocument()
    fireEvent.change(buscar, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Pantorrillas' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Equipo' }), { target: { value: 'smith' } })
    expect(screen.getByText('No hay ejercicios con estos filtros.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }))
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('combobox', { name: 'Equipo' })).toHaveValue('todos')
  })
})
