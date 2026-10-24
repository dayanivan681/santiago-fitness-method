import bpy,sys,os
from mathutils import Vector
A=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=A[0]); out=A[1]; os.makedirs(out,exist_ok=True)
s=bpy.context.scene; cam=s.camera
cam.location=Vector((1.25,-2.75,1.05)); cam.rotation_euler=(Vector((0,0.08,0.8))-cam.location).to_track_quat('-Z','Y').to_euler(); cam.data.lens=50
s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage=360,480,100
s.eevee.taa_render_samples=int(A[2]) if len(A)>2 else 128
s.render.image_settings.file_format='PNG'; s.render.image_settings.color_mode='RGBA'; s.render.film_transparent=True
for f in range(s.frame_start,s.frame_end+1):
    s.frame_set(f); s.render.filepath=f'{out}/frame-{f:04d}.png'; bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=A[0].replace('.blend','-final.blend'))
print('FIN')
