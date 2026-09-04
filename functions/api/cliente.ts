/** API de configuración del participante autenticado.
 *
 * No acepta `cliente_id` desde el navegador. La identidad sale de la sesión
 * opaca validada en D1; el único cliente que puede devolverse es el dueño de
 * esa cookie.
 */

import { leerCookie, validarSesion } from '../lib/sesion'
import { CLIENTE_DE_PRUEBA_ABIERTA, modoPruebaAbierta } from '../lib/modoPrueba'
import {
  asegurarDatosIniciales,
  listarRutinas,
  obtenerPerfil,
  perfilDeSesion,
  type PerfilCloud,
  type RutinaCloud,
} from '../lib/roles'

type Entorno = { readonly ACCESO: D1Database; readonly PUBLIC_TEST_MODE?: string }

export const onRequest: PagesFunction<Entorno> = async ({ request, env }) => {
  if (request.method !== 'GET') {
    return json({ error: 'Método no permitido' }, 405, { Allow: 'GET' })
  }

  /*
   * De quién son los datos que se devuelven.
   *
   * La identidad NUNCA llega del navegador, tampoco en prueba abierta: o sale
   * de la sesión, o es la constante del servidor. Aceptar un `cliente_id` de
   * la URL convertiría el modo de prueba en un visor de fichas ajenas.
   */
  const clienteId = await identidadDelCliente(request, env)
  if (!clienteId) return json({ error: 'Acceso requerido' }, 401)

  await asegurarDatosIniciales(env.ACCESO)
  const perfil = await obtenerPerfil(env.ACCESO, clienteId)
  if (!perfil) return json({ error: 'Cliente no encontrado' }, 404)

  const rutinas = await listarRutinas(env.ACCESO, clienteId)
  const respuesta: ConfiguracionCliente = {
    profile: perfilDeSesion(perfil),
    routines: rutinas,
    preview: leerCookieSimple(request, 'sfm_preview') === '1',
  }

  return json(respuesta, 200)
}

/** La sesión manda; en prueba abierta cae a la identidad fijada en el servidor. */
async function identidadDelCliente(
  peticion: Request,
  env: Entorno,
): Promise<string | null> {
  const cookie = leerCookie(peticion)
  const sesion = cookie ? await validarSesion(env.ACCESO, cookie) : null
  if (sesion) return sesion.clienteId

  return modoPruebaAbierta(env) ? CLIENTE_DE_PRUEBA_ABIERTA : null
}

export type ConfiguracionCliente = {
  profile: PerfilCloud
  routines: RutinaCloud[]
  preview: boolean
}

function json(body: unknown, status: number, extras: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      ...extras,
    },
  })
}

function leerCookieSimple(request: Request, nombre: string): string | null {
  const cabecera = request.headers.get('Cookie')
  if (!cabecera) return null
  for (const trozo of cabecera.split(';')) {
    const separador = trozo.indexOf('=')
    if (separador !== -1 && trozo.slice(0, separador).trim() === nombre) {
      return trozo.slice(separador + 1).trim() || null
    }
  }
  return null
}
