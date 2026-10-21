import { z } from "zod";
import { IDS_DE_EJERCICIOS } from "../ejercicios-base";
import { esIdDeEjercicioCoach } from "./biblioteca";
import {
  MAX_BLOQUES,
  MAX_EJERCICIOS_POR_SESION,
  MIN_EJERCICIOS_POR_SESION,
  contarBloques,
  erroresDeSuperseries,
} from "../superseries";

export const Id = z
  .string()
  .min(1)
  .max(240)
  .regex(/^[\w|:.-]+$/);
export const Fecha = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Texto = z.string().max(4000);
const EjercicioId = Id.refine(
  (id) => IDS_DE_EJERCICIOS.has(id) || esIdDeEjercicioCoach(id),
  "Variante desconocida",
);
export const Carga = z.object({
  tipoCarga: z.enum(["total", "porLado", "discosAnadidos", "pesoMaquina"]),
  incrementoMinimoLb: z.number().positive().max(1000),
  pesoBaseMaquinaLb: z.number().min(0).max(2000).optional(),
});
export const Slot = z
  .object({
    orden: z.number().int().min(1).max(MAX_EJERCICIOS_POR_SESION),
    ejercicioId: EjercicioId,
    estimulo: z.enum(["fuerza", "hipertrofia", "resistencia"]),
    seriesObjetivo: z.number().int().min(1).max(12),
    repMin: z.number().int().min(1).max(100),
    repMax: z.number().int().min(1).max(100),
    pesoSugeridoLb: z.number().min(0).max(3000).optional(),
    descansoSegundos: z.number().int().min(0).max(1800),
    progresionFijada: z
      .enum(["mantener", "subirReps", "subirCarga", "revisarReducir"])
      .optional(),
    /** Misma letra en slots consecutivos = bi-serie o tri-serie. */
    grupo: z.string().regex(/^[A-Z]$/).optional(),
  })
  .refine((s) => s.repMax >= s.repMin, "Rango de repeticiones inválido");
