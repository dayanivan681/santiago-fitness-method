# Acceso — enlace privado

El cambio está hecho. Quién autentica qué:

| Ruta | Autentica |
|---|---|
| `santiago-fitness-method.pages.dev/*` | El middleware, con enlace privado. **Sin Cloudflare a la vista.** |
| `santiago-fitness-method.pages.dev/admin/*` | Cloudflare Access con OTP, sólo el coach |
| `*.santiago-fitness-method.pages.dev` (previews) | Cloudflare Access con OTP |

El interruptor sigue siendo `AUTH_MODE` en `wrangler.toml`.

| Valor | Quién autentica |
|---|---|
| `magic` | Manda el middleware: cookie de sesión o 401. **Producción ahora.** |
| `access` | El middleware deja pasar. Sólo para volver atrás, y ya no basta: Access ya no cubre la raíz. |

**Aviso importante.** El proyecto está conectado a Git y el hostname sirve el
despliegue **canónico**, que sale de un push. Un `wrangler pages deploy` a mano
crea un despliegue más reciente que **nunca llega a servirse**. La configuración
sólo cuenta si está commiteada. Este malentendido ya costó una prueba fallida.

Si la variable falta, el middleware asume `magic` y cierra. Fallar cerrado es lo
único aceptable en una puerta.

## Cómo entra cada uno

**Cliente** — enlace privado → botón *Entrar* → app. Nunca ve Cloudflare, ni
escribe correo, ni crea cuenta.

**Coach** — Cloudflare Access con OTP en `/admin`, su pantalla propia. Desde ahí
puede *Probar como cliente* (abre una sesión de participante normal y entra en la
app) y *Generar acceso para Santiago*.

Nada bajo `/admin` sirve aplicación de cliente. Antes no existía función para esa
ruta y Cloudflare Pages caía en su reserva de página única: servía la SPA, que
cargaba porque Access dejaba pasar el HTML, pero sus imágenes y bundles viven
fuera de `/admin` y chocaban con la puerta del enlace mágico. Un catch-all en
`functions/admin/[[ruta]].ts` lo impide.

## Generar un enlace

Desde la app: `https://santiago-fitness-method.pages.dev/admin`.

Desde la terminal:

```bash
npm run invitar -- --cliente santiago
```

El token se imprime una sola vez. En la base sólo queda su SHA-256, así que no
se puede recuperar: si se pierde, se genera otro.

## Revocar

```bash
npx wrangler d1 execute santiago-acceso --remote \
  --command "UPDATE sesiones SET revocada_en=unixepoch()
             WHERE cliente_id='santiago' AND revocada_en IS NULL"
```

D1 es de consistencia fuerte: la siguiente petición ya falla. No hay ventana de
propagación — la razón de no haber usado KV.

## Por qué el GET no consume el enlace

WhatsApp, iMessage y los antivirus de correo abren los enlaces que reciben para
previsualizarlos. Si el GET consumiera el token, el enlace llegaría gastado.
`/access` sólo enseña un botón; el POST de ese botón es el único que consume.

## Pruebas

```bash
npm run build
npx wrangler pages dev --port 8788     # en otra terminal
BASE_URL=http://localhost:8788 node scripts/pruebas-acceso.mjs
```

Diecisiete comprobaciones: A–K, dos de bypass y una de limpieza. Usan la D1 de verdad, no
dobles: lo que hay que demostrar es que SQLite aplica la atomicidad del uso
único, y un mock no probaría nada.

## Vuelta atrás

Para devolver todo a Cloudflare Access hacen falta **dos** cambios, y en este
orden — al revés dejaría la app abierta unos segundos:

1. En la aplicación de Access, quitar el `admin` del campo *Path* de la primera
   destinación, para que vuelva a cubrir el hostname entero.
2. `AUTH_MODE = "access"` en `wrangler.toml`, commit y push.

Si sólo hiciera falta cerrar deprisa, el paso 1 basta: Access vuelve a estar
delante y el middleware sigue exigiendo sesión por debajo.

## Configuración vigente en Cloudflare

| | |
|---|---|
| Aplicación de Access | **Santiago Fitness Method** |
| Destinos | `santiago-fitness-method.pages.dev` y `*.santiago-fitness-method.pages.dev` |
| Política | `Cliente y coach` · Allow · lista explícita de correos |
| Método de entrada | One-time PIN |
| Sesión | 1 semana, heredada por la política |
| Base D1 | `santiago-acceso` · `7cb38489-4054-45e9-94d9-aad9c9f533f5` |

El comodín se añadió para cerrar un agujero real: las URLs de despliegue servían
la app entera con HTTP 200 y sin login.
