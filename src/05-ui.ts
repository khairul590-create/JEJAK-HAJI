// =====================================================================
//  Fail 05: ANTARA MUKA — HUD, toast, kad doa, modal, kuiz, kawalan
// =====================================================================

const ICON: Record<string, string> = {
  book: '<svg viewBox="0 0 24 24"><path d="M3 5.5C5.5 4.5 9 4.5 12 6.5c3-2 6.5-2 9-1V19c-2.5-1-6-1-9 1-3-2-6.5-2-9-1z"/><path d="M12 6.5V20"/></svg>',
  trophy:
    '<svg viewBox="0 0 24 24"><path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4M12 12v3M9 20h6M10 15h4v5h-4z"/></svg>',
  sound: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
  hand: '<svg viewBox="0 0 24 24"><path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V13c0 4-2.5 7-6 7-2.5 0-4-1.2-5.2-3.2L4 13.5a1.5 1.5 0 0 1 2.6-1.5L8 14"/></svg>',
  pray: '<svg viewBox="0 0 24 24"><path d="M7 11V5.5a1.4 1.4 0 0 1 2.8 0V12M17 11V5.5a1.4 1.4 0 0 0-2.8 0V12"/><path d="M9.8 12c0 3-1.8 5-4.3 6.5M14.2 12c0 3 1.8 5 4.3 6.5"/><path d="M4 21h16"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.1"/><circle cx="4.5" cy="12" r="1.1"/><circle cx="4.5" cy="18" r="1.1"/></svg>',
  fast: '<svg viewBox="0 0 24 24"><path d="M5 6l6 6-6 6M12 6l6 6-6 6"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor" stroke="none"/></svg>',
  pebble:
    '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="13.5" rx="8" ry="5.8" fill="currentColor" stroke="none"/><ellipse cx="9.4" cy="11.6" rx="2.6" ry="1.2" fill="#fff" opacity=".4" stroke="none"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.3"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.3"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  bus: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="13" rx="2.5"/><path d="M4 11h16M8 20v-3M16 20v-3"/><circle cx="8" cy="14" r=".8"/><circle cx="16" cy="14" r=".8"/></svg>',
  flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  stone: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="15" rx="7" ry="5"/><path d="M8 7l2 2M12 4v3M16 7l-2 2"/></svg>',
  cut: '<svg viewBox="0 0 24 24"><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="6.5" cy="6.5" r="2.5"/><path d="M8.5 8.2L20 17M8.5 15.8L20 7"/></svg>',
  water: '<svg viewBox="0 0 24 24"><path d="M12 3.5c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 3-6.5 6-10.5z"/></svg>',
  cube: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>',
  square: '<svg viewBox="0 0 24 24"><rect x="4.5" y="4.5" width="15" height="15" rx="2"/><path d="M4.5 12h15M12 4.5v15"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M3.5 6.5l5-2 7 2.5 5-2v13l-5 2-7-2.5-5 2z"/><path d="M8.5 4.5v13M15.5 7v13"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
  cam: '<svg viewBox="0 0 24 24"><path d="M3.5 8.5h3l1.8-2.5h7.4l1.8 2.5h3v10h-17z"/><circle cx="12" cy="13" r="3.4"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.8"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z" fill="currentColor" stroke="none"/></svg>',
  speak: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>',
};
const ic = (name: string): string => ICON[name] ?? "";

// ---------------------------------------------------------------------
//  TETAPAN
// ---------------------------------------------------------------------
interface Settings {
  zoom: number;
  doa: boolean;
  mini: boolean;
  arrow: boolean;
  sound: boolean;
  view3d: boolean;
  hq: boolean;
  suara: boolean;
  tenaga: boolean;
  gyro: boolean;
}
let SET: Settings = {
  zoom: 1,
  doa: true,
  mini: true,
  arrow: true,
  sound: true,
  view3d: false,
  hq: !window.matchMedia("(pointer: coarse)").matches,
  suara: true,
  tenaga: true,
  gyro: false,
};
function loadSettings(): void {
  const s = loadJSON<Partial<Settings>>(CONFIG.settingsKey);
  if (s) SET = { ...SET, ...s };
  SND.on = SET.sound;
}
function saveSettings(): void {
  saveJSON(CONFIG.settingsKey, SET);
}

