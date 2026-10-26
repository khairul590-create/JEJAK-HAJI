// =====================================================================
//  Fail 11: GRAFIK 3D — warna sRGB + tone mapping ACES, kubah langit &
//  pantulan persekitaran yang mengikut waktu ibadah, tahap kualiti
//  (Rendah / Sederhana / Tinggi) dengan penurunan automatik jika perlahan,
//  bloom (Tinggi sahaja) dan bayang bulat di bawah jemaah.
//
//  Kos setiap tahap:
//   Rendah    — tiada bayang-bayang, piksel 1×, bahan ringkas (paling laju)
//   Sederhana — bayang-bayang matahari, marmar & emas berkilat (PBR), piksel ≤1.5×
//   Tinggi    — + bloom pada lampu, bayang 2048, piksel ≤2× (untuk komputer)
// =====================================================================

type Grafik = "rendah" | "sederhana" | "tinggi";
const GRAFIK_NAMES: Record<Grafik, string> = { rendah: "Rendah", sederhana: "Sederhana", tinggi: "Tinggi" };
const GRAFIK_ORDER: Grafik[] = ["rendah", "sederhana", "tinggi"];
const EX_URL = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/";

interface ComposerLike {
  render(): void;
  setSize(w: number, h: number): void;
  setPixelRatio(r: number): void;
  addPass(p: unknown): void;
}
const GFX = {
  patched: false,
  sky: null as THREE.Mesh | null,
  skyKey: "",
  pmrem: null as THREE.PMREMGenerator | null,
  env: null as THREE.WebGLRenderTarget | null,
  composer: null as ComposerLike | null,
  bloomLoading: false,
  fps: { last: 0, t: 0, n: 0, warm: 0, world: "" },
};
function gfxLevel(): number {
  return GRAFIK_ORDER.indexOf(SET.grafik);
}

// ---------------------------------------------------------------------
//  Warna: semua warna hex/CSS dalam kod ialah sRGB. Tukar ke ruang linear
//  apabila ditetapkan supaya pencahayaan & output sRGB tepat (macam
//  ColorManagement dalam Three.js terkini).
// ---------------------------------------------------------------------
function gfxSetup(r: THREE.WebGLRenderer): void {
  if (!GFX.patched) {
    GFX.patched = true;
    const proto = THREE.Color.prototype as unknown as { set: (v: unknown) => THREE.Color };
    const orig = proto.set;
    proto.set = function (this: THREE.Color, v: unknown): THREE.Color {
      orig.call(this, v);
      if (typeof v === "number" || typeof v === "string") this.convertSRGBToLinear();
      return this;
    };
  }
  r.outputEncoding = THREE.sRGBEncoding;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 0.92;
  GFX.pmrem = new THREE.PMREMGenerator(r);
}
function gfxPixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, [1, 1.5, 2][gfxLevel()]);
}

