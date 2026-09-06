# Phase M2 — Experiencia móvil de la App Cliente

Sube la app del participante al nivel que M1.1 dejó en la consola del coach.
Referencia: 390×844. No cambia autenticación, D1, identidades, ids de ejercicios,
rutinas, historial ni la landing.

## Auditoría

Hecha sobre producción y sobre el código, antes de tocar nada. Tres cosas que el
encargo daba por supuestas no eran ciertas:

1. **No existía «Comenzar entrenamiento».** Hoy *era* el entrenamiento: abría con
   el primer ejercicio desplegado y sus cuatro series listas para guardar. Un
   ejercicio abierto sumaba **~40 controles tocables** (3 enlaces + 9 botones por
   serie) sobre 2,1 pantallas de scroll. La sesión se creaba sola al guardar la
   primera serie. Ése era el problema de fondo, y era de composición.
2. **La barra de vista previa del Coach ya existía** (`src/App.tsx`), con
   «Volver al Coach» y sus literales fijados por `src/pruebas/shellMovil.test.ts`.
   El apunte de `docs/HANDOFF.md` que la daba por pendiente estaba obsoleto.
3. **La Biblioteca era una rejilla de fotos por petición del cliente**
   (`docs/PLAN-FEEDBACK-CLIENTE.md`, «Biblioteca visual con ejercicios reales») y
   no tenía búsqueda.

### Qué delataba «web», pantalla por pantalla

| Pantalla | Evidencia |
|---|---|
| Todas | `.app { max-width: 520px; margin: 0 auto }` y `.contenido { padding: 14px }`: nada llegaba al borde. Cabecera kicker + título en versalitas en las cuatro. |
| Hoy | Tarjeta dentro de tarjeta dentro de tarjeta: `.ejercicio` → `.ejercicio__detalle` → `.serie` → `.valor`. Portada «Foto del día» de relleno con lema fijo. Párrafo explicativo permanente al pie. |
| Biblioteca | Rejilla de 2 columnas de tarjetas con foto y párrafo. Sin búsqueda. `<h2>` dentro de `<button>`. Filtrar sin resultados dejaba la pantalla en blanco, sin decirlo. |
| Historial | Dos tarjetas de resumen + tarjeta de sesiones con rayado cebra. |
| Perfil | Cuatro paneles con borde; el formulario de medición —siete campos— siempre abierto dentro de una tarjeta, con tarjetas dentro. Tres `style={{ height: 38/40 }}` incumplían los 44 px. |
| 1024 | Columna de 520 px centrada en un campo negro: un teléfono en medio de la nada. |

## Decisiones

### Entrenar es un modo, no la pantalla de inicio

`Hoy` responde ahora a una sola pregunta —qué toca hoy— y el registro vive en
`Entrenamiento`. El estado `entrenando` vive en `App` y **no se persiste**: tras
recargar se aterriza en el resumen con «Continuar», que es honesto y no abre una
pantalla completa por sorpresa.

El modo vive **dentro de la pestaña Hoy**. Salir a la Biblioteca durante el
descanso y volver devuelve al ejercicio en curso, que es como se comporta una
app y es además una regresión cubierta por `pruebas-maestro/qa-movil.yaml`.

### La barra de pestañas se queda

El encargo pedía evaluar si ocultarla en el workout. La evaluación dice que no:

- salir a consultar algo durante el descanso es un flujo real, y el flujo de
  Maestro lo prueba explícitamente;
- toda la pila inferior —cronómetro, barra de sesión, reserva del contenido—
  cuelga de `--sobre-pestanas`, que asume 73 px abajo. Quitarla sin rehacer ese
  contrato reabriría QA‑MOB‑01, que costó dos ciclos de QA cerrar.

Lo que hace el modo enfocado no es esconder cromo, es enseñar **un ejercicio**.

### Un ejercicio y una serie a la vez

Sólo se abre la serie que toca —la primera sin registrar—. Las siguientes
esperan en una línea con su punto de partida y se abren tocándolas, porque
registrar fuera de orden es legítimo pero no es lo normal. Las ya guardadas
colapsan a una línea legible: `Serie 1 ✓ peso 45 reps 10 RIR 2 · Editar`.

Cuatro bloques de steppers idénticos uno debajo de otro eran el formulario.

### Biblioteca: filas con miniatura

Con los 293 de la Fase 3B en camino, una rejilla de tarjetas con foto son ~150
filas de scroll con imágenes pesadas, y los nombres del método —«Press de pecho
convergente horizontal»— ocupan tres líneas dentro de media tarjeta.

§15 se mantiene: la miniatura sigue en cada fila y la foto grande vive en la
ficha, que es donde de verdad se estudia un ejercicio. Se añade la búsqueda que
faltaba —un solo campo, sin botón de lupa— y el estado vacío al filtrar.

### Perfil

El formulario de medición pasa a abrirse con «Añadir medición»: siete campos
vacíos eran lo primero que se veía al entrar. Los paneles pierden el borde y se
leen como secciones. Se corrigen los tres altos fijos por debajo de 44 px.