// ---------------------------------------------------------------------
//  PEMANDU SUARA (Web Speech API — suara bergantung pada peranti)
// ---------------------------------------------------------------------
const VOICE = {
  ok: "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined",
  ms: null as SpeechSynthesisVoice | null,
  ar: null as SpeechSynthesisVoice | null,
  picked: false,
};
function pickVoices(): void {
  if (!VOICE.ok) return;
  const vs = window.speechSynthesis.getVoices();
  if (!vs.length) return;
  const find = (re: RegExp): SpeechSynthesisVoice | null => vs.find((v) => re.test(v.lang.replace("_", "-"))) ?? null;
  // Bahasa Melayu; jika tiada, Bahasa Indonesia paling hampir sebutannya
  VOICE.ms = find(/^ms/i) ?? find(/^id/i);
  VOICE.ar = find(/^ar/i);
  VOICE.picked = true;
}
if (VOICE.ok) {
  pickVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", pickVoices);
}
function speechOn(): boolean {
  return VOICE.ok && SET.suara && SET.sound;
}
function say(text: string, lang: "ms" | "ar" = "ms", flush = false): void {
  if (!speechOn() || !text) return;
  if (!VOICE.picked) pickVoices();
  const u = new SpeechSynthesisUtterance(text.replace(/\n/g, " ").replace(/[→·—]/g, ", "));
  const v = lang === "ar" ? VOICE.ar : VOICE.ms;
  if (v) u.voice = v;
  u.lang = v ? v.lang : lang === "ar" ? "ar-SA" : "ms-MY";
  u.rate = lang === "ar" ? 0.85 : 1;
  if (flush) window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
function hush(): void {
  if (VOICE.ok) window.speechSynthesis.cancel();
}
function sayDoa(d: Doa, flush = true): void {
  if (VOICE.ar) say(d.ar, "ar", flush);
  else say(d.rumi, "ms", flush);
  say("Maksudnya: " + d.makna);
}

// ---------------------------------------------------------------------
//  TOAST
// ---------------------------------------------------------------------
type ToastKind = "info" | "ok" | "warn" | "bad" | "ach" | "ch";
let lastToast = { text: "", t: 0 };
function toast(text: string, kind: ToastKind = "info", ms = 4800): void {
  const now = performance.now();
  if (text === lastToast.text && now - lastToast.t < 2500) return;
  lastToast = { text, t: now };
  const wrap = el("toasts");
  const d = document.createElement("div");
  d.className = "toast " + kind;
  const icn = { info: "info", ok: "check", warn: "alert", bad: "alert", ach: "trophy", ch: "flag" }[kind];
  d.innerHTML = ic(icn) + "<span>" + esc(text) + "</span>";
  wrap.appendChild(d);
  while (wrap.children.length > 3) wrap.removeChild(wrap.firstElementChild as Element);
  later(() => {
    d.classList.add("out");
    later(() => d.remove(), 340);
  }, ms);
}
function banner(ch: Chapter): void {
  toast(`Bab ${ch.n} · ${ch.title} — ${ch.date}`, "ch", 6000);
}

// ---------------------------------------------------------------------
//  KAD DOA
// ---------------------------------------------------------------------
let doaTimer = 0;
function showDoa(key: string, auto = false): void {
  if (auto && !SET.doa) return;
  const d = DOA[key];
  if (!d) return;
  el("doaT").textContent = d.title;
  el("doaAr").textContent = d.ar;
  el("doaRumi").textContent = d.rumi;
  el("doaMk").innerHTML = "<b>Maksudnya:</b> " + esc(d.makna);
  const src = el("doaSrc");
  src.textContent = d.src ?? "";
  src.hidden = !d.src;
  const box = el("doa");
  box.hidden = false;
  box.classList.remove("in");
  void box.offsetWidth;
  box.classList.add("in");
  window.clearTimeout(doaTimer);
  doaTimer = window.setTimeout(hideDoa, 11000);
  curDoa = key;
  sayDoa(d, false);
}
let curDoa = "";
function hideDoa(): void {
  el("doa").hidden = true;
}

// ---------------------------------------------------------------------
//  MODAL
// ---------------------------------------------------------------------
interface ModalBtn {
  label: string;
  kind?: "primary" | "gold" | "ghost";
  onClick?: () => void;
  keep?: boolean;
}
interface ModalOpts {
  kicker?: string;
  title: string;
  html: string;
  buttons?: ModalBtn[];
  onClose?: () => void;
  dismissable?: boolean;
  cls?: string;
}
let modalOpen = false;
let modalOnClose: (() => void) | null = null;
let modalDismiss = true;

function openModal(o: ModalOpts): void {
  modalOpen = true;
  modalOnClose = o.onClose ?? null;
  modalDismiss = o.dismissable !== false;
  el("shKick").textContent = o.kicker ?? "";
  el("shTitle").textContent = o.title;
  el("shBody").innerHTML = o.html;
  el("shBody").scrollTop = 0;
  el("sheet").className = "sheet" + (o.cls ? " " + o.cls : "");
  setModalButtons(o.buttons ?? [{ label: "Tutup", kind: "primary" }]);
  el("modal").hidden = false;
  hideDoa();
}
function setModalButtons(btns: ModalBtn[]): void {
  const w = el("shBtns");
  w.innerHTML = "";
  w.hidden = btns.length === 0;
  for (const b of btns) {
    const bt = document.createElement("button");
    bt.className = "btn " + (b.kind ?? "primary");
    bt.textContent = b.label;
    bt.onclick = () => {
      SND.play("tap");
      if (!b.keep) closeModal();
      b.onClick?.();
    };
    w.appendChild(bt);
  }
  const first = w.querySelector("button");
  if (first) later(() => (first as HTMLButtonElement).focus({ preventScroll: true }), 30);
}
function closeModal(): void {
  if (!modalOpen) return;
  modalOpen = false;
  el("modal").hidden = true;
  const f = modalOnClose;
  modalOnClose = null;
  f?.();
}

function openReading(key: string, after?: () => void): void {
  const r = READ[key];
  if (!r) return;
  openModal({ kicker: r.kicker, title: r.title, html: r.html, buttons: [{ label: "Faham", kind: "primary" }], onClose: after });
}

interface ChoiceOpt {
  label: string;
  ar?: string;
  sub?: string;
  ok: boolean;
  why: string;
}
function openChoice(kicker: string, title: string, intro: string, opts: ChoiceOpt[], onDone: (i: number) => void): void {
  const html =
    intro +
    '<div class="opts">' +
    opts
      .map(
        (o, i) =>
          `<button class="opt" data-i="${i}">${o.ar ? `<span class="ar" lang="ar" dir="rtl">${o.ar}</span>` : ""}<span>${esc(o.label)}</span>${
            o.sub ? `<small>${esc(o.sub)}</small>` : ""
          }</button>`
      )
      .join("") +
    '</div><div class="fb" id="chFb" hidden></div>';
  openModal({ kicker, title, html, buttons: [], dismissable: false });
  const body = el("shBody");
  const buttons = Array.from(body.querySelectorAll<HTMLButtonElement>(".opt"));
  for (const b of buttons) {
    b.onclick = () => {
      const i = Number(b.dataset.i);
      const o = opts[i];
      const fb = el("chFb");
      fb.hidden = false;
      buttons.forEach((x) => x.classList.remove("wrong"));
      fb.textContent = o.why;
      if (o.ok) {
        b.classList.add("right");
        fb.className = "fb ok";
        buttons.forEach((x) => (x.disabled = true));
        SND.play("ok");
        setModalButtons([{ label: "Teruskan", kind: "primary", onClick: () => onDone(i) }]);
      } else {
        b.classList.add("wrong");
        fb.className = "fb bad";
        SND.play("err");
      }
      fb.scrollIntoView({ block: "nearest" });
    };
  }
}

// ---------------------------------------------------------------------
//  KUIZ
// ---------------------------------------------------------------------
function openQuiz(kind: "umrah" | "final"): void {
  if (modalOpen) {
    later(() => openQuiz(kind), 800);
    return;
  }
  const qs = kind === "umrah" ? QUIZ_UMRAH : QUIZ_FINAL;
  const title = kind === "umrah" ? "Uji kefahaman: rukun umrah" : "Uji kefahaman: rukun & wajib haji";
  let i = 0;
  let score = 0;
  const show = (): void => {
    const q = qs[i];
    openModal({
      kicker: `Soalan ${i + 1} daripada ${qs.length}`,
      title,
      html:
        `<div class="qbar"><i style="width:${(i / qs.length) * 100}%"></i></div><p class="q">${esc(q.q)}</p><div class="opts">` +
        q.opts.map((o, k) => `<button class="opt" data-k="${k}"><span>${esc(o)}</span></button>`).join("") +
        '</div><div class="fb" id="qFb" hidden></div>',
      buttons: [],
      dismissable: false,
    });
    const body = el("shBody");
    const btns = Array.from(body.querySelectorAll<HTMLButtonElement>(".opt"));
    let answered = false;
    for (const b of btns) {
      b.onclick = () => {
        if (answered) return;
        answered = true;
        const k = Number(b.dataset.k);
        const fb = el("qFb");
        fb.hidden = false;
        btns.forEach((x) => (x.disabled = true));
        btns[q.ans].classList.add("right");
        if (k === q.ans) {
          score++;
          S.stars += 5;
          fb.className = "fb ok";
          fb.textContent = "Betul! " + q.why;
          SND.play("ok");
        } else {
          b.classList.add("wrong");
          fb.className = "fb bad";
          fb.textContent = "Belum tepat. " + q.why;
          SND.play("err");
        }
        fb.scrollIntoView({ block: "nearest" });
        setModalButtons([
          {
            label: i + 1 < qs.length ? "Soalan seterusnya" : "Lihat keputusan",
            kind: "primary",
            onClick: () => {
              i++;
              if (i < qs.length) show();
              else end();
            },
          },
        ]);
      };
    }
  };
  const end = (): void => {
    const pass = score >= Math.ceil(qs.length * 0.6);
    openModal({
      kicker: "Keputusan kuiz",
      title: `${score} / ${qs.length} betul`,
      html: `<p>${
        pass
          ? "Tahniah! Kefahaman kamu baik. Teruskan perjalanan."
          : "Baca semula penerangan bab ini untuk mengukuhkan kefahaman. Kamu boleh mencuba lagi."
      }</p><p class="muted">Setiap jawapan betul memberi 5 bintang.</p>`,
      dismissable: false,
      buttons: pass
        ? [{ label: "Teruskan", kind: "primary", onClick: () => onQuizDone(kind, score, qs.length) }]
        : [
            { label: "Cuba lagi", kind: "primary", onClick: () => openQuiz(kind) },
            { label: "Teruskan juga", kind: "ghost", onClick: () => onQuizDone(kind, score, qs.length) },
          ],
    });
  };
  show();
}

// ---------------------------------------------------------------------
//  LAPISAN PERALIHAN (fade & bas)
// ---------------------------------------------------------------------
let overlayBusy = false;
function fadeDo(title: string, sub: string, mid: () => void, end?: () => void, hold = 1300): void {
  overlayBusy = true;
  const f = el("fade");
  el("fadeT").textContent = title;
  el("fadeS").textContent = sub;
  f.hidden = false;
  requestAnimationFrame(() => f.classList.add("show"));
  later(mid, 560);
  later(() => {
    f.classList.remove("show");
    later(() => {
      f.hidden = true;
      overlayBusy = false;
      end?.();
    }, 520);
  }, 560 + hold);
}
function showTravel(from: string, to: string, tip: string, mid: () => void, end: () => void): void {
  overlayBusy = true;
  const t = el("travel");
  el("trFrom").textContent = from;
  el("trTo").textContent = to;
  el("trTip").textContent = tip;
  const bus = el("trBus");
  bus.classList.remove("go");
  t.hidden = false;
  void bus.offsetWidth;
  bus.classList.add("go");
  requestAnimationFrame(() => t.classList.add("show"));
  later(mid, 900);
  later(() => {
    t.classList.remove("show");
    later(() => {
      t.hidden = true;
      overlayBusy = false;
      end();
    }, 450);
  }, 2700);
}

// ---------------------------------------------------------------------
//  INPUT: papan kekunci & kayu bedik
// ---------------------------------------------------------------------
const KEYS = new Set<string>();
let shiftHeld = false;
let runToggle = false;
const JOY = { active: false, id: -1, x: 0, y: 0 };

function getInput(): Vec {
  if (JOY.active) return { x: JOY.x, y: JOY.y };
  let x = 0;
  let y = 0;
  if (KEYS.has("KeyA") || KEYS.has("ArrowLeft")) x -= 1;
  if (KEYS.has("KeyD") || KEYS.has("ArrowRight")) x += 1;
  if (KEYS.has("KeyW") || KEYS.has("ArrowUp")) y -= 1;
  if (KEYS.has("KeyS") || KEYS.has("ArrowDown")) y += 1;
  const m = Math.hypot(x, y);
  return m > 1 ? { x: x / m, y: y / m } : { x, y };
}

function typingInField(): boolean {
  const a = document.activeElement;
  if (!a) return false;
  if (a.tagName === "TEXTAREA") return true;
  // kotak semak & gelangsar dalam Tetapan tidak menghalang kekunci Escape
  return a.tagName === "INPUT" && !["checkbox", "radio", "range", "button"].includes((a as HTMLInputElement).type);
}

function initInput(): void {
  window.addEventListener("keydown", (e) => {
    if (typingInField()) return;
    if (modalOpen) {
      if (e.code === "Escape" && modalDismiss) closeModal();
      return;
    }
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") shiftHeld = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyE" || e.code === "Space" || e.code === "Enter") {
      if (!e.repeat) doInteract();
      return;
    }
    if (e.code === "Equal" || e.code === "NumpadAdd") zoomIn();
    if (e.code === "Minus" || e.code === "NumpadSubtract") zoomOut();
    if (e.code === "KeyM") toggleMission();
    if (e.code === "KeyF" && !e.repeat) actMinum();
    if (e.code === "KeyC") cycleCam();
    if (e.code === "KeyV") void set3D(!R3.active);
    KEYS.add(e.code);
  });
  window.addEventListener("keyup", (e) => {
    KEYS.delete(e.code);
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") shiftHeld = false;
  });
  window.addEventListener("blur", () => {
    KEYS.clear();
    shiftHeld = false;
    JOY.active = false;
    el("knob").style.transform = "";
  });

  const joy = el("joy");
  const knob = el("knob");
  const setJoy = (e: PointerEvent): void => {
    const r = joy.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const max = r.width * 0.38;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const m = Math.hypot(dx, dy);
    if (m > max) {
      dx = (dx / m) * max;
      dy = (dy / m) * max;
    }
    JOY.x = dx / max;
    JOY.y = dy / max;
    if (Math.hypot(JOY.x, JOY.y) < 0.12) {
      JOY.x = 0;
      JOY.y = 0;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  joy.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    SND.init();
    JOY.active = true;
    JOY.id = e.pointerId;
    joy.setPointerCapture(e.pointerId);
    setJoy(e);
  });
  joy.addEventListener("pointermove", (e) => {
    if (JOY.active && e.pointerId === JOY.id) setJoy(e);
  });
  const endJoy = (e: PointerEvent): void => {
    if (e.pointerId !== JOY.id) return;
    JOY.active = false;
    JOY.x = 0;
    JOY.y = 0;
    knob.style.transform = "";
  };
  joy.addEventListener("pointerup", endJoy);
  joy.addEventListener("pointercancel", endJoy);

  el("world").addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (R3.active) zoom3D(e.deltaY < 0 ? 1.08 : 1 / 1.08);
      else zoomBy(e.deltaY < 0 ? 1.08 : 1 / 1.08);
    },
    { passive: false }
  );

  el("bAct").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    SND.init();
    doInteract();
  });
  el("bRun").addEventListener("click", () => {
    runToggle = !runToggle;
    el("bRun").setAttribute("aria-pressed", String(runToggle));
    SND.play("tap");
  });
  el("bMisi").addEventListener("click", () => toggleMission());
  el("mClose").addEventListener("click", () => toggleMission(false));
  el("mRead").addEventListener("click", () => {
    const f = curFlat();
    openReading(CHAPTERS[(f ? f.task.ch : 8) - 1].read);
  });
  el("mAll").addEventListener("click", openAllChapters);
  el("tGuide").addEventListener("click", openGuide);
  el("t3d").addEventListener("click", () => {
    SND.init();
    void set3D(!R3.active);
  });
  el("tMap").addEventListener("click", () => openMap("haji"));
  el("mini").addEventListener("click", () => openMap("lokasi"));
  el("bCam").addEventListener("click", () => {
    SND.play("tap");
    cycleCam();
  });
  const holdZoom = (id: string, f: () => void): void => {
    const b = el(id);
    let iv = 0;
    const stop = (): void => window.clearInterval(iv);
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      f();
      stop();
      iv = window.setInterval(f, 110);
    });
    b.addEventListener("pointerup", stop);
    b.addEventListener("pointerleave", stop);
    b.addEventListener("pointercancel", stop);
  };
  holdZoom("bZin", zoomIn);
  holdZoom("bZout", zoomOut);
  initDrag3D();
  el("tAch").addEventListener("click", openAch);
  el("tSet").addEventListener("click", openSettings);
  el("tAudio").addEventListener("click", () => {
    SND.init();
    SET.sound = SND.toggle();
    saveSettings();
    paintAudio();
    if (SET.sound) SND.play("tap");
  });
  el("doaX").addEventListener("click", () => {
    hideDoa();
    hush();
  });
  el("doaPlay").addEventListener("click", () => {
    const d = DOA[curDoa];
    if (!d) return;
    if (!speechOn()) {
      toast(VOICE.ok ? "Hidupkan Bunyi dan Pemandu suara dalam Tetapan untuk mendengar doa." : "Pelayar ini tidak menyokong pemandu suara.", "info", 4000);
      return;
    }
    sayDoa(d);
  });
  el("bMinum").addEventListener("click", () => {
    SND.init();
    actMinum();
  });
  el("modal").addEventListener("click", (e) => {
    if (e.target === el("modal") && modalDismiss) closeModal();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      KEYS.clear();
      JOY.active = false;
      if (started) saveGame();
    }
  });
}

