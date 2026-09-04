/**
 * Modo de prueba abierta.
 *
 * Durante la fase de pruebas con el cliente, la autenticación estorba más de lo
 * que protege: cada reautenticación exige que el coach genere un enlace nuevo a
 * mano. `PUBLIC_TEST_MODE` la puentea entera —cliente y consola— sin borrar
 * nada: el enlace privado, las invitaciones, la cookie de sesión, la revocación
 * y el cierre de sesión siguen ahí y vuelven solos al apagar la variable.
 *
 * **Esto abre la aplicación a cualquiera que sepa la URL.** Es una decisión
 * deliberada y temporal del dueño del producto, no un descuido. Lo que NO hace:
 *
 * - no expone variables de entorno ni secretos;
 * - no acepta identidades del navegador: la del cliente sigue decidiéndose en
 *   el servidor, aquí abajo;
 * - no borra la frontera Coach/Cliente: `/admin` sigue siendo la consola y `/`
 *   la app, con sus datos separados.
 *
 * Falla cerrado: cualquier valor que no sea exactamente `'true'` deja la puerta
 * como estaba. Una variable mal escrita no puede abrir la aplicación por
 * accidente.
 *
 * Cloudflare Access se resuelve FUERA de este código: se ejecuta antes que
 * nuestras funciones, así que mientras siga delante de `/admin` esta variable no
 * basta. Ver `docs/PUBLIC-TEST-MODE.md`.
 */

export interface EntornoDeModo {
  readonly PUBLIC_TEST_MODE?: string
}

/**
 * Identidad del cliente durante la prueba abierta.
 *
 * Es el cliente real de Santiago, con su programación de verdad: probar con
 * otro sería probar otra app. Su historial de entrenamiento vive en IndexedDB,
 * en el dispositivo, y la API del cliente es de sólo lectura, así que abrir el
 * modo de prueba no puede alterar sus datos en D1.
 */
export const CLIENTE_DE_PRUEBA_ABIERTA = 'santiago'

export function modoPruebaAbierta(env: EntornoDeModo): boolean {
  return env.PUBLIC_TEST_MODE === 'true'
}
