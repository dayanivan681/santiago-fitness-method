import 'fake-indexeddb/auto'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect, beforeEach } from 'vitest'
import { baseDePrueba } from '../../pruebas/base'
import { RepositorioLocal } from '../repositorioLocal'
import { crearDiasIniciales, sembrar } from './index'
import { BIBLIOTECA_INICIAL, PRESS_BANCA_15_SMITH, SENTADILLA_BARRA } from './biblioteca'

let repositorio: RepositorioLocal

beforeEach(() => {
  const db = baseDePrueba(`prueba-semilla-${crypto.randomUUID()}`)
  repositorio = new RepositorioLocal(db)
})

describe('biblioteca (§15, §23)', () => {
  test('cada ejercicio apunta a una imagen que existe de verdad', () => {
    // Una ruta mal escrita dejaría al participante sin poder identificar el
    // ejercicio, que es justo lo que §15 quiere evitar.
    for (const ejercicio of BIBLIOTECA_INICIAL) {
      const ruta = join(process.cwd(), 'public', ejercicio.imagen)
      expect(existsSync(ruta), `falta la imagen de ${ejercicio.nombre}`).toBe(true)
    }
  })

  test('no hay ids repetidos', () => {
    const ids = BIBLIOTECA_INICIAL.map((e) => e.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  test('cubre todos los músculos con objetivo semanal (§20)', () => {
    // Sin ejercicios para un músculo, su objetivo de volumen es inalcanzable.
    const primarios = new Set(BIBLIOTECA_INICIAL.map((e) => e.musculoPrimario))

    for (const musculo of [
      'pecho',
      'espalda',
      'cuadriceps',
      'gluteos',
      'femoral',
      'biceps',
      'triceps',
      'deltoideLateral',
    ] as const) {
      expect(primarios.has(musculo), `ningún ejercicio para ${musculo}`).toBe(true)
    }
  })
})

describe('sembrar (§13, §23, §27)', () => {
  test('renombrar conserva historial, plantilla y calibración tras dos arranques', async () => {
    const id = 'press-banca-15-smith'
    await repositorio.guardarEjercicio({
      ...PRESS_BANCA_15_SMITH, id, nombre: 'Press banca 15° Smith',
      pesoBaseMaquinaLb: 15, incrementoMinimoLb: 2.5,
    })
    await repositorio.crearSesion({
      id: 'sesion-legacy', participanteId: 'qa-nombres',
      plantillaDiaId: 'upper-a', fecha: '2026-09-01',
    })
    await repositorio.registrarSerie({
      id: 'serie-legacy', sesionId: 'sesion-legacy', ejercicioId: id,
      numeroSerie: 1, pesoRegistradoLb: 45, repsRealizadas: 5, rir: 2,
    })
    const antes = await repositorio.historialDeEjercicio('qa-nombres', id)
    await crearDiasIniciales(repositorio, 'qa-nombres')
    const plantillas = await repositorio.listarPlantillas('qa-nombres')

    await sembrar(repositorio)
    await sembrar(repositorio)

    expect(await repositorio.historialDeEjercicio('qa-nombres', id)).toEqual(antes)
    expect(await repositorio.listarPlantillas('qa-nombres')).toEqual(plantillas)
    expect(await repositorio.obtenerEjercicio(id)).toMatchObject({
      id, nombre: 'Press inclinado bajo (15°) en Smith',
      angulo: '15°', pesoBaseMaquinaLb: 15, incrementoMinimoLb: 2.5,
    })
  })

  test('carga la biblioteca completa la primera vez', async () => {
    await sembrar(repositorio)

    const guardados = await repositorio.listarEjercicios()
    expect(guardados).toHaveLength(BIBLIOTECA_INICIAL.length)
  })

  test('es idempotente: sembrar dos veces no duplica nada', async () => {
    await sembrar(repositorio)
    await sembrar(repositorio)

    expect(await repositorio.listarEjercicios()).toHaveLength(BIBLIOTECA_INICIAL.length)
  })

  test('añade los ejercicios nuevos a una biblioteca ya existente', async () => {
    // Arrange: una instalación antigua que sólo tenía un ejercicio
    await repositorio.guardarEjercicio(PRESS_BANCA_15_SMITH)

    // Act
    await sembrar(repositorio)

    // Assert: los demás se incorporan sin reinstalar
    const guardados = await repositorio.listarEjercicios()
    expect(guardados).toHaveLength(BIBLIOTECA_INICIAL.length)
    expect(guardados.some((e) => e.id === SENTADILLA_BARRA.id)).toBe(true)
  })

  test('no pisa los incrementos que el coach corrigió en el gimnasio', async () => {
    // Arrange: el coach midió la barra del Smith y ajustó el salto real (§13, §27)
    await repositorio.guardarEjercicio({
      ...PRESS_BANCA_15_SMITH,
      pesoBaseMaquinaLb: 15,
      incrementoMinimoLb: 2.5,
    })

    // Act
    await sembrar(repositorio)

    // Assert: su medición sobrevive al arranque
    const guardado = await repositorio.obtenerEjercicio(PRESS_BANCA_15_SMITH.id)
    expect(guardado?.pesoBaseMaquinaLb).toBe(15)
    expect(guardado?.incrementoMinimoLb).toBe(2.5)
  })

  test('rellena la imagen si la instalación antigua no la tenía', async () => {
    await repositorio.guardarEjercicio({ ...PRESS_BANCA_15_SMITH, imagen: '' })

    await sembrar(repositorio)

    const guardado = await repositorio.obtenerEjercicio(PRESS_BANCA_15_SMITH.id)
    expect(guardado?.imagen).toBe(PRESS_BANCA_15_SMITH.imagen)
  })

  test('rellena el patrón de movimiento de una instalación anterior a §23', async () => {
    // Sin él, "cambiar variante" ofrecería la biblioteca entera en vez de las
    // variantes del mismo movimiento (§16).
    // Arrange: una fila guardada antes de que el campo existiera
    const { movimiento: _omitido, ...sinMovimiento } = PRESS_BANCA_15_SMITH
    await repositorio.guardarEjercicio(sinMovimiento as typeof PRESS_BANCA_15_SMITH)

    // Act
    await sembrar(repositorio)

    // Assert
    const guardado = await repositorio.obtenerEjercicio(PRESS_BANCA_15_SMITH.id)
    expect(guardado?.movimiento).toBe('press-pecho')
  })

  test('refresca el contenido de la app sin tocar la calibración del coach', async () => {
    // Arrange: el coach midió la barra y ajustó el salto; además la fila trae
    // un nombre viejo y le falta el movimiento.
    await repositorio.guardarEjercicio({
      ...PRESS_BANCA_15_SMITH,
      nombre: 'Nombre antiguo',
      movimiento: '',
      pesoBaseMaquinaLb: 15,
      incrementoMinimoLb: 2.5,
    })

    // Act
    await sembrar(repositorio)

    // Assert
    const guardado = await repositorio.obtenerEjercicio(PRESS_BANCA_15_SMITH.id)
    expect(guardado?.nombre).toBe(PRESS_BANCA_15_SMITH.nombre)
    expect(guardado?.movimiento).toBe('press-pecho')
    expect(guardado?.pesoBaseMaquinaLb).toBe(15)
    expect(guardado?.incrementoMinimoLb).toBe(2.5)
  })
})
