"""Mancuerna hexagonal al pecho + IK de brazos con polo calibrado numéricamente."""
import bpy,sys,math,bmesh,json
from mathutils import Vector,Matrix
A=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=A[0]); OUT=A[1]
P=json.loads(A[2]) if len(A)>2 else {}
s=bpy.context.scene; rig=bpy.data.objects['Human.rig']; hum=bpy.data.objects['Human']
s.frame_set(1); bpy.context.view_layer.update()
RW=rig.matrix_world; pb=rig.pose.bones
def ph(n,tail=False): return RW@(pb[n].tail if tail else pb[n].head)
# marco del torso en el frame 1
up=(ph('spine01',True)-ph('spine05')).normalized()
lr=(ph('upperarm01.L')-ph('upperarm01.R')); lr=(lr-lr.dot(up)*up).normalized()
fwd=up.cross(lr).normalized()  # hacia delante del pecho
if fwd.y>0: fwd=-fwd
# superficie del pecho por raycast
dg=bpy.context.evaluated_depsgraph_get(); he=hum.evaluated_get(dg)
zc=P.get('alto',-0.07)
R=0.062; HL=0.075; HH=0.15   # radio cabeza, largo cabeza, mango
inv=he.matrix_world.inverted(); base=ph('spine01')+up*zc
# la parte más saliente del torso a lo largo del eje de la mancuerna (cabezas y mango)
front=-1e9
for k in range(-12,13):
    o=base+up*(k/12)*(HH/2+HL)+fwd*0.6
    ok,loc,nor,idx=he.ray_cast(inv@o,(inv.to_3x3()@(-fwd)).normalized())
    if ok: front=max(front,(he.matrix_world@loc-base).dot(fwd))
axis_pt=base+fwd*(front+R+P.get('holgura',0.005))
top_c=axis_pt+up*(HH/2+HL/2)  # centro cabeza superior
def cyl(name,r,depth,verts,mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth)
    o=bpy.context.object; o.name=name; o.data.materials.append(bpy.data.materials[mat]); 
    bpy.ops.object.shade_flat() if verts==6 else bpy.ops.object.shade_smooth()
    return o
for m,col,rough in (('Hierro',(0.06,0.065,0.07,1),0.45),('Cromo',(0.6,0.6,0.62,1),0.25)):
    if m not in bpy.data.materials:
        mt=bpy.data.materials.new(m); mt.use_nodes=True; b=mt.node_tree.nodes['Principled BSDF']
        b.inputs['Base Color'].default_value=col; b.inputs['Roughness'].default_value=rough; b.inputs['Metallic'].default_value=0.6 if m=='Cromo' else 0.1
parts=[cyl('Manc_cabeza_sup',R,HL,6,'Hierro'),cyl('Manc_mango',0.017,HH,24,'Cromo'),cyl('Manc_cabeza_inf',R,HL,6,'Hierro')]
parts[0].location=(0,0,HH/2+HL/2); parts[2].location=(0,0,-(HH/2+HL/2))
for p in parts[1:]: pass
bpy.ops.object.select_all(action='DESELECT')
for p in parts: p.select_set(True)
bpy.context.view_layer.objects.active=parts[1]; bpy.ops.object.join(); db=bpy.context.object; db.name='Mancuerna'
rot=Matrix((lr,fwd.cross(up)*-1 if False else -fwd.cross(lr).cross(lr)*0+fwd, up)).transposed() if False else Matrix((lr,-fwd*-1,up)).transposed()
# base ortonormal: x=lr, y=?, z=up  (y = z cross x)
yv=up.cross(lr); basis=Matrix((lr,yv,up)).transposed().to_4x4()
Mw=Matrix.Translation(axis_pt)@basis
def bone_child(o,bone,Mw):
    o.parent=rig; o.parent_type='BONE'; o.parent_bone=bone; bpy.context.view_layer.update()
    o.matrix_world=Mw