function paintAudio(): void {
  const b = el("tAudio");
  b.innerHTML = ic(SET.sound ? "sound" : "mute") + "<span>Audio</span>";
  b.setAttribute("aria-pressed", String(SET.sound));
}

function paintViewControls(): void {
  const b = el("t3d");
  b.innerHTML = ic(R3.active ? "square" : "cube") + `<span>${R3.active ? "Paparan 2D" : "Paparan 3D"}</span>`;
  b.setAttribute("aria-pressed", String(R3.active));
  const cam = el("bCam");
  cam.hidden = !R3.active;
  cam.innerHTML = ic(C3.mode === "eye" ? "eye" : "cam") + `<span>${CAM_NAMES[C3.mode]}</span>`;
  el("keyhint").textContent = R3.active
    ? "WASD / kayu bedik: jalan · seret skrin: pusing kamera · Q/R: pusing · roda atau + −: zum · C: kamera · E: interaksi"
    : "WASD / anak panah: jalan · Shift: laju · E / Space: interaksi · F: minum · roda tetikus atau + −: zum · V: 3D";
}

function toggleMission(force?: boolean): void {
  const m = el("mission");
  const open = force ?? !m.classList.contains("open");
  m.classList.toggle("open", open);
}

// ---------------------------------------------------------------------
//  HUD
// ---------------------------------------------------------------------
let actState = "";
function setAct(kind: "none" | "on" | "lock", label: string, icon: string): void {
  const key = kind + label + icon;
  if (key === actState) return;
  actState = key;
  const b = el("bAct");
  b.className = "act" + (kind === "on" ? " on" : kind === "lock" ? " lock" : "");
  b.innerHTML = ic(icon) + `<span>${esc(label).replace(/\n/g, "<br>")}</span>`;
}

