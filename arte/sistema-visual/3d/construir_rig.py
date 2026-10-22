"""Rig MPFB de contacto, regenerable sin Rigify ni cambios de proporciones.

Blender --background pendulum-squat.blend --python construir_rig.py
El original es siempre la entrada, pendulum-squat-rig.blend es la salida.
"""
import bpy
import bmesh
import json
import math
from pathlib import Path
from mathutils import Vector, Matrix

BASE=Path(__file__).resolve().parent
s=bpy.context.scene
rig=bpy.data.objects['Human.rig']
human=bpy.data.objects['Human']
pivot=bpy.data.objects['Pivote']
pad=bpy.data.objects['Maq_respaldo']
platform=bpy.data.objects['Maq_plataforma']
s.frame_set(1)
bpy.context.view_layer.update()
machine_original={o.name:{'matrix_basis':[list(v) for v in o.matrix_basis],
    'matrix_parent_inverse':[list(v) for v in o.matrix_parent_inverse],
    'vertices':[list(v.co) for v in o.data.vertices]} for o in s.objects if o.name.startswith('Maq_')}
bone_original={b.name:{'head':list(b.head_local),'tail':list(b.tail_local)} for b in rig.data.bones}
pad0=pad.matrix_world.copy()
pivot0=pivot.matrix_world.copy()
a0=pivot.rotation_euler.x
rotation=pad0.to_quaternion()
normal=rotation@Vector((0,-1,0))
hip=rig.data.bones['upperleg01.L'].head_local.copy()
knee=rig.data.bones['lowerleg01.L'].head_local.copy()
ankle=rig.data.bones['foot.L'].head_local.copy()
thigh=(hip-knee).length
shin=(knee-ankle).length
body_group=human.vertex_groups['body'].index
skin=[v.co for v in human.data.vertices if .80<v.co.z<.94 and abs(v.co.x)<.13
      and any(g.group==body_group and g.weight>0 for g in v.groups)]
depth=max(v.y for v in skin)-hip.y
# Pelvis en la zona inferior del respaldo; pies colocados de una vez en
# la superficie de la plataforma. Ningún offset animado del esqueleto.
hip_anchor=pad0@Vector((hip.x/.54,-.5,-.5)) + normal*depth
foot_anchor=platform.matrix_world.translation+platform.matrix_world.to_quaternion()@Vector((ankle.x,.22,.035+ankle.z))
local_hip=pivot0.inverted()@hip_anchor

def position_at(a):
    return pivot.location + Matrix.Rotation(a,3,'X')@local_hip

def knee_angle(a):
    d=(position_at(a)-foot_anchor).length
    c=(thigh*thigh+shin*shin-d*d)/(2*thigh*shin)
    return math.degrees(math.acos(max(-1,min(1,c))))

def find_angle(degrees):
    # Rama de subida del lado delantero del péndulo; una sola variable.
    lo,hi=math.radians(-60),math.radians(-22)
    for _ in range(60):
        mid=(lo+hi)/2
        if knee_angle(mid)>degrees: lo=mid
        else: hi=mid
    return (lo+hi)/2

top=find_angle(170)
bottom=find_angle(90)
rig.animation_data_clear()
for pb in rig.pose.bones:
    pb.matrix_basis=Matrix.Identity(4)
    for c in list(pb.constraints):pb.constraints.remove(c)
rig.hide_set(False)
rig.hide_viewport=False
rig.hide_render=True
human.location=(0,0,0)
# Sólo se mueve el rig. La malla mantiene su transformación local original.
rig.parent=pivot
rig.matrix_parent_inverse=pivot0.inverted()
rig.matrix_world=Matrix.LocRotScale(hip_anchor-rotation@hip,rotation,Vector((1,1,1)))
bpy.context.view_layer.update()

controls=bpy.data.collections.new('PS_Contactos')
s.collection.children.link(controls)

def target(name,point,parent=None,quat=None):
    o=bpy.data.objects.new(name,None)
    controls.objects.link(o)
    o.empty_display_type='SPHERE';o.empty_display_size=.025
    o.hide_render=True
    o.parent=parent
    if parent:o.matrix_parent_inverse=parent.matrix_world.inverted()
    o.matrix_world=Matrix.LocRotScale(point,quat or Matrix.Identity(3).to_quaternion(),Vector((1,1,1)))
    return o

