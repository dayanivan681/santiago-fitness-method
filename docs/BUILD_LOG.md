# Build log — Santiago Fitness Method

## 2026-10-05 — Animaciones del catálogo base ($0) — claude-code

- 46 de los 57 ejercicios base tienen animación en la ficha: GIF de dos fotogramas de free-exercise-db (Unlicense), con corte seco, 0,9 s por fotograma, 480 px y 96 colores; 6,9 MB en `public/ejercicios/animaciones/`. 42 salen de la misma fuente que su foto, comprobado por hash. Tres usan una fuente más fiel a la ficha: Smith inclinado, pushdown con barra V y jalón con barra V. C203 usa la versión con kettlebell, aprobada por el dueño. Los otros 11 unilaterales con foto IA quedan sin animación, porque no hay equivalente libre fiel; C161 tenía un vídeo de wger que el dueño descartó.
- `src/datos/semilla/biblioteca/animaciones.ts`: `IDS_CON_ANIMACION_BASE` y `conAnimacionBase`; `BIBLIOTECA_INICIAL` se pasa por ese mapeo. Las constantes por ejercicio no cambian. `sincronizarBiblioteca` ya añade `animacion` a las bibliotecas instaladas sin tocar la calibración.
- `ImagenConMovimiento`: las animaciones del catálogo usan `hoja__imagen--movimiento-horizontal` (completas, sin recorte); las del coach siguen en vertical 3:4. Lo demás no cambia: sólo en la ficha, vuelta a la foto si falla la carga, «Ver movimiento» con movimiento reducido.
- Procedencia, revisión y sha256 de cada GIF en `PROCEDENCIA.md` y `procedencia.json` (`animations`). La matriz completa, los pendientes y los costes están en `docs/ANIMACIONES-CATALOGO-BASE.md`.
- Pruebas: `animaciones.test.ts` (solo IDs base, archivo GIF existente, 46/57, ficha sin otros cambios); un caso nuevo en `ImagenConMovimiento.test.tsx`; `EntrenamientoHoy.test.tsx` espera ahora el GIF en la ficha.
- Verificado: 992 pruebas, tsc, lint, build y `git diff --check`. Chrome a 320 y 390 px, cliente y coach: GIF 480×320 en la ficha, listas con foto, sin desborde, sin 4xx, foto y botón con movimiento reducido, C217 con foto. Safari del simulador iOS: la ficha de Hip thrust alterna los dos fotogramas.

## 2026-10-05 — Login simple y sesión persistente — claude-code

- Coach: `verificarCoachPorCookie` (`functions/lib/v2/seguridad.ts`) verifica el JWT de la cookie `CF_Authorization` con la misma lógica que `verificarCoach` (emisor, audiencia, RS256, caducidad, JWKS; extraída a `verificarTokenDeAccess`) y exige un correo de `COACH_EMAILS`. En `_middleware.ts`, `/` sin sesión de cliente y `GET /entrar` redirigen con 302 a `/admin/` a ese coach; si no, como antes. Sólo redirige: `/admin` sigue tras Access y `verificarCoach`. `leerCookieNombrada` en `sesion.ts`.
- Cliente: `VIDA_DE_SESION` 30 → 90 días (`Max-Age=7776000`), misma renovación a media vida y sólo cuentas activas; además se renueva en `GET /api/v2/contexto`, para la app instalada que vuelve del fondo sin navegar a `/`.
- `/entrar` (`paginaLogin`): «Entra a tu cuenta» sin mayúsculas forzadas, sin subtítulo; «Continuar con Google» como botón principal; «Entrar con email» con `<details>` sin JavaScript (abierto de entrada sin Google o tras un intento fallido); campos con `inputmode`, `autocomplete`, `autocapitalize="off"`, `spellcheck="false"` y 16 px; ayuda en una línea; pie «Explorar la demo · Soy el coach» con 44 px de toque. Los estilos comunes de las páginas de acceso dejan las mayúsculas forzadas en títulos y botones. CSP, CSRF por origen y límites de intentos sin cambios.
- Pruebas nuevas en `functions/lib/sesionLarga.test.ts` (coach válido en `/` y `/entrar`; caducado, otra audiencia, correo no coach e inventado; cliente con sesión; renovación a media vida, cuenta archivada y en `/contexto`, mirando la caducidad guardada porque el doble de D1 siempre informa de un cambio; página de entrada). `test:http` suma 7 comprobaciones (108). `acceso.test.ts` pasa a 90 días.
- Verificado: 987 pruebas, tsc, lint, build, `git diff --check`, `test:http` 108. `/entrar` a 320 y 375 px con y sin Google y con el email desplegado: sin desbordes, campos de 16 px, botones de 52 px y enlaces de 50 px. Simulador iOS con la app instalada contra el runtime local: la sesión del cliente sobrevive a cerrar y reabrir la app. Pendiente: coach con Access en el teléfono del dueño y su duración de sesión de Access.

