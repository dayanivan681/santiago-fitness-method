"""Técnica de sentadilla medida por fotograma (criterios NASM/Healthline/MasterClass en el README):
tronco erguido arriba, cadera y rodilla extendidas a la vez, rodillas en la línea de los pies."""
import bpy,sys,math,json
from mathutils import Vector
A=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.open_mainfile(filepath=A[0]); s=bpy.context.scene; rig=bpy.data.objects['Human.rig']; pb=rig.pose.bones
W=lambda n: rig.matrix_world@pb[n].head
def plano(v): v=v.copy(); v.z=0; return v
rows=[]
for f in range(s.frame_start,s.frame_end+1):
    s.frame_set(f); r={'f':f}
    tr=W('neck01')-W('root'); r['tronco']=round(math.degrees(math.atan2(-tr.y,tr.z)))  # + = inclinado adelante
    for x in 'LR':
        h,k,a,t=W(f'upperleg01.{x}'),W(f'lowerleg01.{x}'),W(f'foot.{x}'),W(f'toe1-1.{x}')
        r['rod'+x]=round(math.degrees((h-k).angle(a-k)))
        r['cad'+x]=round(math.degrees(tr.angle(k-h)))  # 180 = cadera extendida
        fd=plano(t-a).normalized(); d=plano(k-a); lat=fd.x*d.y-fd.y*d.x
        r['desv'+x]=round((lat if x=='L' else -lat)*100,1)  # cm, + = rodilla por fuera de la línea del pie
        D=(rig.matrix_world@pb[f'foot.{x}'].matrix).to_3x3()@(rig.matrix_world@rig.data.bones[f'foot.{x}'].matrix_local).to_3x3().inverted()
        r['incl'+x]=round(math.degrees((D@Vector((0,0,1))).angle(Vector((0,0,1)))),1)  # 0 = planta plana como en reposo
        r['pie'+x]=round(math.degrees(math.atan2(fd.x,-fd.y))*(1 if x=='L' else -1))  # apertura del pie
    rows.append(r)
top=max(rows,key=lambda r:r['rodL']+r['rodR']); bot=min(rows,key=lambda r:r['rodL']+r['rodR'])
dobl=[r for r in rows if min(r['rodL'],r['rodR'])<120]
res={'arriba':{k:top[k] for k in ('f','tronco','cadL','cadR','rodL','rodR')},
 'abajo':{k:bot[k] for k in ('f','tronco','rodL','rodR','desvL','desvR')},
 'desv_rodilla_max_cm':max(max(abs(r['desvL']),abs(r['desvR'])) for r in dobl) if dobl else 0,
 'apertura_pies':[rows[0]['pieL'],rows[0]['pieR']],
 'inclinacion_pies_max':max(max(r['inclL'],r['inclR']) for r in rows)}
print(json.dumps(res))
for r in rows: print(r)
