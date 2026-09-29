import { SLOTS_LOWER_C } from "../../shared/plantillas-base";
import type { Plan } from "../../shared/v2/contratos";

type Dia = Plan["dias"][number];
const esLower = (d: Dia) => /^lower/i.test(d.nombre.trim());
const esUpper = (d: Dia) => /^upper/i.test(d.nombre.trim());
const porNombre = (a: Dia, b: Dia) => a.nombre.localeCompare(b.nombre, "es");

/** Un programa de 4 días con 2 Lower y 2 Upper se puede pasar al split de 5. */
export function puedePasarACincoDias(plan: Plan): boolean {
  return plan.dias.length === 4 && plan.dias.filter(esLower).length === 2 && plan.dias.filter(esUpper).length === 2;
}

/**
 * Lower – Upper – Lower – Upper – Lower: reordena los cuatro días existentes
 * (conservan id, nombre y ejercicios, así el historial sigue enlazado) y añade
 * Lower C con los ejercicios de la plantilla. Queda por revisar: el coach
 * revisa y publica como con cualquier otro cambio.
 */
export function pasarACincoDias(plan: Plan, participanteId: string, nuevoId: string = crypto.randomUUID()): Plan {
  if (!puedePasarACincoDias(plan)) return plan;
  const [lowerA, lowerB] = plan.dias.filter(esLower).sort(porNombre);
  const [upperA, upperB] = plan.dias.filter(esUpper).sort(porNombre);
  const lowerC: Dia = { id: nuevoId, participanteId, nombre: "Lower C", orden: 5, slots: SLOTS_LOWER_C.map((s) => ({ ...s })) };
  return {
    ...plan,
    revisado: false,
    dias: [lowerA, upperA, lowerB, upperB, lowerC].map((d, i) => ({ ...d, orden: i + 1 })),
  };
}
