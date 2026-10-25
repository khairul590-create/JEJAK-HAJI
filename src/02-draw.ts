// =====================================================================
//  Fail 02: LUKISAN — primitif kanvas, watak jemaah, prop umum
//  Unjuran "3/4 atas": paksi y ke selatan, objek tinggi dilukis ke atas.
// =====================================================================

type Ctx = CanvasRenderingContext2D;

interface Drawable {
  y: number; // kunci susunan (kaki objek)
  draw: (c: Ctx) => void;
}

// ---------------------------------------------------------------------
//  PENERANGAN 3D: setiap prop 2D turut merekod "deskriptor" yang
//  digunakan oleh enjin 3D (fail 07) untuk membina model yang sama.
// ---------------------------------------------------------------------
type M3 =
  | { k: "bld"; x: number; y: number; w: number; d: number; h: number; col: string; style?: "arch" | "win" | "plain"; sign?: string; domes?: { x: number; y: number; r: number }[] }
  | { k: "palm"; x: number; y: number; h: number }
  | { k: "tree"; x: number; y: number; s: number }
  | { k: "board"; x: number; y: number; title: string; col: string }
  | { k: "lamp"; x: number; y: number }
  | { k: "minaret"; x: number; y: number; h: number; col: string }
  | { k: "bus"; x: number; y: number; w: number; d: number }
  | { k: "tent"; x: number; y: number; w: number; d: number; col: string; hl: boolean }
  | { k: "rocks"; x: number; y: number; w: number; seed: number; col: string }
  | { k: "wall"; x1: number; y1: number; x2: number; y2: number; h: number }
  | { k: "pillar"; x: number; y: number; h: number; r: number; col: string }
  | { k: "cooler"; x: number; y: number }
  | { k: "kaabah" }
  | { k: "maqam"; x: number; y: number }
  | { k: "arcade"; r0: number; r1: number; h: number }
  | { k: "gate"; x0: number; x1: number; y: number }
  | { k: "green"; x0: number; x1: number; y: number }
  | { k: "skyline" }
  | { k: "jamrah"; x: number; y: number; rx: number; ry: number }
  | { k: "hill"; x: number; y: number; rx: number; ry: number; h: number }
  | { k: "sign"; x: number; y: number; text: string }
  | { k: "pole"; x: number; y: number }
  | { k: "mountains"; x0: number; y0: number; x1: number; y1: number; col: string; seed: number }
  | { k: "stars" };
let M3_TARGET: M3[] | null = null;
function m3(d: M3): void {
  if (M3_TARGET) M3_TARGET.push(d);
}
// Apabila true, lantai dilukis rata (untuk tekstur lantai 3D) — dinding menegak tidak dilukis
let FLAT_GROUND = false;

// Kawasan dunia yang kelihatan (dikemas kini setiap bingkai)
const VIEW = { x0: 0, y0: 0, x1: 0, y1: 0 };
function inView(x: number, y: number, m = 90): boolean {
  return x > VIEW.x0 - m && x < VIEW.x1 + m && y > VIEW.y0 - m && y < VIEW.y1 + m * 2;
}

