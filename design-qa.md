# QA de diseño · coach claro y accionable

Fecha: 2026-10-21. Rama `codex/coach-claridad-ios`, turno `acc9ac6`.
El dueño considera buenas las alternativas y delega continuar con claridad,
enfoque y acción. Se adopta la **propuesta 1**, comunicado antes de construir.
El [informe previo del cliente](docs/refinamiento-ios-2026-10-20/implementacion/design-qa-cliente.md) se conserva como histórico.

## Referencia, captura y comparación

- Verdad visual: [propuesta 1](docs/refinamiento-coach-2026-10-21/propuestas/1.png), primer resultado mostrado, **853×1844**.
- [Render final compilado](docs/refinamiento-coach-2026-10-21/implementacion/hoy-final.jpg), **390×844**. IAB a 390×908; clip x=0/y=64/w=390/h=844 excluye solo la banda DEMO, ausente del concepto. Sin CSS inyectado ni datos falsificados para imitar una cuenta real.
- Fuente normalizada a 390×844 CSS px, densidad de comparación 1. Estado común: Nora por revisar, 3 clientes, 2 pagos pendientes, 0 sesiones esta semana, actividad de Alicia 18 oct.
- Referencia y render colocados juntos e inspeccionados con `view_image`: [completa](docs/refinamiento-coach-2026-10-21/implementacion/comparacion-final.jpg), [tarea/pagos](docs/refinamiento-coach-2026-10-21/implementacion/comparacion-tarea.jpg), [actividad/navegación](docs/refinamiento-coach-2026-10-21/implementacion/comparacion-navegacion.jpg).
- El JPEG de IAB representa el rojo de forma distinta al CSS. Se contrasta con los PNG completos de Safari [16 Pro](docs/refinamiento-coach-2026-10-21/implementacion/ios-16-hoy.png) y [SE](docs/refinamiento-coach-2026-10-21/implementacion/ios-se-hoy.png): valor calculado **#db3027**. No se cambia el color para compensar la captura.

## Iteraciones resueltas

| Iteración | Hallazgo | Cambio y evidencia posterior |
|---|---|---|
| 1 · P2 | Tarjeta demasiado alta y nombres/secciones grandes; actividad desplazada. | Ajustados altura, padding, nombre 16/500 y sección 18. [Antes](docs/refinamiento-coach-2026-10-21/implementacion/comparacion-inicial.jpg), [después](docs/refinamiento-coach-2026-10-21/implementacion/comparacion-final.jpg). Diferencia restante por controles de 48–50 px. |
| 2 · P2 | Listo exigía bajar hasta el final de Prescripción. | Acción fija dentro de la hoja, conservando campos y Quitar separado. [Antes](docs/refinamiento-coach-2026-10-21/implementacion/prescripcion.jpg), [después](docs/refinamiento-coach-2026-10-21/implementacion/prescripcion-fija.jpg). Listo y Quitar final con hit tests positivos en Safari, ambos tamaños. |
| 2 · P2 | Ver todos mantenía el filtro de pagos después de una búsqueda vacía. | Limpia consulta y filtro. Browser repite la recuperación de Alicia/Marcos/Nora; regresión añadida. El filtro de pagos sigue excluyendo a Alicia al día. |
| 3 · P1 solo desarrollo | Cerrar quedaba en saliendo tras el montaje doble de StrictMode: cleanup heredado dejaba terminado=true. | Restablecer el flag en el montaje vivo. Dos regresiones primero FALLAN, después **8/8** pruebas del hook PASS, normal/reducido. Cierre en desarrollo y cliente compilado repetidos. Producción ya cerraba en Safari; no es un fallo causado por el diseño nuevo. |

No quedan hallazgos P0/P1/P2 accionables en la entrega.

## Cinco superficies de fidelidad

| Superficie | Resultado |
|---|---|
| Tipografía | Sistema en títulos, filas, controles, hojas y pestañas; firma Barlow. Hoy 40, ficha 28, secciones 18, cuerpo 14–16, auxiliares 12–13. Calculado Hoy 700/40/44; cliente sigue 700/34/37.4. |
| Composición | Firma → Hoy/fecha → revisión/CTA → pagos → resumen → actividad → Ver clientes. Márgenes 16, grupos contenidos, sin duplicar a Nora como otra tarea. Comparaciones completas y enfocadas arriba. |
| Color | Fondo #0b0c0d, superficie #141517, elevado #1b1c1f, marca #e5352b, CTA #db3027. Blanco/CTA **4,70:1**, activo #ff685e/fondo **6,00:1**, secundario/superficie **7,01:1**. Foco y estados visibles. |
| Medios e iconos | Sin nuevas fotos requeridas. Iniciales y Lucide existentes, CreditCard para pagos. Catálogo, miniaturas/GIF e instrucciones conservados; sin técnica generada ni SVG dibujados a mano. |
| Texto y datos | Coinciden Hoy, revisión, persona, CTA, pagos, resumen, actividad, fecha y pestañas. Sin publicar solo cuando el plan no está publicado; no se infiere de revisado=false. |

