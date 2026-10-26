// =====================================================================
//  Pelayan ROMBONGAN Jejak Haji — Cloudflare Workers + Durable Objects
//
//  Satu Durable Object bagi setiap rombongan (kod 6 huruf). Pensyarah
//  (ketua) mencipta rombongan, jemaah menyertai dengan kod & nama
//  panggilan. Setiap jemaah menghantar kedudukan ±4 kali sesaat; pelayan
//  menghimpunkannya dan menghantar satu "snapshot" 5 kali sesaat kepada
//  jemaah di lokasi yang sama sahaja (jimat data telefon).
//
//  Laluan:
//    POST /api/rombongan          cipta rombongan → { kod, kunci }
//    GET  /api/rombongan/:kod     semak rombongan wujud → { tajuk, ahli }
//    GET  /ws/:kod                WebSocket (lihat protokol dalam docs/ROMBONGAN.md)
//    selain itu                   fail game (Workers static assets)
// =====================================================================
import { DurableObject } from "cloudflare:workers";

export interface Env {
  ROMBONGAN: DurableObjectNamespace<Rombongan>;
  ASSETS?: Fetcher;
}

const HURUF = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tiada I, O, 0, 1 (mudah dibaca)
const KOD_RE = /^[A-HJ-NP-Z2-9]{6}$/;
const HAD_AHLI = 60;
const TICK_MS = 200; // 5 Hz
const PENUH_MS = 5000; // snapshot penuh setiap 5 s (pulih jika paket hilang)
const HAYAT_MS = 30 * 24 * 3600 * 1000; // rombongan dipadam selepas 30 hari

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...CORS } });
}
function rawak(n: number, abjad = HURUF): string {
  const b = crypto.getRandomValues(new Uint8Array(n));
  let s = "";
  for (const x of b) s += abjad[x % abjad.length];
  return s;
}
function bersih(s: unknown, max: number): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
// tapisan ringkas perkataan kesat (ketua juga boleh senyapkan / keluarkan ahli)
const KESAT = /\b(bodoh|babi|sial|celaka|bangang|pukimak|puki|pantat|lancau|kimak|haram ?jadah|fuck\w*|shit|bitch)\b/gi;
function tapis(s: string): string {
  return s.replace(KESAT, (w) => "*".repeat(w.length));
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const p = url.pathname;
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (p === "/api/rombongan" && req.method === "POST") {
      let body: { tajuk?: string } = {};
      try {
        body = await req.json();
      } catch {
        /* tajuk pilihan */
      }
      const tajuk = bersih(body.tajuk, 60) || "Rombongan Jejak Haji";
      for (let i = 0; i < 6; i++) {
        const kod = rawak(6);
        const stub = env.ROMBONGAN.get(env.ROMBONGAN.idFromName(kod));
        const kunci = await stub.cipta(kod, tajuk);
        if (kunci) return json({ kod, kunci, tajuk });
      }
      return json({ ralat: "Tidak dapat mencipta rombongan. Cuba lagi." }, 503);
    }

    const info = p.match(/^\/api\/rombongan\/([A-Za-z0-9]{6})$/);
    if (info && req.method === "GET") {
      const kod = info[1].toUpperCase();
      if (!KOD_RE.test(kod)) return json({ ralat: "Kod tidak sah." }, 404);
      const r = await env.ROMBONGAN.get(env.ROMBONGAN.idFromName(kod)).maklumat();
      return r ? json(r) : json({ ralat: "Rombongan tidak wujud." }, 404);
    }

    const ws = p.match(/^\/ws\/([A-Za-z0-9]{6})$/);
    if (ws) {
      if (req.headers.get("Upgrade") !== "websocket") return new Response("Perlu WebSocket", { status: 426 });
      const kod = ws[1].toUpperCase();
      if (!KOD_RE.test(kod)) return new Response("Kod tidak sah", { status: 404 });
      return env.ROMBONGAN.get(env.ROMBONGAN.idFromName(kod)).fetch(req);
    }

    if (p.startsWith("/api/") || p.startsWith("/ws/")) return json({ ralat: "Tiada" }, 404);
    if (env.ASSETS) return env.ASSETS.fetch(req);
    return new Response("Jejak Haji: pelayan rombongan", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  },
} satisfies ExportedHandler<Env>;

// ---------------------------------------------------------------------
//  Durable Object: satu rombongan
// ---------------------------------------------------------------------
interface Meta {
  kod: string;
  tajuk: string;
  kunci: string;
  dicipta: number;
}
interface Rupa {
  g: "L" | "P";
  ih: boolean;
  kulit: string;
  baju: string;
  tudung: string;
}
interface Info {
  sc: string; // lokasi
  st: string; // id langkah semasa
  lt: string; // tajuk langkah (untuk panel ketua)
  b: number; // bab
}
interface Ahli {
  id: string;
  nama: string;
  ketua: boolean;
  rupa: Rupa;
  info: Info;
  // kedudukan terkini: [lokasi, x, y, sudut, bendera]
  p: [string, number, number, number, number] | null;
  ubah: boolean; // kedudukan berubah sejak tick lepas
  penuh: boolean; // perlu snapshot penuh (baru masuk / tukar lokasi)
  senyap: boolean;
  tP: number[]; // masa mesej kedudukan (had kadar)
  tC: number; // masa sembang terakhir
}
interface Lampiran {
  id: string;
}
type Mesej = Record<string, unknown> & { t?: string };

