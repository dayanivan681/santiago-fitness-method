import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CopiarInvitacion } from './CopiarInvitacion';

const ENLACE = 'https://santiago-fitness-method.pages.dev/access?t=prueba';
const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

function conPortapapeles(valor: unknown) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: valor });
}

afterEach(() => {
  cleanup();
  if (original) Object.defineProperty(navigator, 'clipboard', original);
  else Reflect.deleteProperty(navigator, 'clipboard');
});

it('copia el enlace y confirma junto al botón, no arriba de la ficha', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  conPortapapeles({ writeText });
  render(<CopiarInvitacion enlace={ENLACE} />);

  fireEvent.click(screen.getByRole('button', { name: 'Copiar invitación' }));

  expect(await screen.findByRole('button', { name: 'Copiada' })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Enlace copiado. Pégalo en tu mensaje al cliente.');
  expect(writeText).toHaveBeenCalledWith(ENLACE);
});

it('si el navegador no deja copiar, selecciona el enlace y explica cómo copiarlo a mano', async () => {
  conPortapapeles({ writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) });
  render(<CopiarInvitacion enlace={ENLACE} />);

  fireEvent.click(screen.getByRole('button', { name: 'Copiar invitación' }));

  expect(await screen.findByText(/No se pudo copiar automáticamente/)).toHaveAttribute('role', 'status');
  const campo = screen.getByRole<HTMLInputElement>('textbox', { name: 'Invitación privada' });
  expect(document.activeElement).toBe(campo);
  expect(campo.selectionStart).toBe(0);
  expect(campo.selectionEnd).toBe(ENLACE.length);
  expect(screen.getByRole('button', { name: 'Copiar invitación' })).toBeInTheDocument();
});

it('sin API de portapapeles también ofrece la copia manual en vez de fallar en silencio', async () => {
  conPortapapeles(undefined);
  render(<CopiarInvitacion enlace={ENLACE} />);

  fireEvent.click(screen.getByRole('button', { name: 'Copiar invitación' }));

  expect(await screen.findByText(/No se pudo copiar automáticamente/)).toHaveAttribute('role', 'status');
});
