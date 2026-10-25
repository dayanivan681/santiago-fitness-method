"""Cuerpo atlético: macros de músculo y peso de MakeHuman (CC0) sobre el maniquí MPFB y esqueleto reajustado.
Uso: blend_base salida.blend '{"musculo":0.9,"peso":0.4}'  (escala MakeHuman: 0.5 = medio, 1 = máximo)."""
import bpy,sys,os,json,gzip,re
import numpy as np
A=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=A[0]); OUT=A[1]; P=json.loads(A[2]) if len(A)>2 else {}
MU,WG=P.get('musculo',0.9),P.get('peso',0.4)
TD=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','fuentes','makehuman')
h=bpy.data.objects['Human']; rig=bpy.data.objects['Human.rig']; kb=h.data.shape_keys.key_blocks; n=len(h.data.vertices)
def co(k): a=np.zeros(n*3); k.data.foreach_get('co',a); return a.reshape(-1,3)
B=co(kb['Basis'])
def mezcla(): return B+sum(k.value*(co(k)-B) for k in kb if k.name!='Basis' and not k.mute)
antes=mezcla()
# pesos MakeHuman: músculo >0.5 reparte medio/máximo, peso <0.5 reparte medio/mínimo
wm={'average':1-(MU-0.5)*2,'max':(MU-0.5)*2} if MU>=0.5 else {'average':1-(0.5-MU)*2,'min':(0.5-MU)*2}
ww={'average':1-(WG-0.5)*2,'max':(WG-0.5)*2} if WG>=0.5 else {'average':1-(0.5-WG)*2,'min':(0.5-WG)*2}
def target(nombre):
    idx=[];d=[]
    for l in gzip.open(os.path.join(TD,nombre+'.target.gz'),'rt'):
        if l.startswith('#') or not l.strip(): continue
        a=l.split(); idx.append(int(a[0])); d.append([float(x) for x in a[1:4]])
    D=np.zeros((n,3))
    if idx: d=np.array(d); D[np.array(idx)]=np.c_[d[:,0],-d[:,2],d[:,1]]*0.1  # MakeHuman dm, Y arriba -> m, Z arriba
    return D
COD={'$fe':'female','$ma':'male','$yn':'young','$av':'average','$mu':'muscle','$wg':'weight','$fi':'firmness','$avcup':'averagecup'}
def mh(s):
    for c in sorted(COD,key=len,reverse=True): s=s.replace(c,COD[c])
    return s
# cada clave con músculo y peso medios se sustituye por la mezcla de sus variantes
for k in [k for k in kb if '$av$mu-$av$wg' in k.name]:
    v=k.value; base=mh(k.name[len('$md-'):])
    for m,a in wm.items():
        for w,b in ww.items():
            nombre=base.replace('averagemuscle-averageweight',f'{m}muscle-{w}weight')
            D=target(nombre)
            if not D.any() or a*b==0: continue
            nk=h.shape_key_add(name='$md-'+nombre,from_mix=False); nk.data.foreach_set('co',(B+D).ravel()); nk.value=v*a*b
    k.value=0.0
despues=mezcla()
# esqueleto: cada extremo de hueso se mueve con los cubos de articulación MPFB más cercanos
jg={g.index for g in h.vertex_groups if g.name.startswith('joint-')}
J=np.array([v.index for v in h.data.vertices if any(g.group in jg for g in v.groups)])
dJ=(despues-antes)[J]; pJ=antes[J]
Mi=np.array(h.matrix_world.inverted()@rig.matrix_world)
def desplazar(p):
    q=(Mi@np.r_[p,1])[:3]; i=np.argsort(((pJ-q)**2).sum(1))[:8]; return dJ[i].mean(0)
bpy.context.view_layer.objects.active=rig; bpy.ops.object.mode_set(mode='EDIT')
mov=[]
for eb in rig.data.edit_bones:
    dh=desplazar(np.array(eb.head)); dt=desplazar(np.array(eb.tail)); mov.append(np.linalg.norm(dh))
    eb.head=tuple(np.array(eb.head)+dh); eb.tail=tuple(np.array(eb.tail)+dt)
bpy.ops.object.mode_set(mode='OBJECT')
# apoyo: la planta del pie vuelve al suelo
z0=antes[:,2].min(); z1=despues[:,2].min()
print(json.dumps({'musculo':MU,'peso':WG,'claves':[k.name for k in kb if k.value>0 and k.name!='Basis'],
  'superficie_max_mm':round(float(np.linalg.norm(despues-antes,axis=1).max())*1000,1),
  'huesos_max_mm':round(float(max(mov))*1000,1),'suelo_mm':round(float(z1-z0)*1000,1)}))
bpy.ops.wm.save_as_mainfile(filepath=OUT)
