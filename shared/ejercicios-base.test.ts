import { describe, expect, it } from 'vitest'
import { BIBLIOTECA_INICIAL } from '../src/datos/semilla/biblioteca'
import { PLANTILLAS_BASE } from './plantillas-base'
import {
  CATALOGO_EJERCICIOS,
  DIAS_CLOUD_POR_DEFECTO,
  evaluarEstadoProgramacion,
} from '../functions/lib/roles'
import { EJERCICIOS_BASE, IDS_DE_EJERCICIOS, nombreDe } from './ejercicios-base'

/**
 * El catálogo de ejercicios no puede divergir entre el coach y el participante.
 *
 * Antes vivía dos veces —una en `functions/lib/roles.ts` para el formulario del
 * coach, otra en la biblioteca de Dexie— y nada comprobaba que coincidieran. El
 * fallo no era teórico: un id presente en un lado y ausente en el otro deja el
 * día INCOMPLETE para siempre y bloquea la generación de enlaces, sin decir cuál
 * es el ejercicio culpable.
 *
 * Estas pruebas son la red que sustituye a la disciplina.
 */

describe('el catálogo es una sola fuente', () => {
  it('el del coach es exactamente el compartido', () => {
    expect(CATALOGO_EJERCICIOS).toEqual(EJERCICIOS_BASE)
  })

  it('la biblioteca del participante cubre el catálogo entero, id por id', () => {
    // Si el coach puede programarlo, el participante tiene que poder verlo: un
    // id que sólo exista arriba desaparece del día sin ningún aviso.
    const enLaBiblioteca = new Set(BIBLIOTECA_INICIAL.map((ejercicio) => ejercicio.id))
    const ausentes = EJERCICIOS_BASE.filter((base) => !enLaBiblioteca.has(base.id))

    expect(ausentes.map((base) => base.id)).toEqual([])
  })

  it('la biblioteca no inventa ejercicios que el coach no pueda programar', () => {
    const fuera = BIBLIOTECA_INICIAL.filter((ejercicio) => !IDS_DE_EJERCICIOS.has(ejercicio.id))

    expect(fuera.map((ejercicio) => ejercicio.id)).toEqual([])
  })

  it('los nombres los pone el catálogo, no cada copia', () => {
    for (const ejercicio of BIBLIOTECA_INICIAL) {
      expect(ejercicio.nombre).toBe(nombreDe(ejercicio.id))
    }
  })

  it('no hay ids repetidos', () => {
    const ids = EJERCICIOS_BASE.map((ejercicio) => ejercicio.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ningún nombre se queda vacío', () => {
    expect(EJERCICIOS_BASE.every((ejercicio) => ejercicio.nombre.trim().length > 0)).toBe(true)
  })
})

describe('integridad referencial de las plantillas', () => {
  it('conserva los 33 identificadores publicados antes de esta fase', () => {
    const historicos = [
      'press-banca-15-smith', 'press-inclinado-convergente', 'press-banca-barra',
      'press-banca-mancuernas', 'press-pecho-convergente', 'pec-deck',
      'fondos-triceps', 'extension-triceps-polea', 'press-frances-barra-z',
      'elevacion-lateral-mancuernas', 'elevacion-lateral-polea',
      'lat-pulldown-maquina', 'jalon-agarre-cerrado', 'dominadas', 'remo-barra',
      'remo-sentado-cable', 'remo-mancuerna', 'curl-barra', 'curl-mancuernas',
      'curl-martillo', 'hip-thrust-barra', 'sentadilla-barra', 'prensa',
      'hack-squat', 'extension-cuadriceps', 'zancadas-mancuernas',
      'peso-muerto-rumano', 'curl-femoral-tumbado', 'curl-femoral-sentado',
      'patada-gluteo-polea', 'abduccion-maquina', 'elevacion-talones-pie',
      'elevacion-talones-sentado',
    ]
    expect(EJERCICIOS_BASE.map(({ id }) => id).sort()).toEqual(historicos.sort())
  })

  it('todos los ejercicios programados existen en el catálogo', () => {
    // Generaliza lo que ya hacía `src/presentacion/datos.ts`: un slot que
    // apunte a un ejercicio inexistente es un día roto en producción.
    const referenciados = PLANTILLAS_BASE.flatMap((dia) =>
      dia.slots.map((slot) => slot.ejercicioId),
    )
    const huerfanos = referenciados.filter((id) => !IDS_DE_EJERCICIOS.has(id))

    expect([...new Set(huerfanos)]).toEqual([])
  })
})

describe('nombreDe', () => {
  it('falla al construir, no meses después en el día de alguien', () => {
    expect(() => nombreDe('ejercicio-que-no-existe')).toThrow(/fuera del catálogo/)
  })
})

describe('un ejercicio fuera del catálogo se explica, no se calla', () => {
  it('el detalle del día nombra el ejercicio culpable', () => {
    // Antes decía "4/5 ejercicios válidos" y no había forma de saber cuál
    // arreglar, con el día bloqueado y sin poder generar enlaces de acceso.
    const rutinas = DIAS_CLOUD_POR_DEFECTO.map((dia) => ({
      id: `qa|${dia.slug}`,
      clienteId: 'qa',
      nombre: dia.nombre,
      orden: dia.orden,
      slots: dia.slots.map((slot, indice) =>
        dia.orden === 1 && indice === 0 ? { ...slot, ejercicioId: 'maquina-inventada' } : slot,
      ),
      actualizadoEn: 0,
    }))

    const estado = evaluarEstadoProgramacion(rutinas)
    const primero = estado.dias.find((dia) => dia.orden === 1)

    expect(estado.ready).toBe(false)
    expect(primero?.detalle).toContain('maquina-inventada')
    expect(primero?.detalle).toContain('fuera del catálogo')
  })
})
