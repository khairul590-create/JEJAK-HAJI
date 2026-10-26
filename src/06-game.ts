// =====================================================================
//  Fail 06: ENJIN GAME — keadaan, mekanik ibadah, gelung, lukisan
// =====================================================================

interface Save {
  v: 1;
  name: string;
  gender: Gender;
  step: number;
  stars: number;
  pebbles: number;
  flags: Record<string, boolean>;
  ach: string[];
  tawafLaps: number;
  saieCount: number;
  saieAt: "none" | "safa" | "marwah";
  throws: Record<string, number>;
  wukuf: number;
  outfit: "normal" | "ihram";
  shaved: boolean;
  scene: SceneId;
  lastTawaf: string;
  quiz: number;
  tenaga: number;
  air: number;
}

function newSave(name: string, gender: Gender): Save {
  return {
    v: 1,
    name,
    gender,
    step: 0,
    stars: 0,
    pebbles: 0,
    flags: {},
    ach: [],
    tawafLaps: 0,
    saieCount: 0,
    saieAt: "none",
    throws: {},
    wukuf: 0,
    outfit: "normal",
    shaved: false,
    scene: "miqat",
    lastTawaf: "",
    quiz: 0,
    tenaga: 100,
    air: CONFIG.tenaga.botol,
  };
}
function validSave(s: unknown): s is Save {
  if (!s || typeof s !== "object") return false;
  const o = s as Partial<Save>;
  return o.v === 1 && typeof o.step === "number" && o.step >= 0 && o.step <= ALL_STEPS.length && !!o.scene && o.scene in BUILDERS;
}

let S: Save = newSave("Ahmad", "L");
let started = false;

const P: Person = mkPerson("L", false);
P.skin = "#e8b68c";
P.hair = "#1d1a17";

const T = {
  tawaf: { active: false, cum: 0, last: 0, valid: true, wrong: 0, seg: -1, outT: 0, ramalRun: 0, ramalTot: 0, bumps: 0, lapIst: -1, inHijr: false },
  saie: { greenIn: false, green: 0, run: 0, legDoa: false, berdoaHere: false, doaCount: 0, femaleTip: false, runTip: false },
  wukuf: { praying: false, cardT: 0, idx: 0 },
  busy: 0,
  busyCb: null as (() => void) | null,
  poseT: 0,
  throwCd: 0,
  inflight: 0,
  aqMiss: 0,
  zamCd: 0,
  bumpCd: 0,
  pickTip: false,
  saveT: 0,
  enWarn: 0,
  minumCd: 0,
  hudT: 0,
  miniT: 0,
  running: false,
  time: 0,
};

const SCENES: Partial<Record<SceneId, Scene>> = {};
function getScene(id: SceneId): Scene {
  let sc = SCENES[id];
  if (!sc) {
    sc = BUILDERS[id]();
    M3_TARGET = null;
    SCENES[id] = sc;
  }
  return sc;
}
let scene: Scene = null as unknown as Scene;

// =====================================================================
//  LANGKAH & KEMAJUAN
// =====================================================================
function curFlat(): FlatStep | null {
  return S.step < ALL_STEPS.length ? ALL_STEPS[S.step] : null;
}
function curStep(): Step | null {
  const f = curFlat();
  return f ? f.step : null;
}
function isStep(...ids: string[]): boolean {
  const s = curStep();
  return !!s && ids.includes(s.id);
}
function finishStep(id: string): void {
  if (isStep(id)) advance();
}
function advance(): void {
  const prev = curFlat();
  if (!prev) return;
  S.step++;
  S.stars += 5;
  const nxt = curFlat();
  const taskDone = !nxt || nxt.ti !== prev.ti;
  if (taskDone) {
    S.stars += 10;
    toast(`Tugasan selesai: ${prev.task.title} (+15 bintang)`, "ok");
    SND.play("done");
    sparkle(P.x, P.y - 24);
  } else SND.play("ok");
  if (!nxt) {
    onAllDone();
  } else {
    if (nxt.step.id === "aqabah") T.aqMiss = 0;
    if (nxt.task.ch !== prev.task.ch) {
      const ch = CHAPTERS[nxt.task.ch - 1];
      later(() => banner(ch), 900);
    }
    nxt.step.onStart?.();
    sayStep(nxt.step);
  }
  renderMission();
  saveGame();
}
function addStars(n: number, why?: string): void {
  S.stars += n;
  if (why) toast(`${why} (+${n} bintang)`, "ok", 3200);
}
function ach(id: string): void {
  if (S.ach.includes(id)) return;
  const a = ACH_LIST.find((x) => x.id === id);
  if (!a) return;
  if (a.only === "L" && S.gender !== "L") return;
  S.ach.push(id);
  S.stars += 5;
  toast(`Pencapaian: ${a.t} — ${a.d}`, "ach", 5200);
  SND.play("ach");
}
function saveGame(): void {
  if (started) saveJSON(CONFIG.saveKey, S);
}

function applyOutfit(): void {
  P.gender = S.gender;
  P.ihram = S.outfit === "ihram";
  P.shaved = S.shaved;
  P.outfit = S.gender === "L" ? "#dfe7ee" : "#cfdcea";
  P.acc = "#7f9fc4";
  drawAvatar();
}

// =====================================================================
//  LOKASI & PERJALANAN
// =====================================================================
function refreshCrowd(): void {
  if (scene.id === "miqat") return;
  const ch = curFlat()?.task.ch ?? 8;
  let ratio = 0.95;
  if (scene.id === "makkah") ratio = ch <= 3 ? 0.88 : ch === 6 ? 0.4 : 0.22;
  if (scene.id === "mina") ratio = ch <= 4 ? 0.95 : ch === 6 ? 0.72 : 0.25;
  for (const n of scene.npcs) {
    if (n.normal) continue;
    n.p.ihram = rnd() < ratio;
  }
}

function loadScene(id: SceneId, pos?: Vec): void {
  resetMiqatActivity();
  insideMiqat = null;
  disposeWorld();
  scene = getScene(id);
  S.scene = id;
  const sp = pos ?? scene.spawn;
  P.x = sp.x;
  P.y = sp.y;
  P.dx = 0;
  P.dy = -1;
  cam.x = P.x;
  cam.y = P.y;
  refreshCrowd();
  stones.length = 0;
  T.inflight = 0;
  T.tawaf.active = false;
  T.wukuf.praying = false;
  el("mmScene").textContent = scene.name;
  SND.setAmbience(scene.ambient);
  if (id === "mina" && isStep("batu_tasyrik", "ula", "wusta", "aqabah2") && S.pebbles < 21) ensurePatch();
}

const TRAVEL_TIPS: Record<string, string> = {
  bus_makkah1: "Teruskan bertalbiah sepanjang perjalanan hingga tiba di Masjidil Haram.",
  bus_mina1: "Hari Tarwiyah: jemaah bergerak ke Mina sambil bertalbiah.",
  bus_arafah: "Menuju Arafah. Wukuf ialah kemuncak ibadah haji.",
  bus_muzdalifah: "Solat Maghrib dan Isyak ditunaikan secara jamak ta'khir di Muzdalifah.",
  bus_mina2: "Ke Mina untuk melontar Jamrah Aqabah. Teruskan bertalbiah.",
  bus_makkah2: "Ke Masjidil Haram untuk tawaf ifadah dan saie haji.",
  bus_mina3: "Kembali ke Mina untuk bermalam pada hari-hari Tasyrik.",
  bus_makkah3: "Tawaf wada' ialah urusan terakhir sebelum meninggalkan Makkah.",
};

function travelTo(id: SceneId): void {
  if (overlayBusy) return;
  const st = curStep();
  stopWukuf();
  SND.play("bus");
  const leg = st ? JOURNEY_LEGS.find((l) => l.step === st.id) : undefined;
  const km = st && st.id.startsWith("bus_") ? (leg ? leg.km : "±7 km") : "";
  el("trKm").textContent = km ? `Jarak anggaran ${km}` : "";
  showTravel(scene.name, SCENE_NAMES[id], (st && TRAVEL_TIPS[st.id]) || "Perbanyakkan zikir dalam perjalanan.", () => loadScene(id), () => {
    // berehat di dalam bas; air minuman disediakan
    S.tenaga = Math.max(S.tenaga, 80);
    S.air = CONFIG.tenaga.botol;
    if (curStep()?.travel === id) advance();
    toast(`Tiba di ${SCENE_NAMES[id]}.`, "info", 3000);
  });
}

// =====================================================================
//  TINDAKAN AM
// =====================================================================
function pray(sec: number, msg: string, cb: () => void): void {
  T.busy = sec;
  T.busyCb = cb;
  P.pose = "pray";
  toast(msg, "info", sec * 1000);
}

