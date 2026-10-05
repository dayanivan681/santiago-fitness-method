import { afterEach, describe, expect, it } from 'vitest'
import { exportJWK, generateKeyPair, SignJWT } from 'jose'
import { sqliteD1 } from '../../pruebas-v2/d1'
import { onRequest } from '../_middleware'
import { api } from './v2/api'
import { crearSesion, renovarSesion, validarSesion, VIDA_DE_SESION } from './sesion'
import { consumirInvitacion, crearInvitacion } from './invitacion'
import { paginaLogin } from './paginas'
import type { EntornoV2 } from './v2/seguridad'

/**
 * Login simple y sesión que no se pierde: el coach con Access vigente no vuelve
 * a ver el login de clientes, y la sesión del cliente dura 90 días renovables.
 */

const bases: ReturnType<typeof sqliteD1>[] = []
afterEach(() => { while (bases.length) bases.pop()!.cerrar() })
const nuevaBase = () => { const b = sqliteD1(); bases.push(b); return b }

const html = async () => new Response('<!doctype html><div id="root"></div>', { headers: { 'Content-Type': 'text/html' } })
const pedir = (ruta: string, env: object, cookie?: string) =>
  onRequest({
    request: new Request(`http://localhost${ruta}`, cookie ? { headers: { Cookie: cookie } } : {}),
    env,
    next: html,
  } as unknown as Parameters<typeof onRequest>[0])

/** Un emisor de Access de pruebas con su JWKS local y tokens a medida. */
async function access() {
  const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true })
  const jwk = { ...(await exportJWK(publicKey)), alg: 'RS256', kid: 'qa' }
  const env = {
    ACCESS_ISSUER: 'https://sfm-qa.cloudflareaccess.com',
    ACCESS_AUD: 'aud-coach',
    SFM_ENV: 'local',
    LOCAL_ACCESS_JWKS: JSON.stringify({ keys: [jwk] }),
    COACH_EMAILS: 'coach@test.invalid',
  }
  const token = ({ email = 'coach@test.invalid', aud = 'aud-coach', exp = Math.floor(Date.now() / 1000) + 3600 } = {}) =>
    new SignJWT({ email })
      .setProtectedHeader({ alg: 'RS256', kid: 'qa' })
      .setSubject('coach')
      .setIssuedAt()
      .setIssuer(env.ACCESS_ISSUER)
      .setAudience(aud)
      .setExpirationTime(exp)
      .sign(privateKey)
  return { env, token }
}

async function clienteConSesion(local: ReturnType<typeof sqliteD1>, ahora = Math.floor(Date.now() / 1000)) {
  local.ejecutar(`INSERT INTO cuentas(cliente_id,email,creada_en) VALUES('santiago','santiago@example.test',${ahora})`)
  const invitacion = await crearInvitacion(local.db, 'santiago', ahora)
  const consumida = await consumirInvitacion(local.db, invitacion.token, ahora)
  return crearSesion(local.db, 'santiago', consumida!.tokenHash, ahora)
}

describe('el coach con Access vigente no ve el login de clientes', () => {
  it('en «/» con CF_Authorization válido de coach va a /admin/', async () => {
    const { env, token } = await access()
    const r = await pedir('/', { ...env, ACCESO: nuevaBase().db }, `CF_Authorization=${await token()}`)
    expect(r.status).toBe(302)
    expect(r.headers.get('Location')).toBe('/admin/')
  })

  it('en «/entrar» también va directo a /admin/', async () => {
    const { env, token } = await access()
    const r = await pedir('/entrar', { ...env, ACCESO: nuevaBase().db }, `CF_Authorization=${await token()}`)
    expect(r.status).toBe(302)
    expect(r.headers.get('Location')).toBe('/admin/')
  })

  it.each([
    ['caducado', { exp: Math.floor(Date.now() / 1000) - 60 }],
    ['de otra audiencia', { aud: 'otra-app' }],
    ['de un correo que no es de coach', { email: 'alguien@test.invalid' }],
  ])('un token %s no redirige al panel: «/» va a /entrar y /entrar enseña el login', async (_caso, opciones) => {
    const { env, token } = await access()
    const cookie = `CF_Authorization=${await token(opciones)}`
    const raiz = await pedir('/', { ...env, ACCESO: nuevaBase().db }, cookie)
    expect(raiz.headers.get('Location')).toBe('/entrar')
    const entrar = await pedir('/entrar', { ...env, ACCESO: nuevaBase().db }, cookie)
    expect(entrar.status).toBe(200)
    expect(await entrar.text()).toContain('Entra a tu cuenta')
  })

  it('un token inventado tampoco', async () => {
    const { env } = await access()
    const r = await pedir('/', { ...env, ACCESO: nuevaBase().db }, 'CF_Authorization=inventado')
    expect(r.headers.get('Location')).toBe('/entrar')
  })

  it('con cookie de cliente válida, «/» sirve la app como siempre', async () => {
    const { env, token } = await access()
    const local = nuevaBase()
    const sesion = await clienteConSesion(local)
    const r = await pedir('/', { ...env, ACCESO: local.db }, `sfm_sesion=${sesion.cookie}; CF_Authorization=${await token()}`)
    expect(r.status).toBe(200)
    expect(await r.text()).toContain('id="root"')
  })
})

