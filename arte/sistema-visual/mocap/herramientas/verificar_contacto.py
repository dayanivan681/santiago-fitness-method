import bpy,sys
bpy.ops.wm.open_mainfile(filepath=sys.argv[sys.argv.index('--')+1]); s=bpy.context.scene
for f in (1,12):
    s.frame_set(f); dg=bpy.context.evaluated_depsgraph_get()
    h=bpy.data.objects['Human'].evaluated_get(dg); d=bpy.data.objects['Mancuerna'].evaluated_get(dg)
    rig=bpy.data.objects['Human.rig']; wr=[rig.matrix_world@rig.pose.bones[f'wrist.{x}'].head for x in 'LR']
    hi=h.matrix_world.inverted(); best=9
    for v in d.data.vertices:
        p=d.matrix_world@v.co; ok,loc,n,i=h.closest_point_on_mesh(hi@p)
        q=h.matrix_world@loc
        if min((q-w).length for w in wr)<0.13 or abs(q.x)>0.10: continue
        dist=(q-p).length
        inside=(h.matrix_world.to_3x3()@n).dot(p-h.matrix_world@loc)<0
        best=min(best,-dist if inside else dist)
    print('frame',f,'separacion_min_mm',round(best*1000,1))