let lastHud = "";
function refreshHUD(): void {
  const f = curFlat();
  const total = TASKS.length;
  const doneTasks = f ? f.ti : total;
  el("pName").textContent = S.name;
  el("pTask").textContent = f ? `Tugasan ${f.ti + 1}/${total}` : `Selesai ${total}/${total}`;
  (el("pBar") as HTMLElement).style.width = `${(doneTasks / total) * 100}%`;
  el("cStars").textContent = String(S.stars);
  el("cPebbles").textContent = String(S.pebbles);
  if (SET.tenaga) {
    const en = Math.round(S.tenaga);
    el("cEn").textContent = String(en);
    el("cAir").textContent = String(S.air);
    const n = el("bAirN");
    n.textContent = String(S.air);
    n.className = "sb-n" + (S.air <= 0 ? " empty" : "");
    el("chipEn").className = "chip en" + (en < 15 ? " bad" : en < 35 ? " low" : "");
  }

  let date = "Selesai — semoga diterima Allah";
  let title = "Semua tugasan selesai";
  let count = "";
  let pct = 1;
  let sub = "Terokai semula Masjidil Haram, atau mula semula dari Tetapan.";
  let tag: { text: string; bad: boolean } | null = null;
  if (f) {
    const ch = CHAPTERS[f.task.ch - 1];
    date = (f.step.date ?? ch.date) + (f.step.time ? " · " + f.step.time : "");
    const c = f.step.counter ? f.step.counter() : null;
    if (c) {
      title = c.title;
      count = c.unit ? `${c.cur}${c.unit}` : `${c.cur}<small>/${c.max}</small>`;
      pct = c.pct ?? c.cur / c.max;
      sub = c.sub ?? f.step.text;
      tag = c.tag ?? null;
    } else {
      title = f.task.title;
      const idx = f.task.steps.indexOf(f.step);
      pct = f.task.steps.length > 1 ? idx / f.task.steps.length : -1;
      sub = f.step.text;
    }
  }
  const key = [date, title, count, Math.round(pct * 200), sub, tag?.text, tag?.bad].join("|");
  if (key === lastHud) return;
  lastHud = key;
  el("datePill").textContent = date;
  el("pcTitle").textContent = title;
  const cnt = el("pcCount");
  cnt.innerHTML = count;
  cnt.hidden = !count;
  const bar = el("pcBarWrap");
  bar.hidden = pct < 0;
  (el("pcFill") as HTMLElement).style.width = `${clamp(pct, 0, 1) * 100}%`;
  el("pcSub").textContent = sub;
  const tg = el("pcTag");
  tg.hidden = !tag;
  if (tag) {
    tg.textContent = tag.text;
    tg.className = "pc-tag" + (tag.bad ? " bad" : "");
  }
}

