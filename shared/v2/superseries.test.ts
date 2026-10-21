import { describe, expect, it } from 'vitest'
import { Plan, Slot } from './contratos'
import { planBase } from '../../src/producto/servicio'
import { unir } from '../superseries'

const publicado = (p: ReturnType<typeof planBase>) => ({ ...p, estado: 'publicado' as const, revisado: true })
const errores = (r: ReturnType<typeof Plan.safeParse>) => (r.success ? [] : r.error.issues.map((i) => i.message))

describe('superseries en el contrato del plan', () => {
  const base = planBase('ana')
  const conBi = { ...base, dias: base.dias.map((d, i) => (i === 0 ? { ...d, slots: unir([...d.slots, { ...d.slots[0] }], 0).map((s, n) => ({ ...s, orden: n + 1 })) } : d)) }

  it('el esquema acepta y conserva grupo', () => {
    const r = Plan.safeParse(publicado(conBi))
    expect(errores(r)).toEqual([])
    expect(r.success && r.data.dias[0].slots.slice(0, 2).map((s) => s.grupo)).toEqual(['A', 'A'])
  })

  it('el plan sin grupos sigue igual', () => {
    const r = Plan.safeParse(publicado(base))
    expect(errores(r)).toEqual([])
    expect(r.success && r.data.dias.flatMap((d) => d.slots).some((s) => 'grupo' in s)).toBe(false)
  })

  it('rechaza letras inválidas', () => {
    expect(Slot.safeParse({ ...base.dias[0].slots[0], grupo: 'a' }).success).toBe(false)
  })

  it('rechaza un grupo de 1, no consecutivo o con series distintas', () => {
    const conSlots = (f: (slots: typeof base.dias[0]['slots']) => typeof base.dias[0]['slots']) => ({
      ...base,
      dias: base.dias.map((d, i) => (i === 0 ? { ...d, slots: f(d.slots) } : d)),
    })
    expect(Plan.safeParse(conSlots((s) => s.map((x, i) => (i === 0 ? { ...x, grupo: 'A' } : x)))).success).toBe(false)
    expect(Plan.safeParse(conSlots((s) => s.map((x, i) => (i === 0 || i === 2 ? { ...x, grupo: 'A' } : x)))).success).toBe(false)
    expect(
      Plan.safeParse(conSlots((s) => s.map((x, i) => (i < 2 ? { ...x, grupo: 'A', seriesObjetivo: 3 + i } : x)))).success,
    ).toBe(false)
  })

  it('5–8 bloques con 12 ejercicios es válido; 9 bloques no', () => {
    const plantilla = base.dias[0].slots[0]
    const doce = Array.from({ length: 12 }, (_, i) => ({
      ...plantilla,
      orden: i + 1,
      seriesObjetivo: 3,
      ...(i < 8 ? { grupo: String.fromCharCode(65 + Math.floor(i / 2)) } : {}),
    }))
    const plan = { ...base, dias: [{ ...base.dias[0], slots: doce }] }
    expect(errores(Plan.safeParse(publicado(plan)))).toEqual([])
    const nueve = Array.from({ length: 9 }, (_, i) => ({ ...plantilla, orden: i + 1 }))
    expect(Plan.safeParse({ ...base, dias: [{ ...base.dias[0], slots: nueve }] }).success).toBe(false)
  })

  it('se publica con 5 ejercicios aunque una bi-serie los deje en 4 bloques', () => {
    const cinco = base.dias[0].slots.slice(0, 5)
    const agrupados = unir(cinco, 0).map((s, n) => ({ ...s, orden: n + 1 }))
    const plan = { ...base, dias: [{ ...base.dias[0], slots: agrupados }] }
    expect(errores(Plan.safeParse(publicado(plan)))).toEqual([])
  })

  it('se publica con 2 tri-series y 2 sueltos (8 ejercicios, 4 bloques)', () => {
    const plantilla = base.dias[0].slots[0]
    const ocho = Array.from({ length: 8 }, (_, i) => ({
      ...plantilla,
      orden: i + 1,
      seriesObjetivo: 3,
      ...(i < 6 ? { grupo: i < 3 ? 'A' : 'B' } : {}),
    }))
    const plan = { ...base, dias: [{ ...base.dias[0], slots: ocho }] }
    expect(errores(Plan.safeParse(publicado(plan)))).toEqual([])
  })

  it('publicar exige al menos 5 ejercicios', () => {
    const cuatro = base.dias[0].slots.slice(0, 4)
    const plan = { ...base, dias: [{ ...base.dias[0], slots: cuatro }] }
    expect(errores(Plan.safeParse(publicado(plan)))).toContain('Upper A: tiene 4 ejercicios y necesita al menos 5.')
  })
})

describe('demo', () => {
  it('Alicia tiene una bi-serie válida en Upper B; las plantillas base no cambian', async () => {
    const { ServicioCoach } = await import('../../src/producto/servicio')
    const servicio = new ServicioCoach(true)
    const alicia = servicio.clientes[0]
    const r = Plan.safeParse(alicia.plan)
    expect(r.success ? '' : JSON.stringify(r.error.issues)).toBe('')
    const upperB = r.success ? r.data.dias.find((d) => d.nombre === 'Upper B')! : null
    expect(upperB?.slots.map((s) => s.grupo)).toEqual([undefined, undefined, undefined, 'A', 'A', undefined])
    expect(planBase('x').dias.flatMap((d) => d.slots).some((s) => 'grupo' in s)).toBe(false)
  })
})

// Caso recibido de Santiago: frecuencia de tres días con una cuarta sesión en la rotación.
it('identifica la cuarta sesión incompleta y acepta tres sesiones de siete sin cambiar las reglas', () => {
  const inicial = planBase('qa-santiago', 3);
  const dias = inicial.dias.map((d, i) => ({ ...d, slots: Array.from({ length: i === 3 ? 4 : 7 }, (_, j) => ({ ...d.slots[j % d.slots.length], orden: j + 1 })) }));
  const r = Plan.safeParse(publicado({ ...inicial, dias }));
  expect(r.success).toBe(false);
  if (!r.success) expect(r.error.issues).toEqual([{ code: 'custom', message: 'Lower B: tiene 4 ejercicios y necesita al menos 5.', path: ['dias', 3, 'slots'] }]);
  expect(Plan.safeParse(publicado({ ...inicial, dias: dias.slice(0, 3) })).success).toBe(true);
  const cuatro = dias.map((d, i) => i === 3 ? { ...d, slots: [...d.slots, { ...d.slots[0], orden: 5 }] } : d);
  expect(Plan.safeParse(publicado({ ...inicial, dias: cuatro })).success).toBe(true);
});
