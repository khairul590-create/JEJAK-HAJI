# =====================================================================
#  JEJAK HAJI — Model Kaabah untuk paparan 3D (Blender 4.2+ / 5.x)
#
#  Cara guna:
#    blender --background --python blender/kaabah.py
#  atau buka Blender → tab Scripting → Open → kaabah.py → Run Script.
#
#  Hasil (dalam folder models/ repo, atau folder JH_OUT jika ditetapkan):
#    kaabah.glb          model untuk game (didaftar dalam MODELS3D)
#    kaabah.blend        fail sumber Blender (tekstur dibungkus)
#    kaabah-render.jpg   render Cycles untuk pratonton (jika JH_RENDER=1)
#
#  Skala: dibina terus dalam unit game (1 unit = 10 px peta 2D). Kaabah
#  sebenar (±13 m tinggi) dikecilkan ±0.66 supaya sepadan dengan peta
#  tawaf game: tapak 8.2 × 8.2, tinggi 8.6. Paksi: +X timur, +Y utara.
#
#  Tekstur dilukis dengan numpy sahaja (tersedia dalam Blender). Kaligrafi
#  pada hizam dan qanadil ialah corak hiasan gaya kaligrafi, bukan teks
#  ayat sebenar, supaya tiada ayat al-Quran tersalah tulis.
# =====================================================================
import math
import os
import sys

import bpy  # mesti diimport sebelum bmesh (modul bpy menambah laluan modul Blender)
import bmesh
import numpy as np

# ---------------------------------------------------------------------
#  Ukuran (unit game)
# ---------------------------------------------------------------------
S = 8.2  # sisi tapak
H = 8.6  # tinggi
D = S / math.sqrt(2)  # jarak pusat → penjuru (5.8)
HIZ_Y = 6.0  # pusat hizam (tali pinggang emas)
HIZ_H = 0.62
WHITE0, WHITE1 = 0.65, 2.0  # kain putih musim haji (kiswah dinaikkan)
DOOR_W, DOOR_H, DOOR_Y = 1.25, 2.05, 1.4  # pintu: lebar, tinggi, jarak dari lantai
DOOR_C = 2.0  # pusat pintu diukur dari penjuru timur (Hajarul Aswad)
HIJR_C = (-2.9, 2.9)  # pusat Hijir Ismail (sama dengan game)
HIJR_RI, HIJR_RO, HIJR_H = 3.85, 4.3, 1.0
HIJR_A0, HIJR_A1 = 75.0, 195.0  # lengkok dari utara ke barat (darjah)
# Jemaah dalam game berskala sebenar, jadi Hajarul Aswad diletak hampir paras sebenar (±1.5 m)
HAJAR_Z = 1.3

TEX = 1024  # piksel bagi setiap dinding (atlas 2048 × 2048)
OUT = os.environ.get("JH_OUT") or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if "__file__" in globals() else os.getcwd(), "models")
RENDER = os.environ.get("JH_RENDER") == "1"
rng = np.random.default_rng(1446)

# Penjuru (Blender XY) dan dinding: (nama, penjuru kiri, penjuru kanan) dilihat dari luar
CORNER = {"E": (D, 0.0), "N": (0.0, D), "W": (-D, 0.0), "S": (0.0, -D)}
WALLS = [("NE", "E", "N"), ("NW", "N", "W"), ("SW", "W", "S"), ("SE", "S", "E")]
QUAD = {"NE": (0, 1), "NW": (1, 1), "SE": (0, 0), "SW": (1, 0)}  # (lajur, baris) dalam atlas, baris 1 = atas


# =====================================================================
#  Alat lukisan numpy (warna sRGB 0–1, imej [baris, lajur, 3], baris 0 = atas)
# =====================================================================
def smooth_mask(d, w):
    """Topeng antialias: 1 di dalam (d < 0), pudar dalam lebar w piksel."""
    return np.clip(0.5 - d / w, 0.0, 1.0)


