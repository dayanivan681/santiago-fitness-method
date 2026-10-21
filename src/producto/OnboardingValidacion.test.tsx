import 'fake-indexeddb/auto';
import {cleanup,fireEvent,render,screen,within} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {MemoryRouter,Route,Routes} from 'react-router';
import {Onboarding} from './Onboarding';
import {ServicioCoach,planBase} from './servicio';
import {perfil} from '../../pruebas-v2/fixtures';
import type {Alta} from '../../shared/v2/contratos';

afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('un alta 3×7 con cuarta incompleta informa la sesión, conserva el borrador y publica al quitarla', async()=>{
  const servicio=new ServicioCoach(true);
  const plan=planBase(perfil.id,3);
  plan.dias=plan.dias.map((d,i)=>({...d,slots:Array.from({length:i===3?4:7},(_,j)=>({...d.slots[j%d.slots.length],orden:j+1}))}));
  const alta:Alta={id:'alta-qa',paso:3,completado:false,perfil:{...perfil,nombre:'Prueba de alta',frecuenciaEntrenamiento:3},plan:{...plan,revisado:true}};
  await servicio.guardar(undefined,'alta',alta.id,0,alta);
  const crear=vi.spyOn(servicio,'crear');
  render(<MemoryRouter initialEntries={['/nuevo/alta-qa']}><Routes>
    <Route path="/nuevo/:borradorId" element={<Onboarding servicio={servicio} base="/demo/coach"/>}/>
    <Route path="/demo/coach/clientes/:id" element={<h1>Alta completada</h1>}/>
  </Routes></MemoryRouter>);
  await screen.findByRole('heading',{name:'Revisa el plan'});
  expect(screen.getByText('3 días por semana · 4 sesiones en el programa')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Crear cliente y publicar plan'}));
  expect(await screen.findAllByText('Lower B: tiene 4 ejercicios y necesita al menos 5.')).toHaveLength(1);
  expect(screen.getByRole('button',{name:'Revisar Lower B'})).toHaveFocus();
  expect(crear).not.toHaveBeenCalled();
  expect(document.body).not.toHaveTextContent(/"code"|"path"/);
  expect(screen.getByText('Prueba de alta')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Organizar sesiones'}));
  const hoja=screen.getByRole('dialog',{name:'Orden de las sesiones'});
  fireEvent.click(within(hoja).getByRole('button',{name:'Quitar Lower B del borrador'}));
  fireEvent.click(within(hoja).getByRole('button',{name:'Listo'}));
  fireEvent.click(screen.getByRole('checkbox',{name:'He revisado el plan y sus limitaciones.'}));
  fireEvent.click(screen.getByRole('button',{name:'Crear cliente y publicar plan'}));
  await screen.findByRole('heading',{name:'Alta completada'});
  expect(crear).toHaveBeenCalledTimes(1);
  expect(crear.mock.calls[0][0].plan.dias.map(d=>d.slots.length)).toEqual([7,7,7]);
});
