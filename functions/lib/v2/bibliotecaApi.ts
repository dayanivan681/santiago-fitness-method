import { z } from "zod";
import {
  EjercicioCoachCambio,
  EjercicioCoachNuevo,
  esIdDeEjercicioCoach,
} from "../../../shared/v2/biblioteca";
import type { Contexto } from "../../../shared/v2/contratos";
import {
  actualizarEjercicio,
  claveDeFoto,
  claveDeFotoGuardada,
  crearEjercicio,
  ejerciciosActivos,
  etiquetaDeBiblioteca,
  guardarClaveDeFoto,
  leerEjercicio,
} from "./bibliotecaDatos";
import { ErrorApi } from "./datos";
import { leerFotoValidada, rechazarSiDeclaraDemasiado } from "./medios";
import { json, type EntornoV2 } from "./seguridad";

const PREFIJO = "/biblioteca";
const CACHE_DE_FOTO = "private, max-age=300";

/**
 * Biblioteca del coach. Los dos roles leen los ejercicios activos y la foto;
 * sólo el coach crea, edita, archiva y sube fotos. Nunca se borra un ejercicio:
 * puede tener historial. Devuelve `null` si la ruta no es de biblioteca.
 */
export async function rutaDeBiblioteca(
  request: Request,
  env: EntornoV2,
  ctx: Contexto,
  ruta: string,
): Promise<Response | null> {
  if (ruta !== PREFIJO && !ruta.startsWith(`${PREFIJO}/`)) return null;
  try {
    return await atender(request, env, ctx, ruta);
  } catch (e) {
    if (e instanceof ErrorApi) return json({ error: e.message }, e.status);
    if (e instanceof z.ZodError) return json({ error: e.issues.map((i) => i.message).join(". ") }, 400);
    throw e;
  }
}

async function atender(request: Request, env: EntornoV2, ctx: Contexto, ruta: string): Promise<Response> {
  const metodo = request.method;
  const [, , id, subruta, ...resto] = ruta.split("/");
  if (resto.length || (subruta !== undefined && subruta !== "foto")) return json({ error: "Ruta no disponible." }, 404);
  if (id !== undefined && !esIdDeEjercicioCoach(id)) return json({ error: "Ejercicio no disponible." }, 404);

  if (!id && metodo === "GET") return listar(request, env);
  if (id && subruta === "foto" && metodo === "GET") return servirFoto(env, id);

  const permitido = (!id && metodo === "POST") || (id && !subruta && metodo === "PATCH") || (id && subruta === "foto" && metodo === "PUT");
  if (!permitido) return json({ error: "Ruta no disponible." }, 404);
  if (ctx.rol !== "coach") return json({ error: "Sólo el coach gestiona la biblioteca." }, 403);

  if (!id) {
    const nuevo = EjercicioCoachNuevo.parse(await request.json());
    const nuevoId = `coach-ej-${crypto.randomUUID()}`;
    await crearEjercicio(env.ACCESO, nuevoId, nuevo, Date.now());
    return json({ ejercicio: await leerEjercicio(env.ACCESO, nuevoId) }, 201);
  }
  if (!(await leerEjercicio(env.ACCESO, id))) return json({ error: "Ejercicio no disponible." }, 404);
  if (subruta === "foto") return subirFoto(request, env, id);
  await actualizarEjercicio(env.ACCESO, id, EjercicioCoachCambio.parse(await request.json()), Date.now());
  return json({ ejercicio: await leerEjercicio(env.ACCESO, id) });
}

/** Con ~300 ejercicios y un cliente que pregunta cada minuto, responder 304 ahorra bajar la lista entera. */
async function listar(request: Request, env: EntornoV2): Promise<Response> {
  const etiqueta = await etiquetaDeBiblioteca(env.ACCESO);
  if (request.headers.get("If-None-Match") === etiqueta)
    return new Response(null, { status: 304, headers: { ETag: etiqueta, "Cache-Control": "no-store" } });
  const respuesta = json({ ejercicios: await ejerciciosActivos(env.ACCESO) });
  respuesta.headers.set("ETag", etiqueta);
  return respuesta;
}

async function servirFoto(env: EntornoV2, id: string): Promise<Response> {
  if (!env.FOTOS) return json({ error: "El almacenamiento de fotos aún no está habilitado." }, 503);
  const clave = await claveDeFotoGuardada(env.ACCESO, id);
  const objeto = clave ? await env.FOTOS.get(clave) : null;
  if (!objeto) return json({ error: "Foto no disponible" }, 404);
  return new Response(objeto.body, {
    headers: {
      "Content-Type": objeto.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": CACHE_DE_FOTO,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}

async function subirFoto(request: Request, env: EntornoV2, id: string): Promise<Response> {
  if (!env.FOTOS) return json({ error: "El almacenamiento de fotos aún no está habilitado." }, 503);
  rechazarSiDeclaraDemasiado(request);
  const { bytes, mime } = await leerFotoValidada(request);
  await env.FOTOS.put(claveDeFoto(id), bytes, { httpMetadata: { contentType: mime } });
  await guardarClaveDeFoto(env.ACCESO, id, Date.now());
  return json({ ejercicio: await leerEjercicio(env.ACCESO, id) });
}