function ell(c: Ctx, x: number, y: number, rx: number, ry: number): void {
  c.beginPath();
  c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
}
function circ(c: Ctx, x: number, y: number, r: number): void {
  c.beginPath();
  c.arc(x, y, Math.max(0.1, r), 0, TAU);
}
function rrect(c: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + k, y);
  c.arcTo(x + w, y, x + w, y + h, k);
  c.arcTo(x + w, y + h, x, y + h, k);
  c.arcTo(x, y + h, x, y, k);
  c.arcTo(x, y, x + w, y, k);
  c.closePath();
}
function poly(c: Ctx, pts: number[]): void {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
}
function line(c: Ctx, x1: number, y1: number, x2: number, y2: number): void {
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

// Kotak 3/4: tapak (x,y,w,d), tinggi h. Muka hadapan (selatan) + bumbung.
function box(c: Ctx, x: number, y: number, w: number, d: number, h: number, col: string, top?: string): void {
  c.fillStyle = shade(col, -0.13);
  c.fillRect(x, y + d - h, w, h);
  c.fillStyle = top ?? shade(col, 0.1);
  c.fillRect(x, y - h, w, d);
  c.strokeStyle = "rgba(50,35,15,.22)";
  c.lineWidth = 1;
  c.strokeRect(x + 0.5, y - h + 0.5, w - 1, d - 1);
  c.strokeRect(x + 0.5, y + d - h + 0.5, w - 1, h - 1);
}
function shadowBox(c: Ctx, x: number, y: number, w: number, d: number, off = 12): void {
  c.fillStyle = "rgba(60,40,10,.16)";
  poly(c, [x + off, y + d, x + w + off, y + d, x + w + off, y + d * 0.2, x + w, y]);
  c.fill();
}
function dome(c: Ctx, cx: number, by: number, r: number, col: string): void {
  c.fillStyle = col;
  c.beginPath();
  c.ellipse(cx, by, r, r * 0.92, 0, Math.PI, TAU);
  c.closePath();
  c.fill();
  c.strokeStyle = "rgba(50,35,15,.2)";
  c.lineWidth = 1;
  c.stroke();
  c.fillStyle = "rgba(255,255,255,.35)";
  c.beginPath();
  c.ellipse(cx - r * 0.35, by - r * 0.45, r * 0.22, r * 0.32, -0.5, 0, TAU);
  c.fill();
  c.fillStyle = "#c9a24a";
  c.fillRect(cx - 0.8, by - r * 0.92 - 9, 1.6, 9);
  circ(c, cx, by - r * 0.92 - 10, 2);
  c.fill();
}
function archRow(c: Ctx, x: number, y: number, w: number, h: number, n: number, col: string): void {
  const gap = w / n;
  c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const ax = x + gap * i + gap * 0.18;
    const aw = gap * 0.64;
    c.beginPath();
    c.moveTo(ax, y + h);
    c.lineTo(ax, y + aw * 0.5);
    c.arc(ax + aw / 2, y + aw * 0.5, aw / 2, Math.PI, TAU);
    c.lineTo(ax + aw, y + h);
    c.closePath();
    c.fill();
  }
}
function windowGrid(c: Ctx, x: number, y: number, w: number, h: number, cols: number, rows: number, col: string): void {
  const gx = w / cols;
  const gy = h / rows;
  c.fillStyle = col;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) c.fillRect(x + gx * i + gx * 0.22, y + gy * j + gy * 0.22, gx * 0.56, gy * 0.5);
}
function gridLines(c: Ctx, x0: number, y0: number, x1: number, y1: number, step: number, col: string): void {
  const ax0 = Math.max(x0, VIEW.x0 - step);
  const ax1 = Math.min(x1, VIEW.x1 + step);
  const ay0 = Math.max(y0, VIEW.y0 - step);
  const ay1 = Math.min(y1, VIEW.y1 + step);
  if (ax1 <= ax0 || ay1 <= ay0) return;
  c.strokeStyle = col;
  c.lineWidth = 1;
  c.beginPath();
  for (let x = Math.ceil((ax0 - x0) / step) * step + x0; x <= ax1; x += step) {
    c.moveTo(x, ay0);
    c.lineTo(x, ay1);
  }
  for (let y = Math.ceil((ay0 - y0) / step) * step + y0; y <= ay1; y += step) {
    c.moveTo(ax0, y);
    c.lineTo(ax1, y);
  }
  c.stroke();
}

// ---------------------------------------------------------------------
//  WATAK JEMAAH
// ---------------------------------------------------------------------
type Pose = "stand" | "pray" | "sit" | "sleep" | "throw";

interface Person {
  x: number;
  y: number;
  gender: Gender;
  skin: string;
  hair: string;
  outfit: string;
  acc: string; // warna tudung/telekung (wanita, bukan ihram)
  ihram: boolean;
  shaved: boolean;
  dx: number;
  dy: number;
  walk: number;
  moving: boolean;
  pose: Pose;
  scale?: number;
}

