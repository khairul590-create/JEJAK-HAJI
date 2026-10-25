// =====================================================================
//  Fail 07: ENJIN 3D — Three.js r128 (dimuat dari cdnjs apabila perlu)
//  Simulasi (kedudukan, tawaf, saie, lontar…) dikongsi dengan 2D;
//  fail ini hanya menukar cara dunia dipaparkan.
//  Paksi: dunia 2D (x, y) → 3D (X, Z); Y ke atas. 1 unit 3D = 10 px dunia.
// =====================================================================

const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
// Pemuat glTF versi bukan-modul yang sepadan dengan r128 (dimuat hanya jika MODELS3D berisi)
const GLTF_URL = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
const K3 = 0.1;
const LOWQ = window.matchMedia("(pointer: coarse)").matches;

type CamMode = "back" | "eye" | "top";
const CAM_NAMES: Record<CamMode, string> = { back: "Belakang", eye: "Mata", top: "Atas" };
const C3 = {
  mode: "back" as CamMode,
  yaw: 0,
  pitch: 0.5,
  dist: 14,
  topPitch: 1.18,
  topDist: 75,
  fov: 62,
  eyePitch: -0.04,
  lastDrag: -99,
  fwdInput: 0,
};

interface PeopleInst {
  cap: number;
  meshes: Record<"body" | "head" | "hair" | "veil" | "cape" | "face" | "hands", THREE.InstancedMesh>;
}
interface PlayerRig {
  root: THREE.Group;
  fallback: THREE.Group;
  avatar: THREE.Group | null;
  body: THREE.Mesh;
  head: THREE.Mesh;
  hair: THREE.Mesh;
  veil: THREE.Mesh;
  cape: THREE.Mesh;
  face: THREE.Mesh;
  shoulder: THREE.Mesh;
  armL: THREE.Group;
  armR: THREE.Group;
  armMats: THREE.MeshLambertMaterial[];
  key: string;
}
interface World3 {
  id: SceneId;
  group: THREE.Group;
  people: PeopleInst;
  peb: THREE.InstancedMesh;
  pebKey: number;
  lamps: THREE.Vector3[];
  textures: THREE.Texture[];
}

const R3 = {
  active: false,
  loading: false,
  renderer: null as THREE.WebGLRenderer | null,
  scene: null as THREE.Scene | null,
  camera: null as THREE.PerspectiveCamera | null,
  sun: null as THREE.DirectionalLight | null,
  hemi: null as THREE.HemisphereLight | null,
  pts: [] as THREE.PointLight[],
  world: null as World3 | null,
  rig: null as PlayerRig | null,
  tRing: null as THREE.Mesh | null,
  tGem: null as THREE.Mesh | null,
  tBeam: null as THREE.Mesh | null,
  iRing: null as THREE.Mesh | null,
  arrow: null as THREE.Mesh | null,
  stonePool: [] as THREE.Mesh[],
  light: "" as string,
  colorT: 0,
  lampT: 0,
};

// ---------------------------------------------------------------------
//  Muat & hidupkan
// ---------------------------------------------------------------------
function load3D(): Promise<boolean> {
  if ((window as unknown as { THREE?: unknown }).THREE) return Promise.resolve(true);
  return new Promise((res) => {
    const s = document.createElement("script");
    s.src = THREE_URL;
    s.async = true;
    s.onload = () => res(true);
    s.onerror = () => res(false);
    document.head.appendChild(s);
  });
}

async function set3D(on: boolean, quiet = false): Promise<void> {
  if (on === R3.active || R3.loading) return;
  if (!on) {
    R3.active = false;
    el("world3d").hidden = true;
    SET.view3d = false;
    saveSettings();
    paintViewControls();
    return;
  }
  R3.loading = true;
  if (!quiet) toast("Memuatkan paparan 3D…", "info", 2200);
  const ok = await load3D();
  R3.loading = false;
  if (!ok || !initRenderer()) {
    toast("Paparan 3D tidak dapat dimuatkan. Pastikan ada sambungan internet dan pelayar menyokong WebGL.", "bad", 6000);
    SET.view3d = false;
    saveSettings();
    paintViewControls();
    return;
  }
  ensureWorld();
  C3.yaw = 0;
  R3.active = true;
  el("world3d").hidden = false;
  SET.view3d = true;
  saveSettings();
  resize3D();
  paintViewControls();
  if (!quiet) toast("Paparan 3D: seret skrin untuk memusing kamera, + / − untuk zum, butang Kamera untuk pandangan mata.", "info", 6500);
}

function initRenderer(): boolean {
  if (R3.renderer) return true;
  try {
    const cv = el<HTMLCanvasElement>("world3d");
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: !LOWQ, powerPreference: "high-performance" });
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    R3.renderer = r;
    const sc = new THREE.Scene();
    R3.scene = sc;
    R3.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1400);
    R3.hemi = new THREE.HemisphereLight(0xe3f0ff, 0xbca883, 0.75);
    sc.add(R3.hemi);
    const sun = new THREE.DirectionalLight(0xfff1d8, 0.85);
    sun.castShadow = true;
    const sz = LOWQ ? 1024 : 2048;
    sun.shadow.mapSize.set(sz, sz);
    const sh = sun.shadow.camera;
    sh.left = -42;
    sh.right = 42;
    sh.top = 42;
    sh.bottom = -42;
    sh.near = 1;
    sh.far = 220;
    sun.shadow.bias = -0.0008;
    R3.sun = sun;
    sc.add(sun);
    sc.add(sun.target);
    for (let i = 0; i < 3; i++) {
      const pl = new THREE.PointLight(0xffd59a, 0, 26, 1.6);
      R3.pts.push(pl);
      sc.add(pl);
    }
    R3.rig = makeRig();
    sc.add(R3.rig.root);
    makeMarkers(sc);
    return true;
  } catch {
    R3.renderer = null;
    return false;
  }
}

function resize3D(): void {
  if (!R3.renderer || !R3.camera) return;
  R3.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOWQ ? 1.3 : 1.75));
  R3.renderer.setSize(W, H, false);
  R3.camera.aspect = W / H;
  R3.camera.updateProjectionMatrix();
}

// ---------------------------------------------------------------------
//  Bahan, geometri & tekstur
// ---------------------------------------------------------------------
let BUILD_TEX: THREE.Texture[] = [];
const matCache = new Map<string, THREE.Material>();
function lam(col: string | number, extra?: THREE.MeshLambertMaterialParameters): THREE.MeshLambertMaterial {
  const key = "l" + col + (extra ? JSON.stringify(Object.keys(extra)) + (extra.emissive ?? "") + (extra.opacity ?? "") : "");
  const hit = matCache.get(key);
  if (hit && !extra?.map) return hit as THREE.MeshLambertMaterial;
  const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(col as string), ...extra });
  if (!extra?.map) matCache.set(key, m);
  return m;
}
function flat(col: string): THREE.MeshPhongMaterial {
  const key = "f" + col;
  const hit = matCache.get(key);
  if (hit) return hit as THREE.MeshPhongMaterial;
  const m = new THREE.MeshPhongMaterial({ color: new THREE.Color(col), flatShading: true, shininess: 4 });
  matCache.set(key, m);
  return m;
}
function basic(col: string | number, extra?: THREE.MeshBasicMaterialParameters): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(col as string), ...extra });
}
function mesh(g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[], x = 0, y = 0, z = 0, shadow = true): THREE.Mesh {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = shadow;
  o.receiveShadow = true;
  return o;
}
function mergeGeos(gs: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const parts = gs.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0;
  for (const g of parts) n += g.getAttribute("position").count;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of parts) {
    const p = g.getAttribute("position").array as Float32Array;
    const q = g.getAttribute("normal").array as Float32Array;
    pos.set(p, o * 3);
    nor.set(q, o * 3);
    o += g.getAttribute("position").count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  return out;
}
function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, repeat = false): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  draw(c);
  const t = new THREE.CanvasTexture(cv);
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
  }
  if (R3.renderer) t.anisotropy = Math.min(8, R3.renderer.capabilities.getMaxAnisotropy());
  BUILD_TEX.push(t);
  return t;
}
function wallTexture(col: string, style: "arch" | "win" | "plain"): THREE.CanvasTexture {
  return canvasTex(
    256,
    128,
    (c) => {
      c.fillStyle = col;
      c.fillRect(0, 0, 256, 128);
      c.fillStyle = "rgba(255,255,255,.12)";
      c.fillRect(0, 0, 256, 10);
      c.fillStyle = "rgba(0,0,0,.08)";
      c.fillRect(0, 118, 256, 10);
      if (style === "arch") {
        for (let i = 0; i < 4; i++) {
          const x = 14 + i * 64;
          c.fillStyle = "rgba(120,98,60,.55)";
          c.beginPath();
          c.moveTo(x, 118);
          c.lineTo(x, 58);
          c.arc(x + 18, 58, 18, Math.PI, 0);
          c.lineTo(x + 36, 118);
          c.closePath();
          c.fill();
          c.strokeStyle = "rgba(200,165,90,.8)";
          c.lineWidth = 3;
          c.stroke();
        }
      } else if (style === "win") {
        c.fillStyle = "#6f8392";
        for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) c.fillRect(16 + i * 62, 22 + j * 52, 34, 30);
      } else {
        c.fillStyle = "rgba(0,0,0,.05)";
        for (let i = 0; i < 8; i++) c.fillRect(i * 32, 0, 2, 128);
      }
    },
    true
  );
}
function signTexture(text: string, bg = "#16634c", fg = "#ffffff"): THREE.CanvasTexture {
  return canvasTex(512, 128, (c) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 128);
    c.strokeStyle = "#f3d488";
    c.lineWidth = 8;
    c.strokeRect(6, 6, 500, 116);
    c.fillStyle = fg;
    c.font = "800 52px Nunito, 'Segoe UI', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 256, 66, 470);
  });
}

