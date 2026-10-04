import { z } from "zod";

/**
 * Ejercicios que el coach añade a su biblioteca. Los enums repiten `Equipo`,
 * `Musculo` y `TipoCarga` de `src/dominio`; `biblioteca.test.ts` comprueba en
 * compilación que no se desvían.
 */
export const EQUIPOS = [
  "smith",
  "convergente",
  "cable",
  "mancuernas",
  "barraLibre",
  "maquinaTradicional",
  "maquinaDiscos",
  "pesoCorporal",
] as const;
export const MUSCULOS = [
  "pecho",
  "espalda",
  "cuadriceps",
  "gluteos",
  "femoral",
  "biceps",
  "triceps",
  "deltoideLateral",
  "deltoideAnterior",
  "deltoidePosterior",
  "pantorrillas",
  "core",
  "aductores",
] as const;
export const TIPOS_DE_CARGA = ["total", "porLado", "discosAnadidos", "pesoMaquina"] as const;

export const NOMBRE_MAX = 80;
export const EXPLICACION_MAX = 240;
export const FOTO_MAX_BYTES = 5 * 1024 * 1024;

export const ID_EJERCICIO_COACH = /^coach-ej-[0-9a-f-]{36}$/;
export const esIdDeEjercicioCoach = (id: string) => ID_EJERCICIO_COACH.test(id);

const Equipo = z.enum(EQUIPOS);
const Musculo = z.enum(MUSCULOS);

/** Campos editables, sin valores por defecto: un cambio parcial no debe rellenar nada. */
const Campos = z.object({
  nombre: z.string().trim().min(1, "Escribe el nombre.").max(NOMBRE_MAX),
  equipo: Equipo,
  movimiento: z.string().trim().min(1).max(80),
  musculoPrimario: Musculo,
  musculosSecundarios: z.array(Musculo).max(4),
  tipoCarga: z.enum(TIPOS_DE_CARGA),
  incrementoMinimoLb: z.number().positive().max(1000),
  pesoBaseMaquinaLb: z.number().min(0).max(2000).nullable(),
  explicacionCorta: z.string().trim().max(EXPLICACION_MAX),
});

/** Lo que el coach escribe en el formulario; el servidor añade id y fechas. */
export const EjercicioCoachNuevo = Campos.extend({
  referenciaCatalogo: z
    .string()
    .regex(/^(C\d{3}|M02-\d{3})$/, "Ficha de catálogo no válida.")
    .nullable()
    .default(null),
  musculosSecundarios: Campos.shape.musculosSecundarios.default([]),
  pesoBaseMaquinaLb: Campos.shape.pesoBaseMaquinaLb.default(null),
  explicacionCorta: Campos.shape.explicacionCorta.default(""),
});

/** Edición parcial: sólo cambia lo que llega. La ficha de catálogo no se edita. */
export const EjercicioCoachCambio = Campos.partial().extend({ activo: z.boolean().optional() });

export const EjercicioCoach = EjercicioCoachNuevo.extend({
  id: z.string().regex(ID_EJERCICIO_COACH),
  /** `true` cuando el ejercicio ya tiene foto en `/biblioteca/<id>/foto`. */
  tieneFoto: z.boolean(),
  /** `true` cuando además tiene un GIF en `/biblioteca/<id>/animacion`; la foto sigue siendo la fija. */
  tieneAnimacion: z.boolean().default(false),
  activo: z.boolean(),
  creadoEn: z.number().int(),
  actualizadoEn: z.number().int(),
});

export type EjercicioCoachNuevo = z.infer<typeof EjercicioCoachNuevo>;
export type EjercicioCoachCambio = z.infer<typeof EjercicioCoachCambio>;
export type EjercicioCoach = z.infer<typeof EjercicioCoach>;
