"""Diagnóstico visual independiente; no guarda cambios en escenas de entrada."""
import bpy, json, math, os
from pathlib import Path
from mathutils import Vector, Matrix
BASE=Path(__file__).resolve().parent
PREFIX=os.environ.get('PS_AUDITORIA_PREFIX','auditoria')
s=bpy.context.scene
h=bpy.data.objects['Human']; r=bpy.data.objects['Human.rig']
report=[]
for frame in [1,12]:
    s.frame_set(frame); bpy.context.view_layer.update()
    er=r.evaluated_get(bpy.context.evaluated_depsgraph_get())
    row={'frame':frame,'bones':{}}
    for b in er.pose.bones:
        if b.name.startswith(('upperleg','lowerleg','upperarm','lowerarm','spine','root')):
            rest=b.bone.matrix_local
            q=(b.matrix.to_3x3()@rest.to_3x3().inverted()).to_quaternion()
            swing=rest.col[1].to_3d().rotation_difference(b.matrix.col[1].to_3d())
            twist=(swing.inverted()@q).angle
            row['bones'][b.name]={'twist_deg':math.degrees(twist),'scale':list(b.matrix.to_scale()),'head':list(er.matrix_world@b.head),'tail':list(er.matrix_world@b.tail)}
    report.append(row)
(BASE/(PREFIX+'-deformacion.json')).write_text(json.dumps(report,indent=2)+'\n')
# Comparación de silueta: misma malla, en reposo y en las dos posiciones.
for o in s.objects:
    if o.name.startswith('Maq_'):o.hide_render=True
cam=s.camera
cam.data.type='ORTHO'; cam.data.ortho_scale=2.25
s.render.resolution_x=700;s.render.resolution_y=850;s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG'
s.render.film_transparent=False
for state in ['arriba','abajo','reposo']:
    s.frame_set(12 if state=='abajo' else 1)
    r.data.pose_position='REST' if state=='reposo' else 'POSE'
    bpy.context.view_layer.update()
    eh=h.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh=eh.to_mesh(); pts=[eh.matrix_world@v.co for v in mesh.vertices]
    lo=Vector(tuple(min(p[i] for p in pts) for i in range(3)))
    hi=Vector(tuple(max(p[i] for p in pts) for i in range(3)))
    center=(lo+hi)/2;eh.to_mesh_clear()
    for view,direction in [('frente',Vector((0,-1,0))),('lado',Vector((1,0,0)))]:
        cam.location=center+direction*5
        cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
        s.render.filepath=str(BASE/f'{PREFIX}-{state}-{view}.png')
        bpy.ops.render.render(write_still=True)
