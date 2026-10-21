# Handoff de Santiago Fitness Method

## 2026-10-21 — PR #14 aprobado, integrado y publicado — codex

- El dueño indicó «está bien, merge ahora» tras revisar la preview. Turno `a4985bf`. [PR #14](https://github.com/dayanivan681/santiago-fitness-method/pull/14) integrado mediante merge normal **`1bf0404e7a5a69f82ff961ee6578864100e2b380`**; cabeza final **`50f9551cdc69e49a80f19e35de3687ecf90ff9ee`**. Sin conflictos. Producto del merge idéntico a la cabeza verificada.
- Adaptación exclusiva coach/admin en laptop aprobada previamente: más ancho, formularios distribuidos, filas compactas y acciones/pestañas accesibles al desplazar. Se añadió la nota coach «Más espacio para trabajar en tu laptop» con los dos puntos ya propuestos en el PR revisado; texto mostrado también en el chat antes de publicar conforme a CLAUDE.md. Ningún otro cambio de comportamiento.
- Checks frescos sobre el producto final: **1082/1082 pruebas en 128 archivos**, npm test -- --maxWorkers=3; npm run lint, npm run build/TypeScript/PWA y git diff --check PASS. Avisos conocidos Node/JSDOM. No se repite la suite HTTP ni el QA completo de la implementación: solo adaptación CSS/markup más nota, sin cambios API.
- Preview de cabeza final: Pages **d98f2f7e-3e7e-4b70-9a0f-9cd9ac57ee90**, source 50f9551, SUCCESS. Producción **989cf209-1e4f-4ed7-82c2-400a27322dae**, source 1bf0404, SUCCESS en https://santiago-fitness-method.pages.dev. HTML de /demo/coach y **9 archivos** (6 assets enlazados, JS/CSS Coach, sw.js) coinciden byte a byte con el compilado probado. API /api/v2/inicio sin sesión devuelve 401. Comprobaciones iniciales durante propagación seguían leyendo el build anterior; después del despliegue todos coinciden.
- Verificación en demo pública de producción: Hoy → Clientes → Alicia → Preparar cambios; editor nuevo activo, barra sticky, sin desborde a viewport efectivo 1242×924, consola sin errores/avisos. Solo datos sintéticos, sin publicar/guardar programas reales. Las novedades se desactivan deliberadamente en demo; su estructura/audiencia se verifica por suite existente y artefacto publicado. No se certifica una sesión remota privada ni Windows/Edge, Safari, hardware o QA nativo nuevo.
- Evidencia temporal fuera de Git: /tmp/sfm-coach-laptop/merge-tests.log, merge-lint.log, merge-build.log, produccion-merge.json y produccion-merge.jpg. Servidor local de preview detenido al cerrar; pestaña de producción disponible como entrega. Sin vídeo, mensajes a Santiago, cambios Access, datos reales ni docs/cliente. Cliente sin fuentes/estilos modificados; la nota nueva tiene audiencia coach.
- **Siguiente:** ninguno para integrar/publicar este PR. El dueño puede recargar el portal del coach en la laptop de Santiago. El posible AbortError por navegación rápida registrado en el QA anterior queda como observación para un bug run si aparece en uso normal; no se amplía alcance aquí.

## 2026-10-21 — Coach/admin en laptop: PR #14 y preview, sin merge — codex

- El dueño pidió mejorar la interfaz en navegador de laptop y delimitó **solo coach/admin; no cliente**. Turno reclamado en `e02a706`; código **`05b0b748f97c7f0fb1512eb5d7f253a5fa20a1bf`**, rama `codex/coach-laptop-browser`, [PR #14 en borrador](https://github.com/dayanivan681/santiago-fitness-method/pull/14). Sin merge ni publicación del producto nuevo en producción.
- Presentación desde 960 px: navegación lateral, más ancho útil, formularios del alta en dos columnas, revisión con contexto lateral desde 1200 px, pestañas y acciones accesibles al desplazar. Controles de unir y reordenar en la fila; filas simples de 144 a 81 px y editor de revisión de 720 a 902 px a 1366×768. En edición de ficha a 1024×600 se oculta el listado lateral y quedan 804 px de editor. Sin desborde observado a 960×600, 1024×600, 1280×650 y 1366×768.
- Archivos: coach-laptop.css (todos los selectores bajo .sfm-shell--coach y media queries >=960), importación en Coach.tsx y clases/atributo de presentación en EditorPlan.tsx/Onboarding.tsx. Sin handlers, reglas, datos, API, dependencias ni fuentes/estilos del cliente modificados. A 390 px conserva layout móvil; cliente Hoy abre fuera del scope coach. No se afirma una auditoría completa del cliente.
- Checks frescos: **1082/1082 pruebas, 128 archivos** con npm test -- --maxWorkers=3; npm run lint, npm run build/TypeScript/PWA y git diff --check PASS. Avisos conocidos Node/JSDOM. QA sintético IAB: alta → organización → añadir/cerrar → bi-serie → prescripción → revisión/publicación; ficha → editar → guardar borrador. Listo de Prescripción con hit test positivo sobre la barra. Build compilado final: ficha de Alicia, editar y guardar confirmados a 1280×720, footer dentro del viewport. Los datos de demo se reinician al recargar; no se usan cuentas ni datos reales.
- Una navegación inmediata ida/vuelta durante QA registró AbortError de ViewTransition; apertura rápida inicial de editar no cambió de estado, repetir desde ficha estable sí. No se modifican transiciones en esta adaptación; registrar para el bug run si se reproduce en uso normal. No se repiten suite HTTP (sin cambios API), Windows/Edge, Safari nativo, VoiceOver, hardware ni sesión privada de Santiago.
- [Preview Pages](https://1237064e.santiago-fitness-method.pages.dev/demo/coach), deployment **1237064e-4f5e-4319-a2f1-6984db00374f**, source 05b0b74, **SUCCESS**. GET responde 302 a Access; protección conservada y recorrido remoto autenticado no certificado. Preview local compilada independiente del checkout en http://127.0.0.1:5173/demo/coach; dev server detenido, viewport temporal restaurado. Capturas/logs fuera de Git en /tmp/sfm-coach-laptop/, incluida comparación antes-1366.jpg / despues-1366.jpg y entrega-1280.jpg.
- Este cierre publica solo HANDOFF/BUILD_LOG en main; comparación de src/shared/functions/public/index/package con e02a706 sin diferencias. Producción conserva el producto anterior. Sin vídeo, envíos a Santiago, cambios de Access o docs/cliente.
- **Siguiente:** dueño revisa #14/preview; esperar visto bueno antes de merge/producción. Antes del despliegue, añadir y aprobar novedad coach según CLAUDE.md. Texto propuesto, aún sin publicar: «Más espacio para trabajar en tu laptop»; «Revisa el programa con más ejercicios a la vista»; «Guardar, publicar y cambiar de sesión quedan a mano mientras ajustas la rutina». Mantener cliente fuera de alcance.

## 2026-10-21 — Avisos de sesiones corregidos, full test y producción — codex

- El dueño autorizó **arreglar en test y producción, correr full test y preparar el mensaje para Santiago**. Después aprobó expresamente el texto de la novedad: «Publicar tu programa, más claro». Turno `4324b2a`; implementación **`602b49a414b016f84721abb1b6f5592f99181a4d`**; [PR #13](https://github.com/dayanivan681/santiago-fitness-method/pull/13) integrado mediante merge normal **`07dd8f403916cf304e14a149c505ae9167bf3782`**. Árbol de producto del merge idéntico al verificado; sin cambios adicionales.
- Contrato: conserva mínimo de 5 ejercicios/máximo de 8 bloques y la rotación elegida. Cada error de sesión identifica nombre/recuento y ruta concreta; [7,7,7,4] rechaza Lower B y [7,7,7] / [7,7,7,5] aceptan. No se eliminan sesiones ni se cambia frecuencia automáticamente.
- Editor: aviso contenido con título y texto comprensible, marca discreta de pendiente, Revisar Lower B cambia de sesión y pone foco en el nombre. Intentar publicar lleva al aviso existente sin duplicarlo. Alta distingue días por semana y sesiones del programa; conserva borrador/nombre/ejercicios al corregir. Onboarding usa safeParse; ErrorVisible común y tarjeta de suscripción presentan errores de validación/red/respuestas internas sin JSON, rutas ni claves, con indicaciones humanas. Avisos existentes ya comprensibles se conservan. No se afirma una auditoría manual de todos los mensajes posibles de la app.
- Regresiones: alta real del componente 3×7 con cuarta incompleta → explicación → quitar cuarta → alta correcta; botón de revisión no modifica el plan, foco correcto; contrato y mensajes compartidos, incluidas respuestas internas, conexión, duplicados y mezcla de errores. **1082/1082 pruebas, 128 archivos**, lint, build/TypeScript y diff-check PASS. Avisos conocidos Node/JSDOM.
- **117 comprobaciones HTTP PASS** tras preparar base/runtime local aislados. Ensayo adicional contra API local: guarda borrador 7/7/7/4, rechaza publicarlo con 400 «Lower B: tiene 4 ejercicios y necesita al menos 5.», conserva la revisión, acepta corrección a 7/7/7 y crea con 201; lectura confirma publicado. El primer intento del guion trató de crear un plan aún en estado borrador y recibió correctamente el aviso de revisarlo/publicarlo; se corrigió el guion al flujo real antes de medir el caso. Sin cambios de producto por ese ajuste del ensayo.
- Preview Pages **SUCCESS**: `e0796070-a2d5-4836-98f8-a48744036a55`, source `602b49a`, https://e0796070.santiago-fitness-method.pages.dev/demo/coach, 302 a Access; protección conservada. IAB compilado local 1280×720 y 320×568: tres sesiones de siete, error de cuarta incompleta, navegación/foco, aviso único y alta correcta sin pérdida. Sin desborde a 320; viewport restaurado. No se repite Safari nativo/instalación/VoiceOver/teléfono físico en este arreglo.
- **Producción verificada** en https://santiago-fitness-method.pages.dev: Pages `9f6d489d-4146-479b-8d7c-01067769ba69`, source `07dd8f4`, SUCCESS. `/demo/coach` 200; seis assets enlazados, módulo Coach y sw.js (8 archivos) idénticos al build probado. API cliente anónima 401. Repetición de la UI en la **demo sintética de producción**: 7/7/7/4 → aviso comprensible único → Revisar Lower B/foco → quitar cuarta en Organizar → remarcar revisión → alta 7/7/7 publicada. Consola sin errores/avisos. No es una publicación de un cliente real ni una sesión privada del coach.
- Capturas y mediciones temporales fuera de Git: `/tmp/sfm-avisos/aviso-320-final.jpg`, `produccion-aviso.jpg`, `produccion-publicado.jpg`, `alta-http.json`, `produccion.json`; logs completos de pruebas/lint/build/HTTP en esa carpeta. Sin dependencias, migraciones, cuentas o datos reales nuevos, vídeos, envíos a Santiago ni cambios en docs/cliente. No se inspeccionó el borrador privado recibido en el audio: confirmar su contenido sigue correspondiendo al coach. Servidores de QA propios detenidos; demo pública mantenida como entrega.
- **Siguiente:** dueño envía a Santiago el mensaje preparado abajo para volver a intentar desde su borrador. Si persiste el bloqueo, pedir captura del nuevo aviso y recuentos de Organizar sesiones. La investigación de GIF/costes anterior de Claude sigue fuera de este turno.

Mensaje preparado, **no enviado**:
> Santiago, ya está actualizado. Vuelve a abrir el borrador de la clienta y revisa «Organizar sesiones»: si vas a usar solo tres sesiones, quita la cuarta que no usarás. Después marca «He revisado…» y publica. Ahora, si falta completar alguna sesión, la app te dirá cuál y te llevará directo a ella. Si te vuelve a bloquear, mándame una captura.

## 2026-10-21 — Repetición del caso de Santiago con tres sesiones de siete — codex

- El dueño pidió corregir el mensaje, remarcó que todos los avisos deben ser elegantes y comprensibles, y después indicó **hacer primero la misma prueba y traer soluciones**. Se respeta esa última secuencia: no se implementó ningún cambio. Turno `6f14b70`; rama `codex/alta-sesiones-claras` creada pero sin commits propios ni cambios de producto; sin PR nuevo. El cierre vuelve a main y publica solo documentación.
- Demo compilada actual en `http://127.0.0.1:5173/demo/coach/nuevo`, IAB 1280×720. Alta ficticia, frecuencia 3; añadidos ejercicios mediante la UI hasta dejar Upper A/Lower A/Upper B en **7/7/7** y Lower B inicialmente en 5. Organizar sesiones confirmó los cuatro recuentos.
- Ensayo controlado: quitar un ejercicio de Lower B → **7/7/7/4**; mostrar Lower A con 7/8 bloques → revisar/publicar → mismo error Zod de la foto. Restituir el quinto en Lower B → **7/7/7/5** → alta y publicación correctas. Después preparar cambios → Organizar sesiones → quitar Lower B → publicar → **tres sesiones de siete ejercicios publicadas**. El caso de siete ejercicios funciona; el bloqueo aparece si otra sesión del programa queda incompleta.
- No se accedió al borrador real ni se conoce su cuarta sesión. La repetición usa datos sintéticos con los recuentos y flujo descritos, no el contenido privado exacto del plan. Hipótesis de la cuarta sesión coherente con fotos/audio, pendiente de confirmar con Santiago. No atribuir el fallo a esa sesión como certeza.
- Identidad/título, contenido útil, sin overlay, consola sin errores/avisos y transiciones de interacción verificados. Capturas temporales fuera de Git en `/tmp/sfm-santiago-3x7/`: recuentos-7-7-7-5.jpg, error-7-7-7-4.jpg, publicado-7-7-7-5.jpg y publicado-7-7-7.jpg. Sin Playwright CLI, dependencias nuevas, cuentas/escrituras reales, datos privados en Git ni cambios en docs/cliente. Pestaña/servidor propios cerrados. No se repite Safari/hardware.
- Checks frescos: **1071/1071 pruebas, 126 archivos**, lint, build/TypeScript y diff-check PASS; avisos conocidos Node/JSDOM.
- **Soluciones propuestas, aún sin implementar:** (1) para el borrador actual, revisar recuentos en Organizar sesiones y completar la cuarta o quitarla si el coach desea solo tres; remarcar revisión antes de publicar; (2) aviso contextual con nombre/recuento, p. ej. «Falta completar Lower B. Tiene 4 ejercicios y necesita al menos 5», botón Revisar Lower B y marca de pendiente; (3) explicar «3 días por semana · 4 sesiones en rotación» para evitar confundir frecuencia y estructura; (4) centralizar mensajes de error humanos en ErrorVisible y sus entradas, evitando JSON, rutas o claves técnicas, con acción y preservación del borrador. Conservar reglas de 5 ejercicios/8 bloques y la programación elegida; no borrar sesiones automáticamente. Añadir regresiones de alta y avisos compartidos al implementar. Preparar nota de novedades para aprobación del dueño antes de producción conforme a CLAUDE.md.
- **Siguiente:** dueño revisa estas soluciones; la implementación prevista queda pendiente tras su indicación de traer primero el resultado. La investigación de GIF/costes anterior de Claude no se reanuda.

## 2026-10-21 — Chequeo rápido del bloqueo en alta de tres días — codex

- Solicitud: escuchar primero el audio de WhatsApp (41 s) y comprobar el bloqueo al crear una persona que entrena tres días. Audio transcrito localmente con Whisper; dos fotos aportadas muestran frecuencia 3, cuatro pestañas (Upper A/Lower A/Upper B/Lower B), una sesión con 7/8 bloques y error Zod en bruto. Evidencia del cliente, no autorización para publicar su plan. No se archivan datos personales, audio o fotos en Git.
- Confirmado en código y demo: `planBase(..., 3)` conserva cuatro sesiones de rotación; frecuencia semanal y número de sesiones del programa son conceptos distintos. `Plan` valida todas las sesiones, no solo la visible. El aviso genérico de `EditorPlan.tsx` aparece incluso al ver una sesión válida si otra tiene menos de cinco ejercicios. `Onboarding.tsx` muestra `ZodError.message` como JSON, sin identificar el día que falla. Es un fallo de claridad reproducible; no se ha inspeccionado el borrador privado de la clienta ni confirmado su cuarta sesión.
- Reproducción IAB local, 918×924: alta ficticia → frecuencia 3 → cuatro pestañas → quitar un ejercicio de Lower B (4) → volver a Upper A (5) → revisar/publicar. Se reproduce el mismo error técnico. Organizar sesiones muestra 5/5/5/4; quitar Lower B del borrador → Listo → remarcar revisión → publicar crea correctamente un programa ficticio de tres sesiones. Consola sin errores/avisos, contenido visible y sin overlay. Capturas temporales fuera de Git: `/tmp/sfm-alta-3dias/`.
- Comprobación del contrato con casos sintéticos: [7,7,7,4] rechaza por mínimo; [7,7,7] acepta; [7,7,7,5] acepta. No es un rechazo por tener siete ejercicios ni por entrenar tres días. La cuarta sesión incompleta es una hipótesis coherente con las fotos, no una certeza sobre el borrador real.
- Checks de la base actual: **1071/1071 pruebas en 126 archivos**, lint, build/TypeScript y diff-check PASS; avisos conocidos Node/JSDOM. Servidor y pestaña propios cerrados. Solo documentación en este cierre, sin cambios de producto, datos reales, cuentas, vídeos, mensajes o docs/cliente. No se repite Safari/hardware.
- **Siguiente:** comprobar en Organizar sesiones los recuentos del borrador real. Si se desean exactamente tres sesiones, el coach puede quitar la sobrante; si desea la rotación de cuatro, completar la cuarta. Para una corrección posterior: indicar nombre y recuento de cada sesión inválida, sustituir JSON por texto comprensible y explicar frecuencia versus rotación; añadir regresión [7,7,7,4]. El dueño solo pidió verificación, por lo que no se implementa ni cambia la programación real. La investigación de GIF/costes anterior de Claude sigue pendiente y no se reanuda en este chequeo.

## 2026-10-21 — PR #12 integrado por autorización; relevo a Claude — codex

- El dueño indicó «integralo» y que usará Claude para el bug run y test. [PR #12](https://github.com/dayanivan681/santiago-fitness-method/pull/12) integrado mediante merge normal **`e22134a0026357006d6e9f80c66664ce47d7a984`**, cabeza aprobada `20fd8d1`. Sin conflictos; producto idéntico al `9c18cc1` probado y al PR aprobado. Turno sincronizado y reclamado `ddbfd8a`.
- Se integra el refinamiento del coach: revisión primero, Clientes/ficha/editor/Biblioteca compactos, Listo visible, filtro Ver todos corregido y cierre StrictMode reparado. Sin cambios adicionales de código durante la integración.
- Checks de cierre sobre el merge: **1057/1057 pruebas, 123 archivos**, lint, build/TypeScript y diff-check PASS. Avisos conocidos Node MaxListeners/JSDOM. Esta integración no repite la auditoría ampliada de bugs ni Safari: el dueño la delega a Claude. QA Safari 16 Pro/SE anterior y límites siguen en [design-qa.md](../design-qa.md).
- Producción https://santiago-fitness-method.pages.dev: Pages **`d75845d3-c9bd-42fc-ad49-4f574bd012d8`**, source `e22134a`, check **SUCCESS**. `/demo/coach` 200; los seis archivos enlazados, módulo Coach y sw.js coinciden byte por byte con el build local del merge (8 archivos). API cliente anónima 401. [Mediciones](refinamiento-coach-2026-10-21/implementacion/produccion-merge.json). Solo GET, sin sesión remota autenticada ni escrituras reales. El intento anterior a terminar el despliegue recibió todavía los assets de la versión previa; al finalizar coincide el artefacto nuevo.
- **Siguiente: Claude Code hace el bug run y test solicitado por el dueño.** Leer CLAUDE.md y esta entrada; sincronizar y reclamar como claude-code. Priorizar Hoy → revisar programa → ficha → preparar cambios → Prescripción/Listo → guardar/retomar/publicar solo con datos sintéticos, pagos/búsqueda/vacíos, Biblioteca y regresión del cliente. Revisar movimiento reducido, scroll/áreas táctiles y cierre/foco; reportar fallos reproducibles con evidencia. Producción de solo lectura; usar demo/local o staging para escrituras. Teléfono físico, nueva instalación PWA, VoiceOver y teclado nativo siguen sin certificar en este refinamiento. No se ha contactado ni iniciado Claude desde este chat.
- Sin vídeo ni mensajes a Santiago, sin nuevas funciones o cambios en docs/cliente. Turno liberado mediante handoff:publish.

## 2026-10-21 — Coach implementado: claridad, enfoque y acción; PR #12 sin merge — codex

- El dueño considera buenas las tres propuestas y delega continuar con claridad, enfoque y acción. Se comunicó la propuesta 1 como base antes de construir. Turno `acc9ac6`; código en `codex/coach-claridad-ios`, commit **`9c18cc185fb1bd1ce00293c1e16e664dafe0c8b7`**. [PR #12 en borrador](https://github.com/dayanivan681/santiago-fitness-method/pull/12), sin integrar. La aprobación anterior de merge correspondía a #11.
- Hoy prioriza el programa que necesita revisión y su acción; pagos, resumen y actividad quedan después. Clientes, ficha, sesiones agrupadas, editor y Biblioteca comparten tipografía de sistema, jerarquía compacta y controles táctiles. Escritorio conserva lista/ficha y navegación lateral. Prescripción mantiene Listo visible; la ayuda sigue disponible. [Inventario](refinamiento-coach-2026-10-21/IMPLEMENTACION.md).
- Dos bugs claros corregidos: Ver todos también limpia el filtro de pagos; el hook de presencia restablece su flag después del montaje doble de StrictMode, que impedía cerrar hojas en desarrollo. Regresiones nuevas: filtro y dos variantes de movimiento. Las dos del hook fallaron antes y pasan después. Borrador guardado informa que el programa actual no cambió. Sin dependencias, endpoints, migraciones, permisos o datos reales nuevos; estilos propios del cliente intactos.
- [Preview](https://f5bd9e07.santiago-fitness-method.pages.dev/demo/coach), deployment **`f5bd9e07-8cbf-46c8-8f53-cbdc2b74a0d0`**, source `9c18cc1`, Pages **SUCCESS**. GET remoto devuelve 302 a Access, conservado. No se certifica una sesión remota autenticada: flujos verificados en build compilado local. Demo abierta en http://127.0.0.1:5173/demo/coach, independiente del checkout.
- Checks finales en el código del PR: **1057/1057 pruebas, 123 archivos**, lint, build/TypeScript y diff-check PASS. Avisos conocidos Node/JSDOM. Recorrido sintético Nora: prescripción 4→5 series, guardar/retomar/publicar en demo; pagos, búsqueda/vacío/recuperación, actividad, Biblioteca y abrir/cerrar formularios. Cliente conserva estilo y cierre de hoja. IAB 320/390/1024/1440 sin desborde; comparación fuente/render y cinco superficies en [design-qa.md](../design-qa.md).
- Safari del simulador iOS 27: 16 Pro 402×714 y SE 375×549. CTA revisión, Listo y Quitar con hit tests positivos; hoja cierra. SE usa el compilado final y confirma el guardado. Capturas 16 Pro anteriores al ajuste StrictMode, mismo CSS móvil. [16 Pro](refinamiento-coach-2026-10-21/implementacion/ios-16-hoy.png), [SE](refinamiento-coach-2026-10-21/implementacion/ios-se-hoy.png). No se certifican dedo, instalación PWA nueva, VoiceOver, teclado nativo o rendimiento de iPhone antiguo. No se repitió HTTP suite al no cambiar API.
- Este cierre publica **solo documentación/evidencia en main**; producto idéntico a `acc9ac6`. Código nuevo permanece en #12. Dev server y simuladores propios detenidos; preview compilada 5173 disponible, viewport restaurado. Sin vídeo, envíos a Santiago o cambios en `docs/cliente`.
- **Siguiente:** el dueño revisa #12/preview y, si está conforme, autoriza el merge. Preferible revisar también en su iPhone. No integrar ni publicar el nuevo coach en producción sin visto bueno nuevo. Las ideas fuera del plan siguen fuera.

## 2026-10-21 — Coach: diagnóstico y tres propuestas, sin implementar — codex

- El dueño aceptó continuar con el refinamiento del coach después de integrar el cliente. Sincronizado y reclamado `a383808`. [Informe, recorrido, capturas y propuestas](refinamiento-coach-2026-10-21/README.md). El estilo publicado del cliente permanece como referencia; sin cambios de producto ni datos reales.
- Demo compilada local en IAB, 390×844 y 1440×1024: Hoy → Clientes/búsqueda → ficha/programa → Actividad → editor → Prescripción → Biblioteca. Recorridos consultados operativos; borrador en memoria cancelado sin guardar/publicar. Hallazgos de jerarquía: cabecera extensa, atención debajo de contadores, varias capas antes del programa, creación de ejercicio antes de buscar. La lista lateral de escritorio ya existe. No se inventan bugs ni nuevas métricas.
- Tres conceptos ImageGen mostrados una vez en este orden: [1](refinamiento-coach-2026-10-21/propuestas/1.png), [2](refinamiento-coach-2026-10-21/propuestas/2.png), [3](refinamiento-coach-2026-10-21/propuestas/3.png). Referencias adjuntas: Hoy/lista actuales y cliente aprobado; prompts y hashes versionados. Error visual en 3: Alicia «Al día» bajo «Pagos pendientes»; se señaló al dueño y se documenta como contenido que **no debe implementarse**. Otras inferencias del mock también se corrigen en el informe.
- Checks de la base actual: 1054/1054 tests en 123 archivos, lint, build/TypeScript y diff-check PASS; avisos conocidos Node/JSDOM. Consola sin errores en las vistas revisadas. Sin Safari nativo/PWA/VoiceOver/hardware nuevos ni escrituras remotas. Viewport restaurado y pestaña de auditoría cerrada. No vídeo ni envío a Santiago; `docs/cliente` intacto.
- **Siguiente:** el dueño elige 1, 2 o 3 o pide ajustes. Después implementar la dirección elegida para móvil/escritorio en rama con PR/preview y QA, sin merge antes de visto bueno nuevo. Este turno entrega diagnóstico y opciones; el dashboard del coach aún conserva su interfaz anterior.

## 2026-10-21 — PR #11 aprobado, integrado y publicado — codex

- El dueño indicó **«Merge»** después de revisar y aceptar la propuesta 2. Sincronizado y reclamado turno `3c38cbd`. [PR #11](https://github.com/dayanivan681/santiago-fitness-method/pull/11) integrado mediante merge normal **`de9a703e35c5fa76fa35aca169bab28fd007c931`**. Árbol de producto idéntico al `528ebbf` aprobado; sin conflictos ni cambios adicionales de producto.
- Producción https://santiago-fitness-method.pages.dev: Pages **`6247ae6f-0fcb-428f-9583-2835f49b67e8`**, source `de9a703`, check **SUCCESS**. `/demo/cliente` 200; seis archivos enlazados, módulo `Cliente-BGCmWM-u.js` y `sw.js` coinciden byte por byte con el build local del merge. CSS `index-D_8fqSF9.css`, entrada `index-CKwnXAnf.js`. [Mediciones](refinamiento-ios-2026-10-20/implementacion/produccion-merge.json).
- Checks repetidos sobre el merge: `npm test -- --maxWorkers=3` **1054/1054, 123 archivos**, `npm run lint`, `npm run build` con TypeScript y `git diff --check` PASS. Avisos conocidos Node MaxListeners/JSDOM. API cliente anónima 401 y admin 302 a Access. Solo GET remotos; sin cuentas, entrenamientos reales, migraciones ni cambios en `docs/cliente`. Python urllib recibió un 403 del entorno; la repetición con curl obtuvo 200 y permitió contrastar los ocho archivos; no es un fallo demostrado de la app.
- Sin nueva prueba instalada o de teléfono físico: se conserva el QA Safari 16 Pro/SE de la implementación como evidencia previa, con sus límites en [design-qa.md](../design-qa.md). No se ha regenerado vídeo ni enviado nada a Santiago.
- **Siguiente:** ninguna implementación pendiente de este refinamiento. El dueño puede revisar el diseño publicado en su iPhone instalada; registrar ajustes si aparecen. Tendencias por ejercicio, esfuerzo 1–10, rachas y compartir resumen siguen fuera del alcance aprobado.

## 2026-10-21 — Propuesta 2 implementada; PR #11 y preview, sin merge — codex

- El dueño eligió **la propuesta 2** y priorizó mantener al cliente enfocado en la rutina. Turno reclamado `a0496c6`; implementación en `codex/cliente-rutina-ios`, **`528ebbf`**. [PR #11 en borrador](https://github.com/dayanivan681/santiago-fitness-method/pull/11), sin integrar. La elección visual autoriza esta implementación, no un merge nuevo.
- Hoy: cabecera breve, selector, foto real/sesión/Comenzar dentro de una tarjeta, semana y lista agrupada. Entrenar: identidad en fila y registro próximo, campos de sistema y CTA centrado; ayuda después de la tarea. Biblioteca, Progreso, Perfil, hojas y resumen comparten tipografía, densidad y superficies. Pestañas flotantes con la misma huella inferior de 76 px + área segura. Sincronización correcta como icono accesible; pendientes/offline/conflictos con texto visible.
- Conservados repositorio, datos, rutinas/prescripciones, lb/lado, RIR, fotos/GIF, variantes, borradores, bi-series, descanso y cierre. Sin dependencias, endpoints, migraciones, cuentas remotas ni cambios en `docs/cliente`. La app sigue siendo React/PWA. No se ha hecho vídeo ni enviado nada.
- [Preview publicada](https://9b5c6324.santiago-fitness-method.pages.dev/demo/cliente), deployment **`9b5c6324-b78f-4fbe-ae08-58b3a40cb594`**, source `528ebbf`, Cloudflare Pages **SUCCESS**. Access conservado: IAB remoto llega al login de Google/email. No se certifica un recorrido remoto autenticado; la comprobación funcional usa el build compilado local. No se modifica Access ni se crean cuentas remotas.
- QA: **1054/1054 pruebas, 123 archivos**, lint, build/TypeScript y diff-check PASS; avisos conocidos Node/JSDOM. IAB 320/390/1024 sin desborde; Safari iOS 27, **16 Pro 402×714 y SE 375×549**. Comenzar visible en ambos; registrar/cerrar en SE con hit tests positivos. Barras SE: progreso 341–403, descanso 407–469, pestañas 473–541; separación de 4 px. Demo 25 lb/lado × 4, RIR 3 → descanso → Biblioteca/regreso → resumen 1/1/6 → semana 1/4. Bi-serie A1→A2 sin descanso y vuelta a ronda 2 con 2:00 PASS. Movimiento reducido en IAB: transición 0s y guardado/resumen operativos, emulación restaurada.
- [Informe de comparación visual y límites](../design-qa.md), [capturas y comparaciones](refinamiento-ios-2026-10-20/implementacion/README.md). Comprobación final 16 Pro: [Hoy](refinamiento-ios-2026-10-20/implementacion/ios-16-hoy.png) y [registro](refinamiento-ios-2026-10-20/implementacion/ios-16-registro.png), cero diálogos y hit tests positivos en ambos CTA; el archivo anterior `ios-16-pantalla.png` muestra la bienvenida. Se comparan juntos propuesta y render, incluidos tipografía, composición, color, medios y texto. El JPEG de IAB altera el rojo frente al CSS; PNG del simulador coincide con `#db3027`. Se conservan fotos y prescripciones reales en lugar de las invenciones del mock. Nueva instalación PWA y tacto/rendimiento físico **no repetidos**; no confundir el QA físico anterior con prueba de esta rama. P3 registrado: voz en tercera persona del vacío heredado de Progreso.
- Este cierre publica **solo documentación/evidencia en main**; el código del diseño queda en #11. Preview local del build: http://127.0.0.1:5173/demo/cliente; sirve `dist` compilado, independiente del checkout. Los procesos de QA y simuladores creados para la prueba se detienen; no se toca el 18 Pro ajeno que ya estaba abierto.
- **Siguiente:** el dueño revisa #11/preview, preferiblemente en su iPhone instalada. Resolver cualquier ajuste y **esperar visto bueno explícito antes de merge/publicación del diseño en producción**. Vídeo ya enviado por el dueño, no regenerar. Ideas fuera del plan siguen fuera.

## 2026-10-20 — Refinamiento visual iOS: diagnóstico y tres propuestas — codex

- El dueño pide refinar **todas** las áreas del cliente hacia la experiencia de Apple Fitness, conservando las funciones. Sincronizado y reclamado en `34e74d9`. Se aplica Build iOS Apps para revisar Safari del simulador y las guías de diseño para preparar una referencia visual antes de implementar.
- [Diagnóstico, recorrido, capturas y propuestas](refinamiento-ios-2026-10-20/README.md): Hoy, Entrenar/registro, Biblioteca, Progreso, Perfil, descanso terminado y resumen. Safari iPhone 16 Pro, iOS 27.0; demo sintética local, controles DOM. Sin nueva prueba física, SE ni instalación; no se reabre el QA físico ya cerrado. Ningún dato real ni archivo de `docs/cliente` modificado.
- Hallazgos: cabeceras y mensajes desplazan la acción principal; registro demasiado separado de la información del ejercicio; exceso de capas inferiores en entrenamiento; jerarquía desigual entre pantallas. Son problemas de composición, sin un bug nuevo demostrado. **No hay cambios de interfaz todavía.** Tres conceptos ImageGen mostrados una vez en el chat, numerados por orden de aparición: [1](refinamiento-ios-2026-10-20/propuestas/1.png), [2](refinamiento-ios-2026-10-20/propuestas/2.png), [3](refinamiento-ios-2026-10-20/propuestas/3.png). Sus invenciones de contenido se documentan para no trasladarlas al producto.
- Checks: **1054/1054 pruebas, 123 archivos**, lint, build/TypeScript y diff-check PASS; avisos conocidos Node/JSDOM. Se valida la base actual, no una interfaz nueva. Solo documentación e imágenes en este cierre.
- **Vídeo resuelto por el dueño:** indicó que ya se lo envió a Santiago. La instrucción anterior de aplazarlo es histórica; no regenerar ni enviar nada.
- **Siguiente:** pendiente elegir propuesta 1, 2 o 3, o una combinación. Después implementar todas las superficies del cliente en rama con PR y preview, verificar funciones y Safari 16 Pro/SE, sin merge sin visto bueno nuevo. La guía de ideación requiere selección antes de construir; esta fase de diagnóstico queda entregada y el refinamiento sigue pendiente.

## 2026-10-20 — PR #10 aprobado e integrado; vídeo aplazado — codex

- El dueño autorizó el merge y pidió expresamente **no hacer el vídeo todavía**. [PR #10](https://github.com/dayanivan681/santiago-fitness-method/pull/10) integrado con merge normal **`b42290e`**. El conflicto al actualizar la rama afectaba solo a `docs/BUILD_LOG.md`; se conservaron ambos registros. Código de producto idéntico al original del PR `f027c57` y al conjunto probado `8462fc9`.
- Resultado: las series pendientes muestran el objetivo del coach, incluido su rango de reps, y omiten «0 lb» cuando no hay peso de partida. Se corrige «1 rep» en los textos afectados. No se cambian registros ni programas reales.
- Comprobación previa al merge: **1054/1054 pruebas en 123 archivos**, lint, build con TypeScript y diff-check PASS; Pages del PR SUCCESS. Avisos conocidos Node/JSDOM, sin fallos. Se recompila el merge para contrastar los archivos publicados.
- Producción verificada en Pages **`43840396`**, commit `b42290e`, check SUCCESS: `/demo/cliente` 200; JS `index--C_ZBuVn.js`, CSS `index-AzE0jwqj.css` y módulo `Cliente-IsitoBOG.js`. Los seis archivos enlazados y el módulo del cliente coinciden byte por byte con el build local del merge. API cliente anónima 401; admin 302 a Access. GET de solo lectura, sin cuentas reales ni nueva prueba física. Informe de comparación en `/tmp/sfm-pr10-produccion.json`.
- **Siguiente:** vídeo **aplazado por orden del dueño**, sin generación, captura ni render en esta tarea. Requiere una nueva indicación antes de retomarlo. No enviar nada a Santiago sin visto bueno. QA opcional de bi-series en teléfono físico e ideas fuera del plan siguen sin iniciarse.

## 2026-10-20 — Continuidad actual: PR #10 y tutorial — codex

Registro histórico: el estado actual del PR y la decisión sobre el vídeo están arriba.

- Sincronizado `main` con `559780a` y reclamado de nuevo en `e4bda5f`, después del relevo de Claude Code. El registro actualizado recoge la **prueba física del dueño: 3, 7, 9 y B7 PASS**. Es la referencia actual; los pendientes de las entradas antiguas inferiores son históricos.
- [PR #10](https://github.com/dayanivan681/santiago-fitness-method/pull/10), `claude/series-pendientes`, cabeza `f027c570c1584937548282db49e20bdf36356d7c`: abierto en borrador, Pages SUCCESS y sin conflictos al consultar. **Esperar «merge» del dueño**; esta continuación no lo integra.
- Orden indicado por el dueño: 1) tras «merge», integrar/publicar #10 y verificar producción; 2) regenerar y revisar el vídeo con [las instrucciones](tutorial-bi-series/README.md), comprobando «6–15 reps» en las series pendientes; 3) entregar vídeo y mensaje corto al dueño, sin enviar a Santiago sin visto bueno; 4) QA opcional de bi-series en iPhone físico; 5) tendencias por ejercicio, esfuerzo 1–10, rachas y resumen como imagen siguen fuera del plan actual.
- El seguimiento anterior de B7 quedó en [este informe](qa-ios-sensacion-nativa/SEGUIMIENTO-B7.md): instalación nueva de producción en SE y comparación con HTML mínimo sin JS. El aclarado también aparece en el control, con menor intensidad; no hay arreglo de producto demostrado y no se reabre el resultado físico. Sin cambios de producto ni datos reales.
- Para regenerar en este Mac habrá que resolver la instalación local de Playwright/Chromium: los guiones actuales fijan `/opt/pw-browsers/chromium` y `/tmp/claude-0/tuto`. Ajustar esas rutas de ejecución al entorno conservando escenas, cajas, 1080×1920 y 30 fps. La regeneración queda después del merge.
- Checks de este cierre: **1053/1053 pruebas, 123 archivos**, `npm run lint`, `npm run build` y `git diff --check` PASS. No apareció el fallo intermitente referido por Claude Code; se conservan avisos conocidos de Node/JSDOM. Sin nueva comprobación HTTP del runtime después de sincronizar: esta continuación solo publica documentación y evidencia.

## 2026-10-20 — PR #8 aprobado, integrado y publicado — codex

- Con el «Hágale» del dueño se sincronizó y reclamó el turno `9531b26`. [PR #8](https://github.com/dayanivan681/santiago-fitness-method/pull/8) integrado mediante merge normal **`cef5e2e`**. El árbol de producto coincide con el código `41a36d5` probado en el simulador; no se añadieron cambios de producto en esta integración.
- Producción https://santiago-fitness-method.pages.dev: Pages **`b711d85e`**, commit `cef5e2e`, check SUCCESS. Tras finalizar el despliegue, `/demo/cliente` sirve `index-C6ojQqxB.js` y `index-B7nj7LDr.css`; los seis archivos enlazados coinciden byte por byte con el build local. CSS publicado con progreso fijo y espacio del descanso en el scroll.
- `/entrar` responde 200, ofrece manifest y 11 pantallas de inicio, CSP con imágenes/manifest del mismo origen y `Referrer-Policy: strict-origin`. Manifest con inicio/scope `/`, modo standalone; PNG de SE y 16 Pro disponibles. API cliente anónima 401; admin 302 a Access. Verificación remota solo mediante GET, sin cuentas ni datos reales modificados. [Mediciones de publicación](qa-ios-sensacion-nativa/produccion-integracion.json).
- Checks repetidos sobre el merge: **1050/1050 pruebas, 123 archivos**, lint, build con TypeScript, `git diff --check` y **117 HTTP locales PASS**. Runtime local detenido al terminar. Se conservan los avisos conocidos Node/JSDOM. `docs/cliente` intacto.
- **Siguiente:** investigar el destello residual de B7 y confirmar en teléfono físico los puntos **3, 7 y 9** tras una instalación nueva. Se mantiene la matriz histórica inferior: sus FALLO describen la producción anterior al PR. La publicación no añade una nueva prueba nativa ni cierra B7; siguen sin certificar la instalación desde acceso y Hoy raíz del 16 Pro.

## 2026-10-20 — QA iOS de sensación nativa — codex

Informe previo a la aprobación e integración; estado actual en la entrada superior.

- Turno `4cbc629`, sincronizado y reclamado como «QA iOS de sensación nativa». Producción: https://santiago-fitness-method.pages.dev. Demo en memoria y fixture/cuenta **sintéticos, exclusivamente locales**; sin cuentas, programas ni entrenamientos reales modificados. `docs/cliente` intacto.
- Simuladores **iPhone 16 Pro** (`A57A612D…`, pantalla 402×874; Safari 402×714) y **SE, 3.ª generación** (`DB83DB23…`, pantalla 375×667; Safari 375×549), **iOS/Safari 27.0, build 24A434**. La geometría SE no mide el rendimiento de un SE físico.
- SafariDriver observó animaciones/geometría y activó controles DOM en Safari iOS; Maestro/XCUITest ejecutó los gestos, Ajustes e instalación. Los clics JS no se presentan como gestos táctiles. Se contrastaron UDID y dimensiones. La conexión de Maestro se aisló al cambiar de modelo porque conservaba el anterior; las acciones/aserciones fallidas por una interfaz aún en transición se repitieron desde el estado visible. **N/C = no comprobado; no equivale a PASS.**

| Punto | Producción: 16 Pro | Producción: SE | Resultado y comprobación del arreglo |
|---|---|---|---|
| A1. Entrada desde derecha, regreso inverso, fundido de pestañas y barra inmóvil | PASS | PASS | `vt-entrar-derecha`, `vt-salir-derecha`, `vt-volver-izquierda`; fundido lateral. Rectángulo de pestañas idéntico antes/después: y=638/h=76 en 16; y=473/h=76 en SE. Se repitió el SE esperando el fin de cada transición. |
| A2. Asa y arrastre de las tres hojas, prioridad del scroll | PASS | PASS | «Ejercicios del día», «Prescripción» y «Añadir ejercicio»: asa visible, scroll interior conservado y cierre mediante otro arrastre tras volver arriba. La lista del día requiere scroll en SE y cabe en 16. Gestos nativos. |
| A3. Deslizar ejercicios sin atrás de Safari | PASS | PASS | Gestos nativos 1→2→1 conservan Entrenar. Falta el tacto real con dedo. |
| A4. Barra/pulso del descanso y tarjeta que asoma debajo | **FALLO de disposición** | **FALLO de disposición** | Barra 1→0 y pulso final de **2 iteraciones PASS** en ambos, tras agotar 3 minutos reales. La tarjeta relativa queda tapada: [16](qa-ios-sensacion-nativa/16-fallo-descanso.jpg), [SE](qa-ios-sensacion-nativa/se-fallo-descanso.jpg). Arreglo local PASS en ambos: tarjeta completa, separación de 8 px y último control accesible al final del scroll. |
| A5. Check, plegado, peso/reps, resumen y semana | PASS | PASS | Diez incrementos → 25 lb/lado; reps=4. Check 300 ms y plegado 220 ms. Resumen: círculo 600 ms, cifras escalonadas, final 1 serie / 1 ejercicio / 6%; Hoy: «Semana: 1 de 4 sesiones». El resumen final del SE se comprobó también con el build corregido. |
| A6. Reducir movimiento desde Ajustes | PASS | PASS | Preferencia activada en Ajustes y reconocida por Safari (`matchMedia`=true); cero View Transitions, cifras finales inmediatas y guardar/cerrar funcionan. Sin animaciones perceptibles; el backdrop legado emite un evento de 0,01 ms. Preferencias originales desactivadas restauradas. |
| B7. Reinstalar, logo y ausencia de blanco | PASS **desde la demo**; desde acceso N/C | **FALLO desde /entrar** | En 16 se borró solo el icono antiguo de producción, preservando el local, y se instaló desde el shell/demo: [logo](qa-ios-sensacion-nativa/16-arranque.jpg), sin blanco observado. En SE no existía icono; desde acceso se instalaba sin manifest, con URL `/entrar`, sin logo y varios segundos en blanco: [captura](qa-ios-sensacion-nativa/se-fallo-inicio-blanco.jpg), [secuencia](qa-ios-sensacion-nativa/se-fallo-inicio-secuencia.jpg). El arreglo instala desde acceso con nombre Santiago FM, URL `/`, manifest y [logo](qa-ios-sensacion-nativa/se-arranque-corregido.jpg), pero **persisten fotogramas claros en la composición de arranque del SE**: [residual](qa-ios-sensacion-nativa/se-destello-residual.jpg). B7 no queda cerrado. |
| B8. Header bajo la barra de estado | PASS | N/C en cliente instalado por B7 | Sin manifest, la demo salía a [navegador interno](qa-ios-sensacion-nativa/se-demo-fuera-pwa.jpg). Arreglo local SE PASS: demo y cliente sintético completos bajo la barra de estado, sin toolbar de navegador. |
| B9. Borde: atrás con círculo; Hoy sin anterior no actúa | PASS regreso; Hoy raíz N/C | N/C instalada por B7 | Arreglo local SE PASS: Entrenar→Hoy con círculo rojo, y [Hoy raíz permanece](qa-ios-sensacion-nativa/se-hoy-raiz-no-retrocede.jpg) tras un gesto de 1.500 ms. La raíz se abrió con navegación HTTP completa después de entrar con la cuenta sintética; se cerró la bienvenida sin navegar. No se repitió ese estado autenticado en el 16. |

**Hallazgo adicional al comprobar B9:** el login nativo por email devolvía 403 «Origen no autorizado» en el runtime local: [captura](qa-ios-sensacion-nativa/se-login-local-origen.jpg). Safari con `Referrer-Policy: no-referrer` envía `Origin: null` en el POST del formulario; con `strict-origin` envía el origen correcto. Se verificaron ambas políticas con un formulario aislado en Safari iOS ([respuesta de cabeceras](qa-ios-sensacion-nativa/safari-origen.json)). Arreglo limitado a la política del login, igual que la invitación: mantiene la comprobación de origen. **Repetición nativa PASS:** POST `/entrar` 302 → GET `/` 200 → Hoy de Lucía QA; sin guardar la contraseña en el sistema. No se intentó acceder a una cuenta real en producción.

**PR sin merge:** [#8](https://github.com/dayanivan681/santiago-fitness-method/pull/8), `codex/qa-ios-descanso`, código **`41a36d5`**. Cuatro archivos de producto/pruebas: CSS del progreso y espacio de scroll; metadatos iOS solo en el login, con 11 inicios contrastados contra `index.html`; CSP que permite únicamente sus imágenes/manifest del mismo origen; `strict-origin` para el POST de acceso. Las páginas con token no ofrecen instalación. El destello residual no tiene un arreglo demostrado y queda pendiente.

**Preview:** https://codex-qa-ios-descanso.santiago-fitness-method.pages.dev, deployment **`80386fa5`**. Access conservado; acceso anónimo redirige al login. No se certifica un recorrido autenticado por ese URL remoto. Se comprobó el mismo frontend compilado con `vite preview` y el conjunto completo con `qa:servir`, sin inyectar CSS ni modificar el reloj. En los dos tamaños, hit tests positivos para «Terminar sesión» y «Siguiente», con y sin descanso, al inicio/final del scroll; el último control queda 42 px por encima del progreso.

**Checks finales:** `npm test -- --maxWorkers=3` **1050/1050, 123 archivos**; `npm run lint`, `npm run build` (incluye tsc), `git diff --check` y `npm run test:http` **117 PASS** en runtime local. Avisos conocidos de Node MaxListeners/JSDOM. El handoff en `main` contiene únicamente documentación/capturas; los arreglos permanecen en el PR abierto.

**Límites y siguiente:** revisar PR #8 y el destello residual de B7; **no integrar sin visto bueno nuevo**. Falta confirmar tacto, gestos del sistema y rendimiento en un iPhone físico; allí repetir 3, 7 y 9 tras una instalación nueva. La instalación desde acceso del 16 y Hoy autenticado sin anterior en ese modelo no se certifican. No atribuir el destello residual a hardware real ni dar por cerrado el QA físico. Vídeos/guiones adicionales: `/tmp/sfm-ios-nativa-qa/`; fallos y mediciones relevantes versionados en `docs/qa-ios-sensacion-nativa/`.

## 2026-10-20 — Cierre del plan de sensación nativa — codex

- El dueño pidió «termina ese plan» y dio el visto bueno pendiente del PR #6 en este chat. Se completan los bloques 2 y 3 en `codex/sensacion-nativa-completa`, conservando el bloque 1, con preview antes de integrar.
- Hecho: check dibujado y plegado al registrar, números con dirección sin cola, barra y pulso final finito del descanso, progreso con curva común; `ResumenSesion` con círculo propio y cifras escalonadas; indicador semanal en Hoy con frecuencia y sesiones cerradas desde el lunes local. Movimiento reducido también cancela el contador JS. Sin cambios de datos reales ni PDFs.
- Checks: **1048/1048 pruebas, 123 archivos** (`npm test -- --maxWorkers=3`), tsc, lint 0 avisos, build, diff-check y **117 comprobaciones HTTP locales PASS**. Primer intento con paralelismo por defecto agotó un test; aislado y dos suites completas con tres procesos PASS. Avisos conocidos de Node/JSDOM.
- Chromium táctil 375×812 normal/reducido: diez toques, guardar, descanso/prórroga/agotamiento, resumen y Hoy 1/4 PASS; gestos 1→2→1 y arrastre de hoja PASS; 320/1024 sin desborde ni errores de consola. Muestra del plegado ~60 fps. Evidencia en `/tmp/sfm-nativa-qa/`, detalle en el plan y BUILD_LOG. No se atribuye a Codex una prueba nueva en iPhone físico ni de instalación.
- Preview del PR #7: https://codex-sensacion-nativa-compl.santiago-fitness-method.pages.dev (despliegue `44507065`, código `9e1544a`). Access conservado; acceso Google del dueño a través de Chrome. QA remota en demo: guardar 2,5 lb/lado, descanso 3:00, resumen 1 serie / 1 ejercicio / 6% y volver a Hoy → Semana 1/4 PASS. HTML sirve `index-oC8PSuj8.js` y `index-BwhFVnlT.css`, los mismos del build probado. Sin errores de la app; avisos ajenos de una extensión de Chrome. Captura `/tmp/sfm-nativa-qa/preview-remota-resumen.png`.
- PR #6 y #7 integrados en `main`, sin reescribir historial. Árbol de producto idéntico al de la preview probada; publicación mediante `handoff:publish` y comprobación canónica a continuación. Ninguna implementación pendiente del plan. Fuera del plan siguen tendencias, valoración 1–10, rachas y compartir imagen.

## 2026-10-06 — Animaciones base: nota IA, aviso de equipo C203 y versión en URL — claude-code

- Publicada con el «sí» del dueño.
- Preview: https://codex-gifs-base.santiago-fitness-method.pages.dev (detrás de Access; Biblioteca → «Peso muerto unilateral con mancuerna»).
- Hecho: la nota de IA sólo sale sobre la foto IA, no sobre el GIF real. C203 avisa del kettlebell mientras se ve la animación. Cada GIF lleva `?v=<sha256[:8]>` y una prueba exige que coincida con el archivo. Detalle en BUILD_LOG.
- Pendiente: comprobar C203 en Safari de iOS. En el simulador no se pudo escribir en el buscador por la carga de la máquina.
- Checks: 999 pruebas, tsc, lint, build, `git diff --check` PASS.

## 2026-10-05 — Animaciones del catálogo base ($0) — claude-code

- Publicada con el «sí» del dueño.
- Preview: https://codex-gifs-base.santiago-fitness-method.pages.dev (detrás de Access; Biblioteca → cualquier ejercicio base).
- Hecho: 46/57 ejercicios base con GIF libre (free-exercise-db, Unlicense) en la ficha de cliente y coach. C203 con kettlebell (aprobado). 11 unilaterales siguen con foto fija. $0, sin cuentas, sin marcas de agua. IDs, nombres, fotos e historial sin cambios. Detalle en BUILD_LOG y en `docs/ANIMACIONES-CATALOGO-BASE.md` (matriz, pendientes, costes).
- Decisiones del dueño: sí al Smith inclinado y a C203 con kettlebell; no al vídeo wger para C161. Queda abierto completar los 11 con vídeos de Santiago o con una API de pago (desde ~$5–10/mes).
- Riesgo: `/ejercicios/*` se sirve `immutable`. Si un GIF se regenera con el mismo nombre, hay que cambiarle el nombre o la versión.
- Checks: 992 pruebas, tsc, lint, build, `git diff --check`, `test:http` (108) PASS.

## 2026-10-05 — Login simple y sesión persistente (coach y cliente) — claude-code

- Publicada con el «sí» del dueño.
- Preview: https://codex-premium-v2.santiago-fitness-method.pages.dev (todo el preview va detrás de Access; `/entrar` se ve tras entrar). Producción en `3fc2297`.
- Diagnóstico:
  - Cliente: la cookie ya era persistente (Max-Age 30 días, renovable). Simulador iOS con la app instalada («Añadir a inicio», «Open as Web App») contra el runtime local: entrar, terminar el proceso de la app (`simctl terminate com.apple.webapp`) y reabrir desde el icono → sigue dentro. iOS copió la sesión de Safari al instalar. No se pudo probar «+2 días» (el simulador usa el reloj del Mac) ni contra staging (crear cuentas de prueba en un host remoto no está permitido a los agentes).
  - Coach: la causa es la de siempre: la app instalada abre en `/` y, sin cookie de cliente, iba a `/entrar`; y la sesión de Access caduca según su configuración. No probado en el simulador: requiere el código de Access del correo del dueño.
- Hecho: `/` y `/entrar` redirigen a `/admin/` a un coach con `CF_Authorization` válido y de `COACH_EMAILS` (`verificarCoachPorCookie`, misma verificación que `verificarCoach`); sesión del cliente de 90 días con renovación también en `/api/v2/contexto`; `/entrar` simplificado (Google primero, email plegado, «Soy el coach»). Detalle en BUILD_LOG y `docs/ACCESO.md`.
- Pendiente del dueño: decir la duración de sesión actual de la app de Access y subirla a 1 mes (pasos en `docs/ACCESO.md`); probar en su iPhone con la app instalada (coach y cliente).
- Checks: 987 pruebas, tsc, lint, build, `git diff --check`, `test:http` (108) PASS.

## 2026-10-05 — Gráficas: huecos de tiempo y RIR visible — claude-code

- Publicada con el «sí» del dueño, que aprobó también los dos umbrales de abajo.
- Preview revisado: https://codex-premium-v2.santiago-fitness-method.pages.dev (demo `/demo/cliente` → Progreso → Por ejercicio).
- Hecho: `huecosDeTiempo` (> 14 días) y `textoDeEsfuerzo`; tramo discontinuo con «3 sem» / «3 sem sin entrenar», fechas a los dos lados de la pausa, «RIR n» bajo los puntos de Peso, titular con la comparación de esfuerzo y `aria-label` con las pausas. Detalle en BUILD_LOG.
- Decisiones aprobadas por el dueño (el plan las fijaba en otro valor): RIR en todos los puntos desde 56 px de separación (no 40: los puntos nunca están a menos de 48 px, así que 40 no aplicaba nunca); etiqueta del hueco completa desde 104 px, «3 sem» desde 44 px y sólo la línea por debajo (no «omitir bajo 72 px»: en el teléfono el tramo mide 53–65 px y la etiqueta no se vería casi nunca).
- Checks: 973 pruebas, tsc, lint, build, `git diff --check`, `test:http` (101) PASS.
- Pendiente: teléfono físico.

## 2026-10-05 — Pulido UI fase 3 (hojas con apertura y cierre animados) — claude-code

- Publicada con el «sí» del dueño. Con esto termina el plan de pulido UI (fases 1–3). Fuera quedaron, por diseño, las transiciones entre pantallas y la entrada animada por ejercicio.
- Preview revisado: https://codex-premium-v2.santiago-fitness-method.pages.dev.
- Hecho: `usePresencia` (cierre único, respaldo, limpieza al desmontar, inmediato con movimiento reducido o sin animaciones); `HojaCapa` une las cuatro hojas del cliente; `<Hoja>` del coach usa el mismo controlador. Ambas abren en 220 ms (14 px) y cierran en 180 ms (`--mov-hoja-cierre`). Detalle en BUILD_LOG.
- Checks: 959 pruebas, tsc, lint, build, `git diff --check`, `test:http` (101) PASS.
- Pendiente: app instalada (áreas seguras) y teléfono físico.

## 2026-10-04 — Pulido UI fase 2 (microinteracciones) — claude-code

- Publicada con el «sí» del dueño. Turno libre: la fase 3 (hojas con apertura y cierre animados) queda para Codex, con su propio preview y visto bueno.
- Preview revisado: https://codex-premium-v2.santiago-fitness-method.pages.dev (demo `/demo/cliente`).
- Hecho: respuesta al tocar uniforme en el cliente (`--mov-toque`; sin campos, deshabilitados ni puntos de la gráfica; nada con movimiento reducido); guardar serie con «Guardando…» (`aria-busy`), «Reintentar» tras un fallo y valores conservados; medidor de sesión y barra de volumen con `scaleX`; contadores con cifras de ancho fijo. Detalle en BUILD_LOG.
- Checks: 946 pruebas, tsc, lint, build, `git diff --check`, `test:http` (101) PASS. QA con CPU ×4.
- Pendiente: app instalada (áreas seguras) y teléfono físico; forzar un fallo de guardado en el navegador (cubierto por pruebas unitarias).

## 2026-10-04 — Pulido UI fase 1 (consistencia visual) — claude-code

- Publicada con el «sí» del dueño (2026-10-04). La fase 2 no empieza sin su nueva aprobación.
- Preview: https://codex-premium-v2.santiago-fitness-method.pages.dev (despliegue `1b464d92`; demo `/demo/cliente`, `/demo/coach/biblioteca`). Producción intacta en `b638b6c`.
- Hecho: escala de espacios y radios en tokens (`--esp-1…6`, `--radio`, `--radio-chico`); ningún texto del cliente por debajo de 12 px; subtítulos de grupo de la Biblioteca fijos bajo el buscador; miniaturas con fondo neutro al cargar; «Comenzar entrenamiento» destacado; ficha con jerarquía por la escala; Progreso con gráfica y sesiones en tarjetas de 16 px (sólo cliente); Perfil con desplegable de 44 px. Detalle en BUILD_LOG.
- Checks: 944 pruebas, tsc, lint, build, `git diff --check` y `test:http` (101) PASS. Para `test:http` se restauró, con el permiso del dueño, la ficha «Abdominal Crunch» que él había archivado a mano en el runtime local.
- Pendiente: comprobar áreas seguras con la app instalada (Añadir a inicio) y en un teléfono físico.

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

## 2026-09-28 — Respuesta enviada a Santiago sobre ampliar la biblioteca — claude-code (tarea de solo texto, sin turno)

- Santiago respondió al correo de bienvenida (27-sep, 20:24): «¿cómo puedo ampliar esa biblioteca de ejercicios?». El dueño aprobó el borrador en el chat y se envió como respuesta en el mismo hilo «Tu app Santiago Fitness Method ya está lista».
- Contenido: agradece; avisa de que se prepara un botón «Añadir ejercicio» en su panel (crear ejercicios, elegirlos de su catálogo y subir la foto de la máquina desde el teléfono) sin dar fecha; y le pide (1) la lista de ejercicios que quiere en la app y (2) una foto de cada máquina, de frente y con buena luz, respondiendo al mismo correo.
- Estado de la función al enviar: fases 1 (servidor y datos) y 2 (panel del coach) commiteadas; fase 3 (sincronización del cliente) en curso con cambios sin commit del turno activo de claude-code. Migración 0012 sin aplicar en staging ni producción; subida de foto sin probar en simulador iOS. Nada publicado, así que Santiago aún no puede usarla.
- No se reclamó turno, no se hizo commit ni push, y `docs/cliente` no se tocó. Solo se editó esta nota.
- **Pendiente:** cuando la función esté publicada, redactar un segundo correo con los pasos «Biblioteca → Añadir ejercicio» (borrador al dueño, se envía solo con su visto bueno). Cuando Santiago mande su lista y fotos, cargarlas con la nueva función o, si no está lista, tratarlas como respaldo de la tarea de fotos para Codex.

## 2026-09-28 — Revisión 2 de fotos con referencias reales — codex

- El dueño rechazó la primera tanda por ejecución poco realista. Se recrearon las 12 imágenes IA usando fotografías/fotogramas reales como entradas visuales de image_gen, no solo descripciones de texto. Referencias enlazadas y revisión individual en public/ejercicios/PROCEDENCIA.md y procedencia.json; originales externos no distribuidos.
- Se compararon postura, unilateralidad, apoyos, agarres y geometría del equipo. Se descartó un pushdown que juntaba ambas manos y se regeneró con la mano libre en cadera. Las imágenes siguen marcadas IA; esta revisión no equivale a aprobación técnica del coach.
- C026 representa press inclinado con stack; C102 usa stack. Perfiles estimados de semilla ajustados, sin migrar calibraciones guardadas. C059 representa la variante sentada de lado y su explicación coincide. Nombres genéricos y 57 identidades intactos; C071/C256 no cambiaron.
- Verificación: 799/799 tests, 87 archivos; lint y build PASS. JPG 850×567, 52.836–86.487 bytes. Las 14 imágenes publicadas en dist coinciden byte por byte con public. Comparación visual individual y mosaico de las 12 finales; no se repitió QA de navegación de biblioteca. Avisos conocidos de Node/JSDOM en pruebas.
- Solo publicación Git; sin despliegue a producción. Siguiente: ninguno dentro del alcance solicitado.

## Cierre de fotos unilaterales — codex, 2026-09-28

- Turno reclamado limpio en `main` (`00ab311`). Dueño confirma que las 12 respuestas B son «Mantener genérico»; no se editaron PDFs ni respuestas de Santiago.
- Biblioteca de 46 a 57 fichas: diez faltantes de foto y C071 (foto de dominio público disponible). Nuevas entradas en `unilaterales.ts` y `shared/ejercicios-base.ts`, 24 filas activas en manifest; fundación histórica de 123 identidades intacta.
- 14 fotos 850×567 <100 KB: 12 generadas con `image_gen`, dos reales Unlicense (C071/C256); tres reemplazos C194/C203/C161 corrigen pierna, mancuerna y agarre. Fuente/condiciones, prompts y revisión en `public/ejercicios/PROCEDENCIA.md` + `procedencia.json`. Aviso IA visible en ficha. Equipo/cargas representativos y estimados documentados; nombres genéricos.
- Verificación: 799/799 tests (87 archivos), lint y build PASS; QA de 14 fichas en Chrome local a 390×844 y 1280×900, imágenes cargadas y etiquetas IA correctas, sin errores de consola. Node/JSDOM emiten avisos durante tests. Prueba sin equivalentes adaptada porque C102 ahora ofrece alternativa a landmine.
- Siguiente: ninguno dentro de esta tarea; queda desplegar cuando el dueño lo solicite. No se desplegó a producción ni se modificaron datos de clientes.

## Diagnóstico SSO de clientes en producción — codex, 2026-09-26/27 (en curso)

- Turno reclamado en `main` con `npm run handoff:sync` y `handoff:claim` (`3950180`). El dueño reportó que Google SSO no le funcionó; se pidió aclarar si fue desde `/entrar`, una invitación o Perfil y el mensaje exacto. No se han modificado cuentas, invitaciones ni secretos.
- Producción actual: `/entrar` responde 200 con `Continuar con Google`; `/auth/google?origen=entrar` responde 302 a Google con el retorno canónico y cookie de estado; un retorno sin estado válido responde 401 como corresponde. Los tres secretos Google aparecen cifrados en Pages, sin ver sus valores.
- Prueba real en Chrome con la identidad Google del dueño desde `/entrar`: retorno a `No pudimos entrar con Google`. La consulta de solo lectura a D1 producción mostró **1 cuenta, 0 `google_sub` vinculados y 0 invitaciones vigentes**. Por diseño, `/entrar` con Google acepta solo un `google_sub` ya vinculado. Una pestaña nueva de `/perfil` con sesión de cliente válida muestra `Conectar Google con esta cuenta`; ésa es la ruta prevista para enlazar una cuenta creada con contraseña. Las identidades Google conocidas del navegador no coinciden con el email de esa única cuenta; no se intentó vincular una identidad distinta.
- Google Auth Platform permanece External/Testing con cero usuarios de prueba. La consola muestra una advertencia general, pero la [documentación oficial de Google](https://support.google.com/cloud/answer/15549945?hl=en) exceptúa explícitamente a apps que solo solicitan `openid email profile`: pueden autorizar cualquier usuario sin estar en la lista. El flujo real llegó al callback de la app, así que Testing no causó este rechazo. La primera hipótesis de bloqueo por Testing fue rectificada al consultar la documentación.
- Prueba positiva vigente: en el preview `codex-google-fase2`, la cuenta Google previamente vinculada retornó correctamente a la sesión de `Lucía · QA aislado` y mostró su programa. Eso confirma que el intercambio OAuth y la sesión siguen operativos en el código desplegado allí; producción carece de cualquier vínculo Google para repetir la prueba positiva sin tocar una cuenta real.
- La única cuenta de producción tiene contraseña y aún no está vinculada. La ruta de Perfil requiere que el correo Google verificado coincida con el correo guardado en esa cuenta; las identidades Google probadas/visibles en Chrome no coinciden. No se modificó este control de seguridad. `npm test` 784/784 (84 archivos), `npm run lint` y `npm run build` pasaron; solo cambian este handoff y el build log.
- Pendiente: respuesta del dueño sobre el paso exacto y correo Google que intentó usar; si es la cuenta existente, entrar con contraseña y usar Perfil > Conectar Google con el **mismo correo**. Si es nuevo cliente, crear invitación desde Coach y seguirla con Google. Verificar un retorno positivo en producción solo con una cuenta expresamente elegida para esa vinculación; evitar cuentas sintéticas en producción. Si el correo de la cuenta y el Google que desea usar son distintos, pedir decisión explícita antes de permitir vincular identidades distintas o cambiar la cuenta.

## Cuentas y suscripción — plan del dueño, 2026-09-26

- Modelo aprobado: el coach invita; el cliente crea cuenta con email y contraseña o Google; Stripe cobra automáticamente. No hay registro público.
- Al vencer, habrá 7 días de gracia y luego acceso de solo lectura. El coach podrá marcar clientes exentos; los exentos nunca se bloquean.
- Supuestos reversibles: precios creados en Stripe y asignados por el coach; una sola cuenta de coach; sin impuestos ni cupones en esta versión. Stripe y Google se configuran con secretos de Pages, nunca en Git.
- Secuencia: 1) cuentas y sesiones renovables; 2) Google OAuth; 3) Stripe en modo prueba; 4) solo lectura del cliente; 5) panel de suscripciones. Cada fase requiere pruebas propias antes de producción. El modo real de Stripe necesita aprobación explícita del dueño.
- La fase 1 añade `0010_cuentas.sql`. La migración es aditiva y se respalda y ensaya antes de aplicarla. Los clientes actuales crearán cuenta con una invitación nueva; las cuentas archivadas se revocan.
- **Fase 1, codex:** implementadas alta por invitación, acceso con email/contraseña, recuperación desde el coach, sesiones de 30 días renovables, límite de cinco fallos en 15 minutos y revocación al archivar. Revisión de seguridad del cambio: origen de formularios, uso único y hash de tokens, sal y PBKDF2, y separación Coach/Cliente revisados sin hallazgos pendientes.
- **Verificación:** 744 pruebas en 77 archivos, lint, build y 49 comprobaciones HTTP locales ejecutadas dos veces; formulario de acceso inspeccionado en Chromium. La segunda ejecución detectó que el límite global por IP bloqueaba otros emails; se corrigió a límite por email y ambas repeticiones pasaron. `0010` ensayada y aplicada en staging y producción con respaldo previo, restauración local, integridad y conservación de las cuatro tablas originales.
- **Límite de QA:** el preview `codex-cuentas-fase1` (commit `e0d8e17`) redirige todas las rutas a Cloudflare Access; sin una sesión autorizada no se pudo probar visualmente el flujo remoto. No se introdujeron credenciales reales ni se tocaron los PDFs de `docs/cliente`.
- **Siguiente:** fase 2, Google OAuth con PKCE y validación del `id_token` en preview. Antes, validar la cuenta de un cliente invitado en el dominio canónico con el coach y revisar que Access no cubra por accidente las rutas públicas del preview.

### Fase 2 — Google OAuth activo; QA de cliente completada en staging

#### Configuración externa de Google, 2026-09-26 — turno codex en curso

- El dueño pidió que toda acción y resultado quede en este handoff y en `docs/BUILD_LOG.md` para que Claude Code pueda continuar. Esta sección es un checkpoint, no una declaración de fase terminada.
- Se creó en la cuenta Google `yayo1716@gmail.com` el proyecto Cloud `Santiago Fitness Method`, ID `santiago-fitness-method`. El dueño aceptó personalmente la Política de Datos de Usuario de Google. Pantalla OAuth: nombre `Santiago Fitness Method`, audiencia External en Testing, correo de soporte y contacto técnico `yayo1716@gmail.com` (soporte provisional; confirmar si se conservará para clientes).
- Se creó el cliente OAuth Web `Santiago Fitness Method web`, ID `1017512201105-6jv25bti46naj9lrfftk6rgkc62ughqs.apps.googleusercontent.com`, con retornos exactos `https://santiago-fitness-method.pages.dev/auth/google/retorno` y `https://codex-google-fase2.santiago-fitness-method.pages.dev/auth/google/retorno`. No requiere origen JavaScript: el flujo usa código en servidor y PKCE. El secreto nunca se imprimió ni guardó en Git; solo se copió directamente a Cloudflare Pages.
- En Cloudflare Pages, entorno **preview**, se añadieron como secretos cifrados `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` mediante Wrangler. Producción sigue sin esos secretos y con `GOOGLE_HABILITADO` ausente; el acceso Google continúa apagado allí.
- Se ejecutaron `npm test` (749/749, 78 archivos), `npm run lint` y `npm run build`, todos PASS. Se volvió a publicar preview `codex-google-fase2` desde el commit `5068a68f7211e298a8a8f69e35ce3b9296ec5036`; despliegue `https://34751049.santiago-fitness-method.pages.dev`, alias `https://codex-google-fase2.santiago-fitness-method.pages.dev`.
- QA real en Chrome: Cloudflare Access aceptó el OTP del dueño; `/entrar` del preview mostró `Continuar con Google`; Google mostró la app y solicitó solo nombre, foto y email; al elegir `yayo1716@gmail.com` se retornó a la app con `No pudimos entrar con Google`, resultado compatible con que esa identidad no tiene cuenta de cliente vinculada. Ese mensaje es genérico, por lo que todavía falta una prueba con invitación sintética para confirmar el intercambio y alta de punta a punta.
- **Siguiente:** comprobar si el cliente sintético de staging puede invitarse (en la ficha de `Lucía · QA aislado`, `Preparar invitación` aparecía deshabilitado porque `tieneCuenta` aún era `null`); usar una invitación sintética válida y probar alta Google, sesión, cierre y nuevo acceso. Revisar que el callback de preview conserve el estado OAuth bajo Cloudflare Access. Después, añadir secretos a producción, desplegar y habilitar `GOOGLE_HABILITADO=true` solo tras la prueba completa. No iniciar Stripe hasta cerrar esta fase.

#### Cierre de QA y activación, 2026-09-26 — codex

- El botón `Preparar invitación` de Lucía estuvo deshabilitado solo durante la carga inicial; al terminar la consulta de estado quedó habilitado. Se generó una invitación nueva desde la ficha del Coach en **staging**. No se guardó ni publicó el token en Git.
- El alta real por Google desde esa invitación pasó: Chrome regresó al preview con sesión de `Lucía · QA aislado` y programa disponible. Después se cerró la sesión, se volvió a entrar con la misma identidad Google y la sesión sobrevivió una recarga. La consulta de solo lectura a D1 staging confirmó `google_sub` presente, cuenta sin contraseña, invitación consumida y una sesión activa. No se creó ningún cliente o cuenta sintética en producción.
- Producción: se añadieron `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_HABILITADO=true` como secretos cifrados de Cloudflare Pages. Se desplegó `main` desde `80e7cef1c96048fe2f2879929cae6cac6d960303` a `https://a65275a4.santiago-fitness-method.pages.dev`. En el dominio canónico, `/entrar` muestra el botón, `/auth/google?origen=entrar` da 302 a `accounts.google.com`, y `/auth/google/retorno` con estado falso da 401. Una entrada real con la cuenta Google del dueño regresó al mensaje de cuenta no vinculada, esperado: D1 producción confirma cero cuentas para ese email. El callback positivo se verificó en staging, no contra una cuenta real de producción.
- Google Auth Platform permanece `External / Testing`. El código solicita solo `openid email profile`; [Google documenta una excepción para los alcances básicos de identidad](https://support.google.com/cloud/answer/15549945?hl=en), de modo que Testing no exige listar a cada usuario para este caso. No se publicaron Branding ni política de privacidad, y el correo visible de soporte sigue `yayo1716@gmail.com` de forma provisional. Antes de presentar el login a clientes comerciales conviene confirmar ese correo y completar la identidad pública de la app.
- Hallazgo menor de UI: la página de perfil en staging muestra `Conectar Google con esta cuenta` incluso después de que la cuenta fue creada con Google. El enlace es redundante y la operación de vincular la misma identidad es idempotente; corregir el texto/visibilidad en un cambio enfocado antes del primer cliente comercial. No impide el alta ni el reingreso.
- **Siguiente para Claude Code:** comprobar el estado publicado y el build log; no repetir el alta sintética ni crear cuentas en producción. Continuar con el siguiente bloque autorizado del plan (Stripe en modo prueba) una vez confirmado el correo público de soporte si es necesario. Mantener `docs/cliente` intacto.

- OAuth Google implementado con código, PKCE S256, state y nonce de 10 minutos, intercambio en servidor y validación del ID token firmado mediante JWKS. Solo crea cuenta desde invitación; entrar requiere `google_sub` ya vinculado. Para vincular una cuenta con contraseña se exige primero su sesión válida, porque su email aún no se verifica por correo.
- Revisión de seguridad detectó que las sesiones antiguas de preview sin invitación podrían volverse válidas al crearse una cuenta. Corregido: tanto las sesiones nuevas con contraseña como las de Google conservan la invitación consumida, y toda validación exige esa referencia. Hay prueba de regresión.
- Estado anterior a la activación: `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` no figuraban entre los secretos de Pages (consulta de 2026-09-26). Véase el cierre de QA y activación arriba para el estado vigente.
- Preview del código: `codex-google-fase2`, commit `e156d43`. Cloudflare Access protege todos los previews; para probar Google allí se necesita sesión autorizada y registrar en Google Cloud la URI exacta del alias `/auth/google/retorno` además de la URI canónica.
- Verificación local: 749 pruebas/78 archivos, lint, build, 52 comprobaciones HTTP; Google usa JWKS local firmado para probar audiencia, email verificado, state/nonce, alta, entrada y vinculación. La prueba real con Google queda pendiente hasta configurar el proveedor y acceder al preview.
- **Corrección de rutas en producción (codex, 2026-09-26):** el primer despliegue de fase 2 devolvía el shell estático en `/auth/google` y `/auth/google/retorno`. Se añadieron los archivos de ruta de Pages que reutilizan el middleware. El despliegue `a69ac1d` se verificó en el dominio canónico: ambas rutas responden 401 con Google apagado; antes respondían 200. La suite HTTP ahora comprueba las dos rutas (53/53); 749 pruebas, lint y build pasan. No se activó Google.


Este archivo es el registro compartido entre Codex y Claude Code. GitHub es la fuente
de verdad del código y este archivo es la fuente de verdad del turno actual. La
colaboración automática es deliberadamente serializada: un agente reclama el turno,
trabaja y lo publica antes de que el otro continúe.

## Estado actual

- **Owner:** claude-code
- **Status:** active
- **Rama coordinada:** `main`
- **Repositorio:** https://github.com/dayanivan681/santiago-fitness-method
- **Última sincronización:** 2026-10-21T19:21:52.412Z

**Liberación del turno (claude-code, 2026-10-20):** codex reclamó «Investigar
destello residual B7 y completar QA pendiente en simulador» (`2f2358f`) y agotó
créditos sin commits, ramas ni cambios en `origin`. El dueño pidió retomarlo. Se
libera a mano por la misma razón que abajo.

**Liberación del turno (claude-code, 2026-09-26):** codex lo reclamó el 2026-09-17
para validar la ayuda real en Safari/PWA (`f6ad0d3`) y en nueve días no hubo ni
commits ni cambios sin commitear. El dueño pidió retomarlo. No había trabajo que
rescatar: se libera a mano porque `handoff:claim` y `adopt` se niegan mientras
haya dueño.

## Flecha ↗ como emoji en iOS — corregida 2026-09-16

- Safari de iPhone pintaba `↗` como emoji azul en «Ver ejercicio ↗» y «Ya tengo
  acceso ↗»: un cuadrado de color en una paleta de negro, blanco y rojo. Chromium
  la pinta como glifo de texto, así que ninguna prueba ni QA anterior lo vio.
- Arreglo: selector de variación `U+FE0E` en las 6 apariciones, y espacio
  irrompible para que la flecha no se separe de su texto. En la presentación va
  envuelta en `<span aria-hidden="true">`, de modo que el nombre accesible pasa a
  ser «Explorar Coach» y VoiceOver deja de leer «flecha noreste».
- En `CuerpoEjercicio` la flecha va como texto, NO envuelta: la regla
  `.sfm-workout-image span` es de descendiente y posicionaba en absoluto
  cualquier span interno, despegando la flecha de la píldora. El nombre accesible
  ahí ya lo da el `aria-label` del botón.
- Nueva prueba `src/pruebas/glifos.test.ts`: ningún símbolo de la lista de
  conflictivos puede quedar sin el selector de texto. Se comprobó que sabe fallar.
- Verificado en Safari real (simulador iOS 27): flecha de texto, en línea, en la
  presentación y en el entrenamiento. 734 pruebas/74 archivos, tsc, lint, build.

**Trampa que costó tres capturas falsas:** `scripts/servir-qa-v2.mjs:34` copia
`dist` a `.qa-local/runtime/dist` **una sola vez al arrancar**, y nunca limpia:
había once versiones del mismo chunk acumuladas. Tras reconstruir hay que
reiniciar `qa:servir`, o el navegador y el simulador siguen sirviendo el build
anterior y parece que el arreglo no funciona.

## Ayuda contextual para cuentas reales — completada por claude-code 2026-09-16

Continuación del checkpoint de codex (sección siguiente), adoptado en `703ed19`.

- **Lo que ya estaba hecho** y la nota de codex daba por pendiente: `ProveedorAyudaReal`
  sí estaba conectado, con key por entorno/rol/identidad, en Coach (`App.tsx`) y en
  Cliente (`Cliente.tsx`); `GuiaAyuda` generalizada con textos reales; botón Ayuda en
  ambas cabeceras; consejos en alta y Cliente.
- **Lo que faltaba y se ha hecho:** la QA que codex dejó enumerada.
  - Un test fallaba (`RecorridosDemo`): el alta real dejó de tener redacción propia
    —codex la unificó con la de la demo, según su nota— y el test garantizaba lo
    contrario. Se actualizó a la intención nueva conservando lo que sigue valiendo:
    sin proveedor de ayuda no se cuela ningún consejo ni bienvenida.
  - Nuevo `src/AyudaReal.test.tsx` (8 pruebas): persistencia entre montajes,
    aislamiento entre cuentas del mismo dispositivo, preferencias corruptas,
    almacenamiento bloqueado, historial previo, espera antes de decidir, frontera de
    Vista previa/Entrenar juntos y demo sin escrituras.
- **Verificado en el runtime local con cuentas sintéticas:** Coach real con botón
  Ayuda, hoja de 6 temas, texto de invitación real y sin aviso de datos ficticios;
  clave `sfm-ayuda:v1:local:coach:…` por identidad; Vista previa sin consejos de
  Cliente; y lo esencial: tras registrar una serie y recargar, la bienvenida y el
  consejo de primera vez dejan de aparecer y el botón Ayuda permanece.
- 733 pruebas/73 archivos, `tsc -b`, lint y build PASS. 35 comprobaciones HTTP PASS.
- **Nota de método:** la primera ejecución de `test:http` dio 401 «Coach firmado».
  No era regresión: el JWT local del fixture dura 24 h y había caducado. Repreparar
  y reiniciar el runtime lo resolvió. Conviene recordarlo antes de culpar al código.
- **No verificado:** Safari real de iPhone y PWA instalada **para esta función**
  (la validación de Xcode del 2026-09-16 es anterior a estos cambios); VoiceOver;
  offline. Puntos 3–4 siguen aplazados por el dueño.

## Checkpoint original de codex: ayuda contextual — 2026-09-16

El dueño pidió trabajar el punto 2 y dejar handoff para que Claude pueda retomar
si Codex agota créditos.

**Liberación del turno (claude-code, 2026-09-16):** codex agotó créditos con el
turno aún en `active`, y `handoff:adopt` se niega mientras haya dueño. Siguiendo
su propia indicación de retomar con el protocolo de adopción, se liberó el turno
a mano para poder adoptar. Ningún cambio suyo se descartó. Puntos 3–4 siguen aplazados. Esta sección es un checkpoint,
no una declaración de implementación terminada ni de QA aprobado.

- Turno reclamado por codex, commit `ec5f2ce`. Se parte del QA Xcode publicado
  en `ce3e703`. Revisar `git status` y el diff antes de adoptar trabajo sin commit.
- Objetivo: bienvenida breve y ayuda contextual opcional para Coach y Cliente
  autenticados, sin bloqueos de navegación ni cambios de datos. Recordar consejos
  cerrados por identidad/rol/entorno en este dispositivo. Demo sólo en memoria.
- Cambios en curso: renombrados `AyudaDemo.tsx` → `Ayuda.tsx` y
  `ayuda-demo-contexto.ts` → `ayuda-contexto.ts`; imports/hooks compartidos
  actualizados. `ProveedorAyudaReal` añadido pero todavía NO conectado a las rutas.
  Lee preferencias locales tolerando JSON inválido/almacenamiento bloqueado,
  consulta actividad previa para no insistir con consejos de primera serie,
  y registra completado sólo desde callbacks de guardado correcto.
- Falta: conectar proveedor autenticado con key por cuenta/entorno/rol, generalizar
  `GuiaDemo` para rutas y textos reales (invitación real, sin aviso de datos ficticios),
  botón Ayuda en cabeceras reales, consejos en alta/Cliente y textos simples del alta.
  Preservar aislamiento de Vista previa y Entrenar juntos.
- Falta QA: tests de persistencia/remontaje/aislamiento entre cuentas, almacenamiento
  inválido/bloqueado, historial existente, guardado fallido, demo sin escrituras;
  regresiones de acceso, `npm test`, lint/build y navegador móvil/escritorio con
  cuentas sintéticas locales. Browser plugin ausente: usar Playwright instalado.
- Todavía no se han ejecutado pruebas sobre estos cambios parciales. No publicar
  como complete hasta terminar e inspeccionar el resultado servido.
- Para retomar, revisar este checkpoint y todo el diff; usar el protocolo de
  adopción del repositorio con agente claude-code cuando corresponda. No descartar
  cambios ni modificar `docs/cliente`. No tocar cuentas/datos reales para QA.

## Validación Safari/PWA con Xcode — 2026-09-16

- Xcode 27.0, simulador QA iPhone 16 Pro / iOS 27.0. Demo canónica validada
  mediante Safari y PWA instalada desde la hoja Compartir.
- PASS: bienvenida, ayuda opcional, cierre de opciones con scroll, teclado decimal,
  guardado y precarga de siguiente serie, descanso automático, +30s/Omitir,
  Home/regreso sin reinicio del contador, instalación y apertura standalone,
  corrección de reps sin nuevo descanso, navegación Hoy/Biblioteca/Progreso.
- Sin cambios de producto ni datos reales. 725 pruebas/72 archivos, lint/build PASS.
- Informe y límites: `docs/QA-XCODE-2026-09-16.md`. No valida hardware físico,
  VoiceOver, offline ni el flujo autenticado. No se repitió Coach → peso sugerido.
- Puntos 2–4 aplazados por el dueño: ayuda para cuentas reales, equivalencias del
  catálogo y acceso/piloto de Santiago.

## Peso sugerido del Coach y cierre de opciones — 2026-09-15

- Código `e13a9af`, preview `954dde22`; QA remoto del alias público PASS.
- Campo opcional `pesoSugeridoLb` en Slot y Prescripción del Coach, con unidades
  de registro del ejercicio (lb por lado cuando corresponde), 0–3000 lb y
  decimales. Vacío mantiene el comportamiento anterior; cero es válido.
- Cliente precarga el peso del Coach antes del historial, sin sobrescribir
  valores guardados, borradores o ajustes del Cliente. La siguiente serie toma
  lo usado hoy. Las reps históricas iniciales se acotan al rango del plan;
  los registros reales permanecen intactos. Se identifica el peso del Coach y
  no se muestra otra sugerencia de carga calculada en conflicto.
- Peso conservado en plan y prescripción histórica; probado con SQL local.
  No requiere migración. Sustituciones temporales o permanentes no heredan
  el peso de otra variante. Los PDFs permanecen intactos.
- Más opciones se despliega dentro del contenido, con Cerrar opciones, Escape
  y toque exterior. Botón/Escape devuelve foco al resumen. Cerrar conserva la
  nota, técnica y calentamiento; no hay eliminación de datos ni guardado implícito.
- 719 pruebas/71 archivos, lint/build PASS. Cobertura de prioridad de datos,
  borradores, unidades, cero/ausencia/inválidos, contrato y SQL, variantes y cierre.
  Dos aserciones existentes ahora esperan la actualización asíncrona del reloj
  y del contador de series antes de evaluar sus valores; mismo resultado esperado.
- Playwright/Chrome a 320/390/1024 y preview remoto a 390 PASS. Coach publica
  42.5 lb por lado y 8–12 reps; Cliente recibe 42.5/8, ajusta a 45 y lo conserva
  en la siguiente serie. Nota, cierre, Escape/exterior, geometría y descanso PASS.
  Sin errores de consola ni peticiones privadas de demo. Evidencias
  `/tmp/sfm-weight-*.log` y `/tmp/sfm-weight-*.png`.
  Sin iPhone físico ni lector de pantalla real; Browser plugin no disponible.
- La publicación dispara el deployment canónico; verificar el artefacto servido.

## Descanso automático por serie — 2026-09-13

- Decisión explícita del dueño: sustituir el inicio manual por descanso automático
  después de guardar cada serie nueva, con la duración del Coach. Los PDFs quedan
  intactos. Aplica a entrenamiento real, demo y simulación de Vista previa.
- Código `1b46fa1`, preview `25a90b90` verificado en el alias público.
- Incluye series de calentamiento; cero segundos no abre el temporizador.
  Un guardado pendiente/fallido no lo inicia. Correcciones no lo reinician;
  otra serie nueva sustituye el contador. Omitir lo cierra y +30s añade tiempo.
  Terminar sesión cierra el descanso sólo tras confirmar el cierre.
- Ayuda del Cliente actualizada. Sin APIs nuevas, migraciones ni cambios de
  almacenamiento. Se conserva el cálculo histórico de descanso entre series.
- 710 pruebas/70 archivos, lint y build PASS. Regresiones de duración del Coach,
  cero, error/pending/doble toque, corrección, siguiente serie y cierre PASS.
- Playwright/Chrome sobre build local a 320/390/1024 y preview remoto a 390 PASS:
  inicio, prórroga, corrección, nueva serie, omitir y terminar; cronómetro único,
  controles >=44px, Editar accesible, sin desbordes ni errores/peticiones privadas.
  Evidencias `/tmp/sfm-auto-rest-*.log` y `/tmp/sfm-auto-rest-*.png`.
  Sin iPhone físico ni lector de pantalla real. Browser plugin no disponible.
- Publicación del turno dispara deployment canónico; verificar commit servido.

## Onboarding contextual de demo — 2026-09-13

- Código `f996e07`, preview `b1272113`, alias público `codex-premium-v2`.
- Una bienvenida por rol. Coach abre directamente Datos, Días y Plan; se
  mantienen validación, borradores, advertencias y revisión antes de publicar.
  Cliente recibe ayuda en Hoy y al registrar su primera serie; el guardado
  confirmado cierra la tarea sin exigir visitas a otras secciones.
- Retirados los cuatro capítulos, 48 pasos y bloqueos de scroll, teclado,
  navegación y foco. Consejos dentro del contenido, descartables en memoria;
  Ayuda opcional por rol. No hay prácticas automáticas ni creación de escenarios
  al consultar ayuda. La persona creada se conserva al cambiar de rol.
- Invitación etiquetada como simulación antes de pulsar. Vista previa no
  registra actividad ni completa la primera tarea del Cliente. Cuentas reales
  conservan su presentación; sin APIs nuevas, migraciones ni cambios a PDFs.
- 707 pruebas/70 archivos, lint y build PASS. Regresiones de guardado fallido,
  publicación revisada, borrador recuperable, cierre de ayuda, cambio de rol,
  reinicio de demo y ausencia de persistencia/red privada PASS.
- Playwright/Chrome: recorridos completos a 320/390/1024 y preview remoto a 320
  PASS; tabulación, scroll libre, área reducida a 400 px para teclado, capturas,
  ausencia de desbordamiento/overlay/errores de consola/peticiones privadas.
  Evidencias `/tmp/sfm-context-*.log` y `/tmp/sfm-context-*.png`.
  Browser plugin no disponible; sin iPhone físico ni lector de pantalla real.
- La publicación del turno dispara el deployment canónico; comprobar el commit
  servido y la primera entrada antes de anunciar el cierre.

## Guías sin scroll manual — 2026-09-13

- Código `e51d7a5`, preview `cf9110d4`, QA remoto PASS.
- Durante el recorrido se bloquean scroll manual, navegación fuera del foco
  y tabulación hacia controles ajenos. Pausar/salir/desmontar libera el bloqueo.
  La guía desplaza automáticamente el control necesario; permite editar texto.
- Alta guiada campo a campo con Listo, continuar: nombre, objetivo, frecuencia,
  limitaciones y notas. Los campos opcionales admiten continuar vacíos. Revisión
  del plan por sesión/ejercicio mediante controles propios, sin arrastrar.
- 706 pruebas/70 archivos, lint y build PASS. Regresión añadida para bloqueo,
  teclado de edición, pausa y limpieza al desmontar. Recorridos completos de
  ambos roles y preview en 320/375/390/430/768/1024 PASS. QA remoto a 320 PASS;
  rueda, gesto táctil, PageDown, bloqueo de exploración, avance y retorno PASS.
- QA adicional de teclado numérico, pausa, doble toque, regreso y recarga PASS.
  Evidencias `/tmp/sfm-lock-*.log` y capturas `/tmp/sfm-tour-*.png`.
  Navegador emulado, sin iPhone físico. Sin API, cloud ni migraciones; PDFs intactos.

## Corrección de scroll de las guías — 2026-09-12

- Código `e260204`, preview `a2690ff6`. La interpolación de posición del foco
  provocaba hasta 83 px de desfase al hacer scroll durante el alta. Eliminada:
  la geometría sigue al control sin transición; se conserva el halo de entrada.
- No dibujar contornos colapsados/etiquetas cuando el control sale del área
  visible. El scroll manual detiene los pulsos. Pequeños cambios de altura
  (barra del navegador/tarjeta) ya no recentran el formulario; teclado y cambios
  de ancho siguen teniendo recuperación de visibilidad.
- 705 pruebas/70 archivos, lint y build PASS. Recorridos completos Coach,
  gestión, preview y Cliente a 320/375/390/430/768/1024 PASS. Prueba específica
  de scroll mide 0 px de desfase en todas las muestras; sin foco fantasma ni
  recentrado al simular la barra del navegador. Teclado/doble toque/pausa PASS.
- Preview remoto: recorrido completo y prueba de scroll PASS. Evidencias
  `/tmp/sfm-scroll-*.log` y `/tmp/sfm-scroll-390-after.png`. QA con navegador
  emulado, sin iPhone físico. Sin API, cloud, migraciones ni cambios a PDFs.

## Resaltado premium de acciones — 2026-09-10

- Código `f12e66c`; preview `3fc8a477` en `codex-premium-v2`, verificado remoto.
- Botón real blanco, contorno rojo, dos pulsaciones al entrar y un recordatorio
  limitado; etiqueta con flecha dentro de los límites de pantalla. Se detiene al
  interactuar y respeta movimiento reducido. Sin capas que capturen el toque.
- El foco sigue nombre/objetivo → Continuar, frecuencia → Continuar, revisión →
  Publicar, edición → Guardar/Listo, ficha correcta, cierre de descanso/resumen
  y corrección de serie. Recoloca el campo al abrir el teclado; limpia estilos
  y referencias al pausar o salir. Sin cambios en APIs, cloud ni datos reales.
- 705 pruebas/70 archivos PASS, lint y build PASS. Recorridos completos en
  320/375/390/430/768/1024; preview remoto completo y pruebas específicas PASS.
  Comprobados errores de formulario, doble toque, teclado, pausa/regreso,
  movimiento reducido, geometría del foco y ausencia de peticiones privadas.
- QA con Playwright/Chrome emulado (Browser plugin no disponible); sin iPhone
  físico. Evidencias `/tmp/sfm-highlight-*.log`, capturas `/tmp/sfm-tour-*.png`,
  `/tmp/sfm-highlight-pulse.png` y vídeo `/tmp/sfm-highlight-motion/`.
- Una ejecución de tests concurrente con cuatro navegadores mostró una aserción
  temporal 3/4 vs 4/4 en un test existente; repetición completa aislada PASS.
- Publicación canónica por handoff; comprobar deployment resultante antes del
  cierre. PDFs intactos; ninguna migración.

## Guías interactivas de demo — 2026-09-10

- Código `b520e04`, preview `fa49c081` en el alias público `codex-premium-v2`.
  Continúa la bienvenida del Coach con creación, gestión de perfil/plan,
  borrador/publicación y vista previa. Primera entrada del Cliente con práctica
  de una serie, corrección, descanso, cierre, historial, Biblioteca y perfil.
- Misma persona ficticia entre los dos roles. La vista previa verifica que su
  simulación no cambia el historial. Repetir prepara otro escenario en memoria.
  La guía avanza por acciones confirmadas; fallos de guardado no avanzan el paso.
- Foco recortado, transición de 250 ms, tarjeta translúcida, progreso y check
  sobrios. Teclado, movimiento reducido, controles de 48 px, pausa y retorno a
  puntos válidos. Las hojas usan opacidad durante el tour para no desplazar el
  panel fijo con su animación de entrada.
- 705 pruebas/70 archivos, lint y build PASS. Recorridos completos en navegador
  a 320/375/390/430/768/1024 px; preview remoto a 390 PASS, sin errores de
  consola ni solicitudes a APIs privadas. Prueba adicional de teclado numérico
  con área visible 390×400, doble toque, cambio de sección, retorno y recarga PASS.
- Evidencias locales fuera de Git: `/tmp/sfm-tour-*.log`, capturas
  `/tmp/sfm-tour-<ancho>-<paso>.png`, `/tmp/sfm-tour-teclado.png`.
- Activación exclusivamente en `/demo`; sin API nueva, migración, cambio de
  Access, D1 o R2. PDFs intactos. Sin uso de iPhone físico. Las guías reales
  siguen fuera de esta entrega, tal como se aprobó.
- La publicación del turno actualiza el dominio canónico; comprobar el commit
  resultante y la primera entrada de ambos roles antes de anunciar el cierre.

## Release v2 — 2026-09-09

- Implementación verificada: `2e492c2`; staging `fa0bee17`, alias público
  `codex-premium-v2`. Demo Coach/Cliente y guía en español disponibles sin login.
  Admin real permanece privado; preview no crea sesiones ni actividad real.
- 701 tests/69 archivos, lint, build, 35 comprobaciones HTTP y Maestro Chromium
  34 comandos PASS. QA autenticado remoto con dos navegadores y personas sintéticas:
  onboarding recuperable, sesión acompañada, preview aislada, invitaciones, fotos
  privadas/compartidas, entrenamiento cerrado offline y leído en segundo dispositivo.
- R2 activado por el dueño; buckets privados distintos `sfm-fotos-production` y
  `sfm-fotos-staging`, binding FOTOS. Dos fotos sintéticas recuperadas en segundo
  navegador; retirada de consentimiento de compartir oculta la foto al Coach.
- Migración productiva 0008/0009 aplicada después de respaldo y restauración
  ensayada dos veces. Manifiesto privado:
  `.recovery/migracion-production-1788979558126/manifest.json`.
  Conservación exacta por hash: 6 clientes, 24 rutinas, 37 sesiones de acceso y
  13 invitaciones. Ninguna escritura de QA en producción ni importación automática.
- Recuperación de código privado compatible: `.recovery/rollback-2e492c2`,
  168 archivos con SHA-256. No restaurar una base antigua perdiendo actividad.
- La publicación de este turno dispara el deployment canónico. Verificar su
  commit y fronteras en lectura antes de anunciar la entrega; el reporte final
  de la conversación recoge el deployment resultante.
- Límites: Safari/PWA en iPhone físico no verificados por instrucción del usuario.
  La guía es de demo. Las equivalencias técnicas del catálogo siguen pendientes;
  PDFs originales intactos. El correo autorizado de Coach es el del dueño;
  añadir el correo de Santiago requiere conocerlo y autorizarlo en Access y la app.

## Historial de implementación v2 — notas previas al release

Las fechas y pendientes siguientes describen checkpoints anteriores; el estado
vigente es el release anterior y su publicación al final de este documento.

- Checkpoint local: `416f136`; nota de continuidad: `2205175`. El turno sigue
  activo de codex. No están publicados en main remoto.
- Arquitectura y UX implementadas: [ARQUITECTURA-V2](ARQUITECTURA-V2.md).
  Procedimientos vigentes: [DESPLIEGUE](DESPLIEGUE.md), [ACCESO](ACCESO.md) y
  [QA-V2](QA-V2.md). Las entradas históricas siguientes no describen v2.
- Preview de prueba del checkpoint: https://650c8f1f.santiago-fitness-method.pages.dev
  con D1 staging separada. Acceso autenticado remoto pendiente de login.
- Producción: sin migraciones 0008/0009 aplicadas, sin QA de escritura. Respaldo
  actualizado y restauración ensayada el 2026-09-08; tablas originales intactas.
- R2 requiere activación por el dueño y verificación de bindings privados. Safari
  iPhone/PWA instalada no disponibles para validar. No declarar entrega completa.
- Maestro Chromium 34 comandos PASS; HTTP local 30 comprobaciones PASS. La suite
  completa del checkpoint tiene 687 pruebas; volver a ejecutar antes de publicar
  los cambios posteriores, incluyendo revocación visual de Coach.

### Validación adicional del 2026-09-08

- Demo sin login para Santiago confirmada en el alias permanente:
  https://codex-premium-v2.santiago-fitness-method.pages.dev/demo/coach
  Configuración exacta y límites en PUBLIC-TEST-MODE.md. Admin sigue privado.
- Ensayo actualizado de producción: 6 clientes, 24 rutinas, 37 sesiones de acceso,
  13 invitaciones conservadas tras restauración y migración doble. No se aplicó
  la migración remota de producción. Nuevo comando `npm run d1:v2` ensaya por
  defecto; `--aplicar` es explícito y respalda de nuevo antes de modificar D1.
- QA: 691 pruebas/64 archivos PASS, lint/build PASS, 35 comprobaciones HTTP,
  Maestro Chromium 34 comandos; revocación visual
  cubre 401 y redirect opaco de Access. Cartera de 80 clientes usa tres consultas.
  Los perfiles antiguos sin rutina ya no bloquean la lista de Coach.
- Documentadas arquitectura, recuperación, despliegue y fronteras. Retiradas las
  herramientas que insertaban invitaciones directamente o sembraban QA antiguo.
- R2 continúa sin activar en la cuenta; el dueño debe completar ese paso según
  el plan aprobado. No se aceptaron condiciones ni suscripciones en su nombre.
- Las notas de Claude se conservaron. El tipo `exact` del test de demo se corrigió;
  Nora muestra un plan completo pendiente de revisar, sin una sesión vacía ficticia.

### Checkpoint publicado para revisión

- Código verificado: `8afc26a`, respaldado en GitHub en
  `codex/premium-v2-review`. No se hizo push a `origin/main` ni se cerró el turno.
- Deployment Pages: `698a177a-368c-464f-80c4-b2efa433f221`, commit `8afc26a`,
  rama de deployment `codex-premium-v2`. Alias público de demo conservado.
- Readback: demo sin OTP y Nora con cuatro sesiones completas pendientes de
  revisión. No hay cambios en D1 productiva; release real aún pendiente.
- Para cerrar: activación R2 por el dueño; QA autenticado de staging; validación
  de Safari/PWA en iPhone disponible; después migración aditiva y publicación
  canónica con handoff. No reabrir Admin ni sustituir estos pasos por demo.

### Guía propia de Codex — demo en español

- Bienvenida de cuatro pasos: preparar, acompañar y entrenar. Se puede omitir,
  retroceder y abrir de nuevo. Guía de seis temas con acciones hacia pantallas
  reales de la demo, accesible también desde Cliente. Estado sólo en memoria.
- El usuario descartó expresamente conectar el iPhone físico. Continuar QA con
  emulador de navegador; no volver a intentar iPhone Mirroring. Safari/PWA física
  no verificados y no se declaran aprobados.
- QA: 693 pruebas/65 archivos PASS; build y lint PASS. Emulación Chrome a
  320/375/390/430/768/1024 px: cuatro pasos, Cliente, guía, Escape y alta ficticia
  pasan; cero errores de ejecución, desbordamiento horizontal o controles menores
  de 48 px en la bienvenida. Recuperación de foco al cerrar hojas comprobada.
- Access real del Coach en staging validado con login legítimo y sólo Lucía QA
  de la base aislada. Aún falta cerrar el recorrido remoto completo de escritura.
- Prioridad solicitada: publicar esta demo primero, después continuar producción.
  R2 necesita activación del dueño; migración y publicación productivas pendientes.

### Continuación del 2026-09-09 — nube y release

- Demo con guía publicada: commit `414d1d9`, deployment
  `c1d1461a-1f4c-47eb-8c1f-490e4b02eaf1`, alias `codex-premium-v2`.
  QA remoto de guía en seis anchuras completo, sin errores de ejecución.
- Staging real: Marina QA creada con perfil y plan atómicos (201). Su borrador
  se guardó en IAB y se recuperó en Chrome, paso 3/3. Entrenamiento acompañado:
  dos series de 25 lb/lado × 5, RIR 2; cierre y lectura desde otro navegador.
  Vista previa de Lower A no añadió actividad: D1 conserva un entrenamiento y
  dos series para esa persona sintética. Producción sin escrituras de QA.
- Hallazgo del QA: clave de borrador reconstruida en cada lectura cloud causaba
  autoguardados repetidos. Dependencias primitivas corrigen la causa. Regresión
  reproducida primero (6 escrituras por 1 ajuste) y corregida; 694 tests/66
  archivos, lint y build PASS. Falta desplegar y comprobar el contador remoto.
- R2 ya habilitado por el dueño. Creados `sfm-fotos-staging` y
  `sfm-fotos-production`; ambos Standard, Public Access Disabled. Bindings
  FOTOS separados añadidos; fotos remotas pendientes de QA antes de producción.
- Canje de invitación vía formulario pendiente: IAB no envía y Chrome muestra
  ERR_BLOCKED_BY_CLIENT. Solicitado al usuario pulsar Entrar en la pestaña QA.
  No se ha debilitado Access ni alterado la invitación para eludir ese bloqueo.
- Respaldo/ensayo fresco: `.recovery/migracion-production-1788953176295/`,
  restauración y migración doble PASS, sin aplicar cambios a D1 productiva.
- El usuario pide continuar hasta publicar producción; no cerrar el turno ni
  hacer push a main hasta resolver los controles anteriores. La demo ya está lista.

### Correcciones verificadas antes del rollout

- Autoguardado en staging `6b177c4` / `6e0104bc`: 33 versiones de borrador antes
  del ajuste, 34 después, 34 tras posteriores refrescos. La causa quedó corregida.
- Fotos en Entrenar juntos: tratar la conexión como Coach, sólo lectura de fotos
  compartidas y URL autorizada; sin controles de consentimiento/subida del Cliente.
- Canje: reproducido en Chrome local que `Referrer-Policy: no-referrer` transforma
  Origin en null al enviar formularios. La página de invitación usa strict-origin
  y CSP form-action self: no revela ruta/token y mantiene la validación de origen.
  Canje real de formulario contra Pages local PASS (302, sesión de Lucía y URL sin
  token). Queda contrastar remoto; el bloqueo previo no se da por resuelto aún.
- Suite actual: 696 pruebas/68 archivos PASS, lint y build PASS. Ajustado un test
  de transición para esperar la aparición del siguiente ejercicio, no sólo la
  desaparición de la primera serie. No se debilitó ninguna aserción funcional.

### Nota de claude-code — cerrado; tu guía es la que queda

**Decisión de Santiago (2026-09-09): se queda con tu guía.** Sólo quiere usar la
demo y la producción que trabajas tú. Mi versión está retirada y ya no existe:
rama `claude/guia-coach` borrada y mis tres alias de preview (`guia-coach`,
`guia-claude`, `guia-codex`) eliminados. No hay nada mío que fusionar ni mirar.

**Nada tuyo se ha tocado.** `codex-premium-v2` —incluido tu `c1d1461a` con la
guía—, `codex/premium-v2-review`, `respaldo/v2-codex` y todos los despliegues de
producción siguen igual. De mí en `main` sólo hay commits de documentación: cero
ficheros de código.

**Verifiqué tu trabajo antes de retirarme** (`414d1d9`): 693 pruebas/65 archivos,
`tsc --noEmit`, lint y build limpios; sin errores de consola tuyos; sin desbordes
a 375 px; `localStorage` intacto en la demo. Tus cifras cuadran. Gracias por el
arreglo de foco en `Hoja`: el `aria-labelledby` con `useId` no se me había
ocurrido.

**Lo único que dejo sobre la mesa:** tu guía se monta en `Demo()`, así que no
aparece en `/admin` con el coach real, y su texto es de demo («al recargar, todo
vuelve al inicio», el tema 06). Si algún día se quiere también en el panel real
hará falta una variante del texto. No es una objeción; puede ser exactamente lo
que se pidió.

**Aviso sobre «producción»:** `origin/main` sigue en `4ea3eca`, y el bundle que
sirve `santiago-fitness-method.pages.dev` no contiene nada de v2 —comprobado
descargándolo: sin `/demo/coach`, sin «Tu coaching, hoy.», sin tu guía—. Son 9
commits tuyos sin publicar. Santiago da por hecho que la demo y el panel que ha
estado viendo ya están en producción, y no lo están: viven sólo en tus previews.
Publicar es tu turno y tu decisión, con las migraciones y el QA pendientes.

## Phase 3A.6 — Coach Decision Pack

- Entrega para Santiago: `docs/BIBLIOTECA-COACH-DECISION-PACK.md`.
  Mapa interno: `docs/BIBLIOTECA-COACH-DECISION-MAP.csv`. Sólo documentación;
  ninguna respuesta elegida, ninguna fusión ni importación ejecutada.
- Fuentes: fases 1–2, análisis 3A, revisión 3A.5 (Markdown y CSV), mapping de los
  once históricos y PDF original completo. La fuente prevalece sobre resúmenes:
  no se añade pronación a ancho/medio ni se confunde prensa vertical/unilateral.
- Se revisaron 11 casos históricos y los 25 R01–R25. Resultado: **48 unidades de
  respuesta**, 11 históricas A1–A11 y 37 de biblioteca B1–B37. Cada unidad define
  el significado de un nombre o su relación con otro; los espacios de equipo,
  postura o ejecución aclaran esa elección, no son fusiones implícitas adicionales.
  No se cuentan las 295 opciones como decisiones. Ningún caso quedó sin pregunta.
- Consolidación: B7 pregunta una sola vez por la máquina de pecho apoyado de
  R07/R17; B12 pregunta una sola vez por la elevación inclinada de R08/R18.
  Las relaciones diferentes siguen separadas (p. ej. B8 codos abiertos y B9
  remo unilateral). Los expedientes con varios nombres ambiguos se desglosan;
  de ahí que 25 casos originen 37 preguntas, no 25 preguntas artificialmente amplias.
- Familias compartidas con historial: A2/B13, A4/B21, A5/B23–B25 y A9/B30–B31
  usan referencias a una descripción única. A confirma si describe registros
  anteriores; B sólo define el catálogo. No se aplica B a historia por defecto.
- Prioridad: **0 REQUIRED BEFORE 3B; 48 CAN DEFER** para un lote que excluya
  cambios dependientes de estas respuestas. No es aprobación de importar las
  293 propuestas. `blocks_phase_3b=false` distingue el bloqueo global de
  `blocks_affected_change=true`: antes de activar/vincular esa variante concreta
  sí hace falta resolverla; otros ejercicios seguros no quedan bloqueados.
- «Mantener genérico» es una respuesta intencional distinta de «dejar pendiente».
  En existentes: conservar ID/historial sin mapping específico. En nuevos:
  registrar intención de familia, sin asumir metadata ni convertirla por defecto
  en ejercicio ejecutable. Excluir del lote concreto hasta aprobar representación
  de familias; no fusionar fuentes, historiales o cargas.
- CSV: una fila por opción, H01–H11 como referencias documentales de los once
  históricos; R01–R25 conservan la numeración original. `answer` y `answer_details`
  vacíos. Registrar respuesta literal sólo en la opción elegida y sus aclaraciones;
  conservar el resto vacío. Dependencias por opción, no obligatorias para elegir
  genérico/pendiente. Si «Otro», detalles incompletos o respuestas contradictorias
  dejan dudas, pedir aclaración; nunca interpretar el silencio como aprobación.
- Verificación: readback 48 decisiones, 11 IDs históricos, 25 casos R cubiertos,
  opciones genérico/Otro/pendiente y referencias válidas; documentos fuente,
  datasets y PDF byte-idénticos a `5186968`; diff de producción vacío.
  `npm test` 602/602 PASS; lint PASS; build app/presentación PASS. La intermitencia
  de Perfil anterior no reapareció en esta corrida, sin afirmar que esté corregida.
- Los 33 IDs, las 293 propuestas, UI, D1 y `docs/cliente` permanecen intactos.
  Próximo paso: enviar el cuestionario y esperar respuestas. No ejecutar Phase 3B.

## Turno de codex — Landing fiel al producto (2026-09-02)

- Implementación en `codex/presentacion-fiel`, desde una copia Git aislada en
  `/tmp/sfm-landing-6abIJd/repo`. El turno se reclamó en `main` con el protocolo.
  `entrega-diseno/` sigue sin adoptar; Downloads y `docs/cliente/` no se modificaron.
- Fuentes: diseño HTML de Claude Design en Downloads, `shared/plantillas-base.ts`,
  `BIBLIOTECA_INICIAL`, componentes actuales y los dos PDFs de `docs/cliente`.
- `/presentacion` tiene entrada y build independientes. Allowlist exacta:
  `/presentacion`, `/presentacion/`, `/presentacion/assets/*`,
  `/presentacion/media/*`. Los assets inexistentes no sirven el fallback privado.
  La respuesta pública no reenvía cookies a ASSETS ni emite cookies; CSP impide
  conexiones y formularios. El iframe aísla layout y estado, no el origen:
  preview usa Cloudflare Access y un origen opaco bloqueaba su carga. No existe
  código de lectura/escritura del repositorio en la demo; tests verifican cero
  fetch, cero Storage.setItem y cero indexedDB.open al registrar y navegar.
- Demo en memoria: reutiliza TarjetaEjercicio/FilaSerie, HojaEjercicio, iconos,
  ProveedorDescanso/Descanso y lógica de correcciones reales. No importa el
  repositorio ni llama APIs. Historial es un resumen de actividad de demo;
  Perfil es explicativo y remite a la captura real, sin botones de logout falsos.
- Cuatro capturas nuevas de producto a 390×844 en
  `public/presentacion/media/capturas/`: Hoy, Biblioteca, Historial y Perfil.
  Fixture anónimo local `Perfil de demostración`; fecha real de captura 2026-09-02,
  una serie de ejemplo de 25 lb/lado para ilustrar Historial. Fixture eliminado.
  No se usaron capturas antiguas, Santiago, nombres de QA ni fotos personales.
- UI DISCREPANCIES FOUND: P2 área de Ficha invadida al envolver Cambiar variante
  en el iframe; corregido sólo en CSS de demo. P2 título de paso desbordaba 3 px
  a 320; pasos en una columna en ese ancho. P3 controles pequeños, fuentes ajenas,
  kilos y datos ficticios del diseño reemplazados por controles/datos actuales.
- QA local: ocho viewports 320×800, 375×667, 390×844, 402×874, 430×874,
  768×900, 1024×900, 1200×900. Documento sin overflow; demo efectiva entre
  276 y 400 px sin overflow y controles >=44 px. Ficha, cierre, steppers,
  técnica/calentamiento, guardar, timer, +30s, Editar, tabs, filtro de Biblioteca,
  terminar y cuatro días ejercitados en el navegador integrado. Consola limpia.
- Pruebas: `npm test` 590/590 PASS; `npm run lint` PASS;
  `npm run build` PASS, sin warnings; `SFM_QA_PORT=8790 npm run test:movil`
  PASS en Maestro Chromium contra este build y D1 exclusivamente local.
  La variable opcional de puerto evita interferir con otro servidor en 8788.
- HTTP local: `node scripts/pruebas-presentacion.mjs` 18 checks PASS, incluidos
  landing/assets 200, app/assets/API 401, Admin 403 local sin Access y SW 200.
- Evidencia antes/después y geometría:
  `/Users/dayanmacbookpro/Documents/Codex/2026-09-02/sfm-landing-qa/`.
- Preview final `a3a3983b`, commit `ad0a79e`: PASS con sesión existente de
  Cloudflare Access. Anónimo sigue detrás de Access (302). La primera corrida
  encontró P1 teléfono vacío por iframe de origen opaco; corregido usando un
  iframe del mismo origen sin almacenamiento/API, y revalidado guardar, Editar,
  timer, Biblioteca, ficha, retorno y consola sin errores.
- Canónico de Git `dce7feff`, commit `ad0a79e`: PASS. HTTP anónimo 18 checks
  pasan: presentación y assets 200 sin cookies, app/JS/manifest/imagen/API 401,
  Admin 302 a Access, SW 200. Guardar/Editar/timer también pasan en el dominio
  canónico. La prueba permite la cookie de negociación propia de Access en
  `/admin`; no la confunde con una cookie de la presentación.
- Se integró por fast-forward a `main`, sin deploy manual. No se cambió
  Cloudflare Access, datos reales de Santiago ni D1 remota. El estado de prueba
  de D1 y los enlaces locales se eliminaron al terminar.
- Esta fase no cambia el release del producto: iPhone físico y PWA siguen
  pendientes; no declara READY FOR SANTIAGO.

## Turno de codex — Mobile UX polish + auditoría táctil (2026-09-02)

### Alcance y protección de datos

- Se revisó primero la interfaz del participante y después los controles
  equivalentes de Admin. Los cambios son P2/P3 de bajo riesgo: no cambian la
  lógica de entrenamiento, el modelo D1, la navegación ni los permisos.
- Se usó únicamente `dayan-test` con invitaciones y sesiones en D1 local. Los
  fixtures se identificaron por sus hashes exactos para limpiarlos; no se usó
  Santiago para escribir y no se tocó D1 remoto.
- `docs/cliente/` permaneció intacto.

### Auditoría antes de modificar

- **P2:** los steppers de peso y repeticiones tenían 44 px de caja, pero eran
  glifos `+`/`−` sin borde ni fondo; la zona tocable no se distinguía a simple
  vista.
- **P2:** `Terminar sesión` dibujaba 34 px y dependía de un pseudo-elemento para
  llegar a 44 px; su objetivo visual era pequeño.
- **P2 de accesibilidad iOS:** la barra completa tenía `role="progressbar"` y
  el botón de cierre quedaba descendiente de ese rol; Maestro/iOS no exponía
  `Terminar sesión` aunque sí se veía.
- **P3 conservado:** Técnica y Calentamiento siguen siendo píldoras compactas
  de 34 px; su zona ampliada supera 44 px y no invade los steppers.
- Admin conserva `--toque: 44px`, CTA, segmentos, flechas y cierres de 44 px.
  El gate Admin autenticado no se pudo renderizar localmente porque Wrangler
  no puede simular Cloudflare Access; se cubrió mediante inspección estática y
  sus pruebas de consola.

### Cambios realizados

- `src/index.css`: steppers con borde, radio, fondo, contraste de hover/active y
  feedback de pulsación; `Terminar sesión` con caja real de 44 px; barra de
  sesión de 63 px; medidor semántico interno para separar progreso y cierre.
- `src/pantallas/EntrenamientoHoy/EntrenamientoHoy.tsx`: el contenedor pasó a
  `role="group"` y el medidor conserva `role="progressbar"`; el botón es ahora
  hermano accesible del medidor sin alterar su callback.
- Pruebas actualizadas en `EntrenamientoHoy.test.tsx` y
  `src/pruebas/shellMovil.test.ts` para proteger la semántica, las cajas de
  44 px y la affordance visual.

### UI DISCREPANCIES FOUND

- P2 steppers sin affordance visual y P2 `Terminar sesión` de 34 px:
  **corregidos**.
- P2 botón de cierre oculto para el árbol de accesibilidad iOS:
  **corregido** con la separación de roles anterior.
- No se encontró P0/P1 durante esta fase. No se cambió arquitectura ni se
  añadió ninguna función.

### Evidencia visual y táctil

- Maestro CLI/MCP 2.10.0 ejecutado mediante el puente local; Chromium completó
  `qa-movil`, el flujo de guardado/timer/corrección, navegación, cierre y
  reentrada. El warning externo de CDP de Selenium no produjo fallos.
- Maestro iOS ejecutó login, Ficha, steppers, Técnica, Calentamiento, guardado,
  timer, `+30S`, `EDITAR`, Biblioteca, Historial, Perfil, `Terminar sesión` y
  logout en el simulador `QA iPhone 16 Pro` (iOS 27.0,
  `A57A612D-A009-4696-B64E-7664F32B8D70`). La inspección posterior mostró
  `Terminar sesión` como botón hermano accesible. Una corrida monolítica tuvo
  una aserción temporal tras `EDITAR`; el mismo paso pasó al añadir
  `waitForAnimationToEnd`, por lo que no se clasificó como bug funcional.
- Playwright midió los siete viewports y volvió a medir tras hacer scroll al
  final. En todos: `document.scrollWidth === clientWidth`, solapamientos entre
  capas fijas = 0 y, con el contenido desplazado, controles de contenido bajo
  timer/progreso/navegación = 0.

| Viewport | Documento | Steppers | Guardar | Timer +30S/Listo | Terminar | Barra progreso | Nav |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 320×800 | 320/320 | 44×44 | 44 px | 44 px | 114.34×44 | 320×63 | 48 px |
| 375×667 | 375/375 | 44×44 | 44 px | 44 px | 114.34×44 | 375×63 | 48 px |
| 390×844 | 390/390 | 44×44 | 44 px | 44 px | 114.34×44 | 390×63 | 48 px |
| 402×874 | 402/402 | 44×44 | 44 px | 44 px | 114.34×44 | 402×63 | 48 px |
| 430×874 | 430/430 | 44×44 | 44 px | 44 px | 114.34×44 | 430×63 | 48 px |
| 768×900 | 768/768 | 44×44 | 44 px | 44 px | 114.34×44 | 768×63 | 48 px |
| 1024×900 | 1024/1024 | 44×44 | 44 px | 44 px | 114.34×44 | 1024×63 | 48 px |

Capturas fuera del repositorio:

- Antes: `/tmp/sfm-ux-before-timer/390x844.png` y
  `/tmp/sfm-ux-before-timer/320x800.png`.
- Después: `/tmp/sfm-ux-after-timer-final-verified/390x844.png` y
  `/tmp/sfm-ux-after-timer-final-verified/320x800.png`.
- iOS después de la corrección semántica:
  `/tmp/sfm-ios-after.png`.

### Pruebas ejecutadas

- `npm test` — **3 corridas consecutivas PASS**, 49 archivos y 574 tests en
  cada corrida; no reapareció el fallo intermitente de `aria-valuenow`.
- Suite enfocada (`EntrenamientoHoy` + `shellMovil`) — **130/130 PASS**.
- `npm run lint` — **PASS**, 0 warnings.
- `npm run build` — **PASS**, build Vite limpio.
- `npm run test:movil` — **PASS** en Chromium/Maestro con fixture local.

### Fuera de alcance y riesgo restante

- No hay iPhone físico ni Safari físico verificable en este entorno; el objetivo
  iOS fue un simulador. Safari físico, instalación PWA desde Safari,
  standalone, persistencia PWA y una interacción posterior quedan
  **NOT EXECUTED** y no se sustituyen por Chromium.
- La UI Admin no se midió con una sesión real de Cloudflare Access; sólo se
  validó código/contratos existentes.
- La ergonomía final con un teléfono físico y el notch real requiere revisión
  manual posterior.

### Resultado

- **Mobile UX polish:** **PASS** en Chromium y simulador iOS, con las
  limitaciones indicadas.
- **Estado de release:** **NOT READY FOR SANTIAGO** hasta cerrar Safari/iPhone
  físico y la instalación PWA real. Esta fase no declara `READY`.

Hay cambios sin commit que existían antes de instalar este protocolo. No se han
tocado ni incluido en esta configuración:

- `docs/PLAN-FEEDBACK-CLIENTE.md`
- `src/pantallas/EntrenamientoHoy/EntrenamientoHoy.test.tsx`
- `src/pantallas/Perfil/Perfil.test.tsx`
- `src/pruebas/configuracion.ts`

El primer agente que adopte esos cambios debe revisarlos explícitamente y publicar su
resultado. No se deben borrar ni sobrescribir para liberar el turno.

## Turno de codex — QA final de gates físicos y regresión automatizada (2026-09-02)

### Alcance y protección de datos

- No se modificó código de producto ni `docs/cliente`.
- La validación de escritura utilizó únicamente el cliente técnico `dayan-test` en
  una D1 local (`pruebas-maestro/enlace-local.mjs`, `--local`).
- Para el intento remoto se creó una invitación QA de un día para `dayan-test`; no
  se consumió y se revocó al terminar. No se escribió ninguna invitación ni sesión
  de `santiago`.
- Verificación D1 posterior: una invitación de `santiago` sigue pendiente y sin
  revocar; se observaron 6 sesiones activas preexistentes de `santiago`, sin cambios
  realizados por este turno.

### Pruebas automatizadas

- `npm test` — **3 corridas consecutivas PASS**, 572/572 en cada corrida, código 0.
  No reapareció `aria-valuenow`, `DatabaseClosedError`, `MaxListenersExceededWarning`
  ni rechazos sin dueño.
- `npm run lint` — PASS, 0 warnings.
- `npm run build` — PASS, Vite compiló correctamente.
- `maestro list-devices` — sólo Chromium local; todos los simuladores iOS aparecen
  desconectados.
- `maestro --udid chromium test pruebas-maestro/qa-movil.yaml` — PASS con fixture
  local: entrada por enlace, Hoy, guardar serie, timer, `EDITAR`, Técnica,
  Calentamiento, Biblioteca y retorno a Hoy. La ejecución fue en Chromium, no en
  Safari/iPhone. Se observó sólo el warning externo de Selenium sobre CDP 152.
- Screenshot de la corrida: `/Users/dayanmacbookpro/.maestro/tests/2026-09-01_225952/QA móvil del cliente/takeScreenshot/qa-movil.png`
  (2400×1870, estado con timer y barra de sesión visibles). El artefacto queda fuera
  del repositorio y no se versiona.

### iPhone físico / Safari / PWA

- **Dispositivo:** iPhone físico visible y activo mediante la aplicación macOS
  `iPhone Mirroring`. El modelo y la versión de iOS no pudieron obtenerse de forma
  verificable desde la interfaz; no se inventan.
- **Safari físico:** **NOT EXECUTED**. El enlace QA se abrió y mostró “Tu acceso está
  listo”, pero la interacción remota con `Entrar` no completó un login verificable ni
  creó sesión; no se marcaron como PASS login, Hoy, Biblioteca, Historial, Perfil,
  guardado, timer, `EDITAR`, navegación o logout en Safari.
- **Maestro iOS:** **NOT EXECUTED**. `xcrun --find simctl` falla porque este Mac no
  tiene `simctl`/Xcode developer tools, y Maestro no reporta un dispositivo iOS
  conectado.
- **Instalación PWA desde Safari (Añadir a pantalla de inicio, standalone,
  persistencia y nueva interacción): NOT EXECUTED.** No se sustituyó por Chromium.

### Resultado del turno

- Regresión automatizada y fixture QA en Chromium: **PASS**.
- Gate iPhone físico Safari: **NOT EXECUTED**.
- Gate instalación y persistencia PWA: **NOT EXECUTED**.
- **Estado global: NOT READY FOR SANTIAGO.** No se cambia a READY hasta repetir
  login, recorrido completo, logout y PWA en Safari/iPhone físico, con screenshots y
  versión de iOS registradas.

### Riesgos restantes / siguiente acción

- Falta una ejecución verificable sobre Safari del iPhone y la instalación PWA real;
  el screenshot de Chromium no cubre geometría ni comportamiento de Safari iOS.
- El warning de Selenium sobre CDP 152 no hizo fallar el flujo, pero conviene
  actualizar/alinear el driver si se usa esta ruta automatizada en CI.
- Próximo turno: conectar un objetivo iOS instrumentable (Maestro con Xcode/simulador
  o un dispositivo físico compatible) y cerrar únicamente esos gates; no tocar
  Santiago ni los PDFs del cliente.

## Protocolo

1. Consultar el estado: `npm run handoff:status`.
2. Sincronizar una copia limpia: `npm run handoff:sync`.
3. Reclamar el turno: `npm run handoff:claim -- --agent <codex|claude-code> --task "..."`.
4. Trabajar solo en la tarea reclamada.
5. Ejecutar pruebas, lint y build.
6. Publicar: `npm run handoff:publish -- --agent <agente> --status <complete|blocked> --summary "..." --checks "..." --next "..."`.

Si el árbol ya estaba sucio antes del handoff, revisar primero el diff y adoptar esos
cambios de forma intencional con `npm run handoff:adopt -- --confirm --agent <agente> --task "..."`.
Ese comando crea un commit de adopción; nunca se deben borrar esos cambios para liberar
el turno.

Los comandos de claim y publish hacen commit y push automáticamente. Se detienen si
hay cambios remotos, cambios sin dueño o cualquier modificación dentro de
`docs/cliente`.

## Requisitos de QA compartidos

- Sesiones de 5 a 8 ejercicios.
- Registro por serie de peso, repeticiones, RIR y descanso.
- Última sesión y mejor referencia separadas.
- Historial independiente por variante.
- Sustituciones sin destruir historiales.
- Temporizador de descanso: arranca solo al guardar una serie nueva de trabajo; no en calentamiento, corrección ni historial.
- Autosave, recuperación y corrección de datos.
- Historial después de completar una sesión.
- Perfil, limitaciones y volumen semanal.

## Detalle del turno de claude-code (brechas prioritarias de QA)

Este turno se compone de dos commits: uno de adopción (`92688d5`), que recogió trabajo
previo sin commitear, y el de publicación, con el trabajo nuevo.

### Qué se implementó

**1. Participantes**
- Alta real desde la interfaz (`src/pantallas/Alta/AltaParticipante.tsx`). Una instalación
  nueva abre directamente en el alta.
- Todos los campos de §2 llegan con estimados; sólo hay que escribir el nombre, que es lo
  que hace viable el criterio de "menos de 2 minutos".
- Cada participante recibe identificador propio (`nuevoId()`), no la constante `'001'`.
- **Se eliminó `ID_PARTICIPANTE_PILOTO` de todo el código de aplicación.** Los cinco hooks
  ahora resuelven al participante con `repositorio.participanteActual()`.
- `sembrar()` ya no crea personas: siembra biblioteca y plantillas. Esto cumple el
  *"sin panel ficticio de clientes"* de la especificación V1.
- Quien ya tenía `Participante 001` lo conserva con su historial: el alta sólo aparece si
  la base está vacía. Verificado en el navegador sobre la base existente.

**2. Plantillas del coach**
- Reordenar con flechas ↑↓ (`moverSlot` en `src/logica/plantilla.ts`).
- El ejercicio **se lleva su programación** al moverse: estímulo, series, rango y descanso
  viajan con él. La posición sólo dice cuándo se entrena.
- Las posiciones se renumeran sin huecos; el primero no sube y el último no baja.
- Sustituciones e historial por variante intactos.

**3. Recomendaciones**
- `SlotPlantilla.progresionFijada` permite al coach sobrescribir la recomendación.
- `siguienteObjetivo` se dividió en `decidir` (qué toca) y `conNumeros` (con qué cifras):
  **fijar la recomendación no cuesta el objetivo**, la app sigue calculando peso y reps.
- La tarjeta muestra `Mantener · del coach` para distinguir manual de automática.

**4. Registro rápido**
- Tocar el valor de peso o reps abre un campo para **escribirlo directo**. Sin esto,
  llegar a 135 lb desde 0 con pasos de 2.5 lb son 54 toques.
- Los steppers ± siguen ahí para el ajuste fino.
- Peso, reps, RIR, técnica, calentamiento y corrección se mantienen sin cambios.
- **RIR 5+**: `src/dominio/rir.ts` centraliza la escala. §14 dice "escala 0–5+", y el tope
  no es un cinco exacto sino "cinco o más en reserva". Antes se mostraba `5` a secas en los
  cinco sitios donde aparece; ahora se muestra `5+`. Los valores guardados no cambian, sólo
  su representación.

### Riesgos y observaciones pendientes

- `src/datos/imagen.ts` (reducción de fotos) tiene el camino de canvas al 45% de cobertura:
  jsdom no ejecuta canvas. Se verificó **manualmente en el navegador**: 5946 KB → 271 KB,
  3000×2000 → 1080×720.
- `npm run lint` mantiene los mismos tres warnings de React de la línea base. No se
  introdujeron nuevos.
- Al sustituir una variante "sólo hoy", el contador de la sesión refleja el ejercicio nuevo
  (0 series) y no el original. Es coherente con el historial por variante, pero conviene
  confirmarlo con el cliente.
- La sustitución por defecto pasó de permanente a "sólo hoy". **Es un cambio de
  comportamiento que el cliente aún no ha confirmado.**

## Turno de claude-code — brechas finales de QA

### Qué se implementó

**1. Biblioteca (punto H)**
- Fuera el texto fijo `Participante 001` de `Biblioteca.tsx`. La biblioteca es el
  catálogo del método, no datos de una persona: el kicker pasa a "Ejercicios del método".
- Ficha completa al tocar un ejercicio: equipo, tipo de carga, músculo principal,
  secundarios, instrucciones breves y **alternativas equivalentes**, que salen del campo
  `movimiento` (§16) sin lista aparte que mantener.
- Se salta de una equivalente a otra sin cerrar la hoja.
- La cuadrícula sigue visual (§15, §25); el detalle vive en la hoja.

**2. Progresión**
- `domina()` ahora devuelve `false` si alguna serie tiene técnica `deficiente`. Antes,
  tres series al tope con la última rota recomendaban **más peso**.
- Sólo se corta ese caso; el resto de umbrales sigue pendiente de que el cliente los defina.
- El coach **sí** puede fijar "subir carga" a pesar de la técnica: el bloqueo es de la
  recomendación automática, no de su criterio.
- La tarjeta muestra las cifras que ya calculaba y no se veían: reps objetivo, peso
  sugerido e incremento. Sin referencia previa no enseña ningún número.

**3. Foto de perfil**
- Tabla propia (`fotosDePerfil`), Dexie v5. Opcional, editable y eliminable.
- Reutiliza `reducirImagen`. Verificado en navegador: 1600×1600 → 1080×1080.
- Sin foto muestra iniciales. Los botones miran el dato, no la vista previa: si fallara
  la miniatura, la foto seguiría siendo borrable.

**4. Guardado, recuperación y corrección**
- Autosave del borrador por participante+fecha+día+posición+serie (Dexie v6).
- Se guarda **sólo lo que el participante tocó**: guardar siempre dejaría borradores de
  valores que nadie escribió, y ésos acabarían pisando la referencia del día siguiente.
- El borrador se borra **después** de registrar la serie, no antes.
- Una sola lógica auditada en `src/logica/correccion.ts`, usada por Hoy **y** por Historial.
- "Deshacer" apila una entrada `motivo: 'reversion'`: el rastro **crece**, no se recorta.
- Se puede abrir una sesión ya cerrada desde Historial y corregirla.

**5. Aislamiento por participante**
- `historialDeEjercicio`, `idsDeEjerciciosConHistorial` y `seriesEntreFechas` reciben
  `participanteId`. `Sustitucion` y `PlantillaDia` lo llevan dentro.
- **Los ids de plantilla pasan a ser `<participante>|upper-a`.** La prueba de aislamiento
  destapó que con `upper-a` a secas el segundo participante sobrescribía los días del
  primero, porque el id es la clave primaria.
- Migraciones v7 y v8 asignan sustituciones y plantillas al participante existente sin
  borrar nada. Cubiertas por `src/datos/migracion.test.ts` sobre una base del esquema viejo.
- La interfaz sigue siendo de un solo participante: no se añadió selector ni panel.

**Extra encontrado durante la verificación**
- Tocar "Lower B" en Perfil abría el Coach en Upper A: `App.tsx` descartaba el día
  elegido. Corregido y con prueba.
- `MaxListenersExceededWarning`: venía de que `useEntrenamiento` releía las sesiones del
  participante una vez por ejercicio, superando los diez oyentes de una misma señal de
  Dexie. Se agrupó en `historialDeEjercicios` (dos consultas en vez de diez). **De 82
  avisos a 0**, sin silenciarlo. Además las bases de prueba ahora se cierran solas
  (`src/pruebas/base.ts`).

### Limitación conocida de las pruebas

`fake-indexeddb` **no conserva los `Blob`**: los convierte en objetos planos sin `size` ni
contenido. Las pruebas de fotos comprueban el contrato de almacenamiento (que esté, que se
sustituya, que se borre, que no se mezcle); que la imagen viaje entera se verificó en el
navegador.

### Preguntas abiertas — no inventar respuesta

1. **Vídeo**: alojamiento y contenido. Su punto H dice "foto/video corto"; la foto ya está,
   así que el vídeo podría ser opcional. Opciones costeadas en `docs/OPCION-VIDEO.md`.
2. **"Dominar" una carga**: aparte de bloquear técnica deficiente, falta el criterio completo.
3. **Calentamientos**: ¿cuentan en el progreso visual de series (el contador N/M)?
4. **Sustituciones**: ¿permanente o "sólo por hoy" por defecto? Y qué debe mostrar el
   contador de la sesión cuando la variante está sustituida.
5. **Permisos**: separación coach / participante.
6. **Recuperación subjetiva**: si se usa y cómo.
7. **Ejercicios definitivos** de Lower A, Upper B y Lower B (§28 los deja sin confirmar).
8. **Datos reales de las máquinas** del gimnasio para calibrar incrementos (§13).
9. **Mínimo de cinco ejercicios**: ¿obligatorio, con los otros tres días aún vacíos?
10. **Documento de "preguntas 1–18"**: no está en ninguno de los dos PDFs entregados.
11. **Series con 0 lb**: ¿debe avisar la app al guardar una serie sin peso en un ejercicio
    con carga externa? En peso corporal (dominadas, fondos) el 0 es válido.

## Turno de claude-code — Plan 1: corrección de QA

### El hallazgo que motivó el turno

`npm test` terminaba con **código 1** aunque los 324 tests pasaran. Yo lo había dado por
bueno verificando con `npx vitest run --testTimeout=8000` y **sin mirar el código de
salida**. Vitest reportaba dos `DatabaseClosedError` como rechazos sin dueño.

Causa: en `AltaParticipante.test.tsx`, el manejador de "Crear participante" sigue
corriendo después del clic (`guardarParticipante` → `crearDiasIniciales`). El test daba
el alta por buena en cuanto existía el participante, terminaba, y el `afterEach` cerraba
IndexedDB **mientras se escribían los cuatro días**.

### Fase 1 — Suite realmente verde
- Los tests del alta esperan al flujo completo: participante **y** sus cuatro días.
- `src/pruebas/base.ts` desmonta (`cleanup()`) y cede un tick **antes** de cerrar Dexie.
- No se ocultó ningún error: se corrigió el orden de apagado.
- **`npm test` → código 0**, tres corridas seguidas, cero `MaxListenersExceededWarning`.

### Fase 2 — Regresiones
Casi todo el listado ya estaba cubierto. Huecos reales añadidos:
- La foto de perfil sobrevive a cerrar y reabrir.
- Reemplazarla no deja la anterior acumulada.
- El alta crea Upper A · Lower A · Upper B · Lower B, y son suyos.

### Fase 3 — Accesibilidad y ergonomía
- **`prefers-reduced-motion`**: se quitan animaciones, no información. El aviso del
  cronómetro se mantiene por color y texto.
- **El pulso del cronómetro** latía los tres minutos enteros de un descanso de fuerza
  (§12). Ahora sólo en los últimos 10 s (`.descanso--acabando`), con test.
- **Áreas táctiles a 44 px** sin agrandar el dibujo: tres columnas de 44 px no caben en
  320 px, así que se extienden con pseudo-elementos. Medido en el navegador:
  - "Reps" pasó de **16×44** a 47×44 — ese lo introduje yo con la escritura directa.
  - Técnica 66×34 → 66×44, Calentamiento 52×34 → 52×44, `+`/`−` 34×44 → 44×44.
- **Portada compacta** sin foto real: ocupaba el 40 % de una pantalla de 320 px y dejaba
  los controles de la primera serie fuera de la vista.

### Fase 4 — Warnings
De 3 a **0**, sin desactivar reglas:
- `useSegundosDesde.ts`: **era código muerto**, huérfano desde que el cronómetro pasó a
  manual. Borrado.
- `ImagenEjercicio.tsx`: `etiquetaEquipo` se movió a `src/dominio/etiquetas.ts`, junto a
  las etiquetas de carga y músculo.
- `FichaParticipante.tsx`: el borrador se reinicia **al cambiar de persona**, no en cada
  actualización del mismo participante. Además de quitar el warning, arregla que guardar
  algo suyo desde otra parte de la app pudiera borrar lo que el coach llevaba tecleado.

### Fase 6 — QA de liberación
- `npm test` 328 ✅ · `npm run lint` 0 warnings ✅ · `npm run build` ✅ (54 entradas precache)
- Visual a **320×568** y **390×844**: sin desborde horizontal, sin contenido tapado por la
  navegación, navegación completa Hoy → Biblioteca → Historial → Perfil.
- Recarga en mitad de sesión: el ajuste sin guardar se recupera.
- 5 y 8 ejercicios verificados.
- **Offline no se probó en esta sesión**: el servidor de desarrollo no activa el service
  worker. Lo que sí consta es que el build genera las 54 entradas de precarga. Queda
  pendiente probarlo sobre `dist`.

### Datos de prueba
Se borraron dos series de 0 lb que dejé yo tocando "Guardar" sin peso. **No se tocaron**
la medición del 23 ago ni las fotos: las metió el usuario.

Eso destapó algo para el cliente: **la app permite guardar una serie con 0 lb**, y esa
serie pasa a ser la referencia y alimenta la recomendación. No se puede bloquear sin más,
porque en dominadas 0 lb añadido es legítimo. Añadido a las preguntas abiertas.

### Plan 2 (patrones de Strong) — NO iniciado
Por acuerdo explícito: no se empieza mientras el Plan 1 no esté cerrado. Ya lo está.

## Turno de claude-code — Plan 2, fases 1 a 3

Patrones de interacción tomados de Strong, **adaptados** al método: la
programación sigue siendo del coach y el participante entra, ve lo suyo,
registra y sigue. Nada de lo excluido en el plan (inicio automático del
descanso, superseries, 1RM, social, cloud) se ha tocado.

### Fase 1 — Registro más rápido (`9b0b26d`)
- **La siguiente serie parte de lo que se acaba de levantar hoy**, no de la
  referencia de la semana pasada. Sigue siendo editable (§6) y sólo se ajusta si
  el participante no ha tocado nada: pisarle lo tecleado por guardar otra serie
  sería peor que no ajustar.
- El **calentamiento no arrastra su peso** a la serie de trabajo.
- **Confirmación al guardar**: check con entrada de 150 ms, más el texto
  "Guardada" para lectores de pantalla, que no ven ni el check ni el color.
- **El ejercicio terminado se pliega y se abre el siguiente.** Plegado conserva
  el resumen `4/4` y se puede reabrir para corregir.

### Fase 2 — Progreso siempre visible (`2554fa4`)
- Barra fija con `N de M series` y **Terminar sesión**. Antes había que bajar
  hasta el final de la lista —hasta ocho ejercicios— para cerrar la sesión.
- Sólo mientras hay sesión abierta; al cerrarla desaparece.
- Va sobre la navegación, no sobre los controles, y el contenido gana hueco: sin
  eso el último texto quedaba a **seis píxeles** de ser tapado.

### Fase 3 — Cronómetro (`20984a7`)
Casi todo lo que pedía el plan ya estaba (inicio manual, +30 s, Listo, visible al
cambiar de ejercicio, pulso limitado a los últimos 10 s desde el Plan 1).

Lo que **sí** apareció al verificar: cronómetro y barra de sesión son los dos
fijos al fondo y **se solapaban 22 px**. El cronómetro se comía la barra recién
añadida. Ahora se apilan, y sin sesión abierta el cronómetro baja al hueco libre.
Con test, para que un cambio de alturas no vuelva a solaparlos en silencio.

### Estado
`npm test` 340 ✅ código 0 · `npm run lint` 0 warnings ✅ · `npm run build` ✅

### Pendiente del Plan 2
Fases 4 a 8: ficha deslizable, historial contextual y el sistema común de
microanimaciones. El vídeo de la ficha sigue bloqueado hasta que el cliente elija
alojamiento.

## Turno de claude-code — Plan 2, fases 4 a 8

### Fase 4 y 5 — Ficha con historial contextual (`0f3abbe`)
- La ficha que ya existía en Biblioteca se abre ahora desde el entrenamiento,
  con **el historial de esa variante** dentro (§16: no se mezcla con el de las
  equivalentes).
- **Se superpone sin desmontar la tarjeta**: consultar el ejercicio delante de
  la máquina no cuesta la serie a medio escribir. Es la condición explícita del
  plan y está cubierta con test.
- El fondo del diálogo deja de llamarse "Cerrar" igual que el botón: dos
  controles con el mismo nombre confunden a quien usa lector de pantalla.

### Fase 6 y 8 — Movimiento (`3b85f52`)
- Tabla única de tiempos: toque 120 ms · confirmar 150 ms · desplegar 200 ms ·
  hoja 220 ms · progreso 250 ms. Ninguno por encima de 250 ms.
- **El borrador recuperado se anuncia.** Antes se restauraba en silencio y
  aparecían números que el participante no recordaba haber escrito, sin saber si
  eran suyos o una sugerencia de la app.
- Tests sobre la propia hoja de estilos: que los tokens existan, que ninguno pase
  de 250 ms, que `prefers-reduced-motion` los anule y que **la única animación
  infinita siga siendo el aviso del cronómetro**.

### Lo que apareció al verificar
Cronómetro y barra de sesión son los dos fijos al fondo y **se solapaban 22 px**
(`20984a7`). No lo veían los tests —el DOM de jsdom no tiene layout— sino la
medición de posiciones en el navegador. Ahora se apilan: pestañas, barra,
cronómetro. Verificado en 320×568 y 390×844.

### Estado
`npm test` 357 ✅ código 0 · `npm run lint` 0 warnings ✅ · `npm run build` ✅

QA visual: 320×568 y 390×844, sin solapes entre las tres capas fijas, sin
desborde horizontal, confirmación al guardar, plegado y avance, barra de sesión,
ficha con historial y recuperación de borrador con aviso.

### Excluido, como pedía el plan
Inicio automático del descanso, superseries, calculadora de discos, 1RM,
estadísticas avanzadas, wearables, social, cloud sync y pagos. El **vídeo** de la
ficha sigue fuera hasta que el cliente elija alojamiento.

### Pendiente
Paso 10 del plan: presentación al cliente para aprobación visual. Y las 11
decisiones suyas listadas más abajo, de las que la nº7 —los ejercicios de Lower
A, Upper B y Lower B— es la que más frena: hoy tres de cada cuatro días el
participante abre la app y no tiene nada que hacer.

## Turno de claude-code — Preview listo para el cliente

### Copia de seguridad (lo más importante)
Todo vive en el dispositivo (§26), y eso dejaba un riesgo sin red: si el
navegador borra su almacenamiento se van meses de entrenamiento, y §19 deja de
cumplirse por algo que no depende de la app.

- Exportar e importar **un solo archivo `.json`**, con las fotos dentro en
  base64 — el coach lo recibe por WhatsApp o correo sin casar piezas sueltas.
- La biblioteca **no** entra: son 33 fichas con foto que la app ya trae.
- **Restaurar es idempotente**: reimportar el mismo archivo no duplica el
  historial. Con test.
- Nunca se confía en el archivo: si no es un respaldo válido se rechaza entero,
  porque restaurar algo a medias encima del historial no tiene vuelta atrás.

**Fallo de diseño encontrado al probarlo en el navegador:** el botón de
restaurar vivía sólo en Perfil, que necesita un participante. Pero el caso para
el que existe la copia —móvil nuevo, navegador borrado— arranca **sin**
participante, así que la copia no servía justo cuando hacía falta. Ahora también
se restaura desde la pantalla de alta.

Verificado de punta a punta en el navegador: borré la base entera, la app abrió
en el alta, restauré el archivo y volvieron participante, los cuatro días, la
serie y **la foto de perfil intacta a 1080×1080**.

### Los tres días vacíos
§28 los dejaba sin confirmar, así que venían vacíos. El resultado real era que
**tres de cada cuatro días la app abría diciendo "todavía no tiene ejercicios
definidos"** — que se lee como una app rota, no como una decisión pendiente.

Ahora traen una propuesta según §4 (fuerza · hipertrofia ×3 · resistencia),
documentada en `docs/ESTIMADOS-A-CONFIRMAR.md` **como estimados**, no como
decisión. El coach los cambia desde la pantalla Coach.

Los dos tests que daban por hecho el día vacío se adaptaron en vez de borrarse:
el comportamiento sigue importando porque el coach puede vaciar un día.

### Despliegue
`docs/DESPLIEGUE.md` + `public/_headers` (caché: assets con hash para siempre,
`index.html` y `sw.js` nunca).

**Cloudflare Pages, no Vercel.** Verificado: Vercel Hobby prohíbe el uso
comercial e incluye explícitamente *"un consultor pagado escribiendo el
código"*, que es este proyecto. Cloudflare permite uso comercial gratis con
ancho de banda ilimitado, y la app es 100% estática.

**GitHub Pages queda descartado por un motivo concreto**: sirve bajo un
subdirectorio y las rutas de imagen son absolutas, así que exigiría tocar
`vite.config.ts` y el manifiesto.

### Lo que hay que decidir antes de enseñársela
**IndexedDB es por origen.** Si el cliente prueba en `algo.pages.dev` y luego se
mueve a un dominio propio, **los datos del piloto no viajan**. Conviene fijar el
dominio definitivo antes de que escriba el primer dato real — o exportar la copia
antes de mover.

### Estado
`npm test` 384 ✅ código 0 · `npm run lint` 0 warnings ✅ · `npm run build` ✅
`docs/cliente` sin tocar.

### Verificación pendiente, que sólo se puede hacer publicada
El **modo sin conexión**: el servidor de desarrollo no activa el service worker.
Hay que abrirla desde el móvil, ponerlo en modo avión y comprobar que sigue
funcionando. Los pasos están en `docs/DESPLIEGUE.md`.

## Registro de turnos

### Continuación de biblioteca maestra por Codex

El usuario solicitó retomar el trabajo dejado por Claude. Se revisaron los seis
archivos pendientes del claim `90dd707`; se libera el owner anterior únicamente
para registrar la adopción explícita de Codex con `handoff:adopt`. No se publican
los nombres supuestos del borrador: primero se completaron las correcciones y QA.

- Alcance: fases 1–2; catálogo compartido de 33 ids, nomenclatura verificable y
  prueba de paridad Coach/Cliente. Detalle en `docs/BIBLIOTECA-FASES-1-2.md`.
- Se mantienen genéricos 11 ejercicios cuya variante no identifica el código.
  El Smith sigue a 15°; las equivalencias dudosas requieren confirmación del coach.
- Compatibilidad: una prueba de arranque doble conserva historial, plantilla y
  calibración mientras actualiza el nombre. Otra fija los 33 ids publicados.
- `npm test`: 602/602 PASS, 51 archivos; lint y build PASS.
- Playwright con Chrome local aislado: demo compilada en
  `http://127.0.0.1:4174/presentacion/?demo=1`, a 320×844, 390×844 y 1024×844.
  Hoy → Ficha → cerrar → subir peso → Guardar → timer → Editar → Biblioteca → Hoy:
  PASS; sin overflow horizontal ni errores de consola; capturas revisadas.
- Evidencia: `/var/folders/5t/93khy91x7w948nr90vf7bl140000gn/T/sfm-biblioteca-qa-ivSAcW/`.
  Browser plugin no disponible en esta sesión; se usó Playwright instalado con
  Chrome porque el CLI no respondió y el Chromium empaquetado no estaba instalado.
- La prueba visual ejercita componentes reales reutilizados en la demo. No es
  una nueva corrida autenticada Admin/Cliente ni Safari/iPhone/PWA.
- Sin escrituras D1 remotas, sin cambios en Santiago ni en `docs/cliente`.
  Las capturas estáticas del landing conservan la nomenclatura de su fecha;
  queda pendiente recapturarlas. No se declara READY FOR SANTIAGO.

<!-- HANDOFF-ENTRIES -->

### 2026-10-21T19:21:52.413Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Costo de los servicios profesionales de GIF para la biblioteca: verificar precios vigentes y escribir informe
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T18:53:01.169Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** PR #14 aprobado, integrado en 1bf0404 y producción verificada; adaptación coach/admin laptop con novedad coach
- **Verificación:** 1082/1082 pruebas; lint; build/TypeScript/PWA; diff-check; Pages SUCCESS; 9 archivos idénticos; API anónima 401; demo publicada sin desborde ni errores
- **Siguiente:** Ninguno para este PR. Dueño puede recargar el portal del coach en la laptop de Santiago.


### 2026-10-21T18:47:59.100Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Integrar PR #14 aprobado y verificar producción; solo coach/admin laptop
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T18:36:54.062Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Coach laptop preparado en PR #14 y preview SUCCESS; main recibe solo documentación, cliente y producción sin cambios de producto
- **Verificación:** 1082/1082 npm test -- --maxWorkers=3; npm run lint; npm run build; git diff --check; QA sintético IAB 960-1366 y compilado final; preview Pages SUCCESS/Access 302
- **Siguiente:** Dueño revisa PR #14/preview. Esperar aprobación antes de merge; añadir y aprobar novedad coach antes de producción. No tocar cliente.


### 2026-10-21T18:24:56.631Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Optimizar solo coach/admin para laptop: densidad, formularios y acciones visibles; PR y preview sin publicar
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T18:08:43.019Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** PR #13 integrado y publicado: sesiones pendientes identificadas, avisos humanos, foco directo y borrador conservado. Nota aprobada, prueba 3x7 en producción y mensaje a Santiago preparado, sin enviar.
- **Verificación:** 1082/1082 pruebas, 128 archivos; lint/build/diff-check PASS. 117 HTTP + caso API 400→201 local. Preview/producción Pages SUCCESS, 8 assets idénticos; demo producción aviso claro→alta 7/7/7, consola limpia; API anónima 401.
- **Siguiente:** Dueño envía mensaje preparado a Santiago para repetir desde su borrador. Si persiste, recoger captura del nuevo aviso y recuentos; no se enviaron mensajes ni se alteró la clienta real.


### 2026-10-21T17:52:46.775Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Corregir avisos y validación de sesiones; pruebas completas, preview e integración en producción autorizadas
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T17:50:23.186Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Prueba UI 3x7 completada: 7/7/7/4 reproduce error; 7/7/7/5 publica y quitar cuarta permite publicar 7/7/7. Soluciones documentadas; sin implementación por la última indicación del dueño.
- **Verificación:** 1071/1071 pruebas, 126 archivos; lint, build y diff-check PASS. Demo compilada IAB: recuentos, fallo, publicación y retiro de cuarta sesión; consola limpia. Sin datos reales.
- **Siguiente:** Revisar soluciones propuestas: validar recuentos reales, mensajes contextuales elegantes, revisar sesión y aclarar frecuencia/rotación. Implementación pendiente de la revisión solicitada.


### 2026-10-21T17:45:57.633Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Corregir validación visible del alta: identificar sesión incompleta y explicar frecuencia/rotación, con PR y preview
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T17:33:32.631Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Verificado bloqueo del alta de 3 días: rotación de cuatro, validación global y error técnico reproducidos; salida de tres sesiones comprobada en demo. Sin cambios de código ni datos reales.
- **Verificación:** 1071/1071 pruebas, 126 archivos; lint, build y diff-check PASS. IAB alta inválida y publicación ficticia de tres sesiones; contrato [7,7,7,4] rechaza, [7,7,7] y [7,7,7,5] aceptan.
- **Siguiente:** Comprobar cuarta sesión en el borrador real; si se desean solo tres, Organizar sesiones permite quitar la sobrante. Mejora de mensajes pendiente de implementación autorizada. No reanudar GIF/costes en este chequeo.


### 2026-10-21T17:30:03.553Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Verificar bloqueo al publicar alta de cliente de 3 días, sin cambios de código ni datos reales
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T17:17:05.082Z | claude-code | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Investigacion de GIFs y costo interrumpida por limite de uso de la sesion. Sin cambios de codigo ni de datos. Medido: catalogo base 46/57 con GIF, 7.135.460 bytes verificados en produccion, servidos por Pages como estaticos immutable 1 anio; biblioteca real de produccion en D1 tiene 290 ejercicios del coach (286 activos) con 237 animaciones en R2; los GIF del coach se sirven con private max-age=300 y el service worker no los cachea, asi que cada vista mas alla de 5 min vuelve a R2. Tarifas R2 y Pages consultadas. PENDIENTE: medir en bytes los 237 GIF de R2 (hay que pasar --remote a wrangler r2 object get), leer los PDFs de cliente, calcular escenarios de 3 y 30 clientes, y escribir el informe en docs/. Hallazgos completos guardados fuera del repo en la carpeta de notas compartidas: gifs-costo-hallazgos-2026-10-21.md
- **Verificación:** ninguna: no hubo cambios de codigo
- **Siguiente:** Retomar con la medicion de los 237 GIF en R2 usando --remote y escribir docs/gifs-costo-2026-10-21/INFORME.md


### 2026-10-21T17:08:55.030Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Verificar estado de GIFs de ejercicios y calcular costo de infraestructura y produccion
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T17:00:35.400Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Corregidos los dos fallos del bug run, con nota de novedades aprobada por el dueno. (1) Publicar ya no deja la ficha ofreciendo Retomar programacion: el documento del borrador se conserva porque el servidor rechaza eliminar programas, asi que ahora solo se ofrece mientras proponga algo distinto de lo publicado (nuevo src/producto/borrador-plan.ts con borradorPendiente, que compara unicamente el contenido que veria el cliente). La revision usada al guardar sigue siendo la del documento guardado. (2) El filtro de pagos vive en la direccion mediante useSearchParams con replace: al quitarlo desaparece de la URL y no vuelve al recargar ni al reabrir la app instalada; activarlo la vuelve a poner. Al escribir las pruebas aparecio ademas que el filtro se leia de window.location en vez de la ruta de React: tambien corregido. Nota de novedades para coach: 2026-10-21-coach-borrador-publicado, Dos detalles menos, dos puntos. Archivos: Coach.tsx, borrador-plan.ts, BorradorPublicado.test.tsx, notas-novedades.ts. Cuatro pruebas nuevas escritas primero en rojo. Verificado ademas en la demo compilada 375x812: renombrar sesion, guardar borrador, retomar, publicar y la tarjeta desaparece; chip de pagos en ambos sentidos con recarga. Sin errores de consola. Sin telefono fisico ni escrituras remotas.
- **Verificación:** npm test (1071/1071, 126 archivos); npm run lint; npm run build; git diff --check
- **Siguiente:** El dueno abre la app y confirma la nota Dos detalles menos; despues comprobar en produccion que el modulo del coach coincide con el build local


### 2026-10-21T16:51:22.084Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Corregir borrador que sobrevive al publicar y filtro de pagos en la URL
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T16:48:53.225Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Bug run del coach sobre el build de e251a38 en demo compilada local (375x812). Dos fallos reproducibles, ninguno bloqueante, documentados en docs/bug-run-coach-2026-10-21/README.md: (1) P2, publicar el programa no retira el borrador guardado, la ficha sigue ofreciendo Borrador disponible / Retomar programacion aunque ese contenido ya este en vivo (guardar(true) en src/producto/Coach.tsx escribe programa y nunca sustituye el documento borrador; no ocurre si se publica sin borrador previo); (2) P3, el filtro ?pagos=pendientes no se limpia de la URL al pulsar Ver todos los clientes ni al desactivar el chip, asi que una recarga reaplica el filtro ya descartado (soloPagos se inicializa una vez desde la URL). Verificado correcto: Hoy y su tarjeta de revision, prescripcion 4->5 series y 25 lb, guardar/retomar/publicar, pagos/busqueda/vacios con la regresion de Ver todos del PR #12, Biblioteca 57 ejercicios, hojas con dialog modal real, Escape y foco devuelto al origen, areas tactiles >=44 px en tres pantallas y regresion del cliente hasta Completar serie, sin errores de consola. El dueno confirmo en su telefono que ve la hoja Novedades publicada en e251a38. Movimiento reducido no emulado en vivo: verificado por codigo y pruebas de usePresencia. Sin cambios de producto; solo documentacion. Sin telefono fisico, PWA nueva, VoiceOver ni escrituras remotas.
- **Verificación:** npm test (1067/1067, 125 archivos); npm run lint; npm run build; git diff --check
- **Siguiente:** El dueno decide si se corrigen los dos fallos; la correccion del borrador tras publicar es visible para el coach y necesitaria nota de novedades aprobada


### 2026-10-21T16:39:57.597Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Bug run y test del coach tras PR #12; registrar confirmacion de la hoja Novedades en el telefono del dueno
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T15:40:07.906Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Aviso de novedades por versión para coach y clientes. Notas curadas en src/producto/notas-novedades.ts (id, fecha, audiencia, 1–3 puntos); hoja «Novedades» con botón Entendido en Coach y Cliente real, recordada por dispositivo en localStorage (sfm-novedades-vistas:coach|cliente). Dispositivo sin registro: solo la nota más reciente si tiene ≤14 días. Las novedades salen antes que el recorrido/bienvenida de GuiaAyuda y no se apilan. Inactivo en demo. Primeras notas aprobadas por el dueño: coach «Tu panel, más claro» y cliente «Tu rutina, más a mano». Regla añadida en CLAUDE.md y AGENTS.md: todo cambio visible en producción lleva nota aprobada por el dueño. Archivos: notas-novedades.ts, useNovedades.ts, Novedades.tsx, Novedades.test.tsx, Coach.tsx, Cliente.tsx, GuiaCoachReal.test.tsx, producto.css, pruebas/configuracion.ts (marca las novedades como vistas fuera de sus pruebas). No verificado en pantalla con sesión real; el dueño lo verá en su teléfono.
- **Verificación:** npm test (1067/1067, 125 archivos); npm run lint; npm run build
- **Siguiente:** El dueño confirma que ve la hoja Novedades al abrir la app; desde ahora cada cambio visible añade su nota


### 2026-10-21T15:33:48.099Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Aviso de novedades por versión para coach y clientes
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T15:27:40.255Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Despliegue de 6df66aa verificado en producción y QA Safari iOS. Incidente: los builds de Pages terminaron fuera de orden (checks GitHub: 73153ff 14:56:49, 6df66aa 14:57:29, 535890e 14:58:11) y producción quedó con el código anterior al arreglo; 7d8cf39 tardó más de 10 min en empezar a construir. Se empujó el commit vacío 84f188d para redesplegar. Ahora /demo/coach sirve index-Z3vZM5kQ.js → Coach-C-pDaPNm.js, idéntico byte a byte al build local, sin el aria-label viejo; sw.js lista el módulo nuevo. Safari QA iPhone 16 Pro (iOS 27): Hoy muestra la tarjeta de Nora sin chevron y un solo CTA; Revisar programa abre la ficha de Nora. No se usó el iPhone 18 Pro ajeno. Se rechazó abrir un acceso sin login en producción: el QA usa la demo pública. Solo GET remotos, sin sesión autenticada ni escrituras. Lección: tras varios pushes seguidos a main, verificar el index servido y no solo sw.js.
- **Verificación:** npm test (1059/1059); npm run lint; npm run build; comparación byte a byte del módulo Coach en producción
- **Siguiente:** El dueño revisa Hoy del coach con su login en el teléfono


### 2026-10-21T15:07:34.022Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** QA Safari iOS del coach y verificación del despliegue de 6df66aa
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T14:46:36.149Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Corregidos los dos P3 de accesibilidad del Hoy del coach. (1) La tarjeta Necesita revisión tenía dos enlaces seguidos al mismo programa: ahora la persona es un bloque informativo y el único enlace es el CTA Revisar programa, que conserva data-tour-action=abrir-cliente y data-tour-client; se quitó el chevron huérfano en coach-ios.css. (2) p.sfm-coach-summary pierde el aria-label sin rol; el texto ya es autoexplicativo. Archivos: src/producto/CoachHoy.tsx, src/producto/coach-ios.css, src/producto/CoachHoy.test.tsx (nuevo, 2 pruebas que fallaban antes y pasan después). Verificado en navegador integrado: un solo enlace /demo/coach/clientes/demo-persona-3, sin aria-label, sin desborde. Sin cambios de datos, API ni docs/cliente. Safari nativo sigue sin verificarse en esta rama.
- **Verificación:** npm test (1059/1059, 124 archivos); npm run lint; npm run build
- **Siguiente:** Probar en iPhone físico/Safari nativo; no se integra a producción sin visto bueno del dueño


### 2026-10-21T14:44:50.758Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Corregir P3 de accesibilidad del Hoy del coach
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T14:44:15.404Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Bug run y QA del refinamiento del coach (PR #12 integrado en e22134a), sin cambios de código. Revisión del diff (CoachHoy, FilaCliente, Coach, EditorPlan, BibliotecaCoach, usePresencia, coach-ios.css): sin bugs funcionales; el fix de StrictMode en usePresencia es correcto. QA en navegador integrado contra dev server (StrictMode activo): Hoy → Revisar programa → ficha → Preparar cambios → prescripción → Listo (hoja cierra, hit test positivo, CTA y=782–832 en 844); Clientes, Biblioteca, hoja Añadir ejercicio abre/cierra; 390, 320 y 1440 sin desborde horizontal; consola sin errores. P3: p.sfm-coach-summary lleva aria-label sin rol (los lectores de pantalla pueden ignorarlo) y el bloque Revisar programa repite el mismo destino en dos enlaces seguidos. No verificado: Safari nativo — el 18 Pro estaba en uso por otra sesión (capturas no coincidían con los toques, no se volvió a tocar) y el QA iPhone SE recién arrancado dio timeout en simctl openurl; QA Safari 16 Pro/SE de Codex sigue siendo la última evidencia. Tampoco HTTP suite (sin cambios de API). docs/cliente intacto.
- **Verificación:** npm test (1057/1057, 123 archivos); npm run lint; npm run build
- **Siguiente:** Probar en iPhone físico/Safari nativo antes de nuevas funciones; opcional corregir los dos P3 de accesibilidad


### 2026-10-21T14:38:20.677Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Bug run y QA del refinamiento del coach (PR #12 integrado)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T14:31:12.826Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** PR #12 integrado en e22134a y producción verificada; documentación de relevo para bug run y test con Claude.
- **Verificación:** Sobre el merge: 1057/1057 pruebas (123 archivos), npm run lint, npm run build y diff-check PASS. Pages SUCCESS; demo coach 200, ocho assets coinciden con build local; API anónima 401.
- **Siguiente:** Claude Code sincroniza y reclama para el bug run y test solicitado. Mantener producción de solo lectura, probar escrituras en demo/local/staging. Sin vídeo ni mensajes a Santiago.


### 2026-10-21T14:26:14.750Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Integrar PR #12 y verificar publicación del coach; relevo de QA a Claude
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T13:32:23.067Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Coach implementado en PR #12 y preview SUCCESS, sin merge; main recibe solo documentación y evidencia.
- **Verificación:** En 9c18cc1: npm test -- --maxWorkers=3 (1057/1057, 123 archivos); npm run lint PASS; npm run build PASS; git diff --check PASS; Safari 16 Pro y SE e IAB 320–1440 PASS. Producto de main idéntico a acc9ac6.
- **Siguiente:** Dueño revisa PR #12 y preview; esperar autorización explícita antes de merge. Sin vídeo ni mensajes a Santiago.


### 2026-10-21T12:46:35.142Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Implementar refinamiento del coach: claridad, enfoque y acción, propuesta 1 como base
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T12:28:26.588Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Coach: revisión de siete recorridos y tres propuestas visuales entregadas, sin cambios de interfaz
- **Verificación:** 1054/1054 tests en 123 archivos; npm run lint; npm run build con TypeScript; git diff --check; revisión IAB 390/1440 con capturas inspeccionadas; consola sin errores
- **Siguiente:** El dueño elige propuesta 1, 2 o 3, o pide ajustes. Después implementar móvil/escritorio en rama con PR y preview; sin merge antes de visto bueno nuevo. Corregir el error de pagos del mock 3. No vídeo ni envío a Santiago.


### 2026-10-21T12:17:43.753Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Revisar experiencia del coach y preparar tres propuestas visuales, sin implementar
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T12:14:06.635Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** PR #11 integrado con aprobación; refinamiento iOS publicado y verificado en producción
- **Verificación:** 1054/1054 pruebas en 123 archivos; npm run lint; npm run build con TypeScript; git diff --check; Pages SUCCESS; demo 200 y ocho archivos idénticos al build; API cliente 401 y admin 302 a Access
- **Siguiente:** Ninguna implementación pendiente del refinamiento. Revisión opcional del dueño en iPhone instalada. Ideas fuera del plan sin iniciar; no vídeo ni envío a Santiago.


### 2026-10-21T12:11:47.546Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Integrar PR #11 aprobado y verificar publicación de la propuesta 2
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T12:07:36.409Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Propuesta 2 implementada en PR #11 y preview; evidencia y QA publicados, sin merge del diseño
- **Verificación:** 1054/1054 pruebas en 123 archivos; lint y build/TypeScript PASS; diff-check PASS; IAB 320/390/1024; Safari iPhone 16 Pro y SE; registro, descanso, resumen, semana y bi-serie PASS
- **Siguiente:** El dueño revisa PR #11 y preview, preferiblemente instalada en su iPhone. Esperar visto bueno explícito antes de merge. No regenerar vídeo ni enviar nada a Santiago.


### 2026-10-21T03:53:40.427Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Implementar propuesta 2: cliente enfocado en rutina con experiencia iOS
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T03:48:00.313Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Versionadas las ocho capturas Safari y las tres propuestas enlazadas en el diagnóstico iOS
- **Verificación:** Checks de base en 81fd734: 1054/1054 pruebas, lint y build PASS; copias verificadas byte a byte y enlaces locales existentes; git diff --check PASS
- **Siguiente:** Elegir propuesta 1, 2 o 3 (o combinación); después implementar todo el cliente en rama con PR y preview, sin merge sin visto bueno nuevo. Vídeo ya enviado por el dueño.


### 2026-10-21T03:47:51.899Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Versionar las capturas y propuestas del diagnóstico iOS ya entregado
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T03:47:39.849Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Diagnóstico visual iOS del cliente y tres propuestas; implementación pendiente de elección
- **Verificación:** npm test -- --maxWorkers=3: 1054/1054, 123 archivos PASS; npm run lint PASS; npm run build PASS; git diff --check PASS; 8 capturas Safari y 3 conceptos guardados
- **Siguiente:** Elegir propuesta 1, 2 o 3 (o combinación) del chat; después implementar todas las pantallas del cliente en rama con PR y preview, sin merge sin nuevo visto bueno. Vídeo ya enviado por el dueño; no regenerar ni enviar.


### 2026-10-21T03:31:43.428Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Refinar experiencia cliente inspirada en Apple Fitness: diagnóstico visual iOS y propuesta verificable
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T03:28:12.605Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** PR #10 aprobado e integrado mediante b42290e; producción 43840396 verificada y siete archivos idénticos al build. Vídeo aplazado expresamente por el dueño; no se ejecutaron captura, render ni envíos.
- **Verificación:** npm test -- --maxWorkers=3: 1054/1054 en 123 archivos; npm run lint; npm run build; git diff --check; Pages SUCCESS; demo 200 y siete archivos idénticos; API cliente 401 y admin 302 a Access
- **Siguiente:** Ninguno dentro del merge solicitado. Vídeo aplazado hasta nueva indicación del dueño; no generarlo ni enviar mensajes a Santiago. QA opcional y funcionalidades fuera del plan sin iniciar.


### 2026-10-21T03:24:47.971Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Integrar PR #10 aprobado y verificar producción; vídeo aplazado por el dueño
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T02:02:52.408Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Seguimiento B7 de simulador documentado con control sin JS; se conserva PASS físico del dueño. PR #10 abierto en borrador, verde y pendiente de merge; orden del tutorial y envío registrado. Sin cambios de producto.
- **Verificación:** npm test -- --maxWorkers=3: 1053/1053, 123 archivos; npm run lint; npm run build; git diff --check; consulta de PR #10 y lectura de tutorial; capturas de SE revisadas
- **Siguiente:** Esperar merge del dueño para PR #10; después integrar/publicar, regenerar y revisar vídeo con 6–15 reps y entregarlo al dueño. No enviar a Santiago sin visto bueno. QA física opcional de bi-series e ideas fuera del plan después.


### 2026-10-21T01:59:46.795Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Documentar seguimiento B7 y preparar continuidad del PR #10 y tutorial
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-21T01:54:01.357Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Cierre de claude-code y relevo a Codex. HECHO en main: bi-series/tri-series (PR #5 y arreglos), sensación nativa bloques 1-3 (PR #6, #7, #8), puntos de página y pista de deslizar (PR #9); prueba física del dueño PASS en puntos 3, 7, 9 y B7. Tutorial en vídeo HD de bi-series entregado al dueño (1080x1920, 40 s); guion en Claude Design https://claude.ai/artifact/VNkGw7FofoFWg3zeo6CzLC; scripts para regenerarlo en docs/tutorial-bi-series/. PENDIENTE: PR #10 (claude/series-pendientes: series pendientes muestran el objetivo y '1 rep') abierto, verde, sin conflictos, esperando el visto bueno del dueño.
- **Verificación:** npm test 1053/1053 (una corrida previa tuvo 1 fallo intermitente que pasó al repetir; no se identificó cuál); npm run lint 0 avisos; npm run build; git diff --check
- **Siguiente:** Codex: 1) con el 'merge' del dueño, unir PR #10 (claude/series-pendientes) y publicar; 2) tras unirlo, regenerar el vídeo con docs/tutorial-bi-series/README.md para que las series pendientes digan '6-15 reps' y entregarlo al dueño; 3) el dueño envía a Santiago el mensaje corto + vídeo (no enviar nada sin su visto bueno); 4) opcional: probar bi-series en iPhone físico (demo: Coach > Alicia > Programa > Upper B); 5) ideas fuera del plan: tendencias por ejercicio, valoración de esfuerzo 1-10, rachas, compartir resumen como imagen. Si aparece el fallo intermitente de tests, identificarlo con npm test -- --maxWorkers=3 y estabilizarlo.


### 2026-10-20T22:52:56.404Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Series pendientes muestran el objetivo y singular de rep
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T22:50:34.587Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** PR #9 unido con el visto bueno del dueño (merge): puntos de página bajo 'Ejercicio N de M' y pista de primera vez por dispositivo ('Desliza a los lados…' + asomo finito; solo texto con Reducir movimiento) para descubrir el deslizar entre ejercicios. Prueba física del dueño: puntos 3, 7, 9 y B7 PASS.
- **Verificación:** npm test 1053/1053; npx tsc -b; npm run lint 0 avisos; npm run build; git diff --check
- **Siguiente:** Series pendientes: mostrar el objetivo en vez de '0/1 reps' y '1 rep'; borrador de WhatsApp a Santiago sobre bi-series (solo con visto bueno del dueño).


### 2026-10-20T22:22:18.546Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Hacer descubrible el gesto de deslizar entre ejercicios
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T22:09:56.788Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** B7 cerrado: el dueño reinstaló desde /entrar en su iPhone físico y no hay destello gris; el fotograma de se-destello-residual.jpg era del simulador. Antes se liberó a mano el turno de codex (2f2358f, sin trabajo). Actualizados PLAN-SENSACION-NATIVA.md y el README de evidencias. Sin cambios de código.
- **Verificación:** npm test; npm run lint; npm run build; git diff --check (solo documentación)
- **Siguiente:** El dueño confirma en el iPhone los puntos 3 (deslizar entre ejercicios) y 9 (volver desde el borde, instalada). Después: series pendientes muestran objetivo y '1 rep'; borrador de WhatsApp a Santiago sobre bi-series.


### 2026-10-20T22:07:07.852Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Registrar cierre de B7 tras prueba física del dueño
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T20:52:34.447Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Investigar destello residual B7 y completar QA pendiente en simulador
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T20:14:13.891Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** PR #8 aprobado e integrado en cef5e2e; producción b711d85e verificada con archivos idénticos al build y acceso iOS corregido; documentación y evidencia actualizadas
- **Verificación:** npm test -- --maxWorkers=3: 1050/1050; npm run lint; npm run build; git diff --check; npm run test:http: 117 PASS; Pages SUCCESS y GET de producción
- **Siguiente:** Investigar destello residual B7; reinstalar en iPhone físico y verificar puntos 3, 7 y 9. No cerrar QA físico ni certificar instalación desde acceso/Hoy raíz del 16 Pro sin prueba.


### 2026-10-20T20:11:22.565Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Integrar PR #8 aprobado y verificar producción
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T19:24:48.928Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** QA iOS 16 Pro y SE documentada con matriz y capturas; tres errores tratados en PR #8 sin merge. B7 conserva destello residual; fixes solo en rama 41a36d5 y preview 80386fa5.
- **Verificación:** npm test -- --maxWorkers=3: 1050/1050, 123 archivos; npm run lint; npm run build; git diff --check; npm run test:http: 117 PASS; Safari iOS y PWA con gestos nativos y limites detallados en la matriz.
- **Siguiente:** Revisar PR #8 y destello residual B7. No integrar sin visto bueno nuevo. Probar 3, 7 y 9 en iPhone fisico tras instalacion nueva; no cerrar QA fisico desde el simulador.


### 2026-10-20T14:22:01.660Z | codex | CLAIM
- **Estado:** active
- **Tarea:** QA iOS de sensación nativa
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T13:35:06.732Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Turno reclamado por error y liberado sin cambios: Codex ya había unido los PR #6 y #7 y completado los bloques 1–3 de docs/PLAN-SENSACION-NATIVA.md.
- **Verificación:** npm test; npm run lint; npm run build (sin cambios de código)
- **Siguiente:** Ninguna del plan. Fuera de él: tendencias por ejercicio, valoración de esfuerzo 1–10, rachas y compartir el resumen como imagen; y que el dueño pruebe en su iPhone (Safari e instalada en inicio).


### 2026-10-20T13:32:27.185Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Actualizar el plan de sensación nativa tras unir el PR #6
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T13:32:04.608Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Plan de sensacion nativa completo: PR 6 y 7 integrados con visto bueno; microanimaciones, descanso, resumen y semana. Preview remota verificada; mismo arbol de producto en main.
- **Verificación:** npm test -- --maxWorkers=3: 1048/1048 en 123 archivos; npx tsc -b; npm run lint: 0 avisos; npm run build; git diff --check; npm run test:http: 117 PASS; Chromium 320/375/1024 normal y reducido; QA remota de preview PASS
- **Siguiente:** Ninguna implementacion pendiente del plan; verificar el despliegue canonico tras este push en el mismo turno


### 2026-10-20T13:11:43.591Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Completar bloques 2 y 3 de sensacion nativa sobre PR 6, con pruebas y preview antes de integrar
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T12:56:50.473Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Plan para continuar la sensación de app nativa en docs/PLAN-SENSACION-NATIVA.md. Bloque 1 (transiciones de pantalla, gestos, esqueletos, pantallas de inicio iOS, hover y un solo juego de iconos Lucide) está HECHO en el PR #6 (rama claude/sensacion-nativa), en borrador y SIN unir a main: espera que el dueño lo pruebe en iPhone. Bloques 2 (microanimaciones del entrenamiento) y 3 (celebración e indicador semanal) están especificados con archivos, criterios de aceptación y trampas conocidas.
- **Verificación:** npm test; npm run lint; npm run build; git diff --check (cambio solo de documentación en main)
- **Siguiente:** Codex o Claude Code: 1) con el visto bueno del dueño tras probar la preview https://claude-sensacion-nativa.santiago-fitness-method.pages.dev, unir el PR #6 y publicar; 2) seguir con el Bloque 2 de docs/PLAN-SENSACION-NATIVA.md en una rama nueva desde main ya con el PR #6 unido.


### 2026-10-20T12:30:43.811Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Sensación nativa: transiciones, gestos, skeletons, splash iOS, hover e iconos
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T11:41:49.977Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Pendientes: (1) Borrada la pantalla Coach antigua que ya no estaba en ninguna ruta: src/pantallas/Coach/{Coach,EditorSlot,Coach.test}.tsx y src/aplicacion/useCoach.ts. También quitarSlot/moverSlot/Direccion de src/logica/plantilla.ts (solo los usaba esa pantalla y no entendían de bi-series) y sus pruebas. 28 pruebas menos, todas de código borrado. (2) Comprobar el 304 en producción: no se pudo, la política de red del entorno cloud bloquea santiago-fitness-method.pages.dev y además está detrás de Access.
- **Verificación:** npm test 1030/1030; npx tsc -b; npm run lint 0 avisos; npm run build; git diff --check
- **Siguiente:** El dueño comprueba el 304: /admin en DevTools > Network, segunda petición a /admin/api/v2/clientes con estado 304 tras ~15 s sin cambios.


### 2026-10-20T11:38:15.798Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Pendientes: borrar pantalla Coach antigua y comprobar 304 en producción
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-20T11:24:23.469Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Run de bugs y optimizaciones sobre superseries y panel del coach (revisión de código + verificación). Arreglado: (1) sesión caducada del coach: listar() con pedirSiCambio ya no marcaba el acceso bloqueado; vuelve el aviso 'Tu acceso caducó' (servicio.ts). (2) ETag: comparación débil yaLaTiene() en seguridad.ts para /clientes y /biblioteca; Cloudflare convierte el ETag en W/ al comprimir y el 304 nunca salía en producción. (3) quitar() de una bi-serie: el que queda suelto conserva el descanso del grupo en vez de 120 s. (4) Panel del coach: los pagos ya no se piden cada 15 s; al cambiar de pantalla, al cambiar la lista o cada 2 min (menos lecturas D1). (5) Historial paginado sin copias cuadráticas. Descartados tras verificar: pantalla Coach antigua y plantilla.ts (no se usan en la app), roles.ts (solo planes previos a grupos), guardadas (no existe borrar series).
- **Verificación:** npm test 1058/1058; npx tsc -b; npm run lint 0 avisos; npm run build; git diff --check; npm run test:http 115 PASS
- **Siguiente:** Comprobar en producción que /admin/api/v2/clientes devuelve 304 con If-None-Match W/ (cabeceras en DevTools). Opcional: borrar la pantalla Coach antigua (src/pantallas/Coach) y useCoach si ya no se usan.


### 2026-10-20T11:16:17.277Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Run de bugs y optimizaciones: superseries y panel del coach
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-18T21:07:30.198Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Reducir lecturas D1: el panel del coach solo descarga cuando hay cambios
- **Cambios:** Incidente: produccion supero el limite gratuito diario de lecturas de D1 (6,7 M de 5 M) porque el panel del coach releia la cartera y el historial completos cada 4 s. /clientes responde 304 con una huella barata (etiquetaDeClientes); ServicioCoach guarda la lista y pide el historial desde el ultimo cursor; refresco cada 15 s solo con la pestaña visible, al volver y al cambiar de pantalla. Sin migracion. Ningun dato perdido.
- **Verificación:** npm test (1054); npm run lint; npm run build; npx tsc -b; npm run test:http (117); navegador con runtime local: 304 y cambios incrementales cada 15 s
- **Siguiente:** Tras medianoche UTC comprobar que produccion vuelve a leer y vigilar wrangler d1 insights; luego WhatsApp a Santiago sobre bi-series con visto bueno del dueno


### 2026-10-18T20:54:22.034Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Reducir lecturas D1: el panel del coach solo descarga cuando hay cambios
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-18T20:46:11.497Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Bi-series y tri-series: modelo, editor y entrenamiento
- **Cambios:** Bi-series y tri-series (superseries) en el editor del coach y en el entrenamiento: campo grupo en Slot, unir/separar en EditorPlan, A1->B1 sin descanso y descanso al final de cada ronda. Arreglos de QA: el descanso de la ronda anterior se cierra al empezar la siguiente; el minimo por sesion cuenta ejercicios (>=5) y el maximo bloques (<=8) y ejercicios (<=12), con sesionCompleta() como regla unica. Sin migracion D1.
- **Verificación:** npm test (1050); npm run lint; npm run build; npx tsc -b; npm run test:http (113, en la rama); navegador 375 px con la demo
- **Siguiente:** Enviar a Santiago (con visto bueno del dueno) el WhatsApp con los pasos para unir ejercicios; comprobar en produccion el panel real con una bi-serie


### 2026-10-18T19:02:03.915Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Bi-series y tri-series: modelo, editor y entrenamiento
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-06T21:05:02.489Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Animaciones base: nota de IA sólo sobre la foto IA, aviso de kettlebell en C203 mientras se ve el GIF, y ?v=<sha256[:8]> en cada URL de GIF con prueba que la compara con el archivo
- **Verificación:** npm test (999); npx tsc -b; npm run lint; npm run build; git diff --check
- **Siguiente:** Dueño: revisar C203 en Safari de iOS (no verificado en simulador por carga de la máquina)


### 2026-10-06T19:02:24.817Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Animaciones base: nota IA, aviso de equipo C203 y versión en URL
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-06T01:34:59.390Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Animaciones del catálogo base ($0): 46/57 ejercicios base con GIF de free-exercise-db (Unlicense) en la ficha; C203 con kettlebell y Smith inclinado aprobados por el dueño; C161 y otros 10 unilaterales siguen con foto. Matriz, pendientes y costes en docs/ANIMACIONES-CATALOGO-BASE.md
- **Verificación:** npm test (992); npx tsc -b; npm run lint; npm run build; git diff --check; npm run test:http (108)
- **Siguiente:** Opcional: completar los 11 unilaterales con vídeos de Santiago (formulario del coach) o una API de pago


### 2026-10-06T01:11:39.281Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Animaciones del catálogo base ($0) — preview codex-gifs-base, sin publicar
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-05T13:46:15.485Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Login simple y sesión persistente: el coach con Access vigente (cookie CF_Authorization de COACH_EMAILS) va de / y /entrar a /admin/ (solo redirige); sesión de cliente de 90 días renovable también en /api/v2/contexto; /entrar con Google primero, email plegado sin JS y «Soy el coach». Pasos para subir la sesión de Access a 1 mes en docs/ACCESO.md.
- **Verificación:** npx tsc -b; npm test (987; pasadas previas con timeouts intermitentes por carga alta de la máquina, aislados pasan); npm run lint; npm run build; git diff --check; npm run test:http (108); simulador iOS app instalada (cliente); preview codex-premium-v2
- **Siguiente:** Dueño: subir la duración de sesión de Access a 1 mes y probar en su iPhone (coach y cliente)


### 2026-10-05T12:36:25.115Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Login simple y sesión persistente (coach y cliente); solo preview hasta el sí del dueño
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-05T12:33:20.756Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Gráficas de progreso: pausas de más de 14 días con tramo discontinuo y «3 sem (sin entrenar)», fechas a ambos lados, RIR bajo los puntos de Peso (todos desde 56 px de separación, si no sólo el seleccionado), titular con la comparación de esfuerzo y aria con las pausas. Demo con una pausa de 3 semanas. Umbrales aprobados por el dueño.
- **Verificación:** npx tsc -b; npm test (973; una pasada previa con fallos intermitentes por carga de la máquina, aislados pasan); npm run lint; npm run build; git diff --check; npm run test:http (101); Chromium 320/375/1024 cliente y coach; simulador iOS; preview codex-premium-v2
- **Siguiente:** ninguno; pendiente comprobar en teléfono físico


### 2026-10-05T03:59:28.507Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Gráficas: huecos de tiempo y RIR visible; solo preview hasta el sí del dueño
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-05T03:56:37.426Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Pulido UI fase 3: hojas con apertura (220 ms, 14 px) y cierre (180 ms) animados. usePresencia (cierre único, respaldo, limpieza al desmontar, inmediato con movimiento reducido); HojaCapa une las cuatro hojas del cliente; el <Hoja> del coach usa el mismo controlador sin perder foco, bloqueo, Escape, Atrás ni la cancelación de foto.
- **Verificación:** npx tsc -b; npm test (959); npm run lint; npm run build; git diff --check; npm run test:http (101); QA Chromium real; simulador iOS; preview codex-premium-v2
- **Siguiente:** ninguno (plan de pulido UI completo); pendiente comprobar app instalada y teléfono físico


### 2026-10-05T03:43:17.264Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Pulido UI — fase 3 (hojas con apertura y cierre animados); solo preview codex-premium-v2, sin publicar hasta el sí del dueño
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-05T03:39:52.419Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Pulido UI fase 2 (microinteracciones): respuesta al tocar uniforme en el cliente con --mov-toque (sin campos, deshabilitados ni puntos de la gráfica; nada con movimiento reducido); guardar serie con Guardando (aria-busy), Reintentar tras fallo y valores conservados; medidor de sesión y volumen con scaleX; contadores con tabular-nums.
- **Verificación:** npx tsc -b; npm test (946); npm run lint; npm run build; git diff --check; npm run test:http (101); QA Chrome CPU x4; preview codex-premium-v2
- **Siguiente:** Codex: Pulido UI fase 3 (hojas con apertura y cierre animados), con preview y visto bueno del dueño


### 2026-10-05T02:21:03.535Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Pulido UI — fase 2 (microinteracciones); solo preview codex-premium-v2, sin publicar hasta el sí del dueño
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-05T02:16:23.440Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Pulido UI fase 1 (consistencia visual): tokens de espacios y radios, texto del cliente >= 12 px, grupos de la Biblioteca fijos bajo el buscador, miniaturas con fondo neutro, Comenzar entrenamiento destacado, ficha con jerarquía por la escala, Progreso en tarjetas y Perfil con toque de 44 px. Coach sin cambios salvo Biblioteca y ficha compartidas.
- **Verificación:** npx tsc -b; npm test (944); npm run lint; npm run build; git diff --check; npm run test:http (101); auditoría 320/390/1024; simulador iOS; preview codex-premium-v2
- **Siguiente:** Fase 2 (microinteracciones) solo con el visto bueno del dueño; comprobar app instalada y teléfono físico


### 2026-10-05T01:24:05.399Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Pulido UI — fase 1 (consistencia visual); solo preview codex-premium-v2, sin publicar hasta el sí del dueño
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-05T00:40:02.027Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca: ListaBiblioteca compartida (buscador fijo, Filtrar en hoja con músculo/equipo y Solo mis ejercicios, pastillas quitables, agrupación por músculo, búsqueda por músculo y equipo); el coach abre la ficha del cliente con Editar/Archivar solo en lo propio y vuelve a la ficha tras editar; se quita la rejilla de tarjetas.
- **Verificación:** npx tsc -b; npm test (944); npm run lint; npm run build; npm run test:http (101); navegador 320/375/1024; simulador iOS
- **Siguiente:** ninguno


### 2026-10-05T00:22:40.217Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Biblioteca: fichas en el coach, lista compartida y filtros simples
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-04T19:30:40.506Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Alternativas equivalentes en la ficha como lista de teléfono: 3 filas ordenadas (entrenadas, mismo equipo, nombre), Ver las N alternativas despliega agrupado por equipo; Cambiar variante con actual y plantilla arriba, ya entrenadas y resto agrupado. Nuevo src/logica/alternativas.ts, ListaAlternativas, useEjerciciosEntrenados; filas de 56 px también en Vista previa.
- **Verificación:** npx tsc -b; npm test (928); npm run lint; npm run build; navegador 320/375 px; simulador iOS
- **Siguiente:** ninguno


### 2026-10-04T17:59:43.987Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Alternativas equivalentes en la ficha: lista compacta agrupada por equipo
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-04T17:57:08.727Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Hoja Añadir ejercicio ya no se desplaza de lado en el teléfono: el input de archivo oculto (.solo-lectores) heredaba width 100% de .sfm-field input y desbordaba 25 px; se restaura su tamaño y .sfm-hoja usa overflow-x hidden. Verificado en navegador 375 px y simulador iPhone.
- **Verificación:** npm test (917); npm run lint; npm run build; QA navegador + simulador iOS
- **Siguiente:** Enviar a Santiago el WhatsApp con los pasos para subir vídeos


### 2026-10-04T17:52:52.802Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Hoja Añadir ejercicio: quitar el desplazamiento lateral al hacer scroll en el teléfono
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-04T17:44:59.556Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Vídeo → GIF en el teléfono del coach: elegir vídeo en el formulario, recortar tramo (2-4 s), velocidad normal/lenta, conversión local con gifenc a cuadro vertical 3:4 (360x480) sin recorte; ficha muestra el GIF vertical completo; CSP media-src blob: para la vista previa; arreglo de primer cuadro negro en Safari iOS. Probado en navegador (vídeo horizontal y vertical) y en Safari del simulador iPhone con HEVC.
- **Verificación:** npm test (917); npm run lint; npm run build; QA local navegador + simulador iOS
- **Siguiente:** Que Santiago grabe en vertical y pruebe subir un vídeo corto desde su iPhone


### 2026-10-04T04:09:40.675Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Vídeo → GIF en el teléfono del coach (pruebas fuera de producción; no publicar a main sin el sí del dueño)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-04T03:47:16.852Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** GIF animado en ejercicios del coach: migración 0013 (tabla ejercicios_coach_animacion, repetible) aplicada en staging y producción con respaldo; API PUT/DELETE/GET /biblioteca/<id>/animacion (GIF por firma, 5 MB, sólo coach escribe); panel acepta GIF (primer cuadro como foto fija + GIF aparte, insignia GIF, foto normal quita la animación); ficha anima con respaldo a la foto fija sin conexión y con reducir movimiento. Verificado con GIF real de Push Press (free-exercise-db) y subida desde Fototeca en Safari iOS.
- **Verificación:** npm test (905/905); npm run lint; npx tsc -b; npm run build; npm run test:http (101 PASS); navegador 375 px; simulador iOS
- **Siguiente:** Comprobar 401 en producción; probar fuera de producción la conversión vídeo → GIF en el teléfono; correo a Santiago con el flujo de Ezgif


### 2026-10-04T03:08:46.469Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** GIF animado en ejercicios del coach: subida, miniatura fija y reproducción en la ficha
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-01T03:58:12.807Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Corrección del registro: al publicar c7a280b, la pasada previa de npm test tuvo 1 fallo intermitente en RecorridosDemo («crea con revisión explícita…», 5,7 s) y el commit se publicó porque la cadena de comandos no se detenía ante el fallo. No se reprodujo en 11 pasadas posteriores (2 aisladas, 9 con carga); el error exacto no quedó capturado. Sin cambios de código.
- **Verificación:** npm test x11 (893/893)
- **Siguiente:** Si vuelve a fallar, capturar el mensaje completo de RecorridosDemo antes de tocarlo; borrador del correo a Santiago


### 2026-10-01T03:58:10.450Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Registrar fallo intermitente de RecorridosDemo observado al publicar las gráficas
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-10-01T03:49:32.043Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Pulido de gráficas de progreso: escala ajustada a los valores con mínimo y máximo visibles (25→30 en 20–35), apertura en la sesión más reciente con Peso y Repeticiones desplazándose juntos, y ejercicio inicial = el último entrenado en cliente y coach (chips alfabéticos, elección respetada). Ajuste extra: la etiqueta del último valor ya no cruza la línea del máximo.
- **Verificación:** npm test (893/893, 5 pasadas); npx tsc -b; npm run lint; npm run build; npm run test:http (91 PASS); navegador 375 px; simulador iOS Safari
- **Siguiente:** Borrador del correo a Santiago


### 2026-10-01T03:34:56.054Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Pulido de gráficas: escala, desplazamiento al final y ejercicio más reciente
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-30T21:52:00.354Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Retirados snapshots temporales de QA del árbol versionado; evidencia conservada fuera del repositorio
- **Verificación:** git diff --check; sin cambios de código; gates previos 885 tests y 91 HTTP PASS
- **Siguiente:** Verificar gráfica en demo pública tras concluir Pages; sin cambios pendientes de implementación


### 2026-09-30T21:51:08.606Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Verificar despliegue de gráficas y retirar snapshots temporales de QA
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-30T21:50:52.248Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Gráficas SVG de peso y repeticiones con RIR en Historial y Actividad del coach; demo de tres sesiones; QA local y Safari iOS verificados
- **Verificación:** npm test: 885/885; npx tsc -b; npm run lint; npm run build; npm run test:http: 91 PASS; Chrome 320/375/1024; Safari simulador iOS PASS; git diff --check
- **Siguiente:** Verificar deployment canónico del commit publicado, demo pública y fronteras anónimas


### 2026-09-30T21:37:28.321Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Gráficas de progreso por ejercicio en Historial
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T20:01:14.451Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Detalles de interfaz del QA iPhone: título de hojas opaco, selector de foto propio (Elegir/Cambiar foto, input oculto accesible), contador en singular, estado vacío con ayuda y Quitar filtros, carga por defecto según el equipo mientras no se toque, y Organizar sesiones como botón. Sin cambios en datos.
- **Verificación:** npm test (874/874); npx tsc -b; npm run lint; npm run build; npm run test:http (91 PASS); simulador iOS Safari contra runtime local
- **Siguiente:** Borrador del correo a Santiago


### 2026-09-29T19:54:11.292Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Detalles de interfaz de Biblioteca y editor (QA iPhone)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T19:18:11.568Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Split 5 días: la lista de clientes muestra las sesiones del programa (N sesiones · Programa publicado) en vez de la frecuencia del perfil; el selector de días de Hoy usa rejilla con 5 días o menos (todas visibles, 44 px) y desplazamiento con degradado con 6-7; biblioteca sin cambios. Con 4 días también pasa a rejilla (antes a 320 px se cortaba la cuarta).
- **Verificación:** npm test (868/868); npx tsc -b; npm run lint; npm run build; npm run test:http (91 PASS); navegador 320/375/390 px; simulador iOS Safari
- **Siguiente:** Borrador del correo a Santiago (5 días en el alta, Pasar a 5 días para Angel, archivar duplicados, pregunta sobre ejercicios por tiempo y asistidos)


### 2026-09-29T19:13:22.691Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Split 5 días: sesiones en la lista de clientes y pestañas de días sin desplazamiento
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T19:01:32.327Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Split de 5 días Lower-Upper-Lower-Upper-Lower: plantilla PLANTILLAS_5_DIAS (sin tocar PLANTILLAS_BASE), planBase respeta la frecuencia del alta (regenera sólo si el coach no tocó el plan) y botón «Pasar a 5 días» en Organizar sesiones que conserva ids/ejercicios, añade Lower C y deja el programa por revisar. Cliente: 5 pestañas en una fila desplazable a 320 px. No se tocó el programa de Angel en producción.
- **Verificación:** npm test (866/866); npx tsc -b; npm run lint; npm run build; npm run test:http (91 PASS); navegador 375x812 y 320 px en runtime local
- **Siguiente:** Santiago (o el dueño si lo autoriza) convierte a Angel con Programa → Preparar cambios → Organizar sesiones → Pasar a 5 días; borrador del correo a Santiago


### 2026-09-29T18:55:21.495Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Split de 5 días Lower/Upper: plantilla, alta y conversión en el editor
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T16:17:51.890Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca Maestra de Santiago en PRODUCCIÓN: código con los arreglos del QA desplegado (cc00c9f), ensayo (279 a insertar, repetición 0, originales conservados) y --aplicar: 279 insertadas, 1 ejercicio previo intacto, clientes 8 / rutinas 24 / sesiones 40 sin cambios; M02-045/059/260 verificados en remoto con los datos corregidos. /api/v2/biblioteca y su foto dan 401 sin sesión. Staging corregido con --corregir (4 filas) y preview redesplegado (72af115d). Evidencia en .recovery/ fuera de Git.
- **Verificación:** biblioteca:santiago --staging --corregir; --produccion (ensayo); --produccion --aplicar; consulta remota; curl 401
- **Siguiente:** QA con la sesión del dueño en producción y borrador del correo a Santiago (incluye la pregunta sobre ejercicios por tiempo y asistidos)


### 2026-09-29T16:15:32.821Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Corregir M02 en staging e importar Biblioteca Maestra en producción
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T16:15:25.180Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Arreglos QA de la Biblioteca Maestra: etiquetas unificadas en el dominio, «Lastre añadido» para peso corporal, correcciones M02-045/059/260/261 con --corregir en el importador (sólo filas sin tocar por Santiago), y filtros en pausa con aviso mientras se busca. Corregido en local.
- **Verificación:** npm test (858/858); npx tsc -b; npm run lint; npm run build; npm run test:http (88 PASS); navegador 375x812; simulador iOS (toque real de chip)
- **Siguiente:** Corregir staging, redesplegar preview e importar en producción (autorizado por el dueño)


### 2026-09-29T16:08:12.347Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Arreglos QA Biblioteca Maestra: etiquetas, carga de peso corporal, datos M02 y búsqueda con filtros; luego importación en producción
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T13:55:55.419Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca Maestra de Santiago importada en STAGING: ensayo en copia local (279 a insertar, repetición 0, originales conservados) y --aplicar: 279 insertadas, clientes 2 / rutinas 0 / sesiones 6 sin cambios. Preview codex-premium-v2 redesplegado con el código nuevo (deployment 6638a4ce, commit 4a4de52); sin sesión la API redirige a Access. Producción NO importada: espera el sí del dueño.
- **Verificación:** biblioteca:santiago --staging (ensayo); --staging --aplicar; wrangler pages deploy; curl 302 sin sesión
- **Siguiente:** El dueño revisa en codex-premium-v2 con su sesión; si da el sí, npm run biblioteca:santiago -- --produccion --aplicar, contar filas y comprobar 401 sin sesión; después el correo a Santiago


### 2026-09-29T13:54:48.187Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Importar Biblioteca Maestra de Santiago en staging y redesplegar preview
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T13:54:41.102Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca Maestra de Santiago, código: maquinaDiscos/aductores, 6 fichas fijas a maquinaDiscos, generador (279 importables, 2 ya existen, 2 duplicados), importador idempotente con respaldo y ensayo, ETag/304 en GET /biblioteca, filtros de músculo y equipo. Datos: importado sólo en local (279, repetición 0). Staging y producción pendientes en este mismo encargo.
- **Verificación:** npm test (850/850); npx tsc -b; npm run lint; npm run build; npm run test:http (88 PASS con import local); navegador 375x812 en runtime local
- **Siguiente:** Importar en staging y redesplegar el preview; producción sólo con el sí del dueño


### 2026-09-29T13:40:04.498Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Biblioteca Maestra de Santiago: equipo, aductores, importación y filtros
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T04:20:20.639Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** src/producto/producto.css: (1) header cortado con la app instalada en inicio: index.html usa black-translucent + viewport-fit=cover y la UI sfm no reservaba safe-area-inset-top. Se añade padding-top env(safe-area-inset-top) a .sfm-shell, una franja fija opaca (.sfm-shell::before) que tapa el contenido bajo la barra de estado al hacer scroll, padding superior a .sfm-demo-banner (incluida su regla móvil) y la barra sticky del entrenamiento del cliente se fija en top: env(safe-area-inset-top). (2) Añadir ejercicio centrado: .sfm-primary > svg:first-child sin margin-left:auto. Verificado en Chromium 402x874 sustituyendo env() por 59px: coach/biblioteca, cliente, scroll y entrenamiento sin solapes. Sin probar en iPhone real.
- **Verificación:** npm test 840/840; npm run lint PASS; npm run build PASS
- **Siguiente:** Validar en iPhone con la app instalada en inicio tras el despliegue (Coach, Cliente y entrenamiento)


### 2026-09-29T04:15:54.581Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Centrar Añadir ejercicio y arreglar header cortado en PWA instalada (safe-area)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T04:01:34.038Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca del coach: el anillo de foco del buscador pisaba el botón Añadir ejercicio porque ambos estaban pegados (0px) y el outline tiene 4px de offset. Se añade margin-top de 14px a .sfm-primary + .sfm-search en src/producto/producto.css. Verificado con Playwright/Chromium 390x844 en /demo/coach/biblioteca: separación 14px, anillo sin solape. No probado en Safari/iOS.
- **Verificación:** npm test 840/840 (requirió instalar sqlite3 en el contenedor); npm run lint PASS; npm run build PASS
- **Siguiente:** Comprobar en el iPhone tras el despliegue de Cloudflare. Posible ajuste aparte: el contenido del botón Añadir ejercicio queda alineado a la derecha por .sfm-primary svg { margin-left: auto }


### 2026-09-29T03:55:50.554Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Arreglar foco del buscador que se superpone a Añadir ejercicio en Biblioteca
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T03:37:07.199Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Corregido cierre de Añadir ejercicio al cancelar fotos: Hoja sólo atiende cancel del propio diálogo; conserva borrador, foto anterior y edición. Reproducido antes y validado después en Safari del simulador y Chrome local
- **Verificación:** npm test 840/840 (92 archivos); npm run lint PASS; npm run build PASS; regresión del archivo 12/12; Safari iOS Photo Library Cancel PASS; Playwright Chrome 390x844 y guardado sin foto PASS; git diff --check PASS; avisos conocidos Node/JSDOM
- **Siguiente:** Comprobar Cloudflare Pages sirve este commit y repetir la cancelación en la demo publicada


### 2026-09-29T03:27:15.131Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Corregir cierre del formulario Añadir ejercicio al cancelar el selector de fotos y preservar su borrador
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T03:24:32.459Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Archivado mensaje 02 de Santiago: Biblioteca Maestra, 5 imágenes originales trasladadas de Downloads al proyecto, transcripción completa y CSV de 283 entradas en 12 grupos; índice compartido actualizado
- **Verificación:** SHA-256, enlaces y traslado de 5 originales PASS; 283 entradas y 12 grupos verificados; npm test 837/837 en 92 archivos; npm run lint PASS; npm run build PASS; git diff --check PASS; avisos conocidos Node/JSDOM
- **Siguiente:** Recibir nuevos mensajes o la tarea concreta de análisis o implementación del dueño


### 2026-09-29T03:20:57.885Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Archivar mensaje 02 de Santiago: biblioteca maestra, transcripción de cinco páginas y traslado de originales al proyecto local
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T03:17:40.965Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Archivado mensaje 01 de Santiago: cinco imágenes originales verificadas, transcripción completa, manifiesto SHA-256 e índice compartido; referencias en AGENTS.md y CLAUDE.md; sin cambios en aplicación ni docs/cliente
- **Verificación:** QA copias SHA-256 y enlaces PASS; npm test 837/837 (92 archivos), avisos conocidos Node/JSDOM; npm run lint PASS; npm run build PASS; git diff --check PASS
- **Siguiente:** Incorporar los siguientes mensajes cuando el dueño los entregue; consultar el informe al planificar futuras tareas


### 2026-09-29T03:14:46.925Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Registrar el mensaje 01 de Santiago con sus cinco imágenes, transcripción y referencias compartidas para Codex y Claude Code
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T03:11:52.659Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Arreglos del QA de la biblioteca: (1) EditorPlan muestra la etiqueta del equipo (Barra libre, Máquina de pesas) en vez de la clave interna, y el buscador también encuentra por esa etiqueta; (2) HojaEjercicio bloquea crear o editar un ejercicio con el nombre de otro de la biblioteca (comparación sin acentos, mayúsculas ni espacios sobrantes, excluyendo el propio al editar; los archivados no cuentan) con el aviso «Ya hay un ejercicio llamado «X». Cambia el nombre; por ejemplo, añade la máquina o el agarre.». Sólo interfaz; no se tocó servidor, API, D1 ni docs/cliente. Una prueba previa creaba desde el catálogo «Press de banca plano con barra», que ya existe entre las fichas fijas, y se cambió a «Goblet squat» porque la nueva regla la bloquea correctamente. La regla no protege contra duplicados creados a la vez desde dos dispositivos ni contra la API directa.
- **Verificación:** npm test (837/837); npm run lint; npx tsc -b; npm run build; navegador 375x812 en /demo/coach
- **Siguiente:** QA autenticado con la sesión del dueño


### 2026-09-29T03:09:21.727Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Arreglos QA biblioteca: etiqueta de equipo en EditorPlan y nombres repetidos
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T03:04:46.828Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** QA del último build (biblioteca del coach). Producción sirve main (deploy aaeeb52b, dcbc7d2; antes b5e933ba/1629cf4) y ya incluye «Añadir ejercicio». Local: 832/832 pruebas en 92 archivos, tsc, lint, build y 82/82 comprobaciones HTTP (runtime local con datos sintéticos). Remoto sin sesión: /entrar 200, /api/v2/biblioteca y /api/v2/contexto 401, /admin 302 a Access; preview 57f66b28 todo tras Access. Demo pública de producción a 375x812: Biblioteca → Añadir ejercicio → De mi catálogo (buscar «hack») → formulario → guardar; aparece con «Tuyo», editar/archivar; entra en el editor del plan, se publica y se ve en Vista previa con su ficha; sin errores de consola. Hallazgos: (1) el editor del plan muestra el equipo con su clave interna (barraLibre, maquinaTradicional) en src/producto/EditorPlan.tsx:285, existente desde v2; (2) se puede crear un ejercicio con el mismo nombre que uno de la biblioteca (Hack squat) sin aviso. No probado: panel real autenticado en staging/producción, foto real y sincronización al teléfono de un cliente real.
- **Verificación:** npm test; npm run lint; npx tsc -b; npm run build; npm run test:http; navegador demo producción 375x812
- **Siguiente:** Arreglar la etiqueta de equipo en EditorPlan; decidir si avisar de nombres duplicados; QA autenticado con la sesión de Access del dueño (staging: crear ejercicio con foto; producción: solo lectura)


### 2026-09-29T03:00:18.395Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** QA del último build: preview staging 57f66b28 (b7a0686) y producción, biblioteca del coach
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T02:53:12.802Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Preview de staging desplegado: https://codex-premium-v2.santiago-fitness-method.pages.dev (deployment 57f66b28, commit b7a0686), con la D1 santiago-staging que ya tiene 0012. Comprobado desde fuera: /api/v2/biblioteca, /api/v2/biblioteca/<id>/foto y /admin/api/v2/biblioteca redirigen (302) a Cloudflare Access; el alias sirve /ejercicios/sin-foto.svg (200). No se pudo probar la API autenticada: requiere la sesión de Access del dueño y no se usan JWT locales contra el remoto.
- **Verificación:** npm run build; wrangler pages deploy (rama codex-premium-v2); curl sin sesión al alias y al deployment
- **Siguiente:** El dueño entra al preview con su sesión de Access, abre /admin/biblioteca, crea un ejercicio con foto y verifica que GET /api/v2/biblioteca lo devuelve; luego el segundo correo a Santiago


### 2026-09-29T02:52:39.443Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Desplegar preview de staging (codex-premium-v2) y probar /api/v2/biblioteca
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T02:51:50.746Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Migración 0012_biblioteca_coach aplicada en PRODUCCIÓN (santiago-acceso, 7cb38489…) con npm run d1:v2 -- --produccion --aplicar, tras respaldo y ensayo de restauración con repetición idempotente OK. Verificado en remoto: existen ejercicios_coach y su índice, 0 filas, entorno_sfm=production; clientes 8, rutinas 24, sesiones 40, invitaciones 17 (idénticos al manifiesto previo). Desde fuera: /api/v2/biblioteca y /api/v2/biblioteca/<id>/foto responden 401 sin sesión; /admin/api/v2/biblioteca redirige (302) a Cloudflare Access. Con esto GET /biblioteca ya no falla en producción. Evidencia en .recovery/migracion-production-1790650244589 (fuera de Git). Pendiente: preview de staging (wrangler pages deploy denegado antes) y el segundo correo a Santiago.
- **Verificación:** d1:v2 --produccion --aplicar; consulta remota de verificación; curl 401/302 sin sesión
- **Siguiente:** Probar en producción con la sesión del coach que Biblioteca carga sin error (lo puede hacer Santiago o el dueño); desplegar preview de staging si se quiere probar allí; redactar el segundo correo a Santiago


### 2026-09-29T02:50:43.046Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Aplicar migración 0012 (ejercicios_coach) en producción con respaldo
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T02:45:55.312Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Migración 0012_biblioteca_coach aplicada en STAGING (santiago-staging, 747a9348…) con npm run d1:v2 -- --staging --aplicar: respaldo local, ensayo de restauración y repetición idempotente OK, tablas originales conservadas (clientes 2, rutinas 0, sesiones 6, invitaciones 4, sin cambios). Verificado en remoto: existen ejercicios_coach y su índice, 0 filas, entorno_sfm=staging. Evidencia en .recovery/migracion-staging-1790649890984 (fuera de Git). No se tocó producción ni se desplegó código a staging.
- **Verificación:** d1:v2 --staging (ensayo); d1:v2 --staging --aplicar; consulta remota de verificación
- **Siguiente:** Desplegar el código a staging (preview) y probar /api/v2/biblioteca; luego migración 0012 con respaldo en producción y despliegue


### 2026-09-29T02:44:10.882Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Aplicar migración 0012 (ejercicios_coach) en staging con respaldo
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T02:40:00.708Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Prueba en simulador iOS de la biblioteca del coach: en Safari (QA iPhone 16 Pro, runtime local real) se crea un ejercicio con equipo y músculo y se sube una foto desde Photo Library; llega comprimida (JPEG 850x567, 75 KB) a R2 y se sirve como image/jpeg. Take Photo aparece en el selector pero la cámara no existe en el simulador. Ajuste menor: las tarjetas de la Biblioteca del coach muestran la etiqueta del equipo (Barra libre) en vez de la clave (barraLibre). La respuesta a Santiago ya la envió el dueño el 2026-09-29.
- **Verificación:** npm test (832/832); npm run lint; npm run build; tsc -b; simulador iOS
- **Siguiente:** Migración 0012 con respaldo en staging y producción (npm run d1:v2), despliegue, comprobar 401 en /api/v2/biblioteca, y luego el segundo correo a Santiago con los pasos Biblioteca → Añadir ejercicio


### 2026-09-29T02:34:28.427Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Biblioteca del coach: prueba en simulador iOS (foto) y borrador de respuesta a Santiago
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T02:32:28.236Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca del coach, fase 3 (app del cliente): ConexionCloud.actualizarBiblioteca pide GET /biblioteca (máx. 1 vez/min dentro de sincronizar, validado con zod) y guarda en Dexie vía src/nube/biblioteca.ts, conservando la calibración del cliente y los archivados; sin red conserva lo último. Foto en /api/v1|v2/biblioteca/<id>/foto?v=; el service worker la cachea por URL para uso offline. Vista previa del coach, Cliente.tsx (ContextoBiblioteca desde Dexie) y docs (BIBLIOTECA-AMPLIACION-UNILATERAL: bloque B genérico, fotos a respaldo). Verificado en runtime local real a 375x812: coach crea desde catálogo con foto, lo usa en una rutina publicada (plan aceptado), Vista previa y app real del cliente muestran el ejercicio con su foto. Falta simulador iOS y aplicar 0012 en staging/producción.
- **Verificación:** npm test (832/832); npm run lint; npm run build; tsc -b; navegador local real 375x812
- **Siguiente:** Simulador iOS (foto desde cámara/galería de Safari), migración 0012 con respaldo en staging y producción con npm run d1:v2, despliegue y comprobar 401 en /api/v2/biblioteca; borrador de respuesta a Santiago


### 2026-09-29T02:26:24.517Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Biblioteca del coach fase 3: app del cliente sincroniza GET /biblioteca a Dexie
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T02:24:59.576Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** graphify-out/ añadido a .gitignore (mapa local de la herramienta graphify, nunca al repo). AVISO: hay un test intermitente — 1 fallo en 828 en una ejecución completa, luego 3 ejecuciones seguidas en verde; ya ocurrió antes (27-sep). No se pudo identificar cuál; conviene correr la suite con --reporter=verbose varias veces para encontrarlo.
- **Verificación:** npm test (1 fallo intermitente, luego 828/828 x3); npm run lint; npm run build; git check-ignore graphify-out/
- **Siguiente:** Localizar el test intermitente. Continuar fase 3 de la biblioteca del coach.


### 2026-09-29T02:22:56.821Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Añadir graphify-out/ a .gitignore
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T02:22:46.916Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca del coach, fase 2 (panel del coach): servicioBiblioteca (rama real con ClienteApi/subirArchivo y rama demo en memoria), contexto ContextoBiblioteca cargado junto a los clientes, Biblioteca → Añadir ejercicio (De mi catálogo con 293 fichas de shared/catalogo-pdf.ts generado desde el CSV, o Nuevo), insignia Tuyo, editar y archivar, y EditorPlan/Onboarding/Progreso/Importaciones leen la biblioteca combinada. El cliente de la demo también ve los ejercicios del coach. Demo verificada en navegador a 375x812 (crear desde catálogo, aparece en el editor con Tuyo). La foto real aún no se probó en simulador iOS.
- **Verificación:** npm test (828/828); npm run lint; npm run build; tsc -b; navegador 375x812 en demo
- **Siguiente:** Fase 3: ConexionCloud.preparar/sincronizar piden GET /biblioteca y guardan con guardarEjercicio; luego simulador iOS (subir foto), prueba con runtime local real y migración 0012 con respaldo en staging/producción


### 2026-09-29T02:13:39.087Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Biblioteca del coach fase 2: panel del coach (servicioBiblioteca, contexto, hoja Añadir ejercicio, EditorPlan)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T02:12:38.629Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca del coach, fase 1 (servidor y datos): migración 0012_biblioteca_coach (tabla ejercicios_coach) registrada en pruebas-v2/d1.ts, preparar-qa-v2 y migrar-v2; esquema zod EjercicioCoach en shared/v2/biblioteca.ts; API GET/POST /biblioteca, PATCH /biblioteca/<id> (editar/archivar), PUT y GET /biblioteca/<id>/foto (R2, reutiliza leerFotoValidada extraída de medios.ts); EjercicioId acepta coach-ej-<uuid>; aplicar() rechaza con 400 ids coach-ej inexistentes o archivados; evaluarEstadoProgramacion acepta ids del coach. PATCH parcial no rellena defaults (bug atrapado por test). La migración NO está aplicada en staging ni producción.
- **Verificación:** npm test (815/815); npm run lint; npm run build; npm run test:http (82 PASS, local)
- **Siguiente:** Fase 2: panel del coach (servicioBiblioteca, contexto BibliotecaCoach, hoja Añadir ejercicio, EditorPlan). Antes de desplegar: aplicar 0012 con respaldo en staging y producción con npm run d1:v2


### 2026-09-29T02:07:18.049Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Biblioteca del coach fase 1: servidor y datos (migración 0012, API /biblioteca, validación de ids)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-29T02:05:43.296Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Recreadas 12 fotos IA a partir de referencias visuales reales; procedencia y fichas coherentes con los equipos
- **Verificación:** npm test: 799/799; npm run lint PASS; npm run build PASS; 14 JPG 850x567 <100 KB; revision visual individual
- **Siguiente:** ninguno


### 2026-09-28T19:53:30.192Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Rehacer las 12 fotos IA de ejercicios con referencias visuales reales y verificación biomecánica
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-28T13:46:41.305Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca 46→57: diez unilaterales genéricos y C071; 14 JPG fieles 850x567 <100KB, tres provisionales corregidas, procedencia/licencias/prompts y etiqueta IA; manifest y documentación actualizados
- **Verificación:** npm test: 799/799 (87 archivos); npm run lint PASS; npm run build PASS; QA Chrome local 390x844 y 1280x900: 14 fichas y fotos, etiquetas IA, sin errores; JPG dimensiones/tamaño PASS; docs/cliente intacto
- **Siguiente:** ninguno


### 2026-09-28T13:34:03.294Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Completar fotos fieles de 13 ejercicios y activar 10 unilaterales genéricos
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-27T16:24:35.465Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Guía dinámica publicada en guia-santiago-fitness.pages.dev (fuente fuera del repo). Clientes Ivan y Cliente nuevo archivados a petición del dueño (Santiago lo archivó el dueño). Correo a Santiago en borrador, no enviado.
- **Verificación:** npm test; npm run lint; npm run build; curl guía
- **Siguiente:** Dueño revisa guía y borrador del correo; enviar cuando lo apruebe.


### 2026-09-27T16:23:53.446Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Registrar guía dinámica para Santiago y archivado de clientes de prueba
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-27T04:03:36.679Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Onboarding del coach en producción: recorrido de 4 pasos al abrir el panel real, siempre visible y con Saltar; repetible desde Ayuda. Antes la bienvenida sólo salía con cero clientes.
- **Verificación:** npm test 799/799; npx tsc -b; npm run lint; npm run build; navegador 375x812 panel real local
- **Siguiente:** Santiago entra en /admin y ve el recorrido. Esperar respuestas del bloque B.


### 2026-09-27T03:58:28.147Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Onboarding del coach en producción: recorrido de 4 pasos en el primer acceso
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-27T03:54:55.581Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Alta de cliente con Google verificada en producción de punta a punta (invitación → Google → cuenta con google_sub → sesión → app). Cliente de prueba archivado. Sin cambios de código.
- **Verificación:** npm test; npm run lint; npm run build; D1 lectura; navegador
- **Siguiente:** Ninguno para SSO. Esperar respuestas del bloque B.


### 2026-09-27T03:54:25.389Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Registrar prueba de SSO de cliente en producción
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-27T03:39:32.632Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Google SSO del coach en /admin activo vía Cloudflare Access (configurado por el dueño, verificado desde fuera y probado por el dueño). OTP sigue de respaldo. Sin cambios de código.
- **Verificación:** npm test; npm run lint; npm run build; curl a Access y Google
- **Siguiente:** Santiago prueba entrar con Google en /admin. Esperar respuestas del bloque B.


### 2026-09-27T03:39:03.031Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Registrar Google SSO del coach en /admin
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-27T03:14:09.968Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Bloque B del cuestionario (12 preguntas que desbloquean unilaterales) publicado en sfm-variantes.pages.dev y enviado a Santiago por correo. API acepta A y B. Una respuesta de prueba enviada por error a producción fue borrada (sólo esa fila); queda sólo la respuesta real del bloque A.
- **Verificación:** npm test; npm run lint; npm run build; curl sitio y API del cuestionario
- **Siguiente:** Esperar respuestas del bloque B en D1 sfm-variantes y aplicar.


### 2026-09-27T03:13:39.704Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Registrar envío del bloque B del cuestionario a Santiago
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-27T03:06:33.110Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca ampliada según el correo de Santiago: 33 → 46 fichas (prensa 45°, prensa unilateral y 11 unilaterales) con ids sfm-catalog-cNNN, fotos de dominio público y estimados anotados. Quedan fuera 14 unilaterales con motivo (sin foto fiel o preguntas B abiertas) en docs/BIBLIOTECA-AMPLIACION-UNILATERAL.md. Manifest 3B.1 marca las 13 activas y los tests lo exigen.
- **Verificación:** npm test 791/791 (85 archivos); npx tsc -b; npm run lint; npm run build; navegador 375x812 demo Biblioteca y ficha de prensa
- **Siguiente:** Mandar a Santiago las preguntas B que desbloquean el resto de unilaterales (B9, B12-13, B17-18, B22, B25, B27, B30, B33, B36-37) y confirmar estimados/fotos provisionales.


### 2026-09-27T02:57:14.707Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Ampliar biblioteca con unilaterales y prensa 45° según el correo de Santiago
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-27T02:48:47.359Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Respuestas de Santiago leídas y registradas (A1 barra V; A5 pendiente; 9 genéricos) en BIBLIOTECA-FASE-3A-MAPPING-33.csv. A1 aplicado sin cambiar id. Cuadro pedido por el coach: en Hoy cada ejercicio abre su ficha; en el editor del coach, miniaturas. Google: correos de COACH_EMAILS sin cuenta de cliente se redirigen a /admin/ (sin sesión). Login del coach con Google en /admin requiere que el dueño añada Google como método en Cloudflare Access.
- **Verificación:** npm test 788/788 (85 archivos); npx tsc -b; npm run lint; npm run build; git diff --check; navegador 375x812 demo cliente y coach
- **Siguiente:** Dueño: añadir Google en Cloudflare Access (pasos en el chat). Siguiente trabajo: ampliar biblioteca con unilaterales y prensa 45° según el correo de Santiago.


### 2026-09-27T02:40:51.639Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Google: redirigir correos del coach a /admin; A1 tríceps barra V; cuadro para que el cliente vea el ejercicio
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-27T02:18:56.330Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Stripe pasa al roadmap por decisión del dueño (2026-09-27). Código de fases 3-5 en producción y apagado: webhook 404, pagar 503, nadie bloqueado; tablas vacías. Estado y pasos para retomarlo al inicio de docs/SUSCRIPCIONES.md. Sin cambios de código.
- **Verificación:** npm test; npm run lint; npm run build
- **Siguiente:** Ninguno para Stripe. Pendiente abierto de Codex: diagnóstico del acceso con Google en producción (el dueño debe indicar en qué paso falló).


### 2026-09-27T02:17:38.375Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Pasar Stripe al roadmap: documentar estado apagado y siguientes pasos
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-27T00:25:23.132Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** SSO Google investigado: OAuth y cuenta QA funcionan; producción tiene una cuenta con contraseña sin Google vinculado y sin invitaciones vigentes. Diagnóstico y pasos documentados en HANDOFF y BUILD_LOG.
- **Verificación:** npm test 784/784; npm run lint; npm run build; git diff --check; QA OAuth positivo en staging
- **Siguiente:** Dueño: indicar en qué paso falló y si el correo Google coincide con el de su cuenta. Si coincide, entrar con contraseña y enlazar desde Perfil; si es cliente nuevo, usar invitación. Claude puede retomar con estos registros.


### 2026-09-27T00:20:14.432Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Diagnosticar y corregir SSO Google de clientes en producción
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T23:25:54.998Z | claude-code | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Fases 4 y 5 completas con Stripe apagado. Fase 4: 402 en escrituras del cliente sin acceso sólo con Stripe encendido (bloqueoPorSuscripcion); la cola del cliente conserva lo pendiente y sigue recibiendo cambios del coach; app del cliente con aviso de gracia, tarjeta de solo lectura, Comenzar bloqueado, /entrenar redirige, Mi suscripción en perfil, espera del webhook tras pagar. Fase 5: insignias y filtro Pagos pendientes en la lista, tarjeta Pagos en Hoy, pestaña Pago en la ficha (plan, enlace de pago, pausar/reanudar, cancelar/mantener, exento), demo con datos ficticios. AVISO: al encender STRIPE_HABILITADO todo cliente sin suscripción pasa a solo lectura; antes, marcar exentos o mandar enlaces (docs/SUSCRIPCIONES.md).
- **Verificación:** npm test 784/784 (84 archivos); npm run test:coverage 72.92/65.24/70.46/74.94; npx tsc -b; npm run lint; npm run build; git diff --check; npm run test:http 66/66; navegador 375x812 cliente local con claves Stripe falsas y demo del coach
- **Siguiente:** Dueño: pasos 1-6 de docs/SUSCRIPCIONES.md y marcar exentos antes de encender. Después: prueba de pago real en modo prueba con tarjeta 4242 y test clock para gracia y vencimiento.


### 2026-09-26T23:11:01.416Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Fases 4 y 5: solo lectura del cliente y pestaña Suscripción del coach
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T22:57:15.588Z | claude-code | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Fase 3 backend de Stripe en modo prueba, apagada hasta tener secretos. Nuevo: migrations/0011_suscripciones.sql (aplicada con respaldo en staging y producción; prod 6 clientes, 0 cuentas, 0 suscripciones), functions/lib/suscripcion.ts (regla de acceso: activa/gracia 7 días/vencida/pausada/sin_suscripcion/exenta), functions/lib/stripe.ts (SDK stripe@22: Checkout, portal, pausar/reanudar/cancelar/mantener, exento, precios; webhook firmado que relee la suscripción en Stripe, idempotente y sin reasignar clientes), functions/lib/v2/suscripcionApi.ts (rutas cliente y coach) y POST /api/stripe/webhook antes del filtro de origen. Falla cerrado: sin STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET el webhook da 404 y los pagos 503; sk_live_ rechazada sin STRIPE_MODO_REAL=true; producción exige STRIPE_HABILITADO=true. Sin interfaz todavía (fases 4 y 5). La cobertura ya estaba bajo el suelo en f482979 (71.22%); ahora 72.17/64.56/69.61/74.21. Pasos del dueño en docs/SUSCRIPCIONES.md.
- **Verificación:** npm test 768/768 (81 archivos); npm run test:coverage PASS; npm run lint; npx tsc -b; npm run build; git diff --check; npm run test:http 66/66 local; d1:v2 staging y produccion ensayo + aplicar
- **Siguiente:** Dueño: pasos 1-6 de docs/SUSCRIPCIONES.md (cuenta Stripe test, precio mensual, portal, webhook, secretos en producción). Agentes: fase 4 (solo lectura en app del cliente) y fase 5 (pestaña Suscripción del coach) pueden empezar ya con Stripe apagado.


### 2026-09-26T22:40:56.456Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Fase 3: Stripe en modo prueba (suscripciones, webhook, API cliente y coach) con Stripe simulado; apagado sin secretos
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T22:37:18.524Z | claude-code | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Verificado producción tras fases 1-2 (commit 1a11169/f482979): / -> /entrar 302, /entrar 200 con CSP default-src none y no-store, /auth/google 302 a Google, retorno y /access falsos 401, /admin/ 302 a Access, /api/v2/inicio 401, demo y presentacion 200. Corregido el hallazgo de Codex: el perfil ya no ofrece 'Conectar Google' si la cuenta tiene google_sub; el contexto del cliente expone googleVinculado (seguridad.ts, contratos.ts, Cliente.tsx) con prueba de regresión en google.test.ts. Fase 3 (Stripe modo prueba) BLOQUEADA hasta que el dueño cree la cuenta de Stripe, el producto y el precio mensual en modo prueba y cargue STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET como secretos de Pages en preview.
- **Verificación:** npm test 749/749; npm run lint; npx tsc -b; npm run build; npm run test:http 53/53 local; curl producción
- **Siguiente:** Dueño: cuenta Stripe en modo prueba + precio mensual + secretos en preview. Después Claude Code o Codex implementan fase 3.


### 2026-09-26T22:33:53.636Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Verificar producción tras fases 1-2, corregir enlace Google redundante en perfil y preparar fase 3 (Stripe modo prueba)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T22:27:04.579Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Google OAuth configurado en Cloudflare preview y produccion; alta y reingreso Google verificados en staging; rutas publicas y fallo cerrado verificados en produccion; docs/HANDOFF.md y docs/BUILD_LOG.md actualizados
- **Verificación:** npm test 749/749; npm run lint PASS; npm run build PASS; git diff --check PASS; QA Chrome staging; curl y D1 lectura produccion
- **Siguiente:** Confirmar correo de soporte y Branding/privacidad de Google; corregir enlace de perfil redundante; continuar Stripe solo en modo prueba segun plan


### 2026-09-26T22:19:24.712Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Completar QA real de Google OAuth con invitacion sintetica y preparar activacion
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T22:18:51.000Z | codex | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Google Cloud OAuth creado; secretos solo en preview; preview desplegado; QA real llego hasta retorno con cuenta no vinculada; docs/BUILD_LOG.md y handoff actualizados
- **Verificación:** npm test 749/749; npm run lint PASS; npm run build PASS; preview Chrome Access y Google hasta retorno
- **Siguiente:** Claude Code: probar alta con invitacion sintetica en staging, resolver boton de invitacion deshabilitado, verificar sesion Google; luego configurar produccion con gate habilitado solo tras QA


### 2026-09-26T22:13:58.054Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Configurar y verificar Google OAuth en Cloudflare Pages
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T21:57:26.154Z | codex | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Corregidas rutas anidadas de Google en Cloudflare Pages; dominio canónico confirma respuesta cerrada 401; Google continúa apagado hasta configurar secretos y probar preview
- **Verificación:** npm test 749/749; npm run lint; npm run build; npm run test:http 53/53; GET producción /auth/google y /auth/google/retorno 401
- **Siguiente:** Configurar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en preview, URI OAuth del alias y acceso a preview; completar prueba real, después activar producción con GOOGLE_HABILITADO=true


### 2026-09-26T21:56:10.554Z | codex | ADOPT
- **Estado:** active
- **Tarea:** Corregir rutas anidadas de Google en Pages tras QA de producción
- **Cambios adoptados:** functions/auth/
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-09-26T21:54:26.230Z | codex | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Google OAuth preparado con PKCE, state, nonce y vinculación autenticada; corregida validación de sesiones antiguas; Google queda apagado por falta de secretos y prueba real
- **Verificación:** npm test 749/749; npm run lint; npm run build; npm run test:http 52/52; JWKS local firmado; preview codex-google-fase2
- **Siguiente:** Dueño: configurar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en preview, autorizar la URI del alias y facilitar sesión Access para QA; después verificar Google real y activar producción con GOOGLE_HABILITADO=true


### 2026-09-26T21:42:12.504Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Fase 2 del plan de cuentas: acceso con Google OAuth y PKCE
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T21:40:00.526Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Fase 1: cuentas invitadas con email y contraseña, recuperación de un uso, sesiones renovables y migración 0010 aplicada en staging y producción
- **Verificación:** npm test 744/744; npm run lint; npm run build; npm run test:http 49/49 dos veces; migraciones staging y producción ensayadas y aplicadas
- **Siguiente:** Fase 2: Google OAuth; validar flujo remoto con sesión autorizada y confirmar exclusión de Access para rutas públicas de preview


### 2026-09-26T21:20:54.746Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Fase 1 del plan de cuentas: email y contraseña, restablecimiento y sesiones renovables
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T05:25:24.680Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Copiar invitación: el aviso 'Invitación copiada.' salía arriba de la ficha, 264 px fuera de la pantalla en móvil, y si el navegador negaba el portapapeles no pasaba nada (NotAllowedError sin capturar, reproducido en producción). Nuevo src/producto/CopiarInvitacion.tsx: el botón cambia a 'Copiada' y confirma debajo durante 4 s; si falla o no hay API, selecciona el enlace y explica cómo copiarlo a mano. 3 tests nuevos (CopiarInvitacion.test.tsx). Verificado en navegador a 375x812 con build local (éxito y fallo). PREGUNTA ABIERTA para el dueño: la sesión del cliente dura 7 días fijos sin renovarse (functions/lib/sesion.ts VIDA_DE_SESION); a la semana necesita una invitación nueva. No se cambió: es decisión de producto/seguridad.
- **Verificación:** npm test (740/76); npm run lint; npx tsc -b; npm run build; npm run test:http (35/35, runtime local)
- **Siguiente:** Decidir con el dueño si la sesión del cliente debe renovarse al usarla. Santiago entra en /admin.


### 2026-09-26T05:21:00.779Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Copiar invitación: confirmación visible junto al botón y alternativa cuando el portapapeles falla
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T05:08:32.484Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** El dueño añadió saangelm50@gmail.com a la política Allow 'Cliente y coach' de la app de Access 'Santiago Fitness Method' (2026-09-26). Con COACH_EMAILS de ff66dba (desplegado en producción), Santiago ya puede entrar en /admin. Comprobado desde fuera: / /demo/* /presentacion 200, /admin/ 302 a Access, /api/v2/inicio 401. Safari de iOS (simulador) recorrió la demo de producción completa sin fallos de la app.
- **Verificación:** curl de límites en producción; wrangler pages deployment list (ff66dba en Production)
- **Siguiente:** Santiago entra en /admin y prepara invitaciones para sus clientes. Esperar respuestas del cuestionario (D1 sfm-variantes) para el punto 3.


### 2026-09-26T05:08:30.250Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Registrar que Santiago ya tiene acceso de coach en producción
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T03:10:21.288Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Santiago (saangelm50@gmail.com) añadido a COACH_EMAILS de producción en wrangler.toml. Staging sin cambios. Falta que el dueño añada el correo a la política Allow de la app de Cloudflare Access 'Santiago Fitness Method' para que Santiago pase el OTP.
- **Verificación:** npm test (737); npm run lint; npm run build
- **Siguiente:** Dueño: añadir saangelm50@gmail.com a la política de Access. Luego Santiago entra en /admin.


### 2026-09-26T03:09:11.866Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Autorizar a Santiago como coach (COACH_EMAILS) y probar producción en Safari de iOS
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-26T02:39:14.736Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Retomado el turno parado de codex. Recorrido de la app como coach y cliente reales (runtime local) y en la demo de produccion: cinco fallos arreglados (el 7 oculto al elegir dias en el alta, Fotos compartidas cortado, vacio de Actividad con la voz del cliente, plural con uno en las cifras, bienvenida de la demo que decia primer cliente con tres). Produccion sana pero SIN USO desde v2: 0 entrenamientos, 0 cambios de usuarios (los 12 son de la migracion), 0 sesiones vigentes, ultima invitacion canjeada el 4 de septiembre
- **Verificación:** npm test 737/75; tsc -b; lint; build; test:http 35/35; test:movil 34/34; verificado en pantalla a 375 y 320 con cuentas sinteticas
- **Siguiente:** Punto 4 a medias: el correo de Santiago es saangelm50@gmail.com. Anadirlo a COACH_EMAILS de produccion en wrangler.toml lo bloqueo el clasificador de permisos por ser una concesion de acceso; lo debe aplicar el dueno, y ademas anadirlo a la politica de Cloudflare Access de la app. Sin eso Santiago no puede entrar a /admin y la app sigue sin uso real


### 2026-09-26T01:07:44.724Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** Retomar el turno de codex (parado desde el 17): revisar el repositorio y el estado de la app en producción
- **Cambios adoptados:** docs/HANDOFF.md
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-09-17T20:23:16.117Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Retomar punto 2: validar ayuda real en Safari/PWA del simulador y verificar publicacion
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-17T03:02:32.093Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** La flecha arriba-derecha dejaba de ser glifo de texto en Safari de iPhone y salia como emoji azul en Ver ejercicio y Ya tengo acceso. Selector de variacion U+FE0E en las seis apariciones, espacio irrompible, span aria-hidden en la presentacion para limpiar el nombre accesible, y flecha como texto en el chip del entrenamiento porque su CSS posiciona en absoluto cualquier span descendiente
- **Verificación:** npm test 734/74; tsc -b; lint; build; Safari real del simulador iOS 27 en presentacion y entrenamiento; glifos.test.ts comprobado que sabe fallar
- **Siguiente:** Aviso util: servir-qa-v2.mjs copia dist una sola vez al arrancar y nunca limpia, asi que tras reconstruir hay que reiniciar qa:servir o se sirve el build anterior. Sigue pendiente Safari fisico, VoiceOver y offline


### 2026-09-17T02:41:06.205Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Forzar presentación de texto en la flecha ↗, que iOS pinta como emoji azul
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-17T02:33:38.472Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Adoptada y completada la ayuda contextual para cuentas reales que dejo codex sin terminar: se corrigio el test que chocaba con la nueva redaccion unificada del alta y se anadio AyudaReal.test.tsx con la QA que faltaba (persistencia, aislamiento entre cuentas, almacenamiento corrupto o bloqueado, historial previo y frontera de Vista previa)
- **Verificación:** npm test 733/73; tsc -b; lint; build; test:http 35/35; navegador movil 375 y escritorio 1280 con cuentas sinteticas locales
- **Siguiente:** Pendiente: Safari real de iPhone y PWA instalada PARA ESTA FUNCION (la validacion de Xcode del 16 es anterior a estos cambios); VoiceOver; offline. Puntos 3-4 siguen aplazados por el dueno. Recordatorio: el JWT del fixture local dura 24 h; si test:http da 401 Coach firmado, repreparar y reiniciar el runtime antes de sospechar del codigo


### 2026-09-17T02:25:55.427Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** Adoptar la ayuda contextual para cuentas reales de codex y completar su QA pendiente
- **Cambios adoptados:** docs/HANDOFF.md, src/App.tsx, src/RecorridosDemo.test.tsx, src/pantallas/EntrenamientoHoy/FilaSerie.tsx, src/producto/AyudaDemo.tsx, src/producto/Cliente.tsx, src/producto/Coach.tsx, src/producto/GuiaDemo.tsx, src/producto/Onboarding.tsx, src/producto/ayuda-demo-contexto.ts, src/producto/guia-demo.css, src/producto/Ayuda.tsx, src/producto/GuiaAyuda.tsx, src/producto/ayuda-contexto.ts
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-09-17T02:12:27.099Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Extender ayuda contextual opcional a Coach y Cliente reales con preferencias por cuenta y QA
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-17T02:11:19.641Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Validacion Safari y PWA en simulador Xcode: teclado, series, opciones, descanso, segundo plano e instalacion; informe con limites
- **Verificación:** npm test: 725 PASS; npm run lint: PASS; npm run build: PASS; Safari y PWA iOS Simulator: PASS en alcance documentado
- **Siguiente:** Puntos 2-4 aplazados por el dueno. Pendientes hardware fisico, VoiceOver y offline; ver QA-XCODE-2026-09-16.md


### 2026-09-17T01:56:55.151Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Validar Safari y PWA en simulador Xcode; puntos 2-4 aplazados
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-16T00:57:49.748Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Arreglos del E2E: flujo Maestro corregido (la bienvenida de la demo se tragaba el primer toque, faltaba scroll antes de Completar serie y el descanso ahora es automatico), CSP y X-Frame-Options en el shell via functions/lib/cabecerasShell.ts con frame-ancestors self para no romper el iframe de /presentacion, cobertura ampliada a src/functions/shared con umbrales en el suelo real (72,01%) y limpieza de fichas de QA en local
- **Verificación:** npm test 725/72; tsc -b; npm run lint; npm run build; test:coverage con umbrales; test:http 35/35; test:movil 34/34; cabeceras verificadas en runtime local; navegador sin violaciones de CSP; iframe de presentacion intacto
- **Siguiente:** Verificar produccion tras el despliegue. Pendiente y no verificado: Safari real de iPhone y PWA instalada. El hueco de cobertura hacia el 80% esta en src/producto (47,5%), src/nube (55,2%) y functions (66,1%)


### 2026-09-15T16:33:31.629Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Arreglos E2E: flujo Maestro, CSP del shell, cobertura real y menores
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-15T15:26:31.860Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Peso sugerido del Coach precargado y editable, reps iniciales dentro del rango y Más opciones con cierre accesible; preview 954dde22 verificado
- **Verificación:** npm test: 719/719; npm run lint: PASS; npm run build: PASS; SQL local y Playwright 320/390/1024 y remoto 390: PASS
- **Siguiente:** ninguno


### 2026-09-15T15:19:13.149Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Peso sugerido opcional del Coach precargado en Cliente y cierre accesible de Más opciones
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-13T23:39:45.069Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Descanso automático tras cada serie guardada, Omitir/+30s, sin reinicio al corregir y cierre al terminar; preview 25a90b90 verificado
- **Verificación:** npm test: 710/710; npm run lint: PASS; npm run build: PASS; Playwright 320/390/1024 y remoto 390: PASS
- **Siguiente:** ninguno


### 2026-09-13T23:35:29.428Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Iniciar descanso automáticamente tras guardar cada serie; omitir y añadir tiempo sin reinicio por corrección
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-13T22:42:40.016Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Demo simplificada: bienvenida por rol, ayuda contextual libre y capítulos retirados; preview b1272113 verificado
- **Verificación:** npm test: 707/707; npm run lint: PASS; npm run build: PASS; Playwright 320/390/1024 y remoto 320: PASS
- **Siguiente:** ninguno


### 2026-09-13T17:24:16.233Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Simplificar onboarding de demo con bienvenida breve y ayuda contextual para Coach y Cliente
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-13T14:02:47.614Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Guías demo sin scroll manual ni exploración fuera del foco, con avance entre campos y revisión del plan por partes
- **Verificación:** 706 tests PASS; lint PASS; build PASS; seis tamaños y QA remoto PASS
- **Siguiente:** Verificar deployment canónico y cerrar entrega


### 2026-09-13T01:12:59.269Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Guía demo sin scroll manual con avance enfocado entre campos y controles
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-13T00:36:08.875Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Corregido el desfase del foco al hacer scroll y el recentrado inesperado durante alta; recorridos demo verificados
- **Verificación:** 705 tests PASS; lint PASS; build PASS; seis anchos y preview remoto PASS
- **Siguiente:** Verificar deployment canónico y cerrar entrega


### 2026-09-13T00:31:45.839Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Corregir estabilidad del foco de la guía durante scroll y verificar recorridos demo
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-10T15:35:39.082Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Guías demo con foco sobre la acción exacta, botones destacados, halo animado y etiquetas con flecha; preview verificado
- **Verificación:** npm test: 705 PASS; npm run lint: PASS; npm run build: PASS; QA seis anchos y preview remoto: PASS
- **Siguiente:** Comprobar deployment canónico resultante en lectura y recorrido demo aislado


### 2026-09-10T15:26:36.400Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Resaltar acciones exactas con animaciones premium en las guías demo
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-10T14:15:13.313Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Guias interactivas premium exclusivamente en demo: onboarding y gestion Coach, preview aislada y primera practica Cliente conectada a su historial
- **Verificación:** 705 tests PASS; lint/build PASS; recorridos completos en seis anchuras; preview remoto PASS sin API privada ni errores; teclado, pausa, doble toque y reinicio PASS; PDFs intactos
- **Siguiente:** Verificar deployment canonico resultante. Guias en cuentas reales fuera del alcance aprobado


### 2026-09-10T00:00:38.034Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Guias interactivas premium de Coach y primera entrada Cliente exclusivamente en demo
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-09T18:47:19.885Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Producto v2: Coach y Cliente compartidos, onboarding cloud, demo publica con guia espanola, acceso privado y fotos R2; migraciones aditivas productivas verificadas
- **Verificación:** npm test: 701 PASS; npm run lint PASS; npm run build PASS; HTTP 35 PASS; Maestro Chromium 34 PASS; QA autenticado staging en dos navegadores y offline PASS; PDFs intactos
- **Siguiente:** Verificar deployment canonico y acceso en lectura; correo de Santiago pendiente para habilitar su Coach privado; Safari/PWA fisica no verificados por instruccion del usuario


### 2026-09-08T14:10:00.000Z | claude-code | NOTA — decisión de producto

**El turno sigue siendo tuyo.** No lo he reclamado, no he publicado y no he
tocado ni una línea de tu trabajo. Esta nota es sólo el recado.

#### La decisión del dueño del producto

**Panel del coach privado. Demo pública.**

Es exactamente la mitad de lo que ya estás haciendo, así que no rehagas nada:

- **`/admin` se queda privado, con tu diseño.** La verificación real del JWT de
  Access se queda. Nada de volver a la apertura por variable.
- **La demo tiene que poder abrirse sin identificarse**, en el hostname
  canónico: `santiago-fitness-method.pages.dev/demo`. Es lo que él quiere
  enseñar, y tu demo aislada ya es lo correcto para eso — precisamente porque
  no toca datos reales.

**Corrección a lo que escribí antes.** Dije que había que asegurar que `/demo*`
no exigiera sesión, y que las URLs de preview pedirían el OTP igualmente. Las
dos cosas estaban mal: ya lo tienes hecho, y comprobado en
`codex-premium-v2.santiago-fitness-method.pages.dev`:

```
/                                     302   Access
/admin/                               302   Access
/api/v2/inicio                        302   Access
/presentacion                         302   Access
/demo                                 200   abierto
/demo/cliente                         200   abierto
/demo/coach                           200   abierto
/demo/coach/clientes/demo-persona-3   200   abierto
```

Es exactamente la frontera que pedía el dueño, y la montaste antes de que se
decidiera. No hay nada que cambiar aquí: la nota es una confirmación, no un
encargo. Sólo conviene que esa misma acotación por ruta quede escrita donde se
configura, para que no dependa de recordarla.

Detalle menor que vi en esa preview: en la ficha de Nora Díaz, «Upper A» sale
con 0 ejercicios · 0 series mientras las otras tres sí tienen datos. Parece un
hueco de la semilla de la demo.

#### Antes de nada: el build está roto

```
src/DemoPublica.test.tsx(15,65): error TS2769
  'exact' does not exist in type 'ByRoleOptions'
```

Línea 15: `getByRole('button', { name: 'Upper A', exact: true })`. `exact` es de
`getByText`, no de `getByRole`.

Está escondido: `vitest` da 691/691 en 64 ficheros y el lint pasa, porque
ninguno comprueba tipos. Sólo lo ve `npm run build`, y ahí revienta antes de
compilar. Tal cual, el build de Pages también fallaría.

#### Estado, por si ahorra tiempo

- **Sin commitear otra vez.** Mi respaldo llega hasta `2205175`
  (rama `respaldo/v2-codex`); todo lo de ayer y hoy vive sólo en este disco.
- **Migraciones sin aplicar.** `scripts/migrar-v2.mjs` está bien planteado
  —`--aplicar` explícito—, pero no hay rastro de que se haya ejecutado.
- Lo demás de mi nota anterior está atendido: las cuatro suites como alias de
  `pruebas-v2-http.mjs`, `qa-movil.yaml` delegando en `qa-v2.yaml`, y las docs
  nuevas. Buen trabajo, y el guardarraíl de `pruebas-v2-http.mjs` negándose a
  correr fuera de `localhost` me parece acertado.
- La única observación que no recogiste sigue igual: `cloud.ts` 519 líneas con 2
  comentarios, `servicio.ts` 293 con 0. Lo dejo dicho una vez más y no insisto
  más; si fue decisión deliberada, mejor que quede escrita en el propio fichero.

**Siguiente:** el turno es tuyo. Arregla el build, commitea, y sigue.


### 2026-09-07T15:30:00.000Z | claude-code | NOTA

**El turno sigue siendo tuyo. No lo he reclamado ni lo he publicado, y no he
tocado ni una línea de tu trabajo.**

Lo único que hice fue commitear lo que tenías sin guardar, a petición del dueño
del producto: eran 104 rutas viviendo sólo en un disco desde hace veinticuatro
horas. Está en `416f136`. Por eso `git status` te va a salir limpio: no se ha
perdido nada, está commiteado. Sigue donde lo dejaste.

Comprobé antes de commitear que nadie estuviera editando —el último fichero se
tocó nueve horas antes— y que el árbol estaba verde: `tsc` limpio, lint 0,
build OK y 687/687 en 62 ficheros.

#### Lo que encontré pendiente, por si ahorra tiempo

1. **Las migraciones no están aplicadas.** `0008_coaching_cloud.sql` y
   `0009_versiones_originales.sql` no están en la D1 remota, y de paso
   desaparecieron de `package.json` los scripts `d1:migrar*`, así que ahora
   mismo no hay comando documentado para aplicarlas.

2. **Cuatro suites e2e apuntan a una API que tu propio stub responde con 410.**
   `scripts/pruebas-admin-ui.mjs`, `pruebas-acceso.mjs`, `pruebas-qa.mjs` y
   `pruebas-roles.mjs` siguen llamando a `/admin/api/clientes`. Son unas 71
   comprobaciones de la frontera de roles y de acceso; sólo tocaste
   `pruebas-roles.mjs`. Son justo las que no conviene dejar caer en un cambio
   que mueve la autenticación.

3. **`pruebas-maestro/qa-movil.yaml` pincha `"Guardar"` en tres sitios** y el
   botón ahora dice «Completar serie». Tu `qa-v2.yaml` ya lo contempla; el
   viejo se queda fallando salvo que lo retires.

4. **Cloudflare Access tiene que cuadrar con el código.** `ACCESS_AUD` e
   issuer ya se validan de verdad; si no coinciden con la aplicación real, el
   coach pasará el OTP y aun así recibirá un 401 nuestro.

5. **Documentación.** No hay doc de la arquitectura v2, el bloque «Estado
   actual» de este fichero está obsoleto, y `PUBLIC-TEST-MODE.md`, `ACCESO.md`
   y `ADMIN-MOBILE-EXPERIENCE.md` describen cosas que este cambio elimina.

#### Dos observaciones, con el mismo ánimo

- **`src/nube/cloud.ts` (515 líneas) y `src/producto/servicio.ts` (293) no
  tienen ni un comentario.** La norma del repo ronda un comentario cada tres o
  cuatro líneas en la lógica delicada —`ultimaVez.ts` tiene 38 en 92—, y es lo
  que nos ha salvado varias veces. Sincronización y seguridad es donde más
  falta hace saber el porqué, no el qué.

- **Volver a cachear en el service worker se quitó una vez a propósito**: con
  Access delante, un shell cacheado sirve la app sin pasar por el servidor. Tu
  comentario dice que las APIs y las fotos nunca se cachean, que es lo
  correcto; sólo merece quedar argumentado donde se quitaron las guardas de
  `shellMovil.test.ts`.

El diseño me parece bueno, y en acceso y modelo de datos, mejor que bueno: la
tabla `cambios` con revisión, hash y actor es sincronización idempotente de
verdad, la `0009` es aditiva y repetible, y conservar los tests de
`accesoCoachTemporal` y `demoPublica` como guardianes de la ausencia está muy
bien pensado.

**Siguiente:** el turno es tuyo; retómalo donde estabas.


### 2026-09-06T23:58:51.222Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Implementar producto compartido Coach y Cliente, acceso privado, demo aislada y persistencia cloud con migración segura
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-06T23:11:00.429Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Entrenar deja de ser la pantalla de inicio. Hoy pasa a resumir el dia --dia, ejercicios, series, plan de lectura-- con una sola accion, Comenzar o Continuar; registrar vive en un modo enfocado nuevo que ensena un ejercicio a la vez, con su cabecera contextual, la lista del dia en una hoja y la fila Siguiente. Antes Hoy abria con el primer ejercicio desplegado: ~40 controles tocables en 2,1 pantallas. Solo se abre la serie que toca; las siguientes esperan en una linea y las guardadas colapsan a una. Biblioteca pasa de rejilla de tarjetas con foto a filas con miniatura, con la busqueda que faltaba y estado vacio al filtrar. Historial cambia dos tarjetas por dos lineas y una lista a sangre. En Perfil el formulario de medicion se abre bajo demanda y se corrigen tres altos por debajo de 44px. Teclado: enterKeyHint y encadenado peso->reps->guardar, que no existia. La barra de pestanas NO se oculta al entrenar: salir a Biblioteca durante el descanso y volver es un flujo real y una regresion cubierta por Maestro, y toda la pila inferior cuelga de --sobre-pestanas. Etiquetas ARIA, contrato de geometria, copia literal y logica de negocio intactos
- **Verificación:** npm test 693/693 (666 antes, +27 nuevas) en 59 ficheros; lint 0; build OK; npm run test:movil PASS con QA-MOB-01 y QA-MOB-02; QA visual a 320x667, 390x844, 430x932, 768 y 1024 sin scroll horizontal ni elementos fuera de marco; flujos A-F a mano incluido admin -> Probar como cliente -> navegar -> Volver al Coach
- **Siguiente:** Revision de M2. Pendiente declarado en docs/CLIENT-MOBILE-EXPERIENCE.md: actividad reciente en Hoy, pantalla de cierre de sesion, detalle de sesion del historial como pantalla propia. Limitacion: el teclado real de iPhone y la PWA en standalone no se pudieron validar, solo emulacion Chromium. Aparte: el flujo de Maestro estaba roto desde que la demo publica fija la identidad a cliente-1, que no existe en la D1 local; documentado y resuelto con PUBLIC_DEMO_CLIENT_ID vacio en .dev.vars. NO empezar Biblioteca Fase 3B


### 2026-09-06T22:33:33.643Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** PHASE M2: experiencia movil de la app Cliente
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-06T17:03:05.042Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Genera IDs opacos cliente-UUID exclusivamente en servidor, ignora cliente_id del navegador, crea perfil y cuatro días atómicamente, y elimina el campo técnico del formulario
- **Verificación:** npm test (666/666); npm run lint; npm run build; roles 11/11; admin UI 20/20; QA 13/13; acceso 38/38; npm run test:movil PASS; viewports 320/390/430/1024 sin overflow ni targets menores de 44px
- **Siguiente:** Esperar deployment canónico y revalidar formulario, creación y estado OPEN sin escribir en producción


### 2026-09-06T16:49:35.290Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Generar identificador interno automático y opaco al crear clientes, en commit separado, sin cambios de acceso ni datos remotos
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-06T16:47:43.069Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Habilita temporalmente la app pública con identidad fija cliente-1 resuelta sólo en servidor; ignora URL y cookies de otras identidades, y conserva Admin/D1 sin cambios
- **Verificación:** npm test (658/658); npm run lint; npm run build; QA HTTP/UI local con / y parámetros cliente_id/id/client apuntando a Santiago
- **Siguiente:** Revalidar deployment canónico y después reclamar commit separado para identificador automático al crear clientes


### 2026-09-06T15:39:21.310Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Acceso público temporal fijo para cliente-1, sin selector de identidad del navegador ni cambios a Admin/D1
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-06T15:29:19.916Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Migracion 0007, aplicada en la D1 de produccion. Santiago vuelve a la lista con sus 4 dias y 20 ejercicios intactos: la baja de las pruebas archiva y no borra, asi que era un UPDATE. Su acceso NO se restaura a proposito --revivir una invitacion revocada seria una puerta trasera--, el coach le genera un enlace nuevo. cliente-1 pasa a llamarse 'Cliente nuevo': ya tenia los cuatro dias vacios, asi que renombrarlo evita crear otra fila para lo mismo. ivanprueba y cliente1 se quedan archivados por decision explicita del dueno frente a borrarlos. dayan-test sin tocar. Se elimina la 0006, que nunca se aplico y hoy crearia un sexto cliente que nadie quiere; d1:migrar-lista apunta a la 0007
- **Verificación:** migracion aplicada (changed_db, 2 filas escritas); D1 verificada: visibles santiago y cliente-1, archivados ivanprueba y cliente1; front end /admin y /admin/api/clientes devuelven exactamente Santiago y Cliente nuevo; ficha de Santiago 200. npm test 645/645; lint 0; build OK
- **Siguiente:** Generar el enlace de acceso de Santiago desde /admin -> Santiago -> Acceso: el anterior quedo revocado al darlo de baja


### 2026-09-06T15:27:09.225Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Dejar la lista de clientes en Santiago + Cliente nuevo
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-06T15:19:49.519Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** COACH_ACCESS_TEMPORARY_UNTIL pasa de 2026-09-05 a 2099-12-31: la excepción deja de vencer, por decisión explícita del dueño del producto. El mecanismo no cambia --sigue acotado al hostname canónico y sigue fallando cerrado ante cualquier valor inválido-- sólo la fecha. El comentario de wrangler.toml dice que es deliberado y qué queda expuesto mientras tanto. Preview sigue en cadena vacía: nunca se abre el panel de un despliegue de rama. Prueba nueva sobre la configuración desplegada: una fecha ya vencida es siempre un error, porque el estado caducado cierra /admin para todos, incluido un coach que sí pase el OTP de Access; reproducida a propósito con la fecha anterior y falla
- **Verificación:** npm test 645/645 (3 nuevas en accesoCoachTemporal.test.ts); lint 0; build OK
- **Siguiente:** Para cerrar: añadir de nuevo el destino /admin en Cloudflare Zero Trust y sólo después dejar la variable vacía. El orden importa: al vaciarla la ruta queda cerrada para todos hasta que Access esté delante


### 2026-09-06T15:18:16.194Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Dejar /admin abierto sin fecha de vencimiento
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-05T03:58:06.712Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Segunda pasada del Admin, sobre composicion y no sobre breakpoints. Hoja de estilos unificada: la version anterior eran la base original mas un bloque M1 sobrescribiendola, y esa pelea era parte del problema. Fuera el kicker de marca de cada barra, fuera .tarjeta (contenedor que se anidaba), fuera el contenedor centrado en movil. Un unico contenedor, .grupo, con filas dentro y separadores finos. El detalle del cliente pasa de tres pestanas en barra inferior --dentro del detalle, mientras la raiz no tenia ninguna-- a una pantalla de objeto con dos grupos y una sola accion visible; lo secundario y lo destructivo viven en una hoja inferior que es una ruta (?hoja=acciones), asi que 'atras' la cierra. El editor de ejercicio deja de ser un formulario: modo tarea con Cancelar/Guardar en la barra y parametros en filas con el valor a la derecha; el select de 33 opciones se sustituye por la misma biblioteca buscable que se usa para anadir (accion nueva cambiar-ejercicio, conserva la prescripcion). Busqueda sin boton de lupa aparte. Transiciones de navegacion entre documentos y estado pulsado en cada fila. Acciones visibles por pantalla: 1 a 3
- **Verificación:** npm test 642/642 (25 en consola.test.ts, reescrita); lint 0; build OK; admin-ui 20/20 con dayan-test y con santiago (M-1..M-5 nuevas); acceso 38/38; roles 11/11; qa 13/13; Maestro movil 22/22. QA visual a 320, 390, 430, 768 y 1024: sin scroll horizontal, 0 elementos fuera de marco, ningun control por debajo de 44px. Corregido un fallo propio: .marco con animation-fill-mode both conservaba una matriz identidad y se volvia el bloque contenedor de la hoja fixed, que salia recortada
- **Siguiente:** M2 Cliente. Queda fuera a proposito el retorno persistente de 'Probar como cliente' (seccion 14 del encargo): la banda 'Vista de Santiago / Volver al Coach' vive en la app del cliente, que esta fase no toca. El ida y vuelta funciona: previsualizar 303 a /, y /salir?volver=admin devuelve a /admin/


### 2026-09-05T03:25:10.629Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** PHASE M1.1: pasada nativa movil del Admin (composicion, navegacion, sheets, transiciones)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-05T03:12:03.307Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Phase M1: experiencia móvil Coach/Admin con búsqueda, navegación inferior contextual, catálogo buscable al añadir, formularios táctiles, regreso persistente desde preview y evidencia antes/después
- **Verificación:** npm test (632/632, tres corridas); npm run lint; npm run build; npm run test:movil; test:roles 11/11; admin-ui 15/15; acceso 38/38; QA visual 45 pantallas
- **Siguiente:** Verificar el deployment canónico; no iniciar M2 sin una fase nueva


### 2026-09-04T20:50:15.124Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Phase M1 — transformar Coach/Admin en una experiencia móvil premium sin cambiar Cliente, auth, datos, catálogo, D1 ni landing
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-04T20:23:32.721Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Configuración temporal activada y verificada en producción: Cloudflare protege sólo el comodín de previews; la variable protegida COACH_ACCESS_TEMPORARY_UNTIL permite /admin del dominio canónico sin OTP hasta 2026-09-05T20:00:00Z UTC. /admin y su API responden 200; raíz, API de cliente, JS, manifest y presentación mantienen sus fronteras esperadas. Se abrió Santiago sólo para lectura.
- **Verificación:** Cloudflare UI: destino santiago-fitness-method.pages.dev/admin retirado y *.santiago-fitness-method.pages.dev conservado; secret Pages registrado; producción /admin 200, /admin/api/clientes 200, / 401, /api/cliente 401, asset 401, /presentacion 200, /sw.js 200, preview /admin 302; npm test 627/627 en dos corridas finales consecutivas tras una corrida intermitente aislada; npm run lint; npm run build; SFM_QA_PORT=8791 npm run test:movil PASS
- **Siguiente:** Antes de que venza, retirar COACH_ACCESS_TEMPORARY_UNTIL y volver a añadir el destino canónico /admin en Cloudflare Access; confirmar /admin 302 OTP y mantener cliente sin cambios


### 2026-09-04T20:23:30.473Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Registrar activación verificada de la ventana temporal del coach y su configuración de Cloudflare; sin cambios adicionales de producto
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-04T20:21:16.759Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Excepción temporal y caducable para que el coach entre sin OTP sólo en /admin del hostname canónico; Cloudflare conserva protegido el comodín de previews y cliente/API/assets siguen cerrados. Vence 2026-09-05T20:00:00Z UTC.
- **Verificación:** npm test (627/627; una corrida previa intermitente de Perfil y dos posteriores PASS); npm run lint; npm run build; SFM_QA_PORT=8791 npm run test:movil; smoke local canónico /admin 200 sin cabecera, / y APIs/assets 401, /presentacion 200
- **Siguiente:** Cuando termine la ventana, quitar COACH_ACCESS_TEMPORARY_UNTIL y volver a añadir santiago-fitness-method.pages.dev/admin en Cloudflare Access


### 2026-09-04T20:10:31.227Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Preparar una excepción temporal y caducable para acceso del coach a /admin sin OTP; mantener cliente y APIs protegidos; verificar y publicar
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-04T19:55:19.841Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Cerrado el bypass de prueba que exponía la app y /api/cliente sin sesión. Eliminados PUBLIC_TEST_MODE, AUTH_MODE y /consola; el middleware exige sfm_sesion fuera de las excepciones públicas, la API deriva la identidad únicamente de la sesión, /admin exige la cabecera de Cloudflare Access y el match de ruta es segment-aware. Restaurada en Cloudflare la política existente Cliente y coach sobre santiago-fitness-method.pages.dev/admin y *.santiago-fitness-method.pages.dev, sin tocar los destinos; el cliente canónico entra por /access?t=... sin Access. docs/cliente y D1 remota permanecen intactos.
- **Verificación:** npm test: 622/622; npm run lint; npm run build; pruebas de acceso 38/38; roles 11/11; admin UI 14/14; QA 13/13; presentación PASS; probes canónicos: cliente/API/estáticos 401, /access sin Access, /sw.js y /presentacion públicos, /admin 302 Access, previews 302 Access; revisor independiente PASS
- **Siguiente:** Ninguno


### 2026-09-04T19:39:46.284Z | codex | ADOPT
- **Estado:** active
- **Tarea:** Cerrar el bypass de prueba y separar el acceso del cliente por enlace privado del panel coach protegido por Cloudflare Access
- **Cambios adoptados:** docs/ACCESO.md, docs/PUBLIC-TEST-MODE.md, functions/_middleware.ts, functions/admin/[[ruta]].ts, functions/api/cliente.ts, functions/lib/modoPrueba.test.ts, functions/lib/modoPrueba.ts, scripts/pruebas-acceso.mjs, scripts/pruebas-admin-ui.mjs, scripts/pruebas-modo-prueba.mjs, wrangler.toml
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-09-04T18:49:27.775Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Modo edicion en la lista de clientes: 'Editar lista' pone un aspa de 44x44 en cada fila, el aspa lleva a una pantalla de confirmacion y solo el POST de esa pantalla escribe. archivarCliente() apaga 'activo' --la columna estaba en el esquema sin que nadie la escribiera-- y revoca invitaciones pendientes y sesiones vivas en el mismo lote; la programacion se conserva, asi que la baja se deshace con UPDATE clientes SET activo=1. En modo edicion la fila deja de ser enlace para que abrir y eliminar no compartan linea. crear-cliente distingue ahora un identificador ocupado de uno archivado. Migracion 0006 (sin aplicar) deja la lista en Santiago + Cliente nuevo
- **Verificación:** npm test 634/634 (12 nuevas); npm run lint 0; npm run build OK; admin-ui 14/14 con dayan-test y con santiago; roles 11/11; acceso 37/37; qa 13/13; modo-prueba 6/6. Regresiones reproducidas a proposito: quitando la revocacion de sesiones fallan archivarCliente.test.ts y UI-14. QA visual 390 y 320: sin scroll horizontal, 0 elementos fuera, aspa 44x44
- **Siguiente:** Aplicar migrations/0006_lista_de_clientes.sql con npm run d1:migrar-lista (bloqueado aqui por el classifier). Sigue pendiente la politica Bypass de Cloudflare Zero Trust para abrir /admin


### 2026-09-04T18:48:37.956Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** Eliminar clientes desde la consola movil y dejar la lista en Santiago + Cliente nuevo
- **Cambios adoptados:** functions/admin/[[ruta]].ts, functions/admin/consola.test.ts, functions/lib/roles.ts, package.json, scripts/pruebas-admin-ui.mjs, functions/lib/archivarCliente.test.ts, migrations/0006_lista_de_clientes.sql
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-09-04T18:24:19.626Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** PUBLIC_TEST_MODE puentea la autenticacion del cliente y de la consola sin borrar nada. Un solo interruptor en functions/lib/modoPrueba.ts, leido desde _middleware.ts, api/cliente.ts y admin/[[ruta]].ts. Falla cerrado: solo el texto exacto 'true' abre. La identidad del cliente sigue decidiendose en el servidor (santiago), asi que el navegador no puede elegirla. Invitaciones, cookie sfm_sesion, revocacion y /salir intactos. Cloudflare Access sigue delante de /admin y hay que quitarlo a mano: instrucciones en docs/PUBLIC-TEST-MODE.md
- **Verificación:** npm test 622/622; npm run lint 0; npm run build OK; modoPrueba.test.ts 12/12; scripts/pruebas-modo-prueba.mjs 8/8 con la bandera encendida y 6/6 apagada; roles 11/11; acceso 37/37; admin-ui 11/11; qa 13/13; QA manual admin+cliente y responsive 320/390/1024
- **Siguiente:** Santiago debe crear la politica Bypass en Cloudflare Zero Trust (docs/PUBLIC-TEST-MODE.md, seccion TESTING). Sin eso el OTP sigue delante de /admin. Al terminar las pruebas, seccion AFTER para restaurar


### 2026-09-04T17:59:13.814Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** PUBLIC_TEST_MODE: bypass temporal y reversible de autenticacion para pruebas de Santiago
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-04T04:10:13.439Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Phase 3B.1 implementada: catálogo maestro seguro de 123 identidades en tabla Dexie local separada, manifest auditable de 293 filas, seed idempotente y pruebas de alias/metadata; 33 IDs, historial, plantillas y D1 remota preservados.
- **Verificación:** npm test 610/610; npm run lint PASS; npm run build PASS; manifest 123/102/68; seed/migración local PASS; docs/cliente sin cambios
- **Siguiente:** Detenerse para revisión de Santiago; no iniciar Phase 3B.2.


### 2026-09-04T04:02:28.132Z | codex | ADOPT
- **Estado:** active
- **Tarea:** Phase 3B.1: foundation catalog segura e importación idempotente; preservar los 33 ejercicios y excluir decisiones pendientes
- **Cambios adoptados:** src/datos/esquema.ts, src/datos/repositorio.ts, src/datos/repositorioLocal.ts, src/datos/semilla/index.ts, src/datos/semilla/semilla.test.ts, docs/BIBLIOTECA-FASE-3B1-MANIFEST.csv, shared/catalogo-maestro.test.ts, shared/catalogo-maestro.ts
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-09-04T03:43:44.702Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Phase 3A.6: Coach Decision Pack sin implementacion
- **Cambios:** Creados BIBLIOTECA-COACH-DECISION-PACK.md para Santiago y DECISION-MAP.csv interno. 11 casos historicos y 25 casos R revisados: 48 decisiones unicas (11 historicas, 37 nuevas), 0 REQUIRED globales y 48 CAN DEFER excluyendo cambios dependientes. R07/R17 y R08/R18 consolidados sin juntar decisiones distintas; 295 opciones sin responder, generico/Otro/pendiente y efectos explicitos. Handoff documenta conteo y politica de dependencias. Ningun caso sin pregunta; no se alteraron 293 propuestas, datasets, IDs, UI, codigo, D1 ni PDFs.
- **Verificación:** Readback PASS: 48 preguntas, 11 IDs pendientes, cobertura R01-R25, opciones y dependencias validas, respuestas vacias. Fuentes/datasets/PDF byte-identicos a 5186968; diff produccion vacio; git diff --check PASS. npm test 602/602 PASS; npm run lint PASS; npm run build PASS.
- **Siguiente:** Enviar cuestionario a Santiago y esperar respuestas. No Phase 3B, no aplicar equivalencias ni mappings automaticamente. Un lote futuro requiere aprobacion expresa y exclusion de cambios pendientes.


### 2026-09-04T03:36:33.219Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Phase 3A.6: cuestionario Santiago y mapa de decisiones; solo documentos
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-04T03:33:50.178Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Phase 3A.5: revision documental de R01-R25
- **Cambios:** Creados docs/BIBLIOTECA-FASE-3A5-REVISION.md y CSV independiente. 25 expedientes con nombres/paginas/grupos/subcategorias y preguntas concretas. 24 NEEDS_COACH_REVIEW + 1 ALIAS media pendiente; 0 casos completos alta confianza; 11 casos con distinciones parciales seguras. Total provisional 293 sin fusiones nuevas. NOT READY FOR PHASE 3B. Datasets 3A, 33 IDs, once mappings, codigo, UI, PDF y D1 intactos.
- **Verificación:** Readback y contraste directo con PDF PASS, incluyendo encabezados continuados; comparacion byte-identica de datasets/PDF con b783b5d; diff produccion vacio. npm test 602/602 PASS; npm run lint PASS; npm run build PASS. Intermitencia Perfil previa no reaparece, no diagnosticada ni corregida.
- **Siguiente:** Esperar revision humana de preguntas R01-R25 y aprobacion explicita. No importar Phase 3B. Corregir resumenes de decision solo tras aprobacion, sin resolver implicitamente los once IDs historicos.


### 2026-09-04T03:27:47.814Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Phase 3A.5: revisar 25 solapamientos; solo documentacion, sin cambiar datasets ni implementar
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-04T03:19:15.342Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Phase 3A: analisis documental de Biblioteca Maestra; sin importacion
- **Cambios:** Entrega docs/BIBLIOTECA-FASE-3A-ANALISIS.md y cinco CSV: 299 entradas trazables, 293 propuestas conservadoras (5 pares exactos + 1 semantico), 25 casos de solapamiento pendientes, mapping de 33 IDs con 21 exactos + 1 verificable y 11 sin asignar; 45 opciones coach; modelo minimo, riesgos, rollback y archivos futuros 3B. Solo documentacion: codigo, IDs, docs/cliente, Santiago y D1 sin cambios.
- **Verificación:** CSV readback PASS: cobertura unica 299/293, 33 IDs, referencias, JSON, metricas y SHA PDF. npm test primera corrida 601/602: Perfil.test.tsx:104 notas fuera del DOM; segunda corrida sin cambios 602/602. Intermitencia registrada, no diagnosticada ni corregida. npm run lint PASS; npm run build PASS. Diff produccion/docs-cliente vacio.
- **Siguiente:** Esperar aprobacion explicita de Phase 3B; no importar catalogo. Revisar decisiones y once ambiguedades con coach. Investigar aparte intermitencia de Perfil antes de gate de estabilidad.


### 2026-09-04T03:02:20.791Z | codex | CLAIM
- **Estado:** active
- **Tarea:** PHASE 3A solo analisis: extraer 299 entradas, normalizar identidades y mapping historico; sin implementacion ni D1
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-04T02:54:22.127Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Completadas fases 1-2 de biblioteca retomadas de Claude: fuente unica Coach/Cliente para 33 ejercicios, nombres alineados con el PDF sin suponer 11 variantes, ids e historiales preservados; diagnostico de ids desconocidos y regresion de actualizacion local.
- **Verificación:** npm test 602/602; npm run lint; npm run build; Playwright demo local Chrome 320/390/1024: ficha, guardar, timer, Editar, Biblioteca y retorno; consola limpia y sin overflow
- **Siguiente:** Confirmar 11 variantes pendientes antes de ampliar catalogo; recapturar capturas estaticas del landing; gates fisicos iPhone/PWA siguen pendientes.


### 2026-09-04T02:54:08.085Z | codex | ADOPT
- **Estado:** active
- **Tarea:** Retomar y completar biblioteca maestra fases 1-2 de Claude: catalogo compartido, nombres verificados y compatibilidad de historial
- **Cambios adoptados:** docs/HANDOFF.md, functions/lib/roles.ts, src/datos/semilla/biblioteca/empuje.ts, src/datos/semilla/biblioteca/pierna.ts, src/datos/semilla/biblioteca/traccion.ts, src/datos/semilla/semilla.test.ts, src/pantallas/Biblioteca/Biblioteca.test.tsx, src/pantallas/Coach/Coach.test.tsx, src/pantallas/EntrenamientoHoy/EntrenamientoHoy.test.tsx, src/pantallas/Historial/Historial.test.tsx, src/presentacion/Presentacion.test.tsx, docs/BIBLIOTECA-FASES-1-2.md, shared/ejercicios-base.test.ts, shared/ejercicios-base.ts
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-09-04T02:25:51.128Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Biblioteca maestra fases 1-2: fuente unica de nombres, catalogo derivado, prueba de paridad y renombrado a la nomenclatura del PDF
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T17:54:57.149Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Creado output/pdf/Santiago_Fitness_Method_Estado_y_Roadmap.pdf con estado completado, futuras fases, limites actuales de datos y respuesta a la pregunta de escalabilidad del ultimo PDF. docs/cliente permanecio intacto.
- **Verificación:** PDF ReportLab 5 paginas; pdfplumber extraccion verificada; pdftoppm render e inspeccion visual; npm test (591/591); npm run lint; npm run build
- **Siguiente:** Compartir el PDF con el cliente y confirmar cierre visual en Safari iPhone/PWA antes de declarar READY; la sincronizacion completa sigue siendo Etapa 2.


### 2026-09-02T17:49:44.481Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Crear informe PDF para el cliente con estado completado, futuras fases y respuesta a la pregunta del ultimo analisis
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T17:39:59.073Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** El acceso real del coach en /presentacion (/admin/) abre una pestaña nueva con target=_blank y rel=noopener noreferrer; se añadió regresión para todas las entradas /admin/ y se verificó el click en la landing compilada.
- **Verificación:** npm test (591/591); npm run lint; npm run build; Browser local: atributo target/rel, click abre nueva pestaña y consola sin errores
- **Siguiente:** Verificar el deployment de Git y probar el CTA publicado; la navegación Para el coach sigue siendo un ancla interna, no un login.


### 2026-09-02T17:35:44.786Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Ajustar todas las entradas reales de acceso del coach en /presentacion para abrir una pestaña nueva y verificar el comportamiento
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T17:18:01.261Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Landing público fiel, demo sin almacenamiento, capturas actuales y namespace de assets aislado; preview y canónico verificados
- **Verificación:** npm test 590/590; npm run lint PASS; npm run build PASS; SFM_QA_PORT=8790 npm run test:movil PASS; 8 viewports; HTTP canónico 18/18; preview a3a3983b; production dce7feff
- **Siguiente:** Revisión editorial del landing por el usuario; gates físicos/PWA del producto siguen pendientes


### 2026-09-02T16:51:15.687Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Landing público fiel al producto, demo aislada y QA de acceso
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T05:11:58.866Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Auditoría y refinamientos UX móvil P2/P3: steppers delimitados, Terminar sesión real de 44px y semántica accesible iOS; validación Maestro/Playwright 320–1024
- **Verificación:** npm test (3x: 574/574); npm run lint; npm run build; npm run test:movil; Maestro Chromium/iOS
- **Siguiente:** Revisión manual Safari/iPhone físico y PWA instalada cuando haya dispositivo verificable


### 2026-09-02T03:34:27.820Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Auditar y aplicar refinamientos UX móvil P2/P3 de bajo riesgo; validar con Maestro y publicar commit separado
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T03:17:58.183Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** QA final: npm test pasó 3 corridas consecutivas (572/572 cada una, sin aria-valuenow ni errores intermitentes); lint/build PASS; fixture dayan-test local y Maestro Chromium PASS. iPhone Mirroring fue detectado pero Safari físico y PWA no pudieron validarse de forma verificable; quedan NOT EXECUTED. Santiago no fue escrito y su invitación pendiente sigue intacta. Estado: NOT READY FOR SANTIAGO.
- **Verificación:** npm test x3: 572/572 cada corrida; npm run lint; npm run build; maestro --udid chromium test pruebas-maestro/qa-movil.yaml; D1 remoto lectura/revocación QA
- **Siguiente:** Ejecutar login, recorrido, logout y PWA en Safari de iPhone físico con screenshots y versión iOS; después revalidar gates antes de READY FOR SANTIAGO


### 2026-09-02T02:57:46.259Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Cerrar gates pendientes de QA final: npm test tres veces, cliente QA reversible, verificación física Safari/iPhone/PWA si disponible y documentación de resultado
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T02:45:19.872Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** QA independiente cliente ejecutado sin cambios de producto: Maestro local 23/23, UI IAB en 402x874/375x667/320x568/1024x844, navegación, días, ficha, técnica, calentamiento, timer, edición, historial, recarga, logout y enlace de un solo uso; producción/D1 solo lectura.
- **Verificación:** npm test (572/572); npm run lint; npm run build; npm run test:movil (23/23); D1 remoto read-only (0 escrituras)
- **Siguiente:** No READY FOR SANTIAGO todavía: falta validar Preview como Santiago sin escribir D1, Safari macOS/iOS y PWA instalada; considerar cierre explícito de esos gates.


### 2026-09-02T02:13:17.154Z | codex | CLAIM
- **Estado:** active
- **Tarea:** QA independiente interfaz cliente con Maestro solicitado; commits 95981ef y 937d1dc; sin cambios
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T02:06:50.893Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Ajustes previos (95981ef) y Phase 1B (937d1dc). Ajustes: habia tres copias del formateador de series y las tres diferian; la de Historial se comia el sufijo /lado y ensenaba el peso de un lado como si fuera el total, y su resumen de sesion tomaba series[0] dando por hecho que el resto pesaba igual, asi que una subida a media sesion desaparecia. Unificado en describirSerie y resumirUltimaVez. Con mas de tres series de pesos distintos el resumen pasa a rango, porque detallarlas ocupaba tres lineas a 320px. Phase 1B: tras inspeccionar, el cierre de sesion ya estaba implementado y correcto —barra con role=progressbar, boton Terminar sesion, confirmacion, completadaEn, filtro del historial— y la creacion de sesion ya era idempotente por (fecha, dia). Lo unico que faltaba de la lista era el workout: el historial no decia en que dia del metodo fue cada sesion. Anadido. El resto del trabajo es de pruebas, como pedia el encargo.
- **Verificación:** npm test 572/572 (49 ficheros, +19 en este turno); npm run lint 0 avisos; npm run build OK; npm run test:movil 23/23 COMPLETED; navegador a 320 (envoltorio con 5 pesos distintos: 2 lineas, sin desborde, sin scroll horizontal, sin tapar controles), 402x874 y 375x667 (ciclo completo guardar-progreso-terminar, historial con fecha, dia, series, peso y reps, cero solapes, cero filas bajo 44px)
- **Siguiente:** Reporte de Phase 1B entregado. Esperar aprobacion antes de cualquier fase siguiente. Fixtures de QA sembrados en IndexedDB local y retirados; D1 remota sin tocar.


### 2026-09-02T01:53:55.616Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Ajustes previos a 1B: unificar el formateador de Historial y cubrir el envoltorio a 320px
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T01:49:58.668Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Phase 1A Last Performance. Tras inspeccionar el modelo: NO hizo falta cambiarlo ni migrar nada. series y borradores ya son tablas distintas —un borrador no puede colarse— y useEntrenamiento ya filtraba la fecha de hoy del historial, asi que la sesion actual nunca es su propia referencia. Lo que faltaba era la presentacion: la tarjeta ensenaba ultimaSesion[0], o sea la PRIMERA serie de la ultima sesion, que en un ejercicio de cuatro es la menos representativa, y el vacio se dibujaba como un guion. Anadido src/logica/ultimaVez.ts, que resume todas las series de la ultima sesion eligiendo formato segun lo que vario: '3 x 135 lb x 10' si todo igual, '135 lb x 10, 10, 8' con mismo peso, y '135 x 10 · 140 x 8 lb' con pesos distintos. El vacio pasa a decir 'Sin historial'. Adyacente: corregida la unidad malformada '135/lado lb' a '135 lb/lado' en los tres sitios de la tarjeta donde aparecia, porque quedaba al lado del formato nuevo y se leia como un fallo introducido.
- **Verificación:** npm test 553/553 (49 ficheros, +17); npm run lint 0 avisos; npm run build OK; npm run test:movil 23/23 COMPLETED; navegador a 402x874 con area segura 34 y a 375x667: Ultima vez correcta, bloque de solo lectura (0 elementos interactivos), sin desborde, cronometro activo, EDITAR 69x44 visible entero y recibiendo el toque, cero solapes; ida a Biblioteca, Historial y Perfil y vuelta conserva el valor
- **Siguiente:** Phase 1B cuando se apruebe. Fixture de QA sembrado en IndexedDB local y retirado al terminar; D1 remota no se toco en ningun momento: Santiago sigue con 4 rutinas y 1 invitacion pendiente.


### 2026-09-02T01:40:03.077Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Phase 1A Last Performance: Ultima vez con varias series y estado sin historial
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T01:35:26.887Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Phase 0 cerrada. QA-MOB-01 y QA-MOB-02 ya estaban corregidos en 4718eac; se verifican de nuevo en navegador a 402x874 con area segura de 34 (iPhone 16 Pro, tamano que no se habia probado antes) y a 375x667 (iPhone SE): cero controles atrapados, EDITAR 69x44 visible entero y recibiendo el toque, marcas 66x45 y 52x45, cero solapes entre cronometro, barra y navegacion, y cero series bajo el cronometro en el tope del scroll. El trabajo nuevo es de pruebas: src/pruebas/pilaInferior.ts modela la pila inferior leyendo los tokens del CSS y calculando donde cae cada capa, asi que shellMovil.test.ts pasa de comparar cadenas a comprobar el invariante con numeros (la reserva del contenido tiene que llegar al borde superior del cronometro) en los dos dispositivos, con y sin barra de sesion, y con cronometro de 66 y de 90px. Anadida ademas una prueba que impide volver a 73/81/134/184 escritos a mano.
- **Verificación:** npm test 536/536 (48 ficheros, +11); npm run lint 0 avisos; npm run build OK; npm run test:movil 23/23 comandos COMPLETED; regresiones reproducidas a proposito: quitar la reserva del cronometro falla 9 pruebas, volver a 73/184 falla 6, devolver la marca al -6px simetrico falla 2, y restaurado vuelve a 47/47 en el fichero
- **Siguiente:** Phase 1 cuando se apruebe. Sigue pendiente y sin ejecutar: Safari iOS Simulator, PWA instalada e iPhone fisico. Maestro cubre las interacciones reales sobre Chromium pero no la geometria, y esta documentado en el propio flujo.


### 2026-09-02T01:29:48.240Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Phase 0: cerrar QA movil. Verificar QA-MOB-01 y QA-MOB-02 a 402x874 y 375x667, y reforzar las pruebas de regresion de geometria en shellMovil.test.ts
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-02T01:15:16.706Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** QA movil automatizado con Maestro sobre Chromium. Anadido pruebas-maestro/ con un flujo que recorre el cliente de punta a punta tocando los controles de verdad: enlace de acceso, guardar serie de trabajo, descanso automatico, reabrir con Editar, cambiar tecnica, marcar calentamiento y supervivencia del descanso al ir a Biblioteca y volver. 23 comandos en verde. Incluye enlace-local.mjs, que acuna la invitacion contra la D1 LOCAL para no crear invitaciones en la base real, y npm run test:movil. IMPORTANTE y documentado en el propio flujo y en su README: este flujo NO cubre la geometria de QA-MOB-01; se comprobo reintroduciendo el fallo a proposito y sigue pasando, porque Maestro desplaza el elemento a la vista antes de tocarlo y la ventana de Chromium no es un viewport de movil. Esa parte la protege shellMovil.test.ts, que si falla con el fallo reintroducido. Los simuladores de iOS siguen sin ejecutarse.
- **Verificación:** maestro test pruebas-maestro/qa-movil.yaml 23/23 comandos; npm test 525/525; npm run lint 0 avisos; npm run build OK; verificado que el flujo NO detecta la regresion de QA-MOB-01 y que shellMovil.test.ts si la detecta
- **Siguiente:** Simuladores iPhone 16 Pro e iPhone SE: NOT EXECUTED, sigue faltando Xcode. Maestro Cloud tiene esos modelos pero solo corre binarios nativos, y esto es una PWA: su unica plataforma web es chromium. La verificacion en Safari real necesita un iPhone fisico o instalar Xcode.


### 2026-09-02T01:14:57.514Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** QA movil automatizado con Maestro sobre Chromium, ante la ausencia de Xcode para los simuladores de iOS
- **Cambios adoptados:** .gitignore, package.json, pruebas-maestro/
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-09-01T23:08:52.970Z | claude-code | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** QA-MOB-01 y QA-MOB-02 corregidos y verificados en navegador; falta la ejecucion en simuladores porque este Mac no tiene Xcode. QA-MOB-01: el cronometro no entraba en la reserva inferior de .contenido (reservaba hasta 660 px con el borde del cronometro en 644), asi que tapaba controles y el toque se lo quedaba la barra; ahora el componente publica su altura medida en --alto-cronometro y las dos reglas de .contenido la suman. QA-MOB-02: el ::after simetrico de -6px se metia 3 px dentro de los steppers de peso y dejaba la marca en 44 justos; ahora crece 11 px hacia arriba (hay 24 libres) y solo 2 hacia abajo: 47 px sin robarle area a nadie. Ademas se corrigieron dos defectos reales encontrados al verificar: el autosave reescribia el borrador que registrarSerie acababa de borrar porque claveDeBorrador se recreaba en cada render (serie guardada con borrador fantasma), y los steppers de 44 px de la Fase 2 desbordaban su columna a 375 px provocando 6 pares de controles solapados. Sin cambios de logica de producto.
- **Verificación:** npm test 525/525 en 24 corridas seguidas; npm run lint 0 avisos; npm run build OK; roles 11/11; acceso 37/37; admin-ui 11/11; QA 13/13 visible; navegador 320/375/390/393/430/768/1024 sin desborde ni solapes; iPhone SE (375x667) e iPhone 16 Pro (393x852 con safe-area 34) emulados: serie guardada, cronometro activo, Editar visible y tocable 69x44, Tecnica y Calentamiento 66x45 y 52x45, cero solapamientos, safe areas correctas; ida y vuelta a Biblioteca conserva la reserva; consola sin errores; D1 Santiago 4x5 e invitacion pendiente intactas
- **Siguiente:** BLOQUEADO: faltan iPhone 16 Pro Simulator e iPhone SE Simulator. Este Mac solo tiene Command Line Tools; no hay /Applications/Xcode.app ni simctl. Instalar Xcode y ejecutar 'sudo xcode-select -s /Applications/Xcode.app/Contents/Developer' para poder correrlos.


### 2026-09-01T22:30:31.229Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** QA-MOB-01 solapamiento del temporizador sobre serie guardada y boton Editar; QA-MOB-02 area tactil real de Tecnica y Calentamiento
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-01T04:01:40.667Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Fase 2 Native Mobile Shell. 2A: UI-10 deja de asumir Santiago INCOMPLETE y usa un fixture reversible sobre el cliente QA (antes le generaba una invitacion real a Santiago); referencias 'temporizador manual' alineadas con el contrato automatico; areas tactiles reales a 44px en filtros, enlaces, guardar/editar, steppers, campos de perfil/medicion y cerrar hoja. 2B: manifest standalone con id/scope/start_url y meta iOS, sin tocar sw.js ni anadir cache. 2C: pila inferior derivada de variables de area segura (la barra de sesion quedaba bajo el indicador de inicio), lados seguros, feedback al pulsar en las pestanas y contexto de seccion conservado al cambiar de pestana. 2D: valor--edicion a 16px para que iOS no amplie al enfocar, scroll-padding bajo lo fijo. 2F: hojas con aria-modal, foco de entrada y retorno, Escape y overscroll contenido. 2G: arranque con el armazon ya pintado. 2H: areas seguras y pulsado en Admin, que sigue con 0 scripts. Corregido ademas que el minificador se comia backdrop-filter en las pestanas.
- **Verificación:** npm test 512/512 (3 corridas); npm run lint 0 avisos; npm run build OK; roles 11/11; acceso 37/37 con QA visible y 34/34 con QA oculto; admin-ui 11/11; QA 13/13 visible y 13/13 oculto; navegador 320/390x844/430/768/1024 en las cuatro secciones sin desborde ni targets <44; Admin 390/768/1024; sondas anonimas 401/401/401/403 y sw.js 200; 0 service workers y 0 caches; D1 Santiago 4x5 READY e invitacion pendiente intacta
- **Siguiente:** QA independiente de Fase 2. Faltan pruebas en iPhone y Android fisicos: NOT EXECUTED. No iniciar Fase 3.


### 2026-09-01T03:09:43.402Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Fase 2 Native Mobile Shell: deuda del gate (UI-10, contrato documental del timer, touch targets 44px), PWA standalone, shell movil con safe areas, preservacion de contexto, teclado, sheets, loading y pulido movil del Admin
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-01T03:03:45.610Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** QA independiente Phase 1 PASS: diff acotado; timer automatico/global, iconos, backup fuera y nombre QA validados; 470/470, lint y build; roles 11/11, acceso 37/37, QA 13/13 visible y oculto; browser 320/390/430/1024 sin overflow ni solapes; D1 Santiago 4x5 e invitacion intacta. P2: admin-ui UI-10 usa supuesto obsoleto de Santiago INCOMPLETE (10/11); referencias manuales stale y touch targets preexistentes de 40px.
- **Verificación:** npm test 470/470 codigo 0; npm run lint 0 warnings; npm run build OK; test:roles 11/11; acceso 37/37; admin-ui 10/11 por fixture stale; QA visible 13/13; QA oculto 13/13; Browser local real 320/390x844/430/1024; D1 remoto read-only; production probes 401/302/SW 200
- **Siguiente:** PHASE 2 puede comenzar despues de corregir contrato documental manual->automatico y el fixture UI-10; resolver targets preexistentes de 40px en Phase 2. No implementar onboarding todavia.


### 2026-09-01T02:51:55.061Z | codex | CLAIM
- **Estado:** active
- **Tarea:** QA independiente Phase 1: diff, timer, iconos, backup, QA display name y regresion
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-09-01T02:38:32.956Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Fase 1 (0+1A+1B+1C+1D): cronómetro de descanso global a nivel de App con instante final absoluto (sobrevive a cambio de pestaña y al frenado del navegador), iconos SVG locales en las cuatro pestañas, retirada de Copia de seguridad de Perfil y del Alta conservando el código subyacente, y nombre visible 'Cliente de prueba 1' para el cliente tecnico dayan-test mediante migracion idempotente 0005. Sin capa offline, sin cache, sin tocar autenticacion, Santiago ni ivanprueba.
- **Verificación:** npm test 470/470; npm run lint (0 warnings); npm run build; pruebas-roles 11/11; pruebas-acceso 37/37; pruebas-admin-ui 11/11; pruebas-qa 13/13 visible y 13/13 oculto; QA visual 320/390x844/430/1024
- **Siguiente:** QA independiente de Fase 1. No iniciar Fase 2 hasta aprobacion.


### 2026-09-01T02:08:14.950Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Fase 1 del plan de Codex: temporizador de descanso global y automatico, iconos de navegacion del cliente, retirada de la copia de seguridad de la UI y nombre visible del cliente QA
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T13:21:25.615Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Revalidación final independiente Issue #4 PASS: preview-qa y producción verificadas a 390x844 y 1024; flujo Coach completo, preview cliente y regreso; cero scroll horizontal, clipping incorrecto, targets menores de 44px o errores de consola; QA visible sólo en preview
- **Verificación:** npm test 437/437; npm run lint; npm run build; admin-ui 11/11; roles 11/11; acceso 37/37; QA 13/13 visible y 13/13 oculto; Browser preview-qa 9 pantallas en 390x844 y 1024; production visibility/layout; D1 Santiago 4x5 e invitación pendiente intacta
- **Siguiente:** READY: revisar producto final y preparar prompt maestro para Claude Design usando el producto aprobado como fuente de verdad


### 2026-08-31T13:15:53.775Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Revalidación final independiente Issue #4 en preview-qa y producción a 390x844 y 1024
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T13:12:37.594Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Issue #4 P1 resuelto: la rejilla de dias usaba 1fr, cuyo minimo implicito es auto, asi que el nombre de los ejercicios en una linea sin cortar fijaba un ancho minimo mayor que la columna y la segunda se salia del marco y del viewport. Ahora repeat(2,minmax(0,1fr)) con min-width:0 en los hijos. La prueba de regresion destapo el mismo fallo latente en .pareja (los campos emparejados del editor), tambien corregido. Retirado el overflow-x:hidden que tapaba el sintoma
- **Verificación:** npm test 437/437 codigo 0; lint 0 warnings; build OK; admin-ui 11/11; roles 11/11; acceso 37/37; QA 13/13; geometria verificada en 320, 390, 1024, 1200 y 1280: cero elementos fuera del marco y cero scroll horizontal en 10 pantallas
- **Siguiente:** Codex revalida el gate visual de desktop


### 2026-08-31T13:04:31.443Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Issue #4 P1: rejilla desktop desborda el marco por 1fr; usar minmax(0,1fr) y anadir prueba de limites
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T12:57:22.398Z | codex | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Retest independiente Issue #4: mobile 390x844, roles, acceso, D1 y seguridad pasan; detectado P1 desktop: la rejilla de días sale del marco de 820px y se recorta a 1024/1200px
- **Verificación:** npm test 430/430; npm run lint; npm run build; admin-ui 11/11; roles 11/11; acceso 37/37; QA 13/13 visible y 13/13 oculto; browser producción 390x844 y desktop 1024/1200/1280; D1 Santiago 4x5; security probes
- **Siguiente:** Corregir grid desktop con columnas que puedan encoger (p.ej. minmax(0,1fr)) y añadir regresión de layout; repetir retest antes de READY


### 2026-08-31T12:48:43.463Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Retest independiente del Issue #4 en preview y producción
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T04:40:34.964Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Issue #4: consola Coach/Admin rehecha mobile-first. Arquitectura por pantallas (clientes, hub con Programa/Perfil/Acceso, dia, ejercicio, grupos de perfil) con el estado en la URL y render en servidor. Resumen primero y detalle a demanda; sin ids ni contadores tecnicos en la lista; reordenar como modo; quitar tras confirmacion; acceso y sesiones agrupados en su seccion. Corregidos por el camino: formularios parciales de perfil que pisaban campos, pestanas de 40px y dia fuera de rango que se recortaba en silencio en vez de dar 404
- **Verificación:** npm test 430/430 codigo 0; lint 0 warnings; build OK; admin-ui 11/11; roles 11/11; acceso 37/37; QA 13/13 en los dos modos; QA visual 390x844 y desktop sin desbordes, sin toques menores de 44px y sin controles sin nombre accesible
- **Siguiente:** Codex valida el rediseno en preview y produccion


### 2026-08-31T04:21:33.151Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Issue #4: rediseno mobile-first del Coach/Admin con arquitectura de informacion por pantallas
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T04:18:02.038Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Issue #3: dayan-test se oculta de produccion en el servidor mediante SHOW_QA_CLIENTS, y sigue visible y operable en preview. Filtrado en la lista del panel, el resumen de estado, /admin/api/clientes, la ficha por ?cliente= y las mutaciones POST incluida la impersonacion sin cliente. La fila de D1 se conserva intacta
- **Verificación:** npm test 430/430 codigo 0; lint 0 warnings; build OK; pruebas-qa 13/13 en los dos modos; roles 11/11; acceso 37/37
- **Siguiente:** Codex valida en preview y produccion


### 2026-08-31T04:10:16.239Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Issue #3: ocultar dayan-test de produccion server-side con SHOW_QA_CLIENTS, manteniendolo en preview
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T04:01:03.254Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Issue #2 completado con evidencia visual de Chrome Incognito real: Access/Admin/Santiago/Preview/refresh/Admin; D1 4x5 e invitacion intacta
- **Verificación:** npm test 424/424; lint; build; migracion 4/4; roles 11/11; acceso 37/37; Chrome Incognito real PASS; D1 final PASS
- **Siguiente:** ninguno


### 2026-08-31T04:00:44.515Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Cerrar Issue #2 con evidencia de Chrome Incognito real
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T03:58:13.489Z | codex | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Implementacion y QA funcional completos; se retiro el PASS incorrecto porque la ventana observada era Chrome normal
- **Verificación:** D1 4x5; invitacion intacta; Preview desktop/movil PASS; Chrome normal PASS
- **Siguiente:** Ejecutar y verificar /admin/ en una ventana Chrome Incognito real y nueva


### 2026-08-31T03:58:11.383Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Corregir reporte: gate Chrome Incognito aun pendiente
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T03:57:36.443Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Issue #2 completado: migracion D1 4x5, readiness y placeholders; Preview y Chrome Incognito OTP/Admin/Preview/Admin aprobados
- **Verificación:** npm test 424/424; lint; build; migracion 4/4; roles 11/11; acceso 37/37; D1 4x5; Chrome limpio sin errores
- **Siguiente:** ninguno


### 2026-08-31T03:55:15.757Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Completar gate Chrome Incognito limpio del Issue #2 y cerrar release QA
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T03:02:02.080Z | codex | PUBLISH
- **Estado:** blocked
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Implementada fuente unica de plantillas, migracion D1 idempotente para Santiago, readiness gate y placeholders; Preview QA desktop/movil aprobado
- **Verificación:** npm test (424/424); npm run lint; npm run build; test:migracion-santiago (4/4); test:roles (11/11); test:acceso (37/37); D1 remoto 4x5 e invitacion intacta
- **Siguiente:** Ejecutar gate manual en Chrome Incognito limpio: /admin/ -> Access OTP -> Santiago -> Preview -> salir a Admin


### 2026-08-31T02:41:34.516Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Implementar Issue #2: migración segura de rutinas Santiago, readiness guard, placeholders y QA final Incognito
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-31T00:21:02.735Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Issue #1 implementado y verificado: separación Coach/Admin vs Cliente respaldada por D1, API de identidad derivada de sesión, preview normal y superficie cliente sin controles coach; P2 táctil corregida y producción 9ea2203 verificada.
- **Verificación:** npm test 417/417; npm run lint 0 warnings; npm run build; test:roles 8/8; pruebas-acceso 37/37; dual-role production browser PASS; static/SW probes PASS; D1 QA invitation linked session exactly once, 7 days and revoked on logout; Santiago baseline unchanged; docs/cliente unchanged; fresh external Chrome Incognito NOT EXECUTED
- **Siguiente:** No READY FOR SANTIAGO todavía: repetir Scenario A en un perfil Chrome Incognito realmente limpio y adjuntar el resultado; no abrir ni consumir la invitación real de Santiago.


### 2026-08-31T00:10:56.142Z | codex | ADOPT
- **Estado:** active
- **Tarea:** Aplicar la corrección P2 detectada en QA dual-role: área táctil mínima para Ficha en móvil y retest de release
- **Cambios adoptados:** src/index.css
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-08-30T23:57:36.253Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Issue #1 implementado: separación real Coach/Admin vs Cliente; consola /admin con clientes, perfiles, rutinas y enlaces respaldados por D1; API de cliente derivada de sesión; preview con sesión normal y retorno seguro; superficie cliente sin editor Coach; migraciones 0002/0003 y documentación actualizada. La invitación final de Santiago no se modificó.
- **Verificación:** npm test (417/417); npm run lint (0 warnings); npm run build; test:roles (8/8); pruebas-acceso (37/37); migraciones D1 0002/0003 remotas aplicadas; QA dual-role local desktop/mobile; Santiago verificado sin cambios
- **Siguiente:** Esperar el despliegue Git canónico y completar OTP real de Cloudflare Access en /admin más Safari macOS/iOS antes de READY FOR SANTIAGO


### 2026-08-30T23:19:44.926Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Implementar Issue #1: separación Coach/Admin vs Cliente, gestión de rutinas respaldada por D1 y ejecutar QA dual-role completo
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T22:59:27.246Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Retest QA independiente de dcb388c/784445dd: suite local de acceso/admin 37/37; /admin propio y sin SPA, sin cabecera 403, cabecera Cf-Access falsificada no bypass en producción, root/estáticos protegidos y sw.js público sólo migración. D1 mantiene una invitación Santiago pendiente y cero sesiones activas. No se tocaron docs/cliente ni código de producto.
- **Verificación:** npm test (36 archivos, 414); npm run lint; npm run build; BASE_URL=http://localhost:8788 D1_MODO=--local node scripts/pruebas-acceso.mjs (37/37); smoke HTTPS canonical; smoke deployment 784445dd; D1 remoto
- **Siguiente:** Validación manual pendiente: OTP del coach en producción → /admin → Probar como cliente → / con imagen real; Safari iOS sigue sin dispositivo.


### 2026-08-30T22:51:59.291Z | codex | CLAIM
- **Estado:** active
- **Tarea:** QA independiente del admin y del deployment 784445dd/dcb388c: aislamiento de /admin, Probar como cliente, estáticos, sesión y pruebas finales
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T22:49:36.388Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** P1b: /admin ya no cae en la reserva de pagina unica de Pages, que servia la SPA del cliente y hacia que sus imagenes y bundles chocaran con la puerta del enlace magico. Nueva pantalla del coach en functions/admin/[[ruta]].ts con Probar como cliente (crea una sesion de participante normal y redirige a /), Generar acceso para Santiago y estado. Eliminado functions/admin/invitar.ts, que queda fundido ahi
- **Verificación:** npm test 414/414 codigo 0; lint 0 warnings; build OK; 37/37 pruebas de acceso con 5 nuevas de admin; verificado que anonimo sigue en 401 para imagenes, JS, CSS y manifest
- **Siguiente:** Codex ejecuta el regression QA final


### 2026-08-30T22:44:59.905Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** P1b: /admin sirve la SPA del cliente y sus imagenes chocan con el magic gate. Pantalla admin propia con Probar como cliente
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T22:30:27.253Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Regression final del deployment 1e116167/21d5ece completada: Chrome limpio y magic auth PASS; refresh, single-use, logout, static protection y sw.js PASS; Safari macOS limpio PASS; D1 verificado y datos qa-final limpiados; invitación Santiago intacta.
- **Verificación:** npm test (414); npm run lint; npm run build; Chrome Browser; Safari macOS privado; curl estático y sw.js; D1 remoto
- **Siguiente:** Safari iOS: NOT EXECUTED — no device available


### 2026-08-30T22:19:51.777Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Regression final del deployment canonico 1e116167/commit 21d5ece: Chrome limpio, magic auth, sesion, single-use, logout, static protection, sw.js, Safari y D1
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T22:16:38.184Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** P1: /sw.js queda exceptuado de la puerta para que las instalaciones PWA antiguas puedan descargar el service worker de autodestruccion. Antes recibian HTML con 401 en vez de JavaScript y la actualizacion fallaba, asi que el worker viejo seguia sirviendo la app cacheada saltandose la autenticacion. Se sirve con no-store, no-cache, must-revalidate. Ninguna otra ruta cambia
- **Verificación:** npm test 414/414 codigo 0; lint 0 warnings; build OK; 32/32 pruebas de acceso incluidas 5 nuevas del P1; migracion reproducida y verificada en navegador con worker antiguo instalado
- **Siguiente:** Codex ejecuta el regression QA final


### 2026-08-30T22:08:52.661Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** P1: exceptuar /sw.js de la puerta para que las instalaciones PWA antiguas puedan recibir el service worker de autodestruccion
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T21:34:44.851Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Final QA retest: P2 de magic links FIXED; 414 tests, lint y build pasan; 18/18 comprobaciones auth/D1 independientes; selector de foto y foco PASS. Resultado NOT READY: P1 de regresion, un perfil con la PWA antigua sigue controlado por sw.js y sirve el bundle viejo/registerSW.js incluso tras varias recargas, contraviniendo el aislamiento y la migracion sin service worker.
- **Verificación:** npm test (414/414); npm run lint; npm run build; auth production 18/18; mobile 360/390/412; D1 cleanup 0/0
- **Siguiente:** Corregir y verificar la migracion de service workers antiguos en un perfil previamente instalado; considerar servir publicamente solo el sw.js autodestructivo antes del middleware y probar que elimina cache, pierde control y cae en Acceso requerido. Luego repetir QA y Safari/iPhone owner smoke.


### 2026-08-30T21:21:44.902Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Final QA retest independiente del fix P2, regresion de autenticacion, UI, movil, accesibilidad y produccion
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T20:33:28.096Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** P2: el GET de /access consulta el estado de la invitacion en D1 sin consumirla y muestra la pantalla que toca (valida, ya utilizada, expirada, no activa, no valida). El POST conserva su UPDATE atomico y vuelve a decidir por su cuenta. P3-A: sustituido el control de archivo nativo de PanelProgreso por un boton propio en espanol. P3-B: anillo de foco visible por variable, con focus-within en las etiquetas de archivo cuyo input esta oculto
- **Verificación:** npm test 414/414 codigo 0; lint 0 warnings; build OK; 27/27 pruebas de acceso incluidos los 10 del P2
- **Siguiente:** Codex ejecuta el regression QA final


### 2026-08-30T20:24:57.218Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** P2: validar la invitacion en el GET de /access sin consumirla, con pantallas por estado; P3-A input de fichero en espanol; P3-B focus visible
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T20:19:32.530Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** QA de produccion completado: 410 pruebas pasan; lint y build limpios; seguridad y funciones principales verificadas. Resultado NOT READY por un P2: enlaces usados o expirados muestran Entrar en GET antes de rechazarse en POST.
- **Verificación:** npm test; npm run lint; npm run build
- **Siguiente:** Validar el token contra D1 en GET y mostrar directamente el estado invalido/expirado; luego repetir QA de acceso y Safari/iPhone.


### 2026-08-30T19:48:04.165Z | codex | CLAIM
- **Estado:** active
- **Tarea:** QA completa de producción según rúbrica de autenticación, seguridad, flujo, UI y móvil
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T19:07:41.189Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Cutover final completado. Access reducido a /admin manteniendo el comodin de previews; la raiz de produccion la protege solo el middleware. Documentado el aviso del despliegue canonico y la vuelta atras en dos pasos
- **Verificación:** npm test 410/410 codigo 0; lint 0 warnings; build OK; tests A-E anonimos en produccion 8/8; 17/17 en runtime local
- **Siguiente:** Entregar el enlace a Santiago


### 2026-08-30T19:07:38.946Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** Cierre del cutover: documentacion y comentarios (solo comentarios y docs, sin cambio de comportamiento)
- **Cambios adoptados:** docs/ACCESO.md, wrangler.toml
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-08-30T19:02:53.381Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Cutover: quitados los diagnosticos temporales (ruta /diagnostico y cabeceras X-SFM). Separadas las pantallas sin sesion: Acceso requerido para quien abre la URL sin sesion, Enlace no valido para invitacion usada o vencida, Sesion cerrada tras el logout
- **Verificación:** npm test 410/410 codigo 0; lint 0 warnings; build OK; 17/17 pruebas A-K, bypass y limpieza en el runtime real de Pages
- **Siguiente:** Reducir Access a /admin manteniendo el comodin de previews, y generar la invitacion de Santiago


### 2026-08-30T19:00:52.647Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Cutover final: quitar diagnosticos, separar pantallas sin sesion, reducir Access a /admin, invitacion de Santiago
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T18:38:51.552Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Arreglada la segunda puerta: el proyecto esta conectado a Git y el hostname sirve el despliegue canonico (github:push), no el mas reciente subido a mano. wrangler.toml con AUTH_MODE=magic estaba sin commitear, asi que el canonico seguia en access. Commiteado. Anadidos diagnosticos temporales no sensibles: cabeceras X-SFM-Auth-Middleware/Mode/Commit y ruta /diagnostico
- **Verificación:** npm test 410/410 codigo 0; lint 0 warnings; build OK; 16/16 pruebas A-K y bypass en el runtime real de Pages
- **Siguiente:** Repetir SOLO la prueba: incognito, OTP de Access, esperar Acceso caducado. Luego quitar los diagnosticos temporales


### 2026-08-30T18:12:49.552Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Paso 1 del cutover: AUTH_MODE=magic en produccion con Access completo delante, e invitacion de prueba para coach
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T18:07:03.210Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Acceso por enlace privado construido y probado, sin cutover. Cerrado el bypass de previews (Access ahora cubre el comodin). D1 santiago-acceso con invitaciones y sesiones. functions/_middleware.ts como frontera de autenticacion delante de los estaticos, con AUTH_MODE=access en produccion (nada cambia) y magic en ramas. Invitaciones de un solo uso por UPDATE atomico, sesiones opacas revocables, logout a /salir
- **Verificación:** npm test 410/410 codigo 0; npm run lint 0 warnings; npm run build OK; tsc -b OK; 16/16 pruebas A-K y bypass contra el runtime real de Pages; atomicidad verificada contra D1 remota
- **Siguiente:** Cutover: AUTH_MODE=magic en produccion, verificar, reducir Access a /admin, generar el enlace del cliente


### 2026-08-30T17:54:18.883Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Auth por enlace privado: cerrar bypass de previews, D1, middleware de Pages, invitaciones y sesiones (sin cutover)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T17:39:05.278Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Cloud-first: eliminado el service worker y la precarga PWA; anadido sw.js de autodestruccion y limpiarOffline() para desmontar cachés de versiones anteriores; HTML servido con no-store; enlace Cerrar sesion a /cdn-cgi/access/logout en Perfil; manifest estatico sin standalone para que la sesion de Access viaje; documentado el acceso en docs/ACCESO.md
- **Verificación:** npm test 397/397 codigo 0; npm run lint 0 warnings; npm run build OK; despliegue en Cloudflare Pages verificado
- **Siguiente:** Anadir el correo del cliente a la politica Cliente y coach en Zero Trust; probar login OTP end-to-end desde el movil


### 2026-08-30T17:28:38.166Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Cloud-first: quitar service worker/PWA offline, limpieza de caches previas, identidad y logout via Cloudflare Access
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T06:05:25.822Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Landing profesional en /presentacion con capturas reales de Hoy, Coach, Biblioteca, Ficha, Temporizador, Variantes y Perfil; flujo de coach y participante explicado desde el codigo y los PDFs; limites del piloto visibles; ruta principal de la app intacta
- **Verificación:** npm test: 392/392; npm run lint; npm run build; Browser/IAB 1280x720; Playwright 1488x1042 y 390x844; consola 0 errores; docs/cliente sin cambios
- **Siguiente:** Revisar la landing publicada en /presentacion y usarla para la presentacion al cliente


### 2026-08-30T05:44:14.871Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Construir landing profesional con capturas reales y funciones verificadas de la app
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T02:54:59.052Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Deduplicación de alternativas, regresión UI y migración v9 segura para días estimados; Cloudflare Pages conectado a GitHub
- **Verificación:** 389 tests; npm run lint; npm run build; QA navegador sin warnings React; Pages Git activo
- **Siguiente:** Validar el despliegue definitivo y PWA offline en el dominio HTTPS


### 2026-08-30T02:36:03.505Z | codex | CLAIM
- **Estado:** active
- **Tarea:** Corregir QA, migrar plantillas antiguas y desplegar Cloudflare Pages
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T02:30:36.693Z | codex | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** QA de solo lectura: localhost:5173 carga y las secciones principales responden; el smoke móvil reproduce 4 errores React de claves duplicadas y alternativas repetidas al abrir una ficha. El participante existente muestra sólo Upper A configurado; Lower A, Upper B y Lower B siguen Por confirmar. Wrangler está autenticado, pero la cuenta no tiene ningún proyecto Pages. No se modificó código ni docs/cliente.
- **Verificación:** npm test -- --run (33 archivos, 386/386); npm run lint; npm run build; smoke Browser 390x844 en localhost:5173; wrangler whoami; wrangler pages project list --json ([])
- **Siguiente:** Claude debe deduplicar alternativas y cubrirlo con test/browser smoke; decidir cómo provisionar los 3 días Por confirmar en participantes existentes; después crear/conectar Pages en la cuenta correcta, fijar dominio y probar HTTPS/offline en móvil. Conviene fijar Wrangler como dependencia.


### 2026-08-30T02:26:46.612Z | codex | CLAIM
- **Estado:** active
- **Tarea:** QA de estado actual, regresion movil y verificacion de autenticacion/despliegue Cloudflare
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-30T01:37:39.438Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Preparado el despliegue en Cloudflare (script npm run deploy con wrangler y respuesta a si se puede cambiar de cuenta despues) y documentadas las tres formas de probar en movil desde el Mac, con lo que cada una puede y no puede probar
- **Verificación:** npm test 386/386 codigo 0; npm run lint 0 warnings; npm run build OK; verificado que el dev server responde en la red local con index, manifiesto y fotos en 200
- **Siguiente:** Crear la cuenta de Cloudflare y decidir el dominio. Mientras tanto la app ya se prueba desde el iPhone en la red local, salvo instalacion y modo sin conexion, que exigen HTTPS


### 2026-08-30T01:37:29.914Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** Despliegue en Cloudflare y opciones para probar en movil
- **Cambios adoptados:** docs/DESPLIEGUE.md, package.json, docs/PROBAR-EN-MOVIL.md
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-08-30T01:04:18.742Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Corregida la fila de Offline: el cliente pregunto 'sin internet Y sincronizar luego' y solo esta la primera mitad; la sincronizacion es Etapa 2. Anotado ademas que el offline no lo pidio, lo decidi yo. Corregidas dos filas desactualizadas (foto de perfil y punto H) y matizada la biblioteca: las fotos son de banco libre, no de su gimnasio. El respaldo ya incluye las sustituciones del dia, que exportaba vacias en silencio
- **Verificación:** npm test 386/386 codigo 0; npm run lint 0 warnings; npm run build OK; docs/cliente sin tocar
- **Siguiente:** Desplegar en Cloudflare Pages fijando el dominio definitivo. De la especificacion V1 solo falta el video, que depende de que el cliente elija alojamiento


### 2026-08-30T01:01:41.132Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Corregir la fila de Offline y verificar en codigo que falta del plan
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-28T13:16:01.373Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Preview listo: exportar/importar los datos en un solo archivo con las fotos dentro (restaurar es idempotente y tambien se puede desde el alta, que es el caso real de movil nuevo); los tres dias que §28 dejaba vacios traen propuesta segun §4 marcada como estimado; docs/DESPLIEGUE.md y public/_headers para Cloudflare Pages
- **Verificación:** npm test 384/384 codigo 0; npm run lint 0 warnings; npm run build OK; verificacion en navegador del ciclo completo borrar base -> restaurar copia -> foto de perfil intacta a 1080x1080; cuatro dias con 5 ejercicios
- **Siguiente:** Conectar el repo a Cloudflare Pages y FIJAR EL DOMINIO DEFINITIVO antes de que el cliente escriba datos reales: IndexedDB es por origen y no viaja. Despues probar sin conexion desde el movil en modo avion


### 2026-08-28T13:05:34.679Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Preview para el cliente: exportar/importar datos, dias 2-4 con estimados y configuracion de despliegue
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-24T04:32:06.491Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Plan 2 fases 4-8: ficha del ejercicio abrible desde el entrenamiento con el historial de esa variante, sin desmontar la tarjeta (no se pierde el borrador); sistema comun de microanimaciones con tabla unica de tiempos y tests sobre la hoja de estilos; aviso de borrador recuperado, que antes se restauraba en silencio. Corregido un solape de 22px entre cronometro y barra de sesion
- **Verificación:** npm test 357/357 codigo 0; npm run lint 0 warnings; npm run build OK; QA visual 320x568 y 390x844 sin solapes ni desborde
- **Siguiente:** Paso 10: presentacion al cliente para aprobacion visual. Sigue pendiente que el cliente decida los ejercicios de Lower A, Upper B y Lower B: hoy tres de cada cuatro dias la app abre vacia


### 2026-08-24T04:25:28.734Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Plan 2 fases 4-8: ficha deslizable con historial contextual y sistema de microanimaciones
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-24T04:11:23.138Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Plan 2 fases 1-3: la siguiente serie parte de lo levantado hoy (no de la semana pasada) y el calentamiento no arrastra su peso; confirmacion al guardar con check y texto para lectores de pantalla; el ejercicio terminado se pliega y abre el siguiente; barra fija con N de M series y Terminar sesion. Corregido un solape de 22px entre el cronometro y la barra nueva
- **Verificación:** npm test 340/340 codigo 0; npm run lint 0 warnings; npm run build OK; verificacion en navegador a 390x844 de confirmacion, prellenado, barra y solape
- **Siguiente:** Plan 2 fases 4-8: ficha deslizable, historial contextual y microanimaciones. El video sigue bloqueado hasta que el cliente elija alojamiento


### 2026-08-24T04:00:30.658Z | claude-code | CLAIM
- **Estado:** active
- **Tarea:** Plan 2 Fase 1: registro de series mas rapido (confirmacion al guardar, prellenado desde la serie anterior de hoy, colapso al terminar)
- **Cambios:** Pendientes.
- **Verificación:** Árbol limpio y origin/main sincronizado antes de reclamar.
- **Siguiente:** Implementar la tarea y ejecutar las comprobaciones del contrato.


### 2026-08-24T03:44:25.048Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Plan 1 cerrado. npm test pasa de codigo 1 a codigo 0: los tests del alta esperaban solo al participante y el cleanup cerraba IndexedDB mientras se escribian sus cuatro dias. Ademas: prefers-reduced-motion, pulso del cronometro limitado a los ultimos 10s, areas tactiles a 44px (Reps estaba en 16px), portada compacta sin foto, y los 3 warnings de lint a 0 (useSegundosDesde era codigo muerto)
- **Verificación:** npm test 328/328 codigo 0; npm run lint 0 warnings 0 errores; npm run build OK; QA visual 320x568 y 390x844: sin desborde, sin contenido tapado, navegacion completa, recarga en mitad de sesion recupera el borrador
- **Siguiente:** Plan 2 (patrones de Strong) puede empezar. Pendiente: probar offline sobre dist, y 11 decisiones del cliente en este documento


### 2026-08-24T03:44:10.892Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** Plan 1: cerrar las correcciones de QA (suite verde, regresiones, accesibilidad, warnings)
- **Cambios adoptados:** docs/HANDOFF.md, src/aplicacion/useSegundosDesde.ts, src/componentes/ImagenEjercicio.tsx, src/componentes/Miniatura.tsx, src/dominio/etiquetas.ts, src/index.css, src/pantallas/Alta/AltaParticipante.test.tsx, src/pantallas/Biblioteca/Biblioteca.tsx, src/pantallas/Biblioteca/HojaEjercicio.tsx, src/pantallas/Coach/EditorSlot.tsx, src/pantallas/EntrenamientoHoy/EntrenamientoHoy.test.tsx, src/pantallas/EntrenamientoHoy/EntrenamientoHoy.tsx, src/pantallas/EntrenamientoHoy/HojaVariantes.tsx, src/pantallas/EntrenamientoHoy/TarjetaEjercicio.tsx, src/pantallas/Perfil/FichaParticipante.tsx, src/pantallas/Perfil/Perfil.test.tsx, src/pruebas/base.ts
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-08-23T17:51:07.888Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Biblioteca y perfil completos; progresión corregida; recomendaciones numéricas visibles; autosave y corrección histórica auditada; aislamiento por participante. Extra: el Coach ya abre el día que se toca (antes descartaba la elección) y se eliminó el MaxListenersExceededWarning agrupando la carga de historiales en una sola consulta (de 82 avisos a 0)
- **Verificación:** npm test (324/324); npm run lint (0 errores, los mismos 3 warnings de la línea base); npm run build; QA móvil 390x844 en base aislada: alta, foto de perfil, biblioteca completa, autosave y recuperación tras recargar, corrección histórica, deshacer conservando auditoría y ausencia de mezcla entre dos participantes
- **Siguiente:** Esperar decisiones del cliente sobre vídeo, calentamiento, sustituciones, roles, recuperación, otros tres días y calibración del gimnasio


### 2026-08-23T17:13:11.792Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** Cerrar brechas finales verificadas contra los PDFs del cliente
- **Cambios adoptados:** docs/PLAN-FEEDBACK-CLIENTE.md
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### 2026-08-23T04:44:53.112Z | claude-code | PUBLISH
- **Estado:** complete
- **Tarea:** Turno reclamado anteriormente.
- **Cambios:** Brechas prioritarias de QA del piloto: alta real de participantes con id propio (se eliminó ID_PARTICIPANTE_PILOTO del código de aplicación y sembrar() ya no crea personas); reordenar ejercicios en Coach llevándose estímulo, series, rango y descanso; override manual de la recomendación por ejercicio, distinguida como 'del coach' y con las cifras aún calculadas; registro rápido con escritura directa de peso y reps además de los steppers; y RIR representado como 5+ en los cinco puntos donde se muestra, centralizado en src/dominio/rir.ts
- **Verificación:** npm test (257/257 en verde, tres corridas seguidas); npm run lint (0 errores, los mismos 3 warnings de React de la línea base); npm run build (OK); verificación manual en navegador sobre base limpia: crear participante, registrar serie 135 lb x 8, cambiar variante conservando historial, reordenar desde Coach, fijar progresión, completar sesión y confirmar historial tras recargar
- **Siguiente:** Confirmar con el cliente dos cambios de comportamiento: la sustitución de variante ahora es 'sólo hoy' por defecto en vez de permanente, y el contador de la sesión refleja la variante sustituida (0 series) y no la original. Después, decidir la opción de video de docs/OPCION-VIDEO.md, que es lo único que queda de su punto H


### 2026-08-23T04:33:59.478Z | claude-code | ADOPT
- **Estado:** active
- **Tarea:** Implementar las brechas prioritarias de QA del piloto
- **Cambios adoptados:** docs/PLAN-FEEDBACK-CLIENTE.md, src/App.tsx, src/aplicacion/useCoach.ts, src/aplicacion/useEntrenamiento.ts, src/aplicacion/useHistorial.ts, src/aplicacion/usePerfil.ts, src/aplicacion/useVolumen.ts, src/datos/esquema.ts, src/datos/repositorio.ts, src/datos/repositorioLocal.test.ts, src/datos/repositorioLocal.ts, src/datos/semilla/index.ts, src/dominio/tipos.ts, src/index.css, src/logica/plantilla.test.ts, src/logica/plantilla.ts, src/logica/sugerencia.test.ts, src/logica/sugerencia.ts, src/pantallas/Coach/Coach.test.tsx, src/pantallas/Coach/Coach.tsx, src/pantallas/Coach/EditorSlot.tsx, src/pantallas/EntrenamientoHoy/EntrenamientoHoy.test.tsx, src/pantallas/EntrenamientoHoy/EntrenamientoHoy.tsx, src/pantallas/EntrenamientoHoy/TarjetaEjercicio.tsx, src/pantallas/Perfil/FichaParticipante.tsx, src/pantallas/Perfil/Perfil.test.tsx, src/pantallas/Perfil/Perfil.tsx, src/pruebas/configuracion.ts, src/datos/imagen.test.ts, src/datos/imagen.ts, src/dominio/progresion.ts, src/logica/participante.test.ts, src/logica/participante.ts, src/logica/progresoFisico.test.ts, src/logica/progresoFisico.ts, src/pantallas/Alta/, src/pantallas/Perfil/CamposParticipante.tsx, src/pantallas/Perfil/PanelProgreso.test.tsx, src/pantallas/Perfil/PanelProgreso.tsx, src/pruebas/participante.ts
- **Verificación:** Cambios revisados por el agente; docs/cliente permanece sin modificaciones.
- **Siguiente:** Continuar la tarea y publicar las comprobaciones al terminar.


### Línea base antes del handoff

- 184 pruebas pasaban en 18 archivos.
- El build de producción pasaba.
- El lint no tenía errores, pero mostraba tres warnings de React.
- La configuración inicial quedó publicada en el commit `37d5c17`.
