import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import { baseDePrueba } from '../pruebas/base'
import { RepositorioLocal } from './repositorioLocal'
import { idSustitucion } from '../logica/sustitucion'
import { ALTA_POR_DEFECTO, crearParticipante } from '../logica/participante'
import { crearDiasIniciales } from './semilla'
import { PRESS_BANCA_15_SMITH, LAT_PULLDOWN } from './semilla/biblioteca'
import type { Participante } from '../dominio/tipos'

/**
 * La interfaz es de un solo participante, y lo seguirá siendo mientras el
 * cliente quiera un piloto. Estas pruebas cubren la capa de debajo: el día que
 * haya un segundo, sus datos no pueden aparecer mezclados con los del primero.
 *
 * Es la parte de "arquitectura preparada para más" de su especificación V1.
 */

let repositorio: RepositorioLocal
let ana: Participante
let luis: Participante

const FECHA = '2026-08-20'

beforeEach(async () => {
  repositorio = new RepositorioLocal(baseDePrueba(`aisl-${crypto.randomUUID()}`))

  ana = crearParticipante({ ...ALTA_POR_DEFECTO, nombre: 'Ana' })
  luis = crearParticipante({ ...ALTA_POR_DEFECTO, nombre: 'Luis' })
  await repositorio.guardarParticipante(ana)
  await repositorio.guardarParticipante(luis)

  // Mismo día, mismo ejercicio, pesos distintos: el caso que más fácil se mezcla.
  for (const [participante, peso] of [
    [ana, 45],
    [luis, 90],
  ] as const) {
    await repositorio.crearSesion({
      id: `sesion-${participante.nombre}`,
      participanteId: participante.id,
      plantillaDiaId: 'upper-a',
      fecha: FECHA,
    })
    await repositorio.registrarSerie({
      id: `serie-${participante.nombre}`,
      sesionId: `sesion-${participante.nombre}`,
      ejercicioId: PRESS_BANCA_15_SMITH.id,
      numeroSerie: 1,
      pesoRegistradoLb: peso,
      repsRealizadas: 10,
      rir: 2,
    })
  }
})

describe('el historial no se mezcla entre participantes', () => {
  test('cada uno ve sólo sus series del mismo ejercicio', async () => {
    const deAna = await repositorio.historialDeEjercicio(ana.id, PRESS_BANCA_15_SMITH.id)
    const deLuis = await repositorio.historialDeEjercicio(luis.id, PRESS_BANCA_15_SMITH.id)

    expect(deAna).toHaveLength(1)
    expect(deAna[0].pesoRegistradoLb).toBe(45)
    expect(deLuis).toHaveLength(1)
    expect(deLuis[0].pesoRegistradoLb).toBe(90)
  })

  test('los ejercicios entrenados son los de cada uno', async () => {
    // Arrange: sólo Luis hace lat pulldown
    await repositorio.registrarSerie({
      id: 'jalon-luis',
      sesionId: 'sesion-Luis',
      ejercicioId: LAT_PULLDOWN.id,
      numeroSerie: 1,
      pesoRegistradoLb: 100,
      repsRealizadas: 12,
      rir: 2,
    })

    // Act + Assert
    expect(await repositorio.idsDeEjerciciosConHistorial(ana.id)).toEqual([
      PRESS_BANCA_15_SMITH.id,
    ])
    expect((await repositorio.idsDeEjerciciosConHistorial(luis.id)).sort()).toEqual(
      [PRESS_BANCA_15_SMITH.id, LAT_PULLDOWN.id].sort(),
    )
  })

  test('un participante sin nada entrenado no hereda el historial del otro', async () => {
    const nuevo = crearParticipante({ ...ALTA_POR_DEFECTO, nombre: 'Nuevo' })
    await repositorio.guardarParticipante(nuevo)

    expect(await repositorio.historialDeEjercicio(nuevo.id, PRESS_BANCA_15_SMITH.id)).toEqual([])
    expect(await repositorio.idsDeEjerciciosConHistorial(nuevo.id)).toEqual([])
  })
})

describe('el volumen semanal no se mezcla', () => {
  test('cada uno suma sólo sus series', async () => {
    // §20: si se mezclaran, el objetivo semanal saldría al doble.
    const deAna = await repositorio.seriesEntreFechas(ana.id, FECHA, FECHA)
    const deLuis = await repositorio.seriesEntreFechas(luis.id, FECHA, FECHA)

    expect(deAna).toHaveLength(1)
    expect(deAna[0].pesoRegistradoLb).toBe(45)
    expect(deLuis).toHaveLength(1)
    expect(deLuis[0].pesoRegistradoLb).toBe(90)
  })
})

