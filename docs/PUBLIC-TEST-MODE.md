# Modo de prueba abierta (`PUBLIC_TEST_MODE`)

**Estado: ACTIVO.** Encendido el 4 de septiembre de 2026 para que Santiago pueda
probar la aplicación completa sin fricción de acceso.

> **La aplicación está abierta a cualquiera que sepa la URL.** Es una decisión
> deliberada y temporal del dueño del producto para esta fase de pruebas, no un
> descuido. Hay que apagarlo antes de cualquier release.

---

## Qué hace

Puentea la autenticación de las dos experiencias. No borra nada: el enlace
privado, las invitaciones, la cookie de sesión, la revocación y el cierre de
sesión siguen en el código y vuelven solos al apagar la variable.

| Ruta | Con el modo apagado | Con el modo encendido |
|---|---|---|
| `/` y la app | Cookie `sfm_sesion` o 401 «Acceso requerido» | Abre directamente |
| `/api/cliente` | Identidad desde la sesión, o 401 | Identidad desde el servidor |
| `/admin/*` | Cabecera de Cloudflare Access o 403 | Abre directamente |
| `/access?t=…` | Consume la invitación | **Igual, sin cambios** |
| `/salir` | Revoca la sesión | **Igual, sin cambios** |

## Qué NO hace

- No expone variables de entorno ni secretos.
- **No acepta identidades del navegador.** `/api/cliente?cliente_id=otro` sigue
  devolviendo los datos del cliente que decide el servidor. Cubierto por la
  prueba TM-3.
- No borra la frontera Coach/Cliente: `/admin` sigue siendo la consola y `/` la
  app, cada una con sus datos.
- No añade endpoints nuevos.

## Identidad del cliente durante la prueba

`santiago` — el cliente real, definido en
[`functions/lib/modoPrueba.ts`](../functions/lib/modoPrueba.ts) como
`CLIENTE_DE_PRUEBA_ABIERTA`.

Es su programación de verdad: probar con otro sería probar otra app. **No se
creó ninguna identidad nueva y no se tocó ningún id ni historial.** Su historial
de entrenamiento vive en IndexedDB, en el dispositivo, y la API del cliente es de
sólo lectura, así que abrir el modo no puede alterar sus datos en D1.

---

## Configuración

### Código

Un solo interruptor, en [`functions/lib/modoPrueba.ts`](../functions/lib/modoPrueba.ts).
Lo leen tres sitios:

| Fichero | Qué puentea |
|---|---|
| `functions/_middleware.ts` | La sesión para servir la app |
| `functions/api/cliente.ts` | La sesión para resolver la identidad |
| `functions/admin/[[ruta]].ts` | La cabecera de Cloudflare Access |

**Falla cerrado.** Sólo el texto exacto `true` abre. `True`, `1`, `yes`, un
espacio de más o la ausencia de la variable dejan la puerta como estaba: un
despliegue mal escrito no puede abrir la aplicación por accidente.

### `wrangler.toml`

```toml
[vars]
PUBLIC_TEST_MODE = "true"
```

Ojo: el proyecto está conectado a Git y el hostname sirve el despliegue
**canónico**, que sale de un push. Esta variable sólo cuenta si está commiteada;
un `wrangler pages deploy` a mano crea un despliegue que nunca llega a servirse.

### Cloudflare Access — no basta con el código

Access se ejecuta **antes** que nuestras funciones. Mientras siga delante de
`/admin`, la condición del código ni se evalúa y el coach seguirá viendo el OTP.
Hay que quitarlo desde el panel. Ver abajo.

---

## Cloudflare Access

### BEFORE — configuración de producción, verificada el 4 sep 2026

| URL | Quién responde |
|---|---|
| `santiago-fitness-method.pages.dev/` | Nuestra app (401) |
| `santiago-fitness-method.pages.dev/admin` | **Cloudflare Access** (302) |
| `santiago-fitness-method.pages.dev/admin/api/clientes` | **Cloudflare Access** (302) |
| `santiago-fitness-method.pages.dev/sw.js` | Nuestra app (200) |
| `*.santiago-fitness-method.pages.dev` (previews) | **Cloudflare Access** (302) |

Aplicación de Access: **Santiago Fitness Method** · equipo `cool-surf-8e6d`
Política: `Cliente y coach` · Allow · lista explícita de correos
Método: One-time PIN · Sesión: 1 semana

### TESTING — qué hay que cambiar a mano

**Claude Code no puede hacerlo.** `wrangler` no expone comandos de Zero Trust y
el token disponible no tiene permisos de Access. Hay que hacerlo en el panel.

En **Cloudflare Zero Trust → Access → Applications → Santiago Fitness Method**:

1. Abre la pestaña **Policies**.
2. **Add a policy** con:
   - **Name:** `TEST MODE — bypass temporal`
   - **Action:** `Bypass`
   - **Include:** `Everyone`
3. Súbela **por encima** de la política `Cliente y coach`. El orden importa:
   Access evalúa de arriba abajo.
4. Guarda.

No borres la política `Cliente y coach`: sólo tiene que quedar por debajo.

**Comprobación:** en una ventana de incógnito,
`https://santiago-fitness-method.pages.dev/admin` debe abrir la consola sin
pedir correo.

### AFTER — cómo restaurar producción

1. En la misma pantalla, **elimina la política `TEST MODE — bypass temporal`**.
2. Verifica que `Cliente y coach` vuelve a ser la primera.
3. En `wrangler.toml`, `PUBLIC_TEST_MODE = "false"`.
4. Commit y push (el despliegue canónico sale de ahí).
5. Comprueba:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://santiago-fitness-method.pages.dev/        # 401
curl -s -D- -o /dev/null https://santiago-fitness-method.pages.dev/admin | grep -i location # cloudflareaccess
```

Con eso vuelve todo el auth normal sin reconstruir nada.

---

## Qué autenticación sigue existiendo debajo

Intacta y probada, sólo puenteada:

- Invitaciones de un solo uso, con SHA-256 en D1 y consumo atómico.
- `/access?t=…` — el GET no consume, sólo el POST.
- Cookie `sfm_sesion`: `HttpOnly; Secure; SameSite=Lax; Path=/`, 7 días.
- Revocación de enlaces y de sesiones desde la consola.
- `/salir`, que revoca en el servidor antes de borrar la cookie.
- Cloudflare Access para el coach.

La suite `scripts/pruebas-modo-prueba.mjs` se ejecuta en los **dos** estados,
porque lo que hay que demostrar no es sólo que abre: es que vuelve a cerrar.

---

## Antes del release final

1. **Apagar el modo** y quitar la política de bypass (sección AFTER).
2. Resolver la fricción real que motivó esto, y que sigue ahí: la sesión dura 7
   días **sin renovación**, y cada reautenticación exige que el coach genere un
   enlace nuevo a mano. Propuestas en el informe de incidente: renovación
   deslizante y enlace reutilizable en una ventana corta.
3. Quitar el comodín `*.santiago-fitness-method.pages.dev` de la aplicación de
   Access, o acotarla a `/admin*`: hoy cualquier URL de despliegue manda al
   cliente a un OTP que no puede superar.
4. Corregir `docs/ACCESO.md`, que se contradice sobre qué cubre Access.
