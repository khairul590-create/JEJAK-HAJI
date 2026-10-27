// =====================================================================
//  Fail 12: ROMBONGAN — main bersama rakan sekelas (berbilang pemain)
//  Pelayan: server/ (Cloudflare Workers + Durable Objects). Protokol &
//  cara hos: docs/ROMBONGAN.md.
//
//  - Pensyarah (ketua) mencipta rombongan dan berkongsi kod 6 huruf.
//  - Jemaah menyertai dengan kod & nama panggilan. Rakan di lokasi yang
//    sama dilukis sebagai jemaah bernama (2D & 3D) dan di peta mini.
//  - Sembang + frasa pantas, belon kata di atas kepala.
//  - Ketua: senarai ahli (lokasi & langkah), umum, kumpul, senyap, keluarkan.
//  Kemajuan ibadah setiap jemaah kekal milik sendiri (tidak dikongsi).
// =====================================================================

interface RupaR {
  g: Gender;
  ih: boolean;
  kulit: string;
  baju: string;
  tudung: string;
}
interface InfoR {
  sc: string;
  st: string;
  lt: string;
  b: number;
}
interface Rakan {
  id: string;
  nama: string;
  ketua: boolean;
  senyap: boolean;
  info: InfoR;
  p: Person;
  sc: string; // lokasi kedudukan terkini ("" = tidak kelihatan)
  tx: number;
  ty: number;
  sedia: boolean; // sudah ada kedudukan
  cakap: string; // belon kata
  cakapT: number;
}
interface SembangR {
  id: string;
  nama: string;
  m: string;
  w: number;
  k?: boolean;
  sys?: boolean;
}
interface AhliR {
  id: string;
  nama: string;
  ketua: boolean;
  senyap?: boolean;
  rupa: RupaR;
  info: InfoR;
  p: [string, number, number, number, number] | null;
}

const ROM_POSE: Pose[] = ["stand", "pray", "sit", "sleep", "throw"];
const ROM_FRASA = ["Assalamualaikum", "Labbaik Allahumma labbaik", "Tunggu saya", "Saya di sini", "Ikut saya", "Jumpa di bas", "Alhamdulillah, selesai!", "Saya perlukan bantuan"];
const ROM_KEY = "jejakHaji.rombongan.v1";

const ROM = {
  ws: null as WebSocket | null,
  kod: "",
  nama: "",
  id: "",
  ketua: false,
  tajuk: "",
  senyap: false,
  rakan: new Map<string, Rakan>(),
  sembang: [] as SembangR[],
  belumBaca: 0,
  tSend: 0,
  tHb: 0,
  tInfo: 0,
  last: "",
  lastInfo: "",
  cuba: 0,
  tamat: true, // tiada sambungan dikehendaki
  retry: 0 as number,
  kumpul: null as { s: string; x: number; y: number; nama: string; t: number } | null,
  modal: false,
  tChat: 0,
  modalMode: "", // "sertai" | "dalam": bentuk modal yang sedang dipaparkan
  npcs: [] as NPC[],
};

interface RomSimpan {
  kod: string;
  nama: string;
  kunci: Record<string, string>;
}
function romSimpanan(): RomSimpan {
  const s = loadJSON<Partial<RomSimpan>>(ROM_KEY) ?? {};
  return { kod: s.kod ?? "", nama: s.nama ?? "", kunci: s.kunci ?? {} };
}
function romSimpan(p: Partial<RomSimpan>): void {
  saveJSON(ROM_KEY, { ...romSimpanan(), ...p });
}

// API dan WebSocket hanya menggunakan pelayan dipercayai, bukan parameter jemputan.
function romServer(): string {
  if (CONFIG.rombongan) return CONFIG.rombongan.replace(/\/$/, "");
  return /^https?:$/.test(location.protocol) ? location.origin : "";
}
function romOn(): boolean {
  return !!ROM.id && !!ROM.ws && ROM.ws.readyState === WebSocket.OPEN;
}
function romSend(m: unknown): void {
  if (ROM.ws && ROM.ws.readyState === WebSocket.OPEN) ROM.ws.send(JSON.stringify(m));
}
function romRupa(): RupaR {
  return { g: P.gender, ih: P.ihram, kulit: P.skin, baju: P.outfit, tudung: P.acc };
}