// ---------------------------------------------------------------------
//  Langit & matahari mengikut waktu (pagi, tengah hari, petang, senja, malam)
// ---------------------------------------------------------------------
interface SkyPreset {
  zen: string; // warna langit di atas kepala
  hor: string; // warna ufuk
  gnd: string; // bawah ufuk
  glow: string; // cahaya keliling matahari
  az: number; // azimut matahari (0 utara, 90 timur)
  el: number; // ketinggian matahari (darjah)
  sunCol: string;
  sunI: number;
  hemiSky: string;
  hemiGnd: string;
  hemiI: number;
  fog: string;
  fogN: number;
  fogF: number;
  disc: boolean;
}
const SKY: Record<string, SkyPreset> = {
  pagi: { zen: "#6f9fd2", hor: "#f2dcc0", gnd: "#cbb593", glow: "#fff1cf", az: 100, el: 24, sunCol: "#ffdcb0", sunI: 0.9, hemiSky: "#dbe8fb", hemiGnd: "#a48e6e", hemiI: 0.48, fog: "#e6dccb", fogN: 160, fogF: 620, disc: true },
  siang: { zen: "#3f82cc", hor: "#d3e4f1", gnd: "#cfba96", glow: "#ffffff", az: 190, el: 72, sunCol: "#fff3e0", sunI: 0.95, hemiSky: "#dcebff", hemiGnd: "#ad9674", hemiI: 0.46, fog: "#d4e2ec", fogN: 170, fogF: 660, disc: true },
  petang: { zen: "#5089c7", hor: "#f1dcbc", gnd: "#c9b18b", glow: "#ffe4b0", az: 255, el: 34, sunCol: "#ffe0b2", sunI: 0.92, hemiSky: "#dce6f5", hemiGnd: "#a88e68", hemiI: 0.46, fog: "#e7dac4", fogN: 160, fogF: 620, disc: true },
  senja: { zen: "#33508e", hor: "#ffad6a", gnd: "#7d5d44", glow: "#ffd38f", az: 285, el: 5, sunCol: "#ff9d5a", sunI: 0.85, hemiSky: "#ffd2a8", hemiGnd: "#6f5040", hemiI: 0.5, fog: "#e7a274", fogN: 90, fogF: 430, disc: true },
  malam: { zen: "#040a1c", hor: "#17264d", gnd: "#0b0d12", glow: "#2a3b6a", az: 120, el: 55, sunCol: "#a6bcea", sunI: 0.16, hemiSky: "#5d6f9e", hemiGnd: "#1c1a16", hemiI: 0.26, fog: "#0c1530", fogN: 40, fogF: 270, disc: false },
};
function skyKeyNow(): string {
  const l = currentLight();
  if (l === "night") return "malam";
  if (l === "dusk") return "senja";
  const st = curStep();
  const t = st && st.scene === scene.id ? st.time ?? "" : "";
  if (/Pagi|Subuh|Dhuha/i.test(t)) return "pagi";
  if (/Petang|Asar/i.test(t)) return "petang";
  return "siang";
}
function sunDir(p: SkyPreset, minEl = 0): THREE.Vector3 {
  const az = (p.az * Math.PI) / 180;
  const el = (Math.max(p.el, minEl) * Math.PI) / 180;
  // paksi dunia: +X timur, -Z utara
  return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
}
function skyTexture(p: SkyPreset): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, p.zen);
  g.addColorStop(0.38, p.zen);
  g.addColorStop(0.5, p.hor);
  g.addColorStop(0.53, p.gnd);
  g.addColorStop(1, p.gnd);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  // jerebu ufuk
  const hz = c.createLinearGradient(0, H * 0.4, 0, H * 0.56);
  hz.addColorStop(0, "rgba(255,255,255,0)");
  hz.addColorStop(0.7, p.hor);
  hz.addColorStop(1, "rgba(255,255,255,0)");
  c.globalAlpha = 0.55;
  c.fillStyle = hz;
  c.fillRect(0, H * 0.4, W, H * 0.16);
  c.globalAlpha = 1;
  // cahaya & cakera matahari pada arah sebenar (lihat pemetaan u/v SphereGeometry)
  const d = sunDir(p);
  let u = Math.atan2(d.z, -d.x) / (Math.PI * 2);
  if (u < 0) u += 1;
  const v = ((90 - p.el) / 180) * H;
  for (const du of [-1, 0, 1]) {
    const x = (u + du) * W;
    const rg = c.createRadialGradient(x, v, 0, x, v, p.disc ? 260 : 160);
    rg.addColorStop(0, p.glow);
    rg.addColorStop(0.08, p.glow);
    rg.addColorStop(1, "rgba(255,255,255,0)");
    c.globalAlpha = p.disc ? 0.75 : 0.35;
    c.fillStyle = rg;
    c.fillRect(x - 280, v - 280, 560, 560);
    if (p.disc) {
      c.globalAlpha = 1;
      c.fillStyle = "#fffaf0";
      c.beginPath();
      c.arc(x, v, 9, 0, Math.PI * 2);
      c.fill();
    }
  }
  c.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.encoding = THREE.sRGBEncoding;
  return t;
}
function gfxApplySky(force = false): void {
  if (!R3.scene || !R3.hemi || !R3.sun || !R3.renderer) return;
  const key = skyKeyNow();
  if (!force && key === GFX.skyKey && GFX.sky) return;
  GFX.skyKey = key;
  const p = SKY[key];
  const sc = R3.scene;
  const tex = skyTexture(p);
  if (!GFX.sky) {
    const m = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false });
    GFX.sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), m);
    GFX.sky.renderOrder = -2;
    GFX.sky.frustumCulled = false;
    sc.add(GFX.sky);
  } else {
    const m = GFX.sky.material as THREE.MeshBasicMaterial;
    m.map?.dispose();
    m.map = tex;
    m.needsUpdate = true;
  }
  sc.background = new THREE.Color(p.hor);
  const fog = new THREE.Fog(0x000000, p.fogN, p.fogF);
  fog.color.set(p.fog);
  sc.fog = fog;
  R3.hemi.color.set(p.hemiSky);
  R3.hemi.groundColor.set(p.hemiGnd);
  R3.hemi.intensity = p.hemiI;
  R3.sun.color.set(p.sunCol);
  R3.sun.intensity = p.sunI;
  // pantulan persekitaran untuk bahan PBR (marmar, emas, model Blender)
  if (GFX.pmrem) {
    GFX.env?.dispose();
    GFX.env = GFX.pmrem.fromEquirectangular(tex);
    sc.environment = GFX.env.texture;
  }
}
function gfxSunOffset(): THREE.Vector3 {
  // cahaya bayang: matahari rendah dihadkan 14° supaya bayang tidak terlalu panjang
  return sunDir(SKY[GFX.skyKey] ?? SKY.siang, 14).multiplyScalar(80);
}