function renderMission(): void {
  const f = curFlat();
  const chN = f ? f.task.ch : 8;
  const ch = CHAPTERS[chN - 1];
  el("mNum").textContent = String(ch.n);
  el("mTitle").textContent = ch.title;
  el("mDate").textContent = ch.date;
  const list = el("mList");
  list.innerHTML = "";
  let k = 0;
  TASKS.forEach((t, ti) => {
    if (t.ch !== chN) return;
    k++;
    const li = document.createElement("li");
    const state = !f || ti < f.ti ? "done" : ti === f.ti ? "now" : "";
    li.className = state;
    li.innerHTML = `<span class="b">${state === "done" ? ic("check") : k}</span><span>${esc(t.title)}</span>`;
    list.appendChild(li);
  });
  el("mNow").textContent = f ? f.step.text : "Semua tugasan telah selesai. Alhamdulillah.";
}

// ---------------------------------------------------------------------
//  MENU: Panduan, Pencapaian, Tetapan, Semua bab
// ---------------------------------------------------------------------
function openGuide(): void {
  openModal({
    kicker: "Panduan bermain",
    title: "Cara bermain Jejak Haji",
    html: `<ul class="guide">
<li><b>Bergerak:</b> kayu bedik di kiri bawah, atau kekunci WASD / anak panah.</li>
<li><b>Laju:</b> tekan butang Laju atau tahan Shift. Gunakan untuk ramal dan berlari-lari anak di lampu hijau (sunat bagi lelaki).</li>
<li><b>Interaksi:</b> butang bulat di kanan bawah (atau E / Space). Butang menyala keemasan apabila ada tindakan yang boleh dilakukan.</li>
<li><b>Anak panah kuning</b> di sekeliling watak menunjukkan arah sasaran seterusnya berserta jaraknya.</li>
<li><b>Tawaf:</b> mula di garisan Hajarul Aswad, berjalan berlawanan arah jam dengan Kaabah di kiri, kekal di lantai putih dan elakkan Hijir Ismail.</li>
<li><b>Saie:</b> mula di Bukit Safa, 7 perjalanan, berakhir di Bukit Marwah.</li>
<li><b>Melontar:</b> dekati takungan jamrah dan tekan LONTAR. Semakin dekat, semakin tepat.</li>
<li><b>Zum:</b> butang + dan − di kanan bawah, roda tetikus, cubit dua jari (3D), atau kekunci + dan −.</li>
<li><b>Paparan 3D:</b> tekan butang 3D di atas. Seret skrin untuk memusing kamera. Butang Kamera menukar pandangan: <i>Belakang</i>, <i>Mata</i> (seperti berjalan sendiri di mataf) dan <i>Atas</i>.</li>
<li><b>Peta:</b> butang Peta menunjukkan laluan haji dan jaraknya. Ketik peta mini untuk peta lokasi yang lebih besar.</li>
<li><b>Tenaga & air:</b> meter tenaga di atas berkurang apabila berjalan, terutama semasa panas. Berdiri diam untuk berehat, atau tekan <b>Minum</b> (kekunci F).</li>
<li><b>Pemandu suara:</b> arahan dan doa dibacakan secara automatik. Tekan butang <b>Dengar</b> pada kad doa untuk mendengar semula. Matikan dalam Tetapan.</li>
</ul>
<p class="gsub">Panduan jemaah</p>
<div class="set-row"><button type="button" class="btn ghost" id="gKes">Kesilapan lazim</button><button type="button" class="btn ghost" id="gSes">Jika terpisah</button><button type="button" class="btn ghost" id="gSih">Tenaga & kesihatan</button></div>
<p class="muted">Kemajuan disimpan secara automatik dalam pelayar ini.</p>`,
    buttons: [
      { label: "Rujukan", kind: "ghost", onClick: openRefs },
      {
        label: "Baca penerangan bab ini",
        kind: "ghost",
        onClick: () => {
          const f = curFlat();
          openReading(CHAPTERS[(f ? f.task.ch : 8) - 1].read);
        },
      },
      { label: "Tutup", kind: "primary" },
    ],
  });
  el("gKes").onclick = () => openReading("kesilapan");
  el("gSes").onclick = () => openReading("sesat");
  el("gSih").onclick = () => openReading("kesihatan");
}

