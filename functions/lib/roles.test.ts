import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { plantillasIniciales } from '../../src/datos/semilla/plantillas'
import {
  camposPendientesPerfil,
  DIAS_CLOUD_POR_DEFECTO,
  evaluarEstadoProgramacion,
  slotsEstructuralmenteVacios,
  type PerfilCloud,
  type RutinaCloud,
} from './roles'

function rutinasCompletas(): RutinaCloud[] {
  return DIAS_CLOUD_POR_DEFECTO.map((dia) => ({
    id: `qa|${dia.slug}`,
    clienteId: 'qa',
    nombre: dia.nombre,
    orden: dia.orden,
    slots: dia.slots.map((slot) => ({ ...slot })),
    actualizadoEn: 1,
  }))
}

describe('defaults cloud', () => {
  it('coinciden exactamente con las cuatro plantillas de la app', () => {
    const locales = plantillasIniciales('qa').map(({ id: _id, participanteId: _dueno, ...dia }) => dia)
    const cloud = DIAS_CLOUD_POR_DEFECTO.map(({ slug: _slug, ...dia }) => dia)

    expect(cloud).toEqual(locales)
    expect(cloud.map((dia) => dia.slots.length)).toEqual([5, 5, 5, 5])
  })

  it('la migración 0004 contiene los mismos slots y el guard de vacío', () => {
    const sql = readFileSync(
      resolve(process.cwd(), 'migrations/0004_seed_santiago_routines.sql'),
      'utf8',
    )
    const slotsMigrados = [...sql.matchAll(/SET slots_json = '(\[[\s\S]*?\])', actualizado_en/g)].map(
      (coincidencia) => JSON.parse(coincidencia[1]) as unknown,
    )

    expect(slotsMigrados).toEqual(DIAS_CLOUD_POR_DEFECTO.map((dia) => dia.slots))
    expect(sql).toContain('INSERT OR IGNORE INTO rutinas')
    expect(sql.match(/CASE WHEN json_valid\(slots_json\)/g)).toHaveLength(4)
    expect(sql).not.toMatch(/(?:INSERT|UPDATE|DELETE)\s+(?:INTO\s+)?invitaciones/i)
    expect(sql).not.toMatch(/(?:INSERT|UPDATE|DELETE)\s+(?:INTO\s+)?sesiones/i)
  })
})

describe('estado de programación', () => {
  it('marca READY sólo con cuatro días completos de 5–8 ejercicios válidos', () => {
    const estado = evaluarEstadoProgramacion(rutinasCompletas())

    expect(estado.ready).toBe(true)
    expect(estado.dias.map((dia) => dia.ejercicios)).toEqual([5, 5, 5, 5])
  })

  it('explica el día incompleto y los ejercicios inválidos', () => {
    const rutinas = rutinasCompletas()
    rutinas[2] = {
      ...rutinas[2],
      slots: [
        ...rutinas[2].slots.slice(0, 3),
        { ...rutinas[2].slots[3], ejercicioId: 'ejercicio-inexistente' },
      ],
    }

    const estado = evaluarEstadoProgramacion(rutinas)

    expect(estado.ready).toBe(false)
    expect(estado.dias[2]).toMatchObject({ nombre: 'Upper B', ejercicios: 4, completo: false })
    expect(estado.dias[2].detalle).toBe('Upper B: 4 ejercicios')
  })

  it('marca la ausencia de cualquiera de los cuatro días', () => {
    const estado = evaluarEstadoProgramacion(rutinasCompletas().slice(0, 3))

    expect(estado.ready).toBe(false)
    expect(estado.problemasGenerales).toContain('Se esperaban 4 días y hay 3.')
    expect(estado.dias[3].detalle).toBe('Lower B: día ausente')
  })
})

describe('guard de migración y placeholders', () => {
  it('sólo considera vacíos null, texto vacío y arreglos JSON vacíos', () => {
    expect(slotsEstructuralmenteVacios(null)).toBe(true)
    expect(slotsEstructuralmenteVacios('   ')).toBe(true)
    expect(slotsEstructuralmenteVacios(' [ ] ')).toBe(true)
    expect(slotsEstructuralmenteVacios('[{"ejercicioId":"personalizado"}]')).toBe(false)
    expect(slotsEstructuralmenteVacios('{"slots":[]}')).toBe(false)
    expect(slotsEstructuralmenteVacios('json roto')).toBe(false)
  })

  it('identifica los cinco placeholders de la semilla de Santiago', () => {
    const perfil: PerfilCloud = {
      id: 'santiago',
      nombre: 'Santiago',
      sexo: 'masculino',
      edad: 30,
      estaturaCm: 175.26,
      pesoCorporalLb: 175,
      objetivo: 'Pendiente de confirmar',
      frecuenciaEntrenamiento: 4,
      limitaciones: '',
      notas: 'Perfil inicial sincronizado; confirmar datos con el coach.',
      ejerciciosEvitados: [],
    }

    expect(camposPendientesPerfil(perfil)).toEqual([
      'edad',
      'estatura',
      'peso',
      'objetivo',
      'notas',
    ])
  })
})