class Canvas:
    def __init__(self, w, h, wm, hm):
        self.img = np.zeros((h, w, 3), np.float32)
        self.w, self.h = w, h
        self.sx, self.sy = w / wm, h / hm  # piksel per meter
        self.hm = hm

    def px(self, x, y):
        """meter (x dari kiri, y dari bawah) → piksel (lajur, baris)."""
        return x * self.sx, (self.hm - y) * self.sy

    def rect(self, x0, y0, x1, y1, col, alpha=1.0):
        c0, r1 = self.px(x0, y0)
        c1, r0 = self.px(x1, y1)
        r0, r1 = int(max(0, math.floor(r0))), int(min(self.h, math.ceil(r1)))
        c0, c1 = int(max(0, math.floor(c0))), int(min(self.w, math.ceil(c1)))
        if r1 > r0 and c1 > c0:
            reg = self.img[r0:r1, c0:c1]
            reg[:] = reg * (1 - alpha) + np.array(col, np.float32) * alpha

    def stamp(self, pts, rad, col, alpha=1.0):
        """Lukis garis tebal melalui titik-titik (meter). rad dalam meter."""
        pts = np.asarray(pts, np.float32)
        P = np.stack([pts[:, 0] * self.sx, (self.hm - pts[:, 1]) * self.sy], 1)
        r = rad * self.sx
        c0 = int(max(0, P[:, 0].min() - r - 2))
        c1 = int(min(self.w, P[:, 0].max() + r + 3))
        r0 = int(max(0, P[:, 1].min() - r - 2))
        r1 = int(min(self.h, P[:, 1].max() + r + 3))
        if c1 <= c0 or r1 <= r0:
            return
        yy, xx = np.mgrid[r0:r1, c0:c1].astype(np.float32) + 0.5
        d = np.full(xx.shape, 1e9, np.float32)
        for a, b in zip(P[:-1], P[1:]):
            ab = b - a
            L = float(ab @ ab) or 1e-6
            t = np.clip(((xx - a[0]) * ab[0] + (yy - a[1]) * ab[1]) / L, 0, 1)
            dx = xx - (a[0] + t * ab[0])
            dy = yy - (a[1] + t * ab[1])
            d = np.minimum(d, np.sqrt(dx * dx + dy * dy))
        m = smooth_mask(d - r, 1.2)[..., None] * alpha
        reg = self.img[r0:r1, c0:c1]
        reg[:] = reg * (1 - m) + np.array(col, np.float32) * m

    def circle(self, cx, cy, rad, width, col, alpha=1.0, n=64):
        a = np.linspace(0, 2 * math.pi, n + 1)
        self.stamp(np.stack([cx + rad * np.cos(a), cy + rad * np.sin(a)], 1), width, col, alpha)

    def disc(self, cx, cy, rad, col, alpha=1.0):
        self.stamp([(cx, cy), (cx, cy)], rad, col, alpha)


GOLD = (0.86, 0.68, 0.30)
GOLD_HI = (0.98, 0.84, 0.46)
GOLD_LO = (0.55, 0.40, 0.14)
BLACK = (0.055, 0.052, 0.05)


def pseudo_script(cv, x0, x1, base, size, col, seed):
    """Corak hiasan gaya kaligrafi thuluth (bukan teks sebenar): dua tingkat huruf,
    tiang alif tinggi, mangkuk & ekor panjang di bawah, titik dan baris kecil."""
    r = np.random.default_rng(seed)
    lw = size * 0.05
    t = np.linspace(0, 1, 22)
    # tingkat bawah: mangkuk lebar dan ekor yang menyapu ke kiri
    x = x0
    while x < x1 - size * 0.5:
        w = size * r.uniform(0.7, 1.3)
        kind = r.integers(0, 3)
        if kind == 0:  # mangkuk (seperti nun / ya)
            a = np.pi * (1.0 + t)
            cv.stamp(np.stack([x + w * 0.5 + w * 0.5 * np.cos(a), base + size * 0.08 + size * 0.2 * np.sin(a)], 1), lw * 1.1, col)
        elif kind == 1:  # ekor panjang yang menipis
            xs = x + w * 1.2 * t
            cv.stamp(np.stack([xs, base - size * 0.12 * np.sin(t * np.pi)], 1), lw * (1.15 - 0.5 * t.mean()), col)
        else:  # gelung kecil + tangkai
            cv.circle(x + w * 0.3, base + size * 0.12, size * 0.1, lw * 0.8, col, n=20)
            cv.stamp([(x + w * 0.3 + size * 0.1, base + size * 0.12), (x + w * 0.9, base)], lw, col)
        x += w * 0.85
    # tiang alif / lam yang tinggi
    x = x0 + size * r.uniform(0.1, 0.4)
    while x < x1 - size * 0.2:
        top = base + size * r.uniform(0.8, 1.05)
        slant = size * 0.08
        cv.stamp([(x + slant, base - size * 0.05), (x, top)], lw * 1.15, col)
        if r.random() < 0.5:  # hujung bengkok (lam)
            cv.stamp([(x + slant, base - size * 0.05), (x + slant + size * 0.2, base + size * 0.04)], lw, col)
        x += size * r.uniform(0.35, 0.7)
    # tingkat atas: huruf kecil bertindan di antara tiang
    x = x0 + size * 0.2
    while x < x1 - size * 0.4:
        y = base + size * r.uniform(0.45, 0.62)
        w = size * r.uniform(0.25, 0.45)
        if r.random() < 0.5:
            a = np.pi * (1.0 + t)
            cv.stamp(np.stack([x + w * 0.5 + w * 0.5 * np.cos(a), y + size * 0.1 * np.sin(a)], 1), lw * 0.75, col)
        else:
            cv.stamp(np.stack([x + w * t, y + size * 0.06 * np.sin(t * np.pi * 2)], 1), lw * 0.75, col)
        x += w * r.uniform(1.1, 1.8)
    # titik & baris kecil (berlian)
    for _ in range(int((x1 - x0) / size * 3)):
        cx = r.uniform(x0, x1)
        cy = base + size * r.choice([-0.2, 0.32, 0.78])
        d = size * 0.035
        cv.stamp([(cx - d, cy), (cx + d, cy + d * 0.6)], lw * 0.7, col)