function openAch(): void {
  const rows = ACH_LIST.map((a) => {
    const got = S.ach.includes(a.id);
    const na = a.only === "L" && S.gender === "P";
    return `<li class="${got ? "got" : ""} ${na ? "na" : ""}"><span class="ach-i">${ic(got ? "trophy" : "star")}</span><div><b>${esc(a.t)}</b><span>${esc(
      a.d
    )}${na ? " (khusus lelaki)" : ""}</span></div></li>`;
  }).join("");
  const n = S.ach.length;
  openModal({
    kicker: "Pencapaian",
    title: `${n} daripada ${achTotal()} dibuka`,
    html: `<p class="muted">Pencapaian diberi untuk amalan sunat dan adab yang baik. Jumlah bintang: <b>${S.stars}</b>.</p><ul class="achs">${rows}</ul>`,
  });
}

function openAllChapters(): void {
  const f = curFlat();
  const html = CHAPTERS.map((ch) => {
    const items = TASKS.map((t, ti) => ({ t, ti }))
      .filter((x) => x.t.ch === ch.n)
      .map(({ t, ti }) => {
        const st = !f || ti < f.ti ? "done" : ti === f.ti ? "now" : "";
        return `<li class="${st}">${st === "done" ? ic("check") : ic("star")}<span>${esc(t.title)}</span></li>`;
      })
      .join("");
    return `<section class="chap"><h3><span>${ch.n}</span>${esc(ch.title)}<small>${esc(ch.date)}</small></h3><ul>${items}</ul></section>`;
  }).join("");
  openModal({ kicker: "Peta perjalanan", title: "Semua bab haji Tamattu'", html: `<div class="chaps">${html}</div>`, cls: "wide" });
}

