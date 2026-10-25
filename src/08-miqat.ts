// Walkable Miqat interiors. Progress uses existing Save.flags, preserving old saves.
// These short animations illustrate preparation; they are not a full prayer tutorial.
type MiqatRoom = "wash" | "mosque";
type MiqatAction = "nails" | "bath" | "wudu" | "dress" | "toilet" | "prayer";
type PrayerPose = "stand" | "takbir" | "fold" | "bow" | "sujud" | "sit" | "salam";
let insideMiqat: MiqatRoom | null = null;
const MIQAT_POINTS = {
  nails: { x: -70, y: 0 }, bath: { x: 65, y: -45 },
  wudu: { x: -70, y: 75 }, dress: { x: 65, y: 65 },
  toilet: { x: -70, y: -45 }, prayer: { x: 0, y: -65 },
  exit: { x: 0, y: 125 }, niat: { x: 0, y: -120 },
};
const PRAYER_SEQUENCE: { label: string; pose: PrayerPose }[] = [
  { label: "Rakaat 1 · berdiri dan niat solat", pose: "stand" },
  { label: "Rakaat 1 · takbiratul ihram", pose: "takbir" },
  { label: "Rakaat 1 · berdiri, al-Fatihah dan surah", pose: "fold" },
  { label: "Rakaat 1 · rukuk dan tumakninah", pose: "bow" },
  { label: "Rakaat 1 · iktidal dan tumakninah", pose: "stand" },
  { label: "Rakaat 1 · sujud pertama", pose: "sujud" },
  { label: "Rakaat 1 · duduk antara dua sujud", pose: "sit" },
  { label: "Rakaat 1 · sujud kedua", pose: "sujud" },
  { label: "Rakaat 2 · berdiri, al-Fatihah dan surah", pose: "fold" },
  { label: "Rakaat 2 · rukuk dan tumakninah", pose: "bow" },
  { label: "Rakaat 2 · iktidal dan tumakninah", pose: "stand" },
  { label: "Rakaat 2 · sujud pertama", pose: "sujud" },
  { label: "Rakaat 2 · duduk antara dua sujud", pose: "sit" },
  { label: "Rakaat 2 · sujud kedua", pose: "sujud" },
  { label: "Rakaat 2 · duduk tahiyat akhir", pose: "sit" },
  { label: "Salam · selesai dua rakaat", pose: "salam" },
];
const MIQAT_ACTIONS: Record<Exclude<MiqatAction, "prayer">, { title: string; seconds: number; labels: string[] }> = {
  nails: { title: "Kebersihan kuku", seconds: 6, labels: ["Bersihkan kuku tangan", "Rapikan kuku yang perlu dipotong", "Bersihkan kuku kaki"] },
  bath: { title: "Mandi sunat ihram", seconds: 10, labels: ["Niat mandi sunat ihram", "Bersihkan diri", "Ratakan air ke seluruh badan"] },
  wudu: { title: "Berwuduk", seconds: 10, labels: ["Persediaan wuduk", "Niat dan basuh muka", "Basuh tangan hingga siku", "Sapu sebahagian kepala", "Basuh kaki hingga buku lali · tertib"] },
  dress: { title: "Memakai pakaian ihram", seconds: 5, labels: ["Masuk ruang persalinan tertutup", "Pakai pakaian ihram yang sesuai"] },
  toilet: { title: "Tandas peribadi", seconds: 5, labels: ["Pintu ditutup", "Selesai · bersihkan diri dan basuh tangan"] },
};
let miqatActivity: { kind: MiqatAction; elapsed: number; stage: number; stageTime: number } | null = null;
let waterSource: AudioBufferSourceNode | null = null;
let waterGain: GainNode | null = null;

