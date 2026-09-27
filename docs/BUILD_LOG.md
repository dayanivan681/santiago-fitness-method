# Build log — Santiago Fitness Method

## 2026-09-27 — Biblioteca: unilaterales y prensa 45° (correo del coach) — claude-code

- Biblioteca programable de 33 a 46 fichas: prensa de piernas 45°, prensa unilateral y 11 variantes unilaterales (extensión de cuádriceps, peso muerto con mancuerna, fly en cable, landmine press, extensiones de tríceps sobre cabeza con mancuerna y cable, pushdown neutro y supinado, jalón en polea alta, preacher curl con mancuerna y curl en cable). Ids `sfm-catalog-cNNN` del catálogo maestro; los 33 históricos intactos.
- Fotos de free-exercise-db (dominio público, misma fuente que las 33): 11 nuevas en `public/ejercicios/`; tres provisionales anotadas en ESTIMADOS-A-CONFIRMAR.md. Músculos y cargas estimados, igual que las fichas originales.
- Fuera, con motivo, en `docs/BIBLIOTECA-AMPLIACION-UNILATERAL.md`: 3 sin foto fiel y 11 que dependen de preguntas B abiertas o de identidad ambigua.
- Manifest 3B.1: `active_in_runtime_exercises=true` en las 13 activadas; los tests exigen que coincida con el catálogo operativo.
- Verificación: 791 pruebas en 85 archivos, `tsc`, lint, build; navegador 375x812: Biblioteca muestra 46, la búsqueda «unilateral» y la ficha de la prensa con sus alternativas 45° y unilateral.

## 2026-09-27 — Respuestas del coach (A1–A11), cuadro del ejercicio y Google del coach — claude-code

- Respuestas del cuestionario leídas de D1 `sfm-variantes` (1 envío completo): A1 = barra V; A5 = dejar pendiente; A2–A4 y A6–A11 = mantener genérico. Registradas en `docs/BIBLIOTECA-FASE-3A-MAPPING-33.csv` (A1 → C159/S159, `confirmado_por_coach`; genéricos → `generico_por_coach`; A5 sigue pendiente).
- A1 aplicado: `extension-triceps-polea` se llama «Extensión de tríceps en polea con barra V» y su explicación lo dice. Mismo id: historial y calibración intactos; los dispositivos refrescan nombre al sincronizar la biblioteca.
- Petición del correo de Santiago (2026-09-26): en Hoy, cada ejercicio de «Tu sesión, paso a paso» es un cuadro que abre la ficha completa (foto, equipo, músculos, explicación, alternativas e historial) sin empezar la sesión. En el editor del coach, cada ejercicio elegido y cada opción de «Añadir ejercicio» muestran la misma foto.
- Google en la pantalla de clientes: si Google verifica un correo de `COACH_EMAILS` sin cuenta de cliente, se redirige a `/admin/` en vez de mostrar el error. No crea sesión. El login del coach con Google en `/admin` depende de añadir Google como método en Cloudflare Access (acción del dueño).
- Pendiente abierto del correo de Santiago: biblioteca más amplia con términos como «unilateral» y «prensa 45°».
- Verificación: 788 pruebas en 85 archivos, `tsc`, lint, build; navegador 375x812 en demo cliente (cuadros y ficha) y demo coach (miniaturas del editor).

## 2026-09-26/27 — Revisión de SSO de clientes en producción — codex (en curso)

- `handoff:sync` completado y turno reclamado como codex (`3950180`). Código limpio al comenzar. Se revisaron middleware, OAuth PKCE, las pantallas de acceso/perfil, secretos listados de Pages, despliegue canónico y configuración Google Auth Platform. No se modificaron cuentas ni configuración externa.
- HTTP vivo: `/entrar` 200 y botón Google; `/auth/google?origen=entrar` 302 a Google con `redirect_uri` canónica y cookie de estado; callback de estado inválido 401. Google real desde `/entrar` con la identidad del dueño llegó a la app y mostró la página de acceso fallido.
- D1 remoto, solo lectura: 1 cuenta; 0 `google_sub`; 0 invitaciones sin consumir vigentes. Perfil de cliente con sesión válida muestra enlace para conectar Google. Diagnóstico provisional: acceso directo rechazado porque no existe vínculo Google en producción; la ruta de vinculación requiere antes entrar con la contraseña y usar el mismo email Google. Falta que el dueño precise la prueba fallida para cerrar el caso.
- La consola Google muestra External/Testing y 0 usuarios de prueba, pero la documentación oficial exceptúa `openid email profile`; el código solo solicita esos permisos. Se corrigió la hipótesis inicial de que Testing fuera la causa. No se añadieron usuarios de prueba ni se publicó la app OAuth.
- En el preview `codex-google-fase2`, el ingreso Google real con la cuenta QA previamente vinculada sí devolvió la sesión de Lucía y su programa. No se creó ni modificó ninguna cuenta QA en esta repetición.
- La cuenta única de producción tiene contraseña; ninguno de los Google conocidos del navegador coincide con su correo guardado. `npm test` 784/784 en 84 archivos, `npm run lint` PASS, `npm run build` PASS. Solo se editaron `docs/HANDOFF.md` y este archivo; no hubo cambio de código ni despliegue manual.

## 2026-09-26 — Fases 4 y 5: solo lectura y panel de pagos — claude-code

- Servidor: 402 en escrituras del cliente sin acceso (`/sincronizar`, `/medios` no GET) sólo con Stripe encendido; el coach nunca se bloquea. Tipos compartidos en `shared/v2/suscripcion.ts`.
- Cliente: la cola conserva lo pendiente ante 402 y sigue recibiendo cambios; aviso de gracia, tarjeta de solo lectura, «Comenzar» bloqueado, `/entrenar` redirige, «Mi suscripción» en el perfil y espera del webhook tras pagar. La bienvenida no invita a entrenar si está bloqueado.
- Coach: insignias, filtro «Pagos pendientes», tarjeta Pagos en Hoy y pestaña Pago en la ficha (plan, enlace de pago, pausar/reanudar, cancelar/mantener, exento). Demo con datos ficticios.
- Verificación: 784 pruebas en 84 archivos, cobertura 72.92/65.24/70.46/74.94, `tsc`, lint, build, `npm run test:http` 66/66. Navegador a 375x812: cliente real local con claves de Stripe falsas `sk_test_local_falsa` en `.dev.vars` (regenerado después): aviso, bloqueo, 402 y perfil; demo del coach: tarjeta Pagos, filtro, insignias y pestaña Pago.
- Pendiente del dueño: pasos de `docs/SUSCRIPCIONES.md`. Antes de encender Stripe, marcar exentos o mandar enlaces de pago.

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
