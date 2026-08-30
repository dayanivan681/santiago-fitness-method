/**
 * Invitaciones de un solo uso.
 *
 * El coach genera un enlace y se lo manda a quien quiera que entre. El enlace
 * vale una vez y caduca a los 7 días.
 *
 * El uso único no se comprueba leyendo y escribiendo después: eso deja una
 * ventana entre las dos operaciones por la que pueden colarse dos peticiones
 * simultáneas. Se resuelve en una sola sentencia `UPDATE … WHERE consumida_en
 * IS NULL`, que es una comparación-y-escritura atómica. Si afecta a cero filas,
 * la invitación no servía: no existía, ya se usó, la revocaron o caducó.
 */

import { resumen, tokenNuevo } from './cripto'

/** Vigencia de un enlace de invitación, en segundos. */
export const VIDA_DE_INVITACION = 7 * 24 * 60 * 60

export type Invitacion = {
  readonly token: string
  readonly expiraEn: number
}

export function ahoraEnSegundos(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Crea una invitación y devuelve el token en claro.
 *
 * Es la única vez que el token existe fuera del enlace: en la base sólo queda
 * su resumen. Si se pierde, no se recupera — se genera otro.
 */
export async function crearInvitacion(
  db: D1Database,
  clienteId: string,
  ahora = ahoraEnSegundos(),
): Promise<Invitacion> {
  const token = tokenNuevo()
  const expiraEn = ahora + VIDA_DE_INVITACION

  await db
    .prepare(
      `INSERT INTO invitaciones (token_hash, cliente_id, creada_en, expira_en)
       VALUES (?1, ?2, ?3, ?4)`,
    )
    .bind(await resumen(token), clienteId, ahora, expiraEn)
    .run()

  return { token, expiraEn }
}

/**
 * Consume una invitación. Devuelve a quién pertenecía, o `null` si no valía.
 *
 * Una sola sentencia hace las cuatro comprobaciones y la marca: existe, sin
 * consumir, sin revocar y sin caducar. `RETURNING` trae el cliente en el mismo
 * viaje, así que no hay lectura previa que pueda quedarse obsoleta.
 */
export async function consumirInvitacion(
  db: D1Database,
  token: string,
  ahora = ahoraEnSegundos(),
): Promise<{ clienteId: string; tokenHash: string } | null> {
  const tokenHash = await resumen(token)

  const fila = await db
    .prepare(
      `UPDATE invitaciones
          SET consumida_en = ?2
        WHERE token_hash = ?1
          AND consumida_en IS NULL
          AND revocada_en IS NULL
          AND expira_en > ?2
      RETURNING cliente_id`,
    )
    .bind(tokenHash, ahora)
    .first<{ cliente_id: string }>()

  if (!fila) return null

  return { clienteId: fila.cliente_id, tokenHash }
}

/**
 * Estado de una invitación, sin tocarla.
 *
 * El GET de `/access` la necesita para no enseñar un botón "Entrar" que va a
 * fallar. Es de sólo lectura a propósito: los previsualizadores de enlaces de
 * WhatsApp, iMessage o los antivirus de correo hacen GET automáticamente, y
 * consumir ahí dejaría al participante sin acceso antes de tocar nada.
 *
 * Esto NO sustituye a `consumirInvitacion`: entre este SELECT y el POST puede
 * pasar cualquier cosa. El POST vuelve a decidirlo todo con su UPDATE atómico.
 */
export type EstadoDeInvitacion =
  | 'valida'
  | 'consumida'
  | 'expirada'
  | 'revocada'
  /** No existe, o el token es inventado. No se distingue una cosa de la otra. */
  | 'desconocida'

export async function estadoDeInvitacion(
  db: D1Database,
  token: string,
  ahora = ahoraEnSegundos(),
): Promise<EstadoDeInvitacion> {
  const fila = await db
    .prepare(
      `SELECT consumida_en, revocada_en, expira_en
         FROM invitaciones
        WHERE token_hash = ?1`,
    )
    .bind(await resumen(token))
    .first<{ consumida_en: number | null; revocada_en: number | null; expira_en: number }>()

  if (!fila) return 'desconocida'
  if (fila.consumida_en !== null) return 'consumida'
  if (fila.expira_en <= ahora) return 'expirada'
  if (fila.revocada_en !== null) return 'revocada'

  return 'valida'
}