// ---------------------------------------------------------------------
//  Sambungan
// ---------------------------------------------------------------------
function romSertai(kod: string, nama: string): void {
  romPutus(false);
  ROM.kod = kod;
  ROM.nama = nama;
  ROM.tamat = false;
  const base = romServer();
  if (!base) {
    toast("Pelayan rombongan belum ditetapkan.", "bad", 5000);
    return;
  }
  const ws = new WebSocket(base.replace(/^http/, "ws") + "/ws/" + kod);
  ROM.ws = ws;
  ws.onopen = () => ws.send(JSON.stringify({ t: "hai", nama, kunci: romSimpanan().kunci[kod], rupa: romRupa() }));
  ws.onmessage = (e) => {
    try {
      romTerima(JSON.parse(String(e.data)));
    } catch {
      /* abai mesej rosak */
    }
  };
  ws.onclose = () => {
    if (ROM.ws !== ws) return;
    const adaSambungan = !!ROM.id;
    ROM.ws = null;
    ROM.id = "";
    ROM.rakan.clear();
    romPaint();
    if (ROM.tamat) return;
    ROM.cuba++;
    if (ROM.cuba > 8) {
      toast("Sambungan rombongan terputus. Buka Rombongan untuk menyertai semula.", "bad", 7000);
      ROM.tamat = true;
      return;
    }
    if (adaSambungan || ROM.cuba === 1) toast("Sambungan rombongan terputus. Menyambung semula…", "warn", 3500);
    ROM.retry = window.setTimeout(() => romSertai(ROM.kod, ROM.nama), Math.min(15000, 1000 * 2 ** (ROM.cuba - 1)));
  };
}
function romPutus(sengaja: boolean): void {
  clearTimeout(ROM.retry);
  if (sengaja) {
    ROM.tamat = true;
    romSimpan({ kod: "" });
  }
  const ws = ROM.ws;
  ROM.ws = null;
  ROM.id = "";
  ROM.rakan.clear();
  ROM.kumpul = null;
  try {
    ws?.close(1000, "Keluar");
  } catch {
    /* abai */
  }
  romPaint();
}

function romTambah(a: AhliR): Rakan {
  const p = mkPerson(a.rupa.g, a.rupa.ih);
  const r: Rakan = { id: a.id, nama: a.nama, ketua: a.ketua, senyap: !!a.senyap, info: a.info, p, sc: "", tx: 0, ty: 0, sedia: false, cakap: "", cakapT: 0 };
  romRupaKe(r, a.rupa);
  if (a.p) romKedudukan(r, a.p[0], a.p[1], a.p[2], a.p[3], a.p[4], true);
  ROM.rakan.set(a.id, r);
  return r;
}
function romRupaKe(r: Rakan, u: RupaR): void {
  r.p.gender = u.g;
  r.p.ihram = u.ih;
  r.p.skin = u.kulit;
  r.p.outfit = u.baju;
  r.p.acc = u.tudung;
}
function romKedudukan(r: Rakan, sc: string, x: number, y: number, a: number, f: number, lompat = false): void {
  if (f & 0x80) {
    r.sc = ""; // sedang di bilik peribadi (Miqat): disembunyikan
    return;
  }
  if (!r.sedia || r.sc !== sc || lompat || Math.hypot(x - r.p.x, y - r.p.y) > 260) {
    r.p.x = x;
    r.p.y = y;
  }
  r.sc = sc;
  r.tx = x;
  r.ty = y;
  r.sedia = true;
  r.p.dx = Math.sin(a);
  r.p.dy = Math.cos(a);
  r.p.moving = !!(f & 1);
  r.p.pose = ROM_POSE[(f >> 2) & 7] ?? "stand";
}
function romSys(m: string): void {
  ROM.sembang.push({ id: "", nama: "", m, w: Date.now(), sys: true });
  if (ROM.sembang.length > 60) ROM.sembang.shift();
  if (!el("romChat").hidden) romChatPaint();
}