## 2026-10-05 — Gráficas de progreso: huecos de tiempo y RIR a la vista — claude-code

- `src/logica/progresoGrafica.ts`: `huecosDeTiempo(puntos, umbralDias = 14)` (pares seguidos a más de 14 días, en días UTC y semanas redondeadas: «3 sem»); `resumenDeProgreso` añade `rirPrimero` y `rirUltimo`; `textoDeEsfuerzo` («con el mismo esfuerzo (RIR 2)», «con más esfuerzo (RIR 3 → 1)», «con menos esfuerzo (RIR 1 → 3)», con `formatearRir` para 5+).
- `GraficaProgreso`: se mantiene la separación por sesión. Cada pausa dibuja su tramo discontinuo y atenuado (`--texto-60`) con «3 sem sin entrenar» si el tramo mide 104 px o más, «3 sem» desde 44 px y sólo la línea por debajo; encima del tramo, o debajo si choca con el techo o con la cifra del último punto. Eje de fechas: primera, última y las dos de cada pausa si no se pisan (52 px). «RIR n» (12 px, `--texto-60`) bajo cada punto de Peso cuando están a 56 px o más; si no, sólo en el seleccionado; Repeticiones no lo repite. El titular añade el esfuerzo y el `aria-label` las pausas («Con 1 pausa de 3 semanas.»).
- Umbrales distintos del plan, aprobados por el dueño: 56 px en vez de 40 para el RIR (la separación mínima ya es 48 px por la zona táctil, así que 40 no se alcanzaba nunca y con 12 puntos se habrían pegado) y la etiqueta corta del hueco en vez de omitirla bajo 72 px (en el teléfono el tramo mide 53–65 px).
- Demo en memoria (`src/producto/servicio.ts`): las tres sesiones de la persona demo pasan a hace 31, 10 y 3 días (pausa de 3 semanas) y la primera con RIR 3.
- Pruebas: lógica (21 días → «3 sem»; 10 días → ninguno; 14 no cuenta y 15 sí; cambio de mes; los tres titulares y 5+) y componente (RIR en los 5 puntos a 375 px y no en Repeticiones; con 12 puntos sólo el seleccionado y sigue al tocar; tramo discontinuo, «3 sem» y `aria-label`; etiqueta completa y cuatro fechas con sitio; titular con esfuerzo).
- Verificado: 973 pruebas, tsc, lint, build, `git diff --check`, `test:http` 101. Cliente QA local sintético con seis sesiones de «Press inclinado bajo (15°) en Smith» grabadas por la propia app con el reloj del navegador (10, 14 y 18 ago; 8, 12 y 16 sept; RIR 3-3-2-3-2-1; 20→30 lb/lado). Chromium a 320, 375 y 1024 px, cliente y coach → Actividad → Por ejercicio: sin solapes entre textos ni desbordes, «3 sem» en el teléfono y «3 sem sin entrenar» con sitio, fechas de los dos lados de la pausa, titular «con más esfuerzo (RIR 3 → 1)» y tocar un punto cambia el detalle y su RIR. Safari del simulador iOS: la misma pantalla.

## 2026-10-05 — Pulido UI fase 3: hojas con apertura y cierre animados — claude-code

