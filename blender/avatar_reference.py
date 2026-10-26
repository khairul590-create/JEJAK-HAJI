"""Original reference-led ihram avatar proof, not image-to-3D reconstruction.
Run with Blender 4.5 LTS. All generated files go to JH_OUT; main game untouched.
"""
import bpy
import math
import os
import json
from pathlib import Path
from mathutils import Vector

OUT = Path(os.environ.get('JH_OUT', Path(__file__).parent / 'avatar-proof'))
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for action in list(bpy.data.actions):
    bpy.data.actions.remove(action)


def mat(name, color, rough=.65):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    return m


skin = mat('Warm skin', (.62, .325, .17), .64)
hair = mat('Espresso hair', (.028, .016, .012), .55)
locks = mat('Hair ridges', (.040, .024, .018), .58)
white = mat('Warm white cotton', (.88, .86, .81), .92)
eye_white = mat('Ivory eyes', (.95, .94, .90), .28)
iris = mat('Brown iris', (.12, .047, .016), .32)
pupil = mat('Pupils', (.008, .005, .004), .25)
mouth = mat('Smile and nostrils', (.13, .035, .022), .73)
lip = mat('Lower lip', (.48, .19, .11), .65)
sole = mat('Sandal sole', (.035, .024, .018), .82)
leather = mat('Sandal straps', (.075, .045, .026), .65)


def mesh(name, verts, faces, material):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    for face in me.polygons:
        face.use_smooth = True
    return ob


def ellipsoid(name, center, size, material, segments=20, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=center)
    ob = bpy.context.object
    ob.name = name
    ob.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    ob.data.materials.append(material)
    for face in ob.data.polygons:
        face.use_smooth = True
    return ob


def tube(name, centers, radii, material, sides=24):
    verts, faces = [], []
    for j, (co, radius) in enumerate(zip(centers, radii)):
        rx, ry = radius
        for i in range(sides):
            a = i * math.tau / sides
            verts.append((co[0] + rx * math.cos(a), co[1] + ry * math.sin(a), co[2]))
    for j in range(len(centers) - 1):
        for i in range(sides):
            k = j * sides + i
            q = j * sides + (i + 1) % sides
            faces.append((k, q, q + sides, k + sides))
    faces.extend([tuple(reversed(range(sides))), tuple((len(centers)-1)*sides+i for i in range(sides))])
    return mesh(name, verts, faces, material)


def strand(name, points, radii, material, sides=8, flatten=1):
    verts, faces = [], []
    for i, (point, radius) in enumerate(zip(points, radii)):
        tangent = Vector(points[min(i+1, len(points)-1)]) - Vector(points[max(i-1, 0)])
        tangent.normalize()
        normal = tangent.cross(Vector((0, 1, 0)))
        if normal.length < .01:
            normal = tangent.cross(Vector((0, 0, 1)))
        normal.normalize()
        binormal = tangent.cross(normal).normalized()
        for k in range(sides):
            a = math.tau * k / sides
            p = Vector(point) + radius * (normal*math.cos(a) + binormal*math.sin(a)*flatten)
            verts.append(tuple(p))
    for j in range(len(points)-1):
        for k in range(sides):
            a = j*sides+k
            b = j*sides+(k+1)%sides
            faces.append((a, b, b+sides, a+sides))
    faces.extend([tuple(reversed(range(sides))), tuple((len(points)-1)*sides+k for k in range(sides))])
    return mesh(name, verts, faces, material)


def join(obs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for ob in obs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    bpy.ops.object.join()
    obs[0].name = name
    return obs[0]


def apply(ob, modifier):
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=modifier.name)


parts = []
parts.append(tube('Torso', [(0, 0, z) for z in [.88, .96, 1.06, 1.18, 1.30, 1.37, 1.42, 1.46]],
                  [(.16, .115), (.175, .12), (.165, .115), (.187, .135), (.215, .14), (.22, .13), (.165, .10), (.07, .068)], skin, 32))
