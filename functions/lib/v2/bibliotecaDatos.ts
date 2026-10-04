import {
  esIdDeEjercicioCoach,
  type EjercicioCoach,
  type EjercicioCoachCambio,
  type EjercicioCoachNuevo,
} from "../../../shared/v2/biblioteca";

type Fila = {
  id: string;
  referencia_catalogo: string | null;
  nombre: string;
  equipo: string;
  movimiento: string;
  musculo_primario: string;
  musculos_secundarios_json: string;
  tipo_carga: string;
  incremento_lb: number;
  peso_base_lb: number | null;
  explicacion: string;
  foto_clave: string | null;
  animacion_clave: string | null;
  activo: number;
  creado_en: number;
  actualizado_en: number;
};

/** La animación vive en una tabla aparte (migración 0013); se une al leer. */
const SELECCION = `SELECT e.*, a.clave AS animacion_clave FROM ejercicios_coach e
  LEFT JOIN ejercicios_coach_animacion a ON a.ejercicio_id = e.id`;

export function claveDeAnimacion(id: string) {
  return `biblioteca/${id}/animacion`;
}

export function claveDeFoto(id: string) {
  return `biblioteca/${id}`;
}

function aEjercicio(f: Fila): EjercicioCoach {
  return {
    id: f.id,
    referenciaCatalogo: f.referencia_catalogo,
    nombre: f.nombre,
    equipo: f.equipo as EjercicioCoach["equipo"],
    movimiento: f.movimiento,
    musculoPrimario: f.musculo_primario as EjercicioCoach["musculoPrimario"],
    musculosSecundarios: JSON.parse(f.musculos_secundarios_json),
    tipoCarga: f.tipo_carga as EjercicioCoach["tipoCarga"],
    incrementoMinimoLb: f.incremento_lb,
    pesoBaseMaquinaLb: f.peso_base_lb,
    explicacionCorta: f.explicacion,
    tieneFoto: f.foto_clave !== null,
    tieneAnimacion: f.animacion_clave !== null,
    activo: f.activo === 1,
    creadoEn: f.creado_en,
    actualizadoEn: f.actualizado_en,
  };
}

export async function ejerciciosActivos(db: D1Database): Promise<EjercicioCoach[]> {
  const { results } = await db
    .prepare(`${SELECCION} WHERE e.activo=1 ORDER BY e.nombre COLLATE NOCASE, e.id`)
    .all<Fila>();
  return results.map(aEjercicio);
}

/**
 * Huella de la lista activa. Cambia al crear, editar, subir foto o archivar:
 * todo eso toca `actualizado_en` o el número de filas.
 */
export async function etiquetaDeBiblioteca(db: D1Database): Promise<string> {
  const f = await db
    .prepare(
      "SELECT COUNT(*) AS total, SUM(activo) AS activos, COALESCE(MAX(actualizado_en), 0) AS ultimo FROM ejercicios_coach",
    )
    .first<{ total: number; activos: number | null; ultimo: number }>();
  return `"b-${f?.total ?? 0}-${f?.activos ?? 0}-${f?.ultimo ?? 0}"`;
}

export async function leerEjercicio(db: D1Database, id: string): Promise<EjercicioCoach | null> {
  const fila = await db.prepare(`${SELECCION} WHERE e.id=?`).bind(id).first<Fila>();
  return fila ? aEjercicio(fila) : null;
}

export async function claveDeFotoGuardada(db: D1Database, id: string): Promise<string | null> {
  const fila = await db
    .prepare("SELECT foto_clave FROM ejercicios_coach WHERE id=?")
    .bind(id)
    .first<{ foto_clave: string | null }>();
  return fila?.foto_clave ?? null;
}

