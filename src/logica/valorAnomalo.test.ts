import { describe, expect, it } from 'vitest'
import { anomaliaDePeso, anomaliaDeReps, esTecleoValido, leerNumero } from './valorAnomalo'

describe('anomaliaDePeso', () => {
  it('pregunta por más del doble de lo de partida con un salto de al menos 20 lb', () => {
    expect(anomaliaDePeso(271, { partida: 135, porLado: true })).toBe('raro')
    expect(anomaliaDePeso(270, { partida: 135, porLado: true })).toBeNull()
    // 5 → 12,5 lb dobla, pero no es un error de tecleo.
    expect(anomaliaDePeso(12.5, { partida: 5, porLado: false })).toBeNull()
  })
  it('sin referencia, pregunta sólo por encima del umbral de cada tipo de carga', () => {
    expect(anomaliaDePeso(400, { partida: 0, porLado: true })).toBeNull()
    expect(anomaliaDePeso(401, { partida: 0, porLado: true })).toBe('raro')
    expect(anomaliaDePeso(1000, { partida: 0, porLado: false })).toBeNull()
    expect(anomaliaDePeso(1080, { partida: 0, porLado: false })).toBe('raro')
  })
  it('por encima del tope no es un peso real', () => {
    expect(anomaliaDePeso(51359, { partida: 135, porLado: true })).toBe('tope')
    expect(anomaliaDePeso(1001, { partida: 900, porLado: true })).toBe('tope')
    expect(anomaliaDePeso(2001, { partida: 1900, porLado: false })).toBe('tope')
  })
})

describe('anomaliaDeReps', () => {
  it('con tope prescrito, pregunta por encima del doble y de 10 más', () => {
    expect(anomaliaDeReps(22, 12)).toBeNull()
    expect(anomaliaDeReps(25, 12)).toBe('raro')
    expect(anomaliaDeReps(15, 5)).toBeNull()
    expect(anomaliaDeReps(16, 5)).toBe('raro')
  })
  it('sin tope prescrito, a partir de 51 y nunca más de 200', () => {
    expect(anomaliaDeReps(50, 100)).toBeNull()
    expect(anomaliaDeReps(51, 100)).toBe('raro')
    expect(anomaliaDeReps(201, 100)).toBe('tope')
  })
})

describe('lectura de lo tecleado', () => {
  it('vacío no es un número y la coma vale como decimal', () => {
    expect(leerNumero('')).toBeNull()
    expect(leerNumero(',')).toBeNull()
    expect(leerNumero('12,5')).toBe(12.5)
    expect(leerNumero('0135')).toBe(135)
  })
  it('acepta hasta 4 cifras y, si toca, 2 decimales', () => {
    expect(esTecleoValido('1080', true)).toBe(true)
    expect(esTecleoValido('10800', true)).toBe(false)
    expect(esTecleoValido('12,25', true)).toBe(true)
    expect(esTecleoValido('12,5', false)).toBe(false)
    expect(esTecleoValido('8a', false)).toBe(false)
  })
})
