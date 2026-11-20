"""Pies fijos al suelo (IK analítico de piernas) y técnica: extensión completa arriba, tronco erguido,
pies simétricos y rodillas en la línea de los pies (opciones tronco_arriba, apertura_pies, rodilla_pie)."""
import bpy,sys,math,json
from mathutils import Vector,Matrix
A=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=A[0]); OUT=A[1]; P=json.loads(A[2]) if len(A)>2 else {}
TOP=P.get('rodilla_arriba',168.0); LO=P.get('desde',110.0)
s=bpy.context.scene; rig=bpy.data.objects['Human.rig']; pb=rig.pose.bones; rb=rig.data.bones
RW=rig.matrix_world
W=lambda n,t=False: rig.matrix_world@(pb[n].tail if t else pb[n].head)
fr=range(s.frame_start,s.frame_end+1)
def suave(e0,e1,x): t=max(0.0,min(1.0,(x-e0)/(e1-e0))); return t*t*(3-2*t)
# tronco: la cadera termina extendida. La pelvis gira hacia atrás sobre el eje de las caderas en
# proporción a la altura, así cadera y rodilla se extienden juntas (el sujeto CMU acaba inclinado ~20°).
TR=P.get('tronco_arriba')
if TR is not None:
    zs={};lean={}
    for f in fr:
        s.frame_set(f); t=W('neck01')-W('root'); zs[f]=W('root').z; lean[f]=math.degrees(math.atan2(-t.y,t.z))
    z0,z1=min(zs.values()),max(zs.values()); C=lean[max(fr,key=lambda f:zs[f])]-TR
    for f in fr:
        s.frame_set(f); bpy.context.view_layer.update()
        c=(W('upperleg01.L')+W('upperleg01.R'))/2; w=suave(P.get('tronco_desde',0.3),1.0,(zs[f]-z0)/(z1-z0))
        Mw=Matrix.Translation(c)@Matrix.Rotation(-math.radians(C*w),4,'X')@Matrix.Translation(-c)@(RW@pb['root'].matrix)
        pb['root'].matrix=RW.inverted()@Mw
        pb['root'].keyframe_insert('rotation_quaternion',frame=f); pb['root'].keyframe_insert('location',frame=f)
fk={}
for f in fr:
    s.frame_set(f); bpy.context.view_layer.update()
    fk[f]={x:dict(hip=W(f'upperleg01.{x}'),knee=W(f'lowerleg01.{x}'),ank=W(f'foot.{x}'),toe=W(f'toe1-1.{x}'),
              footM=(RW@pb[f'foot.{x}'].matrix).copy(),toeM=(RW@pb[f'toe1-1.{x}'].matrix).copy()) for x in 'LR'}
    fk[f]['root']=W('root')
def suelo_reposo():
    """Altura (mundo) de la planta en la malla de reposo: claves de forma sin armadura."""
    import numpy as np
    h=bpy.data.objects['Human']; kb=h.data.shape_keys.key_blocks; n=len(h.data.vertices)
    def co(k): a=np.zeros(n*3); k.data.foreach_get('co',a); return a.reshape(-1,3)
    B=co(kb['Basis']); R=B+sum(k.value*(co(k)-B) for k in kb if k.name!='Basis' and not k.mute)
    bi=h.vertex_groups['body'].index; cuerpo=[v.index for v in h.data.vertices if any(g.group==bi for g in v.groups)]
    return (h.matrix_world@Vector((0,0,float(R[cuerpo,2].min())))).z
def ang(h,k,a): return math.degrees((h-k).angle(a-k))
# longitudes del destino
lens={x:((fk[1][x]['knee']-fk[1][x]['hip']).length,(fk[1][x]['ank']-fk[1][x]['knee']).length) for x in 'LR'}
ank={}; footR={}; fdir={}
for x in 'LR':
    xs=[fk[f][x]['ank'] for f in fr]
    m=sum(xs,Vector())/len(xs); m.z=min(v.z for v in xs); ank[x]=m
    # orientación del pie: la del frame con el pie más plano (dedo más bajo relativo al tobillo)
    fbest=min(fr,key=lambda f:abs((fk[f][x]['toe']-fk[f][x]['ank']).normalized().z-(fk[1][x]['toe']-fk[1][x]['ank']).normalized().z))
    footR[x]=(fk[fbest][x]['footM'],fk[fbest][x]['toeM'])
    td=fk[fbest][x]['toe']-fk[fbest][x]['ank']; td.z=0; td.normalize(); fdir[x]=td
    AP=P.get('apertura_pies')  # grados hacia fuera, igual en los dos pies
    if AP is not None:
        al=math.radians(AP*(1 if x=='L' else -1))-math.atan2(td.x,-td.y)
        Rz=Matrix.Rotation(al,4,'Z'); footR[x]=(Rz@footR[x][0],Rz@footR[x][1]); fdir[x]=(Rz.to_3x3()@td).normalized()
    if P.get('pies_planos'):  # planta apoyada: orientación de reposo del pie (plano) con la apertura pedida
        Mr=RW@rb[f'foot.{x}'].matrix_local; tr=(RW@rb[f'toe1-1.{x}'].head_local)-Mr.to_translation(); tr.z=0; tr.normalize()
        obj=math.radians(AP*(1 if x=='L' else -1)) if AP is not None else math.atan2(td.x,-td.y)
        Rz=Matrix.Rotation(obj-math.atan2(tr.x,-tr.y),4,'Z')
        footR[x]=(Rz@Mr,None); fdir[x]=(Rz.to_3x3()@tr).normalized()
        ank[x].z=Mr.to_translation().z-suelo_reposo()
