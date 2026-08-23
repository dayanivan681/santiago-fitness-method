/**
 * Carga inicial de datos.
 *
 * Siembra lo que trae la app —biblioteca y estructura de días—, nunca personas.
 * Su especificación V1 pide *"sin panel ficticio de clientes"*, así que el
 * participante no se inventa: lo da de alta el coach en pantalla (§2, §27).
 */

import type { Ejercicio } from '../../dominio/tipos'
import type { Repositorio } from '../repositorio'
import { BIBLIOTECA_INICIAL } from './biblioteca'
import { PLANTILLAS_INICIALES } from './plantillas'

/**
 * Siembra la biblioteca y las plantillas si aún no existen.
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
