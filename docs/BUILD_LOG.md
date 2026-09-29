# Build log — Santiago Fitness Method

## 2026-09-29 — Biblioteca Maestra de Santiago (mensaje 02) — claude-code

- Vocabulario: `maquinaDiscos` («Máquina de discos (plate-loaded)») separada de `maquinaTradicional` («Máquina de pila (selectorizada)», misma clave, sin migrar datos). Músculo `aductores`, sin objetivo semanal. Seis fichas fijas cargadas con discos pasan a `maquinaDiscos` con el mismo id (prensa, hack squat, seated calf raise, C191, C194, C077). El catálogo del PDF también distingue «plate-loaded».
- `scripts/biblioteca-santiago.mjs` convierte las 283 filas del CSV: 279 importables, 2 ya existen como fichas fijas (Hack Squat, Seated Calf Raise) y 2 repetidas en su propia lista (Stiff-Leg Deadlift, Hip Abduction Machine). Nombres tal cual; explicación vacía; referencia `M02-nnn`; id determinista. Músculo y patrón por (grupo, subgrupo), reutilizando los patrones de la semilla; equipo por palabras del nombre más ~90 correcciones por fila. Cargas con los perfiles de la semilla (`cargas.ts`), no con la tabla del plan: el plan pedía «las convenciones de la semilla» y su lista las contradecía.
- `npm run biblioteca:santiago -- --local|--staging|--produccion [--aplicar]`: respaldo, ensayo en copia local (una segunda pasada inserta 0) e `INSERT … WHERE NOT EXISTS` por id o nombre activo. Local: 279 insertadas y 0 al repetir. Staging (2026-09-29): ensayo y `--aplicar`, 279 insertadas, clientes/rutinas/sesiones intactos; preview `codex-premium-v2` redesplegado (deployment `6638a4ce`). Producción: pendiente del visto bueno del dueño.
- `GET /biblioteca` con ETag; el cliente envía `If-None-Match` y con 304 no toca Dexie. Filtros de músculo y equipo en la Biblioteca del coach; selector de equipo en la del cliente.

## 2026-09-28 — Cancelar foto conserva Añadir ejercicio — codex

- Bug reportado: Biblioteca → Añadir ejercicio → Nuevo → foto → volver/cancelar cerraba toda la hoja y perdía el borrador. Reproducción nativa en Safari, simulador QA iPhone 16 Pro iOS 27 (402×874), `http://127.0.0.1:5173/demo/coach/biblioteca`: Photo Library → Cancel devolvió la biblioteca sin formulario. La prueba de regresión también falló antes de la corrección (diálogo ausente).
- Causa: el evento `cancel` del input de archivos se propaga al `dialog`; `Hoja` interpretaba toda cancelación como `cerrar`. `src/producto/ui.tsx` ahora sólo cierra si `event.target === event.currentTarget`. Se conserva el borrador en el mismo componente sin cambiar su almacenamiento ni crear ejercicios al cancelar.
- Regresión en `src/producto/BibliotecaCoach.test.tsx`: todos los campos conservados y guardado sin foto; foto previa intacta tras cancelar otra elección; edición conserva el nombre; cancel del propio diálogo y botón Cerrar siguen cerrando. 12/12 pruebas del archivo PASS.
- QA nativa después: mismo Photo Library → Cancel mantiene la hoja abierta y `Remo QA despues` en Nombre. Captura fuera de Git: `/tmp/sfm-foto-ios-after.png`. Prueba en simulador, no en teléfono físico.
- Playwright con Chrome local, 390×844, misma ruta: formulario mantiene nombre, equipo, músculo y explicación después del cancel propagado; guardar sin foto añade la ficha demo y cierra la hoja. Página/título correctos, contenido presente, sin overlay ni errores de runtime. Captura `/tmp/sfm-foto-browser-after.png`. Browser plugin not available; usado Playwright del runtime. Safari usa selector nativo real; Playwright inyecta el evento DOM para la regresión y guardado en demo.
- Gates: `npm test` 840/840 (92 archivos), `npm run lint` PASS, `npm run build` PASS, `git diff --check` PASS. Avisos conocidos Node MaxListeners y navegación JSDOM en tests. Sin cambios en datos reales ni `docs/cliente`.
- Publicación: `handoff:publish` publica a main y dispara Cloudflare Pages según docs/DESPLIEGUE.md. Pendiente comprobar el commit servido y repetir el flujo publicado.

## 2026-09-28 — Mensaje 02 de Santiago archivado — codex

