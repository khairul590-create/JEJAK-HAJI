# Cara buat avatar kartun (gaya Pixar) & persekitaran 3D yang betul

Dokumen ini untuk anda yang hendak membina aset sendiri dengan kualiti tinggi. Ia menerangkan apa yang sudah ada dalam
repo, kemudian aliran kerja profesional langkah demi langkah.

---

## 1. Apa yang sudah ada

| Fail | Fungsi |
|---|---|
| `blender/kartun.py` | Menjana 4 avatar kartun (lelaki ihram, perempuan telekung, lelaki biasa, perempuan biasa) dengan kepala besar, mata besar berkilau, pipi tembam, tangan bersarung 4 jari, rangka 18 tulang dan 12 klip animasi |
| `models/kartun-*.glb` | Hasil eksport yang dimuat oleh game (Tetapan → *Gaya avatar 3D → Kartun*) |
| `blender/characters.py` | Avatar gaya asal (Hermes) dengan rangka & nama klip yang sama |
| `src/09-character.ts` | Memuat GLB, memainkan klip mengikut keadaan pemain (Idle, Walk, Run, solat…) dengan AnimationMixer |
| `tools/test-miqat.cjs` | Ujian automatik: klip, 18 tulang, saiz fail, tinggi berdiri, sujud menyentuh lantai, dsb. (`npm test`) |

Avatar kartun dijana sepenuhnya oleh kod, jadi ia **titik permulaan**, bukan kualiti filem. Rupa sebenar Pixar datang
daripada *sculpting* tangan oleh artis. Langkah di bawah menerangkan cara mencapainya.

### Animasi jalan yang "melantun"
`blender/kartun.py` → fungsi `pose()` menggunakan prinsip animasi kartun:

- **Lantunan:** pinggul paling rendah ketika kaki menyentuh lantai, paling tinggi ketika kaki melintas.
- **Ayunan bertentangan:** tangan kiri ke hadapan ketika kaki kiri ke belakang. Pinggul dan bahu berpusing ke arah bertentangan.
- **Lutut bengkok semasa fasa ayun**, jari kaki menolak di hujung langkah, tumit mendarat dahulu.
- **Kelewatan kepala** (*overlapping action*): kepala bergerak sedikit lewat daripada badan.
- **Run** (ramal / lampu hijau): badan condong ke hadapan, siku bengkok 70°, lantunan lebih tinggi.

Ubah angka dalam `pose()`, kemudian jalankan semula skrip untuk melihat kesannya.

---

## 2. Aliran kerja profesional: avatar

### Langkah 1: Reka bentuk & rujukan
- Lukis *model sheet* (pandangan hadapan, sisi, belakang) di atas kertas atau tablet. Gaya Pixar: kepala ±1/3 hingga 1/4
  tinggi badan, mata besar (±1/5 lebar kepala), bentuk asas bulat, siluet mudah dibaca.
