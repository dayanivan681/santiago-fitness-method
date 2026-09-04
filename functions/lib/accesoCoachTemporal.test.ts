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
