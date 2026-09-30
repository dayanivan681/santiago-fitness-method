import { describe, expect, it } from 'vitest'
import { puntosDeProgreso, resumenDeProgreso } from './progresoGrafica'
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
    expect(resumenDeProgreso(puntos)).toEqual({ primero: puntos[0], ultimo: puntos[4], diferenciaPeso: 30, diferenciaReps: -2 })
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