- Kumpul gambar rujukan: kain ihram (izar & rida'), telekung, selipar, pelbagai bentuk badan dan umur.
- Pastikan reka bentuk menjaga aurat dan adab pakaian ihram yang betul.

### Langkah 2: Blockout dalam Blender (percuma)
- Unit **meter**, kaki di z = 0, menghadap **-Y** (menjadi +Z dalam glTF).
- Bina bentuk kasar dengan primitif, seperti `kartun.py`: kepala sfera, badan silinder, anggota kapsul.
- Letakkan imej *model sheet* sebagai *Background Image* pada pandangan hadapan & sisi.

### Langkah 3: Sculpt (di sinilah rupa "Pixar")
- Sculpt Mode → *Remesh* (voxel 0.005 m) → berus **Clay Strips, Smooth, Grab, Inflate, Crease**.
- Fokus: pipi, kelopak mata, hidung, bibir, jari, lipatan kain.
- Gunakan *Multires* untuk perincian tanpa merosakkan bentuk asas.

### Langkah 4: Retopology (wajib untuk game)
- Sasaran **8,000 hingga 20,000 segi tiga** bagi setiap watak (had ujian ialah 35,000).
- Gelung tepi (*edge loops*) di sekeliling mata, mulut, bahu, siku, pergelangan, lutut dan pinggul, supaya sendi melentur dengan cantik.
- Alat: *Quad Remesher* (berbayar), *Instant Meshes* (percuma) atau retopo manual dengan *Snap to Face* + *Shrinkwrap*.

### Langkah 5: UV, tekstur & bahan
- *Mark Seam* → *Unwrap*. Satu atlas 1024 × 1024 cukup untuk telefon.
- Gaya Pixar: warna rata dengan gradien lembut (pipi kemerahan, bayang di bawah dagu), *roughness* 0.5 hingga 0.7.
- *Bake* normal map daripada mesh sculpt ke mesh retopo, dan bake AO (lihat `docs/BLENDER.md`).
- Kekalkan nama bahan **`Skin*`, `Outfit*`, `Scarf*`** supaya game boleh mewarnakan semula kulit & pakaian. Mesh rambut
  dinamakan `Hair_*` dan selipar `Footwear_*`.

### Langkah 6: Rigging
Pilihan:
1. **Rangka yang sama dengan game (paling mudah):** 18 tulang bernama `Root, Hips, Spine, Head, UpperArmL/R, ForearmL/R,
   HandL/R, ThighL/R, ShinL/R, FootL/R, ToeL/R`. Salin kedudukan tulang daripada `kartun.py`. Ikat dengan
   *Parent → With Automatic Weights*, kemudian betulkan dengan *Weight Paint*.
2. **Rigify** (dalam Blender): rig lengkap dengan kawalan IK, sesuai untuk animasi tangan. Sebelum eksport, *bake* animasi ke
   tulang DEF dan namakan semula mengikut senarai di atas, atau kemas kini `src/09-character.ts`.
3. **Mixamo** (Adobe, percuma): muat naik FBX → letak penanda → muat turun dengan animasi. Semak terma penggunaan Mixamo
   untuk projek anda. Animasi Mixamo tiada pergerakan solat, jadi pose solat masih perlu dibuat sendiri.

### Langkah 7: Animasi
- Klip yang game jangka: `Idle, Walk, Run, Takbir, Bersedekap, Rukuk, Duduk, Sujud, Salam, Groom, Throw, Sleep`.
- Kitaran jalan 4 pose utama: **Contact → Down → Passing → Up** (24 fps, 1 saat = 2 langkah). Kemudian tambah 12 prinsip
  animasi: *squash & stretch, anticipation, follow-through, overlapping action, slow in/out, arcs*.
- Pose solat mesti disemak oleh ustaz atau pembimbing ibadah supaya tepat (tangan semasa takbir, rukuk 90°, tujuh anggota sujud).
- Setiap aksi: *Push Down* ke trek NLA dan namakan trek sama dengan nama klip.

### Langkah 8: Eksport glTF
*File → Export → glTF 2.0*:
- Format **glTF Binary (.glb)**, *Selected Objects*, **+Y Up**
- *Mesh:* Apply Modifiers (kecuali Armature), UVs, Normals
- *Animation:* **NLA Tracks**, *Always Sample Animations*; *Skinning:* paling banyak 4 pengaruh tulang setiap bucu
- **Jangan** tanda Draco
- Saiz fail di bawah 1.5 MB

### Langkah 9: Masukkan & uji
1. Simpan sebagai `models/kartun-<varian>.glb` untuk menggantikan avatar kartun, atau guna awalan baharu dan tambah pilihannya dalam `pilgrimId()`.
2. `npm install && npx -p typescript@5.9.3 tsc -p tsconfig.json && node build.mjs && npm test`
3. Buka `models/avatar-preview.html` melalui pelayan web tempatan untuk melihat semua klip.
4. Uji di **telefon sebenar**, kerana prestasi WebGL telefon jauh lebih rendah daripada komputer.

### Jalan pintas (dengan kos atau syarat)
- **Upah artis** (ArtStation, Fiverr): berikan dokumen ini, senarai tulang dan senarai klip sebagai spesifikasi.
- **Pek watak berlesen bebas**: contohnya aset CC0 daripada Quaternius atau Kenney. Rig mungkin berbeza, jadi kena padankan nama tulang.
- **Alat AI imej-ke-3D** (Meshy, Tripo, Rodin dan lain-lain): hasilnya biasanya perlu dibersihkan, diretopo dan dirig semula. Semak lesen setiap alat.

---

## 3. Aliran kerja profesional: persekitaran (tawaf, saie)

### Rujukan, bukan salinan
- **Boleh:** gambar sebagai rujukan, pandangan atas Google Earth untuk susun atur, ukuran yang diterbitkan (contohnya diameter mataf
  ±95 m, serambi Uthmaniyah di tiga sisi kecuali sisi Mas'a, lampu hijau penanda garisan Hajarul Aswad).
- **Tidak boleh:** menyalin atau menjual semula model 3D orang lain (contohnya dari Sketchfab) tanpa lesen yang membenarkannya.
  Model **CC0** boleh digunakan terus. **CC-BY** boleh digunakan dengan kredit dalam *Rujukan*. Lesen "Standard" atau "Editorial"
  biasanya tidak membenarkan pengedaran semula dalam game web.
- Jangan gunakan imej satelit atau foto orang lain sebagai tekstur, kerana itu juga berhak cipta.

### Langkah
1. **Skala:** dalam game, 1 unit 3D = 1 m = 10 px peta 2D. Dunia game dimampatkan (mataf berjejari 33 m, sebenar ±47 m), jadi
   model mesti sepadan dengan peta 2D dalam `src/03-scenes.ts`, kerana di situlah laluan dan perlanggaran ditentukan.
2. **Kit modular:** bina satu petak gerbang, satu tiang dan satu kubah, kemudian ulang dengan *Array* (paksi bulat: *Array* +
   *Simple Deform* atau objek *Empty* sebagai pusat putaran). Ini cara yang sama digunakan oleh studio game.
3. **Tekstur:** atlas kecil, *bake* AO / pencahayaan ke dalam tekstur, ulang tekstur (*tiling*) untuk lantai marmar.
4. **Bajet telefon:** ±150 ribu segi tiga untuk seluruh lokasi, kurang daripada 60 panggilan lukisan (*draw calls*), tekstur 1024 hingga 2048.
5. **Eksport & daftar:** `models/<nama>.glb` → tambah dalam `MODELS3D` (`src/00-config.ts`) dengan `replace` untuk
   menyembunyikan model asas, contohnya `"arcade"` (serambi), `"matafRing"` (mataf bertingkat) atau `"masa"` (dewan saie).
6. **Uji:** pandangan Belakang, Mata dan Atas. Pastikan kamera tidak terhalang dan laluan tidak tertutup.

Contoh siap dalam repo: `blender/kaabah.py` (Kaabah). Lihat juga `docs/BLENDER.md`.