function actWearIhram(): void {
  startMiqatActivity("dress");
}
function actSolatIhram(): void {
  startMiqatActivity("prayer");
}
function openNiat(kind: "umrah" | "haji"): void {
  const opts: ChoiceOpt[] = [
    {
      ar: DOA.niatHaji.ar,
      label: "Sahaja aku berniat haji dan berihram dengannya kerana Allah Taala.",
      ok: kind === "haji",
      why: kind === "haji" ? "Betul. Kamu kini berihram untuk haji. Bacalah talbiah." : "Itu niat haji. Haji Tamattu' bermula dengan umrah dahulu.",
    },
    {
      ar: DOA.niatUmrah.ar,
      label: "Sahaja aku berniat umrah dan berihram dengannya kerana Allah Taala.",
      ok: kind === "umrah",
      why: kind === "umrah" ? "Betul. Kamu kini berihram untuk umrah. Bacalah talbiah." : "Itu niat umrah. Umrah kamu sudah selesai; sekarang berniat haji.",
    },
    {
      label: "Tidak perlu berniat, memadai memakai kain ihram.",
      ok: false,
      why: "Niat ihram ialah rukun pertama haji dan umrah. Memakai kain ihram tanpa niat belum dikira berihram.",
    },
  ];
  openChoice(
    kind === "umrah" ? "Masjid Miqat Bir Ali" : "Hotel jemaah · 8 Zulhijjah",
    "Pilih lafaz niat yang betul",
    "<p>Niat di dalam hati sudah memadai, dan sunat dilafazkan.</p>",
    opts,
    () => {
      showDoa("talbiah");
      if (kind === "umrah") {
        ach("ihram");
        finishStep("niat_umrah");
      } else finishStep("niat_haji");
    }
  );
}
function actNiatHaji(): void {
  fadeDo(
    "Mandi sunat & memakai ihram",
    "8 Zulhijjah · Hari Tarwiyah",
    () => {
      S.outfit = "ihram";
      applyOutfit();
    },
    () => openNiat("haji")
  );
}
function actSolatTawaf(): void {
  pray(2.6, "Solat sunat tawaf dua rakaat di belakang Maqam Ibrahim…", () => {
    S.flags["solat_" + S.lastTawaf] = true;
    addStars(5, "Solat sunat tawaf");
    ach("maqam");
  });
}
function actZamzam(): void {
  T.zamCd = 8;
  S.tenaga = Math.min(100, S.tenaga + CONFIG.tenaga.teguk);
  if (S.air < CONFIG.tenaga.botol) {
    S.air = CONFIG.tenaga.botol;
    later(() => toast("Botol air diisi semula dengan air Zamzam.", "info", 3000), 600);
  }
  P.pose = "pray";
  T.poseT = 1;
  showDoa("zamzam");
  const key = "zam_" + (S.lastTawaf || "awal");
  if (!S.flags[key]) {
    S.flags[key] = true;
    addStars(3, "Minum air Zamzam sambil berdoa (sunat)");
  }
  ach("zamzam");
}
function openCukur(kind: "umrah" | "haji"): void {
  const male = S.gender === "L";
  const opts: ChoiceOpt[] = male
    ? [
        { label: "Bercukur seluruh kepala", sub: "Afdal bagi lelaki", ok: true, why: "Betul. Bercukur seluruh kepala lebih afdal bagi lelaki." },
        { label: "Bergunting sekurang-kurangnya tiga helai rambut", sub: "Memadai", ok: true, why: "Betul. Menggunting sekurang-kurangnya tiga helai rambut sudah memadai." },
        { label: "Memotong kuku sahaja", ok: false, why: "Tidak memadai. Tahallul memerlukan bercukur atau bergunting rambut kepala." },
      ]
    : [
        {
          label: "Gunting hujung rambut sekurang-kurangnya tiga helai",
          sub: "Sunat kira-kira seruas jari",
          ok: true,
          why: "Betul. Bagi wanita, memadai menggunting hujung rambut; wanita tidak disunatkan bercukur.",
        },
        { label: "Bercukur seluruh kepala", ok: false, why: "Wanita tidak disunatkan bercukur. Memadai menggunting hujung rambut." },
        { label: "Memotong kuku sahaja", ok: false, why: "Tidak memadai. Tahallul memerlukan bergunting rambut kepala." },
      ];
  openChoice(
    kind === "umrah" ? "Kedai gunting · Makkah" : "Khemah gunting · Mina",
    "Bercukur atau bergunting",
    "<p>Bercukur atau bergunting ialah rukun umrah dan haji, dan dengannya jemaah bertahallul.</p>",
    opts,
    (i) => {
      fadeDo(
        male && i === 0 ? "Bercukur…" : "Bergunting…",
        kind === "umrah" ? "Tahallul umrah" : "Tahallul awal",
        () => {
          if (male && i === 0) S.shaved = true;
          S.outfit = "normal";
          applyOutfit();
        },
        () => {
          if (kind === "umrah") {
            toast("Umrah selesai! Kamu bertahallul. Larangan ihram terangkat sehingga berihram haji.", "ok", 6500);
            finishStep("tahallul_umrah");
          } else {
            toast("TAHALLUL AWAL: larangan ihram terangkat kecuali bersetubuh, bercumbu dan akad nikah.", "ok", 7000);
            finishStep("cukur_nahar");
          }
        }
      );
    }
  );
}
function restFull(): void {
  S.tenaga = 100;
  S.air = CONFIG.tenaga.botol;
}
function actTarwiyah(): void {
  fadeDo("Bermalam di Mina", "Malam 9 Zulhijjah · berzikir & berehat", restFull, () => finishStep("mina_tarwiyah"));
}
function openNafar(): void {
  openChoice(
    "Khemah Maktab 87 · Mina",
    "Nafar awal atau nafar thani?",
    "<p>Kedua-duanya dibenarkan. Pilih satu untuk melihat perbezaannya.</p>",
    [
      {
        label: "Nafar awal",
        sub: "Lontar pada 12 Zulhijjah, keluar dari Mina sebelum matahari terbenam",
        ok: true,
        why: "Nafar awal: selepas melontar ketiga-tiga jamrah pada 12 Zulhijjah, keluar dari Mina sebelum matahari terbenam. Jumlah batu 49 biji.",
      },
      {
        label: "Nafar thani",
        sub: "Bermalam pada malam 13 dan melontar sekali lagi",
        ok: true,
        why: "Nafar thani: bermalam pada malam 13 dan melontar ketiga-tiga jamrah pada 13 Zulhijjah. Ini lebih sempurna. Jumlah batu 70 biji.",
      },
    ],
    (i) => {
      S.flags.nafarThani = i === 1;
      fadeDo(
        "Bermalam di Mina",
        i === 0 ? "12 Zulhijjah · lontaran diulang, keluar sebelum Maghrib" : "12 & 13 Zulhijjah · lontaran diulang",
        restFull,
        () => finishStep("nafar")
      );
    }
  );
}
function actDam(): void {
  const r = READ.dam;
  openModal({
    kicker: r.kicker,
    title: r.title,
    html: r.html,
    buttons: [
      {
        label: "Wakilkan dam",
        kind: "primary",
        onClick: () => {
          toast("Dam Tamattu' telah diwakilkan. Seekor kambing akan disembelih di Tanah Haram.", "ok", 5200);
          finishStep("dam");
        },
      },
      { label: "Tutup", kind: "ghost" },
    ],
  });
}
function actKhutbah(): void {
  const r = READ.khutbah;
  openModal({
    kicker: r.kicker,
    title: r.title,
    html: r.html,
    buttons: [
      {
        label: "Dengar khutbah & solat",
        kind: "primary",
        onClick: () =>
          pray(3, "Mendengar khutbah, kemudian solat jamak taqdim dan qasar Zohor–Asar…", () => {
            finishStep("arafah_khutbah");
            later(() => showDoa("arafah"), 300);
          }),
      },
      { label: "Tutup", kind: "ghost" },
    ],
  });
}
function actMabitMuzdalifah(): void {
  fadeDo("Bermalam di Muzdalifah", "Lepas tengah malam · 10 Zulhijjah", restFull, () => {
    toast("Mabit di Muzdalifah sempurna. Kamu boleh bertolak ke Mina.", "ok");
    finishStep("mabit_muz");
  });
}

// =====================================================================
//  MEKANIK TAWAF
// =====================================================================
type TawafKind = "umrah" | "ifadah" | "wada";
const TAWAF_NAME: Record<TawafKind, string> = { umrah: "Tawaf umrah", ifadah: "Tawaf ifadah", wada: "Tawaf wada'" };
function tawafKind(): TawafKind | null {
  if (isStep("tawaf")) return "umrah";
  if (isStep("ifadah")) return "ifadah";
  if (isStep("wada")) return "wada";
  return null;
}
const angOf = (p: Vec): number => Math.atan2(-p.y, p.x);
function segOf(a: number): number {
  if (a >= 0 && a < Math.PI / 2) return 0;
  if (a >= Math.PI / 2) return 1;
  if (a < -Math.PI / 2) return 2;
  return 3;
}
const SEG_NAMES = [
  "Hajarul Aswad → Rukun Iraqi (pintu Kaabah)",
  "Rukun Iraqi → Rukun Syami (Hijir Ismail)",
  "Rukun Syami → Rukun Yamani",
  "Rukun Yamani → Hajarul Aswad",
];

function startTawaf(): void {
  const kind: TawafKind = isStep("tawaf_start") ? "umrah" : isStep("ifadah_start") ? "ifadah" : "wada";
  const t = T.tawaf;
  S.tawafLaps = 0;
  t.active = true;
  t.last = angOf(P);
  t.cum = wrapPi(t.last);
  t.valid = true;
  t.wrong = 0;
  t.seg = segOf(t.last);
  t.bumps = 0;
  t.ramalRun = 0;
  t.ramalTot = 0;
  t.lapIst = 0;
  t.inHijr = false;
  P.pose = "throw";
  T.poseT = 0.7;
  showDoa("istilam");
  if (kind === "umrah") {
    toast("Talbiah dihentikan apabila memulakan tawaf umrah. Berjalan berlawanan arah jam, Kaabah di sebelah kiri.", "info", 6000);
    if (S.gender === "L")
      later(() => toast("Lelaki: sunat idtiba' (bahu kanan terbuka) dan ramal (berlari-lari anak) pada 3 pusingan pertama. Tekan Laju.", "info", 6500), 1800);
  } else toast(`${TAWAF_NAME[kind]} bermula. Kaabah di sebelah kiri, 7 pusingan.`, "info");
  advance();
}

function actIstilam(): void {
  T.tawaf.lapIst = S.tawafLaps;
  P.pose = "throw";
  T.poseT = 0.7;
  showDoa("istilam");
  S.stars += 1;
  toast("Isyarat ke Hajarul Aswad sambil bertakbir (sunat). Tidak perlu berasak-asak untuk menciumnya.", "info", 3600);
}

