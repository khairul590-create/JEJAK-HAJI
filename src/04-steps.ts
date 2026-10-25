// =====================================================================
//  Fail 04: BAB, TUGASAN & LANGKAH
//  Urutan haji Tamattu': Miqat → Umrah → Tarwiyah → Arafah →
//  Muzdalifah → Hari Nahar → Tasyrik → Tawaf Wada'
// =====================================================================

interface Counter {
  title: string;
  cur: number;
  max: number;
  unit?: string;
  pct?: number;
  sub?: string;
  tag?: { text: string; bad: boolean } | null;
}

interface Step {
  id: string;
  text: string;
  scene: SceneId;
  date?: string;
  time?: string;
  light?: Light;
  travel?: SceneId;
  target?: () => Vec | null;
  counter?: () => Counter;
  onStart?: () => void;
  done?: () => boolean;
}

interface Task {
  ch: number;
  title: string;
  steps: Step[];
}

interface Chapter {
  n: number;
  title: string;
  date: string;
  read: string;
}

const CHAPTERS: Chapter[] = [
  { n: 1, title: "Ihram di Miqat", date: "Sebelum 8 Zulhijjah", read: "miqat" },
  { n: 2, title: "Umrah di Masjidil Haram", date: "Sebelum 8 Zulhijjah", read: "haram" },
  { n: 3, title: "Hari Tarwiyah", date: "8 Zulhijjah", read: "tarwiyah" },
  { n: 4, title: "Wukuf di Arafah", date: "9 Zulhijjah", read: "arafah" },
  { n: 5, title: "Mabit di Muzdalifah", date: "Malam 10 Zulhijjah", read: "muzdalifah" },
  { n: 6, title: "Hari Nahar", date: "10 Zulhijjah", read: "nahar" },
  { n: 7, title: "Hari Tasyrik", date: "11–13 Zulhijjah", read: "tasyrik" },
  { n: 8, title: "Tawaf Wada'", date: "Sebelum pulang", read: "wada" },
];

