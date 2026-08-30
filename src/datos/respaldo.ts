/**
 * Exportar y restaurar los datos del participante.
 *
 * La biblioteca de ejercicios **no** entra: son 33 fichas con foto que la app
 * ya trae, y meterlas multiplicaría el archivo sin aportar nada. Lo que se
 * guarda es lo insustituible: quién es, su estructura de días y todo lo que
 * registró.
 */

import { VERSION_RESPALDO, type FotoRespaldada, type Respaldo } from '../logica/respaldo'
import { fechaDeHoy, type Repositorio } from './repositorio'
import type { SerieRegistrada } from '../dominio/tipos'

export async function exportarRespaldo(
  repositorio: Repositorio,
  participanteId: string,
  ahora = new Date(),
): Promise<Respaldo> {
  const participante = await repositorio.obtenerParticipante(participanteId)
  if (!participante) {
    throw new Error(`No hay participante ${participanteId} que exportar`)
  }

  const [plantillas, sesiones, progreso, sustituciones] = await Promise.all([
    repositorio.listarPlantillas(participanteId),
    repositorio.listarSesiones(participanteId),
    repositorio.listarProgreso(participanteId),
    // Sólo las de hoy: una sustitución vale para un día y las de días pasados
    // ya no cambian nada. Pero las de hoy sí, y restaurar a media sesión sin
    // ellas devolvería el día a la variante de la plantilla sin avisar.
    repositorio.listarSustituciones(participanteId, fechaDeHoy(ahora)),
  ])

  // Las series se piden por sesión: es la única forma de no arrastrar las de
  // otro participante que compartiera ejercicio.
  const porSesion = await Promise.all(
    sesiones.map((sesion) => repositorio.listarSeriesDeSesion(sesion.id)),
  )

  const fotos = await Promise.all(
    progreso
      .filter((registro) => registro.tieneFoto)
      .map(async (registro) =>
        aFotoRespaldada(registro.id, await repositorio.obtenerFotoDeProgreso(registro.id)),
      ),
  )
  const fotoDePerfil = await aFotoRespaldada(
    participanteId,
    await repositorio.obtenerFotoDePerfil(participanteId),
  )

  return {
    version: VERSION_RESPALDO,
    exportadoEn: ahora.toISOString(),
    participante,
    plantillas,
    sesiones,
    series: porSesion.flat(),
    progreso,
    sustituciones,
    fotos: fotos.filter((foto): foto is FotoRespaldada => foto !== undefined),
    ...(fotoDePerfil ? { fotoDePerfil } : {}),
  }
}

/**
 * Devuelve el respaldo a la app.
 *
 * Es idempotente: reimportar el mismo archivo es un error fácil de cometer y no
 * puede acabar duplicando el historial. Por eso las series se restauran con
 * `corregirSerie` cuando ya existen en vez de volver a añadirlas.
 */
export async function restaurarRespaldo(
  repositorio: Repositorio,
  respaldo: Respaldo,
): Promise<void> {
  await repositorio.guardarParticipante(respaldo.participante)

  for (const plantilla of respaldo.plantillas) {
    await repositorio.guardarPlantilla(plantilla)
  }

  const existentes = new Set(
    (await repositorio.listarSesiones(respaldo.participante.id)).map((sesion) => sesion.id),
  )
  for (const sesion of respaldo.sesiones) {
    if (existentes.has(sesion.id)) {
      await repositorio.actualizarSesion(sesion)
    } else {
      await repositorio.crearSesion(sesion)
    }
  }

  await restaurarSeries(repositorio, respaldo.series)

  for (const sustitucion of respaldo.sustituciones) {
    await repositorio.guardarSustitucion(sustitucion)
  }

  for (const registro of respaldo.progreso) {
    const foto = respaldo.fotos?.find((guardada) => guardada.id === registro.id)
    await repositorio.guardarProgreso(registro, foto && aBlob(foto))
  }

  if (respaldo.fotoDePerfil) {
    await repositorio.guardarFotoDePerfil(
      respaldo.participante.id,
      aBlob(respaldo.fotoDePerfil),
    )
  }
}

/** §19: añadir lo que falta, actualizar lo que ya está, nunca duplicar. */
async function restaurarSeries(
  repositorio: Repositorio,
  series: readonly SerieRegistrada[],
): Promise<void> {
  for (const serie of series) {
    const yaEstaba = (await repositorio.listarSeriesDeSesion(serie.sesionId)).some(
      (guardada) => guardada.id === serie.id,
    )
    if (yaEstaba) {
      await repositorio.corregirSerie(serie)
    } else {
      await repositorio.registrarSerie(serie)
    }
  }
}

/**
 * La imagen dentro del propio archivo, en base64.
 *
 * Va en el JSON y no aparte para que el respaldo sea **un solo archivo**: el
 * coach lo recibe por WhatsApp o correo y no tiene que casar piezas sueltas.
 * Cuesta un tercio más de tamaño, y las fotos ya se guardan encogidas a 1080 px.
 */
async function aFotoRespaldada(
  id: string,
  imagen: Blob | undefined,
): Promise<FotoRespaldada | undefined> {
  if (!imagen) return undefined
  return { id, tipo: imagen.type, datos: aBase64(await imagen.arrayBuffer()) }
}

export function aBase64(binario: ArrayBuffer): string {
  const bytes = new Uint8Array(binario)
  let texto = ''
  // De a trozos: pasar el array entero a `String.fromCharCode` revienta la pila
  // con una foto de varios cientos de kilobytes.
  const TROZO = 8192
  for (let i = 0; i < bytes.length; i += TROZO) {
    texto += String.fromCharCode(...bytes.subarray(i, i + TROZO))
  }
  return btoa(texto)
}

export function aBlob(foto: FotoRespaldada): Blob {
  const binario = atob(foto.datos)
  const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0))
  return new Blob([bytes], { type: foto.tipo })
}
