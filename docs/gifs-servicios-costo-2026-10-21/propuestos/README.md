# GIF propuestos — lote gratuito sin reserva (2026-10-21, claude-code)

Generados a partir del cruce de [CRUCE.md](../CRUCE.md), a petición del dueño.
**Nada de esto está aplicado:** son archivos para revisar. Ponerlos en la
biblioteca significa subirlos al bucket de producción por la API del coach, y eso
es un cambio de datos en producción que necesita el visto bueno del dueño.

## Qué salió

Se generaron **11**. Tras la revisión fotograma a fotograma:

| | Ejercicios |
|---|---|
| ✅ Aprobados sin reserva | **9** |
| ⚠️ Con reserva nueva, aparecida al mirar la imagen | **1** |
| ❌ Rechazados | **1** |

### ✅ Aprobados (9)

| Ref | Ejercicio del coach | Archivo | Peso |
|---|---|---|---|
| M02-139 | Walking Lunge | `M02-139-walking-lunge.gif` | 176.030 B |
| M02-039 | Arnold Press | `M02-039-arnold-press.gif` | 171.266 B |
| M02-042 | Convergent Shoulder Press | `M02-042-convergent-shoulder-press.gif` | 176.610 B |
| M02-186 | Nordic Hamstring Curl | `M02-186-nordic-hamstring-curl.gif` | 200.143 B |
| M02-159 | Barbell Glute Bridge | `M02-159-barbell-glute-bridge.gif` | 169.150 B |
| M02-162 | Cable Glute Kickback | `M02-162-cable-glute-kickback.gif` | 192.566 B |
| M02-173 | Hiper extensiones enfoque en el glúteo | `M02-173-hiperextensiones-gluteo.gif` | 186.678 B |
| M02-003 | Bench Press en Smith Machine | `M02-003-bench-press-smith.gif` | 188.805 B |
| M02-030 | Cable Crossover | `M02-030-cable-crossover.gif` | 190.732 B |

En los nueve se ve el aparato correcto y las dos posiciones del movimiento.

### ⚠️ Con reserva (1)

| Ref | Ejercicio | Archivo | Reserva |
|---|---|---|---|
| M02-060 | Cable Front Raise | `M02-060-cable-front-raise.gif` | **La fuente es a un brazo.** Las instrucciones lo confirman: «grasp the single hand cable attachment … with your left hand». La ficha del coach no dice si es a uno o a dos brazos. |

El movimiento y el equipo son correctos; sólo falta saber si Santiago la enseña
unilateral. Si la enseña a dos brazos, este GIF no vale.

### ❌ Rechazado (1)

| Ref | Ejercicio | Archivo | Motivo |
|---|---|---|---|
| M02-133 | Bulgarian Split Squat Smith Machine | `rechazados/M02-133-bulgarian-split-squat-smith.gif` | **No se ve el ejercicio.** Por nombre e instrucciones el encaje era exacto (banco detrás del Smith, pie trasero elevado), pero en la foto el sujeto queda tapado por el bastidor y los discos de la máquina en primer plano. Sólo asoman una pierna sobre el banco y parte del torso. |

Se guarda el archivo para que se vea el motivo del rechazo. **Este ejercicio
vuelve al grupo de los que no tienen fuente libre fiel**, y pasa a depender de que
Santiago lo grabe.

Es exactamente el límite que avisé en el cruce: el veredicto previo era sobre el
nombre, el equipo y las instrucciones, no sobre la imagen. De once, falló uno.

## Cómo se hicieron

La misma receta del 2026-10-05, registrada en
`public/ejercicios/procedencia.json`: **dos fotogramas, corte seco, 0,9 s cada
uno, en bucle, 480 px de ancho y 96 colores** (ffmpeg `palettegen`/`paletteuse`).
Los once salieron a 480×320 y dos fotogramas, comprobado con `ffprobe`.

Fuente: [free-exercise-db](https://github.com/yuhonas/free-exercise-db), dominio
público bajo Unlicense, uso comercial permitido, sin marcas de agua. La misma de
los 46 GIF que ya están en la app.

Los diez archivos aprobados suman **1.830.450 bytes (1,75 MiB)**, 183 KB de media.
Para comparar: los 46 del catálogo de arranque pesan 155 KB de media.

`procedencia.json` guarda, por ejercicio: la referencia del catálogo, el id real
en la biblioteca del coach, las dos URL de origen, el tamaño, las dimensiones y el
**sha256** de cada archivo.

## Si se aprueban

Cada archivo se sube a su ejercicio con `PUT /biblioteca/<id>/animacion` (sólo el
coach puede escribir; tope de 5 MB; se valida la firma GIF). El `id_coach` de cada
uno está en `procedencia.json`, así que la subida es mecánica. Eso toca datos de
producción: no se hace sin el sí del dueño.
