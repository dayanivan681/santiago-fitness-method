/**
 * Vídeo corto → GIF, en el propio teléfono del coach.
 *
 * El servidor (Cloudflare Workers) no puede ejecutar ffmpeg, y subir el vídeo
 * para convertirlo fuera exigiría otro servicio. Aquí el navegador reproduce el
 * vídeo por dentro, toma cuadros a ritmo fijo y `gifenc` los codifica. Sólo se
 * sube el GIF resultante (y su primer cuadro como foto fija): el vídeo no sale
 * del teléfono.
 *
 * Ajustes fijos para que todos los GIF de la biblioteca se parezcan: cuadro
 * vertical 3:4 (360×480), 12 cuadros por segundo, como mucho 4 s. El vídeo
 * entra completo, grabado en vertical u horizontal: lo que sobra se rellena
 * con el fondo de la app, nunca se recorta. Si pasa de 5 MB, se repite más
 * pequeño sin preguntar.
 */
import { GIFEncoder, applyPalette, quantize } from 'gifenc'

export type Velocidad = 'normal' | 'lenta'

export const GIF_DURACION_MAX_S = 4
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024
const GIF_MAX_BYTES = 5 * 1024 * 1024
const ESPERA_CUADRO_MS = 8000
/** El primer cuadro que Safari sí pinta; también lo usa la vista previa (`#t=0.001`). */
const PRIMER_INSTANTE_S = 0.001
/** Proporción del GIF (alto / ancho): vertical, como la pantalla del teléfono. */
const PROPORCION_VERTICAL = 4 / 3
const COLOR_FONDO = '#0b0c0d'

/** De más a menos calidad: se usa el primero que quepa en 5 MB. */
export const INTENTOS: readonly { readonly ancho: number; readonly fps: number }[] = [
  { ancho: 360, fps: 12 },
  { ancho: 300, fps: 10 },
  { ancho: 240, fps: 8 },
]

/** Dónde dibujar el vídeo dentro del cuadro vertical: completo y centrado. */
export function encuadreVertical(anchoVideo: number, altoVideo: number, ancho: number) {
  const alto = Math.round(ancho * PROPORCION_VERTICAL)
  const escala = Math.min(ancho / anchoVideo, alto / altoVideo)
  const w = Math.round(anchoVideo * escala)
  const h = Math.round(altoVideo * escala)
  return { ancho, alto, x: Math.round((ancho - w) / 2), y: Math.round((alto - h) / 2), w, h }
}

export function tiemposDeCuadros(inicio: number, duracion: number, fps: number): number[] {
  const n = Math.max(1, Math.round(duracion * fps))
  return Array.from({ length: n }, (_, i) => Number((inicio + i / fps).toFixed(4)))
}

/** «Lenta» reproduce los mismos cuadros a la mitad de ritmo: se ve mejor la técnica. */
export function retrasoMs(fps: number, velocidad: Velocidad): number {
  return Math.round((1000 / fps) * (velocidad === 'lenta' ? 2 : 1))
}

/** El tramo nunca se sale del vídeo ni pasa de 4 s. */
export function tramoValido(inicio: number, duracion: number, duracionVideo: number) {
  const d = Math.min(duracion, GIF_DURACION_MAX_S, duracionVideo)
  return { inicio: Math.min(Math.max(0, inicio), Math.max(0, duracionVideo - d)), duracion: d }
}

export class ErrorVideo extends Error {}

function esperar(video: HTMLVideoElement, evento: string): Promise<void> {
  return new Promise((resolver, rechazar) => {
    const temporizador = setTimeout(() => rechazar(new ErrorVideo('El vídeo tardó demasiado en responder.')), ESPERA_CUADRO_MS)
    video.addEventListener(evento, () => { clearTimeout(temporizador); resolver() }, { once: true })
    video.addEventListener('error', () => { clearTimeout(temporizador); rechazar(new ErrorVideo('No pudimos leer ese vídeo.')) }, { once: true })
  })
}

