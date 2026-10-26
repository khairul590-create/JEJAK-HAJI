// =====================================================================
//  Fail 03: LOKASI — Miqat, Makkah, Mina, Arafah, Muzdalifah
// =====================================================================

type Solid =
  | { t: "c"; x: number; y: number; r: number }
  | { t: "s"; x1: number; y1: number; x2: number; y2: number; r: number }
  | { t: "d"; x: number; y: number; s: number }
  | { t: "r"; x: number; y: number; w: number; h: number }
  | { t: "e"; x: number; y: number; rx: number; ry: number };

type IconName = "hand" | "book" | "bus" | "pray" | "stone" | "cut" | "water";

interface Interact {
  id: string;
  x: number;
  y: number;
  r: number;
  test?: (p: Vec) => boolean;
  label: () => string;
  icon: IconName;
  enabled: () => boolean;
  locked?: () => string | null;
  action: () => void;
  ring?: boolean; // lukis gelang sorotan di dunia
}

interface Label {
  x: number;
  y: number;
  text: string;
  kind: "place" | "small" | "green" | "warn";
  // kedudukan khas untuk paparan 3D (jika berbeza daripada 2D)
  x3?: number;
  y3?: number;
  h3?: number;
}

interface Pebble {
  x: number;
  y: number;
  alive: boolean;
  s: number;
}

type NpcMode = "tawaf" | "lane" | "wander" | "static" | "thrower";

interface NPC {
  p: Person;
  mode: NpcMode;
  a: number;
  rad: number;
  w: number;
  ph: number;
  axis: "x" | "y";
  lo: number;
  hi: number;
  dir: number;
  sp: number;
  tx: number;
  ty: number;
  wait: number;
  pickT: (() => Vec) | null;
  jx: number;
  jy: number;
  cd: number;
  normal: boolean; // jemaah yang tidak berihram (mengikut babak)
}

interface Scene {
  id: SceneId;
  name: string;
  bounds: { x0: number; y0: number; x1: number; y1: number };
  spawn: Vec;
  busPos: Vec;
  mPerPx: number;
  bg: string;
  solids: Solid[];
  props: Drawable[];
  interacts: Interact[];
  npcs: NPC[];
  labels: Label[];
  pebbles: Pebble[];
  lights: Vec[];
  ground: (c: Ctx) => void;
  mini: (c: Ctx) => void;
  ambient: number;
  m3: M3[];
}

const SCENE_NAMES: Record<SceneId, string> = {
  miqat: "Miqat Bir Ali",
  makkah: "Masjidil Haram",
  mina: "Mina",
  arafah: "Arafah",
  muzdalifah: "Muzdalifah",
};

// ---------- Geometri penting ----------
const MATAF_R = 330;
const KS = 58; // separuh pepenjuru tapak Kaabah
const KH = 64; // tinggi Kaabah
const HIJR = { x: -29, y: -29, r: 40 };
const MASA = { x0: 470, x1: 600, safaY: 470, marwahY: -470, g1: 100, g2: 230 };
const ARAFAH_X = -380;
const JAM: Record<"ula" | "wusta" | "aqabah", { x: number; y: number; rx: number; ry: number; name: string }> = {
  // Susunan timur → barat: Ula, Wusta, Aqabah (Aqabah paling hampir dengan Makkah)
  ula: { x: 400, y: -420, rx: 86, ry: 38, name: "Jamrah Ula" },
  wusta: { x: 100, y: -420, rx: 86, ry: 38, name: "Jamrah Wusta" },
  aqabah: { x: -400, y: -420, rx: 86, ry: 38, name: "Jamrah Aqabah" },
};
type JamId = keyof typeof JAM;

const POS = {
  miqat: { board: { x: -120, y: 126 }, bilik: { x: -430, y: 26 }, masjid: { x: 0, y: -176 }, bus: { x: 320, y: 312 } },
  makkah: {
    board: { x: 0, y: 672 },
    line: { x: 200, y: 0 },
    safa: { x: 535, y: 520 },
    marwah: { x: 535, y: -520 },
    barber: { x: 730, y: -476 },
    hotel: { x: -570, y: 884 },
    bus: { x: 370, y: 898 },
    maqamPray: { x: 92, y: -92 },
    zam1: { x: 328, y: -153 },
    zam2: { x: -328, y: 153 },
  },
  mina: {
    tent: { x: 190, y: 216 },
    dam: { x: -625, y: 92 },
    barber: { x: -625, y: 268 },
    board: { x: -260, y: -262 },
    patch: { x: -540, y: 440 },
    bus: { x: -585, y: 600 },
  },
  arafah: { khemah: { x: 150, y: -42 }, board: { x: -350, y: 336 }, bus: { x: -585, y: 410 } },
  muzdalifah: { mat: { x: 200, y: 182 }, masyar: { x: 0, y: -362 }, bus: { x: -585, y: 410 } },
};

// ---------- Pembina asas ----------
function newScene(id: SceneId, b: Scene["bounds"], spawn: Vec, busPos: Vec, mPerPx: number, bg: string): Scene {
  const sc: Scene = {
    id,
    name: SCENE_NAMES[id],
    bounds: b,
    spawn,
    busPos,
    mPerPx,
    bg,
    solids: [],
    props: [],
    interacts: [],
    npcs: [],
    labels: [],
    pebbles: [],
    lights: [],
    ground: () => undefined,
    mini: () => undefined,
    ambient: 0.4,
    m3: [],
  };
  M3_TARGET = sc.m3;
  return sc;
}

function mkNPC(mode: NpcMode, p: Person): NPC {
  return {
    p,
    mode,
    a: 0,
    rad: 0,
    w: 0,
    ph: rr(0, TAU),
    axis: "y",
    lo: 0,
    hi: 0,
    dir: 1,
    sp: rr(30, 55),
    tx: p.x,
    ty: p.y,
    wait: rr(0, 3),
    pickT: null,
    jx: 0,
    jy: 0,
    cd: rr(0.5, 4),
    normal: false,
  };
}
function addWanderers(sc: Scene, n: number, x0: number, y0: number, x1: number, y1: number, ihram = true): void {
  for (let i = 0; i < n; i++) {
    const p = mkPerson(undefined, ihram);
    p.x = rr(x0, x1);
    p.y = rr(y0, y1);
    const npc = mkNPC("wander", p);
    npc.pickT = () => ({ x: rr(x0, x1), y: rr(y0, y1) });
    npc.tx = p.x;
    npc.ty = p.y;
    npc.normal = !ihram;
    sc.npcs.push(npc);
  }
}
function addStatic(sc: Scene, x: number, y: number, pose: Pose, ihram = true, g?: Gender): void {
  const p = mkPerson(g, ihram);
  p.x = x;
  p.y = y;
  p.pose = pose;
  p.dy = rnd() < 0.5 ? 1 : -1;
  p.dx = rr(-0.5, 0.5);
  sc.npcs.push(mkNPC("static", p));
}
function addLane(sc: Scene, axis: "x" | "y", fixed: number, lo: number, hi: number, ihram = true): void {
  const p = mkPerson(undefined, ihram);
  const n = mkNPC("lane", p);
  n.axis = axis;
  n.lo = lo;
  n.hi = hi;
  n.dir = rnd() < 0.5 ? 1 : -1;
  n.sp = rr(38, 66);
  if (axis === "y") {
    p.x = fixed;
    p.y = rr(lo, hi);
  } else {
    p.y = fixed;
    p.x = rr(lo, hi);
  }
  sc.npcs.push(n);
}
function busInteract(pos: Vec): Interact {
  return {
    id: "bus",
    x: pos.x,
    y: pos.y,
    r: 82,
    icon: "bus",
    ring: true,
    label: () => {
      const t = curStep()?.travel;
      return t ? "NAIK BAS\n" + SCENE_NAMES[t].toUpperCase() : "BAS JEMAAH";
    },
    enabled: () => !!curStep()?.travel,
    locked: () => {
      const st = curStep();
      return st ? `Bas belum bertolak. Selesaikan dahulu: ${st.text}.` : "Semua tugasan sudah selesai.";
    },
    action: () => {
      const t = curStep()?.travel;
      if (t) travelTo(t);
    },
  };
}
function boardInteract(id: string, pos: Vec, readKey: string, after?: () => void): Interact {
  return {
    id,
    x: pos.x,
    y: pos.y,
    r: 58,
    icon: "book",
    ring: true,
    label: () => "BACA PAPAN",
    enabled: () => true,
    action: () => openReading(readKey, after),
  };
}
function tentGrid(sc: Scene, x0: number, y0: number, cols: number, rows: number, sx: number, sy: number, w: number, d: number, hlCell: [number, number] | null): void {
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = x0 + i * sx;
      const y = y0 + j * sy;
      const hl = !!hlCell && hlCell[0] === i && hlCell[1] === j;
      sc.props.push(tentProp(x, y, w, d, hl ? "#fffdf2" : "#fbfbf7", hl));
      sc.solids.push({ t: "r", x, y, w, h: d });
    }
}

