/**
 * Excepción operativa, acotada y caducable para el panel del coach.
 *
 * La configuración se interpreta sólo en el hostname canónico y se cierra por
 * defecto. Un valor ausente, inválido o vencido no abre nada. Cuando la
 * configuración existe pero ya venció, el estado `caducado` permite rechazar
 * también cabeceras `Cf-Access-*` falsificadas mientras se restaura Access.
 */

export const HOST_CANONICO_COACH = 'santiago-fitness-method.pages.dev'

export type EntornoAccesoCoachTemporal = {
  readonly COACH_ACCESS_TEMPORARY_UNTIL?: string
}

export type EstadoAccesoCoachTemporal = 'activo' | 'caducado' | 'sin-configurar'

export function estadoAccesoCoachTemporal(
  request: Request,
  env: EntornoAccesoCoachTemporal,
  ahora = Date.now(),
): EstadoAccesoCoachTemporal {
  const url = new URL(request.url)
  const limite = env.COACH_ACCESS_TEMPORARY_UNTIL?.trim() ?? ''

  if (url.hostname !== HOST_CANONICO_COACH || !limite) return 'sin-configurar'

  const vence = Date.parse(limite)
  return Number.isFinite(vence) && vence > ahora ? 'activo' : 'caducado'
}
