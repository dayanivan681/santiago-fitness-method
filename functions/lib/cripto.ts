/**
 * Generación y resumen de secretos.
 *
 * Los tokens son aleatorios y opacos: 256 bits de `crypto.getRandomValues`.
 * No llevan datos dentro, así que no hay nada que descifrar ni manipular, y
 * adivinar uno es computacionalmente imposible sin necesidad de firmarlo.
 *
 * Nada se guarda en claro. La base de datos sólo ve el SHA-256, de modo que
 * leerla no da ni enlaces ni sesiones utilizables.
 */

/** Bytes de entropía por token. 32 bytes = 256 bits. */
const BYTES_DE_TOKEN = 32

/** Token nuevo en base64url: 43 caracteres, seguro en una URL sin escapar. */
export function tokenNuevo(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(BYTES_DE_TOKEN))

  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** SHA-256 en hexadecimal. Es lo único que llega a la base de datos. */
export async function resumen(valor: string): Promise<string> {
  const bytes = new TextEncoder().encode(valor)
  const digerido = await crypto.subtle.digest('SHA-256', bytes)

  return [...new Uint8Array(digerido)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
