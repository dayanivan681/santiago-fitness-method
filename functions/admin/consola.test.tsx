import 'fake-indexeddb/auto'
import { render,screen,fireEvent,cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { afterEach,describe,it,expect } from 'vitest'
import { Coach } from '../../src/producto/Coach'
import { ServicioCoach } from '../../src/producto/servicio'
afterEach(cleanup)
function abrir(ruta='/demo/coach'){const servicio=new ServicioCoach(true);render(<MemoryRouter initialEntries={[ruta]}><Routes><Route path="/demo/coach/*" element={<Coach servicio={servicio} base="/demo/coach" preview={()=>{}} entrenar={()=>{}}/>}/></Routes></MemoryRouter>);return servicio}
describe('Coach compartido en React',()=>{
 it('ofrece tres destinos y muestra actividad real del repositorio',async()=>{abrir();await screen.findByText('Actividad reciente');const nav=screen.getByRole('navigation',{name:'Navegación del Coach'});expect(nav.querySelectorAll('a')).toHaveLength(3);expect(screen.getByRole('link',{name:'Clientes'})).toHaveAttribute('href','/demo/coach/clientes')})
 it('buscar una persona nunca muestra sus IDs técnicos',async()=>{abrir();fireEvent.click(screen.getByRole('link',{name:'Clientes'}));await screen.findByLabelText('Buscar cliente');fireEvent.change(screen.getByLabelText('Buscar cliente'),{target:{value:'Marcos'}});await screen.findByText('Marcos Vega');expect(screen.queryByText('Alicia Rivera')).not.toBeInTheDocument();expect(document.body.textContent).not.toContain('demo-persona-')})
 it('crear cliente comienza por la persona y objetivo, sin edad o peso inventados',async()=>{abrir();fireEvent.click(screen.getByRole('link',{name:'Nuevo cliente'}));await screen.findByLabelText(/Nombre/);expect(screen.getByLabelText(/Nombre/)).toHaveValue('');expect(document.body.textContent).not.toContain('cliente-');expect(screen.queryByText('70 kg')).not.toBeInTheDocument()})
})
