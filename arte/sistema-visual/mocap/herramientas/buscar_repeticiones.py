import bpy,sys,math,addon_utils
addon_utils.enable('io_anim_bvh',default_set=True)
from mathutils import Vector
for path in sys.argv[sys.argv.index('--')+1:]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_anim.bvh(filepath=path,global_scale=0.056444,frame_start=1,use_fps_scale=False,rotate_mode='NATIVE',axis_forward='-Z',axis_up='Y')
    a=bpy.context.object; s=bpy.context.scene
    n=int(a.animation_data.action.frame_range[1])
    pb=a.pose.bones
    def w(b,tail=False): return a.matrix_world@(pb[b].tail if tail else pb[b].head)
    def ang(p,q,r):
        u=p-q;v=r-q; return math.degrees(u.angle(v))
    rows=[]
    for f in range(1,n+1,4):
        s.frame_set(f)
        hz=w('Hips').z
        kL=ang(w('LeftUpLeg'),w('LeftLeg'),w('LeftFoot')); kR=ang(w('RightUpLeg'),w('RightLeg'),w('RightFoot'))
        fz=min(w('LeftFoot').z,w('RightFoot').z)
        rows.append((f,hz,kL,kR,fz))
    print(path.split('/')[-1],'frames',n,'hip range',min(r[1] for r in rows),max(r[1] for r in rows))
    # print local minima of knee angle under 110
    for i in range(1,len(rows)-1):
        f,hz,kL,kR,fz=rows[i]
        k=(kL+kR)/2
        if k<115 and k<= (rows[i-1][2]+rows[i-1][3])/2 and k<=(rows[i+1][2]+rows[i+1][3])/2:
            print(f' f{f} hip={hz:.2f} kneeL={kL:.0f} kneeR={kR:.0f} footz={fz:.2f}')