// ---------------------------------------------------------------------
//  Bahan: emas berkilat & marmar PBR pada tahap Sederhana ke atas
// ---------------------------------------------------------------------
const GOLD_HEX = new Set(["#d4ab4f", "#c9a24a", "#e6c25a", "#d9ab46", "#b99a5a", "#b88b2c"]);
function gfxGold(col: string, extra?: THREE.MeshLambertMaterialParameters): THREE.MeshLambertMaterial | null {
  if (gfxLevel() < 1 || !GOLD_HEX.has(col) || extra?.map) return null;
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(col), metalness: 0.85, roughness: 0.32 });
  if (extra?.emissive) m.emissive = extra.emissive as THREE.Color;
  return m as unknown as THREE.MeshLambertMaterial;
}
function gfxMarble(map: THREE.Texture): THREE.Material {
  if (gfxLevel() < 1) return lam("#ffffff", { map });
  // marmar sedikit kelabu supaya tidak melecet putih di bawah matahari terik
  return new THREE.MeshStandardMaterial({ map, color: new THREE.Color("#e4e2dc"), roughness: 0.38, metalness: 0 });
}

// ---------------------------------------------------------------------
//  Bayang bulat di bawah jemaah (murah; berguna pada tahap Rendah)
// ---------------------------------------------------------------------
let BLOB_TEX: THREE.CanvasTexture | null = null;
function makeBlobs(cap: number, g: THREE.Group): THREE.InstancedMesh {
  if (!BLOB_TEX) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    const c = cv.getContext("2d") as CanvasRenderingContext2D;
    const rg = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, "rgba(0,0,0,0.55)");
    rg.addColorStop(0.55, "rgba(0,0,0,0.3)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = rg;
    c.fillRect(0, 0, 64, 64);
    BLOB_TEX = new THREE.CanvasTexture(cv);
  }
  const ge = new THREE.PlaneGeometry(1.25, 1.25);
  ge.rotateX(-Math.PI / 2);
  const m = new THREE.InstancedMesh(ge, new THREE.MeshBasicMaterial({ map: BLOB_TEX, transparent: true, depthWrite: false, toneMapped: false }), cap);
  m.frustumCulled = false;
  m.renderOrder = 1;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  g.add(m);
  return m;
}

// ---------------------------------------------------------------------
//  Gunung: warna bucu (kaki gelap → puncak cerah) untuk kedalaman
// ---------------------------------------------------------------------
function gfxMountainMat(geo: THREE.BufferGeometry, col: string, seed: number): THREE.Material {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const cols = new Float32Array(pos.count * 3);
  const base = new THREE.Color(col);
  const r = mulberry32(seed * 7 + 1);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i += 3) {
    const jitter = 0.9 + r() * 0.2;
    for (let k = 0; k < 3; k++) {
      const y = pos.getY(i + k);
      const t = clamp((y + 1) / 46, 0, 1);
      tmp.copy(base).multiplyScalar((0.62 + 0.55 * t) * jitter);
      cols[(i + k) * 3] = tmp.r;
      cols[(i + k) * 3 + 1] = tmp.g;
      cols[(i + k) * 3 + 2] = tmp.b;
    }
  }
  geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  return new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 4 });
}

