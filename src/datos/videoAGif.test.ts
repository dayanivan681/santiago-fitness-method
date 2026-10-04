import { describe, expect, it } from 'vitest'
import { INTENTOS, encuadreVertical, irA, retrasoMs, tiemposDeCuadros, tramoValido } from './videoAGif'

describe('vídeo → GIF: cálculos', () => {
  it('toma los cuadros a ritmo fijo dentro del tramo elegido', () => {
    expect(tiemposDeCuadros(1, 1, 4)).toEqual([1, 1.25, 1.5, 1.75])
    expect(tiemposDeCuadros(0, 3, 12)).toHaveLength(36)
  })

  it('la velocidad «lenta» duplica el tiempo de cada cuadro', () => {
    expect(retrasoMs(10, 'normal')).toBe(100)
    expect(retrasoMs(10, 'lenta')).toBe(200)
  })

  it('ajusta el tramo a la duración del vídeo y al máximo de 4 s', () => {
    expect(tramoValido(0, 3, 10)).toEqual({ inicio: 0, duracion: 3 })
    expect(tramoValido(9, 3, 10)).toEqual({ inicio: 7, duracion: 3 })
    expect(tramoValido(0, 10, 10)).toEqual({ inicio: 0, duracion: 4 })
    expect(tramoValido(0, 3, 1.5)).toEqual({ inicio: 0, duracion: 1.5 })
    expect(tramoValido(-2, 3, 10).inicio).toBe(0)
  })

  it('si el GIF pesa demasiado, cada intento es más pequeño que el anterior', () => {
    for (let i = 1; i < INTENTOS.length; i++) {
      expect(INTENTOS[i].ancho * INTENTOS[i].fps).toBeLessThan(INTENTOS[i - 1].ancho * INTENTOS[i - 1].fps)
    }
    expect(INTENTOS[0]).toEqual({ ancho: 360, fps: 12 })
  })

  it('un vídeo horizontal entra completo en el cuadro vertical, centrado', () => {
    expect(encuadreVertical(1280, 720, 360)).toEqual({ ancho: 360, alto: 480, x: 0, y: 139, w: 360, h: 203 })
  })

  it('un vídeo vertical llena el alto del cuadro sin recortarse', () => {
    expect(encuadreVertical(1080, 1920, 360)).toEqual({ ancho: 360, alto: 480, x: 45, y: 0, w: 270, h: 480 })
  })

  it('un vídeo 3:4 ocupa el cuadro entero', () => {
    expect(encuadreVertical(900, 1200, 300)).toEqual({ ancho: 300, alto: 400, x: 0, y: 0, w: 300, h: 400 })
  })

  it('espera a que el vídeo pinte el cuadro aunque ya esté en ese segundo (Safari lo daba en negro)', async () => {
    const video = document.createElement('video')
    const pedidos: number[] = []
    Object.defineProperty(video, 'currentTime', {
      get: () => 0,
      set: (t: number) => { pedidos.push(t); queueMicrotask(() => video.dispatchEvent(new Event('seeked'))) },
    })
    await irA(video, 0)
    await irA(video, 1.5)
    expect(pedidos).toEqual([0.001, 1.5])
  })
})
