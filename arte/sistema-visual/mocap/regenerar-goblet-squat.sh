#!/bin/bash
# Regenera el Goblet Squat desde cero: mocap CMU -> rig MPFB -> GIF de la app.
# Modo A (Linux/nube): BPY=python con el paquete bpy 5.2.2 (pip install bpy==5.2.2 pillow, Python 3.13).
# Modo B (Mac): PS_BLENDER=/Applications/Blender.app/Contents/MacOS/Blender y python3 con Pillow.
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"; H="$D/herramientas"; O="$D/ejercicios/goblet-squat"
BASE="$D/../3d/pendulum-squat.blend"; BVH="$D/fuentes/13_30.bvh"
mkdir -p "$O/trabajo"; W="$O/trabajo"
run() { local s="$1"; shift
  if [ -n "${PS_BLENDER:-}" ]; then "$PS_BLENDER" --background --python-exit-code 1 --python "$H/$s" -- "$@"
  else "${BPY:?define BPY o PS_BLENDER}" "$H/$s" -- "$@"; fi; }
PYIMG="${PYIMG:-${BPY:-python3}}"
# 0. Cuerpo atlético: macros MakeHuman (CC0) de músculo 1.0 y peso 0.3; esqueleto reajustado.
run 0_cuerpo_atletico.py "$BASE" "$W/0-cuerpo.blend" '{"musculo":1.0,"peso":0.3}'
# 1. Repetición 1 de CMU 13_30 (frames 1456-1700, 120 fps) en 24 fotogramas; cierre del bucle en 3.
G_F0=1456 G_F1=1700 G_NF=24 G_BLEND=3 run 1_retarget_mocap.py "$W/0-cuerpo.blend" "$BVH" "$W/1-retarget.blend"
# 2. Pies fijos (solución analítica de dos huesos) y técnica: rodilla 175° y tronco a 7° arriba (el de
#    reposo), extendidos a la vez; pies planos (orientación de reposo) abiertos 17° los dos;
#    rodillas en la línea de los pies.
run 2_pies_fijos.py "$W/1-retarget.blend" "$W/2-pies.blend" '{"tronco_arriba":7,"apertura_pies":17,"rodilla_pie":1,"rodilla_arriba":175,"pies_planos":true}'
# 3. Mancuerna hexagonal en contacto con el pecho y brazos IK en agarre goblet.
#    alto=0.10: cabeza superior bajo la barbilla y la inferior sobre el esternón (con -0.02 quedaba en el abdomen).
run 3_brazos_mancuerna_pecho.py "$W/2-pies.blend" "$W/3-brazos.blend" '{"alto":0.10,"lat":0.055,"bajo":0.025,"atras":0.0,"polo":[0.2,0.1,-0.35],"curl":0.6,"holgura":0.0005}'
# 4. Estilo: short y atlas de músculos (cuádriceps y glúteos) en rojo liso con volumen y separación
#    suave entre músculos; sin fibras (decisión del dueño, 2026-10-25).
run 4_estilo.py "$W/3-brazos.blend" "$W/4-estilo.blend" '{"anatomia":["cuadriceps","gluteos"],"fibra_osc":0,"fibra_relieve":0,"rojo_surco":[0.55,0.035,0.03,1],"relieve":0.35}'
# 5. Render EEVEE 360x480, 128 muestras, alfa. Dos repeticiones: 3/4 frontal (rodillas y mancuerna)
#    y 3/4 trasera a 125° (glúteos), misma distancia, altura y lente; el corte cae de pie.
rm -rf "$O/fotogramas" "$O/composicion"
run 5_render.py "$W/4-estilo.blend" "$O/fotogramas" 128 '[[[1.25,-2.75,1.05],[0,0.08,0.8],50],[[2.531,1.852,1.05],[0,0.08,0.8],50]]'
cp "$W/4-estilo-final.blend" "$O/goblet-squat.blend"
# 6. Composición sobre #0b0c0d y GIF 12 fps, 48 colores.
"$PYIMG" -I "$H/6_codificar_gif.py" "$O/fotogramas" "$O/goblet-squat.gif" 12 48
# Verificaciones medibles (no sustituyen la revisión visual).
run verificar_piernas.py "$O/goblet-squat.blend" | grep -E '^\{"deriva'
run verificar_contacto.py "$O/goblet-squat.blend" | grep frame
run verificar_tecnica.py "$O/goblet-squat.blend" | grep -E '^\{'