// =====================================================================
//  MIQAT BIR ALI
// =====================================================================
function buildMiqat(): Scene {
  const sc = newScene("miqat", { x0: -560, y0: -470, x1: 560, y1: 490 }, { x: 250, y: 240 }, POS.miqat.bus, 0.25, "#e8d6ae");
  sc.ambient = 0.25;
  // Masjid
  sc.solids.push({ t: "r", x: -230, y: -430, w: 460, h: 220 });
  m3({ k: "bld", x: -230, y: -430, w: 460, d: 220, h: 70, col: "#f0e9da", style: "arch", sign: "MASJID MIQAT", domes: [{ x: 0, y: -320, r: 62 }, { x: -150, y: -320, r: 28 }, { x: 150, y: -320, r: 28 }] });
  sc.props.push({
    y: -210,
    draw: (c) => {
      shadowBox(c, -230, -430, 460, 220, 22);
      box(c, -230, -430, 460, 220, 70, "#f0e9da", "#f7f2e8");
      archRow(c, -220, -270, 440, 60, 9, "#b9a681");
      c.fillStyle = "#5b4a32";
      rrect(c, -22, -262, 44, 52, 6);
      c.fill();
      dome(c, 0, -360, 70, "#e9e2d2");
      dome(c, -150, -330, 30, "#e9e2d2");
      dome(c, 150, -330, 30, "#e9e2d2");
      c.fillStyle = "#16634c";
      c.font = "800 11px Nunito, sans-serif";
      c.textAlign = "center";
      c.fillText("MASJID MIQAT", 0, -274);
    },
  });
  sc.props.push(minaretProp(280, -250, 170));
  sc.solids.push({ t: "c", x: 280, y: -250, r: 14 });
  // Bilik persalinan
  sc.solids.push({ t: "r", x: -530, y: -150, w: 200, h: 150 });
  m3({ k: "bld", x: -530, y: -150, w: 200, d: 150, h: 50, col: "#e8dcc6", style: "plain", sign: "BILIK MANDI & PERSALINAN" });
  sc.props.push({
    y: 0,
    draw: (c) => {
      shadowBox(c, -530, -150, 200, 150, 14);
      box(c, -530, -150, 200, 150, 50, "#e8dcc6");
      c.fillStyle = "#6c5a40";
      rrect(c, -446, -40, 32, 40, 4);
      c.fill();
      c.fillStyle = "#145a43";
      rrect(c, -510, -48, 70, 16, 3);
      c.fill();
      c.fillStyle = "#fff";
      c.font = "800 7px Nunito, sans-serif";
      c.textAlign = "center";
      c.fillText("BILIK MANDI", -475, -37);
    },
  });
  sc.props.push(boardProp(POS.miqat.board.x, POS.miqat.board.y - 18, "MIQAT BIR ALI"));
  sc.solids.push({ t: "r", x: -147, y: 102, w: 54, h: 8 });
  // Bas
  sc.props.push(busProp(260, 350, 150, 46));
  sc.solids.push({ t: "r", x: 260, y: 350, w: 150, h: 46 });
  for (const [x, y] of [
    [-300, 110],
    [-210, 170],
    [70, 150],
    [340, 50],
    [-390, -260],
    [400, -150],
    [-470, 180],
    [460, 170],
    [-60, 330],
    [-300, 380],
  ] as const) {
    sc.props.push(palmProp(x, y));
    sc.solids.push({ t: "c", x, y, r: 6 });
  }
  addWanderers(sc, 16, -300, -190, 300, 60, true);
  addWanderers(sc, 10, -480, 80, 140, 440, false);
  m3({ k: "mountains", x0: -560, y0: -470, x1: 560, y1: 490, col: "#a88a62", seed: 3 });
  for (let i = 0; i < 8; i++) addStatic(sc, rr(-200, 200), rr(-190, -150), rnd() < 0.5 ? "pray" : "sit", true, "L");

  sc.labels.push(
    { x: 0, y: -448, text: "MASJID MIQAT BIR ALI", kind: "place", y3: -300, h3: 15 },
    { x: -430, y: -214, text: "BILIK PERSALINAN", kind: "place", y3: -75, h3: 7.5 },
    { x: 335, y: 290, text: "BAS KE MAKKAH", kind: "place", y3: 373, h3: 6 }
  );

  sc.ground = (c) => {
    c.fillStyle = "#e8d6ae";
    c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
    c.fillStyle = "#f3eee3";
    c.fillRect(-330, -210, 660, 280);
    gridLines(c, -330, -210, 330, 70, 40, "rgba(160,140,100,.18)");
    c.fillStyle = "#efe6d2";
    c.fillRect(-60, 70, 120, 180);
    c.fillRect(-60, 220, 400, 60);
    c.fillStyle = "#a9a398";
    c.fillRect(140, 280, 410, 200);
    c.strokeStyle = "rgba(255,255,255,.6)";
    c.lineWidth = 2;
    for (let x = 160; x < 540; x += 60) line(c, x, 420, x, 470);
    c.fillStyle = "#efe3c9";
    c.fillRect(-520, 0, 200, 40);
  };
  sc.mini = (c) => {
    c.fillStyle = "#e8d6ae";
    c.fillRect(-560, -470, 1120, 960);
    c.fillStyle = "#f3eee3";
    c.fillRect(-330, -210, 660, 280);
    c.fillStyle = "#cbbd9c";
    c.fillRect(-230, -430, 460, 220);
    c.fillRect(-530, -150, 200, 150);
    c.fillStyle = "#a9a398";
    c.fillRect(140, 280, 410, 200);
    c.fillStyle = "#16634c";
    c.fillRect(260, 350, 150, 46);
  };

  sc.interacts.push(
    boardInteract("board", POS.miqat.board, "miqat", () => finishStep("miqat_board")),
    {
      id: "bilik",
      ...POS.miqat.bilik,
      r: 58,
      icon: "water",
      ring: true,
      label: () => "MASUK BILIK\nPERSALINAN",
      enabled: () => isStep("ihram_wear"),
      locked: () => (isStep("miqat_board") ? "Baca papan penerangan miqat dahulu." : "Bilik persalinan dan bilik mandi."),
      action: () => enterMiqatInterior("wash"),
    },
    {
      id: "masjid",
      ...POS.miqat.masjid,
      r: 74,
      icon: "pray",
      ring: true,
      label: () => "MASUK\nMASJID",
      enabled: () => isStep("solat_ihram", "niat_umrah"),
      locked: () => (isStep("miqat_board", "ihram_wear") ? "Mandi sunat dan pakai ihram dahulu di bilik persalinan." : "Masjid Miqat Bir Ali."),
      action: () => enterMiqatInterior("mosque"),
    },
    busInteract(POS.miqat.bus)
  );
  return sc;
}