bone_matrices={b.name:b.matrix_local.copy() for b in rig.data.bones}
bpy.context.view_layer.objects.active=rig
rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')

def edit_bone(name,head,tail,parent,orientation=None):
    b=rig.data.edit_bones.new(name)
    b.head=head;b.tail=tail;b.parent=rig.data.edit_bones[parent]
    b.use_deform=False
    if orientation is not None:b.align_roll(orientation.to_3x3().col[2])
    return b

for side in ['L','R']:
    for limb,start,joint,end,parent in [
        ('pierna','upperleg01','lowerleg01','foot','pelvis'),
        ('brazo','upperarm01','lowerarm01','wrist','shoulder01')]:
        names=[x+'.'+side for x in [start,joint,end,parent]]
        A,B,C=[rig.data.edit_bones[n].head.copy() for n in names[:3]]
        upper=edit_bone('PS_'+limb+'_prox.'+side,A,B,names[3])
        lower=edit_bone('PS_'+limb+'_dist.'+side,B,C,upper.name)
        for original,controller in [(names[0],upper),(names[1],lower)]:
            b=rig.data.edit_bones[original]
            edit_bone('PS_salida_'+original,b.head.copy(),b.tail.copy(),controller.name,bone_matrices[original])
bpy.ops.object.mode_set(mode='OBJECT')
bpy.context.view_layer.update()

def copy_rotation(bone,t,subtarget=''):
    c=rig.pose.bones[bone].constraints.new('COPY_ROTATION')
    c.name='PS orientación de contacto';c.target=t;c.subtarget=subtarget
    c.target_space='WORLD';c.owner_space='WORLD'
    return c

def ik(bone,t,pole=None):
    c=rig.pose.bones[bone].constraints.new('IK')
    c.name='PS IK sin estiramiento';c.target=t;c.chain_count=2
    c.iterations=256;c.use_stretch=False
    if pole:c.pole_target=pole
    return c

feet={};hands={}
for side,sign in [('L',1),('R',-1)]:
    foot=foot_anchor.copy();foot.x=sign*abs(foot.x)
    fq=platform.matrix_world.to_quaternion()@bone_matrices['foot.'+side].to_quaternion()
    feet[side]=target('PS_Pie.'+side,foot,None,fq)
    pole=target('PS_Rodilla.'+side,foot+Vector((sign*.12,-1,.5)))
    c=ik('PS_pierna_dist.'+side,feet[side],pole)
    # En ambos lados el plano de rodilla se orienta hacia la plataforma.
    c.pole_angle=0
    copy_rotation('upperleg01.'+side,rig,'PS_salida_upperleg01.'+side)
    copy_rotation('lowerleg01.'+side,rig,'PS_salida_lowerleg01.'+side)
    copy_rotation('foot.'+side,feet[side])
    grip=bpy.data.objects['Maq_agarre'+('1' if side=='L' else '-1')]
    palm=(rig.data.bones['finger3-1.'+side].head_local-rig.data.bones['wrist.'+side].head_local)*.70
    hand_align=palm.normalized().rotation_difference(Vector((0,0,1)))
    wq=hand_align@bone_matrices['wrist.'+side].to_quaternion()
    wrist_point=grip.matrix_world.translation-hand_align@palm+Vector((sign*.040,0,0))
    hands[side]=target('PS_Mano.'+side,wrist_point,pivot,wq)
    pole=target('PS_Codo.'+side,grip.matrix_world.translation+Vector((sign*.4,.1,-.4)),pivot)
    ik('PS_brazo_dist.'+side,hands[side],pole)
    copy_rotation('upperarm01.'+side,rig,'PS_salida_upperarm01.'+side)
    copy_rotation('lowerarm01.'+side,rig,'PS_salida_lowerarm01.'+side)
    copy_rotation('wrist.'+side,hands[side])
    # Los dedos se cierran mediante cadenas IK hacia la superficie del
    # cilindro; no se deja una palma abierta simulando un agarre.
    for finger in range(1,6):
        base=rig.data.bones[f'finger{finger}-1.{side}'].head_local
        local_base=hand_align@(base-rig.data.bones['wrist.'+side].head_local)
        base_world=wrist_point+local_base
        center=grip.matrix_world.translation.copy();center.y=base_world.y
        radial=base_world-center
        theta=math.atan2(radial.z,radial.x)
        reach=sum(rig.data.bones[f'finger{finger}-{j}.{side}'].length for j in [1,2,3])*.9
        fingertip=None
        for turn in [1.4,1.0,.7,.4,0]:
            phi=theta+sign*turn
            trial=center+Vector((.034*math.cos(phi),0,.034*math.sin(phi)))
            if (trial-base_world).length<=reach:
                fingertip=trial;break
        assert fingertip is not None, f'Dedo {finger}.{side} no alcanza el cilindro sin estirarse'
        t=target(f'PS_Dedo{finger}.{side}',fingertip,pivot)
        pole=target(f'PS_DedoPlano{finger}.{side}',grip.matrix_world.translation+Vector((sign*.10,local_base.y,.055)),pivot)
        c=ik(f'finger{finger}-3.{side}',t,pole)
        c.chain_count=3

