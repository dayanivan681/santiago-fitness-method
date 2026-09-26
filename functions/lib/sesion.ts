/**
 * Sesiones del navegador.
 *
 * La cookie es opaca: 32 bytes aleatorios y nada más. No es un JWT a propósito.
 * Un JWT se valida sin tocar la base de datos, pero por eso mismo no se puede
 * revocar hasta que caduca; aquí revocar tiene que surtir efecto en la
 * siguiente petición. Una consulta a D1 cuesta menos de un milisegundo.
 *
 * En la base sólo queda el SHA-256 de la cookie, igual que con las invitaciones.
 */

import { resumen, tokenNuevo } from './cripto'
import { ahoraEnSegundos } from './invitacion'

export const NOMBRE_DE_COOKIE = 'sfm_sesion'

/** Vigencia de una sesión, en segundos. */
export const VIDA_DE_SESION = 30 * 24 * 60 * 60

export type Sesion = {
  readonly clienteId: string
  readonly expiraEn: number
}

export function crearCabeceraDeCookie(valor: string, maxAge: number): string {
  // SameSite=Lax y no Strict: con Strict, volver a la app tocando el enlace
  // guardado en un chat no enviaría la cookie y la sesión parecería caducada.
  // Lax la manda en navegaciones de nivel superior y sigue bloqueando
  // peticiones entre sitios.
  return [
    `${NOMBRE_DE_COOKIE}=${valor}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAge}`,
  ].join('; ')
}

export function cabeceraDeCookieBorrada(): string {
  return crearCabeceraDeCookie('', 0)
}

/** Lee la cookie de sesión de la petición. `null` si no viene. */
export function leerCookie(peticion: Request): string | null {
  const cabecera = peticion.headers.get('Cookie')
  if (!cabecera) return null

  for (const trozo of cabecera.split(';')) {
    const separador = trozo.indexOf('=')
    if (separador === -1) continue

    if (trozo.slice(0, separador).trim() === NOMBRE_DE_COOKIE) {
      return trozo.slice(separador + 1).trim() || null
    }
  }

  return null
}

export async function crearSesion(
  db: D1Database,
  clienteId: string,
  invitacionHash: string | null,
  ahora = ahoraEnSegundos(),
): Promise<{ cookie: string; expiraEn: number }> {
  const valor = tokenNuevo()
  const expiraEn = ahora + VIDA_DE_SESION

  await db
    .prepare(
      `INSERT INTO sesiones (id, cliente_id, invitacion, creada_en, expira_en)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    )
    .bind(await resumen(valor), clienteId, invitacionHash, ahora, expiraEn)
    .run()

  return { cookie: valor, expiraEn }
}

/**
 * Valida una cookie. `null` si no existe, está revocada o caducó.
 *
 * Las tres condiciones van en el `WHERE`: una sesión revocada deja de valer al
 * instante, sin esperar a que caduque la cookie del navegador.
 */
export async function validarSesion(
  db: D1Database,
  valorDeCookie: string,
  ahora = ahoraEnSegundos(),
): Promise<Sesion | null> {
  const fila = await db
    .prepare(
      `SELECT cliente_id, expira_en
         FROM sesiones
        WHERE id = ?1
          AND revocada_en IS NULL
          AND expira_en > ?2`,
    )
    .bind(await resumen(valorDeCookie), ahora)
    .first<{ cliente_id: string; expira_en: number }>()

  if (!fila) return null

  return { clienteId: fila.cliente_id, expiraEn: fila.expira_en }
}

/** Extiende sólo sesiones de cuentas activas cuando queda menos de media vida. */
export async function renovarSesion(db: D1Database, valor: string, ahora = ahoraEnSegundos()): Promise<boolean> {
  const hash = await resumen(valor)
  const resultado = await db.prepare(`UPDATE sesiones SET expira_en=?1 WHERE id=?2 AND revocada_en IS NULL
    AND expira_en>?3 AND expira_en<?4 AND EXISTS(
      SELECT 1 FROM cuentas a JOIN clientes c ON c.id=a.cliente_id
      WHERE a.cliente_id=sesiones.cliente_id AND c.activo=1)`)
    .bind(ahora + VIDA_DE_SESION, hash, ahora, ahora + VIDA_DE_SESION / 2).run()
  return (resultado.meta.changes ?? 0) > 0
}

/** Revoca la sesión de esta cookie. Idempotente: revocar dos veces no rompe. */
export async function cerrarSesion(
  db: D1Database,
  valorDeCookie: string,
  ahora = ahoraEnSegundos(),
): Promise<void> {
  await db
    .prepare(
      `UPDATE sesiones
          SET revocada_en = ?2
        WHERE id = ?1 AND revocada_en IS NULL`,
    )
    .bind(await resumen(valorDeCookie), ahora)
    .run()
}

/** Consumir la invitación y crear el acceso sucede en una sola transacción. */
export async function entrarConInvitacion(db:D1Database,token:string,ahora=ahoraEnSegundos()):Promise<{cookie:string}|null>{
 const cookie=tokenNuevo();const id=await resumen(cookie);const tokenHash=await resumen(token)
 await db.batch([
  db.prepare(`INSERT INTO sesiones(id,cliente_id,invitacion,creada_en,expira_en)
    SELECT ?1,i.cliente_id,i.token_hash,?3,?4 FROM invitaciones i JOIN clientes c ON c.id=i.cliente_id
    WHERE i.token_hash=?2 AND i.consumida_en IS NULL AND i.revocada_en IS NULL AND i.expira_en>?3 AND c.activo=1`).bind(id,tokenHash,ahora,ahora+VIDA_DE_SESION),
  db.prepare('UPDATE invitaciones SET consumida_en=? WHERE token_hash=? AND EXISTS(SELECT 1 FROM sesiones WHERE id=?)').bind(ahora,tokenHash,id),
 ])
 return await db.prepare('SELECT id FROM sesiones WHERE id=?').bind(id).first()?{cookie}:null
}
