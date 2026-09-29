# Mensaje 01 — Santiago Fitness Method

- Fecha de recepción: 2026-09-28.
- Rótulo del usuario: «Listado de ejercicios por grupo muscular».
- Título visible: **SANTIAGO FITNESS METHOD — Informe de actualización y mejoras de la aplicación**.
- Fuente: cinco imágenes de WhatsApp adjuntas por el dueño en el chat.
- Estado: información recibida y archivada; no es una auditoría de implementación.
- Transcripción visual del contenido legible. Se conservan cifras, ejemplos, prioridades y matices; tablas y saltos de línea se adaptan a Markdown.
- Orden reconstruido por continuidad de las secciones: archivo sin sufijo, `(1)`, `(2)`, `(3)`, `(4)`. Véase [fuentes.json](fuentes.json) para nombres originales, tamaños y SHA-256.
- Aunque el rótulo menciona un listado, las imágenes contienen un informe de requisitos y ejemplos de ejercicios; no un catálogo exhaustivo por grupo muscular.

> Alcance del encargo: hacer este primer mensaje accesible para Codex y Claude Code. Las solicitudes de cambios que siguen pertenecen al documento del cliente; su archivo no autoriza por sí solo su ejecución.

## Página 1

[Imagen original](originales/pagina-01.jpeg)

### SANTIAGO FITNESS METHOD

Informe de actualización y mejoras de la aplicación

### 1. Ampliación de la biblioteca de ejercicios

La biblioteca actual necesita ampliarse considerablemente. Hay ejercicios que utilizamos regularmente en los entrenamientos y que todavía no aparecen en la aplicación, particularmente ejercicios utilizados en las rutinas para féminas.

La biblioteca debe permitir continuar añadiendo ejercicios en el futuro sin necesidad de modificar la estructura principal de la aplicación.

Cada ejercicio deberá contener, cuando corresponda:

- Nombre del ejercicio.
- Grupo muscular principal.
- Grupos musculares secundarios.
- Equipo utilizado.
- Imagen o demostración visual.
- Video demostrativo, cuando esté disponible.
- Instrucciones básicas.
- Alternativas o ejercicios sustitutos.
- Posibilidad de crear ejercicios personalizados para máquinas específicas del gimnasio.

La biblioteca debe organizarse tanto por grupo muscular como por tipo de equipo.

#### Categorías de equipo

- Máquinas convergentes.
- Máquinas selectorizadas.
- Smith Machine.
- Poleas/cables.
- Mancuernas.
- Barras.
- Peso corporal.
- Máquinas específicas de glúteos y piernas.

#### Áreas que requieren especial ampliación

**Glúteos:** hip thrust y variantes; patadas de glúteos en máquina; patadas en cable; abducción de cadera; máquinas específicas de glúteos.

**Cuádriceps:** extensión de piernas; hack squat y variantes; leg press y variantes; sentadillas en diferentes máquinas.

**Femorales:** leg curl sentado; leg curl acostado; peso muerto rumano y variantes; movimientos específicos disponibles en máquinas.

## Página 2

[Imagen original](originales/pagina-02.jpeg)

También deberán ampliarse pecho, espalda, hombros, bíceps, tríceps y core, incluyendo variantes según el equipo disponible.

### 2. Selección rápida de ejercicios

Durante la creación o ejecución de una rutina, el entrenador debe poder seleccionar o sustituir un ejercicio directamente desde esa pantalla. No debería ser necesario salir de la rutina y entrar primero a la biblioteca.

- Búsqueda por nombre.
- Filtro por grupo muscular.
- Filtro por equipo.
- Ejercicios recientes.
- Ejercicios favoritos.
- Sustitución rápida.

Cuando se sustituya un ejercicio, el historial correspondiente a cada ejercicio debe conservarse.

### 3. Nueva estructura Lower / Upper de cinco días

Se solicita añadir, además de conservar las opciones existentes, una plantilla específica de cinco días:

| Día | Sesión |
| --- | --- |
| 1 | LOWER BODY |
| 2 | UPPER BODY |
| 3 | LOWER BODY |
| 4 | UPPER BODY |
| 5 | LOWER BODY |

Esta estructura es especialmente importante para las participantes femeninas que entrenan piernas y glúteos tres veces por semana.

Los tres días de Lower deberán poder configurarse independientemente: **Lower A** con posible enfoque dominante en cuádriceps; **Lower B** con posible enfoque dominante en glúteos y femorales; y **Lower C** como segundo estímulo de glúteos/piernas o combinación diferente según el objetivo.

La aplicación no debe imponer estos enfoques. El entrenador debe poder cambiar libremente ejercicios, series, repeticiones y distribución muscular.

### 4. Registro individual de cada serie

Este punto debe formar parte del núcleo de la aplicación. Durante la ejecución del entrenamiento, cada ejercicio debe permitir registrar cada serie individualmente.

| Serie | Peso | Repeticiones | RIR |
| --- | --- | --- | --- |
| 1 | 100 lb | 12 | 2 |

## Página 3

[Imagen original](originales/pagina-03.jpeg)

Continuación de la tabla de la sección 4:

