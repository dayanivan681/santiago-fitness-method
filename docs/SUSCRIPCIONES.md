# Suscripciones con Stripe

Fase 3 del plan de cuentas y suscripción (decisiones del dueño del 2026-09-26: cobro
automático con Stripe, 7 días de gracia y después solo lectura, el coach invita y los
clientes exentos nunca se bloquean).

## Qué hay en el código

| Pieza | Fichero |
|---|---|
| Tablas `suscripciones` y `eventos_stripe` | `migrations/0011_suscripciones.sql`, aplicada en staging y producción el 2026-09-26 con respaldo previo |
| Regla de acceso (activa, gracia, vencida, pausada, sin suscripción, exenta) | `functions/lib/suscripcion.ts` |
| Stripe: Checkout, portal, acciones del coach, webhook | `functions/lib/stripe.ts` |
| Rutas de la API | `functions/lib/v2/suscripcionApi.ts` |
| Webhook público firmado | `POST /api/stripe/webhook` (`functions/_middleware.ts`) |

**Rutas del cliente** (`/api/v2`):
- `GET /suscripcion`
- `POST /suscripcion/pagar`: devuelve la URL de Checkout.
- `POST /suscripcion/gestionar`: devuelve la URL del portal de Stripe.

**Rutas del coach** (`/admin/api/v2`):
- `GET /suscripciones`
- `GET /precios`
- Todas estas llevan `?cliente=`:
  - `GET /suscripcion`
  - `POST /suscripcion/asignar-precio` con `{ precioId }`
  - `POST /suscripcion/enlace-de-pago`
  - `POST /suscripcion/pausar`
  - `POST /suscripcion/reanudar`
  - `POST /suscripcion/cancelar` (al final del periodo)
  - `POST /suscripcion/mantener` (deshace la cancelación)
  - `POST /suscripcion/exento` con `{ exento }`

**Falla cerrado.** Sin `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`, el webhook
responde 404 y las rutas de pago 503.
- Una clave real (`sk_live_`) se rechaza mientras no exista `STRIPE_MODO_REAL=true`.
- En producción también hace falta `STRIPE_HABILITADO=true`.

**El webhook no confía en el cuerpo del evento.** Verifica la firma, vuelve a leer la
suscripción en Stripe y guarda esa copia. Por eso los reintentos y el orden de llegada
no dejan estados viejos. Una suscripción ya ligada a un cliente no pasa a otro.

**Todavía no hay interfaz.** Las fases 4 (bloqueo de solo lectura en la app del cliente)
y 5 (pestaña Suscripción en el panel del coach) vienen después.

## Lo que tiene que hacer el dueño

Todo en **modo prueba** («Test mode» activado en Stripe). No se cobra dinero real.

1. **Cuenta**: crea la cuenta de Stripe del negocio en https://dashboard.stripe.com.
2. **Precio**: en *Product catalog → Add product* crea «Coaching mensual» con un precio
   *Recurring → Monthly*. Claude Code puede hacerlo desde tu Chrome si ya has iniciado
   sesión.
3. **Portal de cliente**: en *Settings → Billing → Customer portal*, pulsa **Save** una
   vez en modo prueba. Sin ese paso, «Gestionar pago» falla.
4. **Webhook**: en *Developers → Webhooks → Add endpoint*:
   - URL: `https://santiago-fitness-method.pages.dev/api/stripe/webhook`. No uses un
     preview: los previews están detrás de Cloudflare Access y Stripe no pasaría.
   - Eventos: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`,
     `customer.subscription.paused` y `customer.subscription.resumed`.
   - Al guardar, copia el **Signing secret** (`whsec_…`).
5. **Secretos en producción**. Cada comando pide el valor sin mostrarlo. Nunca por chat
   ni en Git.

   ```bash
   npx wrangler pages secret put STRIPE_SECRET_KEY --project-name santiago-fitness-method
   ```

   Pega la *Secret key* de *Developers → API keys* (empieza por `sk_test_`).

   ```bash
   npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name santiago-fitness-method
   ```

   ```bash
   npx wrangler pages secret put STRIPE_HABILITADO --project-name santiago-fitness-method
   ```

   A este último responde `true`.

6. **Redespliegue**: avisa a Claude Code o a Codex. Tras redesplegar, los secretos
   entran en vigor y se prueba el flujo completo con las tarjetas de prueba de Stripe.

Con claves `sk_test_`, producción no puede cobrar dinero real: es la forma más directa
de probar el webhook de verdad sin abrir Access en los previews. El paso a modo real
(claves `sk_live_` y `STRIPE_MODO_REAL=true`) necesita la aprobación explícita del dueño.

## Pruebas

- `functions/lib/suscripcion.test.ts`: la regla de acceso en todos sus estados.
- `functions/lib/stripe.test.ts`: con un Stripe simulado, comprueba:
  - la configuración;
  - que los precios se validan;
  - que Checkout recibe cliente y email;
  - el webhook: firma, eventos repetidos, releer de Stripe, no reasignar;
  - pausar, reanudar, cancelar, mantener y exento;
  - el webhook atravesando el middleware.
- `functions/lib/v2/suscripcionApi.test.ts`: permisos por rol y errores de Stripe
  traducidos a 502.
- `npm run test:http`: 66 comprobaciones sobre el runtime local. Sin Stripe configurado:
  - el webhook responde 404;
  - el cliente solo ve lo suyo (el parámetro `cliente` no cambia su identidad);
  - pagar responde 503;
  - el cliente no puede marcarse exento;
  - el coach marca exento y lo ve en su lista.
