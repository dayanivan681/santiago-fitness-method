# Qué costarían los servicios profesionales de GIF — 2026-10-21 (claude-code)

Santiago preguntó: «Tú podrías verificar lo de los gif y cuál sería el costo.
Déjame saber». El dueño aclaró que se refiere a **los servicios profesionales de
GIF que se hablaron hace un tiempo**: los proveedores de pago que quedaron
anotados, sin probar, en [`docs/ANIMACIONES-CATALOGO-BASE.md`](../ANIMACIONES-CATALOGO-BASE.md)
el 2026-10-05.

Esto es investigación y documentación. **No se cambió código de producto ni se
subió ningún GIF nuevo.** Nadie creó cuentas ni contrató nada.

---

## Respuesta corta

Hay dos formas de pagar por animaciones de ejercicios, y cuestan cosas muy
distintas:

- **Comprar la colección una vez y quedársela: $199 o $599, pago único.**
  (ExerciseDB, licencia comercial perpetua, archivos propios.) Es la única de las
  cinco que encaja con cómo funciona la app hoy.
- **Alquilarla por meses: desde $5 hasta $200 al mes**, según el proveedor y el
  volumen. Tres de los cuatro proveedores mensuales **prohíben guardar el archivo**
  en nuestro servidor, y eso choca con que la app tiene que funcionar sin conexión
  en el gimnasio.

Y hay una tercera opción que cuesta **$0 en herramientas**: que Santiago grabe él
las que falten. La app ya convierte un vídeo del teléfono en GIF; eso está
construido y funcionando desde el 4 de octubre. Lo único que cuesta es su tiempo
grabando, y ese tiempo no lo puedo estimar yo.

---

## Lo que hay hoy, medido

### La biblioteca real de producción

Consultado el 2026-10-21 contra la base de datos de producción
(`wrangler d1 execute santiago-acceso --remote`, sólo lectura):

| | Cantidad |
|---|---|
| Ejercicios activos en la biblioteca del coach | **286** |
| Con animación (GIF) | **236** |
| **Sin animación** | **50** |
| Sin foto fija | 0 |

Es decir: **el 83 % de la biblioteca ya tiene animación y el 17 % no.** Los 286
son la Biblioteca Maestra de Santiago importada en producción, no los 57 del
catálogo de arranque. Las animaciones se subieron entre el 2026-10-04 y el
2026-10-18.

### El catálogo de arranque que viene dentro de la app

Aparte de lo anterior, la app trae empaquetados 57 ejercicios para funcionar sin
conexión. De esos, **46 tienen GIF y 11 no** — comprobado ejecutando la semilla.
Los archivos pesan **7.135.460 bytes (6,80 MiB)** en total, 155 KB de media; el
más pesado es `sfm-catalog-c037.gif` con 265.663 bytes. Son GIF89a de 480 px de
ancho. Verificado también en producción: los 46 responden 200 y suman
exactamente esos mismos 7.135.460 bytes.

Estos 11 son el tema viejo del 5 de octubre: no hay animación libre que enseñe la
variante unilateral correcta. **No confundir los 11 con los 50**: los 11 son del
catálogo de arranque y los 50 son de la biblioteca real que usa Santiago.

### Lo que no se pudo medir

**Cuánto pesan en el servidor los 236 GIF de la biblioteca del coach: desconocido.**
Viven en el bucket privado de Cloudflare (R2) y el token de esta máquina no tiene
permiso de lectura sobre R2: la petición responde `403 Authentication error`. Se
puede obtener de dos maneras, las dos del dueño: refrescar el token con
`wrangler login`, o leer el tamaño total del bucket `sfm-fotos-production`
directamente en el panel de Cloudflare. Lo único seguro es que la app rechaza
cualquier GIF de más de 5 MB, así que 236 archivos no pueden pasar de 1,2 GB, y
por lo que se ve en los convertidos desde el teléfono (360×480) el total real
estará muy por debajo.

---

## Los cinco proveedores, con precios de hoy

Precios consultados el **2026-10-21** en la página de cada proveedor. Pueden
cambiar; la columna «Fuente» dice de dónde sale cada cifra.

### 1. ExerciseDB — pago único, archivos propios

| Plan | Precio | Qué incluye |
|---|---|---|
| Starter | **$199, una sola vez** | 1.394 ejercicios · GIF de 180×180 y 360×360 |
| Pro | **$599, una sola vez** | los mismos 1.394 · GIF de 180, 360, 720 y 1080 px · dificultad, categoría, taxonomía de 17 campos, equipo, sustituciones y progresiones |

