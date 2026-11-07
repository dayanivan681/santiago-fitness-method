"""Auditoría de alcance sin guardar ni modificar la escena de origen.

Ejecutar con Blender --background pendulum-squat.blend --python este_archivo.
Longitudes en metros; se evalúa la animación original del carro.
"""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector

BASE = Path(__file__).resolve().parent
s = bpy.context.scene
rig = bpy.data.objects['Human.rig']
pad = bpy.data.objects['Maq_respaldo']
platform = bpy.data.objects['Maq_plataforma']
human = bpy.data.objects['Human']
old_frame = s.frame_current

def xyz(v):
    return [round(float(x), 6) for x in v]

try:
    s.frame_set(1)
    bpy.context.view_layer.update()
    pad1 = pad.matrix_world.copy()
    normal = (pad1.to_3x3() @ Vector((0, -1, 0))).normalized()
    tangent = (pad1.to_3x3() @ Vector((0, 0, 1))).normalized()
    rotation = pad1.to_quaternion()
    hip = rig.data.bones['upperleg01.L'].head_local.copy()
    knee = rig.data.bones['lowerleg01.L'].head_local.copy()
    ankle = rig.data.bones['foot.L'].head_local.copy()
    thigh = (knee-hip).length
    shin = (ankle-knee).length
    chain = sum(rig.data.bones[n+'.L'].length for n in
                ['upperleg01','upperleg02','lowerleg01','lowerleg02'])

    # Profundidad posterior del cuerpo en la pelvis; sólo lectura del modelo.
    body_group = human.vertex_groups['body'].index
    skin = [v.co for v in human.data.vertices
            if .80 < v.co.z < .94 and abs(v.co.x) < .13
            and any(g.group == body_group and g.weight > 0 for g in v.groups)]
    posterior = max(v.y for v in skin) - hip.y
    # Tobillo colocado sobre la superficie inclinada, con el talón dentro
    # de la plataforma. No se desplaza después, ni entre muestras.
    platform_rot = platform.matrix_world.to_quaternion()
    ankle_target = platform.matrix_world.translation + platform_rot @ Vector((
        ankle.x, .22, .035 + ankle.z))
    # Línea de contacto de la pelvis, paralela al respaldo. Alineación
    # anatómica de partida; su altura se resuelve por la longitud de pierna.
    center = pad1.translation + normal * (.065 + posterior)
    center.x = hip.x
    radius = math.sqrt(thigh**2+shin**2-2*thigh*shin*math.cos(math.radians(170)))
    delta = center - ankle_target
    b = 2 * delta.dot(tangent)
    c = delta.length_squared - radius**2
    discr = b*b - 4*c
    assert discr >= 0, 'No existe ni posición inicial de contacto a 170 grados'
    roots = [(-b+math.sqrt(discr))/2,(-b-math.sqrt(discr))/2]
    options = [center+tangent*t for t in roots]
    hip1 = max(options, key=lambda v:v.z)
    mounted = pad1.inverted() @ hip1
    samples=[]
    for frame in range(1,24):
        s.frame_set(frame)
        bpy.context.view_layer.update()
        h = pad.matrix_world @ mounted
        distance = (h - ankle_target).length
        cosine = (thigh**2+shin**2-distance**2)/(2*thigh*shin)
        samples.append({
            'frame':frame,
            'pivote_grados':round(math.degrees(bpy.data.objects['Pivote'].rotation_euler.x),6),
            'respaldo_centro':xyz(pad.matrix_world.translation),
            'cadera_anclada':xyz(h),
            'distancia_cadera_tobillo_m':round(distance,6),
            'alcanzable_sin_estirar':distance <= chain,
            'deficit_minimo_incluso_con_4_huesos_rectos_m':round(max(0,distance-chain),6),
            'angulo_interno_rodilla_2_segmentos_grados':round(math.degrees(math.acos(cosine)),3) if -1<=cosine<=1 else None,
        })
    report={
        'origen':bpy.data.filepath,
        'no_se_guarda_ni_cambia_geometria':True,
        'supuesto':'Pelvis anclada a un punto del respaldo; tobillo fijo en plataforma; inicio con rodilla a 170 grados. Es una prueba de alcance necesaria, no una validación final de piel ni IK.',
        'muslo_m':thigh,'pierna_m':shin,'longitud_maxima_4_huesos_m':chain,
        'profundidad_posterior_pelvis_m':posterior,'tobillo_fijo':xyz(ankle_target),
        'desplazamiento_respaldo_1_a_12_m':xyz(Vector(samples[11]['respaldo_centro'])-Vector(samples[0]['respaldo_centro'])),
        'muestras':samples,
    }
    (BASE/'diagnostico-geometria.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
finally:
    s.frame_set(old_frame)