function updateTawaf(dt: number): void {
  const kind = tawafKind();
  const t = T.tawaf;
  if (!kind || scene.id !== "makkah") return;
  if (!t.active) {
    t.active = true;
    t.last = angOf(P);
    t.cum = 0;
    t.valid = false;
    t.seg = segOf(t.last);
  }
  const a = angOf(P);
  const r = Math.hypot(P.x, P.y);
  const d = wrapPi(a - t.last);
  const inMataf = r < MATAF_R;
  const inHijr = inHijrZone(P);
  const crossedCCW = P.x > 0 && t.last < 0 && a >= 0 && d > 0 && d < 0.6;
  t.last = a;

  if (inHijr && !t.inHijr) {
    t.valid = false;
    toast("Kamu masuk ke Hijir Ismail! Pusingan ini tidak sah. Keluar, kemudian mulakan semula pusingan dari garisan Hajarul Aswad.", "bad", 6500);
    SND.play("err");
  }
  t.inHijr = inHijr;
  if (t.valid && inMataf && !inHijr) t.cum += d;

  if (inMataf && d < -0.0005) t.wrong += -d;
  else if (d > 0) t.wrong = Math.max(0, t.wrong - d * 0.6);
  if (t.wrong > 0.42) {
    t.wrong = 0;
    toast("Arah salah! Tawaf mesti berlawanan arah jam — pastikan Kaabah di sebelah KIRI kamu.", "bad");
    SND.play("err");
  }
  t.outT -= dt;
  if (!inMataf && r < MATAF_R + 160 && t.outT <= 0) {
    t.outT = 6;
    toast("Kembali ke kawasan mataf (lantai putih). Dalam simulasi ini pusingan dikira di dalam mataf sahaja.", "warn");
  }
  const seg = segOf(a);
  if (seg !== t.seg) {
    t.seg = seg;
    if (seg === 3 && t.valid) showDoa("rabbana", true);
  }
  if (kind === "umrah" && S.tawafLaps < 3 && P.moving) {
    t.ramalTot += dt;
    if (T.running) t.ramalRun += dt;
  }
  if (crossedCCW) {
    if (!t.valid) {
      t.valid = true;
      t.cum = 0;
      toast("Pusingan dimulakan semula dari garisan Hajarul Aswad.", "info", 3200);
    } else if (t.cum >= TAU - 0.35) {
      S.tawafLaps++;
      t.cum = Math.max(0, t.cum - TAU);
      SND.play("lap");
      floatText(P.x, P.y - 44, `Pusingan ${S.tawafLaps}`);
      if (S.tawafLaps === 3 && kind === "umrah" && S.gender === "L" && t.ramalTot > 0 && t.ramalRun / t.ramalTot > 0.5) ach("ramal");
      if (S.tawafLaps >= 7) {
        completeTawaf(kind);
        return;
      }
      toast(LAP_TIPS[S.tawafLaps], "ok", 4200);
      saveGame();
    }
  }
}
function completeTawaf(kind: TawafKind): void {
  const t = T.tawaf;
  t.active = false;
  S.lastTawaf = kind;
  if (t.bumps < 3) ach("adab");
  const id = kind === "umrah" ? "tawaf" : kind;
  if (kind === "wada") toast("Tawaf wada' selesai. Semoga Allah menerima ibadah haji kamu.", "ok", 6000);
  else toast("Tawaf selesai! Sunat solat dua rakaat di belakang Maqam Ibrahim dan minum air Zamzam sebelum saie.", "ok", 6500);
  finishStep(id);
}
function tawafCounter(): Counter {
  const kind = tawafKind() ?? "umrah";
  const t = T.tawaf;
  const inMataf = Math.hypot(P.x, P.y) < MATAF_R;
  const frac = t.valid ? clamp(t.cum / TAU, 0, 0.999) : 0;
  let tag: Counter["tag"] = null;
  if (!t.valid) tag = { text: "Pusingan belum dikira — mula di garisan Hajarul Aswad", bad: true };
  else if (!inMataf) tag = { text: "Di luar mataf — pusingan tidak bergerak", bad: true };
  return {
    title: `${TAWAF_NAME[kind]} — pusingan`,
    cur: S.tawafLaps,
    max: 7,
    pct: (S.tawafLaps + frac) / 7,
    sub: "Berlawanan arah jam · Kaabah di kiri · " + SEG_NAMES[segOf(angOf(P))],
    tag,
  };
}
function tawafTarget(): Vec | null {
  return T.tawaf.valid && T.tawaf.active ? null : POS.makkah.line;
}

// =====================================================================
//  MEKANIK SAIE
// =====================================================================
function saieKind(): "umrah" | "haji" | null {
  if (isStep("saie")) return "umrah";
  if (isStep("saie_haji")) return "haji";
  return null;
}
function startSaie(): void {
  const startId = isStep("saie_start") ? "saie_start" : "saie_haji_start";
  S.saieCount = 0;
  S.saieAt = "safa";
  const s = T.saie;
  s.greenIn = false;
  s.legDoa = false;
  s.berdoaHere = false;
  s.doaCount = 0;
  s.runTip = false;
  showDoa("safa");
  toast("Saie bermula di Safa. Hadap Kaabah dan tekan BERDOA (sunat), kemudian berjalan ke Marwah.", "info", 6000);
  finishStep(startId);
}
function actBerdoaBukit(): void {
  const s = T.saie;
  s.berdoaHere = true;
  s.doaCount++;
  P.pose = "pray";
  T.poseT = 1.6;
  // hadap Kaabah (pusat peta)
  const d = Math.hypot(P.x, P.y) || 1;
  P.dx = -P.x / d;
  P.dy = -P.y / d;
  if (R3.active && C3.mode !== "top") C3.yaw = Math.atan2(-P.dx, -P.dy);
  toast("Hadap Kaabah, angkat kedua-dua tangan dan bertakbir: Allahu Akbar ×3, kemudian berdoa.", "info", 4500);
  showDoa("takbir");
  S.stars += 1;
  if (s.doaCount >= 8) ach("bukit");
}
function updateSaie(dt: number): void {
  const kind = saieKind();
  if (!kind || scene.id !== "makkah") return;
  const s = T.saie;
  const inCorr = inMasa(P);
  const atSafa = inCorr && P.y > MASA.safaY;
  const atMarwah = inCorr && P.y < MASA.marwahY;
  const going = S.saieCount % 2 === 0 ? "marwah" : "safa";
  const inGreen = inCorr && P.y > MASA.g1 && P.y < MASA.g2;
  if (inGreen && !s.greenIn) {
    s.greenIn = true;
    s.green = 0;
    s.run = 0;
    if (!s.legDoa) {
      showDoa("hijau", true);
      s.legDoa = true;
    }
    if (S.gender === "P" && !s.femaleTip) {
      s.femaleTip = true;
      toast("Wanita berjalan seperti biasa di kawasan lampu hijau.", "info");
    }
  }
  if (inGreen) {
    s.green += dt;
    if (T.running) s.run += dt;
  } else if (s.greenIn) {
    s.greenIn = false;
    if (S.gender === "L" && s.green > 0.6 && s.run / s.green > 0.6) {
      toast("Bagus! Kamu berlari-lari anak di antara dua lampu hijau (sunat bagi lelaki).", "ok", 4000);
      S.stars += 2;
      ach("hijau");
    } else if (S.gender === "L" && s.green > 0.6 && s.run / s.green < 0.3 && !s.runTip) {
      s.runTip = true;
      toast("Lelaki disunatkan berlari-lari anak di antara dua lampu hijau. Tekan Laju (atau Shift) pada perjalanan seterusnya.", "info", 6000);
    }
  }
  if ((going === "marwah" && atMarwah) || (going === "safa" && atSafa)) {
    S.saieCount++;
    S.saieAt = going;
    s.berdoaHere = false;
    s.legDoa = false;
    SND.play("lap");
    floatText(P.x, P.y - 44, `Perjalanan ${S.saieCount}`);
    if (S.saieCount >= 7) {
      completeSaie(kind);
      return;
    }
    const hill = going === "marwah" ? "Marwah" : "Safa";
    const next = going === "marwah" ? "SAFA" : "MARWAH";
    toast(`Perjalanan ${S.saieCount}/7 tiba di Bukit ${hill}. Hadap Kaabah dan berdoa (sunat), kemudian ke ${next}.`, "ok", 4600);
    saveGame();
  }
}
function completeSaie(kind: "umrah" | "haji"): void {
  if (T.saie.doaCount >= 8) ach("bukit");
  if (kind === "umrah") {
    toast("Saie selesai di Marwah! Seterusnya bercukur atau bergunting untuk bertahallul.", "ok", 6000);
    finishStep("saie");
  } else {
    toast("Saie haji selesai. TAHALLUL THANI: semua larangan ihram kini terangkat.", "ok", 7000);
    finishStep("saie_haji");
  }
}
function saieCounter(): Counter {
  const going = S.saieCount % 2 === 0 ? "MARWAH" : "SAFA";
  const goalY = going === "MARWAH" ? MASA.marwahY : MASA.safaY;
  const inCorr = inMasa(P);
  const span = MASA.safaY - MASA.marwahY;
  const leg = inCorr ? clamp(1 - Math.abs(P.y - goalY) / span, 0, 1) : 0;
  const m = Math.max(0, Math.round(Math.abs(P.y - goalY) * scene.mPerPx));
  const inGreen = inCorr && P.y > MASA.g1 && P.y < MASA.g2;
  return {
    title: kind2title(),
    cur: S.saieCount,
    max: 7,
    pct: (S.saieCount + leg) / 7,
    sub: inCorr ? `Menuju ke ${going} ${going === "MARWAH" ? "↑" : "↓"} · ${m} m lagi` : "Masuk semula ke koridor Mas'a",
    tag: inGreen
      ? { text: S.gender === "L" ? "Lampu hijau: lelaki sunat berlari-lari anak (Laju)" : "Lampu hijau: wanita berjalan seperti biasa", bad: false }
      : null,
  };
}
// Penunjuk arah Kaabah: di atas bukit sebelum berdoa (diilhamkan oleh prototaip saie 3D jemaah lain)
function needKaabahHint(): boolean {
  if (!started || scene.id !== "makkah" || !inMasa(P)) return false;
  const onSafa = P.y > MASA.safaY;
  const onMarwah = P.y < MASA.marwahY;
  if (isStep("saie_start", "saie_haji_start")) return onSafa;
  if (saieKind() === null || T.saie.berdoaHere) return false;
  return (S.saieAt === "safa" && onSafa) || (S.saieAt === "marwah" && onMarwah);
}
function kind2title(): string {
  return saieKind() === "haji" ? "Saie haji — perjalanan" : "Saie umrah — perjalanan";
}
function saieTarget(): Vec {
  return S.saieCount % 2 === 0 ? { x: 535, y: MASA.marwahY - 10 } : { x: 535, y: MASA.safaY + 10 };
}
function achTotal(): number {
  return ACH_LIST.filter((a) => !(a.only === "L" && S.gender !== "L")).length;
}

