import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose'
import { resumen, tokenNuevo } from './cripto'
import { normalizarEmail } from './cuentas'
import { ahoraEnSegundos, estadoDeInvitacion } from './invitacion'
import { crearSesionDeCuenta, leerCookie, validarSesion, VIDA_DE_SESION } from './sesion'

export type GoogleEnv = { ACCESO: D1Database; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; GOOGLE_HABILITADO?: string; SFM_ENV?: string }
export type OrigenGoogle = 'invitacion' | 'entrar' | 'enlazar'
type Estado = { state: string; verifier: string; nonce: string; origen: OrigenGoogle; token?: string; creadoEn: number }
export type IdentidadGoogle = { sub: string; email: string }

const COOKIE = 'sfm_google'
const VIDA_ESTADO = 10 * 60
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export function googleConfigurado(env: GoogleEnv | Pick<GoogleEnv, 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET' | 'GOOGLE_HABILITADO' | 'SFM_ENV'>): env is GoogleEnv & { GOOGLE_CLIENT_ID: string; GOOGLE_CLIENT_SECRET: string } {
  return !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET &&
    (env.SFM_ENV !== 'production' || env.GOOGLE_HABILITADO === 'true')
}

function base64url(valor: string): string {
  return btoa(valor).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function leerEstado(request: Request): Estado | null {
  const valor = request.headers.get('Cookie')?.split(';').map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1)
  if (!valor || valor.length > 1024) return null
  try {
    const json = atob(valor.replace(/-/g, '+').replace(/_/g, '/'))
    const dato: unknown = JSON.parse(json)
    if (!dato || typeof dato !== 'object') return null
    const e = dato as Partial<Estado>
    if (!e.state || !e.verifier || !e.nonce || !e.creadoEn || !['invitacion', 'entrar', 'enlazar'].includes(e.origen ?? '')) return null
    return e as Estado
  } catch { return null }
}

export function borrarEstadoGoogle(): string {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/auth/google; Max-Age=0`
}

function cookieEstado(estado: Estado): string {
  return `${COOKIE}=${base64url(JSON.stringify(estado))}; HttpOnly; Secure; SameSite=Lax; Path=/auth/google; Max-Age=${VIDA_ESTADO}`
}

export async function verificarGoogleId(token: string, clientId: string, clave: JWTVerifyGetKey = JWKS, nonce?: string): Promise<IdentidadGoogle | null> {
  try {
    const { payload } = await jwtVerify(token, clave, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
      algorithms: ['RS256'],
      requiredClaims: ['exp', 'iat', 'sub', 'email', 'email_verified'],
    })
    const email = typeof payload.email === 'string' ? normalizarEmail(payload.email) : null
    return payload.email_verified === true && (!nonce || payload.nonce === nonce) &&
      (!payload.azp || payload.azp === clientId) && typeof payload.sub === 'string' && payload.sub.length > 0 && email
      ? { sub: payload.sub, email } : null
  } catch { return null }
}

export async function iniciarGoogle(request: Request, env: GoogleEnv): Promise<Response | null> {
  if (!googleConfigurado(env)) return null
  const url = new URL(request.url)
  const origen = url.searchParams.get('origen')
  if (origen !== 'invitacion' && origen !== 'entrar' && origen !== 'enlazar') return null
  const token = url.searchParams.get('t') ?? ''
  if (origen === 'invitacion' && (token.length !== 43 || await estadoDeInvitacion(env.ACCESO, token) !== 'valida')) return null
  if (origen === 'enlazar') {
    const cookie = leerCookie(request)
    if (!cookie || !await validarSesion(env.ACCESO, cookie)) return null
  }
  const state = tokenNuevo()
  const verifier = tokenNuevo()
  const nonce = tokenNuevo()
  const challenge = await resumen(verifier)
  const challengeBytes = Uint8Array.from(challenge.match(/.{2}/g)!, (v) => parseInt(v, 16))
  const codeChallenge = btoa(String.fromCharCode(...challengeBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const destino = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  destino.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${url.origin}/auth/google/retorno`,
    response_type: 'code', scope: 'openid email profile', state, nonce,
    code_challenge: codeChallenge, code_challenge_method: 'S256',
  }).toString()
  const estado: Estado = { state, verifier, nonce, origen, creadoEn: ahoraEnSegundos(), ...(origen === 'invitacion' ? { token } : {}) }
  return new Response(null, { status: 302, headers: {
    Location: destino.toString(), 'Set-Cookie': cookieEstado(estado),
    'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
  } })
}

