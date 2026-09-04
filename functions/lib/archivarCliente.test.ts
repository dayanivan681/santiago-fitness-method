import { describe, expect, it } from 'vitest'
import { archivarCliente, estadoDelIdentificador } from './roles'

/**
 * La baja de un cliente.
 *
 * Lo que se comprueba aquí no es que la fila se apague —eso es lo fácil— sino
 * que el acceso se corte en el mismo acto. Un cliente fuera de la lista que
 * siguiera entrando con la cookie que ya tenía es el fallo silencioso que esta
 * operación existe para impedir, y no se vería en pantalla: la consola diría
 * que ya no está.
 */

type Sentencia = { sql: string; parametros: readonly unknown[] }

function baseFalsa(fila: { activo: number } | null = null) {
  const lotes: Sentencia[][] = []
  const preparadas: Sentencia[] = []

  const db = {
    prepare(sql: string) {
      // `bind` devuelve la sentencia que luego recibe `batch`, así que el SQL y
      // los parámetros tienen que viajar en ella y no en una lista aparte.
      const sentencia = {
        sql,
        parametros: [] as readonly unknown[],
        bind(...parametros: unknown[]) {
          sentencia.parametros = parametros
          preparadas.push(sentencia)
          return sentencia
        },
        first: async () => fila,
        run: async () => ({}),
      }
      return sentencia
    },
    batch: async (sentencias: Sentencia[]) => {
      lotes.push(sentencias)
      return []
    },
  } as unknown as D1Database

  return { db, lotes, preparadas }
}

/** Normaliza espacios y saltos para poder buscar frases en el SQL. */
function plano(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim()
}

describe('archivarCliente', () => {
  it('apaga el cliente sin borrar su fila ni su programación', async () => {
    const { db, lotes } = baseFalsa()

    await archivarCliente(db, 'cliente1')

    const sql = lotes[0].map((sentencia) => plano(sentencia.sql))
    expect(sql.some((texto) => /UPDATE clientes SET activo = 0/.test(texto))).toBe(true)
    // Nada de DELETE: la programación tiene que seguir ahí para poder deshacer.
    expect(sql.some((texto) => /DELETE/i.test(texto))).toBe(false)
    expect(sql.some((texto) => /rutinas/i.test(texto))).toBe(false)
  })

  it('revoca las invitaciones pendientes del cliente', async () => {
    const { db, lotes } = baseFalsa()

    await archivarCliente(db, 'cliente1')

    const invitaciones = lotes[0].find((sentencia) => /invitaciones/i.test(sentencia.sql))
    expect(invitaciones, 'la baja no tocó las invitaciones').toBeDefined()
    expect(plano(invitaciones!.sql)).toContain('SET revocada_en')
    expect(plano(invitaciones!.sql)).toContain('consumida_en IS NULL')
    expect(invitaciones!.parametros).toContain('cliente1')
  })

  it('revoca las sesiones vivas, que es lo que corta el acceso ya abierto', async () => {
    const { db, lotes } = baseFalsa()

    await archivarCliente(db, 'cliente1')

    const sesiones = lotes[0].find((sentencia) => /UPDATE sesiones/i.test(sentencia.sql))
    expect(sesiones, 'la baja dejó viva la sesión: el cliente seguiría entrando').toBeDefined()
    expect(plano(sesiones!.sql)).toContain('revocada_en IS NULL')
    expect(sesiones!.parametros).toContain('cliente1')
  })

  it('manda las tres sentencias en un solo lote', async () => {
    // Por separado, un fallo entre medias dejaría al cliente fuera de la lista
    // pero con la sesión abierta: el peor de los dos estados posibles.
    const { db, lotes, preparadas } = baseFalsa()

    await archivarCliente(db, 'cliente1')

    expect(lotes).toHaveLength(1)
    expect(lotes[0]).toHaveLength(3)
    expect(preparadas).toHaveLength(3)
  })

  it('sella el instante de la baja en las tres sentencias', async () => {
    const { db, lotes } = baseFalsa()

    await archivarCliente(db, 'cliente1')

    const instantes = lotes[0].map((sentencia) => sentencia.parametros[0])
    expect(instantes.every((valor) => typeof valor === 'number' && Number.isInteger(valor))).toBe(true)
    expect(new Set(instantes).size).toBe(1)
  })
})

describe('estadoDelIdentificador', () => {
  it('dice libre cuando nadie lo ocupa', async () => {
    const { db } = baseFalsa(null)
    await expect(estadoDelIdentificador(db, 'nuevo')).resolves.toBe('libre')
  })

  it('distingue un cliente en la lista de uno dado de baja', async () => {
    // Son dos remedios distintos: uno es un nombre repetido y el otro una
    // programación archivada que reaparecería bajo otro nombre.
    await expect(estadoDelIdentificador(baseFalsa({ activo: 1 }).db, 'x')).resolves.toBe('activo')
    await expect(estadoDelIdentificador(baseFalsa({ activo: 0 }).db, 'x')).resolves.toBe('archivado')
  })
})
