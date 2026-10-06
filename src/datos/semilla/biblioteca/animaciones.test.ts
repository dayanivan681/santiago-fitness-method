import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { EJERCICIOS_BASE } from '../../../../shared/ejercicios-base'
import { AMPLIACION_UNILATERAL, BIBLIOTECA_INICIAL, EMPUJE, PIERNA, TRACCION } from '.'
import {
  IDS_CON_ANIMACION_BASE,
  NOTAS_ANIMACION_BASE,
  RUTA_ANIMACIONES_BASE,
  VERSION_ANIMACION_BASE,
  conAnimacionBase,
  esAnimacionBase,
} from './animaciones'

const SIN_EQUIVALENTE_LIBRE = [
  'sfm-catalog-c026', 'sfm-catalog-c031', 'sfm-catalog-c059', 'sfm-catalog-c077',
  'sfm-catalog-c102', 'sfm-catalog-c107', 'sfm-catalog-c147', 'sfm-catalog-c161',
  'sfm-catalog-c194', 'sfm-catalog-c204', 'sfm-catalog-c217',
]
const publico = (ruta: string) => `public${ruta}`
const esGif = (ruta: string) => readFileSync(publico(ruta), 'latin1').startsWith('GIF89a')

describe('animaciones del catálogo base', () => {
  it('sólo apuntan a ejercicios base, y cada una existe como GIF', () => {
    const base = new Set(EJERCICIOS_BASE.map((e) => e.id))
    for (const id of IDS_CON_ANIMACION_BASE) {
      expect(base.has(id), id).toBe(true)
      const ruta = `${RUTA_ANIMACIONES_BASE}${id}.gif`
      expect(existsSync(publico(ruta)), ruta).toBe(true)
      expect(esGif(ruta), ruta).toBe(true)
    }
  })

  it('46 de los 57 base tienen animación; los 11 sin equivalente libre siguen con su foto', () => {
    const conAnimacion = BIBLIOTECA_INICIAL.filter((e) => e.animacion)
    expect(BIBLIOTECA_INICIAL).toHaveLength(57)
    expect(conAnimacion).toHaveLength(46)
    for (const id of SIN_EQUIVALENTE_LIBRE) expect(BIBLIOTECA_INICIAL.find((e) => e.id === id)?.animacion, id).toBeUndefined()
  })

  it('no cambia ids, nombres, fotos ni nada más de la ficha', () => {
    const originales = [...EMPUJE, ...TRACCION, ...PIERNA, ...AMPLIACION_UNILATERAL]
    BIBLIOTECA_INICIAL.forEach((e, i) => {
      const { animacion: _animacion, notaAnimacion: _nota, ...resto } = e
      expect(resto).toEqual(originales[i])
    })
  })

  it('deja intacta la ficha original y reconoce sus rutas frente a las del coach', () => {
    const original = EMPUJE[0]
    const animado = conAnimacionBase(original)
    expect(original.animacion).toBeUndefined()
    expect(animado.animacion).toBe(`/ejercicios/animaciones/press-banca-15-smith.gif?v=${VERSION_ANIMACION_BASE['press-banca-15-smith']}`)
    expect(esAnimacionBase(animado.animacion!)).toBe(true)
    expect(esAnimacionBase('/api/v2/biblioteca/coach-ej-x/animacion?v=1')).toBe(false)
  })

  it('cada versión de la URL es el sha256 del GIF: reemplazar uno sin cambiarla hace fallar la prueba', () => {
    expect(Object.keys(VERSION_ANIMACION_BASE).sort()).toEqual([...IDS_CON_ANIMACION_BASE].sort())
    for (const id of IDS_CON_ANIMACION_BASE) {
      const sha = createHash('sha256').update(readFileSync(publico(`${RUTA_ANIMACIONES_BASE}${id}.gif`))).digest('hex')
      expect(VERSION_ANIMACION_BASE[id], id).toBe(sha.slice(0, 8))
    }
  })

  it('las notas sólo apuntan a ejercicios con animación, y C203 avisa del cambio de equipo', () => {
    for (const id of Object.keys(NOTAS_ANIMACION_BASE)) expect(IDS_CON_ANIMACION_BASE.has(id), id).toBe(true)
    const c203 = BIBLIOTECA_INICIAL.find((e) => e.id === 'sfm-catalog-c203')
    expect(c203?.notaAnimacion).toBe('La animación usa kettlebell; el ejercicio es el mismo con mancuerna.')
    expect(BIBLIOTECA_INICIAL.find((e) => e.id === 'press-banca-15-smith')?.notaAnimacion).toBeUndefined()
  })
})
