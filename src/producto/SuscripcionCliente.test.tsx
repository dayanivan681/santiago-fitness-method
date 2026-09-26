import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { InsigniaSuscripcion, SuscripcionCliente } from './SuscripcionCliente';
import { ServicioSuscripciones } from './servicioSuscripciones';
import type { RespuestaSuscripcion } from '../../shared/v2/suscripcion';

afterEach(cleanup);

it('la insignia nombra el estado del cliente', () => {
  render(<InsigniaSuscripcion acceso={{ estado: 'gracia', puedeEntrenar: true, graciaHasta: 1 }} />);
  expect(screen.getByText('En gracia')).toHaveClass('sfm-insignia--aviso');
});

it('con la suscripción al día el coach pausa, reanuda, cancela, mantiene y marca exento', async () => {
  const servicio = new ServicioSuscripciones(true);
  const actualizado = vi.fn();
  render(<SuscripcionCliente servicio={servicio} clienteId="demo-persona-1" alCambiar={actualizado} />);

  expect(await screen.findByText('Al día')).toBeInTheDocument();
  expect(screen.getByText(/Próximo cobro:/)).toBeInTheDocument();
  expect(await screen.findByText('Plan: Coaching mensual')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Preparar enlace de pago' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Pausar cobros' }));
  expect(await screen.findByText('Pausada')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reanudar cobros' }));
  expect(await screen.findByText('Al día')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar al final del periodo' }));
  const confirmar = await screen.findByRole('group', { name: 'Confirmar cancelación' });
  fireEvent.click(within(confirmar).getByRole('button', { name: 'Sí, cancelar' }));
  expect(await screen.findByText(/Termina el/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Mantener suscripción' }));
  expect(await screen.findByText(/Próximo cobro:/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('checkbox', { name: /Exento de pago/ }));
  expect(await screen.findByText('Exento')).toBeInTheDocument();
  expect(actualizado).toHaveBeenCalled();
});

it('sin pagar, el coach elige el plan y prepara el enlace de pago para mandarlo', async () => {
  const servicio = new ServicioSuscripciones(true);
  const asignar = vi.spyOn(servicio, 'asignarPrecio');
  render(<SuscripcionCliente servicio={servicio} clienteId="demo-persona-3" />);
  expect(await screen.findByText('Sin suscripción')).toBeInTheDocument();
  const plan = await screen.findByRole('combobox', { name: 'Plan' });
  expect(await within(plan).findByRole('option', { name: /Coaching mensual · .*80,00.* al mes/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Pausar cobros' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Preparar enlace de pago' }));
  expect(await screen.findByRole('textbox', { name: 'Enlace de pago' })).toHaveValue('Simulación: aquí aparecerá el enlace de pago de Stripe.');
  expect(screen.getByRole('button', { name: 'Copiar enlace de pago' })).toBeInTheDocument();
  fireEvent.change(plan, { target: { value: '' } });
  expect(screen.queryByRole('button', { name: 'Guardar plan' })).not.toBeInTheDocument();
  expect(asignar).not.toHaveBeenCalled();
});

it('sin suscripción no ofrece pausar ni cancelar; con Stripe apagado lo explica', async () => {
  const servicio = new ServicioSuscripciones(true);
  const sinPagos: RespuestaSuscripcion = {
    clienteId: 'lucia', precioId: null, estadoStripe: null, periodoFin: null, cancelarAlFinal: false,
    exento: false, acceso: { estado: 'sin_suscripcion', puedeEntrenar: false }, pagosDisponibles: false,
  };
  vi.spyOn(servicio, 'una').mockResolvedValue(sinPagos);
  render(<SuscripcionCliente servicio={servicio} clienteId="lucia" />);
  expect(await screen.findByText(/Los cobros todavía no están activados/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Pausar cobros' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Preparar enlace de pago' })).not.toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: /Exento de pago/ })).toBeInTheDocument();
});

it('muestra el error del servidor sin perder la pantalla', async () => {
  const servicio = new ServicioSuscripciones(true);
  vi.spyOn(servicio, 'enlaceDePago').mockRejectedValue(new Error('El coach todavía no ha elegido el plan de este cliente.'));
  render(<SuscripcionCliente servicio={servicio} clienteId="demo-persona-3" />);
  fireEvent.click(await screen.findByRole('button', { name: 'Preparar enlace de pago' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('todavía no ha elegido el plan');
  expect(screen.getByText('Sin suscripción')).toBeInTheDocument();
});
