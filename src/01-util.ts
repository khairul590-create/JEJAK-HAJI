// =====================================================================
//  Fail 01: UTILITI — matematik, rawak, DOM, storan, bunyi
// =====================================================================

type Vec = { x: number; y: number };
type Gender = "L" | "P";
type SceneId = "miqat" | "makkah" | "mina" | "arafah" | "muzdalifah";
type Light = "day" | "dusk" | "night";

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const dist = (ax: number, ay: number, bx: number, by: number): number => Math.hypot(ax - bx, ay - by);
const wrapPi = (a: number): number => {
  a = (a + Math.PI) % TAU;
  if (a < 0) a += TAU;
  return a - Math.PI;
};

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = mulberry32(87);
const rr = (a: number, b: number): number => a + (b - a) * rnd();
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}
function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const e = document.getElementById(id);
  if (!e) throw new Error("Elemen #" + id + " tiada");
  return e as T;
}
function later(fn: () => void, ms: number): void {
  window.setTimeout(fn, ms);
}
function esc(s: string): string {
  return s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch] as string));
}

function loadJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function saveJSON(key: string, val: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storan tidak tersedia — abaikan */
  }
}
function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* abaikan */
  }
}

// Warna: cerahkan (amt > 0) atau gelapkan (amt < 0) warna hex
const shadeCache = new Map<string, string>();
function shade(hex: string, amt: number): string {
  const key = hex + amt;
  const hit = shadeCache.get(key);
  if (hit) return hit;
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  if (amt >= 0) {
    r += (255 - r) * amt;
    g += (255 - g) * amt;
    b += (255 - b) * amt;
  } else {
    r *= 1 + amt;
    g *= 1 + amt;
    b *= 1 + amt;
  }
  const out = `rgb(${r | 0},${g | 0},${b | 0})`;
  shadeCache.set(key, out);
  return out;
}

// ---------------------------------------------------------------------
//  BUNYI — disintesis dengan WebAudio (tiada fail audio luar)
// ---------------------------------------------------------------------
type SfxName = "ok" | "lap" | "done" | "err" | "pick" | "throw" | "hit" | "miss" | "ach" | "tap" | "bus";

class Sound {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  amb: GainNode | null = null;
  on = true;
  ambLevel = 0;

  init(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    try {
      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      this.makeAmbience();
    } catch {
      this.ctx = null;
    }
  }

  private makeAmbience(): void {
    if (!this.ctx || !this.master) return;
    const len = this.ctx.sampleRate * 3;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    this.amb = this.ctx.createGain();
    this.amb.gain.value = 0;
    src.connect(lp).connect(this.amb).connect(this.master);
    src.start();
  }

  setAmbience(level: number): void {
    this.ambLevel = level;
    if (!this.ctx || !this.amb) return;
    this.amb.gain.setTargetAtTime(this.on ? level * 0.09 : 0, this.ctx.currentTime, 0.6);
  }

  toggle(): boolean {
    this.on = !this.on;
    this.setAmbience(this.ambLevel);
    return this.on;
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, at = 0, slide = 0): void {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + at;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(this.master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, vol: number, freq: number, at = 0): void {
    if (!this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime + at;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    s.connect(f).connect(g).connect(this.master);
    s.start(t0);
  }

  play(name: SfxName): void {
    if (!this.ctx || !this.on) return;
    switch (name) {
      case "tap":
        this.tone(660, 0.06, "triangle", 0.08);
        break;
      case "ok":
        this.tone(659, 0.14, "triangle", 0.16);
        this.tone(988, 0.22, "triangle", 0.14, 0.09);
        break;
      case "lap":
        this.tone(523, 0.12, "sine", 0.16);
        this.tone(659, 0.12, "sine", 0.16, 0.08);
        this.tone(784, 0.26, "sine", 0.16, 0.16);
        break;
      case "done":
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.3, "triangle", 0.15, i * 0.09));
        break;
      case "ach":
        [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.26, "sine", 0.12, i * 0.07));
        break;
      case "err":
        this.tone(220, 0.22, "sawtooth", 0.07, 0, -60);
        break;
      case "pick":
        this.tone(880, 0.07, "sine", 0.12, 0, 380);
        break;
      case "throw":
        this.noise(0.18, 0.18, 1400);
        break;
      case "hit":
        this.noise(0.09, 0.3, 500);
        this.tone(160, 0.08, "sine", 0.18);
        break;
      case "miss":
        this.noise(0.12, 0.12, 2600);
        break;
      case "bus":
        this.tone(120, 0.5, "sawtooth", 0.05, 0, 40);
        break;
    }
  }
}
const SND = new Sound();