// ---------------------------------------------------------------------
//  Lantai daripada peta 2D
// ---------------------------------------------------------------------
function groundTexture(sc: Scene, x0: number, y0: number, x1: number, y1: number, size: number, clipR = 0): THREE.CanvasTexture {
  return canvasTex(size, size, (c) => {
    const sx = size / (x1 - x0);
    const sy = size / (y1 - y0);
    const saved = { ...VIEW };
    VIEW.x0 = x0;
    VIEW.y0 = y0;
    VIEW.x1 = x1;
    VIEW.y1 = y1;
    FLAT_GROUND = true;
    c.setTransform(sx, 0, 0, sy, -x0 * sx, -y0 * sy);
    if (clipR) {
      c.beginPath();
      c.arc(0, 0, clipR, 0, TAU);
      c.clip();
    }
    try {
      sc.ground(c);
    } finally {
      FLAT_GROUND = false;
      Object.assign(VIEW, saved);
    }
  });
}

// ---------------------------------------------------------------------
//  Pembina model daripada deskriptor
// ---------------------------------------------------------------------
const P3 = (x: number, y: number): [number, number] => [x * K3, y * K3];

function addBuilding(g: THREE.Group, d: Extract<M3, { k: "bld" }>): void {
  const w = d.w * K3;
  const dd = d.d * K3;
  const h = d.h * K3;
  const style = d.style ?? "plain";
  const side = (len: number): THREE.MeshLambertMaterial => {
    const t = wallTexture(d.col, style);
    t.repeat.set(Math.max(1, Math.round(len / 6)), Math.max(1, Math.round(h / 5)));
    return lam(d.col, { map: t });
  };
  const top = lam(shade(d.col, 0.08));
  const mats = [side(dd), side(dd), top, top, side(w), side(w)];
  const b = mesh(new THREE.BoxGeometry(w, h, dd), mats, (d.x + d.w / 2) * K3, h / 2, (d.y + d.d / 2) * K3);
  g.add(b);
  // parapet
  const par = mesh(new THREE.BoxGeometry(w + 0.3, 0.35, dd + 0.3), lam(shade(d.col, -0.12)), b.position.x, h + 0.17, b.position.z);
  g.add(par);
  if (d.sign) {
    const t = signTexture(d.sign);
    const sw = Math.min(w * 0.8, 11);
    const sg = mesh(new THREE.PlaneGeometry(sw, sw / 4), lam("#ffffff", { map: t }), b.position.x, Math.min(h * 0.72, 4.2), (d.y + d.d) * K3 + 0.04, false);
    g.add(sg);
  }
  for (const dm of d.domes ?? []) {
    const r = dm.r * K3;
    const dome = mesh(new THREE.SphereGeometry(r, 20, 12, 0, TAU, 0, Math.PI / 2), lam(shade(d.col, -0.03)), dm.x * K3, h, dm.y * K3);
    g.add(dome);
    const drum = mesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.5, 20), lam(shade(d.col, -0.1)), dm.x * K3, h + 0.25, dm.y * K3);
    g.add(drum);
    dome.position.y = h + 0.5;
    const fin = mesh(new THREE.ConeGeometry(0.18, 1.2, 8), lam("#c9a24a"), dm.x * K3, h + 0.5 + r + 0.6, dm.y * K3);
    g.add(fin);
  }
}

function addMinaret(g: THREE.Group, x: number, y: number, h: number, col: string): void {
  const [X, Z] = P3(x, y);
  const H = h * K3;
  g.add(mesh(new THREE.BoxGeometry(2.6, 1.2, 2.6), lam(shade(col, -0.1)), X, 0.6, Z));
  g.add(mesh(new THREE.CylinderGeometry(0.85, 1.05, H, 8), lam(col), X, H / 2, Z));
  for (const f of [0.36, 0.62, 0.86]) g.add(mesh(new THREE.CylinderGeometry(1.35, 1.2, 0.45, 8), lam(shade(col, -0.16)), X, H * f, Z));
  g.add(mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 8), lam(shade(col, -0.04)), X, H + 0.8, Z));
  g.add(mesh(new THREE.ConeGeometry(0.75, 2.8, 8), lam("#c9a24a", { emissive: new THREE.Color("#3a2a08") }), X, H + 3, Z));
  const cres = mesh(new THREE.TorusGeometry(0.32, 0.07, 6, 16, Math.PI * 1.5), lam("#e6c25a"), X, H + 4.8, Z, false);
  g.add(cres);
}

function addPalm(g: THREE.Group, x: number, y: number, h: number): void {
  const [X, Z] = P3(x, y);
  const H = h * K3 * 1.15;
  const trunk = mesh(new THREE.CylinderGeometry(0.16, 0.26, H, 7), lam("#8b6a44"), X + 0.2, H / 2, Z);
  trunk.rotation.z = -0.07;
  g.add(trunk);
  const fr: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const f = new THREE.BoxGeometry(2.2, 0.06, 0.5);
    f.translate(1.1, 0, 0);
    f.rotateZ(-0.45);
    f.rotateY(a);
    f.translate(X + 0.45, H, Z);
    fr.push(f);
  }
  g.add(mesh(mergeGeos(fr), lam("#45984f"), 0, 0, 0));
  g.add(mesh(new THREE.SphereGeometry(0.28, 8, 6), lam("#6b4f2e"), X + 0.45, H - 0.1, Z));
}

function addTree(g: THREE.Group, x: number, y: number, s: number, seed: number): void {
  const [X, Z] = P3(x, y);
  const r = mulberry32(seed);
  g.add(mesh(new THREE.CylinderGeometry(0.2 * s, 0.3 * s, 1.9 * s, 6), lam("#7d5c3a"), X, 0.95 * s, Z));
  const blobs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    const b = new THREE.IcosahedronGeometry((1.0 + r() * 0.5) * s, 0);
    b.translate(X + (r() - 0.5) * 1.6 * s, (2.5 + r() * 1.0) * s, Z + (r() - 0.5) * 1.6 * s);
    blobs.push(b);
  }
  g.add(mesh(mergeGeos(blobs), flat(r() < 0.5 ? "#3f7d3a" : "#4b8a42")));
}

function addBoard(g: THREE.Group, x: number, y: number, title: string, col: string): void {
  const [X, Z] = P3(x, y);
  g.add(mesh(new THREE.BoxGeometry(0.18, 3.2, 0.18), lam("#6a5034"), X - 1.6, 1.6, Z));
  g.add(mesh(new THREE.BoxGeometry(0.18, 3.2, 0.18), lam("#6a5034"), X + 1.6, 1.6, Z));
  const t = canvasTex(512, 280, (c) => {
    c.fillStyle = col;
    c.fillRect(0, 0, 512, 280);
    c.strokeStyle = "#f3d488";
    c.lineWidth = 10;
    c.strokeRect(8, 8, 496, 264);
    c.fillStyle = "#fff";
    c.font = "800 50px Nunito, sans-serif";
    c.textAlign = "center";
    c.fillText(title, 256, 92, 470);
    c.fillStyle = "rgba(243,212,136,.85)";
    for (let i = 0; i < 4; i++) c.fillRect(70, 140 + i * 30, 372 - (i % 2) * 80, 10);
  });
  const p = mesh(new THREE.BoxGeometry(4.4, 2.4, 0.15), [lam(col), lam(col), lam(col), lam(col), lam("#ffffff", { map: t }), lam(col)], X, 3.3, Z);
  g.add(p);
}

function addLamp(g: THREE.Group, x: number, y: number, list: THREE.Vector3[]): void {
  const [X, Z] = P3(x, y);
  g.add(mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.4, 6), lam("#596260"), X, 3.2, Z));
  g.add(mesh(new THREE.BoxGeometry(0.9, 0.35, 0.9), lam("#3b403f"), X, 6.5, Z));
  g.add(mesh(new THREE.SphereGeometry(0.3, 8, 6), basic("#ffe9a8"), X, 6.2, Z, false));
  list.push(new THREE.Vector3(X, 6, Z));
}

function addBus(g: THREE.Group, x: number, y: number, w: number, d: number): void {
  const W3 = w * K3;
  const D3 = d * K3;
  const X = (x + w / 2) * K3;
  const Z = (y + d / 2) * K3;
  const t = canvasTex(512, 128, (c) => {
    c.fillStyle = "#f6f5ef";
    c.fillRect(0, 0, 512, 128);
    c.fillStyle = "#2f4a5a";
    for (let i = 0; i < 7; i++) c.fillRect(18 + i * 70, 18, 52, 44);
    c.fillStyle = "#16634c";
    c.fillRect(0, 78, 512, 18);
    c.fillStyle = "#d9a83c";
    c.fillRect(0, 96, 512, 6);
  });
  const sideM = lam("#ffffff", { map: t });
  const plain = lam("#f6f5ef");
  g.add(mesh(new THREE.BoxGeometry(W3, 3.2, D3), [plain, plain, plain, plain, sideM, sideM], X, 2.0, Z));
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const wh = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12), lam("#1e1e1e"), X + sx * (W3 / 2 - 2.2), 0.55, Z + sz * (D3 / 2), false);
      wh.rotation.x = Math.PI / 2;
      g.add(wh);
    }
}

function addTent(g: THREE.Group, x: number, y: number, w: number, d: number, col: string, hl: boolean): void {
  const W3 = w * K3;
  const D3 = d * K3;
  const X = (x + w / 2) * K3;
  const Z = (y + d / 2) * K3;
  g.add(mesh(new THREE.BoxGeometry(W3, 1.4, D3), lam(shade(col, -0.06)), X, 0.7, Z));
  const m = Math.max(W3, D3);
  const rh = Math.max(2.8, m * 0.3);
  const roof = new THREE.ConeGeometry((m / 2) * Math.SQRT2, rh, 4, 1);
  roof.rotateY(Math.PI / 4);
  roof.scale(W3 / m, 1, D3 / m);
  g.add(mesh(roof, flat(col === "#fbfbf7" ? "#f7f6f0" : col), X, 1.4 + rh / 2, Z));
  g.add(mesh(new THREE.BoxGeometry(1.2, 1.2, 0.05), lam("#7d7565"), X, 0.6, Z + D3 / 2 + 0.02, false));
  if (hl) {
    g.add(mesh(new THREE.BoxGeometry(W3 + 0.05, 0.3, D3 + 0.05), lam("#d9a83c"), X, 1.3, Z));
    g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), lam("#6a5034"), X, 4.6, Z));
    const flag = mesh(new THREE.PlaneGeometry(1.6, 0.9), lam("#16634c", { side: THREE.DoubleSide }), X + 0.8, 5.6, Z, false);
    g.add(flag);
  }
}