- Licencia **comercial, perpetua y neutra de plataforma**; los archivos y los datos
  **se alojan en nuestro servidor** («self-hosted data and media files»).
- Las actualizaciones futuras **no** están incluidas.
- Fuente: <https://exercisedb.io/pricing>
- Ojo: el dataset gratuito de ExerciseDB (`oss.exercisedb.dev`) es **sólo para uso
  no comercial** y exige atribución. No sirve para un producto que se cobra.

### 2. WorkoutX — mensual, pero no se puede guardar el archivo

| Plan | Precio | Peticiones/mes | Vistas de medios/mes |
|---|---|---|---|
| Free | $0 | 500 en total | sólo vista previa 360p **con marca de agua**; evaluación nada más |
| Starter | **$19/mes** ($190/año) | 5.000 | 25.000 |
| Growth | **$39/mes** ($390/año) | 25.000 | 150.000 |
| Scale | **$79/mes** ($790/año) | 100.000 | 600.000 |

- Más de 1.900 ejercicios; el medio es **MP4 de 720p a 30 fps, no GIF**.
- **Problema de fondo:** «Media is streamed, not downloaded. Downloading, storing,
  or re-hosting it is not permitted on any plan, including Enterprise.» La app
  guarda los medios en nuestro bucket y tiene que funcionar sin conexión en el
  gimnasio; esto lo impide.
- Fuente: <https://workoutxapp.com/pricing>

### 3. MuscleWiki — mensual, vídeo, comercial en los planes de pago

| Plan | Precio | Llamadas/mes |
|---|---|---|
| Basic | $0 | 500, sólo en su consola de pruebas |
| Testing | **$10/mes** | 1.000 |
| Growth | **$39,99/mes** | 30.000 |
| Professional | **$99,99/mes** | 100.000 |
| Enterprise | **$199,99/mes** | 300.000 |

- «Every paid plan includes commercial use rights.» El medio es **vídeo**; la página
  no menciona GIF.
- Su página **no dice** si se puede descargar, cachear o alojar el medio por nuestra
  cuenta: habría que leer sus condiciones o preguntarles antes de contratar.
- Sus condiciones (actualizadas 2025-11-14) limitan la licencia a aplicaciones de
  fitness y salud, prohíben entrenar modelos de IA con su contenido y les permiten
  retirar cualquier vídeo o endpoint en cualquier momento.
- Fuentes: <https://api.musclewiki.com/pricing> y <https://musclewiki.com/api-terms>

### 4. exerciseapi.dev — el más barato, pero con muy poco medio

| Plan | Precio | Peticiones/día |
|---|---|---|
| Free | $0 | 100 |
| Starter | **$5/mes** | 1.000 |
| Pro | **$29/mes** | 10.000 |
| Business | **$79/mes** | 100.000 |

- 2.199 ejercicios en el catálogo, pero **sólo 167 tienen demostración en vídeo**
  («167 exercises with video demos & counting»). La mayoría de la biblioteca no
  tiene medio. No ofrece GIF.
- Sus indicaciones dicen que lo cacheado **no se puede redistribuir ni volver a
  servir** a otros usuarios, y que la caché es por dispositivo.
- Fuente: <https://exerciseapi.dev/>

### 5. Your Move — vídeo HD, precios en reales

- Cuatro planes mensuales, de **R$99 a R$1.185** (aproximadamente **$20 a $235**,
  con el real a unos 5 por dólar; **no pude confirmar la cotización de hoy**, la
  referencia más reciente que encontré es de julio de 2026).
- Entre 1.021 y 1.413 ejercicios según la fuente — las cifras **no coinciden** entre
  el directorio y el conector, así que habría que confirmarlo.
- Vídeo HD por **streaming HLS**, sin marca de agua en los planes de pago;
  el uso sin conexión y las licencias de marca sólo en los planes altos.
- Fuente: ficha de directorio <https://publicapis.dev/resource/your-move-exercise-api/6dwyqnmx>.
  **No es la página del proveedor**, así que esta fila es la menos firme de todas.

### Aparecido en la búsqueda, no estaba en la lista de octubre

