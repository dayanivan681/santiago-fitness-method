# Animaciones con mocap real — pipeline del proyecto

Pipeline acordado con el dueño (2026-10-24) para la biblioteca 3D: **el movimiento
sale de captura de movimiento real y el estilo de una sola plantilla de Blender**.
Así cada GIF tiene la misma figura, cámara, luz y fondo, y la biomecánica no se
inventa: v1 y v2 del pendulum fallaron porque las rodillas y codos se calculaban a mano.

Primer ejercicio: **Goblet Squat** → [`ejercicios/goblet-squat/goblet-squat.gif`](ejercicios/goblet-squat/goblet-squat.gif)

![Secuencia](ejercicios/goblet-squat/goblet-squat-secuencia.png)

Glúteos visibles desde atrás: [`revision/espalda-y-lado.png`](ejercicios/goblet-squat/revision/espalda-y-lado.png).

Estado: **pendiente de aprobación visual del dueño**. No se ha subido a la app.

## Estándar visual (igual para todos los ejercicios)

| | Valor |
|---|---|
| Figura | Maniquí MPFB de `../3d/pendulum-squat.blend` (objeto `Human` + `Human.rig`), sin cambiar proporciones |
| Colores | Piel gris claro (material `Maniqui`, color base lineal 0.60/0.60/0.61), short gris oscuro, músculos trabajados en rojo (`Musculo`) con borde suave |
| Fondo | `#0b0c0d` (composición sobre render con alfa) |
| Cámara | 3/4 frontal: posición `(1.25, -2.75, 1.05)`, mira a `(0, 0.08, 0.8)`, 50 mm |
| Luces | Las tres del blend base (`Clave`, `Contra`, `Relleno`) |
| Render | EEVEE, 128 muestras (con menos aparece grano en el pecho) |
| GIF | 360×480, 24 fotogramas, 12 fps (≈2 s), 48 colores, ≤ 250 KB, bucle sin salto |

## Pipeline (`herramientas/`)

1. `1_retarget_mocap.py` — importa el BVH, orienta al sujeto hacia −Y y transfiere
   pelvis, columna, cuello, piernas y pies al rig MPFB (delta de rotación del
   mocap + alineación de reposo por hueso). Escala la traslación por longitud de
   pierna. `G_F0/G_F1` = tramo del BVH, `G_NF` = fotogramas, `G_BLEND` = cierre del bucle.
2. `2_pies_fijos.py` — pies clavados al suelo con solución **analítica** de dos
   huesos (el IK de Blender giraba la rodilla izquierda 30° en flexión profunda).
   El plano de la rodilla sale del mocap. Cerca de arriba extiende la rodilla a
   168° y centra la pelvis (el sujeto de CMU se queda con rodillas blandas).
3. `3_brazos_mancuerna_pecho.py` — mancuerna hexagonal en contacto con el pecho
   (raycast) y brazos IK con polo calibrado numéricamente. Específico del goblet;
   cada patrón de agarre tendrá su script.
4. `4_estilo.py` — máscaras por vértice suavizadas para short, cuádriceps y glúteos
   (sin bordes dentados por caras).
5. `5_render.py` y 6. `6_codificar_gif.py` — render con alfa, composición y GIF.

Revisión: `revisar.py` (renders de cualquier cámara/fotograma), `hoja.py` (hoja de
contacto), `buscar_repeticiones.py` y `curva_repeticion.py` (encontrar una
repetición limpia en un BVH: rodilla, altura de cadera, talón, valgo).

Regenerar: `bash regenerar-goblet-squat.sh` (instrucciones de entorno dentro).
En la nube: `pip install bpy==5.2.2 pillow` en Python 3.13 y Mesa EGL
(`apt-get install libegl1 libegl-mesa0 libgl1-mesa-dri libgbm1`); el instalador
oficial de Blender está bloqueado por la red del contenedor. EEVEE por software
tarda ≈ 30 s por fotograma a 128 muestras.

## Verificaciones del Goblet Squat (medidas, no sustituyen la revisión visual)

- Deriva de los tobillos: **0 mm** en los 24 fotogramas.
- Error del plano de rodilla frente al mocap: **0°**.
- Rodillas por fuera de los tobillos en toda la flexión (sin valgo); abajo 0,70 m entre rodillas.
- Rodilla: 163°/161° arriba, 39°/42° abajo (sentadilla profunda).
- Muñecas en la mancuerna: 0 mm; mancuerna a 2 mm del torso de pie.

## Fuente del movimiento

`fuentes/13_30.bvh` — CMU Graphics Lab Motion Capture Database, conversión BVH de
cgspeed (copia en `una-dinosauria/cmu-mocap`). Licencia: «free for use in research
and commercial projects worldwide». Crédito: *The data used in this project was
obtained from mocap.cs.cmu.edu. The database was created with funding from NSF
EIA-0196217.* Tramo usado: frames 1456–1700 (repetición 1 de las sentadillas).

## Añadir un ejercicio

1. Buscar el movimiento en el índice de CMU (`cmu-mocap-index-text.txt`) u otra
   fuente con licencia comercial; localizar una repetición limpia con
   `buscar_repeticiones.py` / `curva_repeticion.py` (talones planos, sin valgo,
   inicio y fin de pie).
2. Pasos 1–2 con el nuevo tramo; paso 3 según el equipo (agarre y objeto); paso 4
   con los músculos primarios del ejercicio.
3. Revisión visual frente, lado y espalda en arriba/abajo antes del GIF.
4. Aprobación del dueño antes de subir nada a la app.

## Límites conocidos

- CMU no cubre la mayoría de ejercicios de gimnasio. Para el resto: otras bases
  libres o mocap desde vídeo con licencia; las máquinas específicas (pendulum,
  belt squat, convergentes) hay que modelarlas.
- La figura sigue siendo un maniquí; un cuerpo más atlético cambiaría el estilo de
  toda la biblioteca y lo decide el dueño.
