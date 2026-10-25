# Jejak Haji — Simulasi Haji Tamattu'

Game pendidikan haji (HTML + CSS + TypeScript). Boleh dimain dalam **2D** (kanvas, tanpa pustaka)
atau **3D** (Three.js r128, dimuat dari cdnjs hanya apabila butang 3D ditekan).
8 bab · 22 tugasan · 5 lokasi: Miqat Bir Ali, Masjidil Haram & Mas'a, Mina & Jamarat, Arafah, Muzdalifah.

## Struktur fail
```
index.html        rangka HUD & skrin (memuat style.css + dist/main.js)
style.css         semua gaya antara muka
src/
  00-config.ts    KANDUNGAN: doa (Arab/rumi/maksud), penerangan, kuiz, pencapaian
  01-util.ts      matematik, storan, bunyi WebAudio
  02-draw.ts      lukisan watak jemaah & prop (khemah, pokok, bas, menara)
  03-scenes.ts    5 lokasi: peta, halangan, NPC, titik interaksi
  04-steps.ts     urutan bab → tugasan → langkah
  05-ui.ts        HUD, toast, kad doa, modal, kuiz, kayu bedik
  06-game.ts      mekanik tawaf/saie/lontar/wukuf, kamera, gelung utama
  07-three.ts     enjin 3D: model daripada deskriptor lokasi, jemaah instanced,
                  kamera Belakang / Mata / Atas, label diunjur
build.mjs         gabung semuanya menjadi satu fail HTML
dist/jejak-haji.html   ← fail siap main (satu fail sahaja)
```

## Bina semula selepas mengubah kod
```
npm i -g typescript      # sekali sahaja
npm install              # jenis Three.js (@types/three) untuk semakan TypeScript
tsc -p tsconfig.json     # semak jenis & kompil ke build/js
node build.mjs           # hasilkan dist/main.js dan dist/jejak-haji.html
```

## Paparan 3D
- Butang **3D** di bar atas (atau kekunci V). Mod 2D berfungsi tanpa internet; mod 3D perlukan internet
  untuk memuat Three.js dari `cdnjs.cloudflare.com`.
- Kamera: **Belakang** (orang ketiga), **Mata** (orang pertama — seperti berjalan sendiri di mataf), **Atas**.
- Zum: butang + / −, roda tetikus, cubit dua jari, atau kekunci + / −. Seret skrin untuk memusing kamera.
- Matikan "Bayang-bayang 3D" dalam Tetapan jika telefon perlahan.
- Model 3D dibina daripada `m3({...})` dalam `src/03-scenes.ts` — tambah deskriptor di situ untuk bangunan baharu.

## Rujukan
Senarai sumber (Tabung Haji, Saudipedia, Arab News, Wikipedia, dll.) ada dalam `REFS` di `src/00-config.ts`
dan boleh dibuka dalam game melalui Panduan → Rujukan atau Peta → Rujukan.

## Ubah kandungan
Semua teks pendidikan ada dalam `src/00-config.ts` (DOA, READ, QUIZ_UMRAH, QUIZ_FINAL, ACH_LIST, LAP_TIPS).
Nama game dan kredit: `CONFIG.title`, `CONFIG.credit`.

## Letak dalam Google Sites
Sisip → Benamkan → Kod benaman → tampal isi `dist/jejak-haji.html`.
(Atau muat naik fail itu ke mana-mana hos statik seperti GitHub Pages / Netlify.)

## Kawalan
WASD / anak panah atau kayu bedik: jalan · Shift / butang Laju: laju · E / Space / butang bulat: interaksi ·
roda tetikus atau + −: zum · V: 2D/3D · C: tukar kamera · Q / R: pusing kamera (3D) · M: misi
