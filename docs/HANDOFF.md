# Handoff de Santiago Fitness Method

Este archivo es el registro compartido entre Codex y Claude Code. GitHub es la fuente
de verdad del código y este archivo es la fuente de verdad del turno actual. La
colaboración automática es deliberadamente serializada: un agente reclama el turno,
trabaja y lo publica antes de que el otro continúe.

## Estado actual

- **Owner:** codex
- **Status:** active
- **Rama coordinada:** `main`
- **Repositorio:** https://github.com/dayanivan681/santiago-fitness-method
- **Última sincronización:** 2026-08-30T23:19:44.925Z

Hay cambios sin commit que existían antes de instalar este protocolo. No se han
tocado ni incluido en esta configuración:

- `docs/PLAN-FEEDBACK-CLIENTE.md`
- `src/pantallas/EntrenamientoHoy/EntrenamientoHoy.test.tsx`
- `src/pantallas/Perfil/Perfil.test.tsx`
- `src/pruebas/configuracion.ts`

El primer agente que adopte esos cambios debe revisarlos explícitamente y publicar su
resultado. No se deben borrar ni sobrescribir para liberar el turno.

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
- Temporizador manual.
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

<!-- HANDOFF-ENTRIES -->

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
