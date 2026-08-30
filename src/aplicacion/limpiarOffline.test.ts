import { afterEach, describe, expect, it, vi } from 'vitest'
import { limpiarOffline } from './limpiarOffline'

/**
 * El riesgo que cubren estas pruebas es concreto: si queda un service worker
 * de la versión anterior, sirve la app desde su caché y el cliente entra sin
 * pasar por Cloudflare Access.
 */

const navegador = navigator as unknown as Record<string, unknown>
const global = globalThis as unknown as Record<string, unknown>

afterEach(() => {
  delete navegador.serviceWorker
  delete global.caches
  vi.restoreAllMocks()
})

function conServiceWorkers(registros: { unregister: () => Promise<boolean> }[]) {
  navegador.serviceWorker = { getRegistrations: async () => registros }
}

function conCaches(nombres: string[]) {
  const borradas: string[] = []
  global.caches = {
    keys: async () => nombres,
    delete: async (nombre: string) => {
      borradas.push(nombre)
      return true
    },
  }
  return borradas
}

describe('limpiarOffline', () => {
  it('desregistra todos los service workers encontrados', async () => {
    // Arrange
    const primero = vi.fn(async () => true)
    const segundo = vi.fn(async () => true)
    conServiceWorkers([{ unregister: primero }, { unregister: segundo }])

    // Act
    await limpiarOffline()

    // Assert
    expect(primero).toHaveBeenCalledOnce()
    expect(segundo).toHaveBeenCalledOnce()
  })

  it('borra todas las cachés, no sólo la de precarga', async () => {
    // Arrange
    const borradas = conCaches(['workbox-precache-v2-x', 'imagenes', 'otra'])

    // Act
    await limpiarOffline()

    // Assert
    expect(borradas).toEqual(['workbox-precache-v2-x', 'imagenes', 'otra'])
  })

  it('no falla cuando el navegador no soporta service workers ni cachés', async () => {
    // Act + Assert: sin serviceWorker ni caches definidos
    await expect(limpiarOffline()).resolves.toBeUndefined()
  })

  it('no propaga el error si el navegador prohíbe desregistrar', async () => {
    // Arrange
    navegador.serviceWorker = {
      getRegistrations: async () => {
        throw new Error('bloqueado por política del navegador')
      },
    }

    // Act + Assert: arrancar la app importa más que limpiar
    await expect(limpiarOffline()).resolves.toBeUndefined()
  })
})
