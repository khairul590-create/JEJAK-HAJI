# Jejak Haji — Dokumen Reka Bentuk (1 muka surat)

> Rujukan utama untuk setiap perubahan. Sebelum menambah ciri, semak: adakah ia membantu **objektif pembelajaran** di bawah,
> dan adakah ia kekal dalam **had prestasi**? Jika tidak, jangan tambah. Kemas kini dokumen ini apabila keputusan berubah.

## 1. Apa dan untuk siapa
- **Apa:** simulasi haji Tamattu' yang dimainkan dalam pelayar web, dari Miqat hingga Tawaf Wada'. 2D tanpa internet, 3D pilihan.
- **Pengguna:** bakal jemaah (termasuk warga emas), pelajar ACIS UiTM dan kursus haji. Kebanyakannya bermain di **telefon**.
- **Pemilik kandungan:** Dr. Masnih Mustapa, ACIS UiTM Kota Kinabalu. Hukum dan doa mengikut rujukan dalam `REFS`
  (Tabung Haji dan lain-lain). Kandungan fiqh tidak diubah tanpa semakan pemilik.

## 2. Objektif pembelajaran (ukuran kejayaan)
Selepas bermain, pengguna boleh:
1. Menyusun **tertib** haji Tamattu' mengikut hari (8 bab, 8–13 Zulhijjah).
2. Membezakan **rukun, wajib dan sunat**, serta tahu apa yang membatalkan atau mewajibkan dam.
3. Melakukan **tawaf** (7 pusingan lawan jam, mula di garisan Hajarul Aswad) dan **saie** (Safa → Marwah = 1, 7 kali).
4. Mengecam tempat sebenar: Mataf, Mas'a, Mina, Arafah, Muzdalifah, Jamarat, dan **arah kiblat** semasa berdoa.
5. Membaca atau mendengar **doa utama** (Arab, rumi, maksud).

Diukur oleh: kuiz umrah dan kuiz akhir (sasaran ≥ 80% betul), pencapaian dalam game, dan maklum balas pelajar.

## 3. Gelung permainan
- **Gelung besar:** Bab → Tugasan → Langkah. Panel misi sentiasa memberitahu *apa seterusnya* dan *kenapa*.
- **Gelung langkah:** pergi ke penanda → tekan Interaksi → kad doa/penerangan → buat ibadah → maklum balas (bunyi, toast, kemajuan).
- **Mekanik ibadah** (setiap satu ada penunjuk kemajuan sendiri):

| Ibadah | Tindakan pemain | Maklum balas |
|---|---|---|
| Tawaf | Jalan lawan jam di mataf, isyarat di garisan Hajarul Aswad | Dial pusingan, anak panah lantai |
| Saie | Jalan Safa ↔ Marwah, laju di lampu hijau (lelaki) | Jalur Safa–Marwah, ARAH KAABAH di bukit |
| Wukuf | Berdoa menghadap kiblat, Zohor → Maghrib | Dial matahari, langit senja |
| Lontar | Kutip batu di Muzdalifah, baling 7 batu ikut tertib | Panel Ula → Wusta → Aqabah |

- **Lapisan sokongan:** tenaga dan air (rehat, minum), pemandu suara, Panduan jemaah, Lawatan 360°. Lapisan ini **tidak**
  boleh menghukum pemain sehingga tidak boleh meneruskan ibadah. Ia mengajar, bukan menyusahkan.

## 4. Gaya visual
- **Arah:** "cozy" dan mesra: bentuk ringkas, warna lembut, avatar kartun kepala besar, cahaya ikut waktu ibadah.
  Ketepatan **susun atur tempat** (kedudukan Kaabah, Maqam Ibrahim, Safa/Marwah, tingkat Jamarat) lebih penting daripada
  tekstur realistik.
- **Gaya Realistik** (PBR, marmar, emas) kekal sebagai pilihan. Gaya toon dengan garis luar akan diuji sebagai pilihan
  dalam Tetapan, dan pemilik memilih gaya utama selepas membandingkan di telefon.
- **Adab:** tiada wajah atau imej orang sebenar, aurat avatar dijaga (ihram, telekung), tiada muzik. Bunyi alam dan
  talbiah sahaja.

## 5. Had prestasi (tidak boleh dilanggar)
| Perkara | Had |
|---|---|
| Fail game (`dist/jejak-haji.html`) | ≤ 600 KB (kini ±430 KB). Mod 2D mesti jalan tanpa internet |
| Setiap model `.glb` | ≤ 1.2 MB, dimuat hanya apabila 3D dibuka |
| Telefon pertengahan, grafik Rendah | ≥ 30 FPS; auto turun tahap jika < 24 FPS |
| Pustaka | Three.js r128 sahaja (cdnjs/jsdelivr). Tiada enjin lain |
| Pelayan | Main seorang: tiada pelayan. Rombongan: Cloudflare Worker + Durable Objects (`server/`), pelan Percuma untuk 1 kelas |
| Penerbitan | GitHub Pages dan benaman Google Sites mesti terus berfungsi (main seorang); Cloudflare untuk Rombongan |
| Rombongan | ≤ 60 orang setiap rombongan; ≤ 10 KB/s data setiap telefon |

## 6. Bukan dalam skop
Pindah ke Unity/Unreal, akaun log masuk dan kata laluan (Rombongan guna kod + nama panggilan sahaja), simpanan kemajuan
di pelayan, haji Ifrad/Qiran (buat masa ini), foto atau model
berhak cipta tanpa lesen (lihat `PANORAMA-360.md`).

## 7. Urutan kerja seterusnya
1. ✅ Dokumen ini.
2. ✅ Gaya toon + garis luar sebagai pilihan dalam Tetapan. **Menunggu:** pemilik bandingkan di telefon dan pilih gaya utama.
3. Jemaah beranimasi (peringkat B): orang ramai berjalan, bertawaf dan bersaie, ikut gaya yang dipilih.
4. Model Blender: Menara Jam, Masjid Namirah, Masjid Miqat, khemah Mina (peringkat C).
5. ✅ Rombongan (berbilang pemain, pilihan pemilik): ketua & sehingga 60 jemaah, sembang, kumpul, umum. Lihat
   `docs/ROMBONGAN.md`. **Menunggu:** pemilik sediakan akaun Cloudflare dan uji dengan satu kelas.
6. Pasang tekstur CC0 yang sudah ada dalam `textures/polyhaven/` (marmar, pasir, batu) pada material 3D, dalam had saiz di atas.

Satu sistem dibina, diuji di telefon dan diterbitkan pada satu masa. Jangan gabungkan beberapa sistem baharu dalam satu
perubahan.