// =====================================================================
//  MEKANIK MELONTAR
// =====================================================================
function expectedJamrah(): JamId | null {
  if (isStep("aqabah", "aqabah2")) return "aqabah";
  if (isStep("ula")) return "ula";
  if (isStep("wusta")) return "wusta";
  return null;
}
function throwStepId(): string | null {
  const s = curStep();
  return s && ["aqabah", "ula", "wusta", "aqabah2"].includes(s.id) ? s.id : null;
}
function inThrowRange(j: JamId): boolean {
  if (scene.id !== "mina") return false;
  const J = JAM[j];
  const dx = (P.x - J.x) / (J.rx + 150);
  const dy = (P.y - J.y) / (J.ry + 150);
  return dx * dx + dy * dy < 1;
}
function jamrahFront(j: JamId): Vec {
  const J = JAM[j];
  return { x: J.x, y: J.y + J.ry + 70 };
}
function ensurePatch(): void {
  const mina = getScene("mina");
  const alive = mina.pebbles.filter((p) => p.alive).length;
  if (alive >= 14) return;
  for (let i = 0; i < 36; i++) {
    const a = rr(0, TAU);
    const r = Math.sqrt(rnd());
    mina.pebbles.push({ x: POS.mina.patch.x + Math.cos(a) * 84 * r, y: POS.mina.patch.y + Math.sin(a) * 44 * r, alive: true, s: rr(1.8, 2.8) });
  }
}
function throwAt(j: JamId): void {
  const exp = expectedJamrah();
  const sid = throwStepId();
  if (!exp || !sid) {
    toast("Tiada lontaran diperlukan sekarang.");
    return;
  }
  if (exp !== j) {
    toast(isStep("aqabah") ? "Pada 10 Zulhijjah hanya Jamrah Aqabah dilontar." : `Ikut tertib: lontar ${JAM[exp].name} dahulu.`, "warn");
    SND.play("err");
    return;
  }
  const done = S.throws[sid] ?? 0;
  if (done + T.inflight >= 7 || T.throwCd > 0) return;
  if (S.pebbles <= 0) {
    toast("Batu kamu sudah habis. Kutip batu di Kawasan batu berhampiran stesen bas.", "warn");
    ensurePatch();
    return;
  }
  T.throwCd = 0.45;
  S.pebbles--;
  P.pose = "throw";
  T.poseT = 0.35;
  T.inflight++;
  if (done === 0 && T.inflight === 1) {
    showDoa("lontar", true);
    if (sid === "aqabah") toast("Talbiah dihentikan pada lontaran pertama di Jamrah Aqabah.", "info", 4200);
  }
  const J = JAM[j];
  const e = Math.hypot((P.x - J.x) / J.rx, (P.y - J.y) / J.ry);
  const edge = Math.max(0, e - 1) * ((J.rx + J.ry) / 2);
  const sigma = 5 + Math.max(0, edge - 30) * 0.22;
  const tx = J.x + gauss() * sigma * 1.2;
  const ty = J.y + gauss() * sigma * 0.7;
  const hit = ((tx - J.x) / J.rx) ** 2 + ((ty - J.y) / J.ry) ** 2 <= 1;
  const vx = J.x - P.x;
  const vy = J.y - P.y;
  const vm = Math.hypot(vx, vy) || 1;
  P.dx = vx / vm;
  P.dy = vy / vm;
  SND.play("throw");
  spawnStone(P.x + 6, P.y - 30, tx, ty, () => {
    T.inflight = Math.max(0, T.inflight - 1);
    if (throwStepId() !== sid) return;
    if (hit) {
      const n = (S.throws[sid] = (S.throws[sid] ?? 0) + 1);
      SND.play("hit");
      dust(tx, ty, "#d9d2bf");
      floatText(tx, ty - 24, `${n}/7`);
      if (n >= 7) finishThrows(sid, j);
    } else {
      SND.play("miss");
      dust(tx, ty, "#b8a98a");
      if (sid === "aqabah") T.aqMiss++;
      toast("Tersasar! Batu tidak masuk ke dalam takungan. Lontar sebiji lagi dan bergerak lebih dekat.", "warn", 3400);
    }
  });
}
function finishThrows(sid: string, j: JamId): void {
  if (sid === "aqabah") {
    if (T.aqMiss === 0) ach("tepat");
    toast("Lontaran Jamrah Aqabah selesai. Seterusnya: selesaikan dam dan bercukur.", "ok", 5200);
  } else if (sid === "ula" || sid === "wusta") {
    toast(`${JAM[j].name} selesai. Sunat menghadap kiblat dan berdoa sebelum ke jamrah seterusnya.`, "ok", 5200);
  } else toast("Ketiga-tiga jamrah selesai untuk hari ini.", "ok", 4200);
  later(() => finishStep(sid), 450);
}
function throwCounter(sid: string, j: JamId): Counter {
  const n = S.throws[sid] ?? 0;
  const inR = inThrowRange(j);
  return {
    title: `Lontar ${JAM[j].name}`,
    cur: n,
    max: 7,
    sub: inR ? "Tekan LONTAR. Semakin dekat dengan takungan, semakin tepat." : `Pergi ke ${JAM[j].name}.`,
    tag: { text: `Batu dalam beg: ${S.pebbles}`, bad: S.pebbles + n < 7 },
  };
}

// =====================================================================
//  MEKANIK WUKUF
// =====================================================================
function toggleWukuf(): void {
  if (T.wukuf.praying) {
    stopWukuf();
    return;
  }
  if (!insideArafah(P)) {
    toast("Kamu berada di luar sempadan Arafah! Wukuf tidak sah di sini. Bergerak ke timur melepasi papan kuning.", "bad", 5600);
    SND.play("err");
    return;
  }
  T.wukuf.praying = true;
  T.wukuf.cardT = 0;
  toast("Berwukuf… kekal diam, berdoa, berzikir dan beristighfar.", "info", 3600);
}
function stopWukuf(msg?: string): void {
  if (!T.wukuf.praying) return;
  T.wukuf.praying = false;
  P.pose = "stand";
  if (msg) toast(msg, "warn");
}
function updateWukuf(dt: number): void {
  if (!isStep("wukuf")) {
    T.wukuf.praying = false;
    return;
  }
  if (!T.wukuf.praying) return;
  P.pose = "pray";
  S.wukuf = Math.min(1, S.wukuf + dt / 24);
  T.wukuf.cardT -= dt;
  if (T.wukuf.cardT <= 0) {
    T.wukuf.cardT = 6;
    const keys = ["arafah", "istighfar", "talbiah", "rabbana"];
    showDoa(keys[T.wukuf.idx++ % keys.length]);
  }
  if (S.wukuf >= 1) {
    T.wukuf.praying = false;
    P.pose = "stand";
    ach("arafah");
    toast("Alhamdulillah, wukuf selesai. Tunggu hingga matahari terbenam, kemudian bertolak ke Muzdalifah.", "ok", 6500);
    finishStep("wukuf");
  }
}
function wukufCounter(): Counter {
  const inside = insideArafah(P);
  return {
    title: "Wukuf di Arafah",
    cur: Math.floor(S.wukuf * 100),
    max: 100,
    unit: "%",
    pct: S.wukuf,
    sub: !inside ? "Kamu di luar sempadan Arafah!" : T.wukuf.praying ? "Sedang berdoa… kekal diam" : "Tekan BERDOA dan kekal diam",
    tag: inside ? { text: "Dalam sempadan Arafah", bad: false } : { text: "Luar sempadan — wukuf tidak sah", bad: true },
  };
}

// =====================================================================
//  TAMAT
// =====================================================================
function onQuizDone(kind: "umrah" | "final", score: number, total: number): void {
  if (kind === "umrah") {
    finishStep("quiz_umrah");
    return;
  }
  S.quiz = Math.max(S.quiz, score);
  if (score === total) ach("quiz");
  finishStep("quiz_final");
}
function onAllDone(): void {
  ach("selesai");
  saveGame();
  later(openCert, 1200);
}
function openCert(): void {
  const d = new Date();
  const tarikh = d.toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });
  openModal({
    kicker: "Sijil penyertaan",
    title: "Perjalanan haji selesai",
    cls: "cert",
    html: `<div class="cert-in">
<div class="cert-k">Dengan ini diakui bahawa</div>
<div class="cert-n">${esc(S.name)}</div>
<p>telah menyempurnakan <b>Simulasi Haji Tamattu'</b> — 8 bab dan ${TASKS.length} tugasan, dari Miqat Bir Ali hingga Tawaf Wada'.</p>
<div class="cert-s"><div><b>${S.stars}</b><span>bintang</span></div><div><b>${S.ach.length}/${achTotal()}</b><span>pencapaian</span></div><div><b>${S.quiz}/${QUIZ_FINAL.length}</b><span>kuiz akhir</span></div></div>
<p class="cert-d">Semoga Allah menerima ibadah kita. Haji mabrur tiada balasan baginya melainkan syurga (HR al-Bukhari dan Muslim).</p>
<div class="cert-f">${esc(tarikh)} · ${esc(CONFIG.credit)}</div></div>`,
    buttons: [
      { label: "Main semula", kind: "ghost", onClick: resetGame },
      { label: "Terus meneroka", kind: "primary" },
    ],
  });
}
function resetGame(): void {
  hush();
  removeKey(CONFIG.saveKey);
  const name = S.name;
  const g = S.gender;
  S = newSave(name, g);
  T.tawaf.active = false;
  T.saie.doaCount = 0;
  for (const id of Object.keys(SCENES) as SceneId[]) delete SCENES[id];
  rnd = mulberry32(87);
  applyOutfit();
  loadScene("miqat");
  renderMission();
  saveGame();
  later(() => banner(CHAPTERS[0]), 400);
}

// =====================================================================
//  FIZIK & PERLANGGARAN
// =====================================================================
function collide(p: Vec, r: number, solids: Solid[]): void {
  for (const s of solids) {
    switch (s.t) {
      case "c": {
        const dx = p.x - s.x;
        const dy = p.y - s.y;
        const m = s.r + r;
        if (Math.abs(dx) > m || Math.abs(dy) > m) break;
        const d = Math.hypot(dx, dy);
        if (d < m && d > 0.0001) {
          p.x = s.x + (dx / d) * m;
          p.y = s.y + (dy / d) * m;
        }
        break;
      }
      case "r": {
        if (p.x < s.x - r || p.x > s.x + s.w + r || p.y < s.y - r || p.y > s.y + s.h + r) break;
        const cx = clamp(p.x, s.x, s.x + s.w);
        const cy = clamp(p.y, s.y, s.y + s.h);
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.hypot(dx, dy);
        if (d < 0.0001) {
          const l = p.x - s.x;
          const rt = s.x + s.w - p.x;
          const tp = p.y - s.y;
          const bt = s.y + s.h - p.y;
          const m = Math.min(l, rt, tp, bt);
          if (m === l) p.x = s.x - r;
          else if (m === rt) p.x = s.x + s.w + r;
          else if (m === tp) p.y = s.y - r;
          else p.y = s.y + s.h + r;
        } else if (d < r) {
          p.x = cx + (dx / d) * r;
          p.y = cy + (dy / d) * r;
        }
        break;
      }
      case "s": {
        const vx = s.x2 - s.x1;
        const vy = s.y2 - s.y1;
        const L = vx * vx + vy * vy;
        const t = L > 0 ? clamp(((p.x - s.x1) * vx + (p.y - s.y1) * vy) / L, 0, 1) : 0;
        const cx = s.x1 + vx * t;
        const cy = s.y1 + vy * t;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const m = s.r + r;
        const d = Math.hypot(dx, dy);
        if (d < m && d > 0.0001) {
          p.x = cx + (dx / d) * m;
          p.y = cy + (dy / d) * m;
        }
        break;
      }
      case "d": {
        const dx = p.x - s.x;
        const dy = p.y - s.y;
        const lim = s.s + r * 1.25;
        const Lm = Math.abs(dx) + Math.abs(dy);
        if (Lm < lim) {
          const pen = (lim - Lm) / 2;
          p.x += (dx >= 0 ? 1 : -1) * pen;
          p.y += (dy >= 0 ? 1 : -1) * pen;
        }
        break;
      }
      case "e": {
        const dx = (p.x - s.x) / (s.rx + r);
        const dy = (p.y - s.y) / (s.ry + r);
        const d = Math.hypot(dx, dy);
        if (d < 1 && d > 0.0001) {
          p.x = s.x + (dx / d) * (s.rx + r);
          p.y = s.y + (dy / d) * (s.ry + r);
        }
        break;
      }
    }
  }
}

