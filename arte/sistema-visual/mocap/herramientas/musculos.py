"""Atlas de músculos para el estilo: cada músculo es una región anatómica sobre la malla en reposo, con
vientre (volumen), surcos entre músculos y dirección de fibra. Se hornea a una textura UV que lee el material.
Coordenadas: rig MPFB en reposo, figura mirando a -Y, +X = lado izquierdo de la figura."""
import numpy as np, math

def _ss(e0,e1,x):
    t=np.clip((x-e0)/(e1-e0),0,1); return t*t*(3-2*t)

# ---------- muslo: coordenadas cilíndricas por pierna (t: 0 cadera -> 1 rodilla, θ: 0 delante, +90 lateral)
def _muslo(P,H,K):
    L=np.linalg.norm(K-H); u=(K-H)/L; s=1.0 if H[0]>0 else -1.0
    d=P-H; tl=d@u; r=d-np.outer(tl,u); rr=np.linalg.norm(r,axis=1)+1e-9
    a0=np.array([0,-1.0,0]); a0=a0-(a0@u)*u; a0/=np.linalg.norm(a0)
    l0=np.array([s,0,0.0]); l0=l0-(l0@u)*u-(l0@a0)*a0; l0/=np.linalg.norm(l0)
    th=np.degrees(np.arctan2(r@l0,r@a0))
    return tl/L,th,rr,L

def _banda(t,th,rr,L,lo,hi,t0,t1):
    """distancia con signo (m) al borde de la región lo(t)<=θ<=hi(t), t0<=t<=t1."""
    k=np.radians(1)*rr
    return np.minimum.reduce([(th-lo)*k,(hi-th)*k,(t-t0)*L,(t1-t)*L])

def _rf(t):  # recto femoral: huso centrado, algo lateral arriba
    c=8-8*t; w=26*np.sin(np.pi*np.clip((t+0.02)/0.92,0,1))**0.5; return c-w,c+w

def cuadriceps(P,H,K):
    t,th,rr,L=_muslo(P,H,K)
    lo,hi=_rf(t)
    rf=_banda(t,th,rr,L,lo,hi,-0.02,0.90)
    vl=_banda(t,th,rr,L,hi,125-65*_ss(0.6,0.95,t),0.08,0.93)
    w=np.where(t<0.85,65*np.clip((t-0.45)/0.40,0,1)**0.8,65*np.clip(1-((t-0.85)/0.13)**2,0,1))
    vm=_banda(t,th,rr,L,lo-w,lo,0.45,0.98)
    arc=np.radians(th)*rr; tm=t*L
    c=np.radians(8-8*t)*rr
    return [  # (distancia con signo, ancho del vientre, coordenada de fibra)
        (rf,0.020,np.abs(arc-c)*math.cos(0.45)-tm*math.sin(0.45)),   # bipenniforme: espiga
        (vl,0.030,arc*math.cos(0.35)+tm*math.sin(0.35)),
        (vm,0.025,arc*math.cos(0.80)-tm*math.sin(0.80))]

# ---------- glúteos: polígonos en el plano (|x|, z) sobre la cara posterior
GMAX=[(0.012,0.975),(0.06,0.955),(0.115,0.92),(0.155,0.885),(0.165,0.84),(0.155,0.80),(0.12,0.775),(0.07,0.77),(0.03,0.78),(0.012,0.80)]
GMED=[(0.06,0.955),(0.11,0.99),(0.16,0.985),(0.175,0.94),(0.168,0.888),(0.155,0.885),(0.115,0.92)]

def _poligono(q,poly):
    poly=np.array(poly); a=poly; b=np.roll(poly,-1,0)
    dmin=np.full(len(q),np.inf); dentro=np.zeros(len(q),bool)
    for (x1,y1),(x2,y2) in zip(a,b):
        e=np.array([x2-x1,y2-y1]); w=q-[x1,y1]; tt=np.clip((w@e)/(e@e),0,1)
        dmin=np.minimum(dmin,np.linalg.norm(w-np.outer(tt,e),axis=1))
        cruza=((y1>q[:,1])!=(y2>q[:,1]))&(q[:,0]<(x2-x1)*(q[:,1]-y1)/(y2-y1+1e-12)+x1)
        dentro^=cruza
    return np.where(dentro,dmin,-dmin)