async function registrarGoogle(db: D1Database, token: string, identidad: IdentidadGoogle, ahora: number): Promise<string | null> {
  const tokenHash = await resumen(token)
  const cookie = tokenNuevo()
  const sessionHash = await resumen(cookie)
  await db.batch([
    db.prepare(`INSERT OR IGNORE INTO cuentas(cliente_id,email,google_sub,creada_en,ultimo_acceso_en)
      SELECT i.cliente_id,?2,?3,?4,?4 FROM invitaciones i JOIN clientes c ON c.id=i.cliente_id
      WHERE i.token_hash=?1 AND i.consumida_en IS NULL AND i.revocada_en IS NULL AND i.expira_en>?4 AND c.activo=1`)
      .bind(tokenHash, identidad.email, identidad.sub, ahora),
    db.prepare(`INSERT INTO sesiones(id,cliente_id,invitacion,creada_en,expira_en)
      SELECT ?1,i.cliente_id,i.token_hash,?3,?4 FROM invitaciones i JOIN cuentas a ON a.cliente_id=i.cliente_id
      WHERE i.token_hash=?2 AND i.consumida_en IS NULL AND i.revocada_en IS NULL AND i.expira_en>?3
        AND a.google_sub=?5 AND a.email=?6`)
      .bind(sessionHash, tokenHash, ahora, ahora + VIDA_DE_SESION, identidad.sub, identidad.email),
    db.prepare('UPDATE invitaciones SET consumida_en=? WHERE token_hash=? AND EXISTS(SELECT 1 FROM sesiones WHERE id=?)')
      .bind(ahora, tokenHash, sessionHash),
  ])
  return await db.prepare('SELECT id FROM sesiones WHERE id=?').bind(sessionHash).first() ? cookie : null
}

async function entrarGoogle(db: D1Database, identidad: IdentidadGoogle, ahora: number): Promise<string | null> {
  const cuenta = await db.prepare(`SELECT a.cliente_id FROM cuentas a JOIN clientes c ON c.id=a.cliente_id
    WHERE a.google_sub=? AND c.activo=1`).bind(identidad.sub).first<{ cliente_id: string }>()
  if (!cuenta) return null
  const sesion = await crearSesionDeCuenta(db, cuenta.cliente_id, ahora)
  await db.prepare('UPDATE cuentas SET ultimo_acceso_en=? WHERE cliente_id=?').bind(ahora, cuenta.cliente_id).run()
  return sesion.cookie
}

async function enlazarGoogle(db: D1Database, request: Request, identidad: IdentidadGoogle): Promise<boolean> {
  const cookie = leerCookie(request)
  const sesion = cookie ? await validarSesion(db, cookie) : null
  if (!sesion) return false
  const cuenta = await db.prepare(`SELECT a.email,a.google_sub FROM cuentas a JOIN clientes c ON c.id=a.cliente_id
    WHERE a.cliente_id=? AND c.activo=1`).bind(sesion.clienteId).first<{ email: string; google_sub: string | null }>()
  if (!cuenta || cuenta.email !== identidad.email || (cuenta.google_sub && cuenta.google_sub !== identidad.sub)) return false
  await db.prepare('UPDATE cuentas SET google_sub=? WHERE cliente_id=? AND (google_sub IS NULL OR google_sub=?)')
    .bind(identidad.sub, sesion.clienteId, identidad.sub).run()
  return true
}

/** `email` sólo aparece si Google verificó la identidad pero no hay cuenta de cliente vinculada. */
export async function terminarGoogle(request: Request, env: GoogleEnv, clave?: JWTVerifyGetKey, intercambiar = fetch): Promise<{ cookie?: string; ok: boolean; email?: string }> {
  if (!googleConfigurado(env)) return { ok: false }
  const url = new URL(request.url)
  const estado = leerEstado(request)
  const ahora = ahoraEnSegundos()
  if (!estado || estado.creadoEn > ahora || estado.creadoEn <= ahora - VIDA_ESTADO ||
      url.searchParams.get('state') !== estado.state || !url.searchParams.get('code')) return { ok: false }
  const respuesta = await intercambiar('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code: url.searchParams.get('code')!, client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: `${url.origin}/auth/google/retorno`,
      grant_type: 'authorization_code', code_verifier: estado.verifier }),
  })
  if (!respuesta.ok) return { ok: false }
  const datos: unknown = await respuesta.json()
  const idToken = datos && typeof datos === 'object' && 'id_token' in datos ? (datos as { id_token: unknown }).id_token : null
  const identidad = typeof idToken === 'string' ? await verificarGoogleId(idToken, env.GOOGLE_CLIENT_ID, clave, estado.nonce) : null
  if (!identidad) return { ok: false }
  if (estado.origen === 'enlazar') return { ok: await enlazarGoogle(env.ACCESO, request, identidad) }
  const cookie = estado.origen === 'invitacion' && estado.token
    ? await registrarGoogle(env.ACCESO, estado.token, identidad, ahora)
    : await entrarGoogle(env.ACCESO, identidad, ahora)
  if (cookie) return { ok: true, cookie }
  return estado.origen === 'entrar' ? { ok: false, email: identidad.email } : { ok: false }
}