# Columna resuelta como cadena de CINCO vértebras. Una pequeña acomodación
# de la pelvis al descenso la absorbe la cadena; el tórax sigue el respaldo.
chest=target('PS_Torax',rig.matrix_world@rig.data.bones['spine01'].tail_local-normal*.027,pivot,
             (rig.matrix_world@bone_matrices['spine01']).to_quaternion())
sp=rig.pose.bones['spine01'].constraints.new('IK')
sp.name='PS columna distribuida 5 vértebras';sp.target=chest
sp.chain_count=5;sp.use_stretch=False;sp.iterations=256
root=rig.pose.bones['root'];root.rotation_mode='XYZ'
d=root.driver_add('rotation_euler',0).driver
v=d.variables.new();v.name='a';v.type='SINGLE_PROP'
v.targets[0].id=pivot;v.targets[0].data_path='rotation_euler[0]'
d.expression=f'-0.10*(a-({top}))'

pivot.animation_data_clear()
# Calibración sobre la cadena evaluada (incluye offsets anatómicos de MPFB),
# no sobre ángulos de pose. Sólo varía el ángulo del carro.
for _ in range(3):
    d.expression=f'-0.10*(a-({top}))'
    lo,hi=math.radians(-42),math.radians(-36)
    for _ in range(28):
        a=(lo+hi)/2;pivot.rotation_euler.x=a
        bpy.context.view_layer.update()
        er=rig.evaluated_get(bpy.context.evaluated_depsgraph_get())
        A=er.pose.bones['upperleg01.L'].head
        B=er.pose.bones['lowerleg01.L'].head
        C=er.pose.bones['foot.L'].head
        actual=math.degrees((A-B).angle(C-B))
        if actual>170:lo=a
        else:hi=a
    top=(lo+hi)/2
d.expression=f'-0.10*(a-({top}))'
for frame,a in [(1,top),(12,bottom),(23,top)]:
    s.frame_set(frame)
    pivot.rotation_euler.x=a
    pivot.keyframe_insert(data_path='rotation_euler',index=0,frame=frame)
for layer in pivot.animation_data.action.layers:
    for strip in layer.strips:
        for bag in strip.channelbags:
            for fc in bag.fcurves:
                for k in fc.keyframe_points:k.interpolation='BEZIER'
pivot['PS_descripcion']='Único accionador: rotation_euler.x; IK sin stretch, contactos fijos.'
pivot['PS_arriba_grados']=math.degrees(top);pivot['PS_abajo_grados']=math.degrees(bottom)

def vec(v):return [round(float(x),6) for x in v]

def evaluate(frame,angle=None):
    s.frame_set(frame)
    if angle is not None:pivot.rotation_euler.x=angle
    bpy.context.view_layer.update()
    er=rig.evaluated_get(bpy.context.evaluated_depsgraph_get())
    row={'frame':frame,'pivote_grados':math.degrees(pivot.rotation_euler.x),'pies':{},'manos':{},'dedos':{},'columna':{}}
    for side in ['L','R']:
        p=er.matrix_world@er.pose.bones['foot.'+side].head
        a=er.matrix_world@er.pose.bones['upperleg01.'+side].head
        b=er.matrix_world@er.pose.bones['lowerleg01.'+side].head
        c=er.matrix_world@er.pose.bones['foot.'+side].head
        row['pies'][side]={'pos':vec(p),'error_m':(p-feet[side].matrix_world.translation).length,
            'rodilla_interna_grados':math.degrees((a-b).angle(c-b))}
        p=er.matrix_world@er.pose.bones['wrist.'+side].head
        row['manos'][side]={'pos':vec(p),'error_m':(p-hands[side].matrix_world.translation).length}
        row['dedos'][side]=[(er.matrix_world@er.pose.bones[f'finger{i}-3.{side}'].tail-bpy.data.objects[f'PS_Dedo{i}.{side}'].matrix_world.translation).length for i in range(1,6)]
    for name in ['spine05','spine04','spine03','spine02','spine01']:
        pb=er.pose.bones[name]
        local=pb.parent.matrix.inverted()@pb.matrix
        rest=pb.parent.bone.matrix_local.inverted()@pb.bone.matrix_local
        row['columna'][name]=list((rest.inverted()@local).to_quaternion())
    return row

