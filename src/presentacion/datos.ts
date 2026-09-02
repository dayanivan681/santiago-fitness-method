import { PLANTILLAS_BASE } from "../../shared/plantillas-base";
import { BIBLIOTECA_INICIAL } from "../datos/semilla/biblioteca";

export const BIBLIOTECA_DEMO = BIBLIOTECA_INICIAL.map((ejercicio) => ({
  ...ejercicio,
  imagen: `/presentacion/media${ejercicio.imagen}`,
}));

export const DIAS_DEMO = PLANTILLAS_BASE.map((dia) => ({
  ...dia,
  ejercicios: dia.slots.map((slot) => {
    const ejercicio = BIBLIOTECA_DEMO.find(
      (item) => item.id === slot.ejercicioId,
    );
    if (!ejercicio)
      throw new Error(`Plantilla sin ejercicio: ${slot.ejercicioId}`);
    return { slot, ejercicio };
  }),
}));