# =====================================================================
#  Tekstur dinding Kaabah (atlas)
# =====================================================================
def wall_texture(name):
    cv = Canvas(TEX, TEX, S, H)
    img = cv.img
    yy, xx = np.mgrid[0:TEX, 0:TEX].astype(np.float32)
    xm = (xx + 0.5) / cv.sx
    ym = H - (yy + 0.5) / cv.sy
    # --- kiswah hitam dengan corak jacquard (zigzag & lengkung, hitam atas hitam)
    tri = np.abs(((xm / 0.9) % 1.0) - 0.5) * 2  # gelombang segi tiga
    band = (ym + 0.35 * tri) % 0.95
    jac = (np.abs(band - 0.47) < 0.035).astype(np.float32)
    wave = (np.abs(((ym * 3.1 + np.sin(xm * 7.0) * 0.18) % 0.95) - 0.47) < 0.03) * ((band > 0.12) & (band < 0.8))
    k = 0.062 + 0.022 * jac + 0.012 * wave.astype(np.float32)
    k += rng.normal(0, 0.006, k.shape).astype(np.float32)  # tenunan
    k -= 0.012 * (np.abs(((xm / (S / 8)) % 1.0) - 0.5) > 0.495)  # jahitan menegak 8 kepingan
    img[:] = np.stack([k, k * 0.97, k * 0.94], -1)
    # --- batu Kaabah yang terdedah & kain putih (musim haji)
    stone = (ym < WHITE0)
    sn = 0.40 + 0.05 * rng.standard_normal(stone.sum()).astype(np.float32)
    img[stone] = np.stack([sn, sn * 0.93, sn * 0.84], -1)
    joint = stone & ((np.abs(((xm + (ym > 0.45) * 0.4) % 0.8) - 0.4) > 0.39) | (np.abs(ym - 0.45) < 0.012))
    img[joint] *= 0.7
    white = (ym >= WHITE0) & (ym < WHITE1)
    fold = 0.9 + 0.05 * np.sin(xm * 9.0 + np.sin(xm * 2.3) * 2.0) + 0.02 * rng.standard_normal(white.shape).astype(np.float32)
    img[white] = np.stack([fold, fold, fold * 0.97], -1)[white]
    hem = (ym >= WHITE1 - 0.05) & (ym < WHITE1)
    img[hem] = (0.75, 0.74, 0.70)
    # --- hizam: latar hitam, bingkai emas berganda, kaligrafi hiasan
    y0, y1 = HIZ_Y - HIZ_H / 2, HIZ_Y + HIZ_H / 2
    cv.rect(0, y0, S, y1, (0.035, 0.033, 0.03))
    for yb in (y0 + 0.03, y1 - 0.03):
        cv.rect(0, yb - 0.022, S, yb + 0.022, GOLD)
    for yb in (y0 + 0.075, y1 - 0.075):
        cv.rect(0, yb - 0.006, S, yb + 0.006, GOLD_LO)
    seed = {"NE": 11, "NW": 12, "SW": 13, "SE": 14}[name]
    seg = [(0.15, 1.75), (2.35, 5.85), (6.45, S - 0.15)]
    for i, (a, b) in enumerate(seg):
        pseudo_script(cv, a, b, y0 + 0.17, 0.36, GOLD_HI, seed * 10 + i)
    for cx in (2.05, 6.15):  # bulatan pemisah pada hizam
        cv.circle(cx, HIZ_Y, 0.2, 0.018, GOLD)
        cv.circle(cx, HIZ_Y, 0.14, 0.01, GOLD_LO)
        pseudo_script(cv, cx - 0.11, cx + 0.11, HIZ_Y - 0.04, 0.16, GOLD_HI, seed * 7 + int(cx))
    # --- medalion penjuru (separuh pada setiap dinding, bercantum di penjuru)
    for cx in (0.0, S):
        cv.disc(cx, 5.15, 0.36, (0.03, 0.03, 0.03))
        cv.circle(cx, 5.15, 0.36, 0.022, GOLD)
        cv.circle(cx, 5.15, 0.28, 0.01, GOLD_LO)
        pseudo_script(cv, max(0, cx - 0.22), min(S, cx + 0.22), 5.08, 0.2, GOLD_HI, seed + int(cx))
    # --- sitara pintu (dinding timur laut)
    door_x = DOOR_C
    sx0, sx1 = door_x - DOOR_W / 2 - 0.45, door_x + DOOR_W / 2 + 0.45
    if name == "NE":
        top = DOOR_Y + DOOR_H + 1.3
        cv.rect(sx0, DOOR_Y - 0.15, sx1, top, (0.04, 0.035, 0.03))
        for inset in (0.05, 0.12):
            pts = [(sx0 + inset, DOOR_Y - 0.15 + inset), (sx1 - inset, DOOR_Y - 0.15 + inset), (sx1 - inset, top - inset), (sx0 + inset, top - inset), (sx0 + inset, DOOR_Y - 0.15 + inset)]
            cv.stamp(pts, 0.016 if inset < 0.1 else 0.008, GOLD)
        for row in range(3):  # baris kaligrafi hiasan di atas pintu
            pseudo_script(cv, sx0 + 0.2, sx1 - 0.2, DOOR_Y + DOOR_H + 0.18 + row * 0.36, 0.26, GOLD_HI, 300 + row)
        for side in (sx0 + 0.24, sx1 - 0.24):  # jalur tegak di kiri & kanan pintu
            for j in range(5):
                cv.circle(side, DOOR_Y + 0.2 + j * 0.42, 0.13, 0.012, GOLD)
    # --- qanadil (panel berbentuk pelita di bawah hizam)
    for i in range(4):
        cx = S * (i + 0.5) / 4
        if name == "NE" and sx0 - 0.4 < cx < sx1 + 0.4:
            continue
        w, b, t = 0.62, 3.95, 5.35
        arch = [(cx - w / 2, b), (cx - w / 2, t - 0.35)]
        a = np.linspace(math.pi, 0, 20)
        arch += [(cx + w / 2 * math.cos(v), t - 0.35 + 0.35 * math.sin(v)) for v in a]
        arch += [(cx + w / 2, b), (cx - w / 2, b)]
        cv.stamp(arch, 0.02, GOLD)
        inner = [(px + (cx - px) * 0.12, py + (0.06 if py < b + 0.01 else -0.04)) for px, py in arch]
        cv.stamp(inner, 0.007, GOLD_LO)
        for j in range(3):
            pseudo_script(cv, cx - w / 2 + 0.07, cx + w / 2 - 0.07, b + 0.18 + j * 0.3, 0.2, GOLD_HI, seed * 100 + i * 10 + j)
        cv.stamp([(cx, b), (cx, b - 0.22)], 0.012, GOLD)  # pelita tergantung
        cv.disc(cx, b - 0.28, 0.07, GOLD)
    return np.clip(img, 0, 1)