### Diferencias deliberadas

- Controles **48–50 px** frente a algunos menores del dibujo; cuerpo y auxiliares legibles. Añaden algo de altura. Fidelidad estructural verificada; no se declara réplica píxel por píxel ni certificación completa de accesibilidad.
- Más pendientes, borradores y errores aparecen cuando existen. No se ocultan datos para imitar la cartera mínima del mock. Ayuda real sigue accesible y la banda DEMO queda fuera del clip comparado.
- Escritorio usa navegación lateral y columnas y conserva la lista/ficha existente. Es continuación responsive. El editor concentra el contexto; salir restaura las otras secciones y acciones.
- Guardar borrador dice que el programa actual no cambió; evita afirmar que ya hay uno publicado en un cliente que aún no lo tiene.

## Verificación funcional

| Entorno o flujo | Resultado |
|---|---|
| IAB identidad/render/overlay/consola | `/demo/coach`, contenido útil, sin overlay ni errores/avisos relevantes. Render final compilado; desarrollo durante iteración. Sin Playwright CLI. |
| 320×568 | Hoy y Biblioteca sin desborde. CTA revisión y=342–392. Buscar Smith → ficha → cerrar; Añadir → Nuevo → cerrar sin crear. |
| 390×908, clip 390×844 | Comparación, ficha, programa, editor, actividad, pagos y recuperación de búsqueda, hoja fija. |
| 1024×844 / 1440×1024 | Hoy sin desborde; columnas 472/472 a 1024. Escritorio [Hoy](docs/refinamiento-coach-2026-10-21/implementacion/hoy-desktop.jpg) y [ficha](docs/refinamiento-coach-2026-10-21/implementacion/ficha-desktop.jpg), navegación lateral y lista/ficha. |
| Programa ficticio | Nora → preparar → series 4→5 → Listo → guardar borrador → retomar conserva 5 → publicar en demo → Upper A 17 series. Hoy elimina la revisión. Sin escrituras remotas. |
| Pagos | Pendientes muestra Marcos/Nora, no Alicia. Buscar Alicia con filtro → vacío → Ver todos recupera los tres y desactiva filtro. |
| Safari 16 Pro / iOS 27.0 | 402×714; revisión visible/hit positivo, ficha/editor/hoja; Listo y Quitar final positivos, cierre operativo. [Mediciones](docs/refinamiento-coach-2026-10-21/implementacion/ios-16-mediciones.json). Capturas previas al arreglo StrictMode, mismo CSS móvil; ese arreglo afecta al montaje doble de desarrollo. |
| Safari SE / iOS 27.0, compilado final | 375×549; revisión y=354–404, Listo y=487–537: hit tests positivos. Quitar accesible al final, Listo cierra y Guardar borrador confirma el texto correcto. [Mediciones](docs/refinamiento-coach-2026-10-21/implementacion/ios-se-mediciones.json). |
| Cliente | Cambio de rol, Hoy conserva estilo/fuente y no desborda; abrir/cerrar Sentadilla devuelve a Hoy sin hoja. [Captura](docs/refinamiento-coach-2026-10-21/implementacion/cliente-regresion.jpg). Estilos propios del cliente sin cambios. |
| Checks | **1057/1057, 123 archivos**, lint, build/TypeScript y diff-check PASS. Avisos conocidos Node/JSDOM. Sin HTTP suite nueva: no se cambian API, permisos o migraciones. |

## Revisión React y límites

Hoy y fila separados para reutilizar estados e insignias; sin efectos, fetches,
modelos o dependencias nuevos. Conservados polling visible, cache/304, aislamiento
de pagos, revisión, borradores, validación y tours. El único ajuste del ciclo de
vida restablece el flag de StrictMode, cubierto por regresiones normal/reducida y
los casos previos de cierre único/desmontaje.

SafariDriver usa controles DOM: no certifica arrastres de dedo. Sin prueba nueva
de PWA instalada, VoiceOver, teclado nativo o rendimiento de hardware antiguo.
No se ejecutan cobros, subidas o invitaciones reales; solo datos sintéticos locales.
No se certifica una sesión remota autenticada de preview protegida por Access.

final result: passed