thmax=max(min(ang(fk[f][x]['hip'],fk[f][x]['knee'],fk[f][x]['ank']) for x in 'LR') for f in fr)
dzs={}
for f in fr:
    D2={}; smw=0
    for x in 'LR':
        a,b=lens[x]; h=fk[f][x]['hip']; th=ang(h,fk[f][x]['knee'],fk[f][x]['ank'])
        t=max(0.0,min(1.0,(th-LO)/(thmax-LO))); sm=t*t*(3-2*t); smw=max(smw,sm)
        th2=th+(TOP-thmax)*sm
        D2[x]=math.sqrt(a*a+b*b-2*a*b*math.cos(math.radians(th2)))
    # resolver desplazamiento (dx lateral, dz) para que cada pierna tenga su distancia cadera-tobillo
    o=Vector((0,0,0))
    for it in range(30):
        J=[];r=[]
        for x in 'LR':
            v=fk[f][x]['hip']+o-ank[x]; L=v.length; r.append(L-D2[x]); J.append((v.x/L,v.z/L))
        det=J[0][0]*J[1][1]-J[0][1]*J[1][0]
        if abs(det)<1e-9: break
        dx=( J[1][1]*r[0]-J[0][1]*r[1])/det; dzz=(-J[1][0]*r[0]+J[0][0]*r[1])/det
        o.x-=dx; o.z-=dzz
    dzs[f]=Vector((o.x*smw,0,o.z))
# aplicar dz a la raíz (convertido a espacio local del hueso raíz)
conv=rb['root'].matrix_local.to_3x3().inverted()@RW.to_3x3().inverted()
for f in fr:
    s.frame_set(f); p=pb['root']; p.location=p.location+conv@dzs[f]; p.keyframe_insert('location',frame=f)
bpy.context.view_layer.update()
def local_from_arm(n,M,Mp):
    b=rb[n]; rel=b.parent.matrix_local.inverted()@b.matrix_local
    return rel.inverted()@Mp.inverted()@M
RWi=RW.inverted(); res={'max_err_tobillo_mm':0.0,'max_err_plano_rodilla_grados':0.0}
for f in fr:
    s.frame_set(f); bpy.context.view_layer.update()
    for x in 'LR':
        ul,ll,ft=f'upperleg01.{x}',f'lowerleg01.{x}',f'foot.{x}'
        Mul=RW@pb[ul].matrix; Mll=RW@pb[ll].matrix
        h=W(ul); k=W(ll); a0=W(ft)
        a=(k-h).length; b=(a0-k).length; T=ank[x]
        ax0=(a0-h).normalized(); nd=(k-h)-((k-h).dot(ax0))*ax0
        toe=fdir[x]
        if nd.length<0.01: nd=nd+toe*(0.01-nd.length)
        d=min((T-h).length,a+b-1e-4); ax=(T-h).normalized()
        n=nd-(nd.dot(ax))*ax; n.normalize()
        ca=(a*a+d*d-b*b)/(2*a*d); sa=math.sqrt(max(0,1-ca*ca))
        KP=P.get('rodilla_pie',0.0)  # 1 = la rodilla avanza sobre la línea del pie
        if KP>0:
            e1=toe-(toe.dot(ax))*ax; e1.normalize(); e2=ax.cross(e1)
            def lat(p):
                q=(h+ax*a*ca+(math.cos(p)*e1+math.sin(p)*e2)*a*sa)-T; return toe.x*q.y-toe.y*q.x
            ph=min((math.radians(g/2) for g in range(-140,141)),key=lambda p:abs(lat(p)))
            npie=math.cos(ph)*e1+math.sin(ph)*e2
            n=((1-KP)*n+KP*npie).normalized()
        knee=h+ax*a*ca+n*a*sa
        q1=(k-h).normalized().rotation_difference((knee-h).normalized())
        Rul=q1@Mul.to_quaternion()
        s0=q1@(a0-k).normalized(); q2=s0.rotation_difference((T-knee).normalized())
        Rll=q2@q1@Mll.to_quaternion()
        Mul2=RWi@(Matrix.Translation(h)@Rul.to_matrix().to_4x4())
        par=pb[ul].parent; Mpar=par.matrix.copy()
        Lul=local_from_arm(ul,Mul2,Mpar)
        Mul02=Mul2@(rb[ul].matrix_local.inverted()@rb[f'upperleg02.{x}'].matrix_local)@pb[f'upperleg02.{x}'].matrix_basis
        Mll2=RWi@(Matrix.Translation(knee)@Rll.to_matrix().to_4x4())
        Lll=local_from_arm(ll,Mll2,Mul02)
        Mll02=Mll2@(rb[ll].matrix_local.inverted()@rb[f'lowerleg02.{x}'].matrix_local)@pb[f'lowerleg02.{x}'].matrix_basis
        Mft2=RWi@(Matrix.Translation(T)@footR[x][0].to_quaternion().to_matrix().to_4x4())
        Lft=local_from_arm(ft,Mft2,Mll02)
        for nm,L in ((ul,Lul),(ll,Lll),(ft,Lft)):
            q=L.to_quaternion(); pb[nm].rotation_quaternion=q; pb[nm].keyframe_insert('rotation_quaternion',frame=f)
        bpy.context.view_layer.update()
        e=(W(ft)-T).length*1000
        kk=W(ll); u=(kk-h)-((kk-h).dot(ax))*ax
        res['max_err_tobillo_mm']=max(res['max_err_tobillo_mm'],round(e,2))
        res['max_err_plano_rodilla_grados']=max(res['max_err_plano_rodilla_grados'],round(math.degrees(u.angle(n)),2))
print(json.dumps(res))
bpy.ops.wm.save_as_mainfile(filepath=OUT)
