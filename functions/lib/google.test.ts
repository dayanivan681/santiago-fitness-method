import { afterEach, describe, expect, it } from 'vitest'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'
import { sqliteD1 } from '../../pruebas-v2/d1'
import { crearInvitacion } from './invitacion'
import { googleConfigurado, iniciarGoogle, terminarGoogle, verificarGoogleId } from './google'
import { registrarConInvitacion } from './cuentas'
import { NOMBRE_DE_COOKIE } from './sesion'
import { autenticar, esCorreoDeCoach, type EntornoV2 } from './v2/seguridad'

const clienteId = 'cliente-google-test'
const secreto = 'secret-for-local-test'

async function firma(email: string, verificado = true, audiencia = clienteId, nonce?: string) {
  const { publicKey, privateKey } = await generateKeyPair('RS256')
  const jwk = { ...await exportJWK(publicKey), kid: 'prueba', alg: 'RS256' }
  const clave = createLocalJWKSet({ keys: [jwk] })
  const token = await new SignJWT({ email, email_verified: verificado, ...(nonce ? { nonce } : {}) })
    .setProtectedHeader({ alg: 'RS256', kid: 'prueba' }).setIssuer('https://accounts.google.com')
    .setAudience(audiencia).setSubject('google-sub-sintetico').setIssuedAt().setExpirationTime('5m').sign(privateKey)
  return { token, clave }
}

describe('identidad de Google', () => {
  it('mantiene producción apagada hasta habilitarla después del preview', () => {
    const secretos = { GOOGLE_CLIENT_ID: clienteId, GOOGLE_CLIENT_SECRET: secreto }
    expect(googleConfigurado({ ...secretos, SFM_ENV: 'production' })).toBe(false)
    expect(googleConfigurado({ ...secretos, SFM_ENV: 'production', GOOGLE_HABILITADO: 'true' })).toBe(true)
    expect(googleConfigurado({ ...secretos, SFM_ENV: 'staging' })).toBe(true)
  })
  it('acepta sólo firma, audiencia y email verificado', async () => {
    const valido = await firma('Persona@Ejemplo.test')
    expect(await verificarGoogleId(valido.token, clienteId, valido.clave))
      .toEqual({ sub: 'google-sub-sintetico', email: 'persona@ejemplo.test' })
    expect(await verificarGoogleId(valido.token, 'otro-cliente', valido.clave)).toBeNull()
    expect(await verificarGoogleId(valido.token, clienteId, valido.clave, 'nonce-falso')).toBeNull()
    const sinVerificar = await firma('persona@ejemplo.test', false)
    expect(await verificarGoogleId(sinVerificar.token, clienteId, sinVerificar.clave)).toBeNull()
  })
})

