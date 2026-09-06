/**
 * Acceso público temporal del cliente de demostración.
 *
 * Toda la decisión de identidad vive aquí y sólo depende de configuración del
 * servidor. El navegador no participa: query params, formularios, cabeceras y
 * cookies no pueden elegir quién se carga mediante este modo.
 *
 * Aunque la variable parezca configurable, el único valor aceptado durante
 * esta etapa es `cliente-1`. Así, escribir `santiago` por error falla cerrado
 * en vez de publicar sus datos.
 */

export const CLIENTE_DEMO_PUBLICO = 'cliente-1'

export type EntornoDemoPublica = {
  readonly PUBLIC_DEMO_CLIENT_ID?: string
}

export function clienteDemoPublico(env: EntornoDemoPublica): string | null {
  return env.PUBLIC_DEMO_CLIENT_ID === CLIENTE_DEMO_PUBLICO
    ? CLIENTE_DEMO_PUBLICO
    : null
}

/**
 * Decide la identidad final usando únicamente datos confiables del servidor.
 * La demo fija prevalece para que una cookie antigua no publique otro perfil.
 */
export function identidadClienteServidor(
  env: EntornoDemoPublica,
  clienteDeSesion: string | null,
): string | null {
  return clienteDemoPublico(env) ?? clienteDeSesion
}
