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
import { plantillasIniciales } from './plantillas'
import { CATALOGO_MAESTRO_SEGURO } from '../../../shared/catalogo-maestro'

// Lo necesitan las pantallas y las pruebas para localizar un día concreto.
export { idDeDia } from './plantillas'

/**
 * Siembra la biblioteca que trae la app.
 *
 * Los días de §28 ya no se crean aquí: son de un participante concreto y nacen
 * con él, en `crearDiasIniciales`. Sembrarlos sin dueño dejaba una estructura
 * compartida que el coach no podía ajustar por persona (§23).
 */
export async function sembrar(repositorio: Repositorio): Promise<void> {
  await sincronizarBiblioteca(repositorio)
  await sincronizarCatalogoMaestro(repositorio)
}

/**
 * Los cuatro días de §28 para un participante recién dado de alta.
 * Idempotente: si ya los tiene, no se tocan (§19, §23).
 */
export async function crearDiasIniciales(
  repositorio: Repositorio,
  participanteId: string,
): Promise<void> {
  const suyas = await repositorio.listarPlantillas(participanteId)
  if (suyas.length > 0) return

  for (const plantilla of plantillasIniciales(participanteId)) {
    await repositorio.guardarPlantilla(plantilla)
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

/**
 * Importa únicamente la fundación segura del catálogo maestro.
 *
 * `put` hace la operación idempotente por el ID determinístico. No se mezcla
 * con `ejercicios`: una identidad sin ficha operativa completa no puede entrar
 * en el selector del coach ni generar una rutina incompleta. El guardado de
 * una identidad no cambia plantillas, sesiones, series ni calibraciones.
 */
async function sincronizarCatalogoMaestro(repositorio: Repositorio): Promise<void> {
  for (const identidad of CATALOGO_MAESTRO_SEGURO) {
    const guardada = await repositorio.obtenerIdentidadCatalogo(identidad.id)
    if (!guardada || JSON.stringify(guardada) !== JSON.stringify(identidad)) {
      await repositorio.guardarIdentidadCatalogo(identidad)
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
