# QA de diseño — cliente centrado en la rutina

Actualización: el dueño aprobó el merge del PR #11. Integrado en `de9a703` y
publicado; [verificación de producción](../implementacion/produccion-merge.json).
El resto del informe conserva la evidencia de la implementación previa al merge.

Fecha: 2026-10-21. Rama: `codex/cliente-rutina-ios`.
Selección del dueño: propuesta **2**, con prioridad explícita en mantener al
cliente enfocado en su rutina. Se refina el producto existente React/PWA.

## Referencia y capturas

- Verdad visual: [propuesta 2](../propuestas/2.png),
  853×1844 píxeles, normalizada a 390×844 para comparar la composición.
- Continuación del sistema para registro:
  [objetivo Entrenar](../implementacion/objetivo-entrenar.png).
  ImageGen con la propuesta elegida y el formulario actual como referencias;
  es una guía de jerarquía, conservando las reglas del producto.
- Implementación compilada, IAB a **390×844 CSS px**, captura JPEG 390×844
  (densidad normalizada 1): [Hoy](../implementacion/hoy.jpg),
  [Entrenar](../implementacion/entrenar.jpg).
- Comparaciones conjuntas abiertas e inspeccionadas con `view_image`:
  [vista completa](../implementacion/comparacion-hoy.jpg),
  [cabecera](../implementacion/comparacion-header.jpg),
  [sesión y CTA](../implementacion/comparacion-sesion.jpg).
  También se comparan juntos [el registro previsto y el real](../implementacion/comparacion-entrenar.jpg).
- Estado: Lower A, 5 ejercicios, 16 series, semana 0/4, sin registro. El mock
  muestra Alicia y 20 de octubre; el runtime usa Lucía · QA aislado y 21 de
  octubre, datos sintéticos y fecha real. No se falsificó el estado para igualarlos.
- El JPEG de IAB representa el rojo de forma distinta al valor CSS calculado.
  Se contrasta con los PNG de Safari: `#db3027` en el botón, igual al CSS.
  No se alteró el producto para compensar ese comportamiento de captura.

## Hallazgos resueltos y comparación posterior

| Iteración | Hallazgo | Cambio y evidencia posterior |
|---|---|---|
| 1 · P1 | Un `font !important` heredado conservaba el titular condensado de 48 px. | Se elimina esa prioridad y se aplica la escala del cliente: Hoy 34 px, sesión 32 px, ejercicio 21 px. Las comparaciones finales muestran la jerarquía de la propuesta. |
| 1 · P2 | Búsqueda y listas conservaban márgenes negativos del diseño anterior y llegaban al borde. | Márgenes a cero dentro del cliente, alineación con 16 px laterales. [Biblioteca final](../implementacion/biblioteca.jpg). |
| 2 · P1 | En Safari 16 Pro, «Completar serie» terminaba en y=753, bajo las pestañas que comienzan en y=638. | Ayuda contextual después del registro, identidad en fila, menos huecos y explicación RIR a todo el ancho. Resultado compilado: botón termina en y=561, pestañas en y=638. Sin quitar referencias, RIR ni ayudas. |
| 2 · P2 | Un margen antiguo de 24 px sobre «Comenzar» y la ayuda entre sesión/semana desplazaban la lista. | CTA sin margen heredado; ayuda al final del contenido; agrupación más compacta. Comparación final completa y enfocada arriba. |
| 3 · P2 | La foto del SE recortaba parte de la cabeza al centrar verticalmente una imagen de poca altura. | Foco superior de la foto; el recorte decorativo conserva cabeza y barra. La ficha sigue ofreciendo el medio completo del catálogo. [Pantalla SE final](../implementacion/ios-se-pantalla.png). |

No quedan hallazgos P0/P1/P2 accionables dentro de esta implementación.

## Cinco superficies de fidelidad

| Superficie | Comparación y resultado |
|---|---|
| Tipografía | Familia de sistema para lectura y controles, firma Barlow; pesos 500–700. Se revisan títulos, nombres largos, valores, etiquetas, pasos, fechas, pestañas, herramientas y hojas. Se eliminan mayúsculas condensadas heredadas de esos controles del cliente. |
| Espaciado y composición | Cabecera breve → selector → foto/sesión/CTA continuo → semana → filas agrupadas. Márgenes de 16 px, tarjeta de sesión 20 px, grupos 18 px y barra de pestañas 36 px. Se mantiene la jerarquía elegida; los controles reales de 44–50 px requieren algo más de altura que los dibujados. |
| Color y tokens | Fondo `#0b0c0d`, superficie `#141517`, elevado `#1b1c1f`, rojo SFM `#e5352b`. Acción `#db3027` con blanco: contraste calculado **4,70:1**. El rojo de acción es un ajuste de contraste, no otra identidad. Foco y avisos siguen visibles. |
| Calidad y fidelidad de medios | Hero y miniaturas usan fotos existentes del ejercicio elegido, sin filtros desaturados. No se usa la foto generada del mock como prueba de técnica. Se conservan medios del catálogo, su procedencia y la ficha completa. Sin assets nuevos de ejercicios ni dibujos de sustitución. Iconos del mismo catálogo Lucide, incluido Play. |
| Texto y datos | «Hoy», «Comenzar entrenamiento», «Semana», «Tu sesión, paso a paso» y las tres pestañas siguen la propuesta. Nombres, series/reps, lb/lado, equipo, RIR, progreso y variantes proceden del producto. Se descartan los ejercicios/rangos inventados por ImageGen. El modo continuar, sesión terminada y día vacío conservan su comportamiento. |

