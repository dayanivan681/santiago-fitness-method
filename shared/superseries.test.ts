import { describe, expect, it } from 'vitest'
import {
  ajustarSeries,
  bloquesDe,
  contarBloques,
  erroresDeSuperseries,
  moverBloque,
  pasoPendiente,
  posicionEnGrupo,
  puedeAnadir,
  puedeMover,
  puedeUnir,
  quitar,
  separar,
  siguienteTrasGuardar,
  unir,
  type SlotAgrupable,
} from './superseries'

type S = SlotAgrupable & { id: string }
const s = (id: string, grupo?: string, series = 3, descanso = 120): S =>
  grupo
    ? { id, grupo, seriesObjetivo: series, descansoSegundos: descanso }
    : { id, seriesObjetivo: series, descansoSegundos: descanso }

describe('bloques', () => {
  it('cuenta 1 por suelto y 1 por grupo', () => {
    const slots = [s('a'), s('b', 'A', 3, 0), s('c', 'A'), s('d'), s('e', 'B', 3, 0), s('f', 'B', 3, 0), s('g', 'B')]
    expect(contarBloques(slots)).toBe(4)
    expect(bloquesDe(slots).map((b) => b.indices)).toEqual([[0], [1, 2], [3], [4, 5, 6]])
  })

  it('sin grupos, un bloque por ejercicio', () => {
    expect(contarBloques([s('a'), s('b'), s('c')])).toBe(3)
  })

  it('5–8 bloques con 12 ejercicios', () => {
    const slots = [
      s('1', 'A'), s('2', 'A'), s('3', 'A'),
      s('4', 'B'), s('5', 'B'), s('6', 'B'),
      s('7', 'C'), s('8', 'C'),
      s('9', 'D'), s('10', 'D'),
      s('11'), s('12'),
    ]
    expect(contarBloques(slots)).toBe(6)
    expect(erroresDeSuperseries(slots)).toEqual([])
    expect(puedeAnadir(slots)).toBe(false)
  })
})

describe('validación', () => {
  it('acepta bi-serie y tri-serie', () => {
    expect(erroresDeSuperseries([s('a', 'A'), s('b', 'A'), s('c', 'B'), s('d', 'B'), s('e', 'B')])).toEqual([])
  })
  it('rechaza un grupo de 1 y uno de 4', () => {
    expect(erroresDeSuperseries([s('a', 'A'), s('b')])).not.toEqual([])
    expect(erroresDeSuperseries([s('a', 'A'), s('b', 'A'), s('c', 'A'), s('d', 'A')])).not.toEqual([])
  })
  it('rechaza miembros no consecutivos', () => {
    expect(erroresDeSuperseries([s('a', 'A'), s('b', 'A'), s('c'), s('d', 'A'), s('e', 'A')])).not.toEqual([])
  })
  it('rechaza series distintas dentro del grupo', () => {
    expect(erroresDeSuperseries([s('a', 'A', 3), s('b', 'A', 4)])).not.toEqual([])
  })
})

describe('flujo del entrenamiento', () => {
  const bi = [s('x'), s('a', 'A', 3, 0), s('b', 'A', 3, 90), s('y')]

  it('A1 → B1 sin descanso → descanso → A2', () => {
    expect(siguienteTrasGuardar(bi, [3, 0, 0, 0], 1, 1)).toEqual({ indice: 2, descansar: false, descansoSegundos: 0 })
    expect(siguienteTrasGuardar(bi, [3, 1, 0, 0], 2, 1)).toEqual({ indice: 1, descansar: true, descansoSegundos: 90 })
    expect(siguienteTrasGuardar(bi, [3, 1, 1, 0], 1, 2)).toEqual({ indice: 2, descansar: false, descansoSegundos: 0 })
  })

  it('la última ronda pasa al siguiente bloque', () => {
    expect(siguienteTrasGuardar(bi, [3, 3, 2, 0], 2, 3)).toEqual({ indice: 3, descansar: true, descansoSegundos: 90 })
  })

  it('tri-serie: A1 → B1 → C1 → descanso → A2', () => {
    const tri = [s('a', 'A', 2, 0), s('b', 'A', 2, 0), s('c', 'A', 2, 150)]
    expect(siguienteTrasGuardar(tri, [0, 0, 0], 0, 1).indice).toBe(1)
    expect(siguienteTrasGuardar(tri, [1, 0, 0], 1, 1)).toMatchObject({ indice: 2, descansar: false })
    expect(siguienteTrasGuardar(tri, [1, 1, 0], 2, 1)).toEqual({ indice: 0, descansar: true, descansoSegundos: 150 })
  })

  it('un ejercicio suelto se comporta como siempre', () => {
    expect(siguienteTrasGuardar(bi, [1, 0, 0, 0], 0, 2)).toEqual({ indice: 0, descansar: true, descansoSegundos: 120 })
    expect(siguienteTrasGuardar(bi, [2, 0, 0, 0], 0, 3)).toEqual({ indice: 1, descansar: true, descansoSegundos: 120 })
    expect(siguienteTrasGuardar(bi, [3, 3, 3, 2], 3, 3)).toEqual({ indice: 3, descansar: true, descansoSegundos: 120 })
  })

  it('navegar a mano: empezar por B sigue la ronda y vuelve al más atrasado', () => {
    // B1 hecho primero: es el último del grupo, descansa y vuelve a A.
    expect(siguienteTrasGuardar(bi, [3, 0, 0, 0], 2, 1)).toEqual({ indice: 1, descansar: true, descansoSegundos: 90 })
    // Luego A1: B ya tiene la serie 1, así que se cierra la ronda.
    expect(siguienteTrasGuardar(bi, [3, 0, 1, 0], 1, 1)).toMatchObject({ indice: 1, descansar: true })
  })

  it('retomar: primer bloque sin terminar y el miembro más atrasado', () => {
    expect(pasoPendiente(bi, [3, 1, 0, 0])).toBe(2)
    expect(pasoPendiente(bi, [3, 1, 1, 0])).toBe(1)
    expect(pasoPendiente(bi, [1, 0, 0, 0])).toBe(0)
    expect(pasoPendiente(bi, [3, 3, 3, 3])).toBeNull()
    // Un bloque a medias manda sobre uno anterior sin empezar.
    expect(pasoPendiente(bi, [0, 1, 0, 0])).toBe(2)
    expect(pasoPendiente(bi, [0, 0, 0, 0])).toBe(0)
  })

  it('posición en el grupo', () => {
    expect(posicionEnGrupo(bi, 2)).toMatchObject({ grupo: 'A', posicion: 2, tamano: 2, nombre: 'Bi-serie' })
    expect(posicionEnGrupo(bi, 0)).toBeNull()
  })
})