**Hyperhuman** (<https://hyperhuman.cc/pricing>) vende vídeo de ejercicio desde
**$95/mes** (Content), $191/mes (Platform) y $383/mes (Ultra); el acceso directo al
catálogo por API sólo está en Ultra anual, y una app con marca propia pide $1.990
de alta más plan Ultra. Su página no publica ni el formato del medio ni las
condiciones de licencia. Por precio, queda fuera de escala para este proyecto.

---

## Qué compraría cada opción, de verdad

El hueco real son **50 ejercicios activos sin animación**. Ninguno de estos
catálogos está organizado por los nombres de la Biblioteca Maestra de Santiago,
así que **comprar no garantiza llenar los 50**: hay que cruzar ejercicio por
ejercicio. Y ese cruce es justo donde fallaron las fuentes gratuitas en octubre:
no faltaban animaciones, faltaban animaciones de **la variante correcta**
(unilateral, en la máquina correcta). Un catálogo de 1.394 ejercicios genéricos
tropieza con el mismo problema.

| Opción | Coste | Encaja con la app | Pega principal |
|---|---|---|---|
| **A. Seguir como está** | $0 | Sí | 50 fichas con foto fija |
| **B. Santiago graba las 50** | $0 en herramientas, su tiempo | Sí, ya está construido | Depende de que él grabe; tiempo no estimado |
| **C. ExerciseDB Starter** | **$199 una vez** | Sí: archivos propios, licencia perpetua | GIF de 360 px máximo; hay que cruzar los 50 a mano; sin actualizaciones |
| **D. ExerciseDB Pro** | **$599 una vez** | Sí | Lo mismo, pero con más resolución y más metadatos |
| **E. API mensual (WorkoutX, exerciseapi.dev)** | $5–79/mes | **No** | Prohíben guardar o volver a servir el medio: rompe el uso sin conexión |
| **F. MuscleWiki** | $10–199,99/mes | **Por confirmar** | Es vídeo, no GIF; hay que preguntarles si se puede alojar |
| **G. Your Move** | ~$20–235/mes | Por confirmar | Datos de un directorio, no del proveedor; streaming HLS |

---

## Recomendación

> **Actualización 2026-10-21:** el cruce recomendado aquí abajo **ya está hecho**.
> Resultado: **28 de los 50 se cubren con $0** (11 reutilizando GIF que ya están en
> el repositorio y 17 generables desde free-exercise-db); los otros 22 no tienen
> fuente libre fiel porque son máquinas concretas del gimnasio. Detalle ejercicio
> por ejercicio en [CRUCE.md](CRUCE.md).

**Antes de pagar nada, hacer el cruce.** Tomar los 50 nombres que faltan y
comprobar cuántos tiene ya `free-exercise-db`, que es gratis, de dominio público y
de donde salieron los 46 GIF del catálogo de arranque. Cuesta $0 y un rato de
trabajo, y es la única manera de saber si el hueco real son 50, 20 o 5. Si quedan
pocos, no hay nada que comprar: los graba Santiago con el teléfono y ya está.

**Si después del cruce siguen faltando muchos y se quiere resolver con dinero: los
$199 de ExerciseDB Starter, pago único.** Es la única de las cinco cuya licencia
permite guardar los archivos en nuestro servidor, que es lo que la app necesita
para funcionar sin conexión en el gimnasio. Un pago de $199 se amortiza frente a
cualquier mensualidad en menos de un año, y no deja al producto colgando de que un
proveedor retire un vídeo o suba el precio.

**Las mensualidades conviene descartarlas**, no por el precio — $5 o $19 al mes no
es nada — sino porque tres de las cuatro prohíben expresamente guardar el archivo.
La app precarga los medios para que el participante no dependa de la cobertura del
gimnasio; con streaming obligatorio, eso se pierde.

---

## Ampliación del dueño (2026-10-21) — proveedores que esta investigación no encontró

El dueño aportó una investigación propia con proveedores que no salieron en mi
búsqueda. **No están verificados por mí**: las cifras son las de su documento, y
antes de pagar habría que confirmarlas en la página de cada uno.

| Proveedor | Qué ofrece | Precio citado |
|---|---|---|
| **FitExerciseDB** | 1.324 GIF sueltos | **$0,99 por ejercicio** |
| **RepDB** | 650 ejercicios, WebP **transparente**, mapas musculares, ES/EN | $499 Standard |
| **MyGymDesk / Trainaq** | 623 ejercicios, 1.604 vídeos 3D HD | $299–$499 pago único |
| **ExerciseClips** | 1.323 clips GIF y MP4, 360×360 | $399 licencia para una app |
| **MoveKit** | 3D uniforme, MP4 HD, compra por ejercicio o biblioteca | por paquete |
| **Exercise Animatic** | +2.600 animaciones, hasta 4K, fondo verde | por licencia |
| **GymVisual / Gym Animations** | animación anatómica; +7.000 en MP4 | por licencia |
| **WorkoutDB** | API con GIF, MP4 y español | $9,99/mes |
| **Fitness Visuals** | 81 ejercicios en vídeo real + mapa muscular Rive | $99 Starter |

**Dos cosas cambian el cálculo y conviene no pasarlas por alto:**

1. **FitExerciseDB vende por unidad.** Nosotros no necesitamos una biblioteca:
   necesitamos **23 fichas**. A $0,99 serían unos **$23**, frente a los $199 del
   paquete más barato. Si esos 23 están en su catálogo, es la opción más barata
   con diferencia. Todo depende de la cobertura, no del precio.
2. **RepDB entrega fondo transparente.** La app es oscura y la ficha pinta
   `#0b0c0d` detrás de la animación: cualquier proveedor con fondo de estudio
   blanco o gris dejará un rectángulo claro en una pantalla negra. La
   transparencia deja de ser un detalle estético y pasa a ser un requisito.

**Lo que sigue sin resolver es lo mismo de siempre:** ningún tamaño de catálogo
garantiza las **15 máquinas concretas** de la lista C. Antes de pagar a cualquiera
hay que pedir su lista de ejercicios y buscar esos 15 nombres. Es el único filtro
que decide.

## La decisión de estilo es más grande que los 23

Hoy hay **236 animaciones fotográficas** en producción: personas reales en un
gimnasio real. Comprar un estilo 3D o ilustrado para 23 fichas no es rellenar un
hueco, es **mezclar dos lenguajes visuales** en la misma biblioteca. Hay tres
caminos coherentes y uno incoherente:

| Camino | Qué implica | Coste | Pega |
|---|---|---|---|
| **A. Todo fotográfico** | Santiago graba las 23 | $0 + su tiempo | depende de él |
| **B. Todo ilustrado** | se reemplazan las 236, no se añaden 23 | hay que verificar cobertura de **286**, no de 23 | caro y mucho trabajo |
| **C. Mixto declarado** | fotos donde las hay, ilustración en las 23, marcada como tal | el más barato | se nota la mezcla |
| ~~D. Mixto sin criterio~~ | comprar a varios proveedores | — | **la biblioteca parece un collage** |

El propio documento del dueño lo avisa: elegir **un solo estilo para toda la app**.
Esa advertencia, aplicada a nuestro caso, es justo la que convierte «comprar 23» en
«decidir qué quiere ser la biblioteca entera».

### Corrección al plan de prueba

La investigación propone probar 10 movimientos representativos: sentadilla, press
banca, remo, curls, peso muerto y poleas. **Para nosotros ese set no sirve: ya
tenemos los seis.** Probar a un proveedor con un press de banca no responde nada.

El set de prueba tiene que ser **los que nos faltan**: pendulum squat, power squat,
belt squat sumo, hip thrust de pie en máquina, elevación lateral en máquina,
abductores de pie, jalón convergente y las máquinas de asistencia. Si un proveedor
no los tiene, su catálogo de 7.000 animaciones vale cero para este problema.

## Lo que esto no cubre

- **Coste de producción**: cuánto tarda Santiago en grabar 50 ejercicios y cuánto
  vale su hora. **Desconocido**, no lo estimo yo. La herramienta ya existe y no
  cuesta dinero.
- **El cruce de los 50 contra las fuentes gratuitas**: no hecho en este turno. Es el
  siguiente paso recomendado.
- **Las condiciones de MuscleWiki y Your Move sobre alojar el medio**: no publicadas
  en sus páginas de precios. Habría que preguntarles.
- **El tamaño en bytes de los 236 GIF actuales en R2**: no medido, falta permiso
  (ver arriba).
- **La infraestructura no es el problema de coste.** Los GIF del catálogo de
  arranque los sirve Cloudflare Pages como archivos estáticos, y Cloudflare dice
  expresamente que «requests to static assets are free and unlimited»
  (<https://developers.cloudflare.com/pages/functions/pricing/>). Los del coach
  están en R2, donde los primeros 10 GB al mes son gratis y el egreso no se cobra
  ($0,015/GB-mes después; <https://developers.cloudflare.com/r2/pricing/>). Con la
  biblioteca entera a esta escala, el almacenamiento son céntimos.

## Pregunta registrada para el dueño

Los GIF de la biblioteca del coach se sirven con `private, max-age=300`
(`functions/lib/v2/bibliotecaApi.ts:27`) y el service worker **no** los guarda
(`public/sw.js`, fijado por prueba en `pruebas-v2/sw.test.ts`). Consecuencia: abrir
una ficha más de cinco minutos después de la anterior **vuelve a descargar el GIF**
del servidor. A esta escala no cuesta dinero, pero gasta datos del móvil del
participante y no funciona sin conexión. Los del catálogo de arranque no tienen ese
problema: se guardan un año. Subir ese caché es un cambio de producto, no de
informe, y lo decide el dueño.
