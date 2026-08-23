/**
 * Reducción de las fotos de progreso antes de guardarlas.
 *
 * Una foto de móvil son varios megas. Guardarlas tal cual llenaría el
 * almacenamiento del dispositivo en un año de seguimiento —y la app tiene que
 * funcionar sin conexión (§26), así que ese espacio es todo lo que hay—. Para
 * comparar un antes y un después, 1080 px de lado sobran.
 */

export const LADO_MAXIMO_FOTO = 1080
const CALIDAD_JPEG = 0.82

/** Escala para que el lado mayor no pase del máximo. Nunca agranda. */
export function dimensionesReducidas(
  ancho: number,
  alto: number,
  ladoMaximo = LADO_MAXIMO_FOTO,
): { readonly ancho: number; readonly alto: number } {
  const mayor = Math.max(ancho, alto)
  if (mayor <= ladoMaximo) return { ancho, alto }

  const factor = ladoMaximo / mayor
  return { ancho: Math.round(ancho * factor), alto: Math.round(alto * factor) }
}

/**
 * La foto lista para guardar.
 *
 * Si el navegador no puede redimensionarla, se guarda la original: perder la
 * foto del participante por no poder encogerla sería mucho peor que ocupar de
 * más.
 */
export async function reducirImagen(
  archivo: Blob,
  ladoMaximo = LADO_MAXIMO_FOTO,
): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas !== 'function') {
    return archivo
  }

  let bitmap: ImageBitmap | undefined
  try {
    bitmap = await createImageBitmap(archivo)
    const { ancho, alto } = dimensionesReducidas(bitmap.width, bitmap.height, ladoMaximo)

    const lienzo = new OffscreenCanvas(ancho, alto)
    const contexto = lienzo.getContext('2d')
    if (!contexto) return archivo

    contexto.drawImage(bitmap, 0, 0, ancho, alto)
    return await lienzo.convertToBlob({ type: 'image/jpeg', quality: CALIDAD_JPEG })
  } catch {
    return archivo
  } finally {
    bitmap?.close()
  }
}
