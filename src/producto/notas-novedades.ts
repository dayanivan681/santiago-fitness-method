/**
 * Notas de novedades que ven Santiago (coach) y los clientes la primera vez
 * que abren la app después de una actualización.
 *
 * Cada cambio visible para el coach o los clientes añade aquí una nota nueva,
 * ARRIBA del todo: fecha de publicación, audiencia y 1–3 puntos escritos para
 * quien la lee, sin lenguaje técnico. El dueño aprueba el texto antes de
 * publicar. Un cambio sin nota no muestra aviso.
 */

export type Audiencia = "coach" | "cliente";

export interface Novedad {
  /** Único y estable: el dispositivo recuerda las notas vistas por este id. */
  readonly id: string;
  /** Fecha de publicación, AAAA-MM-DD. */
  readonly fecha: string;
  readonly audiencia: Audiencia;
  readonly titulo: string;
  readonly puntos: readonly string[];
}

/** De la más reciente a la más antigua. */
export const NOVEDADES: readonly Novedad[] = [
  {
    id: "2026-10-21-coach-borrador-publicado",
    fecha: "2026-10-21",
    audiencia: "coach",
    titulo: "Dos detalles menos",
    puntos: [
      "Al publicar un programa, la ficha deja de ofrecerte retomar ese borrador: lo que contenía ya está con tu cliente.",
      "Si quitas el filtro de pagos pendientes, se queda quitado aunque vuelvas a esa pantalla más tarde.",
    ],
  },
  {
    id: "2026-10-21-coach-hoy",
    fecha: "2026-10-21",
    audiencia: "coach",
    titulo: "Tu panel, más claro",
    puntos: [
      "Hoy te muestra primero el cliente cuyo programa necesita revisión, con un botón directo para revisarlo.",
      "Pagos pendientes, el resumen de la semana y la actividad reciente quedan debajo, sin distraer.",
      "Clientes, ficha, editor y Biblioteca son más compactos, y «Listo» siempre queda visible al ajustar una prescripción.",
    ],
  },
  {
    id: "2026-10-21-cliente-rutina",
    fecha: "2026-10-21",
    audiencia: "cliente",
    titulo: "Tu rutina, más a mano",
    puntos: [
      "Hoy muestra tu sesión en una tarjeta con el botón Comenzar.",
      "Al entrenar, el registro de cada serie queda junto al ejercicio.",
      "Biblioteca, Progreso y Perfil tienen un diseño más limpio.",
    ],
  },
];

/**
 * Un dispositivo sin registro (instalación nueva o primera vez con este aviso)
 * sólo ve la nota más reciente, y únicamente si se publicó en estos días: a
 * quien acaba de llegar no se le enseña un historial que nunca vivió.
 */
export const VENTANA_PRIMERA_VEZ_DIAS = 14;
const DIA_MS = 24 * 60 * 60 * 1000;

/** `vistas` es `null` cuando el dispositivo nunca registró ninguna nota. */
export function novedadesPendientes(
  lista: readonly Novedad[],
  audiencia: Audiencia,
  vistas: ReadonlySet<string> | null,
  hoy: Date,
): Novedad[] {
  const propias = lista.filter((n) => n.audiencia === audiencia);
  if (vistas) return propias.filter((n) => !vistas.has(n.id));
  const [ultima] = propias;
  if (!ultima) return [];
  const antiguedad = hoy.getTime() - new Date(`${ultima.fecha}T00:00:00`).getTime();
  return antiguedad <= VENTANA_PRIMERA_VEZ_DIAS * DIA_MS ? [ultima] : [];
}
