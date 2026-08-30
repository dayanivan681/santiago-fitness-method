# Plan de respuesta al análisis del cliente

Sigue la estructura de `docs/cliente/Santiago_Fitness_Method_Analisis_Actualizado.pdf`,
sección por sección, y **responde todas sus preguntas** en vez de devolvérselas.

**Punto de partida:** 140 tests en verde, la app funciona sin conexión y se
instala en el móvil.

**Estado al 22 de agosto de 2026:** 245 tests en verde; la lógica del método,
que es donde viven sus reglas, cubierta al 99%. **Su especificación V1 está
completa y sus diez criterios de aceptación se cumplen.** Lo único que queda
abierto es el vídeo corto de la biblioteca (su punto H), que espera a que elija
entre las dos opciones de `docs/OPCION-VIDEO.md`.

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
| **A** | Sesiones de 5 a 8 | ✅ **Hecho.** Tope a 8; la estructura por estímulo pasa de límite a plantilla sugerida. Posiciones 6–8 entran como hipertrofia, editables. `src/logica/plantilla.ts`, `src/dominio/estimulo.ts` |
| **B** | Definir quién usa la app | **Ya está de facto.** Ver respuesta en la sección 3. |
| **C** | Tarjeta más útil | ✅ **Hecho.** Última y mejor ya están; falta el **objetivo de hoy** y la **recomendación**, que está construida (`siguienteObjetivo`) pero dejó de mostrarse al aplicar el `Design.pdf`. Se devuelve con sus cuatro etiquetas. |
| **D** | Progresión con reglas completas | ✅ **Hecho.** El veredicto pasa a considerar RIR, técnica, rango y series completadas, no sólo peso y reps. |
| **E** | Temporizador manual | ✅ **Hecho.** Hoy arranca solo al guardar. Se quita y se pone un botón visible. |
| **F** | Volumen más visual | ✅ **Hecho.** Sus cuatro estados: Dentro del objetivo · Falta volumen · Objetivo cumplido · Revisar recuperación. Hoy hay tres. |
| **G** | Limitaciones conectadas | ✅ **Hecho.** El perfil lleva una lista de ejercicios a evitar; al asignar uno, el coach recibe el aviso con las equivalentes y las cambia de un toque. Avisa, no bloquea. |
| **H** | Biblioteca útil en gimnasio | ✅ **Hecho salvo el vídeo.** La ficha reúne foto, equipo, tipo de carga, músculo principal, secundarios, instrucciones breves y alternativas equivalentes, y se abre también desde el entrenamiento con el historial de esa variante. Escribe *"foto/video corto"*: la foto ya está, así que **el vídeo parece opcional — conviene confirmarlo** (`docs/OPCION-VIDEO.md`). |
| **I** | Guardado robusto | ✅ **Hecho.** Autosave, edición y ahora **auditoría**: al corregir, el valor anterior se apila con su hora en vez de desaparecer. |
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
| **Offline** | **Media respuesta, y conviene decirlo claro.** Usted pregunta si el registro debe *"funcionar sin internet **y sincronizar luego**"*. Lo primero está: la app se instala y guarda en el dispositivo, así que el gimnasio sin cobertura queda cubierto. **Lo segundo no existe**: no hay sincronización, y es Etapa 2 (§31), porque exige cuentas y base de datos en la nube. Mientras tanto, la copia de seguridad del perfil es la única forma de mover datos entre dispositivos. Falta además comprobarlo publicado: el servidor de desarrollo no activa el modo sin conexión. |

> **Sustituciones: ya está invertido.** Antes, cambiar de variante reescribía la
> plantilla para siempre. Ahora al cambiar se elige entre **Sólo hoy** (por
> defecto) y **Fijar en la plantilla**. La tarjeta del día queda marcada "Sólo
> hoy" y mañana vuelve la variante asignada. **Es un cambio de comportamiento
> que conviene que confirme.**

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
| 1 participante real, arquitectura para más, sin panel ficticio | ✅ La app ya no siembra a nadie: el coach lo da de alta al abrirla |
| Perfil: foto, datos, objetivo, frecuencia, limitaciones, notas | ✅ Los seis, foto de perfil incluida (distinta de las de progreso) |
| Día con 5–8 ejercicios editables y **ordenables** | ✅ Se ordenan con flechas, y el ejercicio se lleva su programación |
| Registro por serie: carga, reps, RIR, descanso; técnica si es simple | ✅ Técnica incluida, con "Buena" por defecto |
| Última + mejor + **objetivo de hoy** dentro del ejercicio | ✅ |
| Temporizador manual | ✅ Lo arranca el participante |
| Historial por variante sin sobrescribir | ✅ |
| Biblioteca visual con ejercicios reales | ⚠️ 33 ejercicios con foto y ficha completa. **Las fotos son de un banco libre, no de su gimnasio**, y los ejercicios son los que suponemos que usa: eso sí necesita su confirmación |
| Sustitución conservando historiales | ✅ Y ahora distingue sólo hoy de permanente |
| Progresión: Mantener / Subir reps / Subir carga mínima / Revisar-reducir, editable | ✅ El coach la fija por ejercicio; el objetivo se sigue calculando |
| Volumen directo por grupo con estado simple | ✅ Sus cuatro estados |
| Fotos de progreso y medidas con fecha | ✅ En el dispositivo, con peso, cintura, pecho, brazo y muslo |
| Autosave y corregir errores | ✅ Con auditoría del valor anterior |

