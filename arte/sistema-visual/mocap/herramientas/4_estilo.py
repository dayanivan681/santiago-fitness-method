"""Bordes suaves: músculo resaltado y short pasan de caras a máscaras por vértice suavizadas."""
import bpy,sys,json
A=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=A[0]); OUT=A[1]; P=json.loads(A[2]) if len(A)>2 else {}
h=bpy.data.objects['Human']; me=h.data
names=[m.name if m else None for m in me.materials]; iB=names.index('Maniqui')
nb=[[] for _ in me.vertices]
for e in me.edges: a,b=e.vertices; nb[a].append(b); nb[b].append(a)
def mascara(mat,attr,it):
    i=names.index(mat); w=[0.0]*len(me.vertices)
    for p in me.polygons:
        if p.material_index==i:
            for v in p.vertices: w[v]=1.0
    for _ in range(it): w=[(w[k]+sum(w[j] for j in nb[k]))/(1+len(nb[k])) if nb[k] else w[k] for k in range(len(w))]
    at=me.attributes.new(attr,'FLOAT','POINT'); at.data.foreach_set('value',w)
    for p in me.polygons:
        if p.material_index==i: p.material_index=iB
    return bpy.data.materials[mat].node_tree.nodes['Principled BSDF']
# glúteos: región posterior de la pelvis definida en la malla de reposo (no depende del frame)
def mascara_gluteo(attr,it):
    vs=me.vertices; bi=h.vertex_groups['body'].index
    zb=(P.get('gl_z0',0.70),P.get('gl_z1',0.93)); prof=P.get('gl_prof',0.07)
    import collections
    sl=collections.defaultdict(lambda:-1e9)
    cand=[v for v in vs if zb[0]<=v.co.z<=zb[1] and any(g.group==bi for g in v.groups) and abs(v.co.x)<0.2]
    sm=collections.defaultdict(lambda:1e9)
    for v in cand:
        k=round(v.co.z/0.01); sl[k]=max(sl[k],v.co.y); sm[k]=min(sm[k],v.co.y)
    w=[0.0]*len(vs)
    for v in cand:
        k=round(v.co.z/0.01)
        if v.co.y>=sl[k]-prof and v.co.y>(sl[k]+sm[k])/2 and abs(v.co.x)>0.015: w[v.index]=1.0
    for _ in range(it): w=[(w[k]+sum(w[j] for j in nb[k]))/(1+len(nb[k])) if nb[k] else w[k] for k in range(len(w))]
    at=me.attributes.new(attr,'FLOAT','POINT'); at.data.foreach_set('value',w)
    return bpy.data.materials['Musculo'].node_tree.nodes['Principled BSDF']
GR=P.get('anatomia')  # p. ej. ["cuadriceps","gluteos"]: músculos del atlas en vez de las caras 'Musculo'
capas=[('Short','short',P.get('iter_short',3))]
if GR:
    iM=names.index('Musculo')
    for p in me.polygons:
        if p.material_index==iM: p.material_index=iB
else:
    capas.append(('Musculo','musculo',P.get('iter',4)))
    if P.get('gluteo',True): capas.append(('__gluteo','gluteo',4))
nt=bpy.data.materials['Maniqui'].node_tree; bs=nt.nodes['Principled BSDF']
col=bs.inputs['Base Color'].default_value[:]; rough=bs.inputs['Roughness'].default_value
cur_c=None; cur_r=None
for mat,attr,it in capas:
    src=mascara_gluteo(attr,it) if mat=='__gluteo' else mascara(mat,attr,it)
    a=nt.nodes.new('ShaderNodeAttribute'); a.attribute_name=attr; a.attribute_type='GEOMETRY'
    mr=nt.nodes.new('ShaderNodeMapRange'); mr.interpolation_type='SMOOTHSTEP'
    mr.inputs['From Min'].default_value=0.42; mr.inputs['From Max'].default_value=0.52
    nt.links.new(a.outputs['Fac'],mr.inputs['Value'])
    mc=nt.nodes.new('ShaderNodeMix'); mc.data_type='RGBA'; mc.inputs['B'].default_value=src.inputs['Base Color'].default_value[:]
    if cur_c: nt.links.new(cur_c,mc.inputs['A'])
    else: mc.inputs['A'].default_value=col
    nt.links.new(mr.outputs['Result'],mc.inputs['Factor']); cur_c=mc.outputs['Result']
    mf=nt.nodes.new('ShaderNodeMix'); mf.data_type='FLOAT'; mf.inputs['B'].default_value=src.inputs['Roughness'].default_value
    if cur_r: nt.links.new(cur_r,mf.inputs['A'])
    else: mf.inputs['A'].default_value=rough
    nt.links.new(mr.outputs['Result'],mf.inputs['Factor']); cur_r=mf.outputs['Result']