function addRocks(g: THREE.Group, cx: number, cy: number, w: number, seed: number, col: string): void {
  const r = mulberry32(seed);
  const gs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 11; i++) {
    const s = (12 + r() * 18) * K3;
    const ge = new THREE.IcosahedronGeometry(s, 0);
    ge.scale(1.1, 0.5 + r() * 0.6, 0.8);
    ge.translate((cx + (r() - 0.5) * w) * K3, s * 0.35, (cy + (r() - 0.5) * w * 0.35) * K3);
    gs.push(ge);
  }
  g.add(mesh(mergeGeos(gs), flat(col)));
}

function addWall(g: THREE.Group, d: Extract<M3, { k: "wall" }>): void {
  const dx = (d.x2 - d.x1) * K3;
  const dz = (d.y2 - d.y1) * K3;
  const L = Math.hypot(dx, dz);
  const H = d.h * K3;
  const t1 = wallTexture("#e2d4b8", "arch");
  t1.repeat.set(Math.max(1, Math.round(L / 6)), 1);
  const sideM = lam("#ffffff", { map: t1 });
  const plain = lam("#d8c9ab");
  const b = mesh(new THREE.BoxGeometry(L, H, 1.2), [plain, plain, lam("#cbbb98"), plain, sideM, sideM], ((d.x1 + d.x2) / 2) * K3, H / 2, ((d.y1 + d.y2) / 2) * K3);
  b.rotation.y = -Math.atan2(dz, dx);
  g.add(b);
}

function addPillar(g: THREE.Group, d: Extract<M3, { k: "pillar" }>): void {
  const [X, Z] = P3(d.x, d.y);
  const H = d.h * K3;
  const R = d.r * K3;
  g.add(mesh(new THREE.CylinderGeometry(R, R * 1.1, H, 10), lam(d.col), X, H / 2, Z));
  g.add(mesh(new THREE.BoxGeometry(R * 3, 0.4, R * 3), lam(shade(d.col, -0.12)), X, H + 0.2, Z));
  g.add(mesh(new THREE.BoxGeometry(R * 2.6, 0.3, R * 2.6), lam("#b99a5a"), X, 0.15, Z));
}

function addKaabah(g: THREE.Group): void {
  const side = KS * Math.SQRT2 * K3; // ±8.2
  const H = 8.6;
  const k = new THREE.Group();
  k.rotation.y = Math.PI / 4;
  g.add(k);
  // Syazarwan (tapak marmar)
  k.add(mesh(new THREE.BoxGeometry(side + 0.7, 0.35, side + 0.7), lam("#d9d4c6"), 0, 0.17, 0));
  k.add(mesh(new THREE.BoxGeometry(side, H, side), lam("#141416"), 0, H / 2, 0));
  // kain putih di bahagian bawah (kiswah dinaikkan ±3 m pada musim haji)
  k.add(mesh(new THREE.BoxGeometry(side + 0.06, 2.0, side + 0.06), lam("#ffffff", { emissive: new THREE.Color("#2a2a26") }), 0, 1.0 + 0.35, 0));
  // hizam emas dengan kaligrafi
  const hz = canvasTex(
    512,
    64,
    (c) => {
      c.fillStyle = "#b88b2c";
      c.fillRect(0, 0, 512, 64);
      c.strokeStyle = "#f3d27a";
      c.lineWidth = 3;
      for (let i = 0; i < 9; i++) {
        c.beginPath();
        const x = i * 56 + 8;
        c.moveTo(x, 44);
        c.bezierCurveTo(x + 10, 10, x + 24, 54, x + 34, 20);
        c.lineTo(x + 46, 40);
        c.stroke();
      }
      c.fillStyle = "#e9c46a";
      c.fillRect(0, 0, 512, 5);
      c.fillRect(0, 59, 512, 5);
    },
    true
  );
  hz.repeat.set(2, 1);
  const gold = lam("#ffffff", { map: hz });
  const goldTop = lam("#b88b2c");
  k.add(mesh(new THREE.BoxGeometry(side + 0.08, 0.75, side + 0.08), [gold, gold, goldTop, goldTop, gold, gold], 0, H * 0.7, 0));
  // pintu (dinding timur laut, ±2.13 m dari lantai)
  const doorT = canvasTex(128, 192, (c) => {
    c.fillStyle = "#c9a043";
    c.fillRect(0, 0, 128, 192);
    c.fillStyle = "#1b1b1b";
    c.fillRect(14, 16, 100, 164);
    c.strokeStyle = "#f0cf72";
    c.lineWidth = 4;
    c.strokeRect(14, 16, 100, 164);
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.arc(64, 40 + i * 24, 14, 0, TAU);
      c.stroke();
    }
  });
  // Dalam ruang tempatan kumpulan (diputar 45°), dinding timur laut = muka +X? Kira terus dalam dunia:
  const door = mesh(new THREE.PlaneGeometry(1.4, 2.4), lam("#ffffff", { map: doorT, emissive: new THREE.Color("#2a1e06") }), 0, 0, 0, false);
  const nx = Math.SQRT1_2;
  const nz = -Math.SQRT1_2; // normal muka timur laut dalam dunia (+X, −Z)
  const half = side / 2 + 0.07;
  // anjak ke arah penjuru Hajarul Aswad (timur)
  door.position.set(nx * half + 1.0 * Math.SQRT1_2, 1.47 + 1.2, nz * half + 1.0 * Math.SQRT1_2);
  door.rotation.y = Math.atan2(nx, nz);
  g.add(door);
  // Hajarul Aswad (penjuru timur, ±1.5 m)
  const ring = mesh(new THREE.TorusGeometry(0.32, 0.1, 8, 20), lam("#d0d0d6"), KS * K3 + 0.05, 1.05, 0, false);
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  g.add(mesh(new THREE.SphereGeometry(0.26, 10, 8), lam("#151515"), KS * K3 + 0.02, 1.05, 0, false));
  // Mizab (pancur emas) di dinding barat laut, menghala ke Hijir Ismail
  const mz = mesh(new THREE.BoxGeometry(0.3, 0.25, 1.6), lam("#d9ab46"), -1.9, H - 0.4, -1.9, false);
  mz.rotation.y = Math.PI / 4;
  g.add(mz);
  // Hijir Ismail: dinding separuh bulatan ±1.3 m
  const sh = new THREE.Shape();
  const a0 = (165 * Math.PI) / 180;
  const a1 = (285 * Math.PI) / 180;
  const cx = HIJR.x * K3;
  const cz = HIJR.y * K3;
  const ro = HIJR.r * K3 + 0.3;
  const ri = HIJR.r * K3 - 0.15;
  sh.absarc(cx, cz, ro, a0, a1, false);
  sh.absarc(cx, cz, ri, a1, a0, true);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: false, curveSegments: 40 });
  hg.rotateX(Math.PI / 2);
  hg.translate(0, 1.0, 0);
  g.add(mesh(hg, lam("#f1eee6")));
}

function addMaqam(g: THREE.Group, x: number, y: number): void {
  const [X, Z] = P3(x, y);
  g.add(mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.35, 8), lam("#d9d4c6"), X, 0.17, Z));
  g.add(mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.6, 8, 1, true), lam("#b08a3c", { side: THREE.DoubleSide, wireframe: false }), X, 1.15, Z));
  g.add(mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 8), lam("#cfe6ec", { transparent: true, opacity: 0.55 }), X, 1.1, Z, false));
  g.add(mesh(new THREE.SphereGeometry(0.6, 12, 8, 0, TAU, 0, Math.PI / 2), lam("#d4ae55"), X, 1.95, Z));
  g.add(mesh(new THREE.ConeGeometry(0.1, 0.6, 6), lam("#e6c25a"), X, 2.8, Z, false));
}

function addArcade(g: THREE.Group, r0: number, r1: number, h: number): void {
  const sh = new THREE.Shape();
  sh.absarc(0, 0, r1 * K3, 0, TAU, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, r0 * K3, 0, TAU, true);
  sh.holes.push(hole);
  const ge = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false, curveSegments: 90 });
  ge.rotateX(Math.PI / 2);
  ge.translate(0, h * K3 + 0.6, 0);
  g.add(mesh(ge, lam("#e9dcc0")));
}

function addGate(g: THREE.Group, x0: number, x1: number, y: number): void {
  const Z = y * K3;
  for (const x of [x0, x1]) g.add(mesh(new THREE.BoxGeometry(2.6, 9, 2.6), lam("#e5d8bd"), x * K3, 4.5, Z));
  g.add(mesh(new THREE.BoxGeometry((x1 - x0) * K3 + 2.6, 1.6, 2.6), lam("#e5d8bd"), ((x0 + x1) / 2) * K3, 9.8, Z));
  g.add(mesh(new THREE.BoxGeometry((x1 - x0) * K3 + 2.8, 0.3, 2.8), lam("#c9a24a"), ((x0 + x1) / 2) * K3, 10.75, Z));
  const t = signTexture("PINTU KING ABDUL AZIZ");
  g.add(mesh(new THREE.PlaneGeometry(10, 1.25), lam("#ffffff", { map: t }), ((x0 + x1) / 2) * K3, 9.8, Z + 1.32, false));
  const arch = mesh(new THREE.TorusGeometry(((x1 - x0) / 2) * K3, 0.35, 6, 24, Math.PI), lam("#d8c9ab"), ((x0 + x1) / 2) * K3, 6.2, Z, false);
  g.add(arch);
}

