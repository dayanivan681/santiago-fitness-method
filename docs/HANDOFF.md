# Handoff de Santiago Fitness Method

Este archivo es el registro compartido entre Codex y Claude Code. GitHub es la fuente
de verdad del código y este archivo es la fuente de verdad del turno actual. La
colaboración automática es deliberadamente serializada: un agente reclama el turno,
trabaja y lo publica antes de que el otro continúe.

## Estado actual

- **Owner:** unassigned
- **Status:** complete
- **Rama coordinada:** `main`
- **Repositorio:** https://github.com/dayanivan681/santiago-fitness-method
- **Última sincronización:** 2026-09-06T23:11:00.428Z

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