// =====================================================================
//  TENAGA & AIR (diilhamkan oleh pemantauan kecergasan simulator HajSim)
// =====================================================================
function heatFactor(): number {
  const l = currentLight();
  if (l === "night") return 0.7;
  if (l === "dusk") return 1;
  // Masjidil Haram berbumbung sebahagiannya dan lantai marmar mataf sejuk
  return scene.id === "makkah" ? 1.15 : 1.7;
}
function updateTenaga(dt: number): void {
  T.minumCd -= dt;
  if (!SET.tenaga) return;
  const k = CONFIG.tenaga;
  const still = !P.moving && T.busy <= 0;
  if (P.moving) S.tenaga -= (T.running ? k.laju : k.jalan) * heatFactor() * dt;
  else if (still || T.wukuf.praying) S.tenaga += k.rehat * dt;
  S.tenaga = clamp(S.tenaga, 0, 100);
  // amaran sekali bagi setiap paras; diset semula selepas pulih
  if (S.tenaga > 50) T.enWarn = 0;
  if (S.tenaga < 35 && T.enWarn < 1) {
    T.enWarn = 1;
    toast(
      S.air > 0
        ? "Tenaga rendah. Tekan Minum (F) untuk meneguk air, dan berdiri diam untuk berehat."
        : "Tenaga rendah dan botol kosong. Isi semula di tong air Zamzam, atau berdiri diam untuk berehat.",
      "warn",
      5200
    );
    sayClip("tenaga", "Tenaga rendah. Minum air dan berehat.", "ms");
  }
  if (S.tenaga < 15 && T.enWarn < 2) {
    T.enWarn = 2;
    toast("Terlalu letih! Kamu tidak boleh berlari. Awas strok haba: berteduh, minum dan berehat dahulu.", "bad", 6000);
  }
}
function actMinum(): void {
  if (!started || !SET.tenaga || modalOpen || overlayBusy || T.minumCd > 0) return;
  if (S.air <= 0) {
    toast("Botol air kosong. Isi semula di tong air Zamzam atau semasa menaiki bas.", "info", 4200);
    return;
  }
  T.minumCd = 1.2;
  S.air--;
  S.tenaga = Math.min(100, S.tenaga + CONFIG.tenaga.teguk);
  SND.play("pick");
  floatText(P.x, P.y - 44, `+${CONFIG.tenaga.teguk} tenaga`);
  refreshHUD();
}

function updatePlayer(dt: number): void {
  const raw = getInput();
  const inp = R3.active ? input3D(raw, dt) : raw;
  const mag = Math.min(1, Math.hypot(inp.x, inp.y));
  const blocked = T.busy > 0 || overlayBusy || modalOpen;
  if (T.wukuf.praying && mag > 0.3 && !blocked) stopWukuf("Wukuf dihentikan. Tekan BERDOA semula dan kekal diam.");
  const tired = SET.tenaga && S.tenaga < 15;
  const wantRun = (runToggle || shiftHeld) && !tired;
  const slow = !SET.tenaga ? 1 : tired ? 0.65 : S.tenaga < 35 ? 0.85 : 1;
  const spd = blocked || T.wukuf.praying ? 0 : (wantRun ? CONFIG.runSpeed : CONFIG.walkSpeed) * mag * slow;
  const ox = P.x;
  const oy = P.y;
  if (spd > 0) {
    P.x += (inp.x / mag) * spd * dt;
    P.y += (inp.y / mag) * spd * dt;
  }
  for (const n of scene.npcs) {
    const q = n.p;
    if (q.pose === "sleep") continue;
    const dx = P.x - q.x;
    const dy = P.y - q.y;
    if (dx > 16 || dx < -16 || dy > 16 || dy < -16) continue;
    const d = Math.hypot(dx, dy);
    if (d < 14 && d > 0.01) {
      const push = (14 - d) * 0.85;
      P.x += (dx / d) * push;
      P.y += (dy / d) * push;
      if (wantRun && spd > 0 && T.bumpCd <= 0) {
        T.bumpCd = 0.8;
        T.tawaf.bumps++;
        if (T.tawaf.bumps % 4 === 3) toast("Jaga adab — jangan menolak atau berasak-asak dengan jemaah lain.", "warn", 3600);
      }
    }
  }
  collide(P, 8, scene.solids);
  collide(P, 8, scene.solids);
  const b = scene.bounds;
  P.x = clamp(P.x, b.x0 + 10, b.x1 - 10);
  P.y = clamp(P.y, b.y0 + 10, b.y1 - 10);
  const vx = P.x - ox;
  const vy = P.y - oy;
  const sp = Math.hypot(vx, vy);
  P.moving = spd > 0 && sp > 0.12;
  if (P.moving) {
    P.dx = vx / sp;
    P.dy = vy / sp;
    P.walk += sp * 0.3;
  }
  T.running = wantRun && P.moving;
  if (T.poseT > 0) {
    T.poseT -= dt;
    if (T.poseT <= 0 && P.pose !== "pray") P.pose = "stand";
    else if (T.poseT <= 0) P.pose = "stand";
  } else if (!T.wukuf.praying && T.busy <= 0) P.pose = "stand";
}

function updateNPCs(dt: number): void {
  for (const n of scene.npcs) {
    const p = n.p;
    const ox = p.x;
    const oy = p.y;
    switch (n.mode) {
      case "tawaf": {
        const near = Math.abs(p.x - P.x) < 22 && Math.abs(p.y - P.y) < 22 ? 0.35 : 1;
        n.a += n.w * dt * near;
        const r = n.rad + Math.sin(n.a * 3 + n.ph) * 6;
        p.x = Math.cos(n.a) * r;
        p.y = -Math.sin(n.a) * r;
        break;
      }
      case "lane": {
        const near = Math.abs(p.x - P.x) < 18 && Math.abs(p.y - P.y) < 18 ? 0.3 : 1;
        const v = n.sp * dt * n.dir * near;
        if (n.axis === "y") {
          p.y += v;
          if (p.y > n.hi) n.dir = -1;
          if (p.y < n.lo) n.dir = 1;
        } else {
          p.x += v;
          if (p.x > n.hi) n.dir = -1;
          if (p.x < n.lo) n.dir = 1;
        }
        break;
      }
      case "wander": {
        if (n.wait > 0) {
          n.wait -= dt;
          break;
        }
        n.cd -= dt;
        const dx = n.tx - p.x;
        const dy = n.ty - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 4 || n.cd <= 0) {
          n.wait = rr(1, 5);
          n.cd = 9;
          const t = n.pickT ? n.pickT() : { x: p.x, y: p.y };
          n.tx = t.x;
          n.ty = t.y;
        } else {
          const s = Math.min(d, n.sp * dt);
          p.x += (dx / d) * s;
          p.y += (dy / d) * s;
          collide(p, 7, scene.solids);
        }
        break;
      }
      case "thrower": {
        n.cd -= dt;
        if (n.cd <= 0) {
          n.cd = rr(1.6, 4.6);
          p.pose = "throw";
          n.wait = 0.3;
          if (inView(p.x, p.y, 60)) spawnStone(p.x + 6, p.y - 30, n.jx + rr(-0.7, 0.7) * n.lo, n.jy + rr(-0.6, 0.6) * n.hi, null);
        }
        if (n.wait > 0) {
          n.wait -= dt;
          if (n.wait <= 0) p.pose = "stand";
        }
        break;
      }
      case "static":
        break;
    }
    if (n.mode === "tawaf" || n.mode === "lane" || n.mode === "wander") {
      const vx = p.x - ox;
      const vy = p.y - oy;
      const sp = Math.hypot(vx, vy);
      p.moving = sp > 0.02;
      if (p.moving) {
        p.dx = vx / sp;
        p.dy = vy / sp;
        p.walk += sp * 0.35;
      }
    }
  }
}

// =====================================================================
//  BATU TERBANG, ZARAH & TEKS TERAPUNG
// =====================================================================
interface Stone {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  dur: number;
  h: number;
  cb: (() => void) | null;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  life: number;
  col: string;
  s: number;
}
interface Floater {
  x: number;
  y: number;
  t: number;
  text: string;
}
const stones: Stone[] = [];
const parts: Particle[] = [];
const floaters: Floater[] = [];

function spawnStone(x0: number, y0: number, x1: number, y1: number, cb: (() => void) | null): void {
  const d = Math.hypot(x1 - x0, y1 - y0);
  stones.push({ x0, y0, x1, y1, t: 0, dur: 0.45 + d / 900, h: 40 + d * 0.18, cb });
}
function dust(x: number, y: number, col: string): void {
  for (let i = 0; i < 8; i++) {
    const a = rr(0, TAU);
    parts.push({ x, y, vx: Math.cos(a) * rr(20, 50), vy: Math.sin(a) * rr(8, 22) - 10, t: 0, life: rr(0.4, 0.7), col, s: rr(1.5, 3) });
  }
}
function sparkle(x: number, y: number): void {
  for (let i = 0; i < 18; i++) {
    const a = rr(0, TAU);
    parts.push({ x, y, vx: Math.cos(a) * rr(30, 80), vy: Math.sin(a) * rr(30, 80) - 30, t: 0, life: rr(0.6, 1.1), col: i % 2 ? "#f3d488" : "#ffffff", s: rr(1.5, 3.2) });
  }
}
function floatText(x: number, y: number, text: string): void {
  floaters.push({ x, y, t: 0, text });
}
function updateFx(dt: number): void {
  for (let i = stones.length - 1; i >= 0; i--) {
    const s = stones[i];
    s.t += dt / s.dur;
    if (s.t >= 1) {
      stones.splice(i, 1);
      s.cb?.();
    }
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 60 * dt;
    if (p.t > p.life) parts.splice(i, 1);
  }
  for (let i = floaters.length - 1; i >= 0; i--) {
    floaters[i].t += dt;
    if (floaters[i].t > 1.3) floaters.splice(i, 1);
  }
}

