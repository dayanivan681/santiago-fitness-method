import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import type { BaseDatosSantiago } from './esquema'
import { baseDePrueba } from '../pruebas/base'
import { RepositorioLocal } from './repositorioLocal'
import { derivarReferencias } from './referencias'
import { RANGO_POR_ESTIMULO } from '../dominio/estimulo'
import { crearSlot } from '../logica/plantilla'
import { idSustitucion } from '../logica/sustitucion'
import { ALTA_POR_DEFECTO, crearParticipante } from '../logica/participante'
import { PRESS_BANCA_15_SMITH, PRESS_INCLINADO_CONVERGENTE } from './semilla/biblioteca'
import type { SerieRegistrada, Sesion } from '../dominio/tipos'

const HIPERTROFIA = RANGO_POR_ESTIMULO.hipertrofia

let repositorio: RepositorioLocal
let db: BaseDatosSantiago

beforeEach(async () => {
  db = baseDePrueba(`prueba-${crypto.randomUUID()}`)
  repositorio = new RepositorioLocal(db)
})

const sesion = (id: string, fecha: string): Sesion => ({
  id,
  participanteId: '001',
  plantillaDiaId: 'upper-a',
  fecha,
})

const serie = (
  id: string,
  sesionId: string,
  ejercicioId: string,
  pesoRegistradoLb: number,
  repsRealizadas: number,
): SerieRegistrada => ({
  id,
  sesionId,
  ejercicioId,
  numeroSerie: 1,
  pesoRegistradoLb,
  repsRealizadas,
  rir: 2,
})

describe('el participante del piloto', () => {
  test('sin alta todavía, no hay ninguno', async () => {
    // La app arranca vacía: el coach da de alta al participante real (criterio 1).
    expect(await repositorio.participanteActual()).toBeUndefined()
  })

  test('sólo devuelve el perfil seleccionado explícitamente', async () => {
    // Arrange
    const participante = crearParticipante({ ...ALTA_POR_DEFECTO, nombre: 'Santiago' })

    // Act
    await repositorio.guardarParticipante(participante)

    // Assert
    expect(await repositorio.participanteActual()).toBeUndefined()
    expect((await new RepositorioLocal(db, participante.id).participanteActual())?.nombre).toBe('Santiago')
  })
})

describe('historial append-only (§19)', () => {
  test('dos sesiones del mismo ejercicio generan dos entradas, sin sobrescribir', async () => {
    // Arrange
    await repositorio.crearSesion(sesion('s1', '2026-08-10'))
    await repositorio.crearSesion(sesion('s2', '2026-08-17'))

    // Act
    await repositorio.registrarSerie(serie('a', 's1', PRESS_BANCA_15_SMITH.id, 45, 12))
    await repositorio.registrarSerie(serie('b', 's2', PRESS_BANCA_15_SMITH.id, 50, 10))

    // Assert
    const historial = await repositorio.historialDeEjercicio('001', PRESS_BANCA_15_SMITH.id)
    expect(historial).toHaveLength(2)
    expect(historial.map((s) => s.pesoRegistradoLb).sort()).toEqual([45, 50])
  })

  test('rechaza reescribir una serie ya registrada', async () => {
    await repositorio.crearSesion(sesion('s1', '2026-08-10'))
    await repositorio.registrarSerie(serie('a', 's1', PRESS_BANCA_15_SMITH.id, 45, 12))

    await expect(
      repositorio.registrarSerie(serie('a', 's1', PRESS_BANCA_15_SMITH.id, 999, 1)),
    ).rejects.toThrow()
  })

  test('adjunta la fecha de la sesión a cada serie del historial', async () => {
    await repositorio.crearSesion(sesion('s1', '2026-08-10'))
    await repositorio.registrarSerie(serie('a', 's1', PRESS_BANCA_15_SMITH.id, 45, 12))

    const historial = await repositorio.historialDeEjercicio('001', PRESS_BANCA_15_SMITH.id)

    expect(historial[0].fecha).toBe('2026-08-10')
  })
})

