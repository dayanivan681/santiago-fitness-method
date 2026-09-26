import { resumen, tokenNuevo } from './cripto'
import { ahoraEnSegundos } from './invitacion'
import { crearSesion } from './sesion'

export const ITERACIONES_DE_CLAVE = 100_000
export const VIDA_DE_RESTABLECIMIENTO = 24 * 60 * 60
const VENTANA_DE_INTENTOS = 15 * 60
const MAX_INTENTOS = 5

type Clave = { hash: string; sal: string; iteraciones: number }
type Cuenta = { cliente_id: string; clave_hash: string | null; clave_sal: string | null; clave_iteraciones: number | null }

export function normalizarEmail(email: string): string | null {
  const valor = email.trim().toLowerCase()
  return valor.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) ? valor : null
}

function bytesHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function hexBytes(valor: string): Uint8Array<ArrayBuffer> {
  if (!/^(?:[\da-f]{2})+$/i.test(valor)) throw new Error('Clave guardada inválida')
  const bytes = new Uint8Array(new ArrayBuffer(valor.length / 2))
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(valor.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

async function derivar(clave: string, sal: string, iteraciones: number): Promise<string> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: hexBytes(sal), iterations: iteraciones }, base, 256)
  return bytesHex(new Uint8Array(bits))
}

export async function crearCuenta(clave: string): Promise<Clave> {
  if (clave.length < 10 || clave.length > 1024) throw new Error('La contraseña debe tener entre 10 y 1024 caracteres.')
  const sal = bytesHex(crypto.getRandomValues(new Uint8Array(16)))
  return { sal, hash: await derivar(clave, sal, ITERACIONES_DE_CLAVE), iteraciones: ITERACIONES_DE_CLAVE }
}

export async function verificarClave(clave: string, cuenta: Pick<Clave, 'hash' | 'sal' | 'iteraciones'>): Promise<boolean> {
  if (!Number.isInteger(cuenta.iteraciones) || cuenta.iteraciones < 1 || cuenta.iteraciones > 1_000_000) return false
  try {
    const recibido = hexBytes(await derivar(clave, cuenta.sal, cuenta.iteraciones))
    const esperado = hexBytes(cuenta.hash)
    let diferencia = recibido.length ^ esperado.length
    for (let i = 0; i < Math.max(recibido.length, esperado.length); i++) diferencia |= (recibido[i] ?? 0) ^ (esperado[i] ?? 0)
    return diferencia === 0
  } catch { return false }
}

/** Las tres escrituras se ejecutan en una transacción D1. Una sal nueva prueba que
 * la cuenta insertada pertenece a este intento y no a una invitación anterior. */
export async function registrarConInvitacion(db: D1Database, token: string, email: string, clave: string, ahora = ahoraEnSegundos()): Promise<string | null> {
  const correo = normalizarEmail(email)
  if (!correo) throw new Error('Escribe un email válido.')
  const datos = await crearCuenta(clave)
  const tokenHash = await resumen(token)
  const cookie = tokenNuevo()
  const sesionHash = await resumen(cookie)
  await db.batch([
    db.prepare(`INSERT OR IGNORE INTO cuentas(cliente_id,email,clave_hash,clave_sal,clave_iteraciones,creada_en)
      SELECT i.cliente_id,?2,?3,?4,?5,?6 FROM invitaciones i JOIN clientes c ON c.id=i.cliente_id
      WHERE i.token_hash=?1 AND i.consumida_en IS NULL AND i.revocada_en IS NULL AND i.expira_en>?6 AND c.activo=1`)
      .bind(tokenHash, correo, datos.hash, datos.sal, datos.iteraciones, ahora),
    db.prepare(`INSERT INTO sesiones(id,cliente_id,invitacion,creada_en,expira_en)
      SELECT ?1,i.cliente_id,i.token_hash,?3,?4 FROM invitaciones i JOIN cuentas a ON a.cliente_id=i.cliente_id
      WHERE i.token_hash=?2 AND i.consumida_en IS NULL AND i.revocada_en IS NULL AND i.expira_en>?3
        AND a.email=?5 AND a.clave_sal=?6`).bind(sesionHash, tokenHash, ahora, ahora + 30 * 24 * 60 * 60, correo, datos.sal),
    db.prepare('UPDATE invitaciones SET consumida_en=?1 WHERE token_hash=?2 AND EXISTS(SELECT 1 FROM sesiones WHERE id=?3)')
      .bind(ahora, tokenHash, sesionHash),
  ])
  return await db.prepare('SELECT id FROM sesiones WHERE id=?').bind(sesionHash).first() ? cookie : null
}

function clavesDeIntento(email: string): string[] {
  // Una IP puede representar a muchos clientes (red móvil o gimnasio). Limitar
  // por email evita que un fallo de otra persona bloquee a todos los demás.
  return [`email:${email}`]
}

