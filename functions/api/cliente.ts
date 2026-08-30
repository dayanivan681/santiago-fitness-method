/** API de configuración del participante autenticado.
 *
 * No acepta `cliente_id` desde el navegador. La identidad sale de la sesión
 * opaca validada en D1; el único cliente que puede devolverse es el dueño de
 * esa cookie.
 */

import { leerCookie, validarSesion } from '../lib/sesion'
import {
  asegurarDatosIniciales,
  listarRutinas,
  obtenerPerfil,
  perfilDeSesion,
  type PerfilCloud,
  type RutinaCloud,
} from '../lib/roles'

type Entorno = { readonly ACCESO: D1Database }

export const onRequest: PagesFunction<Entorno> = async ({ request, env }) => {
  if (request.method !== 'GET') {
    return json({ error: 'Método no permitido' }, 405, { Allow: 'GET' })
  }

  const cookie = leerCookie(request)
  if (!cookie) return json({ error: 'Acceso requerido' }, 401)

  const sesion = await validarSesion(env.ACCESO, cookie)
  if (!sesion) return json({ error: 'Acceso requerido' }, 401)

  await asegurarDatosIniciales(env.ACCESO)
  const perfil = await obtenerPerfil(env.ACCESO, sesion.clienteId)
  if (!perfil) return json({ error: 'Cliente no encontrado' }, 404)

  const rutinas = await listarRutinas(env.ACCESO, sesion.clienteId)
  const respuesta: ConfiguracionCliente = {
    profile: perfilDeSesion(perfil),
    routines: rutinas,
    preview: leerCookieSimple(request, 'sfm_preview') === '1',
  }

  return json(respuesta, 200)
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
