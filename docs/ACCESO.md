# Acceso privado v2

Especificación de la implementación en validación. Ver estado de publicación en
[HANDOFF](HANDOFF.md); no confundir un preview con producción.

- Cliente: invitación de un uso → confirmación explícita → sesión opaca revocable.
  GET no consume el token; POST sí, con comprobación de origen. La cuenta se deriva
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

Producción usa el emisor/audiencia de `wrangler.toml`. Cloudflare debe proteger
el dominio canónico `/admin` y los despliegues preview. La lista actual autoriza
el correo del dueño; añadir a Santiago requiere su dirección de acceso confirmada.
No incluir credenciales, cookies, tokens o respaldos en capturas ni commits.

Pruebas: `npm run test:http`, después de preparar y servir el runtime descrito en
[QA v2](QA-V2.md). Usan un JWT firmado local y personas sintéticas; nunca aceptan
una cabecera falsa como sustituto de la autenticación real en staging.