if GR:
    import os,numpy as np
    sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import musculos as MU
    rig=bpy.data.objects['Human.rig']; kb=me.shape_keys.key_blocks; n=len(me.vertices)
    def co(k): a=np.zeros(n*3); k.data.foreach_get('co',a); return a.reshape(-1,3)
    B=co(kb['Basis']); R=B+sum(k.value*(co(k)-B) for k in kb if k.name!='Basis' and not k.mute)
    M=np.array(rig.matrix_world.inverted()@h.matrix_world); R=R@M[:3,:3].T+M[:3,3]
    hb={x:(np.array(rig.data.bones[f'upperleg01.{x}'].head_local),np.array(rig.data.bones[f'lowerleg01.{x}'].head_local)) for x in 'LR'}
    RES=P.get('res',2048)
    POS=MU.rasterizar(me,R,RES,lambda c:(c[:,2]>0.3)&(c[:,2]<1.15)&(np.abs(c[:,0])<0.3))
    ok=~np.isnan(POS[...,0]); img=np.zeros((RES,RES,3),np.float32)
    img[ok]=np.stack(MU.campos(POS[ok].astype(float),hb,GR,fibra=P.get('fibra',0.010),surco=P.get('surco',0.010)),1)
    img=MU.dilatar(img,ok,6)
    im=bpy.data.images.new('MapaMusculos',RES,RES,alpha=True)
    im.pixels.foreach_set(np.dstack([img,np.ones((RES,RES,1),np.float32)]).ravel()); im.pack(); im.colorspace_settings.name='Non-Color'
    mus=bpy.data.materials['Musculo'].node_tree.nodes['Principled BSDF']
    tx=nt.nodes.new('ShaderNodeTexImage'); tx.image=im; tx.interpolation='Cubic'
    sp=nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(tx.outputs['Color'],sp.inputs['Color'])
    def mix(t,fac,a,b,modo='MIX'):
        m=nt.nodes.new('ShaderNodeMix'); m.data_type=t; m.blend_type=modo
        for k,v in (('Factor',fac),('A',a),('B',b)):
            if isinstance(v,bpy.types.NodeSocket): nt.links.new(v,m.inputs[k])
            else: m.inputs[k].default_value=v
        return m.outputs['Result']
    def op(o,a,b):
        m=nt.nodes.new('ShaderNodeMath'); m.operation=o
        for i,v in enumerate((a,b)):
            if isinstance(v,bpy.types.NodeSocket): nt.links.new(v,m.inputs[i])
            else: m.inputs[i].default_value=v
        return m.outputs[0]
    rojo=mus.inputs['Base Color'].default_value[:]; osc=P.get('rojo_surco',[0.28,0.012,0.010,1])
    vientre=op('POWER',sp.outputs['Green'],0.8)
    cm=mix('RGBA',vientre,osc,rojo)
    cm=mix('RGBA',1.0,cm,op('SUBTRACT',1.0,op('MULTIPLY',sp.outputs['Blue'],P.get('fibra_osc',0.16))),'MULTIPLY')
    cur_c=mix('RGBA',sp.outputs['Red'],cur_c,cm)
    cur_r=mix('FLOAT',sp.outputs['Red'],cur_r,mus.inputs['Roughness'].default_value)
    bp=nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value=P.get('relieve',0.8); bp.inputs['Distance'].default_value=P.get('relieve_m',0.004)
    nt.links.new(op('MULTIPLY',sp.outputs['Red'],op('ADD',sp.outputs['Green'],op('MULTIPLY',sp.outputs['Blue'],P.get('fibra_relieve',0.12)))),bp.inputs['Height'])
    nt.links.new(bp.outputs['Normal'],bs.inputs['Normal'])
nt.links.new(cur_c,bs.inputs['Base Color']); nt.links.new(cur_r,bs.inputs['Roughness'])
for m in bpy.data.materials:
    if hasattr(m,'surface_render_method'): m.surface_render_method='DITHERED'
bpy.ops.wm.save_as_mainfile(filepath=OUT)
print('ok')