export const Dia = z.object({
  id: Id,
  participanteId: Id,
  nombre: z.string().min(1).max(80),
  orden: z.number().int().min(1).max(7),
  slots: z.array(Slot).max(MAX_EJERCICIOS_POR_SESION),
});
export const Perfil = z.object({
  id: Id,
  nombre: z.string().trim().min(1).max(120),
  sexo: z.enum(["femenino", "masculino"]).nullable(),
  edad: z.number().int().min(12).max(120).nullable(),
  estaturaCm: z.number().min(80).max(250).nullable(),
  pesoCorporalLb: z.number().min(40).max(1000).nullable(),
  objetivo: Texto,
  frecuenciaEntrenamiento: z.number().int().min(1).max(7),
  limitaciones: Texto,
  notas: Texto.default(""),
  ejerciciosEvitados: z.array(EjercicioId).max(200).default([]),
});
export const PlanHistorico = z.object({
  id: Id,
  estado: z.enum(["borrador", "publicado"]),
  dias: z.array(Dia).max(7),
  revisado: z.boolean().default(false),
});
// Se pueden leer perfiles históricos aún sin rutina; una escritura nueva
// exige al menos una sesión y nunca inventa programación para completarlos.
export const Plan = PlanHistorico.extend({
  dias: z.array(Dia).min(1).max(7),
}).superRefine((p, ctx) => {
  if (
    new Set(p.dias.map((d) => d.id)).size !== p.dias.length ||
    new Set(p.dias.map((d) => d.orden)).size !== p.dias.length
  )
    ctx.addIssue({ code: "custom", message: "Hay días duplicados" });
  if (p.estado === "publicado" && !p.revisado && p.dias.length > 0)
    ctx.addIssue({ code: "custom", message: "Revisa el plan antes de publicar" });
  for (const [indice, d] of p.dias.entries()) {
    if (d.slots.some((s, i) => s.orden !== i + 1))
      ctx.addIssue({ code: "custom", message: "Orden de ejercicios inválido", path: ["dias", indice, "slots"] });
    for (const message of erroresDeSuperseries(d.slots))
      ctx.addIssue({ code: "custom", message, path: ["dias", indice, "slots"] });
    const bloques = contarBloques(d.slots);
    if (bloques > MAX_BLOQUES)
      ctx.addIssue({ code: "custom", message: `${d.nombre}: tiene ${bloques} bloques. El máximo es 8.`, path: ["dias", indice, "slots"] });
    if (p.estado === "publicado" && d.slots.length < MIN_EJERCICIOS_POR_SESION)
      ctx.addIssue({
        code: "custom",
        message: `${d.nombre}: tiene ${d.slots.length} ${d.slots.length === 1 ? "ejercicio" : "ejercicios"} y necesita al menos ${MIN_EJERCICIOS_POR_SESION}.`,
        path: ["dias", indice, "slots"],
      });
  }
});
const Valores = z.object({
  nota: Texto.optional(),
  pesoRegistradoLb: z.number().min(0).max(3000),
  repsRealizadas: z.number().int().min(1).max(200),
  rir: z.number().int().min(0).max(5),
  tecnica: z.enum(["excelente", "buena", "aceptable", "deficiente"]).optional(),
  esCalentamiento: z.boolean().optional(),
});
export const Entrenamiento = z.object({
  id: Id,
  participanteId: Id,
  plantillaDiaId: Id,
  fecha: Fecha,
  completadaEn: z.iso.datetime().optional(),
  prescripcion: Dia.optional(),
  cargas: z.record(Id, Carga).optional(),
  planRevision: z.number().int().nonnegative().optional(),
  procedencia: z.enum(["app", "importacion"]).optional(),
});
export const Serie = Valores.extend({
  id: Id,
  sesionId: Id,
  ejercicioId: EjercicioId,
  numeroSerie: z.number().int().min(1).max(100),
  instante: z.iso.datetime().optional(),
  nota: Texto.optional(),
  carga: Carga.optional(),
  correcciones: z
    .array(
      Valores.extend({
        corregidaEn: z.iso.datetime(),
        motivo: z.enum(["correccion", "reversion"]).optional(),
      }),
    )
    .max(100)
    .optional(),
});
export const Borrador = Valores.extend({
  repsRealizadas: z.number().int().min(0).max(200),
  id: Id,
  participanteId: Id,
  fecha: Fecha,
  plantillaDiaId: Id,
  orden: z.number().int().min(1).max(MAX_EJERCICIOS_POR_SESION),
  numeroSerie: z.number().int().min(1).max(100),
  guardadoEn: z.iso.datetime(),
});
export const Sustitucion = z.object({
  id: Id,
  participanteId: Id,
  fecha: Fecha,
  plantillaDiaId: Id,
  orden: z.number().int().min(1).max(MAX_EJERCICIOS_POR_SESION),
  ejercicioId: EjercicioId,
});
export const Progreso = z.object({
  id: Id,
  participanteId: Id,
  fecha: Fecha,
  medidas: z.partialRecord(
    z.enum([
      "pesoCorporalLb",
      "cinturaPulgadas",
      "pechoPulgadas",
      "brazoPulgadas",
      "musloPulgadas",
    ]),
    z.number().positive().max(1000),
  ),
  tieneFoto: z.boolean(),
});
export const Alta = z.object({
  id: Id,
  paso: z.number().int().min(1).max(3),
  perfil: Perfil,
  plan: Plan,
  completado: z.boolean().default(false),
});
export const Tipo = z.enum([
  "perfil",
  "plan",
  "entrenamiento",
  "serie",
  "borrador",
  "sustitucion",
  "progreso",
  "calibracion",
  "alta",
]);
export const Operacion = z.object({
  opId: z.uuid(),
  tipo: Tipo,
  id: Id,
  revision: z.number().int().nonnegative(),
  datos: z.unknown(),
  eliminado: z.boolean().default(false),
});
export type Operacion = z.infer<typeof Operacion>;
export type Tipo = z.infer<typeof Tipo>;
export type Perfil = z.infer<typeof Perfil>;
export type Plan = z.infer<typeof Plan>;
export type Alta = z.infer<typeof Alta>;
export type Cambio = {
  cursor: number;
  tipo: Tipo;
  id: string;
  revision: number;
  datos: unknown;
  eliminado: boolean;
  opId: string;
  actor: string;
};
export type Contexto = {
  rol: "cliente" | "coach";
  identidad: string;
  nombre: string;
  expiraEn: number;
  validadoEn: number;
  entorno: "production" | "staging" | "local";
  medios: boolean;
  googleDisponible?: boolean;
  googleVinculado?: boolean;
};
export const esquemas = {
  perfil: Perfil,
  plan: Plan,
  entrenamiento: Entrenamiento,
  serie: Serie,
  borrador: Borrador,
  sustitucion: Sustitucion,
  progreso: Progreso,
  calibracion: Carga.extend({ id: EjercicioId }),
  alta: Alta,
} as const;
export function validarOperacion(op: Operacion): Operacion {
  return {
    ...op,
    datos: op.eliminado ? null : esquemas[op.tipo].parse(op.datos),
  };
}
export const Lote = z.object({
  operaciones: z.array(Operacion).min(1).max(3),
});