parts.append(ellipsoid('Neck', (0, .005, 1.49), (.07, .068, .10), skin))
# A shaped cranial surface, nose, cheeks, ears and torso are welded together.
vs, fs = [], []
for j in range(25):
    p = .002 + (math.pi-.004)*j/24
    z = 1.655 + .211*math.cos(p)
    for i in range(40):
        a = math.tau*i/40
        jaw = 1 - .12*max(0, (1.61-z)/.16)
        x = .157*math.sin(p)*math.cos(a)*jaw
        y = .139*math.sin(p)*math.sin(a)
        if y < 0:
            cheek = math.exp(-((abs(x)-.085)/.048)**2-((z-1.62)/.050)**2)
            socket = math.exp(-((abs(x)-.066)/.039)**2-((z-1.687)/.031)**2)
            y += .008*socket - .008*cheek
        vs.append((x, y, z))
for j in range(24):
    for i in range(40):
        a=j*40+i; b=j*40+(i+1)%40
        fs.append((a,b,b+40,a+40))
parts.append(mesh('Shaped head', vs, [tuple(reversed(f)) for f in fs], skin))
parts.append(ellipsoid('Nose bridge', (0, -.133, 1.649), (.026, .025, .054), skin))
parts.append(ellipsoid('Nose tip', (0, -.164, 1.624), (.033, .027, .024), skin))
for sign in [-1, 1]:
    parts.append(ellipsoid('Ear', (sign*.158, .001, 1.651), (.032, .023, .052), skin))
    parts.append(tube('Continuous arm', [(sign*x, 0, z) for x,z in [(.204,1.388),(.25,1.35),(.274,1.26),(.292,1.13),(.31,1.04),(.327,.92),(.335,.872)]],
                      [(.071,.080),(.074,.075),(.068,.070),(.052,.055),(.059,.058),(.043,.039),(.033,.032)], skin))
    parts.append(ellipsoid('Palm', (sign*.337, -.008, .828), (.040,.028,.064), skin))
    for k in range(4):
        x=sign*(.310+k*.018)
        z=.767 + abs(k-1.3)*.009
        parts.append(ellipsoid('Finger', (x,-.009,z), (.011,.014,.043-abs(k-1.3)*.004), skin, 12, 8))
    parts.append(ellipsoid('Thumb', (sign*.294,-.025,.819), (.019,.023,.039), skin, 16, 10))
    parts.append(tube('Leg', [(sign*.108, 0, z) for z in [.095,.20,.34,.51,.68,.84,.95]],
                      [(.042,.052),(.047,.055),(.062,.069),(.062,.067),(.079,.083),(.093,.10),(.097,.105)], skin))
    parts.append(ellipsoid('Foot', (sign*.108,-.065,.075), (.060,.13,.052), skin))
    for k in range(5):
        parts.append(ellipsoid('Toe',(sign*(.068+k*.020),-.169+abs(k-1)*.007,.062),(.013,.032-k*.002,.020),skin,12,8))
body = join(parts, 'Body_Skin')
remesh = body.modifiers.new('Weld anatomical surfaces', 'REMESH')
remesh.mode = 'VOXEL'; remesh.voxel_size=.008; remesh.use_smooth_shade=True
apply(body, remesh)
smooth = body.modifiers.new('Soften joins', 'SMOOTH'); smooth.factor=1.1; smooth.iterations=5
apply(body, smooth)
decimate = body.modifiers.new('Phone topology', 'DECIMATE'); decimate.ratio=.10
apply(body, decimate)

head_parts=[]
for sign in [-1,1]:
    x=sign*.065
    head_parts.append(ellipsoid('Eye white',(x,-.126,1.689),(.041,.019,.030),eye_white,24,16))
    head_parts.append(ellipsoid('Iris',(x,-.144,1.689),(.020,.0045,.023),iris,20,12))
    head_parts.append(ellipsoid('Pupil',(x,-.148,1.689),(.010,.0025,.014),pupil,16,10))
    head_parts.append(ellipsoid('Catchlight',(x-.006,-.151,1.698),(.005,.002,.006),eye_white,12,8))
    points=[(x-.042,-.126,1.692),(x-.025,-.143,1.716),(x+.008,-.148,1.720),(x+.039,-.127,1.699)]
    head_parts.append(strand('Upper eyelid',points,[.002,.004,.004,.002],hair))
    points=[(x-.043,-.128,1.744),(x-.017,-.143,1.754),(x+.019,-.141,1.753),(x+.041,-.126,1.744)]
    head_parts.append(strand('Expressive brow',points,[.007,.012,.011,.005],hair))
    head_parts.append(ellipsoid('Nostril',(sign*.018,-.180,1.615),(.006,.003,.004),mouth,12,8))