describe('corregir una serie (§19)', () => {
  test('actualiza en su sitio, sin crear un registro nuevo', async () => {
    // Arrange
    await repositorio.crearSesion(sesion('s1', '2026-08-10'))
    await repositorio.registrarSerie(serie('a', 's1', PRESS_BANCA_15_SMITH.id, 45, 12))

    // Act: se corrige un número mal puesto
    const [original] = await repositorio.historialDeEjercicio('001', PRESS_BANCA_15_SMITH.id)
    await repositorio.corregirSerie({ ...original, repsRealizadas: 10 })

    // Assert
    const historial = await repositorio.historialDeEjercicio('001', PRESS_BANCA_15_SMITH.id)
    expect(historial).toHaveLength(1)
    expect(historial[0].repsRealizadas).toBe(10)
  })

  test('conserva el instante original para no falsear el descanso (§5)', async () => {
    // Sellar de nuevo la hora al corregir diría que descansaste hasta la
    // corrección, y el descanso de §5 se deriva de esas marcas.
    await repositorio.crearSesion(sesion('s1', '2026-08-10'))
    await repositorio.registrarSerie({
      ...serie('a', 's1', PRESS_BANCA_15_SMITH.id, 45, 12),
      instante: '2026-08-10T10:00:00.000Z',
    })

    const [original] = await repositorio.historialDeEjercicio('001', PRESS_BANCA_15_SMITH.id)
    await repositorio.corregirSerie({ ...original, pesoRegistradoLb: 50 })

    const [corregida] = await repositorio.historialDeEjercicio('001', PRESS_BANCA_15_SMITH.id)
    expect(corregida.instante).toBe('2026-08-10T10:00:00.000Z')
    expect(corregida.pesoRegistradoLb).toBe(50)
  })

  test('no sirve para insertar: falla si la serie no existe', async () => {
    // Si corregir pudiera crear, sería una puerta trasera al append-only.
    await expect(
      repositorio.corregirSerie(serie('fantasma', 's1', PRESS_BANCA_15_SMITH.id, 45, 12)),
    ).rejects.toThrow()
  })
})

describe('cerrar la sesión', () => {
  test('marca cuándo se terminó, sin tocar las series', async () => {
    // Arrange
    await repositorio.crearSesion(sesion('s1', '2026-08-10'))
    await repositorio.registrarSerie(serie('a', 's1', PRESS_BANCA_15_SMITH.id, 45, 12))

    // Act
    await repositorio.actualizarSesion({
      ...sesion('s1', '2026-08-10'),
      completadaEn: '2026-08-10T11:00:00.000Z',
    })

    // Assert
    const [guardada] = await repositorio.listarSesiones('001')
    expect(guardada.completadaEn).toBe('2026-08-10T11:00:00.000Z')
    expect(await repositorio.historialDeEjercicio('001', PRESS_BANCA_15_SMITH.id)).toHaveLength(1)
  })

  test('no sirve para crear una sesión que no existe', async () => {
    await expect(
      repositorio.actualizarSesion(sesion('fantasma', '2026-08-10')),
    ).rejects.toThrow()
  })
})