function addGreen(g: THREE.Group, x0: number, x1: number, y: number): void {
  const Z = y * K3;
  const L = (x1 - x0) * K3;
  g.add(mesh(new THREE.BoxGeometry(L, 0.35, 0.5), basic("#3fe08a"), ((x0 + x1) / 2) * K3, 5.2, Z, false));
  for (const x of [x0 + 2, x1 - 2]) {
    g.add(mesh(new THREE.BoxGeometry(0.3, 5.2, 0.3), basic("#2fc470"), x * K3, 2.6, Z, false));
  }
  const glow = mesh(new THREE.PlaneGeometry(L, 2.2), basic("#6dffb0", { transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }), ((x0 + x1) / 2) * K3, 4.1, Z, false);
  g.add(glow);
}

function addSkyline(g: THREE.Group): void {
  const r = mulberry32(5);
  const blockT = wallTexture("#cdbb9a", "win");
  const mk = (x: number, z: number, w: number, d: number, h: number): void => {
    const t = blockT.clone();
    t.needsUpdate = true;
    t.repeat.set(Math.round(w / 6), Math.round(h / 5));
    BUILD_TEX.push(t);
    g.add(mesh(new THREE.BoxGeometry(w, h, d), lam("#ffffff", { map: t }), x, h / 2, z, false));
  };
  for (let i = 0; i < 26; i++) {
    const side = i % 4;
    const w = 14 + r() * 16;
    const h = 14 + r() * 32;
    if (side === 0) mk(-75 + r() * 160, 112 + r() * 30, w, 12 + r() * 10, h);
    else if (side === 1) mk(95 + r() * 30, -70 + r() * 150, 12 + r() * 10, w, h);
    else if (side === 2) mk(-95 - r() * 30, -70 + r() * 150, 12 + r() * 10, w, h);
    else mk(-70 + r() * 150, -78 - r() * 30, w, 12 + r() * 10, h);
  }
  // Menara Jam (Abraj al-Bait) di selatan
  const X = 0;
  const Z = 150;
  g.add(mesh(new THREE.BoxGeometry(34, 46, 26), lam("#d9c9a8", { map: (() => { const t = blockT.clone(); t.needsUpdate = true; t.repeat.set(6, 9); BUILD_TEX.push(t); return t; })() }), X, 23, Z, false));
  g.add(mesh(new THREE.BoxGeometry(15, 40, 15), lam("#e2d3b3"), X, 66, Z, false));
  const face = canvasTex(256, 256, (c) => {
    c.fillStyle = "#f6f3e6";
    c.beginPath();
    c.arc(128, 128, 118, 0, TAU);
    c.fill();
    c.strokeStyle = "#1f7a3f";
    c.lineWidth = 16;
    c.stroke();
    c.strokeStyle = "#b88b2c";
    c.lineWidth = 10;
    c.beginPath();
    c.moveTo(128, 128);
    c.lineTo(128, 46);
    c.moveTo(128, 128);
    c.lineTo(186, 150);
    c.stroke();
  });
  const fm = lam("#ffffff", { map: face, emissive: new THREE.Color("#303020") });
  for (const [dx, dz, ry] of [
    [0, -7.6, Math.PI],
    [0, 7.6, 0],
    [-7.6, 0, -Math.PI / 2],
    [7.6, 0, Math.PI / 2],
  ]) {
    const f = mesh(new THREE.PlaneGeometry(12, 12), fm, X + dx, 76, Z + dz, false);
    f.rotation.y = ry;
    g.add(f);
  }
  g.add(mesh(new THREE.ConeGeometry(5, 18, 8), lam("#c9a24a", { emissive: new THREE.Color("#3a2a08") }), X, 95, Z, false));
  g.add(mesh(new THREE.TorusGeometry(1.6, 0.35, 8, 20, Math.PI * 1.5), lam("#e6c25a"), X, 107, Z, false));
}

function addJamrah(g: THREE.Group, x: number, y: number, rx: number, ry: number): void {
  const [X, Z] = P3(x, y);
  const sh = new THREE.Shape();
  sh.absellipse(X, Z, (rx + 8) * K3, (ry + 7) * K3, 0, TAU, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(X, Z, rx * K3, ry * K3, 0, TAU, true, 0);
  sh.holes.push(hole);
  const ge = new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: false, curveSegments: 40 });
  ge.rotateX(Math.PI / 2);
  ge.translate(0, 1.0, 0);
  g.add(mesh(ge, lam("#c2bbac")));
  const t = wallTexture("#cfc6b2", "plain");
  t.repeat.set(3, 2);
  g.add(mesh(new THREE.BoxGeometry(11.6, 7.4, 1.2), lam("#ffffff", { map: t }), X, 3.7, Z));
  // payung besar di atas jamrah
  for (const dx of [-4.5, 4.5]) {
    g.add(mesh(new THREE.CylinderGeometry(0.18, 0.22, 13, 8), lam("#e9e6de"), X + dx, 6.5, Z - 5.5));
    const um = mesh(new THREE.ConeGeometry(6, 1.8, 10, 1, true), lam("#fbfaf4", { side: THREE.DoubleSide }), X + dx, 13.4, Z - 5.5);
    g.add(um);
  }
}

function addHill(g: THREE.Group, x: number, y: number, rx: number, ry: number, h: number): void {
  const [X, Z] = P3(x, y);
  const ge = new THREE.ConeGeometry(rx * K3, h * K3, 11, 4);
  const pos = ge.getAttribute("position") as THREE.BufferAttribute;
  const r = mulberry32(42);
  for (let i = 0; i < pos.count; i++) {
    const py = pos.getY(i);
    if (py < (h * K3) / 2 - 0.1) {
      pos.setX(i, pos.getX(i) * (0.85 + r() * 0.3));
      pos.setZ(i, pos.getZ(i) * (0.85 + r() * 0.3));
      pos.setY(i, py + (r() - 0.5) * 1.2);
    }
  }
  ge.computeVertexNormals();
  ge.scale(1, 1, ry / rx);
  g.add(mesh(ge, flat("#a98f6c"), X, (h * K3) / 2 - 0.4, Z));
  g.add(mesh(new THREE.BoxGeometry(0.9, 5, 0.9), lam("#f7f3ea"), X, h * K3 + 2.0, Z));
}

function addSign(g: THREE.Group, x: number, y: number, text: string): void {
  const [X, Z] = P3(x, y);
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.6, 6), lam("#6a5034"), X, 2.3, Z));
  const t = signTexture(text, "#f2c230", "#4a3505");
  const p = mesh(new THREE.BoxGeometry(0.12, 1.3, 5.0), [lam("#ffffff", { map: t }), lam("#ffffff", { map: t }), lam("#f2c230"), lam("#f2c230"), lam("#f2c230"), lam("#f2c230")], X, 4.4, Z);
  g.add(p);
}

function addPole(g: THREE.Group, x: number, y: number): void {
  const [X, Z] = P3(x, y);
  const t = canvasTex(
    64,
    128,
    (c) => {
      for (let i = 0; i < 8; i++) {
        c.fillStyle = i % 2 ? "#c4452f" : "#ffffff";
        c.fillRect(0, i * 16, 64, 16);
      }
    },
    true
  );
  g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 10), lam("#ffffff", { map: t }), X, 2.2, Z));
}

function addMountains(g: THREE.Group, x0: number, y0: number, x1: number, y1: number, col: string, seed: number): void {
  const r = mulberry32(seed);
  const cx = ((x0 + x1) / 2) * K3;
  const cz = ((y0 + y1) / 2) * K3;
  const ax = ((x1 - x0) / 2) * K3;
  const az = ((y1 - y0) / 2) * K3;
  const gs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * TAU + r() * 0.1;
    const k = 1.25 + r() * 0.5;
    const hgt = 14 + r() * 34;
    const ge = new THREE.ConeGeometry(14 + r() * 16, hgt, 6, 1);
    ge.rotateY(r() * TAU);
    ge.translate(cx + Math.cos(a) * ax * k, hgt / 2 - 1, cz + Math.sin(a) * az * k);
    gs.push(ge);
  }
  g.add(mesh(mergeGeos(gs), flat(col), 0, 0, 0, false));
}

function addStarfield(g: THREE.Group): void {
  const n = 500;
  const arr = new Float32Array(n * 3);
  const r = mulberry32(9);
  for (let i = 0; i < n; i++) {
    const a = r() * TAU;
    const e = 0.12 + r() * 1.3;
    arr[i * 3] = Math.cos(a) * Math.cos(e) * 600;
    arr[i * 3 + 1] = Math.sin(e) * 600;
    arr[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 600;
  }
  const ge = new THREE.BufferGeometry();
  ge.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  const pts = new THREE.Points(ge, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false }));
  g.add(pts);
}

