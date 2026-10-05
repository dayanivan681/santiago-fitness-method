import { describe, expect, it } from 'vitest'
import { puntosDeProgreso, resumenDeProgreso, escalaDe, ejercicioMasReciente, huecosDeTiempo, textoDeEsfuerzo, type PuntoProgreso } from './progresoGrafica'
import { PRESS_BANCA_15_SMITH } from '../datos/semilla/biblioteca'
import { aplicarCorreccion } from './correccion'
import type { SerieConFecha } from '../datos/referencias'

const ejercicio = { ...PRESS_BANCA_15_SMITH, tipoCarga: 'total' as const }
const serie = (peso: number, reps = 12): SerieConFecha => ({
  id: 's', sesionId: 'sesion', ejercicioId: ejercicio.id, numeroSerie: 1,
  fecha: '2026-08-12', pesoRegistradoLb: peso, repsRealizadas: reps, rir: 2,
})
const sesion = (series: SerieConFecha[], fecha = '2026-08-12') => ({ fecha, series, sinTerminar: false })

describe('puntos de progreso', () => {
  it('ordena el ejemplo Hip Thrust y resume los extremos sin mutar las sesiones', () => {
    const sesiones = [[180,12],[190,12],[200,10],[200,12],[210,10]].map(([peso,reps], i) =>
      sesion([serie(peso,reps)], `2026-08-${12+i}`)).reverse()
    const puntos = puntosDeProgreso(sesiones, ejercicio)
    expect(puntos.map(p => [p.pesoLb,p.reps])).toEqual([[180,12],[190,12],[200,10],[200,12],[210,10]])
    expect(resumenDeProgreso(puntos)).toEqual({ primero: puntos[0], ultimo: puntos[4], diferenciaPeso: 30, diferenciaReps: -2, rirPrimero: 2, rirUltimo: 2 })
    expect(sesiones[0].fecha).toBe('2026-08-16')
  })
  it('ignora calentamientos y sesiones sin series efectivas', () => {
    expect(puntosDeProgreso([sesion([{...serie(300), esCalentamiento: true},serie(180)])], ejercicio)[0].pesoLb).toBe(180)
    expect(puntosDeProgreso([sesion([{...serie(300), esCalentamiento: true}])], ejercicio)).toEqual([])
  })
  it('prioriza carga y desempata por repeticiones', () => {
    expect(puntosDeProgreso([sesion([serie(100,20),serie(200,10),serie(200,12)])], ejercicio)[0]).toMatchObject({pesoLb:200,reps:12})
  })
  it('usa valores corregidos, conservando el RIR vigente', () => {
    const original = serie(200)
    const corregida = {...aplicarCorreccion(original,{pesoRegistradoLb:190,repsRealizadas:10,rir:3}),fecha:original.fecha}
    expect(puntosDeProgreso([sesion([corregida])], ejercicio)[0]).toMatchObject({pesoLb:190,reps:10,rir:3})
  })
  it('conserva peso por lado y maneja cero o una sesión', () => {
    expect(resumenDeProgreso([])).toBeNull()
    const puntos = puntosDeProgreso([sesion([serie(45)])], {...ejercicio,tipoCarga:'porLado'})
    expect(puntos[0]).toMatchObject({pesoLb:45,porLado:true})
    expect(resumenDeProgreso(puntos)).toMatchObject({diferenciaPeso:0,diferenciaReps:0})
  })
})

describe('escalaDe', () => {
  it('ajusta el peso a los valores con paso 5 y un paso de margen', () => {
    expect(escalaDe([25, 30], 5, 10)).toEqual({ min: 20, max: 35 })
    expect(escalaDe([180, 195, 210], 5, 10)).toEqual({ min: 175, max: 215 })
  })
  it('amplía un rango pequeño y centra una línea plana', () => {
    expect(escalaDe([20, 20, 20], 1, 4)).toEqual({ min: 18, max: 22 })
    expect(escalaDe([100], 5, 10)).toEqual({ min: 95, max: 105 })
  })
  it('nunca baja de 0', () => {
    expect(escalaDe([0, 5], 5, 10).min).toBe(0)
    expect(escalaDe([1, 1], 1, 4).min).toBe(0)
  })
})

describe('ejercicioMasReciente', () => {
  const s = (ejercicioId: string, fecha: string, numeroSerie = 1, instante?: string) => ({ ejercicioId, fecha, numeroSerie, instante })
  it('elige el de la sesión más reciente; en empate, la serie más tardía', () => {
    expect(ejercicioMasReciente([s('a', '2026-09-10'), s('z', '2026-09-29'), s('m', '2026-09-20')])).toBe('z')
    expect(ejercicioMasReciente([s('a', '2026-09-29', 1, '2026-09-29T10:00:00Z'), s('b', '2026-09-29', 1, '2026-09-29T10:20:00Z')])).toBe('b')
    expect(ejercicioMasReciente([s('a', '2026-09-29', 4), s('b', '2026-09-29', 2)])).toBe('a')
    expect(ejercicioMasReciente([])).toBeUndefined()
  })
})

const punto = (fecha: string, rir = 2): PuntoProgreso => ({ fecha, pesoLb: 100, porLado: false, reps: 10, rir })

describe('huecos de tiempo', () => {
  it('cinco sesiones con una pausa de 21 días: un hueco de «3 sem»', () => {
    const puntos = ['2026-08-01', '2026-08-05', '2026-08-09', '2026-08-30', '2026-09-03'].map((f) => punto(f))
    expect(huecosDeTiempo(puntos)).toEqual([{ desde: 2, hasta: 3, dias: 21, semanas: 3, texto: '3 sem' }])
  })

  it('pausas de 10 días no son huecos', () => {
    const puntos = ['2026-08-01', '2026-08-11', '2026-08-21', '2026-08-31'].map((f) => punto(f))
    expect(huecosDeTiempo(puntos)).toEqual([])
  })

  it('el umbral es exacto: 14 días no cuenta, 15 sí', () => {
    expect(huecosDeTiempo([punto('2026-08-01'), punto('2026-08-15')])).toEqual([])
    expect(huecosDeTiempo([punto('2026-08-01'), punto('2026-08-16')])).toHaveLength(1)
  })

  it('cruza el cambio de mes y de horario sin descuadrar días', () => {
    expect(huecosDeTiempo([punto('2026-10-20'), punto('2026-11-10')])[0]).toMatchObject({ dias: 21, texto: '3 sem' })
  })
})

describe('comparación de esfuerzo en el titular', () => {
  it('mismo RIR', () => {
    expect(textoDeEsfuerzo(2, 2)).toBe('con el mismo esfuerzo (RIR 2)')
  })
  it('menos RIR al final: más esfuerzo', () => {
    expect(textoDeEsfuerzo(3, 1)).toBe('con más esfuerzo (RIR 3 → 1)')
  })
  it('más RIR al final: menos esfuerzo, mejora clara', () => {
    expect(textoDeEsfuerzo(1, 3)).toBe('con menos esfuerzo (RIR 1 → 3)')
  })
  it('el tope se escribe 5+', () => {
    expect(textoDeEsfuerzo(5, 5)).toBe('con el mismo esfuerzo (RIR 5+)')
    expect(textoDeEsfuerzo(2, 5)).toBe('con menos esfuerzo (RIR 2 → 5+)')
  })
  it('el resumen trae el RIR del primer y el último punto', () => {
    expect(resumenDeProgreso([punto('2026-08-01', 3), punto('2026-08-08', 1)])).toMatchObject({ rirPrimero: 3, rirUltimo: 1 })
  })
})