const SKINS = ["#f1c9a1", "#e2ae80", "#c88c5c", "#a06d45", "#7d5132", "#f5d6ba", "#d9a073"] as const;
const HAIRS = ["#1d1a17", "#2b211b", "#3b2b1f", "#141414", "#5b4a3c"] as const;
const OUTFIT_L = ["#dfe7ee", "#e9e1cf", "#c9d6cf", "#d8d2e6", "#f1eee6", "#bfcfdf"] as const;
const OUTFIT_P = ["#e7d6e8", "#cfdcea", "#e9dcc6", "#d4e3d6", "#efe3e3", "#d6d0ea"] as const;
const SCARF_P = ["#b9a3c9", "#8fb0cf", "#d3b48a", "#9cc1a4", "#e0b3b3", "#f4efe6"] as const;

function mkPerson(g?: Gender, ihram = true): Person {
  const gender: Gender = g ?? (rnd() < 0.56 ? "L" : "P");
  const p: Person = {
    x: 0,
    y: 0,
    gender,
    skin: pick(SKINS),
    hair: pick(HAIRS),
    outfit: gender === "L" ? pick(OUTFIT_L) : pick(OUTFIT_P),
    acc: pick(SCARF_P),
    ihram,
    shaved: false,
    dx: 0,
    dy: 1,
    walk: rr(0, 6),
    moving: false,
    pose: "stand",
  };
  // Sebahagian jemaah wanita memakai ihram berwarna lembut
  if (gender === "P" && rnd() < 0.18) p.acc = pick(SCARF_P);
  return p;
}

const LINE_COL = "rgba(70,70,82,.32)";

function drawPerson(c: Ctx, p: Person): void {
  if (p === P && miqatPrivate()) return;
  if (p === P && drawMiqatPrayer2D(c, p)) return;
  const s = p.scale ?? 1;
  c.save();
  c.translate(p.x, p.y);
  if (s !== 1) c.scale(s, s);
  c.fillStyle = "rgba(50,35,10,.22)";
  ell(c, 0, 0, 9, 3.6);
  c.fill();
  const female = p.gender === "P";
  const body = p.ihram ? "#fbfbf6" : p.outfit;
  c.lineWidth = 0.8;
  c.strokeStyle = LINE_COL;

  if (p.pose === "sleep") {
    c.fillStyle = body;
    rrect(c, -13, -8, 22, 9, 4);
    c.fill();
    c.stroke();
    c.fillStyle = female ? (p.ihram ? "#ffffff" : p.acc) : p.skin;
    circ(c, 11, -4.5, 5);
    c.fill();
    c.stroke();
    c.restore();
    return;
  }

  const mv = p.moving ? 1 : 0;
  const sw = Math.sin(p.walk);
  const bob = mv * Math.abs(sw) * 1.2;
  const sit = p.pose === "sit";
  const back = p.dy < -0.4 && Math.abs(p.dy) >= Math.abs(p.dx) * 0.8;
  const side = Math.abs(p.dx) > 0.35 ? Math.sign(p.dx) : 0;

  if (!sit) {
    c.fillStyle = "#7a5534";
    ell(c, -3, -1.2 - Math.max(0, sw) * 2 * mv, 2.4, 1.6);
    c.fill();
    ell(c, 3, -1.2 - Math.max(0, -sw) * 2 * mv, 2.4, 1.6);
    c.fill();
  }
  const top = sit ? -14 : -22 - bob;
  const bot = sit ? -1 : -2.5 - bob * 0.4;

  c.fillStyle = body;
  if (female) poly(c, [-6, top + 1, 6, top + 1, 8.6, bot, -8.6, bot]);
  else rrect(c, -7, top, 14, bot - top, 4.5);
  c.fill();
  c.stroke();

  // tangan
  if (p.pose === "pray") {
    c.fillStyle = p.skin;
    circ(c, -7.6, top - 1, 2.2);
    c.fill();
    circ(c, 7.6, top - 1, 2.2);
    c.fill();
  } else if (p.pose === "throw") {
    c.fillStyle = body;
    ell(c, -7.6, top + 7, 2.4, 5);
    c.fill();
    c.stroke();
    c.fillStyle = p.skin;
    circ(c, 8, top - 7, 2.3);
    c.fill();
  } else {
    c.fillStyle = female && !p.ihram ? shade(p.outfit, -0.06) : body;
    ell(c, -7.6, top + 7 + sw * mv, 2.4, 5);
    c.fill();
    c.stroke();
    ell(c, 7.6, top + 7 - sw * mv, 2.4, 5);
    c.fill();
    c.stroke();
  }

  if (!female && p.ihram) {
    c.strokeStyle = "rgba(120,120,130,.5)";
    line(c, -7, top + 10, 7, top + 10);
    line(c, -6, top + 1.5, 6, top + 10);
    if (!back) {
      c.fillStyle = p.skin;
      ell(c, -4.4, top + 2.6, 2.6, 2);
      c.fill();
    }
  } else if (!female) {
    c.strokeStyle = shade(p.outfit, -0.28);
    line(c, 0, top + 1.5, 0, top + 7);
  }

  // kepala
  const hy = top - 6.5;
  c.strokeStyle = LINE_COL;
  if (female) {
    const scarf = p.ihram ? "#ffffff" : p.acc;
    c.fillStyle = scarf;
    poly(c, [-8.4, hy + 1, 8.4, hy + 1, 9.6, top + 7, -9.6, top + 7]);
    c.fill();
    circ(c, 0, hy, 8.2);
    c.fill();
    c.stroke();
    if (!back) {
      c.fillStyle = p.skin;
      ell(c, side * 1.6, hy + 0.9, 4.6, 5);
      c.fill();
      c.fillStyle = "#2a2018";
      circ(c, side * 2.3 - 1.8, hy + 0.5, 0.9);
      c.fill();
      circ(c, side * 2.3 + 1.8, hy + 0.5, 0.9);
      c.fill();
    }
  } else {
    c.fillStyle = p.skin;
    circ(c, 0, hy, 7);
    c.fill();
    c.stroke();
    if (!p.ihram) {
      c.fillStyle = "#f8f6ef";
      c.beginPath();
      c.arc(0, hy - 0.6, 7.4, Math.PI, TAU);
      c.closePath();
      c.fill();
      c.stroke();
    } else if (p.shaved) {
      c.fillStyle = shade(p.skin, -0.14);
      c.beginPath();
      c.arc(0, hy - 0.2, 7, Math.PI * 1.05, Math.PI * 1.95);
      c.closePath();
      c.fill();
    } else {
      c.fillStyle = p.hair;
      if (back) {
        circ(c, 0, hy, 7.1);
        c.fill();
      } else {
        c.beginPath();
        c.arc(0, hy - 0.3, 7.2, Math.PI * 1.02, Math.PI * 1.98);
        c.closePath();
        c.fill();
      }
    }
    if (!back) {
      c.fillStyle = "#2a2018";
      circ(c, side * 2.3 - 2.4, hy + 1, 0.95);
      c.fill();
      circ(c, side * 2.3 + 2.4, hy + 1, 0.95);
      c.fill();
    }
  }
  c.restore();
}

