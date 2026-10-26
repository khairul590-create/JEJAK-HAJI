// =====================================================================
//  JEJAK HAJI — Simulasi Haji Tamattu'
//  Fail 00: KONFIGURASI & KANDUNGAN
//  Semua teks pendidikan (doa, penerangan, kuiz) ada di fail ini,
//  jadi pensyarah boleh mengubah kandungan tanpa menyentuh kod game.
// =====================================================================

const CONFIG = {
  title: "Jejak Haji",
  subtitle: "Simulasi Haji Tamattu'",
  credit: "Dr. Masnih Mustapa · ACIS UiTM Kota Kinabalu",
  saveKey: "jejakHaji.save.v1",
  settingsKey: "jejakHaji.settings.v1",
  walkSpeed: 112,
  runSpeed: 178,
  // Tenaga jemaah (0–100) dan botol air. Kadar dalam unit sesaat.
  tenaga: {
    jalan: 0.22, // berkurang semasa berjalan
    laju: 0.9, // berkurang semasa berlari-lari anak
    rehat: 3, // bertambah semasa berdiri diam
    teguk: 25, // tambahan tenaga bagi setiap teguk air
    botol: 4, // bilangan teguk dalam botol penuh
  },
  // Pelayan Rombongan (berbilang pemain), contohnya "https://jejak-haji.NAMA.workers.dev".
  // Kosong = laman yang sama (apabila game dihos oleh pelayan rombongan di Cloudflare).
  // Lihat docs/ROMBONGAN.md.
  rombongan: "",
};

// ---------------------------------------------------------------------
//  DOA & BACAAN (teks Arab, rumi, maksud)
// ---------------------------------------------------------------------
interface Doa {
  title: string;
  ar: string;
  rumi: string;
  makna: string;
  src?: string;
}

const DOA: Record<string, Doa> = {
  talbiah: {
    title: "Talbiah",
    ar: "لَبَّيْكَ اللّٰهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيْكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيْكَ لَكَ",
    rumi: "Labbaikallahumma labbaik, labbaika la syarika laka labbaik, innal hamda wan ni'mata laka wal mulk, la syarika lak.",
    makna:
      "Aku datang menyahut seruan-Mu ya Allah, aku datang. Aku datang, tiada sekutu bagi-Mu, aku datang. Sesungguhnya segala puji, nikmat dan kerajaan adalah milik-Mu. Tiada sekutu bagi-Mu.",
    src: "HR al-Bukhari dan Muslim",
  },
  niatUmrah: {
    title: "Niat umrah",
    ar: "نَوَيْتُ الْعُمْرَةَ وَأَحْرَمْتُ بِهَا لِلّٰهِ تَعَالَى",
    rumi: "Nawaitul 'umrata wa ahramtu biha lillahi ta'ala.",
    makna: "Sahaja aku berniat umrah dan aku berihram dengannya kerana Allah Taala.",
  },
  niatHaji: {
    title: "Niat haji",
    ar: "نَوَيْتُ الْحَجَّ وَأَحْرَمْتُ بِهِ لِلّٰهِ تَعَالَى",
    rumi: "Nawaitul hajja wa ahramtu bihi lillahi ta'ala.",
    makna: "Sahaja aku berniat haji dan aku berihram dengannya kerana Allah Taala.",
  },
  masjid: {
    title: "Doa masuk masjid",
    ar: "اللّٰهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    rumi: "Allahummaftah li abwaba rahmatik.",
    makna: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.",
    src: "HR Muslim",
  },
  istilam: {
    title: "Isyarat ke Hajarul Aswad",
    ar: "بِسْمِ اللّٰهِ وَاللّٰهُ أَكْبَرُ",
    rumi: "Bismillahi wallahu akbar.",
    makna: "Dengan nama Allah, dan Allah Maha Besar.",
  },
  rabbana: {
    title: "Antara Rukun Yamani dan Hajarul Aswad",
    ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    rumi: "Rabbana atina fid dunya hasanah, wa fil akhirati hasanah, wa qina 'azaban nar.",
    makna:
      "Wahai Tuhan kami, kurniakanlah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab neraka.",
    src: "Al-Baqarah 2:201",
  },
  zamzam: {
    title: "Doa minum air Zamzam",
    ar: "اللّٰهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ",
    rumi: "Allahumma inni as-aluka 'ilman nafi'a, wa rizqan wasi'a, wa syifa-an min kulli da'.",
    makna:
      "Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang luas dan penyembuhan daripada segala penyakit.",
  },
  safa: {
    title: "Di Bukit Safa",
    ar: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللّٰهِ",
    rumi: "Innas safa wal marwata min sya'a-irillah.",
    makna: "Sesungguhnya Safa dan Marwah itu sebahagian daripada syiar agama Allah.",
    src: "Al-Baqarah 2:158",
  },
  takbir: {
    title: "Hadap Kaabah dan berdoa",
    ar: "اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، وَلِلّٰهِ الْحَمْدُ",
    rumi: "Allahu akbar, Allahu akbar, Allahu akbar, wa lillahil hamd.",
    makna: "Allah Maha Besar, Allah Maha Besar, Allah Maha Besar, dan bagi Allah segala puji.",
  },
  hijau: {
    title: "Antara dua lampu hijau",
    ar: "رَبِّ اغْفِرْ وَارْحَمْ، إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ",
    rumi: "Rabbighfir warham, innaka antal a'azzul akram.",
    makna: "Wahai Tuhanku, ampunkanlah dan rahmatilah, sesungguhnya Engkau Maha Perkasa lagi Maha Pemurah.",
  },
  arafah: {
    title: "Sebaik-baik doa pada hari Arafah",
    ar: "لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيْرٌ",
    rumi: "La ilaha illallahu wahdahu la syarika lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli syai-in qadir.",
    makna:
      "Tiada Tuhan melainkan Allah, Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala puji, dan Dia Maha Berkuasa atas segala sesuatu.",
    src: "HR at-Tirmizi",
  },
  istighfar: {
    title: "Istighfar",
    ar: "أَسْتَغْفِرُ اللّٰهَ الْعَظِيْمَ",
    rumi: "Astaghfirullahal 'azim.",
    makna: "Aku memohon ampun kepada Allah Yang Maha Agung.",
  },
  lontar: {
    title: "Setiap kali melontar",
    ar: "بِسْمِ اللّٰهِ، اللّٰهُ أَكْبَرُ",
    rumi: "Bismillah, Allahu akbar.",
    makna: "Dengan nama Allah, Allah Maha Besar.",
  },
};

