#!/bin/bash
# Reproduce el candidato y el diagnóstico. No cambia el archivo original.
set -euo pipefail
PS_DIR="$(cd "$(dirname "$0")" && pwd)"
PS_BLENDER="${PS_BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
export PS_RESULTADO_DIR="${PS_RESULTADO_DIR:-revision-v2}"
PS_OUT="$PS_DIR/$PS_RESULTADO_DIR"
mkdir -p "$PS_OUT"
"$PS_BLENDER" --background "$PS_DIR/pendulum-squat.blend" --python-exit-code 1 --python "$PS_DIR/diagnostico_geometria.py" > "$PS_DIR/diagnostico-geometria.log" 2>&1
"$PS_BLENDER" --background "$PS_DIR/pendulum-squat.blend" --python-exit-code 1 --python "$PS_DIR/construir_rig.py" > "$PS_DIR/construir-rig.log" 2>&1
"$PS_BLENDER" --background "$PS_OUT/pendulum-squat-rig.blend" --python-exit-code 1 --python "$PS_DIR/medir_contactos.py" > "$PS_OUT/medir-contactos.log" 2>&1
"$PS_BLENDER" --background "$PS_OUT/pendulum-squat-rig.blend" --python-exit-code 1 --python "$PS_DIR/validar_orientacion.py" > "$PS_OUT/orientacion.log" 2>&1
"$PS_BLENDER" --background "$PS_OUT/pendulum-squat-rig.blend" --render-output "$PS_OUT/rig-" --render-format PNG --render-frame 1,12 > "$PS_OUT/render-revision.log" 2>&1
python3 "$PS_DIR/verificar_resultado.py"
PS_AUDITORIA_PREFIX="$PS_RESULTADO_DIR/anatomia" "$PS_BLENDER" --background "$PS_OUT/pendulum-squat-rig.blend" --python-exit-code 1 --python "$PS_DIR/auditar_deformacion.py" > "$PS_OUT/anatomia.log" 2>&1
"$PS_BLENDER" --background "$PS_OUT/pendulum-squat-rig.blend" --python-exit-code 1 --python "$PS_DIR/renderizar_gif.py" > "$PS_OUT/render-gif.log" 2>&1
python3 "$PS_DIR/codificar_gif.py"