export async function intentosAgotados(db: D1Database, email: string, ahora = ahoraEnSegundos()): Promise<boolean> {
  for (const clave of clavesDeIntento(email)) {
    const fila = await db.prepare('SELECT ventana, cuenta FROM intentos_de_acceso WHERE clave=?').bind(clave).first<{ ventana: number; cuenta: number }>()
    if (fila && fila.ventana > ahora - VENTANA_DE_INTENTOS && fila.cuenta >= MAX_INTENTOS) return true
  }
  return false
}

export async function registrarFallo(db: D1Database, email: string, ahora = ahoraEnSegundos()): Promise<void> {
  await db.batch(clavesDeIntento(email).map((clave) => db.prepare(`INSERT INTO intentos_de_acceso(clave,ventana,cuenta) VALUES(?1,?2,1)
    ON CONFLICT(clave) DO UPDATE SET ventana=CASE WHEN ventana<=?3 THEN ?2 ELSE ventana END,
      cuenta=CASE WHEN ventana<=?3 THEN 1 ELSE cuenta+1 END`).bind(clave, ahora, ahora - VENTANA_DE_INTENTOS)))
}

export async function entrarConClave(db: D1Database, email: string, clave: string, ahora = ahoraEnSegundos()): Promise<string | null> {
  const correo = normalizarEmail(email)
  if (!correo || await intentosAgotados(db, correo, ahora)) return null
  const cuenta = await db.prepare(`SELECT a.cliente_id,a.clave_hash,a.clave_sal,a.clave_iteraciones FROM cuentas a
    JOIN clientes c ON c.id=a.cliente_id WHERE a.email=? AND c.activo=1`).bind(correo).first<Cuenta>()
  // El trabajo criptográfico también ocurre si el email es desconocido.
  const valida = await verificarClave(clave, cuenta?.clave_hash && cuenta.clave_sal && cuenta.clave_iteraciones
    ? { hash: cuenta.clave_hash, sal: cuenta.clave_sal, iteraciones: cuenta.clave_iteraciones }
    : { hash: '0'.repeat(64), sal: '0'.repeat(32), iteraciones: ITERACIONES_DE_CLAVE })
  if (!cuenta || !valida) { await registrarFallo(db, correo, ahora); return null }
  const sesion = await crearSesion(db, cuenta.cliente_id, null, ahora)
  await db.prepare('UPDATE cuentas SET ultimo_acceso_en=? WHERE cliente_id=?').bind(ahora, cuenta.cliente_id).run()
  await db.prepare('DELETE FROM intentos_de_acceso WHERE clave=?').bind(`email:${correo}`).run()
  return sesion.cookie
}

export async function prepararRestablecimiento(db: D1Database, clienteId: string, ahora = ahoraEnSegundos()): Promise<{ token: string; expiraEn: number } | null> {
  const existe = await db.prepare(`SELECT a.cliente_id FROM cuentas a JOIN clientes c ON c.id=a.cliente_id
    WHERE a.cliente_id=? AND c.activo=1`).bind(clienteId).first()
  if (!existe) return null
  const token = tokenNuevo()
  const expiraEn = ahora + VIDA_DE_RESTABLECIMIENTO
  await db.prepare('INSERT INTO restablecimientos(token_hash,cliente_id,creado_en,expira_en) VALUES(?,?,?,?)')
    .bind(await resumen(token), clienteId, ahora, expiraEn).run()
  return { token, expiraEn }
}

export async function restablecimientoValido(db: D1Database, token: string, ahora = ahoraEnSegundos()): Promise<boolean> {
  return !!(await db.prepare(`SELECT r.token_hash FROM restablecimientos r JOIN clientes c ON c.id=r.cliente_id
    WHERE r.token_hash=? AND r.usado_en IS NULL AND r.expira_en>? AND c.activo=1`)
    .bind(await resumen(token), ahora).first())
}

export async function cambiarClave(db: D1Database, token: string, clave: string, ahora = ahoraEnSegundos()): Promise<boolean> {
  const datos = await crearCuenta(clave)
  const tokenHash = await resumen(token)
  const resultados = await db.batch([
    db.prepare(`UPDATE cuentas SET clave_hash=?1,clave_sal=?2,clave_iteraciones=?3
      WHERE cliente_id=(SELECT r.cliente_id FROM restablecimientos r JOIN clientes c ON c.id=r.cliente_id
        WHERE r.token_hash=?4 AND r.usado_en IS NULL AND r.expira_en>?5 AND c.activo=1)`)
      .bind(datos.hash, datos.sal, datos.iteraciones, tokenHash, ahora),
    db.prepare(`UPDATE restablecimientos SET usado_en=?1 WHERE token_hash=?2 AND usado_en IS NULL
      AND EXISTS(SELECT 1 FROM cuentas WHERE cliente_id=restablecimientos.cliente_id AND clave_sal=?3)`)
      .bind(ahora, tokenHash, datos.sal),
    db.prepare(`UPDATE sesiones SET revocada_en=?1 WHERE cliente_id=(SELECT cliente_id FROM restablecimientos
      WHERE token_hash=?2 AND usado_en=?1) AND revocada_en IS NULL`).bind(ahora, tokenHash),
  ])
  return (resultados[1].meta.changes ?? 0) > 0
}
