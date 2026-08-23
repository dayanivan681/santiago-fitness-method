import { describe, test, expect } from 'vitest'
import { LADO_MAXIMO_FOTO, dimensionesReducidas, reducirImagen } from './imagen'

describe('reducir la foto antes de guardarla', () => {
  test('el lado mayor queda en el máximo y la proporción se conserva', () => {
    // Arrange: una foto vertical de móvil, 3024×4032
    // Act
    const { ancho, alto } = dimensionesReducidas(3024, 4032)

    // Assert
    expect(alto).toBe(LADO_MAXIMO_FOTO)
    expect(ancho).toBe(810) // 3024 × (1080 / 4032)
  })

  test('también con fotos apaisadas', () => {
    const { ancho, alto } = dimensionesReducidas(4032, 3024)

    expect(ancho).toBe(LADO_MAXIMO_FOTO)
    expect(alto).toBe(810)
  })

  test('una foto pequeña se queda como está: agrandar no añade nada', () => {
    expect(dimensionesReducidas(600, 400)).toEqual({ ancho: 600, alto: 400 })
  })

  test('devuelve la original si el navegador no sabe redimensionar', async () => {
    // Perder la foto por no poder encogerla sería mucho peor que ocupar de más.
    const original = new Blob(['no soy una imagen'], { type: 'image/jpeg' })

    expect(await reducirImagen(original)).toBe(original)
  })
})
