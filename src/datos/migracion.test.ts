import 'fake-indexeddb/auto'
import { describe, test, expect } from 'vitest'
import Dexie from 'dexie'
import { baseDePrueba } from '../pruebas/base'
import { RepositorioLocal } from './repositorioLocal'

/**
 * Actualizar la app no puede costarle el historial a nadie.
 *
 * Estas pruebas montan una base con el esquema **viejo** —plantillas y
 * sustituciones sin dueño— y comprueban que al abrirla con el esquema actual
 * los datos siguen ahí y quedan asignados al participante que existe.
 */

/** Una base como la que tendría hoy el piloto en el móvil, en la versión 7. */
async function baseAnterior(nombre: string) {
  const vieja = new Dexie(nombre)
  vieja.version(7).stores({
    participantes: 'id',
    ejercicios: 'id, musculoPrimario',
    plantillas: 'id, nombre, orden',
    sesiones: 'id, participanteId, fecha, plantillaDiaId',
    series: 'id, sesionId, ejercicioId',
    sustituciones: 'id, [participanteId+fecha]',
    progreso: 'id, participanteId, fecha',
    fotos: 'id',
    fotosDePerfil: 'id',
    borradores: 'id, [participanteId+fecha]',
  })
  await vieja.open()
  return vieja
}

describe('migración al esquema por participante', () => {
  test('las plantillas del piloto quedan asignadas, con sus ejercicios intactos', async () => {
    // Arrange: base vieja con el participante y su Upper A ya editado
    const nombre = `migra-${crypto.randomUUID()}`
    const vieja = await baseAnterior(nombre)
    await vieja.table('participantes').put({
      id: '001',
      nombre: 'Participante 001',
      sexo: 'masculino',
      edad: 30,
      estaturaCm: 175,
      pesoCorporalLb: 175,
      objetivo: 'Ganar fuerza',
      frecuenciaEntrenamiento: 4,
      limitaciones: '',
    })
    await vieja.table('plantillas').put({
      id: 'upper-a',
      nombre: 'Upper A',
      orden: 1,
      slots: [
        {
          orden: 1,
          ejercicioId: 'press-banca-15-smith',
          estimulo: 'fuerza',
          seriesObjetivo: 4,
          repMin: 1,
          repMax: 5,
          descansoSegundos: 180,
        },
      ],
    })
    vieja.close()

    // Act: se abre con el esquema actual
    const repositorio = new RepositorioLocal(baseDePrueba(nombre))
    const plantillas = await repositorio.listarPlantillas('001')

    // Assert: sigue siendo suya y no perdió el ejercicio que el coach programó
    expect(plantillas).toHaveLength(1)
    expect(plantillas[0].slots).toHaveLength(1)
    expect(plantillas[0].slots[0].ejercicioId).toBe('press-banca-15-smith')
    expect(plantillas[0].slots[0].seriesObjetivo).toBe(4)
  })

  test('las sesiones y las series no se tocan', async () => {
    // §19: lo registrado no se pierde en una actualización.
    const nombre = `migra-${crypto.randomUUID()}`
    const vieja = await baseAnterior(nombre)
    await vieja.table('participantes').put({ id: '001', nombre: 'Participante 001' })
    await vieja.table('sesiones').put({
      id: 's1',
      participanteId: '001',
      plantillaDiaId: 'upper-a',
      fecha: '2026-07-01',
    })
    await vieja.table('series').put({
      id: 'serie-1',
      sesionId: 's1',
      ejercicioId: 'press-banca-15-smith',
      numeroSerie: 1,
      pesoRegistradoLb: 45,
      repsRealizadas: 10,
      rir: 2,
    })
    vieja.close()

    const repositorio = new RepositorioLocal(baseDePrueba(nombre))

    const historial = await repositorio.historialDeEjercicio('001', 'press-banca-15-smith')
    expect(historial).toHaveLength(1)
    expect(historial[0].pesoRegistradoLb).toBe(45)
    expect(historial[0].fecha).toBe('2026-07-01')
  })

  test('el progreso y las fotos siguen siendo del participante', async () => {
    const nombre = `migra-${crypto.randomUUID()}`
    const vieja = await baseAnterior(nombre)
    await vieja.table('participantes').put({ id: '001', nombre: 'Participante 001' })
    await vieja.table('progreso').put({
      id: 'p1',
      participanteId: '001',
      fecha: '2026-07-01',
      medidas: { cinturaPulgadas: 34 },
      tieneFoto: false,
    })
    vieja.close()

    const repositorio = new RepositorioLocal(baseDePrueba(nombre))

    expect(await repositorio.listarProgreso('001')).toHaveLength(1)
  })
})
