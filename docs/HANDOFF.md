# Handoff de Santiago Fitness Method

Este archivo es el registro compartido entre Codex y Claude Code. GitHub es la fuente
de verdad del código y este archivo es la fuente de verdad del turno actual. La
colaboración automática es deliberadamente serializada: un agente reclama el turno,
trabaja y lo publica antes de que el otro continúe.

## Estado actual

- **Owner:** claude-code
- **Status:** active
- **Rama coordinada:** `main`
- **Repositorio:** https://github.com/dayanivan681/santiago-fitness-method
- **Última sincronización:** 2026-08-24T04:00:30.657Z

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

## Registro de turnos

<!-- HANDOFF-ENTRIES -->

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
