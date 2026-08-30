# Acceso — enlace privado (sin cutover todavía)

Dos sistemas conviven a propósito hasta el cambio en producción:

- **Hoy en producción manda Cloudflare Access** con OTP por correo.
- **El sustituto ya está construido y probado**: enlaces de invitación de un
  solo uso resueltos por `functions/_middleware.ts`.

El interruptor es `AUTH_MODE` en `wrangler.toml`.

| Valor | Quién autentica |
|---|---|
| `access` | El middleware deja pasar; manda Cloudflare Access. **Producción ahora.** |
| `magic` | Manda el middleware: cookie de sesión o 401. Despliegues de rama. |

Si la variable falta, el middleware asume `magic` y cierra. Fallar cerrado es lo
único aceptable en una puerta.

## Cómo entra cada uno

**Cliente** — enlace privado → botón *Entrar* → app. Nunca ve Cloudflare, ni
escribe correo, ni crea cuenta.

**Coach** — Cloudflare Access con OTP en `/admin/invitar`, la página que genera
los enlaces. Para usar la app como participante, se genera un enlace a sí mismo.

## Generar un enlace

Desde la app: `https://santiago-fitness-method.pages.dev/admin/invitar`.

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

Dieciséis comprobaciones: A–K más dos de bypass. Usan la D1 de verdad, no
dobles: lo que hay que demostrar es que SQLite aplica la atomicidad del uso
único, y un mock no probaría nada.

## Secuencia del cambio en producción

1. `AUTH_MODE = "magic"` en `[vars]` de `wrangler.toml`, desplegar.
   Access sigue delante: dos puertas seguidas, ninguna ventana abierta.
2. Generarse un enlace y comprobar el flujo entero.
3. Reducir la aplicación de Access a la ruta `/admin`. Aquí es cuando el cliente
   deja de ver Cloudflare.
4. Generar el enlace del cliente y mandárselo.

Vuelta atrás en cualquier punto: `AUTH_MODE = "access"` y desplegar. Mientras la
aplicación de Access siga cubriendo el hostname completo, se vuelve exactamente
al comportamiento actual.

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
