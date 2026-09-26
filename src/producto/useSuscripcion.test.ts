import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { suscripcionBloquea, useSuscripcion } from './useSuscripcion';
import type { EstadoDeAcceso, RespuestaSuscripcion } from '../../shared/v2/suscripcion';

const respuesta = (acceso: EstadoDeAcceso, pagosDisponibles = true): RespuestaSuscripcion => ({
  clienteId: 'lucia', precioId: 'price_1', estadoStripe: 'active', periodoFin: 1, cancelarAlFinal: false,
  exento: false, acceso, pagosDisponibles,
});

afterEach(() => {
  vi.useRealTimers();
  window.history.replaceState(null, '', '/');
});

it('solo bloquea con los pagos encendidos y sin acceso', () => {
  expect(suscripcionBloquea(null)).toBe(false);
  expect(suscripcionBloquea(respuesta({ estado: 'sin_suscripcion', puedeEntrenar: false }, false))).toBe(false);
  expect(suscripcionBloquea(respuesta({ estado: 'sin_suscripcion', puedeEntrenar: false }))).toBe(true);
  expect(suscripcionBloquea(respuesta({ estado: 'gracia', puedeEntrenar: true, graciaHasta: 1 }))).toBe(false);
});

it('sin API no pide nada; con API carga y conserva el último estado si falla la red', async () => {
  expect(renderHook(() => useSuscripcion(undefined)).result.current.resumen).toBeNull();
  const pedir = vi.fn().mockResolvedValueOnce(respuesta({ estado: 'activa', puedeEntrenar: true })).mockRejectedValue(new Error('sin red'));
  const api = { pedir };
  const { result } = renderHook(() => useSuscripcion(api));
  await waitFor(() => expect(result.current.resumen?.acceso.estado).toBe('activa'));
  document.dispatchEvent(new Event('visibilitychange'));
  await waitFor(() => expect(pedir).toHaveBeenCalledTimes(2));
  expect(result.current.resumen?.acceso.estado).toBe('activa');
});

it('al volver de pagar espera al webhook hasta que la suscripción se activa', async () => {
  vi.useFakeTimers();
  window.history.replaceState(null, '', '/?suscripcion=ok');
  const pedir = vi.fn()
    .mockResolvedValueOnce(respuesta({ estado: 'sin_suscripcion', puedeEntrenar: false }))
    .mockResolvedValueOnce(respuesta({ estado: 'sin_suscripcion', puedeEntrenar: false }))
    .mockResolvedValue(respuesta({ estado: 'activa', puedeEntrenar: true }));
  const api = { pedir };
  const { result } = renderHook(() => useSuscripcion(api));
  expect(result.current.volviendoDePago).toBe(true);
  await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
  expect(result.current.volviendoDePago).toBe(true);
  await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
  expect(result.current.volviendoDePago).toBe(false);
  expect(result.current.resumen?.acceso.estado).toBe('activa');
});
