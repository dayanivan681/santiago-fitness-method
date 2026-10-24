"""Compone sobre #0b0c0d y codifica GIF con paleta global. Uso: dir_fotogramas salida.gif fps colores"""
import sys,subprocess,json,struct
from pathlib import Path
from PIL import Image
fr=Path(sys.argv[1]); gif=Path(sys.argv[2]); fps=int(sys.argv[3]); cols=int(sys.argv[4])
comp=fr.parent/'composicion'; comp.mkdir(exist_ok=True)
for p in sorted(fr.glob('frame-*.png')):
    im=Image.open(p).convert('RGBA'); bg=Image.new('RGBA',im.size,(11,12,13,255))
    Image.alpha_composite(bg,im).convert('RGB').save(comp/p.name)
subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(fps),'-start_number','1','-i',str(comp/'frame-%04d.png'),
 '-filter_complex',f'split[a][b];[a]palettegen=max_colors={cols}:reserve_transparent=0:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
 '-loop','0',str(gif)],check=True)
d=gif.read_bytes(); im=Image.open(gif)
corn=[]; 
for i in range(im.n_frames): im.seek(i); corn.append(im.convert('RGB').getpixel((0,0)))
r={'bytes':len(d),'medida':struct.unpack('<HH',d[6:10]),'fotogramas':im.n_frames,'fps':fps,'colores':cols,'fondo_ok':all(c==(11,12,13) for c in corn)}
print(json.dumps(r))
# tira de revisión
n=im.n_frames; idx=[0,n//4,n//2,3*n//4,n-1]; strip=Image.new('RGB',(360*5,480),(11,12,13))
for j,f in enumerate(idx): im.seek(f); strip.paste(im.convert('RGB'),(j*360,0))
strip.save(gif.with_name(gif.stem+'-secuencia.png'))
