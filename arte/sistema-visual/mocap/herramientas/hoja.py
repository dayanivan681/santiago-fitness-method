import sys
from PIL import Image
out=sys.argv[1]; ps=sys.argv[2:]
ims=[Image.open(p).convert('RGB') for p in ps]; w,h=ims[0].size; cols=min(len(ims),6) if len(ims)<=6 else (len(ims)+1)//2
rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(w*cols,h*rows),(11,12,13))
for i,im in enumerate(ims): sh.paste(im,((i%cols)*w,(i//cols)*h))
sh.save(out)