export class Rombongan extends DurableObject<Env> {
  meta: Meta | null = null;
  ahli = new Map<string, Ahli>(); // id → ahli (hanya yang bersambung)
  soket = new Map<string, WebSocket>();
  sembang: { id: string; nama: string; m: string; w: number; k?: boolean }[] = [];
  tick: ReturnType<typeof setInterval> | null = null;
  tPenuh = 0;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.meta = (await ctx.storage.get<Meta>("meta")) ?? null;
    });
    // objek mungkin dimuat semula selepas hibernasi: tutup soket lama supaya klien sambung semula
    for (const ws of ctx.getWebSockets()) ws.close(4000, "Pelayan dimulakan semula");
  }

  async cipta(kod: string, tajuk: string): Promise<string | null> {
    if (this.meta) return null; // kod sudah digunakan
    const kunci = rawak(20, "abcdefghijkmnpqrstuvwxyz23456789");
    this.meta = { kod, tajuk, kunci, dicipta: Date.now() };
    await this.ctx.storage.put("meta", this.meta);
    await this.ctx.storage.setAlarm(Date.now() + HAYAT_MS);
    return kunci;
  }
  async maklumat(): Promise<{ kod: string; tajuk: string; ahli: number } | null> {
    if (!this.meta) return null;
    return { kod: this.meta.kod, tajuk: this.meta.tajuk, ahli: this.ahli.size };
  }
  async alarm(): Promise<void> {
    for (const ws of this.ctx.getWebSockets()) ws.close(4001, "Rombongan tamat tempoh");
    await this.ctx.storage.deleteAll();
    this.meta = null;
  }

  async fetch(req: Request): Promise<Response> {
    if (!this.meta) return new Response("Rombongan tidak wujud", { status: 404 });
    const pair = new WebSocketPair();
    const [klien, pelayan] = Object.values(pair);
    this.ctx.acceptWebSocket(pelayan);
    const id = rawak(8, "abcdefghijkmnpqrstuvwxyz23456789");
    pelayan.serializeAttachment({ id } satisfies Lampiran);
    return new Response(null, { status: 101, webSocket: klien });
  }

  idOf(ws: WebSocket): string {
    return (ws.deserializeAttachment() as Lampiran).id;
  }
  hantar(ws: WebSocket | undefined, m: unknown): void {
    if (!ws) return;
    try {
      ws.send(JSON.stringify(m));
    } catch {
      /* soket sudah tertutup */
    }
  }
  siar(m: unknown, kecuali?: string): void {
    const s = JSON.stringify(m);
    for (const [id, ws] of this.soket) {
      if (id === kecuali) continue;
      try {
        ws.send(s);
      } catch {
        /* abai */
      }
    }
  }
  awam(a: Ahli): unknown {
    return { id: a.id, nama: a.nama, ketua: a.ketua, rupa: a.rupa, info: a.info, p: a.p, senyap: a.senyap };
  }

  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer): Promise<void> {
    if (typeof data !== "string" || data.length > 1024) return;
    let m: Mesej;
    try {
      m = JSON.parse(data);
    } catch {
      return;
    }
    const id = this.idOf(ws);
    const a = this.ahli.get(id);
    if (!a) {
      if (m.t === "hai") this.sertai(ws, id, m);
      return;
    }
    const now = Date.now();
    switch (m.t) {
      case "p": {
        // [lokasi, x, y, sudut, bendera]; had 8 mesej sesaat
        a.tP = a.tP.filter((t) => now - t < 1000);
        if (a.tP.length >= 8) return;
        a.tP.push(now);
        const sc = bersih(m.s, 12);
        const x = Number(m.x);
        const y = Number(m.y);
        if (!sc || !Number.isFinite(x) || !Number.isFinite(y)) return;
        if (!a.p || a.p[0] !== sc) a.penuh = true;
        a.p = [sc, Math.round(x), Math.round(y), Math.round(Number(m.a) * 100) / 100 || 0, (Number(m.f) | 0) & 0xff];
        a.ubah = true;
        this.mulaTick();
        return;
      }
      case "i": {
        a.info = { sc: bersih(m.sc, 12), st: bersih(m.st, 24), lt: bersih(m.lt, 60), b: Number(m.b) | 0 };
        if (m.rupa) a.rupa = this.rupa(m.rupa);
        this.siar({ t: "i", id, info: a.info, rupa: a.rupa });
        return;
      }
      case "c": {
        if (a.senyap) return this.hantar(ws, { t: "ralat", m: "Ketua rombongan telah menyenyapkan sembang kamu." });
        if (now - a.tC < 1500) return;
        const teks = tapis(bersih(m.m, 160));
        if (!teks) return;
        a.tC = now;
        const c = { id, nama: a.nama, m: teks, w: now, k: a.ketua || undefined };
        this.sembang.push(c);
        if (this.sembang.length > 40) this.sembang.shift();
        this.siar({ t: "c", ...c });
        return;
      }
      case "kumpul": {
        if (!a.ketua || !a.p) return;
        this.siar({ t: "kumpul", id, nama: a.nama, s: a.p[0], x: a.p[1], y: a.p[2] }, id);
        return;
      }
      case "umum": {
        if (!a.ketua) return;
        const teks = bersih(m.m, 200);
        if (teks) this.siar({ t: "umum", nama: a.nama, m: teks });
        return;
      }
      case "senyap": {
        const b = this.ahli.get(bersih(m.id, 12));
        if (!a.ketua || !b || b.ketua) return;
        b.senyap = !!m.on;
        this.siar({ t: "senyap", id: b.id, on: b.senyap });
        return;
      }
      case "buang": {
        const b = this.ahli.get(bersih(m.id, 12));
        if (!a.ketua || !b || b.ketua) return;
        const bws = this.soket.get(b.id);
        this.hantar(bws, { t: "ralat", m: "Kamu telah dikeluarkan daripada rombongan oleh ketua.", tamat: true });
        bws?.close(4003, "Dikeluarkan");
        this.keluar(b.id);
        return;
      }
    }
  }

  rupa(r: unknown): Rupa {
    const o = (r ?? {}) as Record<string, unknown>;
    const warna = (v: unknown, d: string): string => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : d);
    return { g: o.g === "P" ? "P" : "L", ih: !!o.ih, kulit: warna(o.kulit, "#d9a47c"), baju: warna(o.baju, "#f5f5f0"), tudung: warna(o.tudung, "#ffffff") };
  }

  sertai(ws: WebSocket, id: string, m: Mesej): void {
    const meta = this.meta as Meta;
    if (this.ahli.size >= HAD_AHLI) {
      this.hantar(ws, { t: "ralat", m: `Rombongan penuh (had ${HAD_AHLI} orang).`, tamat: true });
      ws.close(4002, "Penuh");
      return;
    }
    const nama = bersih(tapis(bersih(m.nama, 24)), 24);
    if (nama.length < 2) {
      this.hantar(ws, { t: "ralat", m: "Nama panggilan sekurang-kurangnya 2 huruf.", tamat: true });
      ws.close(4004, "Nama");
      return;
    }
    const ketua = typeof m.kunci === "string" && m.kunci === meta.kunci;
    const a: Ahli = {
      id,
      nama,
      ketua,
      rupa: this.rupa(m.rupa),
      info: { sc: "", st: "", lt: "", b: 0 },
      p: null,
      ubah: false,
      penuh: true,
      senyap: false,
      tP: [],
      tC: 0,
    };
    this.ahli.set(id, a);
    this.soket.set(id, ws);
    this.hantar(ws, {
      t: "selamat",
      id,
      ketua,
      kod: meta.kod,
      tajuk: meta.tajuk,
      ahli: [...this.ahli.values()].filter((x) => x.id !== id).map((x) => this.awam(x)),
      sembang: this.sembang,
    });
    this.siar({ t: "masuk", ahli: this.awam(a) }, id);
    this.mulaTick();
  }

  keluar(id: string): void {
    if (!this.ahli.delete(id)) return;
    this.soket.delete(id);
    this.siar({ t: "keluar", id });
    if (this.ahli.size === 0 && this.tick) {
      clearInterval(this.tick);
      this.tick = null;
    }
  }
  async webSocketClose(ws: WebSocket): Promise<void> {
    this.keluar(this.idOf(ws));
  }
  async webSocketError(ws: WebSocket): Promise<void> {
    this.keluar(this.idOf(ws));
  }

  mulaTick(): void {
    if (this.tick) return;
    this.tick = setInterval(() => this.hantarKedudukan(), TICK_MS);
  }
  // satu mesej kedudukan bagi setiap jemaah: rakan di lokasi yang sama sahaja
  hantarKedudukan(): void {
    const now = Date.now();
    const penuhSemua = now - this.tPenuh > PENUH_MS;
    if (penuhSemua) this.tPenuh = now;
    const ikutLokasi = new Map<string, Ahli[]>();
    for (const a of this.ahli.values()) {
      if (!a.p) continue;
      const l = ikutLokasi.get(a.p[0]);
      if (l) l.push(a);
      else ikutLokasi.set(a.p[0], [a]);
    }
    for (const [sc, list] of ikutLokasi) {
      const ubah = list.filter((a) => a.ubah).map((a) => [a.id, ...(a.p as NonNullable<Ahli["p"]>)]);
      const semua = penuhSemua || list.some((a) => a.penuh) ? list.map((a) => [a.id, ...(a.p as NonNullable<Ahli["p"]>)]) : null;
      for (const a of list) {
        const d = penuhSemua || a.penuh ? semua : ubah;
        if (!d || !d.length) continue;
        this.hantar(this.soket.get(a.id), { t: "pp", s: sc, d, penuh: penuhSemua || a.penuh || undefined });
      }
    }
    for (const a of this.ahli.values()) {
      a.ubah = false;
      a.penuh = false;
    }
  }
}