// ---------------------------------------------------------------------
//  Jemaah (instanced) & watak pemain
// ---------------------------------------------------------------------
const PG = {
  body: null as THREE.BufferGeometry | null,
  head: null as THREE.BufferGeometry | null,
  hair: null as THREE.BufferGeometry | null,
  veil: null as THREE.BufferGeometry | null,
  cape: null as THREE.BufferGeometry | null,
  face: null as THREE.BufferGeometry | null,
  hands: null as THREE.BufferGeometry | null,
};
function personGeos(): void {
  if (PG.body) return;
  PG.body = mergeGeos([
    new THREE.CylinderGeometry(0.4, 0.5, 1.3, 12).translate(0, 0.65, 0),
    new THREE.SphereGeometry(0.4, 12, 6, 0, TAU, 0, Math.PI / 2).scale(1, 0.45, 1).translate(0, 1.3, 0),
  ]);
  PG.head = new THREE.SphereGeometry(0.34, 14, 10).translate(0, 1.7, 0);
  PG.hair = new THREE.SphereGeometry(0.36, 14, 8, 0, TAU, 0, Math.PI * 0.5).translate(0, 1.74, -0.02);
  PG.veil = new THREE.SphereGeometry(0.44, 12, 10).scale(1, 1.08, 1).translate(0, 1.64, -0.04);
  PG.cape = new THREE.ConeGeometry(0.62, 0.95, 12, 1, true).translate(0, 1.32, 0);
  PG.face = new THREE.SphereGeometry(0.27, 10, 8).scale(1, 1.12, 0.75).translate(0, 1.62, 0.25);
  PG.hands = mergeGeos([new THREE.SphereGeometry(0.13, 8, 6).translate(0.5, 1.62, 0.2), new THREE.SphereGeometry(0.13, 8, 6).translate(-0.5, 1.62, 0.2)]);
}
function makePeople(cap: number, g: THREE.Group): PeopleInst {
  personGeos();
  const mk = (geo: THREE.BufferGeometry, ds = false): THREE.InstancedMesh => {
    const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff, side: ds ? THREE.DoubleSide : THREE.FrontSide }), cap);
    m.castShadow = true;
    m.receiveShadow = false;
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    g.add(m);
    return m;
  };
  return {
    cap,
    meshes: {
      body: mk(PG.body as THREE.BufferGeometry),
      head: mk(PG.head as THREE.BufferGeometry),
      hair: mk(PG.hair as THREE.BufferGeometry),
      veil: mk(PG.veil as THREE.BufferGeometry),
      cape: mk(PG.cape as THREE.BufferGeometry, true),
      face: mk(PG.face as THREE.BufferGeometry),
      hands: mk(PG.hands as THREE.BufferGeometry),
    },
  };
}
const colCache = new Map<string, THREE.Color>();
function tcol(s: string): THREE.Color {
  let c = colCache.get(s);
  if (!c) {
    c = new THREE.Color(s);
    colCache.set(s, c);
  }
  return c;
}
function hairColor(p: Person): string {
  if (!p.ihram) return "#f6f4ec";
  if (p.shaved) return shade(p.skin, -0.12);
  return p.hair;
}

let _m4: THREE.Matrix4;
let _q: THREE.Quaternion;
let _v: THREE.Vector3;
let _s: THREE.Vector3;
let _e: THREE.Euler;
let _Z: THREE.Matrix4;
function mathInit(): void {
  if (_m4) return;
  _m4 = new THREE.Matrix4();
  _q = new THREE.Quaternion();
  _v = new THREE.Vector3();
  _s = new THREE.Vector3(1, 1, 1);
  _e = new THREE.Euler();
  _Z = new THREE.Matrix4().makeScale(0, 0, 0);
}
function personMatrix(p: Person, out: THREE.Matrix4): void {
  const bob = p.moving ? Math.abs(Math.sin(p.walk)) * 0.07 : 0;
  const ry = Math.atan2(p.dx, p.dy);
  _v.set(p.x * K3, bob, p.y * K3);
  _s.set(1, 1, 1);
  if (p.pose === "sleep") {
    _e.set(-Math.PI / 2, ry, 0, "YXZ");
    _v.y = 0.4;
  } else {
    _e.set(p.moving ? 0.06 : 0, ry, 0, "YXZ");
    if (p.pose === "sit") _s.set(1, 0.62, 1);
  }
  _q.setFromEuler(_e);
  out.compose(_v, _q, _s);
}
function updatePeople(pi: PeopleInst, npcs: NPC[], colors: boolean): void {
  const M = pi.meshes;
  const n = Math.min(npcs.length, pi.cap);
  for (let i = 0; i < pi.cap; i++) {
    if (i >= n) {
      for (const k of Object.keys(M) as (keyof typeof M)[]) M[k].setMatrixAt(i, _Z);
      continue;
    }
    const p = npcs[i].p;
    personMatrix(p, _m4);
    const fem = p.gender === "P";
    M.body.setMatrixAt(i, _m4);
    M.head.setMatrixAt(i, fem ? _Z : _m4);
    M.hair.setMatrixAt(i, fem ? _Z : _m4);
    M.veil.setMatrixAt(i, fem ? _m4 : _Z);
    M.cape.setMatrixAt(i, fem ? _m4 : _Z);
    M.face.setMatrixAt(i, fem ? _m4 : _Z);
    M.hands.setMatrixAt(i, p.pose === "pray" || p.pose === "throw" ? _m4 : _Z);
    if (colors) {
      const body = p.ihram ? "#f7f7f2" : p.outfit;
      M.body.setColorAt(i, tcol(body));
      M.head.setColorAt(i, tcol(p.skin));
      M.hair.setColorAt(i, tcol(hairColor(p)));
      const scarf = p.ihram ? "#ffffff" : p.acc;
      M.veil.setColorAt(i, tcol(scarf));
      M.cape.setColorAt(i, tcol(scarf));
      M.face.setColorAt(i, tcol(p.skin));
      M.hands.setColorAt(i, tcol(p.skin));
    }
  }
  for (const k of Object.keys(M) as (keyof typeof M)[]) {
    M[k].instanceMatrix.needsUpdate = true;
    if (colors && M[k].instanceColor) (M[k].instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true;
  }
}

function makeRig(): PlayerRig {
  personGeos();
  const root = new THREE.Group();
  const L = (c: string): THREE.MeshLambertMaterial => new THREE.MeshLambertMaterial({ color: new THREE.Color(c) });
  const body = mesh(PG.body as THREE.BufferGeometry, L("#f7f7f2"));
  const head = mesh(PG.head as THREE.BufferGeometry, L("#e8b68c"));
  const hair = mesh(PG.hair as THREE.BufferGeometry, L("#1d1a17"));
  const veil = mesh(PG.veil as THREE.BufferGeometry, L("#ffffff"));
  const capeM = L("#ffffff");
  capeM.side = THREE.DoubleSide;
  const cape = mesh(PG.cape as THREE.BufferGeometry, capeM);
  const face = mesh(PG.face as THREE.BufferGeometry, L("#e8b68c"));
  const shoulder = mesh(new THREE.SphereGeometry(0.2, 10, 8), L("#e8b68c"), -0.3, 1.24, 0.04);
  root.add(body, head, hair, veil, cape, face, shoulder);
  const armMats: THREE.MeshLambertMaterial[] = [];
  const arm = (sx: number): THREE.Group => {
    const gq = new THREE.Group();
    gq.position.set(sx * 0.42, 1.22, 0);
    const m = L("#f7f7f2");
    armMats.push(m);
    const a = mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.62, 8).translate(0, -0.31, 0), m);
    const hm = L("#e8b68c");
    armMats.push(hm);
    const h = mesh(new THREE.SphereGeometry(0.12, 8, 6).translate(0, -0.66, 0), hm);
    gq.add(a, h);
    root.add(gq);
    return gq;
  };
  const armL = arm(1);
  const armR = arm(-1);
  const ring = mesh(new THREE.TorusGeometry(0.8, 0.06, 6, 32), basic("#d9a83c"), 0, 0.04, 0, false);
  ring.rotation.x = Math.PI / 2;
  root.add(ring);
  const fallback = new THREE.Group();
  fallback.add(body, head, hair, veil, cape, face, shoulder, armL, armR);
  root.add(fallback);
  const rig: PlayerRig = { root, fallback, avatar: null, body, head, hair, veil, cape, face, shoulder, armL, armR, armMats, key: "" };
  void fetchModel("models/jemaah-v1.glb").then((model) => {
    if (!model) return; // Existing character stays playable on network/load failure.
    const avatar = model.clone(true);
    avatar.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
    });
    avatar.visible = false;
    rig.avatar = avatar;
    root.add(avatar);
  });
  return rig;
}
function updateRig(dt: number): void {
  const r = R3.rig;
  if (!r) return;
  r.root.visible = C3.mode !== "eye" && !miqatPrivate();
  r.root.position.set(P.x * K3, P.moving ? Math.abs(Math.sin(P.walk)) * 0.07 : 0, P.y * K3);
  const target = Math.atan2(P.dx, P.dy);
  r.root.rotation.y += wrapPi(target - r.root.rotation.y) * Math.min(1, dt * 14);
  const fem = P.gender === "P";
  const key = [P.gender, P.ihram, P.shaved, P.outfit, P.acc].join();
  if (key !== r.key) {
    r.key = key;
    const body = P.ihram ? "#f7f7f2" : P.outfit;
    (r.body.material as THREE.MeshLambertMaterial).color.set(body);
    (r.hair.material as THREE.MeshLambertMaterial).color.set(hairColor(P));
    const scarf = P.ihram ? "#ffffff" : P.acc;
    (r.veil.material as THREE.MeshLambertMaterial).color.set(scarf);
    (r.cape.material as THREE.MeshLambertMaterial).color.set(scarf);
    r.armMats[0].color.set(fem && !P.ihram ? shade(P.outfit, -0.06) : body);
    r.armMats[2].color.set(fem && !P.ihram ? shade(P.outfit, -0.06) : body);
    for (const m of [r.head, r.face, r.shoulder]) (m.material as THREE.MeshLambertMaterial).color.set(P.skin);
    r.armMats[1].color.set(P.skin);
    r.armMats[3].color.set(P.skin);
    r.head.visible = !fem;
    r.hair.visible = !fem;
    r.veil.visible = fem;
    r.cape.visible = fem;
    r.face.visible = fem;
    r.shoulder.visible = !fem && P.ihram;
  }
  let la = 0;
  let ra = 0;
  if (P.pose === "pray") {
    la = -2.3;
    ra = -2.3;
  } else if (P.pose === "throw") {
    ra = -2.9;
  } else if (P.moving) {
    la = Math.sin(P.walk) * 0.55;
    ra = -la;
  }
  r.armL.rotation.x += (la - r.armL.rotation.x) * Math.min(1, dt * 12);
  r.armR.rotation.x += (ra - r.armR.rotation.x) * Math.min(1, dt * 12);
  const detailed = !!r.avatar && !fem && P.ihram;
  r.fallback.visible = !detailed;
  r.fallback.rotation.set(0, 0, 0);
  r.fallback.scale.set(1, 1, 1);
  if (r.avatar) {
    r.avatar.visible = detailed;
    const av = r.avatar;
    const h = av.getObjectByName("Hair");
    if (h) h.visible = !P.shaved;
    const l = av.getObjectByName("ArmL"), rr = av.getObjectByName("ArmR");
    if (l) l.rotation.x = r.armL.rotation.x;
    if (rr) rr.rotation.x = r.armR.rotation.x;
    const ll = av.getObjectByName("LegL"), rl = av.getObjectByName("LegR");
    if (ll) ll.rotation.x = P.moving ? -la * 0.48 : 0;
    if (rl) rl.rotation.x = P.moving ? la * 0.48 : 0;
    const up = av.getObjectByName("UpperBody");
    if (up) { up.rotation.x = 0; up.position.y = 1.02; }
    av.scale.set(1, 1, 1);
    av.position.y = 0;
    applyMiqatPose3D(r, up, l, rr);
  }
  if (!detailed) applyMiqatFallbackPose3D(r);
}