- Segundo mensaje del dueño: «Biblioteca Maestra de Ejercicios — Santiago Fitness Method - Especificación inicial para la biblioteca del app». Se archiva como información recibida, sin implementar ni importar ejercicios a cuentas reales.
- [Transcripción completa](aportes-santiago/2026-09-28-mensaje-02/TRANSCRIPCION.md): objetivo, organización, cinco páginas y doce grupos. [CSV](aportes-santiago/2026-09-28-mensaje-02/ejercicios.csv): 283 entradas sin deduplicar, con página, grupo, subgrupo, columna y nombre exacto del documento. Se preservan las continuaciones de Hombros, Glúteos y Tríceps y las dos columnas originales.
- Cinco JPEG de las 13.05.54 trasladados de Downloads a `docs/aportes-santiago/2026-09-28-mensaje-02/originales`, siguiendo la petición de traslado del primer mensaje. SHA-256 y comparación byte por byte comprobados antes de retirar los originales de Downloads; comprobación final de integridad y ausencia en Downloads PASS. Procedencia en `fuentes.json`.
- Índice compartido actualizado; `AGENTS.md` y `CLAUDE.md` ya apuntan a él. No se afirma equivalencia con el PDF previo de `docs/cliente` ni se asignan ids existentes: archivo del mensaje recibido, sin conciliación con el catálogo actual. `docs/cliente` intacto.
- QA: cinco páginas, doce grupos, 283 entradas (35/69/68/65/46 por página), enlaces y hashes PASS. `npm test`: 837/837 (92 archivos); `npm run lint` y `npm run build`: PASS. Avisos conocidos Node MaxListeners y navegación JSDOM durante tests. `git diff --check`: PASS.
- Siguiente: recibir nuevos mensajes o la tarea concreta de análisis/implementación del dueño.

## 2026-09-28 — Mensaje 01 de Santiago archivado — codex

- Encargo del dueño: conservar el primer mensaje, rotulado «Listado de ejercicios por grupo muscular», y hacerlo accesible a Codex y Claude Code. No se solicitó implementar el informe.
- Registro compartido: [docs/aportes-santiago/README.md](aportes-santiago/README.md). Transcripción visual completa: [mensaje 01](aportes-santiago/2026-09-28-mensaje-01/TRANSCRIPCION.md), con las diez secciones, cinco prioridades y objetivo. El informe no es un listado exhaustivo de ejercicios.
- Cinco JPEG originales preservados byte por byte fuera de `docs/cliente`, ordenados por continuidad (sin sufijo, (1), (2), (3), (4)); nombres originales, tamaños y SHA-256 en `fuentes.json`. La información ya no depende de Downloads ni del historial del chat.
- Referencias añadidas a `AGENTS.md` y `CLAUDE.md` para descubrimiento por ambos agentes. Los documentos recibidos son evidencia de requisitos, no instrucciones operativas ni autorización automática de cambios.
- Sin cambios en la aplicación ni en datos de clientes. `docs/cliente` intacto. QA PASS: cinco copias idénticas con SHA-256 verificado, enlaces válidos, cinco páginas, diez secciones y cinco prioridades. `npm test`: 837/837 (92 archivos); `npm run lint` y `npm run build`: PASS. Avisos conocidos de Node MaxListeners y navegación JSDOM durante pruebas.
- Siguiente: incorporar los siguientes mensajes cuando el dueño los entregue; consultar este informe al planificar futuras tareas, sin dar por implementados sus requisitos.

## 2026-09-28 — Biblioteca del coach, fases 1 y 2 — claude-code