describe('edición', () => {
  it('unir 2 sueltos crea la bi-serie A con descanso sólo en el último', () => {
    const r = unir([s('a', undefined, 4, 90), s('b', undefined, 3, 60), s('c')], 0)
    expect(r.map((x) => x.grupo)).toEqual(['A', 'A', undefined])
    expect(r.map((x) => x.seriesObjetivo)).toEqual([4, 4, 3])
    expect(r.map((x) => x.descansoSegundos)).toEqual([0, 90, 120])
  })

  it('unir un tercero la deja en tri-serie y no admite un cuarto', () => {
    const bi = unir([s('a'), s('b'), s('c'), s('d')], 0)
    const tri = unir(bi, 1)
    expect(tri.map((x) => x.grupo)).toEqual(['A', 'A', 'A', undefined])
    expect(posicionEnGrupo(tri, 0)?.nombre).toBe('Tri-serie')
    expect(puedeUnir(tri, 2)).toBe(false)
  })

  it('las letras siguen el orden de la sesión', () => {
    const r = unir(unir([s('a'), s('b'), s('c'), s('d'), s('e')], 3), 0)
    expect(r.map((x) => x.grupo)).toEqual(['A', 'A', undefined, 'B', 'B'])
  })

  it('separar conserva datos y devuelve 120 s a los de descanso 0', () => {
    const r = separar([s('a', 'A', 3, 0), s('b', 'A', 3, 75)], 1)
    expect(r.map((x) => x.grupo)).toEqual([undefined, undefined])
    expect(r.map((x) => x.descansoSegundos)).toEqual([120, 75])
    expect(r.map((x) => x.id)).toEqual(['a', 'b'])
    expect('grupo' in r[0]).toBe(false)
  })

  it('quitar de una bi-serie la deshace; de una tri-serie la deja en bi-serie', () => {
    expect(quitar([s('a', 'A', 3, 0), s('b', 'A'), s('c')], 0).map((x) => x.grupo)).toEqual([undefined, undefined])
    const tri = [s('a', 'A', 3, 0), s('b', 'A', 3, 0), s('c', 'A', 3, 90)]
    const r = quitar(tri, 2)
    expect(r.map((x) => x.grupo)).toEqual(['A', 'A'])
    expect(r.map((x) => x.descansoSegundos)).toEqual([0, 90])
  })

  it('las series se ajustan juntas', () => {
    const r = ajustarSeries([s('a', 'A'), s('b', 'A'), s('c')], 1, 5)
    expect(r.map((x) => x.seriesObjetivo)).toEqual([5, 5, 3])
  })

  it('reordenar mueve el grupo entero y salta grupos enteros', () => {
    const slots = [s('x'), s('a', 'A'), s('b', 'A'), s('y')]
    expect(moverBloque(slots, 2, -1).map((x) => x.id)).toEqual(['a', 'b', 'x', 'y'])
    expect(moverBloque(slots, 3, -1).map((x) => x.id)).toEqual(['x', 'y', 'a', 'b'])
    expect(moverBloque(slots, 0, 1).map((x) => x.id)).toEqual(['a', 'b', 'x', 'y'])
    expect(puedeMover(slots, 1, 1)).toBe(true)
    expect(puedeMover(slots, 3, 1)).toBe(false)
  })

  it('límites: 12 ejercicios u 8 bloques', () => {
    expect(puedeAnadir(Array.from({ length: 8 }, (_, i) => s(String(i))))).toBe(false)
    expect(puedeAnadir(Array.from({ length: 7 }, (_, i) => s(String(i))))).toBe(true)
  })
})