// ---------------------------------------------------------------------
//  PENERANGAN (dibuka melalui papan "BACA PAPAN" dan butang Baca)
// ---------------------------------------------------------------------
interface Reading {
  kicker: string;
  title: string;
  html: string;
}

const READ: Record<string, Reading> = {
  miqat: {
    kicker: "Bab 1 · Miqat",
    title: "Miqat Zulhulaifah (Bir Ali)",
    html: `<p><b>Miqat makani</b> ialah sempadan tempat jemaah mesti berniat ihram sebelum melepasinya. Jemaah yang datang dari Madinah berihram di <b>Zulhulaifah (Bir Ali)</b>.</p>
<p>Sebelum berniat, sunat:</p>
<ul><li>mandi sunat ihram dan memakai wangian pada badan (bukan pada kain ihram);</li>
<li>memakai pakaian ihram: lelaki dua helai kain tidak berjahit, wanita pakaian menutup aurat dengan muka dan tapak tangan terbuka;</li>
<li>solat sunat ihram dua rakaat.</li></ul>
<p><b>Haji Tamattu'</b>: umrah dikerjakan dahulu dalam bulan-bulan haji. Selepas bertahallul, jemaah berihram semula untuk haji pada 8 Zulhijjah dari Makkah. Jemaah Tamattu' wajib membayar <b>dam</b>.</p>
<p class="fact"><b>Tahukah anda?</b> Miqat Zulhulaifah terletak kira-kira 14 km dari Masjid Nabawi dan kira-kira 433 km dari Masjidil Haram. Menara masjidnya setinggi 62 m.</p>`,
  },
  larangan: {
    kicker: "Kamu kini berihram",
    title: "Larangan ketika berihram",
    html: `<p>Sebaik sahaja berniat, larangan ihram mula terpakai:</p>
<ul><li><b>Lelaki:</b> memakai pakaian berjahit yang melingkungi badan dan menutup kepala.</li>
<li><b>Wanita:</b> menutup muka dan memakai sarung tangan.</li>
<li><b>Semua:</b> memakai wangian, meminyakkan rambut, mencukur atau mencabut rambut dan bulu, memotong kuku, memburu binatang darat, akad nikah, bersetubuh dan bercumbu.</li>
<li><b>Tanah Haram:</b> memotong atau mencabut pokok.</li></ul>
<p>Melanggar larangan ihram dikenakan dam atau fidyah.</p>`,
  },
  haram: {
    kicker: "Bab 2 · Masjidil Haram",
    title: "Sebelum memulakan umrah",
    html: `<p>Masuk ke Masjidil Haram dengan kaki kanan dan membaca doa masuk masjid. Bagi jemaah umrah, amalan pertama ialah <b>tawaf</b>.</p>
<p><b>Rukun umrah (5):</b> niat ihram, tawaf, saie, bercukur atau bergunting, dan tertib.</p>
<p><b>Syarat tawaf:</b> suci daripada hadas dan najis, menutup aurat, Kaabah di sebelah kiri, bermula dari Hajarul Aswad, tujuh pusingan, di dalam masjid, dan di luar Hijir Ismail serta Syazarwan.</p>
<p>Dalam simulasi ini, satu pusingan dikira apabila kamu melintasi semula <b>garisan Hajarul Aswad</b> di dalam kawasan mataf (lantai putih).</p>
<p class="fact"><b>Tahukah anda?</b> Kaabah setinggi kira-kira 13 m dengan sisi kira-kira 12.9 m × 11 m, dan penjurunya menghala ke empat arah mata angin. Pintunya terletak 2.13 m dari lantai di dinding timur laut. Pada musim haji, bahagian bawah kiswah dinaikkan kira-kira 3 m dan dibalut kain putih selebar 2 m. Dinding Hijir Ismail setinggi kira-kira 1.3 m. Jarak Safa–Marwah kira-kira 395 m, jadi tujuh perjalanan saie hampir 2.8 km.</p>`,
  },
  tarwiyah: {
    kicker: "Bab 3 · 8 Zulhijjah",
    title: "Hari Tarwiyah",
    html: `<p>Pada <b>8 Zulhijjah</b>, jemaah Tamattu' berniat ihram haji dari tempat penginapan di Makkah, kemudian bergerak ke Mina.</p>
<p>Bermalam di Mina pada malam 9 Zulhijjah hukumnya <b>sunat</b>. Sebahagian jemaah dibawa terus ke Arafah mengikut aturan petugas, dan hajinya tetap sah.</p>
<p>Talbiah dibaca sepanjang perjalanan sehingga lontaran pertama di Jamrah Aqabah.</p>`,
  },
  arafah: {
    kicker: "Bab 4 · 9 Zulhijjah",
    title: "Wukuf di Arafah",
    html: `<p><b>"Haji itu Arafah"</b> (HR at-Tirmizi). Wukuf ialah rukun haji yang paling utama. Jika terlepas wukuf, terlepaslah haji pada tahun itu.</p>
<p><b>Waktu wukuf:</b> dari gelincir matahari 9 Zulhijjah hingga terbit fajar 10 Zulhijjah. Memadai hadir di bumi Arafah walaupun seketika.</p>
<p>Pastikan kamu berada <b>di dalam sempadan Arafah</b>. Wadi Uranah dan bahagian hadapan Masjid Namirah berada di luar Arafah.</p>
<p>Sunat mendengar khutbah, solat Zohor dan Asar secara jamak taqdim dan qasar, berdoa, berzikir, beristighfar, membaca al-Quran dan menghadap kiblat.</p>
<p class="fact"><b>Tahukah anda?</b> Arafah terletak kira-kira 20–22 km dari Masjidil Haram. Jabal Rahmah naik kira-kira 70 m dari dataran Arafah. Masjid Namirah mempunyai enam menara setinggi kira-kira 60 m.</p>`,
  },
  sempadan: {
    kicker: "Papan tanda",
    title: "Sempadan Arafah",
    html: `<p>Papan kuning menandakan <b>sempadan Arafah</b>. Kawasan di sebelah barat papan (Wadi Uranah) bukan sebahagian daripada Arafah.</p>
<p>Wukuf di luar sempadan <b>tidak sah</b>. Masuk melepasi garisan dan kekal di dalam kawasan Arafah semasa berdoa.</p>`,
  },
  khutbah: {
    kicker: "Khemah Maktab 87",
    title: "Khutbah dan solat jamak",
    html: `<p>Selepas gelincir matahari, khutbah wukuf disampaikan. Kemudian solat <b>Zohor dan Asar</b> ditunaikan secara <b>jamak taqdim dan qasar</b> (dua rakaat setiap satu) dengan satu azan dan dua iqamah.</p>
<p>Selepas itu, gunakan masa wukuf untuk berdoa, berzikir dan bertaubat hingga matahari terbenam.</p>`,
  },
  muzdalifah: {
    kicker: "Bab 5 · Malam 10 Zulhijjah",
    title: "Mabit di Muzdalifah",
    html: `<p>Selepas matahari terbenam pada 9 Zulhijjah, jemaah bergerak ke <b>Muzdalifah</b>. Solat Maghrib dan Isyak ditunaikan secara jamak ta'khir.</p>
<p><b>Mabit di Muzdalifah</b> ialah wajib haji. Dalam mazhab Syafie, memadai berada di Muzdalifah walaupun seketika selepas tengah malam 10 Zulhijjah.</p>
<p>Kutip batu kecil kira-kira sebesar hujung jari: 7 biji untuk Jamrah Aqabah, dan 21 biji sehari untuk hari Tasyrik (jumlah 49 bagi nafar awal, 70 bagi nafar thani). Batu boleh juga dikutip di tempat lain yang sesuai.</p>
<p class="fact"><b>Tahukah anda?</b> Muzdalifah seluas kira-kira 9.6 km², terletak kira-kira 7 km dari Arafah dan 5 km dari Mina. Lembah Muhassir yang memisahkannya daripada Mina bukan sebahagian daripada Muzdalifah.</p>`,
  },
  masyar: {
    kicker: "Muzdalifah",
    title: "Masy'aril Haram",
    html: `<p>"Maka berzikirlah kepada Allah di Masy'aril Haram" (Al-Baqarah 2:198).</p>
<p>Sunat berhenti di sini, berzikir dan berdoa menghadap kiblat sehingga hampir terbit matahari sebelum bergerak ke Mina.</p>`,
  },
  jamarat: {
    kicker: "Kompleks Jamarat",
    title: "Panduan melontar",
    html: `<p>Lontar dengan tangan kanan, satu biji demi satu biji, sambil bertakbir. Batu mesti jatuh ke dalam <b>takungan</b> jamrah. Jika tersasar, lontar sebiji lagi.</p>
<p><b>10 Zulhijjah:</b> Jamrah Aqabah sahaja, 7 biji. <b>Hari Tasyrik:</b> Ula → Wusta → Aqabah, 7 biji setiap satu, selepas gelincir matahari.</p>
<p>Semakin dekat dengan takungan, semakin tepat lontaran. Jaga keselamatan dan jangan berasak-asak.</p>
<p class="fact"><b>Tahukah anda?</b> Jambatan Jamarat sepanjang kira-kira 950 m dan setiap tingkatnya setinggi 12 m. Sejak 2004, tiang jamrah diganti dengan dinding sepanjang 26 m dalam takungan berbentuk bujur. Dari timur ke barat susunannya ialah Ula, Wusta dan Aqabah, dan Jamrah Aqabah paling hampir dengan Makkah.</p>`,
  },
  nahar: {
    kicker: "Bab 6 · 10 Zulhijjah",
    title: "Hari Nahar",
    html: `<p>Amalan pada <b>10 Zulhijjah</b> (Hari Raya Aidiladha):</p>
<ol><li>Melontar Jamrah Aqabah 7 biji (wajib). Talbiah dihentikan pada lontaran pertama.</li>
<li>Menyembelih dam atau hadyu. Wajib bagi jemaah Tamattu' dan boleh diwakilkan.</li>
<li>Bercukur atau bergunting (rukun).</li>
<li>Tawaf ifadah dan saie haji (rukun).</li></ol>
<p><b>Tahallul awal</b> berlaku selepas dua daripada tiga amalan: lontar Jamrah Aqabah, bercukur atau bergunting, dan tawaf ifadah (bersama saie). Semua larangan ihram terangkat kecuali bersetubuh, bercumbu dan akad nikah.</p>
<p><b>Tahallul thani</b> berlaku selepas ketiga-tiganya selesai.</p>`,
  },
  dam: {
    kicker: "Kaunter dam",
    title: "Dam haji Tamattu'",
    html: `<p>Jemaah haji <b>Tamattu'</b> wajib membayar dam, iaitu menyembelih seekor kambing di Tanah Haram. Penyembelihan boleh diwakilkan kepada pihak yang dilantik.</p>
<p>Jika tidak mampu, gantinya ialah berpuasa 10 hari: 3 hari semasa haji dan 7 hari selepas pulang ke tanah air (Al-Baqarah 2:196).</p>`,
  },
  tasyrik: {
    kicker: "Bab 7 · 11–13 Zulhijjah",
    title: "Hari Tasyrik",
    html: `<p>Pada <b>11, 12 dan 13 Zulhijjah</b>, jemaah wajib bermalam di Mina dan melontar ketiga-tiga jamrah setiap hari selepas gelincir matahari, mengikut tertib <b>Ula → Wusta → Aqabah</b>.</p>
<p>Sunat berdiri menghadap kiblat dan berdoa selepas melontar Jamrah Ula dan Wusta.</p>
<p><b>Nafar awal:</b> keluar dari Mina pada 12 Zulhijjah selepas melontar, sebelum matahari terbenam. <b>Nafar thani:</b> bermalam pada malam 13 dan melontar sekali lagi pada 13 Zulhijjah.</p>
<p>Dalam simulasi ini, lontaran 11 Zulhijjah mewakili hari-hari Tasyrik.</p>`,
  },
  wada: {
    kicker: "Bab 8 · Sebelum pulang",
    title: "Tawaf wada'",
    html: `<p><b>Tawaf wada'</b> (tawaf selamat tinggal) hukumnya wajib dalam mazhab Syafie bagi jemaah yang hendak meninggalkan Makkah. Ia dilakukan sebagai urusan terakhir sebelum berangkat.</p>
<p>Wanita yang haid atau nifas dikecualikan dan tidak dikenakan dam. Tawaf wada' tidak diikuti dengan saie.</p>`,
  },
  // --- Panduan tambahan (dibuka dari Panduan bermain) ---
  kesilapan: {
    kicker: "Panduan jemaah",
    title: "Kesilapan lazim yang perlu dielakkan",
    html: `<p>Kesilapan berikut sering berlaku dan boleh menjejaskan sahnya ibadah atau mewajibkan dam. Semak dengan pembimbing ibadah jika ragu-ragu.</p>
<ul><li><b>Melepasi miqat tanpa berniat ihram.</b> Jemaah wajib kembali ke miqat untuk berniat, atau dikenakan dam.</li>
<li><b>Memulakan tawaf bukan dari Hajarul Aswad.</b> Pusingan yang tidak bermula dari garisan Hajarul Aswad tidak dikira.</li>
<li><b>Masuk ke dalam Hijir Ismail ketika tawaf.</b> Hijir Ismail sebahagian daripada Kaabah, jadi pusingan itu tidak sah dan perlu diulang.</li>
<li><b>Kaabah tidak di sebelah kiri.</b> Berjalan sambil menghadap atau membelakangi Kaabah menjadikan bahagian tawaf itu tidak sah.</li>
<li><b>Bertawaf dalam keadaan berhadas.</b> Jika wuduk terbatal, berhenti, berwuduk semula, kemudian sambung tawaf.</li>
<li><b>Memulakan saie dari Bukit Marwah.</b> Saie mesti bermula di Safa dan berakhir di Marwah.</li>
<li><b>Berwukuf di luar sempadan Arafah</b>, contohnya di Wadi Uranah. Wukuf di luar sempadan tidak sah. Perhatikan papan tanda sempadan.</li>
<li><b>Batu tidak masuk ke dalam takungan jamrah</b>, atau tujuh biji dilontar sekali gus (dikira satu lontaran sahaja). Lontar satu demi satu.</li>
<li><b>Melontar pada hari Tasyrik sebelum gelincir matahari</b>, atau tidak mengikut tertib Ula → Wusta → Aqabah.</li>
<li><b>Melanggar larangan ihram tanpa sedar</b>, seperti memakai wangian, mencabut rambut atau memotong kuku.</li></ul>
<p class="muted">Simulasi ini menegur kesilapan tawaf, saie, wukuf dan melontar semasa kamu bermain.</p>`,
  },
  sesat: {
    kicker: "Panduan jemaah",
    title: "Jika terpisah daripada rombongan",
    html: `<p>Berjuta-juta jemaah berada di tempat yang sama, jadi terpisah daripada rombongan perkara biasa. Bersedialah sebelum ia berlaku.</p>
<p><b>Sebelum keluar:</b></p>
<ul><li>Sentiasa pakai gelang dan kad pengenalan jemaah, dan simpan alamat hotel serta nombor maktab.</li>
<li>Simpan nombor telefon ketua rombongan dan pegawai Tabung Haji. Pastikan telefon dicas penuh.</li>
<li>Tetapkan tempat berkumpul sebelum masuk Masjidil Haram, contohnya nombor pintu tertentu.</li>
<li>Di Mina dan Arafah, hafal nombor maktab, nombor lorong dan papan tanda berhampiran khemah.</li></ul>
<p><b>Jika terpisah:</b></p>
<ul><li>Bertenang. Berhenti di tempat yang selamat dan tidak sesak.</li>
<li>Hubungi ketua rombongan, atau pergi ke tempat berkumpul yang telah dijanjikan.</li>
<li>Minta bantuan petugas haji, polis atau pusat bantuan jemaah sesat. Tunjukkan kad atau gelang pengenalan kamu.</li>
<li>Jangan mengikut orang yang tidak dikenali ke tempat lain.</li></ul>`,
  },
  kesihatan: {
    kicker: "Panduan jemaah",
    title: "Jaga tenaga & kesihatan",
    html: `<p>Cuaca di Makkah, Mina dan Arafah sangat panas. Banyak ibadah haji dilakukan dengan berjalan kaki, jadi tenaga perlu dijaga untuk ibadah wajib.</p>
<ul><li><b>Minum air dengan kerap</b> walaupun tidak haus. Bawa botol air dan isi semula, contohnya di tong air Zamzam.</li>
<li><b>Berteduh.</b> Gunakan payung, elakkan berjalan jauh di tengah hari, dan berehat di dalam khemah.</li>
<li><b>Jangan memaksa diri.</b> Berlari-lari anak (ramal dan di lampu hijau) hukumnya sunat. Simpan tenaga untuk wukuf, melontar dan tawaf.</li>
<li><b>Kenali tanda strok haba:</b> pening, keliru, kulit panas dan kering, atau berhenti berpeluh. Segera bawa pesakit ke tempat teduh, sejukkan badannya dan dapatkan rawatan.</li>
<li>Pakai kasut atau selipar yang selesa. Bawa ubat harian dan ikut nasihat doktor jika menghidap penyakit kronik.</li></ul>
<p class="fact"><b>Dalam game ini:</b> meter <b>tenaga</b> berkurang apabila kamu berjalan, lebih cepat semasa berlari dan di tempat panas pada waktu siang. Berdiri diam untuk berehat, atau tekan <b>Minum</b> (kekunci F) untuk meneguk air. Botol diisi semula di tong Zamzam dan di dalam bas. Ciri ini boleh dimatikan dalam Tetapan.</p>`,
  },
};

