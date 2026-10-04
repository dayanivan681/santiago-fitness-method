/** Tipos mínimos de `gifenc` (MIT, sin tipos propios): sólo lo que usa `datos/videoAGif.ts`. */
declare module 'gifenc' {
  export type Paleta = number[][]
  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number, opciones?: { format?: 'rgb565' | 'rgb444' | 'rgba4444' }): Paleta
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, paleta: Paleta, formato?: 'rgb565' | 'rgb444' | 'rgba4444'): Uint8Array
  export interface Codificador {
    writeFrame(indices: Uint8Array, ancho: number, alto: number, opciones?: { palette?: Paleta; delay?: number; repeat?: number }): void
    finish(): void
    bytes(): Uint8Array<ArrayBuffer>
  }
  export function GIFEncoder(opciones?: { auto?: boolean }): Codificador
}