describe('sesión del cliente: 90 días que se renuevan al usar la app', () => {
  // El doble de D1 de las pruebas siempre informa de un cambio: se mira la
  // caducidad guardada, no lo que devuelve renovarSesion.
  const caducidad = async (local: ReturnType<typeof sqliteD1>, cookie: string, ahora: number) =>
    (await validarSesion(local.db, cookie, ahora))?.expiraEn

  it('se renueva a media vida, no antes', async () => {
    const local = nuevaBase()
    const sesion = await clienteConSesion(local, 1000)
    const antes = 1000 + VIDA_DE_SESION / 2 - 10
    await renovarSesion(local.db, sesion.cookie, antes)
    expect(await caducidad(local, sesion.cookie, antes)).toBe(1000 + VIDA_DE_SESION)
    const despues = 1000 + VIDA_DE_SESION / 2 + 10
    await renovarSesion(local.db, sesion.cookie, despues)
    expect(await caducidad(local, sesion.cookie, despues)).toBe(despues + VIDA_DE_SESION)
  })

  it('una cuenta archivada no se renueva', async () => {
    const local = nuevaBase()
    const sesion = await clienteConSesion(local, 1000)
    local.ejecutar("UPDATE clientes SET activo=0 WHERE id='santiago'")
    const despues = 1000 + VIDA_DE_SESION / 2 + 10
    await renovarSesion(local.db, sesion.cookie, despues)
    expect(await caducidad(local, sesion.cookie, despues)).toBe(1000 + VIDA_DE_SESION)
  })

  it('la primera llamada de la app instalada (/api/v2/contexto) también renueva', async () => {
    const local = nuevaBase()
    const ahora = Math.floor(Date.now() / 1000)
    // Creada hace 50 días: le quedan 40 de 90, menos de la mitad.
    const sesion = await clienteConSesion(local, ahora - 50 * 24 * 60 * 60)
    const r = await api(
      new Request('http://localhost/api/v2/contexto', { headers: { Cookie: `sfm_sesion=${sesion.cookie}` } }),
      { ACCESO: local.db, SFM_ENV: 'local' } as EntornoV2,
    )
    expect(r.status).toBe(200)
    expect(r.headers.get('Set-Cookie')).toContain('Max-Age=7776000')
    // Y de verdad se movió la caducidad: vuelve a quedar casi entera.
    expect(await caducidad(local, sesion.cookie, ahora)).toBeGreaterThanOrEqual(ahora + VIDA_DE_SESION - 5)
  })
})

describe('pantalla de entrada', () => {
  it('con Google, «Continuar con Google» es lo primero y el email va plegado', async () => {
    const pagina = await paginaLogin(false, true).text()
    expect(pagina).toContain('<h1>Entra a tu cuenta</h1>')
    expect(pagina.indexOf('Continuar con Google')).toBeLessThan(pagina.indexOf('Entrar con email'))
    expect(pagina.indexOf('Continuar con Google')).toBeLessThan(pagina.indexOf('<form'))
    expect(pagina).toMatch(/<details class="con-email"><summary>Entrar con email<\/summary>/)
  })

  it('sin Google, los campos se ven sin desplegar nada', async () => {
    const pagina = await paginaLogin(false, false).text()
    expect(pagina).not.toContain('<details')
    expect(pagina).not.toContain('Continuar con Google')
    expect(pagina).toContain('<form method="POST" action="/entrar">')
  })

  it('tras un intento fallido, el email vuelve abierto y el error se entiende', async () => {
    const r = paginaLogin(true, true)
    const pagina = await r.text()
    expect(r.status).toBe(401)
    expect(pagina).toContain('<details class="con-email" open>')
    expect(pagina).toContain('Revisa tu email y tu contraseña')
  })

  it('campos pensados para el teléfono, demo y «Soy el coach» en el pie, sin scripts', async () => {
    const r = paginaLogin(false, true)
    const pagina = await r.text()
    expect(pagina).toContain('inputmode="email"')
    expect(pagina).toContain('autocomplete="current-password"')
    expect(pagina).toContain('autocapitalize="off"')
    expect(pagina).toContain('<a href="/demo">Explorar la demo</a>')
    expect(pagina).toContain('<a href="/admin">Soy el coach</a>')
    expect(pagina).toContain('¿Olvidaste tu contraseña? Pídele a tu coach un enlace nuevo.')
    expect(pagina).not.toContain('<script')
    expect(r.headers.get('Content-Security-Policy')).toContain("default-src 'none'")
  })
})