// ---------------------------------------------------------------------
//  MODEL 3D LUARAN (.glb daripada Blender) — lihat docs/BLENDER.md
//  Letak fail dalam folder models/ dan senaraikan di sini. Jika fail gagal
//  dimuat (contohnya dibuka terus dari komputer), model asas kekal.
//  Kedudukan x, y dalam piksel dunia 2D (sama seperti m3()). 1 m Blender = 10 px.
// ---------------------------------------------------------------------
interface Model3D {
  scene: SceneId;
  file: string; // laluan relatif, contohnya "models/kaabah.glb"
  x: number;
  y: number;
  rot?: number; // putaran (darjah) mengelilingi paksi menegak
  scale?: number; // skala seragam (lalai 1)
  replace?: M3["k"]; // sembunyikan model asas jenis ini, contohnya "kaabah"
}
// ---------------------------------------------------------------------
//  LAWATAN 360° — titik pandang dalam dunia 3D game (lihat docs/PANORAMA-360.md)
//  x, y & look dalam piksel peta 2D. q = carian Google Maps untuk foto 360° sebenar.
//  img = foto 360° equirectangular (2:1) anda sendiri / berlesen, contohnya
//  "panorama/safa.jpg"; jika diisi, foto itu dipaparkan menggantikan dunia 3D.
// ---------------------------------------------------------------------
interface Pano360 {
  scene: SceneId;
  title: string;
  text: string;
  x: number;
  y: number;
  look: Vec;
  pitch?: number;
  q: string;
  ext?: { label: string; url: string };
  img?: string;
  credit?: string;
  heading?: number; // arah kompas tengah foto 360° (0 = utara, 90 = timur); lalai = arah `look`
}
const LAWATAN: Pano360[] = [
  {
    scene: "miqat",
    title: "Masjid Miqat Bir Ali",
    text: "Miqat Zulhulaifah bagi jemaah dari Madinah, kira-kira 14 km dari Masjid Nabawi. Di sinilah jemaah memakai ihram, solat sunat dua rakaat dan berniat. Menaranya setinggi kira-kira 62 m.",
    x: 0,
    y: -150,
    look: { x: 0, y: -330 },
    pitch: 0.18,
    q: "Dhul Hulaifah Mosque Bir Ali",
  },
  {
    scene: "makkah",
    title: "Pintu King Abdul Aziz",
    text: "Pintu utama di sebelah selatan Masjidil Haram. Masuk dengan kaki kanan sambil membaca doa masuk masjid. Menara Jam (Abraj al-Bait) berdiri di seberang dataran di belakang pintu ini.",
    x: 0,
    y: 650,
    look: { x: 0, y: 0 },
    pitch: 0.12,
    q: "King Abdulaziz Gate Masjid al-Haram",
  },
  {
    scene: "makkah",
    title: "Garisan Hajarul Aswad",
    text: "Setiap pusingan tawaf bermula dan berakhir di garisan ini, segaris dengan Hajarul Aswad di penjuru timur Kaabah. Lampu hijau di dinding menandakannya. Ketika bertawaf, Kaabah sentiasa di sebelah kiri.",
    x: 215,
    y: -25,
    look: { x: 0, y: 0 },
    pitch: 0.12,
    q: "Kaaba Masjid al-Haram",
    ext: { label: "Panorama 360° (360Cities)", url: "https://www.360cities.net/image/al-masjid-al-haram-al-haram-mosque-1" },
  },
  {
    scene: "makkah",
    title: "Maqam Ibrahim",
    text: "Batu tempat Nabi Ibrahim AS berdiri ketika membina Kaabah, kini dalam bekas kaca berbingkai emas. Selepas tawaf, sunat solat dua rakaat di belakangnya jika tidak sesak.",
    x: 112,
    y: -112,
    look: { x: 50, y: -50 },
    pitch: 0.05,
    q: "Maqam Ibrahim",
  },
  {
    scene: "makkah",
    title: "Hijir Ismail",
    text: "Kawasan separuh bulatan berdinding rendah di sisi barat laut Kaabah. Ia sebahagian daripada Kaabah, jadi tawaf mesti di luarnya. Mizab (pancur emas) di bumbung mengalirkan air hujan ke kawasan ini.",
    x: -82,
    y: -82,
    look: { x: 0, y: 0 },
    pitch: 0.15,
    q: "Hijr Ismail Kaaba",
  },
  {
    scene: "makkah",
    title: "Mataf & serambi Uthmaniyah",
    text: "Mataf ialah lantai marmar putih di sekeliling Kaabah tempat bertawaf. Ia dikelilingi serambi Uthmaniyah yang bergerbang dan berkubah kecil, serta mataf bertingkat untuk menampung lebih ramai jemaah.",
    x: 0,
    y: 300,
    look: { x: 0, y: 0 },
    pitch: 0.2,
    q: "Mataf Masjid al-Haram",
  },
  {
    scene: "makkah",
    title: "Bukit Safa",
    text: "Saie bermula di sini. \"Sesungguhnya Safa dan Marwah itu sebahagian daripada syiar agama Allah\" (Al-Baqarah 2:158). Sunat menghadap Kaabah, mengangkat tangan dan berdoa sebelum berjalan ke Marwah.",
    x: 535,
    y: 505,
    look: { x: 535, y: 0 },
    pitch: 0.06,
    q: "Mount Safa Masjid al-Haram",
  },
  {
    scene: "makkah",
    title: "Lampu hijau Mas'a",
    text: "Di antara dua lampu hijau, lelaki disunatkan berlari-lari anak. Wanita berjalan seperti biasa. Jarak Safa ke Marwah kira-kira 395 m, jadi tujuh perjalanan hampir 2.8 km.",
    x: 535,
    y: 165,
    look: { x: 535, y: -200 },
    pitch: 0.15,
    q: "Masaa Safa Marwa",
  },
  {
    scene: "makkah",
    title: "Bukit Marwah",
    text: "Saie berakhir di Marwah selepas perjalanan ketujuh. Selepas itu jemaah umrah bercukur atau bergunting untuk bertahallul.",
    x: 535,
    y: -505,
    look: { x: 535, y: 0 },
    pitch: 0.06,
    q: "Mount Marwah Masjid al-Haram",
  },
  {
    scene: "mina",
    title: "Khemah Mina",
    text: "Mina dikenali sebagai bandar khemah. Jemaah bermalam di sini pada 8 Zulhijjah (sunat) dan pada hari-hari Tasyrik (wajib). Setiap maktab mempunyai nombor khemah sendiri, jadi hafal nombor maktab anda.",
    x: 150,
    y: 150,
    look: { x: 220, y: 230 },
    pitch: 0.12,
    q: "Mina tent city",
  },
  {
    scene: "arafah",
    title: "Jabal Rahmah",
    text: "Bukit setinggi kira-kira 70 m dari dataran Arafah dengan tiang putih di puncaknya. Rasulullah SAW berwukuf berhampiran batu-batu besar di kakinya. Mendaki bukit ini bukan amalan haji; wukuf sah di mana-mana dalam sempadan Arafah.",
    x: 290,
    y: -250,
    look: { x: 430, y: -330 },
    pitch: 0.2,
    q: "Jabal al-Rahmah Arafat",
  },
  {
    scene: "arafah",
    title: "Masjid Namirah",
    text: "Khutbah Arafah disampaikan di masjid ini. Bahagian hadapannya berada dalam Wadi Uranah, iaitu di luar sempadan Arafah. Masjid ini mempunyai enam menara.",
    x: -385,
    y: -290,
    look: { x: -385, y: -420 },
    pitch: 0.22,
    q: "Namirah Mosque Arafat",
  },
  {
    scene: "arafah",
    title: "Sempadan Arafah",
    text: "Papan kuning menandakan sempadan Arafah. Kawasan di seberangnya (Wadi Uranah) bukan sebahagian daripada Arafah. Wukuf di luar sempadan tidak sah.",
    x: -350,
    y: 150,
    look: { x: -600, y: 150 },
    pitch: 0.12,
    q: "Arafat boundary Wadi Uranah",
  },
  {
    scene: "muzdalifah",
    title: "Masy'aril Haram, Muzdalifah",
    text: "\"Maka berzikirlah kepada Allah di Masy'aril Haram\" (Al-Baqarah 2:198). Jemaah bermalam di Muzdalifah dan mengutip batu untuk melontar.",
    x: 0,
    y: -330,
    look: { x: 0, y: -470 },
    pitch: 0.15,
    q: "Al-Mash'ar al-Haram Mosque Muzdalifah",
  },
  {
    scene: "mina",
    title: "Jamrah Aqabah",
    text: "Jamrah paling hampir dengan Makkah, satu-satunya yang dilontar pada 10 Zulhijjah (7 biji). Dinding jamrah memanjang menembusi setiap tingkat Jambatan Jamarat supaya jemaah boleh melontar dari mana-mana tingkat.",
    x: -400,
    y: -345,
    look: { x: -400, y: -420 },
    pitch: 0.3,
    q: "Jamarat Bridge Mina",
  },
];