- `src/aplicacion/usePresencia.ts`: la hoja pasa por «saliendo» y avisa al terminar su animación. Un solo cierre aunque se pida dos veces; respaldo con temporizador (180 + 80 ms) si no llega `animationend`; al desmontarse a mitad (navegación) no queda callback ni temporizador; con `prefers-reduced-motion`, o sin `getAnimations`, cierre inmediato. Sólo cuenta el `animationend` del propio elemento (los de dentro, como el ✓, suben y no cierran).
- `src/componentes/HojaCapa.tsx`: armazón único de las cuatro hojas del cliente (ficha, Filtrar, variante asignada, ejercicios del día), que repetían marcado. El cierre sigue el mismo camino: botón y fondo por `useCapa` (historial y Atrás), Escape y Atrás piden la salida; foco, bloqueo del fondo y retorno del foco se conservan.
- `<Hoja>` de `src/producto/ui.tsx` (coach): mismo controlador; Escape evita el cierre nativo del `<dialog>` para pintar la salida; la cancelación del selector de fotos sigue sin cerrar (`event.target === event.currentTarget`).
- CSS: `--mov-hoja-cierre: 180ms`; las dos hojas abren con `subir-hoja` (220 ms, 14 px) y cierran con `bajar-hoja` + `desatenuar` (180 ms, `forwards`, sin toques durante la salida). Se retira `sfm-sheet` (24 px, 0.22s).
- Pruebas: `usePresencia.test.tsx` (cierre repetido, respaldo, navegación durante el cierre, movimiento reducido, sin animaciones, callback más reciente) y `HojaCapa.test.tsx` (salida y retorno del foco en las dos hojas, animación interior que no cierra, Escape doble, Escape sin cierre nativo, cancelación de foto, movimiento reducido). `src/pruebas/animacionesJsdom.ts` define `AnimationEvent` antes de cargar react-dom: sin él React escucha `webkitAnimationEnd` en jsdom.
- Verificado: 959 pruebas, tsc, lint, build, `git diff --check`, `test:http` 101. Chromium real a 390 px: con el botón, Atrás y Escape la hoja sigue a los 60 ms pintando su salida y al final no queda hoja, el fondo se desbloquea y el foco vuelve a la fila; diez aperturas y cierres rápidos con doble toque, navegar a Progreso durante el cierre y movimiento reducido (cerrada a los 30 ms) sin restos; coach «Añadir ejercicio» con × y Escape igual, foco de vuelta en el botón. Safari del simulador iOS: abrir y cerrar la ficha, sin bloqueo de scroll. Clip fuera de Git. Pendiente: app instalada y teléfono físico.

## 2026-10-04 — Pulido UI fase 2: microinteracciones — claude-code

- Respuesta al tocar (sólo `.sfm-shell--client`): botones y tarjetas accionables animan `transform`, `opacity` y colores en `--mov-toque`; quedan fuera los campos, lo deshabilitado (tampoco se escala al pulsar) y `.grafica-progreso__boton`. Filtros, pestañas y segmentos cambian de selección con esa misma transición. Con `prefers-reduced-motion` no se escala nada al pulsar.
- Guardar serie (`FilaSerie`): pendiente «Guardando…» con `aria-busy` y el botón legible (no apagado); tras un fallo, el aviso de siempre, los valores conservados y el botón «Reintentar» (sólo si falló el guardado, no el borrador). El éxito sigue siendo la fila registrada con ✓, que sólo aparece cuando `onGuardar` resuelve; la sincronización con la cuenta sigue aparte. El doble toque ya estaba protegido (`guardandoRef`). Pruebas nuevas en `FilaSerie.estados.test.tsx`.
- Medidor de la sesión y barra de volumen: `transform: scaleX` con `transform-origin` izquierdo en vez de `transition: width` (y la duración suelta 0.25s pasa a `--mov-progreso`). «N de M series» y «Ejercicio N de M» con `tabular-nums`. El avance automático y el cronómetro ya cumplían (sin esperas ni animación por segundo).
- Verificado: 946 pruebas, tsc, lint, build, `git diff --check`, `test:http` 101. Chrome local a 390 px con CPU ×4: ✓ visible 138 ms después de tocar; doble toque → una sola serie (9 → 10 de 16); al completar la última serie pasa solo a «Ejercicio 2 de 5»; botón pulsado escala 0,985 y con movimiento reducido no. Clip fuera de Git. Pendiente: app instalada y teléfono físico.

