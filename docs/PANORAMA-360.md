# Lawatan 360° & foto 360° sebenar

## Apa yang ada dalam game
Butang **Lawatan 360°** (bar atas, atau **Peta → Lawatan 360°** di telefon) membawa jemaah ke 15 titik pandang mengikut
urutan perjalanan haji: Miqat Bir Ali, Pintu King Abdul Aziz, garisan Hajarul Aswad, Maqam Ibrahim, Hijir Ismail, mataf,
Bukit Safa, lampu hijau Mas'a, Bukit Marwah, khemah Mina, Jabal Rahmah, Masjid Namirah, sempadan Arafah, Masy'aril Haram dan
Jamrah Aqabah.

- Kamera Mata berputar perlahan. Seret skrin, gunakan kayu bedik atau gerakkan telefon (giroskop) untuk memandang sekeliling.
- Setiap titik ada penerangan ringkas (dibacakan jika Pemandu suara hidup) dan pautan **Foto 360° sebenar (Google Maps)**.
  Pautan itu membuka carian lokasi di Google Maps, dan dari situ jemaah boleh membuka foto 360° atau Street View yang ada.
- Kemajuan game tidak berubah. Apabila **Tamat**, jemaah kembali ke kedudukan dan kamera asal. Lawatan tidak boleh dibuka
  semasa tawaf, saie, wukuf (ketika berdoa) atau dalam bilik Miqat.
- Data titik pandang ada dalam `LAWATAN` di `src/00-config.ts`, dan logiknya dalam `src/10-lawatan.ts`.

## Kenapa game tidak memaparkan foto 360° orang lain
Carian (Oktober 2026) tidak menemui foto 360° berlesen bebas (Creative Commons atau domain awam) bagi Masjidil Haram, Mas'a,
Arafah, Mina atau Jamarat:

- **Wikimedia Commons** hanya ada foto panorama jalur (contohnya `Masjid al-Haram panorama.JPG`, 5464 × 972) dan foto biasa,
  bukan sfera 360° penuh.
- **360Cities** ada beberapa foto sfera 8000 × 4000 Masjidil Haram, tetapi hak ciptanya dimiliki jurugambar. Lesen mesti
  dibeli sebelum digunakan dalam game.
- **Google Maps / Street View**: imej tidak boleh disalin ke dalam game (terma Google). Hanya pautan atau benaman rasmi
  yang dibenarkan.

Jadi game memaparkan model 3D sendiri, dan menyediakan pautan ke foto sebenar.

## Cara memasukkan foto 360° anda sendiri
Jika anda mempunyai foto 360° sendiri, atau yang anda beli lesennya, game boleh memaparkannya menggantikan model 3D di titik
pandang itu.

1. **Ambil foto 360°:** kamera 360° (contohnya Insta360 atau Ricoh Theta) di atas tongkat swafoto setinggi mata,
   ±1.6 m. Patuhi peraturan Masjidil Haram tentang fotografi, jangan mengganggu jemaah, dan kaburkan wajah orang
   (kebanyakan aplikasi kamera 360° ada fungsi *blur*).
2. **Eksport** sebagai **equirectangular** (nisbah 2:1) JPG, contohnya **4096 × 2048** (atau 6144 × 3072 untuk komputer),
   saiz kurang daripada 3 MB. Luruskan ufuk (*horizon level*) dalam aplikasi kamera.
3. Simpan dalam folder **`panorama/`** repo, contohnya `panorama/safa.jpg`.
4. Dalam `src/00-config.ts`, cari titik dalam `LAWATAN` dan tambah:
   ```ts
   img: "panorama/safa.jpg",
   credit: "Foto: nama anda, 2026",   // wajib jika lesen CC-BY / foto orang lain
   heading: 0,                         // arah kompas tengah foto: 0 utara, 90 timur, 180 selatan, 270 barat
   ```
   Jika `heading` tidak diisi, tengah foto akan menghadap arah pandangan awal titik itu. Uji, kemudian betulkan
   `heading` jika arah tidak sepadan dengan peta game.
5. Commit dan push. GitHub Action menerbitkan folder `panorama/` bersama game.

Foto 360° tidak dapat dimuat jika fail HTML dibuka terus dari komputer (`file://`). Uji melalui pelayan web
(`python3 -m http.server 8000`) atau di GitHub Pages.

## Lesen: ringkasan
| Sumber | Boleh masuk game? |
|---|---|
| Foto anda sendiri | Ya |
| Creative Commons CC0 / CC-BY / CC-BY-SA | Ya, dengan kredit (`credit`). CC-BY-SA: imej yang diubah mesti dikongsi dengan lesen sama |
| 360Cities, stok foto, jurugambar | Hanya selepas membeli lesen yang membenarkan penggunaan web/aplikasi |
| Google Street View / Google Maps | Tidak (gunakan pautan sahaja) |
| Tabung Haji / agensi rasmi | Minta kebenaran bertulis |
