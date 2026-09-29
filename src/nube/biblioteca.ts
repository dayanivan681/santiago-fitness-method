import type { EjercicioCoach } from "../../shared/v2/biblioteca";
import type { BaseDatosSantiago } from "../datos/esquema";
import type { Ejercicio } from "../dominio/tipos";

export const FOTO_PENDIENTE = "/ejercicios/sin-foto.svg";

/**
 * Los ejercicios del coach como fichas de dominio, las mismas que lee el resto
 * de la app. `urlDeFoto` decide desde dónde se sirve la foto (coach o cliente).
 */
export function aEjercicioDominio(e: EjercicioCoach, urlDeFoto: (e: EjercicioCoach) => string | null): Ejercicio {
  return {
    id: e.id,
    nombre: e.nombre,
    equipo: e.equipo,
    movimiento: e.movimiento,
    imagen: (e.tieneFoto ? urlDeFoto(e) : null) ?? FOTO_PENDIENTE,
    explicacionCorta: e.explicacionCorta,
    musculoPrimario: e.musculoPrimario,
    musculosSecundarios: e.musculosSecundarios,
    tipoCarga: e.tipoCarga,
    incrementoMinimoLb: e.incrementoMinimoLb,
    ...(e.pesoBaseMaquinaLb === null ? {} : { pesoBaseMaquinaLb: e.pesoBaseMaquinaLb }),
  };
}

/**
 * Guarda en Dexie los ejercicios del coach, como hace la semilla con los fijos,
 * para que la biblioteca, Hoy y el entrenamiento funcionen sin conexión.
 *
 * Si el cliente calibró la carga de un ejercicio, esa calibración manda sobre la
 * del coach: se conserva el perfil de carga que ya tenía. Los ejercicios que el
 * coach archivó no llegan en la lista, pero se conservan aquí por el historial.
 */
export async function guardarEjerciciosDelCoach(
  db: BaseDatosSantiago,
  ejercicios: readonly EjercicioCoach[],
  base: string,
): Promise<void> {
  const urlDeFoto = (e: EjercicioCoach) => `${base}/biblioteca/${e.id}/foto?v=${e.actualizadoEn}`;
  await db.transaction("rw", db.ejercicios, db.documentos, db.cola, async () => {
    for (const e of ejercicios) {
      const nuevo = aEjercicioDominio(e, urlDeFoto);
      const previo = await db.ejercicios.get(e.id);
      const clave = `calibracion:${e.id}`;
      const calibrado =
        !!previo && ((await db.documentos.get(clave)) !== undefined || (await db.cola.where("clave").equals(clave).count()) > 0);
      await db.ejercicios.put(
        calibrado
          ? { ...nuevo, tipoCarga: previo.tipoCarga, incrementoMinimoLb: previo.incrementoMinimoLb, pesoBaseMaquinaLb: previo.pesoBaseMaquinaLb }
          : nuevo,
      );
    }
  });
}