def door_texture():
    """Pintu emas: dua daun, bingkai timbul, ukiran bulatan & kaligrafi hiasan."""
    W, Hh = 512, 840
    cv = Canvas(W, Hh, DOOR_W, DOOR_H)
    yy, xx = np.mgrid[0:Hh, 0:W].astype(np.float32)
    shade = 0.92 + 0.08 * np.sin(xx / W * math.pi) + 0.02 * rng.standard_normal((Hh, W)).astype(np.float32)
    cv.img[:] = np.array(GOLD, np.float32) * shade[..., None]
    m = 0.07
    for x0, x1 in ((m, DOOR_W / 2 - 0.02), (DOOR_W / 2 + 0.02, DOOR_W - m)):
        cv.stamp([(x0, m), (x1, m), (x1, DOOR_H - m), (x0, DOOR_H - m), (x0, m)], 0.012, GOLD_LO)
        cx = (x0 + x1) / 2
        for j in range(5):
            cy = 0.3 + j * 0.34
            cv.circle(cx, cy, 0.11, 0.01, GOLD_LO)
            cv.circle(cx, cy, 0.06, 0.008, GOLD_HI)
        pseudo_script(cv, x0 + 0.04, x1 - 0.04, DOOR_H - 0.3, 0.16, GOLD_LO, 900 + int(cx * 10))
    cv.rect(DOOR_W / 2 - 0.012, m, DOOR_W / 2 + 0.012, DOOR_H - m, GOLD_LO)
    for y in (0.95, 1.05):  # pemegang
        cv.disc(DOOR_W / 2 - 0.06, y, 0.025, GOLD_HI)
        cv.disc(DOOR_W / 2 + 0.06, y, 0.025, GOLD_HI)
    return np.clip(cv.img, 0, 1)


