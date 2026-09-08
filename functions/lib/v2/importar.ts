import { z } from "zod";
import { RespaldoV1, canonico } from "../../../shared/v2/importacion";
import type { Contexto, Operacion } from "../../../shared/v2/contratos";
import { actual, aplicar, ErrorApi } from "./datos";
import { resumen } from "../cripto";
import { json } from "./seguridad";
export async function importar(
  request: Request,
  db: D1Database,
  ctx: Contexto,
) {
  if (ctx.rol !== "cliente")
    throw new ErrorApi("La pertenencia la confirma el cliente.", 403);
  const texto = await request.text();
  if (texto.length > 5_000_000)
    throw new ErrorApi("Divide el respaldo en lotes de menos de 5 MB.", 413);
  const entrada = z
    .object({ confirmoPertenencia: z.literal(true), respaldo: RespaldoV1 })
    .parse(JSON.parse(texto));
  const r = entrada.respaldo;
  if (r.fotos?.length || r.fotoDePerfil)
    throw new ErrorApi(
      "Las fotos necesitan un consentimiento separado. Importa primero el historial.",
    );
  const hash = await resumen(canonico({ ...r, exportadoEn: undefined }));
  const cliente = ctx.identidad;
  const anterior = await db
    .prepare(
      "SELECT manifest_json FROM importaciones WHERE cliente_id=? AND hash=?",
    )
    .bind(cliente, hash)
    .first<{ manifest_json: string }>();
  const previo = anterior ? JSON.parse(anterior.manifest_json) : null;
  if (previo && (previo.completo ?? true)) return json({ recibo: { ...previo, completo:true, procesados:previo.esperados }, repetido: true });
  const operaciones: Operacion[] = [];
  function agregar(tipo: Operacion["tipo"], id: string, datos: unknown) {
    operaciones.push({
      opId: crypto.randomUUID(),
      tipo,
      id,
      datos,
      revision: 0,
      eliminado: false,
    });
  }
  for (const e of r.sesiones)
    agregar("entrenamiento", e.id, {
      ...e,
      participanteId: cliente,
      procedencia: "importacion",
      prescripcion:
        e.prescripcion ?? r.plantillas.find((p) => p.id === e.plantillaDiaId),
      cargas:
        e.cargas ?? Object.fromEntries(r.calibraciones.map((c) => [c.id, c])),
    });
  for (const s of r.series) agregar("serie", s.id, s);
  for (const p of r.progreso)
    agregar("progreso", p.id, {
      ...p,
      participanteId: cliente,
      tieneFoto: false,
    });
  for (const s of r.sustituciones)
    agregar("sustitucion", s.id, { ...s, participanteId: cliente });
  for (const b of r.borradores)
    agregar("borrador", b.id, { ...b, participanteId: cliente });
  for (const c of r.calibraciones) agregar("calibracion", c.id, c);
  let guardados = previo?.verificados ?? 0;
  const conflictos: string[] = [...(previo?.conflictos ?? [])];
  const desde = previo?.procesados ?? 0;
  const fin = Math.min(desde + 3, operaciones.length);
  // Hasta tres registros por petición mantienen el peor caso bajo 50 consultas.
  // El cursor vive en el recibo cloud, por lo que otro dispositivo puede retomar.
  for (const op of operaciones.slice(desde, fin)) {
    await db
      .prepare(
        "INSERT OR IGNORE INTO importaciones_partidas(cliente_id,lote_hash,tipo,origen_id,datos_json) VALUES(?,?,?,?,?)",
      )
      .bind(cliente, hash, op.tipo, op.id, JSON.stringify(op.datos))
      .run();
    const existe = await actual(db, cliente, op.tipo, op.id);
    if (existe) {
      if (canonico(JSON.parse(existe.datos_json)) === canonico(op.datos)) {
        guardados++;
        continue;
      }
      conflictos.push(`${op.tipo}:${op.id}`);
      continue;
    }
    try {
      const resultado = await aplicar(db, cliente, ctx, op, {
        importacion: true,
      });
      if (resultado.confirmacion) guardados++;
      else conflictos.push(`${op.tipo}:${op.id}`);
    } catch (e) {
      if (e instanceof ErrorApi && e.status === 409) {
        conflictos.push(`${op.tipo}:${op.id}`);
        continue;
      }
      throw e;
    }
  }
  const manifest = {
    id: hash,
    hash,
    origen: r.participante.id,
    propietarioConfirmado: cliente,
    fecha: Date.now(),
    esperados: operaciones.length,
    procesados: fin,
    completo: fin === operaciones.length,
    verificados: guardados,
    conflictos,
    conteos: {
      entrenamientos: r.sesiones.length,
      series: r.series.length,
      progreso: r.progreso.length,
      borradores: r.borradores.length,
      calibraciones: r.calibraciones.length,
    },
    programaOriginal: r.plantillas,
    perfilOriginal: r.participante,
  };
  // El recibo distingue lo verificado de lo pendiente. Las propuestas en
  // conflicto también quedan conservadas en la nube, sin pisar el historial.
  await db
    .prepare(
      "INSERT INTO importaciones(id,cliente_id,hash,manifest_json,creado_en) VALUES(?,?,?,?,?) ON CONFLICT(cliente_id,hash) DO UPDATE SET manifest_json=excluded.manifest_json WHERE json_extract(excluded.manifest_json,'$.procesados') >= COALESCE(json_extract(importaciones.manifest_json,'$.procesados'),0)",
    )
    .bind(
      `${cliente}:${hash}`,
      cliente,
      hash,
      JSON.stringify(manifest),
      Date.now(),
    )
    .run();
  return json(
    { recibo: manifest, repetido: false },
    fin < operaciones.length ? 202 : conflictos.length ? 207 : 200,
  );
}
