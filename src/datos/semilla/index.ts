/**
 * Carga inicial de datos.
 * Guía del proyecto §27: el piloto arranca con el Participante 001.
 */

import type { Ejercicio, Participante } from '../../dominio/tipos'
import type { Repositorio } from '../repositorio'
import { BIBLIOTECA_INICIAL } from './biblioteca'
import { PLANTILLAS_INICIALES } from './plantillas'

export const ID_PARTICIPANTE_PILOTO = '001'

/** §2 y §27: perfil de arranque del piloto, editable por el coach. */
const PARTICIPANTE_PILOTO: Participante = {
  id: ID_PARTICIPANTE_PILOTO,
  nombre: 'Participante 001',
  sexo: 'masculino',
  edad: 30,
  estaturaCm: 175,
  pesoCorporalLb: 175,
  objetivo: 'Ganar fuerza y masa muscular',
  frecuenciaEntrenamiento: 4,
  limitaciones: '',
}

/**
 * Siembra la biblioteca, las plantillas y el participante si aún no existen.
 * Es idempotente: no pisa datos ya registrados, porque §19 prohíbe perder
 * historial y el coach puede haber editado ya las plantillas (§23).
 */
export async function sembrar(repositorio: Repositorio): Promise<void> {
  await sincronizarBiblioteca(repositorio)

  const plantillasExistentes = await repositorio.listarPlantillas()
  if (plantillasExistentes.length === 0) {
    for (const plantilla of PLANTILLAS_INICIALES) {
      await repositorio.guardarPlantilla(plantilla)
    }
  }

  const participante = await repositorio.obtenerParticipante(ID_PARTICIPANTE_PILOTO)
  if (!participante) {
    await repositorio.guardarParticipante(PARTICIPANTE_PILOTO)
  }
}

/**
 * Pone al día la biblioteca que trae la app.
 *
 * Los ejercicios nuevos se añaden — así una versión posterior puede ampliar la
 * biblioteca sin que haya que reinstalar nada, que es lo que §23 necesita para
 * tener de dónde elegir.
 *
 * En los que ya existen se refresca el contenido de la app (nombre, imagen,
 * explicación, músculos, patrón de movimiento) pero se conserva la calibración
 * que el coach midió con el equipo delante (§13, §27): ese dato vale más que el
 * estimado que trae la app y no debe perderse nunca en una actualización.
 */
async function sincronizarBiblioteca(repositorio: Repositorio): Promise<void> {
  for (const semilla of BIBLIOTECA_INICIAL) {
    const guardado = await repositorio.obtenerEjercicio(semilla.id)

    if (!guardado) {
      await repositorio.guardarEjercicio(semilla)
      continue
    }

    const actualizado: Ejercicio = {
      ...semilla,
      ...calibracionDe(guardado),
    }

    if (!equivalen(guardado, actualizado)) {
      await repositorio.guardarEjercicio(actualizado)
    }
  }
}

/** Lo único que el coach ajusta en el gimnasio y la app no debe pisar (§13). */
function calibracionDe(ejercicio: Ejercicio): Partial<Ejercicio> {
  return {
    incrementoMinimoLb: ejercicio.incrementoMinimoLb,
    ...(ejercicio.pesoBaseMaquinaLb === undefined
      ? {}
      : { pesoBaseMaquinaLb: ejercicio.pesoBaseMaquinaLb }),
  }
}

function equivalen(a: Ejercicio, b: Ejercicio): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
