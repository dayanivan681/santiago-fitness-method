import 'fake-indexeddb/auto'
import { describe, test, expect, beforeEach } from 'vitest'
import { repositorioDePrueba } from '../pruebas/base'
import { sembrar } from './semilla'
import { sembrarParticipante } from '../pruebas/participante'
import { aBase64, aBlob, exportarRespaldo, restaurarRespaldo } from './respaldo'
import { PRESS_BANCA_15_SMITH } from './semilla/biblioteca'
import { idSustitucion } from '../logica/sustitucion'
import { fechaDeHoy } from './repositorio'
import type { RepositorioLocal } from './repositorioLocal'
import type { Participante } from '../dominio/tipos'

let repositorio: RepositorioLocal
let participante: Participante

beforeEach(async () => {
  repositorio = repositorioDePrueba()
  await sembrar(repositorio)
  participante = await sembrarParticipante(repositorio, { nombre: 'Santiago' })

  await repositorio.crearSesion({
    id: 's1',
    participanteId: participante.id,
    plantillaDiaId: `${participante.id}|upper-a`,
    fecha: '2026-08-20',
    completadaEn: '2026-08-20T11:00:00.000Z',
  })
  await repositorio.registrarSerie({
    id: 'serie-1',
    sesionId: 's1',
    ejercicioId: PRESS_BANCA_15_SMITH.id,
    numeroSerie: 1,
    pesoRegistradoLb: 45,
    repsRealizadas: 10,
    rir: 2,
    instante: '2026-08-20T10:00:00.000Z',
  })
  await repositorio.guardarProgreso({
    id: 'p1',
    participanteId: participante.id,
    fecha: '2026-08-20',
    medidas: { cinturaPulgadas: 34 },
    tieneFoto: false,
  })
})

describe('exportar', () => {
  test('se lleva todo lo del participante', async () => {
    const respaldo = await exportarRespaldo(repositorio, participante.id)

    expect(respaldo.participante.nombre).toBe('Santiago')
    expect(respaldo.plantillas).toHaveLength(4)
    expect(respaldo.sesiones).toHaveLength(1)
    expect(respaldo.series).toHaveLength(1)
    expect(respaldo.progreso).toHaveLength(1)
  })

  test('conserva lo que hace falta para no falsear el historial (§5, §19)', async () => {
    const respaldo = await exportarRespaldo(repositorio, participante.id)

    expect(respaldo.series[0].instante).toBe('2026-08-20T10:00:00.000Z')
    expect(respaldo.sesiones[0].completadaEn).toBe('2026-08-20T11:00:00.000Z')
  })

  test('no arrastra la biblioteca: la trae la app, no el respaldo', async () => {
    // Son 33 ejercicios con foto. Meterlos multiplicaría el archivo sin aportar
    // nada: se recrean solos al abrir la app.
    const respaldo = await exportarRespaldo(repositorio, participante.id)

    expect(respaldo).not.toHaveProperty('ejercicios')
  })
})

describe('restaurar', () => {
  test('devuelve los datos a una instalación vacía', async () => {
    // Arrange
    const respaldo = await exportarRespaldo(repositorio, participante.id)
    const nueva = repositorioDePrueba()
    await sembrar(nueva)

    // Act
    await restaurarRespaldo(nueva, respaldo)

    // Assert
    const restaurado = await nueva.participanteActual()
    expect(restaurado?.nombre).toBe('Santiago')
    expect(await nueva.listarPlantillas(restaurado!.id)).toHaveLength(4)
    expect(
      await nueva.historialDeEjercicio(restaurado!.id, PRESS_BANCA_15_SMITH.id),
    ).toHaveLength(1)
    expect(await nueva.listarProgreso(restaurado!.id)).toHaveLength(1)
  })

  test('el historial restaurado conserva su fecha, no la de hoy', async () => {
    const respaldo = await exportarRespaldo(repositorio, participante.id)
    const nueva = repositorioDePrueba()
    await sembrar(nueva)

    await restaurarRespaldo(nueva, respaldo)

    const [serie] = await nueva.historialDeEjercicio(
      respaldo.participante.id,
      PRESS_BANCA_15_SMITH.id,
    )
    expect(serie.fecha).toBe('2026-08-20')
    expect(serie.instante).toBe('2026-08-20T10:00:00.000Z')
  })

  test('restaurar dos veces no duplica el historial', async () => {
    // Reimportar el mismo archivo es un error fácil de cometer.
    const respaldo = await exportarRespaldo(repositorio, participante.id)
    const nueva = repositorioDePrueba()
    await sembrar(nueva)

    await restaurarRespaldo(nueva, respaldo)
    await restaurarRespaldo(nueva, respaldo)

    expect(
      await nueva.historialDeEjercicio(respaldo.participante.id, PRESS_BANCA_15_SMITH.id),
    ).toHaveLength(1)
  })

  test('una ida y vuelta completa deja los mismos datos', async () => {
    const original = await exportarRespaldo(repositorio, participante.id)
    const nueva = repositorioDePrueba()
    await sembrar(nueva)

    await restaurarRespaldo(nueva, original)
    const devuelto = await exportarRespaldo(nueva, participante.id)

    expect(devuelto.participante).toEqual(original.participante)
    expect(devuelto.series).toEqual(original.series)
    expect(devuelto.sesiones).toEqual(original.sesiones)
    expect(devuelto.progreso).toEqual(original.progreso)
  })
})