# Beard is a continuous shell hugging the jaw, with a mouth opening.
verts, faces=[],[]
N=48; R=10
for j in range(R):
    for i in range(N):
        a=math.tau*i/N
        front=max(0,-math.sin(a))
        top=1.646-.045*front
        z=top+(1.466-top)*j/(R-1)
        p=math.acos(max(-1,min(1,(z-1.655)/.211)))
        jaw=1-.12*max(0,(1.61-z)/.16)
        x=(.157*math.sin(p)*jaw+.006)*math.cos(a)
        y=(.139*math.sin(p)+.007)*math.sin(a)
        verts.append((x,y,z))
for j in range(R-1):
    for i in range(N):
        a=j*N+i;b=j*N+(i+1)%N
        face=(a,b,b+N,a+N)
        c=sum((Vector(verts[k]) for k in face),Vector())/4
        if c.y<-.07 and (c.x/.061)**2+((c.z-1.574)/.029)**2<1.18:
            continue
        faces.append(face)
head_parts.append(mesh('Sculpted beard',verts,[tuple(reversed(f)) for f in faces],hair))
head_parts.append(strand('Moustache',[(-.055,-.129,1.598),(-.025,-.149,1.605),(0,-.152,1.596),(.025,-.149,1.605),(.055,-.129,1.598)],[.006,.010,.009,.010,.006],hair,10,.65))
# A smiling surface, not a round bead mouth.
verts=[]
for row in [0,1]:
    for i in range(17):
        x=-.054+.108*i/16
        q=1-(x/.054)**2
        z=1.576-.006*q if row==0 else 1.576-.029*q
        y=-.141+.014*(x/.054)**2
        verts.append((x,y,z))
faces=[(i,i+1,i+18,i+17) for i in range(16)]
head_parts.append(mesh('Smile opening',verts,faces,mouth))
verts2=[(x,y-.001,z-.002 if k<17 else z+.012*(1-(x/.054)**2)) for k,(x,y,z) in enumerate(verts)]
head_parts.append(mesh('Smile teeth',verts2,faces,eye_white))
head_parts.append(strand('Lower lip',[(-.041,-.133,1.559),(0,-.145,1.545),(.041,-.133,1.559)],[.002,.005,.002],lip))

# One fitted hair cap with overlapping sculptural curls, not isolated spikes.
verts,faces=[],[]
N=48;R=14
for j in range(R):
    for i in range(N):
        a=math.tau*i/N
        end=1.48+.47*math.sin(a)
        p=.005+(end-.005)*j/(R-1)
        ripple=1+.025*math.sin(a*9+p*5)
        verts.append((.165*math.sin(p)*math.cos(a)*ripple,.151*math.sin(p)*math.sin(a)*ripple,1.655+.231*math.cos(p)))
for j in range(R-1):
    for i in range(N):
        k=j*N+i;q=j*N+(i+1)%N
        faces.append((k,q,q+N,k+N))
hair_parts=[mesh('Hair fitted cap',verts,[tuple(reversed(f)) for f in faces],hair)]
for k in range(10):
    x=-.115+k*.024
    points=[];radii=[]
    for j in range(15):
        t=j/14
        xx=x+.080*math.sin(math.pi*t)-.055*t
        yy=-.125+.24*t
        surface=max(.10,1-(xx/.19)**2-(yy/.19)**2)
        zz=1.655+.249*math.sqrt(surface)+.014*math.sin(math.tau*t+k*.3)
        points.append((xx,yy,zz))
        radii.append(.006+.027*math.sin(math.pi*t)**.55)
    hair_parts.append(strand('Swept hair curl',points,radii,hair,10,.78))
for k in range(5):
    points=[];radii=[]
    for j in range(12):
        t=j/11
        xx=-.13+.22*t
        yy=-.112+.016*k+.028*math.sin(t*math.pi)
        zz=1.805+.055*math.sin(t*math.pi)-k*.006
        points.append((xx,yy,zz))
        radii.append(.002+.018*math.sin(math.pi*t)**.65)
    hair_parts.append(strand('Swept forelock',points,radii,locks,10,.7))
for sign in [-1,1]:
    hair_parts.append(strand('Sideburn',[(sign*.143,-.026,1.769),(sign*.157,-.023,1.718),(sign*.153,-.028,1.662)],[.017,.012,.007],hair,8,.55))

