import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ErrorVisible } from './ui';

afterEach(cleanup);
it('convierte errores de validación en texto sin claves, rutas ni JSON y elimina duplicados', () => {
  render(<ErrorVisible error={JSON.stringify([
    { code: 'custom', message: 'Lower B: tiene 4 ejercicios y necesita al menos 5.', path: ['plan', 'dias', 3] },
    { code: 'custom', message: 'Lower B: tiene 4 ejercicios y necesita al menos 5.', path: ['plan', 'dias', 3] },
  ])} />);
  const aviso = screen.getByRole('alert');
  expect(aviso).toHaveTextContent('Lower B: tiene 4 ejercicios y necesita al menos 5.');
  expect(aviso).not.toHaveTextContent(/code|custom|path|\[|\{/);
  expect(aviso.textContent?.match(/Lower B/g)).toHaveLength(1);
});
it.each([
  'TypeError: Cannot read properties of undefined\n at guardar (/src/datos.ts:12)',
  'D1_ERROR: SELECT email FROM cuentas',
  '{"error":"INTERNAL_ERROR","detalle":"datos privados"}',
  '<!DOCTYPE html><html>502</html>',
  JSON.stringify([{code:'invalid_type',message:'Invalid input: expected number',path:['edad']}]),
])('oculta respuestas internas y propone un siguiente paso: %s', error => {
  render(<ErrorVisible error={error} />);
  expect(screen.getByRole('alert')).not.toHaveTextContent(/TypeError|undefined|SELECT|email|INTERNAL|privados|DOCTYPE|invalid_type|expected|path/);
  expect(screen.getByRole('alert')).toHaveTextContent(/intentarlo/);
});
it('un fallo de conexión da una indicación útil y los errores humanos se conservan', () => {
  const {rerender}=render(<ErrorVisible error="Failed to fetch" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Comprueba tu conexión');
  rerender(<ErrorVisible error="No se pudo guardar. Tus cambios siguen aquí." />);
  expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar. Tus cambios siguen aquí.');
  rerender(<ErrorVisible error="" />);
  expect(screen.queryByRole('alert')).toBeNull();
});

it('conserva la explicación útil cuando la respuesta también incluye otro campo inválido', () => {
  render(<ErrorVisible error={JSON.stringify([
    {code:'custom',message:'Lower B: tiene 4 ejercicios y necesita al menos 5.'},
    {code:'invalid_type',message:'Invalid input: expected number'},
  ])} />);
  expect(screen.getByRole('alert')).toHaveTextContent('Lower B: tiene 4 ejercicios y necesita al menos 5.');
  expect(screen.getByRole('alert')).not.toHaveTextContent(/Invalid input|invalid_type/);
});
