"""Goblet squat: mocap CMU 13_30 (rep 2) -> rig MPFB; brazos IK a mancuerna en el pecho."""
import bpy,sys,math,os,addon_utils,json
from mathutils import Matrix,Quaternion,Vector,Euler
addon_utils.enable('io_anim_bvh',default_set=True)
A=sys.argv[sys.argv.index('--')+1:]
BASE_BLEND,BVH,OUT=A[0],A[1],A[2]
F0,F1=int(os.environ.get('G_F0',1700)),int(os.environ.get('G_F1',1956))
NF=int(os.environ.get('G_NF',24))
bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)
s=bpy.context.scene
for o in list(bpy.data.objects):
    if o.name.startswith('Maq_') or o.name=='Pivote': bpy.data.objects.remove(o,do_unlink=True)
rig=bpy.data.objects['Human.rig']; rig.animation_data_clear()
for pb in rig.pose.bones:
    pb.rotation_mode='QUATERNION'; pb.matrix_basis=Matrix.Identity(4)
    for c in list(pb.constraints): pb.constraints.remove(c)
# --- fuente
bpy.ops.import_anim.bvh(filepath=BVH,global_scale=0.056444,use_fps_scale=False,axis_forward='-Z',axis_up='Y')
src=bpy.context.object; sp=src.pose.bones
def sw(b,f=None):
    return src.matrix_world@sp[b].head
# rumbo: media del eje izquierda-derecha de la cadera durante la repetición -> +X
acc=Vector((0,0,0))
for f in range(F0,F1+1,8):
    s.frame_set(f); v=sw('LeftUpLeg')-sw('RightUpLeg'); v.z=0; acc+=v.normalized()
yaw=math.atan2(acc.y,acc.x)
src.rotation_euler.z-=yaw
bpy.context.view_layer.update()
RW=rig.matrix_world; RWi=RW.inverted()
rb=rig.data.bones
def rest_head(n): return RW@rb[n].head_local
def rest_rot(n): return (RW@rb[n].matrix_local).to_quaternion()
sb=src.data.bones
def src_rest_rot(n): return (src.matrix_world@sb[n].matrix_local).to_quaternion()
def src_rest_head(n): return src.matrix_world@sb[n].head_local
# (destino, fuente, fin_destino, fin_fuente)  None => sin swing
MAPA=[('root','Hips',None,None),
 ('spine05','LowerBack',None,None),('spine04','LowerBack',None,None),
 ('spine03','Spine',None,None),('spine02','Spine',None,None),('spine01','Spine1',None,None),
 ('neck01','Neck',None,None),('neck02','Neck',None,None),('neck03','Neck1',None,None),('head','Head',None,None)]
for L,SL in (('L','Left'),('R','Right')):
    MAPA+= [(f'upperleg01.{L}',f'{SL}UpLeg',f'lowerleg01.{L}',f'{SL}Leg'),
            (f'lowerleg01.{L}',f'{SL}Leg',f'foot.{L}',f'{SL}Foot'),
            (f'foot.{L}',f'{SL}Foot',f'toe1-1.{L}',f'{SL}ToeBase')]
SWING={}
for t,sname,te,se in MAPA:
    if te:
        dt=(rest_head(te)-rest_head(t)).normalized(); ds=(src_rest_head(se)-src_rest_head(sname)).normalized()
        SWING[t]=dt.rotation_difference(ds)
    else: SWING[t]=Quaternion()
mapped={m[0]:m for m in MAPA}
# escala por longitud de pierna
leg_t=(rest_head('upperleg01.L')-rest_head('foot.L')).length
leg_s=(src_rest_head('LeftUpLeg')-src_rest_head('LeftFoot')).length
r=leg_t/leg_s
s.frame_set(F0); hips0=sw('Hips')
order=[b.name for b in rig.data.bones]  # padres antes que hijos
def local_from_arm(n,M,Mp):
    b=rb[n]
    if b.parent is None: return b.matrix_local.inverted()@M
    rel=b.parent.matrix_local.inverted()@b.matrix_local
    return rel.inverted()@Mp.inverted()@M