function miqatPrivate(): boolean {
  return !!miqatActivity && ["bath", "dress", "toilet"].includes(miqatActivity.kind);
}
function miqatPrayerPose(): PrayerPose | null {
  return miqatActivity?.kind === "prayer" ? PRAYER_SEQUENCE[miqatActivity.stage].pose : null;
}
function miqatPanel(): HTMLElement {
  let panel = document.getElementById("miqatActivity");
  if (panel) return panel;
  panel = document.createElement("section");
  panel.id = "miqatActivity";
  panel.setAttribute("aria-label", "Aktiviti persediaan ihram");
  panel.style.cssText = "position:fixed;left:50%;top:110px;transform:translateX(-50%);width:min(360px,90vw);padding:16px;background:#153f35f5;color:white;border:1px solid #dcc583;border-radius:16px;z-index:45;box-shadow:0 8px 30px #0004;font:14px Nunito,sans-serif;pointer-events:auto";
  panel.innerHTML = '<b id="miqatTitle"></b><p id="miqatStage" aria-live="polite"></p><progress id="miqatProgress" max="1" value="0" style="width:100%"></progress><p id="miqatNote" style="font-size:12px;opacity:.85"></p><button id="miqatNext" type="button">Seterusnya</button> <button id="miqatCancel" type="button">Hentikan</button>';
  document.body.appendChild(panel);
  el("miqatNext").onclick = () => {
    const a = miqatActivity;
    if (!a || a.kind !== "prayer" || a.stageTime < 1.2) return;
    if (a.stage === PRAYER_SEQUENCE.length - 1) finishMiqatActivity();
    else { a.stage++; a.stageTime = 0; }
  };
  el("miqatCancel").onclick = () => {
    resetMiqatActivity();
    toast("Aktiviti dihentikan. Kemajuan aktiviti ini belum disimpan.", "info", 3000);
  };
  return panel;
}
function startWaterSound(): void {
  SND.init();
  if (!SND.ctx || !SND.master) return;
  const c = SND.ctx;
  const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const samples = b.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  waterSource = c.createBufferSource(); waterSource.buffer = b; waterSource.loop = true;
  waterGain = c.createGain(); waterGain.gain.value = SND.on ? 0.045 : 0;
  const filter = c.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 2600;
  waterSource.connect(filter).connect(waterGain).connect(SND.master);
  waterSource.start();
}
function resetMiqatActivity(): void {
  if (miqatActivity && (miqatActivity.kind === "bath" || miqatActivity.kind === "toilet")) {
    const point = MIQAT_POINTS[miqatActivity.kind]; P.x = point.x; P.y = point.y;
  }
  if (miqatActivity) { T.busy = 0; T.busyCb = null; P.pose = "stand"; }
  miqatActivity = null;
  const drops = R3.world?.group.getObjectByName("MiqatWater");
  if (drops) drops.visible = false;
  waterSource?.stop(); waterSource?.disconnect(); waterSource = null;
  waterGain?.disconnect(); waterGain = null;
  const panel = document.getElementById("miqatActivity");
  if (panel) panel.hidden = true;
}
function startMiqatActivity(kind: MiqatAction): void {
  if (miqatActivity || !insideMiqat) return;
  if (kind === "prayer" && (!isStep("solat_ihram") || !S.flags.miqat_wudu)) {
    toast("Ambil wuduk di tempat wuduk dahulu.", "info"); return;
  }
  if (kind === "dress" && (!S.flags.miqat_bath || !S.flags.miqat_nails)) {
    toast("Selesaikan latihan kebersihan kuku dan mandi dahulu.", "info"); return;
  }
  miqatActivity = { kind, elapsed: 0, stage: 0, stageTime: 0 };
  T.busy = 1e6; T.busyCb = null; P.moving = false;
  const point = MIQAT_POINTS[kind]; P.x = point.x; P.y = point.y;
  if (kind === "bath" || kind === "toilet") P.y = -100;
  P.dx = 0; P.dy = -1; P.pose = kind === "nails" ? "pray" : "stand";
  if (kind === "prayer") { C3.mode = "back"; C3.yaw = 0.6; C3.dist = 5; C3.pitch = .45; }
  miqatPanel().hidden = false;
  el("miqatTitle").textContent = kind === "prayer" ? "Solat sunat ihram · dua rakaat" : MIQAT_ACTIONS[kind].title;
  el("miqatNote").textContent = kind === "prayer"
    ? "Simulasi gerakan dipendekkan, bukan panduan lengkap bacaan atau tempoh solat. Solat sunat ihram dilakukan di luar waktu larangan."
    : "Latihan persediaan sebelum niat ihram. Mandi, merapikan kuku dan solat sunat bukan rukun ihram.";
  el("miqatNext").hidden = kind !== "prayer";
  if (kind === "bath" || kind === "wudu") startWaterSound();
}
function finishMiqatActivity(): void {
  const kind = miqatActivity?.kind;
  resetMiqatActivity();
  if (!kind) return;
  if (kind === "toilet") S.flags.miqat_wudu = false;
  else S.flags["miqat_" + kind] = true;
  if (kind === "dress") {
    S.outfit = "ihram"; applyOutfit(); finishStep("ihram_wear");
    toast("Pakaian ihram sudah dipakai. Ambil wuduk, kemudian masuk masjid. Niat ihram belum dilaksanakan.", "ok", 6000);
  } else if (kind === "prayer") {
    finishStep("solat_ihram");
    toast("Simulasi dua rakaat selesai. Pergi ke tanda niat umrah di hadapan.", "ok", 5000);
  } else toast(kind === "toilet" ? "Selesai. Ambil wuduk semula sebelum solat." : "Aktiviti selesai. Ikut penanda untuk langkah seterusnya.", "ok", 4000);
  saveGame();
}
function updateMiqatActivity(dt: number): void {
  const a = miqatActivity;
  if (!a || modalOpen || overlayBusy) return;
  a.elapsed += dt; a.stageTime += dt;
  if (waterGain) waterGain.gain.value = SND.on ? .045 : 0;
  let fraction: number;
  if (a.kind === "prayer") {
    el("miqatStage").textContent = PRAYER_SEQUENCE[a.stage].label;
    el<HTMLButtonElement>("miqatNext").disabled = a.stageTime < 1.2;
    el("miqatNext").textContent = a.stage === PRAYER_SEQUENCE.length - 1 ? "Selesai" : "Seterusnya";
    fraction = (a.stage + Math.min(1, a.stageTime / 1.2)) / PRAYER_SEQUENCE.length;
  } else {
    const cfg = MIQAT_ACTIONS[a.kind]; fraction = Math.min(1, a.elapsed / cfg.seconds);
    el("miqatStage").textContent = cfg.labels[Math.min(cfg.labels.length - 1, Math.floor(fraction * cfg.labels.length))];
    if (a.elapsed >= cfg.seconds) { finishMiqatActivity(); return; }
  }
  el<HTMLProgressElement>("miqatProgress").value = fraction;
  if (R3.world) {
    const drops = R3.world.group.getObjectByName("MiqatWater");
    if (drops) {
      drops.visible = a.kind === "bath" || a.kind === "wudu";
      drops.position.set(P.x * K3, 0, P.y * K3);
      drops.children.forEach((d, i) => { d.position.y = 2.2 - ((a.elapsed * 1.5 + i * .13) % 1.6); });
    }
  }
}

