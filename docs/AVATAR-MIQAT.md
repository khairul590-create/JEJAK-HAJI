# Avatar Blender dan ruang dalaman Miqat

## Apa yang berubah

Pemain boleh masuk bilik mandi/persalinan dari pintu bangunan Miqat, berjalan ke
stesen kuku, bilik mandi tertutup, persalinan dan wuduk. Pintu masjid membawa pemain
ke ruang dalaman dengan sejadah, rak kasut, mihrab dan tempat wuduk. Aktiviti tandas
mengosongkan status wuduk; solat hanya bermula selepas wuduk. Menamatkan persalinan
menukar pakaian, tetapi niat ihram masih langkah berasingan.

Simulasi dua rakaat mempunyai 16 peringkat termasuk empat sujud. Tekan Seterusnya
untuk meneruskan setiap peringkat. Animasi sengaja dipendekkan; ini bukan panduan
lengkap bacaan, tumakninah atau syarat sah solat. Urutan stesen ialah latihan
permainan, bukan dakwaan bahawa semua persediaan ialah rukun atau wajib.
Mandi/tandas/persalinan menggunakan ruang privasi; avatar tidak dipaparkan tanpa
pakaian. Aktiviti yang dihentikan tidak dikira selesai.

Kemajuan stesen disimpan dalam Save.flags; nombor langkah lama tidak berubah.
Muat semula permainan mengembalikan pemain ke luar bangunan. Pemain dengan simpanan
lama yang sudah sampai langkah solat boleh mengambil wuduk di ruang masjid.

## Avatar

`blender/avatar.py` menghasilkan model asal bergaya kartun dengan ukuran sekitar
1.92 m, 17,928 segi tiga, 22 primitive/draw calls dan GLB kira-kira 460 KiB.
Ia menggunakan pivot objek untuk gerakan; bukan model manusia dengan skin weights.
Pemain lelaki berpakaian ihram menggunakan model ini; wanita dan pakaian biasa
mengekalkan model sedia ada. Rambut disembunyikan selepas bercukur dan sandal
disembunyikan dalam masjid. Jika GLB tidak dapat dimuat, model asal terus berfungsi.
Gambar konsep AI ialah arah visual, bukan jaminan model identik dengannya.

```sh
blender --background --python blender/avatar.py
JH_RENDER=1 blender --background --python blender/avatar.py
```

Hasil: `models/jemaah-v1.blend`, `.glb`, `.glb.b64` dan pilihan `-preview.png`.
Fail `.glb.b64` ialah sumber binari berkod base64 untuk laluan penerbitan yang
menyokong fail teks. `node build.mjs` menyahkodnya kepada GLB sebenar sebelum
workflow Pages menyalin folder models. Jangan sunting base64 secara manual;
jana semula dengan skrip Blender. Draco tidak diperlukan.

## Pengesahan

```sh
npm install
npm test
```

Ujian menjalankan game yang telah dikompil dalam DOM ujian dan memuat GLB melalui
GLTFLoader Three.js r128. Ia menguji pembatalan, pertukaran pakaian, wuduk/tandas,
dua rakaat, simpanan lama, pilihan wanita, keluar ruang, sasaran tidak berada dalam
dinding, rambut, kamera mata, skala model dan bajet geometri. Ia tidak menggantikan
semakan visual WebGL atau ujian prestasi pada telefon sebenar.

## Rujukan kandungan

- Tabung Haji, Nota Kursus Asas Haji 1446H, Minggu 3, bahagian Sunat Ihram:
  https://www.tabunghaji.gov.my/sites/default/kah/TH-NOTA%20KAH%201446H%20_%20M3.pdf
- Jabatan Mufti Wilayah Persekutuan, Al-Kafi #1857, waktu larangan solat:
  https://muftiwp.gov.my/ms/artikel/al-kafi-li-al-fatawi/5122-al-kafi-1857-apakah-solat-sunat-yang-dibolehkan-pada-waktu-yang-diharamkan-untuk-solat
