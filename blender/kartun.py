"""Avatar kartun gaya animasi 3D (kepala besar, mata besar, bentuk bulat) untuk Jejak Haji.

Jalankan:  blender -b --python blender/kartun.py
           JH_RENDER=1 blender -b --python blender/kartun.py   # + helaian pratonton
Atau tanpa Blender penuh: python blender/kartun.py (modul bpy 5.x, Python 3.13).

Hasil dalam models/: kartun-lelaki-ihram.glb, kartun-perempuan-telekung.glb,
kartun-lelaki-biasa.glb, kartun-perempuan-biasa.glb (+ kartun-preview.jpg jika JH_RENDER=1).

Rangka 18 tulang dan nama klip SAMA dengan blender/characters.py supaya src/09-character.ts
boleh memuatkannya terus, ditambah klip "Run" (berlari-lari anak / ramal).
Nama bahan Skin*/Outfit*/Scarf* diwarna semula oleh game; mesh Hair_* dan Footwear_*
boleh disembunyikan (bercukur, dalam masjid).

Semua bentuk dibina daripada primitif dalam skrip ini: tiada model, tekstur atau rig pihak ketiga.
Unit meter, tapak kaki di z = 0, menghadap -Y dalam Blender (+Z dalam glTF).
"""
import math
import os
from pathlib import Path

import bpy  # mesti diimport dahulu (modul bpy menambah laluan modul Blender)
from mathutils import Vector

OUT = Path(os.environ.get("JH_OUT") or Path(__file__).resolve().parents[1] / "models")
OUT.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------
#  Kadar badan gaya kartun (±3.5 kepala tinggi; jemaah dewasa ±1.62 m)
# ---------------------------------------------------------------------
HIP_Z = 0.68  # sendi pinggul / tulang Hips
KNEE_Z = 0.36
ANKLE_Z = 0.09
SHOULDER = (0.20, 1.06)  # (x, z)
ELBOW = (0.235, 0.86)
WRIST = (0.25, 0.67)
NECK_Z = 1.14
HEAD_C = 1.385  # pusat kepala
HEAD_R = (0.205, 0.19, 0.235)  # jejari kepala (x, y, z)
# Semua ukuran di atas & dalam build() ialah ukuran reka bentuk; SC mengskalakan seluruh
# watak (bentuk, tulang & anjakan animasi) supaya tinggi ±1.78 m, sama dengan jemaah lain.
SC = 1.1