const MODELS3D: Model3D[] = [
  // Kaabah dibina dengan Blender oleh blender/kaabah.py (termasuk Hijir Ismail, pintu, Mizab & Hajarul Aswad)
  { scene: "makkah", file: "models/kaabah.glb", x: 0, y: 0, replace: "kaabah" },
];

// ---------------------------------------------------------------------
//  KUIZ
// ---------------------------------------------------------------------
interface QuizQ {
  q: string;
  opts: string[];
  ans: number;
  why: string;
}

const QUIZ_UMRAH: QuizQ[] = [
  {
    q: "Berapakah bilangan rukun umrah?",
    opts: ["Empat", "Lima", "Enam", "Tujuh"],
    ans: 1,
    why: "Rukun umrah ada lima: niat ihram, tawaf, saie, bercukur atau bergunting, dan tertib.",
  },
  {
    q: "Semasa tawaf, Kaabah mesti berada di sebelah mana?",
    opts: ["Kanan, mengikut arah jam", "Kiri, berlawanan arah jam", "Hadapan", "Mana-mana arah"],
    ans: 1,
    why: "Tawaf dilakukan berlawanan arah jam dengan Kaabah sentiasa di sebelah kiri, bermula dari Hajarul Aswad.",
  },
  {
    q: "Saie bermula dan berakhir di mana?",
    opts: ["Bermula di Marwah, berakhir di Safa", "Bermula dan berakhir di Safa", "Bermula di Safa, berakhir di Marwah", "Bermula di Hajarul Aswad"],
    ans: 2,
    why: "Safa ke Marwah dikira satu perjalanan. Perjalanan ketujuh berakhir di Marwah.",
  },
  {
    q: "Apakah hukum pusingan tawaf yang melalui bahagian dalam Hijir Ismail?",
    opts: ["Sah seperti biasa", "Tidak sah dan perlu diulang", "Wajib membayar dam", "Menjadi tawaf sunat"],
    ans: 1,
    why: "Hijir Ismail ialah sebahagian daripada Kaabah, jadi tawaf mesti dilakukan di luarnya. Pusingan yang melaluinya tidak dikira.",
  },
];

