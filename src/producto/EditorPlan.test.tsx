import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { EditorPlan } from './EditorPlan';
import { perfil, plan } from '../../pruebas-v2/fixtures';
import { BIBLIOTECA_INICIAL } from '../datos/semilla/biblioteca';

afterEach(cleanup);

it('cada ejercicio elegido lleva su foto, la misma que el cliente tocará para verlo', () => {
  render(<EditorPlan plan={plan} perfil={perfil} onChange={vi.fn()} />);
  const primero = BIBLIOTECA_INICIAL.find((e) => e.id === plan.dias[0].slots[0].ejercicioId)!;
  const fila = screen.getByText(primero.nombre).closest('button')!;
  expect(fila.querySelector('img')).toHaveAttribute('src', primero.imagen);
});

it('al añadir un ejercicio, la lista enseña la foto de cada opción', () => {
  render(<EditorPlan plan={plan} perfil={perfil} onChange={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/ }));
  const hoja = screen.getByRole('dialog', { name: 'Añadir ejercicio' });
  fireEvent.change(within(hoja).getByRole('textbox', { name: 'Buscar ejercicio' }), { target: { value: 'barra V' } });
  const opcion = within(hoja).getByText('Extensión de tríceps en polea con barra V').closest('button')!;
  expect(opcion.querySelector('img')).toHaveAttribute('src', '/ejercicios/extension-triceps-polea.jpg');
});
