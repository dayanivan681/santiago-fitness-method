# Plan de respuesta al análisis del cliente

Sigue la estructura de `docs/cliente/Santiago_Fitness_Method_Analisis_Actualizado.pdf`,
sección por sección, y **responde todas sus preguntas** en vez de devolvérselas.

**Punto de partida:** 140 tests en verde, la app funciona sin conexión y se
instala en el móvil.

---

## Su sección 1 — "Lo que ya está bien resuelto"

Sus nueve puntos están construidos y probados. **Nada que hacer**, sólo
confirmárselo: pantalla principal · registro serie a serie en libras con reps y
RIR · última sesión separada de mejor referencia · historial por variante · los
cuatro tipos de carga · progresión conservadora · biblioteca con sustitución sin
destruir historial · volumen semanal y perfil con limitaciones · pocas pantallas
y números grandes.

---

## Su sección 2 — Mejoras prioritarias

| | Qué pide | Qué hacemos |
|---|---|---|
| **A** | Sesiones de 5 a 8 | **Cambio.** Tope a 8; la estructura por estímulo pasa de límite a plantilla sugerida. Posiciones 6–8 entran como hipertrofia, editables. `src/logica/plantilla.ts`, `src/dominio/estimulo.ts` |
| **B** | Definir quién usa la app | **Ya está de facto.** Ver respuesta en la sección 3. |
| **C** | Tarjeta más útil | **Cambio.** Última y mejor ya están; falta el **objetivo de hoy** y la **recomendación**, que está construida (`siguienteObjetivo`) pero dejó de mostrarse al aplicar el `Design.pdf`. Se devuelve con sus cuatro etiquetas. |
| **D** | Progresión con reglas completas | **Cambio.** El veredicto pasa a considerar RIR, técnica, rango y series completadas, no sólo peso y reps. |
| **E** | Temporizador manual | **Cambio.** Hoy arranca solo al guardar. Se quita y se pone un botón visible. |
| **F** | Volumen más visual | **Cambio.** Sus cuatro estados: Dentro del objetivo · Falta volumen · Objetivo cumplido · Revisar recuperación. Hoy hay tres. |
| **G** | Limitaciones conectadas | **Añadir.** Que avise al asignar un ejercicio prohibido. **Las alternativas salen gratis**: el campo `movimiento` ya agrupa las equivalentes. |
| **H** | Biblioteca útil en gimnasio | **Casi hecho.** Falta el vídeo corto — plan en `docs/OPCION-VIDEO.md`. |
| **I** | Guardado robusto | **Parcial.** Autosave y edición ya están; falta **auditoría**: hoy corregir sobrescribe y el valor erróneo desaparece. |
| **J** | Separar MVP de futuras | **Ya se respeta.** Sin pagos, chat, nutrición, redes ni wearables. |

### Sobre E — no confundir dos cosas

El **descanso medido** que se guarda en el historial seguirá calculándose solo
desde las marcas de tiempo. Eso es dato. Lo que pasa a ser manual es **el aviso
en pantalla**.

### Sobre I — la corrección debe dejar rastro

Pide corregir *"sin perder auditoría del historial"*. Tiene razón, y es más fiel
a §19 de la guía original que lo que hay ahora: al corregir se guardará el valor
anterior en vez de sobrescribirlo.

---

## Su sección 3 — Respuestas a las doce ambigüedades

| Tema | Respuesta propuesta |
|---|---|
| **Estructura** | **5–8 editable.** El estímulo por posición queda como plantilla por defecto, nunca como tope. |
| **Usuario principal** | **Ambos, y ya funciona así.** El registro serie a serie lo hace quien levanta; editar plantillas y perfil es del coach. La app ya separa las dos cosas: el coach entra por Perfil → Estructura. No hacen falta pantallas nuevas — sólo formalizar permisos el día que haya login. |
| **RIR** | **En cada serie**, que es lo que hay. §14 pide leerlo junto a carga y reps; registrarlo sólo en la última dejaría las intermedias sin contexto y empeoraría la mejor referencia. Es un toque por serie. Si en el piloto pesa, se hace opcional. |
| **Técnica** | **Por serie y opcional**, con "Buena" por defecto. La técnica se rompe en una serie concreta, no en el ejercicio entero. Entra en el veredicto: si baja respecto a la referencia, no cuenta como progreso. |
| **"Dominar" una carga** | **Todas las series objetivo en el tope del rango, con RIR ≤ 1 y técnica no deficiente, en una sola sesión.** Hoy basta con que la mejor serie llegue al tope, que es demasiado laxo. Exigir dos sesiones frenaría de más. |
| **Incremento mínimo** | **Ya resuelto.** Campo por ejercicio, y con carga por lado reparte solo (+2.5 lb totales = +1.25 por lado). |
| **Calentamiento** | **Se registra, se marca y no cuenta**: ni para volumen, ni para las referencias, ni para el veredicto. Si contara, inflaría el volumen y ensuciaría la mejor referencia. |
| **Directas/indirectas** | **Ya resuelto.** Sólo el músculo principal suma al objetivo; los secundarios se muestran aparte. Con test. |
| **Sustituciones** | La equivalencia la define el campo `movimiento`, que mantiene el coach. **Por defecto sólo por ese día**, con opción de fijarla permanente. *(Hoy es siempre permanente — ver aviso abajo.)* |
| **Fotos de progreso** | **En el dispositivo, sin subir a ningún sitio**, con fecha. Mientras no haya cuentas, la foto no sale del móvil: eso resuelve consentimiento y permisos por construcción. Frecuencia libre, sugerencia cada 4 semanas. |
| **Finalización de sesión** | **La cierra el participante a mano**, nunca automáticamente. Se guarda lo que se hizo aunque falten ejercicios o series: §19 dice que lo registrado es lo que pasó, y una sesión a medias es un dato válido. |
| **Offline** | **Ya resuelto.** Guarda en el dispositivo y se instala como app; el gimnasio sin cobertura está cubierto. |