report={'estado':'Rig sujeto a las comprobaciones de aceptacion.json',
    'arco_original_grados':[-7,5], 'arco_corregido_grados':[math.degrees(top),math.degrees(bottom)],
    'cambio':'Arco del accionador y apoyos del carro recalibrados con autorización. Plataforma y proporciones intactas.',
    'muestras':[evaluate(f) for f in range(1,24)],
    'pivote_directo_sin_clavar_huesos':[evaluate(1,top+(bottom-top)*t) for t in [.13,.37,.73,.89]]}
s.frame_set(1);bpy.context.view_layer.update()
# Autorización del dueño 2026-10-21: recalibrar apoyos del carro, conservando
# plataforma, cuerpo y MPFB. El acolchado se adapta a la superficie medida.
dg=bpy.context.evaluated_depsgraph_get()
eh=human.evaluated_get(dg);body_mesh=eh.to_mesh(preserve_all_data_layers=True,depsgraph=dg)
body_points=[eh.matrix_world@v.co for v in body_mesh.vertices]
back_groups={g.index for g in human.vertex_groups if g.name.startswith('spine') or g.name in ['root','pelvis.L','pelvis.R']}
invpad=pad.matrix_world.inverted()
back_points=[invpad@eh.matrix_world@v.co for v in body_mesh.vertices
             if sum(g.weight for g in v.groups if g.group in back_groups)>.25]
back_points=[p for p in back_points if abs(p.x)<.40 and -.65<p.z<.55]
zs=[-.5+i/32 for i in range(33)]
profile=[]
for z in zs:
    band=[p for p in back_points if abs(p.z-z)<.02]
    if not band:
        nearest=min(abs(p.z-z) for p in back_points)
        band=[p for p in back_points if abs(p.z-z)<nearest+.012]
    profile.append(max(p.y for p in band)+.001/.13)
# La espuma acompaña la pequeña acomodación de pelvis/columna. Su perfil
# inferior también sale de la superficie evaluada, no de ajustes a ojo.
s.frame_set(12);bpy.context.view_layer.update()
dg_bottom=bpy.context.evaluated_depsgraph_get()
eh_bottom=human.evaluated_get(dg_bottom);mesh_bottom=eh_bottom.to_mesh(preserve_all_data_layers=True,depsgraph=dg_bottom)
inverse_bottom=pad.matrix_world.inverted()
back_bottom=[inverse_bottom@eh_bottom.matrix_world@v.co for v in mesh_bottom.vertices
             if sum(g.weight for g in v.groups if g.group in back_groups)>.25]
back_bottom=[p for p in back_bottom if abs(p.x)<.40 and -.65<p.z<.55]
profile_bottom=[]
for z in zs:
    band=[p for p in back_bottom if abs(p.z-z)<.02]
    if not band:
        nearest=min(abs(p.z-z) for p in back_bottom)
        band=[p for p in back_bottom if abs(p.z-z)<nearest+.012]
    profile_bottom.append(max(p.y for p in band)+.001/.13)
eh_bottom.to_mesh_clear()
s.frame_set(1);bpy.context.view_layer.update()
# Se conserva anchura, altura y posición del respaldo. Sólo varía el frente
# de la espuma para sostener pelvis/lumbar/tórax, sin forzar la anatomía.
verts=[]
for back in [False,True]:
    for j,z in enumerate(zs):
        for x in [-.5,0,.5]:verts.append((x,.5 if back else profile[j],z))
N=len(zs)*3;faces=[]
for j in range(len(zs)-1):
    for i in range(2):
        a=j*3+i;b=a+1;c=a+4;d0=a+3
        faces.append((a,d0,c,b));faces.append((N+a,N+b,N+c,N+d0))
for j in range(len(zs)-1):
    a=j*3;b=(j+1)*3;faces.append((a,N+a,N+b,b))
    a=j*3+2;b=(j+1)*3+2;faces.append((a,b,N+b,N+a))
