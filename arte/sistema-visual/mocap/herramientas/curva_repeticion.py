import bpy,sys,math,addon_utils
addon_utils.enable('io_anim_bvh',default_set=True)
args=sys.argv[sys.argv.index('--')+1:]
path,a0,a1,st=args[0],int(args[1]),int(args[2]),int(args[3])
bpy.ops.import_anim.bvh(filepath=path,global_scale=0.056444,use_fps_scale=False,axis_forward='-Z',axis_up='Y')
a=bpy.context.object;s=bpy.context.scene;pb=a.pose.bones
w=lambda b:a.matrix_world@pb[b].head
for f in range(a0,a1,st):
    s.frame_set(f)
    k=math.degrees((w('LeftUpLeg')-w('LeftLeg')).angle(w('LeftFoot')-w('LeftLeg')))
    kr=math.degrees((w('RightUpLeg')-w('RightLeg')).angle(w('RightFoot')-w('RightLeg')))
    # knee width vs ankle width (valgus check)
    kw=(w('LeftLeg')-w('RightLeg')).length; aw=(w('LeftFoot')-w('RightFoot')).length
    hand=(w('LeftHand').z+w('RightHand').z)/2
    print(f'{f:5d} hip={w("Hips").z:.2f} knee={k:4.0f}/{kr:4.0f} kneeW={kw:.2f} ankleW={aw:.2f} hands_z={hand:.2f} heelL={w("LeftFoot").z:.3f}')
