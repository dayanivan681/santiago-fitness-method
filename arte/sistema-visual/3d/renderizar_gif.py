"""Mismo render; alfa para componer el fondo exacto sin cambiar luces."""
import bpy,os
from pathlib import Path
BASE=Path(__file__).resolve().parent
BASE=BASE/os.environ.get('PS_RESULTADO_DIR','')
s=bpy.context.scene
assert (s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage)==(360,480,100)
out=BASE/'fotogramas';out.mkdir(exist_ok=True)
s.render.image_settings.file_format='PNG'
s.render.image_settings.color_mode='RGBA'
s.render.film_transparent=True
for f in range(1,24):
    s.frame_set(f)
    s.render.filepath=str(out/f'frame-{f:04d}.png')
    bpy.ops.render.render(write_still=True)