// ---------------------------------------------------------------------
//  PROP UMUM
// ---------------------------------------------------------------------
function palmProp(x: number, y: number, h = 54): Drawable {
  m3({ k: "palm", x, y, h });
  return {
    y,
    draw: (c) => {
      c.fillStyle = "rgba(40,60,20,.16)";
      ell(c, x + 10, y + 2, 20, 7);
      c.fill();
      c.strokeStyle = "#8b6a44";
      c.lineWidth = 4.5;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 7, y - h * 0.55, x + 3, y - h);
      c.stroke();
      c.lineCap = "butt";
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + 0.3;
        c.save();
        c.translate(x + 3, y - h);
        c.rotate(a);
        c.fillStyle = i % 2 ? "#3d8a4a" : "#4ea35a";
        ell(c, 12, 2, 13, 3.6);
        c.fill();
        c.restore();
      }
      c.fillStyle = "#6b4f2e";
      circ(c, x + 3, y - h + 2, 3.2);
      c.fill();
    },
  };
}

function treeProp(x: number, y: number, s = 1): Drawable {
  m3({ k: "tree", x, y, s });
  return {
    y,
    draw: (c) => {
      c.fillStyle = "rgba(40,60,20,.18)";
      ell(c, x + 6 * s, y + 2, 22 * s, 8 * s);
      c.fill();
      c.fillStyle = "#7d5c3a";
      c.fillRect(x - 2.5 * s, y - 18 * s, 5 * s, 18 * s);
      const blobs: [number, number, number][] = [
        [-10, -27, 12],
        [10, -28, 12],
        [0, -38, 13],
        [0, -25, 13],
      ];
      c.fillStyle = "#3e7a3a";
      for (const [bx, by, br] of blobs) {
        circ(c, x + bx * s, y + by * s, br * s);
        c.fill();
      }
      c.fillStyle = "#5c9c4c";
      for (const [bx, by, br] of blobs) {
        circ(c, x + (bx - 3) * s, y + (by - 4) * s, br * 0.5 * s);
        c.fill();
      }
    },
  };
}

