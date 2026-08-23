import { describe, test, expect } from 'vitest'
import {
  ALTA_POR_DEFECTO,
  EDAD_MAXIMA,
  EDAD_MINIMA,
  crearParticipante,
  erroresDeAlta,
} from './participante'

const alta = (parcial: Partial<typeof ALTA_POR_DEFECTO> = {}) => ({
  ...ALTA_POR_DEFECTO,
  nombre: 'Santiago',
  ...parcial,
})

describe('alta de un participante real (criterio 1)', () => {
  test('los valores por defecto sólo dejan el nombre por escribir', () => {
    // El criterio del cliente es darlo de alta en menos de dos minutos: todo
    // viene con un estimado razonable y el coach corrige lo que importa.
    expect(erroresDeAlta(ALTA_POR_DEFECTO)).toEqual(['Escribe el nombre del participante.'])
    expect(erroresDeAlta(alta())).toEqual([])
  })

  test('crea un participante con identificador propio', () => {
    // Arrange + Act
    const uno = crearParticipante(alta())
    const otro = crearParticipante(alta({ nombre: 'Ana' }))

    // Assert: la arquitectura admite más de uno aunque el piloto tenga uno solo
    expect(uno.id).not.toBe(otro.id)
    expect(uno.nombre).toBe('Santiago')
  })

  test('nace sin ejercicios restringidos', () => {
    expect(crearParticipante(alta()).ejerciciosEvitados).toEqual([])
  })

  test('recorta los espacios del nombre', () => {
    expect(crearParticipante(alta({ nombre: '  Santiago  ' })).nombre).toBe('Santiago')
  })
})

describe('validación del alta', () => {
  test('un nombre en blanco no vale', () => {
    expect(erroresDeAlta(alta({ nombre: '   ' }))).toContain(
      'Escribe el nombre del participante.',
    )
  })

  test('la edad tiene que ser plausible', () => {
    const mensaje = `La edad debe estar entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años.`

    expect(erroresDeAlta(alta({ edad: 0 }))).toContain(mensaje)
    expect(erroresDeAlta(alta({ edad: 130 }))).toContain(mensaje)
  })

  test('la estatura y el peso no pueden ser cero', () => {
    expect(erroresDeAlta(alta({ estaturaCm: 0 }))).toContain('Falta la estatura.')
    expect(erroresDeAlta(alta({ pesoCorporalLb: 0 }))).toContain('Falta el peso corporal.')
  })

  test('no se entrena ocho días a la semana', () => {
    expect(erroresDeAlta(alta({ frecuenciaEntrenamiento: 8 }))).toContain(
      'Los entrenos por semana van de 1 a 7.',
    )
  })

  test('las limitaciones pueden quedar vacías', () => {
    // §2 las pide, pero no tener ninguna es lo normal.
    expect(erroresDeAlta(alta({ limitaciones: '' }))).toEqual([])
  })

  test('junta todo lo que falta, no sólo el primer error', () => {
    // Corregir de uno en uno sería una pérdida de tiempo en el móvil.
    const errores = erroresDeAlta(alta({ nombre: '', edad: 0, pesoCorporalLb: 0 }))

    expect(errores).toHaveLength(3)
  })
})
