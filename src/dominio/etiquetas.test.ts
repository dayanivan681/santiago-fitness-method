import { describe, expect, it } from 'vitest'
import { ETIQUETA_CARGA, NOMBRE_MUSCULO, etiquetaCarga, etiquetaEquipo } from './etiquetas'
import { ETIQUETA_EQUIPO, ETIQUETA_MUSCULO } from '../producto/etiquetasBiblioteca'
import { EQUIPOS, MUSCULOS } from '../../shared/v2/biblioteca'
import { BIBLIOTECA_INICIAL } from '../datos/semilla/biblioteca'

describe('una sola fuente de etiquetas', () => {
  it('el panel del coach y la app del cliente nombran igual cada equipo y músculo', () => {
    for (const e of EQUIPOS) expect(ETIQUETA_EQUIPO[e]).toBe(etiquetaEquipo(e))
    for (const m of MUSCULOS) expect(ETIQUETA_MUSCULO[m]).toBe(NOMBRE_MUSCULO[m])
  })

  it('usa los textos claros del panel', () => {
    expect(NOMBRE_MUSCULO.deltoideAnterior).toBe('Hombro (frontal)')
    expect(NOMBRE_MUSCULO.femoral).toBe('Femorales')
    expect(NOMBRE_MUSCULO.core).toBe('Abdomen y core')
    expect(etiquetaEquipo('cable')).toBe('Polea / cable')
    expect(etiquetaEquipo('smith')).toBe('Máquina Smith')
  })
})

describe('etiquetaCarga', () => {
  it('en peso corporal, «discos añadidos» es el lastre', () => {
    expect(etiquetaCarga('discosAnadidos', 'pesoCorporal')).toBe('Lastre añadido')
    expect(etiquetaCarga('discosAnadidos', 'maquinaDiscos')).toBe(ETIQUETA_CARGA.discosAnadidos)
    expect(etiquetaCarga('porLado', 'barraLibre')).toBe(ETIQUETA_CARGA.porLado)
  })

  it('las dominadas y los fondos, que se lastran, también dicen lastre; el hip thrust no cambia', () => {
    const por = (id: string) => BIBLIOTECA_INICIAL.find((e) => e.id === id)!
    for (const id of ['dominadas', 'fondos-triceps', 'sfm-catalog-c256']) {
      const e = por(id)
      expect(etiquetaCarga(e.tipoCarga, e.equipo)).toBe('Lastre añadido')
    }
    const hip = por('hip-thrust-barra')
    expect(etiquetaCarga(hip.tipoCarga, hip.equipo)).toBe(ETIQUETA_CARGA[hip.tipoCarga])
  })
})