- Santiago crea ejercicios desde su panel: `ejercicios_coach` en D1 (migración 0012, **aplicada el 2026-09-28 en staging y en producción, ambas con respaldo y ensayo de restauración**), API `/biblioteca` (coach escribe; ambos leen) y foto en R2 `biblioteca/<id>`. Un ejercicio nunca se borra: se archiva. `EjercicioId` acepta `coach-ej-<uuid>` y guardar un plan rechaza con 400 ids inexistentes o archivados.
- Panel: Biblioteca → «Añadir ejercicio» con «De mi catálogo» (293 fichas de `shared/catalogo-pdf.ts`, generado por `scripts/generar-catalogo-pdf.mjs`; 65 fichas del PDF sólo traen nombre en inglés y se usa esa etiqueta) o «Nuevo». Insignia «Tuyo», editar y archivar; el editor de planes los ofrece con foto. Rama demo en memoria sin subir nada.
- iOS (simulador QA iPhone 16 Pro, Safari, runtime local real): «Añadir ejercicio» → Nuevo, selectores nativos de equipo y músculo, y el campo de foto ofrece Photo Library / Take Photo / Choose File; se eligió una foto de la galería, se comprimió en el teléfono (JPEG 850×567, 75 KB) y llegó a R2 (POST 201, PUT foto 200, servida como image/jpeg). No se probó la cámara real (el simulador no tiene).
- Preview de staging publicado (2026-09-28): `https://codex-premium-v2.santiago-fitness-method.pages.dev` (deployment `57f66b28`, commit `b7a0686`, D1 santiago-staging con 0012). Sin sesión, `/api/v2/biblioteca`, su foto y `/admin/api/v2/biblioteca` redirigen (302) a Cloudflare Access; la prueba autenticada la hace el dueño con su sesión.
- Arreglos del QA de producción: el editor del plan mostraba la clave interna del equipo («barraLibre»); ahora usa `ETIQUETA_EQUIPO` (y el buscador también encuentra por «Barra libre»). Al crear o editar un ejercicio se bloquea un nombre ya usado por otro de la biblioteca (sin acentos, mayúsculas ni espacios sobrantes; los archivados no cuentan). Sólo interfaz: el servidor no valida nombres repetidos.
- Fase 3: `ConexionCloud.actualizarBiblioteca` (una vez por minuto, dentro de `sincronizar`) pide `GET /biblioteca` y guarda cada ejercicio en Dexie (`src/nube/biblioteca.ts`), conservando la calibración de carga del cliente y los archivados por su historial; sin red se queda lo último. La foto apunta a `/api/v2/biblioteca/<id>/foto?v=<actualizadoEn>` y el service worker la cachea por URL (`sfm-biblioteca-fotos`) para el gimnasio sin conexión. Vista previa, Hoy y ficha leen de Dexie; `Cliente.tsx` publica esa lista en `ContextoBiblioteca`.

## 2026-09-28 — Revisión 2 de fotos con referencias reales — codex

- El dueño rechazó la primera tanda por ejecución poco realista. Se recrearon las 12 imágenes IA usando fotografías/fotogramas reales como entradas visuales de image_gen, no solo descripciones de texto. Referencias enlazadas y revisión individual en public/ejercicios/PROCEDENCIA.md y procedencia.json; originales externos no distribuidos.
- Se compararon postura, unilateralidad, apoyos, agarres y geometría del equipo. Se descartó un pushdown que juntaba ambas manos y se regeneró con la mano libre en cadera. Las imágenes siguen marcadas IA; esta revisión no equivale a aprobación técnica del coach.
- C026 representa press inclinado con stack; C102 usa stack. Perfiles estimados de semilla ajustados, sin migrar calibraciones guardadas. C059 representa la variante sentada de lado y su explicación coincide. Nombres genéricos y 57 identidades intactos; C071/C256 no cambiaron.
- Verificación: 799/799 tests, 87 archivos; lint y build PASS. JPG 850×567, 52.836–86.487 bytes. Las 14 imágenes publicadas en dist coinciden byte por byte con public. Comparación visual individual y mosaico de las 12 finales; no se repitió QA de navegación de biblioteca. Avisos conocidos de Node/JSDOM en pruebas.
- Solo publicación Git; sin despliegue a producción. Siguiente: ninguno dentro del alcance solicitado.

## 2026-09-28 — Fotos fieles y cierre de unilaterales genéricos — codex

