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
capas=[('Short','short',P.get('iter_short',3)),('Musculo','musculo',P.get('iter',4))]
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
nt.links.new(cur_c,bs.inputs['Base Color']); nt.links.new(cur_r,bs.inputs['Roughness'])
for m in bpy.data.materials:
    if hasattr(m,'surface_render_method'): m.surface_render_method='DITHERED'
bpy.ops.wm.save_as_mainfile(filepath=OUT)
print('ok')