def lin(hex_rgb):
    """Warna sRGB hex → linear untuk Blender."""
    h = hex_rgb.lstrip("#")
    out = []
    for i in range(3):
        c = int(h[i * 2 : i * 2 + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return tuple(out)


def material(name, hex_rgb, roughness=0.6):
    m = bpy.data.materials.new(name)
    col = lin(hex_rgb)
    m.diffuse_color = (*col, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*col, 1)
    p.inputs["Roughness"].default_value = roughness
    return m


def build(female, pilgrim):
    skin = material("Skin", "#d99a6c", 0.55)
    ear = material("SkinShade", "#b9734e", 0.6)
    blush = material("SkinBlush", "#e58f7a", 0.6)
    white = material("Ihram", "#f2efe6", 0.75)
    seam = material("ClothSeam", "#d8d3c6", 0.8)
    hair = material("Hair", "#2a1d16", 0.45)
    eye_white = material("EyeWhite", "#fbfaf6", 0.2)
    iris = material("Iris", "#6b4226", 0.25)
    pupil = material("Pupil", "#0d0907", 0.15)
    glint = material("EyeGlint", "#ffffff", 0.05)
    lip = material("Lip", "#a4513f", 0.5)
    sandal = material("Sandal", "#5b3a24", 0.7)
    strap = material("SandalStrap", "#7b5233", 0.7)
    sock = material("Sock", "#f4f1ea", 0.8)
    outfit = white if pilgrim else material("Outfit", "#2f6f61", 0.7)
    trousers = material("OutfitTrousers", "#e9e4d8", 0.75) if not pilgrim and not female else outfit
    scarf = white if pilgrim else material("Scarf", "#7fa79a", 0.7)

    parts = []  # (objek, fungsi_berat atau nama tulang, tag)

    def finish(ob, mat, weights, tag="Body"):
        ob.data.materials.append(mat)
        for p in ob.data.polygons:
            p.use_smooth = True
        parts.append((ob, weights, tag))
        return ob

    def ellipsoid(name, pos, scale, mat, weights, seg=24, rings=14, tag="Body", rot=(0, 0, 0)):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, location=tuple(c * SC for c in pos), rotation=rot)
        ob = bpy.context.object
        ob.name = name
        ob.scale = tuple(c * SC for c in scale)
        return finish(ob, mat, weights, tag)

    def mesh_obj(name, verts, faces):
        me = bpy.data.meshes.new(name)
        me.from_pydata([tuple(c * SC for c in v) for v in verts], [], faces)  # skala SC
        me.update()
        ob = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(ob)
        return ob

    def loft(name, rings, mat, weights, tag="Body", n=28, cap=True):
        """Tiub licin daripada senarai (x, y, z, rx, ry); hujung ditutup."""
        vs, fs = [], []
        for x, y, z, rx, ry in rings:
            for i in range(n):
                a = i * 2 * math.pi / n
                vs.append((x + rx * math.cos(a), y + ry * math.sin(a), z))
        for j in range(len(rings) - 1):
            for i in range(n):
                k = j * n + i
                q = j * n + (i + 1) % n
                fs.append((k, q, q + n, k + n))
        if cap:
            fs.append(tuple(reversed(range(n))))
            fs.append(tuple((len(rings) - 1) * n + i for i in range(n)))
        return finish(mesh_obj(name, vs, fs), mat, weights, tag)

    def limb(name, a, b, ra, rb, mat, weights, tag="Body", steps=6):
        """Anggota bulat dari titik a ke b (bujur di hujung)."""
        ax, ay, az = a
        bx, by, bz = b
        rings = []
        for i in range(steps + 1):
            t = i / steps
            r = ra + (rb - ra) * t
            bulge = 1 + 0.08 * math.sin(t * math.pi)
            rings.append((ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t, r * bulge, r * bulge * 0.95))
        ob = loft(name, rings, mat, weights, tag)
        ellipsoid(name + "Cap", a, (ra, ra, ra), mat, weights, 16, 10, tag=tag)
        ellipsoid(name + "Cap", b, (rb, rb, rb), mat, weights, 16, 10, tag=tag)
        return ob

    def curve(name, points, radius, mat, weights, tag="Body"):
        cu = bpy.data.curves.new(name, "CURVE")
        cu.dimensions = "3D"
        cu.resolution_u = 6
        cu.bevel_depth = radius * SC
        cu.bevel_resolution = 2
        cu.use_fill_caps = True
        sp = cu.splines.new("BEZIER")
        sp.bezier_points.add(len(points) - 1)
        for bp, co in zip(sp.bezier_points, points):
            bp.co = tuple(c * SC for c in co)
            bp.handle_left_type = bp.handle_right_type = "AUTO"
        ob = bpy.data.objects.new(name, cu)
        bpy.context.collection.objects.link(ob)
        bpy.ops.object.select_all(action="DESELECT")
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.convert(target="MESH")
        ob = bpy.context.object
        return finish(ob, mat, weights, tag)

    def blend(z, at, width, lo, hi):
        t = max(0.0, min(1.0, (z - at) / width + 0.5))
        return {lo: 1 - t, hi: t}

    # ------------------------------------------------------------------
    #  Kepala: besar & bulat, pipi tembam, mata besar dengan kilauan
    # ------------------------------------------------------------------
    hz = HEAD_C
    ellipsoid("Head", (0, 0, hz), HEAD_R, skin, "Head", 40, 26)
    ellipsoid("Cheeks", (0, -0.035, hz - 0.085), (0.19, 0.16, 0.13), skin, "Head", 32, 18)
    for s in (-1, 1):
        x = s * 0.085
        ellipsoid("EyeWhite", (x, -0.165, hz + 0.02), (0.062, 0.032, 0.072), eye_white, "Head", 24, 16)
        ellipsoid("Iris", (x * 0.97, -0.193, hz + 0.012), (0.04, 0.012, 0.046), iris, "Head", 20, 12)
        ellipsoid("Pupil", (x * 0.97, -0.203, hz + 0.01), (0.021, 0.006, 0.026), pupil, "Head", 16, 10)
        ellipsoid("EyeGlint", (x * 0.97 - 0.013, -0.21, hz + 0.034), (0.011, 0.004, 0.012), glint, "Head", 10, 6)
        ellipsoid("EyeGlint", (x * 0.97 + 0.012, -0.209, hz - 0.01), (0.005, 0.003, 0.005), glint, "Head", 8, 6)
        # kelopak atas: separuh atas mata ditutup sedikit untuk wajah mesra
        ellipsoid("Lid", (x, -0.158, hz + 0.058), (0.068, 0.036, 0.032), skin, "Head", 20, 10)
        ellipsoid("Blush", (s * 0.13, -0.15, hz - 0.075), (0.035, 0.012, 0.022), blush, "Head", 12, 8)
        ellipsoid("Ear", (s * 0.2, 0.005, hz - 0.01), (0.03, 0.045, 0.06), skin, "Head", 16, 10)
        ellipsoid("EarInside", (s * 0.214, -0.01, hz - 0.01), (0.012, 0.025, 0.035), ear, "Head", 12, 8)
        # kening melengkung, hujung dalam sedikit terangkat (wajah mesra, bukan marah)
        brow_z = hz + 0.105
        curve("Brow", [(x - s * 0.048, -0.176, brow_z + 0.002), (x, -0.19, brow_z + 0.012), (x + s * 0.048, -0.172, brow_z - 0.012)], 0.012 if not female else 0.008, hair, "Head", "Hair" if not female else "Body")
    ellipsoid("Nose", (0, -0.205, hz - 0.03), (0.034, 0.03, 0.032), skin, "Head", 20, 12)
    curve("Smile", [(-0.06, -0.185, hz - 0.115), (0, -0.208, hz - 0.135), (0.06, -0.185, hz - 0.115)], 0.0075, lip, "Head")
    ellipsoid("LowerLip", (0, -0.198, hz - 0.142), (0.026, 0.01, 0.009), lip, "Head", 12, 8)
    if not female:
        # rambut pendek berjambul & janggut kemas
        verts, faces = [], []
        n, rows = 36, 10
        for j in range(rows):
            p = 0.02 + (1.32 + 0.18) * j / (rows - 1)
            for i in range(n):
                a = i * 2 * math.pi / n
                front = max(0.0, -math.sin(a))  # bahagian hadapan dipendekkan
                pp = min(p, 1.5 - 0.42 * front)
                verts.append((0.218 * math.sin(pp) * math.cos(a), 0.2 * math.sin(pp) * math.sin(a) + 0.008, hz + 0.248 * math.cos(pp)))
        for j in range(rows - 1):
            for i in range(n):
                k = j * n + i
                q = j * n + (i + 1) % n
                faces.append((k, q, q + n, k + n))
        finish(mesh_obj("HairCap", verts, faces), hair, "Head", "Hair")
        ellipsoid("Quiff", (0.03, -0.14, hz + 0.19), (0.11, 0.07, 0.05), hair, "Head", 18, 10, tag="Hair", rot=(0.35, 0, -0.25))
        # janggut pendek kemas: isipadu bulat di dagu & rahang (bukan tiub)
        ellipsoid("Beard", (0, -0.1, hz - 0.185), (0.165, 0.11, 0.075), hair, "Head", 28, 14)
        for s in (-1, 1):
            ellipsoid("Beard", (s * 0.15, -0.06, hz - 0.12), (0.05, 0.08, 0.075), hair, "Head", 16, 10)
        curve("Moustache", [(-0.055, -0.196, hz - 0.098), (0, -0.212, hz - 0.09), (0.055, -0.196, hz - 0.098)], 0.011, hair, "Head")
    ellipsoid("Neck", (0, 0.0, NECK_Z + 0.02), (0.07, 0.068, 0.07), skin, "Head", 16, 10)

    # ------------------------------------------------------------------
    #  Badan: bentuk "kacang" (pinggul lebar, dada bulat), tangan sarung (4 jari)
    # ------------------------------------------------------------------
    torso_mat = outfit if (female or not pilgrim) else white
    torso_w = lambda v: blend(v.z, 0.8, 0.14, "Hips", "Spine")
    sx = 0.92 if female else 1.0
    loft(
        "Torso",
        [
            (0, 0, 0.6, 0.17 * sx, 0.13),
            (0, 0, 0.7, 0.185 * sx, 0.145),
            (0, 0, 0.82, 0.18 * sx, 0.14),
            (0, 0, 0.95, 0.19 * sx, 0.145),
            (0, 0, 1.04, 0.2 * sx, 0.14),
            (0, 0, 1.1, 0.15 * sx, 0.11),
            (0, 0, 1.15, 0.075, 0.07),
        ],
        torso_mat,
        torso_w,
    )
    for s, n in ((1, "L"), (-1, "R")):
        sh = (s * SHOULDER[0], 0, SHOULDER[1])
        el = (s * ELBOW[0], -0.005, ELBOW[1])
        wr = (s * WRIST[0], -0.01, WRIST[1])
        upper_mat = outfit if (female or not pilgrim) else white  # ihram menutup bahu & lengan atas
        fore_mat = outfit if (female or not pilgrim) else skin
        limb("UpperArm" + n, sh, el, 0.062, 0.052, upper_mat, "UpperArm" + n)
        limb("Forearm" + n, el, wr, 0.05, 0.044, fore_mat, "Forearm" + n)
        # tangan sarung: tapak, 3 jari & ibu jari
        hx = s * WRIST[0]
        ellipsoid("Palm" + n, (hx, -0.015, WRIST[1] - 0.06), (0.045, 0.03, 0.055), skin, "Hand" + n, 18, 12)
        for i in range(3):
            fx = hx + s * (i - 1) * 0.026
            ellipsoid("Finger" + n, (fx, -0.02, WRIST[1] - 0.122 + abs(i - 1) * 0.008), (0.014, 0.017, 0.034), skin, "Hand" + n, 12, 8)
        ellipsoid("Thumb" + n, (hx - s * 0.042, -0.035, WRIST[1] - 0.05), (0.016, 0.018, 0.03), skin, "Hand" + n, 12, 8, rot=(0, s * 0.5, 0))
        # kaki
        hip = (s * 0.09, 0, HIP_Z)
        knee = (s * 0.09, -0.01, KNEE_Z)
        ank = (s * 0.09, 0, ANKLE_Z + 0.02)
        leg_mat = trousers if not pilgrim and not female else (skin if not female else sock)
        limb("Thigh" + n, hip, knee, 0.08, 0.064, leg_mat, "Thigh" + n)
        limb("Shin" + n, knee, ank, 0.062, 0.05, leg_mat, "Shin" + n)
        foot_mat = sock if female else skin
        ellipsoid("Foot" + n, (s * 0.09, -0.06, 0.05), (0.06, 0.115, 0.048), foot_mat, "Foot" + n, 20, 12)
        if not female:
            ellipsoid("Sandal" + n, (s * 0.09, -0.06, 0.012), (0.07, 0.13, 0.014), sandal, "Foot" + n, 20, 8, tag="Footwear")
            curve("SandalStrap" + n, [(s * 0.09 - 0.058, -0.1, 0.03), (s * 0.09, -0.11, 0.085), (s * 0.09 + 0.058, -0.1, 0.03)], 0.012, strap, "Foot" + n, "Footwear")

    # ------------------------------------------------------------------
    #  Pakaian
    # ------------------------------------------------------------------
    def lower_weights(v):
        n = "L" if v.x >= 0 else "R"
        if v.z > HIP_Z + 0.06:
            ws = blend(v.z, HIP_Z + 0.1, 0.1, "Hips", "Spine")
            return ws
        ws = blend(v.z, KNEE_Z, 0.16, "Shin" + n, "Thigh" + n)
        # hujung kain yang lebar tidak mengikut betis sepenuhnya: semasa sujud/duduk betis rata
        # di lantai, jadi kain separa mengikut peha supaya melengkung di atas lantai
        sh = ws.get("Shin" + n, 0.0)
        if sh > 0.6:
            ws = {"Shin" + n: 0.6, "Thigh" + n: ws.get("Thigh" + n, 0.0) + sh - 0.6}
        if v.z < 0.24:
            # kain labuh: hujung mengikut kaki (hampir tegak ketika sujud) supaya kekal di atas lantai
            f = min(1.0, (0.24 - v.z) / 0.14)
            ws = {k: w * (1 - f) for k, w in ws.items()}
            ws["Foot" + n] = ws.get("Foot" + n, 0.0) + f
        if v.z > HIP_Z - 0.08:
            ws = blend(v.z, HIP_Z, 0.12, "Thigh" + n, "Hips")
        if abs(v.x) < 0.06:  # jahitan tengah dikongsi kedua-dua kaki supaya kain tidak koyak
            t = (v.x / 0.06 + 1) / 2
            out = {}
            for k, w in ws.items():
                if k in ("Hips", "Spine"):
                    out[k] = out.get(k, 0) + w
                else:
                    out[k[:-1] + "L"] = out.get(k[:-1] + "L", 0) + w * t
                    out[k[:-1] + "R"] = out.get(k[:-1] + "R", 0) + w * (1 - t)
            return out
        return ws

    if pilgrim and not female:
        # kain ihram bawah (izar) hingga betis & kain atas (rida') di kedua-dua bahu
        rings = []
        for i in range(13):
            z = 0.22 + (0.86 - 0.22) * i / 12
            flare = 0.215 + 0.03 * (1 - i / 12)
            rings.append((0, 0, z, flare, flare * 0.78))
        loft("LowerIhram", rings, white, lower_weights)
        loft(
            "UpperIhram",
            [(0, 0, 0.8, 0.2, 0.155), (0, 0, 0.92, 0.205, 0.158), (0, 0, 1.02, 0.215, 0.155), (0, 0, 1.09, 0.17, 0.125), (0, 0, 1.14, 0.09, 0.08)],
            white,
            torso_w,
        )
        for s, n in ((1, "L"), (-1, "R")):
            ellipsoid("ShoulderWrap" + n, (s * 0.19, 0, 1.04), (0.1, 0.12, 0.085), white, "UpperArm" + n, 20, 12)
        for i in range(4):
            curve("IhramFold", [(-0.18, -0.13, 0.86 + i * 0.05), (0, -0.158, 0.92 + i * 0.045), (0.18, -0.12, 1.0 + i * 0.03)], 0.008, seam, "Spine")
    elif not female:
        # baju Melayu panjang & kopiah
        loft("Tunic", [(0, 0, 0.5, 0.2, 0.155), (0, 0, 0.62, 0.198, 0.152), (0, 0, 0.75, 0.19, 0.15)], outfit, lower_weights)
        for i in range(3):
            ellipsoid("Button", (0, -0.152, 0.95 + i * 0.05), (0.008, 0.004, 0.008), seam, "Spine", 8, 6)
        # kopiah menutup ubun-ubun (lebih tinggi daripada rambut supaya rambut tidak tembus)
        loft("Kopiah", [(0, 0.008, hz + 0.105, 0.198, 0.186), (0, 0.008, hz + 0.2, 0.192, 0.18), (0, 0.008, hz + 0.275, 0.18, 0.17)], material("Kopiah", "#f4f1ea", 0.8), "Head")
    if female:
        # tudung / telekung bulat menutup kepala dengan bukaan muka bujur
        vs, fs = [], []
        n, rows = 44, 16
        for j in range(rows):
            # profil elips dari bukaan muka (y = -0.16) hingga belakang kepala (y = 0.265),
            # sentiasa lebih besar daripada kepala supaya aurat tertutup ketika rukuk & sujud
            t = j / (rows - 1)
            y = -0.16 + 0.425 * t
            r = math.sqrt(max(0.0, 1 - ((y - 0.02) / 0.246) ** 2))
            for i in range(n):
                a = i * 2 * math.pi / n
                vs.append((0.232 * r * math.cos(a), y, hz + 0.012 + 0.262 * r * math.sin(a)))
        for j in range(rows - 1):
            for i in range(n):
                k = j * n + i
                q = j * n + (i + 1) % n
                fs.append((k, q, q + n, k + n))
        fs.append(tuple((rows - 1) * n + i for i in range(n)))
        finish(mesh_obj("Hood", vs, fs), scarf, "Head")
        # jubah telekung / tudung labuh menutup bahu & dada
        loft(
            "Cape",
            [(0, 0, 0.78, 0.3, 0.205), (0, 0, 0.9, 0.3, 0.205), (0, 0, 1.0, 0.295, 0.2), (0, 0, 1.08, 0.28, 0.19), (0, 0, 1.15, 0.21, 0.165), (0, 0, 1.2, 0.13, 0.125)],
            scarf,
            lambda v: blend(v.z, 1.12, 0.1, "Spine", "Head"),
        )
        rings = []
        for i in range(15):
            z = 0.03 + (0.8 - 0.03) * i / 14
            r = 0.255 - 0.06 * (i / 14)
            rings.append((0, 0, z, r, r * 0.74))
        loft("Skirt", rings, white if pilgrim else outfit, lower_weights)

    # ------------------------------------------------------------------
    #  Rangka (18 tulang, nama & paksi sama dengan characters.py)
    # ------------------------------------------------------------------
    arm = bpy.data.armatures.new("HumanSkeleton")
    rig = bpy.data.objects.new("JemaahRig", arm)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    eb = {}

    def bone(name, loc, parent=None):
        b = arm.edit_bones.new(name)
        b.head = Vector(loc) * SC
        b.tail = Vector(loc) * SC + Vector((0, 0, 0.08 * SC))
        if parent:
            b.parent = eb[parent]
        eb[name] = b

    bone("Root", (0, 0, 0))
    bone("Hips", (0, 0, HIP_Z), "Root")
    bone("Spine", (0, 0, HIP_Z + 0.02), "Hips")
    bone("Head", (0, 0, NECK_Z), "Spine")
    for s, n in ((1, "L"), (-1, "R")):
        bone("UpperArm" + n, (s * SHOULDER[0], 0, SHOULDER[1]), "Spine")
        bone("Forearm" + n, (s * ELBOW[0], 0, ELBOW[1]), "UpperArm" + n)
        bone("Hand" + n, (s * WRIST[0], -0.01, WRIST[1]), "Forearm" + n)
        bone("Thigh" + n, (s * 0.09, 0, HIP_Z - 0.02), "Hips")
        bone("Shin" + n, (s * 0.09, 0, KNEE_Z), "Thigh" + n)
        bone("Foot" + n, (s * 0.09, 0, ANKLE_Z), "Shin" + n)
        bone("Toe" + n, (s * 0.09, -0.11, 0.04), "Foot" + n)
    bpy.ops.object.mode_set(mode="OBJECT")

    # ------------------------------------------------------------------
    #  Ikat setiap mesh pada rangka dengan berat bucu yang dinormalkan
    # ------------------------------------------------------------------
    for ob, weights, tag in parts:
        bpy.ops.object.select_all(action="DESELECT")
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        for v in ob.data.vertices:
            # fungsi berat menggunakan ukuran reka bentuk (sebelum SC)
            ws = weights(v.co / SC) if callable(weights) else {weights: 1.0}
            tot = sum(ws.values()) or 1.0
            for name, w in ws.items():
                if w <= 0:
                    continue
                vg = ob.vertex_groups.get(name) or ob.vertex_groups.new(name=name)
                vg.add([v.index], w / tot, "REPLACE")
        ob.parent = rig
        mod = ob.modifiers.new("Skin", "ARMATURE")
        mod.object = rig
        ob["jh_tag"] = tag
    # gabungkan mengikut (tag, bahan) supaya sedikit panggilan lukisan
    buckets = {}
    for ob in [p[0] for p in parts]:
        key = (ob["jh_tag"], ob.data.materials[0].name)
        buckets.setdefault(key, []).append(ob)
    for (tag, mat), obs in buckets.items():
        bpy.ops.object.select_all(action="DESELECT")
        for ob in obs:
            ob.select_set(True)
        bpy.context.view_layer.objects.active = obs[0]
        if len(obs) > 1:
            bpy.ops.object.join()
        obs[0].name = tag + "_" + mat
        for p in obs[0].data.polygons:
            p.use_smooth = True
    return rig


# ---------------------------------------------------------------------
#  Animasi: prinsip kartun (lantunan, ayunan bertentangan, kelewatan kepala)
# ---------------------------------------------------------------------
def pose(rig, name, t=0.0):
    pb = rig.pose.bones
    for b in pb:
        b.rotation_mode = "XYZ"
        b.rotation_euler = (0, 0, 0)
        b.location = (0, 0, 0)

    def rx(n, v):
        pb[n].rotation_euler.x = math.radians(v)

    def ry(n, v):
        pb[n].rotation_euler.y = math.radians(v)

    def rz(n, v):
        pb[n].rotation_euler.z = math.radians(v)

    def hips(back, z, side=0.0):
        # lokasi tulang Hips dalam ruang tulang: x = sisi, y = menegak, z = -hadapan
        pb["Hips"].location = (side * SC, (z - HIP_Z) * SC, -back * SC)

    TAU = 2 * math.pi
    if name in ("Walk", "Run"):
        run = name == "Run"
        swing = 42 if run else 26
        for s, n in ((1, "L"), (-1, "R")):
            ph = t * TAU + (0 if s == 1 else math.pi)
            w = math.sin(ph)
            # kaki: sudut positif = ke belakang. Peha bergerak ke hadapan apabila cos(ph) < 0,
            # jadi lutut dibengkokkan pada fasa itu (paling bengkok semasa melintas, ph = PI)
            rx("Thigh" + n, swing * w - (8 if run else 0))
            lift = max(0.0, -math.cos(ph))
            rx("Shin" + n, (85 if run else 42) * lift ** 1.5 + 4)
            # tolak jari kaki di hujung fasa sokong, tumit dahulu ketika kaki di hadapan
            rx("Foot" + n, -25 * max(0.0, math.sin(ph)) * lift + 10 * max(0.0, -math.sin(ph)))
            # tangan berayun bertentangan dengan kaki, siku sedikit bengkok
            rx("UpperArm" + n, -(swing * 0.95) * w)
            rx("Forearm" + n, -(70 if run else 18) - (20 if run else 14) * max(0.0, -w))
            rz("UpperArm" + n, -s * (10 if run else 7))
        # lantunan: paling rendah ketika kaki menyentuh lantai (t = 0.25, 0.75), tinggi ketika melintas
        bounce = (0.045 if run else 0.028) * math.cos(2 * t * TAU)
        hips(0, HIP_Z + bounce + (-0.02 if run else 0), 0.012 * math.sin(t * TAU))
        ry("Hips", 7 * math.sin(t * TAU))  # pinggul berpusing
        ry("Spine", -10 * math.sin(t * TAU))  # bahu berpusing bertentangan
        rz("Spine", 2.5 * math.sin(t * TAU))
        rx("Spine", 12 if run else 3)
        rx("Head", (-8 if run else -2) + 3 * math.sin(2 * t * TAU - 0.8))  # kepala lewat sedikit
        ry("Head", 4 * math.sin(t * TAU))
    elif name == "Idle":
        br = math.sin(t * TAU)
        rx("Spine", 1.5 * br)
        hips(0, HIP_Z - 0.004 * (1 + br), 0.01 * math.sin(t * TAU * 0.5))
        rz("Hips", 1.5 * math.sin(t * TAU * 0.5))
        for s, n in ((1, "L"), (-1, "R")):
            rz("UpperArm" + n, -s * (5 + 1.5 * br))
            rx("Forearm" + n, -10)
        ry("Head", 10 * math.sin(t * TAU * 0.5))
        rx("Head", -2 + 2 * br)
    elif name == "Rukuk":
        rx("Spine", 86)
        rx("Head", -14)
        hips(0.06, HIP_Z)
        for s, n in ((1, "L"), (-1, "R")):
            rx("UpperArm" + n, -78)
            rx("Forearm" + n, -6)
            rz("UpperArm" + n, -s * 6)
    elif name in ("Duduk", "Salam"):
        hips(0.2, 0.17)
        rx("Spine", 8)  # badan condong sedikit ke hadapan, mata memandang tempat sujud
        rx("Head", 4)
        for s, n in ((1, "L"), (-1, "R")):
            rx("Thigh" + n, -72)
            rx("Shin" + n, 160)
            rx("Foot" + n, -82)
            rx("UpperArm" + n, -32)
            rx("Forearm" + n, -8)
        if name == "Salam":
            ry("Head", 50 * math.sin(t * TAU))
    elif name == "Sujud":
        # kepala kartun besar: dahi (bukan ubun-ubun) mencecah lantai. Badan 100°, kepala +10°
        # (muka menghadap lantai), leher ±0.26 m; lutut, kaki & tapak tangan di lantai.
        hips(0.12, 0.317)
        rx("Spine", 100)
        rx("Head", 10)
        for s, n in ((1, "L"), (-1, "R")):
            rx("Thigh" + n, -28)
            rx("Shin" + n, 118)
            rx("Foot" + n, -78)
            rx("UpperArm" + n, -120)
            rx("Forearm" + n, -50)
            rz("UpperArm" + n, -s * 10)
    elif name == "Takbir":
        for s, n in ((1, "L"), (-1, "R")):
            rx("UpperArm" + n, -28)
            rx("Forearm" + n, -150)
            rz("UpperArm" + n, s * 20)
    elif name in ("Bersedekap", "Groom"):
        for s, n in ((1, "L"), (-1, "R")):
            rx("UpperArm" + n, -22)
            rx("Forearm" + n, -100)
            rz("Forearm" + n, -s * 55)
        if name == "Groom":
            rx("ForearmR", -100 + 14 * math.sin(t * TAU))
    elif name == "Throw":
        rx("UpperArmR", -155 + 105 * t)
        rx("ForearmR", -70 + 70 * t)
        rx("Spine", -6 + 14 * t)
    elif name == "Sleep":
        hips(0, 0.13)
        rx("Hips", -90)
    bpy.context.view_layer.update()


CLIPS = {"Idle": 4, "Walk": 1.0, "Run": 0.6, "Takbir": 1, "Bersedekap": 1, "Rukuk": 1, "Duduk": 1, "Sujud": 1, "Salam": 3, "Groom": 2, "Throw": 1, "Sleep": 1}


def animate(rig):
    rig.animation_data_create()
    for name, dur in CLIPS.items():
        action = bpy.data.actions.new(name)
        action.use_fake_user = True
        rig.animation_data.action = action
        end = round(dur * 24) + 1
        for frame in range(1, end + 1, 2 if name != "Run" else 1):
            pose(rig, name, (frame - 1) / (end - 1))
            for b in rig.pose.bones:
                b.keyframe_insert(data_path="location", frame=frame, group=b.name)
                b.keyframe_insert(data_path="rotation_euler", frame=frame, group=b.name)
        track = rig.animation_data.nla_tracks.new()
        track.name = name
        track.strips.new(name, 1, action)
        track.mute = True
    rig.animation_data.action = None
    pose(rig, "Idle")


# ---------------------------------------------------------------------
#  Helaian pratonton (Cycles)
# ---------------------------------------------------------------------
def preview(rig, variant):
    sc = bpy.context.scene
    if "Studio" not in bpy.data.objects:
        bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, -0.005))
        bpy.context.object.name = "Studio"
        bpy.context.object.data.materials.append(material("StudioMat", "#9fb5ac", 0.9))
        bpy.ops.object.camera_add(location=(2.2, -3.6, 1.35))
        cam = bpy.context.object
        cam.name = "PreviewCam"
        cam.rotation_euler = (Vector((0, 0, 0.8)) - cam.location).to_track_quat("-Z", "Y").to_euler()
        cam.data.type = "ORTHO"
        cam.data.ortho_scale = 2.0
        sc.camera = cam
        for loc, power, size in (((2.5, -3, 4), 380, 3), ((-3, -1.5, 2.5), 160, 4), ((0.5, 3, 3.5), 420, 3)):
            bpy.ops.object.light_add(type="AREA", location=loc)
            o = bpy.context.object
            o.data.energy = power
            o.data.size = size
            o.rotation_euler = (Vector((0, 0, 1)) - o.location).to_track_quat("-Z", "Y").to_euler()
        world = bpy.data.worlds.new("W") if not sc.world else sc.world
        sc.world = world
        world.color = (0.32, 0.34, 0.33)
        sc.render.engine = "CYCLES"
        sc.cycles.device = "CPU"
        sc.cycles.samples = 24
        sc.cycles.use_denoising = True
        sc.render.resolution_x = sc.render.resolution_y = 420
        sc.view_settings.view_transform = "AgX" if "AgX" in [i.identifier for i in sc.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
    shots = []
    for name, t in (("Idle", 0.2), ("Walk", 0.12), ("Run", 0.15), ("Takbir", 0), ("Rukuk", 0), ("Sujud", 0)):
        pose(rig, name, t)
        path = OUT / f"_kartun-{variant}-{name}.png"
        sc.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        shots.append((name, path))
    return shots


VARIANTS = [("lelaki-ihram", False, True), ("perempuan-telekung", True, True), ("lelaki-biasa", False, False), ("perempuan-biasa", True, False)]
render = os.environ.get("JH_RENDER") == "1"
sheet = []
for variant, female, pilgrim in VARIANTS:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    rig = build(female, pilgrim)
    animate(rig)
    sc = bpy.context.scene
    sc.render.fps = 24
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    for ob in rig.children:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = rig
    path = OUT / f"kartun-{variant}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        use_selection=True,
        export_animations=True,
        export_animation_mode="NLA_TRACKS",
        export_force_sampling=True,
        export_draco_mesh_compression_enable=False,
    )
    print("KARTUN_EXPORTED", variant, path.stat().st_size, flush=True)
    if os.environ.get("JH_BLEND") == "1":
        bpy.ops.wm.save_as_mainfile(filepath=str(OUT / f"kartun-{variant}.blend"), compress=True)
    if render:
        sheet.append((variant, preview(rig, variant)))
if sheet:
    try:
        from PIL import Image, ImageDraw

        cols = len(sheet[0][1])
        W = 300
        img = Image.new("RGB", (W * cols, (W + 26) * len(sheet)), (232, 236, 233))
        d = ImageDraw.Draw(img)
        for r, (variant, shots) in enumerate(sheet):
            for c, (name, p) in enumerate(shots):
                img.paste(Image.open(p).convert("RGB").resize((W, W)), (c * W, r * (W + 26)))
                d.text((c * W + 8, r * (W + 26) + W + 6), f"{variant} / {name}", fill=(20, 60, 50))
                p.unlink()
        img.save(OUT / "kartun-preview.jpg", quality=85)
    except ImportError:
        print("Pillow tiada: render individu disimpan sebagai _kartun-*.png", flush=True)
print("KARTUN_DONE", flush=True)