function boardProp(x: number, y: number, title: string, col = "#145a43"): Drawable {
  m3({ k: "board", x, y, title, col });
  return {
    y,
    draw: (c) => {
      c.fillStyle = "rgba(0,0,0,.15)";
      ell(c, x + 4, y + 1, 24, 5);
      c.fill();
      c.fillStyle = "#6a5034";
      c.fillRect(x - 17, y - 30, 3, 30);
      c.fillRect(x + 14, y - 30, 3, 30);
      c.fillStyle = col;
      rrect(c, x - 27, y - 54, 54, 30, 4);
      c.fill();
      c.strokeStyle = "#f3d488";
      c.lineWidth = 1.5;
      c.stroke();
      c.fillStyle = "#ffffff";
      c.font = "700 7px Nunito, sans-serif";
      c.textAlign = "center";
      c.textBaseline = "alphabetic";
      c.fillText(title, x, y - 43, 48);
      c.fillStyle = "rgba(243,212,136,.8)";
      c.fillRect(x - 19, y - 38, 38, 1.5);
      c.fillRect(x - 15, y - 34, 30, 1.5);
      c.fillRect(x - 17, y - 30, 34, 1.5);
    },
  };
}

function lampProp(x: number, y: number, warm = "#ffe9a8"): Drawable {
  m3({ k: "lamp", x, y });
  return {
    y,
    draw: (c) => {
      c.fillStyle = "rgba(0,0,0,.14)";
      ell(c, x + 3, y + 1, 7, 3);
      c.fill();
      c.fillStyle = "#596260";
      c.fillRect(x - 1.5, y - 62, 3, 62);
      c.fillStyle = "#3b403f";
      c.fillRect(x - 7, y - 68, 14, 6);
      c.fillStyle = warm;
      circ(c, x, y - 61, 3.6);
      c.fill();
    },
  };
}

function minaretProp(x: number, y: number, h = 150, col = "#efe8da"): Drawable {
  m3({ k: "minaret", x, y, h, col });
  return {
    y,
    draw: (c) => {
      c.fillStyle = "rgba(60,40,10,.15)";
      ell(c, x + 18, y + 3, 26, 7);
      c.fill();
      c.fillStyle = shade(col, -0.1);
      c.fillRect(x - 9, y - h, 18, h);
      c.fillStyle = shade(col, 0.08);
      c.fillRect(x - 9, y - h, 6, h);
      c.fillStyle = shade(col, -0.22);
      for (const f of [0.34, 0.62, 0.86]) c.fillRect(x - 12, y - h * f - 4, 24, 5);
      c.fillStyle = shade(col, -0.05);
      c.fillRect(x - 7, y - h - 14, 14, 14);
      c.fillStyle = "#c9a24a";
      poly(c, [x - 8, y - h - 14, x + 8, y - h - 14, x, y - h - 40]);
      c.fill();
      circ(c, x, y - h - 44, 2.4);
      c.fill();
    },
  };
}

function busProp(x: number, y: number, w = 140, d = 44): Drawable {
  m3({ k: "bus", x, y, w, d });
  return {
    y: y + d,
    draw: (c) => {
      shadowBox(c, x, y, w, d, 14);
      box(c, x, y, w, d, 42, "#f3f2ec", "#ffffff");
      c.fillStyle = "#16634c";
      c.fillRect(x, y + d - 19, w, 6);
      c.fillStyle = "#d9a83c";
      c.fillRect(x, y + d - 13, w, 2);
      c.fillStyle = "#2f4a5a";
      for (let i = 0; i < Math.floor((w - 16) / 22); i++) c.fillRect(x + 8 + i * 22, y + d - 38, 16, 13);
      c.fillStyle = "#1e1e1e";
      ell(c, x + 26, y + d, 9, 4);
      c.fill();
      ell(c, x + w - 26, y + d, 9, 4);
      c.fill();
      c.fillStyle = "#16634c";
      c.font = "800 9px Nunito, sans-serif";
      c.textAlign = "center";
      c.fillText("BAS JEMAAH", x + w / 2, y - 42 + d / 2 + 3);
    },
  };
}