const TASKS: Task[] = [
  // ---------------- BAB 1 ----------------
  {
    ch: 1,
    title: "Persediaan ihram",
    steps: [
      { id: "miqat_board", scene: "miqat", text: "Baca papan penerangan Miqat Bir Ali", target: () => POS.miqat.board },
      { id: "ihram_wear", scene: "miqat", text: "Mandi sunat dan pakai pakaian ihram di bilik persalinan", target: () => POS.miqat.bilik },
    ],
  },
  {
    ch: 1,
    title: "Solat sunat ihram & niat umrah",
    steps: [
      { id: "solat_ihram", scene: "miqat", text: "Solat sunat ihram dua rakaat di Masjid Miqat", target: () => POS.miqat.masjid },
      { id: "niat_umrah", scene: "miqat", text: "Lafazkan niat umrah dan bertalbiah", target: () => POS.miqat.masjid },
    ],
  },
  {
    ch: 1,
    title: "Bertolak ke Makkah",
    steps: [{ id: "bus_makkah1", scene: "miqat", text: "Naik bas ke Makkah sambil bertalbiah", travel: "makkah" }],
  },
  // ---------------- BAB 2 ----------------
  {
    ch: 2,
    title: "Masuk Masjidil Haram",
    steps: [
      {
        id: "haram_board",
        scene: "makkah",
        text: "Baca papan penerangan di Pintu King Abdul Aziz",
        target: () => ({ x: POS.makkah.board.x - 70, y: POS.makkah.board.y }),
      },
    ],
  },
  {
    ch: 2,
    title: "Tawaf umrah 7 pusingan",
    steps: [
      { id: "tawaf_start", scene: "makkah", text: "Pergi ke garisan Hajarul Aswad dan tekan MULA TAWAF", target: () => POS.makkah.line },
      { id: "tawaf", scene: "makkah", text: "Tawaf 7 pusingan berlawanan arah jam", counter: () => tawafCounter(), target: () => tawafTarget() },
    ],
  },
  {
    ch: 2,
    title: "Saie umrah 7 perjalanan",
    steps: [
      {
        id: "saie_start",
        scene: "makkah",
        text: "Masuk ke koridor Mas'a (sebelah timur) dan tekan MULA SAIE di Bukit Safa",
        target: () => POS.makkah.safa,
      },
      { id: "saie", scene: "makkah", text: "Saie 7 perjalanan antara Safa dan Marwah", counter: () => saieCounter(), target: () => saieTarget() },
    ],
  },
  {
    ch: 2,
    title: "Bergunting / bercukur — tahallul umrah",
    steps: [
      {
        id: "tahallul_umrah",
        scene: "makkah",
        text: "Keluar ikut pintu timur berhampiran Marwah ke kedai gunting",
        target: () => POS.makkah.barber,
      },
    ],
  },
  {
    ch: 2,
    title: "Uji kefahaman: rukun umrah",
    steps: [{ id: "quiz_umrah", scene: "makkah", text: "Jawab kuiz rukun umrah", onStart: () => later(() => openQuiz("umrah"), 1100) }],
  },
  // ---------------- BAB 3 ----------------
  {
    ch: 3,
    title: "Niat haji di penginapan",
    steps: [
      { id: "niat_haji", scene: "makkah", time: "Pagi", text: "Pergi ke hotel: mandi sunat, pakai ihram dan niat haji", target: () => POS.makkah.hotel },
    ],
  },
  {
    ch: 3,
    title: "Bermalam di Mina",
    steps: [
      { id: "bus_mina1", scene: "makkah", time: "Pagi", text: "Naik bas ke Mina sambil bertalbiah", travel: "mina" },
      { id: "mina_tarwiyah", scene: "mina", time: "Petang", text: "Pergi ke khemah Maktab 87 dan bermalam di Mina (sunat)", target: () => POS.mina.tent },
    ],
  },
  // ---------------- BAB 4 ----------------
  {
    ch: 4,
    title: "Ke Arafah, khutbah & solat jamak",
    steps: [
      { id: "bus_arafah", scene: "mina", time: "Pagi", text: "Naik bas ke Arafah", travel: "arafah" },
      {
        id: "arafah_khutbah",
        scene: "arafah",
        time: "Selepas gelincir matahari",
        text: "Masuk ke dalam sempadan Arafah. Di khemah, dengar khutbah dan solat jamak Zohor–Asar",
        target: () => POS.arafah.khemah,
      },
    ],
  },
  {
    ch: 4,
    title: "Wukuf: doa, zikir & istighfar",
    steps: [
      {
        id: "wukuf",
        scene: "arafah",
        time: "Petang",
        text: "Berwukuf di dalam sempadan Arafah: tekan BERDOA dan kekal diam",
        counter: () => wukufCounter(),
      },
    ],
  },
  // ---------------- BAB 5 ----------------
  {
    ch: 5,
    title: "Ke Muzdalifah & kutip batu",
    steps: [
      {
        id: "bus_muzdalifah",
        scene: "arafah",
        date: "9 Zulhijjah",
        time: "Selepas Maghrib",
        light: "dusk",
        text: "Selepas matahari terbenam, naik bas ke Muzdalifah",
        travel: "muzdalifah",
      },
      {
        id: "kutip_batu",
        scene: "muzdalifah",
        time: "Selepas Isyak",
        light: "night",
        text: "Kutip sekurang-kurangnya 7 biji batu kecil (berjalan di atasnya)",
        counter: () => ({
          title: "Kutip batu di Muzdalifah",
          cur: Math.min(S.pebbles, 7),
          max: 7,
          sub: "Batu sebesar hujung jari. Kutip 28 biji supaya cukup untuk hari Tasyrik juga.",
          tag: { text: `Jumlah dalam beg: ${S.pebbles} biji`, bad: false },
        }),
        done: () => S.pebbles >= 7,
      },
    ],
  },
  {
    ch: 5,
    title: "Bermalam di Muzdalifah",
    steps: [
      {
        id: "mabit_muz",
        scene: "muzdalifah",
        time: "Sebelum tengah malam",
        light: "night",
        text: "Pergi ke tikar kamu dan bermalam hingga lepas tengah malam",
        target: () => POS.muzdalifah.mat,
      },
    ],
  },
  // ---------------- BAB 6 ----------------
  {
    ch: 6,
    title: "Lontar Jamrah Aqabah",
    steps: [
      {
        id: "bus_mina2",
        scene: "muzdalifah",
        time: "Selepas tengah malam",
        light: "night",
        text: "Naik bas ke Mina",
        travel: "mina",
      },
      {
        id: "aqabah_go",
        scene: "mina",
        time: "Pagi",
        text: "Pergi ke Jamrah Aqabah di hujung barat Kompleks Jamarat",
        target: () => jamrahFront("aqabah"),
        done: () => inThrowRange("aqabah"),
      },
      {
        id: "aqabah",
        scene: "mina",
        time: "Pagi",
        text: "Lontar Jamrah Aqabah 7 biji sambil bertakbir",
        counter: () => throwCounter("aqabah", "aqabah"),
        target: () => (inThrowRange("aqabah") ? null : jamrahFront("aqabah")),
      },
    ],
  },
  {
    ch: 6,
    title: "Dam & bercukur — tahallul awal",
    steps: [
      { id: "dam", scene: "mina", time: "Pagi", text: "Selesaikan dam haji Tamattu' di kaunter dam", target: () => POS.mina.dam },
      { id: "cukur_nahar", scene: "mina", time: "Tengah hari", text: "Bercukur atau bergunting di khemah gunting", target: () => POS.mina.barber },
    ],
  },
  {
    ch: 6,
    title: "Tawaf ifadah",
    steps: [
      { id: "bus_makkah2", scene: "mina", time: "Petang", text: "Naik bas ke Makkah untuk tawaf ifadah", travel: "makkah" },
      { id: "ifadah_start", scene: "makkah", time: "Petang", text: "Pergi ke garisan Hajarul Aswad dan tekan MULA TAWAF", target: () => POS.makkah.line },
      { id: "ifadah", scene: "makkah", time: "Petang", text: "Tawaf ifadah 7 pusingan", counter: () => tawafCounter(), target: () => tawafTarget() },
    ],
  },
  {
    ch: 6,
    title: "Saie haji — tahallul thani",
    steps: [
      { id: "saie_haji_start", scene: "makkah", time: "Malam", text: "Pergi ke Bukit Safa dan tekan MULA SAIE", target: () => POS.makkah.safa },
      { id: "saie_haji", scene: "makkah", time: "Malam", text: "Saie haji 7 perjalanan", counter: () => saieCounter(), target: () => saieTarget() },
    ],
  },
  // ---------------- BAB 7 ----------------
  {
    ch: 7,
    title: "Lontar tiga jamrah",
    steps: [
      { id: "bus_mina3", scene: "makkah", date: "10 Zulhijjah", time: "Malam", text: "Kembali ke Mina untuk bermalam dan melontar", travel: "mina" },
      {
        id: "batu_tasyrik",
        scene: "mina",
        date: "11 Zulhijjah",
        time: "Pagi",
        text: "Pastikan ada 21 biji batu. Kutip di Kawasan batu jika tidak cukup",
        counter: () => ({
          title: "Batu untuk hari Tasyrik",
          cur: Math.min(S.pebbles, 21),
          max: 21,
          sub: "7 biji untuk setiap jamrah: Ula, Wusta dan Aqabah.",
        }),
        onStart: () => {
          if (S.pebbles < 21) ensurePatch();
        },
        target: () => (S.pebbles >= 21 ? null : POS.mina.patch),
        done: () => S.pebbles >= 21,
      },
      {
        id: "ula",
        scene: "mina",
        date: "11 Zulhijjah",
        time: "Selepas gelincir matahari",
        text: "Lontar Jamrah Ula 7 biji",
        counter: () => throwCounter("ula", "ula"),
        target: () => (inThrowRange("ula") ? null : jamrahFront("ula")),
      },
      {
        id: "wusta",
        scene: "mina",
        date: "11 Zulhijjah",
        time: "Selepas gelincir matahari",
        text: "Lontar Jamrah Wusta 7 biji",
        counter: () => throwCounter("wusta", "wusta"),
        target: () => (inThrowRange("wusta") ? null : jamrahFront("wusta")),
      },
      {
        id: "aqabah2",
        scene: "mina",
        date: "11 Zulhijjah",
        time: "Selepas gelincir matahari",
        text: "Lontar Jamrah Aqabah 7 biji",
        counter: () => throwCounter("aqabah2", "aqabah"),
        target: () => (inThrowRange("aqabah") ? null : jamrahFront("aqabah")),
      },
    ],
  },
  {
    ch: 7,
    title: "Mabit di Mina & nafar",
    steps: [
      {
        id: "nafar",
        scene: "mina",
        date: "11 Zulhijjah",
        time: "Malam",
        text: "Bermalam di khemah, kemudian pilih nafar awal atau nafar thani",
        target: () => POS.mina.tent,
      },
    ],
  },
  // ---------------- BAB 8 ----------------
  {
    ch: 8,
    title: "Tawaf wada' 7 pusingan",
    steps: [
      { id: "bus_makkah3", scene: "mina", text: "Naik bas ke Makkah untuk tawaf wada'", travel: "makkah" },
      { id: "wada_start", scene: "makkah", text: "Pergi ke garisan Hajarul Aswad dan tekan MULA TAWAF", target: () => POS.makkah.line },
      { id: "wada", scene: "makkah", text: "Tawaf wada' 7 pusingan", counter: () => tawafCounter(), target: () => tawafTarget() },
    ],
  },
  {
    ch: 8,
    title: "Uji kefahaman akhir",
    steps: [{ id: "quiz_final", scene: "makkah", text: "Jawab kuiz rukun dan wajib haji", onStart: () => later(() => openQuiz("final"), 1100) }],
  },
];

interface FlatStep {
  step: Step;
  task: Task;
  ti: number;
}
const ALL_STEPS: FlatStep[] = [];
TASKS.forEach((task, ti) => task.steps.forEach((step) => ALL_STEPS.push({ step, task, ti })));
