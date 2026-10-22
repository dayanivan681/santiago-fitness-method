#!/bin/bash
# Reproduce el candidato y el diagnóstico. No cambia el archivo original.
set -euo pipefail
PS_DIR="$(cd "$(dirname "$0")" && pwd)"
PS_BLENDER="${PS_BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
"$PS_BLENDER" --background "$PS_DIR/pendulum-squat.blend" --python "$PS_DIR/diagnostico_geometria.py" > "$PS_DIR/diagnostico-geometria.log" 2>&1
"$PS_BLENDER" --background "$PS_DIR/pendulum-squat.blend" --python "$PS_DIR/construir_rig.py" > "$PS_DIR/construir-rig.log" 2>&1
"$PS_BLENDER" --background "$PS_DIR/pendulum-squat-rig.blend" --python "$PS_DIR/medir_contactos.py" > "$PS_DIR/medir-contactos.log" 2>&1
"$PS_BLENDER" --background "$PS_DIR/pendulum-squat-rig.blend" --render-output "$PS_DIR/rig-" --render-format PNG --render-frame 1,12 > "$PS_DIR/render-revision.log" 2>&1
python3 "$PS_DIR/verificar_resultado.py"
"$PS_BLENDER" --background "$PS_DIR/pendulum-squat-rig.blend" --python "$PS_DIR/renderizar_gif.py" > "$PS_DIR/render-gif.log" 2>&1
python3 "$PS_DIR/codificar_gif.py"
