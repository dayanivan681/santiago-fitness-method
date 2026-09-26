import { z } from "zod";
import Stripe from "stripe";
import type { Contexto } from "../../../shared/v2/contratos";
import { estadoDeAcceso } from "../suscripcion";
import {
  accionDelCoach,
  asignarPrecio,
  crearPago,
  crearPortal,
  crearStripe,
  ErrorSuscripcion,
  leerSuscripcion,
  listarPrecios,
  marcarExento,
  resumir,
  stripeConfigurado,
  suscripcionesDeClientes,
  type AccionDelCoach,
} from "../stripe";
import { json, type EntornoV2 } from "./seguridad";

const ACCIONES: Record<string, AccionDelCoach> = {
  "/suscripcion/pausar": "pausar",
  "/suscripcion/reanudar": "reanudar",
  "/suscripcion/cancelar": "cancelar",
  "/suscripcion/mantener": "mantener",
};

const RUTAS_DEL_CLIENTE = new Set(["/suscripcion/pagar", "/suscripcion/gestionar"]);

const PrecioElegido = z.object({ precioId: z.string().regex(/^price_\w+$/, "Precio no válido.") });
const Exento = z.object({ exento: z.boolean() });

/**
 * Rutas de suscripción. El cliente sólo ve y paga la suya; el coach gestiona
 * la del cliente que ya validó `api` (existe y está activo). Devuelve `null`
 * si la ruta no es de suscripción.
 */
export async function rutaDeSuscripcion(
  request: Request,
  env: EntornoV2,
  ctx: Contexto,
  cliente: string,
  ruta: string,
): Promise<Response | null> {
  if (ruta !== "/suscripcion" && ruta !== "/suscripciones" && ruta !== "/precios" && !ruta.startsWith("/suscripcion/"))
    return null;
  const coach = ctx.rol === "coach";
  const metodo = request.method;
  const origen = new URL(request.url).origin;
  if (coach && cliente.startsWith("coach:") && ruta !== "/suscripciones" && ruta !== "/precios")
    return json({ error: "Elige un cliente." }, 400);
  try {
    if (ruta === "/suscripcion" && metodo === "GET")
      return json({ ...resumir(cliente, await leerSuscripcion(env.ACCESO, cliente)), pagosDisponibles: stripeConfigurado(env) });
    if (coach && ruta === "/suscripciones" && metodo === "GET")
      return json({ suscripciones: await suscripcionesDeClientes(env.ACCESO), pagosDisponibles: stripeConfigurado(env) });
    if (coach && ruta === "/suscripcion/exento" && metodo === "POST") {
      await marcarExento(env.ACCESO, cliente, Exento.parse(await request.json()).exento);
      return json({ ok: true });
    }
    if (metodo !== "POST" && ruta !== "/precios") return json({ error: "Ruta no disponible." }, 404);
    // Las rutas del coach no existen para el cliente, haya Stripe o no.
    if (!coach && !RUTAS_DEL_CLIENTE.has(ruta)) return json({ error: "Ruta no disponible." }, 404);

    const stripe = crearStripe(env);
    if (coach && ruta === "/precios" && metodo === "GET")
      return json({ precios: await listarPrecios(stripe) });
    if (coach && ruta === "/suscripcion/asignar-precio") {
      await asignarPrecio(env.ACCESO, stripe, cliente, PrecioElegido.parse(await request.json()).precioId);
      return json({ ok: true });
    }
    // Pagar: el cliente se abre Checkout; el coach genera el mismo enlace para mandárselo.
    if (ruta === "/suscripcion/pagar" || (coach && ruta === "/suscripcion/enlace-de-pago"))
      return json({ url: await crearPago(env.ACCESO, stripe, cliente, origen) });
    if (!coach && ruta === "/suscripcion/gestionar")
      return json({ url: await crearPortal(env.ACCESO, stripe, cliente, origen) });
    const accion = ACCIONES[ruta];
    if (coach && accion) {
      await accionDelCoach(env.ACCESO, stripe, cliente, accion);
      return json({ ok: true });
    }
    return json({ error: "Ruta no disponible." }, 404);
  } catch (e) {
    if (e instanceof ErrorSuscripcion) return json({ error: e.message }, e.status);
    if (e instanceof z.ZodError) return json({ error: e.issues.map((i) => i.message).join(". ") }, 400);
    if (e instanceof Stripe.errors.StripeError) {
      console.error("SFM Stripe failure", e.type, e.code ?? "");
      return json({ error: "Stripe no respondió. Inténtalo de nuevo en un momento." }, 502);
    }
    throw e;
  }
}

/**
 * Solo lectura: con Stripe encendido, un cliente sin acceso no puede escribir
 * entrenamientos, mediciones ni fotos. Lee su historial con normalidad y el
 * coach nunca queda bloqueado. Con Stripe apagado no se bloquea a nadie:
 * nadie podría pagar.
 */
export async function bloqueoPorSuscripcion(
  env: EntornoV2,
  ctx: Contexto,
  cliente: string,
): Promise<Response | null> {
  if (ctx.rol !== "cliente" || !stripeConfigurado(env)) return null;
  const acceso = estadoDeAcceso(await leerSuscripcion(env.ACCESO, cliente), Math.floor(Date.now() / 1000));
  if (acceso.puedeEntrenar) return null;
  return json(
    { error: "Tu suscripción no está activa. Lo que registres se guarda en este dispositivo hasta que la renueves.", acceso },
    402,
  );
}
