import { afterEach, describe, expect, it } from 'vitest'
import { sqliteD1 } from '../../pruebas-v2/d1'
import { crearCuenta, intentosAgotados, normalizarEmail, registrarConInvitacion, registrarFallo, verificarClave } from './cuentas'
import { crearSesion, renovarSesion, validarSesion, VIDA_DE_SESION } from './sesion'
import { consumirInvitacion, crearInvitacion } from './invitacion'

describe('contraseñas', () => {
  it('usa sal distinta y verifica la contraseña sin aceptar otra', async () => {
    const a = await crearCuenta('Una-Clave-Larga-123')
    const b = await crearCuenta('Una-Clave-Larga-123')
    expect(a.sal).not.toBe(b.sal)
    expect(a.hash).not.toBe(b.hash)
    expect(a.iteraciones).toBe(100_000)
    expect(await verificarClave('Una-Clave-Larga-123', a)).toBe(true)
    expect(await verificarClave('otra-clave-larga', a)).toBe(false)
    await expect(crearCuenta('corta')).rejects.toThrow()
  })

  it('normaliza el email antes de buscar o guardar', () => {
    expect(normalizarEmail(' Persona@Ejemplo.COM ')).toBe('persona@ejemplo.com')
    expect(normalizarEmail('sin-arroba')).toBeNull()
  })
})

describe('límite de intentos', () => {
  const bases: ReturnType<typeof sqliteD1>[] = []
  afterEach(() => { while (bases.length) bases.pop()!.cerrar() })

  it('bloquea al quinto fallo y permite otro intento tras 15 minutos', async () => {
    const db = sqliteD1(); bases.push(db)
    for (let i = 0; i < 5; i++) {
      expect(await intentosAgotados(db.db, 'persona@example.test', 1000)).toBe(false)
      await registrarFallo(db.db, 'persona@example.test', 1000)
    }
    expect(await intentosAgotados(db.db, 'persona@example.test', 1000)).toBe(true)
    expect(await intentosAgotados(db.db, 'persona@example.test', 1901)).toBe(false)
  })
})

describe('sesión renovable', () => {
  it('extiende la sesión de una cuenta activa cuando queda menos de media vida', async () => {
    const local = sqliteD1()
    try {
      local.ejecutar("INSERT INTO cuentas(cliente_id,email,creada_en) VALUES('santiago','santiago@example.test',1000)")
      const invitacion = await crearInvitacion(local.db, 'santiago', 1000)
      const consumida = await consumirInvitacion(local.db, invitacion.token, 1000)
      const sesion = await crearSesion(local.db, 'santiago', consumida!.tokenHash, 1000)
      local.ejecutar("UPDATE sesiones SET expira_en=2000 WHERE cliente_id='santiago'")
      expect(await renovarSesion(local.db, sesion.cookie, 1500)).toBe(true)
      expect((await validarSesion(local.db, sesion.cookie, 1500))?.expiraEn).toBe(1500 + VIDA_DE_SESION)
    } finally { local.cerrar() }
  })

  it('una sesión antigua sin invitación sigue inválida después de crear la cuenta', async () => {
    const local = sqliteD1()
    try {
      const antigua = await crearSesion(local.db, 'santiago', null)
      const invitacion = await crearInvitacion(local.db, 'santiago')
      const nueva = await registrarConInvitacion(local.db, invitacion.token, 'santiago@example.test', 'Clave-de-prueba-123')
      expect(nueva).toBeTruthy()
      expect(await validarSesion(local.db, antigua.cookie)).toBeNull()
      expect(await validarSesion(local.db, nueva!)).not.toBeNull()
    } finally { local.cerrar() }
  })
})