const QUIZ_FINAL: QuizQ[] = [
  {
    q: "Antara berikut, yang manakah RUKUN haji?",
    opts: ["Bermalam di Muzdalifah", "Wukuf di Arafah", "Melontar Jamrah Aqabah", "Tawaf wada'"],
    ans: 1,
    why: "Wukuf di Arafah ialah rukun haji. Bermalam di Muzdalifah dan melontar Jamrah Aqabah ialah wajib haji, manakala tawaf wada' wajib dilakukan sebelum meninggalkan Makkah.",
  },
  {
    q: "Rukun haji dalam mazhab Syafie ada berapa?",
    opts: ["Lima", "Enam", "Tujuh", "Sepuluh"],
    ans: 1,
    why: "Enam: niat ihram, wukuf di Arafah, tawaf ifadah, saie, bercukur atau bergunting, dan tertib.",
  },
  {
    q: "Apakah hukumnya jika jemaah meninggalkan salah satu WAJIB haji?",
    opts: ["Haji tidak sah", "Haji sah tetapi wajib membayar dam", "Perlu mengulang haji", "Tiada apa-apa kesan"],
    ans: 1,
    why: "Meninggalkan wajib haji tidak membatalkan haji tetapi dikenakan dam. Meninggalkan rukun pula menyebabkan haji tidak sah.",
  },
  {
    q: "Bilakah waktu wukuf di Arafah?",
    opts: [
      "Terbit fajar hingga Zohor 9 Zulhijjah",
      "Gelincir matahari 9 Zulhijjah hingga terbit fajar 10 Zulhijjah",
      "Sepanjang malam 10 Zulhijjah",
      "Selepas Subuh 8 Zulhijjah",
    ],
    ans: 1,
    why: "Wukuf sah jika jemaah hadir di bumi Arafah walaupun seketika dalam tempoh ini.",
  },
  {
    q: "Bermalam di Muzdalifah (mazhab Syafie) memadai dengan…",
    opts: [
      "Berada di sana seketika selepas tengah malam 10 Zulhijjah",
      "Berada di sana sebelum Maghrib",
      "Solat Subuh di sana sahaja",
      "Melintasinya dengan bas",
    ],
    ans: 0,
    why: "Mabit di Muzdalifah ialah wajib haji. Kehadiran seketika selepas tengah malam sudah memadai.",
  },
  {
    q: "Pada 10 Zulhijjah, jamrah manakah yang dilontar?",
    opts: ["Ketiga-tiga jamrah", "Jamrah Ula sahaja", "Jamrah Aqabah sahaja, 7 biji", "Jamrah Wusta dan Aqabah"],
    ans: 2,
    why: "Pada Hari Nahar hanya Jamrah Aqabah dilontar. Ketiga-tiga jamrah dilontar pada hari Tasyrik.",
  },
  {
    q: "Apakah tertib melontar pada hari Tasyrik?",
    opts: ["Aqabah → Wusta → Ula", "Ula → Wusta → Aqabah", "Wusta → Ula → Aqabah", "Tiada tertib"],
    ans: 1,
    why: "Mulakan dengan Jamrah Ula, kemudian Wusta dan akhir sekali Aqabah, 7 biji setiap satu.",
  },
  {
    q: "Tahallul awal berlaku selepas jemaah melakukan…",
    opts: [
      "Satu daripada tiga amalan",
      "Dua daripada tiga: lontar Jamrah Aqabah, bercukur atau bergunting, tawaf ifadah",
      "Wukuf di Arafah sahaja",
      "Tawaf wada'",
    ],
    ans: 1,
    why: "Selepas tahallul awal, larangan ihram terangkat kecuali yang berkaitan hubungan suami isteri dan akad nikah. Selepas ketiga-tiganya, berlaku tahallul thani.",
  },
  {
    q: "Haji Tamattu' bermaksud…",
    opts: [
      "Berniat haji dan umrah serentak",
      "Mengerjakan haji dahulu, kemudian umrah",
      "Mengerjakan umrah dahulu dalam bulan haji, kemudian haji pada tahun yang sama",
      "Mengerjakan haji tanpa ihram",
    ],
    ans: 2,
    why: "Jemaah Tamattu' wajib membayar dam, iaitu seekor kambing, atau berpuasa 10 hari jika tidak mampu.",
  },
  {
    q: "Bilakah tawaf wada' dilakukan?",
    opts: ["Sebaik tiba di Makkah", "Sebelum wukuf", "Sebagai urusan terakhir sebelum meninggalkan Makkah", "Pada 8 Zulhijjah"],
    ans: 2,
    why: "Tawaf wada' wajib dalam mazhab Syafie. Wanita yang haid atau nifas dikecualikan.",
  },
  {
    q: "Antara berikut, yang manakah BUKAN wajib haji?",
    opts: ["Berniat ihram di miqat", "Bermalam di Mina pada hari Tasyrik", "Wukuf di Arafah", "Meninggalkan larangan ihram"],
    ans: 2,
    why: "Wukuf ialah rukun haji. Wajib haji ialah niat ihram di miqat, mabit di Muzdalifah, mabit di Mina, meninggalkan larangan ihram, melontar Jamrah Aqabah pada 10 Zulhijjah dan melontar ketiga-tiga jamrah pada hari Tasyrik.",
  },
];