function makeMarkers(sc: THREE.Scene): void {
  const gold = basic("#f2c230");
  R3.tRing = mesh(new THREE.TorusGeometry(2.0, 0.12, 8, 40), gold, 0, 0.08, 0, false);
  R3.tRing.rotation.x = Math.PI / 2;
  R3.tGem = mesh(new THREE.OctahedronGeometry(0.6), lam("#f2c230", { emissive: new THREE.Color("#6a4c08") }), 0, 4, 0, false);
  R3.tBeam = mesh(new THREE.CylinderGeometry(0.5, 0.9, 16, 16, 1, true), basic("#ffd76a", { transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }), 0, 8, 0, false);
  R3.iRing = mesh(new THREE.TorusGeometry(2.5, 0.08, 6, 40), basic("#ffffff", { transparent: true, opacity: 0.85 }), 0, 0.1, 0, false);
  R3.iRing.rotation.x = Math.PI / 2;
  const sh = new THREE.Shape();
  sh.moveTo(0, 1.1);
  sh.lineTo(0.75, -0.4);
  sh.lineTo(0, -0.05);
  sh.lineTo(-0.75, -0.4);
  sh.closePath();
  const ag = new THREE.ShapeGeometry(sh);
  ag.rotateX(-Math.PI / 2);
  R3.arrow = mesh(ag, basic("#f2c230", { side: THREE.DoubleSide, depthTest: false, transparent: true }), 0, 0.12, 0, false);
  R3.arrow.renderOrder = 5;
  sc.add(R3.tRing, R3.tGem, R3.tBeam, R3.iRing, R3.arrow);
  for (let i = 0; i < 40; i++) {
    const s = mesh(new THREE.SphereGeometry(0.16, 6, 5), lam("#6f6a60"), 0, -10, 0, false);
    s.visible = false;
    R3.stonePool.push(s);
    sc.add(s);
  }
}

// ---------------------------------------------------------------------
//  Bina / tukar dunia 3D untuk lokasi semasa
// ---------------------------------------------------------------------
function disposeWorld(): void {
  const w = R3.world;
  if (!w || !R3.scene) return;
  R3.scene.remove(w.group);
  w.group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry && !Object.values(PG).includes(m.geometry)) m.geometry.dispose();
    const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
    for (const mt of mats) mt.dispose();
  });
  for (const t of w.textures) t.dispose();
  matCache.clear();
  R3.world = null;
}

function ensureWorld(): void {
  if (!R3.scene) return;
  if (R3.world && R3.world.id === scene.id) return;
  disposeWorld();
  mathInit();
  BUILD_TEX = [];
  const sc = scene;
  const g = new THREE.Group();
  const b = sc.bounds;
  const tsz = LOWQ ? 1024 : 2048;
  // lantai besar di luar sempadan
  const outer = mesh(new THREE.PlaneGeometry(1600, 1600), lam(shade(sc.bg, -0.06)), 0, -0.05, 0, false);
  outer.rotation.x = -Math.PI / 2;
  g.add(outer);
  const gt = groundTexture(sc, b.x0, b.y0, b.x1, b.y1, tsz);
  const ground = mesh(new THREE.PlaneGeometry((b.x1 - b.x0) * K3, (b.y1 - b.y0) * K3), lam("#ffffff", { map: gt }), ((b.x0 + b.x1) / 2) * K3, 0, ((b.y0 + b.y1) / 2) * K3, false);
  ground.rotation.x = -Math.PI / 2;
  g.add(ground);
  if (sc.id === "makkah") {
    const R = 452;
    const mt = groundTexture(sc, -R, -R, R, R, tsz, R);
    const disc = mesh(new THREE.CircleGeometry(R * K3, 120), lam("#ffffff", { map: mt }), 0, 0.02, 0, false);
    disc.rotation.x = -Math.PI / 2;
    g.add(disc);
  }
  const lamps: THREE.Vector3[] = [];
  let seed = 100;
  // model asas yang akan diganti oleh model .glb dibina dalam kumpulan tersendiri
  const repl = new Set(MODELS3D.filter((m) => m.scene === sc.id && m.replace).map((m) => m.replace as string));
  const subs = new Map<string, THREE.Group>();
  for (const d of sc.m3) {
    let tg = g;
    if (repl.has(d.k)) {
      let sub = subs.get(d.k);
      if (!sub) {
        sub = new THREE.Group();
        sub.name = "asas:" + d.k;
        g.add(sub);
        subs.set(d.k, sub);
      }
      tg = sub;
    }
    addM3(tg, d, lamps, d.k === "tree" ? seed++ : seed);
  }
  const people = makePeople(Math.max(40, sc.npcs.length), g);
  const peb = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.17, 0), flat("#8d877a"), 300);
  peb.frustumCulled = false;
  g.add(peb);
  R3.scene.add(g);
  addMiqatWater(g);
  R3.world = { id: sc.id, group: g, people, peb, pebKey: -1, lamps, textures: BUILD_TEX };
  BUILD_TEX = [];
  updatePeople(people, sc.npcs, true);
  R3.light = "";
  loadModels(sc.id, g, subs);
}

function addM3(g: THREE.Group, d: M3, lamps: THREE.Vector3[], seed: number): void {
  switch (d.k) {
    case "bld":
      addBuilding(g, d);
      break;
    case "palm":
      addPalm(g, d.x, d.y, d.h);
      break;
    case "tree":
      addTree(g, d.x, d.y, d.s, seed);
      break;
    case "board":
      addBoard(g, d.x, d.y, d.title, d.col);
      break;
    case "lamp":
      addLamp(g, d.x, d.y, lamps);
      break;
    case "minaret":
      addMinaret(g, d.x, d.y, d.h, d.col);
      break;
    case "bus":
      addBus(g, d.x, d.y, d.w, d.d);
      break;
    case "tent":
      addTent(g, d.x, d.y, d.w, d.d, d.col, d.hl);
      break;
    case "rocks":
      addRocks(g, d.x, d.y, d.w, d.seed, d.col);
      break;
    case "wall":
      addWall(g, d);
      break;
    case "pillar":
      addPillar(g, d);
      break;
    case "cooler": {
      const [X, Z] = P3(d.x, d.y);
      g.add(mesh(new THREE.BoxGeometry(2.4, 1.6, 1.2), lam("#e9eef2"), X, 0.8, Z));
      g.add(mesh(new THREE.BoxGeometry(2.42, 0.3, 1.22), lam("#3d6fb4"), X, 1.1, Z));
      for (const dx of [-0.5, 0.5]) g.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 10), lam("#9fc3e6", { transparent: true, opacity: 0.85 }), X + dx, 2.0, Z));
      break;
    }
    case "kaabah":
      addKaabah(g);
      break;
    case "maqam":
      addMaqam(g, d.x, d.y);
      break;
    case "arcade":
      addArcade(g, d.r0, d.r1, d.h);
      break;
    case "gate":
      addGate(g, d.x0, d.x1, d.y);
      break;
    case "green":
      addGreen(g, d.x0, d.x1, d.y);
      break;
    case "skyline":
      addSkyline(g);
      break;
    case "jamrah":
      addJamrah(g, d.x, d.y, d.rx, d.ry);
      break;
    case "hill":
      addHill(g, d.x, d.y, d.rx, d.ry, d.h);
      break;
    case "sign":
      addSign(g, d.x, d.y, d.text);
      break;
    case "pole":
      addPole(g, d.x, d.y);
      break;
    case "mountains":
      addMountains(g, d.x0, d.y0, d.x1, d.y1, d.col, d.seed);
      break;
    case "stars":
      addStarfield(g);
      break;
  }
}

// ---------------------------------------------------------------------
//  Model .glb luaran (Blender) — lihat docs/BLENDER.md
// ---------------------------------------------------------------------
interface GltfLoaderLike {
  load(url: string, ok: (g: { scene: THREE.Group }) => void, prog?: unknown, err?: (e: unknown) => void): void;
}
let gltfReady: Promise<boolean> | null = null;
const gltfCache = new Map<string, Promise<THREE.Group | null>>();
function loadGltfLib(): Promise<boolean> {
  if ((THREE as unknown as { GLTFLoader?: unknown }).GLTFLoader) return Promise.resolve(true);
  if (!gltfReady)
    gltfReady = new Promise((res) => {
      const s = document.createElement("script");
      s.src = GLTF_URL;
      s.async = true;
      s.onload = () => res(true);
      s.onerror = () => res(false);
      document.head.appendChild(s);
    });
  return gltfReady;
}
function fetchModel(file: string): Promise<THREE.Group | null> {
  let p = gltfCache.get(file);
  if (!p) {
    p = loadGltfLib().then(
      (ok) =>
        new Promise<THREE.Group | null>((res) => {
          if (!ok) return res(null);
          const L = new (THREE as unknown as { GLTFLoader: new () => GltfLoaderLike }).GLTFLoader();
          L.load(
            file,
            (gl) => res(gl.scene),
            undefined,
            (e) => {
              console.warn("Model 3D gagal dimuat:", file, e);
              res(null);
            }
          );
        })
    );
    gltfCache.set(file, p);
  }
  return p;
}
function loadModels(id: SceneId, g: THREE.Group, subs: Map<string, THREE.Group>): void {
  const list = MODELS3D.filter((m) => m.scene === id);
  for (const m of list) {
    void fetchModel(m.file).then((src) => {
      // pemain mungkin sudah bertukar lokasi semasa model dimuat
      if (!src || !R3.world || R3.world.group !== g) return;
      const obj = src.clone(true);
      const [X, Z] = P3(m.x, m.y);
      obj.position.set(X, 0, Z);
      obj.rotation.y = ((m.rot ?? 0) * Math.PI) / 180;
      obj.scale.setScalar(m.scale ?? 1);
      obj.traverse((o) => {
        const ms = o as THREE.Mesh;
        if (!ms.isMesh) return;
        ms.castShadow = true;
        ms.receiveShadow = true;
        // renderer menggunakan output linear; kekalkan warna asal tekstur Blender
        const mats = Array.isArray(ms.material) ? ms.material : [ms.material];
        for (const mt of mats) {
          const mm = mt as THREE.MeshStandardMaterial;
          if (mm.map) mm.map.encoding = THREE.LinearEncoding;
          if (mm.emissiveMap) mm.emissiveMap.encoding = THREE.LinearEncoding;
          mm.needsUpdate = true;
        }
      });
      g.add(obj);
      if (m.replace) {
        const sub = subs.get(m.replace);
        if (sub) sub.visible = false;
      }
    });
  }
}

