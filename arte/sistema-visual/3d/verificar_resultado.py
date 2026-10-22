"""No confundir objetivos IK alcanzados con la aceptación de la postura."""
import hashlib,json,struct,sys
import math
from pathlib import Path
BASE=Path(__file__).resolve().parent
rig=json.loads((BASE/'validacion-rig.json').read_text())
surfaces=json.loads((BASE/'contactos-superficie.json').read_text())
samples=rig['muestras']+rig['pivote_directo_sin_clavar_huesos']
foot=max(r['pies'][side]['error_m'] for r in samples for side in ['L','R'])
hand=max(r['manos'][side]['error_m'] for r in samples for side in ['L','R'])
finger=max(x for r in samples for side in ['L','R'] for x in r['dedos'][side])
delta_z=max(abs(rig['muestras'][0]['pies'][side]['pos'][2]-rig['muestras'][11]['pies'][side]['pos'][2]) for side in ['L','R'])
back=[v['separacion_m'] for r in surfaces for k,v in r['espalda'].items() if k.startswith('spine')]
shoulder=[r['hombros'][side]['distancia_centros_m'] for r in surfaces for side in ['L','R']]
zones={name:[r['contacto_zonas'][name] for r in surfaces] for name in ['pelvis','lumbar','torax']}
cushion=[r['hombros'][side]['contacto_superficie_m'] for r in surfaces for side in ['L','R']]
def angular(a,b):
 dot=abs(sum(x*y for x,y in zip(a,b)))/math.sqrt(sum(x*x for x in a)*sum(x*x for x in b))
 return math.degrees(2*math.acos(min(1,dot)))
spine={name:angular(rig['muestras'][0]['columna'][name],rig['muestras'][11]['columna'][name]) for name in rig['muestras'][0]['columna']}
checks={'pies_fijos':foot<.001 and delta_z<.01,'manos_y_dedos':hand<.001 and finger<.001,
 'rodilla':165<rig['muestras'][0]['pies']['L']['rodilla_interna_grados']<175 and 85<rig['muestras'][11]['pies']['L']['rodilla_interna_grados']<95,
 'apoyo_pelvis_lumbar_torax':all(-.005<min(v) and max(v)<.005 for v in zones.values()),
 'hombreras':min(cushion)>-.005 and max(cushion)<.005,
 'proporciones_intactas':rig['huesos_originales_identicos'],
 'plataforma_y_resto_maquina_intactos':rig['resto_de_maquina_identico'],
 'solo_pivote_con_keyframes':rig['sin_keyframes_de_pose'] and rig['controles']['ik_sin_estirar'],
 'columna_distribuida':sum(a>.02 for a in spine.values())>=2}
gif=(BASE/'pendulum-squat-v1.gif').read_bytes()
result={
 'aceptado':all(checks.values()),'comprobaciones':checks,
 'pies_objetivo_error_max_m':foot,'pies_z_f1_f12_m':delta_z,
 'munecas_objetivo_error_max_m':hand,'dedos_objetivo_error_max_m':finger,
 'rodilla_arriba_grados':rig['muestras'][0]['pies']['L']['rodilla_interna_grados'],
 'rodilla_abajo_grados':rig['muestras'][11]['pies']['L']['rodilla_interna_grados'],
 'espalda_separacion_rango_m':[min(back),max(back)],
 'hombro_hombrera_distancia_centros_rango_m':[min(shoulder),max(shoulder)],
 'contacto_por_zona_m':{k:[min(v),max(v)] for k,v in zones.items()},
 'hombreras_contacto_superficie_rango_m':[min(cushion),max(cushion)],
 'columna_cambio_vertebral_grados':spine,
 'sin_cambiar_geometria_maquina':rig['geometria_maquina_identica'],
 'sin_cambiar_proporciones_huesos_originales':rig['huesos_originales_identicos'],
 'gif_v1_intacto':{'firma':gif[:6].decode(),'medida':struct.unpack('<HH',gif[6:10]),'bytes':len(gif),'sha256':hashlib.sha256(gif).hexdigest()},
 'gif_nuevo':'Se verifica por separado después de aceptar postura',
}
(BASE/'aceptacion.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
sys.exit(0 if result['aceptado'] else 2)