describe('sustituciones del día', () => {
  test('guardar una no toca la plantilla del participante', async () => {
    // Arrange: la plantilla asignada
    const plantilla = {
      id: 'upper-a',
      nombre: 'Upper A',
      orden: 1,
      participanteId: '001',
      slots: [crearSlot(1, PRESS_BANCA_15_SMITH.id, 'fuerza' as const, 4)],
    }
    await repositorio.guardarPlantilla(plantilla)

    // Act: hoy la máquina está ocupada y se entrena la otra variante
    await repositorio.guardarSustitucion({
      id: idSustitucion('001', '2026-08-22', 'upper-a', 1),
      participanteId: '001',
      fecha: '2026-08-22',
      plantillaDiaId: 'upper-a',
      orden: 1,
      ejercicioId: PRESS_INCLINADO_CONVERGENTE.id,
    })

    // Assert: la plantilla sigue como estaba
    const guardada = await repositorio.obtenerPlantilla('upper-a')
    expect(guardada!.slots[0].ejercicioId).toBe(PRESS_BANCA_15_SMITH.id)
  })

  test('sólo devuelve las del día pedido', async () => {
    const sustitucion = (fecha: string) => ({
      id: idSustitucion('001', fecha, 'upper-a', 1),
      participanteId: '001',
      fecha,
      plantillaDiaId: 'upper-a',
      orden: 1,
      ejercicioId: PRESS_INCLINADO_CONVERGENTE.id,
    })
    await repositorio.guardarSustitucion(sustitucion('2026-08-21'))
    await repositorio.guardarSustitucion(sustitucion('2026-08-22'))

    const hoy = await repositorio.listarSustituciones('001', '2026-08-22')

    expect(hoy).toHaveLength(1)
    expect(hoy[0].fecha).toBe('2026-08-22')
  })

  test('cambiar de opinión pisa la sustitución, no la acumula', async () => {
    const id = idSustitucion('001', '2026-08-22', 'upper-a', 1)
    const base = {
      id,
      participanteId: '001',
      fecha: '2026-08-22',
      plantillaDiaId: 'upper-a',
      orden: 1,
    }
    await repositorio.guardarSustitucion({ ...base, ejercicioId: 'press-banca-barra' })
    await repositorio.guardarSustitucion({
      ...base,
      ejercicioId: PRESS_INCLINADO_CONVERGENTE.id,
    })

    const hoy = await repositorio.listarSustituciones('001', '2026-08-22')

    expect(hoy).toHaveLength(1)
    expect(hoy[0].ejercicioId).toBe(PRESS_INCLINADO_CONVERGENTE.id)
  })

  test('quitarla devuelve el día a la variante de la plantilla', async () => {
    const id = idSustitucion('001', '2026-08-22', 'upper-a', 1)
    await repositorio.guardarSustitucion({
      id,
      participanteId: '001',
      fecha: '2026-08-22',
      plantillaDiaId: 'upper-a',
      orden: 1,
      ejercicioId: PRESS_INCLINADO_CONVERGENTE.id,
    })

    await repositorio.quitarSustitucion(id)

    expect(await repositorio.listarSustituciones('001', '2026-08-22')).toHaveLength(0)
  })
})

describe('historial separado por variante (§16)', () => {
  test('press inclinado Smith y convergente no comparten historial', async () => {
    // Arrange: misma sesión, dos variantes del mismo movimiento
    await repositorio.crearSesion(sesion('s1', '2026-08-17'))
    await repositorio.registrarSerie(serie('a', 's1', PRESS_BANCA_15_SMITH.id, 45, 12))
    await repositorio.registrarSerie(serie('b', 's1', PRESS_INCLINADO_CONVERGENTE.id, 70, 10))

    // Act
    const historialSmith = await repositorio.historialDeEjercicio('001', PRESS_BANCA_15_SMITH.id)
    const historialConvergente = await repositorio.historialDeEjercicio(
      '001',
      PRESS_INCLINADO_CONVERGENTE.id,
    )

    // Assert
    expect(historialSmith).toHaveLength(1)
    expect(historialSmith[0].pesoRegistradoLb).toBe(45)
    expect(historialConvergente).toHaveLength(1)
    expect(historialConvergente[0].pesoRegistradoLb).toBe(70)
  })
})

describe('referencias sobre datos persistidos (§7, §9)', () => {
  test('un día malo guardado no borra la mejor referencia', async () => {
    // Arrange: sesión buena y luego sesión mala, ambas guardadas
    await repositorio.crearSesion(sesion('s1', '2026-08-10'))
    await repositorio.crearSesion(sesion('s2', '2026-08-17'))
    await repositorio.registrarSerie(serie('a', 's1', PRESS_INCLINADO_CONVERGENTE.id, 70, 15))
    await repositorio.registrarSerie(serie('b', 's2', PRESS_INCLINADO_CONVERGENTE.id, 55, 8))

    // Act
    const historial = await repositorio.historialDeEjercicio('001', PRESS_INCLINADO_CONVERGENTE.id)
    const referencias = derivarReferencias(
      PRESS_INCLINADO_CONVERGENTE.id,
      historial,
      PRESS_INCLINADO_CONVERGENTE,
      HIPERTROFIA,
    )

    // Assert: la última sesión refleja el día malo, la mejor referencia sobrevive
    expect(referencias.ultimaSesion).toEqual([{ cargaTotalLb: 110, reps: 8, rir: 2, tecnica: 'buena' }])
    expect(referencias.mejor).toEqual({ cargaTotalLb: 140, reps: 15, rir: 2, tecnica: 'buena' })
  })
})