---

## Su sección 6 — Criterios de aceptación: marcador actual

| # | Criterio | Hoy |
|---|---|---|
| 1 | Crear un participante real en menos de 2 min | ✅ Un formulario con estimados; sólo hay que escribir el nombre |
| 2 | Sesión de 5–8 ejercicios sin cambiar código | ✅ |
| 3 | Registrar una serie en segundos con una mano | ✅ |
| 4 | Ver la referencia sin salir del ejercicio | ✅ |
| 5 | Temporizador manual | ✅ Con test de que no arranca al guardar |
| 6 | Cerrar y reabrir sin perder la serie | ✅ |
| 7 | Sustituir conservando ambos historiales | ✅ |
| 8 | Editar un dato mal ingresado | ✅ |
| 9 | Completar una sesión y verla en historial | ✅ La cierra el participante |
| 10 | Clara con 8 ejercicios | ✅ Test de los ocho en pantalla; el visto bueno visual es suyo |

**Los diez se cumplen.** Ocho son tests automáticos, así que "dar por buena la
V1" deja de ser una opinión. Los otros dos —registrar con una mano y que la
pantalla siga clara con ocho ejercicios— los cubre un test hasta donde puede
llegar (que el registro funcione, que los ocho aparezcan); la ergonomía la juzga
usted con el móvil en la mano.

Sobre el nº1: su especificación pide *"sin panel ficticio de clientes"*, así que
la app dejó de sembrar un participante inventado. Una instalación nueva abre
directamente en el alta, con todos los campos ya rellenos con estimados —sexo,
edad, estatura, peso, objetivo y frecuencia— y sólo hay que escribir el nombre.
Al crearlo, entra en el entrenamiento del día. Quien ya tenía datos no pierde
nada: sigue con su participante y su historial.

---

## Trabajo

Agrupado por dependencia técnica, no por su orden sugerido.

**Hecho**
Alta del participante real · 5–8 ejercicios · temporizador manual ·
recomendación visible con sus cuatro etiquetas · veredicto con RIR y técnica ·
cuatro estados de volumen · sustitución sólo del día con opción de fijarla ·
auditoría al corregir · técnica por serie · marca de calentamiento · sesión
completada · limitaciones estructuradas conectadas con la asignación.

**Hecho después**
Alta del participante · reordenar ejercicios · notas del coach · medidas y fotos
de progreso con fecha · recomendación fijable por el coach.

> **Aviso sobre el modo sin conexión.** Usted lo dejó como *"falta decidir"* y en
> último lugar de su orden de trabajo. Lo construimos igualmente porque salía
> casi gratis —la app no tiene servidor, así que funcionar sin conexión son unas
> líneas de configuración—, pero **no lo pidió**: si prefiere no contarlo como
> parte de la V1, no cambia nada de lo demás.

**Pendiente de construir**
Sólo el **vídeo** de la biblioteca, y depende de que elija alojamiento. Nada más
de su especificación V1 queda sin hacer.

Fuera de su lista pero construido, porque su orden de trabajo lo menciona
(*"datos, fotos, offline/respaldo"*): **copia de seguridad** en un archivo, que
hoy es la única forma de que usted reciba los datos del participante y de que no
se pierdan si el móvil borra su almacenamiento.

**Pendiente de su respuesta**
Las cinco decisiones de la sección 3 que cambian comportamiento · el documento
de las 18 preguntas que menciona y no aparece en el PDF · **si la foto le basta
o quiere además vídeo** en la biblioteca, y en ese caso qué opción de
`docs/OPCION-VIDEO.md` · el visto bueno visual con el móvil en la mano.

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