function romTerima(m: Record<string, unknown>): void {
  switch (m.t) {
    case "selamat": {
      ROM.id = String(m.id);
      ROM.ketua = !!m.ketua;
      ROM.tajuk = String(m.tajuk ?? "");
      ROM.cuba = 0;
      ROM.rakan.clear();
      for (const a of (m.ahli as AhliR[]) ?? []) romTambah(a);
      ROM.sembang = ((m.sembang as SembangR[]) ?? []).slice();
      ROM.last = ROM.lastInfo = "";
      romSimpan({ kod: ROM.kod, nama: ROM.nama });
      toast(`Menyertai ${ROM.tajuk} (${ROM.kod}) · ${ROM.rakan.size + 1} orang${ROM.ketua ? " · anda ketua rombongan" : ""}.`, "ok", 4500);
      romInfo(true);
      romPaint();
      return;
    }
    case "masuk": {
      const r = romTambah(m.ahli as AhliR);
      romSys(`${r.nama} menyertai rombongan.`);
      if (ROM.ketua && ROM.rakan.size < 12) toast(`${r.nama} menyertai rombongan.`, "info", 2500);
      romPaint();
      return;
    }
    case "keluar": {
      const r = ROM.rakan.get(String(m.id));
      if (r) romSys(`${r.nama} keluar.`);
      ROM.rakan.delete(String(m.id));
      romPaint();
      return;
    }
    case "pp": {
      const sc = String(m.s);
      const ada = new Set<string>();
      for (const d of (m.d as [string, string, number, number, number, number][]) ?? []) {
        ada.add(d[0]);
        const r = ROM.rakan.get(d[0]);
        if (r) romKedudukan(r, d[1], d[2], d[3], d[4], d[5]);
      }
      // snapshot penuh: rakan yang tiada dalam senarai sudah meninggalkan lokasi ini
      if (m.penuh) for (const r of ROM.rakan.values()) if (r.sc === sc && !ada.has(r.id)) r.sc = "";
      return;
    }
    case "i": {
      const r = ROM.rakan.get(String(m.id));
      if (!r) return;
      r.info = m.info as InfoR;
      if (m.rupa) romRupaKe(r, m.rupa as RupaR);
      if (r.info.sc && r.sc && r.info.sc !== r.sc) r.sc = "";
      return;
    }
    case "c": {
      const c = m as unknown as SembangR;
      ROM.sembang.push(c);
      if (ROM.sembang.length > 60) ROM.sembang.shift();
      const r = ROM.rakan.get(c.id);
      if (r) {
        r.cakap = c.m;
        r.cakapT = 6;
      } else if (c.id === ROM.id) {
        ROM_SAYA.cakap = c.m;
        ROM_SAYA.t = 6;
      }
      if (el("romChat").hidden && c.id !== ROM.id) {
        ROM.belumBaca++;
        if (c.k) toast(`Ketua ${c.nama}: ${c.m}`, "ch", 6000);
      }
      romChatPaint();
      romPaint();
      return;
    }
    case "umum": {
      const t = `Pengumuman ketua (${String(m.nama)}): ${String(m.m)}`;
      toast(t, "ch", 10000);
      romSys(t);
      SND.play("tap");
      if (speechOn()) sayWeb(String(m.m), "ms");
      return;
    }
    case "kumpul": {
      ROM.kumpul = { s: String(m.s), x: Number(m.x), y: Number(m.y), nama: String(m.nama), t: 90 };
      const sini = ROM.kumpul.s === scene.id;
      toast(
        sini ? `${ROM.kumpul.nama} memanggil rombongan berkumpul. Ikut penanda hijau KUMPUL.` : `${ROM.kumpul.nama} memanggil rombongan berkumpul di ${SCENE_NAMES[ROM.kumpul.s as SceneId] ?? "lokasi lain"}.`,
        "ch",
        7000
      );
      romSys(`${ROM.kumpul.nama} memanggil rombongan berkumpul.`);
      return;
    }
    case "senyap": {
      const on = !!m.on;
      if (m.id === ROM.id) {
        ROM.senyap = on;
        toast(on ? "Ketua telah menyenyapkan sembang kamu." : "Kamu boleh bersembang semula.", on ? "warn" : "ok", 5000);
      } else {
        const r = ROM.rakan.get(String(m.id));
        if (r) r.senyap = on;
      }
      if (ROM.modal) romTblPaint();
      return;
    }
    case "ralat": {
      toast(String(m.m), "bad", 6500);
      if (m.tamat) {
        ROM.tamat = true;
        romSimpan({ kod: "" });
      }
      return;
    }
  }
}

