"""Original skinned Jejak Haji characters, Blender 4.5 LTS.
Run: blender -b --python blender/characters.py
JH_RENDER=1 also renders a pose contact sheet. No downloaded/licensed base mesh.
Four variants share a 18-bone rig and named glTF clips. Units: metres.
This is a stylized procedural character, not image-to-3D reconstruction.
"""
import bpy, math, os, json
from pathlib import Path
from mathutils import Vector, Matrix
OUT=Path(__file__).resolve().parents[1]/'models'
OUT.mkdir(exist_ok=True)
def material(name, color, roughness=0.8):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = roughness
    return m


def build(female,pilgrim):
    def material(name, color, roughness=0.8):
        m = bpy.data.materials.new(name)
        m.diffuse_color = (*color, 1)
        m.use_nodes = True
        p = m.node_tree.nodes.get('Principled BSDF')
        p.inputs['Base Color'].default_value = (*color, 1)
        p.inputs['Roughness'].default_value = roughness
        return m

    skin = material('Skin', (0.53, 0.29, 0.15))
    ear = material('EarInset', (0.40, 0.17, 0.09))
    white = material('Ihram', (0.91, 0.89, 0.82))
    fold = material('ClothSeam', (0.79, 0.78, 0.71))
    hair = material('Hair', (0.025, 0.018, 0.014))
    eye_white = material('EyeWhite', (0.95, 0.93, 0.87), 0.35)
    iris = material('Iris', (0.065, 0.029, 0.012), 0.32)
    pupil = material('Pupil', (0.006, 0.005, 0.004), 0.25)
    lip = material('Lip', (0.36, 0.13, 0.07))
    leather = material('Sandal', (0.12, 0.065, 0.035))
    strap = material('SandalStrap', (0.23, 0.12, 0.06))

    def group(name, pos=(0, 0, 0), parent=None):
        ob = bpy.data.objects.new(name, None)
        bpy.context.collection.objects.link(ob)
        ob.parent = parent
        ob.location = pos
        return ob

    root = group('PilgrimAvatar')

    def mesh(name, verts, faces, mat, parent=root):
        me = bpy.data.meshes.new(name)
        me.from_pydata(verts, [], faces)
        me.update()
        ob = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(ob)
        ob.parent = parent
        ob.data.materials.append(mat)
        for p in me.polygons:
            p.use_smooth = True
        return ob

    def ellipsoid(name, pos, scale, mat, parent=root, segments=16, rings=10):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings)
        ob = bpy.context.object
        ob.name = name
        ob.parent = parent
        ob.location = pos
        ob.scale = scale
        ob.data.materials.append(mat)
        for p in ob.data.polygons:
            p.use_smooth = True
        return ob

    def curve(name, points, radius, mat, parent=root):
        cu = bpy.data.curves.new(name, 'CURVE')
        cu.dimensions = '3D'
        cu.resolution_u = 5
        cu.bevel_depth = radius
        cu.bevel_resolution = 1
        sp = cu.splines.new('BEZIER')
        sp.bezier_points.add(len(points)-1)
        for bp, co in zip(sp.bezier_points, points):
            bp.co = co
            bp.handle_left_type = 'AUTO'
            bp.handle_right_type = 'AUTO'
        ob = bpy.data.objects.new(name, cu)
        bpy.context.collection.objects.link(ob)
        ob.parent = parent
        ob.data.materials.append(mat)
        return ob

    # Head with explicit eyes, brows, ears, nose, smile, and removable hair.
    head=group('HeadPivot',(0,0,1.68),root)
    ellipsoid('Head',(0,0,0),(.203,.175,.241),skin,head,32,20)
    ellipsoid('Jaw',(0,-.018,-.105),(.155,.144,.125),skin,head)
    for side in (-1,1):
        ellipsoid('Ear',(side*.203,0,-.01),(.042,.031,.068),skin,head)
        ellipsoid('EarInside',(side*.219,-.022,-.011),(.021,.012,.041),ear,head)
        x=side*.078
        ellipsoid('EyeSocket',(x,-.145,.035),(.050,.019,.034),ear,head)
        ellipsoid('Eye',(x,-.160,.039),(.042,.013,.026),eye_white,head)
        ellipsoid('Iris',(x,-.171,.038),(.019,.005,.021),iris,head)
        ellipsoid('Pupil',(x,-.176,.038),(.009,.003,.012),pupil,head)
        ellipsoid('EyeGlint',(x-.005,-.179,.046),(.004,.002,.004),eye_white,head,12,8)
        curve('Brow',[(x-.045,-.162,.099),(x,-.179,.111),(x+.041,-.162,.102)],.011,hair,head)
    ellipsoid('Nose',(0,-.179,-.018),(.033,.042,.051),skin,head)
    ellipsoid('NoseTip',(0,-.208,-.035),(.04,.025,.025),skin,head)
    curve('Smile',[(-.065,-.145,-.097),(0,-.172,-.113),(.065,-.145,-.097)],.006,lip,head)
    curve('LowerLip',[(-.038,-.157,-.118),(0,-.166,-.123),(.038,-.157,-.118)],.008,skin,head)
    curve('Moustache',[(-.055,-.153,-.081),(-.025,-.172,-.074),(0,-.173,-.08),(.025,-.172,-.074),(.055,-.153,-.081)],.006,hair,head)
    curve('Beard',[(-.143,-.071,-.085),(-.107,-.117,-.148),(0,-.116,-.206),(.107,-.117,-.148),(.143,-.071,-.085)],.021,hair,head)
    hg=group('Hair',(0,0,0),head)
    # Cap follows the cranium; multiple swept locks soften its silhouette.
    verts, faces = [], []
    for j in range(9):
        for i in range(32):
            a=i*2*math.pi/32
            end=1.37+.25*math.sin(a)
            p=.001+(end-.001)*j/8
            verts.append((.211*math.sin(p)*math.cos(a),.183*math.sin(p)*math.sin(a),.248*math.cos(p)))
    for j in range(8):
        for i in range(32):
            k=j*32+i; q=j*32+(i+1)%32
            faces.append((k,q,q+32,k+32))
    mesh('HairCap',verts,faces,hair,hg)
    for i in range(5):
        ob=ellipsoid('SweptLock',(-.115+i*.047,-.06,.197+(.02 if i<3 else 0)),(.068,.117,.026),hair,hg)
        ob.rotation_euler[1]=-.28


    # Normalize head proportions to approximately seven heads tall.
    head.location.z=1.62
    head.scale=(.76,.76,.76)
    if female:
        for ob in list(head.children_recursive):
            if ob.name.startswith(('Moustache','Beard','HairCap','SweptLock','Ear')):
                bpy.data.objects.remove(ob,do_unlink=True)

    clothmat=white if pilgrim else material('Outfit',(0.13,.29,.26))
    scarfmat=white if pilgrim else material('Scarf',(.47,.60,.55))
    # A real armature: bone rest axes are parallel for predictable scripted rotations.
    armdata=bpy.data.armatures.new('HumanSkeleton')
    rig=bpy.data.objects.new('JemaahRig',armdata)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active=rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bones={}
    def bone(name,loc,parent=None):
        b=armdata.edit_bones.new(name); b.head=loc; b.tail=Vector(loc)+Vector((0,0,.08))
        if parent:b.parent=bones[parent]
        bones[name]=b
    bone('Root',(0,0,0))
    bone('Hips',(0,0,.94),'Root')
    bone('Spine',(0,0,.94),'Hips')
    bone('Head',(0,0,1.55),'Spine')
    for s in [-1,1]:
        n='L' if s==1 else 'R'
        bone('UpperArm'+n,(s*.235,0,1.40),'Spine')
        bone('Forearm'+n,(s*.27,0,1.12),'UpperArm'+n)
        bone('Hand'+n,(s*.29,-.01,.86),'Forearm'+n)
        bone('Thigh'+n,(s*.11,0,.94),'Hips')
        bone('Shin'+n,(s*.11,0,.51),'Thigh'+n)
        bone('Foot'+n,(s*.11,0,.10),'Shin'+n)
        bone('Toe'+n,(s*.11,-.13,.055),'Foot'+n)
    bpy.ops.object.mode_set(mode='OBJECT')
    rig.select_set(False)

    # Every surface receives explicit normalized vertex weights.
    def bind(ob,weights):
        bpy.context.view_layer.update()
        world=ob.matrix_world.copy()
        if ob.type=='CURVE':
            bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
            bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
        ob.parent=rig;ob.matrix_world=world
        bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
        bpy.context.view_layer.objects.active=ob
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        for v in ob.data.vertices:
            ws=weights(v.co) if callable(weights) else {weights:1}
            total=sum(ws.values())
            for name,value in ws.items():
                if value<=0:continue
                vg=ob.vertex_groups.get(name) or ob.vertex_groups.new(name=name)
                vg.add([v.index],value/total,'REPLACE')
        mod=ob.modifiers.new('Skin','ARMATURE');mod.object=rig
        ob.select_set(False)
        return ob
    for ob in list(head.children_recursive):
        if ob.type in {'MESH','CURVE'}:bind(ob,'Head')
    # Empty pivots no longer drive the body; retain Hair grouping via mesh names.
    for ob in list(bpy.data.objects):
        if ob.type=='EMPTY':bpy.data.objects.remove(ob,do_unlink=True)

    def sphere(name,pos,size,mat,b):
        return bind(ellipsoid(name,pos,size,mat,parent=None,segments=20,rings=12),b)
    def tube(name,points,radii,mat,weight):
        vs=[];fs=[];N=32
        for j,(x,y,z) in enumerate(points):
            rx,ry=radii[j]
            for i in range(N):
                a=i*2*math.pi/N
                ripple=1+.013*math.sin(a*10)
                vs.append((x+rx*math.cos(a)*ripple,y+ry*math.sin(a)*ripple,z))
        for j in range(len(points)-1):
            for i in range(N):
                k=j*N+i;q=j*N+(i+1)%N;fs.append((k,q,q+N,k+N))
        fs.extend([tuple(reversed(range(N))),tuple((len(points)-1)*N+i for i in range(N))])
        return bind(mesh(name,vs,fs,mat,parent=None),weight)

    def blend(z,at,width,lo,hi):
        t=max(0,min(1,(z-at)/width+.5));return {lo:1-t,hi:t}
    # Torso silhouette with waist, chest and sloping shoulders.
    tube('Tunic' if not pilgrim else 'UpperIhram',[(0,0,z) for z in [.91,1.01,1.16,1.31,1.39,1.45]],[(.18,.12),(.19,.13),(.205,.14),(.235,.145),(.22,.135),(.09,.08)],clothmat,'Spine')
    sphere('Neck',(0,0,1.49),(.075,.073,.10),skin,'Head')
    for s in [-1,1]:
        n='L' if s==1 else 'R'
        armcloth=clothmat if female or not pilgrim else skin
        tube('Sleeve'+n,[(s*x,0,z) for x,z in [(.235,1.42),(.25,1.31),(.27,1.12),(.28,1.0),(.29,.87)]],[(.075,.078),(.073,.073),(.065,.065),(.058,.06),(.052,.052)],armcloth,lambda v,n=n:blend(v.z,1.12,.15,'Forearm'+n,'UpperArm'+n))
        sphere('Palm'+n,(s*.29,-.014,.815),(.048,.03,.065),skin,'Hand'+n)
        for i in range(4):
            sphere('Finger'+n,(s*.29+(i-1.5)*.018,-.018,.76+abs(i-1.5)*.008),(.010,.015,.045),skin,'Hand'+n)
        sphere('Thumb'+n,(s*.247,-.025,.81),(.02,.024,.04),skin,'Hand'+n)
        legmat=skin if pilgrim and not female else clothmat
        tube('Leg'+n,[(s*.11,0,z) for z in [.10,.22,.40,.51,.64,.80,.95]],[(.052,.06),(.064,.07),(.066,.075),(.075,.075),(.085,.09),(.095,.10),(.10,.11)],legmat,lambda v,n=n:blend(v.z,.51,.18,'Shin'+n,'Thigh'+n))
        sphere('Foot'+n,(s*.11,-.055,.075),(.066,.132,.057),white if female else skin,'Foot'+n)
        if not female:
            sphere('Sandal'+n,(s*.11,-.06,.024),(.074,.145,.024),leather,'Foot'+n)
            for yy in [-.12,-.015]:
                ob=curve('SandalStrap'+n,[(s*.11-.063,yy,.05),(s*.11,yy,.12),(s*.11+.063,yy,.05)],.013,strap,parent=None)
                bind(ob,'Foot'+n)

    # Continuous cloth follows hip, thighs and knees. It is skinned, not physics cloth.
    def lower_weights(v):
        n='L' if v.x>=0 else 'R'
        ws=blend(v.z,.51,.20,'Shin'+n,'Thigh'+n)
        if v.z>.83:ws=blend(v.z,.91,.16,'Thigh'+n,'Hips')
        # Smooth medial seam; two sides share the central strip to avoid tearing.
        if abs(v.x)<.07:
            t=(v.x/.07+1)/2
            out={}
            for k,w in ws.items():
                if k=='Hips':out[k]=w
                else:out[k[:-1]+'L']=w*t;out[k[:-1]+'R']=w*(1-t)
            return out
        return ws
    if pilgrim or female:
        low=.035 if female else .26
        heights=[low+(1.0-low)*i/16 for i in range(17)]
        tube('Skirt' if female else 'LowerIhram',[(0,0,z) for z in heights],[(.255 if female else .235,.162 if female else .15) for z in heights],clothmat,lower_weights)
    if pilgrim and not female:
        # Diagonal folds on the chest, attached to the articulated torso.
        for n,side in [('L',1),('R',-1)]:
            sphere('ShoulderWrap'+n,(side*.225,0,1.355),(.12,.15,.115),white,'UpperArm'+n)
        for i in range(4):
            ob=curve('IhramFold',[(-.17,-.115,1.10+i*.055),(0,-.142,1.17+i*.05),(.17,-.105,1.31+i*.035)],.008,white,parent=None)
            bind(ob,'Spine')
    if female:
        # Hood follows the cranium, leaving an oval opening around the face.
        vs=[];fs=[];N=40;rows=14
        for j in range(rows):
            t=j/(rows-1)
            for i in range(N):
                a=i*2*math.pi/N
                # Opening lies in frontal plane, then rounds over the head to the back.
                y=-.131+.285*t
                r=math.sin(.77+(math.pi-.77)*t)
                y=-.145+.325*t
                vs.append((.19*r*math.cos(a),y,1.625+.235*r*math.sin(a)))
        for j in range(rows-1):
            for i in range(N):
                k=j*N+i;q=j*N+(i+1)%N;fs.append((k,q,q+N,k+N))
        fs.append(tuple((rows-1)*N+i for i in range(N)))
        bind(mesh('Hood',vs,fs,scarfmat,parent=None),'Head')
        tube('Telekung',[(0,0,z) for z in [.94,1.05,1.20,1.34,1.43,1.50]],[(.33,.19),(.32,.19),(.30,.18),(.285,.17),(.21,.15),(.115,.108)],scarfmat,'Spine')
    # Consolidate meshes per material except hair and footwear (runtime visibility).
    buckets={}
    for ob in list(rig.children):
        if ob.type!='MESH':continue
        tag='Hair' if ob.name.startswith(('HairCap','SweptLock')) else 'Footwear' if ob.name.startswith('Sandal') else 'Body'
        key=(tag,ob.data.materials[0].name)
        buckets.setdefault(key,[]).append(ob)
    for (tag,mat),obs in buckets.items():
        bpy.ops.object.select_all(action='DESELECT')
        for ob in obs:ob.select_set(True)
        bpy.context.view_layer.objects.active=obs[0];bpy.ops.object.join()
        obs[0].name=tag+'_'+mat
        # join retains first modifier, vertex groups are merged by name.
        for poly in obs[0].data.polygons:poly.use_smooth=True
    return rig

