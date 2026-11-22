import { describe, expect, it } from 'vitest'
import { coincide, coincideTexto, normalizarBusqueda } from './busqueda'
import { BIBLIOTECA_INICIAL, PRESS_BANCA_15_SMITH } from '../datos/semilla/biblioteca'
import type { Ejercicio } from '../dominio/tipos'

describe('normalizarBusqueda', () => {
  it('encuentra una palabra con tilde escribiéndola sin ella', () => {
    // En un teclado de móvil casi nadie escribe la tilde, y sin esto
    // «elevacion» no encontraría «Elevación lateral».
    expect(normalizarBusqueda('Elevación')).toBe(normalizarBusqueda('elevacion'))
    expect(normalizarBusqueda('Aducción de cadera')).toContain('aduccion')
  })

  it('ignora mayúsculas y espacios de los extremos', () => {
    expect(normalizarBusqueda('  SMITH  ')).toBe('smith')
  })

  it('conserva los espacios interiores, que separan palabras', () => {
    expect(normalizarBusqueda('Press de banca')).toBe('press de banca')
  })

  it('deja pasar el texto vacío sin inventar nada', () => {
    expect(normalizarBusqueda('')).toBe('')
  })
})

describe('coincide: busca también por músculo y equipo', () => {
  // Muchos nombres de la Biblioteca Maestra están en inglés: quien escribe en
  // español tiene que encontrarlos igual.
  const hombro: Ejercicio = {
    ...PRESS_BANCA_15_SMITH,
    nombre: 'Selectorized Shoulder Press',
    musculoPrimario: 'deltoideAnterior',
    equipo: 'maquinaTradicional',
  }
  const cable: Ejercicio = { ...hombro, nombre: 'Cable Machine Shoulder Press', equipo: 'cable' }
  const hack: Ejercicio = { ...PRESS_BANCA_15_SMITH, nombre: 'Hack squat', musculoPrimario: 'cuadriceps' }

  it('«hombro» encuentra un press de hombro con nombre en inglés', () => {
    expect(coincide(hombro, normalizarBusqueda('hombro'))).toBe(true)
  })

  it('«polea» encuentra los ejercicios de cable', () => {
    expect(coincide(cable, normalizarBusqueda('polea'))).toBe(true)
    expect(coincide(hombro, normalizarBusqueda('polea'))).toBe(false)
  })

  it('el nombre sigue mandando: «hack» encuentra el hack squat', () => {
    expect(coincide(hack, normalizarBusqueda('hack'))).toBe(true)
    expect(coincide(hombro, normalizarBusqueda('hack'))).toBe(false)
  })

  it('sin acentos: «cuadriceps» encuentra Cuádriceps', () => {
    expect(coincide(hack, normalizarBusqueda('cuadriceps'))).toBe(true)
  })
})

describe('coincide: español ↔ inglés (QA 20-nov)', () => {
  // La base está en español y la biblioteca del coach en inglés.
  const buscar = (texto: string, lista: readonly Ejercicio[]) =>
    lista.filter((e) => coincide(e, normalizarBusqueda(texto))).map((e) => e.nombre)
  const coach: Ejercicio[] = [
    { ...PRESS_BANCA_15_SMITH, id: 'c1', nombre: 'Dumbbell Lateral Raise', musculoPrimario: 'deltoideLateral', equipo: 'mancuernas' },
    { ...PRESS_BANCA_15_SMITH, id: 'c2', nombre: 'Goblet Squat', musculoPrimario: 'cuadriceps', equipo: 'mancuernas' },
    { ...PRESS_BANCA_15_SMITH, id: 'c3', nombre: 'Romanian Deadlift', musculoPrimario: 'femoral', equipo: 'barraLibre' },
    { ...PRESS_BANCA_15_SMITH, id: 'c4', nombre: 'Barbell Bench Press', musculoPrimario: 'pecho', equipo: 'barraLibre' },
    { ...PRESS_BANCA_15_SMITH, id: 'c5', nombre: 'Seated Cable Row', musculoPrimario: 'espalda', equipo: 'cable' },
  ]
  const todos = [...BIBLIOTECA_INICIAL, ...coach]

  it('«lateral raise» encuentra «Elevación lateral» además de los nombres en inglés', () => {
    const hallados = buscar('lateral raise', todos)
    expect(hallados).toContain('Elevación lateral con mancuernas')
    expect(hallados).toContain('Elevación lateral en polea')
    expect(hallados).toContain('Dumbbell Lateral Raise')
  })

  it('«squat» encuentra la sentadilla con barra y no sólo el hack squat', () => {
    const hallados = buscar('squat', todos)
    expect(hallados).toEqual(expect.arrayContaining(['Sentadilla con barra', 'Hack squat', 'Goblet Squat']))
    expect(hallados).not.toContain('Curl con barra')
  })

  it('al revés: el español encuentra los nombres en inglés del coach', () => {
    expect(buscar('sentadilla', todos)).toContain('Goblet Squat')
    expect(buscar('elevación lateral', todos)).toContain('Dumbbell Lateral Raise')
    expect(buscar('peso muerto rumano', todos)).toContain('Romanian Deadlift')
    expect(buscar('press banca', todos)).toContain('Barbell Bench Press')
    expect(buscar('remo', todos)).toContain('Seated Cable Row')
  })

  it('los términos comunes encuentran su ficha en español', () => {
    expect(buscar('deadlift', todos)).toContain('Peso muerto rumano con barra')
    expect(buscar('bench press', todos)).toContain('Press de banca plano con barra')
    expect(buscar('row', todos)).toContain('Remo sentado en polea')
    expect(buscar('lunges', todos)).toContain('Zancadas con mancuernas')
    expect(buscar('hip thrust', todos)).toContain('Hip thrust con barra')
    expect(buscar('calf', todos)).toContain('Standing calf raise en máquina')
    expect(buscar('pulldown', todos)).toContain('Jalón unilateral en polea alta')
    expect(buscar('hammer curl', todos)).toContain('Curl martillo')
    expect(buscar('leg press', todos)).toContain('Prensa de piernas')
    expect(buscar('dumbbell curl', todos)).toContain('Curl con mancuernas')
  })

  it('sigue sin tildes y por trozos, y no inventa coincidencias', () => {
    expect(buscar('elevacion', todos)).toContain('Elevación lateral con mancuernas')
    expect(buscar('elev', todos)).toContain('Elevación lateral con mancuernas')
    expect(buscar('squat', todos)).not.toContain('Dumbbell Lateral Raise')
    expect(buscar('lateral raise', todos)).not.toContain('Goblet Squat')
    expect(buscar('zzz', todos)).toEqual([])
  })
})

describe('coincideTexto: el buscador de fichas del catálogo', () => {
  it('es bilingüe, sin tildes, y vacío lo encuentra todo', () => {
    expect(coincideTexto('Sentadilla con barra', normalizarBusqueda('squat'))).toBe(true)
    expect(coincideTexto('Elevación lateral con mancuernas', normalizarBusqueda('lateral raise'))).toBe(true)
    expect(coincideTexto('Elevación lateral con mancuernas', normalizarBusqueda('elevacion'))).toBe(true)
    expect(coincideTexto('Curl con barra', normalizarBusqueda('squat'))).toBe(false)
    expect(coincideTexto('Curl con barra', '')).toBe(true)
  })
})
