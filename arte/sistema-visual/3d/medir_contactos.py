import bpy, json, math, os
from pathlib import Path
BASE=Path(__file__).resolve().parent
BASE=BASE/os.environ.get('PS_RESULTADO_DIR','')
s=bpy.context.scene
h=bpy.data.objects['Human'];r=bpy.data.objects['Human.rig'];pad=bpy.data.objects['Maq_respaldo'];platform=bpy.data.objects['Maq_plataforma']
groups={g.name:g.index for g in h.vertex_groups}
build=json.loads((BASE/'validacion-rig.json').read_text())
profile=build['perfil_respaldo_local']
def front(z):
 z=max(-.5,min(.5,z))
 t=(z+.5)*32;i=min(31,int(t));t-=i
 low=build['perfil_respaldo_abajo_local']
 phase=pad.data.shape_keys.key_blocks['Compresion'].value
 base=profile[i]['y_frente']*(1-t)+profile[i+1]['y_frente']*t
 bottom=low[i]['y_frente']*(1-t)+low[i+1]['y_frente']*t
 return base*(1-phase)+bottom*phase
torso_groups={g.index for g in h.vertex_groups if g.name.startswith('spine') or g.name in ['root','pelvis.L','pelvis.R']}
rows=[]
for f in range(1,24):
 s.frame_set(f);bpy.context.view_layer.update()
 dg=bpy.context.evaluated_depsgraph_get();he=h.evaluated_get(dg);mesh=he.to_mesh(preserve_all_data_layers=True,depsgraph=dg)
 row={'frame':f,'espalda':{},'contacto_zonas':{},'pies':{},'hombros':{}}
 for name in ['root','pelvis.L','pelvis.R','spine05','spine04','spine03','spine02','spine01']:
  candidates=[]
  for v in mesh.vertices:
   if any(g.group==groups[name] and g.weight>.5 for g in v.groups):
    p=pad.matrix_world.inverted()@he.matrix_world@v.co
    if abs(p.x)<.45 and -.5<p.z<.5:candidates.append(p)
  if candidates:
   back=min(candidates,key=lambda p:front(p.z)-p.y)
   row['espalda'][name]={'separacion_m':(front(back.z)-back.y)*.13,'punto_local':list(back)}
 back_points=[pad.matrix_world.inverted()@he.matrix_world@v.co for v in mesh.vertices
              if sum(g.weight for g in v.groups if g.group in torso_groups)>.25]
 for name,zlo,zhi in [('pelvis',-.5,-.35),('lumbar',-.35,-.10),('torax',-.10,.20)]:
  band=[p for p in back_points if abs(p.x)<.40 and zlo<p.z<zhi]
  row['contacto_zonas'][name]=min((front(p.z)-p.y)*.13 for p in band)
 for side in ['L','R']:
  candidates=[]
  for v in mesh.vertices:
   if any(g.group==groups['foot.'+side] and g.weight>.6 for g in v.groups):
    p=platform.matrix_world.inverted()@he.matrix_world@v.co
    candidates.append(p)
  row['pies'][side]={'suela_minima_m':min(p.z-.5 for p in candidates)*.07,
    'rango_x_local':[min(p.x for p in candidates),max(p.x for p in candidates)],
    'rango_y_local':[min(p.y for p in candidates),max(p.y for p in candidates)]}
  b=r.pose.bones['upperarm01.'+side]
  shoulder=r.matrix_world@b.head
  cushion=bpy.data.objects['Maq_hombrera'+('1' if side=='L' else '-1')]
  row['hombros'][side]={'articulacion':list(shoulder),'hombrera_centro':list(cushion.matrix_world.translation),'distancia_centros_m':(shoulder-cushion.matrix_world.translation).length}
  er=r.evaluated_get(dg);joint=er.pose.bones['upperarm01.'+side].head
  invrig=er.matrix_world.inverted();invcushion=cushion.matrix_world.inverted()
  patch=[]
  for v in mesh.vertices:
   world=he.matrix_world@v.co;local=invrig@world
   if abs(local.x-joint.x)<.045 and abs(local.y-joint.y)<.10 and joint.z-.02<local.z<joint.z+.14:
    q=invcushion@world
    if abs(q.z)<.1:patch.append(math.sqrt(q.x*q.x+q.y*q.y)-.062)
  row['hombros'][side]['contacto_superficie_m']=min(patch)
 he.to_mesh_clear();rows.append(row)
(BASE/'contactos-superficie.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps(rows,indent=2))
