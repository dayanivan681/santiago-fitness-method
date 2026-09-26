import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AvisoSuscripcion, MiSuscripcion } from './SuscripcionCuenta';
import type { EstadoDeAcceso, RespuestaSuscripcion } from '../../shared/v2/suscripcion';

afterEach(cleanup);

const FIN = Date.UTC(2026, 9, 26, 12) / 1000;

function resumen(acceso: EstadoDeAcceso, cambios: Partial<RespuestaSuscripcion> = {}): RespuestaSuscripcion {
  return {
    clienteId: 'lucia', precioId: 'price_1', estadoStripe: 'active', periodoFin: FIN,
    cancelarAlFinal: false, exento: false, acceso, pagosDisponibles: true, ...cambios,
  };
}

function api(respuesta: unknown = { url: 'https://checkout.stripe.com/c/pay/x' }) {
  return { pedir: vi.fn().mockImplementation(async () => {
    if (respuesta instanceof Error) throw respuesta;
    return respuesta;
  }) };
}

it('sin pagos configurados o con la suscripción al día no muestra nada', () => {
  const { container, rerender } = render(<AvisoSuscripcion resumen={resumen({ estado: 'sin_suscripcion', puedeEntrenar: false }, { pagosDisponibles: false })} api={api()} />);
  expect(container).toBeEmptyDOMElement();
  rerender(<AvisoSuscripcion resumen={resumen({ estado: 'activa', puedeEntrenar: true })} api={api()} />);
  expect(container).toBeEmptyDOMElement();
});

it('en gracia avisa hasta cuándo puede entrenar y abre el portal para actualizar el pago', async () => {
  const pedir = api({ url: 'https://billing.stripe.com/p/x' });
  const navegar = vi.fn();
  render(<AvisoSuscripcion resumen={resumen({ estado: 'gracia', puedeEntrenar: true, graciaHasta: FIN })} api={pedir} navegar={navegar} />);
  expect(screen.getByRole('status')).toHaveTextContent('No pudimos cobrar tu suscripción');
  expect(screen.getByRole('status')).toHaveTextContent('26 de octubre');
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar pago' }));
  await vi.waitFor(() => expect(navegar).toHaveBeenCalledWith('https://billing.stripe.com/p/x'));
  expect(pedir.pedir).toHaveBeenCalledWith('/suscripcion/gestionar', {});
});

it('sin suscripción explica que no puede entrenar y lleva a pagar', async () => {
  const pedir = api();
  const navegar = vi.fn();
  render(<AvisoSuscripcion resumen={resumen({ estado: 'sin_suscripcion', puedeEntrenar: false }, { estadoStripe: null })} api={pedir} navegar={navegar} />);
  expect(screen.getByRole('heading', { name: 'Activa tu suscripción para entrenar' })).toBeInTheDocument();
  expect(screen.getByText(/Tu historial y tu progreso siguen disponibles/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Pagar suscripción' }));
  await vi.waitFor(() => expect(navegar).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/x'));
  expect(pedir.pedir).toHaveBeenCalledWith('/suscripcion/pagar', {});
});

it('vencida por impago lleva al portal; pausada por el coach no ofrece pagar', () => {
  const { rerender } = render(<AvisoSuscripcion resumen={resumen({ estado: 'vencida', puedeEntrenar: false }, { estadoStripe: 'unpaid' })} api={api()} />);
  expect(screen.getByRole('button', { name: 'Actualizar pago' })).toBeInTheDocument();
  rerender(<AvisoSuscripcion resumen={resumen({ estado: 'pausada', puedeEntrenar: false })} api={api()} />);
  expect(screen.getByText(/Tu coach pausó tu suscripción/)).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('si Stripe falla lo dice y deja reintentar', async () => {
  render(<AvisoSuscripcion resumen={resumen({ estado: 'sin_suscripcion', puedeEntrenar: false }, { estadoStripe: null })}
    api={api(new Error('El coach todavía no ha elegido el plan de este cliente.'))} navegar={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Pagar suscripción' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('todavía no ha elegido el plan');
  expect(screen.getByRole('button', { name: 'Pagar suscripción' })).toBeEnabled();
});

it('Mi suscripción muestra el estado, el próximo cobro y la cancelación programada', () => {
  const { rerender } = render(<MiSuscripcion resumen={resumen({ estado: 'activa', puedeEntrenar: true })} api={api()} />);
  expect(screen.getByText('Al día')).toBeInTheDocument();
  expect(screen.getByText(/Próximo cobro: 26 de octubre/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Gestionar pago' })).toBeInTheDocument();
  rerender(<MiSuscripcion resumen={resumen({ estado: 'activa', puedeEntrenar: true }, { cancelarAlFinal: true })} api={api()} />);
  expect(screen.getByText(/Termina el 26 de octubre/)).toBeInTheDocument();
  rerender(<MiSuscripcion resumen={resumen({ estado: 'exenta', puedeEntrenar: true }, { exento: true, estadoStripe: null })} api={api()} />);
  expect(screen.getByText('Incluida por tu coach')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