for i in range(2):
    faces.append((i,i+1,N+i+1,N+i))
    a=(len(zs)-1)*3+i;faces.append((a,N+a,N+a+1,a+1))
new_pad=bpy.data.meshes.new('PS_respaldo_con_apoyo_medido')
new_pad.from_pydata(verts,[],faces);new_pad.update()
bm=bmesh.new();bm.from_mesh(new_pad)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(new_pad);bm.free()
for mat in pad.data.materials:new_pad.materials.append(mat)
pad.data=new_pad
pad.shape_key_add(name='Base')
compression=pad.shape_key_add(name='Compresion')
for j in range(len(zs)):
    for i in range(3):compression.data[j*3+i].co.y=profile_bottom[j]
compression_driver=compression.driver_add('value').driver
v=compression_driver.variables.new();v.name='a';v.type='SINGLE_PROP'
v.targets[0].id=pivot;v.targets[0].data_path='rotation_euler[0]'
compression_driver.expression=f'min(1,max(0,(a-({top}))/({bottom-top})))'
for side,suffix in [('L','1'),('R','-1')]:
    joint=rig.pose.bones['upperarm01.'+side].head.copy()
    invrig=rig.matrix_world.inverted()
    local_points=[invrig@p for p in body_points]
    patch=[p for p in local_points if abs(p.x-joint.x)<.045 and abs(p.y-joint.y)<.10
           and joint.z-.02<p.z<joint.z+.14]
    radius=.062
    center_z=max(p.z+math.sqrt(radius*radius-(p.x-joint.x)**2) for p in patch if abs(p.x-joint.x)<radius)
    cushion=bpy.data.objects['Maq_hombrera'+suffix]
    center=Vector((joint.x,joint.y,center_z-.001))
    cushion.matrix_world=Matrix.LocRotScale(rig.matrix_world@center,
        (rig.matrix_world.to_3x3()@Matrix.Rotation(math.pi/2,3,'X')).to_quaternion(),Vector((1,1,1)))
eh.to_mesh_clear()
bpy.context.view_layer.update()
report['apoyos_recalibrados_con_autorizacion']=['Maq_respaldo','Maq_hombrera-1','Maq_hombrera1']
report['perfil_respaldo_local']=[{'z':z,'y_frente':y} for z,y in zip(zs,profile)]
report['perfil_respaldo_abajo_local']=[{'z':z,'y_frente':y} for z,y in zip(zs,profile_bottom)]
report['compresion_espuma_maxima_m']=max(abs(a-b)*.13 for a,b in zip(profile,profile_bottom))
report['geometria_maquina_identica']=all(
    machine_original[o.name]['matrix_basis']==[list(v) for v in o.matrix_basis] and
    machine_original[o.name]['matrix_parent_inverse']==[list(v) for v in o.matrix_parent_inverse] and
    machine_original[o.name]['vertices']==[list(v.co) for v in o.data.vertices]
    for o in s.objects if o.name.startswith('Maq_'))
report['resto_de_maquina_identico']=all(
    machine_original[o.name]['matrix_basis']==[list(v) for v in o.matrix_basis] and
    machine_original[o.name]['matrix_parent_inverse']==[list(v) for v in o.matrix_parent_inverse] and
    machine_original[o.name]['vertices']==[list(v.co) for v in o.data.vertices]
    for o in s.objects if o.name.startswith('Maq_') and o.name not in report['apoyos_recalibrados_con_autorizacion'])
report['huesos_originales_identicos']=all(bone_original[n]['head']==list(rig.data.bones[n].head_local) and bone_original[n]['tail']==list(rig.data.bones[n].tail_local) for n in bone_original)
report['sin_keyframes_de_pose']=not rig.animation_data.action
report['controles']={'accionador':'Pivote.rotation_euler.x','keyframes':[1,12,23],
    'ik_sin_estirar':all(not c.use_stretch for pb in rig.pose.bones for c in pb.constraints if c.type=='IK'),
    'columna_huesos':5,'Human_location':list(human.location)}
(BASE/'validacion-rig.json').write_text(json.dumps(report,indent=2)+'\n')
s.frame_set(1);bpy.context.view_layer.update()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'pendulum-squat-rig.blend'))
print('PS_RESULT',json.dumps(report['muestras'][0]),json.dumps(report['muestras'][11]))