frames=[F0+(F1-F0)*i/NF for i in range(NF)]  # bucle: el último no repite el primero
# Profundidad máxima (G_MUSLO: ángulo del muslo con la vertical, 90 = paralelo al suelo). Se conserva el
# ritmo del mocap con la profundidad escalada: cada fotograma toma el instante de bajada (o de subida)
# en que el muslo del sujeto tiene el ángulo deseado.
GM=os.environ.get('G_MUSLO')
if GM:
    GM=float(GM)
    def muslo(f):
        s.frame_set(int(f),subframe=f-int(f)); a=0
        for L in ('Left','Right'): a+=math.degrees((sw(f'{L}Leg')-sw(f'{L}UpLeg')).angle(Vector((0,0,-1))))
        return a/2
    ss=[F0+k*0.5 for k in range(int((F1-F0)*2)+1)]; th=[muslo(x) for x in ss]
    kb=max(range(len(ss)),key=lambda k:th[k]); t0=th[0]
    if th[kb]>GM:
        def cruce(obj,rango):
            k=min(rango,key=lambda k:abs(th[k]-obj)); return ss[k]
        nuevo=[]
        for ff in frames:
            k=min(range(len(ss)),key=lambda k:abs(ss[k]-ff))
            obj=t0+(GM-t0)*max(0.0,(th[k]-t0)/(th[kb]-t0))
            nuevo.append(cruce(obj,range(0,kb+1)) if k<=kb else cruce(obj,range(kb,len(ss))))
        frames=nuevo
        print('profundidad',round(th[kb],1),'->',GM)
keys=[]
for i,ff in enumerate(frames):
    s.frame_set(int(ff),subframe=ff-int(ff))
    Marm={}
    for n in order:
        b=rb[n]
        Mp=Marm[b.parent.name] if b.parent else None
        if n in mapped:
            t,sname,_,_=mapped[n]
            Rs=(src.matrix_world@sp[sname].matrix).to_quaternion()
            delta=Rs@src_rest_rot(sname).inverted()
            Rt=delta@SWING[n]@rest_rot(n)
            if b.parent is None:
                hw=sw('Hips'); pos=rest_head('root')+r*(hw-hips0)
            else:
                pos=(RW@Mp@(b.parent.matrix_local.inverted()@b.matrix_local)).to_translation()
            Mw=Matrix.Translation(pos)@Rt.to_matrix().to_4x4()
            M=RWi@Mw
        else:
            M=Mp@(b.parent.matrix_local.inverted()@b.matrix_local) if b.parent else b.matrix_local.copy()
        Marm[n]=M
    keys.append({n:local_from_arm(n,Marm[n],Marm[rb[n].parent.name] if rb[n].parent else None) for n in mapped})
NB=int(os.environ.get('G_BLEND',0))
for j in range(NB):  # cierre del bucle: los últimos NB frames convergen al primero
    i=len(keys)-NB+j; w=(j+1)/(NB+1)
    for n,L in keys[i].items():
        q=L.to_quaternion().slerp(keys[0][n].to_quaternion(),w); tr=L.to_translation().lerp(keys[0][n].to_translation(),w)
        keys[i][n]=Matrix.Translation(tr)@q.to_matrix().to_4x4()
prev={}
for i,k in enumerate(keys):
    f=i+1
    for n,L in k.items():
        pb=rig.pose.bones[n]; q=L.to_quaternion()
        if n in prev and prev[n].dot(q)<0: q=-q
        prev[n]=q; pb.rotation_quaternion=q; pb.keyframe_insert('rotation_quaternion',frame=f)
        if rb[n].parent is None:
            pb.location=L.to_translation(); pb.keyframe_insert('location',frame=f)
s.frame_start=1; s.frame_end=NF
bpy.data.objects.remove(src,do_unlink=True)
for a in list(bpy.data.actions):
    if a.users==0: bpy.data.actions.remove(a)
# --- apoyo de pies: corrige altura para que el pie más bajo toque el suelo en el frame 1
bpy.context.view_layer.update()
def foot_min():
    h=bpy.data.objects['Human']; dg=bpy.context.evaluated_depsgraph_get(); e=h.evaluated_get(dg); me=e.to_mesh()
    z=min((e.matrix_world@v.co).z for v in me.vertices); e.to_mesh_clear(); return z
s.frame_set(1); dz=foot_min()
fc=[c for c in rig.animation_data.action.fcurves if c.data_path=='pose.bones["root"].location'] if hasattr(rig.animation_data.action,'fcurves') else []
print('suelo dz',dz)
rig.location.z-=dz
json.dump({'yaw_grados':math.degrees(yaw),'escala':r,'dz':dz},open(OUT+'.json','w'))
bpy.ops.wm.save_as_mainfile(filepath=OUT)
