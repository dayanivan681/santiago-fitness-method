# Animaciones con mocap real — pipeline del proyecto

Pipeline acordado con el dueño (2026-10-24) para la biblioteca 3D: **el movimiento
sale de captura de movimiento real y el estilo de una sola plantilla de Blender**.
Así cada GIF tiene la misma figura, cámara, luz y fondo, y la biomecánica no se
inventa: v1 y v2 del pendulum fallaron porque las rodillas y codos se calculaban a mano.

Primer ejercicio: **Goblet Squat** → [`ejercicios/goblet-squat/goblet-squat.gif`](ejercicios/goblet-squat/goblet-squat.gif)

![Secuencia](ejercicios/goblet-squat/goblet-squat-secuencia.png)

El GIF tiene dos repeticiones: la primera en 3/4 frontal (rodillas, pies y mancuerna)
y la segunda en 3/4 trasera (glúteos). La app reproduce un solo GIF por ejercicio,
así que la vista trasera va dentro del mismo archivo en vez de en otro.

Estado: **pendiente de aprobación visual del dueño**. No se ha subido a la app.

Correcciones del dueño (2026-10-24): la mancuerna iba sujeta demasiado baja (cabeza
superior en el esternón, la inferior en el abdomen) y en la bajada acababa frente al
vientre; ahora la cabeza superior queda bajo la barbilla durante todo el movimiento.
Se añadió la vista trasera para que se vean los glúteos.

## Estándar visual (igual para todos los ejercicios)

| | Valor |
|---|---|
| Figura | Maniquí MPFB de `../3d/pendulum-squat.blend` (objeto `Human` + `Human.rig`), sin cambiar proporciones |
| Colores | Piel gris claro (material `Maniqui`, color base lineal 0.60/0.60/0.61), short gris oscuro, músculos trabajados en rojo (`Musculo`) con borde suave |
| Fondo | `#0b0c0d` (composición sobre render con alfa) |
| Cámara | Una repetición por vista, misma distancia (3,09 m), altura 1,05 m y lente 50 mm, mirando a `(0, 0.08, 0.8)`. 3/4 frontal en `(1.25, -2.75, 1.05)`; 3/4 trasera a 125° en `(2.531, 1.852, 1.05)` cuando los músculos trabajados están detrás |
| Luces | Las tres del blend base (`Clave`, `Contra`, `Relleno`) |
| Render | EEVEE, 128 muestras (con menos aparece grano en el pecho) |
| GIF | 360×480, 24 fotogramas por vista, 12 fps (≈2 s por vista), 48 colores, ≤ 250 KB por vista (la app acepta hasta 5 MB), primer fotograma de pie, corte de vista en la posición de pie |

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
5. `5_render.py` y 6. `6_codificar_gif.py` — render con alfa (una repetición por
   cámara de la lista JSON), composición y GIF.

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
- Muñecas en la mancuerna: 0 mm; mancuerna entre 0 y 8 mm del torso en los 24 fotogramas.
- Centro de la mancuerna 21 mm por debajo de los hombros de pie y 99 mm abajo (antes 138 y 194 mm).
- `verificar_piernas.py` lista los fotogramas de pie (1–3, 20–24) en `valgo_frames`: con las
  piernas casi rectas las rodillas quedan algo más juntas que los tobillos; no es valgo bajo carga.

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