def pose(rig,name,t=0):
    for b in rig.pose.bones:
        b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0)
    def rx(n,v):rig.pose.bones[n].rotation_euler.x=math.radians(v)
    def hips(y,z):rig.pose.bones['Hips'].location=(0,z-.94,-y)
    if name=='Walk':
        for s,n in [(1,'L'),(-1,'R')]:
            wave=math.sin(t*2*math.pi)*s
            rx('Thigh'+n,25*wave);rx('Shin'+n,30*max(0,-wave))
            rx('UpperArm'+n,-18*wave);rx('Forearm'+n,-10)
        hips(0,.94+.015*math.cos(t*4*math.pi))
    elif name=='Rukuk':
        rx('Spine',88);rx('Head',-8)
        for side,n in [(1,'L'),(-1,'R')]:
            rx('UpperArm'+n,-88);rx('Forearm'+n,75);rx('Hand'+n,-75)
            rig.pose.bones['UpperArm'+n].rotation_euler.z=math.radians(-side*8)
    elif name in ['Duduk','Salam']:
        hips(.27,.24)
        for n in ['L','R']:
            rx('Thigh'+n,-69);rx('Shin'+n,159);rx('Foot'+n,-80)
            rx('UpperArm'+n,-35);rx('Forearm'+n,0)
        if name=='Salam':rig.pose.bones['Head'].rotation_euler.y=math.radians(45*math.sin(t*2*math.pi))
    elif name=='Sujud':
        hips(.15,.57);rx('Spine',120);rx('Head',25)
        for n in ['L','R']:
            rx('Thigh'+n,-22);rx('Shin'+n,112);rx('Foot'+n,-75)
            rx('UpperArm'+n,-145);rx('Forearm'+n,-58);rx('Hand'+n,-7)
    elif name=='Takbir':
        for s,n in [(1,'L'),(-1,'R')]:
            rx('UpperArm'+n,-30);rx('Forearm'+n,-145)
            rig.pose.bones['UpperArm'+n].rotation_euler.z=math.radians(s*18)
    elif name in ['Bersedekap','Groom']:
        for s,n in [(1,'L'),(-1,'R')]:
            rx('UpperArm'+n,-20);rx('Forearm'+n,-105)
            rig.pose.bones['Forearm'+n].rotation_euler.z=math.radians(-s*55)
        if name=='Groom':rx('ForearmR',-105+12*math.sin(t*2*math.pi))
    elif name=='Throw':
        rx('UpperArmR',-150+100*t);rx('ForearmR',-70+70*t)
    elif name=='Sleep':
        hips(0,.15);rx('Hips',-90)
    else:
        rx('Spine',.6*math.sin(t*2*math.pi))
    bpy.context.view_layer.update()