function openSettings(): void {
  openModal({
    kicker: "Tetapan",
    title: "Tetapan permainan",
    html: `<div class="set">
<label for="setZoom">Zum kamera <output id="zOut">${Math.round(SET.zoom * 100)}%</output></label>
<input type="range" id="setZoom" min="0.6" max="1.7" step="0.05" value="${SET.zoom}">
<label class="tg"><input type="checkbox" id="setDoa" ${SET.doa ? "checked" : ""}> Papar kad doa secara automatik</label>
<label class="tg"><input type="checkbox" id="setMini" ${SET.mini ? "checked" : ""}> Papar peta mini</label>
<label class="tg"><input type="checkbox" id="setArrow" ${SET.arrow ? "checked" : ""}> Papar anak panah sasaran</label>
<label class="tg"><input type="checkbox" id="setHq" ${SET.hq ? "checked" : ""}> Bayang-bayang 3D (matikan jika telefon perlahan)</label>
<label class="tg"><input type="checkbox" id="setSnd" ${SET.sound ? "checked" : ""}> Bunyi</label>
${VOICE.ok ? `<label class="tg"><input type="checkbox" id="setSuara" ${SET.suara ? "checked" : ""}> Pemandu suara (baca arahan & doa)</label>` : ""}
<label class="tg"><input type="checkbox" id="setTenaga" ${SET.tenaga ? "checked" : ""}> Tenaga & air (letih apabila berjalan dalam panas)</label>
${GYRO.ok ? `<label class="tg"><input type="checkbox" id="setGyro" ${SET.gyro ? "checked" : ""}> Giroskop: gerakkan telefon untuk memandang (kamera Mata 3D)</label>` : ""}
<div class="set-row"><button type="button" class="btn ghost" id="setAch">Pencapaian</button><button type="button" class="btn ghost" id="setRefs">Rujukan</button></div>
<div class="danger"><button type="button" class="btn ghost" id="setReset">Mula semula dari awal</button>
<div id="setConfirm" hidden><p>Semua kemajuan, bintang dan pencapaian akan dipadam.</p><button type="button" class="btn bad" id="setYes">Ya, padam dan mula semula</button></div></div>
</div>`,
  });
  const z = el<HTMLInputElement>("setZoom");
  z.oninput = () => {
    SET.zoom = Number(z.value);
    el("zOut").textContent = Math.round(SET.zoom * 100) + "%";
    saveSettings();
  };
  el<HTMLInputElement>("setDoa").onchange = (e) => {
    SET.doa = (e.target as HTMLInputElement).checked;
    saveSettings();
  };
  el<HTMLInputElement>("setMini").onchange = (e) => {
    SET.mini = (e.target as HTMLInputElement).checked;
    saveSettings();
    applyMiniSetting();
  };
  el<HTMLInputElement>("setArrow").onchange = (e) => {
    SET.arrow = (e.target as HTMLInputElement).checked;
    saveSettings();
  };
  el<HTMLInputElement>("setHq").onchange = (e) => {
    SET.hq = (e.target as HTMLInputElement).checked;
    saveSettings();
  };
  el<HTMLInputElement>("setSnd").onchange = (e) => {
    SND.init();
    if ((e.target as HTMLInputElement).checked !== SND.on) SND.toggle();
    SET.sound = SND.on;
    saveSettings();
    paintAudio();
  };
  if (VOICE.ok)
    el<HTMLInputElement>("setSuara").onchange = (e) => {
      SET.suara = (e.target as HTMLInputElement).checked;
      saveSettings();
      if (SET.suara) say("Pemandu suara dihidupkan.", "ms", true);
      else hush();
    };
  el<HTMLInputElement>("setTenaga").onchange = (e) => {
    SET.tenaga = (e.target as HTMLInputElement).checked;
    saveSettings();
    applyTenagaSetting();
  };
  if (GYRO.ok)
    el<HTMLInputElement>("setGyro").onchange = (e) => {
      const box = e.target as HTMLInputElement;
      void setGyro(box.checked).then((on) => {
        box.checked = on;
      });
    };
  el("setAch").onclick = () => openAch();
  el("setRefs").onclick = () => openRefs();
  el("setReset").onclick = () => {
    el("setConfirm").hidden = false;
  };
  el("setYes").onclick = () => {
    closeModal();
    resetGame();
  };
}
function applyMiniSetting(): void {
  el("minimap").hidden = !SET.mini;
}
function applyTenagaSetting(): void {
  el("chipEn").hidden = !SET.tenaga;
  el("bMinum").hidden = !SET.tenaga;
}

function zoomBy(f: number): void {
  SET.zoom = clamp(SET.zoom * f, 0.6, 1.7);
  saveSettings();
}

