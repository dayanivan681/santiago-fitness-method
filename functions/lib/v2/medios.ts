import { z } from "zod";
import type { Contexto } from "../../../shared/v2/contratos";
import { ErrorApi } from "./datos";
import { json, type EntornoV2 } from "./seguridad";
export async function medios(
  request: Request,
  env: EntornoV2,
  ctx: Contexto,
  cliente: string,
  id?: string,
) {
  if (!env.FOTOS)
    return json(
      { error: "El almacenamiento de fotos aún no está habilitado." },
      503,
    );
  if (request.method === "GET" && !id) {
    const { results } = await env.ACCESO.prepare(
      `SELECT id,registro_id,tipo,mime,bytes,compartido_coach,creado_en FROM medios WHERE cliente_id=? AND estado='listo' ${ctx.rol === "coach" ? "AND compartido_coach=1" : ""}`,
    )
      .bind(cliente)
      .all();
    return json({ medios: results });
  }
  if (id && request.method === "GET") {
    const meta = await env.ACCESO.prepare(
      "SELECT * FROM medios WHERE id=? AND cliente_id=? AND estado='listo'",
    )
      .bind(id, cliente)
      .first<{ clave: string; mime: string; compartido_coach: number }>();
    if (!meta || (ctx.rol === "coach" && !meta.compartido_coach))
      return json({ error: "Foto no disponible" }, 404);
    const objeto = await env.FOTOS.get(meta.clave);
    if (!objeto) return json({ error: "Foto no disponible" }, 404);
    return new Response(objeto.body, {
      headers: {
        "Content-Type": meta.mime,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  }
  if (ctx.rol !== "cliente")
    throw new ErrorApi("Sólo el cliente gestiona sus fotos.", 403);
  if (id && request.method === "PATCH") {
    const { compartido } = z
      .object({ compartido: z.boolean() })
      .parse(await request.json());
    await env.ACCESO.prepare(
      "UPDATE medios SET compartido_coach=? WHERE id=? AND cliente_id=?",
    )
      .bind(compartido ? 1 : 0, id, cliente)
      .run();
    return json({ ok: true });
  }
  if (id && request.method === "DELETE") {
    // Baja lógica reversible: nunca eliminar físicamente en una petición del cliente.
    await env.ACCESO.prepare(
      "UPDATE medios SET estado='eliminado' WHERE id=? AND cliente_id=?",
    )
      .bind(id, cliente)
      .run();
    return json({ ok: true });
  }
  if (request.method !== "PUT" || !id || !/^[\w-]{1,100}$/.test(id))
    throw new ErrorApi("Solicitud inválida.");
  if (Number(request.headers.get("Content-Length") ?? 0) > 5242880)
    throw new ErrorApi("Máximo 5 MB por foto.", 413);
  if (request.headers.get("X-SFM-Consentimiento") !== "subir")
    throw new ErrorApi("Confirma el almacenamiento privado de la fotografía.");
  const url = new URL(request.url);
  const tipo = z
    .enum(["perfil", "progreso"])
    .parse(url.searchParams.get("tipo"));
  const registro = z
    .string()
    .min(1)
    .max(240)
    .parse(url.searchParams.get("registro"));
  const reader = request.body?.getReader();
  if (!reader) throw new ErrorApi("Fotografía vacía.");
  const partes: Uint8Array[] = [];
  let longitud = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    longitud += value.byteLength;
    if (longitud > 5242880) {
      await reader.cancel();
      throw new ErrorApi("Máximo 5 MB por foto.", 413);
    }
    partes.push(value);
  }
  const contenido = new Uint8Array(longitud);
  let offset = 0;
  for (const p of partes) {
    contenido.set(p, offset);
    offset += p.byteLength;
  }
  const bytes = contenido.buffer;
  if (!bytes.byteLength || bytes.byteLength > 5242880)
    throw new ErrorApi("Máximo 5 MB por foto.", 413);
  const b = new Uint8Array(bytes);
  const mime =
    b[0] === 255 && b[1] === 216 && b[2] === 255
      ? "image/jpeg"
      : b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71
        ? "image/png"
        : b[0] === 82 &&
            b[1] === 73 &&
            b[2] === 70 &&
            b[3] === 70 &&
            b[8] === 87 &&
            b[9] === 69 &&
            b[10] === 66 &&
            b[11] === 80
          ? "image/webp"
          : null;
  if (!mime) throw new ErrorApi("Usa una fotografía JPEG, PNG o WebP.");
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
  const existe = await env.ACCESO.prepare(
    "SELECT cliente_id,hash,estado FROM medios WHERE id=?",
  )
    .bind(id)
    .first<{ cliente_id: string; hash: string; estado: string }>();
  if (existe && (existe.cliente_id !== cliente || existe.hash !== hash))
    throw new ErrorApi("Identificador de fotografía en uso.", 409);
  const clave = `${env.SFM_ENV}/${cliente}/${id}`;
  // Reserva la cuota dentro de la misma sentencia que crea los metadatos.
  // Incluye bajas lógicas: los bytes retenidos siguen ocupando almacenamiento.
  await env.ACCESO.prepare(
    `INSERT OR IGNORE INTO medios(id,cliente_id,registro_id,clave,tipo,mime,bytes,hash,creado_en)
    SELECT ?1,?2,?3,?4,?5,?6,?7,?8,?9 WHERE COALESCE((SELECT SUM(bytes) FROM medios WHERE cliente_id=?2),0)+?7<=104857600`,
  )
    .bind(
      id,
      cliente,
      registro,
      clave,
      tipo,
      mime,
      bytes.byteLength,
      hash,
      Date.now(),
    )
    .run();
  const reservada = await env.ACCESO.prepare(
    "SELECT hash,estado,cliente_id,registro_id,tipo FROM medios WHERE id=?",
  )
    .bind(id)
    .first<{
      hash: string;
      estado: string;
      cliente_id: string;
      registro_id: string;
      tipo: string;
    }>();
  if (!reservada)
    throw new ErrorApi(
      "Has alcanzado los 100 MB de fotografías. Contacta a tu coach.",
      413,
    );
  if (
    reservada.hash !== hash ||
    reservada.cliente_id !== cliente ||
    reservada.registro_id !== registro ||
    reservada.tipo !== tipo
  )
    throw new ErrorApi("Identificador de fotografía en uso.", 409);
  if (reservada.estado === "eliminado")
    throw new ErrorApi(
      "Esta foto fue retirada. Elige una nueva para subirla.",
      409,
    );
  if (reservada.estado === "listo")
    return json({ id, hash, bytes: bytes.byteLength });
  await env.FOTOS.put(clave, bytes, { httpMetadata: { contentType: mime } });
  await env.ACCESO.prepare(
    "UPDATE medios SET estado='listo' WHERE id=? AND cliente_id=?",
  )
    .bind(id, cliente)
    .run();
  return json({ id, hash, bytes: bytes.byteLength });
}
