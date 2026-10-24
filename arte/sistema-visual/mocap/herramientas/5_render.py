"""Render con alfa. Uso: blend dir_salida [muestras] [camaras_json]; una repetición completa por cámara, numeración continua."""
import bpy,sys,os,json
from mathutils import Vector
A=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=A[0]); out=A[1]; os.makedirs(out,exist_ok=True)
s=bpy.context.scene; cam=s.camera
CAMS=json.loads(A[3]) if len(A)>3 else [[[1.25,-2.75,1.05],[0,0.08,0.8],50]]
s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage=360,480,100
s.eevee.taa_render_samples=int(A[2]) if len(A)>2 else 128
s.render.image_settings.file_format='PNG'; s.render.image_settings.color_mode='RGBA'; s.render.film_transparent=True
n=0
for pos,tgt,lens in CAMS:
    cam.location=Vector(pos); cam.rotation_euler=(Vector(tgt)-cam.location).to_track_quat('-Z','Y').to_euler(); cam.data.lens=lens
    for f in range(s.frame_start,s.frame_end+1):
        n+=1; s.frame_set(f); s.render.filepath=f'{out}/frame-{n:04d}.png'; bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=A[0].replace('.blend','-final.blend'))
print('FIN')
