# Build log — Santiago Fitness Method

## 2026-09-26 — Google OAuth, configuración externa y preview

- Código: `main` en `5068a68f7211e298a8a8f69e35ce3b9296ec5036`; turno reclamado por `codex` para configurar y verificar Google OAuth. No se modificó `docs/cliente`.
- Google Cloud: proyecto `santiago-fitness-method` creado en `yayo1716@gmail.com`. OAuth External/Testing y cliente Web `Santiago Fitness Method web`; ID `1017512201105-6jv25bti46naj9lrfftk6rgkc62ughqs.apps.googleusercontent.com`. Retornos autorizados: `https://santiago-fitness-method.pages.dev/auth/google/retorno` y `https://codex-google-fase2.santiago-fitness-method.pages.dev/auth/google/retorno`. Secreto únicamente en Cloudflare Pages, nunca en este archivo ni en Git.
- Cloudflare Pages preview: secretos `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` cargados cifrados. Producción permanece apagada. Deploy preview: `https://34751049.santiago-fitness-method.pages.dev`, alias `https://codex-google-fase2.santiago-fitness-method.pages.dev`.
- Comprobaciones: `npm test` 749/749 en 78 archivos, `npm run lint` PASS, `npm run build` PASS. Navegador: Access OTP válido; `/entrar` muestra botón Google; consentimiento solicita nombre/foto/email; retorno con cuenta no vinculada muestra `No pudimos entrar con Google`.
- Pendiente: alta real con invitación sintética de staging y regreso con sesión; investigar por qué el botón `Preparar invitación` seguía deshabilitado en ficha de Lucía. No afirmar que el intercambio de token esté validado con ese mensaje genérico. Después, configurar y desplegar producción con `GOOGLE_HABILITADO=true` cuando la prueba pase. Ver `docs/HANDOFF.md` para el detalle y estado del turno.