// ---------------------------------------------------------------------
//  Setiap bingkai: hantar kedudukan (4 Hz), gerakkan rakan dengan lancar
// ---------------------------------------------------------------------
const ROM_SAYA = { cakap: "", t: 0 };
function romInfo(paksa = false): void {
  const fs = curFlat();
  const st = curStep();
  const info = { sc: scene.id, st: st?.id ?? "selesai", lt: fs?.task.title ?? "Selesai", b: fs ? fs.task.ch : 0 };
  const rupa = romRupa();
  const key = JSON.stringify([info, rupa]);
  if (!paksa && key === ROM.lastInfo) return;
  ROM.lastInfo = key;
  romSend({ t: "i", ...info, rupa });
}
function updateRombongan(dt: number): void {
  ROM_SAYA.t -= dt;
  if (ROM.kumpul) {
    ROM.kumpul.t -= dt;
    if (ROM.kumpul.t <= 0 || (ROM.kumpul.s === scene.id && Math.hypot(P.x - ROM.kumpul.x, P.y - ROM.kumpul.y) < 70)) ROM.kumpul = null;
  }
  ROM.npcs.length = 0;
  for (const r of ROM.rakan.values()) {
    r.cakapT -= dt;
    if (r.sc !== scene.id || !r.sedia) continue;
    const k = Math.min(1, dt * 7);
    r.p.x += (r.tx - r.p.x) * k;
    r.p.y += (r.ty - r.p.y) * k;
    if (r.p.moving) r.p.walk += dt * 9;
    ROM.npcs.push({ p: r.p } as unknown as NPC);
  }
  if (!romOn() || !started) return;
  ROM.tSend -= dt;
  ROM.tInfo -= dt;
  if (ROM.tInfo <= 0) {
    ROM.tInfo = 1;
    romInfo();
  }
  if (ROM.tSend > 0 || TOUR.on) return; // Lawatan 360° tidak dikongsi (kedudukan maya)
  ROM.tSend = 0.25;
  const pose = Math.max(0, ROM_POSE.indexOf(P.pose));
  const hide = insideMiqat !== null || miqatPrivate();
  const f = (P.moving ? 1 : 0) | (T.running ? 2 : 0) | (pose << 2) | (hide ? 0x80 : 0);
  const a = Math.round(Math.atan2(P.dx, P.dy) * 20) / 20;
  const msg = { t: "p", s: scene.id, x: Math.round(P.x), y: Math.round(P.y), a, f };
  const key = `${msg.s}|${msg.x}|${msg.y}|${a}|${f}`;
  ROM.tHb -= 0.25;
  if (key === ROM.last && ROM.tHb > 0) return;
  ROM.last = key;
  ROM.tHb = 4;
  romSend(msg);
}
function romNpcs(): NPC[] {
  return ROM.npcs;
}