export async function crearEjercicio(
  db: D1Database,
  id: string,
  e: EjercicioCoachNuevo,
  ahora: number,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO ejercicios_coach (id, referencia_catalogo, nombre, equipo, movimiento, musculo_primario,
        musculos_secundarios_json, tipo_carga, incremento_lb, peso_base_lb, explicacion, creado_en, actualizado_en)
       VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?12)`,
    )
    .bind(
      id,
      e.referenciaCatalogo,
      e.nombre,
      e.equipo,
      e.movimiento,
      e.musculoPrimario,
      JSON.stringify(e.musculosSecundarios),
      e.tipoCarga,
      e.incrementoMinimoLb,
      e.pesoBaseMaquinaLb,
      e.explicacionCorta,
      ahora,
    )
    .run();
}

const COLUMNAS: Record<keyof EjercicioCoachCambio, string> = {
  nombre: "nombre",
  equipo: "equipo",
  movimiento: "movimiento",
  musculoPrimario: "musculo_primario",
  musculosSecundarios: "musculos_secundarios_json",
  tipoCarga: "tipo_carga",
  incrementoMinimoLb: "incremento_lb",
  pesoBaseMaquinaLb: "peso_base_lb",
  explicacionCorta: "explicacion",
  activo: "activo",
};

export async function actualizarEjercicio(
  db: D1Database,
  id: string,
  cambio: EjercicioCoachCambio,
  ahora: number,
): Promise<void> {
  const campos = (Object.keys(COLUMNAS) as (keyof EjercicioCoachCambio)[]).filter(
    (k) => cambio[k] !== undefined,
  );
  const valores = campos.map((k) => {
    const v = cambio[k];
    if (k === "musculosSecundarios") return JSON.stringify(v);
    if (k === "activo") return v ? 1 : 0;
    return v;
  });
  const asignaciones = [...campos.map((k, i) => `${COLUMNAS[k]}=?${i + 2}`), `actualizado_en=?${campos.length + 2}`];
  await db
    .prepare(`UPDATE ejercicios_coach SET ${asignaciones.join(", ")} WHERE id=?1`)
    .bind(id, ...valores, ahora)
    .run();
}

export async function guardarClaveDeFoto(db: D1Database, id: string, ahora: number): Promise<void> {
  await db
    .prepare("UPDATE ejercicios_coach SET foto_clave=?2, actualizado_en=?3 WHERE id=?1")
    .bind(id, claveDeFoto(id), ahora)
    .run();
}

/**
 * Ids `coach-ej-*` de `ids` que no existen o están archivados. Los ids del
 * catálogo fijo no se consultan aquí.
 */
export async function idsDeCoachNoDisponibles(db: D1Database, ids: Iterable<string>): Promise<string[]> {
  const pedidos = [...new Set([...ids].filter(esIdDeEjercicioCoach))];
  if (!pedidos.length) return [];
  const marcas = pedidos.map((_, i) => `?${i + 1}`).join(",");
  const { results } = await db
    .prepare(`SELECT id FROM ejercicios_coach WHERE activo=1 AND id IN (${marcas})`)
    .bind(...pedidos)
    .all<{ id: string }>();
  const activos = new Set(results.map((r) => r.id));
  return pedidos.filter((id) => !activos.has(id));
}

export async function claveDeAnimacionGuardada(db: D1Database, id: string): Promise<string | null> {
  const fila = await db
    .prepare("SELECT clave FROM ejercicios_coach_animacion WHERE ejercicio_id=?")
    .bind(id)
    .first<{ clave: string }>();
  return fila?.clave ?? null;
}

/** Guarda o quita la animación y toca `actualizado_en`: cambia el ETag y la `?v=` de las URLs. */
export async function guardarClaveDeAnimacion(db: D1Database, id: string, ahora: number): Promise<void> {
  await db.batch([
    db
      .prepare(
        "INSERT INTO ejercicios_coach_animacion (ejercicio_id, clave, actualizado_en) VALUES (?1, ?2, ?3) ON CONFLICT(ejercicio_id) DO UPDATE SET clave=?2, actualizado_en=?3",
      )
      .bind(id, claveDeAnimacion(id), ahora),
    db.prepare("UPDATE ejercicios_coach SET actualizado_en=?2 WHERE id=?1").bind(id, ahora),
  ]);
}

export async function quitarClaveDeAnimacion(db: D1Database, id: string, ahora: number): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM ejercicios_coach_animacion WHERE ejercicio_id=?1").bind(id),
    db.prepare("UPDATE ejercicios_coach SET actualizado_en=?2 WHERE id=?1").bind(id, ahora),
  ]);
}