## 2026-10-04 — Pulido UI fase 1: consistencia visual — claude-code

- Tokens en `src/index.css`: escala de espacios `--esp-1…6` (4/8/12/16/24/32 px), `--radio` 16 px (tarjetas) y `--radio-chico` 12 px (controles); 21 radios sueltos de controles y tarjetas pasan a esos tokens (píldoras y círculos aparte). `--miniatura-carga` para el fondo de las miniaturas mientras cargan.
- Tipografía: ningún texto del cliente por debajo de 12 px (`.filtro`, `.etiqueta-campo`, `.variante__meta`, etiquetas de la ficha, marcas Técnica/Calentamiento, pestañas…). Lo que comparte el coach se sube sólo bajo `.sfm-shell--client`; el resto del coach no cambia. Los campos ya estaban en 16 px.
- Biblioteca (cliente y coach): subtítulos de grupo fijos bajo el buscador (`section > h2.biblioteca__grupo`, 16 px, opacos y a sangre), barra con alto conocido y ambos pegados bajo el área segura superior como `.entreno__barra`.
- Hoy: «Comenzar entrenamiento» como acción principal (60 px, 18 px, sin margen en línea). Ficha: título 20 px, texto 14 px, datos 15 px, huecos de la escala y alternativas/historial como secciones (`.hoja__seccion`). Progreso (sólo cliente): gráfica y lista de sesiones como tarjetas de 16 px. Perfil: «Mi foto de perfil» con 44 px de toque.
- Pruebas actualizadas por el cambio pedido: `shellMovil` (radio de los steppers y letra de la marca, 12 px).
- Verificado: 944 pruebas, tsc, lint, build, `git diff --check`. Auditoría automática (Playwright local) en Hoy, Entrenamiento, Biblioteca, ficha, Progreso y Perfil a 320, 390 y 1024 px: sin desbordes, sin texto < 12 px (salvo el «FITNESS METHOD» del logotipo), campos ≥ 16 px, controles ≥ 44×44 y botones de icono ≥ 48×48. Capturas antes/después y clip de los grupos fijos fuera de Git. Safari del simulador iOS: Hoy y Biblioteca con barra y grupo fijos. `test:http` 101 PASS tras restaurar, con permiso del dueño, la ficha que había archivado a mano en local. Preview `codex-premium-v2` revisado por el dueño antes de publicar. Pendiente: app instalada (áreas seguras) y teléfono físico.

## 2026-10-04 — Biblioteca: fichas en el coach, lista compartida y filtros simples — claude-code

- `ListaBiblioteca` (`src/pantallas/Biblioteca/`), la misma para cliente y coach: buscador y «Filtrar» fijos arriba (sticky, opacos y tan anchos como la lista), contador, estado vacío con «Quitar filtros», filas `.fila` (miniatura `lazy`/`async`, `sin-foto.svg` si falta, nombre 16 px, equipo e insignias). Sin buscar ni músculo elegido se agrupa por músculo («Pecho · 44»).
- «Filtrar» abre `HojaFiltros`: Músculo (Todos + 13) y Equipo (Todos + 8) como listas de una elección, filas de 48 px con su número; en el coach, «Solo mis ejercicios»; «Ver N ejercicios» y «Quitar filtros». Los filtros puestos se ven como pastillas quitables («Pecho ✕») y el botón dice «Filtrar · 2». Buscar sigue mandando sobre los filtros, con el aviso.
- Búsqueda: `coincide` en `src/logica/busqueda.ts` mira nombre, músculo principal y equipo sin acentos («hombro» encuentra los Shoulder Press; «polea», los de cable). Lógica de filtros y agrupación en `src/logica/filtrosBiblioteca.ts`.
- Coach: la rejilla `.sfm-catalog-grid` desaparece (y su CSS). Tocar una fila abre la ficha del cliente (`HojaEjercicio`, nueva prop `acciones`): en «Tuyo», «Editar» y «Archivar» (texto rojo, con la confirmación de siempre); en las fichas del método, la nota «Ficha del método: no se puede editar…». Editar cierra la ficha, abre el formulario y al guardar (o volver) reabre la ficha con los datos nuevos (se guarda por id). Las alternativas cambian la ficha abierta. Ya no hay Editar/Archivar en la lista.
- Pruebas adaptadas: `Biblioteca`, `BibliotecaCoach`, `HojaEjercicioGif`, `contextoDeSeccion` (chips y selector → hoja Filtrar y pastillas; tarjetas → filas y ficha) y `composicionCliente` (lee `ListaBiblioteca.tsx`). Nuevas: `filtrosBiblioteca`, `coincide`, ficha propia/fija, editar → ficha actualizada, alternativa en el coach, «Solo mis ejercicios», búsqueda por músculo/equipo, agrupación.
- Verificado: 944 pruebas, tsc, lint, build, 101 HTTP. Navegador a 320, 375 y 1024 px sin desborde: coach agrupado (13 grupos, 346), «hombro» → 44 con los Shoulder Press, Filtrar → Pecho + Máquina de pila → «Ver 3 ejercicios», pastillas y «Filtrar · 2»; ficha «Tuyo» → Editar → guardar → ficha con el texto nuevo (cambio de prueba deshecho); ficha fija sin botones; cliente igual sin insignias ni edición. Safari del simulador iOS: hoja Filtrar, pastilla «Bíceps ✕», abrir y cerrar ficha. Sin cambios de datos.

