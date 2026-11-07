"""Hoja de revisión: frames elegidos desde frente-3/4 y lateral. Uso: blend out.png frames... [--engine X]"""
import bpy,sys,math
from mathutils import Vector
A=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=A[0]); out=A[1]; frames=[int(x) for x in A[2].split(',')]
eng=A[3] if len(A)>3 else 'BLENDER_EEVEE'
s=bpy.context.scene; s.render.engine=eng
s.eevee.taa_render_samples=int(__import__("os").environ.get("G_SAMPLES",16))
if eng=='CYCLES': s.cycles.samples=24; s.cycles.device='CPU'; s.cycles.use_denoising=True
cam=s.camera
import json
views=json.loads(A[4]) if len(A)>4 else {'frente':[[2.0,-4.2,1.25],[0,0.05,0.78],50],'lado':[[4.6,0.05,1.0],[0,0.05,0.78],50]}
s.render.resolution_x,s.render.resolution_y=360,480
s.render.film_transparent=False
import os
paths=[]
for vn,(pos,tgt,lens) in views.items():
    cam.location=Vector(pos)
    d=Vector(tgt)-cam.location; cam.rotation_euler=d.to_track_quat('-Z','Y').to_euler()
    cam.data.lens=lens
    for f in frames:
        s.frame_set(f); p=f'{out}-{vn}-{f:02d}.png'; s.render.filepath=p; bpy.ops.render.render(write_still=True); paths.append(p)
print('OK',paths)