describe('persistencia tras cerrar y reabrir la app', () => {
  test('lo guardado sigue estando en una instancia nueva de la base', async () => {
    // Recargar la página crea una instancia nueva de Dexie sobre el mismo
    // nombre; esto reproduce justo eso, en vez de reusar el objeto en memoria.
    const nombre = `prueba-reapertura-${crypto.randomUUID()}`

    // Arrange: "antes de cerrar la app"
    const antesDeCerrar = new RepositorioLocal(baseDePrueba(nombre))
    const participante = crearParticipante({ ...ALTA_POR_DEFECTO, nombre: 'Santiago' })
    await antesDeCerrar.guardarParticipante(participante)
    // La sesión va con el id real del participante, no con el '001' del helper:
    // desde el alta manual cada participante tiene identificador propio.
    await antesDeCerrar.crearSesion({
      ...sesion('s1', '2026-08-20'),
      participanteId: participante.id,
    })
    await antesDeCerrar.registrarSerie(serie('a', 's1', PRESS_BANCA_15_SMITH.id, 45, 10))

    // Act: "se reabre la app" — instancia nueva, mismo nombre de base
    const despuesDeReabrir = new RepositorioLocal(baseDePrueba(nombre), participante.id)

    // Assert
    expect((await despuesDeReabrir.participanteActual())?.nombre).toBe('Santiago')
    expect(await despuesDeReabrir.historialDeEjercicio(participante.id, PRESS_BANCA_15_SMITH.id)).toHaveLength(1)
    expect((await despuesDeReabrir.listarSesiones(participante.id))[0].fecha).toBe('2026-08-20')
  })
})

/**
 * Ojo con estas pruebas: `fake-indexeddb` no conserva los `Blob` —los convierte
 * en objetos planos sin `size` ni contenido—, así que aquí sólo se puede
 * comprobar el **contrato de almacenamiento**: que esté, que se sustituya, que
 * se borre y que no se mezcle entre participantes. Que la imagen viaje entera
 * se verifica en el navegador, donde IndexedDB sí guarda Blobs de verdad.
 */
describe('foto de perfil', () => {
  const imagen = (contenido: string) => new Blob([contenido], { type: 'image/jpeg' })

  test('se guarda y se recupera', async () => {
    // Arrange
    const participante = crearParticipante({ ...ALTA_POR_DEFECTO, nombre: 'Santiago' })
    await repositorio.guardarParticipante(participante)

    // Act
    await repositorio.guardarFotoDePerfil(participante.id, imagen('retrato'))

    // Assert
    expect(await repositorio.obtenerFotoDePerfil(participante.id)).toBeDefined()
  })

  test('cambiarla sustituye la anterior, no acumula', async () => {
    // `put` y no `add`: si acumulara, cada cambio dejaría basura para siempre.
    await repositorio.guardarFotoDePerfil('001', imagen('vieja'))
    await repositorio.guardarFotoDePerfil('001', imagen('nueva'))

    expect(await db.fotosDePerfil.where('id').equals('001').count()).toBe(1)
  })

  test('se puede quitar', async () => {
    await repositorio.guardarFotoDePerfil('001', imagen('retrato'))

    await repositorio.borrarFotoDePerfil('001')

    expect(await repositorio.obtenerFotoDePerfil('001')).toBeUndefined()
  })

  test('sin foto no falla: es opcional', async () => {
    expect(await repositorio.obtenerFotoDePerfil('sin-foto')).toBeUndefined()
  })

  test('quitar la de uno no toca la del otro', async () => {
    // Prepara el terreno para varios participantes sin mezclar sus datos.
    await repositorio.guardarFotoDePerfil('uno', imagen('primero'))
    await repositorio.guardarFotoDePerfil('dos', imagen('segundo'))

    await repositorio.borrarFotoDePerfil('uno')

    expect(await repositorio.obtenerFotoDePerfil('uno')).toBeUndefined()
    expect(await repositorio.obtenerFotoDePerfil('dos')).toBeDefined()
  })

  test('no viaja dentro del participante: leerlo no carga la imagen', async () => {
    // Es la razón de que viva en su propia tabla.
    const participante = crearParticipante({ ...ALTA_POR_DEFECTO, nombre: 'Santiago' })
    await repositorio.guardarParticipante(participante)
    await repositorio.guardarFotoDePerfil(participante.id, imagen('retrato'))

    const leido = await repositorio.obtenerParticipante(participante.id)

    expect(Object.keys(leido!)).not.toContain('imagen')
  })
})