function enterMiqatInterior(kind: MiqatRoom): void {
  if (T.busy > 0 || overlayBusy) return;
  insideMiqat = kind;
  scene = buildMiqatInterior(kind); M3_TARGET = null;
  disposeWorld();
  P.x = 0; P.y = 105; P.dx = 0; P.dy = -1;
  cam.x = P.x; cam.y = P.y;
  C3.dist = 10; C3.topDist = 35;
  el("mmScene").textContent = scene.name;
  SND.setAmbience(.1);
  toast(kind === "wash" ? "Berjalan ke stesen kuku, bilik mandi, persalinan dan wuduk. Tandas mempunyai ruang privasi." : "Kasut ditinggalkan di pintu. Berjalan ke sejadah untuk solat.", "info", 6500);
}
function leaveMiqatInterior(): void {
  const from = insideMiqat;
  loadScene("miqat", from === "wash" ? POS.miqat.bilik : POS.miqat.masjid);
}
function miqatInteriorTarget(): Vec {
  if (insideMiqat === "mosque") {
    if (isStep("niat_umrah")) return MIQAT_POINTS.niat;
    if (!isStep("solat_ihram")) return MIQAT_POINTS.exit;
    return S.flags.miqat_wudu ? MIQAT_POINTS.prayer : MIQAT_POINTS.wudu;
  }
  if (!isStep("ihram_wear")) return S.flags.miqat_wudu ? MIQAT_POINTS.exit : MIQAT_POINTS.wudu;
  if (!S.flags.miqat_nails) return MIQAT_POINTS.nails;
  if (!S.flags.miqat_bath) return MIQAT_POINTS.bath;
  return MIQAT_POINTS.dress;
}

