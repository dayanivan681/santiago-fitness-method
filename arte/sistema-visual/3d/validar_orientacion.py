"""Regresión del defecto de torsión, no certificación biomecánica humana.

Los umbrales son guardas conservadoras para este prototipo simétrico, no
límites articulares clínicos ni reglas para otros ejercicios.
"""
import bpy, math, json, os
from pathlib import Path
from mathutils import Vector
BASE=Path(__file__).resolve().parent/os.environ.get('PS_RESULTADO_DIR','')
BASE.mkdir(parents=True,exist_ok=True)
s=bpy.context.scene;r=bpy.data.objects['Human.rig'];pivot=bpy.data.objects['Pivote']
rows=[]
def medir(label):
    bpy.context.view_layer.update()
    er=r.evaluated_get(bpy.context.evaluated_depsgraph_get())
    twists={};joints={};planes={}
    for side in ['L','R']:
        for name in ['upperleg01','upperleg02','lowerleg01','lowerleg02','lowerarm01','lowerarm02']:
            b=er.pose.bones[name+'.'+side];rest=b.bone.matrix_local
            q=(b.matrix.to_3x3()@rest.to_3x3().inverted()).to_quaternion()
            swing=rest.col[1].to_3d().rotation_difference(b.matrix.col[1].to_3d())
            twists[name+'.'+side]=math.degrees((swing.inverted()@q).angle)
        for limb in ['pierna','brazo']:
            lower=er.pose.bones[f'PS_{limb}_dist.{side}'];upper=lower.parent
            A=er.matrix_world@upper.head;B=er.matrix_world@lower.head;C=er.matrix_world@lower.tail
            c=next(c for c in lower.constraints if c.type=='IK')
            P=c.pole_target.matrix_world.translation;axis=(C-A).normalized()
            b=B-A;b-=axis*b.dot(axis);p=P-A;p-=axis*p.dot(axis)
            planes[limb+'.'+side]=b.normalized().dot(p.normalized())
        for name in ['upperleg01','lowerleg01','foot','upperarm01','lowerarm01','wrist']:
            joints[name+'.'+side]=er.matrix_world@er.pose.bones[name+'.'+side].head
    symmetry=max((joints[n+'.L']-Vector((-joints[n+'.R'].x,joints[n+'.R'].y,joints[n+'.R'].z))).length for n in ['upperleg01','lowerleg01','foot','upperarm01','lowerarm01','wrist'])
    elbows=all(joints['lowerarm01.'+side].z<joints['upperarm01.'+side].z for side in ['L','R'])
    legs=max(v for n,v in twists.items() if 'leg' in n)
    arms=max(v for n,v in twists.items() if 'arm' in n)
    checks={'torsion_piernas_menor_25':legs<25,'torsion_antebrazos_menor_45':arms<45,
            'codos_debajo_de_hombros':elbows,'simetria_menor_1mm':symmetry<.001,
            'flexion_hacia_polo':min(planes.values())>.99}
    rows.append({'muestra':label,'torsion_piernas_max_grados':legs,'torsion_antebrazos_max_grados':arms,
                 'simetria_error_m':symmetry,'alineacion_plano_polo':planes,'checks':checks})
for f in range(1,24):
    s.frame_set(f);medir(f)
top=math.radians(pivot['PS_arriba_grados']);bottom=math.radians(pivot['PS_abajo_grados'])
for t in [.13,.37,.73,.89]:
    s.frame_set(1);pivot.rotation_euler.x=top+(bottom-top)*t;medir('sin_clave_'+str(t))
result={'regresion_torsion_superada':all(all(row['checks'].values()) for row in rows),
        'es_certificacion_biomecanica':False,'muestras':rows}
(BASE/'orientacion.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'regresion_torsion_superada':result['regresion_torsion_superada'],
                  'fallos':[row for row in rows if not all(row['checks'].values())]},indent=2))
if not result['regresion_torsion_superada']:raise RuntimeError('Regresión de orientación no superada')