## 2026-10-04 — Alternativas equivalentes como lista de teléfono — claude-code

- `src/logica/alternativas.ts`: `ordenarAlternativas` (ya entrenadas si hay historial → mismo equipo → resto por nombre, `localeCompare('es')`) y `agruparPorEquipo` (orden de aparición, sin duplicados). `useEjerciciosEntrenados` lee `idsDeEjerciciosConHistorial` sólo cuando la ficha tiene participante.
- Ficha (`ListaAlternativas`): «Alternativas (N)», las 3 primeras como filas `.variante` (nombre en texto normal, equipo debajo, chevron, 56 px, toda la fila tocable; nombre accesible = nombre del ejercicio, equipo como descripción). Con más de 3, «Ver las N alternativas» despliega en el mismo sitio la lista agrupada por equipo («Mancuernas · 2») y pasa a «Ver menos»; al saltar a otra variante vuelve a empezar recogida. Con 0, el texto de siempre. `.filtro` no se toca.
- «Cambiar variante»: arriba la de hoy y la de la plantilla, luego «Ya entrenadas · N» y el resto agrupado por equipo; alcances y referencias de historial sin cambios.
- Estilos junto a `.variante`: `__texto`, `__chevron`, `.alternativas`, `__grupo`, `__mas`. `.hoja .variante` mantiene los 56 px dentro de la Vista previa del coach, donde `.sfm-shell button` los bajaba a 48.
- El título pasa de «Alternativas equivalentes» a «Alternativas (N)»: se ajustaron las dos pruebas que lo buscaban. En los datos locales «Selectorized Shoulder Press» tiene 15 alternativas (el plan hablaba de 16).
- Verificado: 928 pruebas (nuevas de `alternativas.ts`, `ListaAlternativas` y `HojaVariantes`), tsc, lint, build. Runtime local a 320 y 375 px: 3 filas, «Ver las 15 alternativas» → 7 grupos, filas de 56 px, sin desborde; «Copenhagen Adduction» (2) sin botón; tocar una fila abre esa ficha; Entrenamiento → «Cambiar variante» en el press inclinado: actual arriba, «Ya entrenadas · 1», resto agrupado empezando por su equipo. Safari del simulador iOS: misma ficha, «Ver las 15 alternativas» y toque en una fila. Sin cambios de datos.

## 2026-10-03 — GIF animado en los ejercicios del coach — claude-code

