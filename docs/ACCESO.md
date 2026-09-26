# Acceso privado v2

Estado de la implementación. Ver estado de publicación en
[HANDOFF](HANDOFF.md); no confundir un preview con producción.

- Cliente: invitación de un uso → cuenta con email y contraseña → sesión opaca revocable
  de 30 días que se renueva con el uso. GET no consume el token; POST sí, con
  comprobación de origen. La cuenta se deriva
  de la sesión del servidor, nunca de `clienteId` enviado por el navegador.
- Coach: Cloudflare Access en `/admin`, validación criptográfica RS256 de firma,
  emisor, audiencia, vencimiento e identidad autorizada. Una cabecera inventada
  no autentica. No hay apertura temporal del panel.
- Vista previa: lectura autorizada y simulación en memoria. No crea sesión de
  cliente ni guarda actividad. «Entrenar juntos» sí guarda con autor Coach.
- Demo: `/demo` pública con dos roles ficticios. No abre IndexedDB ni usa APIs
  privadas. El shell público de la PWA tampoco contiene datos privados.

Invitaciones y revocación se operan desde la ficha de Cliente en Coach. La
invitación requiere plan publicado y revisado. El antiguo comando que insertaba
un token directamente en D1 está retirado porque eludía esa revisión.

La recuperación de contraseña se prepara en la ficha del coach: enlace de un
solo uso por 24 horas, sin envío de correo en esta fase. Archivar revoca cuenta,
invitaciones y sesiones. Cinco fallos en 15 minutos bloquean por email; una IP
compartida no bloquea a todos los clientes.

Google OAuth usa código con PKCE, state y nonce en cookie HttpOnly de 10 minutos.
El ID token exige firma, audiencia, emisor y email verificado. Sin
`GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` el botón no aparece y la ruta falla
cerrada. Producción además requiere `GOOGLE_HABILITADO=true`, que se activa
después de verificar el flujo real en preview. Se configura la URI exacta
`/auth/google/retorno` en Google Cloud para
cada origen que se pruebe. Para probar el preview hace falta también su URI de
retorno y una sesión autorizada de Cloudflare Access.

Una cuenta creada por invitación con Google queda vinculada. Una cuenta creada
con contraseña no puede vincularse por coincidencia de email: ese email todavía
no se verifica por correo. El cliente primero entra con su contraseña y conecta
Google desde Perfil; después puede usar «Continuar con Google» al entrar.

Producción usa el emisor/audiencia de `wrangler.toml`. Cloudflare debe proteger
el dominio canónico `/admin` y los despliegues preview. La lista actual autoriza
el correo del dueño; añadir a Santiago requiere su dirección de acceso confirmada.
No incluir credenciales, cookies, tokens o respaldos en capturas ni commits.

Pruebas: `npm run test:http`, después de preparar y servir el runtime descrito en
[QA v2](QA-V2.md). Usan un JWT firmado local y personas sintéticas; nunca aceptan
una cabecera falsa como sustituto de la autenticación real en staging.
