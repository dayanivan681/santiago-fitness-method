"""Composición alfa y GIF: 9 fps, paleta global de 40 colores, 360x480."""
import json,struct,subprocess,hashlib,math
from pathlib import Path
from PIL import Image,ImageChops,ImageStat
BASE=Path(__file__).resolve().parent
composed=BASE/'composicion';composed.mkdir(exist_ok=True)
for p in sorted((BASE/'fotogramas').glob('frame-*.png')):
    im=Image.open(p).convert('RGBA')
    bg=Image.new('RGBA',im.size,(11,12,13,255))
    Image.alpha_composite(bg,im).convert('RGB').save(composed/p.name)
gif=BASE/'pendulum-squat-rig.gif'
subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','12','-start_number','1','-i',str(composed/'frame-%04d.png'),
 '-filter_complex','fps=9,split[a][b];[a]palettegen=max_colors=40:reserve_transparent=0:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
 '-loop','0',str(gif)],check=True)
data=gif.read_bytes();im=Image.open(gif)
corners=[];colors=set();duration=0
for f in range(im.n_frames):
 im.seek(f);rgb=im.convert('RGB')
 corners.append(rgb.getpixel((0,0)));colors.update(rgb.getdata());duration+=im.info.get('duration',0)
im.seek(0);first=im.convert('RGB')
def rms(p):
 d=ImageChops.difference(first,Image.open(p).convert('RGB'))
 return math.sqrt(sum(v*v for v in ImageStat.Stat(d).rms)/3)
first_error=rms(composed/'frame-0001.png');bottom_error=rms(composed/'frame-0012.png')
result={'firma':data[:6].decode(),'medida':struct.unpack('<HH',data[6:10]),'bytes':len(data),
 'fotogramas':im.n_frames,'colores_usados':len(colors),'duracion_ms':duration,'fps_exportacion':9,
 'fondo_esquina_en_todos_los_frames':all(c==(11,12,13) for c in corners),
 'primer_frame_rms_frente_a_inicio':first_error,'primer_frame_rms_frente_a_abajo':bottom_error,
 'primer_frame_es_inicio':first_error<bottom_error,'sha256':hashlib.sha256(data).hexdigest()}
result['pass']=result['firma']=='GIF89a' and result['medida']==(360,480) and len(data)<=250000 and result['colores_usados']<=40 and result['fondo_esquina_en_todos_los_frames'] and result['primer_frame_es_inicio']
strip=Image.new('RGB',(360*5,480),(11,12,13))
for j,f in enumerate([0,4,8,12,16]):
 im.seek(f);strip.paste(im.convert('RGB'),(j*360,0))
strip.save(BASE/'revision-secuencia.png')
(BASE/'validacion-gif.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
assert result['pass'],'GIF fuera de especificación: consultar validacion-gif.json'
