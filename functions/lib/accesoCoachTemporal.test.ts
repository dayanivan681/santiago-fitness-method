import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  estadoAccesoCoachTemporal,
  HOST_CANONICO_COACH,
  type EntornoAccesoCoachTemporal,
} from './accesoCoachTemporal'

const AHORA = Date.parse('2026-09-04T20:00:00Z')
const ACTIVO: EntornoAccesoCoachTemporal = {
  COACH_ACCESS_TEMPORARY_UNTIL: '2026-09-05T20:00:00Z',
}

function peticion(host = HOST_CANONICO_COACH): Request {
  return new Request(`https://${host}/admin/`)
}

describe('excepción temporal de acceso del coach', () => {
  it('está activa sólo antes del vencimiento en el host canónico', () => {
    expect(estadoAccesoCoachTemporal(peticion(), ACTIVO, AHORA)).toBe('activo')
  })

  it('caduca exactamente al llegar al límite', () => {
    expect(
      estadoAccesoCoachTemporal(
        peticion(),
        ACTIVO,
        Date.parse('2026-09-05T20:00:00Z'),
      ),
    ).toBe('caducado')
  })

  it('un valor inválido falla cerrado', () => {
    expect(
      estadoAccesoCoachTemporal(
        peticion(),
        { COACH_ACCESS_TEMPORARY_UNTIL: 'no-es-una-fecha' },
        AHORA,
      ),
    ).toBe('caducado')
  })

  it('no abre previews ni otros hosts', () => {
    expect(estadoAccesoCoachTemporal(peticion('preview.santiago-fitness-method.pages.dev'), ACTIVO, AHORA)).toBe(
      'sin-configurar',
    )
    expect(estadoAccesoCoachTemporal(peticion('otro.example'), ACTIVO, AHORA)).toBe('sin-configurar')
  })

  it('sin variable conserva el flujo normal de Access', () => {
    expect(estadoAccesoCoachTemporal(peticion(), {}, AHORA)).toBe('sin-configurar')
  })
})

/**
 * El valor que de verdad se despliega.
 *
 * Las pruebas de arriba comprueban la función con fechas de laboratorio. Ésta
 * comprueba la configuración real, porque el estado `caducado` tiene una
 * consecuencia que no se ve leyendo el código: cierra `/admin` para TODO el
 * mundo, incluido un coach que sí pase el OTP de Cloudflare Access.
 *
 * Una fecha en el pasado nunca es lo que alguien quiso. O la excepción está
 * abierta —fecha futura— o no existe —variable vacía, que es el modo normal—.
 * Quedársela vencida es el fallo silencioso: el panel deja de abrirse y el
 * motivo está en un `wrangler.toml` que nadie mira.
 */
describe('la configuración desplegada', () => {
  const wrangler = readFileSync(resolve(process.cwd(), 'wrangler.toml'), 'utf8')

  /** El valor de cada bloque, en orden: producción primero, luego preview. */
  const valores = [...wrangler.matchAll(/^COACH_ACCESS_TEMPORARY_UNTIL = "([^"]*)"$/gm)].map(
    (coincidencia) => coincidencia[1],
  )

  it('declara la variable en producción y en preview', () => {
    expect(valores).toHaveLength(2)
  })

  it('nunca queda con una fecha ya vencida', () => {
    const vencidas = valores.filter((valor) => valor !== '' && Date.parse(valor) <= Date.now())
    expect(vencidas).toEqual([])
  })

  it('no abre nunca el panel de un despliegue de preview', () => {
    // Las URLs de preview son públicas y hay muchas; abrir el panel en una sola
    // dejaría una puerta trasera permanente al panel del coach.
    expect(valores[1]).toBe('')
  })
})