def gluteos(P,escala=1.0):
    q=np.c_[np.abs(P[:,0]),P[:,2]]/[1,escala]
    gm=np.minimum(_poligono(q,GMAX),(P[:,1]-0.0))
    gd=np.minimum(_poligono(q,GMED),(P[:,1]+0.05))
    d=np.array([0.8,1.0]); d/=np.linalg.norm(d)
    f=q@d  # fibras de medial-arriba a lateral-abajo
    return [(gm,0.035,f),(gd,0.020,np.abs(P[:,0])*0.3+P[:,2])]

GRUPOS={'cuadriceps':'muslo','gluteos':'pelvis'}

def campos(P,huesos,grupos,borde=0.006,fibra=0.010,surco=0.010):
    """P: posiciones en reposo (N,3). Devuelve máscara, vientre y fibra en [0,1]."""
    capas=[]
    for g in grupos:
        if g=='cuadriceps':
            for x in 'LR':
                lado=(P[:,0]>0) if x=='L' else (P[:,0]<0)
                for sd,w,f in cuadriceps(P,*huesos[x]): capas.append((np.where(lado,sd,-1),w,f))
        elif g=='gluteos':
            capas+=gluteos(P)
    mask=np.zeros(len(P)); belly=np.zeros(len(P)); fib=np.zeros(len(P))
    # surco: donde dos músculos se tocan la máscara sigue llena (rojo oscuro, no piel)
    sds=np.sort(np.stack([c[0] for c in capas]),0)
    if len(capas)>1: mask=_ss(-surco,-surco/2,sds[-2])*_ss(-surco,-surco/2,sds[-1])
    for sd,w,f in capas:
        m=_ss(-borde,borde,sd); b=_ss(0,w,sd)**0.7
        mask=np.maximum(mask,m)
        sel=b>belly; belly=np.where(sel,b,belly)
        fv=0.5+0.5*np.cos(2*np.pi*f/fibra)
        fib=np.where(sel,fv,fib)
    return mask,belly,fib

def rasterizar(me,P,res,filtro):
    """Posición en reposo por texel del mapa UV (solo triángulos que pasan el filtro)."""
    me.calc_loop_triangles()
    nl=len(me.loops); uv=np.zeros(nl*2); me.uv_layers.active.data.foreach_get('uv',uv); uv=uv.reshape(-1,2)
    lt=np.zeros(len(me.loop_triangles)*3,int); me.loop_triangles.foreach_get('loops',lt); lt=lt.reshape(-1,3)
    vt=np.zeros(len(me.loop_triangles)*3,int); me.loop_triangles.foreach_get('vertices',vt); vt=vt.reshape(-1,3)
    keep=filtro(P[vt].mean(1)); lt,vt=lt[keep],vt[keep]
    POS=np.full((res,res,3),np.nan,np.float32)
    for L,V in zip(lt,vt):
        U=uv[L]*res-0.5
        x0,y0=np.floor(U.min(0)).astype(int); x1,y1=np.ceil(U.max(0)).astype(int)
        x0,y0=max(x0,0),max(y0,0); x1,y1=min(x1,res-1),min(y1,res-1)
        if x1<x0 or y1<y0: continue
        gx,gy=np.meshgrid(np.arange(x0,x1+1),np.arange(y0,y1+1))
        T=np.array([[U[0,0]-U[2,0],U[1,0]-U[2,0]],[U[0,1]-U[2,1],U[1,1]-U[2,1]]])
        if abs(np.linalg.det(T))<1e-12: continue
        l12=np.linalg.solve(T,np.stack([gx.ravel()-U[2,0],gy.ravel()-U[2,1]]))
        l3=1-l12.sum(0); bc=np.vstack([l12,l3])
        ok=(bc>=-0.02).all(0)
        if not ok.any(): continue
        POS[gy.ravel()[ok],gx.ravel()[ok]]=(bc[:,ok].T@P[V]).astype(np.float32)
    return POS

def dilatar(img,valido,n):
    """Extiende los bordes de las islas UV n píxeles para evitar costuras."""
    img=img.copy(); v=valido.copy()
    for _ in range(n):
        acc=np.zeros_like(img); cnt=np.zeros(v.shape)
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            sv=np.roll(v,(dy,dx),(0,1)); si=np.roll(img,(dy,dx),(0,1))
            acc+=np.where(sv[...,None],si,0); cnt+=sv
        nuevo=(~v)&(cnt>0)
        img[nuevo]=acc[nuevo]/cnt[nuevo][:,None]; v|=nuevo
    return img
