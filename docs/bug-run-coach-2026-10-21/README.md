# Bug run del coach tras el PR #12 — 2026-10-21 (claude-code)

Recorrido solicitado por el dueño después de integrar el refinamiento del coach.
Todo se ejecuta sobre el **build compilado** de `e251a38` servido en
`http://localhost:4173` (`npm run preview`), con la demo sintética
(`/demo/coach`, `/demo/cliente`). Ninguna escritura remota: producción sólo se
consultó con GET en el turno anterior.

Entorno: navegador integrado, viewport 375×812 (iPhone SE/13 mini), tema oscuro.

## Resultado

Dos fallos reproducibles, ninguno bloqueante. El recorrido principal del coach
(Hoy → revisar programa → ficha → preparar cambios → Prescripción/Listo →
guardar / retomar / publicar) y la regresión del cliente pasan sin errores de
consola.

## Fallos

### 1. Publicar no retira el borrador guardado (P2)

**Reproducción**

1. `/demo/coach` → «Revisar programa» (Nora Díaz) → «Preparar cambios».
2. Abrir la prescripción del ejercicio 01, poner 5 series y 25 lb → «Listo».
3. «Guardar borrador» → la ficha muestra «Borrador disponible · Retomar
   programación».
4. «Retomar programación» → «Revisado · Publicar programa».

**Esperado:** publicado el programa, el borrador ya no existe: lo que contenía
está en vivo.

**Observado:** la ficha muestra «Programa actual · Publicado» con las 17 series
correctas **y a la vez** sigue ofreciendo «Borrador disponible · Retomar
programación». Al tocarlo se vuelve a abrir el editor con el mismo contenido que
ya está publicado; si se guarda otra vez, el programa publicado queda de nuevo
con un borrador pendiente.

**Causa:** `guardar(true)` en [`src/producto/Coach.tsx`](../../src/producto/Coach.tsx)
escribe el documento `programa` pero nunca borra ni sustituye el documento
`borrador`; la tarjeta se pinta mientras exista ese documento.

**No ocurre** si se publica sin haber guardado antes un borrador.

**Efecto para Santiago:** la ficha le dice que tiene trabajo a medias cuando no
lo tiene. No se pierde ni se publica nada incorrecto.

### 2. El filtro de pagos vuelve al recargar (P3)

**Reproducción**

1. `/demo/coach/clientes?pagos=pendientes` (la ruta del aviso «2 pagos
   pendientes» de Hoy) → se ven 2 clientes.
2. Buscar un texto sin coincidencias → «Ver todos los clientes» (o tocar el chip
   para desactivarlo). La lista vuelve a los 3 clientes y el chip queda
   `aria-pressed="false"`: correcto.
3. Recargar la pantalla.

**Esperado:** seguir viendo los 3 clientes.

**Observado:** vuelven a verse sólo los 2 con pago pendiente, porque la URL
conserva `?pagos=pendientes`.

**Causa:** `soloPagos` se inicializa una vez desde la URL en
[`src/producto/Coach.tsx`](../../src/producto/Coach.tsx) y el chip sólo cambia
el estado de React; la query no se actualiza.

**Efecto para Santiago:** en la app instalada, volver a esa pantalla reaplica un
filtro que él ya había quitado. La corrección del PR #12 («Ver todos» también
limpia el filtro) funciona dentro de la sesión; esto es lo que queda.

## Comprobado y correcto

- **Hoy:** la tarjeta de revisión señala al cliente correcto y desaparece en
  cuanto se publica; el resumen pasa a «Tus clientes».
- **Prescripción:** 4→5 series y 25 lb por lado se reflejan en la fila
  («5 × 1–5 · 3 min · 25 lb por lado sugeridas»); «Listo» cierra la hoja.
- **Guardar borrador:** avisa «El programa actual no ha cambiado» y el programa
  publicado conserva sus 16 series.
- **Retomar:** devuelve el borrador íntegro (5 series y 25 lb).
- **Publicar:** «Programa publicado», sesión 01 pasa a 17 series.
- **Pagos, búsqueda y vacíos:** el filtro muestra 2; la búsqueda sin resultados
  da «No encontramos esa persona» con salida a «Ver todos los clientes», que
  limpia búsqueda **y** filtro (regresión del PR #12 verificada).
- **Biblioteca:** 57 ejercicios agrupados por músculo, sin desborde horizontal.
- **Cierre y foco de las hojas:** `<dialog>` modal real (`:modal`), el fondo no
  es alcanzable, Escape cierra con su animación y el foco vuelve al elemento que
  abrió la hoja.
- **Áreas táctiles:** en editor, Biblioteca y pantalla de entrenamiento, todos
  los elementos interactivos miden ≥44×44 px (45, 65 y 37 elementos medidos).
- **Cliente:** comenzar sesión → peso/reps/RIR → «Completar serie» guarda, abre
  la serie 2 con los valores arrastrados y muestra «1 de 16 series» y «Terminar
  sesión». Sin errores de consola en ninguna pantalla.

## Límites de esta prueba

- **Movimiento reducido no se emuló en vivo.** El navegador integrado no expone
  `prefers-reduced-motion`. Queda verificado por código y pruebas:
  `usePresencia` cierra de inmediato cuando el sistema pide reducir movimiento y
  tiene un temporizador de respaldo de 260 ms si `animationend` no llega
  (`src/aplicacion/usePresencia.ts`, `src/componentes/HojaCapa.test.tsx`).
- Sin teléfono físico, sin instalación PWA nueva, sin VoiceOver ni teclado
  nativo.
- Sin sesión remota autenticada ni escrituras reales: la demo reinicia su estado
  al recargar, así que la persistencia de cada fallo se contrastó también en el
  código.
- Al desactivar el filtro con el chip, el fondo de una hoja abierta puede
  desplazarse si se arrastra sobre el margen superior (5 % de la pantalla); se
  recoloca al cerrar. No se registra como fallo.

## Checks

`npm test` 1067/1067 en 125 archivos · `npm run lint` · `npm run build` con
TypeScript · `git diff --check`. Avisos conocidos Node MaxListeners y JSDOM.
