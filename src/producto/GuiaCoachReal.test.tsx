import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { GuiaAyuda } from './GuiaAyuda';
import { ContextoAyuda, type Ayuda } from './ayuda-contexto';
import { AvisoNovedades } from './Novedades';
import { useNovedades } from './useNovedades';

afterEach(cleanup);

const ayudaCoachReal: Ayuda = {
  clienteId: '', demo: false, preparada: true, tieneActividad: false, esCliente: false,
  cerrados: new Set(['bienvenida:coach']), completados: new Set(),
  cerrar: vi.fn(), confirmarCliente: vi.fn(), confirmarSerie: vi.fn(),
};

function montar(ruta = '/admin') {
  return render(
    <ContextoAyuda value={ayudaCoachReal}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/admin/*" element={<><GuiaAyuda base="/admin" permitirBienvenida clientes={3} /><p>Panel</p></>} />
        </Routes>
      </MemoryRouter>
    </ContextoAyuda>,
  );
}

it('el coach con clientes ve el recorrido al abrir el panel, aunque antes lo cerrara', () => {
  montar();
  expect(screen.getByRole('dialog', { name: 'Tus clientes' })).toBeInTheDocument();
  expect(screen.getByText(/Ya tienes 3 clientes/)).toBeInTheDocument();
});

it('«Saltar» lo cierra en esta visita y Ayuda lo vuelve a abrir', () => {
  montar();
  fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
  expect(screen.queryByRole('dialog', { name: 'Tus clientes' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Abrir ayuda' }));
  fireEvent.click(screen.getByRole('button', { name: 'Ver recorrido' }));
  expect(screen.getByRole('dialog', { name: 'Tus clientes' })).toBeInTheDocument();
});

it('una nueva visita lo vuelve a enseñar', () => {
  const { unmount } = montar();
  fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
  unmount();
  montar();
  expect(screen.getByRole('dialog', { name: 'Tus clientes' })).toBeInTheDocument();
});

it('no interrumpe una entrada directa a otra pantalla', () => {
  montar('/admin/clientes/cliente-1');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

function PanelConNovedades() {
  // Mismo cableado que Coach: el recorrido espera a que se cierren las novedades.
  const novedades = useNovedades('coach', true, { lista: [
    { id: 'n1', fecha: '2026-10-21', audiencia: 'coach', titulo: 'Tu panel, más claro', puntos: ['Algo nuevo'] },
  ], hoy: new Date('2026-10-21T12:00:00') });
  return <>
    <GuiaAyuda base="/admin" permitirBienvenida={!novedades.pendientes.length} clientes={3} />
    {novedades.pendientes.length > 0 && <AvisoNovedades novedades={novedades.pendientes} cerrar={novedades.marcarVistas} />}
  </>;
}

it('tras una actualización, las novedades salen antes que el recorrido y no se apilan', () => {
  localStorage.clear();
  render(
    <ContextoAyuda value={ayudaCoachReal}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes><Route path="/admin/*" element={<PanelConNovedades />} /></Routes>
      </MemoryRouter>
    </ContextoAyuda>,
  );
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(screen.getByRole('dialog', { name: 'Novedades' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(screen.getByRole('dialog', { name: 'Tus clientes' })).toBeInTheDocument();
});