| Serie | Peso | Repeticiones | RIR |
| --- | --- | --- | --- |
| 2 | 110 lb | 10 | 2 |
| 3 | 110 lb | 9 | 1 |
| 4 | 100 lb | 12 | 1 |

El peso NO debe ser un único valor general para todo el ejercicio. Debe poder modificarse en cada serie porque durante una sesión podemos aumentar o reducir la carga.

**Ejemplo — Hip Thrust:** Serie 1: 180 lb × 12; Serie 2: 200 lb × 10; Serie 3: 220 lb × 8; Serie 4: 220 lb × 9.

Cada resultado debe quedar almacenado individualmente. Este sistema debe funcionar en todos los ejercicios de la aplicación.

### 5. Información que debe registrarse por serie

- Número de serie.
- Peso utilizado en libras.
- Repeticiones objetivo.
- Repeticiones realizadas.
- RIR.
- Observación o nota, cuando sea necesaria.

El registro debe guardarse inmediatamente para que la información pueda utilizarse en la próxima sesión.

### 6. Comparación con el entrenamiento anterior

Cuando el participante vuelva a realizar un ejercicio, la aplicación debe mostrar los resultados de la sesión anterior sin obligar al entrenador a salir de la pantalla.

| Serie | Sesión anterior | Hoy |
| --- | --- | --- |
| 1 | 270 lb × 12 | _____ |
| 2 | 290 lb × 10 | _____ |
| 3 | 290 lb × 9 | _____ |
| 4 | 290 lb × 8 | _____ |

Esto permitirá decidir rápidamente si mantenemos el peso, aumentamos peso, buscamos más repeticiones o reducimos la carga. La aplicación puede hacer una recomendación, pero la decisión final siempre corresponde al entrenador.

### 7. Seguimiento de progresión

El objetivo del registro no es solamente guardar entrenamientos. La aplicación debe permitir comprobar si cada participante está progresando.

**Por carga:** 100 lb → 105 lb → 110 lb.

## Página 4

[Imagen original](originales/pagina-04.jpeg)

Continuación de la sección 7:

**Por repeticiones:** 100 lb × 8 → 100 lb × 10 → 100 lb × 12.

**Por combinación de peso y repeticiones:** Semana 1: 100 lb × 10; Semana 2: 100 lb × 12; Semana 3: 105 lb × 10.

**Por RIR:** debe conservarse para determinar si una mejora en peso o repeticiones representa progreso bajo un esfuerzo comparable.

### 8. Historial individual por ejercicio

Cada participante debe tener un historial propio. Al seleccionar un ejercicio deberá ser posible consultar su evolución.

**Ejemplo — Hip Thrust:**

- Semana 1 → 180 lb × 12
- Semana 2 → 190 lb × 12
- Semana 3 → 200 lb × 10
- Semana 4 → 200 lb × 12
- Semana 5 → 210 lb × 10

De esta forma se podrá observar claramente la ganancia de fuerza y rendimiento.

### 9. Gráficas de progreso

Como evolución del historial, sería conveniente que la aplicación genere gráficas automáticamente por ejercicio, incluyendo **Peso / Tiempo** y **Repeticiones / Tiempo**. Esto permitirá mostrar al participante de manera sencilla cuánto ha progresado desde que comenzó.

### 10. Principio importante del sistema

Santiago Fitness Method no debe convertirse en una aplicación que obligue al entrenador a utilizar cargas determinadas.

**REGISTRAR → COMPARAR → ANALIZAR → SUGERIR**

La decisión final permanece con el entrenador. La aplicación puede sugerir **AUMENTAR, MANTENER o REDUCIR**, pero no modificar automáticamente la carga.

Cuando se recomiende un aumento, debe mantenerse la filosofía de progresión conservadora ya establecida, utilizando incrementos pequeños —por ejemplo, +2.5 lb cuando el equipo lo permita— y considerando repeticiones, RIR y técnica.

### PRIORIDADES PARA LA PRÓXIMA ACTUALIZACIÓN

- **PRIORIDAD 1 — Biblioteca:** ampliar considerablemente la biblioteca de ejercicios, particularmente las variantes utilizadas en entrenamiento femenino.
- **PRIORIDAD 2 — Nuevo split:** añadir LOWER – UPPER – LOWER – UPPER – LOWER como plantilla de cinco días, manteniendo también las estructuras existentes.
- **PRIORIDAD 3 — Registro por serie:** permitir modificar y guardar peso, repeticiones y RIR individualmente en cada serie y en todos los ejercicios.
- **PRIORIDAD 4 — Historial:** mostrar automáticamente los resultados de la sesión anterior junto a la sesión actual.
- **PRIORIDAD 5 — Progresión:** crear historial y gráficas para observar mejoras de carga, repeticiones y rendimiento de cada participante.

## Página 5

[Imagen original](originales/pagina-05.jpeg)

### OBJETIVO

El propósito de estas modificaciones es que Santiago Fitness Method no sea solamente una aplicación para presentar rutinas. Debe convertirse en una herramienta que permita al entrenador programar, ejecutar, registrar, comparar y progresar, manteniendo un historial completo del rendimiento de cada participante y permitiendo adaptar las rutinas a las necesidades reales de cada persona.

**PROGRAMAR → EJECUTAR → REGISTRAR → COMPARAR → PROGRESAR**
