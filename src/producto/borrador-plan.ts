/**
 * Un borrador de programa sólo sigue pendiente mientras proponga algo distinto
 * de lo publicado.
 *
 * Al publicar, el contenido del borrador pasa a estar en vivo, pero su
 * documento se conserva: el historial de cambios no se borra. Sin esta
 * comparación la ficha seguiría ofreciendo «Retomar programación» con lo que el
 * coach acaba de publicar, como si le quedara trabajo a medias.
 */

import type { Plan } from "../../shared/v2/contratos";

type Dia = Plan["dias"][number];
type Slot = Dia["slots"][number];

export function borradorPendiente(
  borrador: Plan | undefined,
  publicado: Plan,
): boolean {
  if (!borrador) return false;
  return contenido(borrador) !== contenido(publicado);
}

/**
 * Lo que el cliente acabaría viendo. Quedan fuera `id`, `estado` y `revisado`:
 * distinguen al borrador del programa, no a su contenido.
 */
function contenido(plan: Plan): string {
  return JSON.stringify(plan.dias.map(dia));
}

function dia(d: Dia) {
  return [d.id, d.participanteId, d.nombre, d.orden, d.slots.map(slot)];
}

function slot(s: Slot) {
  return [
    s.orden,
    s.ejercicioId,
    s.estimulo,
    s.seriesObjetivo,
    s.repMin,
    s.repMax,
    s.pesoSugeridoLb ?? null,
    s.descansoSegundos,
    s.progresionFijada ?? null,
    s.grupo ?? null,
  ];
}
