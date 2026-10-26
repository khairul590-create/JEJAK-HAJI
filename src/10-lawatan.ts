// =====================================================================
//  Fail 10: LAWATAN 360° — berdiri di titik-titik utama dunia 3D game dan
//  memandang sekeliling (kamera Mata berputar perlahan). Setiap titik ada
//  pautan ke foto 360° sebenar. Jika LAWATAN[i].img diisi, foto 360°
//  equirectangular itu dipaparkan sebagai sfera menggantikan dunia 3D.
//  Kemajuan game tidak berubah: kedudukan & kamera dipulihkan apabila tamat.
// =====================================================================

interface TourSaved {
  scene: SceneId;
  x: number;
  y: number;
  dx: number;
  dy: number;
  mode: CamMode;
  yaw: number;
  pitch: number;
  fov: number;
}
const TOUR = {
  on: false,
  i: 0,
  spin: true,
  saved: null as TourSaved | null,
  pano: null as THREE.Mesh | null,
  panoImg: "",
};

function tourBlocked(): string | null {
  if (!started) return "Mulakan perjalanan dahulu.";
  if (overlayBusy || modalOpen) return "Tunggu sebentar.";
  if (tawafKind() !== null) return "Selesaikan tawaf dahulu, kemudian buka Lawatan 360°.";
  if (saieKind() !== null) return "Selesaikan saie dahulu, kemudian buka Lawatan 360°.";
  if (T.wukuf.praying) return "Hentikan wukuf dahulu (tekan BERHENTI).";
  if (insideMiqat || miqatActivity) return "Keluar dari bilik Miqat dahulu.";
  if (T.busy > 0) return "Tunggu sebentar.";
  return null;
}

async function startTour(): Promise<void> {
  if (TOUR.on) return;
  const why = tourBlocked();
  if (why) {
    toast(why, "info", 4000);
    return;
  }
  if (!R3.active) {
    await set3D(true);
    if (!R3.active) return; // 3D gagal dimuat (tiada internet / WebGL)
  }
  TOUR.saved = { scene: scene.id, x: P.x, y: P.y, dx: P.dx, dy: P.dy, mode: C3.mode, yaw: C3.yaw, pitch: C3.eyePitch, fov: C3.fov };
  TOUR.on = true;
  TOUR.spin = true;
  hush();
  hideDoa();
  el("hud").classList.add("touring");
  el("tour").hidden = false;
  const here = LAWATAN.findIndex((v) => v.scene === scene.id);
  tourGo(here >= 0 ? here : 0);
}

function tourGo(i: number): void {
  const n = LAWATAN.length;
  TOUR.i = ((i % n) + n) % n;
  const v = LAWATAN[TOUR.i];
  if (scene.id !== v.scene) loadScene(v.scene, { x: v.x, y: v.y });
  P.x = v.x;
  P.y = v.y;
  P.moving = false;
  C3.mode = "eye";
  C3.yaw = Math.atan2(-(v.look.x - v.x), -(v.look.y - v.y));
  C3.eyePitch = v.pitch ?? 0.08;
  C3.fov = 66;
  C3.lastDrag = T.time;
  paintViewControls();
  el("tourK").textContent = `Lawatan 360° · ${TOUR.i + 1}/${n} · ${SCENE_NAMES[v.scene]}`;
  el("tourT").textContent = v.title;
  el("tourP").textContent = v.text;
  const cr = el("tourCr");
  cr.textContent = v.img ? `Foto 360°${v.credit ? ": " + v.credit : ""}` : "Paparan: model 3D Jejak Haji (dipermudahkan)";
  const g = el<HTMLAnchorElement>("tourG");
  g.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(v.q);
  const x = el<HTMLAnchorElement>("tourX");
  x.hidden = !v.ext;
  if (v.ext) {
    x.href = v.ext.url;
    x.lastChild!.textContent = v.ext.label;
  }
  el("tourSpin").setAttribute("aria-pressed", String(TOUR.spin));
  // arah kompas tengah foto: dinyatakan, atau arah pandangan awal titik ini (utara peta = -y)
  const head = v.heading ?? (Math.atan2(v.look.x - v.x, -(v.look.y - v.y)) * 180) / Math.PI;
  setPano(v.img ?? "", head);
  hush();
  // tiada klip MP3 untuk teks lawatan: guna suara pelayar (ikut tetapan Pemandu suara)
  if (speechOn()) sayWeb(v.title + ". " + v.text, "ms");
}