### Diferencias deliberadas respecto al mock

- La foto corresponde al catálogo real; no se genera ni sustituye técnica.
- El mock omite sincronización y ayuda. El producto conserva ambas: éxito como
  botón de nube con nombre accesible; offline, pendientes y conflictos con texto
  visible. La ayuda inicial se mantiene después de la tarea principal.
- Objetivos táctiles de al menos 44 px y texto real con saltos naturales. Por eso
  se ven menos filas completas antes de bajar que en la imagen generada.
- La barra de progreso/cierre aparece cuando existe sesión, como antes. No se
  inventa una sesión vacía para reproducir el dibujo de Entrenar.
- «Terminar sesión» es secundario frente a «Completar serie». Prescripción,
  última vez y mejor referencia siguen siendo datos distintos y visibles.

Estas diferencias responden a las funciones existentes y a la prioridad elegida;
no se presenta el resultado como una réplica píxel por píxel.

## Verificación funcional y adaptable

| Comprobación | Resultado |
|---|---|
| IAB, compilado local, 320/390/1024 px | Hoy, Biblioteca y Progreso sin desborde horizontal; cabecera real con nube, ayuda y avatar cabe a 320 px. Perfil y hoja revisados a 390 px. |
| Safari iPhone 16 Pro, iOS 27.0 | Viewport 402×714. Comenzar termina en y=496, pestañas en y=638; primer registro termina en y=561. Fotos cargadas y cabecera legible. |
| Safari SE 3.ª generación, iOS 27.0 | Viewport 375×549. Comenzar termina en y=413, pestañas en y=473. Guardar accesible tras scroll, hit test positivo. Registro y cierre parcial operativos. |
| Capas inferiores SE | Progreso y=341–403; descanso y=407–469; pestañas y=473–541. Separación de 4 px, cierre con hit test positivo. El contenido conserva espacio de scroll. |
| Registro → descanso → resumen → Hoy | Demo: 25 lb/lado, 4 reps, RIR 3 confirmados; volver desde Biblioteca conserva sesión y reloj. Resumen 1 serie / 1 ejercicio / 6%; semana 1/4. Repetición local positiva en SE. |
| Bi-serie de demo Upper B | A1 → A2 sin descanso; después A2 → A1, ronda 2 y descanso 2:00. Series pendientes mantienen «6–15 reps» y unidades reales. Se repitió el primer toque desde el estado estable tras la transición de la hoja. |
| Hojas y navegación | Biblioteca → buscar → ficha → cerrar; lista del día y saltar de ejercicio; navegación entre pestañas y perfil. No se cambian `useCapa`, Escape, historial, foco ni gestos. |
| Movimiento reducido | IAB emulado: preferencia detectada, transición de Guardar `0s`, animación de puntos `none`; guardar y resumen 1/1/6 operativos. Emulación restaurada. No es una prueba nueva de Ajustes del iPhone. |
| Consola de la app | IAB: sin errores en las vistas revisadas. |
| Suite | **1054/1054**, 123 archivos; lint, build/TypeScript y diff-check PASS. Avisos conocidos de Node/JSDOM. |

No se usó Playwright CLI ni se modificaron cuentas o rutinas remotas. SafariDriver
activó controles DOM: no se atribuyen a esos clics gestos físicos. Capturas de
pantalla completa del simulador se obtienen también con `simctl io screenshot`;
las capturas de página de SafariDriver no se confunden con el chrome del sistema.

## Revisión React

Sin dependencias, endpoints ni modelos nuevos. Se reutilizan repositorio, hooks,
memoria de día/ejercicio, validación, borradores y proveedor de descanso. Sin
efectos nuevos ni lecturas de datos adicionales. Props opcionales conservan la
cabecera por defecto para consumidores existentes. Los tests de demo verifican
ahora el saludo como texto y esperan la ayuda que carga con la sesión; la prueba
semanal conserva el avance y el atributo accesible del medidor.

## Límites y seguimiento

- Nueva instalación PWA, gesto con dedo y rendimiento de un iPhone físico no
  repetidos en esta entrega. El QA físico anterior permanece como histórico,
  no como una prueba de este nuevo diseño. Revisar la preview instalada antes
  de dar el visto bueno al merge.
- No es una certificación completa de accesibilidad. Se comprueban nombres
  accesibles, tamaños, contraste del CTA, foco de las hojas y desbordes concretos.
- P3: el vacío heredado de Progreso comparte textos en tercera persona con el
  coach; una futura revisión de textos puede separar ambas voces.
- Guardar o sincronizar con errores conserva las pruebas existentes; no se
  forzaron fallos de red nuevos en una cuenta remota.

## Lista de cierre

- [x] Propuesta elegida y capturas actuales comparadas juntas.
- [x] Cabecera, CTA, agrupación, tipografía, tokens, medios y texto revisados.
- [x] Flujo principal y bi-serie operativos; tamaños pequeño y grande revisados.
- [x] Pruebas, lint, TypeScript/build y consola revisados.
- [x] Código preparado en rama para PR/preview, sin merge autorizado.

final result: passed