describe('las sustituciones no se mezclan', () => {
  test('el cambio de máquina de uno no cambia el día del otro', async () => {
    // Arrange: sólo Ana cambia de variante hoy
    await repositorio.guardarSustitucion({
      id: idSustitucion(ana.id, FECHA, 'upper-a', 1),
      participanteId: ana.id,
      fecha: FECHA,
      plantillaDiaId: 'upper-a',
      orden: 1,
      ejercicioId: 'press-banca-barra',
    })

    // Act + Assert
    expect(await repositorio.listarSustituciones(ana.id, FECHA)).toHaveLength(1)
    expect(await repositorio.listarSustituciones(luis.id, FECHA)).toHaveLength(0)
  })

  test('la misma posición y día para dos personas son dos sustituciones', async () => {
    // Sin el participante en la clave, la segunda pisaría la primera.
    for (const [participante, ejercicioId] of [
      [ana, 'press-banca-barra'],
      [luis, 'press-banca-mancuernas'],
    ] as const) {
      await repositorio.guardarSustitucion({
        id: idSustitucion(participante.id, FECHA, 'upper-a', 1),
        participanteId: participante.id,
        fecha: FECHA,
        plantillaDiaId: 'upper-a',
        orden: 1,
        ejercicioId,
      })
    }

    expect((await repositorio.listarSustituciones(ana.id, FECHA))[0].ejercicioId).toBe(
      'press-banca-barra',
    )
    expect((await repositorio.listarSustituciones(luis.id, FECHA))[0].ejercicioId).toBe(
      'press-banca-mancuernas',
    )
  })
})

describe('las plantillas no se mezclan', () => {
  test('cada participante tiene sus propios días', async () => {
    // Arrange: los cuatro días de §28 para cada uno
    await crearDiasIniciales(repositorio, ana.id)
    await crearDiasIniciales(repositorio, luis.id)

    // Act + Assert
    expect(await repositorio.listarPlantillas(ana.id)).toHaveLength(4)
    expect(await repositorio.listarPlantillas(luis.id)).toHaveLength(4)
  })

  test('editar el día de uno no cambia el del otro (§23)', async () => {
    // Arrange
    await crearDiasIniciales(repositorio, ana.id)
    await crearDiasIniciales(repositorio, luis.id)
    const [primeroDeAna] = await repositorio.listarPlantillas(ana.id)

    // Act: el coach le quita un ejercicio a Ana
    await repositorio.guardarPlantilla({
      ...primeroDeAna,
      slots: primeroDeAna.slots.slice(1),
    })

    // Assert: el de Luis sigue completo
    const [primeroDeLuis] = await repositorio.listarPlantillas(luis.id)
    expect(primeroDeLuis.slots).toHaveLength(5)
    expect((await repositorio.listarPlantillas(ana.id))[0].slots).toHaveLength(4)
  })

  test('un participante nuevo no hereda los días editados del anterior', async () => {
    await crearDiasIniciales(repositorio, ana.id)

    expect(await repositorio.listarPlantillas(luis.id)).toHaveLength(0)
  })
})

describe('las fotos y el progreso no se mezclan', () => {
  test('el progreso es de cada participante', async () => {
    await repositorio.guardarProgreso({
      id: 'p-ana',
      participanteId: ana.id,
      fecha: FECHA,
      medidas: { cinturaPulgadas: 30 },
      tieneFoto: false,
    })

    expect(await repositorio.listarProgreso(ana.id)).toHaveLength(1)
    expect(await repositorio.listarProgreso(luis.id)).toHaveLength(0)
  })
})

describe('los borradores no se mezclan', () => {
  test('lo que teclea uno no aparece en la pantalla del otro', async () => {
    const borrador = (participanteId: string) => ({
      id: `${participanteId}|${FECHA}|upper-a|1|1`,
      participanteId,
      fecha: FECHA,
      plantillaDiaId: 'upper-a',
      orden: 1,
      numeroSerie: 1,
      pesoRegistradoLb: 45,
      repsRealizadas: 10,
      rir: 2,
      guardadoEn: '2026-08-20T10:00:00.000Z',
    })
    await repositorio.guardarBorrador(borrador(ana.id))

    expect(await repositorio.obtenerBorrador(borrador(ana.id).id)).toBeDefined()
    expect(await repositorio.obtenerBorrador(borrador(luis.id).id)).toBeUndefined()
  })
})