// =====================================================================
//  MAKKAH — MASJIDIL HARAM & MAS'A
// =====================================================================
function drawKaabah(c: Ctx): void {
  const s = KS;
  const H = KH;
  const E = [s, 0];
  const S = [0, s];
  const Wc = [-s, 0];
  const N = [0, -s];
  c.fillStyle = "rgba(30,30,40,.16)";
  poly(c, [s + 14, 8, 10, s + 10, -s + 8, 10, 6, -s + 8]);
  c.fill();
  c.fillStyle = "#d8d3c6";
  poly(c, [s + 5, 0, 0, s + 5, -s - 5, 0, 0, -s - 5]);
  c.fill();
  const face = (a: number[], b: number[], h0: number, h1: number, col: string): void => {
    poly(c, [a[0], a[1] - h0, b[0], b[1] - h0, b[0], b[1] - h1, a[0], a[1] - h1]);
    c.fillStyle = col;
    c.fill();
  };
  face(Wc, S, 0, H, "#151517");
  face(S, E, 0, H, "#25252a");
  // kain putih di bahagian bawah (kiswah diangkat pada musim haji)
  face(Wc, S, 0, H * 0.2, "#e6e3da");
  face(S, E, 0, H * 0.2, "#f2f0e8");
  // hizam emas
  face(Wc, S, H * 0.66, H * 0.77, "#b88b2c");
  face(S, E, H * 0.66, H * 0.77, "#d9ab46");
  c.strokeStyle = "rgba(255,236,170,.75)";
  c.lineWidth = 0.7;
  for (const [a, b] of [
    [Wc, S],
    [S, E],
  ]) {
    c.beginPath();
    for (let t = 0.04; t < 0.96; t += 0.02) {
      const x = lerp(a[0], b[0], t);
      const y = lerp(a[1], b[1], t) - H * 0.715 + Math.sin(t * 90) * 1.4;
      if (t < 0.05) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  }
  // bumbung
  c.fillStyle = "#3b3b40";
  poly(c, [E[0], E[1] - H, N[0], N[1] - H, Wc[0], Wc[1] - H, S[0], S[1] - H]);
  c.fill();
  c.strokeStyle = "rgba(255,255,255,.14)";
  c.lineWidth = 1;
  c.stroke();
  c.strokeStyle = "rgba(255,255,255,.18)";
  line(c, S[0], S[1], S[0], S[1] - H);
  // Hajarul Aswad di penjuru timur
  c.fillStyle = "#cfcfd6";
  ell(c, s - 1.5, -12, 3.6, 4.6);
  c.fill();
  c.fillStyle = "#151515";
  ell(c, s - 1.5, -12, 2.1, 2.9);
  c.fill();
}

function inHijrZone(p: Vec): boolean {
  const dx = p.x - HIJR.x;
  const dy = p.y - HIJR.y;
  return Math.hypot(dx, dy) < HIJR.r && dx + dy < 0;
}
function inMasa(p: Vec): boolean {
  return p.x > MASA.x0 && p.x < MASA.x1 && p.y > -600 && p.y < 600;
}

function vwall(c: Ctx, x: number, y1: number, y2: number, h = 30): void {
  if (FLAT_GROUND) return;
  c.fillStyle = "#d6c8ab";
  c.fillRect(x - 6, y1 - h, 12, y2 - y1 + h);
  c.fillStyle = "#c2b08c";
  c.fillRect(x - 6, y2 - h, 12, h);
  c.strokeStyle = "rgba(90,70,40,.22)";
  c.lineWidth = 1;
  c.strokeRect(x - 6, y1 - h, 12, y2 - y1 + h);
}

function buildMakkah(): Scene {
  const sc = newScene("makkah", { x0: -720, y0: -660, x1: 840, y1: 1040 }, { x: 330, y: 850 }, POS.makkah.bus, 0.3, "#e4d3b0");
  sc.ambient = 1;

  // ----- pepejal -----
  sc.solids.push({ t: "d", x: 0, y: 0, s: KS + 4 });
  m3({ k: "kaabah" });
  m3({ k: "maqam", x: 68, y: -68 });
  m3({ k: "arcade", r0: 405, r1: 431, h: 42 });
  m3({ k: "gate", x0: -80, x1: 80, y: 600 });
  m3({ k: "green", x0: MASA.x0, x1: MASA.x1, y: MASA.g1 });
  m3({ k: "green", x0: MASA.x0, x1: MASA.x1, y: MASA.g2 });
  m3({
    k: "masa",
    x0: MASA.x0,
    x1: MASA.x1,
    y0: -600,
    y1: 600,
    g1: MASA.g1,
    g2: MASA.g2,
    west: [
      [-380, -300],
      [-70, 70],
      [300, 380],
    ],
    east: [[-470, -410]],
  });
  m3({ k: "skyline" });
  // dinding Hijir Ismail (lengkok rendah dengan bukaan di kedua-dua hujung)
  {
    const a0 = (165 * Math.PI) / 180;
    const a1 = (285 * Math.PI) / 180;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const t0 = lerp(a0, a1, i / n);
      const t1 = lerp(a0, a1, (i + 1) / n);
      sc.solids.push({
        t: "s",
        x1: HIJR.x + Math.cos(t0) * HIJR.r,
        y1: HIJR.y + Math.sin(t0) * HIJR.r,
        x2: HIJR.x + Math.cos(t1) * HIJR.r,
        y2: HIJR.y + Math.sin(t1) * HIJR.r,
        r: 3,
      });
    }
  }
  sc.solids.push({ t: "c", x: 68, y: -68, r: 11 }); // Maqam Ibrahim
  const W = (x1: number, y1: number, x2: number, y2: number): void => {
    sc.solids.push({ t: "s", x1, y1, x2, y2, r: 6 });
    m3({ k: "wall", x1, y1, x2, y2, h: 34 });
  };
  W(-520, -600, -520, 600);
  W(-520, -600, 600, -600);
  W(600, -600, 600, -470);
  W(600, -410, 600, 600);
  W(-520, 600, -80, 600);
  W(80, 600, 600, 600);
  W(470, -600, 470, -380);
  W(470, -300, 470, -70);
  W(470, 70, 470, 300);
  W(470, 380, 470, 600);
  // tiang serambi
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * TAU + 0.05;
    const x = Math.cos(a) * 418;
    const y = -Math.sin(a) * 418;
    sc.solids.push({ t: "c", x, y, r: 7 });
    m3({ k: "pillar", x, y, h: 42, r: 6.5, col: "#e6d9be" });
    sc.props.push({
      y,
      draw: (c) => {
        c.fillStyle = "rgba(60,40,10,.12)";
        ell(c, x + 6, y + 1, 10, 4);
        c.fill();
        c.fillStyle = "#e0d2b6";
        c.fillRect(x - 6, y - 36, 12, 36);
        c.fillStyle = "#efe5d1";
        c.fillRect(x - 6, y - 36, 4, 36);
        c.fillStyle = "#cdbb98";
        c.fillRect(x - 8, y - 40, 16, 5);
        c.fillStyle = "#b99a5a";
        c.fillRect(x - 8, y - 6, 16, 3);
      },
    });
  }
  // Kaabah & Maqam Ibrahim
  sc.props.push({ y: 0, draw: drawKaabah });
  sc.props.push({
    y: -68,
    draw: (c) => {
      const x = 68;
      const y = -68;
      c.fillStyle = "rgba(40,30,10,.15)";
      ell(c, x + 5, y + 2, 13, 5);
      c.fill();
      c.fillStyle = "#b08a3c";
      c.fillRect(x - 8, y - 22, 16, 22);
      c.fillStyle = "rgba(210,235,240,.75)";
      c.fillRect(x - 6, y - 20, 12, 15);
      c.strokeStyle = "#d9b45a";
      c.lineWidth = 1;
      for (let k = -4; k <= 4; k += 4) line(c, x + k, y - 20, x + k, y - 5);
      dome(c, x, y - 22, 8.5, "#d4ae55");
    },
  });
  // Air Zamzam
  for (const z of [POS.makkah.zam1, POS.makkah.zam2]) {
    sc.solids.push({ t: "r", x: z.x - 12, y: z.y - 10, w: 24, h: 12 });
    m3({ k: "cooler", x: z.x, y: z.y });
    sc.props.push({
      y: z.y + 2,
      draw: (c) => {
        box(c, z.x - 12, z.y - 10, 24, 12, 20, "#e9eef2", "#ffffff");
        c.fillStyle = "#3d6fb4";
        c.fillRect(z.x - 12, z.y - 6, 24, 4);
        c.fillStyle = "#9fc3e6";
        circ(c, z.x - 5, z.y - 24, 4);
        c.fill();
        circ(c, z.x + 5, z.y - 24, 4);
        c.fill();
      },
    });
  }
  // dinding mendatar (prop bertinggi)
  sc.props.push({ y: -594, draw: (c) => box(c, -526, -606, 1132, 12, 32, "#d6c8ab") });
  sc.props.push({ y: 606, draw: (c) => box(c, -526, 594, 446, 12, 32, "#d6c8ab") });
  sc.props.push({ y: 606, draw: (c) => box(c, 80, 594, 526, 12, 32, "#d6c8ab") });
  sc.props.push(minaretProp(-104, 612, 172));
  sc.props.push(minaretProp(104, 612, 172));
  sc.props.push(minaretProp(-520, -600, 160));
  sc.props.push(minaretProp(600, -600, 160));
  sc.solids.push({ t: "c", x: -104, y: 612, r: 12 }, { t: "c", x: 104, y: 612, r: 12 });
  // Bukit Safa & Marwah
  // batu 3D Safa & Marwah dibina oleh dewan Mas'a (lebih rendah supaya kamera tidak terhalang)
  sc.props.push(rockCluster(535, 562, 110, 11, undefined, false));
  sc.props.push(rockCluster(535, -562, 110, 23, undefined, false));
  sc.solids.push({ t: "e", x: 535, y: 580, rx: 62, ry: 18 }, { t: "e", x: 535, y: -580, rx: 62, ry: 18 });
  // Kedai gunting
  sc.solids.push({ t: "r", x: 650, y: -590, w: 160, h: 90 });
  m3({ k: "bld", x: 650, y: -590, w: 160, d: 90, h: 50, col: "#e3d0ae", style: "plain", sign: "KEDAI GUNTING" });
  m3({ k: "pole", x: 700, y: -496 });
  sc.props.push({
    y: -500,
    draw: (c) => {
      shadowBox(c, 650, -590, 160, 90, 12);
      box(c, 650, -590, 160, 90, 50, "#e3d0ae");
      c.fillStyle = "#16634c";
      c.fillRect(658, -546, 144, 14);
      c.fillStyle = "#fff";
      c.font = "800 8px Nunito, sans-serif";
      c.textAlign = "center";
      c.fillText("KEDAI GUNTING", 730, -536);
      c.fillStyle = "#5b4a32";
      c.fillRect(716, -528, 28, 28);
      for (let k = 0; k < 4; k++) {
        c.fillStyle = k % 2 ? "#c4452f" : "#ffffff";
        c.fillRect(700, -528 + k * 7, 5, 7);
      }
    },
  });
  // Hotel
  sc.solids.push({ t: "r", x: -700, y: 700, w: 260, h: 160 });
  m3({ k: "bld", x: -700, y: 700, w: 260, d: 160, h: 140, col: "#d8c6a4", style: "win", sign: "HOTEL JEMAAH" });
  sc.props.push({
    y: 860,
    draw: (c) => {
      shadowBox(c, -700, 700, 260, 160, 26);
      box(c, -700, 700, 260, 160, 130, "#d8c6a4");
      windowGrid(c, -696, 736, 252, 92, 8, 4, "#6f8190");
      c.fillStyle = "#4f3f2a";
      rrect(c, -588, 832, 36, 28, 4);
      c.fill();
      c.fillStyle = "#16634c";
      c.fillRect(-640, 820, 140, 10);
      c.fillStyle = "#fff";
      c.font = "800 7px Nunito, sans-serif";
      c.textAlign = "center";
      c.fillText("HOTEL JEMAAH", -570, 828);
    },
  });
  // Bas & papan
  sc.props.push(busProp(300, 915, 150, 46));
  sc.solids.push({ t: "r", x: 300, y: 915, w: 150, h: 46 });
  sc.props.push(boardProp(POS.makkah.board.x - 70, POS.makkah.board.y - 6, "MASJIDIL HARAM"));
  sc.solids.push({ t: "r", x: -97, y: 658, w: 54, h: 8 });

  // ----- jemaah -----
  for (let i = 0; i < 92; i++) {
    const p = mkPerson(undefined, true);
    const n = mkNPC("tawaf", p);
    n.rad = rr(140, 318);
    n.a = rr(0, TAU);
    n.w = rr(26, 46) / n.rad;
    sc.npcs.push(n);
  }
  for (let i = 0; i < 26; i++) addLane(sc, "y", rr(482, 590), -540, 540, true);
  for (let i = 0; i < 16; i++) {
    const p = mkPerson(undefined, true);
    const a = rr(0, TAU);
    p.x = Math.cos(a) * rr(345, 445);
    p.y = -Math.sin(a) * rr(345, 445);
    const n = mkNPC("wander", p);
    n.pickT = () => {
      const b = rr(0, TAU);
      const r = rr(345, 445);
      return { x: Math.cos(b) * r, y: -Math.sin(b) * r };
    };
    sc.npcs.push(n);
  }
  for (let i = 0; i < 12; i++) {
    const a = rr(0, TAU);
    const r = rr(352, 405);
    addStatic(sc, Math.cos(a) * r, -Math.sin(a) * r, rnd() < 0.6 ? "sit" : "pray");
  }
  addWanderers(sc, 16, -660, 640, 800, 1000, false);
  addWanderers(sc, 6, 620, -640, 820, 580, false);

  sc.labels.push(
    { x: 0, y: -134, text: "Rukun Iraqi", kind: "small", y3: -62, h3: 10 },
    { x: -104, y: -12, text: "Rukun Syami", kind: "small", x3: -62, y3: 0, h3: 10 },
    { x: 0, y: 78, text: "Rukun Yamani", kind: "small", y3: 62, h3: 10 },
    { x: KS + 34, y: -28, text: "Hajarul Aswad", kind: "small", x3: KS + 6, y3: 0, h3: 2.4 },
    { x: -82, y: -90, text: "Hijir Ismail", kind: "small", x3: -58, y3: -58, h3: 2 },
    { x: 68, y: -106, text: "Maqam Ibrahim", kind: "small", y3: -68, h3: 3.2 },
    { x: 238, y: 20, text: "MULA: HAJARUL ASWAD", kind: "green", y3: 0, h3: 0.6 },
    { x: 0, y: 300, text: "MATAF", kind: "small", h3: 0.4 },
    { x: 535, y: -20, text: "MAS'A", kind: "place", h3: 5 },
    { x: 535, y: 520, text: "BUKIT SAFA", kind: "place", y3: 560, h3: 4.5 },
    { x: 535, y: -504, text: "BUKIT MARWAH", kind: "place", y3: -560, h3: 4.5 },
    { x: 535, y: 166, text: "Kawasan lampu hijau", kind: "green", h3: 5.4 },
    { x: 0, y: 636, text: "PINTU KING ABDUL AZIZ", kind: "place", y3: 600, h3: 7 },
    { x: -570, y: 556, text: "HOTEL JEMAAH", kind: "place", y3: 780, h3: 15.5 },
    { x: 730, y: -652, text: "KEDAI GUNTING", kind: "place", y3: -545, h3: 6.5 },
    { x: 375, y: 862, text: "STESEN BAS", kind: "place", y3: 938, h3: 5.5 },
    { x: POS.makkah.zam1.x, y: POS.makkah.zam1.y - 36, text: "Air Zamzam", kind: "small", y3: POS.makkah.zam1.y, h3: 2.8 },
    { x: POS.makkah.zam2.x, y: POS.makkah.zam2.y - 36, text: "Air Zamzam", kind: "small", y3: POS.makkah.zam2.y, h3: 2.8 }
  );

  sc.ground = (c) => {
    c.fillStyle = "#e4d3b0";
    c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
    c.fillStyle = "#efe6d3";
    c.fillRect(-720, 606, 1560, 440);
    gridLines(c, -720, 606, 840, 1046, 64, "rgba(150,125,85,.18)");
    c.fillStyle = "#eadfca";
    c.fillRect(606, -660, 234, 1266);
    gridLines(c, 606, -660, 840, 606, 64, "rgba(150,125,85,.14)");
    c.fillStyle = "#f2eee5";
    c.fillRect(-520, -600, 990, 1200);
    gridLines(c, -520, -600, 470, 600, 46, "rgba(165,150,120,.16)");
    c.fillStyle = "#e9ddc6";
    circ(c, 0, 0, 452);
    c.fill();
    c.strokeStyle = "rgba(150,125,80,.35)";
    c.lineWidth = 2;
    c.stroke();
    // mataf
    c.fillStyle = "#fefefb";
    circ(c, 0, 0, MATAF_R);
    c.fill();
    c.strokeStyle = "rgba(150,165,180,.2)";
    c.lineWidth = 1.2;
    for (let r = 92; r < MATAF_R; r += 24) {
      circ(c, 0, 0, r);
      c.stroke();
    }
    c.strokeStyle = "rgba(196,160,82,.6)";
    c.lineWidth = 3;
    circ(c, 0, 0, MATAF_R);
    c.stroke();
    // anak panah arah tawaf (berlawanan arah jam)
    c.fillStyle = "rgba(64,124,196,.45)";
    for (const [R, off] of [
      [176, 0],
      [262, 0.2],
    ]) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU + off;
        const x = Math.cos(a) * R;
        const y = -Math.sin(a) * R;
        const tx = -Math.sin(a);
        const ty = -Math.cos(a);
        const nx = Math.cos(a);
        const ny = -Math.sin(a);
        poly(c, [x + tx * 10, y + ty * 10, x - tx * 5 + nx * 6, y - ty * 5 + ny * 6, x - tx * 5 - nx * 6, y - ty * 5 - ny * 6]);
        c.fill();
      }
    }
    // garisan Hajarul Aswad
    c.strokeStyle = "#6f5a35";
    c.lineWidth = 5;
    line(c, KS + 8, 0, MATAF_R - 2, 0);
    c.strokeStyle = "rgba(255,255,255,.55)";
    c.lineWidth = 1;
    line(c, KS + 8, 0, MATAF_R - 2, 0);
    const g = c.createRadialGradient(MATAF_R + 14, 0, 0, MATAF_R + 14, 0, 22);
    g.addColorStop(0, "rgba(70,230,130,.9)");
    g.addColorStop(1, "rgba(70,230,130,0)");
    c.fillStyle = g;
    circ(c, MATAF_R + 14, 0, 22);
    c.fill();
    // Hijir Ismail (dinding rendah)
    c.fillStyle = "rgba(235,232,222,.9)";
    c.beginPath();
    c.arc(HIJR.x, HIJR.y, HIJR.r, (135 * Math.PI) / 180, (315 * Math.PI) / 180);
    c.closePath();
    c.fill();
    c.strokeStyle = "#cfc6b0";
    c.lineWidth = 7;
    c.beginPath();
    c.arc(HIJR.x, HIJR.y, HIJR.r, (165 * Math.PI) / 180, (285 * Math.PI) / 180);
    c.stroke();
    c.strokeStyle = "#f3efe4";
    c.lineWidth = 4;
    c.beginPath();
    c.arc(HIJR.x, HIJR.y - 3, HIJR.r, (165 * Math.PI) / 180, (285 * Math.PI) / 180);
    c.stroke();
    // Mas'a
    c.fillStyle = "#f7f5f0";
    c.fillRect(MASA.x0, -600, MASA.x1 - MASA.x0, 1200);
    gridLines(c, MASA.x0, -600, MASA.x1, 600, 32, "rgba(170,160,140,.15)");
    c.strokeStyle = "rgba(150,140,120,.35)";
    c.lineWidth = 2;
    c.setLineDash([10, 8]);
    line(c, 535, -460, 535, 460);
    c.setLineDash([]);
    c.fillStyle = "rgba(60,200,120,.16)";
    c.fillRect(MASA.x0, MASA.g1, MASA.x1 - MASA.x0, MASA.g2 - MASA.g1);
    for (const gy of [MASA.g1, MASA.g2]) {
      c.fillStyle = "rgba(63,208,127,.35)";
      c.fillRect(MASA.x0, gy - 9, MASA.x1 - MASA.x0, 18);
      c.fillStyle = "#3fd07f";
      c.fillRect(MASA.x0, gy - 3, MASA.x1 - MASA.x0, 6);
    }
    c.fillStyle = "#ebe3d2";
    c.fillRect(MASA.x0, MASA.safaY, MASA.x1 - MASA.x0, 130);
    c.fillRect(MASA.x0, -600, MASA.x1 - MASA.x0, 130);
    c.strokeStyle = "rgba(190,160,90,.6)";
    c.lineWidth = 2;
    line(c, MASA.x0, MASA.safaY, MASA.x1, MASA.safaY);
    line(c, MASA.x0, MASA.marwahY, MASA.x1, MASA.marwahY);
    // dinding menegak
    vwall(c, -520, -600, 600);
    vwall(c, 470, -600, -380);
    vwall(c, 470, -300, -70);
    vwall(c, 470, 70, 300);
    vwall(c, 470, 380, 600);
    vwall(c, 600, -600, -470);
    vwall(c, 600, -410, 600);
  };
  sc.mini = (c) => {
    c.fillStyle = "#e4d3b0";
    c.fillRect(-720, -660, 1560, 1700);
    c.fillStyle = "#efe6d3";
    c.fillRect(-720, 606, 1560, 440);
    c.fillStyle = "#f2eee5";
    c.fillRect(-520, -600, 990, 1200);
    c.fillStyle = "#e3d5b9";
    circ(c, 0, 0, 452);
    c.fill();
    c.fillStyle = "#ffffff";
    circ(c, 0, 0, MATAF_R);
    c.fill();
    c.fillStyle = "#1b1b1d";
    poly(c, [KS * 1.4, 0, 0, KS * 1.4, -KS * 1.4, 0, 0, -KS * 1.4]);
    c.fill();
    c.fillStyle = "#cfe9d9";
    c.fillRect(MASA.x0, -600, MASA.x1 - MASA.x0, 1200);
    c.fillStyle = "#8c7a5c";
    c.fillRect(MASA.x0, 520, 130, 70);
    c.fillRect(MASA.x0, -590, 130, 70);
    c.fillStyle = "#c5b18c";
    c.fillRect(-700, 700, 260, 160);
    c.fillRect(650, -590, 160, 90);
    c.fillStyle = "#16634c";
    c.fillRect(300, 915, 150, 46);
  };

  // ----- interaksi -----
  sc.interacts.push(
    boardInteract("hboard", { x: POS.makkah.board.x - 70, y: POS.makkah.board.y }, "haram", () => {
      if (isStep("haram_board")) {
        showDoa("masjid");
        finishStep("haram_board");
      }
    }),
    {
      id: "line",
      x: 0,
      y: 0,
      r: 0,
      test: (p) => p.x > KS + 4 && p.x < MATAF_R && Math.abs(p.y) < 30,
      icon: "hand",
      label: () => (isStep("tawaf_start", "ifadah_start", "wada_start") ? "MULA\nTAWAF" : "ISYARAT\nHAJARUL ASWAD"),
      enabled: () => isStep("tawaf_start", "ifadah_start", "wada_start") || (tawafKind() !== null && T.tawaf.lapIst !== S.tawafLaps),
      locked: () => (tawafKind() ? null : "Garisan Hajarul Aswad — permulaan dan penamat setiap pusingan tawaf."),
      action: () => (isStep("tawaf_start", "ifadah_start", "wada_start") ? startTawaf() : actIstilam()),
    },
    {
      id: "maqam",
      ...POS.makkah.maqamPray,
      r: 32,
      icon: "pray",
      ring: true,
      label: () => "SOLAT SUNAT\nTAWAF",
      enabled: () => !!S.lastTawaf && !S.flags["solat_" + S.lastTawaf] && tawafKind() === null,
      locked: () => (tawafKind() ? "Selesaikan tawaf dahulu. Solat sunat tawaf dilakukan selepas tujuh pusingan." : null),
      action: actSolatTawaf,
    },
    {
      id: "zam1",
      ...POS.makkah.zam1,
      r: 40,
      icon: "water",
      label: () => "MINUM\nZAMZAM",
      enabled: () => T.zamCd <= 0,
      action: actZamzam,
    },
    {
      id: "zam2",
      ...POS.makkah.zam2,
      r: 40,
      icon: "water",
      label: () => "MINUM\nZAMZAM",
      enabled: () => T.zamCd <= 0,
      action: actZamzam,
    },
    {
      id: "safa",
      x: 535,
      y: 530,
      r: 0,
      test: (p) => inMasa(p) && p.y > MASA.safaY,
      icon: "hand",
      label: () => (isStep("saie_start", "saie_haji_start") ? "MULA\nSAIE" : "BERDOA"),
      enabled: () => isStep("saie_start", "saie_haji_start") || (saieKind() !== null && S.saieAt === "safa" && !T.saie.berdoaHere),
      locked: () => (saieKind() ? null : "Bukit Safa — saie bermula di sini selepas tawaf."),
      action: () => (isStep("saie_start", "saie_haji_start") ? startSaie() : actBerdoaBukit()),
    },
    {
      id: "marwah",
      x: 535,
      y: -530,
      r: 0,
      test: (p) => inMasa(p) && p.y < MASA.marwahY,
      icon: "hand",
      label: () => "BERDOA",
      enabled: () => saieKind() !== null && S.saieAt === "marwah" && !T.saie.berdoaHere,
      locked: () => (saieKind() ? null : "Bukit Marwah — perjalanan saie yang ketujuh berakhir di sini."),
      action: actBerdoaBukit,
    },
    {
      id: "barber",
      ...POS.makkah.barber,
      r: 52,
      icon: "cut",
      ring: true,
      label: () => "BERCUKUR /\nBERGUNTING",
      enabled: () => isStep("tahallul_umrah"),
      locked: () => "Kedai gunting. Tahallul umrah dilakukan selepas saie selesai.",
      action: () => openCukur("umrah"),
    },
    {
      id: "hotel",
      ...POS.makkah.hotel,
      r: 54,
      icon: "pray",
      ring: true,
      label: () => "NIAT HAJI",
      enabled: () => isStep("niat_haji"),
      locked: () => "Hotel penginapan jemaah. Kamu akan berihram haji di sini pada 8 Zulhijjah.",
      action: actNiatHaji,
    },
    busInteract(POS.makkah.bus)
  );
  return sc;
}

