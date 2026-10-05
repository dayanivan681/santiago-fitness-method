# Acceso privado v2

Estado de la implementación. Ver estado de publicación en
[HANDOFF](HANDOFF.md); no confundir un preview con producción.

- Cliente: invitación de un uso → cuenta con email y contraseña → sesión opaca revocable
  de 90 días que se renueva con el uso (al abrir la app y en `/api/v2/contexto`)
  cuando le queda menos de la mitad. GET no consume el token; POST sí, con
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


## Que el coach no vea el login de clientes

La app instalada abre en `/`. Si quien la abre no tiene sesión de cliente pero sí
una sesión de Cloudflare Access vigente de un correo de `COACH_EMAILS` (cookie
`CF_Authorization`, verificada con la misma firma RS256, emisor, audiencia y
caducidad que `/admin`), `/` y `/entrar` le redirigen a `/admin/`. Es sólo una
redirección: `/admin` sigue protegido por Access y por `verificarCoach`. Una
cookie falsificada, caducada o de otra persona no la supera y se ve el login.

Cada vez que la sesión de Access caduca, el coach vuelve a pasar por el código
de Access (en iOS se abre en otro dominio). Por eso conviene alargarla.

### Paso del dueño: alargar la sesión de Access a 1 mes

Nadie la cambia en su nombre. En el panel de Cloudflare:

1. Zero Trust → Access → Applications.
2. Abrir la aplicación «Santiago Fitness Method» (la que protege `/admin`) → Edit.
3. Pestaña **Basic information** (o **Overview**, según la versión del panel) →
   **Session Duration** → elegir **1 month** → Save application.
4. Revisar también Zero Trust → Settings → Authentication → **Global session
   timeout** (la sesión con el proveedor de identidad). Si está en un valor
   corto, puede volver a pedir el código antes del mes; dejarlo en 1 mes. Los
   nombres exactos pueden variar con las versiones del panel de Cloudflare.
5. La duración nueva se aplica en el siguiente inicio de sesión: entrar una vez
   más en `/admin` desde la app instalada.