- Fuente: dueño confirma 12 respuestas B «Mantener genérico». Se consultó Biblioteca Maestra PDF sin tocar `docs/cliente`. Nombres genéricos preservados; aparatos/fotos representativos, perfiles y músculos estimados.
- Biblioteca 46 → 57 fichas: diez pendientes (C026, C059, C077, C107, C147, C217, C256, C031, C102, C204) y C071 con foto pública ya fiel. Ids canónicos compartidos con Coach, historias separadas; 24 filas activas en manifest, clasificación histórica 3B.1 conservada.
- 14 JPG 850×567 de 47.684 a 68.476 bytes: 11 para fichas nuevas y tres reemplazos. C194 ahora usa una pierna, C203 mancuerna y C161 cuerda individual con agarre neutro. 12 generadas con herramienta integrada `image_gen` y 2 reales de free-exercise-db bajo Unlicense (C071/C256). Fuente, condiciones comerciales, prompts y revisión por imagen en `public/ejercicios/PROCEDENCIA.md` y `procedencia.json`; copia local de Unlicense.
- Imágenes sintéticas marcadas `imagenGenerada=true` y aviso visible en ficha. Equipo `pesoCorporal` para hip thrust/calves sin lastre, con registro de lastre añadido. Documentos de estimados/ampliación actualizados.
- QA: 799/799 pruebas en 87 archivos, lint y build PASS. Se corrigió la prueba del estado sin alternativas: landmine ahora sí tiene C102 como alternativa; se usa abducción como caso sin alternativa. Avisos de Node MaxListeners y navegación JSDOM durante tests; no errores de consola en navegador.
- Chrome headless con Playwright instalado (plugin Browser ausente; Chrome local usado porque faltaba el binario Chromium del bundle), `/demo/cliente/biblioteca`, 390×844 y 1280×900: 57 fichas, las 14 fotos decodifican a 850×567, etiqueta IA sólo en las 12 sintéticas, abrir/cerrar todas PASS, sin overlay ni errores/warnings de consola. Capturas revisadas fuera del repo.
- Alcance: guardado y publicación Git; no despliegue de producción solicitado. No cambios en cuentas, rutinas del cliente ni respuestas del cuestionario.

## 2026-09-27 — Guía dinámica para Santiago y panel limpio — claude-code

- Producción: el dueño archivó «Santiago»; por su indicación se archivaron «Ivan» y «Cliente nuevo». El panel de Santiago empieza sin clientes (el recorrido abre con «Empieza con Nuevo cliente»).
- Guía dinámica pública, sin login, para acompañar el correo de bienvenida: https://guia-santiago-fitness.pages.dev (proyecto Pages `guia-santiago-fitness`). 16 pasos con capturas reales del simulador de iPhone (panel real en runtime local, cliente ficticio «María Pérez»; enlace de invitación difuminado). Fuente en `/Users/dayanmacbookpro/guia-santiago-fitness/`, fuera del repo.
- El correo a Santiago sigue en borrador; el dueño lo revisará antes de enviarlo.

## 2026-09-27 — Recorrido del coach en el panel real — claude-code

- Antes, la bienvenida del coach real sólo aparecía con cero clientes; producción tiene tres, así que Santiago no la vería. Ahora el panel real muestra un recorrido de 4 pasos (Tus clientes, Su plan, Su acceso, Su progreso) cada vez que se abre, por petición del dueño, con «Saltar» en todos los pasos; se repite desde Ayuda → «Ver recorrido». Adapta el primer paso al número de clientes. La demo pública conserva su bienvenida.
- Archivos: `src/producto/RecorridoCoach.tsx` (+ test), `GuiaAyuda.tsx`, `Coach.tsx`, `guia-demo.css`, `GuiaCoachReal.test.tsx`.
- Verificación: 799 pruebas en 87 archivos, `tsc`, lint, build; navegador 375x812 en el panel real del runtime local.

## 2026-09-27 — Prueba de alta con Google de un cliente en producción — dueño + claude-code

- Coach (Chrome del dueño) creó «Prueba SSO» con plan publicado y preparó una invitación. La página de invitación ofreció «Continuar con Google»; el inicio fue a Google con el cliente OAuth de la app, PKCE S256, state, nonce, alcances `openid email profile` y retorno `/auth/google/retorno` de producción. El dueño eligió la cuenta en Google.
- D1 producción (lectura): cuenta creada con `google_sub`, sin contraseña; invitación consumida; una sesión activa. La app abrió como cliente («Vamos, Prueba.», plan Upper A) y `/api/v2/contexto` devolvió `rol=cliente`, `googleVinculado=true`.
- Limpieza: cliente archivado; cuenta borrada y sesiones revocadas por `archivarCliente`. Quedan 3 clientes activos.
- Observación: con la pestaña oculta, la ficha recién creada espera en «Abriendo cliente…» porque el refresco periódico sólo corre con la pestaña visible (comportamiento buscado); visible, abre en ≤4 s.

## 2026-09-27 — Google SSO del coach en /admin — dueño + claude-code

- El dueño creó un cliente OAuth propio para Cloudflare Access (distinto del de la app) y activó Google como método de login en la app de Access «Santiago Fitness Method», con One-time PIN como respaldo. Test users: yayo1716@gmail.com y saangelm50@gmail.com.
- Verificado desde fuera: /admin y /admin/api 302 a Access; la página ofrece Google con retorno `cool-surf-8e6d.cloudflareaccess.com/cdn-cgi/access/callback` y alcances `openid email profile`; Google muestra su inicio de sesión sin error. El dueño entró con Google en /admin.

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
