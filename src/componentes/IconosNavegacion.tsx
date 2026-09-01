/**
 * Iconos de la navegación del participante.
 *
 * Dibujados aquí, sin dependencias: cuatro trazos sencillos pesan menos que
 * cualquier librería y se ajustan al sistema del método —línea fina, esquinas
 * suaves, nada de relleno—.
 *
 * Todos son decorativos: `aria-hidden`, sin `title` y sin `role`. El nombre
 * accesible de cada pestaña sigue siendo su texto, que se mantiene visible
 * debajo. Un icono nunca sustituye a la palabra.
 *
 * Heredan el color con `currentColor`, así que el estado activo se resuelve
 * en el botón y no hay que duplicar la paleta aquí.
 */

interface Props {
  readonly className?: string
}

const COMUNES = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

/** Hoy: el día de entrenamiento, ya marcado. */
export function IconoHoy({ className }: Props) {
  return (
    <svg {...COMUNES} className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  )
}

/** Biblioteca: la rejilla de fichas de ejercicio. */
export function IconoBiblioteca({ className }: Props) {
  return (
    <svg {...COMUNES} className={className}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="2" />
    </svg>
  )
}

/** Historial: el reloj que mira hacia atrás. */
export function IconoHistorial({ className }: Props) {
  return (
    <svg {...COMUNES} className={className}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.5 4.5v4h4" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  )
}

/** Perfil: la persona. */
export function IconoPerfil({ className }: Props) {
  return (
    <svg {...COMUNES} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="10" r="2.9" />
      <path d="M6.6 18.6a6 6 0 0 1 10.8 0" />
    </svg>
  )
}