- Migración `0013_biblioteca_animacion.sql`: tabla `ejercicios_coach_animacion` (`CREATE TABLE IF NOT EXISTS`) en lugar del `ALTER TABLE … ADD COLUMN` del plan, porque las migraciones v2 se ensayan y reaplican enteras y un ADD COLUMN repetido falla en SQLite. Registrada en `pruebas-v2/d1.ts`, `preparar-qa-v2` y `migrar-v2` (que ahora comprueba también esta tabla).
- API: `PUT`/`DELETE /biblioteca/<id>/animacion` (sólo coach) y `GET` (ambos roles), firma GIF87a/GIF89a, 5 MB, R2 `biblioteca/<id>/animacion`; `tieneAnimacion` en la lista; subir o quitar toca `actualizado_en` (ETag y `?v=`).
- Panel: el selector acepta GIF; su primer cuadro se guarda como foto fija (JPEG) y el GIF aparte; vista previa «Animación»; insignia «GIF» en la tarjeta; una foto normal quita la animación; un fallo tras crear no duplica el ejercicio.
- Ficha (cliente y Vista previa): reproduce el GIF; si no carga (sin conexión) vuelve a la foto fija; con «reducir movimiento» muestra la foto y «Ver movimiento». Listas, miniaturas, Hoy y editor siguen con la foto fija. El service worker no cachea `/animacion` (prueba en `pruebas-v2/sw.test.ts`).
- Verificado: 905 pruebas, tsc, lint, build, 101 HTTP; navegador 375 px (lista fija con «GIF», ficha animada, cambio a foto quita la animación, `onError` vuelve a la foto); Safari del simulador iOS eligiendo el GIF desde Fototeca: llega como GIF, idéntico byte a byte al original, y la ficha se anima. Staging: 0013 aplicada con respaldo; preview `codex-premium-v2` redesplegado (`6422762d`). Producción (2026-10-03, con el sí del dueño): 0013 aplicada con respaldo; ejercicios 281, clientes 8, rutinas 24, sesiones 40 intactos. Prueba real: GIF de Push Press con los dos fotogramas de free-exercise-db (Unlicense); el corte directo funciona mejor que el fundido, pero la fuente no muestra la barra arriba: para movimientos de varias fases conviene grabar vídeo.

## 2026-09-30 — Pulido de las gráficas de progreso — claude-code

- Escala ajustada a los valores (`escalaDe`, paso 5 en peso y 1 en reps, un paso de margen, rango mínimo, nunca negativa): 25→30 lb se dibuja en 20–35 y la subida se ve. El eje muestra mínimo y máximo, fijos a la izquierda aunque el panel se desplace; el techo es una línea discontinua tenue y la etiqueta del último valor baja bajo el punto cuando lo cruzaría.
- Con muchas sesiones, los paneles se abren en lo más reciente y Peso y Repeticiones se desplazan juntos.
- Se abre en el último ejercicio entrenado (cliente y coach), con los chips en orden alfabético y respetando la elección guardada.
- Verificado: 893 pruebas (5 pasadas completas sin fallos antes de publicar; en la pasada previa a `handoff:publish`, con el simulador apagándose a la vez, falló una vez «crea con revisión explícita…» de `RecorridosDemo` a los 5,7 s, y el commit se publicó igualmente porque el comando no se detenía ante el fallo. Después: 2 pasadas aisladas y 9 con tres suites en paralelo, todas 893/893; el mensaje del fallo no se capturó y no se aplicó ningún arreglo a ciegas. El código publicado no cambia con esto), tsc, lint, build, 91 HTTP; runtime local a 375 px y Safari del simulador iOS con 9 sesiones (abre al final, paneles alineados) y coach → Actividad → Por ejercicio.

## 2026-09-30 — Limpieza de evidencia temporal de gráficas — codex

- Los snapshots YAML generados por Playwright se incluyeron por error al moverlos a `output/playwright` (sólo las imágenes estaban ignoradas). Se retiran del árbol versionado y se conservan en `/tmp/sfm-cli-graficas-local`; contienen QA sintético local. Sin cambios de código ni datos.
- Revisión final: 885/885 pruebas; TypeScript/lint/build PASS y 91 comprobaciones HTTP locales PASS. Demo pública responde 200, API cliente anónima 401 y API admin redirige a Access (302). El primer smoke de la demo canónica aún sirvió la versión anterior mientras Pages desplegaba; no se considera prueba de la gráfica publicada.
- El despliegue y smoke de la gráfica pública se verifican después de esta publicación; el reporte final del chat indicará el resultado servido.


## 2026-09-30 — Gráficas de progreso por ejercicio — codex

