import { describe, expect, it } from 'vitest'
import { CATALOGO_PDF } from './catalogo-pdf'
import { EQUIPOS } from './v2/biblioteca'

describe('catálogo del PDF', () => {
  it('trae las 293 fichas con referencia única y nombre', () => {
    expect(CATALOGO_PDF).toHaveLength(293)
    expect(new Set(CATALOGO_PDF.map((f) => f.ref)).size).toBe(293)
    for (const f of CATALOGO_PDF) {
      expect(f.ref).toMatch(/^C\d{3}$/)
      expect(f.nombre.length).toBeGreaterThan(0)
    }
  })

  it('el equipo es uno de los conocidos o queda por elegir', () => {
    for (const f of CATALOGO_PDF) expect(f.equipo === null || EQUIPOS.includes(f.equipo)).toBe(true)
    expect(CATALOGO_PDF.find((f) => f.ref === 'C001')).toMatchObject({ nombre: 'Press de banca plano con barra', equipo: 'barraLibre' })
  })
})