// ---------------------------------------------------------------------
//  PETA & RUJUKAN
// ---------------------------------------------------------------------
function journeySVG(): string {
  const here = scene ? scene.id : "miqat";
  const doneIdx = curFlat() ? S.step : ALL_STEPS.length;
  const stepIndex = (id: string): number => ALL_STEPS.findIndex((f) => f.step.id === id);
  const node = (id: string): MapNode => JOURNEY_NODES.find((n) => n.id === id) as MapNode;
  const legs = JOURNEY_LEGS.map((l) => {
    const a = node(l.from);
    const b = node(l.to);
    const si = stepIndex(l.step);
    const done = si >= 0 && si < doneIdx;
    const lx = 0.25 * a.x + 0.5 * l.cx + 0.25 * b.x;
    const ly = 0.25 * a.y + 0.5 * l.cy + 0.25 * b.y;
    const tw = l.km.length * 1.9 + 4;
    return `<path d="M${a.x} ${a.y} Q${l.cx} ${l.cy} ${b.x} ${b.y}" class="leg ${done ? "done" : ""} ${l.from === "miqat" ? "long" : ""}"/>
<g class="kmtag" transform="translate(${lx} ${ly})"><rect x="${-tw / 2}" y="-3.2" width="${tw}" height="6.4" rx="3.2"/><text y="1.1">${l.km}</text></g>`;
  }).join("");
  const nodes = JOURNEY_NODES.map(
    (n) =>
      `<g class="node ${n.id === here ? "here" : ""}" transform="translate(${n.x} ${n.y})"><circle r="${n.id === here ? 3.2 : 2.3}"/><text y="${n.below ? 7.6 : -4.4}">${esc(n.name)}</text></g>`
  ).join("");
  return `<svg class="jmap" viewBox="0 0 160 94" role="img" aria-label="Peta laluan haji dari Madinah ke Makkah, Mina, Arafah dan Muzdalifah"><rect x="0" y="0" width="160" height="94" rx="4" class="bg"/>
<path d="M0 36 Q50 46 90 36 T160 42" class="ridge"/><path d="M40 94 Q80 86 110 92 T160 90" class="ridge"/>
<text x="4" y="90" class="ns">Skematik · tidak mengikut skala</text>${legs}${nodes}</svg>`;
}

function journeyTable(): string {
  return `<table class="jt"><thead><tr><th>Laluan</th><th>Jarak</th><th>Bila</th></tr></thead><tbody>${JOURNEY_LEGS.map((l) => {
    const a = JOURNEY_NODES.find((n) => n.id === l.from) as MapNode;
    const b = JOURNEY_NODES.find((n) => n.id === l.to) as MapNode;
    return `<tr><td>${esc(a.name)} → ${esc(b.name)}</td><td class="num">${l.km}</td><td>${esc(l.when)}</td></tr>`;
  }).join("")}</tbody></table>`;
}

function sceneMapCanvas(cv: HTMLCanvasElement): void {
  const r = cv.getBoundingClientRect();
  const w = Math.max(200, Math.round(r.width));
  const b = scene.bounds;
  const h = Math.round((w * (b.y1 - b.y0)) / (b.x1 - b.x0));
  cv.style.height = h + "px";
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  const s = w / (b.x1 - b.x0);
  c.setTransform(dpr * s, 0, 0, dpr * s, -b.x0 * s * dpr, -b.y0 * s * dpr);
  scene.mini(c);
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.textAlign = "center";
  c.textBaseline = "middle";
  for (const L of scene.labels) {
    if (L.kind === "small") continue;
    const x = ((L.x3 ?? L.x) - b.x0) * s;
    const y = ((L.y3 ?? L.y) - b.y0) * s;
    c.font = "800 10px Nunito, sans-serif";
    const tw = c.measureText(L.text).width + 10;
    c.fillStyle = L.kind === "warn" ? "rgba(181,101,29,.92)" : L.kind === "green" ? "rgba(31,122,63,.92)" : "rgba(15,70,54,.9)";
    rrect(c, x - tw / 2, y - 8, tw, 16, 8);
    c.fill();
    c.fillStyle = "#fff";
    c.fillText(L.text, x, y + 0.5);
  }
  const t = stepTarget();
  if (t) {
    c.strokeStyle = "#d9a83c";
    c.lineWidth = 3;
    circ(c, (t.x - b.x0) * s, (t.y - b.y0) * s, 9);
    c.stroke();
  }
  c.fillStyle = "#2f7de0";
  c.strokeStyle = "#fff";
  c.lineWidth = 2;
  circ(c, (P.x - b.x0) * s, (P.y - b.y0) * s, 6);
  c.fill();
  c.stroke();
}

function openMap(tab: "haji" | "lokasi"): void {
  openModal({
    kicker: "Peta",
    title: tab === "haji" ? "Laluan haji Tamattu'" : `Peta ${scene.name}`,
    cls: "wide",
    html: `<div class="tabs" role="tablist"><button type="button" role="tab" id="mtHaji" aria-selected="${tab === "haji"}">Laluan haji</button><button type="button" role="tab" id="mtLok" aria-selected="${tab === "lokasi"}">Lokasi semasa</button></div>
<div id="mapPane">${
      tab === "haji"
        ? journeySVG() + journeyTable() + `<p class="muted">Jarak ialah anggaran daripada sumber rujukan (Saudipedia, IslamWeb). Laluan Mina → Arafah melalui Muzdalifah.</p>`
        : `<canvas id="bigMap" class="bigmap"></canvas><p class="muted">Bulatan biru ialah kedudukan kamu; gelang emas ialah sasaran seterusnya. Peta ini dipermudahkan dan tidak mengikut skala sebenar.</p>`
    }</div>`,
    buttons: [
      { label: "Rujukan", kind: "ghost", onClick: openRefs },
      { label: "Tutup", kind: "primary" },
    ],
  });
  el("mtHaji").onclick = () => openMap("haji");
  el("mtLok").onclick = () => openMap("lokasi");
  if (tab === "lokasi") requestAnimationFrame(() => sceneMapCanvas(el<HTMLCanvasElement>("bigMap")));
}

function openRefs(): void {
  openModal({
    kicker: "Rujukan",
    title: "Sumber kandungan & ukuran",
    cls: "wide",
    html: `<p class="muted">${esc(REF_NOTE)}</p><ol class="refs">${REFS.map(
      (r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.t)}</a> <span class="rs">${esc(r.src)}</span><span class="ru">${esc(r.use)}</span></li>`
    ).join("")}</ol>`,
  });
}
