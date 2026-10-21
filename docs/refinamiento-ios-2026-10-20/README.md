# Refinamiento de experiencia iOS — diagnóstico y propuestas

Fecha: 2026-10-20. Base: `main`, producto integrado en `b42290e`, turno `34e74d9`.

El dueño pide una experiencia más cercana a Apple Fitness en **todas** las áreas.
Las funciones existentes siguen siendo la referencia. Esta entrega contiene
diagnóstico y conceptos; **todavía no cambia la interfaz**. El plan anterior de
movimiento está completo y no sustituye este trabajo de composición.

## Evidencia y límites

- App local en `/demo/cliente`, datos sintéticos en memoria. Safari del simulador
  **iPhone 16 Pro, iOS/Safari 27.0, build 24A434**, viewport 402×714. Capturas
  completas originales de SafariDriver, guardadas e inspeccionadas visualmente.
- Navegación y controles activados por DOM; esto no constituye una nueva prueba
  de gestos con dedo. La demostración incluye avisos que no representan la
  interfaz autenticada del cliente. No se atribuyen esos avisos a producción.
- Se abrió Hoy → Entrenar, se revisó Biblioteca → Progreso → Perfil, se registró
  una serie sintética de 0 lb/lado, 1 rep y RIR 2 y se cerró esa sesión parcial.
  El resumen resultante muestra 1 serie, 1 ejercicio y 6% del plan.
- El descanso capturado ya había terminado. No es evidencia de la animación de
  cuenta atrás. La primera captura de Entrenar durante una pista animada fue
  descartada y sustituida por su estado estable.
- Sin cuentas reales, cambios de rutinas, datos remotos ni PDFs modificados.
  Esta revisión no certifica accesibilidad completa, rendimiento de hardware
  antiguo, instalación PWA ni el estado de una cuenta real. Tampoco añade una
  nueva comprobación de tamaño SE. El QA físico previo del dueño sigue válido.

## Recorrido observado

| Paso | Salud funcional observada | Hallazgo visual y consecuencia | Prioridad / dirección |
|---|---|---|---|
| [Hoy](capturas/01-hoy.png) | Carga y acceso a la sesión operativos | Marca, saludo, ayuda y collage ocupan la primera vista; «Comenzar» requiere bajar. El acceso principal pierde prioridad. | Alta: cabecera compacta y acción principal visible pronto; semana y selección de día como apoyo. |
| [Entrenar](capturas/02-entrenamiento.png) → [registro](capturas/02b-registro.png) | Ejercicio y formulario operativos; una serie registrada | Foto, título y bloques informativos separan la navegación del registro. Los controles de peso/reps/RIR ocupan gran altura. | Alta: registro como centro de la pantalla; información secundaria mediante las hojas existentes. Mantener unidades, valores y ayudas accesibles. |
| [Biblioteca](capturas/03-biblioteca.png) | Lista y buscador visibles | Marca, título y recuentos compiten con búsqueda y catálogo. | Media: título único, búsqueda próxima al contenido y filas dentro de una superficie agrupada. |
| [Progreso](capturas/04-progreso.png) | Historial y opciones visibles | «Lo que estás construyendo» y métricas grandes desplazan el historial. | Alta: resumen compacto y datos reales visibles antes; conservar historial, medidas, fotos y gráfica por ejercicio. |
| [Perfil](capturas/05-perfil.png) | Perfil y datos visibles | Masthead de marca y gran nombre repiten jerarquía; los datos quedan dispersos. | Media: cabecera de cuenta y grupos claros para datos, acceso y ajustes, sin perder acciones. |
| [Descanso terminado](capturas/06-descanso.png) | Barra de descanso, progreso y terminar accesibles | Herramientas del ejercicio, siguiente, progreso, descanso y pestañas forman varias capas inferiores. | Alta: una jerarquía coherente para sesión/descanso; respetar el espacio de scroll ya corregido en PR #8. No se demostró una nueva oclusión. |
| [Resumen](capturas/07-resumen.png) | Cierre parcial y retorno disponibles | Círculo y tres cifras ya aportan un momento claro; falta integrarlo con el sistema visual del resto. | Media: conservar significado y datos, ajustar tipografía y espaciado tras elegir dirección. |

