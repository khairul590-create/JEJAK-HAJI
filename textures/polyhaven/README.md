# Tekstur tempatan JEJAK HAJI — Poly Haven

Tiga bahan tekstur CC0 dipilih untuk kegunaan 3D. Ini **aset calon**, bukan foto atau bahan rasmi Masjidil Haram, Arafah atau lokasi ibadah sebenar. Fail kini tersedia secara tempatan; **belum dipasang pada material game**. Tiada perubahan kepada warna, langit, avatar atau logik game dalam import ini.

## Kandungan dan sumber

| Folder | Nama asal | Pencipta | Kegunaan calon |
| --- | --- | --- | --- |
| `marble_01/` | [Marble 01](https://polyhaven.com/a/marble_01) | Rob Tuytel | Marmar cerah/beige; perlu pemilihan visual sebelum guna untuk mataf putih |
| `sand_01/` | [Sand 01](https://polyhaven.com/a/sand_01) | Rob Tuytel | Pasir kawasan luar |
| `rock_face/` | [Rock Face](https://polyhaven.com/a/rock_face) | Greg Zaal (Photography), Dario Barresi (Processing) | Permukaan batu/gunung |

Setiap folder ada:
- `color.jpg`: 1024 × 1024, sRGB, JPEG kualiti 85.
- `normal.png`: 512 × 512, normal OpenGL, data linear, PNG lossless.
- `roughness.png`: 512 × 512, grayscale/data linear, PNG lossless.

Sumber asal ialah PNG 1K daripada API/muat turun rasmi Poly Haven. Hanya pengecilan dan penukaran format dilakukan; tiada gambar contoh laman, logo atau aset pihak ketiga disalin.

## Lesen dan jejak sumber

Semua **sembilan peta tekstur** dalam folder bahan di atas ialah terbitan aset **CC0 1.0 Universal**. Ia boleh digunakan, diubah dan diedarkan semula, termasuk untuk projek komersial, mengikut CC0. Rujukan polisi penyedia: <https://polyhaven.com/license>.

- `CC0-1.0.txt` ialah salinan teks penuh lesen rasmi: <https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt>.
- `manifest.json` merekodkan pencipta, pautan aset, URL fail asal, tarikh import UTC, dimensi, pemprosesan, checksum asal dan SHA-256 fail dalam repo.
- Rekod ini terpakai kepada tekstur terpilih sahaja; bukan menukar lesen kod, audio atau model lain dalam repo.
- Kredit disimpan untuk provenance walaupun CC0 tidak mewajibkan atribusi. Tiada dakwaan sokongan rasmi atau jaminan daripada Poly Haven.

## Untuk pemasangan kemudian (Three.js r128)

Muatkan laluan relatif seperti `textures/polyhaven/sand_01/color.jpg`, bukan hotlink ke Poly Haven. Hanya peta warna menggunakan `THREE.sRGBEncoding`; normal dan roughness kekal data linear. Gunakan `RepeatWrapping` jika permukaan diulang. Normal OpenGL sesuai sebagai `normalMap`; roughness sebagai `roughnessMap`.

Mulakan dengan peta warna sahaja bagi tahap Rendah; nilai penggunaan normal/roughness pada tahap Sederhana/Tinggi selepas ujian telefon. Tiada HDRI, displacement atau tekstur 4K/8K dimasukkan. Fail yang tidak dimuatkan oleh game tidak menambah kos render runtime.

Semakan integriti (Python standard library, tiada pakej tambahan):

```sh
python3 tools/test-textures.py
```