CLIPS={'Idle':2,'Walk':1,'Takbir':1,'Bersedekap':1,'Rukuk':1,'Duduk':1,'Sujud':1,'Salam':3,'Groom':2,'Throw':1,'Sleep':1}
def animate(rig):
    rig.animation_data_create()
    for name,duration in CLIPS.items():
        action=bpy.data.actions.new(name);action.use_fake_user=True
        rig.animation_data.action=action
        end=round(duration*24)+1
        for frame in range(1,end+1,2):
            pose(rig,name,(frame-1)/(end-1))
            for b in rig.pose.bones:
                b.keyframe_insert(data_path='location',frame=frame,group=b.name)
                b.keyframe_insert(data_path='rotation_euler',frame=frame,group=b.name)
        # Keep each clip in a named NLA track for deterministic separate glTF clips.
        track=rig.animation_data.nla_tracks.new();track.name=name
        track.strips.new(name,1,action);track.mute=True
    rig.animation_data.action=None
    pose(rig,'Idle')

def studio(rig,variant):
    sc=bpy.context.scene
    bpy.ops.mesh.primitive_plane_add(size=200)
    bpy.context.object.data.materials.append(material('Studio',(.21,.28,.25)))
    bpy.context.object.location.z=-.015
    bpy.ops.object.camera_add(location=(3,-5,2.1));cam=bpy.context.object
    cam.rotation_euler=(Vector((0,-.1,.85))-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.type='ORTHO';cam.data.ortho_scale=2.15;sc.camera=cam
    for loc,power in [((3,-4,5),450),((-3,-2,3),250),((2,3,5),500)]:
        bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=4
        o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
    sc.world.color=(.3,.3,.3);sc.render.engine='CYCLES';sc.cycles.samples=16;sc.cycles.use_denoising=True
    sc.render.resolution_x=480;sc.render.resolution_y=480;sc.render.resolution_percentage=100
    for name in ['Idle','Walk','Rukuk','Duduk','Sujud','Takbir']:
        pose(rig,name,.25)
        sc.render.filepath=str(OUT/f'{variant}-{name}.png');bpy.ops.render.render(write_still=True)

for variant,female,pilgrim in [('lelaki-ihram',False,True),('perempuan-telekung',True,True),('lelaki-biasa',False,False),('perempuan-biasa',True,False)]:
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for action in list(bpy.data.actions):bpy.data.actions.remove(action)
    rig=build(female,pilgrim)
    animate(rig)
    sc=bpy.context.scene;sc.render.fps=24;sc.frame_start=1;sc.frame_end=73
    bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
    for ob in rig.children:ob.select_set(True)
    bpy.context.view_layer.objects.active=rig
    bpy.ops.export_scene.gltf(filepath=str(OUT/f'{variant}.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_extras=True)
    rig.animation_data.action=bpy.data.actions['Walk']
    rig.animation_data.action_slot=rig.animation_data.action.slots[0]
    sc.frame_end=25;sc.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/f'{variant}.blend'))
    rig.animation_data.action=None
    print('CHARACTER_EXPORTED',variant,flush=True)
    if os.environ.get('JH_RENDER')=='1' and pilgrim:studio(rig,variant)