// ---------------------------------------------------------------------
//  Bloom (Tinggi): skrip pasca-pemprosesan dimuat hanya apabila perlu
// ---------------------------------------------------------------------
const scriptCache = new Map<string, Promise<boolean>>();
function loadScriptOnce(url: string): Promise<boolean> {
  let p = scriptCache.get(url);
  if (!p) {
    p = new Promise((res) => {
      const s = document.createElement("script");
      s.src = url;
      s.onload = () => res(true);
      s.onerror = () => res(false);
      document.head.appendChild(s);
    });
    scriptCache.set(url, p);
  }
  return p;
}
async function gfxEnsureBloom(): Promise<void> {
  if (gfxLevel() < 2 || GFX.composer || GFX.bloomLoading || !R3.renderer || !R3.scene || !R3.camera) return;
  GFX.bloomLoading = true;
  const files = ["shaders/CopyShader.js", "shaders/LuminosityHighPassShader.js", "shaders/GammaCorrectionShader.js", "postprocessing/EffectComposer.js", "postprocessing/RenderPass.js", "postprocessing/ShaderPass.js", "postprocessing/UnrealBloomPass.js"];
  let ok = true;
  for (const f of files) ok = ok && (await loadScriptOnce(EX_URL + f));
  GFX.bloomLoading = false;
  if (!ok || gfxLevel() < 2 || !R3.renderer || !R3.scene || !R3.camera) return;
  const X = THREE as unknown as Record<string, new (...a: unknown[]) => unknown> & { GammaCorrectionShader: unknown; WebGLMultisampleRenderTarget?: new (w: number, h: number, o: unknown) => unknown };
  const r = R3.renderer;
  const pr = gfxPixelRatio();
  let rt: unknown = undefined;
  if (r.capabilities.isWebGL2 && X.WebGLMultisampleRenderTarget) {
    // antialias kekal walaupun melalui pasca-pemprosesan
    rt = new X.WebGLMultisampleRenderTarget(Math.round(W * pr), Math.round(H * pr), { format: THREE.RGBAFormat });
  }
  const comp = new X.EffectComposer(r, rt) as ComposerLike;
  comp.addPass(new X.RenderPass(R3.scene, R3.camera));
  // ambang tinggi: hanya lampu, lampu hijau, langit senja & kilauan emas yang bersinar
  comp.addPass(new X.UnrealBloomPass(new THREE.Vector2(W, H), 0.28, 0.45, 0.9));
  comp.addPass(new X.ShaderPass(X.GammaCorrectionShader));
  comp.setPixelRatio(pr);
  comp.setSize(W, H);
  GFX.composer = comp;
}
function gfxDropBloom(): void {
  const c = GFX.composer as unknown as { renderTarget1?: THREE.WebGLRenderTarget; renderTarget2?: THREE.WebGLRenderTarget } | null;
  c?.renderTarget1?.dispose();
  c?.renderTarget2?.dispose();
  GFX.composer = null;
}
function gfxRender(): boolean {
  if (GFX.composer && gfxLevel() >= 2) {
    GFX.composer.render();
    return true;
  }
  return false;
}
function gfxResize(): void {
  if (GFX.composer) {
    GFX.composer.setPixelRatio(gfxPixelRatio());
    GFX.composer.setSize(W, H);
  }
}

// ---------------------------------------------------------------------
//  Tukar tahap kualiti & penurunan automatik jika FPS rendah
// ---------------------------------------------------------------------
function setGrafik(lv: Grafik, why = ""): void {
  SET.grafik = lv;
  SET.hq = gfxLevel() >= 1;
  saveSettings();
  if (!R3.renderer) return;
  const sun = R3.sun;
  if (sun) {
    const sz = gfxLevel() >= 2 ? 2048 : 1024;
    if (sun.shadow.mapSize.x !== sz) {
      sun.shadow.mapSize.set(sz, sz);
      const sh = sun.shadow as unknown as { map: { dispose(): void } | null };
      sh.map?.dispose();
      sh.map = null;
    }
  }
  if (gfxLevel() < 2) gfxDropBloom();
  resize3D();
  // bina semula dunia supaya bahan (Lambert / PBR) sepadan dengan tahap baharu
  disposeWorld();
  GFX.fps.warm = 0;
  if (why) toast(why, "info", 5000);
}
function gfxFrame(): void {
  if (!R3.active || !R3.world) return;
  gfxApplySky();
  if (gfxLevel() >= 2 && !GFX.composer) void gfxEnsureBloom();
  const now = performance.now();
  const f = GFX.fps;
  const dt = f.last ? (now - f.last) / 1000 : 0;
  f.last = now;
  if (f.world !== R3.world.id) {
    // dunia baharu: abaikan bingkai berat semasa memuat
    f.world = R3.world.id;
    f.warm = 0;
  }
  if (!SET.grafikAuto || gfxLevel() === 0 || document.hidden || dt > 1) return;
  f.warm += dt;
  if (f.warm < 3) {
    f.t = 0;
    f.n = 0;
    return;
  }
  f.t += dt;
  f.n++;
  if (f.t < 6) return;
  const fps = f.n / f.t;
  f.t = 0;
  f.n = 0;
  if (fps < 24) {
    const lv = GRAFIK_ORDER[gfxLevel() - 1];
    setGrafik(lv, `Game agak perlahan (${Math.round(fps)} FPS). Kualiti grafik diturunkan ke ${GRAFIK_NAMES[lv]}. Boleh ditukar dalam Tetapan.`);
  }
}