function applyLight3D(l: Light): void {
  if (!R3.scene || !R3.hemi || !R3.sun) return;
  if (R3.light === l) return;
  R3.light = l;
  const sc = R3.scene;
  if (l === "night") {
    sc.background = new THREE.Color("#0a1430");
    sc.fog = new THREE.Fog(0x0a1430, 40, 260);
    R3.hemi.color.set("#7b8fc4");
    R3.hemi.groundColor.set("#3a3328");
    R3.hemi.intensity = 0.42;
    R3.sun.color.set("#a9bde8");
    R3.sun.intensity = 0.22;
  } else if (l === "dusk") {
    sc.background = new THREE.Color("#f1a46a");
    sc.fog = new THREE.Fog(0xe9a273, 90, 420);
    R3.hemi.color.set("#ffd2a8");
    R3.hemi.groundColor.set("#8a6a4a");
    R3.hemi.intensity = 0.46;
    R3.sun.color.set("#ff9b58");
    R3.sun.intensity = 0.6;
  } else {
    sc.background = new THREE.Color("#a9cfea");
    sc.fog = new THREE.Fog(0xc6dcea, 140, 560);
    R3.hemi.color.set("#dcebff");
    R3.hemi.groundColor.set("#a89272");
    R3.hemi.intensity = 0.44;
    R3.sun.color.set("#fff0d6");
    R3.sun.intensity = 0.64;
  }
  for (const p of R3.pts) p.intensity = 0;
}

// ---------------------------------------------------------------------
//  Kawalan kamera & input relatif kamera
// ---------------------------------------------------------------------
function input3D(raw: Vec, dt: number): Vec {
  C3.fwdInput = -raw.y;
  if (KEYS.has("KeyQ")) C3.yaw += 1.8 * dt;
  if (KEYS.has("KeyR")) C3.yaw -= 1.8 * dt;
  const fx = -Math.sin(C3.yaw);
  const fz = -Math.cos(C3.yaw);
  if (C3.mode === "eye") {
    C3.yaw -= raw.x * 2.0 * dt;
    const f = -raw.y;
    return { x: fx * f, y: fz * f };
  }
  const rx = Math.cos(C3.yaw);
  const rz = -Math.sin(C3.yaw);
  return { x: rx * raw.x + fx * -raw.y, y: rz * raw.x + fz * -raw.y };
}
function cycleCam(): void {
  if (!R3.active) return;
  const order: CamMode[] = ["back", "eye", "top"];
  C3.mode = order[(order.indexOf(C3.mode) + 1) % order.length];
  if (C3.mode === "eye") {
    C3.yaw = Math.atan2(-P.dx, -P.dy);
    C3.eyePitch = -0.04;
    toast("Pandangan mata jemaah: kayu bedik ke atas untuk berjalan, ke kiri/kanan untuk berpusing. Seret skrin untuk melihat sekeliling.", "info", 5600);
  }
  paintViewControls();
}
function zoom3D(f: number): void {
  if (C3.mode === "eye") C3.fov = clamp(C3.fov / f, 24, 80);
  else if (C3.mode === "top") C3.topDist = clamp(C3.topDist / f, 28, 170);
  else C3.dist = clamp(C3.dist / f, 4.5, 48);
}
function zoomIn(): void {
  if (R3.active) zoom3D(1.15);
  else zoomBy(1.15);
}
function zoomOut(): void {
  if (R3.active) zoom3D(1 / 1.15);
  else zoomBy(1 / 1.15);
}