function updatePebbles(): void {
  if (!scene.pebbles.length) return;
  for (const pb of scene.pebbles) {
    if (!pb.alive) continue;
    if (Math.abs(pb.x - P.x) < 15 && Math.abs(pb.y - P.y) < 11) {
      pb.alive = false;
      S.pebbles++;
      SND.play("pick");
      floatText(P.x, P.y - 44, "+1 batu");
      if (!T.pickTip) {
        T.pickTip = true;
        toast("Batu dikutip! Saiznya kira-kira sebesar hujung jari. Kutip dengan berjalan di atasnya.", "info", 4200);
      }
      if (scene.id === "muzdalifah" && S.pebbles >= 28) ach("batu");
    }
  }
}

// =====================================================================
//  INTERAKSI
// =====================================================================
let bestInteract: Interact | null = null;
function findInteract(): Interact | null {
  let best: Interact | null = null;
  let bd = 1e9;
  for (const it of scene.interacts) {
    const d = it.test ? 0 : Math.hypot(P.x - it.x, P.y - it.y);
    const ok = it.test ? it.test(P) : d < it.r;
    if (!ok) continue;
    const en = it.enabled();
    const lk = !en && it.locked ? it.locked() : null;
    if (!en && !lk) continue;
    const score = d + (en ? 0 : 5000) + (it.id === "doa" ? 100 : 0);
    if (score < bd) {
      bd = score;
      best = it;
    }
  }
  return best;
}
function doInteract(): void {
  if (!started || modalOpen || overlayBusy || T.busy > 0) return;
  const it = bestInteract;
  if (!it) {
    toast("Tiada apa-apa untuk dilakukan di sini. Ikut anak panah kuning ke sasaran seterusnya.", "info", 3200);
    return;
  }
  if (it.enabled()) {
    SND.play("tap");
    it.action();
  } else {
    const m = it.locked ? it.locked() : null;
    if (m) toast(m, "info", 4200);
  }
}

// =====================================================================
//  KAMERA & LUKISAN
// =====================================================================
const canvas = el<HTMLCanvasElement>("world");
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const lightCv = document.createElement("canvas");
const lctx = lightCv.getContext("2d") as CanvasRenderingContext2D;
const miniCv = el<HTMLCanvasElement>("mini");
const mctx = miniCv.getContext("2d") as CanvasRenderingContext2D;
let W = 800;
let H = 600;
let DPR = 1;
let BASE_ZOOM = 1;
const cam = { x: 0, y: 0, zoom: 1 };
const FONT_D = '"Baloo Bhaijaan 2", "Trebuchet MS", sans-serif';
const FONT_B = 'Nunito, "Segoe UI", sans-serif';

function resize(): void {
  const r = canvas.getBoundingClientRect();
  W = Math.max(320, Math.round(r.width));
  H = Math.max(320, Math.round(r.height));
  DPR = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  lightCv.width = Math.round(W / 2);
  lightCv.height = Math.round(H / 2);
  BASE_ZOOM = clamp(Math.min(W, H * 1.15) / 720, 0.6, 1.25);
  resize3D();
}
function toScreen(x: number, y: number): Vec {
  return { x: (x - cam.x) * cam.zoom + W / 2, y: (y - cam.y) * cam.zoom + H / 2 };
}

function currentLight(): Light {
  const st = curStep();
  if (scene.id === "muzdalifah") return "night";
  if (st && st.scene === scene.id && st.light) return st.light;
  return "day";
}

function render(): void {
  const z = cam.zoom;
  VIEW.x0 = cam.x - W / 2 / z;
  VIEW.x1 = cam.x + W / 2 / z;
  VIEW.y0 = cam.y - H / 2 / z;
  VIEW.y1 = cam.y + H / 2 / z;
  if (R3.active) {
    render3D();
    drawOverlay3D();
    return;
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = scene.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (W / 2 - cam.x * z), DPR * (H / 2 - cam.y * z));
  scene.ground(ctx);

  // batu di tanah
  for (const pb of scene.pebbles) {
    if (!pb.alive || !inView(pb.x, pb.y, 10)) continue;
    ctx.fillStyle = "#8d877a";
    ell(ctx, pb.x, pb.y, pb.s + 0.6, pb.s * 0.75);
    ctx.fill();
    ctx.fillStyle = "#d5cfc1";
    ell(ctx, pb.x - 0.5, pb.y - 0.6, pb.s * 0.5, pb.s * 0.35);
    ctx.fill();
  }

  // sasaran & sorotan interaksi
  const target = started ? stepTarget() : null;
  if (target && SET.arrow) drawTargetRing(target);
  if (started) {
    drawSaieFloor();
    drawTawafFloor();
  }
  if (started && bestInteract && bestInteract.ring && bestInteract.enabled()) {
    const pulse = 0.5 + 0.5 * Math.sin(T.time * 5);
    ctx.strokeStyle = `rgba(255,255,255,${0.5 + pulse * 0.4})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 5]);
    ell(ctx, bestInteract.x, bestInteract.y, 26 + pulse * 3, 11 + pulse);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // susun ikut y
  const list: Drawable[] = [];
  for (const pr of scene.props) list.push(pr);
  for (const n of scene.npcs) if (inView(n.p.x, n.p.y)) list.push({ y: n.p.y, draw: (c) => drawPerson(c, n.p) });
  if (started)
    list.push({
      y: P.y,
      draw: (c) => {
        c.strokeStyle = "rgba(217,168,60,.95)";
        c.lineWidth = 2;
        ell(c, P.x, P.y, 12, 5);
        c.stroke();
        drawPerson(c, P);
      },
    });
  list.sort((a, b) => a.y - b.y);
  for (const d of list) d.draw(ctx);

  if (started) {
    ctx.globalAlpha = 0.28;
    drawPerson(ctx, P);
    ctx.globalAlpha = 1;
  }

  // batu terbang
  for (const s of stones) {
    const x = lerp(s.x0, s.x1, s.t);
    const y = lerp(s.y0, s.y1, s.t) - Math.sin(Math.PI * s.t) * s.h;
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ell(ctx, x, lerp(s.y0 + 30, s.y1, s.t), 2, 1);
    ctx.fill();
    ctx.fillStyle = "#6f6a60";
    circ(ctx, x, y, 2.2);
    ctx.fill();
  }
  for (const p of parts) {
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillStyle = p.col;
    circ(ctx, p.x, p.y, p.s);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawLighting(currentLight());

  // lapisan skrin
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawLabels();
  for (const f of floaters) {
    const s = toScreen(f.x, f.y);
    ctx.globalAlpha = clamp(1.3 - f.t, 0, 1);
    ctx.font = `800 14px ${FONT_D}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(15,60,46,.85)";
    ctx.strokeText(f.text, s.x, s.y - f.t * 26);
    ctx.fillStyle = "#ffe08a";
    ctx.fillText(f.text, s.x, s.y - f.t * 26);
  }
  ctx.globalAlpha = 1;
  if (started) {
    drawNameTag();
    if (target && SET.arrow) drawArrow(target);
    if (needKaabahHint()) drawKaabahHint();
  }
}

// anak panah biru di lantai Mas'a menunjuk arah perjalanan saie
function drawSaieFloor(): void {
  if (scene.id !== "makkah" || !saieKind() || !SET.arrow) return;
  const north = S.saieCount % 2 === 0;
  const cx = (MASA.x0 + MASA.x1) / 2;
  const sign = north ? 1 : -1;
  let i = 0;
  for (let y = -430; y <= 430; y += 60, i++) {
    if (!inView(cx, y, 30)) continue;
    const a = 0.2 + 0.4 * (0.5 + 0.5 * Math.sin(T.time * 4 + i * 0.9 * sign));
    ctx.save();
    ctx.translate(cx, y);
    if (!north) ctx.rotate(Math.PI);
    ctx.fillStyle = `rgba(61,143,224,${a})`;
    poly(ctx, [0, -11, 10, 0, 4, 0, 4, 10, -4, 10, -4, 0, -10, 0]);
    ctx.fill();
    ctx.restore();
  }
}
// anak panah tawaf lawan arah jam di lantai mataf
function drawTawafFloor(): void {
  if (scene.id !== "makkah" || !tawafKind() || !SET.arrow) return;
  for (const r of [150, 250]) {
    const n = Math.round((TAU * r) / 40);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const x = Math.cos(a) * r;
      const y = -Math.sin(a) * r;
      if (!inView(x, y, 20)) continue;
      const al = 0.18 + 0.4 * (0.5 + 0.5 * Math.sin(T.time * 5 - (i % 3) * 2.1));
      ctx.save();
      ctx.translate(x, y);
      // tangen lawan arah jam dalam koordinat skrin (y ke bawah): (-sin a, -cos a)
      ctx.rotate(Math.atan2(-Math.cos(a), -Math.sin(a)) + Math.PI / 2);
      ctx.fillStyle = `rgba(61,143,224,${al})`;
      poly(ctx, [0, -10, 9, 0, 4, 0, 4, 9, -4, 9, -4, 0, -9, 0]);
      ctx.fill();
      ctx.restore();
    }
  }
}

// dial kemajuan tawaf: Kaabah di tengah, garisan mula, kedudukan & pusingan semasa
function drawTawafDial(): void {
  const box = el("tawafDial");
  const kind = started && scene.id === "makkah" ? tawafKind() : null;
  box.hidden = !kind;
  if (!kind) return;
  const cv = el<HTMLCanvasElement>("tdCv");
  const rect = cv.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(40, Math.round(rect.width));
  if (cv.width !== w * dpr) {
    cv.width = w * dpr;
    cv.height = w * dpr;
  }
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, w);
  const cx = w / 2;
  const R = w / 2 - 6;
  const k = R / MATAF_R;
  c.fillStyle = "rgba(255,255,255,.14)";
  circ(c, cx, cx, R);
  c.fill();
  // garisan Hajarul Aswad (timur) & lampu hijau
  c.strokeStyle = "#3fe08a";
  c.lineWidth = 2.5;
  line(c, cx + KS * k, cx, cx + R, cx);
  // Kaabah (penjuru menghala ke arah mata angin)
  c.fillStyle = "#151515";
  poly(c, [cx + KS * k, cx, cx, cx - KS * k, cx - KS * k, cx, cx, cx + KS * k]);
  c.fill();
  // Hijir Ismail
  c.strokeStyle = "#f1eee6";
  c.lineWidth = 2;
  c.beginPath();
  c.arc(cx + HIJR.x * k, cx + HIJR.y * k, HIJR.r * k, (165 * Math.PI) / 180, (285 * Math.PI) / 180);
  c.stroke();
  // kemajuan pusingan semasa (lawan arah jam bermula dari garisan)
  const t = T.tawaf;
  if (t.valid && t.cum > 0) {
    c.strokeStyle = "#f2c230";
    c.lineWidth = 4;
    c.beginPath();
    c.arc(cx, cx, R - 2, 0, -clamp(t.cum, 0, TAU), true);
    c.stroke();
  }
  // jemaah
  const px = cx + clamp(P.x * k, -R, R);
  const py = cx + clamp(P.y * k, -R, R);
  c.fillStyle = "#2f7de0";
  c.strokeStyle = "#fff";
  c.lineWidth = 2;
  circ(c, px, py, 5);
  c.fill();
  c.stroke();
  el("tdN").textContent = `${S.tawafLaps}/7`;
}

