import bpy,sys,math,json
A=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=A[0]); s=bpy.context.scene; rig=bpy.data.objects['Human.rig']; pb=rig.pose.bones
W=lambda n,t=False: rig.matrix_world@(pb[n].tail if t else pb[n].head)
rows=[]
for f in range(s.frame_start,s.frame_end+1):
    s.frame_set(f)
    k=[math.degrees((W(f'upperleg01.{x}')-W(f'lowerleg01.{x}')).angle(W(f'foot.{x}')-W(f'lowerleg01.{x}'))) for x in 'LR']
    rows.append(dict(f=f,rodilla=[round(v) for v in k],cadera_z=round(W('root').z,3),
      ancho_rod=round((W('lowerleg01.L')-W('lowerleg01.R')).length,3),ancho_tob=round((W('foot.L')-W('foot.R')).length,3),
      tobL=[round(v,3) for v in W('foot.L')],dedoL_z=round(W('toe1-1.L').z,3)))
xs=[r['tobL'] for r in rows]
drift=max(math.dist(a[:2],xs[0][:2]) for a in xs); dz=max(abs(a[2]-xs[0][2]) for a in xs)
print(json.dumps({'deriva_tobillo_xy_mm':round(drift*1000,1),'deriva_tobillo_z_mm':round(dz*1000,1),'rodilla_min':min(min(r['rodilla']) for r in rows),
 'valgo_frames':[r['f'] for r in rows if r['ancho_rod']<r['ancho_tob']-0.01]}))
for r in rows: print(r)
