import { z } from "zod";
import {
  Alta,
  Id,
  Lote,
  Perfil,
  Operacion,
} from "../../../shared/v2/contratos";
import {
  aplicar,
  actual,
  clientesActuales,
  ErrorApi,
  leerCambios,
  perfilActual,
  planActual,
} from "./datos";
import { autenticar, json, origenSeguro, type EntornoV2 } from "./seguridad";
import { importar } from "./importar";
import { revisarImportaciones } from "./revisarImportaciones";
import { medios } from "./medios";
import { crearInvitacion } from "../invitacion";
import { archivarCliente } from "../roles";
import { resumen } from "../cripto";
import { prepararRestablecimiento } from "../cuentas";
import { bloqueoPorSuscripcion, rutaDeSuscripcion } from "./suscripcionApi";
export async function api(
  request: Request,
  env: EntornoV2,
  coach = false,
): Promise<Response> {
  try {
    if (!origenSeguro(request))
      return json({ error: "Origen no autorizado." }, 403);
    const ctx = await autenticar(request, env, coach ? "coach" : "cliente");
    if (!ctx)
      return json({ error: "Vuelve a entrar con tu acceso privado." }, 401);
    const url = new URL(request.url);
    const ruta = url.pathname
      .replace(coach ? "/admin/api/v2" : "/api/v2", "")
      .replace(/\/$/, "");
    if (ruta === "/contexto" && request.method === "GET") return json(ctx);
    // Staging se niega a operar si alguien le vincula una base productiva.
    const entorno = await env.ACCESO.prepare(
      "SELECT nombre FROM entorno_sfm WHERE id=1",
    ).first<{ nombre: string }>();
    if (!entorno || entorno.nombre !== ctx.entorno)
      return json({ error: "La base no corresponde a este entorno." }, 503);
    if (coach && ruta === "/clientes" && request.method === "GET")
      return json({ clientes: await clientesActuales(env.ACCESO) });
    const cliente = coach
      ? (url.searchParams.get("cliente") ?? `coach:${ctx.identidad}`)
      : ctx.identidad;
    const propioCoach = cliente === `coach:${ctx.identidad}`;
    if (!propioCoach) {
      Id.parse(cliente);
      const existe = await env.ACCESO.prepare(
        "SELECT id FROM clientes WHERE id=? AND activo=1",
      )
        .bind(cliente)
        .first();
      if (!existe || (ctx.entorno === "production" && cliente === "dayan-test"))
        return json({ error: "Cliente no disponible." }, 404);
    }
    const suscripcion = await rutaDeSuscripcion(request, env, ctx, cliente, ruta);
    if (suscripcion) return suscripcion;
    if (ruta === "/inicio" && request.method === "GET") {
      const [perfil, plan] = await Promise.all([
        perfilActual(env.ACCESO, cliente),
        planActual(env.ACCESO, cliente),
      ]);
      return json({
        contexto: ctx,
        perfil: perfil ? { ...perfil, ...(!coach ? { notas: "" } : {}) } : null,
        ...plan,
      });
    }
    if (ruta === "/cambios" && request.method === "GET") {
      const cursor = z.coerce
        .number()
        .int()
        .nonnegative()
        .parse(url.searchParams.get("cursor") ?? 0);
      return json(await leerCambios(env.ACCESO, cliente, cursor, ctx.rol));
    }
    if (ruta === "/sincronizar" && request.method === "POST") {
      const bloqueo = await bloqueoPorSuscripcion(env, ctx, cliente);
      if (bloqueo) return bloqueo;
      if (Number(request.headers.get("Content-Length") ?? 0) > 524288)
        return json({ error: "Lote demasiado grande." }, 413);
      const body = await request.text();
      if (body.length > 524288)
        return json({ error: "Lote demasiado grande." }, 413);
      const { operaciones } = Lote.parse(JSON.parse(body));
      if (propioCoach && operaciones.some((o) => o.tipo !== "alta"))
        throw new ErrorApi("Sólo borradores de onboarding en este espacio.");
      if (!propioCoach && operaciones.some((o) => o.tipo === "alta"))
        throw new ErrorApi("Borrador fuera de su espacio.");
      const resultados = [];
      for (const op of operaciones)
        resultados.push(await aplicar(env.ACCESO, cliente, ctx, op));
      return json(
        { resultados },
        resultados.some((r) => r.conflicto) ? 409 : 200,
      );
    }
    if (coach && ruta === "/crear-cliente" && request.method === "POST") {
      const entrada = z
        .object({ borradorId: Id, revision: z.number().int().positive() })
        .parse(await request.json());
      const origen = await actual(
        env.ACCESO,
        `coach:${ctx.identidad}`,
        "alta",
        entrada.borradorId,
      );
      if (!origen || origen.revision !== entrada.revision)
        throw new ErrorApi(
          "El borrador cambió. Recárgalo antes de crear el cliente.",
          409,
        );
      const alta = Alta.parse(JSON.parse(origen.datos_json));
      const p = Perfil.parse(alta.perfil);
      if (alta.plan.estado !== "publicado" || !alta.plan.revisado)
        throw new ErrorApi(
          "Revisa y publica el primer plan antes de crear el cliente.",
        );
      const existente = await actual(env.ACCESO, p.id, "perfil", p.id);
      if (existente) {
        if (existente.operacion_id !== alta.id)
          throw new ErrorApi("Ya existe otra persona con esta identidad.", 409);
        return json({ id: p.id });
      }
      const ahora = Date.now();
      const actor = `coach:${ctx.identidad}`;
      // Perfil, plan y recibo del onboarding son una sola transacción. Los campos
      // desconocidos sólo viven como null en el contrato nuevo; cero es el marcador
      // técnico del adaptador antiguo, nunca se muestra ni se usa como una medida.
      await env.ACCESO.batch([
        env.ACCESO.prepare(
          `INSERT INTO clientes(id,nombre,sexo,edad,estatura_cm,peso_corporal_lb,objetivo,frecuencia_entrenamiento,limitaciones,notas,ejercicios_evitados_json,activo,creado_en,actualizado_en) VALUES(?,?,?,?,?,?,?,?,?,?,?,1,?,?)`,
        ).bind(
          p.id,
          p.nombre,
          p.sexo ?? "",
          p.edad ?? 0,
          p.estaturaCm ?? 0,
          p.pesoCorporalLb ?? 0,
          p.objetivo,
          p.frecuenciaEntrenamiento,
          p.limitaciones,
          p.notas,
          JSON.stringify(p.ejerciciosEvitados),
          Math.floor(ahora / 1000),
          Math.floor(ahora / 1000),
        ),
        env.ACCESO.prepare(
          "INSERT INTO cambios(cliente_id,tipo,documento_id,revision,datos_json,operacion_id,hash,actor,creado_en) VALUES(?,'perfil',?,1,?,?,?,?,?)",
        ).bind(
          p.id,
          p.id,
          JSON.stringify(p),
          alta.id,
          await resumen(JSON.stringify(p)),
          actor,
          ahora,
        ),
        env.ACCESO.prepare(
          "INSERT INTO cambios(cliente_id,tipo,documento_id,revision,datos_json,operacion_id,hash,actor,creado_en) VALUES(?,'plan','programa',1,?,?,?,?,?)",
        ).bind(
          p.id,
          JSON.stringify({ ...alta.plan, id: "programa" }),
          crypto.randomUUID(),
          await resumen(JSON.stringify(alta.plan)),
          actor,
          ahora,
        ),
        env.ACCESO.prepare(
          "INSERT INTO cambios(cliente_id,tipo,documento_id,revision,datos_json,operacion_id,hash,actor,creado_en) VALUES(?,'alta',?,?,?,?,?,?,?)",
        ).bind(
          `coach:${ctx.identidad}`,
          alta.id,
          origen.revision + 1,
          JSON.stringify({ ...alta, completado: true }),
          crypto.randomUUID(),
          "onboarding-completo",
          actor,
          ahora,
        ),
      ]);
      return json({ id: p.id }, 201);
    }
    if (coach && ruta === "/invitar" && request.method === "POST") {
      const cuenta = await env.ACCESO.prepare('SELECT cliente_id FROM cuentas WHERE cliente_id=?').bind(cliente).first();
      if (cuenta) return json({ error: 'Este cliente ya tiene cuenta. Prepara un enlace para cambiar su contraseña.' }, 409);
      const { plan } = await planActual(env.ACCESO, cliente);
      if (
        !plan.revisado ||
        plan.dias.length === 0 ||
        plan.dias.some((d) => d.slots.length < 5 || d.slots.length > 8)
      )
        throw new ErrorApi(
          "Revisa las sesiones de 5–8 ejercicios antes de invitar.",
        );
      const invitacion = await crearInvitacion(env.ACCESO, cliente);
      return json({
        enlace: `${url.origin}/access?t=${invitacion.token}`,
        expiraEn: invitacion.expiraEn,
      });
    }
    if (coach && ruta === "/estado-cuenta" && request.method === "GET") {
      const cuenta = await env.ACCESO.prepare('SELECT email FROM cuentas WHERE cliente_id=?').bind(cliente).first<{ email: string }>();
      return json({ tieneCuenta: !!cuenta, email: cuenta?.email ?? null });
    }
    if (coach && ruta === "/restablecer-clave" && request.method === "POST") {
      const enlace = await prepararRestablecimiento(env.ACCESO, cliente);
      if (!enlace) return json({ error: 'Este cliente aún no tiene cuenta.' }, 404);
      return json({ enlace: `${url.origin}/restablecer?t=${enlace.token}`, expiraEn: enlace.expiraEn });
    }
    if (coach && ruta === "/revocar" && request.method === "POST") {
      await env.ACCESO.batch([
        env.ACCESO.prepare(
          "UPDATE sesiones SET revocada_en=unixepoch() WHERE cliente_id=? AND revocada_en IS NULL",
        ).bind(cliente),
        env.ACCESO.prepare(
          "UPDATE invitaciones SET revocada_en=unixepoch() WHERE cliente_id=? AND revocada_en IS NULL",
        ).bind(cliente),
      ]);
      return json({ ok: true });
    }
    if (coach && ruta === "/archivar" && request.method === "POST") {
      await archivarCliente(env.ACCESO, cliente);
      return json({ ok: true });
    }
    if (ruta === "/importar" && request.method === "POST")
      return await importar(request, env.ACCESO, ctx);
    if (ruta === "/importaciones")
      return await revisarImportaciones(request, env.ACCESO, ctx, cliente);
    if (ruta.startsWith("/medios")) {
      const bloqueo = request.method === "GET" ? null : await bloqueoPorSuscripcion(env, ctx, cliente);
      if (bloqueo) return bloqueo;
      return await medios(request, env, ctx, cliente, ruta.split("/")[2]);
    }
    if (ruta === "/conflictos" && request.method === "GET") {
      const { results } = await env.ACCESO.prepare(
        "SELECT id,operacion_json,actual_json FROM conflictos WHERE cliente_id=? AND resuelto_en IS NULL AND (?='coach' OR actor=?)",
      )
        .bind(cliente, ctx.rol, `cliente:${ctx.identidad}`)
        .all();
      return json({ conflictos: results });
    }
    if (ruta === "/resolver" && request.method === "POST") {
      const entrada = z
        .object({
          id: z.uuid(),
          resolucionId: z.uuid(),
          eleccion: z.enum(["conservar-cloud", "aplicar-local"]),
          revisionCloud: z.number().int().nonnegative(),
          propuestas: z.array(Operacion).min(1).max(100),
        })
        .parse(await request.json());
      const conflicto = await env.ACCESO.prepare(
        "SELECT actor,operacion_json,resuelto_en,resolucion_json FROM conflictos WHERE id=? AND cliente_id=?",
      )
        .bind(entrada.id, cliente)
        .first<{
          actor: string;
          operacion_json: string;
          resuelto_en: number | null;
          resolucion_json: string | null;
        }>();
      if (
        !conflicto ||
        (ctx.rol === "cliente" &&
          conflicto.actor !== `cliente:${ctx.identidad}`)
      )
        throw new ErrorApi("Conflicto no disponible.", 404);
      if (conflicto.resuelto_en) {
        const recibo = JSON.parse(conflicto.resolucion_json ?? "{}");
        if (recibo.resolucionId === entrada.resolucionId)
          return json({ ok: true });
        throw new ErrorApi(
          "Este cambio ya se resolvió desde otro dispositivo. Actualiza la pantalla.",
          409,
        );
      }
      const auditoria = structuredClone(entrada);
      const original = Operacion.parse(JSON.parse(conflicto.operacion_json));
      if (
        entrada.propuestas.some(
          (o) => o.id !== original.id || o.tipo !== original.tipo,
        )
      )
        throw new ErrorApi("Propuestas de otro registro.", 403);
      const vigente = await actual(
        env.ACCESO,
        cliente,
        original.tipo,
        original.id,
      );
      const yaAplicada = await env.ACCESO.prepare(
        "SELECT operacion_id FROM cambios WHERE cliente_id=? AND operacion_id=?",
      )
        .bind(cliente, entrada.resolucionId)
        .first();
      if (!yaAplicada && (vigente?.revision ?? 0) !== entrada.revisionCloud)
        throw new ErrorApi(
          "La cuenta recibió otro cambio. Revisa la versión actual antes de elegir.",
          409,
        );
      if (entrada.eleccion === "aplicar-local" && !yaAplicada) {
        const op = entrada.propuestas.at(-1)!;
        if (op.tipo === "serie" && vigente) {
          const a = JSON.parse(vigente.datos_json);
          const d = op.datos as Record<string, unknown>;
          d.correcciones = [
            ...(a.correcciones ?? []),
            {
              pesoRegistradoLb: a.pesoRegistradoLb,
              repsRealizadas: a.repsRealizadas,
              rir: a.rir,
              tecnica: a.tecnica,
              nota: a.nota,
              esCalentamiento: a.esCalentamiento,
              corregidaEn: new Date().toISOString(),
              motivo: "correccion",
            },
          ];
        }
        const r = await aplicar(env.ACCESO, cliente, ctx, {
          ...op,
          opId: entrada.resolucionId,
          revision: entrada.revisionCloud,
        });
        if (r.conflicto)
          throw new ErrorApi(
            "Llegó otra versión mientras guardabas. Revisa ambos cambios.",
            409,
          );
      }
      // El recibo retiene TODA la cola local revisada, incluso versiones intermedias.
      await env.ACCESO.prepare(
        "UPDATE conflictos SET resuelto_en=?,resolucion_json=? WHERE id=? AND cliente_id=? AND resuelto_en IS NULL",
      )
        .bind(Date.now(), JSON.stringify(auditoria), entrada.id, cliente)
        .run();
      return json({ ok: true });
    }

    return json({ error: "Ruta no disponible." }, 404);
  } catch (e) {
    if (e instanceof z.ZodError)
      return json({ error: e.issues.map((i) => i.message).join(". ") }, 400);
    if (e instanceof ErrorApi) return json({ error: e.message }, e.status);
    console.error(
      "SFM API failure",
      e instanceof Error ? e.message : "unknown",
    );
    return json(
      { error: "No se pudo guardar. Tus cambios pendientes se conservan." },
      500,
    );
  }
}
