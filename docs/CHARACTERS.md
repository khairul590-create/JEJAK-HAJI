# Character berangka Jejak Haji

`blender/characters.py` membina empat character asli tanpa model atau tekstur pihak ketiga:

| Fail GLB | Watak |
| --- | --- |
| lelaki-biasa.glb | Lelaki, baju dan seluar |
| lelaki-ihram.glb | Lelaki, kain ihram |
| perempuan-biasa.glb | Perempuan, pakaian labuh dan tudung |
| perempuan-telekung.glb | Perempuan, telekung putih |

Setiap model mempunyai armature 18 tulang, mesh dengan vertex weights dan 11 klip: `Idle`, `Walk`, `Takbir`, `Bersedekap`, `Rukuk`, `Duduk`, `Sujud`, `Salam`, `Groom`, `Throw`, `Sleep`. Rangka termasuk bahu, siku, tangan, pinggul, lutut, kaki dan jari kaki. Model berskala meter, tapak pada lantai, menghadap +Z dalam glTF.

## Buka dalam Blender

Ekstrak `models/characters-blender.zip`, kemudian buka salah satu daripada empat `.blend`. Timeline diset pada aksi Walk; tekan Space untuk berjalan di tempat. Pilih aksi lain dalam Dope Sheet > Action Editor. Aksi solat ialah pose yang ditahan; peralihan antaranya dibuat oleh AnimationMixer dalam game.

Bina semula menggunakan Blender 4.5 LTS:

```sh
blender --background --python blender/characters.py
JH_RENDER=1 blender --background --python blender/characters.py
python tools/package-characters.py  # memerlukan Pillow
npm test
```

Arahan kedua turut menghasilkan render CPU untuk enam pose lelaki dan perempuan. GLB dan `.blend` disimpan dalam `models/`. `models/characters-preview.jpg` ialah helaian render sebenar, bukannya imej konsep AI. Fail `.blend` dan render perantara tidak perlu dicommit; arkib ZIP, GLB, skrip dan helaian pratonton disimpan dalam repo.

## Sambungan game

`src/09-character.ts` memuatkan varian mengikut jantina dan pakaian pemain. Model berangka menggantikan avatar lama bagi kedua-dua jantina, sebelum dan selepas ihram. Gerakan pemain memilih Walk/Idle; langkah solat sedia ada memilih klip yang sepadan. AnimationMixer membuat peralihan 0.18 saat. Kasut disembunyikan dalam masjid dan rambut lelaki selepas bercukur. Warna kulit dan pakaian biasa mengikut pilihan pemain. Privasi mandi/tandas masih dikekalkan.

Setiap scene berangka hanya digunakan oleh seorang pemain. Ia tidak diklon dengan `Object3D.clone`, untuk mengelakkan rujukan skeleton bercampur. Permintaan lama yang selesai selepas pertukaran pakaian diabaikan. Model ringkas kekal tersedia semasa memuat atau jika fail gagal dimuat. Aset binary GLB disimpan terus dalam git dan disalin oleh workflow Pages sedia ada.

Pratonton `models/avatar-preview.html` membolehkan pemilihan empat watak dan semua 11 animasi, serta putaran kamera.

## Pengesahan dan batas

`npm test` menguji aliran Miqat sedia ada dan membaca keempat-empat GLB menggunakan GLTFLoader Three.js r128 yang sama dengan laman. Ia menyemak klip, tulang, pergerakan lutut, batas lantai mesh yang telah dideformasi, kedudukan kepala/tangan semasa sujud, pilihan animasi dalam game, kasut, rambut, kamera orang pertama dan fallback pakaian.

Model ini versi kartun prosedur, bukan rekonstruksi tepat gambar konsep. Kain menggunakan skinning, bukan simulasi kain; lipatan, sambungan kain dan kedudukan jari masih ringkas. Groom ialah gerakan tangan umum, bukan demonstrasi terperinci memotong kuku atau semua anggota wuduk. Animasi solat ialah bantuan visual pendidikan dan belum disemak sebagai demonstrasi fiqh terperinci. Render Blender diperiksa; ujian automatik tidak menggantikan ujian WebGL sebenar pada telefon pengguna.

Rujukan teknikal eksport: https://docs.blender.org/manual/en/4.4/addons/import_export/scene_gltf2.html