// =====================================================================
//  MINA — KHEMAH & KOMPLEKS JAMARAT
// =====================================================================
function jamrahWallProp(j: JamId): Drawable {
  const J = JAM[j];
  return {
    y: J.y + 6,
    draw: (c) => {
      box(c, J.x - 58, J.y - 6, 116, 12, 74, "#cfc6b2", "#e2dac8");
      c.fillStyle = "rgba(120,110,90,.35)";
      for (let k = -50; k <= 50; k += 20) c.fillRect(J.x + k, J.y - 74 + 2, 1, 70);
    },
  };
}
function drawJamrahBasin(c: Ctx, j: JamId, dots: number[]): void {
  const J = JAM[j];
  c.fillStyle = "rgba(60,50,30,.18)";
  ell(c, J.x + 8, J.y + 6, J.rx + 14, J.ry + 10);
  c.fill();
  c.fillStyle = "#bdb5a6";
  ell(c, J.x, J.y, J.rx + 8, J.ry + 7);
  c.fill();
  c.fillStyle = "#8f897c";
  ell(c, J.x, J.y, J.rx, J.ry);
  c.fill();
  c.fillStyle = "#b2ab9c";
  for (let i = 0; i < dots.length; i += 2) {
    circ(c, J.x + dots[i], J.y + dots[i + 1], 1.6);
    c.fill();
  }
  c.strokeStyle = "#e4ddcc";
  c.lineWidth = 2;
  ell(c, J.x, J.y, J.rx + 8, J.ry + 7);
  c.stroke();
}