bone_child(db,'spine01',Mw)
def empty(name,pos,bone='spine01'):
    e=bpy.data.objects.new(name,None); s.collection.objects.link(e); e.empty_display_size=0.03
    bone_child(e,bone,Matrix.Translation(pos)); return e
lat=P.get('lat',0.075); bajo=P.get('bajo',0.075); atras=P.get('atras',0.02)
pole_d=P.get('polo',[0.22,0.05,-0.30])  # lateral, adelante, arriba relativo al hombro
cfg={}
for side,sg in (('L',1),('R',-1)):
    tw=top_c+lr*sg*lat-up*(HL/2+bajo)-fwd*atras
    t=empty(f'IK_mano.{side}',tw)
    sh=ph(f'upperarm01.{side}')
    pl=empty(f'Polo_codo.{side}',sh+lr*sg*pole_d[0]+fwd*pole_d[1]+up*pole_d[2])
    aim=empty(f'Mira_mano.{side}',top_c+up*0.08+lr*sg*0.0)
    c=pb[f'lowerarm02.{side}'].constraints.new('IK'); c.target=t; c.pole_target=pl; c.chain_count=4; c.use_tail=True
    for n in (f'upperarm02.{side}',f'lowerarm02.{side}'): pb[n].lock_ik_x=pb[n].lock_ik_y=pb[n].lock_ik_z=True
    pb[f'lowerarm01.{side}'].lock_ik_y=True
    dt=pb[f'wrist.{side}'].constraints.new('DAMPED_TRACK'); dt.target=aim; dt.track_axis='TRACK_Y'
    cfg[side]=(c,pl)
# calibrar pole_angle: el codo debe desplazarse hacia el polo
def err(side):
    bpy.context.view_layer.update()
    sh=ph(f'upperarm01.{side}'); el=ph(f'lowerarm01.{side}'); wr=ph(f'lowerarm02.{side}',True)
    ax=(wr-sh).normalized(); mid=sh+ax*(el-sh).dot(ax)
    a=(el-mid); a-=a.dot(ax)*ax
    b=(cfg[side][1].matrix_world.to_translation()-mid); b-=b.dot(ax)*ax
    return a.angle(b) if a.length>1e-6 and b.length>1e-6 else math.pi
res={}
for side in 'LR':
    best=None
    for deg in range(-180,180,5):
        cfg[side][0].pole_angle=math.radians(deg); e=err(side)
        if best is None or e<best[1]: best=(deg,e)
    cfg[side][0].pole_angle=math.radians(best[0]); res[side]={'pole_angle':best[0],'error_grados':math.degrees(best[1])}
# medir: alcance de la muñeca al objetivo y ángulo de codo en todos los frames
med=[]
for f in range(s.frame_start,s.frame_end+1):
    s.frame_set(f); bpy.context.view_layer.update()
    row={}
    for side in 'LR':
        wr=ph(f'lowerarm02.{side}',True); tg=bpy.data.objects[f'IK_mano.{side}'].matrix_world.to_translation()
        sh=ph(f'upperarm01.{side}'); el=ph(f'lowerarm01.{side}')
        row[side]=(round((wr-tg).length*1000,1),round(math.degrees((sh-el).angle(wr-el)),1),round(err(side)*57.3,1))
    med.append(row)
res['alcance_mm_codo_grados_err']=med
print(json.dumps(res))
# dedos: flexión suave para envolver la cabeza
curl=P.get('curl',0.45)
for side in 'LR':
    for i in range(1,6):
        for j in range(1,4):
            n=f'finger{i}-{j}.{side}'
            if n in pb: pb[n].rotation_mode='XYZ'; pb[n].rotation_euler.x=curl*(0.5 if i==1 else 1)
s.eevee.taa_render_samples=P.get('samples',16)
bpy.ops.wm.save_as_mainfile(filepath=OUT)
