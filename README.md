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
models/           model 3D .glb daripada Blender (Kaabah) + fail sumber .blend
blender/          skrip Blender yang menjana model (kaabah.py, characters.py, kartun.py)
docs/GAME-DOC.md  dokumen reka bentuk 1 muka surat: objektif, gelung permainan, gaya, had prestasi
docs/BLENDER.md   panduan membina model & render dengan Blender
```

## Bina semula selepas mengubah kod
```
npm i -g typescript      # sekali sahaja
npm install              # jenis Three.js (@types/three) untuk semakan TypeScript
tsc -p tsconfig.json     # semak jenis & kompil ke build/js
node build.mjs           # hasilkan dist/main.js dan dist/jejak-haji.html
```

## Ciri tambahan (diilhamkan oleh simulator haji lain)
- **Pemandu suara:** arahan setiap langkah dan doa dibacakan melalui Web Speech API pelayar. Suara Bahasa Melayu bergantung
  pada peranti; jika tiada, suara Bahasa Indonesia digunakan. Butang **Dengar** pada kad doa. Boleh dimatikan dalam Tetapan.
- **Tenaga & air:** meter tenaga berkurang apabila berjalan atau berlari, terutama di tempat panas pada waktu siang.
  Berehat dengan berdiri diam, atau tekan **Minum** (kekunci F). Botol diisi semula di tong Zamzam dan di dalam bas.
  Kadar boleh diubah dalam `CONFIG.tenaga` (`src/00-config.ts`).
- **Panduan jemaah:** kesilapan lazim, langkah jika terpisah daripada rombongan, serta tenaga dan kesihatan
  (Panduan → Panduan jemaah).
- **Tawaf 3D:** serambi Uthmaniyah dengan gerbang runcing berbatu silih dan deretan kubah kecil, mataf bertingkat tiga,
  lampu hijau penanda garisan Hajarul Aswad, anak panah lawan arah jam di lantai dan dial kemajuan pusingan.
- **Grafik 3D:** warna sRGB dengan tone mapping ACES, langit dan matahari mengikut waktu ibadah (pagi, tengah hari, petang,
  senja, malam), pantulan persekitaran, marmar dan emas berkilat (PBR), bloom pada lampu, bayang di bawah jemaah, dan gunung
  bergradien. Tetapan **Kualiti grafik 3D** (Rendah / Sederhana / Tinggi): telefon bermula pada Rendah, komputer pada Tinggi,
  dan kualiti diturunkan secara automatik jika FPS bawah 24 (`src/11-grafik.ts`).
- **Gaya grafik Kartun (cozy):** pilihan dalam Tetapan → *Gaya grafik 3D*. Warna rata berjalur (toon) dan garis luar gelap pada
  jemaah, watak dan bangunan. Pada tahap Rendah, cahaya berjalur dikira per bucu dan hanya jemaah, watak dan Kaabah bergaris,
  jadi kelajuannya sama seperti gaya Realistik. Lalai: Realistik.
- **Lawatan 360°:** 15 titik pandang dari Miqat hingga Jamrah Aqabah dalam kamera Mata yang berputar, dengan penerangan dan
  pautan ke foto 360° sebenar. Foto 360° sendiri boleh dimasukkan (`panorama/`). Lihat [docs/PANORAMA-360.md](docs/PANORAMA-360.md).
- **Wukuf 3D:** gerbang papan sempadan Arafah dwibahasa, tiang semburan air berkabus, Masjid Namirah enam menara, Jabal Rahmah
  berbatu dengan jemaah di lereng, penunjuk ARAH KIBLAT (BERDOA menghadap kiblat), dial matahari Zohor → Maghrib dan langit
  senja menjelang akhir wukuf.
- **Lontar 3D:** jambatan Jamarat bertingkat (lantai 12 m & 24 m berlubang, dinding jamrah menembusi setiap tingkat), papan
  nama jamrah Arab & Melayu, anak panah aliran sehala ke barat, panel tertib Ula → Wusta → Aqabah dan ARAH KIBLAT untuk
  berdoa selepas Jamrah Ula & Wusta.
- **Avatar kartun:** watak kepala besar dan mata besar dengan jalan melantun dan larian (ramal), dijana oleh
  `blender/kartun.py` (Tetapan → *Gaya avatar 3D*). Panduan membina avatar dan persekitaran sendiri dengan betul:
  [docs/AVATAR-PIXAR.md](docs/AVATAR-PIXAR.md).
- **Saie 3D:** dewan Mas'a beratap dengan dinding gerbang dua tingkat, tiang berkepala emas, siling berlampu, zon lampu
  hijau, papan tanda KE MARWAH / KE SAFA, anak panah biru di lantai mengikut arah perjalanan, penunjuk **ARAH KAABAH** di
  bukit (BERDOA menghadapkan jemaah ke Kaabah) dan jalur kemajuan Safa–Marwah di sebelah kanan skrin.
- **Giroskop:** di telefon, gerakkan telefon untuk memandang sekeliling dalam kamera Mata 3D (Tetapan).
- **Model Blender (.glb):** model 3D luaran boleh menggantikan model asas. Lihat [docs/BLENDER.md](docs/BLENDER.md).
  Kaabah dalam paparan 3D kini dibina dengan Blender oleh `blender/kaabah.py` (`models/kaabah.glb`, sumber `models/kaabah.blend`).

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

## GitHub Pages
Game ini diterbitkan di https://khairul590-create.github.io/JEJAK-HAJI/ daripada cawangan `gh-pages`.
Setiap push ke `main` menjalankan `.github/workflows/pages.yml`: ia membina semula game daripada `src/`
(tsc + `node build.mjs`) dan menyalin `dist/jejak-haji.html` ke `index.html` dalam `gh-pages`.
Jika semakan TypeScript gagal, laman tidak dikemas kini — lihat tab Actions.

## Letak dalam Google Sites
Sisip → Benamkan → Kod benaman → tampal isi `dist/jejak-haji.html`.
(Atau muat naik fail itu ke mana-mana hos statik seperti GitHub Pages / Netlify.)

## Kawalan
WASD / anak panah atau kayu bedik: jalan · Shift / butang Laju: laju · E / Space / butang bulat: interaksi ·
roda tetikus atau + −: zum · V: 2D/3D · C: tukar kamera · Q / R: pusing kamera (3D) · M: misi