### Vista previa del Coach

Ya existía; se afinó la copia. Antes decía «Vista previa» —lenguaje de
herramienta—; ahora dice **«Vista de \<nombre\>»**, que es lo único que el coach
necesita saber. La etiqueta accesible y el enlace no cambian, porque están
fijados por pruebas.

### Teclado

No había `enterKeyHint` en ningún sitio y la tecla de retorno sólo cerraba el
campo. Ahora encadena: **peso → reps → guardar**, sin cerrar y volver a abrir el
teclado. El RIR sigue siendo un botón cíclico, que no tiene teclado que encadenar.

## Restricciones respetadas

Fijadas por pruebas que leen ficheros como texto, no negociables:

- **Gramática de etiquetas ARIA**: `Peso de la serie N de <ejercicio>`,
  `Guardar…`, `Editar…`, `Subir/Bajar…`, `Marcar … como calentamiento`,
  `Deshacer la corrección…`. Intactas.
- **Contrato de geometría inferior** (`src/pruebas/pilaInferior.ts`): los cinco
  selectores, los tokens, `calc()` sólo de sumas y la igualdad exacta al parar
  el cronómetro. Sin tocar.
- **Copia literal** de Vitest y Maestro. Conservada.
- **Lógica**: orden guardar → descanso → avanzar; sin descanso en calentamiento;
  `claveDeBorrador` memoizada; `--alto-cronometro` escrito sin estado de React;
  identidad del cliente sólo en servidor.

## Antes y después (390×844)

| | Antes | Después |
|---|---|---|
| Hoy | 2,1 pantallas, 55 botones, primer ejercicio desplegado | 1 pantalla, plan legible, **una** acción |
| Ejercicio | 3 niveles de caja, 4 series abiertas | nombre dominante, datos en línea, 1 serie abierta |
| Biblioteca | rejilla de tarjetas, sin búsqueda | filas con miniatura + búsqueda + vacío |
| Historial | 2 tarjetas + tarjeta cebra | 2 líneas + lista a sangre |
| Perfil | 4 paneles, formulario de 7 campos abierto | secciones planas, medición bajo demanda |
| 1024 | columna suelta en negro | columna con superficie y filo, deliberada |

## Verificación

- `npm test` **693/693** (666 antes; +27 nuevas), 59 ficheros
- `npm run lint`, `npm run build`: PASS
- `npm run test:movil` (Maestro): **PASS**, incluidas QA‑MOB‑01 y QA‑MOB‑02 y la
  vuelta al ejercicio en curso desde Biblioteca
- QA visual a **320×667, 390×844, 430×932, 768 y 1024**: sin scroll horizontal,
  cero elementos fuera de marco
- Flujos A–F recorridos a mano, incluido `/admin` → Probar como cliente →
  navegar → Volver al Coach

### Pruebas nuevas

`src/pantallas/EntrenamientoHoy/Hoy.test.tsx` (10): el corte entre resumen y
modo, un ejercicio a la vez, la serie en turno, y el encadenado de teclado.
`src/pruebas/composicionCliente.test.ts` (13): las decisiones de composición que
no se pueden perder sin volver atrás.
`src/logica/busqueda.test.ts` (4): buscar sin tilde encuentra con tilde.

### Un fallo del entorno que estaba tapado

El flujo de Maestro **no podía arrancar** desde que la demo pública fija la
identidad a `cliente-1`: ese cliente no existe en la D1 local, así que
`/api/cliente` respondía 404 para cualquier sesión y la app se quedaba en el
alta. Se documenta en la cabecera del flujo y se resuelve poniendo
`PUBLIC_DEMO_CLIENT_ID = ""` en `.dev.vars`. No afecta a producción.

## Limitaciones declaradas

- **No pude validar el teclado real de un iPhone ni la PWA en standalone.** Todo
  el QA es emulación Chromium. `enterKeyHint` e `inputMode` están puestos y
  probados como atributos, pero cómo los pinta iOS hay que verlo en un teléfono.
- El estado pulsado y las transiciones se comprueban por CSS y a ojo en el
  emulador, no con medición de latencia real.

## Deuda pendiente

- **Actividad reciente en Hoy.** El boceto la pedía; `useHistorial` es por
  ejercicio y añadirla habría metido una consulta viva más en el home por una
  fila decorativa. Queda para cuando haya un resumen de sesiones barato.
- **Sin estimación de duración** en Hoy: no existe el dato y no se inventa.
- **Pantalla de cierre de sesión.** Hoy, al terminar, se muestra la nota de
  siempre. Un cierre con el resumen de lo hecho queda pendiente.
- **`PanelRespaldo` sigue huérfano** (no lo importa nadie, sus pruebas negativas
  siguen valiendo). Retirarlo es limpieza no pedida.
- **`.filtro` sigue sobrecargado**: píldora de pestaña, chip y botón de archivo a
  la vez.
- El detalle de sesión del Historial sigue siendo una expansión en línea con el
  editor de series, no una pantalla propia.