const DRAG = { ids: new Map<number, { x: number; y: number }>(), pinch: 0 };
function initDrag3D(): void {
  const cv = el("world");
  cv.addEventListener("pointerdown", (e) => {
    if (!R3.active) return;
    DRAG.ids.set(e.pointerId, { x: e.clientX, y: e.clientY });
    cv.setPointerCapture(e.pointerId);
    if (DRAG.ids.size === 2) {
      const [a, b] = Array.from(DRAG.ids.values());
      DRAG.pinch = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });
  cv.addEventListener("pointermove", (e) => {
    const prev = DRAG.ids.get(e.pointerId);
    if (!R3.active || !prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    DRAG.ids.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (DRAG.ids.size >= 2) {
      const [a, b] = Array.from(DRAG.ids.values());
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (DRAG.pinch > 0) zoom3D(d / DRAG.pinch);
      DRAG.pinch = d;
      return;
    }
    C3.lastDrag = T.time;
    C3.yaw -= dx * 0.0065;
    if (C3.mode === "eye") C3.eyePitch = clamp(C3.eyePitch - dy * 0.004, -0.7, 0.6);
    else if (C3.mode === "top") C3.topPitch = clamp(C3.topPitch + dy * 0.004, 0.75, 1.5);
    else C3.pitch = clamp(C3.pitch + dy * 0.004, 0.08, 1.25);
  });
  const end = (e: PointerEvent): void => {
    DRAG.ids.delete(e.pointerId);
    if (DRAG.ids.size < 2) DRAG.pinch = 0;
  };
  cv.addEventListener("pointerup", end);
  cv.addEventListener("pointercancel", end);
}

// ---------------------------------------------------------------------
//  Giroskop: pusing telefon untuk memandang dalam kamera Mata
// ---------------------------------------------------------------------
type OrientPerm = { requestPermission?: () => Promise<string> };
const GYRO = {
  ok: typeof window.DeviceOrientationEvent !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  on: false,
  lastA: null as number | null,
};
function onOrient(e: DeviceOrientationEvent): void {
  if (e.alpha == null || e.beta == null) return;
  const a = (e.alpha * Math.PI) / 180;
  const live = R3.active && C3.mode === "eye" && !modalOpen;
  if (live && GYRO.lastA != null) {
    // putar telefon ke kiri (alpha bertambah) = pandang ke kiri (yaw bertambah)
    C3.yaw += wrapPi(a - GYRO.lastA);
    // telefon tegak (beta ±90°) = pandang lurus; dongak/tunduk ikut kecondongan
    if (window.innerHeight >= window.innerWidth) C3.eyePitch = clamp(((e.beta - 90) * Math.PI) / 180, -0.7, 0.6);
  }
  GYRO.lastA = a;
}
async function setGyro(on: boolean, quiet = false): Promise<boolean> {
  if (!GYRO.ok) return false;
  if (!on) {
    window.removeEventListener("deviceorientation", onOrient);
    GYRO.on = false;
    SET.gyro = false;
    saveSettings();
    return false;
  }
  const perm = (window.DeviceOrientationEvent as unknown as OrientPerm).requestPermission;
  if (perm) {
    // iOS: kebenaran mesti diminta daripada tindakan pengguna
    if (quiet) {
      window.addEventListener("pointerdown", () => void setGyro(true), { once: true });
      return false;
    }
    let res = "denied";
    try {
      res = await perm();
    } catch {
      /* ditolak */
    }
    if (res !== "granted") {
      toast("Kebenaran sensor gerakan ditolak. Giroskop tidak dapat digunakan.", "warn", 4500);
      SET.gyro = false;
      saveSettings();
      return false;
    }
  }
  if (!GYRO.on) window.addEventListener("deviceorientation", onOrient);
  GYRO.on = true;
  GYRO.lastA = null;
  SET.gyro = true;
  saveSettings();
  if (!quiet) toast("Giroskop dihidupkan. Dalam paparan 3D, pilih kamera Mata dan gerakkan telefon untuk memandang sekeliling.", "info", 5500);
  return true;
}

// ---------------------------------------------------------------------
//  Kemas kini & lukis setiap bingkai
// ---------------------------------------------------------------------
function update3D(dt: number): void {
  if (!R3.active || !R3.camera) return;
  ensureWorld(); // loadScene/bilik Miqat buang dunia lama; bina semula di sini
  const w = R3.world;
  if (!w) return;
  const cam = R3.camera;
  applyLight3D(currentLight());
  // kamera
  const tx = P.x * K3;
  const tz = P.y * K3;
  if (C3.mode === "back" && P.moving && C3.fwdInput > 0.3 && T.time - C3.lastDrag > 1.4) {
    const want = Math.atan2(-P.dx, -P.dy);
    C3.yaw += wrapPi(want - C3.yaw) * Math.min(1, dt * 1.1);
  }
  if (C3.mode === "eye") {
    const bob = P.moving ? Math.sin(P.walk * 2) * 0.045 : 0;
    cam.position.set(tx, 1.82 + bob, tz);
    const ep = C3.eyePitch;
    cam.lookAt(tx - Math.sin(C3.yaw) * Math.cos(ep), 1.82 + bob + Math.sin(ep), tz - Math.cos(C3.yaw) * Math.cos(ep));
    if (cam.fov !== C3.fov) {
      cam.fov = C3.fov;
      cam.updateProjectionMatrix();
    }
  } else {
    const top = C3.mode === "top";
    const pitch = top ? C3.topPitch : C3.pitch;
    const dist = top ? C3.topDist : C3.dist;
    _v.set(tx + Math.sin(C3.yaw) * Math.cos(pitch) * dist, 1.2 + Math.sin(pitch) * dist, tz + Math.cos(C3.yaw) * Math.cos(pitch) * dist);
    cam.position.lerp(_v, Math.min(1, dt * 9));
    // pandang sedikit ke hadapan pemain supaya kawasan di hadapan kelihatan di bawah kad tugasan
    const ahead = top ? 0 : Math.min(5, dist * 0.3);
    cam.lookAt(tx - Math.sin(C3.yaw) * ahead, 1.3, tz - Math.cos(C3.yaw) * ahead);
    if (cam.fov !== 55) {
      cam.fov = 55;
      cam.updateProjectionMatrix();
    }
  }
  // matahari mengikut pemain (supaya bayang sentiasa tajam di sekeliling)
  if (R3.sun) {
    R3.sun.position.set(tx + 34, 70, tz + 26);
    R3.sun.target.position.set(tx, 0, tz);
    R3.sun.castShadow = SET.hq;
  }
  // lampu malam: 3 lampu terdekat
  R3.lampT -= dt;
  if (R3.light === "night" && R3.lampT <= 0) {
    R3.lampT = 0.4;
    const near = w.lamps
      .map((v) => ({ v, d: (v.x - tx) ** 2 + (v.z - tz) ** 2 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, R3.pts.length);
    R3.pts.forEach((pl, i) => {
      const n = near[i];
      if (n) {
        pl.position.copy(n.v);
        pl.intensity = 1.3;
      } else pl.intensity = 0;
    });
  }
  // jemaah
  R3.colorT -= dt;
  const colors = R3.colorT <= 0;
  if (colors) R3.colorT = 0.6;
  updatePeople(w.people, scene.npcs, colors);
  updateRig(dt);
  // batu di tanah
  let alive = 0;
  for (const pb of scene.pebbles) if (pb.alive) alive++;
  const key = alive * 1000 + scene.pebbles.length;
  if (key !== w.pebKey) {
    w.pebKey = key;
    let i = 0;
    for (const pb of scene.pebbles) {
      if (i >= 300) break;
      if (pb.alive) {
        _v.set(pb.x * K3, 0.08, pb.y * K3);
        _e.set(pb.x, pb.y, 0);
        _q.setFromEuler(_e);
        _s.setScalar(pb.s / 2.3);
        _m4.compose(_v, _q, _s);
        w.peb.setMatrixAt(i, _m4);
      } else w.peb.setMatrixAt(i, _Z);
      i++;
    }
    for (; i < 300; i++) w.peb.setMatrixAt(i, _Z);
    w.peb.instanceMatrix.needsUpdate = true;
  }
  // batu terbang
  R3.stonePool.forEach((m, i) => {
    const s = stones[i];
    if (!s) {
      m.visible = false;
      return;
    }
    m.visible = true;
    const gx = lerp(s.x0, s.x1, s.t);
    const gy = lerp(s.y0 + 30, s.y1, s.t);
    m.position.set(gx * K3, 1.7 * (1 - s.t) + 0.5 * s.t + Math.sin(Math.PI * s.t) * s.h * K3 * 0.9, gy * K3);
  });
  // penanda sasaran & interaksi
  const t = started ? stepTarget() : null;
  const show = !!t && SET.arrow;
  for (const m of [R3.tRing, R3.tGem, R3.tBeam]) if (m) m.visible = show;
  if (show && t && R3.tRing && R3.tGem && R3.tBeam) {
    const pulse = 1 + Math.sin(T.time * 3.2) * 0.08;
    R3.tRing.position.set(t.x * K3, 0.08, t.y * K3);
    R3.tRing.scale.setScalar(pulse);
    R3.tGem.position.set(t.x * K3, 4 + Math.sin(T.time * 2.4) * 0.35, t.y * K3);
    R3.tGem.rotation.y += dt * 1.6;
    R3.tBeam.position.set(t.x * K3, 8, t.y * K3);
  }
  if (R3.arrow) {
    const far = !!t && SET.arrow && C3.mode !== "eye" && Math.hypot(t.x - P.x, t.y - P.y) > 70;
    R3.arrow.visible = far;
    if (far && t) {
      const a = Math.atan2(t.x - P.x, t.y - P.y);
      R3.arrow.position.set(tx + Math.sin(a) * 2.6, 0.12, tz + Math.cos(a) * 2.6);
      R3.arrow.rotation.y = a + Math.PI;
    }
  }
  if (R3.iRing) {
    const it = bestInteract;
    const on = !!it && !!it.ring && it.enabled();
    R3.iRing.visible = on;
    if (on && it) {
      R3.iRing.position.set(it.x * K3, 0.1, it.y * K3);
      R3.iRing.scale.setScalar(1 + Math.sin(T.time * 5) * 0.06);
    }
  }
}

function render3D(): void {
  if (!R3.renderer || !R3.scene || !R3.camera) return;
  R3.renderer.render(R3.scene, R3.camera);
}

// ---------------------------------------------------------------------
//  Lapisan 2D di atas 3D: label, nama, kompas
// ---------------------------------------------------------------------
function proj(x: number, y: number, h: number): { x: number; y: number; d: number } | null {
  if (!R3.camera) return null;
  _v.set(x * K3, h, y * K3);
  const d = _v.distanceTo(R3.camera.position);
  _v.project(R3.camera);
  if (_v.z > 1 || _v.z < -1) return null;
  return { x: ((_v.x + 1) / 2) * W, y: ((1 - _v.y) / 2) * H, d };
}
function drawOverlay3D(): void {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const maxD = C3.mode === "top" ? 260 : 120;
  for (const L of scene.labels) {
    const h3 = L.h3 ?? (L.kind === "place" ? 4 : 2);
    const s = proj(L.x3 ?? L.x, L.y3 ?? L.y, h3);
    if (!s || s.d > maxD) continue;
    if (L.kind === "small" && s.d > maxD * 0.55) continue;
    const place = L.kind === "place";
    ctx.globalAlpha = clamp(1.4 - s.d / maxD, 0.25, 1);
    ctx.font = place ? `800 11px ${FONT_D}` : `700 10.5px ${FONT_B}`;
    const w = ctx.measureText(L.text).width + 16;
    const h = place ? 20 : 18;
    let bg = "rgba(255,255,255,.9)";
    let fg = "#1c2622";
    if (place) {
      bg = "rgba(15,70,54,.92)";
      fg = "#ffffff";
    } else if (L.kind === "green") {
      bg = "#1f7a3f";
      fg = "#ffffff";
    } else if (L.kind === "warn") {
      bg = "#b5651d";
      fg = "#ffffff";
    }
    ctx.fillStyle = bg;
    rrect(ctx, s.x - w / 2, s.y - h / 2, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.fillText(L.text, s.x, s.y + 0.5);
  }
  ctx.globalAlpha = 1;
  for (const f of floaters) {
    const s = proj(f.x, f.y + 40, 2.8 + f.t * 0.9);
    if (!s) continue;
    ctx.globalAlpha = clamp(1.3 - f.t, 0, 1);
    ctx.font = `800 15px ${FONT_D}`;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(15,60,46,.85)";
    ctx.strokeText(f.text, s.x, s.y);
    ctx.fillStyle = "#ffe08a";
    ctx.fillText(f.text, s.x, s.y);
  }
  ctx.globalAlpha = 1;
  if (!started) return;
  if (C3.mode !== "eye") {
    const s = proj(P.x, P.y, 2.75);
    if (s) {
      ctx.font = `800 11.5px ${FONT_D}`;
      const w = ctx.measureText(S.name).width + 16;
      ctx.fillStyle = "#d9a83c";
      rrect(ctx, s.x - w / 2, s.y - 10, w, 19, 9.5);
      ctx.fill();
      ctx.fillStyle = "#3c2604";
      ctx.fillText(S.name, s.x, s.y + 0.5);
    }
  }
  const t = stepTarget();
  if (t && SET.arrow) {
    const dist = Math.hypot(t.x - P.x, t.y - P.y);
    if (dist < 70) return;
    const m = Math.round(dist * scene.mPerPx);
    const txt = m >= 1000 ? (m / 1000).toFixed(1) + " km" : m + " m";
    if (C3.mode === "eye") {
      // kompas di bahagian bawah tengah skrin
      const ang = Math.atan2(t.x - P.x, t.y - P.y);
      const view = Math.atan2(-Math.sin(C3.yaw), -Math.cos(C3.yaw));
      const rel = wrapPi(ang - view);
      const cx = W / 2;
      const cy = H - (W < 760 ? 190 : 170);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = "rgba(8,42,32,.6)";
      circ(ctx, 0, 0, 26);
      ctx.fill();
      ctx.rotate(-rel);
      ctx.fillStyle = "#f2c230";
      poly(ctx, [0, -19, 11, 10, 0, 4, -11, 10]);
      ctx.fill();
      ctx.restore();
      ctx.font = `800 12px ${FONT_B}`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(15,60,46,.9)";
      ctx.strokeText(txt, cx, cy + 40);
      ctx.fillStyle = "#fff";
      ctx.fillText(txt, cx, cy + 40);
    } else {
      const a = Math.atan2(t.x - P.x, t.y - P.y);
      const s = proj(P.x + Math.sin(a) * 40, P.y + Math.cos(a) * 40, 0.3);
      if (s) {
        ctx.font = `800 11px ${FONT_B}`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(15,60,46,.85)";
        ctx.strokeText(txt, s.x, s.y + 14);
        ctx.fillStyle = "#fff";
        ctx.fillText(txt, s.x, s.y + 14);
      }
    }
  }
}