function buildMina(): Scene {
  const sc = newScene("mina", { x0: -740, y0: -600, x1: 740, y1: 720 }, { x: -540, y: 560 }, POS.mina.bus, 0.45, "#dccaa6");
  sc.ambient = 0.7;
  const dots: Record<JamId, number[]> = { ula: [], wusta: [], aqabah: [] };
  for (const j of Object.keys(JAM) as JamId[]) {
    const J = JAM[j];
    for (let i = 0; i < 70; i++) {
      const a = rr(0, TAU);
      const r = Math.sqrt(rnd()) * 0.92;
      dots[j].push(Math.cos(a) * J.rx * r, Math.sin(a) * J.ry * r);
    }
    sc.solids.push({ t: "e", x: J.x, y: J.y, rx: J.rx + 8, ry: J.ry + 7 });
    sc.props.push(jamrahWallProp(j));
    m3({ k: "jamrah", x: J.x, y: J.y, rx: J.rx, ry: J.ry });
    sc.labels.push({ x: J.x, y: J.y - 96, text: J.name.toUpperCase(), kind: "place", y3: J.y, h3: 9.5 });
  }
  // tiang jambatan Jamarat
  for (let x = -680; x <= 680; x += 150) {
    if ((Object.keys(JAM) as JamId[]).some((j) => Math.abs(JAM[j].x - x) < 120)) continue;
    sc.solids.push({ t: "r", x: x - 9, y: -300, w: 18, h: 14 });
    m3({ k: "pillar", x, y: -293, h: 50, r: 8, col: "#c7c0b3" });
    sc.props.push({ y: -286, draw: (c) => box(c, x - 9, -300, 18, 14, 50, "#c7c0b3") });
  }
  tentGrid(sc, -300, -170, 8, 7, 112, 100, 84, 64, [4, 3]);
  // kaunter dam & khemah gunting
  sc.solids.push({ t: "r", x: -690, y: 10, w: 130, h: 60 });
  m3({ k: "bld", x: -690, y: 10, w: 130, d: 60, h: 44, col: "#f1eee6", style: "plain", sign: "KAUNTER DAM" });
  m3({ k: "pole", x: -560, y: 244 });
  sc.props.push({
    y: 70,
    draw: (c) => {
      shadowBox(c, -690, 10, 130, 60, 10);
      box(c, -690, 10, 130, 60, 44, "#f1eee6");
      c.fillStyle = "#16634c";
      c.fillRect(-680, 34, 110, 14);
      c.fillStyle = "#fff";
      c.font = "800 8px Nunito, sans-serif";
      c.textAlign = "center";
      c.fillText("KAUNTER DAM", -625, 44);
    },
  });
  sc.solids.push({ t: "r", x: -690, y: 180, w: 130, h: 64 });
  sc.props.push(tentProp(-690, 180, 130, 64, "#eef6f1"));
  sc.props.push({
    y: 245,
    draw: (c) => {
      for (let k = 0; k < 4; k++) {
        c.fillStyle = k % 2 ? "#c4452f" : "#ffffff";
        c.fillRect(-560, 210 + k * 7, 5, 7);
      }
    },
  });
  sc.props.push(boardProp(POS.mina.board.x, POS.mina.board.y - 14, "PANDUAN MELONTAR"));
  sc.props.push(busProp(-700, 620, 150, 46));
  sc.solids.push({ t: "r", x: -700, y: 620, w: 150, h: 46 });
  for (let x = -660; x <= 660; x += 220) {
    sc.props.push(lampProp(x, -196));
  }
  m3({ k: "mountains", x0: -740, y0: -600, x1: 740, y1: 720, col: "#9b7b58", seed: 7 });

  // jemaah
  for (let i = 0; i < 8; i++) {
    const rx = -300 + i * 112 + 98;
    for (let k = 0; k < 3; k++) addLane(sc, "y", rx + rr(-6, 6), -250, 560, true);
  }
  for (let k = 0; k < 22; k++) addLane(sc, "x", rr(-266, -214), -700, 700, true);
  addWanderers(sc, 26, -700, -560, 700, -320, true);
  for (const j of Object.keys(JAM) as JamId[]) {
    const J = JAM[j];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + rr(-0.2, 0.2);
      const p = mkPerson(undefined, true);
      p.x = J.x + Math.cos(a) * (J.rx + 30);
      p.y = J.y + Math.sin(a) * (J.ry + 26);
      p.dx = -Math.cos(a);
      p.dy = -Math.sin(a);
      const n = mkNPC("thrower", p);
      n.jx = J.x;
      n.jy = J.y;
      n.lo = J.rx;
      n.hi = J.ry;
      sc.npcs.push(n);
    }
  }
  for (let i = 0; i < 18; i++) addStatic(sc, -300 + Math.floor(rnd() * 8) * 112 + rr(10, 74), -170 + Math.floor(rnd() * 7) * 100 + 72, "sit");

  sc.labels.push(
    { x: 0, y: -575, text: "KOMPLEKS JAMARAT", kind: "place", h3: 3 },
    { x: 232, y: 96, text: "Khemah Maktab 87", kind: "green", x3: 190, y3: 162, h3: 6.8 },
    { x: -625, y: -54, text: "KAUNTER DAM", kind: "place", y3: 40, h3: 6 },
    { x: -625, y: 124, text: "KHEMAH GUNTING", kind: "place", y3: 212, h3: 6.6 },
    { x: POS.mina.patch.x, y: POS.mina.patch.y - 64, text: "Kawasan batu", kind: "small", y3: POS.mina.patch.y, h3: 1 },
    { x: -625, y: 566, text: "STESEN BAS", kind: "place", y3: 643, h3: 6 },
    { x: 180, y: -238, text: "← ke arah Makkah", kind: "small", h3: 0.6 }
  );

  sc.ground = (c) => {
    c.fillStyle = "#dccaa6";
    c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
    c.fillStyle = "#d3cec4";
    c.fillRect(-740, -600, 1480, 310);
    gridLines(c, -740, -600, 740, -290, 50, "rgba(120,110,95,.16)");
    c.fillStyle = "#a9a296";
    c.fillRect(-740, -290, 1480, 90);
    c.strokeStyle = "rgba(255,255,255,.55)";
    c.lineWidth = 2;
    c.setLineDash([16, 14]);
    line(c, -740, -245, 740, -245);
    c.setLineDash([]);
    c.fillStyle = "#d4c3a0";
    c.fillRect(-740, -200, 400, 920);
    c.fillStyle = "#e6dac0";
    c.fillRect(-330, -200, 1010, 760);
    c.fillStyle = "#bdb5a4";
    ell(c, POS.mina.patch.x, POS.mina.patch.y, 92, 52);
    c.fill();
    c.fillStyle = "#a9a190";
    for (let i = 0; i < 40; i++) {
      const a = i * 2.39;
      const r = (i % 7) * 11;
      circ(c, POS.mina.patch.x + Math.cos(a) * r * 1.6, POS.mina.patch.y + Math.sin(a) * r * 0.8, 1.6);
      c.fill();
    }
    for (const j of Object.keys(JAM) as JamId[]) drawJamrahBasin(c, j, dots[j]);
  };
  sc.mini = (c) => {
    c.fillStyle = "#dccaa6";
    c.fillRect(-740, -600, 1480, 1320);
    c.fillStyle = "#c9c3b7";
    c.fillRect(-740, -600, 1480, 310);
    c.fillStyle = "#9f988b";
    c.fillRect(-740, -290, 1480, 90);
    c.fillStyle = "#ffffff";
    for (let i = 0; i < 8; i++) for (let j = 0; j < 7; j++) c.fillRect(-300 + i * 112, -170 + j * 100, 84, 64);
    c.fillStyle = "#d9a83c";
    c.fillRect(-300 + 4 * 112, -170 + 3 * 100, 84, 64);
    c.fillStyle = "#6d675c";
    for (const j of Object.keys(JAM) as JamId[]) {
      ell(c, JAM[j].x, JAM[j].y, JAM[j].rx, JAM[j].ry);
      c.fill();
    }
    c.fillStyle = "#16634c";
    c.fillRect(-700, 620, 150, 46);
    c.fillRect(-690, 10, 130, 60);
    c.fillRect(-690, 180, 130, 64);
  };

  sc.interacts.push(
    {
      id: "tent",
      ...POS.mina.tent,
      r: 44,
      icon: "pray",
      ring: true,
      label: () => "BERMALAM",
      enabled: () => isStep("mina_tarwiyah", "nafar"),
      locked: () => "Khemah Maktab 87 — tempat kamu berehat dan bermalam di Mina.",
      action: () => (isStep("nafar") ? openNafar() : actTarwiyah()),
    },
    {
      id: "dam",
      ...POS.mina.dam,
      r: 52,
      icon: "hand",
      ring: true,
      label: () => "SELESAIKAN\nDAM",
      enabled: () => isStep("dam"),
      locked: () => "Kaunter dam — urusan dam haji Tamattu' dibuat pada Hari Nahar.",
      action: actDam,
    },
    {
      id: "barberM",
      ...POS.mina.barber,
      r: 52,
      icon: "cut",
      ring: true,
      label: () => "BERCUKUR /\nBERGUNTING",
      enabled: () => isStep("cukur_nahar"),
      locked: () => "Khemah gunting — bercukur selepas melontar Jamrah Aqabah dan menyelesaikan dam.",
      action: () => openCukur("haji"),
    },
    boardInteract("jboard", POS.mina.board, "jamarat"),
    ...(Object.keys(JAM) as JamId[]).map(
      (j): Interact => ({
        id: "jam_" + j,
        x: JAM[j].x,
        y: JAM[j].y,
        r: 0,
        test: () => inThrowRange(j),
        icon: "stone",
        label: () => "LONTAR\n" + JAM[j].name.replace("Jamrah ", "").toUpperCase(),
        enabled: () => expectedJamrah() !== null,
        locked: () =>
          `${JAM[j].name} — ${j === "aqabah" ? "dilontar pada 10 Zulhijjah dan hari Tasyrik" : "dilontar pada hari Tasyrik (11–13 Zulhijjah)"}.`,
        action: () => throwAt(j),
      })
    ),
    busInteract(POS.mina.bus)
  );
  return sc;
}