// ---------------------------------------------------------------------
//  PENCAPAIAN
// ---------------------------------------------------------------------
interface AchDef {
  id: string;
  t: string;
  d: string;
  only?: "L";
}

const ACH_LIST: AchDef[] = [
  { id: "ihram", t: "Tetamu Allah", d: "Memakai ihram dan berniat di miqat" },
  { id: "adab", t: "Adab di mataf", d: "Selesai tawaf dengan kurang daripada 3 kali berlanggar" },
  { id: "ramal", t: "Ramal", d: "Berlari-lari anak pada 3 pusingan pertama tawaf umrah", only: "L" },
  { id: "maqam", t: "Di belakang Maqam Ibrahim", d: "Solat sunat tawaf dua rakaat" },
  { id: "zamzam", t: "Air Zamzam", d: "Minum air Zamzam dan berdoa" },
  { id: "hijau", t: "Lampu hijau", d: "Berlari-lari anak antara dua lampu hijau semasa saie", only: "L" },
  { id: "bukit", t: "Hadap Kaabah", d: "Berdoa di Safa dan Marwah pada setiap perjalanan saie" },
  { id: "arafah", t: "Ahli Arafah", d: "Menyempurnakan wukuf di dalam sempadan Arafah" },
  { id: "batu", t: "Bekalan lengkap", d: "Mengutip sekurang-kurangnya 28 biji batu di Muzdalifah" },
  { id: "tepat", t: "Lontaran tepat", d: "7 lontaran Jamrah Aqabah tanpa tersasar" },
  { id: "quiz", t: "Faham manasik", d: "Skor penuh dalam kuiz akhir" },
  { id: "selesai", t: "Perjalanan sempurna", d: "Melengkapkan semua tugasan" },
];