// anak panah hijau "KAABAH" di sekeliling watak
function drawKaabahHint(): void {
  const a = Math.atan2(-P.y, -P.x);
  const s = toScreen(P.x, P.y - 20);
  const R = 62;
  const pulse = 1 + Math.sin(T.time * 5) * 0.08;
  ctx.save();
  ctx.translate(s.x + Math.cos(a) * R, s.y + Math.sin(a) * R);
  ctx.rotate(a);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "#2fbf6a";
  ctx.strokeStyle = "rgba(8,60,30,.9)";
  ctx.lineWidth = 2;
  poly(ctx, [15, 0, -9, -11, -4, 0, -9, 11]);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  drawPill(s.x + Math.cos(a) * (R + 30), s.y + Math.sin(a) * (R + 30), "ARAH KAABAH", "#1f7a3f");
}
function drawPill(x: number, y: number, text: string, bg: string): void {
  ctx.font = `800 11px ${FONT_B}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const w = ctx.measureText(text).width + 16;
  ctx.fillStyle = bg;
  rrect(ctx, x - w / 2, y - 10, w, 20, 10);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x, y + 0.5);
}

// jalur kemajuan saie (Safa di bawah, Marwah di atas)
function drawSaieStrip(): void {
  const box = el("saieStrip");
  const on = started && scene.id === "makkah" && (saieKind() !== null || isStep("saie_start", "saie_haji_start"));
  box.hidden = !on;
  if (!on) return;
  const cv = el<HTMLCanvasElement>("ssCv");
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(20, Math.round(r.width));
  const h = Math.max(60, Math.round(r.height));
  if (cv.width !== w * dpr || cv.height !== h * dpr) {
    cv.width = w * dpr;
    cv.height = h * dpr;
  }
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const top = 8;
  const bot = h - 8;
  const Y = (y: number): number => lerp(top, bot, (y - MASA.marwahY) / (MASA.safaY - MASA.marwahY));
  const lx = w / 2;
  // laluan
  c.fillStyle = "rgba(255,255,255,.16)";
  rrect(c, lx - 9, top - 6, 18, bot - top + 12, 9);
  c.fill();
  // zon lampu hijau
  c.fillStyle = "rgba(63,224,138,.75)";
  c.fillRect(lx - 9, Y(MASA.g1), 18, Y(MASA.g2) - Y(MASA.g1));
  // sasaran
  const north = S.saieCount % 2 === 0 && saieKind() !== null;
  const goalY = saieKind() === null ? null : north ? top : bot;
  if (goalY !== null) {
    c.fillStyle = "#f2c230";
    circ(c, lx, goalY, 6 + Math.sin(T.time * 5) * 1.2);
    c.fill();
  }
  // kedudukan jemaah
  if (inMasa(P)) {
    const py = clamp(Y(P.y), top, bot);
    c.fillStyle = "#2f7de0";
    c.strokeStyle = "#fff";
    c.lineWidth = 2;
    circ(c, lx, py, 6);
    c.fill();
    c.stroke();
    if (saieKind() !== null) {
      c.fillStyle = "#fff";
      const d = north ? -1 : 1;
      poly(c, [lx, py + d * 15, lx - 5, py + d * 9, lx + 5, py + d * 9]);
      c.fill();
    }
  }
  el("ssN").textContent = `${S.saieCount}/7`;
}

function stepTarget(): Vec | null {
  if (insideMiqat) return miqatInteriorTarget();
  const st = curStep();
  if (!st || st.scene !== scene.id) return null;
  if (st.travel) return scene.busPos;
  return st.target ? st.target() : null;
}

function drawTargetRing(t: Vec): void {
  const pulse = 0.5 + 0.5 * Math.sin(T.time * 3.2);
  ctx.strokeStyle = `rgba(217,168,60,${0.55 + pulse * 0.4})`;
  ctx.lineWidth = 3;
  ell(ctx, t.x, t.y, 22 + pulse * 6, 9 + pulse * 2.5);
  ctx.stroke();
  const by = t.y - 64 - pulse * 6;
  ctx.fillStyle = "#d9a83c";
  circ(ctx, t.x, by, 10);
  ctx.fill();
  ctx.strokeStyle = "#fff6d6";
  ctx.lineWidth = 2;
  ctx.stroke();
  poly(ctx, [t.x - 5, by + 7, t.x + 5, by + 7, t.x, by + 15]);
  ctx.fillStyle = "#d9a83c";
  ctx.fill();
  ctx.fillStyle = "#3c2604";
  ctx.font = `800 13px ${FONT_D}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", t.x, by + 1);
}

