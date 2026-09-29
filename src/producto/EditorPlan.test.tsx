import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { EditorPlan } from './EditorPlan';
import { perfil, plan } from '../../pruebas-v2/fixtures';
import { BIBLIOTECA_INICIAL } from '../datos/semilla/biblioteca';
import { Plan } from '../../shared/v2/contratos';

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

it('el coach encuentra lo que pidió buscando «45» y «unilateral», y el servidor acepta el plan', () => {
  const cambiar = vi.fn();
  render(<EditorPlan plan={plan} perfil={perfil} onChange={cambiar} />);
  fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/ }));
  const hoja = screen.getByRole('dialog', { name: 'Añadir ejercicio' });
  const buscar = within(hoja).getByRole('textbox', { name: 'Buscar ejercicio' });

  fireEvent.change(buscar, { target: { value: '45' } });
  expect(within(hoja).getByText('Prensa de piernas 45°')).toBeInTheDocument();

  fireEvent.change(buscar, { target: { value: 'unilateral' } });
  expect(within(hoja).getAllByText(/unilateral/i).length).toBeGreaterThanOrEqual(11);

  fireEvent.change(buscar, { target: { value: '45' } });
  fireEvent.click(within(hoja).getByText('Prensa de piernas 45°'));
  const nuevo = cambiar.mock.calls.at(-1)![0];
  expect(nuevo.dias[0].slots.at(-1).ejercicioId).toBe('sfm-catalog-c191');
  // Editar deja el plan «por revisar»; una vez revisado, el id nuevo es válido.
  expect(nuevo.revisado).toBe(false);
  const validado = Plan.safeParse({ ...nuevo, revisado: true });
  expect(validado.success ? '' : JSON.stringify(validado.error.issues)).toBe('');
});

it('la lista de «Añadir ejercicio» muestra el equipo en lenguaje sencillo, no su clave interna', () => {
  render(<EditorPlan plan={plan} perfil={perfil} onChange={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: /Añadir ejercicio/ }));
  const hoja = screen.getByRole('dialog', { name: 'Añadir ejercicio' });
  fireEvent.change(within(hoja).getByRole('textbox', { name: 'Buscar ejercicio' }), { target: { value: 'banca plano con barra' } });
  const opcion = within(hoja).getByText('Press de banca plano con barra').closest('button')!;
  expect(within(opcion).getByText(/Barra libre/)).toBeInTheDocument();
  expect(hoja).not.toHaveTextContent(/barraLibre|maquinaTradicional|pesoCorporal/);
  // También se busca por el nombre que ve el coach.
  const buscar = within(hoja).getByRole('textbox', { name: 'Buscar ejercicio' });
  fireEvent.change(buscar, { target: { value: 'pila' } });
  expect(within(hoja).getByText('Extensión de cuádriceps')).toBeInTheDocument();
  expect(hoja).not.toHaveTextContent(/maquinaTradicional/);
  // «plate» encuentra las máquinas de discos por su etiqueta.
  fireEvent.change(buscar, { target: { value: 'plate' } });
  expect(within(hoja).getByText('Prensa de piernas 45°')).toBeInTheDocument();
  expect(within(hoja).queryByText('Extensión de cuádriceps')).toBeNull();
});

it('«Pasar a 5 días» sólo aparece con 2 Lower y 2 Upper, pide confirmación y deja 5 sesiones por revisar', () => {
  const cambiar = vi.fn();
  const { rerender } = render(<EditorPlan plan={plan} perfil={perfil} onChange={cambiar} />);
  fireEvent.click(screen.getByRole('button', { name: 'Organizar sesiones' }));
  let hoja = screen.getByRole('dialog', { name: 'Orden de las sesiones' });
  fireEvent.click(within(hoja).getByRole('button', { name: /Pasar a 5 días/ }));
  expect(within(hoja).getByText(/Se añadirá Lower C.*Tus ejercicios no cambian/)).toBeInTheDocument();
  expect(cambiar).not.toHaveBeenCalled();
  fireEvent.click(within(hoja).getByRole('button', { name: 'Confirmar' }));
  const nuevo = cambiar.mock.calls.at(-1)![0];
  expect(nuevo.dias.map((d: { nombre: string }) => d.nombre)).toEqual(['Lower A', 'Upper A', 'Lower B', 'Upper B', 'Lower C']);
  expect(nuevo.revisado).toBe(false);
  rerender(<EditorPlan plan={nuevo} perfil={perfil} onChange={cambiar} />);
  expect(within(screen.getByLabelText('Sesión del programa')).getAllByRole('button')).toHaveLength(5);
  fireEvent.click(screen.getByRole('button', { name: 'Organizar sesiones' }));
  hoja = screen.getByRole('dialog', { name: 'Orden de las sesiones' });
  expect(within(hoja).queryByRole('button', { name: /Pasar a 5 días/ })).toBeNull();
});
