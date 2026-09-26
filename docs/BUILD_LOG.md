# Build log — Santiago Fitness Method

## 2026-09-26 — Fase 3: Stripe en modo prueba (backend) — claude-code

- Nuevo: `migrations/0011_suscripciones.sql`, `functions/lib/suscripcion.ts` (regla de acceso con 7 días de gracia), `functions/lib/stripe.ts` (SDK oficial `stripe@22`, Checkout, portal, acciones del coach, webhook que relee la suscripción en Stripe), `functions/lib/v2/suscripcionApi.ts` y webhook `POST /api/stripe/webhook` antes del filtro de origen. Todo falla cerrado sin secretos; `sk_live_` se rechaza sin `STRIPE_MODO_REAL=true`; producción exige `STRIPE_HABILITADO=true`.
- D1: `0011` ensayada y aplicada con respaldo en staging y en producción. Producción tras aplicar: 6 clientes, 0 cuentas y 0 suscripciones; tablas originales conservadas.
- Pruebas: 3 archivos nuevos (19 pruebas) con Stripe simulado; `npm run test:http` 66/66 sobre runtime local. La cobertura global volvió por encima del suelo (antes de este cambio, en `f482979`, estaba en 71.22 % de sentencias, por debajo del 72 %).
- Pendiente del dueño: cuenta Stripe en modo prueba, precio mensual, portal de cliente guardado, webhook y secretos. Pasos en `docs/SUSCRIPCIONES.md`.

## 2026-09-26 — Google OAuth, configuración externa y preview

- Código: `main` en `5068a68f7211e298a8a8f69e35ce3b9296ec5036`; turno reclamado por `codex` para configurar y verificar Google OAuth. No se modificó `docs/cliente`.
- Google Cloud: proyecto `santiago-fitness-method` creado en `yayo1716@gmail.com`. OAuth External/Testing y cliente Web `Santiago Fitness Method web`; ID `1017512201105-6jv25bti46naj9lrfftk6rgkc62ughqs.apps.googleusercontent.com`. Retornos autorizados: `https://santiago-fitness-method.pages.dev/auth/google/retorno` y `https://codex-google-fase2.santiago-fitness-method.pages.dev/auth/google/retorno`. Secreto únicamente en Cloudflare Pages, nunca en este archivo ni en Git.
- Cloudflare Pages preview: secretos `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` cargados cifrados. Producción permanece apagada. Deploy preview: `https://34751049.santiago-fitness-method.pages.dev`, alias `https://codex-google-fase2.santiago-fitness-method.pages.dev`.
- Comprobaciones: `npm test` 749/749 en 78 archivos, `npm run lint` PASS, `npm run build` PASS. Navegador: Access OTP válido; `/entrar` muestra botón Google; consentimiento solicita nombre/foto/email; retorno con cuenta no vinculada muestra `No pudimos entrar con Google`.
- Pendiente: alta real con invitación sintética de staging y regreso con sesión; investigar por qué el botón `Preparar invitación` seguía deshabilitado en ficha de Lucía. No afirmar que el intercambio de token esté validado con ese mensaje genérico. Después, configurar y desplegar producción con `GOOGLE_HABILITADO=true` cuando la prueba pase. Ver `docs/HANDOFF.md` para el detalle y estado del turno.

## 2026-09-26 — Cierre de QA Google y activación en producción

- `main` reclamado otra vez por `codex` en `80e7cef1c96048fe2f2879929cae6cac6d960303` después de publicar un checkpoint recuperable (`6e3c9bc`). El botón de invitación en la ficha QA se habilitó al terminar la carga; no había fallo persistente.
- Staging: invitación sintética creada en la ficha de Lucía; alta con Google completada; programa visible; cierre de sesión y reingreso Google completados; recarga conservó la sesión. D1 staging consultada en solo lectura: `google_sub` presente, sin contraseña, invitación consumida y sesión activa. Token de invitación omitido de logs y Git.
- Producción: secretos cifrados `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_HABILITADO=true` instalados. Despliegue `main` en `https://a65275a4.santiago-fitness-method.pages.dev`; dominio canónico comprobado: botón Google presente, inicio OAuth 302 a Google, retorno con `state` falso 401. OAuth real con el email del dueño finalizó en el aviso de cuenta no vinculada, coherente con cero cuentas para ese email en D1 producción. No se escribieron cuentas de prueba en producción.
- Tras actualizar el handoff y este log se repitieron `npm test` (749/749, 78 archivos), `npm run lint`, `npm run build` y `git diff --check`: todos PASS. `docs/cliente` intacto. No se escribió el secreto OAuth en archivos; el portapapeles usado para transferirlo quedó vacío.
- Pendientes menores: confirmar si `yayo1716@gmail.com` será el correo de soporte visible; completar Branding/política pública de Google antes del lanzamiento comercial; corregir el enlace `Conectar Google con esta cuenta` que aparece aun para una cuenta ya creada con Google. Google sigue External/Testing; el código solo pide `openid email profile`, cubiertos por la excepción de Google para los alcances básicos de identidad. Ver `docs/HANDOFF.md`.