# Two continuous draped cotton surfaces: lower wrap and diagonal upper wrap.
cloth_parts=[]
verts,faces=[],[]
N=48;R=18
for j in range(R):
    t=j/(R-1)
    for i in range(N):
        a=math.tau*i/N
        fold=.008*math.sin(9*a+.8*t)+.003*math.sin(17*a-2*t)
        rx=.239-.040*t+.006*math.sin(t*math.pi)
        ry=.159-.025*t
        hem=.285+.025*math.sin(a+.7)+.015*math.sin(3*a)
        z=hem+(1.01-hem)*t
        verts.append(((rx+fold)*math.cos(a),(ry+fold)*math.sin(a),z))
for j in range(R-1):
    for i in range(N):
        k=j*N+i;q=j*N+(i+1)%N
        faces.append((k,q,q+N,k+N))
cloth_parts.append(mesh('Lower cotton wrap',verts,faces,white))
# A broad overlapping apron tapers into the side rather than stacking hard plates.
verts,faces=[],[]
for j in range(18):
    t=j/17
    for i in range(25):
        u=i/24
        a=-math.pi*.91+math.pi*.86*u
        rx=.248-.040*t
        ry=.167-.025*t
        z=.31+.10*u+.025*math.sin(math.pi*u)+(1.005-(.31+.10*u+.025*math.sin(math.pi*u)))*t
        ripple=.0035*math.sin(15*u+5*t)
        verts.append(((rx+ripple)*math.cos(a),(ry+ripple)*math.sin(a),z))
for j in range(17):
    for i in range(24):
        k=j*25+i
        faces.append((k,k+1,k+26,k+25))
cloth_parts.append(mesh('Overlapping lower cloth',verts,faces,white))
# Front and back panels sag diagonally between waist and covered shoulder.
verts,faces=[],[]
N=48;R=24
for j in range(R):
    t=j/(R-1)
    for i in range(N):
        a=math.tau*i/N
        cx=math.cos(a)
        bottom=.945+.090*cx+.018*math.sin(3*a)
        top=1.325+.115*cx
        z=bottom+(top-bottom)*t
        rx=.205+.055*t**3
        ry=.146+.008*math.sin(math.pi*t)
        wave=(.007+.007*math.sin(math.pi*t))*math.sin(math.tau*(2.6*t-.47*cx))
        wave+=.0025*math.sin(11*a-5*t)
        verts.append(((rx+wave)*cx,(ry+wave)*math.sin(a),z))
for j in range(R-1):
    for i in range(N):
        k=j*N+i;q=j*N+(i+1)%N
        faces.append((k,q,q+N,k+N))
cloth_parts.append(mesh('Diagonal shoulder drape',verts,faces,white))
for ob in cloth_parts:
    solid=ob.modifiers.new('Cotton edge thickness','SOLIDIFY');solid.thickness=.003;solid.offset=0
    apply(ob,solid)

footwear=[]
for sign in [-1,1]:
    footwear.append(ellipsoid('Sandal sole',(sign*.108,-.066,.026),(.071,.149,.020),sole,24,12))
    footwear.append(strand('Open sandal strap',[(sign*.108-.061,-.105,.047),(sign*.108-.035,-.095,.100),(sign*.108,-.088,.115),(sign*.108+.035,-.095,.100),(sign*.108+.061,-.105,.047)],[.020,.023,.024,.023,.020],leather,8,.40))
    footwear.append(strand('Toe post',[(sign*.108,-.156,.045),(sign*.108,-.139,.080),(sign*.108,-.094,.110)],[.006,.009,.012],leather))

armdata=bpy.data.armatures.new('ReferenceSkeleton')
rig=bpy.data.objects.new('ReferenceRig',armdata)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
locations={'Root':(0,0,0),'Hips':(0,0,.94),'Spine':(0,0,.94),'Head':(0,0,1.55)}
parents={'Hips':'Root','Spine':'Hips','Head':'Spine'}
for sign,n in [(1,'L'),(-1,'R')]:
    for name,co,parent in [('UpperArm',(sign*.235,0,1.40),'Spine'),('Forearm',(sign*.292,0,1.12),'UpperArm'+n),('Hand',(sign*.335,-.01,.86),'Forearm'+n),('Thigh',(sign*.108,0,.94),'Hips'),('Shin',(sign*.108,0,.51),'Thigh'+n),('Foot',(sign*.108,0,.10),'Shin'+n)]:
        locations[name+n]=co;parents[name+n]=parent
