"""Original Jejak Haji avatar. Blender 4.5 LTS, no external assets.

blender --background --python blender/avatar.py
JH_RENDER=1 blender --background --python blender/avatar.py
GLB: metres, feet at zero, faces +Z after glTF export; named rigid pivots
are animated by the game. This is a stylized procedural model, not an
automatic reconstruction of the image concept or a skinned human rig.
"""
import bpy
import math
import os
from pathlib import Path
from mathutils import Vector

OUT = Path(__file__).resolve().parents[1] / 'models'
OUT.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

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

# Lower wrap: closed elliptical shell with restrained vertical fabric folds.
def wrap(name, rows, mat):
    n = 48
    vs, fs = [], []
    for z, rx, ry in rows:
        for i in range(n):
            a = 2*math.pi*i/n
            ripple = 1 + 0.018*math.sin(a*12) + 0.008*math.sin(a*19)
            vs.append((rx*math.cos(a)*ripple, ry*math.sin(a)*ripple, z))
    for j in range(len(rows)-1):
        for i in range(n):
            k=j*n+i; q=j*n+(i+1)%n
            fs.append((k,q,q+n,k+n))
    fs.extend([tuple(reversed(range(n))), tuple((len(rows)-1)*n+i for i in range(n))])
    return mesh(name, vs, fs, mat)

wrap('LowerWrap', [(0.25,.265,.175),(.38,.27,.18),(.67,.27,.185),(.91,.245,.18),(1.06,.235,.17)], white)
ellipsoid('Torso', (0,0,1.19), (.265,.172,.31), white)
ellipsoid('Neck', (0,0,1.49), (.094,.091,.125), skin)

# Draped upper cloth, a continuous shell over both shoulders with a cowl neckline.
n, rows = 64, 10
vs, fs = [], []
for j in range(rows):
    t=j/(rows-1)
    for i in range(n):
        a=2*math.pi*i/n
        front=max(0,-math.sin(a))
        rx=.104+.231*(1-math.exp(-6*t))/(1-math.exp(-6))
        ry=.102*(1-t)+.195*t
        z=1.49*(1-t)+(1.19-.19*front+.055*math.cos(a))*t
        z-=.025*math.sin(t*math.pi*5)*front
        vs.append((rx*math.cos(a),ry*math.sin(a)-.008*front,z))
for j in range(rows-1):
    for i in range(n):
        k=j*n+i; q=j*n+(i+1)%n
        fs.append((k,q,q+n,k+n))
cloth=mesh('ShoulderDrape',vs,fs,white)
sol=cloth.modifiers.new('Cloth thickness','SOLIDIFY'); sol.thickness=.008
curve('WrapOverlap', [(.16,-.156,1.02),(.05,-.184,.83),(-.11,-.174,.58),(-.23,-.095,.29)], .007, fold)

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

# Rigid pivots: deliberately simple and predictable on mobile.
for side, name in [(1,'L'),(-1,'R')]:
    arm=group('Arm'+name,(side*.29,0,1.29),root)
    ellipsoid('UpperArm',(side*.023,0,-.115),(.065,.065,.18),skin,arm)
    ellipsoid('Forearm',(side*.055,-.009,-.335),(.058,.057,.15),skin,arm)
    ellipsoid('Hand',(side*.065,-.014,-.484),(.061,.039,.085),skin,arm)
    ellipsoid('Thumb',(side*.023,-.039,-.468),(.022,.025,.046),skin,arm)
    for finger in range(3):
        curve('Finger',[(side*.065+(finger-1)*.023,-.051,-.49),(side*.065+(finger-1)*.021,-.046,-.54)],.0025,ear,arm)
    leg=group('Leg'+name,(side*.122,0,.77),root)
    ellipsoid('Calf',(0,0,-.43),(.073,.073,.245),skin,leg)
    ellipsoid('Foot',(0,-.05,-.665),(.081,.145,.052),skin,leg)
    ellipsoid('Sole',(0,-.045,-.728),(.092,.158,.029),leather,leg)
    for yy in (-.11,.005):
        curve('SandalBand',[(-.082,yy,-.69),(-.055,yy,-.63),(0,yy,-.615),(.055,yy,-.63),(.082,yy,-.69)],.017,strap,leg)

# Upper-body hinge for bowing; keep each mesh's world transform unchanged.
upper=group('UpperBody',(0,0,1.02),root)
bpy.context.view_layer.update()
for ob in list(root.children):
    if ob==upper or ob.name.startswith(('LowerWrap','WrapOverlap','Leg')): continue
    matrix=ob.matrix_world.copy()
    ob.parent=upper
    ob.matrix_world=matrix

# Convert curves and apply modifiers/scales; preserve pivot transforms.
bpy.ops.object.select_all(action='DESELECT')
for ob in list(root.children_recursive):
    if ob.type in {'MESH','CURVE'}:
        bpy.context.view_layer.objects.active=ob
        ob.select_set(True)
        if ob.type=='CURVE': bpy.ops.object.convert(target='MESH')
        for mod in list(ob.modifiers): bpy.ops.object.modifier_apply(modifier=mod.name)
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        ob.select_set(False)

# Merge by material within each pivot to keep draw calls low.
for parent in [root,upper,head,hg]+[o for o in root.children_recursive if o.name.startswith(('Arm','Leg')) and o.type=='EMPTY']:
    buckets={}
    for ob in list(parent.children):
        if ob.type=='MESH': buckets.setdefault(ob.data.materials[0].name,[]).append(ob)
    for name, obs in buckets.items():
        bpy.ops.object.select_all(action='DESELECT')
        for ob in obs: ob.select_set(True)
        bpy.context.view_layer.objects.active=obs[0]
        bpy.ops.object.join()
        obs[0].name=parent.name+'_'+name

bpy.ops.object.select_all(action='DESELECT')
root.select_set(True)
for ob in root.children_recursive: ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'jemaah-v1.glb'),export_format='GLB',use_selection=True,export_animations=False,export_extras=True)
import base64
# Text source supports GitHub's text-only connector; build.mjs restores the exact GLB.
(OUT/'jemaah-v1.glb.b64').write_text(base64.b64encode((OUT/'jemaah-v1.glb').read_bytes()).decode()+'\n')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'jemaah-v1.blend'))
print('AVATAR_EXPORTED', OUT/'jemaah-v1.glb')

if os.environ.get('JH_RENDER')=='1':
    ground=material('Studio',(0.26,.34,.30))
    bpy.ops.mesh.primitive_plane_add(size=200)
    bpy.context.object.data.materials.append(ground)
    bpy.context.object.location.z=-.005
    bpy.ops.object.camera_add(location=(3,-6,2.65))
    camera=bpy.context.object
    camera.rotation_euler=(Vector((0,0,.99))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type='ORTHO'; camera.data.ortho_scale=2.4
    sc=bpy.context.scene; sc.camera=camera
    for pos,power,size in [((3,-4,5),450,4),((-3,-1,3),220,3),((1,3,4),550,3)]:
        bpy.ops.object.light_add(type='AREA',location=pos)
        l=bpy.context.object; l.data.energy=power; l.data.shape='DISK'; l.data.size=size
        l.rotation_euler=(Vector((0,0,1))-l.location).to_track_quat('-Z','Y').to_euler()
    sc.world.color=(.24,.24,.24)
    sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=32
    sc.cycles.use_denoising=True
    sc.render.resolution_x=800; sc.render.resolution_y=1000; sc.render.resolution_percentage=100
    sc.render.filepath=str(OUT/'jemaah-v1-preview.png')
    bpy.ops.render.render(write_still=True)