- Implementada prioridad 5 del mensaje 01 de Santiago (§7–9): SVG propio de peso y repeticiones, una mejor serie efectiva por sesión (carga comparable y desempate por reps), orden cronológico, valores corregidos vigentes y peso tal como se registra, incluido lb/lado. Resumen de extremos, último punto seleccionado, detalle con RIR (incluido 5+), aviso antes de la segunda sesión. Sin dependencias nuevas ni escrituras en datos reales.
- Archivos: `src/logica/progresoGrafica.ts` y pruebas; `src/componentes/GraficaProgreso.tsx` y pruebas; integración en `Historial.tsx`; estilos en `src/index.css`; tres sesiones ficticias sólo en la demo en memoria (`src/producto/servicio.ts`).
- El contexto del encargo asumía que el coach montaba Historial, pero su ficha usa `ResumenSesiones`. Se añadió Actividad → Por ejercicio en `src/producto/Progreso.tsx`, reutilizando lógica y gráfica, con lista de sesiones filtrada y prueba de integración sobre versiones corregidas. Las correcciones existentes no se modificaron.
- Accesibilidad: SVG con descripción, botones HTML fuera de role=img, selección también por teclado, blancos medidos de 48×48 px, estado anunciado y foco visible. Tokens del tema; sin animación. ResizeObserver mantiene texto y altura legibles a distintos anchos; historiales largos desplazan sólo el panel. El proyecto usa tema oscuro, no tiene un selector de tema claro.
- QA: TDD de lógica (fallo por módulo ausente → cinco pruebas PASS). Suite final `npm test`: 885/885, 101 archivos. `npx tsc -b`, `npm run lint`, `npm run build`, `git diff --check`: PASS. `npm run test:http`: 91 PASS en runtime local aislado. Warnings conocidos de MaxListeners y navegación JSDOM.
- Navegador Chrome local: demo cliente con tres sesiones; cliente QA local con cinco sesiones en dos ejercicios y coach sobre ese mismo fixture. 320/375/1024 px sin desborde de página, resumen +30, selección inicial última, clic muestra RIR 5+, cambio de ejercicio restablece último punto. Verificadas capturas en `output/playwright/local-grafica-*.png` y `coach-grafica-*.png` (fuera de Git). La prueba real detectó la transformación global :active que desplazaba el botón; override focalizado y repetición PASS.
- Safari nativo: simulador QA iPhone 16 Pro iOS 27, demo → Progreso → Por ejercicio, tocar el primer punto cambia el detalle a 13 sept · 25 lb/lado × 20 · RIR 2; Maestro PASS, captura `/tmp/sfm-grafica-ios.png`. No es prueba de teléfono físico.
- `docs/cliente` intacto. Publicación mediante handoff dispara Pages; verificación de despliegue se realiza después del push.


## 2026-09-29 — Detalles de interfaz de Biblioteca y editor (QA iPhone) — claude-code

- Hojas: el título es opaco y cubre también el relleno superior; el contenido ya no asoma detrás.
- Foto: el `<input type="file">` queda oculto visualmente (`solo-lectores`) dentro del mismo `<label>`, con un botón de la app «Elegir foto» / «Cambiar foto»; desaparece «no file selected». Se añadió la prueba de regresión de cancelar la foto (no existía).
- Contador «1 ejercicio» / «N ejercicios» (coach y cliente). Sin resultados: mensaje con qué hacer; con filtros, botón «Quitar filtros».
- La carga sigue al equipo mientras el coach no la toque (pila → número de la pila, discos → discos que añade, barra/Smith → cada lado…); al editar no cambia.
- «Organizar sesiones» es un botón secundario a ancho completo con flecha.
- Verificado: 874 pruebas, tsc, lint, build, 91 HTTP; Safari del simulador iOS contra el runtime local (título, Elegir → Fototeca → Cambiar foto, pila, «zzz», Organizar sesiones). Sin cambios en datos de producción.

## 2026-09-29 — Split de 5 días: lista de clientes y pestañas de días — claude-code