// ---------------------------------------------------------------------
//  Lukisan: tag nama, belon kata, penanda KUMPUL (2D & 3D), peta mini
// ---------------------------------------------------------------------
function romTag(c: CanvasRenderingContext2D, x: number, y: number, r: Rakan | null, alpha = 1): void {
  const nama = r ? r.nama : ROM.nama;
  const ketua = r ? r.ketua : ROM.ketua;
  c.globalAlpha = alpha;
  c.font = `800 10.5px ${FONT_D}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  if (r) {
    const label = (ketua ? "★ " : "") + nama;
    const w = c.measureText(label).width + 14;
    c.fillStyle = ketua ? "#1f7a3f" : "#2f6fb3";
    rrect(c, x - w / 2, y - 9, w, 17, 8.5);
    c.fill();
    c.fillStyle = "#fff";
    c.fillText(label, x, y + 0.5);
  }
  const cakap = r ? (r.cakapT > 0 ? r.cakap : "") : ROM_SAYA.t > 0 ? ROM_SAYA.cakap : "";
  if (cakap) {
    c.font = `700 11px ${FONT_B}`;
    const t = cakap.length > 42 ? cakap.slice(0, 41) + "…" : cakap;
    const w = Math.min(240, c.measureText(t).width + 16);
    const by = y - 28;
    c.fillStyle = "rgba(255,255,255,.95)";
    rrect(c, x - w / 2, by - 11, w, 22, 9);
    c.fill();
    poly(c, [x - 5, by + 10, x + 5, by + 10, x, by + 16]);
    c.fill();
    c.fillStyle = "#1c2622";
    c.fillText(t, x, by + 0.5, 224);
  }
  c.globalAlpha = 1;
}
function romKumpulPill(c: CanvasRenderingContext2D, s: { x: number; y: number } | null): void {
  const k = ROM.kumpul;
  if (!k) return;
  const label = k.s === scene.id ? `KUMPUL · ${k.nama}` : `KUMPUL di ${SCENE_NAMES[k.s as SceneId] ?? "lokasi lain"}`;
  let x = W / 2;
  let y = 120;
  if (s) {
    x = clamp(s.x, 90, W - 90);
    y = clamp(s.y, 110, H - 160);
  }
  drawPill(x, y, label, "#1f7a3f");
}
function romDraw2D(list: Drawable[]): void {
  for (const r of ROM.rakan.values()) if (r.sc === scene.id && r.sedia && inView(r.p.x, r.p.y)) list.push({ y: r.p.y, draw: (c) => drawPerson(c, r.p) });
  const k = ROM.kumpul;
  if (k && k.s === scene.id) {
    list.push({
      y: k.y - 1,
      draw: (c) => {
        const pulse = 0.5 + 0.5 * Math.sin(T.time * 4);
        c.strokeStyle = `rgba(31,122,63,${0.55 + pulse * 0.4})`;
        c.lineWidth = 3;
        ell(c, k.x, k.y, 34 + pulse * 6, 14 + pulse * 2);
        c.stroke();
      },
    });
  }
}
// tag nama untuk ketua + rakan terdekat sahaja (50 tag serentak menutup skrin); yang bercakap sentiasa ditunjuk
function romTerdekat(maks: number): Rakan[] {
  const list: { r: Rakan; d: number }[] = [];
  for (const r of ROM.rakan.values()) {
    if (r.sc !== scene.id || !r.sedia) continue;
    const d = Math.hypot(r.p.x - P.x, r.p.y - P.y) - (r.ketua ? 1e6 : 0) - (r.cakapT > 0 ? 1e5 : 0);
    list.push({ r, d });
  }
  list.sort((a, b) => a.d - b.d);
  return list.slice(0, maks).map((x) => x.r);
}
function romTags2D(): void {
  if (!ROM.id) return;
  for (const r of romTerdekat(8)) {
    if (!inView(r.p.x, r.p.y, 60)) continue;
    const s = toScreen(r.p.x, r.p.y - 46);
    romTag(ctx, s.x, s.y, r);
  }
  if (ROM_SAYA.t > 0) {
    const s = toScreen(P.x, P.y - 46);
    romTag(ctx, s.x, s.y, null);
  }
  const k = ROM.kumpul;
  if (k) romKumpulPill(ctx, k.s === scene.id ? toScreen(k.x, k.y - 30) : null);
}
function romTags3D(): void {
  if (!ROM.id) return;
  const maxD = C3.mode === "top" ? 260 : 90;
  for (const r of romTerdekat(10)) {
    const s = proj(r.p.x, r.p.y, 2.75);
    if (!s || s.d > maxD) continue;
    romTag(ctx, s.x, s.y, r, clamp(1.5 - s.d / maxD, 0.35, 1));
  }
  if (ROM_SAYA.t > 0 && C3.mode !== "eye") {
    const s = proj(P.x, P.y, 2.75);
    if (s) romTag(ctx, s.x, s.y, null);
  }
  const k = ROM.kumpul;
  if (k) romKumpulPill(ctx, k.s === scene.id ? proj(k.x, k.y, 1.2) : null);
}
function romMini(c: CanvasRenderingContext2D, s: number): void {
  if (!ROM.id) return;
  for (const r of ROM.rakan.values()) {
    if (r.sc !== scene.id || !r.sedia) continue;
    c.fillStyle = r.ketua ? "#1f7a3f" : "#5aa7f0";
    c.strokeStyle = "#fff";
    c.lineWidth = 1.2 / s;
    circ(c, r.p.x, r.p.y, (r.ketua ? 4.4 : 3.2) / s);
    c.fill();
    c.stroke();
  }
  const k = ROM.kumpul;
  if (k && k.s === scene.id) {
    c.strokeStyle = "#1f7a3f";
    c.lineWidth = 2.5 / s;
    circ(c, k.x, k.y, (7 + Math.sin(T.time * 4) * 2) / s);
    c.stroke();
  }
}

// ---------------------------------------------------------------------
//  Antara muka: butang, sembang, modal rombongan
// ---------------------------------------------------------------------
function romPaint(): void {
  const n = el("romN");
  n.hidden = !ROM.id;
  n.textContent = String(ROM.rakan.size + 1);
  el("bChat").hidden = !ROM.id;
  if (!ROM.id) el("romChat").hidden = true;
  const u = el("chatN");
  u.hidden = ROM.belumBaca === 0;
  u.textContent = ROM.belumBaca > 9 ? "9+" : String(ROM.belumBaca);
  el("rcHead").textContent = ROM.id ? `${ROM.tajuk} · ${ROM.kod} · ${ROM.rakan.size + 1} orang` : "";
  if (ROM.modal) {
    // bina semula modal hanya apabila status sambungan berubah; jika tidak, kemas kini jadual sahaja
    if (ROM.modalMode !== (ROM.id ? "dalam" : "sertai")) romModalPaint();
    else if (ROM.id) romTblPaint();
  }
}
function romChatPaint(): void {
  if (el("romChat").hidden) return;
  const L = el("rcList");
  const atBottom = L.scrollHeight - L.scrollTop - L.clientHeight < 40;
  L.innerHTML = ROM.sembang
    .slice(-50)
    .map((c) =>
      c.sys
        ? `<div class="rc-sys">${esc(c.m)}</div>`
        : `<div class="rc-m${c.id === ROM.id ? " me" : ""}${c.k ? " k" : ""}"><b>${c.k ? "★ " : ""}${esc(c.nama)}</b>${esc(c.m)}</div>`
    )
    .join("");
  if (atBottom) L.scrollTop = L.scrollHeight;
}
function romChatToggle(on?: boolean): void {
  const p = el("romChat");
  const show = on ?? p.hidden;
  p.hidden = !show;
  el("bChat").setAttribute("aria-pressed", String(show));
  if (show) {
    ROM.belumBaca = 0;
    romChatPaint();
    el("rcList").scrollTop = el("rcList").scrollHeight;
  }
  romPaint();
}
function romCakap(teks: string): void {
  const t = teks.trim().slice(0, 160);
  if (!t) return;
  if (ROM.senyap) {
    toast("Ketua telah menyenyapkan sembang kamu.", "warn", 3500);
    return;
  }
  // pelayan menerima satu mesej setiap 1.5 s: mesej yang terlalu cepat beratur, bukan hilang
  const now = performance.now();
  const t0 = Math.max(now, ROM.tChat + 1600);
  ROM.tChat = t0;
  if (t0 === now) romSend({ t: "c", m: t });
  else later(() => romSend({ t: "c", m: t }), t0 - now);
}

function romPautan(kod: string): string {
  const u = new URL(location.href);
  u.search = "";
  u.hash = "";
  u.searchParams.set("rombongan", kod);
  if (CONFIG.rombongan === "" && new URLSearchParams(location.search).get("pelayan")) u.searchParams.set("pelayan", romServer());
  return u.toString();
}
function salinTeks(t: string): void {
  void navigator.clipboard?.writeText(t).then(
    () => toast("Disalin.", "ok", 2000),
    () => toast(t, "info", 8000)
  );
}

function openRombongan(kodAwal = ""): void {
  if (!started) {
    toast("Mulakan perjalanan dahulu, kemudian sertai rombongan.", "info", 4000);
    return;
  }
  ROM.modal = true;
  openModal({
    kicker: "Main bersama",
    title: "Rombongan",
    html: `<div class="rom" id="romBody"></div>`,
    cls: "rom-sheet",
    onClose: () => {
      ROM.modal = false;
      ROM.modalMode = "";
    },
  });
  romModalPaint(kodAwal);
}
function romRows(): { html: string; n: number } {
  const semua: { id: string; nama: string; ketua: boolean; senyap: boolean; info: InfoR; saya: boolean }[] = [
    { id: ROM.id, nama: ROM.nama, ketua: ROM.ketua, senyap: ROM.senyap, info: { sc: scene.id, st: curStep()?.id ?? "", lt: curFlat()?.task.title ?? "Selesai", b: curFlat()?.task.ch ?? 0 }, saya: true },
    ...[...ROM.rakan.values()].map((r) => ({ id: r.id, nama: r.nama, ketua: r.ketua, senyap: r.senyap, info: r.info, saya: false })),
  ].sort((a, c) => Number(c.ketua) - Number(a.ketua) || a.nama.localeCompare(c.nama));
  const lok = (sc: string): string => SCENE_NAMES[sc as SceneId] ?? "—";
  const rows = semua
    .map(
      (a) => `<tr><td>${a.ketua ? "★ " : ""}${esc(a.nama)}${a.saya ? " <i>(anda)</i>" : ""}</td><td>${esc(lok(a.info.sc))}</td><td>${a.info.b ? `Bab ${a.info.b} · ` : ""}${esc(a.info.lt || "—")}</td>${
        ROM.ketua ? `<td class="rom-act">${a.saya || a.ketua ? "" : `<button type="button" data-sy="${a.id}">${a.senyap ? "Benarkan" : "Senyap"}</button><button type="button" data-bu="${a.id}">Keluarkan</button>`}</td>` : ""
      }</tr>`
    )
    .join("");
  return { html: rows, n: semua.length };
}
// kemas kini senarai ahli tanpa mengganggu input yang sedang ditaip
function romTblPaint(): void {
  const tb = document.getElementById("romTb");
  if (!tb) return;
  const r = romRows();
  tb.innerHTML = r.html;
  el("romCnt").textContent = `${r.n} orang dalam talian`;
  romTblWire(tb);
}
function romTblWire(b: HTMLElement): void {
  if (!ROM.ketua) return;
  b.querySelectorAll<HTMLButtonElement>("[data-sy]").forEach((x) => {
    x.onclick = () => {
      const r = ROM.rakan.get(x.dataset.sy as string);
      if (r) romSend({ t: "senyap", id: r.id, on: !r.senyap });
    };
  });
  b.querySelectorAll<HTMLButtonElement>("[data-bu]").forEach((x) => {
    x.onclick = () => {
      const r = ROM.rakan.get(x.dataset.bu as string);
      if (r && confirm(`Keluarkan ${r.nama} daripada rombongan?`)) romSend({ t: "buang", id: r.id });
    };
  });
}
function romModalPaint(kodAwal = ""): void {
  const b = document.getElementById("romBody");
  if (!b) return;
  if (!ROM.id) {
    ROM.modalMode = "sertai";
    const s = romSimpanan();
    b.innerHTML = `<p class="gsub">Main bersama rakan sekelas: nampak avatar rakan dan ketua, bersembang, dan berkumpul apabila dipanggil. Kemajuan ibadah setiap orang kekal milik sendiri.</p>
<div class="rom-f">
<label for="romKod">Kod rombongan</label>
<input id="romKod" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="cth. 8WCCEJ" value="${esc(kodAwal || s.kod || "")}">
<label for="romNama">Nama panggilan</label>
<input id="romNama" maxlength="24" autocomplete="off" value="${esc(s.nama || S.name)}">
<p class="rom-note">Guna nama panggilan sahaja, bukan nama penuh, IC atau nombor telefon. Nama dan sembang dilihat oleh semua ahli rombongan.</p>
<button type="button" class="btn primary" id="romGo">Sertai rombongan</button>
<p class="rom-err" id="romErr" role="alert"></p>
</div>
<details class="rom-k"><summary>Pensyarah / ketua rombongan</summary>
<p class="gsub">Cipta rombongan baharu dan kongsi kodnya. Anda akan menjadi ketua: boleh membuat pengumuman, memanggil berkumpul, dan melihat lokasi serta langkah setiap jemaah.</p>
<label for="romTajuk">Tajuk rombongan</label>
<input id="romTajuk" maxlength="60" placeholder="cth. Kelas Haji ACIS 2026">
<button type="button" class="btn gold" id="romCipta">Cipta rombongan</button>
</details>`;
    const kod = el<HTMLInputElement>("romKod");
    kod.oninput = () => (kod.value = kod.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
    el("romGo").onclick = () => void romCubaSertai(kod.value.trim(), el<HTMLInputElement>("romNama").value);
    el("romCipta").onclick = () => void romCipta(el<HTMLInputElement>("romTajuk").value, el<HTMLInputElement>("romNama").value);
    return;
  }
  ROM.modalMode = "dalam";
  const { html: rows, n } = romRows();
  b.innerHTML = `<div class="rom-info"><div><b>${esc(ROM.tajuk)}</b><span id="romCnt">${n} orang dalam talian</span></div><div class="rom-kod" title="Kod rombongan">${ROM.kod}</div></div>
<div class="rom-row"><button type="button" class="btn ghost" id="romSalin">Salin pautan jemputan</button><button type="button" class="btn primary" id="romChatB">Buka sembang</button></div>
${
  ROM.ketua
    ? `<div class="rom-ketua"><b>Alat ketua</b>
<div class="rom-row"><button type="button" class="btn gold" id="romKumpul">Panggil berkumpul di sini</button></div>
<div class="rom-row"><input id="romUmum" maxlength="200" placeholder="Pengumuman kepada semua jemaah"><button type="button" class="btn primary" id="romUmumB">Umum</button></div></div>`
    : ""
}
<div class="rom-tbl"><table><thead><tr><th>Nama</th><th>Lokasi</th><th>Langkah</th>${ROM.ketua ? "<th></th>" : ""}</tr></thead><tbody id="romTb">${rows}</tbody></table></div>
<button type="button" class="btn ghost rom-out" id="romKeluar">Keluar rombongan</button>`;
  el("romSalin").onclick = () => salinTeks(romPautan(ROM.kod));
  el("romChatB").onclick = () => {
    closeModal();
    romChatToggle(true);
  };
  el("romKeluar").onclick = () => {
    romPutus(true);
    toast("Anda telah keluar daripada rombongan.", "info", 3000);
    romModalPaint();
  };
  if (ROM.ketua) {
    el("romKumpul").onclick = () => {
      romSend({ t: "kumpul" });
      toast("Jemaah dipanggil berkumpul di kedudukan anda.", "ok", 3500);
    };
    const umum = (): void => {
      const i = el<HTMLInputElement>("romUmum");
      if (!i.value.trim()) return;
      romSend({ t: "umum", m: i.value.trim() });
      i.value = "";
    };
    el("romUmumB").onclick = umum;
    el<HTMLInputElement>("romUmum").onkeydown = (e) => {
      if (e.key === "Enter") umum();
    };
    romTblWire(b);
  }
}
async function romCubaSertai(kod: string, nama: string): Promise<void> {
  const err = el("romErr");
  nama = nama.trim();
  if (!/^[A-Z0-9]{6}$/.test(kod)) {
    err.textContent = "Kod rombongan ialah 6 huruf/angka.";
    return;
  }
  if (nama.length < 2) {
    err.textContent = "Masukkan nama panggilan (sekurang-kurangnya 2 huruf).";
    return;
  }
  err.textContent = "Menyemak kod…";
  try {
    const r = await fetch(romServer() + "/api/rombongan/" + kod);
    if (r.status === 404) {
      err.textContent = "Rombongan dengan kod ini tidak wujud. Semak semula kod daripada pensyarah.";
      return;
    }
    if (!r.ok) throw new Error(String(r.status));
  } catch {
    err.textContent = "Tidak dapat menghubungi pelayan rombongan. Semak sambungan internet.";
    return;
  }
  err.textContent = "";
  romSertai(kod, nama);
}
async function romCipta(tajuk: string, nama: string): Promise<void> {
  const err = el("romErr");
  nama = nama.trim() || S.name;
  try {
    const r = await fetch(romServer() + "/api/rombongan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tajuk }) });
    const d = (await r.json()) as { kod?: string; kunci?: string; ralat?: string };
    if (!r.ok || !d.kod || !d.kunci) throw new Error(d.ralat ?? String(r.status));
    const s = romSimpanan();
    s.kunci[d.kod] = d.kunci; // kunci ketua kekal dalam peranti ini sahaja
    romSimpan({ kunci: s.kunci });
    romSertai(d.kod, nama);
    toast(`Rombongan dicipta. Kod: ${d.kod}. Kongsi kod atau pautan jemputan kepada pelajar.`, "ok", 9000);
  } catch {
    err.textContent = "Tidak dapat mencipta rombongan. Pelayan rombongan mungkin belum disediakan (lihat docs/ROMBONGAN.md).";
  }
}

function initRombongan(): void {
  el("tRom").addEventListener("click", () => {
    SND.play("tap");
    openRombongan();
  });
  el("bChat").addEventListener("click", () => {
    SND.play("tap");
    romChatToggle();
  });
  el("rcClose").addEventListener("click", () => romChatToggle(false));
  el("rcFrasa").innerHTML = ROM_FRASA.map((f) => `<button type="button">${esc(f)}</button>`).join("");
  el("rcFrasa").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("button");
    if (b) romCakap(b.textContent ?? "");
  });
  el("rcForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const i = el<HTMLInputElement>("rcIn");
    romCakap(i.value);
    i.value = "";
  });
  // live: kemas kini senarai ahli dalam modal setiap 2 s
  window.setInterval(() => {
    if (ROM.modal && ROM.id) romTblPaint();
  }, 2000);
  window.addEventListener("pagehide", () => romPutus(false));
}
// dipanggil selepas permainan bermula: sertai semula atau buka pautan jemputan
function romSelepasMula(): void {
  const q = new URLSearchParams(location.search).get("rombongan");
  const kod = (q ?? "").toUpperCase();
  const s = romSimpanan();
  if (/^[A-Z0-9]{6}$/.test(kod) && kod !== s.kod) {
    // tunggu sehingga tiada modal / paparan lain (kad bab, kuiz) sebelum membuka jemputan
    const cuba = (): void => {
      if (modalOpen || overlayBusy) later(cuba, 600);
      else openRombongan(kod);
    };
    later(cuba, 1500);
    return;
  }
  if (s.kod && s.nama) romSertai(s.kod, s.nama); // muat semula halaman: sambung semula ke rombongan sama
}