for name,co in locations.items():
    bone=armdata.edit_bones.new(name);bone.head=co;bone.tail=Vector(co)+Vector((0,0,.08))
    if name in parents:bone.parent=armdata.edit_bones[parents[name]]
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)


def blend(z,at,width,lo,hi):
    t=max(0,min(1,(z-at)/width+.5))
    return {lo:1-t,hi:t}


def skin_weights(v):
    if v.z>1.49:
        return blend(v.z,1.50,.10,'Spine','Head')
    n='L' if v.x>=0 else 'R'
    boundary=.20 if v.z>1.3 else .225
    if abs(v.x)>boundary and .70<v.z<1.45:
        if v.z<.90:return blend(v.z,.87,.07,'Hand'+n,'Forearm'+n)
        return blend(v.z,1.12,.17,'Forearm'+n,'UpperArm'+n)
    if v.z>1.02:return {'Spine':1}
    if v.z>.87:return blend(v.z,.96,.12,'Hips','Spine')
    if v.z<.14:return {'Foot'+n:1}
    return blend(v.z,.51,.19,'Shin'+n,'Thigh'+n)


def cloth_weights(v):
    if v.z>1.04:return {'Spine':1}
    if v.z>.88:return blend(v.z,.96,.16,'Hips','Spine')
    # ponytail: skinned cloth, not simulation; a narrow blended centre permits leg motion.
    left=max(0,min(1,(v.x+.09)/.18))
    leg=blend(v.z,.51,.22,'Shin','Thigh')
    return {bone+n:w*s for bone,w in leg.items() for n,s in [('L',left),('R',1-left)]}


def bind(ob,weights):
    bpy.context.view_layer.update()
    world=ob.matrix_world.copy();ob.parent=rig;ob.matrix_world=world
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
    bpy.context.view_layer.objects.active=ob
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    for vertex in ob.data.vertices:
        ws=weights(vertex.co) if callable(weights) else {weights:1}
        for name,value in ws.items():
            if value>0:
                vg=ob.vertex_groups.get(name) or ob.vertex_groups.new(name=name)
                vg.add([vertex.index],value,'REPLACE')
    mod=ob.modifiers.new('Skin','ARMATURE');mod.object=rig
    ob.select_set(False)


bind(body,skin_weights)
for ob in head_parts+hair_parts:bind(ob,'Head')
for ob in cloth_parts:bind(ob,cloth_weights)
for ob in footwear:bind(ob,'FootL' if ob.location.x>0 or sum(v.co.x for v in ob.data.vertices)>0 else 'FootR')
# Consolidate by material and visibility group, preserving the original rig weights.
buckets={}
for ob in list(rig.children):
    if ob.type!='MESH':continue
    tag='Hair' if ob in hair_parts else 'Footwear' if ob in footwear else 'Body'
    buckets.setdefault((tag,ob.data.materials[0].name),[]).append(ob)
for (tag,material),obs in buckets.items():join(obs,tag+'_'+material.replace(' ','_'))


def pose(name,t=0):
    for bone in rig.pose.bones:
        bone.rotation_mode='XYZ';bone.rotation_euler=(0,0,0);bone.location=(0,0,0)
    def rx(n,a):rig.pose.bones[n].rotation_euler.x=math.radians(a)
    def hips(y,z):rig.pose.bones['Hips'].location=(0,z-.94,-y)
    if name=='Walk':
        for sign,n in [(1,'L'),(-1,'R')]:
            wave=math.sin(t*math.tau)*sign
            rx('Thigh'+n,20*wave);rx('Shin'+n,25*max(0,-wave))
            rx('UpperArm'+n,-14*wave);rx('Forearm'+n,-7)
        hips(0,.94+.009*math.cos(t*math.tau*2))
    elif name=='Rukuk':
        rx('Spine',88);rx('Head',-8)
        for sign,n in [(1,'L'),(-1,'R')]:
            rx('UpperArm'+n,-88);rx('Forearm'+n,72);rx('Hand'+n,-72)
            rig.pose.bones['UpperArm'+n].rotation_euler.z=math.radians(-sign*8)
    elif name=='Sujud':
        hips(.15,.54);rx('Spine',120);rx('Head',25)
        for n in ['L','R']:
            rx('Thigh'+n,-22);rx('Shin'+n,112);rx('Foot'+n,-75)
            rx('UpperArm'+n,-145);rx('Forearm'+n,-58);rx('Hand'+n,-7)
    elif name=='Duduk':
        hips(.27,.24)
        for n in ['L','R']:
            rx('Thigh'+n,-69);rx('Shin'+n,159);rx('Foot'+n,-80);rx('UpperArm'+n,-35)
    elif name=='Takbir':
        for sign,n in [(1,'L'),(-1,'R')]:
            rx('UpperArm'+n,-30);rx('Forearm'+n,-145)
            rig.pose.bones['UpperArm'+n].rotation_euler.z=math.radians(sign*18)
    else:rx('Spine',.35*math.sin(t*math.tau))
    bpy.context.view_layer.update()


