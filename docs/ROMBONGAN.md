# Rombongan: main bersama rakan sekelas

Sehingga 60 orang boleh berada dalam satu rombongan. Setiap orang nampak avatar rakan yang berada di lokasi yang sama
(2D, 3D dan peta mini), boleh bersembang, dan boleh mengikut ketua rombongan (pensyarah). Kemajuan ibadah setiap jemaah
kekal milik sendiri. Tawaf, saie dan kuiz tidak dikongsi atau dibuat bagi pihak orang lain.

## Cara guna

**Pensyarah (ketua rombongan)**
1. Buka game, mulakan perjalanan, tekan **Rombongan** → *Pensyarah / ketua rombongan* → isi tajuk → **Cipta rombongan**.
2. Kongsi **kod 6 huruf** atau tekan **Salin pautan jemputan** dan hantar pautan itu kepada pelajar (WhatsApp, Google
   Classroom). Pautan membuka game dengan kod sudah diisi.
3. Dalam **Rombongan**, anda boleh:
   - melihat senarai ahli: lokasi, bab dan tugasan semasa setiap orang (dikemas kini secara langsung);
   - **Panggil berkumpul di sini**: semua jemaah nampak penanda hijau KUMPUL di kedudukan anda;
   - **Umum**: pengumuman muncul di skrin semua jemaah (dan dibaca jika Pemandu suara hidup);
   - **Senyap** (sekat sembang) atau **Keluarkan** ahli.
4. Kunci ketua disimpan dalam pelayar peranti yang mencipta rombongan. Gunakan peranti yang sama untuk kelas itu.

**Pelajar**
1. Buka pautan jemputan (atau tekan **Rombongan** dan masukkan kod), isi **nama panggilan**, tekan **Sertai**.
2. Butang **Sembang** muncul. Ada frasa pantas (Assalamualaikum, Tunggu saya, Ikut saya…) dan mesej bebas. Mesej muncul
   sebagai belon kata di atas kepala.
3. Jika halaman dimuat semula atau internet terputus seketika, game menyambung semula ke rombongan yang sama.

Ketua ditanda ★ dan berwarna hijau. Rakan lain berwarna biru. Ketua dan rakan terdekat sahaja yang dilabel supaya skrin
tidak penuh.

## Privasi & keselamatan
- Gunakan **nama panggilan**, bukan nama penuh, nombor IC atau telefon (Akta Perlindungan Data Peribadi 2010).
- Pelayan **tidak menyimpan** nama, kedudukan atau sembang dalam pangkalan data. Semuanya dalam ingatan sahaja dan hilang
  apabila semua ahli keluar. Hanya tajuk, kod dan kunci ketua disimpan, dan rombongan dipadam selepas 30 hari.
- Sembang ditapis untuk perkataan kesat yang lazim. Ketua boleh senyapkan atau keluarkan ahli.
- Semasa di bilik peribadi Miqat (mandi, berpakaian, tandas) dan semasa Lawatan 360°, kedudukan anda tidak dihantar.
- Jika data game akan digunakan untuk penyelidikan, dapatkan kelulusan etika UiTM dahulu.

## Hos di Cloudflare (sekali sahaja)
Pelayan ialah **Cloudflare Worker + Durable Objects** dalam folder `server/`. Worker yang sama juga menghidangkan game,
jadi alamat game di Cloudflare terus boleh digunakan untuk rombongan.

1. Daftar akaun percuma di <https://dash.cloudflare.com/sign-up>. Buka **Workers & Pages** sekali supaya subdomain
   `NAMA.workers.dev` anda dicipta.
2. Ambil **Account ID**: dashboard → *Workers & Pages* → panel kanan (*Account ID*).
3. Cipta token: *My Profile* → *API Tokens* → *Create Token* → templat **Edit Cloudflare Workers** → *Continue* → *Create*.
   Salin token (ia ditunjukkan sekali sahaja).
4. Di GitHub: repo **JEJAK-HAJI** → *Settings* → *Secrets and variables* → *Actions* → *New repository secret*:
   - `CLOUDFLARE_API_TOKEN` = token langkah 3
   - `CLOUDFLARE_ACCOUNT_ID` = ID langkah 2
5. Tab **Actions** → *Terbit ke Cloudflare* → *Run workflow* (atau push apa-apa ke `main`).
6. Selepas siap, game ada di `https://jejak-haji.NAMA.workers.dev`. Kongsi alamat ini kepada pelajar.

**Supaya versi GitHub Pages juga boleh menyertai rombongan**, letak alamat itu dalam `src/00-config.ts`:
```ts
rombongan: "https://jejak-haji.NAMA.workers.dev",
```

### Kos (pelan Percuma Cloudflare)
Mengikut halaman harga Cloudflare (semak semula kerana boleh berubah:
<https://developers.cloudflare.com/durable-objects/platform/pricing/>):
- Pelan Percuma: **100,000 permintaan sehari** dan 13,000 GB-s tempoh sehari. Had ditetapkan semula setiap hari pada
  00:00 UTC (8:00 pagi waktu Malaysia).
- Mesej WebSocket **masuk** dikira 20 mesej = 1 permintaan. Mesej keluar tidak dikira.
- Game menghantar ±4 mesej sesaat ketika bergerak, dan satu mesej setiap 4 saat ketika diam.
  Anggaran kasar: **50 pelajar yang bergerak tanpa henti ≈ 36,000 permintaan sejam**. Kelas 1–2 jam sehari muat
  dalam pelan Percuma. Jika had habis, sambungan baharu gagal sehingga had ditetapkan semula.
- Untuk penggunaan lebih besar (beberapa kelas serentak setiap hari), naik taraf ke **Workers Paid** (USD 5 sebulan).

### Data telefon
Setiap telefon menerima ±6 KB/s ketika 50 orang bergerak di lokasi yang sama (±20 MB sejam). Rakan di lokasi lain
tidak dihantar.

## Uji di komputer sendiri
```bash
npm install && npm run build          # bina game (akar repo)
cd server && npm install
npm run dev                           # http://127.0.0.1:8787 — game + pelayan rombongan tempatan
```
Buka dua tetingkap pelayar ke alamat itu: satu cipta rombongan, satu lagi sertai.

## Protokol (untuk pembangun)
WebSocket `GET /ws/:kod`, mesej JSON.

| Arah | `t` | Isi |
|---|---|---|
| klien → | `hai` | `nama`, `kunci?` (ketua), `rupa {g, ih, kulit, baju, tudung}`: mesej pertama |
| klien → | `p` | `s` lokasi, `x`, `y`, `a` sudut, `f` bendera (1 bergerak, 2 laju, bit 2–4 pose, 0x80 tersembunyi) |
| klien → | `i` | `sc`, `st` id langkah, `lt` tugasan, `b` bab, `rupa`: apabila berubah |
| klien → | `c` | `m` sembang (≤160 aksara, 1 setiap 1.5 s) |
| ketua → | `umum`, `kumpul`, `senyap {id, on}`, `buang {id}` | |
| → klien | `selamat` | `id`, `ketua`, `kod`, `tajuk`, `ahli[]`, `sembang[]` |
| → klien | `masuk`, `keluar`, `i`, `c`, `umum`, `kumpul`, `senyap`, `ralat` | |
| → klien | `pp` | `s`, `d: [[id, lokasi, x, y, a, f]…]`, `penuh?`: 5 kali sesaat, rakan di lokasi sama sahaja |

HTTP: `POST /api/rombongan {tajuk}` → `{kod, kunci, tajuk}`; `GET /api/rombongan/:kod` → `{kod, tajuk, ahli}`.
