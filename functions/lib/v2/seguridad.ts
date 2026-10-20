import {
  createRemoteJWKSet,
  createLocalJWKSet,
  jwtVerify,
  type JWTVerifyGetKey,
} from "jose";
import { leerCookie, leerCookieNombrada, validarSesion } from "../sesion";
import type { Contexto } from "../../../shared/v2/contratos";
import { googleConfigurado } from "../google";
export type EntornoV2 = {
  ACCESO: D1Database;
  ASSETS: Fetcher;
  FOTOS?: R2Bucket;
  ACCESS_ISSUER?: string;
  ACCESS_AUD?: string;
  SFM_ENV?: string;
  COACH_EMAILS?: string;
  LOCAL_ACCESS_JWKS?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_HABILITADO?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_HABILITADO?: string;
  STRIPE_MODO_REAL?: string;
};
const claves = new Map<string, JWTVerifyGetKey>();
type EntornoDeAccess = Pick<
  EntornoV2,
  "ACCESS_ISSUER" | "ACCESS_AUD" | "LOCAL_ACCESS_JWKS" | "SFM_ENV"
>;

/**
 * Verifica un JWT de Cloudflare Access: emisor, audiencia, RS256, caducidad y
 * claves del JWKS del equipo. Es la parte común de las dos vías por las que
 * llega el token (cabecera en `/admin`, cookie en el resto del dominio).
 */
async function verificarTokenDeAccess(
  token: string | null,
  request: Request,
  env: EntornoDeAccess,
  obtenerClave?: JWTVerifyGetKey,
) {
  if (
    !env.ACCESS_ISSUER ||
    !env.ACCESS_AUD ||
    !/^https:\/\/[\w-]+\.cloudflareaccess\.com$/.test(env.ACCESS_ISSUER)
  )
    return null;
  if (!token) return null;
  try {
    const local =
      env.SFM_ENV === "local" &&
      ["localhost", "127.0.0.1"].includes(new URL(request.url).hostname) &&
      env.LOCAL_ACCESS_JWKS
        ? createLocalJWKSet(JSON.parse(env.LOCAL_ACCESS_JWKS))
        : undefined;
    let clave = obtenerClave ?? local ?? claves.get(env.ACCESS_ISSUER);
    if (!clave) {
      clave = createRemoteJWKSet(
        new URL(`${env.ACCESS_ISSUER}/cdn-cgi/access/certs`),
      );
      claves.set(env.ACCESS_ISSUER, clave);
    }
    const { payload } = await jwtVerify(token, clave, {
      issuer: env.ACCESS_ISSUER,
      audience: env.ACCESS_AUD,
      algorithms: ["RS256"],
      requiredClaims: ["exp", "iat", "sub", "email"],
    });
    if (typeof payload.email !== "string" || !payload.sub || !payload.exp)
      return null;
    return {
      identidad: payload.email.toLowerCase(),
      expiraEn: payload.exp * 1000,
    };
  } catch {
    return null;
  }
}

/** El coach en `/admin`: Access le añade el JWT en `Cf-Access-Jwt-Assertion`. */
export async function verificarCoach(
  request: Request,
  env: EntornoDeAccess,
  obtenerClave?: JWTVerifyGetKey,
) {
  return verificarTokenDeAccess(
    request.headers.get("Cf-Access-Jwt-Assertion"),
    request,
    env,
    obtenerClave,
  );
}

/**
 * El coach fuera de `/admin` (en `/` o `/entrar`), donde Access no añade la
 * cabecera pero su cookie `CF_Authorization` sí llega. Sólo sirve para
 * redirigirle a `/admin/` en vez de enseñarle el login de clientes: no abre
 * nada, `/admin` sigue protegido por Access y por `verificarCoach`.
 */
export async function verificarCoachPorCookie(
  request: Request,
  env: EntornoDeAccess & Pick<EntornoV2, "COACH_EMAILS">,
  obtenerClave?: JWTVerifyGetKey,
) {
  const coach = await verificarTokenDeAccess(
    leerCookieNombrada(request, "CF_Authorization"),
    request,
    env,
    obtenerClave,
  );
  return coach && esCorreoDeCoach(env.COACH_EMAILS, coach.identidad) ? coach : null;
}
/** El correo está en COACH_EMAILS (lista separada por comas, sin distinguir mayúsculas). */
export function esCorreoDeCoach(lista: string | undefined, email: string): boolean {
  const buscado = email.trim().toLowerCase();
  if (!buscado) return false;
  return (lista ?? "").toLowerCase().split(",").map((v) => v.trim()).includes(buscado);
}
export function origenSeguro(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  return (
    request.headers.get("Origin") === new URL(request.url).origin &&
    request.headers.get("Sec-Fetch-Site") !== "cross-site"
  );
}
export async function autenticar(
  request: Request,
  env: EntornoV2,
  rol: "cliente" | "coach",
): Promise<Contexto | null> {
  const entorno =
    env.SFM_ENV === "production"
      ? "production"
      : env.SFM_ENV === "staging"
        ? "staging"
        : "local";
  if (rol === "coach") {
    const coach = await verificarCoach(request, env);
    if (!coach) return null;
    if (!esCorreoDeCoach(env.COACH_EMAILS, coach.identidad)) return null;
    return {
      ...coach,
      rol,
      nombre: "Coach",
      validadoEn: Date.now(),
      entorno,
      medios: !!env.FOTOS,
    };
  }
  const cookie = leerCookie(request);
  const sesion = cookie ? await validarSesion(env.ACCESO, cookie) : null;
  if (!sesion) return null;
  const cliente = await env.ACCESO.prepare(
    `SELECT c.nombre, cu.google_sub IS NOT NULL AS google
     FROM clientes c LEFT JOIN cuentas cu ON cu.cliente_id=c.id
     WHERE c.id=? AND c.activo=1`,
  )
    .bind(sesion.clienteId)
    .first<{ nombre: string; google: number }>();
  if (!cliente) return null;
  // validarSesion exige una invitación ligada a la sesión. Las sesiones
  // históricas de preview sin invitación no se convierten en acceso real.
  return {
    rol,
    identidad: sesion.clienteId,
    nombre: cliente.nombre,
    expiraEn: sesion.expiraEn * 1000,
    validadoEn: Date.now(),
    entorno,
    medios: !!env.FOTOS,
    googleDisponible: googleConfigurado(env),
    googleVinculado: cliente.google === 1,
  };
}
/**
 * ¿El navegador ya tiene esta versión? Comparación débil (RFC 9110): al
 * comprimir, Cloudflare convierte `"x"` en `W/"x"`, y el navegador devuelve esa
 * forma; con una comparación literal el 304 no saldría nunca en producción.
 */
export function yaLaTiene(request: Request, etiqueta: string): boolean {
  const cabecera = request.headers.get("If-None-Match");
  if (!cabecera) return false;
  const sinDebil = (e: string) => e.trim().replace(/^W\//, "");
  return cabecera.split(",").some((e) => e.trim() === "*" || sinDebil(e) === sinDebil(etiqueta));
}
export function json(datos: unknown, status = 200) {
  return new Response(JSON.stringify(datos), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
