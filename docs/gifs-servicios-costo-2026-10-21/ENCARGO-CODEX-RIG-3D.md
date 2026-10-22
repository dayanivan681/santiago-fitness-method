# Encargo para Codex — rig con restricciones para el pendulum squat

Escrito por claude-code el 2026-10-21 tras llevar el prototipo 3D hasta donde
llegó. **No es un encargo de render: es un encargo de postura.**

---

## El problema, en una frase

La figura no parece una persona haciendo el ejercicio. Está **colocada al lado de
la máquina**, no apoyada en ella.

La causa es el método, no el ajuste: posé con **cinemática directa**, tecleando
ángulos de articulación (cadera −62°, rodilla 88°). Pero un cuerpo en esa máquina
está sujeto por tres sitios a la vez — **pies en la plataforma, espalda en el
respaldo, manos en los agarres** — y al teclear ángulos no se respeta ninguno. Los
pies se despegaban 24 cm y lo tapé deslizando el esqueleto entero hacia abajo una
cantidad medida. Es un parche, y se nota.

## Lo que hay que construir

Un **rig con restricciones** donde el movimiento lo gobierne **una sola variable**:
el ángulo del carro sobre su pivote. Todo lo demás lo resuelve el solucionador.

- **Pies**: fijados a la plataforma. No se despegan ni deslizan en ningún fotograma.
- **Pelvis y espalda**: en contacto con el respaldo, acompañando su arco.
- **Manos**: sujetando los agarres.
- **Rodilla y cadera**: resultado de la cinemática inversa, no valores tecleados.
- **Columna**: repartida entre varias vértebras, no un bloque rígido.

Criterio de hecho: **se mueve el carro y el cuerpo responde solo**, sin tocar
ninguna articulación a mano.

## Punto de partida

Rama **`diseno/sistema-visual`**, carpeta `arte/sistema-visual/3d/`:

| Archivo | Qué es |
|---|---|
| `pendulum-squat.blend` | la escena completa: cuerpo, máquina, luz, cámara, animación |
| `pendulum-squat-v1.gif` | el resultado actual, para comparar |

Blender **5.2.2 LTS** con **MPFB** instalado (extensión oficial, build 20261010).
El cuerpo es un MPFB con rig estándar de **137 huesos**; los de interés:
`upperleg01.L/R`, `lowerleg01.L/R`, `foot.L/R`, `upperarm01.L/R`, `lowerarm01.L/R`,
`spine01`…`spine05`, `pelvis.L/R`.

El carro es el *empty* **`Pivote`**; de él cuelgan respaldo, hombreras, viga, disco
y agarres. Girar `Pivote` en X mueve toda la máquina: **ese es el accionador**.

## Lo que ya funciona y no hay que tocar

Modelado de la máquina, materiales, luz de tres puntos, cámara, y la salida. El
GIF v1 **cumple las cuatro reglas duras de la app**, verificadas:

| | |
|---|---|
| Formato | GIF89a (la API valida la firma) |
| Medida | 360×480, proporción 3:4 exacta |
| Peso | 236 KB (objetivo 250 KB, tope duro 5 MB) |
| Fotograma 1 | la posición inicial — **la app lo usa como foto fija** |
| Fondo | `#0b0c0d` |

Se consiguieron 360×480 bajando a **9 fps y 40 colores**, en vez de encoger la
imagen. Conviene mantener ese truco.

## Trampas que ya me costaron pasadas

Esto es lo más útil del encargo. Son cuatro y las pagué todas:

1. **Doble transformación.** La malla `Human` está **emparentada al rig** *y* tiene
   modificador *Armature*. Mover la malla **y** el rig desplaza el doble. Mover
   sólo el rig; dejar `Human.location = (0,0,0)`.
2. **`rig.animation_data_clear()` borra también la pose**, no sólo la animación de
   objeto. Las rotaciones de hueso viven en la misma acción.
3. **Orden al clavar fotogramas.** `frame_set(f)` reevalúa la animación y **pisa la
   pose recién aplicada**. Hay que fijar el fotograma *primero* y posar *después*.
4. **Blender 5 cambió la API de acciones.** `action.fcurves` ya no existe (ahora
   hay capas y *channelbags*). Cualquier script que recorra curvas falla.

Además: el objeto del rig estaba oculto y `mode_set(mode='POSE')` falla con
*"Cannot edit hidden object"*. Usar `hide_render = True` y `hide_viewport = False`.

## Lo que queda fuera de este encargo

- **El maniquí**: es el femenino por defecto de MPFB y conserva la cara; RepDB usa
  uno sin rostro. Es parámetro de MPFB, se cambia después.
- **Los otros 285 ejercicios.** Esto es sólo el pendulum squat.
- **Calidad de render.** No subir muestras ni cambiar motor: no es el problema.

## Límites del repositorio

- Trabajar en **`diseno/sistema-visual`**, escribir sólo en `arte/sistema-visual/3d/`.
- **No tocar `main`** ni reclamar turno en `docs/HANDOFF.md`: `main` está coordinado
  y el turno es exclusivo.
- `docs/cliente/` es de solo lectura.
- No subir `node_modules`, `dist`, `coverage`, `.env` ni credenciales.

## Criterios de aceptación

1. Girando **sólo** `Pivote`, el cuerpo adopta la postura correcta en todo el arco.
2. El pie no varía más de **1 cm** en Z entre el fotograma 1 y el 12.
3. La espalda mantiene contacto con el respaldo en todo el recorrido.
4. Las manos permanecen en los agarres.
5. La rodilla llega a **~90°** abajo y queda **casi extendida sin bloquear** arriba.
6. El GIF resultante sigue cumpliendo las cuatro reglas duras de la tabla de arriba.
7. Todo por script y regenerable con un comando; nada hecho a mano en la interfaz.

## Cuándo parar y preguntar

- Si el rig estándar de MPFB no admite las restricciones y hace falta convertir a
  Rigify: **preguntar antes**, porque cambia el punto de partida de los 285 restantes.
- Si para que el contacto funcione hay que mover la máquina: **decirlo**, porque la
  geometría actual está medida contra la pose, no inventada.
- Si la cinemática inversa obliga a cambiar las proporciones del cuerpo: parar.
  El cuerpo tiene que valer para los 286.