describe('código OAuth y PKCE', () => {
  const bases: ReturnType<typeof sqliteD1>[] = []
  afterEach(() => { while (bases.length) bases.pop()!.cerrar() })

  it('consume la invitación una vez y luego entra por google_sub', async () => {
    const local = sqliteD1(); bases.push(local)
    const env = { ACCESO: local.db, GOOGLE_CLIENT_ID: clienteId, GOOGLE_CLIENT_SECRET: secreto }
    const invitacion = await crearInvitacion(local.db, 'santiago')
    const origen = 'https://santiago-fitness-method.pages.dev'
    const start = await iniciarGoogle(new Request(`${origen}/auth/google?origen=invitacion&t=${invitacion.token}`), env)
    expect(start?.status).toBe(302)
    const urlGoogle = new URL(start!.headers.get('Location')!)
    expect(urlGoogle.searchParams.get('code_challenge_method')).toBe('S256')
    expect(urlGoogle.searchParams.get('redirect_uri')).toBe(`${origen}/auth/google/retorno`)
    const cookie = start!.headers.get('Set-Cookie')!.split(';')[0]
    const firmado = await firma('google@example.test', true, clienteId, urlGoogle.searchParams.get('nonce')!)
    const intercambio = async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = new URLSearchParams(String(init?.body))
      expect(body.get('code_verifier')).toMatch(/^[\w-]{43}$/)
      return new Response(JSON.stringify({ id_token: firmado.token }), { status: 200 })
    }
    const callback = new Request(`${origen}/auth/google/retorno?state=${urlGoogle.searchParams.get('state')}&code=un-codigo`,
      { headers: { Cookie: cookie } })
    expect(await terminarGoogle(callback, env, firmado.clave, intercambio)).toMatchObject({ ok: true })
    expect(await iniciarGoogle(new Request(`${origen}/auth/google?origen=invitacion&t=${invitacion.token}`), env)).toBeNull()

    const nuevo = await iniciarGoogle(new Request(`${origen}/auth/google?origen=entrar`), env)
    const nuevoUrl = new URL(nuevo!.headers.get('Location')!)
    const firmadoNuevo = await firma('google@example.test', true, clienteId, nuevoUrl.searchParams.get('nonce')!)
    const retorno = new Request(`${origen}/auth/google/retorno?state=${nuevoUrl.searchParams.get('state')}&code=otro-codigo`,
      { headers: { Cookie: nuevo!.headers.get('Set-Cookie')!.split(';')[0] } })
    const intercambioNuevo = async () => new Response(JSON.stringify({ id_token: firmadoNuevo.token }), { status: 200 })
    expect((await terminarGoogle(retorno, env, firmadoNuevo.clave, intercambioNuevo)).ok).toBe(true)
    expect((await terminarGoogle(new Request(`${origen}/auth/google/retorno?state=falso&code=otro`,
      { headers: { Cookie: cookie } }), env, firmado.clave, intercambio)).ok).toBe(false)
  })

  it('exige la sesión con contraseña antes de vincular un email no verificado', async () => {
    const local = sqliteD1(); bases.push(local)
    const env = { ACCESO: local.db, GOOGLE_CLIENT_ID: clienteId, GOOGLE_CLIENT_SECRET: secreto }
    const invitacion = await crearInvitacion(local.db, 'santiago')
    const claveSesion = await registrarConInvitacion(local.db, invitacion.token, 'sin-verificar@example.test', 'Clave-de-prueba-123')
    expect(claveSesion).toBeTruthy()
    const origen = 'https://santiago-fitness-method.pages.dev'
    const iniciar = async (origenGoogle: 'entrar' | 'enlazar', cookie?: string) => {
      const respuesta = await iniciarGoogle(new Request(`${origen}/auth/google?origen=${origenGoogle}`,
        { headers: cookie ? { Cookie: `${NOMBRE_DE_COOKIE}=${cookie}` } : {} }), env)
      expect(respuesta?.status).toBe(302)
      const url = new URL(respuesta!.headers.get('Location')!)
      const firmado = await firma('sin-verificar@example.test', true, clienteId, url.searchParams.get('nonce')!)
      const cabecera = `${respuesta!.headers.get('Set-Cookie')!.split(';')[0]}${cookie ? `; ${NOMBRE_DE_COOKIE}=${cookie}` : ''}`
      const callback = new Request(`${origen}/auth/google/retorno?state=${url.searchParams.get('state')}&code=local`,
        { headers: { Cookie: cabecera } })
      return terminarGoogle(callback, env, firmado.clave,
        async () => new Response(JSON.stringify({ id_token: firmado.token }), { status: 200 }))
    }
    const contexto = () => autenticar(new Request(`${origen}/api/v2/contexto`,
      { headers: { Cookie: `${NOMBRE_DE_COOKIE}=${claveSesion}` } }), env as unknown as EntornoV2, 'cliente')
    expect((await contexto())?.googleVinculado).toBe(false)
    // Sin cuenta vinculada no entra, pero se sabe qué correo verificó Google.
    expect(await iniciar('entrar')).toEqual({ ok: false, email: 'sin-verificar@example.test' })
    expect((await iniciar('enlazar', claveSesion!)).ok).toBe(true)
    expect((await iniciar('entrar')).ok).toBe(true)
    // El perfil deja de ofrecer «Conectar Google» cuando la cuenta ya lo tiene.
    expect((await contexto())?.googleVinculado).toBe(true)
  })
})

describe('correo del coach al entrar con Google', () => {
  it('sólo reconoce los correos de COACH_EMAILS, sin importar mayúsculas ni espacios', () => {
    const lista = 'yayo1716@gmail.com, SaAngelM50@gmail.com'
    expect(esCorreoDeCoach(lista, 'saangelm50@gmail.com')).toBe(true)
    expect(esCorreoDeCoach(lista, 'YAYO1716@gmail.com')).toBe(true)
    expect(esCorreoDeCoach(lista, 'otro@gmail.com')).toBe(false)
    expect(esCorreoDeCoach(undefined, 'yayo1716@gmail.com')).toBe(false)
    expect(esCorreoDeCoach('', '')).toBe(false)
  })
})