// =====================================================================
//  ARAFAH
// =====================================================================
function insideArafah(p: Vec): boolean {
  return p.x > ARAFAH_X + 6;
}

function buildArafah(): Scene {
  const sc = newScene("arafah", { x0: -740, y0: -580, x1: 740, y1: 580 }, { x: -540, y: 386 }, POS.arafah.bus, 0.8, "#e4d2a6");
  sc.ambient = 0.45;
  // Masjid Namirah (sebahagian hadapan di luar Arafah)
  sc.solids.push({ t: "r", x: -520, y: -480, w: 270, h: 150 });
  m3({ k: "bld", x: -520, y: -480, w: 270, d: 150, h: 58, col: "#eee8db", style: "arch", sign: "MASJID NAMIRAH", domes: [{ x: -385, y: -405, r: 34 }] });
  sc.props.push({
    y: -330,
    draw: (c) => {
      shadowBox(c, -520, -480, 270, 150, 20);
      box(c, -520, -480, 270, 150, 58, "#eee8db", "#f6f2e8");
      archRow(c, -514, -384, 258, 50, 7, "#b8a782");
      dome(c, -385, -440, 34, "#e7dfcc");
    },
  });
  sc.props.push(minaretProp(-520, -480, 140), minaretProp(-250, -480, 140));
  // Jabal Rahmah
  sc.solids.push({ t: "e", x: 430, y: -330, rx: 140, ry: 88 });
  m3({ k: "hill", x: 430, y: -330, rx: 150, ry: 96, h: 120 });
  sc.props.push({
    y: -250,
    draw: (c) => {
      const x = 430;
      const y = -330;
      c.fillStyle = "rgba(60,40,10,.15)";
      ell(c, x + 20, y + 14, 160, 96);
      c.fill();
      c.fillStyle = "#9a8163";
      ell(c, x, y, 150, 96);
      c.fill();
      c.fillStyle = "#ad9372";
      ell(c, x - 6, y - 22, 112, 70);
      c.fill();
      c.fillStyle = "#c0a682";
      ell(c, x - 10, y - 44, 72, 44);
      c.fill();
      c.fillStyle = "#cfb894";
      ell(c, x - 12, y - 60, 34, 20);
      c.fill();
      c.fillStyle = "#f7f3ea";
      c.fillRect(x - 17, y - 112, 10, 52);
      c.fillStyle = "#dcd5c4";
      c.fillRect(x - 11, y - 112, 4, 52);
      c.strokeStyle = "rgba(80,60,30,.35)";
      c.lineWidth = 1.5;
      c.beginPath();
      for (let k = 0; k < 6; k++) c.lineTo(x - 140 + k * 22, y + 40 - k * 16);
      c.stroke();
    },
  });
  // Khemah besar Maktab 87
  sc.solids.push({ t: "r", x: 40, y: -172, w: 220, h: 100 });
  sc.props.push(tentProp(40, -172, 220, 100, "#fffdf2", true));
  tentGrid(sc, -250, 40, 6, 4, 125, 110, 92, 70, null);
  // pokok
  const trees: Vec[] = [];
  let guard = 0;
  while (trees.length < 34 && guard++ < 800) {
    const x = rr(-340, 700);
    const y = rr(-540, 540);
    if (x > -270 && x < 500 && y > 20 && y < 470) continue;
    if (x > 20 && x < 280 && y > -200 && y < -50) continue;
    if (Math.hypot((x - 430) / 175, (y + 330) / 120) < 1) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 60)) continue;
    trees.push({ x, y });
  }
  for (const t of trees) {
    sc.props.push(treeProp(t.x, t.y, rr(0.85, 1.15)));
    sc.solids.push({ t: "c", x: t.x, y: t.y, r: 5 });
  }
  // papan sempadan
  for (let y = -420; y <= 520; y += 130) {
    m3({ k: "sign", x: ARAFAH_X, y, text: "SEMPADAN ARAFAH" });
    sc.props.push({
      y,
      draw: (c) => {
        c.fillStyle = "#6a5034";
        c.fillRect(ARAFAH_X - 2, y - 46, 4, 46);
        c.fillStyle = "#f2c230";
        rrect(c, ARAFAH_X - 24, y - 70, 48, 26, 3);
        c.fill();
        c.strokeStyle = "#7a5b0c";
        c.lineWidth = 1.5;
        c.stroke();
        c.fillStyle = "#4a3505";
        c.font = "800 6.5px Nunito, sans-serif";
        c.textAlign = "center";
        c.fillText("SEMPADAN", ARAFAH_X, y - 59);
        c.fillText("ARAFAH →", ARAFAH_X, y - 50);
      },
    });
  }
  sc.props.push(boardProp(POS.arafah.board.x, POS.arafah.board.y - 14, "SEMPADAN ARAFAH", "#7a5b0c"));
  sc.props.push(busProp(-720, 440, 150, 46));
  sc.solids.push({ t: "r", x: -720, y: 440, w: 150, h: 46 });

  for (let i = 0; i < 34; i++) {
    const x = -250 + Math.floor(rnd() * 6) * 125 + rr(0, 92);
    const y = 40 + Math.floor(rnd() * 4) * 110 + rr(76, 96);
    addStatic(sc, x, y, rnd() < 0.55 ? "pray" : "sit");
  }
  for (let i = 0; i < 12; i++) addStatic(sc, rr(40, 260), rr(-60, -30), "pray");
  addWanderers(sc, 20, -330, -520, 700, 540, true);
  addWanderers(sc, 6, -720, -300, -400, 540, true);
  m3({ k: "mountains", x0: -740, y0: -580, x1: 740, y1: 580, col: "#a5865f", seed: 11 });

  sc.labels.push(
    { x: 430, y: -470, text: "JABAL RAHMAH", kind: "place", y3: -330, h3: 18 },
    { x: -385, y: -548, text: "MASJID NAMIRAH", kind: "place", y3: -405, h3: 12 },
    { x: -560, y: -140, text: "Wadi Uranah · luar Arafah", kind: "warn", h3: 1.5 },
    { x: 150, y: -238, text: "Khemah Maktab 87", kind: "green", y3: -122, h3: 8 },
    { x: 200, y: 520, text: "BUMI ARAFAH", kind: "place", h3: 2 },
    { x: -645, y: 410, text: "STESEN BAS", kind: "place", y3: 463, h3: 6 }
  );

  sc.ground = (c) => {
    c.fillStyle = "#e4d2a6";
    c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
    c.fillStyle = "#cdb98f";
    c.fillRect(-760, -600, ARAFAH_X + 760, 1200);
    c.fillStyle = "rgba(120,150,70,.10)";
    c.fillRect(ARAFAH_X, -600, 1200, 1200);
    c.fillStyle = "#ece0c2";
    c.fillRect(-270, 20, 770, 470);
    c.strokeStyle = "#e0861f";
    c.lineWidth = 4;
    c.setLineDash([18, 10]);
    line(c, ARAFAH_X, -600, ARAFAH_X, 600);
    c.setLineDash([]);
    c.fillStyle = "rgba(224,134,31,.12)";
    c.fillRect(ARAFAH_X - 14, -600, 14, 1200);
  };
  sc.mini = (c) => {
    c.fillStyle = "#e4d2a6";
    c.fillRect(-740, -580, 1480, 1160);
    c.fillStyle = "#c5b083";
    c.fillRect(-740, -580, ARAFAH_X + 740, 1160);
    c.fillStyle = "#e0861f";
    c.fillRect(ARAFAH_X - 4, -580, 8, 1160);
    c.fillStyle = "#9a8163";
    ell(c, 430, -330, 150, 96);
    c.fill();
    c.fillStyle = "#ffffff";
    c.fillRect(-250, 40, 717, 400);
    c.fillStyle = "#d9a83c";
    c.fillRect(40, -172, 220, 100);
    c.fillStyle = "#cfc7b4";
    c.fillRect(-520, -480, 270, 150);
    c.fillStyle = "#16634c";
    c.fillRect(-720, 440, 150, 46);
  };

  sc.interacts.push(
    boardInteract("aboard", POS.arafah.board, "sempadan"),
    {
      id: "khemah",
      ...POS.arafah.khemah,
      r: 60,
      icon: "pray",
      ring: true,
      label: () => "KHUTBAH &\nSOLAT JAMAK",
      enabled: () => isStep("arafah_khutbah"),
      locked: () => "Khemah Maktab 87 di bumi Arafah.",
      action: actKhutbah,
    },
    {
      id: "doa",
      x: 0,
      y: 0,
      r: 0,
      test: () => isStep("wukuf"),
      icon: "pray",
      label: () => (T.wukuf.praying ? "BERHENTI" : "BERDOA"),
      enabled: () => isStep("wukuf"),
      action: toggleWukuf,
    },
    busInteract(POS.arafah.bus)
  );
  return sc;
}