describe('las fotos viajan dentro del archivo', () => {
  // `fake-indexeddb` no conserva Blobs, así que la ida y vuelta completa por la
  // base de datos se verifica en el navegador. Aquí se prueba la conversión,
  // que es donde estaba el riesgo real de exportar imágenes vacías.
  test('una imagen se convierte a base64 y vuelve igual', () => {
    // Arrange: bytes reconocibles, incluidos los que rompen un texto normal
    const original = new Uint8Array([0xff, 0xd8, 0xff, 0x00, 0x10, 0xfe])

    // Act
    const texto = aBase64(original.buffer)
    const devuelto = aBlob({ id: 'x', tipo: 'image/jpeg', datos: texto })

    // Assert
    expect(texto).not.toBe('')
    expect(devuelto.type).toBe('image/jpeg')
    expect(devuelto.size).toBe(original.length)
  })

  test('aguanta una foto grande sin reventar la pila', () => {
    // Convertir de golpe una imagen de cientos de kB desborda los argumentos de
    // String.fromCharCode; por eso se hace por trozos.
    const grande = new Uint8Array(300_000).fill(0x41)

    expect(() => aBase64(grande.buffer)).not.toThrow()
    expect(aBase64(grande.buffer).length).toBeGreaterThan(100_000)
  })
})

describe('las sustituciones del día', () => {
  test('viajan en la copia y vuelven al restaurar', async () => {
    // Restaurar a media sesión sin ellas devolvería el día a la variante de la
    // plantilla sin avisar, y el participante vería otro ejercicio del que está
    // haciendo.
    // Arrange
    // La misma noción de "hoy" que usa la app: local, no UTC.
    const hoy = fechaDeHoy()
    await repositorio.guardarSustitucion({
      id: idSustitucion(participante.id, hoy, 'upper-a', 1),
      participanteId: participante.id,
      fecha: hoy,
      plantillaDiaId: `${participante.id}|upper-a`,
      orden: 1,
      ejercicioId: 'press-banca-barra',
    })

    // Act
    const copia = await exportarRespaldo(repositorio, participante.id)
    const nueva = repositorioDePrueba()
    await sembrar(nueva)
    await restaurarRespaldo(nueva, copia)

    // Assert
    expect(copia.sustituciones).toHaveLength(1)
    const restauradas = await nueva.listarSustituciones(participante.id, hoy)
    expect(restauradas[0].ejercicioId).toBe('press-banca-barra')
  })

  test('las de días pasados no se arrastran: ya no cambian nada', async () => {
    await repositorio.guardarSustitucion({
      id: idSustitucion(participante.id, '2026-01-05', 'upper-a', 1),
      participanteId: participante.id,
      fecha: '2026-01-05',
      plantillaDiaId: `${participante.id}|upper-a`,
      orden: 1,
      ejercicioId: 'press-banca-barra',
    })

    const copia = await exportarRespaldo(repositorio, participante.id)

    expect(copia.sustituciones).toHaveLength(0)
  })
})