function tentProp(x: number, y: number, w: number, d: number, col = "#fbfbf7", hl = false): Drawable {
  m3({ k: "tent", x, y, w, d, col, hl });
  return {
    y: y + d,
    draw: (c) => {
      const wall = 14;
      const apexH = 40;
      c.fillStyle = "rgba(60,40,10,.14)";
      poly(c, [x + 8, y + d + 2, x + w + 16, y + d + 2, x + w + 16, y + 6, x + w, y]);
      c.fill();
      c.fillStyle = shade(col, -0.1);
      c.fillRect(x, y + d - wall, w, wall);
      const ax = x + w / 2;
      const ay = y + d / 2 - apexH;
      const tl = [x, y - wall];
      const tr = [x + w, y - wall];
      const br = [x + w, y + d - wall];
      const bl = [x, y + d - wall];
      c.fillStyle = shade(col, -0.04);
      poly(c, [tl[0], tl[1], tr[0], tr[1], ax, ay]);
      c.fill();
      c.fillStyle = shade(col, -0.15);
      poly(c, [tl[0], tl[1], bl[0], bl[1], ax, ay]);
      c.fill();
      c.fillStyle = shade(col, -0.07);
      poly(c, [tr[0], tr[1], br[0], br[1], ax, ay]);
      c.fill();
      c.fillStyle = col;
      poly(c, [bl[0], bl[1], br[0], br[1], ax, ay]);
      c.fill();
      c.strokeStyle = "rgba(120,110,90,.35)";
      c.lineWidth = 1;
      line(c, bl[0], bl[1], ax, ay);
      line(c, br[0], br[1], ax, ay);
      c.fillStyle = shade(col, -0.32);
      c.fillRect(ax - 6, y + d - wall, 12, wall);
      if (hl) {
        c.fillStyle = "#d9a83c";
        c.fillRect(x, y + d - wall, w, 3);
        c.fillStyle = "#6a5034";
        c.fillRect(ax - 1, ay - 26, 2, 26);
        c.fillStyle = "#16634c";
        poly(c, [ax + 1, ay - 26, ax + 18, ay - 21, ax + 1, ay - 16]);
        c.fill();
      }
    },
  };
}

function rockCluster(cx: number, cy: number, w: number, seed: number, col = "#9a8a73"): Drawable {
  const r = mulberry32(seed);
  const rocks: { x: number; y: number; s: number; h: number; k: number }[] = [];
  for (let i = 0; i < 9; i++)
    rocks.push({ x: cx + (r() - 0.5) * w, y: cy + (r() - 0.5) * w * 0.35, s: 12 + r() * 18, h: 6 + r() * 16, k: r() });
  rocks.sort((a, b) => a.y - b.y);
  m3({ k: "rocks", x: cx, y: cy, w, seed, col });
  return {
    y: cy + w * 0.18,
    draw: (c) => {
      for (const k of rocks) {
        const base = k.k > 0.5 ? col : shade(col, -0.1);
        c.fillStyle = shade(base, -0.18);
        poly(c, [k.x - k.s, k.y, k.x - k.s * 0.6, k.y - k.h, k.x + k.s * 0.5, k.y - k.h * 1.1, k.x + k.s, k.y]);
        c.fill();
        c.fillStyle = shade(base, 0.12);
        poly(c, [k.x - k.s * 0.6, k.y - k.h, k.x + k.s * 0.5, k.y - k.h * 1.1, k.x + k.s * 0.2, k.y - k.h * 1.4 - 3, k.x - k.s * 0.4, k.y - k.h * 1.3]);
        c.fill();
      }
    },
  };
}