> **Aviso sobre sustituciones.** Hoy cambiar de variante reescribe la plantilla
> para siempre. Pero el caso más común es puntual —"la máquina está ocupada"—,
> así que el comportamiento actual es probablemente el equivocado. Conviene
> invertirlo: por defecto sólo hoy.

---

## Su sección 4 — Respuesta a la pregunta del desarrollador

> *"¿Cómo quedará preparado el sistema para incorporar mejoras sin rehacer la
> base ya desarrollada?"*

**No es una promesa: ya ha pasado tres veces en este proyecto.**

1. **Se cambió el diseño visual entero** —colores, tipografía, navegación,
   controles, disposición— sin tocar una línea de la lógica de entrenamiento.
   Los 140 tests siguieron pasando.
2. **Se añadieron campos al modelo dos veces** con migración automática, sin que
   nadie perdiera datos.
3. **El almacenamiento vive detrás de una interfaz** (`Repositorio`): pasar de
   local a nube se cambia en un archivo, no en toda la app.

La razón de fondo es que **la lógica de entrenamiento no sabe que existe una
pantalla**. Progresión, comparaciones, volumen y cargas son funciones puras,
probadas aparte de la interfaz. Por eso los cambios de este plan —5–8
ejercicios, temporizador, técnica, calentamiento— son acotados y no
reescrituras.

Los 140 tests son la red que lo hace posible: si un cambio rompe una regla
acordada, salta antes de llegar al gimnasio.

---

## Su sección 5 — Especificación V1

| Punto | Estado |
|---|---|
| 1 participante real, arquitectura para más, sin panel ficticio | ✅ Tal cual |
| Perfil: foto, datos, objetivo, frecuencia, limitaciones, notas | ⚠️ Faltan **foto** y **notas** |
| Día con 5–8 ejercicios editables y **ordenables** | ❌ Tope de 5, y no se pueden reordenar |
| Registro por serie: carga, reps, RIR, descanso; técnica si es simple | ⚠️ Falta **técnica** |
| Última + mejor + **objetivo de hoy** dentro del ejercicio | ⚠️ Falta el objetivo |
| Temporizador manual | ❌ Arranca solo |
| Historial por variante sin sobrescribir | ✅ |
| Biblioteca visual con ejercicios reales | ✅ 33 ejercicios con foto |
| Sustitución conservando historiales | ✅ |
| Progresión: Mantener / Subir reps / Subir carga mínima / Revisar-reducir, editable | ⚠️ El motor existe; falta mostrarlo y que el coach pueda fijarlo |
| Volumen directo por grupo con estado simple | ⚠️ Faltan sus cuatro estados |
| Fotos de progreso y medidas con fecha | ❌ No existe |
| Autosave y corregir errores | ⚠️ Falta la auditoría |

---

## Su sección 6 — Criterios de aceptación: marcador actual

| # | Criterio | Hoy |
|---|---|---|
| 1 | Crear un participante real en menos de 2 min | ⚠️ Sólo se edita el existente |
| 2 | Sesión de 5–8 ejercicios sin cambiar código | ❌ |
| 3 | Registrar una serie en segundos con una mano | ✅ |
| 4 | Ver la referencia sin salir del ejercicio | ✅ |
| 5 | Temporizador manual | ❌ |
| 6 | Cerrar y reabrir sin perder la serie | ✅ |
| 7 | Sustituir conservando ambos historiales | ✅ |
| 8 | Editar un dato mal ingresado | ✅ |
| 9 | Completar una sesión y verla en historial | ⚠️ "Completar" no existe |
| 10 | Clara con 8 ejercicios | ❌ Depende del 2 |

**Cinco de diez ya se cumplen.** Estos diez criterios se convierten en tests
automáticos, para que "dar por buena la V1" deje de ser una opinión.

---

## Trabajo

Agrupado por dependencia técnica, no por su orden sugerido.

**Cambios sobre lo existente**
5–8 ejercicios · temporizador manual · recomendación visible con las cuatro
etiquetas y editable por el coach · veredicto con RIR y técnica · cuatro estados
de volumen · sustitución por defecto sólo del día · auditoría al corregir.

**Añadidos al modelo**
Técnica por serie · marca de calentamiento · sesión completada · notas y foto de
perfil · medidas y fotos de progreso con fecha · reordenar ejercicios ·
limitaciones estructuradas conectadas con la asignación.

---

## Lo que hay que pedirle

**Falta un documento.** Su recomendación habla de *"cerrar las preguntas 1-18"*,
pero **este PDF contiene una sola pregunta explícita** (la de la sección 4); las
demás son las doce filas de su tabla, ya respondidas arriba. Si existe un
documento con 18 preguntas numeradas, hace falta.

**Confirmar las respuestas de la sección 3.** Están propuestas, no acordadas.
Las cinco que más cambian el comportamiento: RIR por serie, técnica por serie,
la definición de "dominar", el calentamiento que no cuenta y la sustitución sólo
por hoy.

---

## Verificación

- Los diez criterios de su sección 6, uno a uno, como tests automáticos.
- Que una serie de calentamiento no sume al volumen ni entre en las referencias.
- Que una mejora con peor técnica no se marque como progreso.
- Que corregir conserve el valor anterior.
- Crear un día de 8 ejercicios desde la app, sin tocar código.
- Que el cronómetro no arranque al guardar y sí con el botón.
- La suite completa en verde y la app probada en el móvil.