def solid_texture(col, noise=0.03, size=64):
    a = np.ones((size, size, 3), np.float32) * np.array(col, np.float32)
    a *= 1 + noise * rng.standard_normal((size, size, 1)).astype(np.float32)
    return np.clip(a, 0, 1)


def to_image(name, arr, alpha=False):
    h, w = arr.shape[:2]
    im = bpy.data.images.get(name) or bpy.data.images.new(name, w, h, alpha=alpha)
    if im.size[0] != w or im.size[1] != h:
        im.scale(w, h)
    rgba = np.ones((h, w, 4), np.float32)
    rgba[..., :3] = arr
    im.pixels.foreach_set(np.flipud(rgba).ravel())  # Blender: baris 0 = bawah
    im.update()
    return im


def from_image(im):
    w, h = im.size
    a = np.empty(w * h * 4, np.float32)
    im.pixels.foreach_get(a)
    return np.flipud(a.reshape(h, w, 4))[..., :3].copy()


# =====================================================================
#  Bahan
# =====================================================================
def mat_image(name, im, rough=0.7, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = im
    tex.interpolation = "Linear"
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    return m


def mat_marble(name, base=(0.92, 0.91, 0.87)):
    """Marmar prosedural (dibake ke imej sebelum eksport)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    coord = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 1.6
    noise.inputs["Detail"].default_value = 12.0
    noise.inputs["Distortion"].default_value = 3.0
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.inputs["Scale"].default_value = 0.9
    wave.inputs["Distortion"].default_value = 9.0
    wave.inputs["Detail"].default_value = 6.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (*[c * 0.62 for c in base], 1)
    ramp.color_ramp.elements[1].position = 0.12
    ramp.color_ramp.elements[1].color = (*base, 1)
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Color"], wave.inputs["Vector"])
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.35
    return m


# =====================================================================
#  Geometri
# =====================================================================
def new_obj(name, verts, faces, uvs=None, mats=None, face_mat=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    if uvs is not None:
        uvl = me.uv_layers.new(name="UVMap")
        for poly in me.polygons:
            for li, vi in zip(poly.loop_indices, poly.vertices):
                uvl.data[li].uv = uvs[poly.index][list(poly.vertices).index(vi)]
    if mats:
        for m in mats:
            me.materials.append(m)
        if face_mat:
            for poly, mi in zip(me.polygons, face_mat):
                poly.material_index = mi
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def build_body(atlas_mat, roof_mat):
    verts, faces, uvs, fm = [], [], [], []
    pad = 4 / (2 * TEX)
    for name, a, b in WALLS:
        ax, ay = CORNER[a]
        bx, by = CORNER[b]
        i = len(verts)
        verts += [(ax, ay, 0), (bx, by, 0), (bx, by, H), (ax, ay, H)]
        faces.append((i, i + 1, i + 2, i + 3))
        qc, qr = QUAD[name]
        u0, v0 = qc * 0.5 + pad, qr * 0.5 + pad
        u1, v1 = u0 + 0.5 - 2 * pad, v0 + 0.5 - 2 * pad
        uvs.append([(u0, v0), (u1, v0), (u1, v1), (u0, v1)])
        fm.append(0)
    i = len(verts)
    verts += [(CORNER[c][0], CORNER[c][1], H) for c in ("E", "N", "W", "S")]
    faces.append((i, i + 1, i + 2, i + 3))
    uvs.append([(1, 0.5), (0.5, 1), (0, 0.5), (0.5, 0)])
    fm.append(1)
    return new_obj("Kaabah", verts, faces, uvs, [atlas_mat, roof_mat], fm)


def ring_solid(name, r_in0, r_out0, r_in1, r_out1, z0, z1, a0, a1, cx=0.0, cy=0.0, seg=64, square=False):
    """Pepejal berbentuk gelang/lengkok (atau gelang segi empat jika square)."""
    verts, faces = [], []
    if square:
        # gelang segi empat mengelilingi tapak Kaabah (diputar 45°)
        def ring(r, z):
            return [(r * math.cos(t), r * math.sin(t), z) for t in [0, math.pi / 2, math.pi, 1.5 * math.pi]]
        loops = [ring(r_in0, z0), ring(r_out0, z0), ring(r_out1, z1), ring(r_in1, z1)]
        n = 4
        closed = True
    else:
        ts = np.radians(np.linspace(a0, a1, seg + 1))
        def ring(r, z):
            return [(cx + r * math.cos(t), cy + r * math.sin(t), z) for t in ts]
        loops = [ring(r_in0, z0), ring(r_out0, z0), ring(r_out1, z1), ring(r_in1, z1)]
        n = seg + 1
        closed = False
    for lp in loops:
        verts += lp
    for k in range(4):
        A, B = k * n, ((k + 1) % 4) * n
        for j in range(n if closed else n - 1):
            j2 = (j + 1) % n
            faces.append((A + j, A + j2, B + j2, B + j))
    if not closed:  # tutup hujung lengkok
        faces.append((0, 3 * n, 2 * n, n))
        e = n - 1
        faces.append((e, n + e, 2 * n + e, 3 * n + e))
    ob = new_obj(name, verts, faces)
    fix_normals(ob)
    return ob


def fix_normals(ob):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(ob.data)
    bm.free()


def box(name, cx, cy, cz, sx, sy, sz, rot=0.0):
    hx, hy, hz = sx / 2, sy / 2, sz / 2
    c, s = math.cos(rot), math.sin(rot)
    pts = []
    for z in (-hz, hz):
        for x, y in ((-hx, -hy), (hx, -hy), (hx, hy), (-hx, hy)):
            pts.append((cx + x * c - y * s, cy + x * s + y * c, cz + z))
    faces = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    return new_obj(name, pts, faces)


def smart_uv(ob, margin=0.02):
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=margin)
    bpy.ops.object.mode_set(mode="OBJECT")


# =====================================================================
#  Bake (Cycles): warna prosedural & ambient occlusion → imej
# =====================================================================
def bake_to(ob, img, kind, only=None):
    """Bake ke img. Bahan selain `only` (jika diberi) dibake ke imej buangan."""
    sc = bpy.context.scene
    junk = bpy.data.images.get("_buang") or bpy.data.images.new("_buang", 64, 64)
    for m in ob.data.materials:
        nt = m.node_tree
        node = nt.nodes.get("JH_BAKE") or nt.nodes.new("ShaderNodeTexImage")
        node.name = "JH_BAKE"
        node.image = img if only is None or m.name == only else junk
        nt.nodes.active = node
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    if kind == "AO":
        sc.cycles.samples = 64
        bpy.ops.object.bake(type="AO", margin=8, use_clear=True)
    else:
        sc.cycles.samples = 4
        bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, margin=8, use_clear=True)
    for m in ob.data.materials:
        n = m.node_tree.nodes.get("JH_BAKE")
        if n:
            m.node_tree.nodes.remove(n)


def ao_multiply(base, ao, k=0.5):
    return np.clip(base * ((1 - k) + k * ao), 0, 1)


def rebake_material(ob, name, base_arr, rough, metal=0.0):
    im = to_image(name, base_arr)
    ob.data.materials.clear()
    ob.data.materials.append(mat_image("M_" + name, im, rough, metal))


# =====================================================================
#  Utama
# =====================================================================
def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.unit_settings.system = "METRIC"
    world = bpy.data.worlds.new("Langit")
    sc.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = (0.55, 0.68, 0.85, 1)
    bg.inputs["Strength"].default_value = 1.0

    # --- tekstur dinding
    atlas = np.zeros((2 * TEX, 2 * TEX, 3), np.float32)
    for name, _, _ in WALLS:
        qc, qr = QUAD[name]
        r0 = (1 - qr) * TEX
        c0 = qc * TEX
        atlas[r0 : r0 + TEX, c0 : c0 + TEX] = wall_texture(name)
        print("tekstur dinding", name, flush=True)
    im_atlas = to_image("kaabah_dinding", atlas)
    im_roof = to_image("kaabah_bumbung", solid_texture((0.5, 0.49, 0.46), 0.05, 256))
    body = build_body(mat_image("M_dinding", im_atlas, 0.82), mat_image("M_bumbung", im_roof, 0.6))

    # --- Syazarwan (tapak marmar landai)
    shz = ring_solid("Syazarwan", D - 0.01, D + 0.48, D - 0.01, D + 0.06, 0.0, 0.3, 0, 0, square=True)
    shz.data.materials.append(mat_marble("M_syazarwan", (0.86, 0.85, 0.82)))
    # --- Hijir Ismail (dinding separuh bulatan) & penutup atas
    hijr = ring_solid("HijirIsmail", HIJR_RI, HIJR_RO, HIJR_RI, HIJR_RO, 0.0, HIJR_H, HIJR_A0, HIJR_A1, *HIJR_C, seg=72)
    cap = ring_solid("HijirIsmail_Atas", HIJR_RI - 0.05, HIJR_RO + 0.05, HIJR_RI - 0.02, HIJR_RO + 0.02, HIJR_H, HIJR_H + 0.08, HIJR_A0 - 0.6, HIJR_A1 + 0.6, *HIJR_C, seg=72)
    marble = mat_marble("M_hijir")
    hijr.data.materials.append(marble)
    cap.data.materials.append(marble)

    # --- Pintu emas (dinding timur laut)
    ex, ey = CORNER["E"]
    nxw, nyw = CORNER["N"]
    ux, uy = (nxw - ex) / S, (nyw - ey) / S  # arah sepanjang dinding (timur → utara)
    nx, ny = math.sqrt(0.5), math.sqrt(0.5)  # normal dinding timur laut
    dcx, dcy = ex + ux * DOOR_C + nx * 0.06, ey + uy * DOOR_C + ny * 0.06
    rot = math.atan2(uy, ux)
    door = box("Pintu", dcx, dcy, DOOR_Y + DOOR_H / 2, DOOR_W, 0.12, DOOR_H, rot)
    smart_uv(door, 0.01)
    # muka hadapan pintu dipetakan penuh kepada tekstur pintu
    uvl = door.data.uv_layers.active
    for poly in door.data.polygons:
        n = poly.normal
        if n.x * nx + n.y * ny > 0.9:
            co = [door.data.vertices[v].co for v in poly.vertices]
            for li, c in zip(poly.loop_indices, co):
                along = (c.x - ex) * ux + (c.y - ey) * uy
                uvl.data[li].uv = ((along - (DOOR_C - DOOR_W / 2)) / DOOR_W, (c.z - DOOR_Y) / DOOR_H)
        else:
            for li in poly.loop_indices:
                uvl.data[li].uv = (0.02, 0.02)
    door.data.materials.append(mat_image("M_pintu", to_image("kaabah_pintu", door_texture()), 0.35))

    # --- Hajarul Aswad: bingkai perak di penjuru timur
    bpy.ops.mesh.primitive_torus_add(major_radius=0.23, minor_radius=0.065, major_segments=36, minor_segments=12, location=(D + 0.03, 0, HAJAR_Z), rotation=(0, math.pi / 2, 0))
    frame = bpy.context.active_object
    frame.name = "HajarulAswad_Bingkai"
    frame.scale = (1.25, 0.85, 1.0)  # paksi tempatan x menjadi menegak selepas putaran
    frame.data.materials.append(mat_image("M_perak", to_image("kaabah_perak", solid_texture((0.78, 0.79, 0.82), 0.04)), 0.3))
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.17, segments=20, ring_count=12, location=(D - 0.02, 0, HAJAR_Z))
    stone = bpy.context.active_object
    stone.name = "HajarulAswad"
    stone.scale = (0.6, 0.85, 1.15)
    stone.data.materials.append(mat_image("M_batu", to_image("kaabah_batu", solid_texture((0.09, 0.06, 0.055), 0.25)), 0.25))

    # --- Mizab (pancur emas) di bumbung dinding barat laut, menghala ke Hijir Ismail
    mx, my = -D / 2, D / 2
    mrot = math.atan2(1, -1)  # arah barat laut
    gold_im = to_image("kaabah_emas", solid_texture(GOLD, 0.05))
    parts = [box("Mizab_Dasar", mx - 0.55 * math.sqrt(0.5), my + 0.55 * math.sqrt(0.5), H - 0.45, 1.6, 0.34, 0.06, mrot)]
    for side in (-1, 1):
        off = 0.15 * side
        parts.append(box("Mizab_Sisi", mx - 0.55 * math.sqrt(0.5) - off * math.sqrt(0.5), my + 0.55 * math.sqrt(0.5) - off * math.sqrt(0.5), H - 0.37, 1.6, 0.04, 0.16, mrot))
    gold_mat = mat_image("M_emas", gold_im, 0.35)
    for p in parts:
        p.data.materials.append(gold_mat)
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    mizab = bpy.context.active_object
    mizab.name = "Mizab"
    smart_uv(mizab, 0.02)

    # --- lantai bantuan untuk bake AO (tidak dieksport)
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "Lantai_bantuan"
    ground.data.materials.append(mat_marble("M_lantai", (0.95, 0.95, 0.93)))

    # --- bake: AO dinding → darab ke atlas
    im_ao = bpy.data.images.new("ao_dinding", 2 * TEX, 2 * TEX)
    bake_to(body, im_ao, "AO", only="M_dinding")
    atlas_ao = ao_multiply(atlas, from_image(im_ao), 0.45)
    to_image("kaabah_dinding", atlas_ao)
    print("bake AO dinding siap", flush=True)

    # --- bake: marmar prosedural (warna + AO) → imej, kemudian ganti bahan
    for ob, nm, size in ((shz, "kaabah_syazarwan", 1024), (hijr, "kaabah_hijir", 1024), (cap, "kaabah_hijir_atas", 512)):
        smart_uv(ob, 0.02)
        col = bpy.data.images.new(nm + "_warna", size, size)
        ao = bpy.data.images.new(nm + "_ao", size, size)
        bake_to(ob, col, "DIFFUSE")
        bake_to(ob, ao, "AO")
        rebake_material(ob, nm, ao_multiply(from_image(col), from_image(ao), 0.5), 0.4)
        print("bake", nm, flush=True)

    # --- kumpulkan & eksport
    model = [body, shz, hijr, cap, door, frame, stone, mizab]
    root = bpy.data.objects.new("Kaabah_JejakHaji", None)
    bpy.context.collection.objects.link(root)
    for ob in model:
        ob.parent = root
        for poly in ob.data.polygons:
            poly.use_smooth = ob in (frame, stone)
    os.makedirs(OUT, exist_ok=True)
    for im in bpy.data.images:
        if im.name.startswith("kaabah_") and not im.packed_file:
            im.pack()
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for ob in model:
        ob.select_set(True)
    glb = os.path.join(OUT, "kaabah.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_image_format="JPEG",
        export_jpeg_quality=86,
        export_draco_mesh_compression_enable=False,
        export_animations=False,
    )
    print("eksport", glb, os.path.getsize(glb), "bait", flush=True)
    for im in list(bpy.data.images):
        if not im.name.startswith("kaabah_"):
            bpy.data.images.remove(im)  # imej sementara bake
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "kaabah.blend"), compress=True)

    if RENDER:
        render_preview(ground)


def render_preview(ground):
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = 1600, 1000
    sc.cycles.samples = 96
    sc.cycles.use_denoising = True
    sc.view_settings.view_transform = "Standard"
    sc.world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.55
    sun = bpy.data.lights.new("Matahari", "SUN")
    sun.energy = 3.0
    sun.angle = math.radians(1.5)
    so = bpy.data.objects.new("Matahari", sun)
    so.rotation_euler = (math.radians(38), 0, math.radians(140))
    bpy.context.collection.objects.link(so)
    cam = bpy.data.cameras.new("Kamera")
    cam.lens = 30
    co = bpy.data.objects.new("Kamera", cam)
    bpy.context.collection.objects.link(co)
    # dari utara-timur laut: dinding pintu (timur laut), Hijir Ismail & Mizab kelihatan
    az = math.radians(62)
    co.location = (23 * math.cos(az), 23 * math.sin(az), 6.5)
    look = (-0.8, 0.6, 3.4)
    d = np.array(look) - np.array(co.location)
    co.rotation_euler = (math.atan2(math.hypot(d[0], d[1]), -d[2]), 0, math.atan2(d[1], d[0]) - math.pi / 2)
    sc.camera = co
    out = os.path.join(OUT, "kaabah-render.jpg")
    sc.render.image_settings.file_format = "JPEG"
    sc.render.image_settings.quality = 88
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print("render", out, flush=True)


main()