function buildMiqatInterior(kind: MiqatRoom): Scene {
  const mosque = kind === "mosque";
  const sc = newScene("miqat", { x0: -125, y0: -155, x1: 125, y1: 145 }, { x: 0, y: 105 }, MIQAT_POINTS.exit, .1, mosque ? "#d7c9ae" : "#d7e5e2");
  sc.name = mosque ? "Dalam Masjid Miqat" : "Bilik mandi & persalinan";
  const block = (x: number, y: number, w: number, d: number, h: number, col: string, sign = ""): void => {
    m3({ k: "bld", x, y, w, d, h, col, style: "plain", sign });
    sc.solids.push({ t: "r", x, y, w, h: d });
    sc.props.push({ y: y + d, draw: (c) => box(c, x, y, w, d, h, col) });
  };
  // Cutaway rooms retain solid side/back walls; front doorway remains open.
  block(-125,-155,250,5,30,"#e7ddc9");
  block(-125,-150,5,295,30,"#e7ddc9"); block(120,-150,5,295,30,"#e7ddc9");
  block(-125,140,100,5,16,"#e7ddc9"); block(25,140,100,5,16,"#e7ddc9");
  if (mosque) {
    block(-18,-150,36,8,40,"#c0a16b","KIBLAT");
    for (const x of [-95,95]) for (const y of [-110,20]) m3({ k: "pillar", x, y, h: 34, r: 3, col: "#f0e8d7" });
    block(-100,95,45,10,9,"#8f7050","RAK KASUT");
  } else {
    block(-106,-140,72,8,27,"#a4c6bf","TANDAS");
    block(-106,-132,7,65,27,"#a4c6bf"); block(-41,-132,7,65,27,"#a4c6bf");
    block(-106,-67,72,4,27,"#8ea9a1","PRIVASI");
    // Interaction is outside the opaque booth, with the actor hidden while occupied.
    block(31,-140,72,8,27,"#a4c6bf","MANDI");
    block(31,-132,7,65,27,"#a4c6bf"); block(96,-132,7,65,27,"#a4c6bf");
    block(31,-67,72,4,27,"#8ea9a1","PRIVASI");
    block(-100,-15,45,8,9,"#e8eee9","KUKU");
    block(40,100,65,12,22,"#b6b3a2","PERSALINAN");
  }
  block(-105,95,35,9,9,"#dfeae7",mosque ? "WUDUK" : "WUDUK");
  sc.ground = (c) => {
    c.fillStyle = sc.bg; c.fillRect(-125,-155,250,300);
    gridLines(c,-125,-155,125,145,20,"rgba(80,100,90,.14)");
    if (mosque) {
      for (const y of [-95,-35,25]) for (const x of [-45,0,45]) {
        c.fillStyle = "#28644f"; rrect(c,x-15,y-20,30,45,3); c.fill();
        c.strokeStyle = "#d5bb7e"; c.lineWidth=1; c.stroke();
        c.beginPath(); c.moveTo(x-9,y-8); c.lineTo(x,y-16); c.lineTo(x+9,y-8); c.stroke();
      }
    }
  };
  sc.mini = sc.ground;
  const station = (id: MiqatAction, title: string, icon: IconName, enabled: () => boolean, action?: () => void): void => {
    const p = MIQAT_POINTS[id];
    sc.labels.push({ ...p, y: p.y - 18, text: title, kind: "small", h3: 2.6 });
    sc.interacts.push({ id: "miqat_"+id, ...p, r: 24, label: () => title, icon, ring: true, enabled, locked: () => "Ikut urutan persediaan yang ditunjukkan.", action: action ?? (() => startMiqatActivity(id)) });
  };
  if (!mosque) {
    station("nails","BERSIHKAN KUKU","cut",() => isStep("ihram_wear") && !S.flags.miqat_nails);
    station("bath","MANDI SUNAT","water",() => isStep("ihram_wear") && !S.flags.miqat_bath);
    station("dress","PAKAI IHRAM","hand",() => isStep("ihram_wear") && !!S.flags.miqat_bath && !!S.flags.miqat_nails,actWearIhram);
    station("toilet","MASUK TANDAS","hand",() => true);
  } else {
    station("prayer","SOLAT DUA RAKAAT","pray",() => isStep("solat_ihram") && !!S.flags.miqat_wudu,actSolatIhram);
    sc.interacts.push({ id: "miqat_niat", ...MIQAT_POINTS.niat, r: 25, icon: "book", ring: true, label: () => "NIAT UMRAH", enabled: () => isStep("niat_umrah"), action: () => openNiat("umrah") });
  }
  station("wudu","AMBIL WUDUK","water",() => true);
  sc.interacts.push({ id: "miqat_exit", ...MIQAT_POINTS.exit, r: 25, icon: "hand", ring: true, label: () => "KELUAR", enabled: () => true, action: leaveMiqatInterior });
  sc.labels.push({ x: 0, y: 135, text: "PINTU KELUAR", kind: "place", h3: 2 });
  return sc;
}