- La lista de clientes del coach cuenta las sesiones del programa («5 sesiones · Programa publicado»), no la frecuencia del perfil. La frecuencia sigue en Perfil, en el resumen del alta y en «Tu semana» de la app del cliente, que describen el perfil.
- Hoy: el selector de días lleva `filtros--dias` y `data-dias`. Con 5 días o menos, rejilla de columnas iguales (todas a la vista, 44 px de alto); con 6 o 7, se desplaza con un degradado en el borde. Los chips de la biblioteca no cambian. Con 4 días también pasa a rejilla: antes, a 320 px, la cuarta pestaña ya quedaba medio cortada.
- Verificado: 868 pruebas, tsc, lint, build, 91 HTTP; navegador a 320/375/390 px (5 pestañas completas, sin desplazamiento de página ni de fila; tocar Lower C la abre); María «5 sesiones»; biblioteca sigue desplazable; Safari del simulador iOS con las 5 pestañas visibles. Programa y perfil de Angel sin tocar.

## 2026-09-29 — Split de 5 días Lower/Upper (mensaje 01 §3) — claude-code

- `PLANTILLAS_5_DIAS` en `shared/plantillas-base.ts` (tipo aparte `PlantillaBase5`; `PLANTILLAS_BASE` intacta para v1, semilla y presentación): Lower A cuádriceps, Upper A, Lower B glúteos y femorales, Upper B, Lower C combinado; sólo fichas fijas con foto.
- `planBase(cliente, frecuencia)`: con 5 usa el split de 5; con cualquier otra, los 4 de siempre. En el alta, cambiar la frecuencia regenera el programa sólo si el coach no lo tocó (marcar «revisado» no cuenta como tocarlo).
- Editor → «Organizar sesiones» → «Pasar a 5 días» (sólo con 4 días, 2 Lower y 2 Upper): confirma en lenguaje sencillo, reordena L-U-L-U conservando ids, nombres y ejercicios, añade Lower C y deja el programa por revisar. `src/producto/cincoDias.ts`.
- Verificado: 866 pruebas, tsc, lint, build, 91 HTTP (plan de 5 días se publica y el cliente lo lee); runtime local a 375×812 (alta con 5 días → 5 sesiones en revisión y Vista previa; Lucía de 4 → Pasar a 5 días → publicar, su sesión previa sigue en Actividad); `/qa/cliente` a 320 px con 5 pestañas que se desplazan en horizontal, sin desborde de página.
- No se tocó el programa de Angel en producción.

## 2026-09-29 — Arreglos QA de la Biblioteca Maestra — claude-code

- Una sola fuente de etiquetas (`src/dominio/etiquetas.ts`, textos del panel): coach y cliente dicen igual «Hombro (frontal)», «Polea / cable», «Máquina Smith», «Abdomen y core», «Femorales». `etiquetasBiblioteca.ts` los reexporta.
- `etiquetaCarga()`: «Lastre añadido» en peso corporal (y en dominadas/fondos, que la semilla guarda como barra). En el formulario del coach, con «Peso corporal» la opción se titula «Lastre que añades».
- M02-045 → cable; M02-059 → carga total con explicación del disco; M02-260/261 → explicación con banda elástica. `--corregir` actualiza sólo filas M02 sin tocar por Santiago (`actualizado_en = creado_en`, sin foto), con respaldo y ensayo idempotente. Aplicado en local.
- Mientras se busca, chips y equipo se atenúan (`filtro--en-pausa`, `aria-disabled`) y aparece «Buscando en toda la biblioteca»; al borrar vuelven los filtros.
- Staging: `--corregir` actualizó 4 filas (las previstas); preview redesplegado (`72af115d`). Producción (autorizada por el dueño): ensayo limpio y `--aplicar`, 279 insertadas, 1 ejercicio previo de Santiago intacto, clientes 8 / rutinas 24 / sesiones 40 sin cambios; `/api/v2/biblioteca` da 401 sin sesión.
- Verificado: 858 pruebas, tsc, lint, build, 88 HTTP; navegador 375×812 (coach y `/qa/cliente` con etiquetas idénticas, Push-Up «Lastre añadido», Cable Machine Shoulder Press «Polea / cable», búsqueda con Pecho); toque real del chip «Aductores» en Safari del simulador iOS.

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