Son problemas de jerarquía y consistencia, no fallos nuevos de lógica demostrados.
No se hicieron cambios de código por la apariencia de un estado aislado.

## Referencia Apple y criterio

Se inspeccionó la imagen oficial de
[Resumen en Fitness](https://support.apple.com/en-ca/guide/iphone/iph4c34a8a95/ios)
y la guía de [barras de pestañas](https://developer.apple.com/design/human-interface-guidelines/tab-bars).
Se toman como referencia la jerarquía breve, tipografía legible, agrupación y
navegación persistente. La app conserva el fondo oscuro, rojo SFM y marca Barlow;
no incorpora anillos de actividad, calorías, Apple Watch ni nuevas funciones.

La base sigue siendo React/PWA. Build iOS Apps sirve para inspección y comprobación
en el simulador; no convierte esta interfaz a SwiftUI. La mejora puede reducir la
sensación de web, pero el resultado deberá verificarse en la app instalada.

## Tres propuestas pendientes de elección

Numeración vinculada al **orden de aparición en el chat**:

| Número | Archivo | Dirección explorada |
|---|---|---|
| 1 | [Concepto 1](propuestas/1.png) | Claridad diaria: marca visible, selección de día, semana y sesión en módulos compactos. |
| 2 | [Concepto 2](propuestas/2.png) | Sesión protagonista: sesión con foto y acción integrada; semana y ejercicios secundarios. |
| 3 | [Concepto 3](propuestas/3.png) | Rutina integrada: semana breve, ejercicios agrupados y acción persistente sobre las pestañas. |

Son imágenes de intención visual, no pantallas funcionales ni diseño aprobado.
Se generaron como tres resultados independientes con ImageGen, usando la captura
actual de Hoy y la imagen oficial de Fitness como referencias. Brief común:
390×844, español, cliente SFM, oscuro/rojo, funciones existentes, sin datos de salud
inventados ni nuevos destinos de navegación. Originales en
`~/.codex/generated_images/01a1596f-5d4b-72a1-85df-28c7562e7767/`.

**Correcciones obligatorias antes de implementar cualquiera:**

- Concepto 1: los indicadores de 0/4 no deben sugerir una sesión completada.
  Preferir filas agrupadas si las tarjetas individuales dificultan la lectura.
- Concepto 2: el generador cambió nombres/rangos de algunos ejercicios inferiores.
  Se conservarán exactamente la rutina y las prescripciones del producto.
  Ninguna foto generada sustituirá las imágenes del catálogo con procedencia.
- Concepto 3: los días LUN–JUE son una invención visual, no un calendario del
  cliente. Deben sustituirse por marcadores neutrales o información real.
- Los conceptos no muestran todos los estados: conservar sincronización,
  offline, ayudas, errores, cuenta/suscripción, variantes y bi/tri-series aunque
  no aparezcan dibujados. Mantener las tres pestañas actuales y acceso a Perfil.

## Siguiente

1. Elegir 1, 2 o 3, o indicar una combinación. La pregunta está pendiente en el
   chat. La guía de ideación exige elegir antes de comenzar implementación.
2. Llevar el sistema elegido a Hoy, Entrenar, Biblioteca, Progreso, Perfil,
   descanso, hojas y resumen en una rama con PR y preview. No unir sin visto
   bueno nuevo. No convertir el proyecto ni añadir funcionalidades del backlog.
3. Comparar referencia y resultado con al menos cinco puntos concretos:
   cabecera/primera acción, tipografía, agrupación, registro y barras inferiores;
   comprobar además contraste, foco, objetivos táctiles y textos reales.
4. QA funcional de registro → descanso → cierre → semana, bi-series, variantes,
   borradores/recuperación, navegación/hojas, movimiento reducido y estados de
   sincronización. Pantallas estrechas y anchas, Safari del 16 Pro y SE y modo
   instalado antes de solicitar la revisión del PR. El tacto físico queda al dueño.

## Validación de esta fase

- `npm test -- --maxWorkers=3`: **1054/1054**, 123 archivos, PASS.
- `npm run lint`: PASS. `npm run build`: PASS, incluye TypeScript.
- Avisos conocidos de Node/JSDOM, sin tests fallidos.
- No se ha probado un diseño nuevo: solo se ejecutó la app actual y se guardó
  evidencia del diagnóstico. El refinamiento continúa tras la elección.
