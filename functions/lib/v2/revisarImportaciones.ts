import { z } from "zod";
import {
  Id,
  type Contexto,
  type Operacion,
} from "../../../shared/v2/contratos";
import { ErrorApi } from "./datos";
import { json } from "./seguridad";

export async function revisarImportaciones(
  request: Request,
  db: D1Database,
  ctx: Contexto,
  cliente: string,
) {
  if (request.method === "GET") {
    const lote = new URL(request.url).searchParams.get("lote");
    const filas = await db
      .prepare(
        "SELECT hash,manifest_json,(SELECT COUNT(*) FROM importaciones_revisiones r WHERE r.cliente_id=i.cliente_id AND r.lote_hash=i.hash) revisados FROM importaciones i WHERE cliente_id=? ORDER BY creado_en DESC",
      )
      .bind(cliente)
      .all<{ hash: string; manifest_json: string; revisados:number }>();
    if (!lote)
      return json({
        importaciones: await Promise.all(
          filas.results.map(async (f) => {
            const m = JSON.parse(f.manifest_json);
            return {
              hash: f.hash,
              fecha: m.fecha,
              nombre: m.perfilOriginal.nombre,
              verificados: m.verificados,
              esperados: m.esperados,
              completo: m.completo ?? true,
              pendientes: Math.max(0, m.conflictos.length - f.revisados),
            };
          }),
        ),
      });
    const f = filas.results.find((f) => f.hash === lote);
    if (!f) throw new ErrorApi("Respaldo no disponible.", 404);
    const m = JSON.parse(f.manifest_json);
    const claves = new Set<string>(m.conflictos);
    const partes = await db
      .prepare(
        "SELECT p.tipo,p.origen_id,p.datos_json,r.creado_en AS revisado,c.datos_json actual_json,c.revision,c.eliminado FROM importaciones_partidas p LEFT JOIN importaciones_revisiones r ON r.cliente_id=p.cliente_id AND r.lote_hash=p.lote_hash AND r.tipo=p.tipo AND r.origen_id=p.origen_id LEFT JOIN cambios c ON c.cliente_id=p.cliente_id AND c.tipo=p.tipo AND c.documento_id=p.origen_id AND c.revision=(SELECT MAX(v.revision) FROM cambios v WHERE v.cliente_id=p.cliente_id AND v.tipo=p.tipo AND v.documento_id=p.origen_id) WHERE p.cliente_id=? AND p.lote_hash=?",
      )
      .bind(cliente, lote)
      .all<{
        tipo: Operacion["tipo"];
        origen_id: string;
        datos_json: string;
        revisado: number | null;
        actual_json:string|null; revision:number|null; eliminado:number|null;
      }>();
    return json({
      registros: await Promise.all(
        partes.results
          .filter((p) => claves.has(`${p.tipo}:${p.origen_id}`))
          .map(async (p) => {
            return {
              tipo: p.tipo,
              id: p.origen_id,
              original: JSON.parse(p.datos_json),
              actual: p.actual_json && !p.eliminado ? JSON.parse(p.actual_json) : null,
              revision: p.revision ?? 0,
              revisado: !!p.revisado,
            };
          }),
      ),
    });
  }
  if (request.method !== "POST")
    throw new ErrorApi("Acción no disponible.", 405);
  const e = z
    .object({
      lote: z.string().regex(/^[a-f0-9]{64}$/),
      tipo: z.enum([
        "serie",
        "entrenamiento",
        "progreso",
        "sustitucion",
        "borrador",
        "calibracion",
      ]),
      id: Id,
      revision: z.number().int().nonnegative(),
      decision: z.literal("conservar-actual"),
    })
    .parse(await request.json());
  const origen = await db
    .prepare(
      "SELECT 1 FROM importaciones_partidas WHERE cliente_id=? AND lote_hash=? AND tipo=? AND origen_id=?",
    )
    .bind(cliente, e.lote, e.tipo, e.id)
    .first();
  if (!origen) throw new ErrorApi("Registro no disponible.", 404);
  const lote = await db
    .prepare(
      "SELECT manifest_json FROM importaciones WHERE cliente_id=? AND hash=?",
    )
    .bind(cliente, e.lote)
    .first<{ manifest_json: string }>();
  if (
    !lote ||
    !(JSON.parse(lote.manifest_json).conflictos as string[]).includes(
      `${e.tipo}:${e.id}`,
    )
  )
    throw new ErrorApi("Este registro no requiere revisión.", 409);
  // No se cambia el historial. Se conserva una decisión auditada sobre la
  // versión que la persona acaba de revisar; un cambio concurrente exige releer.
  await db
    .prepare(
      "INSERT OR IGNORE INTO importaciones_revisiones(cliente_id,lote_hash,tipo,origen_id,revision_actual,actor,creado_en) SELECT ?,?,?,?,?,?,? WHERE COALESCE((SELECT MAX(revision) FROM cambios WHERE cliente_id=? AND tipo=? AND documento_id=?),0)=?",
    )
    .bind(
      cliente,
      e.lote,
      e.tipo,
      e.id,
      e.revision,
      `${ctx.rol}:${ctx.identidad}`,
      Date.now(),
      cliente,
      e.tipo,
      e.id,
      e.revision,
    )
    .run();
  const recibo = await db
    .prepare(
      "SELECT revision_actual FROM importaciones_revisiones WHERE cliente_id=? AND lote_hash=? AND tipo=? AND origen_id=?",
    )
    .bind(cliente, e.lote, e.tipo, e.id)
    .first<{ revision_actual: number }>();
  if (!recibo)
    throw new ErrorApi(
      "Llegó otro cambio. Revisa la versión actual antes de confirmar.",
      409,
    );
  return json({ ok: true });
}
