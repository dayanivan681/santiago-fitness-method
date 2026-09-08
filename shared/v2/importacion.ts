import { z } from "zod";
import {
  Borrador,
  Carga,
  Dia,
  Entrenamiento,
  Id,
  Perfil,
  Progreso,
  Serie,
  Sustitucion,
} from "./contratos";
const Foto = z.object({
  id: Id,
  tipo: z.enum(["image/jpeg", "image/png", "image/webp"]),
  datos: z
    .string()
    .max(7_000_000)
    .regex(/^[A-Za-z0-9+/]*={0,2}$/),
});
export const RespaldoV1 = z
  .object({
    version: z.literal(1),
    exportadoEn: z.iso.datetime(),
    participante: Perfil,
    plantillas: z.array(Dia).max(100),
    sesiones: z.array(Entrenamiento).max(10000),
    series: z.array(Serie).max(100000),
    progreso: z.array(Progreso).max(10000),
    sustituciones: z.array(Sustitucion).max(10000),
    borradores: z.array(Borrador).max(1000).default([]),
    calibraciones: z
      .array(Carga.extend({ id: Id }))
      .max(1000)
      .default([]),
    fotos: z.array(Foto).max(1000).optional(),
    fotoDePerfil: Foto.optional(),
  })
  .superRefine((r, ctx) => {
    const ids = new Set(r.sesiones.map((s) => s.id));
    if (r.series.some((s) => !ids.has(s.sesionId)))
      ctx.addIssue({
        code: "custom",
        message: "Hay series sin entrenamiento de origen.",
      });
    for (const lista of [
      r.plantillas,
      r.sesiones,
      r.series,
      r.progreso,
      r.sustituciones,
      r.borradores,
      r.calibraciones,
    ])
      if (new Set(lista.map((v) => v.id)).size !== lista.length)
        ctx.addIssue({
          code: "custom",
          message: "El respaldo contiene identificadores duplicados.",
        });
    for (const v of [
      ...r.plantillas,
      ...r.sesiones,
      ...r.progreso,
      ...r.sustituciones,
      ...r.borradores,
    ])
      if (v.participanteId !== r.participante.id)
        ctx.addIssue({
          code: "custom",
          message:
            "El respaldo mezcla propietarios. Revisa los registros antes de importarlo.",
        });
    if (r.fotos?.some((f) => !r.progreso.some((p) => p.id === f.id)))
      ctx.addIssue({
        code: "custom",
        message: "Hay fotos sin registro de progreso.",
      });
    if (r.fotoDePerfil && r.fotoDePerfil.id !== r.participante.id)
      ctx.addIssue({
        code: "custom",
        message: "Foto de perfil de otra persona.",
      });
  });
export type RespaldoV1 = z.infer<typeof RespaldoV1>;
export function canonico(valor: unknown): string {
  if (valor === null || typeof valor !== "object") return JSON.stringify(valor);
  if (Array.isArray(valor)) return "[" + valor.map(canonico).join(",") + "]";
  return (
    "{" +
    Object.entries(valor)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => JSON.stringify(k) + ":" + canonico(v))
      .join(",") +
    "}"
  );
}
