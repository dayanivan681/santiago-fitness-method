import { describe, expect, it } from 'vitest'
import {
  crearPerfilConIdAutomatico,
  esColisionDeIdentificador,
  generarIdentificadorCliente,
} from './clienteId'
import { guardarPerfil, type PerfilCloud } from './roles'

const UUID_A = '11111111-1111-4111-8111-111111111111'
const UUID_B = '22222222-2222-4222-8222-222222222222'
const UUID_C = '33333333-3333-4333-8333-333333333333'

const DATOS: Omit<PerfilCloud, 'id'> = {
  nombre: 'José Rivera',
  sexo: 'masculino',
  edad: 30,
  estaturaCm: 175.26,
  pesoCorporalLb: 175,
  objetivo: 'Pendiente de confirmar',
  frecuenciaEntrenamiento: 4,
  limitaciones: '',
  notas: '',
  ejerciciosEvitados: [],
}

type SentenciaFalsa = {
  sql: string
  valores: unknown[]
  bind: (...valores: unknown[]) => SentenciaFalsa
}

function baseFalsa(idsIniciales: readonly string[] = []) {
  const ids = new Set(idsIniciales)
  const perfiles = new Map<string, PerfilCloud>()

  const db = {
    prepare(sql: string) {
      const sentencia: SentenciaFalsa = {
        sql,
        valores: [],
        bind(...valores: unknown[]) {
          sentencia.valores = valores
          return sentencia
        },
      }
      return sentencia
    },
    async batch(sentencias: SentenciaFalsa[]) {
      // Cede una vez para que Promise.all reproduzca dos solicitudes que llegan
      // juntas; la comprobación y el alta siguen siendo una operación atómica.
      await Promise.resolve()
      const alta = sentencias.find((sentencia) => /INSERT INTO clientes/.test(sentencia.sql))
      if (!alta) throw new Error('Falta INSERT INTO clientes')
      const id = String(alta.valores[0])
      if (ids.has(id)) throw new Error('D1_ERROR: UNIQUE constraint failed: clientes.id')
      ids.add(id)
      perfiles.set(id, {
        id,
        nombre: String(alta.valores[1]),
        sexo: String(alta.valores[2]) as PerfilCloud['sexo'],
        edad: Number(alta.valores[3]),
        estaturaCm: Number(alta.valores[4]),
        pesoCorporalLb: Number(alta.valores[5]),
        objetivo: String(alta.valores[6]),
        frecuenciaEntrenamiento: Number(alta.valores[7]),
        limitaciones: String(alta.valores[8]),
        notas: String(alta.valores[9]),
        ejerciciosEvitados: JSON.parse(String(alta.valores[10])) as string[],
      })
      return []
    },
  } as unknown as D1Database

  return { db, ids, perfiles }
}

function secuencia(...valores: string[]): () => string {
  let indice = 0
  return () => valores[Math.min(indice++, valores.length - 1)]
}

describe('identificador automático de cliente', () => {
  it('genera un id opaco, estable en formato y ajeno al nombre', () => {
    expect(generarIdentificadorCliente(() => UUID_A)).toBe(
      'cliente-11111111111141118111111111111111',
    )
  })

  it('rechaza una fuente que no sea un UUID válido', () => {
    expect(() => generarIdentificadorCliente(() => 'santiago')).toThrow(/UUID válido/)
  })

  it('crea dos nombres iguales con ids distintos', async () => {
    const { db, perfiles } = baseFalsa()
    const primero = await crearPerfilConIdAutomatico(db, DATOS, () => UUID_A)
    const segundo = await crearPerfilConIdAutomatico(db, DATOS, () => UUID_B)

    expect(primero.nombre).toBe(segundo.nombre)
    expect(primero.id).not.toBe(segundo.id)
    expect(perfiles.size).toBe(2)
  })

  it('conserva intactos los ids existentes al crear otro cliente', async () => {
    const existentes = ['santiago', 'cliente-1']
    const { db, ids } = baseFalsa(existentes)
    await crearPerfilConIdAutomatico(db, DATOS, () => UUID_B)

    expect([...ids].filter((id) => existentes.includes(id))).toEqual(existentes)
  })

  it('resuelve una colisión concurrente mediante la PRIMARY KEY', async () => {
    const { db, perfiles } = baseFalsa()
    const [primero, segundo] = await Promise.all([
      crearPerfilConIdAutomatico(db, DATOS, () => UUID_A),
      crearPerfilConIdAutomatico(db, DATOS, secuencia(UUID_A, UUID_C)),
    ])

    expect(new Set([primero.id, segundo.id]).size).toBe(2)
    expect(perfiles.size).toBe(2)
  })

  it('no reintenta un fallo ambiguo y evita duplicar una creación incierta', async () => {
    const db = {
      prepare() {
        return { bind() { return this } }
      },
      async batch() {
        throw new Error('D1 temporalmente no disponible')
      },
    } as unknown as D1Database

    let generaciones = 0
    await expect(
      crearPerfilConIdAutomatico(db, DATOS, () => {
        generaciones += 1
        return UUID_A
      }),
    ).rejects.toThrow('D1 temporalmente no disponible')
    expect(generaciones).toBe(1)
  })

  it('reconoce sólo la colisión de la clave primaria del cliente', () => {
    expect(esColisionDeIdentificador(new Error('UNIQUE constraint failed: clientes.id'))).toBe(true)
    expect(esColisionDeIdentificador(new Error('UNIQUE constraint failed: rutinas.id'))).toBe(false)
  })

  it('cambiar el nombre conserva la misma clave estable', async () => {
    let valores: unknown[] = []
    const db = {
      prepare() {
        return {
          bind(...nuevos: unknown[]) {
            valores = nuevos
            return this
          },
          async run() {
            return {}
          },
        }
      },
    } as unknown as D1Database

    await guardarPerfil(db, { ...DATOS, id: 'santiago', nombre: 'José A. Rivera' })
    expect(valores[0]).toBe('José A. Rivera')
    expect(valores.at(-1)).toBe('santiago')
  })
})