/**
 * Siempre pide el cuadro y espera a `seeked`. Nunca el segundo 0 exacto:
 * Safari de iOS no pinta ese cuadro y el GIF (y su foto fija) empezaba en negro.
 */
export async function irA(video: HTMLVideoElement, segundo: number) {
  const listo = esperar(video, 'seeked')
  video.currentTime = Math.max(segundo, PRIMER_INSTANTE_S)
  await listo
}

/** Prepara un <video> fuera de pantalla listo para pedirle cuadros. */
export async function abrirVideo(archivo: Blob): Promise<{ video: HTMLVideoElement; cerrar: () => void }> {
  const url = URL.createObjectURL(archivo)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  const cargado = esperar(video, 'loadeddata')
  video.src = url
  video.load()
  await cargado
  // Safari de iOS no entrega imagen al lienzo hasta que el vídeo ha arrancado una vez.
  await video.play().catch(() => undefined)
  video.pause()
  return { video, cerrar: () => { video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url) } }
}

async function codificar(
  video: HTMLVideoElement,
  tiempos: readonly number[],
  ancho: number,
  retraso: number,
  progreso: (fraccion: number) => void,
): Promise<{ gif: Blob; fija: Blob }> {
  const { alto, x, y, w, h } = encuadreVertical(video.videoWidth, video.videoHeight, ancho)
  const lienzo = document.createElement('canvas')
  lienzo.width = ancho
  lienzo.height = alto
  const ctx = lienzo.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new ErrorVideo('Este teléfono no permite crear el GIF.')
  const gif = GIFEncoder()
  let fija: Blob | null = null
  for (const [i, t] of tiempos.entries()) {
    await irA(video, t)
    ctx.fillStyle = COLOR_FONDO
    ctx.fillRect(0, 0, ancho, alto)
    ctx.drawImage(video, x, y, w, h)
    if (i === 0) fija = await new Promise<Blob | null>((r) => lienzo.toBlob(r, 'image/jpeg', 0.85))
    const { data } = ctx.getImageData(0, 0, ancho, alto)
    const paleta = quantize(data, 256)
    gif.writeFrame(applyPalette(data, paleta), ancho, alto, { palette: paleta, delay: retraso })
    progreso((i + 1) / tiempos.length)
    // Ceder el hilo entre cuadros: la pantalla sigue respondiendo y el progreso se pinta.
    await new Promise((r) => setTimeout(r, 0))
  }
  gif.finish()
  if (!fija) throw new ErrorVideo('No pudimos sacar una imagen del vídeo.')
  return { gif: new Blob([gif.bytes()], { type: 'image/gif' }), fija }
}

/**
 * Convierte el tramo elegido en GIF. Devuelve también el primer cuadro como
 * JPEG: es la foto fija de listas y miniaturas.
 */
export async function videoAGif(
  video: HTMLVideoElement,
  opciones: { inicio: number; duracion: number; velocidad: Velocidad },
  progreso: (fraccion: number) => void = () => {},
): Promise<{ gif: Blob; fija: Blob }> {
  if (!video.videoWidth || !video.duration) throw new ErrorVideo('No pudimos leer ese vídeo.')
  const { inicio, duracion } = tramoValido(opciones.inicio, opciones.duracion, video.duration)
  for (const { ancho, fps } of INTENTOS) {
    const resultado = await codificar(
      video,
      tiemposDeCuadros(inicio, duracion, fps),
      ancho,
      retrasoMs(fps, opciones.velocidad),
      // Cada intento empieza de cero: un reintento más pequeño es más rápido que el primero.
      progreso,
    )
    if (resultado.gif.size <= GIF_MAX_BYTES) {
      progreso(1)
      return resultado
    }
  }
  throw new ErrorVideo('El vídeo tiene demasiado detalle para un GIF de 5 MB. Prueba con un tramo más corto.')
}