function drawArrow(t: Vec): void {
  const dx = t.x - P.x;
  const dy = t.y - P.y;
  const d = Math.hypot(dx, dy);
  if (d < 70) return;
  const a = Math.atan2(dy, dx);
  const s = toScreen(P.x, P.y - 20);
  const R = 54;
  const ax = s.x + Math.cos(a) * R;
  const ay = s.y + Math.sin(a) * R;
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(a);
  ctx.fillStyle = "#f2c230";
  ctx.strokeStyle = "rgba(60,38,4,.85)";
  ctx.lineWidth = 2;
  poly(ctx, [13, 0, -8, -9, -4, 0, -8, 9]);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  const m = Math.round(d * scene.mPerPx);
  const txt = m >= 1000 ? (m / 1000).toFixed(1) + " km" : m + " m";
  ctx.font = `800 11px ${FONT_B}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lx = s.x + Math.cos(a) * (R + 20);
  const ly = s.y + Math.sin(a) * (R + 20);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(15,60,46,.85)";
  ctx.strokeText(txt, lx, ly);
  ctx.fillStyle = "#fff";
  ctx.fillText(txt, lx, ly);
}

function drawNameTag(): void {
  const s = toScreen(P.x, P.y - 46);
  ctx.font = `800 11.5px ${FONT_D}`;
  const w = ctx.measureText(S.name).width + 16;
  ctx.fillStyle = "#d9a83c";
  rrect(ctx, s.x - w / 2, s.y - 10, w, 19, 9.5);
  ctx.fill();
  ctx.strokeStyle = "#fff3c4";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#3c2604";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(S.name, s.x, s.y + 0.5);
}

function drawLabels(): void {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const L of scene.labels) {
    if (!inView(L.x, L.y, 40)) continue;
    if (L.kind === "small" && cam.zoom < 0.62) continue;
    const s = toScreen(L.x, L.y);
    const place = L.kind === "place";
    ctx.font = place ? `800 11px ${FONT_D}` : `700 10.5px ${FONT_B}`;
    const w = ctx.measureText(L.text).width + 16;
    const h = place ? 20 : 18;
    let bg = "rgba(255,255,255,.9)";
    let fg = "#1c2622";
    let bd = "rgba(0,0,0,.12)";
    if (place) {
      bg = "rgba(15,70,54,.92)";
      fg = "#ffffff";
      bd = "rgba(243,212,136,.7)";
    } else if (L.kind === "green") {
      bg = "#1f7a3f";
      fg = "#ffffff";
      bd = "rgba(255,255,255,.5)";
    } else if (L.kind === "warn") {
      bg = "#b5651d";
      fg = "#ffffff";
      bd = "rgba(255,255,255,.5)";
    }
    ctx.fillStyle = bg;
    rrect(ctx, s.x - w / 2, s.y - h / 2, w, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = bd;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.fillText(L.text, s.x, s.y + 0.5);
  }
}

function drawLighting(light: Light): void {
  if (light === "day") return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (light === "dusk") {
    ctx.fillStyle = "rgba(255,124,48,.16)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(70,30,80,.13)";
    ctx.fillRect(0, 0, W, H);
    return;
  }
  const lw = lightCv.width;
  const lh = lightCv.height;
  const k = lw / W;
  lctx.globalCompositeOperation = "source-over";
  lctx.clearRect(0, 0, lw, lh);
  lctx.fillStyle = "rgba(8,14,36,.66)";
  lctx.fillRect(0, 0, lw, lh);
  lctx.globalCompositeOperation = "destination-out";
  const hole = (x: number, y: number, R: number, a: number): void => {
    const s = toScreen(x, y);
    const sx = s.x * k;
    const sy = s.y * k;
    const r = R * cam.zoom * k;
    if (sx < -r || sy < -r || sx > lw + r || sy > lh + r) return;
    const g = lctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    lctx.fillStyle = g;
    lctx.fillRect(sx - r, sy - r, r * 2, r * 2);
  };
  for (const l of scene.lights) hole(l.x, l.y + 50, 170, 0.85);
  hole(P.x, P.y - 10, 110, 0.75);
  lctx.globalCompositeOperation = "source-over";
  ctx.drawImage(lightCv, 0, 0, W, H);
}

function drawMini(): void {
  const r = miniCv.getBoundingClientRect();
  const w = Math.round(r.width);
  const h = Math.round(r.height);
  if (w < 8 || h < 8) return;
  const pw = Math.round(w * DPR);
  const ph = Math.round(h * DPR);
  if (miniCv.width !== pw || miniCv.height !== ph) {
    miniCv.width = pw;
    miniCv.height = ph;
  }
  const b = scene.bounds;
  const s = Math.min(w / (b.x1 - b.x0), h / (b.y1 - b.y0));
  const ox = (w - (b.x1 - b.x0) * s) / 2;
  const oy = (h - (b.y1 - b.y0) * s) / 2;
  mctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  mctx.fillStyle = "#cdbb94";
  mctx.fillRect(0, 0, w, h);
  mctx.setTransform(DPR * s, 0, 0, DPR * s, DPR * (ox - b.x0 * s), DPR * (oy - b.y0 * s));
  scene.mini(mctx);
  mctx.fillStyle = "rgba(40,40,50,.45)";
  for (let i = 0; i < scene.npcs.length; i += 3) {
    const p = scene.npcs[i].p;
    mctx.fillRect(p.x - 4, p.y - 4, 8, 8);
  }
  const t = stepTarget();
  if (t) {
    mctx.strokeStyle = "#d9a83c";
    mctx.lineWidth = 3 / s;
    circ(mctx, t.x, t.y, 6 / s);
    mctx.stroke();
  }
  mctx.fillStyle = "#2f7de0";
  mctx.strokeStyle = "#ffffff";
  mctx.lineWidth = 1.6 / s;
  circ(mctx, P.x, P.y, 4.2 / s);
  mctx.fill();
  mctx.stroke();
  if (R3.active) {
    // arah pandangan kamera 3D
    const fx = -Math.sin(C3.yaw);
    const fy = -Math.cos(C3.yaw);
    const L = 90;
    mctx.fillStyle = "rgba(255,255,255,.35)";
    poly(mctx, [P.x, P.y, P.x + (fx * 0.9 - fy * 0.45) * L, P.y + (fy * 0.9 + fx * 0.45) * L, P.x + (fx * 0.9 + fy * 0.45) * L, P.y + (fy * 0.9 - fx * 0.45) * L]);
    mctx.fill();
  } else {
    // bingkai pandangan kamera
    mctx.strokeStyle = "rgba(255,255,255,.7)";
    mctx.lineWidth = 1 / s;
    mctx.strokeRect(VIEW.x0, VIEW.y0, VIEW.x1 - VIEW.x0, VIEW.y1 - VIEW.y0);
  }
}

function drawAvatar(): void {
  const cv = el<HTMLCanvasElement>("avatar");
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, cv.width, cv.height);
  const q: Person = { ...P, x: 0, y: 0, dx: 0, dy: 1, moving: false, pose: "stand", scale: 1 };
  c.setTransform(3.1, 0, 0, 3.1, cv.width / 2, cv.height * 0.98 + 18);
  drawPerson(c, q);
}
function drawGenderPreview(id: string, g: Gender): void {
  const cv = el<HTMLCanvasElement>(id);
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  c.clearRect(0, 0, cv.width, cv.height);
  const q = mkPerson(g, true);
  q.skin = P.skin;
  q.hair = P.hair;
  q.dy = 1;
  q.dx = 0;
  c.setTransform(2.6, 0, 0, 2.6, cv.width / 2, cv.height - 6);
  drawPerson(c, q);
}

// =====================================================================
//  GELUNG UTAMA
// =====================================================================
let lastT = performance.now();
function loop(now: number): void {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  T.time += dt;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function update(dt: number): void {
  updateNPCs(dt);
  updateFx(dt);
  if (!started) {
    cam.zoom = BASE_ZOOM * 1.05;
    cam.x = Math.sin(T.time * 0.12) * 40 + 40;
    cam.y = 20 + Math.cos(T.time * 0.1) * 30;
    return;
  }
  T.bumpCd -= dt;
  updateMiqatActivity(dt);
  T.throwCd -= dt;
  T.zamCd -= dt;
  if (T.busy > 0) {
    T.busy -= dt;
    if (T.busy <= 0) {
      P.pose = "stand";
      const f = T.busyCb;
      T.busyCb = null;
      f?.();
    }
  }
  updatePlayer(dt);
  updateTenaga(dt);
  updateTawaf(dt);
  updateSaie(dt);
  updateWukuf(dt);
  updatePebbles();
  const st = curStep();
  if (st && st.done && !modalOpen && !overlayBusy && st.done()) advance();

  bestInteract = modalOpen || overlayBusy ? null : findInteract();
  if (bestInteract) {
    const en = bestInteract.enabled();
    setAct(en ? "on" : "lock", bestInteract.label(), bestInteract.icon);
  } else setAct("none", "INTERAKSI", "hand");

  const z = BASE_ZOOM * SET.zoom;
  cam.zoom = lerp(cam.zoom, z, Math.min(1, dt * 8));
  cam.x = lerp(cam.x, P.x, Math.min(1, dt * 6));
  // geser kamera sedikit ke utara kerana HUD atas lebih tebal daripada kawalan bawah
  cam.y = lerp(cam.y, P.y - (H * 0.08) / cam.zoom, Math.min(1, dt * 6));
  update3D(dt);

  T.hudT -= dt;
  if (T.hudT <= 0) {
    T.hudT = 0.12;
    refreshHUD();
  }
  T.miniT -= dt;
  if (T.miniT <= 0) {
    T.miniT = 0.12;
    if (SET.mini) drawMini();
    drawSaieStrip();
    drawTawafDial();
  }
  T.saveT -= dt;
  if (T.saveT <= 0) {
    T.saveT = 6;
    saveGame();
  }
}

// =====================================================================
//  MULA
// =====================================================================
let pickedGender: Gender = "L";
function setupStart(saved: Save | null): void {
  el("stTitle").textContent = CONFIG.title;
  el("stKick").textContent = CONFIG.subtitle;
  el("stCredit").textContent = CONFIG.credit;
  el("stStats").textContent = `${CHAPTERS.length} bab · ${TASKS.length} tugasan · 5 lokasi`;
  const name = el<HTMLInputElement>("inName");
  const gL = el("gL");
  const gP = el("gP");
  const pickG = (g: Gender): void => {
    pickedGender = g;
    gL.setAttribute("aria-checked", String(g === "L"));
    gP.setAttribute("aria-checked", String(g === "P"));
    if (!name.dataset.touched) name.value = g === "L" ? "Ahmad" : "Aisyah";
  };
  name.addEventListener("input", () => (name.dataset.touched = "1"));
  gL.addEventListener("click", () => pickG("L"));
  gP.addEventListener("click", () => pickG("P"));
  drawGenderPreview("gLc", "L");
  drawGenderPreview("gPc", "P");
  pickG("L");
  const go = el("stGo");
  const cont = el("stCont");
  if (saved) {
    cont.hidden = false;
    const f = ALL_STEPS[Math.min(saved.step, ALL_STEPS.length - 1)];
    cont.textContent = `Sambung: ${saved.name} · Tugasan ${Math.min(f.ti + 1, TASKS.length)}/${TASKS.length}`;
    cont.onclick = () => startGame(saved);
    go.textContent = "Mula baharu";
    go.className = "btn ghost";
    cont.className = "btn primary";
  }
  go.onclick = () => {
    const n = name.value.trim().slice(0, 16) || (pickedGender === "L" ? "Ahmad" : "Aisyah");
    startGame(newSave(n, pickedGender));
  };
  el<HTMLFormElement>("stForm").addEventListener("submit", (e) => {
    e.preventDefault();
    go.click();
  });
}

function startGame(save: Save): void {
  SND.init();
  S = save;
  // simpanan lama (sebelum ciri tenaga) tiada medan ini
  if (typeof S.tenaga !== "number") S.tenaga = 100;
  if (typeof S.air !== "number") S.air = CONFIG.tenaga.botol;
  started = true;
  applyOutfit();
  const st = curStep();
  loadScene(st ? st.scene : S.scene);
  el("start").hidden = true;
  el("hud").classList.remove("pre");
  (document.activeElement as HTMLElement | null)?.blur();
  renderMission();
  refreshHUD();
  if (window.innerWidth > 760 && window.innerHeight > 560) toggleMission(true);
  if (S.step === 0) {
    later(() => banner(CHAPTERS[0]), 500);
    later(() => toast("Ikut anak panah kuning ke sasaran. Butang INTERAKSI akan menyala apabila ada tindakan.", "info", 6500), 1600);
    // Nama murid kekal pada skrin; audio hanya salam kemudian arahan langkah.
    sayClip("salam", "Assalamualaikum", "ms", true, () => sayStep(curStep()));
  } else {
    toast(`Selamat kembali, ${S.name}. ${curStep()?.text ?? ""}`, "info", 5000);
    sayClip("selamat-kembali", "Selamat kembali", "ms", true, () => sayStep(curStep()));
  }
  saveGame();
  if (SET.view3d) void set3D(true, true);
  else if (S.step < 3) later(() => toast("Cuba butang 3D di atas untuk paparan 3D. Pilih kamera Mata untuk berjalan seperti jemaah sebenar.", "info", 6500), 9000);
}

function boot(hot: Partial<Save> | null): void {
  loadSettings();
  document.title = CONFIG.title;
  document.querySelectorAll<HTMLElement>("[data-ic]").forEach((n) => (n.innerHTML = ic(n.dataset.ic as string) + n.innerHTML));
  paintAudio();
  paintViewControls();
  applyMiniSetting();
  applyTenagaSetting();
  initInput();
  if (SET.gyro) void setGyro(true, true);
  resize();
  window.addEventListener("resize", resize);
  scene = getScene("makkah");
  const saved = loadJSON<Save>(CONFIG.saveKey);
  setupStart(validSave(saved) ? saved : null);
  renderMission();
  if (hot && validSave(hot)) startGame(hot);
  requestAnimationFrame((t) => {
    lastT = t;
    loop(t);
  });
}

// Sokongan muat semula langsung (pelihara kemajuan semasa dikemas kini)
type HotApi = { snapshot?: (fn: () => unknown) => void; ready?: (fn: (d: unknown) => void) => void; data?: unknown };
const HOT: HotApi | undefined = (window as unknown as { claude?: { hot?: HotApi } }).claude?.hot;
HOT?.snapshot?.(() => (started ? S : null));
if (HOT?.ready) HOT.ready((d) => boot((d as Partial<Save>) ?? null));
else boot((HOT?.data as Partial<Save>) ?? null);

// Cangkuk ujian (untuk pembangun)
(window as unknown as { __jh: unknown }).__jh = {
  get S() {
    return S;
  },
  P,
  T,
  get scene() {
    return scene.id;
  },
  get sc() {
    return scene;
  },
  step: () => curStep()?.id,
  tp: (x: number, y: number) => {
    P.x = x;
    P.y = y;
    cam.x = x;
    cam.y = y;
  },
  finish: () => advance(),
  models: MODELS3D,
  C3,
  R3,
  set3D: (on: boolean) => set3D(on, true),
  cycleCam: () => cycleCam(),
  load: (id: SceneId) => loadScene(id),
  act: () => doInteract(),
  joy: (x: number, y: number) => {
    JOY.active = x !== 0 || y !== 0;
    JOY.x = x;
    JOY.y = y;
  },
};
