import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { RecorridoCoach } from './RecorridoCoach';

afterEach(cleanup);

it('recorre cuatro pasos con Siguiente y Atrás y termina en los clientes', () => {
  const irAClientes = vi.fn();
  const cerrar = vi.fn();
  render(<RecorridoCoach clientes={3} cerrar={cerrar} irAClientes={irAClientes} />);

  expect(screen.getByRole('dialog', { name: 'Tus clientes' })).toBeInTheDocument();
  expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument();
  expect(screen.getByText(/Ya tienes 3 clientes/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(screen.getByRole('dialog', { name: 'Su plan' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Atrás' }));
  expect(screen.getByRole('dialog', { name: 'Tus clientes' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(screen.getByRole('dialog', { name: 'Su acceso' })).toBeInTheDocument();
  expect(screen.getByText(/con su email o con Google/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  expect(screen.getByRole('dialog', { name: 'Su progreso' })).toBeInTheDocument();
  expect(screen.getByText('Paso 4 de 4')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Ver mis clientes' }));
  expect(irAClientes).toHaveBeenCalledOnce();
  expect(cerrar).toHaveBeenCalledOnce();
});

it('con un solo cliente lo dice en singular', () => {
  render(<RecorridoCoach clientes={1} cerrar={vi.fn()} irAClientes={vi.fn()} />);
  expect(screen.getByText(/Ya tienes 1 cliente\./)).toBeInTheDocument();
});

it('se puede saltar desde cualquier paso', () => {
  const cerrar = vi.fn();
  render(<RecorridoCoach clientes={3} cerrar={cerrar} irAClientes={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
  fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
  expect(cerrar).toHaveBeenCalledOnce();
});

it('sin clientes, el primer paso invita a crear el primero', () => {
  render(<RecorridoCoach clientes={0} cerrar={vi.fn()} irAClientes={vi.fn()} />);
  expect(screen.getByText(/Empieza con Nuevo cliente/)).toBeInTheDocument();
  expect(screen.queryByText(/Ya tienes/)).not.toBeInTheDocument();
});
