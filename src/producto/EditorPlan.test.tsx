import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
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

it('«Organizar sesiones» se ve como un botón', () => {
  render(<EditorPlan plan={plan} perfil={perfil} onChange={vi.fn()} />);
  const boton = screen.getByRole('button', { name: /Organizar sesiones/ });
  expect(boton).toHaveClass('sfm-secondary', 'sfm-organizar');
  expect(boton).not.toHaveClass('sfm-text-button');
});

describe('bi-series y tri-series', () => {
  function Editor({ inicial }: { inicial: typeof plan }) {
    const [p, setP] = useState(inicial);
    return (
      <EditorPlan
        plan={p}
        perfil={perfil}
        onChange={(nuevo) => {
          ultimo = nuevo;
          setP(nuevo);
        }}
      />
    );
  }
  let ultimo = plan;
  const dia = () => ultimo.dias[0].slots;
  const nombre = (i: number) =>
    BIBLIOTECA_INICIAL.find((e) => e.id === plan.dias[0].slots[i].ejercicioId)!.nombre;
  const unirDe = (i: number) =>
    new RegExp(`^Unir en serie ${nombre(i).replace(/[()°]/g, '\\$&')}`);

  it('unir dos crea «Bi-serie A»; unir un tercero la deja en tri-serie', () => {
    render(<Editor inicial={plan} />);
    fireEvent.click(screen.getByRole('button', { name: unirDe(0) }));
    const bi = screen.getByRole('region', { name: 'Bi-serie A' });
    expect(within(bi).getByText('A1')).toBeInTheDocument();
    expect(within(bi).getByText('A2')).toBeInTheDocument();
    expect(dia().slice(0, 2).map((s) => s.grupo)).toEqual(['A', 'A']);
    expect(dia()[0].descansoSegundos).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: unirDe(1) }));
    expect(screen.getByRole('region', { name: 'Tri-serie A' })).toBeInTheDocument();
    expect(dia().slice(0, 3).map((s) => s.grupo)).toEqual(['A', 'A', 'A']);
    // Con tres no se admite un cuarto.
    expect(screen.queryByRole('button', { name: unirDe(2) })).toBeNull();
  });

  it('separar deshace el grupo y devuelve el descanso', () => {
    render(<Editor inicial={plan} />);
    fireEvent.click(screen.getByRole('button', { name: unirDe(0) }));
    fireEvent.click(within(screen.getByRole('region', { name: 'Bi-serie A' })).getByRole('button', { name: 'Separar' }));
    expect(screen.queryByRole('region', { name: /Bi-serie/ })).toBeNull();
    expect(dia().some((s) => s.grupo)).toBe(false);
    expect(dia()[0].descansoSegundos).toBeGreaterThan(0);
  });

  it('reordenar mueve el grupo entero', () => {
    render(<Editor inicial={plan} />);
    const ids = plan.dias[0].slots.map((s) => s.ejercicioId);
    fireEvent.click(screen.getByRole('button', { name: unirDe(0) }));
    fireEvent.click(screen.getByRole('button', { name: 'Bajar Bi-serie A' }));
    expect(dia().map((s) => s.ejercicioId).slice(0, 3)).toEqual([ids[2], ids[0], ids[1]]);
    expect(dia().map((s) => s.grupo).slice(0, 3)).toEqual([undefined, 'A', 'A']);
  });

  it('las series se ajustan juntas y el descanso sólo se edita en el último', () => {
    render(<Editor inicial={plan} />);
    fireEvent.click(screen.getByRole('button', { name: unirDe(0) }));
    fireEvent.click(screen.getByText(nombre(0)).closest('button')!);
    let hoja = screen.getByRole('dialog', { name: 'Prescripción' });
    expect(within(hoja).getByText(/Las series de la bi-serie se ajustan juntas/)).toBeInTheDocument();
    expect(within(hoja).queryByLabelText(/Descanso/)).toBeNull();
    fireEvent.change(within(hoja).getByLabelText('Series'), { target: { value: '5' } });
    expect(dia().slice(0, 2).map((s) => s.seriesObjetivo)).toEqual([5, 5]);
    fireEvent.click(within(hoja).getByRole('button', { name: 'Listo' }));
    fireEvent.click(screen.getByText(nombre(1)).closest('button')!);
    hoja = screen.getByRole('dialog', { name: 'Prescripción' });
    fireEvent.change(within(hoja).getByLabelText('Descanso entre rondas · segundos'), { target: { value: '90' } });
    expect(dia()[1].descansoSegundos).toBe(90);
  });

  it('el contador cuenta bloques y ejercicios; «Añadir» se bloquea a 8 bloques', () => {
    const ocho = { ...plan, dias: [{ ...plan.dias[0], slots: Array.from({ length: 8 }, (_, i) => ({ ...plan.dias[0].slots[0], orden: i + 1 })) }, ...plan.dias.slice(1)] };
    render(<Editor inicial={ocho} />);
    expect(screen.getByText('8/8 bloques')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Añadir ejercicio/ })).toBeDisabled();
    fireEvent.click(screen.getAllByRole('button', { name: /^Unir en serie/ })[0]);
    expect(screen.getByText('7/8 bloques · 8 ejercicios')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Añadir ejercicio/ })).toBeEnabled();
  });

  it('quitar un miembro de la bi-serie la deshace', () => {
    render(<Editor inicial={plan} />);
    fireEvent.click(screen.getByRole('button', { name: unirDe(0) }));
    fireEvent.click(screen.getByText(nombre(0)).closest('button')!);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar del borrador' }));
    expect(dia().some((s) => s.grupo)).toBe(false);
  });

  it('publicar y releer conserva los grupos', () => {
    const conSeis = { ...plan, dias: plan.dias.map((d, i) => (i === 0 ? { ...d, slots: [...d.slots, { ...d.slots[0], orden: d.slots.length + 1 }] } : d)) };
    render(<Editor inicial={conSeis} />);
    fireEvent.click(screen.getAllByRole('button', { name: /^Unir en serie/ })[0]);
    const r = Plan.safeParse(JSON.parse(JSON.stringify({ ...ultimo, estado: 'publicado', revisado: true })));
    expect(r.success ? '' : JSON.stringify(r.error.issues)).toBe('');
    expect(r.success && r.data.dias[0].slots.slice(0, 2).map((s) => s.grupo)).toEqual(['A', 'A']);
  });
});