// Tip yang dipaparkan selepas setiap pusingan tawaf
const LAP_TIPS: string[] = [
  "",
  "Pusingan 1/7 — setiap pusingan bermula dan berakhir di garisan Hajarul Aswad.",
  "Pusingan 2/7 — kekalkan Kaabah di sebelah kiri. Jangan berpusing menghadap atau membelakangi Kaabah.",
  "Pusingan 3/7 — di antara Rukun Yamani dan Hajarul Aswad, sunat membaca doa Rabbana atina.",
  "Pusingan 4/7 — separuh perjalanan! Jaga adab, jangan menolak jemaah lain.",
  "Pusingan 5/7 — tawaf mesti di luar Hijir Ismail kerana ia sebahagian daripada Kaabah.",
  "Pusingan 6/7 — perbanyakkan zikir, doa dan selawat. Tiada doa khusus yang diwajibkan.",
  "Pusingan 7/7 — tawaf selesai. Alhamdulillah!",
];

// ---------------------------------------------------------------------
//  PETA PERJALANAN (jarak anggaran daripada sumber rujukan)
// ---------------------------------------------------------------------
interface MapNode {
  id: SceneId | "madinah";
  name: string;
  x: number; // kedudukan skematik 0–100 (bukan skala sebenar)
  y: number;
  note: string;
  below?: boolean;
}
interface MapLeg {
  from: string;
  to: string;
  km: string;
  when: string;
  step: string; // id langkah bas yang melalui laluan ini
  cx: number; // titik kawalan lengkung (skematik)
  cy: number;
}
const JOURNEY_NODES: MapNode[] = [
  { id: "madinah", name: "Madinah", x: 14, y: 9, note: "Masjid Nabawi" },
  { id: "miqat", name: "Bir Ali", x: 27, y: 19, note: "Miqat Zulhulaifah · ±14 km dari Masjid Nabawi" },
  { id: "makkah", name: "Makkah", x: 22, y: 70, note: "Masjidil Haram: tawaf & saie" },
  { id: "mina", name: "Mina", x: 70, y: 52, note: "±7 km dari Masjidil Haram · ±16.8 km²" },
  { id: "muzdalifah", name: "Muzdalifah", x: 102, y: 66, note: "±10 km dari Masjidil Haram · ±9.6 km²", below: true },
  { id: "arafah", name: "Arafah", x: 142, y: 78, note: "±20–22 km dari Masjidil Haram" },
];
const JOURNEY_LEGS: MapLeg[] = [
  { from: "miqat", to: "makkah", km: "±433 km", when: "Sebelum 8 Zulhijjah", step: "bus_makkah1", cx: 24, cy: 44 },
  { from: "makkah", to: "mina", km: "±7 km", when: "8 Zulhijjah", step: "bus_mina1", cx: 44, cy: 44 },
  { from: "mina", to: "arafah", km: "±12 km", when: "9 Zulhijjah", step: "bus_arafah", cx: 108, cy: 32 },
  { from: "arafah", to: "muzdalifah", km: "±7 km", when: "Malam 10 Zulhijjah", step: "bus_muzdalifah", cx: 124, cy: 88 },
  { from: "muzdalifah", to: "mina", km: "±5 km", when: "10 Zulhijjah", step: "bus_mina2", cx: 86, cy: 68 },
  { from: "mina", to: "makkah", km: "±7 km", when: "10–13 Zulhijjah", step: "bus_makkah2", cx: 44, cy: 82 },
];