rig.animation_data_create()
for name,duration in [('Idle',2),('Walk',1),('Takbir',1),('Rukuk',1),('Duduk',1),('Sujud',1)]:
    action=bpy.data.actions.new(name);action.use_fake_user=True;rig.animation_data.action=action
    for frame in range(1,duration*24+2,2):
        pose(name,(frame-1)/(duration*24))
        for bone in rig.pose.bones:
            bone.keyframe_insert(data_path='location',frame=frame,group=bone.name)
            bone.keyframe_insert(data_path='rotation_euler',frame=frame,group=bone.name)
    track=rig.animation_data.nla_tracks.new();track.name=name
    track.strips.new(name,1,action);track.mute=True
rig.animation_data.action=None;pose('Idle')
scene=bpy.context.scene;scene.render.fps=24
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True)
for ob in rig.children:ob.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(OUT/'avatar-reference.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'avatar-reference.blend'))
triangles=0
for ob in rig.children:
    if ob.type=='MESH':
        ob.data.calc_loop_triangles();triangles+=len(ob.data.loop_triangles)
metadata={'kind':'original procedural reference-led proof','triangles':triangles,'bones':len(rig.pose.bones),'bytes':(OUT/'avatar-reference.glb').stat().st_size,'animations':['Idle','Walk','Takbir','Rukuk','Duduk','Sujud'],'cloth':'skinned, not simulated','reference_match':'approximation, not reconstructed or approved'}
(OUT/'model-report.json').write_text(json.dumps(metadata,indent=2))
print('AVATAR_EXPORTED',json.dumps(metadata),flush=True)
if os.environ.get('JH_RENDER')=='1':
    studio_mat=mat('Studio floor',(.78,.75,.70),1)
    bpy.ops.mesh.primitive_plane_add(size=200)
    bpy.context.object.data.materials.append(studio_mat);bpy.context.object.location.z=-.002
    bpy.ops.object.camera_add();camera=bpy.context.object;scene.camera=camera
    camera.data.type='ORTHO';camera.data.ortho_scale=2.14
    for loc,power,size in [((-3,-4,5),400,4),((3,-2,3),220,4),((1,3,5),450,3)]:
        bpy.ops.object.light_add(type='AREA',location=loc)
        ob=bpy.context.object;ob.data.energy=power;ob.data.shape='DISK';ob.data.size=size
        ob.rotation_euler=(Vector((0,0,1))-ob.location).to_track_quat('-Z','Y').to_euler()
    scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.78,.75,.70,1)
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.55
    scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
    scene.render.resolution_x=600;scene.render.resolution_y=700;scene.render.resolution_percentage=100
    scene.view_settings.view_transform='AgX'
    views={'front':(0,-5,1.05),'side':(5,0,1.05),'back':(0,5,1.05),'three-quarter':(3,-5,1.6)}
    for name,loc in views.items():
        pose('Idle');camera.location=loc
        camera.rotation_euler=(Vector((0,0,.95))-camera.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(OUT/f'{name}.png');bpy.ops.render.render(write_still=True)
    for name in ['Walk','Rukuk','Sujud']:
        pose(name,.25)
        for ob in rig.children:
            if ob.name.startswith('Footwear'):ob.hide_render=name in ['Rukuk','Sujud']
        camera.location=(2.7,-4,1.7)
        camera.rotation_euler=(Vector((0,-.15,.9))-camera.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(OUT/f'pose-{name}.png');bpy.ops.render.render(write_still=True)
    print('AVATAR_RENDERED',flush=True)