function endTour(): void {
  if (!TOUR.on) return;
  setPano("");
  hush();
  const s = TOUR.saved;
  TOUR.on = false;
  TOUR.saved = null;
  el("hud").classList.remove("touring");
  el("tour").hidden = true;
  if (s) {
    if (scene.id !== s.scene) loadScene(s.scene, { x: s.x, y: s.y });
    P.x = s.x;
    P.y = s.y;
    P.dx = s.dx;
    P.dy = s.dy;
    C3.mode = s.mode;
    C3.yaw = s.yaw;
    C3.eyePitch = s.pitch;
    C3.fov = s.fov;
  }
  paintViewControls();
  refreshHUD();
}

// sfera foto 360° (equirectangular) mengelilingi kamera
function setPano(src: string, heading = 0): void {
  if (src === TOUR.panoImg) return;
  TOUR.panoImg = src;
  if (TOUR.pano) {
    R3.scene?.remove(TOUR.pano);
    TOUR.pano.geometry.dispose();
    const m = TOUR.pano.material as THREE.MeshBasicMaterial;
    m.map?.dispose();
    m.dispose();
    TOUR.pano = null;
  }
  if (R3.world) R3.world.group.visible = true;
  if (!src || !R3.scene) return;
  new THREE.TextureLoader().load(
    src,
    (tex) => {
      if (TOUR.panoImg !== src || !R3.scene) {
        tex.dispose();
        return;
      }
      const geo = new THREE.SphereGeometry(60, 64, 40);
      geo.scale(-1, 1, 1); // lihat permukaan dalam tanpa imej terbalik
      const sph = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, depthWrite: false }));
      // tengah imej (u = 0.5) menghala ke barat (-X); putar supaya menghala ke `heading`
      sph.rotation.y = ((270 - heading) * Math.PI) / 180;
      sph.renderOrder = -1;
      R3.scene.add(sph);
      TOUR.pano = sph;
    },
    undefined,
    () => {
      toast("Foto 360° tidak dapat dimuat. Paparan model 3D digunakan.", "warn", 4500);
      TOUR.panoImg = "";
    }
  );
}

function updateTour(dt: number): void {
  if (!TOUR.on) return;
  // putaran perlahan; berhenti seketika selepas pengguna menyeret skrin
  if (TOUR.spin && T.time - C3.lastDrag > 2.5) C3.yaw += dt * 0.14;
  if (TOUR.pano && R3.camera) {
    TOUR.pano.position.copy(R3.camera.position);
    if (R3.world) R3.world.group.visible = false;
  }
}

function initTour(): void {
  el("tourPrev").addEventListener("click", () => {
    SND.play("tap");
    tourGo(TOUR.i - 1);
  });
  el("tourNext").addEventListener("click", () => {
    SND.play("tap");
    tourGo(TOUR.i + 1);
  });
  el("tourEnd").addEventListener("click", () => {
    SND.play("tap");
    endTour();
  });
  el("tourSpin").addEventListener("click", () => {
    TOUR.spin = !TOUR.spin;
    el("tourSpin").setAttribute("aria-pressed", String(TOUR.spin));
  });
  el("t360").addEventListener("click", () => {
    SND.init();
    void startTour();
  });
  window.addEventListener("keydown", (e) => {
    if (!TOUR.on) return;
    if (e.code === "Escape") endTour();
    else if (e.code === "BracketRight" || e.code === "PageDown") tourGo(TOUR.i + 1);
    else if (e.code === "BracketLeft" || e.code === "PageUp") tourGo(TOUR.i - 1);
  });
}