// ---------------------------------------------------------------------
//  RUJUKAN
// ---------------------------------------------------------------------
interface Ref {
  t: string;
  src: string;
  url: string;
  use: string;
}
const REFS: Ref[] = [
  { t: "Nota Kursus Asas Haji 1446H, Minggu 3: Rukun & Wajib Haji", src: "Lembaga Tabung Haji", url: "https://tabunghaji.gov.my/sites/default/kah/TH-NOTA%20KAH%201446H%20_%20M3.pdf", use: "Rukun dan wajib haji, miqat, waktu wukuf, syarat dan sunat tawaf" },
  { t: "Panduan Haji Edisi Jemaah Haji Malaysia", src: "Lembaga Tabung Haji", url: "https://assets.tabunghaji.gov.my/uploads/Panduan_Haji_Edisi_Jemaah_Haji_Malaysia_f6c665859a.pdf", use: "Tahallul, mabit, melontar, tawaf" },
  { t: "Kaaba", src: "Wikipedia", url: "https://en.wikipedia.org/wiki/Kaaba", use: "Ukuran Kaabah, arah penjuru, kedudukan pintu, Hijir Ismail, Syazarwan" },
  { t: "Hijr Ismail", src: "Wikipedia", url: "https://en.wikipedia.org/wiki/Hijr_Ismail", use: "Ketinggian dan bentuk dinding Hijir Ismail" },
  { t: "Kaaba's cover elevated ahead of Hajj season", src: "Gulf News", url: "https://gulfnews.com/world/gulf/saudi/saudi-arabia-in-sacred-tradition-kaabas-cover-elevated-ahead-of-hajj-season-1.500127996", use: "Kiswah dinaikkan 3 m, kain putih 2 m" },
  { t: "A guide to the Kaaba's key landmarks", src: "Gulf News", url: "https://gulfnews.com/world/gulf/saudi/saudi-arabia-a-guide-to-the-kaabas-key-landmarks-for-pilgrims-preparing-for-hajj-1.500106100", use: "Multazam, Syazarwan, Maqam Ibrahim" },
  { t: "Sa'y", src: "WikiShia", url: "https://en.wikishia.net/view/Sa'y", use: "Jarak Safa–Marwah ±395 m, kawasan lampu hijau" },
  { t: "Safa and Marwah", src: "Islamic Landmarks", url: "https://www.islamiclandmarks.com/?p=4578", use: "Mas'a dan lampu hijau" },
  { t: "Distance between Makkah, Madinah, Mina, Muzdalifah and Arafah (Fatwa 115065)", src: "IslamWeb", url: "https://islamweb.net/en/printfatwa.php?id=115065", use: "Jarak antara lokasi haji" },
  { t: "Holy Site of Mina", src: "Saudipedia", url: "https://saudipedia.com/en/holy-site-of-mina", use: "Keluasan Mina, khemah, kemudahan Jamarat" },
  { t: "How award-winning Jamarat Bridge provides relief to pilgrims", src: "Arab News", url: "https://www.arabnews.com/node/2119591/saudi-arabia", use: "Panjang jambatan 950 m, tingkat 12 m, takungan bujur" },
  { t: "Stoning of the Devil", src: "Wikipedia", url: "https://en.wikipedia.org/wiki/Stoning_of_the_Devil", use: "Dinding jamrah 26 m, susunan timur ke barat, waktu melontar" },
  { t: "What are the boundaries of the Holy Site of Arafat?", src: "Saudipedia", url: "https://saudipedia.com/en/what-are-the-boundaries-of-the-holy-site-of-arafat", use: "Sempadan Arafah, Wadi Uranah, jarak dari Makkah" },
  { t: "Masjid al-Nimrah (Arafat)", src: "Madain Project", url: "https://madainproject.com/masjid_al_nimrah_(arafat)", use: "Sebahagian masjid dalam Wadi Uranah, enam menara" },
  { t: "Jabal ar Rahmah", src: "PeakVisor", url: "https://peakvisor.com/peak/jabal-ar-rahmah.html", use: "Ketinggian ±70 m dari dataran" },
  { t: "Muzdalifah Holy Site", src: "Saudipedia", url: "https://saudipedia.com/en/muzdalifah-holy-site", use: "Keluasan, Lembah Muhassir, Masjid al-Masy'aril Haram" },
  { t: "Miqat Dhu al-Hulayfah", src: "Saudipedia", url: "https://saudipedia.com/en/miqat-dhu-al-hulayfah", use: "Jarak dari Madinah dan Makkah, menara 62 m" },
  { t: "Hajj simulator Labbaik VR helps Muslims prepare for the holy pilgrimage", src: "Rest of World", url: "https://restofworld.org/2024/divinity-altered-reality-pilgrimage-simulator/", use: "Idea ciri: panduan jika terpisah daripada rombongan" },
  { t: "HAJSIM: Hajj simulator", src: "Universiti Teknologi Malaysia", url: "https://icc.utm.my/project/hajsim/", use: "Idea ciri: pemantauan kecergasan (meter tenaga & air)" },
  { t: "The Free Hajj: Virtual Reality in Manasik Hajj Training Education", src: "ResearchGate", url: "https://www.researchgate.net/publication/352080446_The_Free_Hajj_Virtual_Reality_in_Manasik_Hajj_Training_Education", use: "Idea ciri: narasi audio (pemandu suara)" },
  { t: "iHaji VR Simulasi", src: "Penerbit UTHM", url: "https://penerbit.uthm.edu.my/ojs/index.php/jqsr/article/download/22530/7580/108437", use: "Idea ciri: simulasi rukun & wajib haji secara maya" },
  { t: "Virtualisasi Masjidil Haram", src: "UHAMKA", url: "https://journal.uhamka.ac.id/index.php/teknoka/article/download/754/298/1431", use: "Idea ciri: giroskop untuk memandang sekeliling" },
  { t: "Aplikasi VR 3D pelbagai bahasa untuk panduan haji dan umrah (laporan berita)", src: "Bernama", url: "https://www.bernama.com/en/news.php?id=2307098", use: "Idea ciri: panduan kesilapan lazim jemaah" },
];
const REF_NOTE =
  "Simulasi ini ialah alat bantu pembelajaran. Ukuran dalam game dipermudahkan dan tidak mengikut skala sebenar. Untuk amalan sebenar, rujuk pembimbing ibadah dan panduan rasmi Lembaga Tabung Haji. Ayat al-Quran yang dipetik: Al-Baqarah 2:158, 2:196, 2:198 dan 2:201. Hadis yang dipetik: riwayat al-Bukhari, Muslim dan at-Tirmizi.";