// =====================================================================
//  MUZDALIFAH (malam)
// =====================================================================
function buildMuzdalifah(): Scene {
  const sc = newScene("muzdalifah", { x0: -720, y0: -540, x1: 720, y1: 540 }, { x: -540, y: 384 }, POS.muzdalifah.bus, 0.8, "#b9a98a");
  sc.ambient = 0.3;
  sc.solids.push({ t: "r", x: -150, y: -520, w: 300, h: 110 });
  m3({ k: "bld", x: -150, y: -520, w: 300, d: 110, h: 56, col: "#e8e2d4", style: "arch", sign: "MASY'ARIL HARAM", domes: [{ x: 0, y: -465, r: 30 }] });
  m3({ k: "stars" });
  m3({ k: "mountains", x0: -720, y0: -540, x1: 720, y1: 540, col: "#6e5a44", seed: 19 });
  sc.props.push({
    y: -410,
    draw: (c) => {
      shadowBox(c, -150, -520, 300, 110, 18);
      box(c, -150, -520, 300, 110, 56, "#e8e2d4", "#f3efe5");
      archRow(c, -144, -462, 288, 46, 7, "#a89770");
      dome(c, 0, -486, 30, "#e2dac8");
    },
  });
  sc.props.push(minaretProp(-150, -520, 130), minaretProp(150, -520, 130));
  sc.props.push(boardProp(POS.muzdalifah.masyar.x - 70, POS.muzdalifah.masyar.y - 10, "MASY'ARIL HARAM"));
  sc.props.push(busProp(-720, 440, 150, 46));
  sc.solids.push({ t: "r", x: -720, y: 440, w: 150, h: 46 });
  for (let x = -600; x <= 600; x += 240)
    for (let y = -300, row = 0; y <= 460; y += 250, row++) {
      const lx = x + (row % 2) * 90;
      sc.props.push(lampProp(lx, y));
      sc.solids.push({ t: "c", x: lx, y, r: 4 });
      sc.lights.push({ x: lx, y: y - 60 });
    }
  // tikar & jemaah tidur
  const mats: { x: number; y: number; w: number; h: number; c: string }[] = [];
  let guard = 0;
  while (mats.length < 38 && guard++ < 900) {
    const m = { x: rr(-520, 520), y: rr(-240, 420), w: rr(46, 70), h: rr(26, 36), c: pick(["#7a4b3a", "#3d5f7a", "#6b6a3a", "#7a3d5a", "#3f6b55"]) };
    if (Math.hypot(m.x - POS.muzdalifah.mat.x, m.y - POS.muzdalifah.mat.y) < 90) continue;
    if (mats.some((o) => Math.abs(o.x - m.x) < 80 && Math.abs(o.y - m.y) < 50)) continue;
    mats.push(m);
  }
  for (const m of mats) {
    const n = rnd() < 0.5 ? 2 : 1;
    for (let k = 0; k < n; k++) addStatic(sc, m.x + 10 + k * 24, m.y + 22 + k * 4, rnd() < 0.7 ? "sleep" : "sit");
  }
  const myMat = POS.muzdalifah.mat;
  for (let i = 0; i < 120; i++) {
    const x = rr(-680, 680);
    const y = rr(-360, 500);
    if (mats.some((m) => x > m.x - 6 && x < m.x + m.w + 6 && y > m.y - 6 && y < m.y + m.h + 6)) continue;
    sc.pebbles.push({ x, y, alive: true, s: rr(1.8, 2.8) });
  }
  addWanderers(sc, 18, -680, -360, 680, 500, true);
  sc.labels.push(
    { x: 0, y: -600, text: "MASY'ARIL HARAM", kind: "place", y3: -465, h3: 11 },
    { x: myMat.x + 30, y: myMat.y - 18, text: "Tikar kamu", kind: "green", x3: myMat.x, y3: myMat.y - 12, h3: 1.4 },
    { x: -645, y: 418, text: "STESEN BAS", kind: "place", y3: 463, h3: 6 }
  );
  sc.ground = (c) => {
    c.fillStyle = "#b9a98a";
    c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
    c.fillStyle = "rgba(120,105,80,.35)";
    for (let i = 0; i < 260; i++) {
      const x = ((i * 977) % 1440) - 720;
      const y = ((i * 613) % 1080) - 540;
      if (!inView(x, y, 20)) continue;
      ell(c, x, y, 3 + (i % 3), 1.6);
      c.fill();
    }
    for (const m of mats) {
      c.fillStyle = m.c;
      c.fillRect(m.x, m.y, m.w, m.h);
      c.strokeStyle = "rgba(255,240,200,.35)";
      c.lineWidth = 1.5;
      c.strokeRect(m.x + 3, m.y + 3, m.w - 6, m.h - 6);
    }
    c.fillStyle = "#2f6b55";
    c.fillRect(myMat.x - 30, myMat.y - 30, 60, 34);
    c.strokeStyle = "#f3d488";
    c.lineWidth = 2.5;
    c.strokeRect(myMat.x - 30, myMat.y - 30, 60, 34);
  };
  sc.mini = (c) => {
    c.fillStyle = "#a99978";
    c.fillRect(-720, -540, 1440, 1080);
    c.fillStyle = "#6f604a";
    for (const m of mats) c.fillRect(m.x, m.y, m.w, m.h);
    c.fillStyle = "#ddd5c4";
    c.fillRect(-150, -520, 300, 110);
    c.fillStyle = "#d9a83c";
    c.fillRect(myMat.x - 30, myMat.y - 30, 60, 34);
    c.fillStyle = "#16634c";
    c.fillRect(-720, 440, 150, 46);
  };
  sc.interacts.push(
    boardInteract("mboard", { x: POS.muzdalifah.masyar.x - 70, y: POS.muzdalifah.masyar.y }, "masyar", () => {
      if (!S.flags.masyar) {
        S.flags.masyar = true;
        addStars(3, "Zikir di Masy'aril Haram (sunat)");
      }
    }),
    {
      id: "mat",
      ...myMat,
      r: 44,
      icon: "pray",
      ring: true,
      label: () => "BERMALAM",
      enabled: () => isStep("mabit_muz"),
      locked: () => (isStep("kutip_batu") ? "Kutip sekurang-kurangnya 7 biji batu dahulu, kemudian bermalam di sini." : "Tikar kamu."),
      action: actMabitMuzdalifah,
    },
    busInteract(POS.muzdalifah.bus)
  );
  return sc;
}

const BUILDERS: Record<SceneId, () => Scene> = {
  miqat: buildMiqat,
  makkah: buildMakkah,
  mina: buildMina,
  arafah: buildArafah,
  muzdalifah: buildMuzdalifah,
};