function addMiqatWater(g: THREE.Group): void {
  if (!insideMiqat) return;
  const water = new THREE.Group(); water.name = "MiqatWater"; water.visible = false;
  const geo = new THREE.CylinderGeometry(.012,.012,.15,4);
  const mat = new THREE.MeshBasicMaterial({ color: 0x90d8ed, transparent: true, opacity: .65 });
  for (let i=0;i<24;i++) {
    const d = new THREE.Mesh(geo,mat); d.position.set(Math.sin(i*2.4)*.24,1,Math.cos(i*2.4)*.24); water.add(d);
  }
  g.add(water);
}
function applyMiqatPose3D(r: PlayerRig, up?: THREE.Object3D, l?: THREE.Object3D, rr?: THREE.Object3D): void {
  const av = r.avatar; if (!av) return;
  const pose = miqatPrayerPose();
  for (const side of ["L","R"]) {
    const leg = av.getObjectByName("Leg"+side);
    if (leg) leg.position.y = .77;
    for (const name of ["Sandal","SandalStrap"]) {
      const shoe = av.getObjectByName("Leg"+side+"_"+name);
      if (shoe) shoe.visible = insideMiqat !== "mosque";
    }
  }
  for (const name of ["PilgrimAvatar_Ihram","PilgrimAvatar_ClothSeam"]) {
    const cloth = av.getObjectByName(name); if (cloth) cloth.scale.y = 1;
  }
  const head = av.getObjectByName("HeadPivot"); if (head) head.rotation.y = pose === "salam" ? Math.sin((miqatActivity?.stageTime ?? 0)*2)*.5 : 0;
  if (!pose) {
    if (miqatActivity?.kind === "nails" || miqatActivity?.kind === "wudu") {
      if (l) l.rotation.x = -1.5 + Math.sin(miqatActivity.elapsed * 4) * .12;
      if (rr) rr.rotation.x = -1.3 - Math.sin(miqatActivity.elapsed * 4) * .12;
    }
    return;
  }
  r.root.position.y = 0;
  if (l) l.rotation.x = pose === "takbir" ? -2.6 : pose === "fold" ? -1.1 : pose === "bow" ? -.2 : pose === "sujud" ? -.55 : -1;
  if (rr) rr.rotation.x = l?.rotation.x ?? 0;
  if (up) up.rotation.x = pose === "bow" ? 1.25 : pose === "sujud" ? 1.65 : 0;
  if (pose === "sit" || pose === "sujud" || pose === "salam") {
    if (up) up.position.y = pose === "sujud" ? .26 : .48;
    for (const name of ["PilgrimAvatar_Ihram","PilgrimAvatar_ClothSeam"]) {
      const cloth = av.getObjectByName(name); if (cloth) cloth.scale.y = .5;
    }
    for (const side of ["L","R"]) {
      const leg = av.getObjectByName("Leg"+side);
      if (leg) { leg.position.y=.32; leg.rotation.x=1.3; }
    }
  }
}
function applyMiqatFallbackPose3D(r: PlayerRig): void {
  const pose = miqatPrayerPose();
  if (!pose) return;
  r.root.position.y = 0;
  if (pose === "bow") { r.fallback.rotation.x = .8; r.fallback.scale.y = .75; }
  if (pose === "sujud") { r.fallback.rotation.x = 1.3; r.fallback.scale.y = .5; }
  if (pose === "sit" || pose === "salam") r.fallback.scale.y = .58;
  r.armL.rotation.x = r.armR.rotation.x = pose === "takbir" ? -2.4 : -1;
}
function drawMiqatPrayer2D(c: Ctx, p: Person): boolean {
  const pose = miqatPrayerPose();
  if (!pose || !["bow","sujud","sit","salam"].includes(pose)) return false;
  c.save(); c.translate(p.x,p.y);
  c.fillStyle = "#f8f7ef";
  if (pose === "bow") { rrect(c,-7,-15,19,10,4); c.fill(); }
  else if (pose === "sujud") { ell(c,0,-5,11,5); c.fill(); }
  else { rrect(c,-7,-15,14,15,4); c.fill(); }
  c.fillStyle = p.skin;
  circ(c,pose === "bow" ? 14 : pose === "sujud" ? 12 : 0,pose === "bow" ? -9 : pose === "sujud" ? -2 : -19,4); c.fill();
  c.restore(); return true;
}
