"use strict";
(() => {
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
};
const DOA = {
    talbiah: {
        title: "Talbiah",
        ar: "لَبَّيْكَ اللّٰهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيْكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيْكَ لَكَ",
        rumi: "Labbaikallahumma labbaik, labbaika la syarika laka labbaik, innal hamda wan ni'mata laka wal mulk, la syarika lak.",
        makna: "Aku datang menyahut seruan-Mu ya Allah, aku datang. Aku datang, tiada sekutu bagi-Mu, aku datang. Sesungguhnya segala puji, nikmat dan kerajaan adalah milik-Mu. Tiada sekutu bagi-Mu.",
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
        makna: "Wahai Tuhan kami, kurniakanlah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab neraka.",
        src: "Al-Baqarah 2:201",
    },
    zamzam: {
        title: "Doa minum air Zamzam",
        ar: "اللّٰهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ",
        rumi: "Allahumma inni as-aluka 'ilman nafi'a, wa rizqan wasi'a, wa syifa-an min kulli da'.",
        makna: "Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang luas dan penyembuhan daripada segala penyakit.",
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
        makna: "Tiada Tuhan melainkan Allah, Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala puji, dan Dia Maha Berkuasa atas segala sesuatu.",
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
const READ = {
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
const MODELS3D = [
    // Kaabah dibina dengan Blender oleh blender/kaabah.py (termasuk Hijir Ismail, pintu, Mizab & Hajarul Aswad)
    { scene: "makkah", file: "models/kaabah.glb", x: 0, y: 0, replace: "kaabah" },
];
const QUIZ_UMRAH = [
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
const QUIZ_FINAL = [
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
const ACH_LIST = [
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
const LAP_TIPS = [
    "",
    "Pusingan 1/7 — setiap pusingan bermula dan berakhir di garisan Hajarul Aswad.",
    "Pusingan 2/7 — kekalkan Kaabah di sebelah kiri. Jangan berpusing menghadap atau membelakangi Kaabah.",
    "Pusingan 3/7 — di antara Rukun Yamani dan Hajarul Aswad, sunat membaca doa Rabbana atina.",
    "Pusingan 4/7 — separuh perjalanan! Jaga adab, jangan menolak jemaah lain.",
    "Pusingan 5/7 — tawaf mesti di luar Hijir Ismail kerana ia sebahagian daripada Kaabah.",
    "Pusingan 6/7 — perbanyakkan zikir, doa dan selawat. Tiada doa khusus yang diwajibkan.",
    "Pusingan 7/7 — tawaf selesai. Alhamdulillah!",
];
const JOURNEY_NODES = [
    { id: "madinah", name: "Madinah", x: 14, y: 9, note: "Masjid Nabawi" },
    { id: "miqat", name: "Bir Ali", x: 27, y: 19, note: "Miqat Zulhulaifah · ±14 km dari Masjid Nabawi" },
    { id: "makkah", name: "Makkah", x: 22, y: 70, note: "Masjidil Haram: tawaf & saie" },
    { id: "mina", name: "Mina", x: 70, y: 52, note: "±7 km dari Masjidil Haram · ±16.8 km²" },
    { id: "muzdalifah", name: "Muzdalifah", x: 102, y: 66, note: "±10 km dari Masjidil Haram · ±9.6 km²", below: true },
    { id: "arafah", name: "Arafah", x: 142, y: 78, note: "±20–22 km dari Masjidil Haram" },
];
const JOURNEY_LEGS = [
    { from: "miqat", to: "makkah", km: "±433 km", when: "Sebelum 8 Zulhijjah", step: "bus_makkah1", cx: 24, cy: 44 },
    { from: "makkah", to: "mina", km: "±7 km", when: "8 Zulhijjah", step: "bus_mina1", cx: 44, cy: 44 },
    { from: "mina", to: "arafah", km: "±12 km", when: "9 Zulhijjah", step: "bus_arafah", cx: 108, cy: 32 },
    { from: "arafah", to: "muzdalifah", km: "±7 km", when: "Malam 10 Zulhijjah", step: "bus_muzdalifah", cx: 124, cy: 88 },
    { from: "muzdalifah", to: "mina", km: "±5 km", when: "10 Zulhijjah", step: "bus_mina2", cx: 86, cy: 68 },
    { from: "mina", to: "makkah", km: "±7 km", when: "10–13 Zulhijjah", step: "bus_makkah2", cx: 44, cy: 82 },
];
const REFS = [
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
const REF_NOTE = "Simulasi ini ialah alat bantu pembelajaran. Ukuran dalam game dipermudahkan dan tidak mengikut skala sebenar. Untuk amalan sebenar, rujuk pembimbing ibadah dan panduan rasmi Lembaga Tabung Haji. Ayat al-Quran yang dipetik: Al-Baqarah 2:158, 2:196, 2:198 dan 2:201. Hadis yang dipetik: riwayat al-Bukhari, Muslim dan at-Tirmizi.";

// =====================================================================
//  Fail 01: UTILITI — matematik, rawak, DOM, storan, bunyi
// =====================================================================
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const wrapPi = (a) => {
    a = (a + Math.PI) % TAU;
    if (a < 0)
        a += TAU;
    return a - Math.PI;
};
function mulberry32(seed) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
let rnd = mulberry32(87);
const rr = (a, b) => a + (b - a) * rnd();
function pick(arr) {
    return arr[Math.floor(rnd() * arr.length)];
}
function gauss() {
    let u = 0;
    let v = 0;
    while (u === 0)
        u = Math.random();
    while (v === 0)
        v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}
function el(id) {
    const e = document.getElementById(id);
    if (!e)
        throw new Error("Elemen #" + id + " tiada");
    return e;
}
function later(fn, ms) {
    window.setTimeout(fn, ms);
}
function esc(s) {
    return s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}
function loadJSON(key) {
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
function saveJSON(key, val) {
    try {
        window.localStorage.setItem(key, JSON.stringify(val));
    }
    catch {
        /* storan tidak tersedia — abaikan */
    }
}
function removeKey(key) {
    try {
        window.localStorage.removeItem(key);
    }
    catch {
        /* abaikan */
    }
}
// Warna: cerahkan (amt > 0) atau gelapkan (amt < 0) warna hex
const shadeCache = new Map();
function shade(hex, amt) {
    const key = hex + amt;
    const hit = shadeCache.get(key);
    if (hit)
        return hit;
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    if (amt >= 0) {
        r += (255 - r) * amt;
        g += (255 - g) * amt;
        b += (255 - b) * amt;
    }
    else {
        r *= 1 + amt;
        g *= 1 + amt;
        b *= 1 + amt;
    }
    const out = `rgb(${r | 0},${g | 0},${b | 0})`;
    shadeCache.set(key, out);
    return out;
}
class Sound {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.amb = null;
        this.on = true;
        this.ambLevel = 0;
    }
    init() {
        if (this.ctx) {
            if (this.ctx.state === "suspended")
                void this.ctx.resume();
            return;
        }
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.55;
            this.master.connect(this.ctx.destination);
            this.makeAmbience();
        }
        catch {
            this.ctx = null;
        }
    }
    makeAmbience() {
        if (!this.ctx || !this.master)
            return;
        const len = this.ctx.sampleRate * 3;
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) {
            const w = Math.random() * 2 - 1;
            last = (last + 0.02 * w) / 1.02;
            d[i] = last * 3.2;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const lp = this.ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 520;
        this.amb = this.ctx.createGain();
        this.amb.gain.value = 0;
        src.connect(lp).connect(this.amb).connect(this.master);
        src.start();
    }
    setAmbience(level) {
        this.ambLevel = level;
        if (!this.ctx || !this.amb)
            return;
        this.amb.gain.setTargetAtTime(this.on ? level * 0.09 : 0, this.ctx.currentTime, 0.6);
    }
    toggle() {
        this.on = !this.on;
        this.setAmbience(this.ambLevel);
        return this.on;
    }
    tone(freq, dur, type, vol, at = 0, slide = 0) {
        if (!this.ctx || !this.master)
            return;
        const t0 = this.ctx.currentTime + at;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t0);
        if (slide)
            o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g).connect(this.master);
        o.start(t0);
        o.stop(t0 + dur + 0.05);
    }
    noise(dur, vol, freq, at = 0) {
        if (!this.ctx || !this.master)
            return;
        const t0 = this.ctx.currentTime + at;
        const len = Math.floor(this.ctx.sampleRate * dur);
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++)
            d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const s = this.ctx.createBufferSource();
        s.buffer = buf;
        const f = this.ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.value = vol;
        s.connect(f).connect(g).connect(this.master);
        s.start(t0);
    }
    play(name) {
        if (!this.ctx || !this.on)
            return;
        switch (name) {
            case "tap":
                this.tone(660, 0.06, "triangle", 0.08);
                break;
            case "ok":
                this.tone(659, 0.14, "triangle", 0.16);
                this.tone(988, 0.22, "triangle", 0.14, 0.09);
                break;
            case "lap":
                this.tone(523, 0.12, "sine", 0.16);
                this.tone(659, 0.12, "sine", 0.16, 0.08);
                this.tone(784, 0.26, "sine", 0.16, 0.16);
                break;
            case "done":
                [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.3, "triangle", 0.15, i * 0.09));
                break;
            case "ach":
                [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.26, "sine", 0.12, i * 0.07));
                break;
            case "err":
                this.tone(220, 0.22, "sawtooth", 0.07, 0, -60);
                break;
            case "pick":
                this.tone(880, 0.07, "sine", 0.12, 0, 380);
                break;
            case "throw":
                this.noise(0.18, 0.18, 1400);
                break;
            case "hit":
                this.noise(0.09, 0.3, 500);
                this.tone(160, 0.08, "sine", 0.18);
                break;
            case "miss":
                this.noise(0.12, 0.12, 2600);
                break;
            case "bus":
                this.tone(120, 0.5, "sawtooth", 0.05, 0, 40);
                break;
        }
    }
}
const SND = new Sound();

// =====================================================================
//  Fail 02: LUKISAN — primitif kanvas, watak jemaah, prop umum
//  Unjuran "3/4 atas": paksi y ke selatan, objek tinggi dilukis ke atas.
// =====================================================================
let M3_TARGET = null;
function m3(d) {
    if (M3_TARGET)
        M3_TARGET.push(d);
}
// Apabila true, lantai dilukis rata (untuk tekstur lantai 3D) — dinding menegak tidak dilukis
let FLAT_GROUND = false;
// Kawasan dunia yang kelihatan (dikemas kini setiap bingkai)
const VIEW = { x0: 0, y0: 0, x1: 0, y1: 0 };
function inView(x, y, m = 90) {
    return x > VIEW.x0 - m && x < VIEW.x1 + m && y > VIEW.y0 - m && y < VIEW.y1 + m * 2;
}
function ell(c, x, y, rx, ry) {
    c.beginPath();
    c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU);
}
function circ(c, x, y, r) {
    c.beginPath();
    c.arc(x, y, Math.max(0.1, r), 0, TAU);
}
function rrect(c, x, y, w, h, r) {
    const k = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath();
    c.moveTo(x + k, y);
    c.arcTo(x + w, y, x + w, y + h, k);
    c.arcTo(x + w, y + h, x, y + h, k);
    c.arcTo(x, y + h, x, y, k);
    c.arcTo(x, y, x + w, y, k);
    c.closePath();
}
function poly(c, pts) {
    c.beginPath();
    c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2)
        c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
}
function line(c, x1, y1, x2, y2) {
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
}
// Kotak 3/4: tapak (x,y,w,d), tinggi h. Muka hadapan (selatan) + bumbung.
function box(c, x, y, w, d, h, col, top) {
    c.fillStyle = shade(col, -0.13);
    c.fillRect(x, y + d - h, w, h);
    c.fillStyle = top ?? shade(col, 0.1);
    c.fillRect(x, y - h, w, d);
    c.strokeStyle = "rgba(50,35,15,.22)";
    c.lineWidth = 1;
    c.strokeRect(x + 0.5, y - h + 0.5, w - 1, d - 1);
    c.strokeRect(x + 0.5, y + d - h + 0.5, w - 1, h - 1);
}
function shadowBox(c, x, y, w, d, off = 12) {
    c.fillStyle = "rgba(60,40,10,.16)";
    poly(c, [x + off, y + d, x + w + off, y + d, x + w + off, y + d * 0.2, x + w, y]);
    c.fill();
}
function dome(c, cx, by, r, col) {
    c.fillStyle = col;
    c.beginPath();
    c.ellipse(cx, by, r, r * 0.92, 0, Math.PI, TAU);
    c.closePath();
    c.fill();
    c.strokeStyle = "rgba(50,35,15,.2)";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "rgba(255,255,255,.35)";
    c.beginPath();
    c.ellipse(cx - r * 0.35, by - r * 0.45, r * 0.22, r * 0.32, -0.5, 0, TAU);
    c.fill();
    c.fillStyle = "#c9a24a";
    c.fillRect(cx - 0.8, by - r * 0.92 - 9, 1.6, 9);
    circ(c, cx, by - r * 0.92 - 10, 2);
    c.fill();
}
function archRow(c, x, y, w, h, n, col) {
    const gap = w / n;
    c.fillStyle = col;
    for (let i = 0; i < n; i++) {
        const ax = x + gap * i + gap * 0.18;
        const aw = gap * 0.64;
        c.beginPath();
        c.moveTo(ax, y + h);
        c.lineTo(ax, y + aw * 0.5);
        c.arc(ax + aw / 2, y + aw * 0.5, aw / 2, Math.PI, TAU);
        c.lineTo(ax + aw, y + h);
        c.closePath();
        c.fill();
    }
}
function windowGrid(c, x, y, w, h, cols, rows, col) {
    const gx = w / cols;
    const gy = h / rows;
    c.fillStyle = col;
    for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++)
            c.fillRect(x + gx * i + gx * 0.22, y + gy * j + gy * 0.22, gx * 0.56, gy * 0.5);
}
function gridLines(c, x0, y0, x1, y1, step, col) {
    const ax0 = Math.max(x0, VIEW.x0 - step);
    const ax1 = Math.min(x1, VIEW.x1 + step);
    const ay0 = Math.max(y0, VIEW.y0 - step);
    const ay1 = Math.min(y1, VIEW.y1 + step);
    if (ax1 <= ax0 || ay1 <= ay0)
        return;
    c.strokeStyle = col;
    c.lineWidth = 1;
    c.beginPath();
    for (let x = Math.ceil((ax0 - x0) / step) * step + x0; x <= ax1; x += step) {
        c.moveTo(x, ay0);
        c.lineTo(x, ay1);
    }
    for (let y = Math.ceil((ay0 - y0) / step) * step + y0; y <= ay1; y += step) {
        c.moveTo(ax0, y);
        c.lineTo(ax1, y);
    }
    c.stroke();
}
const SKINS = ["#f1c9a1", "#e2ae80", "#c88c5c", "#a06d45", "#7d5132", "#f5d6ba", "#d9a073"];
const HAIRS = ["#1d1a17", "#2b211b", "#3b2b1f", "#141414", "#5b4a3c"];
const OUTFIT_L = ["#dfe7ee", "#e9e1cf", "#c9d6cf", "#d8d2e6", "#f1eee6", "#bfcfdf"];
const OUTFIT_P = ["#e7d6e8", "#cfdcea", "#e9dcc6", "#d4e3d6", "#efe3e3", "#d6d0ea"];
const SCARF_P = ["#b9a3c9", "#8fb0cf", "#d3b48a", "#9cc1a4", "#e0b3b3", "#f4efe6"];
function mkPerson(g, ihram = true) {
    const gender = g ?? (rnd() < 0.56 ? "L" : "P");
    const p = {
        x: 0,
        y: 0,
        gender,
        skin: pick(SKINS),
        hair: pick(HAIRS),
        outfit: gender === "L" ? pick(OUTFIT_L) : pick(OUTFIT_P),
        acc: pick(SCARF_P),
        ihram,
        shaved: false,
        dx: 0,
        dy: 1,
        walk: rr(0, 6),
        moving: false,
        pose: "stand",
    };
    // Sebahagian jemaah wanita memakai ihram berwarna lembut
    if (gender === "P" && rnd() < 0.18)
        p.acc = pick(SCARF_P);
    return p;
}
const LINE_COL = "rgba(70,70,82,.32)";
function drawPerson(c, p) {
    const s = p.scale ?? 1;
    c.save();
    c.translate(p.x, p.y);
    if (s !== 1)
        c.scale(s, s);
    c.fillStyle = "rgba(50,35,10,.22)";
    ell(c, 0, 0, 9, 3.6);
    c.fill();
    const female = p.gender === "P";
    const body = p.ihram ? "#fbfbf6" : p.outfit;
    c.lineWidth = 0.8;
    c.strokeStyle = LINE_COL;
    if (p.pose === "sleep") {
        c.fillStyle = body;
        rrect(c, -13, -8, 22, 9, 4);
        c.fill();
        c.stroke();
        c.fillStyle = female ? (p.ihram ? "#ffffff" : p.acc) : p.skin;
        circ(c, 11, -4.5, 5);
        c.fill();
        c.stroke();
        c.restore();
        return;
    }
    const mv = p.moving ? 1 : 0;
    const sw = Math.sin(p.walk);
    const bob = mv * Math.abs(sw) * 1.2;
    const sit = p.pose === "sit";
    const back = p.dy < -0.4 && Math.abs(p.dy) >= Math.abs(p.dx) * 0.8;
    const side = Math.abs(p.dx) > 0.35 ? Math.sign(p.dx) : 0;
    if (!sit) {
        c.fillStyle = "#7a5534";
        ell(c, -3, -1.2 - Math.max(0, sw) * 2 * mv, 2.4, 1.6);
        c.fill();
        ell(c, 3, -1.2 - Math.max(0, -sw) * 2 * mv, 2.4, 1.6);
        c.fill();
    }
    const top = sit ? -14 : -22 - bob;
    const bot = sit ? -1 : -2.5 - bob * 0.4;
    c.fillStyle = body;
    if (female)
        poly(c, [-6, top + 1, 6, top + 1, 8.6, bot, -8.6, bot]);
    else
        rrect(c, -7, top, 14, bot - top, 4.5);
    c.fill();
    c.stroke();
    // tangan
    if (p.pose === "pray") {
        c.fillStyle = p.skin;
        circ(c, -7.6, top - 1, 2.2);
        c.fill();
        circ(c, 7.6, top - 1, 2.2);
        c.fill();
    }
    else if (p.pose === "throw") {
        c.fillStyle = body;
        ell(c, -7.6, top + 7, 2.4, 5);
        c.fill();
        c.stroke();
        c.fillStyle = p.skin;
        circ(c, 8, top - 7, 2.3);
        c.fill();
    }
    else {
        c.fillStyle = female && !p.ihram ? shade(p.outfit, -0.06) : body;
        ell(c, -7.6, top + 7 + sw * mv, 2.4, 5);
        c.fill();
        c.stroke();
        ell(c, 7.6, top + 7 - sw * mv, 2.4, 5);
        c.fill();
        c.stroke();
    }
    if (!female && p.ihram) {
        c.strokeStyle = "rgba(120,120,130,.5)";
        line(c, -7, top + 10, 7, top + 10);
        line(c, -6, top + 1.5, 6, top + 10);
        if (!back) {
            c.fillStyle = p.skin;
            ell(c, -4.4, top + 2.6, 2.6, 2);
            c.fill();
        }
    }
    else if (!female) {
        c.strokeStyle = shade(p.outfit, -0.28);
        line(c, 0, top + 1.5, 0, top + 7);
    }
    // kepala
    const hy = top - 6.5;
    c.strokeStyle = LINE_COL;
    if (female) {
        const scarf = p.ihram ? "#ffffff" : p.acc;
        c.fillStyle = scarf;
        poly(c, [-8.4, hy + 1, 8.4, hy + 1, 9.6, top + 7, -9.6, top + 7]);
        c.fill();
        circ(c, 0, hy, 8.2);
        c.fill();
        c.stroke();
        if (!back) {
            c.fillStyle = p.skin;
            ell(c, side * 1.6, hy + 0.9, 4.6, 5);
            c.fill();
            c.fillStyle = "#2a2018";
            circ(c, side * 2.3 - 1.8, hy + 0.5, 0.9);
            c.fill();
            circ(c, side * 2.3 + 1.8, hy + 0.5, 0.9);
            c.fill();
        }
    }
    else {
        c.fillStyle = p.skin;
        circ(c, 0, hy, 7);
        c.fill();
        c.stroke();
        if (!p.ihram) {
            c.fillStyle = "#f8f6ef";
            c.beginPath();
            c.arc(0, hy - 0.6, 7.4, Math.PI, TAU);
            c.closePath();
            c.fill();
            c.stroke();
        }
        else if (p.shaved) {
            c.fillStyle = shade(p.skin, -0.14);
            c.beginPath();
            c.arc(0, hy - 0.2, 7, Math.PI * 1.05, Math.PI * 1.95);
            c.closePath();
            c.fill();
        }
        else {
            c.fillStyle = p.hair;
            if (back) {
                circ(c, 0, hy, 7.1);
                c.fill();
            }
            else {
                c.beginPath();
                c.arc(0, hy - 0.3, 7.2, Math.PI * 1.02, Math.PI * 1.98);
                c.closePath();
                c.fill();
            }
        }
        if (!back) {
            c.fillStyle = "#2a2018";
            circ(c, side * 2.3 - 2.4, hy + 1, 0.95);
            c.fill();
            circ(c, side * 2.3 + 2.4, hy + 1, 0.95);
            c.fill();
        }
    }
    c.restore();
}
// ---------------------------------------------------------------------
//  PROP UMUM
// ---------------------------------------------------------------------
function palmProp(x, y, h = 54) {
    m3({ k: "palm", x, y, h });
    return {
        y,
        draw: (c) => {
            c.fillStyle = "rgba(40,60,20,.16)";
            ell(c, x + 10, y + 2, 20, 7);
            c.fill();
            c.strokeStyle = "#8b6a44";
            c.lineWidth = 4.5;
            c.lineCap = "round";
            c.beginPath();
            c.moveTo(x, y);
            c.quadraticCurveTo(x + 7, y - h * 0.55, x + 3, y - h);
            c.stroke();
            c.lineCap = "butt";
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * TAU + 0.3;
                c.save();
                c.translate(x + 3, y - h);
                c.rotate(a);
                c.fillStyle = i % 2 ? "#3d8a4a" : "#4ea35a";
                ell(c, 12, 2, 13, 3.6);
                c.fill();
                c.restore();
            }
            c.fillStyle = "#6b4f2e";
            circ(c, x + 3, y - h + 2, 3.2);
            c.fill();
        },
    };
}
function treeProp(x, y, s = 1) {
    m3({ k: "tree", x, y, s });
    return {
        y,
        draw: (c) => {
            c.fillStyle = "rgba(40,60,20,.18)";
            ell(c, x + 6 * s, y + 2, 22 * s, 8 * s);
            c.fill();
            c.fillStyle = "#7d5c3a";
            c.fillRect(x - 2.5 * s, y - 18 * s, 5 * s, 18 * s);
            const blobs = [
                [-10, -27, 12],
                [10, -28, 12],
                [0, -38, 13],
                [0, -25, 13],
            ];
            c.fillStyle = "#3e7a3a";
            for (const [bx, by, br] of blobs) {
                circ(c, x + bx * s, y + by * s, br * s);
                c.fill();
            }
            c.fillStyle = "#5c9c4c";
            for (const [bx, by, br] of blobs) {
                circ(c, x + (bx - 3) * s, y + (by - 4) * s, br * 0.5 * s);
                c.fill();
            }
        },
    };
}
function boardProp(x, y, title, col = "#145a43") {
    m3({ k: "board", x, y, title, col });
    return {
        y,
        draw: (c) => {
            c.fillStyle = "rgba(0,0,0,.15)";
            ell(c, x + 4, y + 1, 24, 5);
            c.fill();
            c.fillStyle = "#6a5034";
            c.fillRect(x - 17, y - 30, 3, 30);
            c.fillRect(x + 14, y - 30, 3, 30);
            c.fillStyle = col;
            rrect(c, x - 27, y - 54, 54, 30, 4);
            c.fill();
            c.strokeStyle = "#f3d488";
            c.lineWidth = 1.5;
            c.stroke();
            c.fillStyle = "#ffffff";
            c.font = "700 7px Nunito, sans-serif";
            c.textAlign = "center";
            c.textBaseline = "alphabetic";
            c.fillText(title, x, y - 43, 48);
            c.fillStyle = "rgba(243,212,136,.8)";
            c.fillRect(x - 19, y - 38, 38, 1.5);
            c.fillRect(x - 15, y - 34, 30, 1.5);
            c.fillRect(x - 17, y - 30, 34, 1.5);
        },
    };
}
function lampProp(x, y, warm = "#ffe9a8") {
    m3({ k: "lamp", x, y });
    return {
        y,
        draw: (c) => {
            c.fillStyle = "rgba(0,0,0,.14)";
            ell(c, x + 3, y + 1, 7, 3);
            c.fill();
            c.fillStyle = "#596260";
            c.fillRect(x - 1.5, y - 62, 3, 62);
            c.fillStyle = "#3b403f";
            c.fillRect(x - 7, y - 68, 14, 6);
            c.fillStyle = warm;
            circ(c, x, y - 61, 3.6);
            c.fill();
        },
    };
}
function minaretProp(x, y, h = 150, col = "#efe8da") {
    m3({ k: "minaret", x, y, h, col });
    return {
        y,
        draw: (c) => {
            c.fillStyle = "rgba(60,40,10,.15)";
            ell(c, x + 18, y + 3, 26, 7);
            c.fill();
            c.fillStyle = shade(col, -0.1);
            c.fillRect(x - 9, y - h, 18, h);
            c.fillStyle = shade(col, 0.08);
            c.fillRect(x - 9, y - h, 6, h);
            c.fillStyle = shade(col, -0.22);
            for (const f of [0.34, 0.62, 0.86])
                c.fillRect(x - 12, y - h * f - 4, 24, 5);
            c.fillStyle = shade(col, -0.05);
            c.fillRect(x - 7, y - h - 14, 14, 14);
            c.fillStyle = "#c9a24a";
            poly(c, [x - 8, y - h - 14, x + 8, y - h - 14, x, y - h - 40]);
            c.fill();
            circ(c, x, y - h - 44, 2.4);
            c.fill();
        },
    };
}
function busProp(x, y, w = 140, d = 44) {
    m3({ k: "bus", x, y, w, d });
    return {
        y: y + d,
        draw: (c) => {
            shadowBox(c, x, y, w, d, 14);
            box(c, x, y, w, d, 42, "#f3f2ec", "#ffffff");
            c.fillStyle = "#16634c";
            c.fillRect(x, y + d - 19, w, 6);
            c.fillStyle = "#d9a83c";
            c.fillRect(x, y + d - 13, w, 2);
            c.fillStyle = "#2f4a5a";
            for (let i = 0; i < Math.floor((w - 16) / 22); i++)
                c.fillRect(x + 8 + i * 22, y + d - 38, 16, 13);
            c.fillStyle = "#1e1e1e";
            ell(c, x + 26, y + d, 9, 4);
            c.fill();
            ell(c, x + w - 26, y + d, 9, 4);
            c.fill();
            c.fillStyle = "#16634c";
            c.font = "800 9px Nunito, sans-serif";
            c.textAlign = "center";
            c.fillText("BAS JEMAAH", x + w / 2, y - 42 + d / 2 + 3);
        },
    };
}
function tentProp(x, y, w, d, col = "#fbfbf7", hl = false) {
    m3({ k: "tent", x, y, w, d, col, hl });
    return {
        y: y + d,
        draw: (c) => {
            const wall = 14;
            const apexH = 40;
            c.fillStyle = "rgba(60,40,10,.14)";
            poly(c, [x + 8, y + d + 2, x + w + 16, y + d + 2, x + w + 16, y + 6, x + w, y]);
            c.fill();
            c.fillStyle = shade(col, -0.1);
            c.fillRect(x, y + d - wall, w, wall);
            const ax = x + w / 2;
            const ay = y + d / 2 - apexH;
            const tl = [x, y - wall];
            const tr = [x + w, y - wall];
            const br = [x + w, y + d - wall];
            const bl = [x, y + d - wall];
            c.fillStyle = shade(col, -0.04);
            poly(c, [tl[0], tl[1], tr[0], tr[1], ax, ay]);
            c.fill();
            c.fillStyle = shade(col, -0.15);
            poly(c, [tl[0], tl[1], bl[0], bl[1], ax, ay]);
            c.fill();
            c.fillStyle = shade(col, -0.07);
            poly(c, [tr[0], tr[1], br[0], br[1], ax, ay]);
            c.fill();
            c.fillStyle = col;
            poly(c, [bl[0], bl[1], br[0], br[1], ax, ay]);
            c.fill();
            c.strokeStyle = "rgba(120,110,90,.35)";
            c.lineWidth = 1;
            line(c, bl[0], bl[1], ax, ay);
            line(c, br[0], br[1], ax, ay);
            c.fillStyle = shade(col, -0.32);
            c.fillRect(ax - 6, y + d - wall, 12, wall);
            if (hl) {
                c.fillStyle = "#d9a83c";
                c.fillRect(x, y + d - wall, w, 3);
                c.fillStyle = "#6a5034";
                c.fillRect(ax - 1, ay - 26, 2, 26);
                c.fillStyle = "#16634c";
                poly(c, [ax + 1, ay - 26, ax + 18, ay - 21, ax + 1, ay - 16]);
                c.fill();
            }
        },
    };
}
function rockCluster(cx, cy, w, seed, col = "#9a8a73") {
    const r = mulberry32(seed);
    const rocks = [];
    for (let i = 0; i < 9; i++)
        rocks.push({ x: cx + (r() - 0.5) * w, y: cy + (r() - 0.5) * w * 0.35, s: 12 + r() * 18, h: 6 + r() * 16, k: r() });
    rocks.sort((a, b) => a.y - b.y);
    m3({ k: "rocks", x: cx, y: cy, w, seed, col });
    return {
        y: cy + w * 0.18,
        draw: (c) => {
            for (const k of rocks) {
                const base = k.k > 0.5 ? col : shade(col, -0.1);
                c.fillStyle = shade(base, -0.18);
                poly(c, [k.x - k.s, k.y, k.x - k.s * 0.6, k.y - k.h, k.x + k.s * 0.5, k.y - k.h * 1.1, k.x + k.s, k.y]);
                c.fill();
                c.fillStyle = shade(base, 0.12);
                poly(c, [k.x - k.s * 0.6, k.y - k.h, k.x + k.s * 0.5, k.y - k.h * 1.1, k.x + k.s * 0.2, k.y - k.h * 1.4 - 3, k.x - k.s * 0.4, k.y - k.h * 1.3]);
                c.fill();
            }
        },
    };
}

// =====================================================================
//  Fail 03: LOKASI — Miqat, Makkah, Mina, Arafah, Muzdalifah
// =====================================================================
const SCENE_NAMES = {
    miqat: "Miqat Bir Ali",
    makkah: "Masjidil Haram",
    mina: "Mina",
    arafah: "Arafah",
    muzdalifah: "Muzdalifah",
};
// ---------- Geometri penting ----------
const MATAF_R = 330;
const KS = 58; // separuh pepenjuru tapak Kaabah
const KH = 64; // tinggi Kaabah
const HIJR = { x: -29, y: -29, r: 40 };
const MASA = { x0: 470, x1: 600, safaY: 470, marwahY: -470, g1: 100, g2: 230 };
const ARAFAH_X = -380;
const JAM = {
    // Susunan timur → barat: Ula, Wusta, Aqabah (Aqabah paling hampir dengan Makkah)
    ula: { x: 400, y: -420, rx: 86, ry: 38, name: "Jamrah Ula" },
    wusta: { x: 100, y: -420, rx: 86, ry: 38, name: "Jamrah Wusta" },
    aqabah: { x: -400, y: -420, rx: 86, ry: 38, name: "Jamrah Aqabah" },
};
const POS = {
    miqat: { board: { x: -120, y: 126 }, bilik: { x: -430, y: 26 }, masjid: { x: 0, y: -176 }, bus: { x: 320, y: 312 } },
    makkah: {
        board: { x: 0, y: 672 },
        line: { x: 200, y: 0 },
        safa: { x: 535, y: 520 },
        marwah: { x: 535, y: -520 },
        barber: { x: 730, y: -476 },
        hotel: { x: -570, y: 884 },
        bus: { x: 370, y: 898 },
        maqamPray: { x: 92, y: -92 },
        zam1: { x: 328, y: -153 },
        zam2: { x: -328, y: 153 },
    },
    mina: {
        tent: { x: 190, y: 216 },
        dam: { x: -625, y: 92 },
        barber: { x: -625, y: 268 },
        board: { x: -260, y: -262 },
        patch: { x: -540, y: 440 },
        bus: { x: -585, y: 600 },
    },
    arafah: { khemah: { x: 150, y: -42 }, board: { x: -350, y: 336 }, bus: { x: -585, y: 410 } },
    muzdalifah: { mat: { x: 200, y: 182 }, masyar: { x: 0, y: -362 }, bus: { x: -585, y: 410 } },
};
// ---------- Pembina asas ----------
function newScene(id, b, spawn, busPos, mPerPx, bg) {
    const sc = {
        id,
        name: SCENE_NAMES[id],
        bounds: b,
        spawn,
        busPos,
        mPerPx,
        bg,
        solids: [],
        props: [],
        interacts: [],
        npcs: [],
        labels: [],
        pebbles: [],
        lights: [],
        ground: () => undefined,
        mini: () => undefined,
        ambient: 0.4,
        m3: [],
    };
    M3_TARGET = sc.m3;
    return sc;
}
function mkNPC(mode, p) {
    return {
        p,
        mode,
        a: 0,
        rad: 0,
        w: 0,
        ph: rr(0, TAU),
        axis: "y",
        lo: 0,
        hi: 0,
        dir: 1,
        sp: rr(30, 55),
        tx: p.x,
        ty: p.y,
        wait: rr(0, 3),
        pickT: null,
        jx: 0,
        jy: 0,
        cd: rr(0.5, 4),
        normal: false,
    };
}
function addWanderers(sc, n, x0, y0, x1, y1, ihram = true) {
    for (let i = 0; i < n; i++) {
        const p = mkPerson(undefined, ihram);
        p.x = rr(x0, x1);
        p.y = rr(y0, y1);
        const npc = mkNPC("wander", p);
        npc.pickT = () => ({ x: rr(x0, x1), y: rr(y0, y1) });
        npc.tx = p.x;
        npc.ty = p.y;
        npc.normal = !ihram;
        sc.npcs.push(npc);
    }
}
function addStatic(sc, x, y, pose, ihram = true, g) {
    const p = mkPerson(g, ihram);
    p.x = x;
    p.y = y;
    p.pose = pose;
    p.dy = rnd() < 0.5 ? 1 : -1;
    p.dx = rr(-0.5, 0.5);
    sc.npcs.push(mkNPC("static", p));
}
function addLane(sc, axis, fixed, lo, hi, ihram = true) {
    const p = mkPerson(undefined, ihram);
    const n = mkNPC("lane", p);
    n.axis = axis;
    n.lo = lo;
    n.hi = hi;
    n.dir = rnd() < 0.5 ? 1 : -1;
    n.sp = rr(38, 66);
    if (axis === "y") {
        p.x = fixed;
        p.y = rr(lo, hi);
    }
    else {
        p.y = fixed;
        p.x = rr(lo, hi);
    }
    sc.npcs.push(n);
}
function busInteract(pos) {
    return {
        id: "bus",
        x: pos.x,
        y: pos.y,
        r: 82,
        icon: "bus",
        ring: true,
        label: () => {
            const t = curStep()?.travel;
            return t ? "NAIK BAS\n" + SCENE_NAMES[t].toUpperCase() : "BAS JEMAAH";
        },
        enabled: () => !!curStep()?.travel,
        locked: () => {
            const st = curStep();
            return st ? `Bas belum bertolak. Selesaikan dahulu: ${st.text}.` : "Semua tugasan sudah selesai.";
        },
        action: () => {
            const t = curStep()?.travel;
            if (t)
                travelTo(t);
        },
    };
}
function boardInteract(id, pos, readKey, after) {
    return {
        id,
        x: pos.x,
        y: pos.y,
        r: 58,
        icon: "book",
        ring: true,
        label: () => "BACA PAPAN",
        enabled: () => true,
        action: () => openReading(readKey, after),
    };
}
function tentGrid(sc, x0, y0, cols, rows, sx, sy, w, d, hlCell) {
    for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) {
            const x = x0 + i * sx;
            const y = y0 + j * sy;
            const hl = !!hlCell && hlCell[0] === i && hlCell[1] === j;
            sc.props.push(tentProp(x, y, w, d, hl ? "#fffdf2" : "#fbfbf7", hl));
            sc.solids.push({ t: "r", x, y, w, h: d });
        }
}
// =====================================================================
//  MIQAT BIR ALI
// =====================================================================
function buildMiqat() {
    const sc = newScene("miqat", { x0: -560, y0: -470, x1: 560, y1: 490 }, { x: 250, y: 240 }, POS.miqat.bus, 0.25, "#e8d6ae");
    sc.ambient = 0.25;
    // Masjid
    sc.solids.push({ t: "r", x: -230, y: -430, w: 460, h: 220 });
    m3({ k: "bld", x: -230, y: -430, w: 460, d: 220, h: 70, col: "#f0e9da", style: "arch", sign: "MASJID MIQAT", domes: [{ x: 0, y: -320, r: 62 }, { x: -150, y: -320, r: 28 }, { x: 150, y: -320, r: 28 }] });
    sc.props.push({
        y: -210,
        draw: (c) => {
            shadowBox(c, -230, -430, 460, 220, 22);
            box(c, -230, -430, 460, 220, 70, "#f0e9da", "#f7f2e8");
            archRow(c, -220, -270, 440, 60, 9, "#b9a681");
            c.fillStyle = "#5b4a32";
            rrect(c, -22, -262, 44, 52, 6);
            c.fill();
            dome(c, 0, -360, 70, "#e9e2d2");
            dome(c, -150, -330, 30, "#e9e2d2");
            dome(c, 150, -330, 30, "#e9e2d2");
            c.fillStyle = "#16634c";
            c.font = "800 11px Nunito, sans-serif";
            c.textAlign = "center";
            c.fillText("MASJID MIQAT", 0, -274);
        },
    });
    sc.props.push(minaretProp(280, -250, 170));
    sc.solids.push({ t: "c", x: 280, y: -250, r: 14 });
    // Bilik persalinan
    sc.solids.push({ t: "r", x: -530, y: -150, w: 200, h: 150 });
    m3({ k: "bld", x: -530, y: -150, w: 200, d: 150, h: 50, col: "#e8dcc6", style: "plain", sign: "BILIK MANDI & PERSALINAN" });
    sc.props.push({
        y: 0,
        draw: (c) => {
            shadowBox(c, -530, -150, 200, 150, 14);
            box(c, -530, -150, 200, 150, 50, "#e8dcc6");
            c.fillStyle = "#6c5a40";
            rrect(c, -446, -40, 32, 40, 4);
            c.fill();
            c.fillStyle = "#145a43";
            rrect(c, -510, -48, 70, 16, 3);
            c.fill();
            c.fillStyle = "#fff";
            c.font = "800 7px Nunito, sans-serif";
            c.textAlign = "center";
            c.fillText("BILIK MANDI", -475, -37);
        },
    });
    sc.props.push(boardProp(POS.miqat.board.x, POS.miqat.board.y - 18, "MIQAT BIR ALI"));
    sc.solids.push({ t: "r", x: -147, y: 102, w: 54, h: 8 });
    // Bas
    sc.props.push(busProp(260, 350, 150, 46));
    sc.solids.push({ t: "r", x: 260, y: 350, w: 150, h: 46 });
    for (const [x, y] of [
        [-300, 110],
        [-210, 170],
        [70, 150],
        [340, 50],
        [-390, -260],
        [400, -150],
        [-470, 180],
        [460, 170],
        [-60, 330],
        [-300, 380],
    ]) {
        sc.props.push(palmProp(x, y));
        sc.solids.push({ t: "c", x, y, r: 6 });
    }
    addWanderers(sc, 16, -300, -190, 300, 60, true);
    addWanderers(sc, 10, -480, 80, 140, 440, false);
    m3({ k: "mountains", x0: -560, y0: -470, x1: 560, y1: 490, col: "#a88a62", seed: 3 });
    for (let i = 0; i < 8; i++)
        addStatic(sc, rr(-200, 200), rr(-190, -150), rnd() < 0.5 ? "pray" : "sit", true, "L");
    sc.labels.push({ x: 0, y: -448, text: "MASJID MIQAT BIR ALI", kind: "place", y3: -300, h3: 15 }, { x: -430, y: -214, text: "BILIK PERSALINAN", kind: "place", y3: -75, h3: 7.5 }, { x: 335, y: 290, text: "BAS KE MAKKAH", kind: "place", y3: 373, h3: 6 });
    sc.ground = (c) => {
        c.fillStyle = "#e8d6ae";
        c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
        c.fillStyle = "#f3eee3";
        c.fillRect(-330, -210, 660, 280);
        gridLines(c, -330, -210, 330, 70, 40, "rgba(160,140,100,.18)");
        c.fillStyle = "#efe6d2";
        c.fillRect(-60, 70, 120, 180);
        c.fillRect(-60, 220, 400, 60);
        c.fillStyle = "#a9a398";
        c.fillRect(140, 280, 410, 200);
        c.strokeStyle = "rgba(255,255,255,.6)";
        c.lineWidth = 2;
        for (let x = 160; x < 540; x += 60)
            line(c, x, 420, x, 470);
        c.fillStyle = "#efe3c9";
        c.fillRect(-520, 0, 200, 40);
    };
    sc.mini = (c) => {
        c.fillStyle = "#e8d6ae";
        c.fillRect(-560, -470, 1120, 960);
        c.fillStyle = "#f3eee3";
        c.fillRect(-330, -210, 660, 280);
        c.fillStyle = "#cbbd9c";
        c.fillRect(-230, -430, 460, 220);
        c.fillRect(-530, -150, 200, 150);
        c.fillStyle = "#a9a398";
        c.fillRect(140, 280, 410, 200);
        c.fillStyle = "#16634c";
        c.fillRect(260, 350, 150, 46);
    };
    sc.interacts.push(boardInteract("board", POS.miqat.board, "miqat", () => finishStep("miqat_board")), {
        id: "bilik",
        ...POS.miqat.bilik,
        r: 58,
        icon: "water",
        ring: true,
        label: () => "MANDI &\nPAKAI IHRAM",
        enabled: () => isStep("ihram_wear"),
        locked: () => (isStep("miqat_board") ? "Baca papan penerangan miqat dahulu." : "Bilik persalinan dan bilik mandi."),
        action: actWearIhram,
    }, {
        id: "masjid",
        ...POS.miqat.masjid,
        r: 74,
        icon: "pray",
        ring: true,
        label: () => (isStep("niat_umrah") ? "NIAT UMRAH" : "SOLAT SUNAT\nIHRAM"),
        enabled: () => isStep("solat_ihram", "niat_umrah"),
        locked: () => (isStep("miqat_board", "ihram_wear") ? "Mandi sunat dan pakai ihram dahulu di bilik persalinan." : "Masjid Miqat Bir Ali."),
        action: () => (isStep("solat_ihram") ? actSolatIhram() : openNiat("umrah")),
    }, busInteract(POS.miqat.bus));
    return sc;
}
// =====================================================================
//  MAKKAH — MASJIDIL HARAM & MAS'A
// =====================================================================
function drawKaabah(c) {
    const s = KS;
    const H = KH;
    const E = [s, 0];
    const S = [0, s];
    const Wc = [-s, 0];
    const N = [0, -s];
    c.fillStyle = "rgba(30,30,40,.16)";
    poly(c, [s + 14, 8, 10, s + 10, -s + 8, 10, 6, -s + 8]);
    c.fill();
    c.fillStyle = "#d8d3c6";
    poly(c, [s + 5, 0, 0, s + 5, -s - 5, 0, 0, -s - 5]);
    c.fill();
    const face = (a, b, h0, h1, col) => {
        poly(c, [a[0], a[1] - h0, b[0], b[1] - h0, b[0], b[1] - h1, a[0], a[1] - h1]);
        c.fillStyle = col;
        c.fill();
    };
    face(Wc, S, 0, H, "#151517");
    face(S, E, 0, H, "#25252a");
    // kain putih di bahagian bawah (kiswah diangkat pada musim haji)
    face(Wc, S, 0, H * 0.2, "#e6e3da");
    face(S, E, 0, H * 0.2, "#f2f0e8");
    // hizam emas
    face(Wc, S, H * 0.66, H * 0.77, "#b88b2c");
    face(S, E, H * 0.66, H * 0.77, "#d9ab46");
    c.strokeStyle = "rgba(255,236,170,.75)";
    c.lineWidth = 0.7;
    for (const [a, b] of [
        [Wc, S],
        [S, E],
    ]) {
        c.beginPath();
        for (let t = 0.04; t < 0.96; t += 0.02) {
            const x = lerp(a[0], b[0], t);
            const y = lerp(a[1], b[1], t) - H * 0.715 + Math.sin(t * 90) * 1.4;
            if (t < 0.05)
                c.moveTo(x, y);
            else
                c.lineTo(x, y);
        }
        c.stroke();
    }
    // bumbung
    c.fillStyle = "#3b3b40";
    poly(c, [E[0], E[1] - H, N[0], N[1] - H, Wc[0], Wc[1] - H, S[0], S[1] - H]);
    c.fill();
    c.strokeStyle = "rgba(255,255,255,.14)";
    c.lineWidth = 1;
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,.18)";
    line(c, S[0], S[1], S[0], S[1] - H);
    // Hajarul Aswad di penjuru timur
    c.fillStyle = "#cfcfd6";
    ell(c, s - 1.5, -12, 3.6, 4.6);
    c.fill();
    c.fillStyle = "#151515";
    ell(c, s - 1.5, -12, 2.1, 2.9);
    c.fill();
}
function inHijrZone(p) {
    const dx = p.x - HIJR.x;
    const dy = p.y - HIJR.y;
    return Math.hypot(dx, dy) < HIJR.r && dx + dy < 0;
}
function inMasa(p) {
    return p.x > MASA.x0 && p.x < MASA.x1 && p.y > -600 && p.y < 600;
}
function vwall(c, x, y1, y2, h = 30) {
    if (FLAT_GROUND)
        return;
    c.fillStyle = "#d6c8ab";
    c.fillRect(x - 6, y1 - h, 12, y2 - y1 + h);
    c.fillStyle = "#c2b08c";
    c.fillRect(x - 6, y2 - h, 12, h);
    c.strokeStyle = "rgba(90,70,40,.22)";
    c.lineWidth = 1;
    c.strokeRect(x - 6, y1 - h, 12, y2 - y1 + h);
}
function buildMakkah() {
    const sc = newScene("makkah", { x0: -720, y0: -660, x1: 840, y1: 1040 }, { x: 330, y: 850 }, POS.makkah.bus, 0.3, "#e4d3b0");
    sc.ambient = 1;
    // ----- pepejal -----
    sc.solids.push({ t: "d", x: 0, y: 0, s: KS + 4 });
    m3({ k: "kaabah" });
    m3({ k: "maqam", x: 68, y: -68 });
    m3({ k: "arcade", r0: 405, r1: 431, h: 42 });
    m3({ k: "gate", x0: -80, x1: 80, y: 600 });
    m3({ k: "green", x0: MASA.x0, x1: MASA.x1, y: MASA.g1 });
    m3({ k: "green", x0: MASA.x0, x1: MASA.x1, y: MASA.g2 });
    m3({ k: "skyline" });
    // dinding Hijir Ismail (lengkok rendah dengan bukaan di kedua-dua hujung)
    {
        const a0 = (165 * Math.PI) / 180;
        const a1 = (285 * Math.PI) / 180;
        const n = 7;
        for (let i = 0; i < n; i++) {
            const t0 = lerp(a0, a1, i / n);
            const t1 = lerp(a0, a1, (i + 1) / n);
            sc.solids.push({
                t: "s",
                x1: HIJR.x + Math.cos(t0) * HIJR.r,
                y1: HIJR.y + Math.sin(t0) * HIJR.r,
                x2: HIJR.x + Math.cos(t1) * HIJR.r,
                y2: HIJR.y + Math.sin(t1) * HIJR.r,
                r: 3,
            });
        }
    }
    sc.solids.push({ t: "c", x: 68, y: -68, r: 11 }); // Maqam Ibrahim
    const W = (x1, y1, x2, y2) => {
        sc.solids.push({ t: "s", x1, y1, x2, y2, r: 6 });
        m3({ k: "wall", x1, y1, x2, y2, h: 34 });
    };
    W(-520, -600, -520, 600);
    W(-520, -600, 600, -600);
    W(600, -600, 600, -470);
    W(600, -410, 600, 600);
    W(-520, 600, -80, 600);
    W(80, 600, 600, 600);
    W(470, -600, 470, -380);
    W(470, -300, 470, -70);
    W(470, 70, 470, 300);
    W(470, 380, 470, 600);
    // tiang serambi
    for (let i = 0; i < 30; i++) {
        const a = (i / 30) * TAU + 0.05;
        const x = Math.cos(a) * 418;
        const y = -Math.sin(a) * 418;
        sc.solids.push({ t: "c", x, y, r: 7 });
        m3({ k: "pillar", x, y, h: 42, r: 6.5, col: "#e6d9be" });
        sc.props.push({
            y,
            draw: (c) => {
                c.fillStyle = "rgba(60,40,10,.12)";
                ell(c, x + 6, y + 1, 10, 4);
                c.fill();
                c.fillStyle = "#e0d2b6";
                c.fillRect(x - 6, y - 36, 12, 36);
                c.fillStyle = "#efe5d1";
                c.fillRect(x - 6, y - 36, 4, 36);
                c.fillStyle = "#cdbb98";
                c.fillRect(x - 8, y - 40, 16, 5);
                c.fillStyle = "#b99a5a";
                c.fillRect(x - 8, y - 6, 16, 3);
            },
        });
    }
    // Kaabah & Maqam Ibrahim
    sc.props.push({ y: 0, draw: drawKaabah });
    sc.props.push({
        y: -68,
        draw: (c) => {
            const x = 68;
            const y = -68;
            c.fillStyle = "rgba(40,30,10,.15)";
            ell(c, x + 5, y + 2, 13, 5);
            c.fill();
            c.fillStyle = "#b08a3c";
            c.fillRect(x - 8, y - 22, 16, 22);
            c.fillStyle = "rgba(210,235,240,.75)";
            c.fillRect(x - 6, y - 20, 12, 15);
            c.strokeStyle = "#d9b45a";
            c.lineWidth = 1;
            for (let k = -4; k <= 4; k += 4)
                line(c, x + k, y - 20, x + k, y - 5);
            dome(c, x, y - 22, 8.5, "#d4ae55");
        },
    });
    // Air Zamzam
    for (const z of [POS.makkah.zam1, POS.makkah.zam2]) {
        sc.solids.push({ t: "r", x: z.x - 12, y: z.y - 10, w: 24, h: 12 });
        m3({ k: "cooler", x: z.x, y: z.y });
        sc.props.push({
            y: z.y + 2,
            draw: (c) => {
                box(c, z.x - 12, z.y - 10, 24, 12, 20, "#e9eef2", "#ffffff");
                c.fillStyle = "#3d6fb4";
                c.fillRect(z.x - 12, z.y - 6, 24, 4);
                c.fillStyle = "#9fc3e6";
                circ(c, z.x - 5, z.y - 24, 4);
                c.fill();
                circ(c, z.x + 5, z.y - 24, 4);
                c.fill();
            },
        });
    }
    // dinding mendatar (prop bertinggi)
    sc.props.push({ y: -594, draw: (c) => box(c, -526, -606, 1132, 12, 32, "#d6c8ab") });
    sc.props.push({ y: 606, draw: (c) => box(c, -526, 594, 446, 12, 32, "#d6c8ab") });
    sc.props.push({ y: 606, draw: (c) => box(c, 80, 594, 526, 12, 32, "#d6c8ab") });
    sc.props.push(minaretProp(-104, 612, 172));
    sc.props.push(minaretProp(104, 612, 172));
    sc.props.push(minaretProp(-520, -600, 160));
    sc.props.push(minaretProp(600, -600, 160));
    sc.solids.push({ t: "c", x: -104, y: 612, r: 12 }, { t: "c", x: 104, y: 612, r: 12 });
    // Bukit Safa & Marwah
    sc.props.push(rockCluster(535, 562, 110, 11));
    sc.props.push(rockCluster(535, -562, 110, 23));
    sc.solids.push({ t: "e", x: 535, y: 580, rx: 62, ry: 18 }, { t: "e", x: 535, y: -580, rx: 62, ry: 18 });
    // Kedai gunting
    sc.solids.push({ t: "r", x: 650, y: -590, w: 160, h: 90 });
    m3({ k: "bld", x: 650, y: -590, w: 160, d: 90, h: 50, col: "#e3d0ae", style: "plain", sign: "KEDAI GUNTING" });
    m3({ k: "pole", x: 700, y: -496 });
    sc.props.push({
        y: -500,
        draw: (c) => {
            shadowBox(c, 650, -590, 160, 90, 12);
            box(c, 650, -590, 160, 90, 50, "#e3d0ae");
            c.fillStyle = "#16634c";
            c.fillRect(658, -546, 144, 14);
            c.fillStyle = "#fff";
            c.font = "800 8px Nunito, sans-serif";
            c.textAlign = "center";
            c.fillText("KEDAI GUNTING", 730, -536);
            c.fillStyle = "#5b4a32";
            c.fillRect(716, -528, 28, 28);
            for (let k = 0; k < 4; k++) {
                c.fillStyle = k % 2 ? "#c4452f" : "#ffffff";
                c.fillRect(700, -528 + k * 7, 5, 7);
            }
        },
    });
    // Hotel
    sc.solids.push({ t: "r", x: -700, y: 700, w: 260, h: 160 });
    m3({ k: "bld", x: -700, y: 700, w: 260, d: 160, h: 140, col: "#d8c6a4", style: "win", sign: "HOTEL JEMAAH" });
    sc.props.push({
        y: 860,
        draw: (c) => {
            shadowBox(c, -700, 700, 260, 160, 26);
            box(c, -700, 700, 260, 160, 130, "#d8c6a4");
            windowGrid(c, -696, 736, 252, 92, 8, 4, "#6f8190");
            c.fillStyle = "#4f3f2a";
            rrect(c, -588, 832, 36, 28, 4);
            c.fill();
            c.fillStyle = "#16634c";
            c.fillRect(-640, 820, 140, 10);
            c.fillStyle = "#fff";
            c.font = "800 7px Nunito, sans-serif";
            c.textAlign = "center";
            c.fillText("HOTEL JEMAAH", -570, 828);
        },
    });
    // Bas & papan
    sc.props.push(busProp(300, 915, 150, 46));
    sc.solids.push({ t: "r", x: 300, y: 915, w: 150, h: 46 });
    sc.props.push(boardProp(POS.makkah.board.x - 70, POS.makkah.board.y - 6, "MASJIDIL HARAM"));
    sc.solids.push({ t: "r", x: -97, y: 658, w: 54, h: 8 });
    // ----- jemaah -----
    for (let i = 0; i < 92; i++) {
        const p = mkPerson(undefined, true);
        const n = mkNPC("tawaf", p);
        n.rad = rr(140, 318);
        n.a = rr(0, TAU);
        n.w = rr(26, 46) / n.rad;
        sc.npcs.push(n);
    }
    for (let i = 0; i < 26; i++)
        addLane(sc, "y", rr(482, 590), -540, 540, true);
    for (let i = 0; i < 16; i++) {
        const p = mkPerson(undefined, true);
        const a = rr(0, TAU);
        p.x = Math.cos(a) * rr(345, 445);
        p.y = -Math.sin(a) * rr(345, 445);
        const n = mkNPC("wander", p);
        n.pickT = () => {
            const b = rr(0, TAU);
            const r = rr(345, 445);
            return { x: Math.cos(b) * r, y: -Math.sin(b) * r };
        };
        sc.npcs.push(n);
    }
    for (let i = 0; i < 12; i++) {
        const a = rr(0, TAU);
        const r = rr(352, 405);
        addStatic(sc, Math.cos(a) * r, -Math.sin(a) * r, rnd() < 0.6 ? "sit" : "pray");
    }
    addWanderers(sc, 16, -660, 640, 800, 1000, false);
    addWanderers(sc, 6, 620, -640, 820, 580, false);
    sc.labels.push({ x: 0, y: -134, text: "Rukun Iraqi", kind: "small", y3: -62, h3: 10 }, { x: -104, y: -12, text: "Rukun Syami", kind: "small", x3: -62, y3: 0, h3: 10 }, { x: 0, y: 78, text: "Rukun Yamani", kind: "small", y3: 62, h3: 10 }, { x: KS + 34, y: -28, text: "Hajarul Aswad", kind: "small", x3: KS + 6, y3: 0, h3: 2.4 }, { x: -82, y: -90, text: "Hijir Ismail", kind: "small", x3: -58, y3: -58, h3: 2 }, { x: 68, y: -106, text: "Maqam Ibrahim", kind: "small", y3: -68, h3: 3.2 }, { x: 238, y: 20, text: "MULA: HAJARUL ASWAD", kind: "green", y3: 0, h3: 0.6 }, { x: 0, y: 300, text: "MATAF", kind: "small", h3: 0.4 }, { x: 535, y: -20, text: "MAS'A", kind: "place", h3: 5 }, { x: 535, y: 520, text: "BUKIT SAFA", kind: "place", y3: 560, h3: 4.5 }, { x: 535, y: -504, text: "BUKIT MARWAH", kind: "place", y3: -560, h3: 4.5 }, { x: 535, y: 166, text: "Kawasan lampu hijau", kind: "green", h3: 5.4 }, { x: 0, y: 636, text: "PINTU KING ABDUL AZIZ", kind: "place", y3: 600, h3: 7 }, { x: -570, y: 556, text: "HOTEL JEMAAH", kind: "place", y3: 780, h3: 15.5 }, { x: 730, y: -652, text: "KEDAI GUNTING", kind: "place", y3: -545, h3: 6.5 }, { x: 375, y: 862, text: "STESEN BAS", kind: "place", y3: 938, h3: 5.5 }, { x: POS.makkah.zam1.x, y: POS.makkah.zam1.y - 36, text: "Air Zamzam", kind: "small", y3: POS.makkah.zam1.y, h3: 2.8 }, { x: POS.makkah.zam2.x, y: POS.makkah.zam2.y - 36, text: "Air Zamzam", kind: "small", y3: POS.makkah.zam2.y, h3: 2.8 });
    sc.ground = (c) => {
        c.fillStyle = "#e4d3b0";
        c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
        c.fillStyle = "#efe6d3";
        c.fillRect(-720, 606, 1560, 440);
        gridLines(c, -720, 606, 840, 1046, 64, "rgba(150,125,85,.18)");
        c.fillStyle = "#eadfca";
        c.fillRect(606, -660, 234, 1266);
        gridLines(c, 606, -660, 840, 606, 64, "rgba(150,125,85,.14)");
        c.fillStyle = "#f2eee5";
        c.fillRect(-520, -600, 990, 1200);
        gridLines(c, -520, -600, 470, 600, 46, "rgba(165,150,120,.16)");
        c.fillStyle = "#e9ddc6";
        circ(c, 0, 0, 452);
        c.fill();
        c.strokeStyle = "rgba(150,125,80,.35)";
        c.lineWidth = 2;
        c.stroke();
        // mataf
        c.fillStyle = "#fefefb";
        circ(c, 0, 0, MATAF_R);
        c.fill();
        c.strokeStyle = "rgba(150,165,180,.2)";
        c.lineWidth = 1.2;
        for (let r = 92; r < MATAF_R; r += 24) {
            circ(c, 0, 0, r);
            c.stroke();
        }
        c.strokeStyle = "rgba(196,160,82,.6)";
        c.lineWidth = 3;
        circ(c, 0, 0, MATAF_R);
        c.stroke();
        // anak panah arah tawaf (berlawanan arah jam)
        c.fillStyle = "rgba(64,124,196,.45)";
        for (const [R, off] of [
            [176, 0],
            [262, 0.2],
        ]) {
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * TAU + off;
                const x = Math.cos(a) * R;
                const y = -Math.sin(a) * R;
                const tx = -Math.sin(a);
                const ty = -Math.cos(a);
                const nx = Math.cos(a);
                const ny = -Math.sin(a);
                poly(c, [x + tx * 10, y + ty * 10, x - tx * 5 + nx * 6, y - ty * 5 + ny * 6, x - tx * 5 - nx * 6, y - ty * 5 - ny * 6]);
                c.fill();
            }
        }
        // garisan Hajarul Aswad
        c.strokeStyle = "#6f5a35";
        c.lineWidth = 5;
        line(c, KS + 8, 0, MATAF_R - 2, 0);
        c.strokeStyle = "rgba(255,255,255,.55)";
        c.lineWidth = 1;
        line(c, KS + 8, 0, MATAF_R - 2, 0);
        const g = c.createRadialGradient(MATAF_R + 14, 0, 0, MATAF_R + 14, 0, 22);
        g.addColorStop(0, "rgba(70,230,130,.9)");
        g.addColorStop(1, "rgba(70,230,130,0)");
        c.fillStyle = g;
        circ(c, MATAF_R + 14, 0, 22);
        c.fill();
        // Hijir Ismail (dinding rendah)
        c.fillStyle = "rgba(235,232,222,.9)";
        c.beginPath();
        c.arc(HIJR.x, HIJR.y, HIJR.r, (135 * Math.PI) / 180, (315 * Math.PI) / 180);
        c.closePath();
        c.fill();
        c.strokeStyle = "#cfc6b0";
        c.lineWidth = 7;
        c.beginPath();
        c.arc(HIJR.x, HIJR.y, HIJR.r, (165 * Math.PI) / 180, (285 * Math.PI) / 180);
        c.stroke();
        c.strokeStyle = "#f3efe4";
        c.lineWidth = 4;
        c.beginPath();
        c.arc(HIJR.x, HIJR.y - 3, HIJR.r, (165 * Math.PI) / 180, (285 * Math.PI) / 180);
        c.stroke();
        // Mas'a
        c.fillStyle = "#f7f5f0";
        c.fillRect(MASA.x0, -600, MASA.x1 - MASA.x0, 1200);
        gridLines(c, MASA.x0, -600, MASA.x1, 600, 32, "rgba(170,160,140,.15)");
        c.strokeStyle = "rgba(150,140,120,.35)";
        c.lineWidth = 2;
        c.setLineDash([10, 8]);
        line(c, 535, -460, 535, 460);
        c.setLineDash([]);
        c.fillStyle = "rgba(60,200,120,.16)";
        c.fillRect(MASA.x0, MASA.g1, MASA.x1 - MASA.x0, MASA.g2 - MASA.g1);
        for (const gy of [MASA.g1, MASA.g2]) {
            c.fillStyle = "rgba(63,208,127,.35)";
            c.fillRect(MASA.x0, gy - 9, MASA.x1 - MASA.x0, 18);
            c.fillStyle = "#3fd07f";
            c.fillRect(MASA.x0, gy - 3, MASA.x1 - MASA.x0, 6);
        }
        c.fillStyle = "#ebe3d2";
        c.fillRect(MASA.x0, MASA.safaY, MASA.x1 - MASA.x0, 130);
        c.fillRect(MASA.x0, -600, MASA.x1 - MASA.x0, 130);
        c.strokeStyle = "rgba(190,160,90,.6)";
        c.lineWidth = 2;
        line(c, MASA.x0, MASA.safaY, MASA.x1, MASA.safaY);
        line(c, MASA.x0, MASA.marwahY, MASA.x1, MASA.marwahY);
        // dinding menegak
        vwall(c, -520, -600, 600);
        vwall(c, 470, -600, -380);
        vwall(c, 470, -300, -70);
        vwall(c, 470, 70, 300);
        vwall(c, 470, 380, 600);
        vwall(c, 600, -600, -470);
        vwall(c, 600, -410, 600);
    };
    sc.mini = (c) => {
        c.fillStyle = "#e4d3b0";
        c.fillRect(-720, -660, 1560, 1700);
        c.fillStyle = "#efe6d3";
        c.fillRect(-720, 606, 1560, 440);
        c.fillStyle = "#f2eee5";
        c.fillRect(-520, -600, 990, 1200);
        c.fillStyle = "#e3d5b9";
        circ(c, 0, 0, 452);
        c.fill();
        c.fillStyle = "#ffffff";
        circ(c, 0, 0, MATAF_R);
        c.fill();
        c.fillStyle = "#1b1b1d";
        poly(c, [KS * 1.4, 0, 0, KS * 1.4, -KS * 1.4, 0, 0, -KS * 1.4]);
        c.fill();
        c.fillStyle = "#cfe9d9";
        c.fillRect(MASA.x0, -600, MASA.x1 - MASA.x0, 1200);
        c.fillStyle = "#8c7a5c";
        c.fillRect(MASA.x0, 520, 130, 70);
        c.fillRect(MASA.x0, -590, 130, 70);
        c.fillStyle = "#c5b18c";
        c.fillRect(-700, 700, 260, 160);
        c.fillRect(650, -590, 160, 90);
        c.fillStyle = "#16634c";
        c.fillRect(300, 915, 150, 46);
    };
    // ----- interaksi -----
    sc.interacts.push(boardInteract("hboard", { x: POS.makkah.board.x - 70, y: POS.makkah.board.y }, "haram", () => {
        if (isStep("haram_board")) {
            showDoa("masjid");
            finishStep("haram_board");
        }
    }), {
        id: "line",
        x: 0,
        y: 0,
        r: 0,
        test: (p) => p.x > KS + 4 && p.x < MATAF_R && Math.abs(p.y) < 30,
        icon: "hand",
        label: () => (isStep("tawaf_start", "ifadah_start", "wada_start") ? "MULA\nTAWAF" : "ISYARAT\nHAJARUL ASWAD"),
        enabled: () => isStep("tawaf_start", "ifadah_start", "wada_start") || (tawafKind() !== null && T.tawaf.lapIst !== S.tawafLaps),
        locked: () => (tawafKind() ? null : "Garisan Hajarul Aswad — permulaan dan penamat setiap pusingan tawaf."),
        action: () => (isStep("tawaf_start", "ifadah_start", "wada_start") ? startTawaf() : actIstilam()),
    }, {
        id: "maqam",
        ...POS.makkah.maqamPray,
        r: 32,
        icon: "pray",
        ring: true,
        label: () => "SOLAT SUNAT\nTAWAF",
        enabled: () => !!S.lastTawaf && !S.flags["solat_" + S.lastTawaf] && tawafKind() === null,
        locked: () => (tawafKind() ? "Selesaikan tawaf dahulu. Solat sunat tawaf dilakukan selepas tujuh pusingan." : null),
        action: actSolatTawaf,
    }, {
        id: "zam1",
        ...POS.makkah.zam1,
        r: 40,
        icon: "water",
        label: () => "MINUM\nZAMZAM",
        enabled: () => T.zamCd <= 0,
        action: actZamzam,
    }, {
        id: "zam2",
        ...POS.makkah.zam2,
        r: 40,
        icon: "water",
        label: () => "MINUM\nZAMZAM",
        enabled: () => T.zamCd <= 0,
        action: actZamzam,
    }, {
        id: "safa",
        x: 535,
        y: 530,
        r: 0,
        test: (p) => inMasa(p) && p.y > MASA.safaY,
        icon: "hand",
        label: () => (isStep("saie_start", "saie_haji_start") ? "MULA\nSAIE" : "BERDOA"),
        enabled: () => isStep("saie_start", "saie_haji_start") || (saieKind() !== null && S.saieAt === "safa" && !T.saie.berdoaHere),
        locked: () => (saieKind() ? null : "Bukit Safa — saie bermula di sini selepas tawaf."),
        action: () => (isStep("saie_start", "saie_haji_start") ? startSaie() : actBerdoaBukit()),
    }, {
        id: "marwah",
        x: 535,
        y: -530,
        r: 0,
        test: (p) => inMasa(p) && p.y < MASA.marwahY,
        icon: "hand",
        label: () => "BERDOA",
        enabled: () => saieKind() !== null && S.saieAt === "marwah" && !T.saie.berdoaHere,
        locked: () => (saieKind() ? null : "Bukit Marwah — perjalanan saie yang ketujuh berakhir di sini."),
        action: actBerdoaBukit,
    }, {
        id: "barber",
        ...POS.makkah.barber,
        r: 52,
        icon: "cut",
        ring: true,
        label: () => "BERCUKUR /\nBERGUNTING",
        enabled: () => isStep("tahallul_umrah"),
        locked: () => "Kedai gunting. Tahallul umrah dilakukan selepas saie selesai.",
        action: () => openCukur("umrah"),
    }, {
        id: "hotel",
        ...POS.makkah.hotel,
        r: 54,
        icon: "pray",
        ring: true,
        label: () => "NIAT HAJI",
        enabled: () => isStep("niat_haji"),
        locked: () => "Hotel penginapan jemaah. Kamu akan berihram haji di sini pada 8 Zulhijjah.",
        action: actNiatHaji,
    }, busInteract(POS.makkah.bus));
    return sc;
}
// =====================================================================
//  MINA — KHEMAH & KOMPLEKS JAMARAT
// =====================================================================
function jamrahWallProp(j) {
    const J = JAM[j];
    return {
        y: J.y + 6,
        draw: (c) => {
            box(c, J.x - 58, J.y - 6, 116, 12, 74, "#cfc6b2", "#e2dac8");
            c.fillStyle = "rgba(120,110,90,.35)";
            for (let k = -50; k <= 50; k += 20)
                c.fillRect(J.x + k, J.y - 74 + 2, 1, 70);
        },
    };
}
function drawJamrahBasin(c, j, dots) {
    const J = JAM[j];
    c.fillStyle = "rgba(60,50,30,.18)";
    ell(c, J.x + 8, J.y + 6, J.rx + 14, J.ry + 10);
    c.fill();
    c.fillStyle = "#bdb5a6";
    ell(c, J.x, J.y, J.rx + 8, J.ry + 7);
    c.fill();
    c.fillStyle = "#8f897c";
    ell(c, J.x, J.y, J.rx, J.ry);
    c.fill();
    c.fillStyle = "#b2ab9c";
    for (let i = 0; i < dots.length; i += 2) {
        circ(c, J.x + dots[i], J.y + dots[i + 1], 1.6);
        c.fill();
    }
    c.strokeStyle = "#e4ddcc";
    c.lineWidth = 2;
    ell(c, J.x, J.y, J.rx + 8, J.ry + 7);
    c.stroke();
}
function buildMina() {
    const sc = newScene("mina", { x0: -740, y0: -600, x1: 740, y1: 720 }, { x: -540, y: 560 }, POS.mina.bus, 0.45, "#dccaa6");
    sc.ambient = 0.7;
    const dots = { ula: [], wusta: [], aqabah: [] };
    for (const j of Object.keys(JAM)) {
        const J = JAM[j];
        for (let i = 0; i < 70; i++) {
            const a = rr(0, TAU);
            const r = Math.sqrt(rnd()) * 0.92;
            dots[j].push(Math.cos(a) * J.rx * r, Math.sin(a) * J.ry * r);
        }
        sc.solids.push({ t: "e", x: J.x, y: J.y, rx: J.rx + 8, ry: J.ry + 7 });
        sc.props.push(jamrahWallProp(j));
        m3({ k: "jamrah", x: J.x, y: J.y, rx: J.rx, ry: J.ry });
        sc.labels.push({ x: J.x, y: J.y - 96, text: J.name.toUpperCase(), kind: "place", y3: J.y, h3: 9.5 });
    }
    // tiang jambatan Jamarat
    for (let x = -680; x <= 680; x += 150) {
        if (Object.keys(JAM).some((j) => Math.abs(JAM[j].x - x) < 120))
            continue;
        sc.solids.push({ t: "r", x: x - 9, y: -300, w: 18, h: 14 });
        m3({ k: "pillar", x, y: -293, h: 50, r: 8, col: "#c7c0b3" });
        sc.props.push({ y: -286, draw: (c) => box(c, x - 9, -300, 18, 14, 50, "#c7c0b3") });
    }
    tentGrid(sc, -300, -170, 8, 7, 112, 100, 84, 64, [4, 3]);
    // kaunter dam & khemah gunting
    sc.solids.push({ t: "r", x: -690, y: 10, w: 130, h: 60 });
    m3({ k: "bld", x: -690, y: 10, w: 130, d: 60, h: 44, col: "#f1eee6", style: "plain", sign: "KAUNTER DAM" });
    m3({ k: "pole", x: -560, y: 244 });
    sc.props.push({
        y: 70,
        draw: (c) => {
            shadowBox(c, -690, 10, 130, 60, 10);
            box(c, -690, 10, 130, 60, 44, "#f1eee6");
            c.fillStyle = "#16634c";
            c.fillRect(-680, 34, 110, 14);
            c.fillStyle = "#fff";
            c.font = "800 8px Nunito, sans-serif";
            c.textAlign = "center";
            c.fillText("KAUNTER DAM", -625, 44);
        },
    });
    sc.solids.push({ t: "r", x: -690, y: 180, w: 130, h: 64 });
    sc.props.push(tentProp(-690, 180, 130, 64, "#eef6f1"));
    sc.props.push({
        y: 245,
        draw: (c) => {
            for (let k = 0; k < 4; k++) {
                c.fillStyle = k % 2 ? "#c4452f" : "#ffffff";
                c.fillRect(-560, 210 + k * 7, 5, 7);
            }
        },
    });
    sc.props.push(boardProp(POS.mina.board.x, POS.mina.board.y - 14, "PANDUAN MELONTAR"));
    sc.props.push(busProp(-700, 620, 150, 46));
    sc.solids.push({ t: "r", x: -700, y: 620, w: 150, h: 46 });
    for (let x = -660; x <= 660; x += 220) {
        sc.props.push(lampProp(x, -196));
    }
    m3({ k: "mountains", x0: -740, y0: -600, x1: 740, y1: 720, col: "#9b7b58", seed: 7 });
    // jemaah
    for (let i = 0; i < 8; i++) {
        const rx = -300 + i * 112 + 98;
        for (let k = 0; k < 3; k++)
            addLane(sc, "y", rx + rr(-6, 6), -250, 560, true);
    }
    for (let k = 0; k < 22; k++)
        addLane(sc, "x", rr(-266, -214), -700, 700, true);
    addWanderers(sc, 26, -700, -560, 700, -320, true);
    for (const j of Object.keys(JAM)) {
        const J = JAM[j];
        for (let i = 0; i < 9; i++) {
            const a = (i / 9) * TAU + rr(-0.2, 0.2);
            const p = mkPerson(undefined, true);
            p.x = J.x + Math.cos(a) * (J.rx + 30);
            p.y = J.y + Math.sin(a) * (J.ry + 26);
            p.dx = -Math.cos(a);
            p.dy = -Math.sin(a);
            const n = mkNPC("thrower", p);
            n.jx = J.x;
            n.jy = J.y;
            n.lo = J.rx;
            n.hi = J.ry;
            sc.npcs.push(n);
        }
    }
    for (let i = 0; i < 18; i++)
        addStatic(sc, -300 + Math.floor(rnd() * 8) * 112 + rr(10, 74), -170 + Math.floor(rnd() * 7) * 100 + 72, "sit");
    sc.labels.push({ x: 0, y: -575, text: "KOMPLEKS JAMARAT", kind: "place", h3: 3 }, { x: 232, y: 96, text: "Khemah Maktab 87", kind: "green", x3: 190, y3: 162, h3: 6.8 }, { x: -625, y: -54, text: "KAUNTER DAM", kind: "place", y3: 40, h3: 6 }, { x: -625, y: 124, text: "KHEMAH GUNTING", kind: "place", y3: 212, h3: 6.6 }, { x: POS.mina.patch.x, y: POS.mina.patch.y - 64, text: "Kawasan batu", kind: "small", y3: POS.mina.patch.y, h3: 1 }, { x: -625, y: 566, text: "STESEN BAS", kind: "place", y3: 643, h3: 6 }, { x: 180, y: -238, text: "← ke arah Makkah", kind: "small", h3: 0.6 });
    sc.ground = (c) => {
        c.fillStyle = "#dccaa6";
        c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
        c.fillStyle = "#d3cec4";
        c.fillRect(-740, -600, 1480, 310);
        gridLines(c, -740, -600, 740, -290, 50, "rgba(120,110,95,.16)");
        c.fillStyle = "#a9a296";
        c.fillRect(-740, -290, 1480, 90);
        c.strokeStyle = "rgba(255,255,255,.55)";
        c.lineWidth = 2;
        c.setLineDash([16, 14]);
        line(c, -740, -245, 740, -245);
        c.setLineDash([]);
        c.fillStyle = "#d4c3a0";
        c.fillRect(-740, -200, 400, 920);
        c.fillStyle = "#e6dac0";
        c.fillRect(-330, -200, 1010, 760);
        c.fillStyle = "#bdb5a4";
        ell(c, POS.mina.patch.x, POS.mina.patch.y, 92, 52);
        c.fill();
        c.fillStyle = "#a9a190";
        for (let i = 0; i < 40; i++) {
            const a = i * 2.39;
            const r = (i % 7) * 11;
            circ(c, POS.mina.patch.x + Math.cos(a) * r * 1.6, POS.mina.patch.y + Math.sin(a) * r * 0.8, 1.6);
            c.fill();
        }
        for (const j of Object.keys(JAM))
            drawJamrahBasin(c, j, dots[j]);
    };
    sc.mini = (c) => {
        c.fillStyle = "#dccaa6";
        c.fillRect(-740, -600, 1480, 1320);
        c.fillStyle = "#c9c3b7";
        c.fillRect(-740, -600, 1480, 310);
        c.fillStyle = "#9f988b";
        c.fillRect(-740, -290, 1480, 90);
        c.fillStyle = "#ffffff";
        for (let i = 0; i < 8; i++)
            for (let j = 0; j < 7; j++)
                c.fillRect(-300 + i * 112, -170 + j * 100, 84, 64);
        c.fillStyle = "#d9a83c";
        c.fillRect(-300 + 4 * 112, -170 + 3 * 100, 84, 64);
        c.fillStyle = "#6d675c";
        for (const j of Object.keys(JAM)) {
            ell(c, JAM[j].x, JAM[j].y, JAM[j].rx, JAM[j].ry);
            c.fill();
        }
        c.fillStyle = "#16634c";
        c.fillRect(-700, 620, 150, 46);
        c.fillRect(-690, 10, 130, 60);
        c.fillRect(-690, 180, 130, 64);
    };
    sc.interacts.push({
        id: "tent",
        ...POS.mina.tent,
        r: 44,
        icon: "pray",
        ring: true,
        label: () => "BERMALAM",
        enabled: () => isStep("mina_tarwiyah", "nafar"),
        locked: () => "Khemah Maktab 87 — tempat kamu berehat dan bermalam di Mina.",
        action: () => (isStep("nafar") ? openNafar() : actTarwiyah()),
    }, {
        id: "dam",
        ...POS.mina.dam,
        r: 52,
        icon: "hand",
        ring: true,
        label: () => "SELESAIKAN\nDAM",
        enabled: () => isStep("dam"),
        locked: () => "Kaunter dam — urusan dam haji Tamattu' dibuat pada Hari Nahar.",
        action: actDam,
    }, {
        id: "barberM",
        ...POS.mina.barber,
        r: 52,
        icon: "cut",
        ring: true,
        label: () => "BERCUKUR /\nBERGUNTING",
        enabled: () => isStep("cukur_nahar"),
        locked: () => "Khemah gunting — bercukur selepas melontar Jamrah Aqabah dan menyelesaikan dam.",
        action: () => openCukur("haji"),
    }, boardInteract("jboard", POS.mina.board, "jamarat"), ...Object.keys(JAM).map((j) => ({
        id: "jam_" + j,
        x: JAM[j].x,
        y: JAM[j].y,
        r: 0,
        test: () => inThrowRange(j),
        icon: "stone",
        label: () => "LONTAR\n" + JAM[j].name.replace("Jamrah ", "").toUpperCase(),
        enabled: () => expectedJamrah() !== null,
        locked: () => `${JAM[j].name} — ${j === "aqabah" ? "dilontar pada 10 Zulhijjah dan hari Tasyrik" : "dilontar pada hari Tasyrik (11–13 Zulhijjah)"}.`,
        action: () => throwAt(j),
    })), busInteract(POS.mina.bus));
    return sc;
}
// =====================================================================
//  ARAFAH
// =====================================================================
function insideArafah(p) {
    return p.x > ARAFAH_X + 6;
}
function buildArafah() {
    const sc = newScene("arafah", { x0: -740, y0: -580, x1: 740, y1: 580 }, { x: -540, y: 386 }, POS.arafah.bus, 0.8, "#e4d2a6");
    sc.ambient = 0.45;
    // Masjid Namirah (sebahagian hadapan di luar Arafah)
    sc.solids.push({ t: "r", x: -520, y: -480, w: 270, h: 150 });
    m3({ k: "bld", x: -520, y: -480, w: 270, d: 150, h: 58, col: "#eee8db", style: "arch", sign: "MASJID NAMIRAH", domes: [{ x: -385, y: -405, r: 34 }] });
    sc.props.push({
        y: -330,
        draw: (c) => {
            shadowBox(c, -520, -480, 270, 150, 20);
            box(c, -520, -480, 270, 150, 58, "#eee8db", "#f6f2e8");
            archRow(c, -514, -384, 258, 50, 7, "#b8a782");
            dome(c, -385, -440, 34, "#e7dfcc");
        },
    });
    sc.props.push(minaretProp(-520, -480, 140), minaretProp(-250, -480, 140));
    // Jabal Rahmah
    sc.solids.push({ t: "e", x: 430, y: -330, rx: 140, ry: 88 });
    m3({ k: "hill", x: 430, y: -330, rx: 150, ry: 96, h: 120 });
    sc.props.push({
        y: -250,
        draw: (c) => {
            const x = 430;
            const y = -330;
            c.fillStyle = "rgba(60,40,10,.15)";
            ell(c, x + 20, y + 14, 160, 96);
            c.fill();
            c.fillStyle = "#9a8163";
            ell(c, x, y, 150, 96);
            c.fill();
            c.fillStyle = "#ad9372";
            ell(c, x - 6, y - 22, 112, 70);
            c.fill();
            c.fillStyle = "#c0a682";
            ell(c, x - 10, y - 44, 72, 44);
            c.fill();
            c.fillStyle = "#cfb894";
            ell(c, x - 12, y - 60, 34, 20);
            c.fill();
            c.fillStyle = "#f7f3ea";
            c.fillRect(x - 17, y - 112, 10, 52);
            c.fillStyle = "#dcd5c4";
            c.fillRect(x - 11, y - 112, 4, 52);
            c.strokeStyle = "rgba(80,60,30,.35)";
            c.lineWidth = 1.5;
            c.beginPath();
            for (let k = 0; k < 6; k++)
                c.lineTo(x - 140 + k * 22, y + 40 - k * 16);
            c.stroke();
        },
    });
    // Khemah besar Maktab 87
    sc.solids.push({ t: "r", x: 40, y: -172, w: 220, h: 100 });
    sc.props.push(tentProp(40, -172, 220, 100, "#fffdf2", true));
    tentGrid(sc, -250, 40, 6, 4, 125, 110, 92, 70, null);
    // pokok
    const trees = [];
    let guard = 0;
    while (trees.length < 34 && guard++ < 800) {
        const x = rr(-340, 700);
        const y = rr(-540, 540);
        if (x > -270 && x < 500 && y > 20 && y < 470)
            continue;
        if (x > 20 && x < 280 && y > -200 && y < -50)
            continue;
        if (Math.hypot((x - 430) / 175, (y + 330) / 120) < 1)
            continue;
        if (trees.some((t) => Math.hypot(t.x - x, t.y - y) < 60))
            continue;
        trees.push({ x, y });
    }
    for (const t of trees) {
        sc.props.push(treeProp(t.x, t.y, rr(0.85, 1.15)));
        sc.solids.push({ t: "c", x: t.x, y: t.y, r: 5 });
    }
    // papan sempadan
    for (let y = -420; y <= 520; y += 130) {
        m3({ k: "sign", x: ARAFAH_X, y, text: "SEMPADAN ARAFAH" });
        sc.props.push({
            y,
            draw: (c) => {
                c.fillStyle = "#6a5034";
                c.fillRect(ARAFAH_X - 2, y - 46, 4, 46);
                c.fillStyle = "#f2c230";
                rrect(c, ARAFAH_X - 24, y - 70, 48, 26, 3);
                c.fill();
                c.strokeStyle = "#7a5b0c";
                c.lineWidth = 1.5;
                c.stroke();
                c.fillStyle = "#4a3505";
                c.font = "800 6.5px Nunito, sans-serif";
                c.textAlign = "center";
                c.fillText("SEMPADAN", ARAFAH_X, y - 59);
                c.fillText("ARAFAH →", ARAFAH_X, y - 50);
            },
        });
    }
    sc.props.push(boardProp(POS.arafah.board.x, POS.arafah.board.y - 14, "SEMPADAN ARAFAH", "#7a5b0c"));
    sc.props.push(busProp(-720, 440, 150, 46));
    sc.solids.push({ t: "r", x: -720, y: 440, w: 150, h: 46 });
    for (let i = 0; i < 34; i++) {
        const x = -250 + Math.floor(rnd() * 6) * 125 + rr(0, 92);
        const y = 40 + Math.floor(rnd() * 4) * 110 + rr(76, 96);
        addStatic(sc, x, y, rnd() < 0.55 ? "pray" : "sit");
    }
    for (let i = 0; i < 12; i++)
        addStatic(sc, rr(40, 260), rr(-60, -30), "pray");
    addWanderers(sc, 20, -330, -520, 700, 540, true);
    addWanderers(sc, 6, -720, -300, -400, 540, true);
    m3({ k: "mountains", x0: -740, y0: -580, x1: 740, y1: 580, col: "#a5865f", seed: 11 });
    sc.labels.push({ x: 430, y: -470, text: "JABAL RAHMAH", kind: "place", y3: -330, h3: 18 }, { x: -385, y: -548, text: "MASJID NAMIRAH", kind: "place", y3: -405, h3: 12 }, { x: -560, y: -140, text: "Wadi Uranah · luar Arafah", kind: "warn", h3: 1.5 }, { x: 150, y: -238, text: "Khemah Maktab 87", kind: "green", y3: -122, h3: 8 }, { x: 200, y: 520, text: "BUMI ARAFAH", kind: "place", h3: 2 }, { x: -645, y: 410, text: "STESEN BAS", kind: "place", y3: 463, h3: 6 });
    sc.ground = (c) => {
        c.fillStyle = "#e4d2a6";
        c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
        c.fillStyle = "#cdb98f";
        c.fillRect(-760, -600, ARAFAH_X + 760, 1200);
        c.fillStyle = "rgba(120,150,70,.10)";
        c.fillRect(ARAFAH_X, -600, 1200, 1200);
        c.fillStyle = "#ece0c2";
        c.fillRect(-270, 20, 770, 470);
        c.strokeStyle = "#e0861f";
        c.lineWidth = 4;
        c.setLineDash([18, 10]);
        line(c, ARAFAH_X, -600, ARAFAH_X, 600);
        c.setLineDash([]);
        c.fillStyle = "rgba(224,134,31,.12)";
        c.fillRect(ARAFAH_X - 14, -600, 14, 1200);
    };
    sc.mini = (c) => {
        c.fillStyle = "#e4d2a6";
        c.fillRect(-740, -580, 1480, 1160);
        c.fillStyle = "#c5b083";
        c.fillRect(-740, -580, ARAFAH_X + 740, 1160);
        c.fillStyle = "#e0861f";
        c.fillRect(ARAFAH_X - 4, -580, 8, 1160);
        c.fillStyle = "#9a8163";
        ell(c, 430, -330, 150, 96);
        c.fill();
        c.fillStyle = "#ffffff";
        c.fillRect(-250, 40, 717, 400);
        c.fillStyle = "#d9a83c";
        c.fillRect(40, -172, 220, 100);
        c.fillStyle = "#cfc7b4";
        c.fillRect(-520, -480, 270, 150);
        c.fillStyle = "#16634c";
        c.fillRect(-720, 440, 150, 46);
    };
    sc.interacts.push(boardInteract("aboard", POS.arafah.board, "sempadan"), {
        id: "khemah",
        ...POS.arafah.khemah,
        r: 60,
        icon: "pray",
        ring: true,
        label: () => "KHUTBAH &\nSOLAT JAMAK",
        enabled: () => isStep("arafah_khutbah"),
        locked: () => "Khemah Maktab 87 di bumi Arafah.",
        action: actKhutbah,
    }, {
        id: "doa",
        x: 0,
        y: 0,
        r: 0,
        test: () => isStep("wukuf"),
        icon: "pray",
        label: () => (T.wukuf.praying ? "BERHENTI" : "BERDOA"),
        enabled: () => isStep("wukuf"),
        action: toggleWukuf,
    }, busInteract(POS.arafah.bus));
    return sc;
}
// =====================================================================
//  MUZDALIFAH (malam)
// =====================================================================
function buildMuzdalifah() {
    const sc = newScene("muzdalifah", { x0: -720, y0: -540, x1: 720, y1: 540 }, { x: -540, y: 384 }, POS.muzdalifah.bus, 0.8, "#b9a98a");
    sc.ambient = 0.3;
    sc.solids.push({ t: "r", x: -150, y: -520, w: 300, h: 110 });
    m3({ k: "bld", x: -150, y: -520, w: 300, d: 110, h: 56, col: "#e8e2d4", style: "arch", sign: "MASY'ARIL HARAM", domes: [{ x: 0, y: -465, r: 30 }] });
    m3({ k: "stars" });
    m3({ k: "mountains", x0: -720, y0: -540, x1: 720, y1: 540, col: "#6e5a44", seed: 19 });
    sc.props.push({
        y: -410,
        draw: (c) => {
            shadowBox(c, -150, -520, 300, 110, 18);
            box(c, -150, -520, 300, 110, 56, "#e8e2d4", "#f3efe5");
            archRow(c, -144, -462, 288, 46, 7, "#a89770");
            dome(c, 0, -486, 30, "#e2dac8");
        },
    });
    sc.props.push(minaretProp(-150, -520, 130), minaretProp(150, -520, 130));
    sc.props.push(boardProp(POS.muzdalifah.masyar.x - 70, POS.muzdalifah.masyar.y - 10, "MASY'ARIL HARAM"));
    sc.props.push(busProp(-720, 440, 150, 46));
    sc.solids.push({ t: "r", x: -720, y: 440, w: 150, h: 46 });
    for (let x = -600; x <= 600; x += 240)
        for (let y = -300, row = 0; y <= 460; y += 250, row++) {
            const lx = x + (row % 2) * 90;
            sc.props.push(lampProp(lx, y));
            sc.solids.push({ t: "c", x: lx, y, r: 4 });
            sc.lights.push({ x: lx, y: y - 60 });
        }
    // tikar & jemaah tidur
    const mats = [];
    let guard = 0;
    while (mats.length < 38 && guard++ < 900) {
        const m = { x: rr(-520, 520), y: rr(-240, 420), w: rr(46, 70), h: rr(26, 36), c: pick(["#7a4b3a", "#3d5f7a", "#6b6a3a", "#7a3d5a", "#3f6b55"]) };
        if (Math.hypot(m.x - POS.muzdalifah.mat.x, m.y - POS.muzdalifah.mat.y) < 90)
            continue;
        if (mats.some((o) => Math.abs(o.x - m.x) < 80 && Math.abs(o.y - m.y) < 50))
            continue;
        mats.push(m);
    }
    for (const m of mats) {
        const n = rnd() < 0.5 ? 2 : 1;
        for (let k = 0; k < n; k++)
            addStatic(sc, m.x + 10 + k * 24, m.y + 22 + k * 4, rnd() < 0.7 ? "sleep" : "sit");
    }
    const myMat = POS.muzdalifah.mat;
    for (let i = 0; i < 120; i++) {
        const x = rr(-680, 680);
        const y = rr(-360, 500);
        if (mats.some((m) => x > m.x - 6 && x < m.x + m.w + 6 && y > m.y - 6 && y < m.y + m.h + 6))
            continue;
        sc.pebbles.push({ x, y, alive: true, s: rr(1.8, 2.8) });
    }
    addWanderers(sc, 18, -680, -360, 680, 500, true);
    sc.labels.push({ x: 0, y: -600, text: "MASY'ARIL HARAM", kind: "place", y3: -465, h3: 11 }, { x: myMat.x + 30, y: myMat.y - 18, text: "Tikar kamu", kind: "green", x3: myMat.x, y3: myMat.y - 12, h3: 1.4 }, { x: -645, y: 418, text: "STESEN BAS", kind: "place", y3: 463, h3: 6 });
    sc.ground = (c) => {
        c.fillStyle = "#b9a98a";
        c.fillRect(VIEW.x0 - 50, VIEW.y0 - 50, VIEW.x1 - VIEW.x0 + 100, VIEW.y1 - VIEW.y0 + 100);
        c.fillStyle = "rgba(120,105,80,.35)";
        for (let i = 0; i < 260; i++) {
            const x = ((i * 977) % 1440) - 720;
            const y = ((i * 613) % 1080) - 540;
            if (!inView(x, y, 20))
                continue;
            ell(c, x, y, 3 + (i % 3), 1.6);
            c.fill();
        }
        for (const m of mats) {
            c.fillStyle = m.c;
            c.fillRect(m.x, m.y, m.w, m.h);
            c.strokeStyle = "rgba(255,240,200,.35)";
            c.lineWidth = 1.5;
            c.strokeRect(m.x + 3, m.y + 3, m.w - 6, m.h - 6);
        }
        c.fillStyle = "#2f6b55";
        c.fillRect(myMat.x - 30, myMat.y - 30, 60, 34);
        c.strokeStyle = "#f3d488";
        c.lineWidth = 2.5;
        c.strokeRect(myMat.x - 30, myMat.y - 30, 60, 34);
    };
    sc.mini = (c) => {
        c.fillStyle = "#a99978";
        c.fillRect(-720, -540, 1440, 1080);
        c.fillStyle = "#6f604a";
        for (const m of mats)
            c.fillRect(m.x, m.y, m.w, m.h);
        c.fillStyle = "#ddd5c4";
        c.fillRect(-150, -520, 300, 110);
        c.fillStyle = "#d9a83c";
        c.fillRect(myMat.x - 30, myMat.y - 30, 60, 34);
        c.fillStyle = "#16634c";
        c.fillRect(-720, 440, 150, 46);
    };
    sc.interacts.push(boardInteract("mboard", { x: POS.muzdalifah.masyar.x - 70, y: POS.muzdalifah.masyar.y }, "masyar", () => {
        if (!S.flags.masyar) {
            S.flags.masyar = true;
            addStars(3, "Zikir di Masy'aril Haram (sunat)");
        }
    }), {
        id: "mat",
        ...myMat,
        r: 44,
        icon: "pray",
        ring: true,
        label: () => "BERMALAM",
        enabled: () => isStep("mabit_muz"),
        locked: () => (isStep("kutip_batu") ? "Kutip sekurang-kurangnya 7 biji batu dahulu, kemudian bermalam di sini." : "Tikar kamu."),
        action: actMabitMuzdalifah,
    }, busInteract(POS.muzdalifah.bus));
    return sc;
}
const BUILDERS = {
    miqat: buildMiqat,
    makkah: buildMakkah,
    mina: buildMina,
    arafah: buildArafah,
    muzdalifah: buildMuzdalifah,
};

// =====================================================================
//  Fail 04: BAB, TUGASAN & LANGKAH
//  Urutan haji Tamattu': Miqat → Umrah → Tarwiyah → Arafah →
//  Muzdalifah → Hari Nahar → Tasyrik → Tawaf Wada'
// =====================================================================
const CHAPTERS = [
    { n: 1, title: "Ihram di Miqat", date: "Sebelum 8 Zulhijjah", read: "miqat" },
    { n: 2, title: "Umrah di Masjidil Haram", date: "Sebelum 8 Zulhijjah", read: "haram" },
    { n: 3, title: "Hari Tarwiyah", date: "8 Zulhijjah", read: "tarwiyah" },
    { n: 4, title: "Wukuf di Arafah", date: "9 Zulhijjah", read: "arafah" },
    { n: 5, title: "Mabit di Muzdalifah", date: "Malam 10 Zulhijjah", read: "muzdalifah" },
    { n: 6, title: "Hari Nahar", date: "10 Zulhijjah", read: "nahar" },
    { n: 7, title: "Hari Tasyrik", date: "11–13 Zulhijjah", read: "tasyrik" },
    { n: 8, title: "Tawaf Wada'", date: "Sebelum pulang", read: "wada" },
];
const TASKS = [
    // ---------------- BAB 1 ----------------
    {
        ch: 1,
        title: "Persediaan ihram",
        steps: [
            { id: "miqat_board", scene: "miqat", text: "Baca papan penerangan Miqat Bir Ali", target: () => POS.miqat.board },
            { id: "ihram_wear", scene: "miqat", text: "Mandi sunat dan pakai pakaian ihram di bilik persalinan", target: () => POS.miqat.bilik },
        ],
    },
    {
        ch: 1,
        title: "Solat sunat ihram & niat umrah",
        steps: [
            { id: "solat_ihram", scene: "miqat", text: "Solat sunat ihram dua rakaat di Masjid Miqat", target: () => POS.miqat.masjid },
            { id: "niat_umrah", scene: "miqat", text: "Lafazkan niat umrah dan bertalbiah", target: () => POS.miqat.masjid },
        ],
    },
    {
        ch: 1,
        title: "Bertolak ke Makkah",
        steps: [{ id: "bus_makkah1", scene: "miqat", text: "Naik bas ke Makkah sambil bertalbiah", travel: "makkah" }],
    },
    // ---------------- BAB 2 ----------------
    {
        ch: 2,
        title: "Masuk Masjidil Haram",
        steps: [
            {
                id: "haram_board",
                scene: "makkah",
                text: "Baca papan penerangan di Pintu King Abdul Aziz",
                target: () => ({ x: POS.makkah.board.x - 70, y: POS.makkah.board.y }),
            },
        ],
    },
    {
        ch: 2,
        title: "Tawaf umrah 7 pusingan",
        steps: [
            { id: "tawaf_start", scene: "makkah", text: "Pergi ke garisan Hajarul Aswad dan tekan MULA TAWAF", target: () => POS.makkah.line },
            { id: "tawaf", scene: "makkah", text: "Tawaf 7 pusingan berlawanan arah jam", counter: () => tawafCounter(), target: () => tawafTarget() },
        ],
    },
    {
        ch: 2,
        title: "Saie umrah 7 perjalanan",
        steps: [
            {
                id: "saie_start",
                scene: "makkah",
                text: "Masuk ke koridor Mas'a (sebelah timur) dan tekan MULA SAIE di Bukit Safa",
                target: () => POS.makkah.safa,
            },
            { id: "saie", scene: "makkah", text: "Saie 7 perjalanan antara Safa dan Marwah", counter: () => saieCounter(), target: () => saieTarget() },
        ],
    },
    {
        ch: 2,
        title: "Bergunting / bercukur — tahallul umrah",
        steps: [
            {
                id: "tahallul_umrah",
                scene: "makkah",
                text: "Keluar ikut pintu timur berhampiran Marwah ke kedai gunting",
                target: () => POS.makkah.barber,
            },
        ],
    },
    {
        ch: 2,
        title: "Uji kefahaman: rukun umrah",
        steps: [{ id: "quiz_umrah", scene: "makkah", text: "Jawab kuiz rukun umrah", onStart: () => later(() => openQuiz("umrah"), 1100) }],
    },
    // ---------------- BAB 3 ----------------
    {
        ch: 3,
        title: "Niat haji di penginapan",
        steps: [
            { id: "niat_haji", scene: "makkah", time: "Pagi", text: "Pergi ke hotel: mandi sunat, pakai ihram dan niat haji", target: () => POS.makkah.hotel },
        ],
    },
    {
        ch: 3,
        title: "Bermalam di Mina",
        steps: [
            { id: "bus_mina1", scene: "makkah", time: "Pagi", text: "Naik bas ke Mina sambil bertalbiah", travel: "mina" },
            { id: "mina_tarwiyah", scene: "mina", time: "Petang", text: "Pergi ke khemah Maktab 87 dan bermalam di Mina (sunat)", target: () => POS.mina.tent },
        ],
    },
    // ---------------- BAB 4 ----------------
    {
        ch: 4,
        title: "Ke Arafah, khutbah & solat jamak",
        steps: [
            { id: "bus_arafah", scene: "mina", time: "Pagi", text: "Naik bas ke Arafah", travel: "arafah" },
            {
                id: "arafah_khutbah",
                scene: "arafah",
                time: "Selepas gelincir matahari",
                text: "Masuk ke dalam sempadan Arafah. Di khemah, dengar khutbah dan solat jamak Zohor–Asar",
                target: () => POS.arafah.khemah,
            },
        ],
    },
    {
        ch: 4,
        title: "Wukuf: doa, zikir & istighfar",
        steps: [
            {
                id: "wukuf",
                scene: "arafah",
                time: "Petang",
                text: "Berwukuf di dalam sempadan Arafah: tekan BERDOA dan kekal diam",
                counter: () => wukufCounter(),
            },
        ],
    },
    // ---------------- BAB 5 ----------------
    {
        ch: 5,
        title: "Ke Muzdalifah & kutip batu",
        steps: [
            {
                id: "bus_muzdalifah",
                scene: "arafah",
                date: "9 Zulhijjah",
                time: "Selepas Maghrib",
                light: "dusk",
                text: "Selepas matahari terbenam, naik bas ke Muzdalifah",
                travel: "muzdalifah",
            },
            {
                id: "kutip_batu",
                scene: "muzdalifah",
                time: "Selepas Isyak",
                light: "night",
                text: "Kutip sekurang-kurangnya 7 biji batu kecil (berjalan di atasnya)",
                counter: () => ({
                    title: "Kutip batu di Muzdalifah",
                    cur: Math.min(S.pebbles, 7),
                    max: 7,
                    sub: "Batu sebesar hujung jari. Kutip 28 biji supaya cukup untuk hari Tasyrik juga.",
                    tag: { text: `Jumlah dalam beg: ${S.pebbles} biji`, bad: false },
                }),
                done: () => S.pebbles >= 7,
            },
        ],
    },
    {
        ch: 5,
        title: "Bermalam di Muzdalifah",
        steps: [
            {
                id: "mabit_muz",
                scene: "muzdalifah",
                time: "Sebelum tengah malam",
                light: "night",
                text: "Pergi ke tikar kamu dan bermalam hingga lepas tengah malam",
                target: () => POS.muzdalifah.mat,
            },
        ],
    },
    // ---------------- BAB 6 ----------------
    {
        ch: 6,
        title: "Lontar Jamrah Aqabah",
        steps: [
            {
                id: "bus_mina2",
                scene: "muzdalifah",
                time: "Selepas tengah malam",
                light: "night",
                text: "Naik bas ke Mina",
                travel: "mina",
            },
            {
                id: "aqabah_go",
                scene: "mina",
                time: "Pagi",
                text: "Pergi ke Jamrah Aqabah di hujung barat Kompleks Jamarat",
                target: () => jamrahFront("aqabah"),
                done: () => inThrowRange("aqabah"),
            },
            {
                id: "aqabah",
                scene: "mina",
                time: "Pagi",
                text: "Lontar Jamrah Aqabah 7 biji sambil bertakbir",
                counter: () => throwCounter("aqabah", "aqabah"),
                target: () => (inThrowRange("aqabah") ? null : jamrahFront("aqabah")),
            },
        ],
    },
    {
        ch: 6,
        title: "Dam & bercukur — tahallul awal",
        steps: [
            { id: "dam", scene: "mina", time: "Pagi", text: "Selesaikan dam haji Tamattu' di kaunter dam", target: () => POS.mina.dam },
            { id: "cukur_nahar", scene: "mina", time: "Tengah hari", text: "Bercukur atau bergunting di khemah gunting", target: () => POS.mina.barber },
        ],
    },
    {
        ch: 6,
        title: "Tawaf ifadah",
        steps: [
            { id: "bus_makkah2", scene: "mina", time: "Petang", text: "Naik bas ke Makkah untuk tawaf ifadah", travel: "makkah" },
            { id: "ifadah_start", scene: "makkah", time: "Petang", text: "Pergi ke garisan Hajarul Aswad dan tekan MULA TAWAF", target: () => POS.makkah.line },
            { id: "ifadah", scene: "makkah", time: "Petang", text: "Tawaf ifadah 7 pusingan", counter: () => tawafCounter(), target: () => tawafTarget() },
        ],
    },
    {
        ch: 6,
        title: "Saie haji — tahallul thani",
        steps: [
            { id: "saie_haji_start", scene: "makkah", time: "Malam", text: "Pergi ke Bukit Safa dan tekan MULA SAIE", target: () => POS.makkah.safa },
            { id: "saie_haji", scene: "makkah", time: "Malam", text: "Saie haji 7 perjalanan", counter: () => saieCounter(), target: () => saieTarget() },
        ],
    },
    // ---------------- BAB 7 ----------------
    {
        ch: 7,
        title: "Lontar tiga jamrah",
        steps: [
            { id: "bus_mina3", scene: "makkah", date: "10 Zulhijjah", time: "Malam", text: "Kembali ke Mina untuk bermalam dan melontar", travel: "mina" },
            {
                id: "batu_tasyrik",
                scene: "mina",
                date: "11 Zulhijjah",
                time: "Pagi",
                text: "Pastikan ada 21 biji batu. Kutip di Kawasan batu jika tidak cukup",
                counter: () => ({
                    title: "Batu untuk hari Tasyrik",
                    cur: Math.min(S.pebbles, 21),
                    max: 21,
                    sub: "7 biji untuk setiap jamrah: Ula, Wusta dan Aqabah.",
                }),
                onStart: () => {
                    if (S.pebbles < 21)
                        ensurePatch();
                },
                target: () => (S.pebbles >= 21 ? null : POS.mina.patch),
                done: () => S.pebbles >= 21,
            },
            {
                id: "ula",
                scene: "mina",
                date: "11 Zulhijjah",
                time: "Selepas gelincir matahari",
                text: "Lontar Jamrah Ula 7 biji",
                counter: () => throwCounter("ula", "ula"),
                target: () => (inThrowRange("ula") ? null : jamrahFront("ula")),
            },
            {
                id: "wusta",
                scene: "mina",
                date: "11 Zulhijjah",
                time: "Selepas gelincir matahari",
                text: "Lontar Jamrah Wusta 7 biji",
                counter: () => throwCounter("wusta", "wusta"),
                target: () => (inThrowRange("wusta") ? null : jamrahFront("wusta")),
            },
            {
                id: "aqabah2",
                scene: "mina",
                date: "11 Zulhijjah",
                time: "Selepas gelincir matahari",
                text: "Lontar Jamrah Aqabah 7 biji",
                counter: () => throwCounter("aqabah2", "aqabah"),
                target: () => (inThrowRange("aqabah") ? null : jamrahFront("aqabah")),
            },
        ],
    },
    {
        ch: 7,
        title: "Mabit di Mina & nafar",
        steps: [
            {
                id: "nafar",
                scene: "mina",
                date: "11 Zulhijjah",
                time: "Malam",
                text: "Bermalam di khemah, kemudian pilih nafar awal atau nafar thani",
                target: () => POS.mina.tent,
            },
        ],
    },
    // ---------------- BAB 8 ----------------
    {
        ch: 8,
        title: "Tawaf wada' 7 pusingan",
        steps: [
            { id: "bus_makkah3", scene: "mina", text: "Naik bas ke Makkah untuk tawaf wada'", travel: "makkah" },
            { id: "wada_start", scene: "makkah", text: "Pergi ke garisan Hajarul Aswad dan tekan MULA TAWAF", target: () => POS.makkah.line },
            { id: "wada", scene: "makkah", text: "Tawaf wada' 7 pusingan", counter: () => tawafCounter(), target: () => tawafTarget() },
        ],
    },
    {
        ch: 8,
        title: "Uji kefahaman akhir",
        steps: [{ id: "quiz_final", scene: "makkah", text: "Jawab kuiz rukun dan wajib haji", onStart: () => later(() => openQuiz("final"), 1100) }],
    },
];
const ALL_STEPS = [];
TASKS.forEach((task, ti) => task.steps.forEach((step) => ALL_STEPS.push({ step, task, ti })));

// =====================================================================
//  Fail 05: ANTARA MUKA — HUD, toast, kad doa, modal, kuiz, kawalan
// =====================================================================
const ICON = {
    book: '<svg viewBox="0 0 24 24"><path d="M3 5.5C5.5 4.5 9 4.5 12 6.5c3-2 6.5-2 9-1V19c-2.5-1-6-1-9 1-3-2-6.5-2-9-1z"/><path d="M12 6.5V20"/></svg>',
    trophy: '<svg viewBox="0 0 24 24"><path d="M8 4h8v4a4 4 0 0 1-8 0z"/><path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4M12 12v3M9 20h6M10 15h4v5h-4z"/></svg>',
    sound: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
    hand: '<svg viewBox="0 0 24 24"><path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V13c0 4-2.5 7-6 7-2.5 0-4-1.2-5.2-3.2L4 13.5a1.5 1.5 0 0 1 2.6-1.5L8 14"/></svg>',
    pray: '<svg viewBox="0 0 24 24"><path d="M7 11V5.5a1.4 1.4 0 0 1 2.8 0V12M17 11V5.5a1.4 1.4 0 0 0-2.8 0V12"/><path d="M9.8 12c0 3-1.8 5-4.3 6.5M14.2 12c0 3 1.8 5 4.3 6.5"/><path d="M4 21h16"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.1"/><circle cx="4.5" cy="12" r="1.1"/><circle cx="4.5" cy="18" r="1.1"/></svg>',
    fast: '<svg viewBox="0 0 24 24"><path d="M5 6l6 6-6 6M12 6l6 6-6 6"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor" stroke="none"/></svg>',
    pebble: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="13.5" rx="8" ry="5.8" fill="currentColor" stroke="none"/><ellipse cx="9.4" cy="11.6" rx="2.6" ry="1.2" fill="#fff" opacity=".4" stroke="none"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.3"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.3"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    bus: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="13" rx="2.5"/><path d="M4 11h16M8 20v-3M16 20v-3"/><circle cx="8" cy="14" r=".8"/><circle cx="16" cy="14" r=".8"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
    stone: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="15" rx="7" ry="5"/><path d="M8 7l2 2M12 4v3M16 7l-2 2"/></svg>',
    cut: '<svg viewBox="0 0 24 24"><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="6.5" cy="6.5" r="2.5"/><path d="M8.5 8.2L20 17M8.5 15.8L20 7"/></svg>',
    water: '<svg viewBox="0 0 24 24"><path d="M12 3.5c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 3-6.5 6-10.5z"/></svg>',
    cube: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>',
    square: '<svg viewBox="0 0 24 24"><rect x="4.5" y="4.5" width="15" height="15" rx="2"/><path d="M4.5 12h15M12 4.5v15"/></svg>',
    map: '<svg viewBox="0 0 24 24"><path d="M3.5 6.5l5-2 7 2.5 5-2v13l-5 2-7-2.5-5 2z"/><path d="M8.5 4.5v13M15.5 7v13"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><path d="M3.5 8.5h3l1.8-2.5h7.4l1.8 2.5h3v10h-17z"/><circle cx="12" cy="13" r="3.4"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.8"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z" fill="currentColor" stroke="none"/></svg>',
    speak: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>',
};
const ic = (name) => ICON[name] ?? "";
let SET = {
    zoom: 1,
    doa: true,
    mini: true,
    arrow: true,
    sound: true,
    view3d: false,
    hq: !window.matchMedia("(pointer: coarse)").matches,
    suara: true,
    tenaga: true,
    gyro: false,
};
function loadSettings() {
    const s = loadJSON(CONFIG.settingsKey);
    if (s)
        SET = { ...SET, ...s };
    SND.on = SET.sound;
}
function saveSettings() {
    saveJSON(CONFIG.settingsKey, SET);
}
// ---------------------------------------------------------------------
//  PEMANDU SUARA (Web Speech API — suara bergantung pada peranti)
// ---------------------------------------------------------------------
const VOICE = {
    ok: "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined",
    ms: null,
    ar: null,
    picked: false,
};
function pickVoices() {
    if (!VOICE.ok)
        return;
    const vs = window.speechSynthesis.getVoices();
    if (!vs.length)
        return;
    const find = (re) => vs.find((v) => re.test(v.lang.replace("_", "-"))) ?? null;
    // Bahasa Melayu; jika tiada, Bahasa Indonesia paling hampir sebutannya
    VOICE.ms = find(/^ms/i) ?? find(/^id/i);
    VOICE.ar = find(/^ar/i);
    VOICE.picked = true;
}
if (VOICE.ok) {
    pickVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", pickVoices);
}
function speechOn() {
    return VOICE.ok && SET.suara && SET.sound;
}
function say(text, lang = "ms", flush = false) {
    if (!speechOn() || !text)
        return;
    if (!VOICE.picked)
        pickVoices();
    const u = new SpeechSynthesisUtterance(text.replace(/\n/g, " ").replace(/[→·—]/g, ", "));
    const v = lang === "ar" ? VOICE.ar : VOICE.ms;
    if (v)
        u.voice = v;
    u.lang = v ? v.lang : lang === "ar" ? "ar-SA" : "ms-MY";
    u.rate = lang === "ar" ? 0.85 : 1;
    if (flush)
        window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
}
function hush() {
    if (VOICE.ok)
        window.speechSynthesis.cancel();
}
function sayDoa(d, flush = true) {
    if (VOICE.ar)
        say(d.ar, "ar", flush);
    else
        say(d.rumi, "ms", flush);
    say("Maksudnya: " + d.makna);
}
let lastToast = { text: "", t: 0 };
function toast(text, kind = "info", ms = 4800) {
    const now = performance.now();
    if (text === lastToast.text && now - lastToast.t < 2500)
        return;
    lastToast = { text, t: now };
    const wrap = el("toasts");
    const d = document.createElement("div");
    d.className = "toast " + kind;
    const icn = { info: "info", ok: "check", warn: "alert", bad: "alert", ach: "trophy", ch: "flag" }[kind];
    d.innerHTML = ic(icn) + "<span>" + esc(text) + "</span>";
    wrap.appendChild(d);
    while (wrap.children.length > 3)
        wrap.removeChild(wrap.firstElementChild);
    later(() => {
        d.classList.add("out");
        later(() => d.remove(), 340);
    }, ms);
}
function banner(ch) {
    toast(`Bab ${ch.n} · ${ch.title} — ${ch.date}`, "ch", 6000);
}
// ---------------------------------------------------------------------
//  KAD DOA
// ---------------------------------------------------------------------
let doaTimer = 0;
function showDoa(key, auto = false) {
    if (auto && !SET.doa)
        return;
    const d = DOA[key];
    if (!d)
        return;
    el("doaT").textContent = d.title;
    el("doaAr").textContent = d.ar;
    el("doaRumi").textContent = d.rumi;
    el("doaMk").innerHTML = "<b>Maksudnya:</b> " + esc(d.makna);
    const src = el("doaSrc");
    src.textContent = d.src ?? "";
    src.hidden = !d.src;
    const box = el("doa");
    box.hidden = false;
    box.classList.remove("in");
    void box.offsetWidth;
    box.classList.add("in");
    window.clearTimeout(doaTimer);
    doaTimer = window.setTimeout(hideDoa, 11000);
    curDoa = key;
    sayDoa(d, false);
}
let curDoa = "";
function hideDoa() {
    el("doa").hidden = true;
}
let modalOpen = false;
let modalOnClose = null;
let modalDismiss = true;
function openModal(o) {
    modalOpen = true;
    modalOnClose = o.onClose ?? null;
    modalDismiss = o.dismissable !== false;
    el("shKick").textContent = o.kicker ?? "";
    el("shTitle").textContent = o.title;
    el("shBody").innerHTML = o.html;
    el("shBody").scrollTop = 0;
    el("sheet").className = "sheet" + (o.cls ? " " + o.cls : "");
    setModalButtons(o.buttons ?? [{ label: "Tutup", kind: "primary" }]);
    el("modal").hidden = false;
    hideDoa();
}
function setModalButtons(btns) {
    const w = el("shBtns");
    w.innerHTML = "";
    w.hidden = btns.length === 0;
    for (const b of btns) {
        const bt = document.createElement("button");
        bt.className = "btn " + (b.kind ?? "primary");
        bt.textContent = b.label;
        bt.onclick = () => {
            SND.play("tap");
            if (!b.keep)
                closeModal();
            b.onClick?.();
        };
        w.appendChild(bt);
    }
    const first = w.querySelector("button");
    if (first)
        later(() => first.focus({ preventScroll: true }), 30);
}
function closeModal() {
    if (!modalOpen)
        return;
    modalOpen = false;
    el("modal").hidden = true;
    const f = modalOnClose;
    modalOnClose = null;
    f?.();
}
function openReading(key, after) {
    const r = READ[key];
    if (!r)
        return;
    openModal({ kicker: r.kicker, title: r.title, html: r.html, buttons: [{ label: "Faham", kind: "primary" }], onClose: after });
}
function openChoice(kicker, title, intro, opts, onDone) {
    const html = intro +
        '<div class="opts">' +
        opts
            .map((o, i) => `<button class="opt" data-i="${i}">${o.ar ? `<span class="ar" lang="ar" dir="rtl">${o.ar}</span>` : ""}<span>${esc(o.label)}</span>${o.sub ? `<small>${esc(o.sub)}</small>` : ""}</button>`)
            .join("") +
        '</div><div class="fb" id="chFb" hidden></div>';
    openModal({ kicker, title, html, buttons: [], dismissable: false });
    const body = el("shBody");
    const buttons = Array.from(body.querySelectorAll(".opt"));
    for (const b of buttons) {
        b.onclick = () => {
            const i = Number(b.dataset.i);
            const o = opts[i];
            const fb = el("chFb");
            fb.hidden = false;
            buttons.forEach((x) => x.classList.remove("wrong"));
            fb.textContent = o.why;
            if (o.ok) {
                b.classList.add("right");
                fb.className = "fb ok";
                buttons.forEach((x) => (x.disabled = true));
                SND.play("ok");
                setModalButtons([{ label: "Teruskan", kind: "primary", onClick: () => onDone(i) }]);
            }
            else {
                b.classList.add("wrong");
                fb.className = "fb bad";
                SND.play("err");
            }
            fb.scrollIntoView({ block: "nearest" });
        };
    }
}
// ---------------------------------------------------------------------
//  KUIZ
// ---------------------------------------------------------------------
function openQuiz(kind) {
    if (modalOpen) {
        later(() => openQuiz(kind), 800);
        return;
    }
    const qs = kind === "umrah" ? QUIZ_UMRAH : QUIZ_FINAL;
    const title = kind === "umrah" ? "Uji kefahaman: rukun umrah" : "Uji kefahaman: rukun & wajib haji";
    let i = 0;
    let score = 0;
    const show = () => {
        const q = qs[i];
        openModal({
            kicker: `Soalan ${i + 1} daripada ${qs.length}`,
            title,
            html: `<div class="qbar"><i style="width:${(i / qs.length) * 100}%"></i></div><p class="q">${esc(q.q)}</p><div class="opts">` +
                q.opts.map((o, k) => `<button class="opt" data-k="${k}"><span>${esc(o)}</span></button>`).join("") +
                '</div><div class="fb" id="qFb" hidden></div>',
            buttons: [],
            dismissable: false,
        });
        const body = el("shBody");
        const btns = Array.from(body.querySelectorAll(".opt"));
        let answered = false;
        for (const b of btns) {
            b.onclick = () => {
                if (answered)
                    return;
                answered = true;
                const k = Number(b.dataset.k);
                const fb = el("qFb");
                fb.hidden = false;
                btns.forEach((x) => (x.disabled = true));
                btns[q.ans].classList.add("right");
                if (k === q.ans) {
                    score++;
                    S.stars += 5;
                    fb.className = "fb ok";
                    fb.textContent = "Betul! " + q.why;
                    SND.play("ok");
                }
                else {
                    b.classList.add("wrong");
                    fb.className = "fb bad";
                    fb.textContent = "Belum tepat. " + q.why;
                    SND.play("err");
                }
                fb.scrollIntoView({ block: "nearest" });
                setModalButtons([
                    {
                        label: i + 1 < qs.length ? "Soalan seterusnya" : "Lihat keputusan",
                        kind: "primary",
                        onClick: () => {
                            i++;
                            if (i < qs.length)
                                show();
                            else
                                end();
                        },
                    },
                ]);
            };
        }
    };
    const end = () => {
        const pass = score >= Math.ceil(qs.length * 0.6);
        openModal({
            kicker: "Keputusan kuiz",
            title: `${score} / ${qs.length} betul`,
            html: `<p>${pass
                ? "Tahniah! Kefahaman kamu baik. Teruskan perjalanan."
                : "Baca semula penerangan bab ini untuk mengukuhkan kefahaman. Kamu boleh mencuba lagi."}</p><p class="muted">Setiap jawapan betul memberi 5 bintang.</p>`,
            dismissable: false,
            buttons: pass
                ? [{ label: "Teruskan", kind: "primary", onClick: () => onQuizDone(kind, score, qs.length) }]
                : [
                    { label: "Cuba lagi", kind: "primary", onClick: () => openQuiz(kind) },
                    { label: "Teruskan juga", kind: "ghost", onClick: () => onQuizDone(kind, score, qs.length) },
                ],
        });
    };
    show();
}
// ---------------------------------------------------------------------
//  LAPISAN PERALIHAN (fade & bas)
// ---------------------------------------------------------------------
let overlayBusy = false;
function fadeDo(title, sub, mid, end, hold = 1300) {
    overlayBusy = true;
    const f = el("fade");
    el("fadeT").textContent = title;
    el("fadeS").textContent = sub;
    f.hidden = false;
    requestAnimationFrame(() => f.classList.add("show"));
    later(mid, 560);
    later(() => {
        f.classList.remove("show");
        later(() => {
            f.hidden = true;
            overlayBusy = false;
            end?.();
        }, 520);
    }, 560 + hold);
}
function showTravel(from, to, tip, mid, end) {
    overlayBusy = true;
    const t = el("travel");
    el("trFrom").textContent = from;
    el("trTo").textContent = to;
    el("trTip").textContent = tip;
    const bus = el("trBus");
    bus.classList.remove("go");
    t.hidden = false;
    void bus.offsetWidth;
    bus.classList.add("go");
    requestAnimationFrame(() => t.classList.add("show"));
    later(mid, 900);
    later(() => {
        t.classList.remove("show");
        later(() => {
            t.hidden = true;
            overlayBusy = false;
            end();
        }, 450);
    }, 2700);
}
// ---------------------------------------------------------------------
//  INPUT: papan kekunci & kayu bedik
// ---------------------------------------------------------------------
const KEYS = new Set();
let shiftHeld = false;
let runToggle = false;
const JOY = { active: false, id: -1, x: 0, y: 0 };
function getInput() {
    if (JOY.active)
        return { x: JOY.x, y: JOY.y };
    let x = 0;
    let y = 0;
    if (KEYS.has("KeyA") || KEYS.has("ArrowLeft"))
        x -= 1;
    if (KEYS.has("KeyD") || KEYS.has("ArrowRight"))
        x += 1;
    if (KEYS.has("KeyW") || KEYS.has("ArrowUp"))
        y -= 1;
    if (KEYS.has("KeyS") || KEYS.has("ArrowDown"))
        y += 1;
    const m = Math.hypot(x, y);
    return m > 1 ? { x: x / m, y: y / m } : { x, y };
}
function typingInField() {
    const a = document.activeElement;
    if (!a)
        return false;
    if (a.tagName === "TEXTAREA")
        return true;
    // kotak semak & gelangsar dalam Tetapan tidak menghalang kekunci Escape
    return a.tagName === "INPUT" && !["checkbox", "radio", "range", "button"].includes(a.type);
}
function initInput() {
    window.addEventListener("keydown", (e) => {
        if (typingInField())
            return;
        if (modalOpen) {
            if (e.code === "Escape" && modalDismiss)
                closeModal();
            return;
        }
        if (e.code === "ShiftLeft" || e.code === "ShiftRight")
            shiftHeld = true;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code))
            e.preventDefault();
        if (e.code === "KeyE" || e.code === "Space" || e.code === "Enter") {
            if (!e.repeat)
                doInteract();
            return;
        }
        if (e.code === "Equal" || e.code === "NumpadAdd")
            zoomIn();
        if (e.code === "Minus" || e.code === "NumpadSubtract")
            zoomOut();
        if (e.code === "KeyM")
            toggleMission();
        if (e.code === "KeyF" && !e.repeat)
            actMinum();
        if (e.code === "KeyC")
            cycleCam();
        if (e.code === "KeyV")
            void set3D(!R3.active);
        KEYS.add(e.code);
    });
    window.addEventListener("keyup", (e) => {
        KEYS.delete(e.code);
        if (e.code === "ShiftLeft" || e.code === "ShiftRight")
            shiftHeld = false;
    });
    window.addEventListener("blur", () => {
        KEYS.clear();
        shiftHeld = false;
        JOY.active = false;
        el("knob").style.transform = "";
    });
    const joy = el("joy");
    const knob = el("knob");
    const setJoy = (e) => {
        const r = joy.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const max = r.width * 0.38;
        let dx = e.clientX - cx;
        let dy = e.clientY - cy;
        const m = Math.hypot(dx, dy);
        if (m > max) {
            dx = (dx / m) * max;
            dy = (dy / m) * max;
        }
        JOY.x = dx / max;
        JOY.y = dy / max;
        if (Math.hypot(JOY.x, JOY.y) < 0.12) {
            JOY.x = 0;
            JOY.y = 0;
        }
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    joy.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        SND.init();
        JOY.active = true;
        JOY.id = e.pointerId;
        joy.setPointerCapture(e.pointerId);
        setJoy(e);
    });
    joy.addEventListener("pointermove", (e) => {
        if (JOY.active && e.pointerId === JOY.id)
            setJoy(e);
    });
    const endJoy = (e) => {
        if (e.pointerId !== JOY.id)
            return;
        JOY.active = false;
        JOY.x = 0;
        JOY.y = 0;
        knob.style.transform = "";
    };
    joy.addEventListener("pointerup", endJoy);
    joy.addEventListener("pointercancel", endJoy);
    el("world").addEventListener("wheel", (e) => {
        e.preventDefault();
        if (R3.active)
            zoom3D(e.deltaY < 0 ? 1.08 : 1 / 1.08);
        else
            zoomBy(e.deltaY < 0 ? 1.08 : 1 / 1.08);
    }, { passive: false });
    el("bAct").addEventListener("pointerdown", (e) => {
        e.preventDefault();
        SND.init();
        doInteract();
    });
    el("bRun").addEventListener("click", () => {
        runToggle = !runToggle;
        el("bRun").setAttribute("aria-pressed", String(runToggle));
        SND.play("tap");
    });
    el("bMisi").addEventListener("click", () => toggleMission());
    el("mClose").addEventListener("click", () => toggleMission(false));
    el("mRead").addEventListener("click", () => {
        const f = curFlat();
        openReading(CHAPTERS[(f ? f.task.ch : 8) - 1].read);
    });
    el("mAll").addEventListener("click", openAllChapters);
    el("tGuide").addEventListener("click", openGuide);
    el("t3d").addEventListener("click", () => {
        SND.init();
        void set3D(!R3.active);
    });
    el("tMap").addEventListener("click", () => openMap("haji"));
    el("mini").addEventListener("click", () => openMap("lokasi"));
    el("bCam").addEventListener("click", () => {
        SND.play("tap");
        cycleCam();
    });
    const holdZoom = (id, f) => {
        const b = el(id);
        let iv = 0;
        const stop = () => window.clearInterval(iv);
        b.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            f();
            stop();
            iv = window.setInterval(f, 110);
        });
        b.addEventListener("pointerup", stop);
        b.addEventListener("pointerleave", stop);
        b.addEventListener("pointercancel", stop);
    };
    holdZoom("bZin", zoomIn);
    holdZoom("bZout", zoomOut);
    initDrag3D();
    el("tAch").addEventListener("click", openAch);
    el("tSet").addEventListener("click", openSettings);
    el("tAudio").addEventListener("click", () => {
        SND.init();
        SET.sound = SND.toggle();
        saveSettings();
        paintAudio();
        if (SET.sound)
            SND.play("tap");
    });
    el("doaX").addEventListener("click", () => {
        hideDoa();
        hush();
    });
    el("doaPlay").addEventListener("click", () => {
        const d = DOA[curDoa];
        if (!d)
            return;
        if (!speechOn()) {
            toast(VOICE.ok ? "Hidupkan Bunyi dan Pemandu suara dalam Tetapan untuk mendengar doa." : "Pelayar ini tidak menyokong pemandu suara.", "info", 4000);
            return;
        }
        sayDoa(d);
    });
    el("bMinum").addEventListener("click", () => {
        SND.init();
        actMinum();
    });
    el("modal").addEventListener("click", (e) => {
        if (e.target === el("modal") && modalDismiss)
            closeModal();
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            KEYS.clear();
            JOY.active = false;
            if (started)
                saveGame();
        }
    });
}
function paintAudio() {
    const b = el("tAudio");
    b.innerHTML = ic(SET.sound ? "sound" : "mute") + "<span>Audio</span>";
    b.setAttribute("aria-pressed", String(SET.sound));
}
function paintViewControls() {
    const b = el("t3d");
    b.innerHTML = ic(R3.active ? "square" : "cube") + `<span>${R3.active ? "Paparan 2D" : "Paparan 3D"}</span>`;
    b.setAttribute("aria-pressed", String(R3.active));
    const cam = el("bCam");
    cam.hidden = !R3.active;
    cam.innerHTML = ic(C3.mode === "eye" ? "eye" : "cam") + `<span>${CAM_NAMES[C3.mode]}</span>`;
    el("keyhint").textContent = R3.active
        ? "WASD / kayu bedik: jalan · seret skrin: pusing kamera · Q/R: pusing · roda atau + −: zum · C: kamera · E: interaksi"
        : "WASD / anak panah: jalan · Shift: laju · E / Space: interaksi · F: minum · roda tetikus atau + −: zum · V: 3D";
}
function toggleMission(force) {
    const m = el("mission");
    const open = force ?? !m.classList.contains("open");
    m.classList.toggle("open", open);
}
// ---------------------------------------------------------------------
//  HUD
// ---------------------------------------------------------------------
let actState = "";
function setAct(kind, label, icon) {
    const key = kind + label + icon;
    if (key === actState)
        return;
    actState = key;
    const b = el("bAct");
    b.className = "act" + (kind === "on" ? " on" : kind === "lock" ? " lock" : "");
    b.innerHTML = ic(icon) + `<span>${esc(label).replace(/\n/g, "<br>")}</span>`;
}
let lastHud = "";
function refreshHUD() {
    const f = curFlat();
    const total = TASKS.length;
    const doneTasks = f ? f.ti : total;
    el("pName").textContent = S.name;
    el("pTask").textContent = f ? `Tugasan ${f.ti + 1}/${total}` : `Selesai ${total}/${total}`;
    el("pBar").style.width = `${(doneTasks / total) * 100}%`;
    el("cStars").textContent = String(S.stars);
    el("cPebbles").textContent = String(S.pebbles);
    if (SET.tenaga) {
        const en = Math.round(S.tenaga);
        el("cEn").textContent = String(en);
        el("cAir").textContent = String(S.air);
        const n = el("bAirN");
        n.textContent = String(S.air);
        n.className = "sb-n" + (S.air <= 0 ? " empty" : "");
        el("chipEn").className = "chip en" + (en < 15 ? " bad" : en < 35 ? " low" : "");
    }
    let date = "Selesai — semoga diterima Allah";
    let title = "Semua tugasan selesai";
    let count = "";
    let pct = 1;
    let sub = "Terokai semula Masjidil Haram, atau mula semula dari Tetapan.";
    let tag = null;
    if (f) {
        const ch = CHAPTERS[f.task.ch - 1];
        date = (f.step.date ?? ch.date) + (f.step.time ? " · " + f.step.time : "");
        const c = f.step.counter ? f.step.counter() : null;
        if (c) {
            title = c.title;
            count = c.unit ? `${c.cur}${c.unit}` : `${c.cur}<small>/${c.max}</small>`;
            pct = c.pct ?? c.cur / c.max;
            sub = c.sub ?? f.step.text;
            tag = c.tag ?? null;
        }
        else {
            title = f.task.title;
            const idx = f.task.steps.indexOf(f.step);
            pct = f.task.steps.length > 1 ? idx / f.task.steps.length : -1;
            sub = f.step.text;
        }
    }
    const key = [date, title, count, Math.round(pct * 200), sub, tag?.text, tag?.bad].join("|");
    if (key === lastHud)
        return;
    lastHud = key;
    el("datePill").textContent = date;
    el("pcTitle").textContent = title;
    const cnt = el("pcCount");
    cnt.innerHTML = count;
    cnt.hidden = !count;
    const bar = el("pcBarWrap");
    bar.hidden = pct < 0;
    el("pcFill").style.width = `${clamp(pct, 0, 1) * 100}%`;
    el("pcSub").textContent = sub;
    const tg = el("pcTag");
    tg.hidden = !tag;
    if (tag) {
        tg.textContent = tag.text;
        tg.className = "pc-tag" + (tag.bad ? " bad" : "");
    }
}
function renderMission() {
    const f = curFlat();
    const chN = f ? f.task.ch : 8;
    const ch = CHAPTERS[chN - 1];
    el("mNum").textContent = String(ch.n);
    el("mTitle").textContent = ch.title;
    el("mDate").textContent = ch.date;
    const list = el("mList");
    list.innerHTML = "";
    let k = 0;
    TASKS.forEach((t, ti) => {
        if (t.ch !== chN)
            return;
        k++;
        const li = document.createElement("li");
        const state = !f || ti < f.ti ? "done" : ti === f.ti ? "now" : "";
        li.className = state;
        li.innerHTML = `<span class="b">${state === "done" ? ic("check") : k}</span><span>${esc(t.title)}</span>`;
        list.appendChild(li);
    });
    el("mNow").textContent = f ? f.step.text : "Semua tugasan telah selesai. Alhamdulillah.";
}
// ---------------------------------------------------------------------
//  MENU: Panduan, Pencapaian, Tetapan, Semua bab
// ---------------------------------------------------------------------
function openGuide() {
    openModal({
        kicker: "Panduan bermain",
        title: "Cara bermain Jejak Haji",
        html: `<ul class="guide">
<li><b>Bergerak:</b> kayu bedik di kiri bawah, atau kekunci WASD / anak panah.</li>
<li><b>Laju:</b> tekan butang Laju atau tahan Shift. Gunakan untuk ramal dan berlari-lari anak di lampu hijau (sunat bagi lelaki).</li>
<li><b>Interaksi:</b> butang bulat di kanan bawah (atau E / Space). Butang menyala keemasan apabila ada tindakan yang boleh dilakukan.</li>
<li><b>Anak panah kuning</b> di sekeliling watak menunjukkan arah sasaran seterusnya berserta jaraknya.</li>
<li><b>Tawaf:</b> mula di garisan Hajarul Aswad, berjalan berlawanan arah jam dengan Kaabah di kiri, kekal di lantai putih dan elakkan Hijir Ismail.</li>
<li><b>Saie:</b> mula di Bukit Safa, 7 perjalanan, berakhir di Bukit Marwah.</li>
<li><b>Melontar:</b> dekati takungan jamrah dan tekan LONTAR. Semakin dekat, semakin tepat.</li>
<li><b>Zum:</b> butang + dan − di kanan bawah, roda tetikus, cubit dua jari (3D), atau kekunci + dan −.</li>
<li><b>Paparan 3D:</b> tekan butang 3D di atas. Seret skrin untuk memusing kamera. Butang Kamera menukar pandangan: <i>Belakang</i>, <i>Mata</i> (seperti berjalan sendiri di mataf) dan <i>Atas</i>.</li>
<li><b>Peta:</b> butang Peta menunjukkan laluan haji dan jaraknya. Ketik peta mini untuk peta lokasi yang lebih besar.</li>
<li><b>Tenaga & air:</b> meter tenaga di atas berkurang apabila berjalan, terutama semasa panas. Berdiri diam untuk berehat, atau tekan <b>Minum</b> (kekunci F).</li>
<li><b>Pemandu suara:</b> arahan dan doa dibacakan secara automatik. Tekan butang <b>Dengar</b> pada kad doa untuk mendengar semula. Matikan dalam Tetapan.</li>
</ul>
<p class="gsub">Panduan jemaah</p>
<div class="set-row"><button type="button" class="btn ghost" id="gKes">Kesilapan lazim</button><button type="button" class="btn ghost" id="gSes">Jika terpisah</button><button type="button" class="btn ghost" id="gSih">Tenaga & kesihatan</button></div>
<p class="muted">Kemajuan disimpan secara automatik dalam pelayar ini.</p>`,
        buttons: [
            { label: "Rujukan", kind: "ghost", onClick: openRefs },
            {
                label: "Baca penerangan bab ini",
                kind: "ghost",
                onClick: () => {
                    const f = curFlat();
                    openReading(CHAPTERS[(f ? f.task.ch : 8) - 1].read);
                },
            },
            { label: "Tutup", kind: "primary" },
        ],
    });
    el("gKes").onclick = () => openReading("kesilapan");
    el("gSes").onclick = () => openReading("sesat");
    el("gSih").onclick = () => openReading("kesihatan");
}
function openAch() {
    const rows = ACH_LIST.map((a) => {
        const got = S.ach.includes(a.id);
        const na = a.only === "L" && S.gender === "P";
        return `<li class="${got ? "got" : ""} ${na ? "na" : ""}"><span class="ach-i">${ic(got ? "trophy" : "star")}</span><div><b>${esc(a.t)}</b><span>${esc(a.d)}${na ? " (khusus lelaki)" : ""}</span></div></li>`;
    }).join("");
    const n = S.ach.length;
    openModal({
        kicker: "Pencapaian",
        title: `${n} daripada ${achTotal()} dibuka`,
        html: `<p class="muted">Pencapaian diberi untuk amalan sunat dan adab yang baik. Jumlah bintang: <b>${S.stars}</b>.</p><ul class="achs">${rows}</ul>`,
    });
}
function openAllChapters() {
    const f = curFlat();
    const html = CHAPTERS.map((ch) => {
        const items = TASKS.map((t, ti) => ({ t, ti }))
            .filter((x) => x.t.ch === ch.n)
            .map(({ t, ti }) => {
            const st = !f || ti < f.ti ? "done" : ti === f.ti ? "now" : "";
            return `<li class="${st}">${st === "done" ? ic("check") : ic("star")}<span>${esc(t.title)}</span></li>`;
        })
            .join("");
        return `<section class="chap"><h3><span>${ch.n}</span>${esc(ch.title)}<small>${esc(ch.date)}</small></h3><ul>${items}</ul></section>`;
    }).join("");
    openModal({ kicker: "Peta perjalanan", title: "Semua bab haji Tamattu'", html: `<div class="chaps">${html}</div>`, cls: "wide" });
}
function openSettings() {
    openModal({
        kicker: "Tetapan",
        title: "Tetapan permainan",
        html: `<div class="set">
<label for="setZoom">Zum kamera <output id="zOut">${Math.round(SET.zoom * 100)}%</output></label>
<input type="range" id="setZoom" min="0.6" max="1.7" step="0.05" value="${SET.zoom}">
<label class="tg"><input type="checkbox" id="setDoa" ${SET.doa ? "checked" : ""}> Papar kad doa secara automatik</label>
<label class="tg"><input type="checkbox" id="setMini" ${SET.mini ? "checked" : ""}> Papar peta mini</label>
<label class="tg"><input type="checkbox" id="setArrow" ${SET.arrow ? "checked" : ""}> Papar anak panah sasaran</label>
<label class="tg"><input type="checkbox" id="setHq" ${SET.hq ? "checked" : ""}> Bayang-bayang 3D (matikan jika telefon perlahan)</label>
<label class="tg"><input type="checkbox" id="setSnd" ${SET.sound ? "checked" : ""}> Bunyi</label>
${VOICE.ok ? `<label class="tg"><input type="checkbox" id="setSuara" ${SET.suara ? "checked" : ""}> Pemandu suara (baca arahan & doa)</label>` : ""}
<label class="tg"><input type="checkbox" id="setTenaga" ${SET.tenaga ? "checked" : ""}> Tenaga & air (letih apabila berjalan dalam panas)</label>
${GYRO.ok ? `<label class="tg"><input type="checkbox" id="setGyro" ${SET.gyro ? "checked" : ""}> Giroskop: gerakkan telefon untuk memandang (kamera Mata 3D)</label>` : ""}
<div class="set-row"><button type="button" class="btn ghost" id="setAch">Pencapaian</button><button type="button" class="btn ghost" id="setRefs">Rujukan</button></div>
<div class="danger"><button type="button" class="btn ghost" id="setReset">Mula semula dari awal</button>
<div id="setConfirm" hidden><p>Semua kemajuan, bintang dan pencapaian akan dipadam.</p><button type="button" class="btn bad" id="setYes">Ya, padam dan mula semula</button></div></div>
</div>`,
    });
    const z = el("setZoom");
    z.oninput = () => {
        SET.zoom = Number(z.value);
        el("zOut").textContent = Math.round(SET.zoom * 100) + "%";
        saveSettings();
    };
    el("setDoa").onchange = (e) => {
        SET.doa = e.target.checked;
        saveSettings();
    };
    el("setMini").onchange = (e) => {
        SET.mini = e.target.checked;
        saveSettings();
        applyMiniSetting();
    };
    el("setArrow").onchange = (e) => {
        SET.arrow = e.target.checked;
        saveSettings();
    };
    el("setHq").onchange = (e) => {
        SET.hq = e.target.checked;
        saveSettings();
    };
    el("setSnd").onchange = (e) => {
        SND.init();
        if (e.target.checked !== SND.on)
            SND.toggle();
        SET.sound = SND.on;
        saveSettings();
        paintAudio();
    };
    if (VOICE.ok)
        el("setSuara").onchange = (e) => {
            SET.suara = e.target.checked;
            saveSettings();
            if (SET.suara)
                say("Pemandu suara dihidupkan.", "ms", true);
            else
                hush();
        };
    el("setTenaga").onchange = (e) => {
        SET.tenaga = e.target.checked;
        saveSettings();
        applyTenagaSetting();
    };
    if (GYRO.ok)
        el("setGyro").onchange = (e) => {
            const box = e.target;
            void setGyro(box.checked).then((on) => {
                box.checked = on;
            });
        };
    el("setAch").onclick = () => openAch();
    el("setRefs").onclick = () => openRefs();
    el("setReset").onclick = () => {
        el("setConfirm").hidden = false;
    };
    el("setYes").onclick = () => {
        closeModal();
        resetGame();
    };
}
function applyMiniSetting() {
    el("minimap").hidden = !SET.mini;
}
function applyTenagaSetting() {
    el("chipEn").hidden = !SET.tenaga;
    el("bMinum").hidden = !SET.tenaga;
}
function zoomBy(f) {
    SET.zoom = clamp(SET.zoom * f, 0.6, 1.7);
    saveSettings();
}
// ---------------------------------------------------------------------
//  PETA & RUJUKAN
// ---------------------------------------------------------------------
function journeySVG() {
    const here = scene ? scene.id : "miqat";
    const doneIdx = curFlat() ? S.step : ALL_STEPS.length;
    const stepIndex = (id) => ALL_STEPS.findIndex((f) => f.step.id === id);
    const node = (id) => JOURNEY_NODES.find((n) => n.id === id);
    const legs = JOURNEY_LEGS.map((l) => {
        const a = node(l.from);
        const b = node(l.to);
        const si = stepIndex(l.step);
        const done = si >= 0 && si < doneIdx;
        const lx = 0.25 * a.x + 0.5 * l.cx + 0.25 * b.x;
        const ly = 0.25 * a.y + 0.5 * l.cy + 0.25 * b.y;
        const tw = l.km.length * 1.9 + 4;
        return `<path d="M${a.x} ${a.y} Q${l.cx} ${l.cy} ${b.x} ${b.y}" class="leg ${done ? "done" : ""} ${l.from === "miqat" ? "long" : ""}"/>
<g class="kmtag" transform="translate(${lx} ${ly})"><rect x="${-tw / 2}" y="-3.2" width="${tw}" height="6.4" rx="3.2"/><text y="1.1">${l.km}</text></g>`;
    }).join("");
    const nodes = JOURNEY_NODES.map((n) => `<g class="node ${n.id === here ? "here" : ""}" transform="translate(${n.x} ${n.y})"><circle r="${n.id === here ? 3.2 : 2.3}"/><text y="${n.below ? 7.6 : -4.4}">${esc(n.name)}</text></g>`).join("");
    return `<svg class="jmap" viewBox="0 0 160 94" role="img" aria-label="Peta laluan haji dari Madinah ke Makkah, Mina, Arafah dan Muzdalifah"><rect x="0" y="0" width="160" height="94" rx="4" class="bg"/>
<path d="M0 36 Q50 46 90 36 T160 42" class="ridge"/><path d="M40 94 Q80 86 110 92 T160 90" class="ridge"/>
<text x="4" y="90" class="ns">Skematik · tidak mengikut skala</text>${legs}${nodes}</svg>`;
}
function journeyTable() {
    return `<table class="jt"><thead><tr><th>Laluan</th><th>Jarak</th><th>Bila</th></tr></thead><tbody>${JOURNEY_LEGS.map((l) => {
        const a = JOURNEY_NODES.find((n) => n.id === l.from);
        const b = JOURNEY_NODES.find((n) => n.id === l.to);
        return `<tr><td>${esc(a.name)} → ${esc(b.name)}</td><td class="num">${l.km}</td><td>${esc(l.when)}</td></tr>`;
    }).join("")}</tbody></table>`;
}
function sceneMapCanvas(cv) {
    const r = cv.getBoundingClientRect();
    const w = Math.max(200, Math.round(r.width));
    const b = scene.bounds;
    const h = Math.round((w * (b.y1 - b.y0)) / (b.x1 - b.x0));
    cv.style.height = h + "px";
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const c = cv.getContext("2d");
    const s = w / (b.x1 - b.x0);
    c.setTransform(dpr * s, 0, 0, dpr * s, -b.x0 * s * dpr, -b.y0 * s * dpr);
    scene.mini(c);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.textAlign = "center";
    c.textBaseline = "middle";
    for (const L of scene.labels) {
        if (L.kind === "small")
            continue;
        const x = ((L.x3 ?? L.x) - b.x0) * s;
        const y = ((L.y3 ?? L.y) - b.y0) * s;
        c.font = "800 10px Nunito, sans-serif";
        const tw = c.measureText(L.text).width + 10;
        c.fillStyle = L.kind === "warn" ? "rgba(181,101,29,.92)" : L.kind === "green" ? "rgba(31,122,63,.92)" : "rgba(15,70,54,.9)";
        rrect(c, x - tw / 2, y - 8, tw, 16, 8);
        c.fill();
        c.fillStyle = "#fff";
        c.fillText(L.text, x, y + 0.5);
    }
    const t = stepTarget();
    if (t) {
        c.strokeStyle = "#d9a83c";
        c.lineWidth = 3;
        circ(c, (t.x - b.x0) * s, (t.y - b.y0) * s, 9);
        c.stroke();
    }
    c.fillStyle = "#2f7de0";
    c.strokeStyle = "#fff";
    c.lineWidth = 2;
    circ(c, (P.x - b.x0) * s, (P.y - b.y0) * s, 6);
    c.fill();
    c.stroke();
}
function openMap(tab) {
    openModal({
        kicker: "Peta",
        title: tab === "haji" ? "Laluan haji Tamattu'" : `Peta ${scene.name}`,
        cls: "wide",
        html: `<div class="tabs" role="tablist"><button type="button" role="tab" id="mtHaji" aria-selected="${tab === "haji"}">Laluan haji</button><button type="button" role="tab" id="mtLok" aria-selected="${tab === "lokasi"}">Lokasi semasa</button></div>
<div id="mapPane">${tab === "haji"
            ? journeySVG() + journeyTable() + `<p class="muted">Jarak ialah anggaran daripada sumber rujukan (Saudipedia, IslamWeb). Laluan Mina → Arafah melalui Muzdalifah.</p>`
            : `<canvas id="bigMap" class="bigmap"></canvas><p class="muted">Bulatan biru ialah kedudukan kamu; gelang emas ialah sasaran seterusnya. Peta ini dipermudahkan dan tidak mengikut skala sebenar.</p>`}</div>`,
        buttons: [
            { label: "Rujukan", kind: "ghost", onClick: openRefs },
            { label: "Tutup", kind: "primary" },
        ],
    });
    el("mtHaji").onclick = () => openMap("haji");
    el("mtLok").onclick = () => openMap("lokasi");
    if (tab === "lokasi")
        requestAnimationFrame(() => sceneMapCanvas(el("bigMap")));
}
function openRefs() {
    openModal({
        kicker: "Rujukan",
        title: "Sumber kandungan & ukuran",
        cls: "wide",
        html: `<p class="muted">${esc(REF_NOTE)}</p><ol class="refs">${REFS.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.t)}</a> <span class="rs">${esc(r.src)}</span><span class="ru">${esc(r.use)}</span></li>`).join("")}</ol>`,
    });
}

// =====================================================================
//  Fail 07: ENJIN 3D — Three.js r128 (dimuat dari cdnjs apabila perlu)
//  Simulasi (kedudukan, tawaf, saie, lontar…) dikongsi dengan 2D;
//  fail ini hanya menukar cara dunia dipaparkan.
//  Paksi: dunia 2D (x, y) → 3D (X, Z); Y ke atas. 1 unit 3D = 10 px dunia.
// =====================================================================
const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
// Pemuat glTF versi bukan-modul yang sepadan dengan r128 (dimuat hanya jika MODELS3D berisi)
const GLTF_URL = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
const K3 = 0.1;
const LOWQ = window.matchMedia("(pointer: coarse)").matches;
const CAM_NAMES = { back: "Belakang", eye: "Mata", top: "Atas" };
const C3 = {
    mode: "back",
    yaw: 0,
    pitch: 0.5,
    dist: 14,
    topPitch: 1.18,
    topDist: 75,
    fov: 62,
    eyePitch: -0.04,
    lastDrag: -99,
    fwdInput: 0,
};
const R3 = {
    active: false,
    loading: false,
    renderer: null,
    scene: null,
    camera: null,
    sun: null,
    hemi: null,
    pts: [],
    world: null,
    rig: null,
    tRing: null,
    tGem: null,
    tBeam: null,
    iRing: null,
    arrow: null,
    stonePool: [],
    light: "",
    colorT: 0,
    lampT: 0,
};
// ---------------------------------------------------------------------
//  Muat & hidupkan
// ---------------------------------------------------------------------
function load3D() {
    if (window.THREE)
        return Promise.resolve(true);
    return new Promise((res) => {
        const s = document.createElement("script");
        s.src = THREE_URL;
        s.async = true;
        s.onload = () => res(true);
        s.onerror = () => res(false);
        document.head.appendChild(s);
    });
}
async function set3D(on, quiet = false) {
    if (on === R3.active || R3.loading)
        return;
    if (!on) {
        R3.active = false;
        el("world3d").hidden = true;
        SET.view3d = false;
        saveSettings();
        paintViewControls();
        return;
    }
    R3.loading = true;
    if (!quiet)
        toast("Memuatkan paparan 3D…", "info", 2200);
    const ok = await load3D();
    R3.loading = false;
    if (!ok || !initRenderer()) {
        toast("Paparan 3D tidak dapat dimuatkan. Pastikan ada sambungan internet dan pelayar menyokong WebGL.", "bad", 6000);
        SET.view3d = false;
        saveSettings();
        paintViewControls();
        return;
    }
    ensureWorld();
    C3.yaw = 0;
    R3.active = true;
    el("world3d").hidden = false;
    SET.view3d = true;
    saveSettings();
    resize3D();
    paintViewControls();
    if (!quiet)
        toast("Paparan 3D: seret skrin untuk memusing kamera, + / − untuk zum, butang Kamera untuk pandangan mata.", "info", 6500);
}
function initRenderer() {
    if (R3.renderer)
        return true;
    try {
        const cv = el("world3d");
        const r = new THREE.WebGLRenderer({ canvas: cv, antialias: !LOWQ, powerPreference: "high-performance" });
        r.shadowMap.enabled = true;
        r.shadowMap.type = THREE.PCFSoftShadowMap;
        R3.renderer = r;
        const sc = new THREE.Scene();
        R3.scene = sc;
        R3.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1400);
        R3.hemi = new THREE.HemisphereLight(0xe3f0ff, 0xbca883, 0.75);
        sc.add(R3.hemi);
        const sun = new THREE.DirectionalLight(0xfff1d8, 0.85);
        sun.castShadow = true;
        const sz = LOWQ ? 1024 : 2048;
        sun.shadow.mapSize.set(sz, sz);
        const sh = sun.shadow.camera;
        sh.left = -42;
        sh.right = 42;
        sh.top = 42;
        sh.bottom = -42;
        sh.near = 1;
        sh.far = 220;
        sun.shadow.bias = -0.0008;
        R3.sun = sun;
        sc.add(sun);
        sc.add(sun.target);
        for (let i = 0; i < 3; i++) {
            const pl = new THREE.PointLight(0xffd59a, 0, 26, 1.6);
            R3.pts.push(pl);
            sc.add(pl);
        }
        R3.rig = makeRig();
        sc.add(R3.rig.root);
        makeMarkers(sc);
        return true;
    }
    catch {
        R3.renderer = null;
        return false;
    }
}
function resize3D() {
    if (!R3.renderer || !R3.camera)
        return;
    R3.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOWQ ? 1.3 : 1.75));
    R3.renderer.setSize(W, H, false);
    R3.camera.aspect = W / H;
    R3.camera.updateProjectionMatrix();
}
// ---------------------------------------------------------------------
//  Bahan, geometri & tekstur
// ---------------------------------------------------------------------
let BUILD_TEX = [];
const matCache = new Map();
function lam(col, extra) {
    const key = "l" + col + (extra ? JSON.stringify(Object.keys(extra)) + (extra.emissive ?? "") + (extra.opacity ?? "") : "");
    const hit = matCache.get(key);
    if (hit && !extra?.map)
        return hit;
    const m = new THREE.MeshLambertMaterial({ color: new THREE.Color(col), ...extra });
    if (!extra?.map)
        matCache.set(key, m);
    return m;
}
function flat(col) {
    const key = "f" + col;
    const hit = matCache.get(key);
    if (hit)
        return hit;
    const m = new THREE.MeshPhongMaterial({ color: new THREE.Color(col), flatShading: true, shininess: 4 });
    matCache.set(key, m);
    return m;
}
function basic(col, extra) {
    return new THREE.MeshBasicMaterial({ color: new THREE.Color(col), ...extra });
}
function mesh(g, m, x = 0, y = 0, z = 0, shadow = true) {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = shadow;
    o.receiveShadow = true;
    return o;
}
function mergeGeos(gs) {
    const parts = gs.map((g) => (g.index ? g.toNonIndexed() : g));
    let n = 0;
    for (const g of parts)
        n += g.getAttribute("position").count;
    const pos = new Float32Array(n * 3);
    const nor = new Float32Array(n * 3);
    let o = 0;
    for (const g of parts) {
        const p = g.getAttribute("position").array;
        const q = g.getAttribute("normal").array;
        pos.set(p, o * 3);
        nor.set(q, o * 3);
        o += g.getAttribute("position").count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    return out;
}
function canvasTex(w, h, draw, repeat = false) {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const c = cv.getContext("2d");
    draw(c);
    const t = new THREE.CanvasTexture(cv);
    if (repeat) {
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
    }
    if (R3.renderer)
        t.anisotropy = Math.min(8, R3.renderer.capabilities.getMaxAnisotropy());
    BUILD_TEX.push(t);
    return t;
}
function wallTexture(col, style) {
    return canvasTex(256, 128, (c) => {
        c.fillStyle = col;
        c.fillRect(0, 0, 256, 128);
        c.fillStyle = "rgba(255,255,255,.12)";
        c.fillRect(0, 0, 256, 10);
        c.fillStyle = "rgba(0,0,0,.08)";
        c.fillRect(0, 118, 256, 10);
        if (style === "arch") {
            for (let i = 0; i < 4; i++) {
                const x = 14 + i * 64;
                c.fillStyle = "rgba(120,98,60,.55)";
                c.beginPath();
                c.moveTo(x, 118);
                c.lineTo(x, 58);
                c.arc(x + 18, 58, 18, Math.PI, 0);
                c.lineTo(x + 36, 118);
                c.closePath();
                c.fill();
                c.strokeStyle = "rgba(200,165,90,.8)";
                c.lineWidth = 3;
                c.stroke();
            }
        }
        else if (style === "win") {
            c.fillStyle = "#6f8392";
            for (let i = 0; i < 4; i++)
                for (let j = 0; j < 2; j++)
                    c.fillRect(16 + i * 62, 22 + j * 52, 34, 30);
        }
        else {
            c.fillStyle = "rgba(0,0,0,.05)";
            for (let i = 0; i < 8; i++)
                c.fillRect(i * 32, 0, 2, 128);
        }
    }, true);
}
function signTexture(text, bg = "#16634c", fg = "#ffffff") {
    return canvasTex(512, 128, (c) => {
        c.fillStyle = bg;
        c.fillRect(0, 0, 512, 128);
        c.strokeStyle = "#f3d488";
        c.lineWidth = 8;
        c.strokeRect(6, 6, 500, 116);
        c.fillStyle = fg;
        c.font = "800 52px Nunito, 'Segoe UI', sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(text, 256, 66, 470);
    });
}
// ---------------------------------------------------------------------
//  Lantai daripada peta 2D
// ---------------------------------------------------------------------
function groundTexture(sc, x0, y0, x1, y1, size, clipR = 0) {
    return canvasTex(size, size, (c) => {
        const sx = size / (x1 - x0);
        const sy = size / (y1 - y0);
        const saved = { ...VIEW };
        VIEW.x0 = x0;
        VIEW.y0 = y0;
        VIEW.x1 = x1;
        VIEW.y1 = y1;
        FLAT_GROUND = true;
        c.setTransform(sx, 0, 0, sy, -x0 * sx, -y0 * sy);
        if (clipR) {
            c.beginPath();
            c.arc(0, 0, clipR, 0, TAU);
            c.clip();
        }
        try {
            sc.ground(c);
        }
        finally {
            FLAT_GROUND = false;
            Object.assign(VIEW, saved);
        }
    });
}
// ---------------------------------------------------------------------
//  Pembina model daripada deskriptor
// ---------------------------------------------------------------------
const P3 = (x, y) => [x * K3, y * K3];
function addBuilding(g, d) {
    const w = d.w * K3;
    const dd = d.d * K3;
    const h = d.h * K3;
    const style = d.style ?? "plain";
    const side = (len) => {
        const t = wallTexture(d.col, style);
        t.repeat.set(Math.max(1, Math.round(len / 6)), Math.max(1, Math.round(h / 5)));
        return lam(d.col, { map: t });
    };
    const top = lam(shade(d.col, 0.08));
    const mats = [side(dd), side(dd), top, top, side(w), side(w)];
    const b = mesh(new THREE.BoxGeometry(w, h, dd), mats, (d.x + d.w / 2) * K3, h / 2, (d.y + d.d / 2) * K3);
    g.add(b);
    // parapet
    const par = mesh(new THREE.BoxGeometry(w + 0.3, 0.35, dd + 0.3), lam(shade(d.col, -0.12)), b.position.x, h + 0.17, b.position.z);
    g.add(par);
    if (d.sign) {
        const t = signTexture(d.sign);
        const sw = Math.min(w * 0.8, 11);
        const sg = mesh(new THREE.PlaneGeometry(sw, sw / 4), lam("#ffffff", { map: t }), b.position.x, Math.min(h * 0.72, 4.2), (d.y + d.d) * K3 + 0.04, false);
        g.add(sg);
    }
    for (const dm of d.domes ?? []) {
        const r = dm.r * K3;
        const dome = mesh(new THREE.SphereGeometry(r, 20, 12, 0, TAU, 0, Math.PI / 2), lam(shade(d.col, -0.03)), dm.x * K3, h, dm.y * K3);
        g.add(dome);
        const drum = mesh(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.5, 20), lam(shade(d.col, -0.1)), dm.x * K3, h + 0.25, dm.y * K3);
        g.add(drum);
        dome.position.y = h + 0.5;
        const fin = mesh(new THREE.ConeGeometry(0.18, 1.2, 8), lam("#c9a24a"), dm.x * K3, h + 0.5 + r + 0.6, dm.y * K3);
        g.add(fin);
    }
}
function addMinaret(g, x, y, h, col) {
    const [X, Z] = P3(x, y);
    const H = h * K3;
    g.add(mesh(new THREE.BoxGeometry(2.6, 1.2, 2.6), lam(shade(col, -0.1)), X, 0.6, Z));
    g.add(mesh(new THREE.CylinderGeometry(0.85, 1.05, H, 8), lam(col), X, H / 2, Z));
    for (const f of [0.36, 0.62, 0.86])
        g.add(mesh(new THREE.CylinderGeometry(1.35, 1.2, 0.45, 8), lam(shade(col, -0.16)), X, H * f, Z));
    g.add(mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 8), lam(shade(col, -0.04)), X, H + 0.8, Z));
    g.add(mesh(new THREE.ConeGeometry(0.75, 2.8, 8), lam("#c9a24a", { emissive: new THREE.Color("#3a2a08") }), X, H + 3, Z));
    const cres = mesh(new THREE.TorusGeometry(0.32, 0.07, 6, 16, Math.PI * 1.5), lam("#e6c25a"), X, H + 4.8, Z, false);
    g.add(cres);
}
function addPalm(g, x, y, h) {
    const [X, Z] = P3(x, y);
    const H = h * K3 * 1.15;
    const trunk = mesh(new THREE.CylinderGeometry(0.16, 0.26, H, 7), lam("#8b6a44"), X + 0.2, H / 2, Z);
    trunk.rotation.z = -0.07;
    g.add(trunk);
    const fr = [];
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        const f = new THREE.BoxGeometry(2.2, 0.06, 0.5);
        f.translate(1.1, 0, 0);
        f.rotateZ(-0.45);
        f.rotateY(a);
        f.translate(X + 0.45, H, Z);
        fr.push(f);
    }
    g.add(mesh(mergeGeos(fr), lam("#45984f"), 0, 0, 0));
    g.add(mesh(new THREE.SphereGeometry(0.28, 8, 6), lam("#6b4f2e"), X + 0.45, H - 0.1, Z));
}
function addTree(g, x, y, s, seed) {
    const [X, Z] = P3(x, y);
    const r = mulberry32(seed);
    g.add(mesh(new THREE.CylinderGeometry(0.2 * s, 0.3 * s, 1.9 * s, 6), lam("#7d5c3a"), X, 0.95 * s, Z));
    const blobs = [];
    for (let i = 0; i < 4; i++) {
        const b = new THREE.IcosahedronGeometry((1.0 + r() * 0.5) * s, 0);
        b.translate(X + (r() - 0.5) * 1.6 * s, (2.5 + r() * 1.0) * s, Z + (r() - 0.5) * 1.6 * s);
        blobs.push(b);
    }
    g.add(mesh(mergeGeos(blobs), flat(r() < 0.5 ? "#3f7d3a" : "#4b8a42")));
}
function addBoard(g, x, y, title, col) {
    const [X, Z] = P3(x, y);
    g.add(mesh(new THREE.BoxGeometry(0.18, 3.2, 0.18), lam("#6a5034"), X - 1.6, 1.6, Z));
    g.add(mesh(new THREE.BoxGeometry(0.18, 3.2, 0.18), lam("#6a5034"), X + 1.6, 1.6, Z));
    const t = canvasTex(512, 280, (c) => {
        c.fillStyle = col;
        c.fillRect(0, 0, 512, 280);
        c.strokeStyle = "#f3d488";
        c.lineWidth = 10;
        c.strokeRect(8, 8, 496, 264);
        c.fillStyle = "#fff";
        c.font = "800 50px Nunito, sans-serif";
        c.textAlign = "center";
        c.fillText(title, 256, 92, 470);
        c.fillStyle = "rgba(243,212,136,.85)";
        for (let i = 0; i < 4; i++)
            c.fillRect(70, 140 + i * 30, 372 - (i % 2) * 80, 10);
    });
    const p = mesh(new THREE.BoxGeometry(4.4, 2.4, 0.15), [lam(col), lam(col), lam(col), lam(col), lam("#ffffff", { map: t }), lam(col)], X, 3.3, Z);
    g.add(p);
}
function addLamp(g, x, y, list) {
    const [X, Z] = P3(x, y);
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.4, 6), lam("#596260"), X, 3.2, Z));
    g.add(mesh(new THREE.BoxGeometry(0.9, 0.35, 0.9), lam("#3b403f"), X, 6.5, Z));
    g.add(mesh(new THREE.SphereGeometry(0.3, 8, 6), basic("#ffe9a8"), X, 6.2, Z, false));
    list.push(new THREE.Vector3(X, 6, Z));
}
function addBus(g, x, y, w, d) {
    const W3 = w * K3;
    const D3 = d * K3;
    const X = (x + w / 2) * K3;
    const Z = (y + d / 2) * K3;
    const t = canvasTex(512, 128, (c) => {
        c.fillStyle = "#f6f5ef";
        c.fillRect(0, 0, 512, 128);
        c.fillStyle = "#2f4a5a";
        for (let i = 0; i < 7; i++)
            c.fillRect(18 + i * 70, 18, 52, 44);
        c.fillStyle = "#16634c";
        c.fillRect(0, 78, 512, 18);
        c.fillStyle = "#d9a83c";
        c.fillRect(0, 96, 512, 6);
    });
    const sideM = lam("#ffffff", { map: t });
    const plain = lam("#f6f5ef");
    g.add(mesh(new THREE.BoxGeometry(W3, 3.2, D3), [plain, plain, plain, plain, sideM, sideM], X, 2.0, Z));
    for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
            const wh = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12), lam("#1e1e1e"), X + sx * (W3 / 2 - 2.2), 0.55, Z + sz * (D3 / 2), false);
            wh.rotation.x = Math.PI / 2;
            g.add(wh);
        }
}
function addTent(g, x, y, w, d, col, hl) {
    const W3 = w * K3;
    const D3 = d * K3;
    const X = (x + w / 2) * K3;
    const Z = (y + d / 2) * K3;
    g.add(mesh(new THREE.BoxGeometry(W3, 1.4, D3), lam(shade(col, -0.06)), X, 0.7, Z));
    const m = Math.max(W3, D3);
    const rh = Math.max(2.8, m * 0.3);
    const roof = new THREE.ConeGeometry((m / 2) * Math.SQRT2, rh, 4, 1);
    roof.rotateY(Math.PI / 4);
    roof.scale(W3 / m, 1, D3 / m);
    g.add(mesh(roof, flat(col === "#fbfbf7" ? "#f7f6f0" : col), X, 1.4 + rh / 2, Z));
    g.add(mesh(new THREE.BoxGeometry(1.2, 1.2, 0.05), lam("#7d7565"), X, 0.6, Z + D3 / 2 + 0.02, false));
    if (hl) {
        g.add(mesh(new THREE.BoxGeometry(W3 + 0.05, 0.3, D3 + 0.05), lam("#d9a83c"), X, 1.3, Z));
        g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), lam("#6a5034"), X, 4.6, Z));
        const flag = mesh(new THREE.PlaneGeometry(1.6, 0.9), lam("#16634c", { side: THREE.DoubleSide }), X + 0.8, 5.6, Z, false);
        g.add(flag);
    }
}
function addRocks(g, cx, cy, w, seed, col) {
    const r = mulberry32(seed);
    const gs = [];
    for (let i = 0; i < 11; i++) {
        const s = (12 + r() * 18) * K3;
        const ge = new THREE.IcosahedronGeometry(s, 0);
        ge.scale(1.1, 0.5 + r() * 0.6, 0.8);
        ge.translate((cx + (r() - 0.5) * w) * K3, s * 0.35, (cy + (r() - 0.5) * w * 0.35) * K3);
        gs.push(ge);
    }
    g.add(mesh(mergeGeos(gs), flat(col)));
}
function addWall(g, d) {
    const dx = (d.x2 - d.x1) * K3;
    const dz = (d.y2 - d.y1) * K3;
    const L = Math.hypot(dx, dz);
    const H = d.h * K3;
    const t1 = wallTexture("#e2d4b8", "arch");
    t1.repeat.set(Math.max(1, Math.round(L / 6)), 1);
    const sideM = lam("#ffffff", { map: t1 });
    const plain = lam("#d8c9ab");
    const b = mesh(new THREE.BoxGeometry(L, H, 1.2), [plain, plain, lam("#cbbb98"), plain, sideM, sideM], ((d.x1 + d.x2) / 2) * K3, H / 2, ((d.y1 + d.y2) / 2) * K3);
    b.rotation.y = -Math.atan2(dz, dx);
    g.add(b);
}
function addPillar(g, d) {
    const [X, Z] = P3(d.x, d.y);
    const H = d.h * K3;
    const R = d.r * K3;
    g.add(mesh(new THREE.CylinderGeometry(R, R * 1.1, H, 10), lam(d.col), X, H / 2, Z));
    g.add(mesh(new THREE.BoxGeometry(R * 3, 0.4, R * 3), lam(shade(d.col, -0.12)), X, H + 0.2, Z));
    g.add(mesh(new THREE.BoxGeometry(R * 2.6, 0.3, R * 2.6), lam("#b99a5a"), X, 0.15, Z));
}
function addKaabah(g) {
    const side = KS * Math.SQRT2 * K3; // ±8.2
    const H = 8.6;
    const k = new THREE.Group();
    k.rotation.y = Math.PI / 4;
    g.add(k);
    // Syazarwan (tapak marmar)
    k.add(mesh(new THREE.BoxGeometry(side + 0.7, 0.35, side + 0.7), lam("#d9d4c6"), 0, 0.17, 0));
    k.add(mesh(new THREE.BoxGeometry(side, H, side), lam("#141416"), 0, H / 2, 0));
    // kain putih di bahagian bawah (kiswah dinaikkan ±3 m pada musim haji)
    k.add(mesh(new THREE.BoxGeometry(side + 0.06, 2.0, side + 0.06), lam("#ffffff", { emissive: new THREE.Color("#2a2a26") }), 0, 1.0 + 0.35, 0));
    // hizam emas dengan kaligrafi
    const hz = canvasTex(512, 64, (c) => {
        c.fillStyle = "#b88b2c";
        c.fillRect(0, 0, 512, 64);
        c.strokeStyle = "#f3d27a";
        c.lineWidth = 3;
        for (let i = 0; i < 9; i++) {
            c.beginPath();
            const x = i * 56 + 8;
            c.moveTo(x, 44);
            c.bezierCurveTo(x + 10, 10, x + 24, 54, x + 34, 20);
            c.lineTo(x + 46, 40);
            c.stroke();
        }
        c.fillStyle = "#e9c46a";
        c.fillRect(0, 0, 512, 5);
        c.fillRect(0, 59, 512, 5);
    }, true);
    hz.repeat.set(2, 1);
    const gold = lam("#ffffff", { map: hz });
    const goldTop = lam("#b88b2c");
    k.add(mesh(new THREE.BoxGeometry(side + 0.08, 0.75, side + 0.08), [gold, gold, goldTop, goldTop, gold, gold], 0, H * 0.7, 0));
    // pintu (dinding timur laut, ±2.13 m dari lantai)
    const doorT = canvasTex(128, 192, (c) => {
        c.fillStyle = "#c9a043";
        c.fillRect(0, 0, 128, 192);
        c.fillStyle = "#1b1b1b";
        c.fillRect(14, 16, 100, 164);
        c.strokeStyle = "#f0cf72";
        c.lineWidth = 4;
        c.strokeRect(14, 16, 100, 164);
        for (let i = 0; i < 6; i++) {
            c.beginPath();
            c.arc(64, 40 + i * 24, 14, 0, TAU);
            c.stroke();
        }
    });
    // Dalam ruang tempatan kumpulan (diputar 45°), dinding timur laut = muka +X? Kira terus dalam dunia:
    const door = mesh(new THREE.PlaneGeometry(1.4, 2.4), lam("#ffffff", { map: doorT, emissive: new THREE.Color("#2a1e06") }), 0, 0, 0, false);
    const nx = Math.SQRT1_2;
    const nz = -Math.SQRT1_2; // normal muka timur laut dalam dunia (+X, −Z)
    const half = side / 2 + 0.07;
    // anjak ke arah penjuru Hajarul Aswad (timur)
    door.position.set(nx * half + 1.0 * Math.SQRT1_2, 1.47 + 1.2, nz * half + 1.0 * Math.SQRT1_2);
    door.rotation.y = Math.atan2(nx, nz);
    g.add(door);
    // Hajarul Aswad (penjuru timur, ±1.5 m)
    const ring = mesh(new THREE.TorusGeometry(0.32, 0.1, 8, 20), lam("#d0d0d6"), KS * K3 + 0.05, 1.05, 0, false);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
    g.add(mesh(new THREE.SphereGeometry(0.26, 10, 8), lam("#151515"), KS * K3 + 0.02, 1.05, 0, false));
    // Mizab (pancur emas) di dinding barat laut, menghala ke Hijir Ismail
    const mz = mesh(new THREE.BoxGeometry(0.3, 0.25, 1.6), lam("#d9ab46"), -1.9, H - 0.4, -1.9, false);
    mz.rotation.y = Math.PI / 4;
    g.add(mz);
    // Hijir Ismail: dinding separuh bulatan ±1.3 m
    const sh = new THREE.Shape();
    const a0 = (165 * Math.PI) / 180;
    const a1 = (285 * Math.PI) / 180;
    const cx = HIJR.x * K3;
    const cz = HIJR.y * K3;
    const ro = HIJR.r * K3 + 0.3;
    const ri = HIJR.r * K3 - 0.15;
    sh.absarc(cx, cz, ro, a0, a1, false);
    sh.absarc(cx, cz, ri, a1, a0, true);
    const hg = new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: false, curveSegments: 40 });
    hg.rotateX(Math.PI / 2);
    hg.translate(0, 1.0, 0);
    g.add(mesh(hg, lam("#f1eee6")));
}
function addMaqam(g, x, y) {
    const [X, Z] = P3(x, y);
    g.add(mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.35, 8), lam("#d9d4c6"), X, 0.17, Z));
    g.add(mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.6, 8, 1, true), lam("#b08a3c", { side: THREE.DoubleSide, wireframe: false }), X, 1.15, Z));
    g.add(mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 8), lam("#cfe6ec", { transparent: true, opacity: 0.55 }), X, 1.1, Z, false));
    g.add(mesh(new THREE.SphereGeometry(0.6, 12, 8, 0, TAU, 0, Math.PI / 2), lam("#d4ae55"), X, 1.95, Z));
    g.add(mesh(new THREE.ConeGeometry(0.1, 0.6, 6), lam("#e6c25a"), X, 2.8, Z, false));
}
function addArcade(g, r0, r1, h) {
    const sh = new THREE.Shape();
    sh.absarc(0, 0, r1 * K3, 0, TAU, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, r0 * K3, 0, TAU, true);
    sh.holes.push(hole);
    const ge = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false, curveSegments: 90 });
    ge.rotateX(Math.PI / 2);
    ge.translate(0, h * K3 + 0.6, 0);
    g.add(mesh(ge, lam("#e9dcc0")));
}
function addGate(g, x0, x1, y) {
    const Z = y * K3;
    for (const x of [x0, x1])
        g.add(mesh(new THREE.BoxGeometry(2.6, 9, 2.6), lam("#e5d8bd"), x * K3, 4.5, Z));
    g.add(mesh(new THREE.BoxGeometry((x1 - x0) * K3 + 2.6, 1.6, 2.6), lam("#e5d8bd"), ((x0 + x1) / 2) * K3, 9.8, Z));
    g.add(mesh(new THREE.BoxGeometry((x1 - x0) * K3 + 2.8, 0.3, 2.8), lam("#c9a24a"), ((x0 + x1) / 2) * K3, 10.75, Z));
    const t = signTexture("PINTU KING ABDUL AZIZ");
    g.add(mesh(new THREE.PlaneGeometry(10, 1.25), lam("#ffffff", { map: t }), ((x0 + x1) / 2) * K3, 9.8, Z + 1.32, false));
    const arch = mesh(new THREE.TorusGeometry(((x1 - x0) / 2) * K3, 0.35, 6, 24, Math.PI), lam("#d8c9ab"), ((x0 + x1) / 2) * K3, 6.2, Z, false);
    g.add(arch);
}
function addGreen(g, x0, x1, y) {
    const Z = y * K3;
    const L = (x1 - x0) * K3;
    g.add(mesh(new THREE.BoxGeometry(L, 0.35, 0.5), basic("#3fe08a"), ((x0 + x1) / 2) * K3, 5.2, Z, false));
    for (const x of [x0 + 2, x1 - 2]) {
        g.add(mesh(new THREE.BoxGeometry(0.3, 5.2, 0.3), basic("#2fc470"), x * K3, 2.6, Z, false));
    }
    const glow = mesh(new THREE.PlaneGeometry(L, 2.2), basic("#6dffb0", { transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }), ((x0 + x1) / 2) * K3, 4.1, Z, false);
    g.add(glow);
}
function addSkyline(g) {
    const r = mulberry32(5);
    const blockT = wallTexture("#cdbb9a", "win");
    const mk = (x, z, w, d, h) => {
        const t = blockT.clone();
        t.needsUpdate = true;
        t.repeat.set(Math.round(w / 6), Math.round(h / 5));
        BUILD_TEX.push(t);
        g.add(mesh(new THREE.BoxGeometry(w, h, d), lam("#ffffff", { map: t }), x, h / 2, z, false));
    };
    for (let i = 0; i < 26; i++) {
        const side = i % 4;
        const w = 14 + r() * 16;
        const h = 14 + r() * 32;
        if (side === 0)
            mk(-75 + r() * 160, 112 + r() * 30, w, 12 + r() * 10, h);
        else if (side === 1)
            mk(95 + r() * 30, -70 + r() * 150, 12 + r() * 10, w, h);
        else if (side === 2)
            mk(-95 - r() * 30, -70 + r() * 150, 12 + r() * 10, w, h);
        else
            mk(-70 + r() * 150, -78 - r() * 30, w, 12 + r() * 10, h);
    }
    // Menara Jam (Abraj al-Bait) di selatan
    const X = 0;
    const Z = 150;
    g.add(mesh(new THREE.BoxGeometry(34, 46, 26), lam("#d9c9a8", { map: (() => { const t = blockT.clone(); t.needsUpdate = true; t.repeat.set(6, 9); BUILD_TEX.push(t); return t; })() }), X, 23, Z, false));
    g.add(mesh(new THREE.BoxGeometry(15, 40, 15), lam("#e2d3b3"), X, 66, Z, false));
    const face = canvasTex(256, 256, (c) => {
        c.fillStyle = "#f6f3e6";
        c.beginPath();
        c.arc(128, 128, 118, 0, TAU);
        c.fill();
        c.strokeStyle = "#1f7a3f";
        c.lineWidth = 16;
        c.stroke();
        c.strokeStyle = "#b88b2c";
        c.lineWidth = 10;
        c.beginPath();
        c.moveTo(128, 128);
        c.lineTo(128, 46);
        c.moveTo(128, 128);
        c.lineTo(186, 150);
        c.stroke();
    });
    const fm = lam("#ffffff", { map: face, emissive: new THREE.Color("#303020") });
    for (const [dx, dz, ry] of [
        [0, -7.6, Math.PI],
        [0, 7.6, 0],
        [-7.6, 0, -Math.PI / 2],
        [7.6, 0, Math.PI / 2],
    ]) {
        const f = mesh(new THREE.PlaneGeometry(12, 12), fm, X + dx, 76, Z + dz, false);
        f.rotation.y = ry;
        g.add(f);
    }
    g.add(mesh(new THREE.ConeGeometry(5, 18, 8), lam("#c9a24a", { emissive: new THREE.Color("#3a2a08") }), X, 95, Z, false));
    g.add(mesh(new THREE.TorusGeometry(1.6, 0.35, 8, 20, Math.PI * 1.5), lam("#e6c25a"), X, 107, Z, false));
}
function addJamrah(g, x, y, rx, ry) {
    const [X, Z] = P3(x, y);
    const sh = new THREE.Shape();
    sh.absellipse(X, Z, (rx + 8) * K3, (ry + 7) * K3, 0, TAU, false, 0);
    const hole = new THREE.Path();
    hole.absellipse(X, Z, rx * K3, ry * K3, 0, TAU, true, 0);
    sh.holes.push(hole);
    const ge = new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: false, curveSegments: 40 });
    ge.rotateX(Math.PI / 2);
    ge.translate(0, 1.0, 0);
    g.add(mesh(ge, lam("#c2bbac")));
    const t = wallTexture("#cfc6b2", "plain");
    t.repeat.set(3, 2);
    g.add(mesh(new THREE.BoxGeometry(11.6, 7.4, 1.2), lam("#ffffff", { map: t }), X, 3.7, Z));
    // payung besar di atas jamrah
    for (const dx of [-4.5, 4.5]) {
        g.add(mesh(new THREE.CylinderGeometry(0.18, 0.22, 13, 8), lam("#e9e6de"), X + dx, 6.5, Z - 5.5));
        const um = mesh(new THREE.ConeGeometry(6, 1.8, 10, 1, true), lam("#fbfaf4", { side: THREE.DoubleSide }), X + dx, 13.4, Z - 5.5);
        g.add(um);
    }
}
function addHill(g, x, y, rx, ry, h) {
    const [X, Z] = P3(x, y);
    const ge = new THREE.ConeGeometry(rx * K3, h * K3, 11, 4);
    const pos = ge.getAttribute("position");
    const r = mulberry32(42);
    for (let i = 0; i < pos.count; i++) {
        const py = pos.getY(i);
        if (py < (h * K3) / 2 - 0.1) {
            pos.setX(i, pos.getX(i) * (0.85 + r() * 0.3));
            pos.setZ(i, pos.getZ(i) * (0.85 + r() * 0.3));
            pos.setY(i, py + (r() - 0.5) * 1.2);
        }
    }
    ge.computeVertexNormals();
    ge.scale(1, 1, ry / rx);
    g.add(mesh(ge, flat("#a98f6c"), X, (h * K3) / 2 - 0.4, Z));
    g.add(mesh(new THREE.BoxGeometry(0.9, 5, 0.9), lam("#f7f3ea"), X, h * K3 + 2.0, Z));
}
function addSign(g, x, y, text) {
    const [X, Z] = P3(x, y);
    g.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.6, 6), lam("#6a5034"), X, 2.3, Z));
    const t = signTexture(text, "#f2c230", "#4a3505");
    const p = mesh(new THREE.BoxGeometry(0.12, 1.3, 5.0), [lam("#ffffff", { map: t }), lam("#ffffff", { map: t }), lam("#f2c230"), lam("#f2c230"), lam("#f2c230"), lam("#f2c230")], X, 4.4, Z);
    g.add(p);
}
function addPole(g, x, y) {
    const [X, Z] = P3(x, y);
    const t = canvasTex(64, 128, (c) => {
        for (let i = 0; i < 8; i++) {
            c.fillStyle = i % 2 ? "#c4452f" : "#ffffff";
            c.fillRect(0, i * 16, 64, 16);
        }
    }, true);
    g.add(mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 10), lam("#ffffff", { map: t }), X, 2.2, Z));
}
function addMountains(g, x0, y0, x1, y1, col, seed) {
    const r = mulberry32(seed);
    const cx = ((x0 + x1) / 2) * K3;
    const cz = ((y0 + y1) / 2) * K3;
    const ax = ((x1 - x0) / 2) * K3;
    const az = ((y1 - y0) / 2) * K3;
    const gs = [];
    for (let i = 0; i < 46; i++) {
        const a = (i / 46) * TAU + r() * 0.1;
        const k = 1.25 + r() * 0.5;
        const hgt = 14 + r() * 34;
        const ge = new THREE.ConeGeometry(14 + r() * 16, hgt, 6, 1);
        ge.rotateY(r() * TAU);
        ge.translate(cx + Math.cos(a) * ax * k, hgt / 2 - 1, cz + Math.sin(a) * az * k);
        gs.push(ge);
    }
    g.add(mesh(mergeGeos(gs), flat(col), 0, 0, 0, false));
}
function addStarfield(g) {
    const n = 500;
    const arr = new Float32Array(n * 3);
    const r = mulberry32(9);
    for (let i = 0; i < n; i++) {
        const a = r() * TAU;
        const e = 0.12 + r() * 1.3;
        arr[i * 3] = Math.cos(a) * Math.cos(e) * 600;
        arr[i * 3 + 1] = Math.sin(e) * 600;
        arr[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 600;
    }
    const ge = new THREE.BufferGeometry();
    ge.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const pts = new THREE.Points(ge, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false }));
    g.add(pts);
}
// ---------------------------------------------------------------------
//  Jemaah (instanced) & watak pemain
// ---------------------------------------------------------------------
const PG = {
    body: null,
    head: null,
    hair: null,
    veil: null,
    cape: null,
    face: null,
    hands: null,
};
function personGeos() {
    if (PG.body)
        return;
    PG.body = mergeGeos([
        new THREE.CylinderGeometry(0.4, 0.5, 1.3, 12).translate(0, 0.65, 0),
        new THREE.SphereGeometry(0.4, 12, 6, 0, TAU, 0, Math.PI / 2).scale(1, 0.45, 1).translate(0, 1.3, 0),
    ]);
    PG.head = new THREE.SphereGeometry(0.34, 14, 10).translate(0, 1.7, 0);
    PG.hair = new THREE.SphereGeometry(0.36, 14, 8, 0, TAU, 0, Math.PI * 0.5).translate(0, 1.74, -0.02);
    PG.veil = new THREE.SphereGeometry(0.44, 12, 10).scale(1, 1.08, 1).translate(0, 1.64, -0.04);
    PG.cape = new THREE.ConeGeometry(0.62, 0.95, 12, 1, true).translate(0, 1.32, 0);
    PG.face = new THREE.SphereGeometry(0.27, 10, 8).scale(1, 1.12, 0.75).translate(0, 1.62, 0.25);
    PG.hands = mergeGeos([new THREE.SphereGeometry(0.13, 8, 6).translate(0.5, 1.62, 0.2), new THREE.SphereGeometry(0.13, 8, 6).translate(-0.5, 1.62, 0.2)]);
}
function makePeople(cap, g) {
    personGeos();
    const mk = (geo, ds = false) => {
        const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff, side: ds ? THREE.DoubleSide : THREE.FrontSide }), cap);
        m.castShadow = true;
        m.receiveShadow = false;
        m.frustumCulled = false;
        m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        g.add(m);
        return m;
    };
    return {
        cap,
        meshes: {
            body: mk(PG.body),
            head: mk(PG.head),
            hair: mk(PG.hair),
            veil: mk(PG.veil),
            cape: mk(PG.cape, true),
            face: mk(PG.face),
            hands: mk(PG.hands),
        },
    };
}
const colCache = new Map();
function tcol(s) {
    let c = colCache.get(s);
    if (!c) {
        c = new THREE.Color(s);
        colCache.set(s, c);
    }
    return c;
}
function hairColor(p) {
    if (!p.ihram)
        return "#f6f4ec";
    if (p.shaved)
        return shade(p.skin, -0.12);
    return p.hair;
}
let _m4;
let _q;
let _v;
let _s;
let _e;
let _Z;
function mathInit() {
    if (_m4)
        return;
    _m4 = new THREE.Matrix4();
    _q = new THREE.Quaternion();
    _v = new THREE.Vector3();
    _s = new THREE.Vector3(1, 1, 1);
    _e = new THREE.Euler();
    _Z = new THREE.Matrix4().makeScale(0, 0, 0);
}
function personMatrix(p, out) {
    const bob = p.moving ? Math.abs(Math.sin(p.walk)) * 0.07 : 0;
    const ry = Math.atan2(p.dx, p.dy);
    _v.set(p.x * K3, bob, p.y * K3);
    _s.set(1, 1, 1);
    if (p.pose === "sleep") {
        _e.set(-Math.PI / 2, ry, 0, "YXZ");
        _v.y = 0.4;
    }
    else {
        _e.set(p.moving ? 0.06 : 0, ry, 0, "YXZ");
        if (p.pose === "sit")
            _s.set(1, 0.62, 1);
    }
    _q.setFromEuler(_e);
    out.compose(_v, _q, _s);
}
function updatePeople(pi, npcs, colors) {
    const M = pi.meshes;
    const n = Math.min(npcs.length, pi.cap);
    for (let i = 0; i < pi.cap; i++) {
        if (i >= n) {
            for (const k of Object.keys(M))
                M[k].setMatrixAt(i, _Z);
            continue;
        }
        const p = npcs[i].p;
        personMatrix(p, _m4);
        const fem = p.gender === "P";
        M.body.setMatrixAt(i, _m4);
        M.head.setMatrixAt(i, fem ? _Z : _m4);
        M.hair.setMatrixAt(i, fem ? _Z : _m4);
        M.veil.setMatrixAt(i, fem ? _m4 : _Z);
        M.cape.setMatrixAt(i, fem ? _m4 : _Z);
        M.face.setMatrixAt(i, fem ? _m4 : _Z);
        M.hands.setMatrixAt(i, p.pose === "pray" || p.pose === "throw" ? _m4 : _Z);
        if (colors) {
            const body = p.ihram ? "#f7f7f2" : p.outfit;
            M.body.setColorAt(i, tcol(body));
            M.head.setColorAt(i, tcol(p.skin));
            M.hair.setColorAt(i, tcol(hairColor(p)));
            const scarf = p.ihram ? "#ffffff" : p.acc;
            M.veil.setColorAt(i, tcol(scarf));
            M.cape.setColorAt(i, tcol(scarf));
            M.face.setColorAt(i, tcol(p.skin));
            M.hands.setColorAt(i, tcol(p.skin));
        }
    }
    for (const k of Object.keys(M)) {
        M[k].instanceMatrix.needsUpdate = true;
        if (colors && M[k].instanceColor)
            M[k].instanceColor.needsUpdate = true;
    }
}
function makeRig() {
    personGeos();
    const root = new THREE.Group();
    const L = (c) => new THREE.MeshLambertMaterial({ color: new THREE.Color(c) });
    const body = mesh(PG.body, L("#f7f7f2"));
    const head = mesh(PG.head, L("#e8b68c"));
    const hair = mesh(PG.hair, L("#1d1a17"));
    const veil = mesh(PG.veil, L("#ffffff"));
    const capeM = L("#ffffff");
    capeM.side = THREE.DoubleSide;
    const cape = mesh(PG.cape, capeM);
    const face = mesh(PG.face, L("#e8b68c"));
    const shoulder = mesh(new THREE.SphereGeometry(0.2, 10, 8), L("#e8b68c"), -0.3, 1.24, 0.04);
    root.add(body, head, hair, veil, cape, face, shoulder);
    const armMats = [];
    const arm = (sx) => {
        const gq = new THREE.Group();
        gq.position.set(sx * 0.42, 1.22, 0);
        const m = L("#f7f7f2");
        armMats.push(m);
        const a = mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.62, 8).translate(0, -0.31, 0), m);
        const hm = L("#e8b68c");
        armMats.push(hm);
        const h = mesh(new THREE.SphereGeometry(0.12, 8, 6).translate(0, -0.66, 0), hm);
        gq.add(a, h);
        root.add(gq);
        return gq;
    };
    const armL = arm(1);
    const armR = arm(-1);
    const ring = mesh(new THREE.TorusGeometry(0.8, 0.06, 6, 32), basic("#d9a83c"), 0, 0.04, 0, false);
    ring.rotation.x = Math.PI / 2;
    root.add(ring);
    return { root, body, head, hair, veil, cape, face, shoulder, armL, armR, armMats, key: "" };
}
function updateRig(dt) {
    const r = R3.rig;
    if (!r)
        return;
    r.root.visible = C3.mode !== "eye";
    r.root.position.set(P.x * K3, P.moving ? Math.abs(Math.sin(P.walk)) * 0.07 : 0, P.y * K3);
    const target = Math.atan2(P.dx, P.dy);
    r.root.rotation.y += wrapPi(target - r.root.rotation.y) * Math.min(1, dt * 14);
    const fem = P.gender === "P";
    const key = [P.gender, P.ihram, P.shaved, P.outfit, P.acc].join();
    if (key !== r.key) {
        r.key = key;
        const body = P.ihram ? "#f7f7f2" : P.outfit;
        r.body.material.color.set(body);
        r.hair.material.color.set(hairColor(P));
        const scarf = P.ihram ? "#ffffff" : P.acc;
        r.veil.material.color.set(scarf);
        r.cape.material.color.set(scarf);
        r.armMats[0].color.set(fem && !P.ihram ? shade(P.outfit, -0.06) : body);
        r.armMats[2].color.set(fem && !P.ihram ? shade(P.outfit, -0.06) : body);
        for (const m of [r.head, r.face, r.shoulder])
            m.material.color.set(P.skin);
        r.armMats[1].color.set(P.skin);
        r.armMats[3].color.set(P.skin);
        r.head.visible = !fem;
        r.hair.visible = !fem;
        r.veil.visible = fem;
        r.cape.visible = fem;
        r.face.visible = fem;
        r.shoulder.visible = !fem && P.ihram;
    }
    let la = 0;
    let ra = 0;
    if (P.pose === "pray") {
        la = -2.3;
        ra = -2.3;
    }
    else if (P.pose === "throw") {
        ra = -2.9;
    }
    else if (P.moving) {
        la = Math.sin(P.walk) * 0.55;
        ra = -la;
    }
    r.armL.rotation.x += (la - r.armL.rotation.x) * Math.min(1, dt * 12);
    r.armR.rotation.x += (ra - r.armR.rotation.x) * Math.min(1, dt * 12);
}
function makeMarkers(sc) {
    const gold = basic("#f2c230");
    R3.tRing = mesh(new THREE.TorusGeometry(2.0, 0.12, 8, 40), gold, 0, 0.08, 0, false);
    R3.tRing.rotation.x = Math.PI / 2;
    R3.tGem = mesh(new THREE.OctahedronGeometry(0.6), lam("#f2c230", { emissive: new THREE.Color("#6a4c08") }), 0, 4, 0, false);
    R3.tBeam = mesh(new THREE.CylinderGeometry(0.5, 0.9, 16, 16, 1, true), basic("#ffd76a", { transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }), 0, 8, 0, false);
    R3.iRing = mesh(new THREE.TorusGeometry(2.5, 0.08, 6, 40), basic("#ffffff", { transparent: true, opacity: 0.85 }), 0, 0.1, 0, false);
    R3.iRing.rotation.x = Math.PI / 2;
    const sh = new THREE.Shape();
    sh.moveTo(0, 1.1);
    sh.lineTo(0.75, -0.4);
    sh.lineTo(0, -0.05);
    sh.lineTo(-0.75, -0.4);
    sh.closePath();
    const ag = new THREE.ShapeGeometry(sh);
    ag.rotateX(-Math.PI / 2);
    R3.arrow = mesh(ag, basic("#f2c230", { side: THREE.DoubleSide, depthTest: false, transparent: true }), 0, 0.12, 0, false);
    R3.arrow.renderOrder = 5;
    sc.add(R3.tRing, R3.tGem, R3.tBeam, R3.iRing, R3.arrow);
    for (let i = 0; i < 40; i++) {
        const s = mesh(new THREE.SphereGeometry(0.16, 6, 5), lam("#6f6a60"), 0, -10, 0, false);
        s.visible = false;
        R3.stonePool.push(s);
        sc.add(s);
    }
}
// ---------------------------------------------------------------------
//  Bina / tukar dunia 3D untuk lokasi semasa
// ---------------------------------------------------------------------
function disposeWorld() {
    const w = R3.world;
    if (!w || !R3.scene)
        return;
    R3.scene.remove(w.group);
    w.group.traverse((o) => {
        const m = o;
        if (m.geometry && !Object.values(PG).includes(m.geometry))
            m.geometry.dispose();
        const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
        for (const mt of mats)
            mt.dispose();
    });
    for (const t of w.textures)
        t.dispose();
    matCache.clear();
    R3.world = null;
}
function ensureWorld() {
    if (!R3.scene)
        return;
    if (R3.world && R3.world.id === scene.id)
        return;
    disposeWorld();
    mathInit();
    BUILD_TEX = [];
    const sc = scene;
    const g = new THREE.Group();
    const b = sc.bounds;
    const tsz = LOWQ ? 1024 : 2048;
    // lantai besar di luar sempadan
    const outer = mesh(new THREE.PlaneGeometry(1600, 1600), lam(shade(sc.bg, -0.06)), 0, -0.05, 0, false);
    outer.rotation.x = -Math.PI / 2;
    g.add(outer);
    const gt = groundTexture(sc, b.x0, b.y0, b.x1, b.y1, tsz);
    const ground = mesh(new THREE.PlaneGeometry((b.x1 - b.x0) * K3, (b.y1 - b.y0) * K3), lam("#ffffff", { map: gt }), ((b.x0 + b.x1) / 2) * K3, 0, ((b.y0 + b.y1) / 2) * K3, false);
    ground.rotation.x = -Math.PI / 2;
    g.add(ground);
    if (sc.id === "makkah") {
        const R = 452;
        const mt = groundTexture(sc, -R, -R, R, R, tsz, R);
        const disc = mesh(new THREE.CircleGeometry(R * K3, 120), lam("#ffffff", { map: mt }), 0, 0.02, 0, false);
        disc.rotation.x = -Math.PI / 2;
        g.add(disc);
    }
    const lamps = [];
    let seed = 100;
    // model asas yang akan diganti oleh model .glb dibina dalam kumpulan tersendiri
    const repl = new Set(MODELS3D.filter((m) => m.scene === sc.id && m.replace).map((m) => m.replace));
    const subs = new Map();
    for (const d of sc.m3) {
        let tg = g;
        if (repl.has(d.k)) {
            let sub = subs.get(d.k);
            if (!sub) {
                sub = new THREE.Group();
                sub.name = "asas:" + d.k;
                g.add(sub);
                subs.set(d.k, sub);
            }
            tg = sub;
        }
        addM3(tg, d, lamps, d.k === "tree" ? seed++ : seed);
    }
    const people = makePeople(Math.max(40, sc.npcs.length), g);
    const peb = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.17, 0), flat("#8d877a"), 300);
    peb.frustumCulled = false;
    g.add(peb);
    R3.scene.add(g);
    R3.world = { id: sc.id, group: g, people, peb, pebKey: -1, lamps, textures: BUILD_TEX };
    BUILD_TEX = [];
    updatePeople(people, sc.npcs, true);
    R3.light = "";
    loadModels(sc.id, g, subs);
}
function addM3(g, d, lamps, seed) {
    switch (d.k) {
        case "bld":
            addBuilding(g, d);
            break;
        case "palm":
            addPalm(g, d.x, d.y, d.h);
            break;
        case "tree":
            addTree(g, d.x, d.y, d.s, seed);
            break;
        case "board":
            addBoard(g, d.x, d.y, d.title, d.col);
            break;
        case "lamp":
            addLamp(g, d.x, d.y, lamps);
            break;
        case "minaret":
            addMinaret(g, d.x, d.y, d.h, d.col);
            break;
        case "bus":
            addBus(g, d.x, d.y, d.w, d.d);
            break;
        case "tent":
            addTent(g, d.x, d.y, d.w, d.d, d.col, d.hl);
            break;
        case "rocks":
            addRocks(g, d.x, d.y, d.w, d.seed, d.col);
            break;
        case "wall":
            addWall(g, d);
            break;
        case "pillar":
            addPillar(g, d);
            break;
        case "cooler": {
            const [X, Z] = P3(d.x, d.y);
            g.add(mesh(new THREE.BoxGeometry(2.4, 1.6, 1.2), lam("#e9eef2"), X, 0.8, Z));
            g.add(mesh(new THREE.BoxGeometry(2.42, 0.3, 1.22), lam("#3d6fb4"), X, 1.1, Z));
            for (const dx of [-0.5, 0.5])
                g.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 10), lam("#9fc3e6", { transparent: true, opacity: 0.85 }), X + dx, 2.0, Z));
            break;
        }
        case "kaabah":
            addKaabah(g);
            break;
        case "maqam":
            addMaqam(g, d.x, d.y);
            break;
        case "arcade":
            addArcade(g, d.r0, d.r1, d.h);
            break;
        case "gate":
            addGate(g, d.x0, d.x1, d.y);
            break;
        case "green":
            addGreen(g, d.x0, d.x1, d.y);
            break;
        case "skyline":
            addSkyline(g);
            break;
        case "jamrah":
            addJamrah(g, d.x, d.y, d.rx, d.ry);
            break;
        case "hill":
            addHill(g, d.x, d.y, d.rx, d.ry, d.h);
            break;
        case "sign":
            addSign(g, d.x, d.y, d.text);
            break;
        case "pole":
            addPole(g, d.x, d.y);
            break;
        case "mountains":
            addMountains(g, d.x0, d.y0, d.x1, d.y1, d.col, d.seed);
            break;
        case "stars":
            addStarfield(g);
            break;
    }
}
let gltfReady = null;
const gltfCache = new Map();
function loadGltfLib() {
    if (THREE.GLTFLoader)
        return Promise.resolve(true);
    if (!gltfReady)
        gltfReady = new Promise((res) => {
            const s = document.createElement("script");
            s.src = GLTF_URL;
            s.async = true;
            s.onload = () => res(true);
            s.onerror = () => res(false);
            document.head.appendChild(s);
        });
    return gltfReady;
}
function fetchModel(file) {
    let p = gltfCache.get(file);
    if (!p) {
        p = loadGltfLib().then((ok) => new Promise((res) => {
            if (!ok)
                return res(null);
            const L = new THREE.GLTFLoader();
            L.load(file, (gl) => res(gl.scene), undefined, (e) => {
                console.warn("Model 3D gagal dimuat:", file, e);
                res(null);
            });
        }));
        gltfCache.set(file, p);
    }
    return p;
}
function loadModels(id, g, subs) {
    const list = MODELS3D.filter((m) => m.scene === id);
    for (const m of list) {
        void fetchModel(m.file).then((src) => {
            // pemain mungkin sudah bertukar lokasi semasa model dimuat
            if (!src || !R3.world || R3.world.group !== g)
                return;
            const obj = src.clone(true);
            const [X, Z] = P3(m.x, m.y);
            obj.position.set(X, 0, Z);
            obj.rotation.y = ((m.rot ?? 0) * Math.PI) / 180;
            obj.scale.setScalar(m.scale ?? 1);
            obj.traverse((o) => {
                const ms = o;
                if (!ms.isMesh)
                    return;
                ms.castShadow = true;
                ms.receiveShadow = true;
                // renderer menggunakan output linear; kekalkan warna asal tekstur Blender
                const mats = Array.isArray(ms.material) ? ms.material : [ms.material];
                for (const mt of mats) {
                    const mm = mt;
                    if (mm.map)
                        mm.map.encoding = THREE.LinearEncoding;
                    if (mm.emissiveMap)
                        mm.emissiveMap.encoding = THREE.LinearEncoding;
                    mm.needsUpdate = true;
                }
            });
            g.add(obj);
            if (m.replace) {
                const sub = subs.get(m.replace);
                if (sub)
                    sub.visible = false;
            }
        });
    }
}
function applyLight3D(l) {
    if (!R3.scene || !R3.hemi || !R3.sun)
        return;
    if (R3.light === l)
        return;
    R3.light = l;
    const sc = R3.scene;
    if (l === "night") {
        sc.background = new THREE.Color("#0a1430");
        sc.fog = new THREE.Fog(0x0a1430, 40, 260);
        R3.hemi.color.set("#7b8fc4");
        R3.hemi.groundColor.set("#3a3328");
        R3.hemi.intensity = 0.42;
        R3.sun.color.set("#a9bde8");
        R3.sun.intensity = 0.22;
    }
    else if (l === "dusk") {
        sc.background = new THREE.Color("#f1a46a");
        sc.fog = new THREE.Fog(0xe9a273, 90, 420);
        R3.hemi.color.set("#ffd2a8");
        R3.hemi.groundColor.set("#8a6a4a");
        R3.hemi.intensity = 0.46;
        R3.sun.color.set("#ff9b58");
        R3.sun.intensity = 0.6;
    }
    else {
        sc.background = new THREE.Color("#a9cfea");
        sc.fog = new THREE.Fog(0xc6dcea, 140, 560);
        R3.hemi.color.set("#dcebff");
        R3.hemi.groundColor.set("#a89272");
        R3.hemi.intensity = 0.44;
        R3.sun.color.set("#fff0d6");
        R3.sun.intensity = 0.64;
    }
    for (const p of R3.pts)
        p.intensity = 0;
}
// ---------------------------------------------------------------------
//  Kawalan kamera & input relatif kamera
// ---------------------------------------------------------------------
function input3D(raw, dt) {
    C3.fwdInput = -raw.y;
    if (KEYS.has("KeyQ"))
        C3.yaw += 1.8 * dt;
    if (KEYS.has("KeyR"))
        C3.yaw -= 1.8 * dt;
    const fx = -Math.sin(C3.yaw);
    const fz = -Math.cos(C3.yaw);
    if (C3.mode === "eye") {
        C3.yaw -= raw.x * 2.0 * dt;
        const f = -raw.y;
        return { x: fx * f, y: fz * f };
    }
    const rx = Math.cos(C3.yaw);
    const rz = -Math.sin(C3.yaw);
    return { x: rx * raw.x + fx * -raw.y, y: rz * raw.x + fz * -raw.y };
}
function cycleCam() {
    if (!R3.active)
        return;
    const order = ["back", "eye", "top"];
    C3.mode = order[(order.indexOf(C3.mode) + 1) % order.length];
    if (C3.mode === "eye") {
        C3.yaw = Math.atan2(-P.dx, -P.dy);
        C3.eyePitch = -0.04;
        toast("Pandangan mata jemaah: kayu bedik ke atas untuk berjalan, ke kiri/kanan untuk berpusing. Seret skrin untuk melihat sekeliling.", "info", 5600);
    }
    paintViewControls();
}
function zoom3D(f) {
    if (C3.mode === "eye")
        C3.fov = clamp(C3.fov / f, 24, 80);
    else if (C3.mode === "top")
        C3.topDist = clamp(C3.topDist / f, 28, 170);
    else
        C3.dist = clamp(C3.dist / f, 4.5, 48);
}
function zoomIn() {
    if (R3.active)
        zoom3D(1.15);
    else
        zoomBy(1.15);
}
function zoomOut() {
    if (R3.active)
        zoom3D(1 / 1.15);
    else
        zoomBy(1 / 1.15);
}
const DRAG = { ids: new Map(), pinch: 0 };
function initDrag3D() {
    const cv = el("world");
    cv.addEventListener("pointerdown", (e) => {
        if (!R3.active)
            return;
        DRAG.ids.set(e.pointerId, { x: e.clientX, y: e.clientY });
        cv.setPointerCapture(e.pointerId);
        if (DRAG.ids.size === 2) {
            const [a, b] = Array.from(DRAG.ids.values());
            DRAG.pinch = Math.hypot(a.x - b.x, a.y - b.y);
        }
    });
    cv.addEventListener("pointermove", (e) => {
        const prev = DRAG.ids.get(e.pointerId);
        if (!R3.active || !prev)
            return;
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        DRAG.ids.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (DRAG.ids.size >= 2) {
            const [a, b] = Array.from(DRAG.ids.values());
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (DRAG.pinch > 0)
                zoom3D(d / DRAG.pinch);
            DRAG.pinch = d;
            return;
        }
        C3.lastDrag = T.time;
        C3.yaw -= dx * 0.0065;
        if (C3.mode === "eye")
            C3.eyePitch = clamp(C3.eyePitch - dy * 0.004, -0.7, 0.6);
        else if (C3.mode === "top")
            C3.topPitch = clamp(C3.topPitch + dy * 0.004, 0.75, 1.5);
        else
            C3.pitch = clamp(C3.pitch + dy * 0.004, 0.08, 1.25);
    });
    const end = (e) => {
        DRAG.ids.delete(e.pointerId);
        if (DRAG.ids.size < 2)
            DRAG.pinch = 0;
    };
    cv.addEventListener("pointerup", end);
    cv.addEventListener("pointercancel", end);
}
const GYRO = {
    ok: typeof window.DeviceOrientationEvent !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    on: false,
    lastA: null,
};
function onOrient(e) {
    if (e.alpha == null || e.beta == null)
        return;
    const a = (e.alpha * Math.PI) / 180;
    const live = R3.active && C3.mode === "eye" && !modalOpen;
    if (live && GYRO.lastA != null) {
        // putar telefon ke kiri (alpha bertambah) = pandang ke kiri (yaw bertambah)
        C3.yaw += wrapPi(a - GYRO.lastA);
        // telefon tegak (beta ±90°) = pandang lurus; dongak/tunduk ikut kecondongan
        if (window.innerHeight >= window.innerWidth)
            C3.eyePitch = clamp(((e.beta - 90) * Math.PI) / 180, -0.7, 0.6);
    }
    GYRO.lastA = a;
}
async function setGyro(on, quiet = false) {
    if (!GYRO.ok)
        return false;
    if (!on) {
        window.removeEventListener("deviceorientation", onOrient);
        GYRO.on = false;
        SET.gyro = false;
        saveSettings();
        return false;
    }
    const perm = window.DeviceOrientationEvent.requestPermission;
    if (perm) {
        // iOS: kebenaran mesti diminta daripada tindakan pengguna
        if (quiet) {
            window.addEventListener("pointerdown", () => void setGyro(true), { once: true });
            return false;
        }
        let res = "denied";
        try {
            res = await perm();
        }
        catch {
            /* ditolak */
        }
        if (res !== "granted") {
            toast("Kebenaran sensor gerakan ditolak. Giroskop tidak dapat digunakan.", "warn", 4500);
            SET.gyro = false;
            saveSettings();
            return false;
        }
    }
    if (!GYRO.on)
        window.addEventListener("deviceorientation", onOrient);
    GYRO.on = true;
    GYRO.lastA = null;
    SET.gyro = true;
    saveSettings();
    if (!quiet)
        toast("Giroskop dihidupkan. Dalam paparan 3D, pilih kamera Mata dan gerakkan telefon untuk memandang sekeliling.", "info", 5500);
    return true;
}
// ---------------------------------------------------------------------
//  Kemas kini & lukis setiap bingkai
// ---------------------------------------------------------------------
function update3D(dt) {
    if (!R3.active || !R3.camera || !R3.world)
        return;
    ensureWorld();
    const w = R3.world;
    const cam = R3.camera;
    applyLight3D(currentLight());
    // kamera
    const tx = P.x * K3;
    const tz = P.y * K3;
    if (C3.mode === "back" && P.moving && C3.fwdInput > 0.3 && T.time - C3.lastDrag > 1.4) {
        const want = Math.atan2(-P.dx, -P.dy);
        C3.yaw += wrapPi(want - C3.yaw) * Math.min(1, dt * 1.1);
    }
    if (C3.mode === "eye") {
        const bob = P.moving ? Math.sin(P.walk * 2) * 0.045 : 0;
        cam.position.set(tx, 1.82 + bob, tz);
        const ep = C3.eyePitch;
        cam.lookAt(tx - Math.sin(C3.yaw) * Math.cos(ep), 1.82 + bob + Math.sin(ep), tz - Math.cos(C3.yaw) * Math.cos(ep));
        if (cam.fov !== C3.fov) {
            cam.fov = C3.fov;
            cam.updateProjectionMatrix();
        }
    }
    else {
        const top = C3.mode === "top";
        const pitch = top ? C3.topPitch : C3.pitch;
        const dist = top ? C3.topDist : C3.dist;
        _v.set(tx + Math.sin(C3.yaw) * Math.cos(pitch) * dist, 1.2 + Math.sin(pitch) * dist, tz + Math.cos(C3.yaw) * Math.cos(pitch) * dist);
        cam.position.lerp(_v, Math.min(1, dt * 9));
        // pandang sedikit ke hadapan pemain supaya kawasan di hadapan kelihatan di bawah kad tugasan
        const ahead = top ? 0 : Math.min(5, dist * 0.3);
        cam.lookAt(tx - Math.sin(C3.yaw) * ahead, 1.3, tz - Math.cos(C3.yaw) * ahead);
        if (cam.fov !== 55) {
            cam.fov = 55;
            cam.updateProjectionMatrix();
        }
    }
    // matahari mengikut pemain (supaya bayang sentiasa tajam di sekeliling)
    if (R3.sun) {
        R3.sun.position.set(tx + 34, 70, tz + 26);
        R3.sun.target.position.set(tx, 0, tz);
        R3.sun.castShadow = SET.hq;
    }
    // lampu malam: 3 lampu terdekat
    R3.lampT -= dt;
    if (R3.light === "night" && R3.lampT <= 0) {
        R3.lampT = 0.4;
        const near = w.lamps
            .map((v) => ({ v, d: (v.x - tx) ** 2 + (v.z - tz) ** 2 }))
            .sort((a, b) => a.d - b.d)
            .slice(0, R3.pts.length);
        R3.pts.forEach((pl, i) => {
            const n = near[i];
            if (n) {
                pl.position.copy(n.v);
                pl.intensity = 1.3;
            }
            else
                pl.intensity = 0;
        });
    }
    // jemaah
    R3.colorT -= dt;
    const colors = R3.colorT <= 0;
    if (colors)
        R3.colorT = 0.6;
    updatePeople(w.people, scene.npcs, colors);
    updateRig(dt);
    // batu di tanah
    let alive = 0;
    for (const pb of scene.pebbles)
        if (pb.alive)
            alive++;
    const key = alive * 1000 + scene.pebbles.length;
    if (key !== w.pebKey) {
        w.pebKey = key;
        let i = 0;
        for (const pb of scene.pebbles) {
            if (i >= 300)
                break;
            if (pb.alive) {
                _v.set(pb.x * K3, 0.08, pb.y * K3);
                _e.set(pb.x, pb.y, 0);
                _q.setFromEuler(_e);
                _s.setScalar(pb.s / 2.3);
                _m4.compose(_v, _q, _s);
                w.peb.setMatrixAt(i, _m4);
            }
            else
                w.peb.setMatrixAt(i, _Z);
            i++;
        }
        for (; i < 300; i++)
            w.peb.setMatrixAt(i, _Z);
        w.peb.instanceMatrix.needsUpdate = true;
    }
    // batu terbang
    R3.stonePool.forEach((m, i) => {
        const s = stones[i];
        if (!s) {
            m.visible = false;
            return;
        }
        m.visible = true;
        const gx = lerp(s.x0, s.x1, s.t);
        const gy = lerp(s.y0 + 30, s.y1, s.t);
        m.position.set(gx * K3, 1.7 * (1 - s.t) + 0.5 * s.t + Math.sin(Math.PI * s.t) * s.h * K3 * 0.9, gy * K3);
    });
    // penanda sasaran & interaksi
    const t = started ? stepTarget() : null;
    const show = !!t && SET.arrow;
    for (const m of [R3.tRing, R3.tGem, R3.tBeam])
        if (m)
            m.visible = show;
    if (show && t && R3.tRing && R3.tGem && R3.tBeam) {
        const pulse = 1 + Math.sin(T.time * 3.2) * 0.08;
        R3.tRing.position.set(t.x * K3, 0.08, t.y * K3);
        R3.tRing.scale.setScalar(pulse);
        R3.tGem.position.set(t.x * K3, 4 + Math.sin(T.time * 2.4) * 0.35, t.y * K3);
        R3.tGem.rotation.y += dt * 1.6;
        R3.tBeam.position.set(t.x * K3, 8, t.y * K3);
    }
    if (R3.arrow) {
        const far = !!t && SET.arrow && C3.mode !== "eye" && Math.hypot(t.x - P.x, t.y - P.y) > 70;
        R3.arrow.visible = far;
        if (far && t) {
            const a = Math.atan2(t.x - P.x, t.y - P.y);
            R3.arrow.position.set(tx + Math.sin(a) * 2.6, 0.12, tz + Math.cos(a) * 2.6);
            R3.arrow.rotation.y = a + Math.PI;
        }
    }
    if (R3.iRing) {
        const it = bestInteract;
        const on = !!it && !!it.ring && it.enabled();
        R3.iRing.visible = on;
        if (on && it) {
            R3.iRing.position.set(it.x * K3, 0.1, it.y * K3);
            R3.iRing.scale.setScalar(1 + Math.sin(T.time * 5) * 0.06);
        }
    }
}
function render3D() {
    if (!R3.renderer || !R3.scene || !R3.camera)
        return;
    R3.renderer.render(R3.scene, R3.camera);
}
// ---------------------------------------------------------------------
//  Lapisan 2D di atas 3D: label, nama, kompas
// ---------------------------------------------------------------------
function proj(x, y, h) {
    if (!R3.camera)
        return null;
    _v.set(x * K3, h, y * K3);
    const d = _v.distanceTo(R3.camera.position);
    _v.project(R3.camera);
    if (_v.z > 1 || _v.z < -1)
        return null;
    return { x: ((_v.x + 1) / 2) * W, y: ((1 - _v.y) / 2) * H, d };
}
function drawOverlay3D() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const maxD = C3.mode === "top" ? 260 : 120;
    for (const L of scene.labels) {
        const h3 = L.h3 ?? (L.kind === "place" ? 4 : 2);
        const s = proj(L.x3 ?? L.x, L.y3 ?? L.y, h3);
        if (!s || s.d > maxD)
            continue;
        if (L.kind === "small" && s.d > maxD * 0.55)
            continue;
        const place = L.kind === "place";
        ctx.globalAlpha = clamp(1.4 - s.d / maxD, 0.25, 1);
        ctx.font = place ? `800 11px ${FONT_D}` : `700 10.5px ${FONT_B}`;
        const w = ctx.measureText(L.text).width + 16;
        const h = place ? 20 : 18;
        let bg = "rgba(255,255,255,.9)";
        let fg = "#1c2622";
        if (place) {
            bg = "rgba(15,70,54,.92)";
            fg = "#ffffff";
        }
        else if (L.kind === "green") {
            bg = "#1f7a3f";
            fg = "#ffffff";
        }
        else if (L.kind === "warn") {
            bg = "#b5651d";
            fg = "#ffffff";
        }
        ctx.fillStyle = bg;
        rrect(ctx, s.x - w / 2, s.y - h / 2, w, h, h / 2);
        ctx.fill();
        ctx.fillStyle = fg;
        ctx.fillText(L.text, s.x, s.y + 0.5);
    }
    ctx.globalAlpha = 1;
    for (const f of floaters) {
        const s = proj(f.x, f.y + 40, 2.8 + f.t * 0.9);
        if (!s)
            continue;
        ctx.globalAlpha = clamp(1.3 - f.t, 0, 1);
        ctx.font = `800 15px ${FONT_D}`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(15,60,46,.85)";
        ctx.strokeText(f.text, s.x, s.y);
        ctx.fillStyle = "#ffe08a";
        ctx.fillText(f.text, s.x, s.y);
    }
    ctx.globalAlpha = 1;
    if (!started)
        return;
    if (C3.mode !== "eye") {
        const s = proj(P.x, P.y, 2.75);
        if (s) {
            ctx.font = `800 11.5px ${FONT_D}`;
            const w = ctx.measureText(S.name).width + 16;
            ctx.fillStyle = "#d9a83c";
            rrect(ctx, s.x - w / 2, s.y - 10, w, 19, 9.5);
            ctx.fill();
            ctx.fillStyle = "#3c2604";
            ctx.fillText(S.name, s.x, s.y + 0.5);
        }
    }
    const t = stepTarget();
    if (t && SET.arrow) {
        const dist = Math.hypot(t.x - P.x, t.y - P.y);
        if (dist < 70)
            return;
        const m = Math.round(dist * scene.mPerPx);
        const txt = m >= 1000 ? (m / 1000).toFixed(1) + " km" : m + " m";
        if (C3.mode === "eye") {
            // kompas di bahagian bawah tengah skrin
            const ang = Math.atan2(t.x - P.x, t.y - P.y);
            const view = Math.atan2(-Math.sin(C3.yaw), -Math.cos(C3.yaw));
            const rel = wrapPi(ang - view);
            const cx = W / 2;
            const cy = H - (W < 760 ? 190 : 170);
            ctx.save();
            ctx.translate(cx, cy);
            ctx.fillStyle = "rgba(8,42,32,.6)";
            circ(ctx, 0, 0, 26);
            ctx.fill();
            ctx.rotate(-rel);
            ctx.fillStyle = "#f2c230";
            poly(ctx, [0, -19, 11, 10, 0, 4, -11, 10]);
            ctx.fill();
            ctx.restore();
            ctx.font = `800 12px ${FONT_B}`;
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(15,60,46,.9)";
            ctx.strokeText(txt, cx, cy + 40);
            ctx.fillStyle = "#fff";
            ctx.fillText(txt, cx, cy + 40);
        }
        else {
            const a = Math.atan2(t.x - P.x, t.y - P.y);
            const s = proj(P.x + Math.sin(a) * 40, P.y + Math.cos(a) * 40, 0.3);
            if (s) {
                ctx.font = `800 11px ${FONT_B}`;
                ctx.lineWidth = 3;
                ctx.strokeStyle = "rgba(15,60,46,.85)";
                ctx.strokeText(txt, s.x, s.y + 14);
                ctx.fillStyle = "#fff";
                ctx.fillText(txt, s.x, s.y + 14);
            }
        }
    }
}

// =====================================================================
//  Fail 06: ENJIN GAME — keadaan, mekanik ibadah, gelung, lukisan
// =====================================================================
function newSave(name, gender) {
    return {
        v: 1,
        name,
        gender,
        step: 0,
        stars: 0,
        pebbles: 0,
        flags: {},
        ach: [],
        tawafLaps: 0,
        saieCount: 0,
        saieAt: "none",
        throws: {},
        wukuf: 0,
        outfit: "normal",
        shaved: false,
        scene: "miqat",
        lastTawaf: "",
        quiz: 0,
        tenaga: 100,
        air: CONFIG.tenaga.botol,
    };
}
function validSave(s) {
    if (!s || typeof s !== "object")
        return false;
    const o = s;
    return o.v === 1 && typeof o.step === "number" && o.step >= 0 && o.step <= ALL_STEPS.length && !!o.scene && o.scene in BUILDERS;
}
let S = newSave("Ahmad", "L");
let started = false;
const P = mkPerson("L", false);
P.skin = "#e8b68c";
P.hair = "#1d1a17";
const T = {
    tawaf: { active: false, cum: 0, last: 0, valid: true, wrong: 0, seg: -1, outT: 0, ramalRun: 0, ramalTot: 0, bumps: 0, lapIst: -1, inHijr: false },
    saie: { greenIn: false, green: 0, run: 0, legDoa: false, berdoaHere: false, doaCount: 0, femaleTip: false },
    wukuf: { praying: false, cardT: 0, idx: 0 },
    busy: 0,
    busyCb: null,
    poseT: 0,
    throwCd: 0,
    inflight: 0,
    aqMiss: 0,
    zamCd: 0,
    bumpCd: 0,
    pickTip: false,
    saveT: 0,
    enWarn: 0,
    minumCd: 0,
    hudT: 0,
    miniT: 0,
    running: false,
    time: 0,
};
const SCENES = {};
function getScene(id) {
    let sc = SCENES[id];
    if (!sc) {
        sc = BUILDERS[id]();
        M3_TARGET = null;
        SCENES[id] = sc;
    }
    return sc;
}
let scene = null;
// =====================================================================
//  LANGKAH & KEMAJUAN
// =====================================================================
function curFlat() {
    return S.step < ALL_STEPS.length ? ALL_STEPS[S.step] : null;
}
function curStep() {
    const f = curFlat();
    return f ? f.step : null;
}
function isStep(...ids) {
    const s = curStep();
    return !!s && ids.includes(s.id);
}
function finishStep(id) {
    if (isStep(id))
        advance();
}
function advance() {
    const prev = curFlat();
    if (!prev)
        return;
    S.step++;
    S.stars += 5;
    const nxt = curFlat();
    const taskDone = !nxt || nxt.ti !== prev.ti;
    if (taskDone) {
        S.stars += 10;
        toast(`Tugasan selesai: ${prev.task.title} (+15 bintang)`, "ok");
        SND.play("done");
        sparkle(P.x, P.y - 24);
    }
    else
        SND.play("ok");
    if (!nxt) {
        onAllDone();
    }
    else {
        if (nxt.step.id === "aqabah")
            T.aqMiss = 0;
        if (nxt.task.ch !== prev.task.ch) {
            const ch = CHAPTERS[nxt.task.ch - 1];
            later(() => banner(ch), 900);
        }
        nxt.step.onStart?.();
        say(nxt.step.text, "ms", true);
    }
    renderMission();
    saveGame();
}
function addStars(n, why) {
    S.stars += n;
    if (why)
        toast(`${why} (+${n} bintang)`, "ok", 3200);
}
function ach(id) {
    if (S.ach.includes(id))
        return;
    const a = ACH_LIST.find((x) => x.id === id);
    if (!a)
        return;
    if (a.only === "L" && S.gender !== "L")
        return;
    S.ach.push(id);
    S.stars += 5;
    toast(`Pencapaian: ${a.t} — ${a.d}`, "ach", 5200);
    SND.play("ach");
}
function saveGame() {
    if (started)
        saveJSON(CONFIG.saveKey, S);
}
function applyOutfit() {
    P.gender = S.gender;
    P.ihram = S.outfit === "ihram";
    P.shaved = S.shaved;
    P.outfit = S.gender === "L" ? "#dfe7ee" : "#cfdcea";
    P.acc = "#7f9fc4";
    drawAvatar();
}
// =====================================================================
//  LOKASI & PERJALANAN
// =====================================================================
function refreshCrowd() {
    if (scene.id === "miqat")
        return;
    const ch = curFlat()?.task.ch ?? 8;
    let ratio = 0.95;
    if (scene.id === "makkah")
        ratio = ch <= 3 ? 0.88 : ch === 6 ? 0.4 : 0.22;
    if (scene.id === "mina")
        ratio = ch <= 4 ? 0.95 : ch === 6 ? 0.72 : 0.25;
    for (const n of scene.npcs) {
        if (n.normal)
            continue;
        n.p.ihram = rnd() < ratio;
    }
}
function loadScene(id, pos) {
    scene = getScene(id);
    S.scene = id;
    const sp = pos ?? scene.spawn;
    P.x = sp.x;
    P.y = sp.y;
    P.dx = 0;
    P.dy = -1;
    cam.x = P.x;
    cam.y = P.y;
    refreshCrowd();
    stones.length = 0;
    T.inflight = 0;
    T.tawaf.active = false;
    T.wukuf.praying = false;
    el("mmScene").textContent = scene.name;
    SND.setAmbience(scene.ambient);
    if (id === "mina" && isStep("batu_tasyrik", "ula", "wusta", "aqabah2") && S.pebbles < 21)
        ensurePatch();
}
const TRAVEL_TIPS = {
    bus_makkah1: "Teruskan bertalbiah sepanjang perjalanan hingga tiba di Masjidil Haram.",
    bus_mina1: "Hari Tarwiyah: jemaah bergerak ke Mina sambil bertalbiah.",
    bus_arafah: "Menuju Arafah. Wukuf ialah kemuncak ibadah haji.",
    bus_muzdalifah: "Solat Maghrib dan Isyak ditunaikan secara jamak ta'khir di Muzdalifah.",
    bus_mina2: "Ke Mina untuk melontar Jamrah Aqabah. Teruskan bertalbiah.",
    bus_makkah2: "Ke Masjidil Haram untuk tawaf ifadah dan saie haji.",
    bus_mina3: "Kembali ke Mina untuk bermalam pada hari-hari Tasyrik.",
    bus_makkah3: "Tawaf wada' ialah urusan terakhir sebelum meninggalkan Makkah.",
};
function travelTo(id) {
    if (overlayBusy)
        return;
    const st = curStep();
    stopWukuf();
    SND.play("bus");
    const leg = st ? JOURNEY_LEGS.find((l) => l.step === st.id) : undefined;
    const km = st && st.id.startsWith("bus_") ? (leg ? leg.km : "±7 km") : "";
    el("trKm").textContent = km ? `Jarak anggaran ${km}` : "";
    showTravel(scene.name, SCENE_NAMES[id], (st && TRAVEL_TIPS[st.id]) || "Perbanyakkan zikir dalam perjalanan.", () => loadScene(id), () => {
        // berehat di dalam bas; air minuman disediakan
        S.tenaga = Math.max(S.tenaga, 80);
        S.air = CONFIG.tenaga.botol;
        if (curStep()?.travel === id)
            advance();
        toast(`Tiba di ${SCENE_NAMES[id]}.`, "info", 3000);
    });
}
// =====================================================================
//  TINDAKAN AM
// =====================================================================
function pray(sec, msg, cb) {
    T.busy = sec;
    T.busyCb = cb;
    P.pose = "pray";
    toast(msg, "info", sec * 1000);
}
function actWearIhram() {
    fadeDo("Mandi sunat & memakai ihram", S.gender === "L" ? "Dua helai kain ihram tidak berjahit" : "Pakaian menutup aurat · muka & tapak tangan terbuka", () => {
        S.outfit = "ihram";
        applyOutfit();
    }, () => openReading("larangan", () => finishStep("ihram_wear")));
}
function actSolatIhram() {
    pray(2.6, "Solat sunat ihram dua rakaat…", () => finishStep("solat_ihram"));
}
function openNiat(kind) {
    const opts = [
        {
            ar: DOA.niatHaji.ar,
            label: "Sahaja aku berniat haji dan berihram dengannya kerana Allah Taala.",
            ok: kind === "haji",
            why: kind === "haji" ? "Betul. Kamu kini berihram untuk haji. Bacalah talbiah." : "Itu niat haji. Haji Tamattu' bermula dengan umrah dahulu.",
        },
        {
            ar: DOA.niatUmrah.ar,
            label: "Sahaja aku berniat umrah dan berihram dengannya kerana Allah Taala.",
            ok: kind === "umrah",
            why: kind === "umrah" ? "Betul. Kamu kini berihram untuk umrah. Bacalah talbiah." : "Itu niat umrah. Umrah kamu sudah selesai; sekarang berniat haji.",
        },
        {
            label: "Tidak perlu berniat, memadai memakai kain ihram.",
            ok: false,
            why: "Niat ihram ialah rukun pertama haji dan umrah. Memakai kain ihram tanpa niat belum dikira berihram.",
        },
    ];
    openChoice(kind === "umrah" ? "Masjid Miqat Bir Ali" : "Hotel jemaah · 8 Zulhijjah", "Pilih lafaz niat yang betul", "<p>Niat di dalam hati sudah memadai, dan sunat dilafazkan.</p>", opts, () => {
        showDoa("talbiah");
        if (kind === "umrah") {
            ach("ihram");
            finishStep("niat_umrah");
        }
        else
            finishStep("niat_haji");
    });
}
function actNiatHaji() {
    fadeDo("Mandi sunat & memakai ihram", "8 Zulhijjah · Hari Tarwiyah", () => {
        S.outfit = "ihram";
        applyOutfit();
    }, () => openNiat("haji"));
}
function actSolatTawaf() {
    pray(2.6, "Solat sunat tawaf dua rakaat di belakang Maqam Ibrahim…", () => {
        S.flags["solat_" + S.lastTawaf] = true;
        addStars(5, "Solat sunat tawaf");
        ach("maqam");
    });
}
function actZamzam() {
    T.zamCd = 8;
    S.tenaga = Math.min(100, S.tenaga + CONFIG.tenaga.teguk);
    if (S.air < CONFIG.tenaga.botol) {
        S.air = CONFIG.tenaga.botol;
        later(() => toast("Botol air diisi semula dengan air Zamzam.", "info", 3000), 600);
    }
    P.pose = "pray";
    T.poseT = 1;
    showDoa("zamzam");
    const key = "zam_" + (S.lastTawaf || "awal");
    if (!S.flags[key]) {
        S.flags[key] = true;
        addStars(3, "Minum air Zamzam sambil berdoa (sunat)");
    }
    ach("zamzam");
}
function openCukur(kind) {
    const male = S.gender === "L";
    const opts = male
        ? [
            { label: "Bercukur seluruh kepala", sub: "Afdal bagi lelaki", ok: true, why: "Betul. Bercukur seluruh kepala lebih afdal bagi lelaki." },
            { label: "Bergunting sekurang-kurangnya tiga helai rambut", sub: "Memadai", ok: true, why: "Betul. Menggunting sekurang-kurangnya tiga helai rambut sudah memadai." },
            { label: "Memotong kuku sahaja", ok: false, why: "Tidak memadai. Tahallul memerlukan bercukur atau bergunting rambut kepala." },
        ]
        : [
            {
                label: "Gunting hujung rambut sekurang-kurangnya tiga helai",
                sub: "Sunat kira-kira seruas jari",
                ok: true,
                why: "Betul. Bagi wanita, memadai menggunting hujung rambut; wanita tidak disunatkan bercukur.",
            },
            { label: "Bercukur seluruh kepala", ok: false, why: "Wanita tidak disunatkan bercukur. Memadai menggunting hujung rambut." },
            { label: "Memotong kuku sahaja", ok: false, why: "Tidak memadai. Tahallul memerlukan bergunting rambut kepala." },
        ];
    openChoice(kind === "umrah" ? "Kedai gunting · Makkah" : "Khemah gunting · Mina", "Bercukur atau bergunting", "<p>Bercukur atau bergunting ialah rukun umrah dan haji, dan dengannya jemaah bertahallul.</p>", opts, (i) => {
        fadeDo(male && i === 0 ? "Bercukur…" : "Bergunting…", kind === "umrah" ? "Tahallul umrah" : "Tahallul awal", () => {
            if (male && i === 0)
                S.shaved = true;
            S.outfit = "normal";
            applyOutfit();
        }, () => {
            if (kind === "umrah") {
                toast("Umrah selesai! Kamu bertahallul. Larangan ihram terangkat sehingga berihram haji.", "ok", 6500);
                finishStep("tahallul_umrah");
            }
            else {
                toast("TAHALLUL AWAL: larangan ihram terangkat kecuali bersetubuh, bercumbu dan akad nikah.", "ok", 7000);
                finishStep("cukur_nahar");
            }
        });
    });
}
function restFull() {
    S.tenaga = 100;
    S.air = CONFIG.tenaga.botol;
}
function actTarwiyah() {
    fadeDo("Bermalam di Mina", "Malam 9 Zulhijjah · berzikir & berehat", restFull, () => finishStep("mina_tarwiyah"));
}
function openNafar() {
    openChoice("Khemah Maktab 87 · Mina", "Nafar awal atau nafar thani?", "<p>Kedua-duanya dibenarkan. Pilih satu untuk melihat perbezaannya.</p>", [
        {
            label: "Nafar awal",
            sub: "Lontar pada 12 Zulhijjah, keluar dari Mina sebelum matahari terbenam",
            ok: true,
            why: "Nafar awal: selepas melontar ketiga-tiga jamrah pada 12 Zulhijjah, keluar dari Mina sebelum matahari terbenam. Jumlah batu 49 biji.",
        },
        {
            label: "Nafar thani",
            sub: "Bermalam pada malam 13 dan melontar sekali lagi",
            ok: true,
            why: "Nafar thani: bermalam pada malam 13 dan melontar ketiga-tiga jamrah pada 13 Zulhijjah. Ini lebih sempurna. Jumlah batu 70 biji.",
        },
    ], (i) => {
        S.flags.nafarThani = i === 1;
        fadeDo("Bermalam di Mina", i === 0 ? "12 Zulhijjah · lontaran diulang, keluar sebelum Maghrib" : "12 & 13 Zulhijjah · lontaran diulang", restFull, () => finishStep("nafar"));
    });
}
function actDam() {
    const r = READ.dam;
    openModal({
        kicker: r.kicker,
        title: r.title,
        html: r.html,
        buttons: [
            {
                label: "Wakilkan dam",
                kind: "primary",
                onClick: () => {
                    toast("Dam Tamattu' telah diwakilkan. Seekor kambing akan disembelih di Tanah Haram.", "ok", 5200);
                    finishStep("dam");
                },
            },
            { label: "Tutup", kind: "ghost" },
        ],
    });
}
function actKhutbah() {
    const r = READ.khutbah;
    openModal({
        kicker: r.kicker,
        title: r.title,
        html: r.html,
        buttons: [
            {
                label: "Dengar khutbah & solat",
                kind: "primary",
                onClick: () => pray(3, "Mendengar khutbah, kemudian solat jamak taqdim dan qasar Zohor–Asar…", () => {
                    finishStep("arafah_khutbah");
                    later(() => showDoa("arafah"), 300);
                }),
            },
            { label: "Tutup", kind: "ghost" },
        ],
    });
}
function actMabitMuzdalifah() {
    fadeDo("Bermalam di Muzdalifah", "Lepas tengah malam · 10 Zulhijjah", restFull, () => {
        toast("Mabit di Muzdalifah sempurna. Kamu boleh bertolak ke Mina.", "ok");
        finishStep("mabit_muz");
    });
}
const TAWAF_NAME = { umrah: "Tawaf umrah", ifadah: "Tawaf ifadah", wada: "Tawaf wada'" };
function tawafKind() {
    if (isStep("tawaf"))
        return "umrah";
    if (isStep("ifadah"))
        return "ifadah";
    if (isStep("wada"))
        return "wada";
    return null;
}
const angOf = (p) => Math.atan2(-p.y, p.x);
function segOf(a) {
    if (a >= 0 && a < Math.PI / 2)
        return 0;
    if (a >= Math.PI / 2)
        return 1;
    if (a < -Math.PI / 2)
        return 2;
    return 3;
}
const SEG_NAMES = [
    "Hajarul Aswad → Rukun Iraqi (pintu Kaabah)",
    "Rukun Iraqi → Rukun Syami (Hijir Ismail)",
    "Rukun Syami → Rukun Yamani",
    "Rukun Yamani → Hajarul Aswad",
];
function startTawaf() {
    const kind = isStep("tawaf_start") ? "umrah" : isStep("ifadah_start") ? "ifadah" : "wada";
    const t = T.tawaf;
    S.tawafLaps = 0;
    t.active = true;
    t.last = angOf(P);
    t.cum = wrapPi(t.last);
    t.valid = true;
    t.wrong = 0;
    t.seg = segOf(t.last);
    t.bumps = 0;
    t.ramalRun = 0;
    t.ramalTot = 0;
    t.lapIst = 0;
    t.inHijr = false;
    P.pose = "throw";
    T.poseT = 0.7;
    showDoa("istilam");
    if (kind === "umrah") {
        toast("Talbiah dihentikan apabila memulakan tawaf umrah. Berjalan berlawanan arah jam, Kaabah di sebelah kiri.", "info", 6000);
        if (S.gender === "L")
            later(() => toast("Lelaki: sunat idtiba' (bahu kanan terbuka) dan ramal (berlari-lari anak) pada 3 pusingan pertama. Tekan Laju.", "info", 6500), 1800);
    }
    else
        toast(`${TAWAF_NAME[kind]} bermula. Kaabah di sebelah kiri, 7 pusingan.`, "info");
    advance();
}
function actIstilam() {
    T.tawaf.lapIst = S.tawafLaps;
    P.pose = "throw";
    T.poseT = 0.7;
    showDoa("istilam");
    S.stars += 1;
    toast("Isyarat ke Hajarul Aswad sambil bertakbir (sunat). Tidak perlu berasak-asak untuk menciumnya.", "info", 3600);
}
function updateTawaf(dt) {
    const kind = tawafKind();
    const t = T.tawaf;
    if (!kind || scene.id !== "makkah")
        return;
    if (!t.active) {
        t.active = true;
        t.last = angOf(P);
        t.cum = 0;
        t.valid = false;
        t.seg = segOf(t.last);
    }
    const a = angOf(P);
    const r = Math.hypot(P.x, P.y);
    const d = wrapPi(a - t.last);
    const inMataf = r < MATAF_R;
    const inHijr = inHijrZone(P);
    const crossedCCW = P.x > 0 && t.last < 0 && a >= 0 && d > 0 && d < 0.6;
    t.last = a;
    if (inHijr && !t.inHijr) {
        t.valid = false;
        toast("Kamu masuk ke Hijir Ismail! Pusingan ini tidak sah. Keluar, kemudian mulakan semula pusingan dari garisan Hajarul Aswad.", "bad", 6500);
        SND.play("err");
    }
    t.inHijr = inHijr;
    if (t.valid && inMataf && !inHijr)
        t.cum += d;
    if (inMataf && d < -0.0005)
        t.wrong += -d;
    else if (d > 0)
        t.wrong = Math.max(0, t.wrong - d * 0.6);
    if (t.wrong > 0.42) {
        t.wrong = 0;
        toast("Arah salah! Tawaf mesti berlawanan arah jam — pastikan Kaabah di sebelah KIRI kamu.", "bad");
        SND.play("err");
    }
    t.outT -= dt;
    if (!inMataf && r < MATAF_R + 160 && t.outT <= 0) {
        t.outT = 6;
        toast("Kembali ke kawasan mataf (lantai putih). Dalam simulasi ini pusingan dikira di dalam mataf sahaja.", "warn");
    }
    const seg = segOf(a);
    if (seg !== t.seg) {
        t.seg = seg;
        if (seg === 3 && t.valid)
            showDoa("rabbana", true);
    }
    if (kind === "umrah" && S.tawafLaps < 3 && P.moving) {
        t.ramalTot += dt;
        if (T.running)
            t.ramalRun += dt;
    }
    if (crossedCCW) {
        if (!t.valid) {
            t.valid = true;
            t.cum = 0;
            toast("Pusingan dimulakan semula dari garisan Hajarul Aswad.", "info", 3200);
        }
        else if (t.cum >= TAU - 0.35) {
            S.tawafLaps++;
            t.cum = Math.max(0, t.cum - TAU);
            SND.play("lap");
            floatText(P.x, P.y - 44, `Pusingan ${S.tawafLaps}`);
            if (S.tawafLaps === 3 && kind === "umrah" && S.gender === "L" && t.ramalTot > 0 && t.ramalRun / t.ramalTot > 0.5)
                ach("ramal");
            if (S.tawafLaps >= 7) {
                completeTawaf(kind);
                return;
            }
            toast(LAP_TIPS[S.tawafLaps], "ok", 4200);
            saveGame();
        }
    }
}
function completeTawaf(kind) {
    const t = T.tawaf;
    t.active = false;
    S.lastTawaf = kind;
    if (t.bumps < 3)
        ach("adab");
    const id = kind === "umrah" ? "tawaf" : kind;
    if (kind === "wada")
        toast("Tawaf wada' selesai. Semoga Allah menerima ibadah haji kamu.", "ok", 6000);
    else
        toast("Tawaf selesai! Sunat solat dua rakaat di belakang Maqam Ibrahim dan minum air Zamzam sebelum saie.", "ok", 6500);
    finishStep(id);
}
function tawafCounter() {
    const kind = tawafKind() ?? "umrah";
    const t = T.tawaf;
    const inMataf = Math.hypot(P.x, P.y) < MATAF_R;
    const frac = t.valid ? clamp(t.cum / TAU, 0, 0.999) : 0;
    let tag = null;
    if (!t.valid)
        tag = { text: "Pusingan belum dikira — mula di garisan Hajarul Aswad", bad: true };
    else if (!inMataf)
        tag = { text: "Di luar mataf — pusingan tidak bergerak", bad: true };
    return {
        title: `${TAWAF_NAME[kind]} — pusingan`,
        cur: S.tawafLaps,
        max: 7,
        pct: (S.tawafLaps + frac) / 7,
        sub: "Berlawanan arah jam · Kaabah di kiri · " + SEG_NAMES[segOf(angOf(P))],
        tag,
    };
}
function tawafTarget() {
    return T.tawaf.valid && T.tawaf.active ? null : POS.makkah.line;
}
// =====================================================================
//  MEKANIK SAIE
// =====================================================================
function saieKind() {
    if (isStep("saie"))
        return "umrah";
    if (isStep("saie_haji"))
        return "haji";
    return null;
}
function startSaie() {
    const startId = isStep("saie_start") ? "saie_start" : "saie_haji_start";
    S.saieCount = 0;
    S.saieAt = "safa";
    const s = T.saie;
    s.greenIn = false;
    s.legDoa = false;
    s.berdoaHere = false;
    s.doaCount = 0;
    showDoa("safa");
    toast("Saie bermula di Safa. Hadap Kaabah dan tekan BERDOA (sunat), kemudian berjalan ke Marwah.", "info", 6000);
    finishStep(startId);
}
function actBerdoaBukit() {
    const s = T.saie;
    s.berdoaHere = true;
    s.doaCount++;
    P.pose = "pray";
    T.poseT = 1.6;
    P.dx = -1;
    P.dy = 0;
    showDoa("takbir");
    S.stars += 1;
    if (s.doaCount >= 8)
        ach("bukit");
}
function updateSaie(dt) {
    const kind = saieKind();
    if (!kind || scene.id !== "makkah")
        return;
    const s = T.saie;
    const inCorr = inMasa(P);
    const atSafa = inCorr && P.y > MASA.safaY;
    const atMarwah = inCorr && P.y < MASA.marwahY;
    const going = S.saieCount % 2 === 0 ? "marwah" : "safa";
    const inGreen = inCorr && P.y > MASA.g1 && P.y < MASA.g2;
    if (inGreen && !s.greenIn) {
        s.greenIn = true;
        s.green = 0;
        s.run = 0;
        if (!s.legDoa) {
            showDoa("hijau", true);
            s.legDoa = true;
        }
        if (S.gender === "P" && !s.femaleTip) {
            s.femaleTip = true;
            toast("Wanita berjalan seperti biasa di kawasan lampu hijau.", "info");
        }
    }
    if (inGreen) {
        s.green += dt;
        if (T.running)
            s.run += dt;
    }
    else if (s.greenIn) {
        s.greenIn = false;
        if (S.gender === "L" && s.green > 0.6 && s.run / s.green > 0.6) {
            toast("Bagus! Kamu berlari-lari anak di antara dua lampu hijau (sunat bagi lelaki).", "ok", 4000);
            S.stars += 2;
            ach("hijau");
        }
    }
    if ((going === "marwah" && atMarwah) || (going === "safa" && atSafa)) {
        S.saieCount++;
        S.saieAt = going;
        s.berdoaHere = false;
        s.legDoa = false;
        SND.play("lap");
        floatText(P.x, P.y - 44, `Perjalanan ${S.saieCount}`);
        if (S.saieCount >= 7) {
            completeSaie(kind);
            return;
        }
        const hill = going === "marwah" ? "Marwah" : "Safa";
        const next = going === "marwah" ? "SAFA" : "MARWAH";
        toast(`Perjalanan ${S.saieCount}/7 tiba di Bukit ${hill}. Hadap Kaabah dan berdoa (sunat), kemudian ke ${next}.`, "ok", 4600);
        saveGame();
    }
}
function completeSaie(kind) {
    if (T.saie.doaCount >= 8)
        ach("bukit");
    if (kind === "umrah") {
        toast("Saie selesai di Marwah! Seterusnya bercukur atau bergunting untuk bertahallul.", "ok", 6000);
        finishStep("saie");
    }
    else {
        toast("Saie haji selesai. TAHALLUL THANI: semua larangan ihram kini terangkat.", "ok", 7000);
        finishStep("saie_haji");
    }
}
function saieCounter() {
    const going = S.saieCount % 2 === 0 ? "MARWAH" : "SAFA";
    const goalY = going === "MARWAH" ? MASA.marwahY : MASA.safaY;
    const inCorr = inMasa(P);
    const span = MASA.safaY - MASA.marwahY;
    const leg = inCorr ? clamp(1 - Math.abs(P.y - goalY) / span, 0, 1) : 0;
    const m = Math.max(0, Math.round(Math.abs(P.y - goalY) * scene.mPerPx));
    const inGreen = inCorr && P.y > MASA.g1 && P.y < MASA.g2;
    return {
        title: kind2title(),
        cur: S.saieCount,
        max: 7,
        pct: (S.saieCount + leg) / 7,
        sub: inCorr ? `Menuju ke ${going} ${going === "MARWAH" ? "↑" : "↓"} · ${m} m lagi` : "Masuk semula ke koridor Mas'a",
        tag: inGreen
            ? { text: S.gender === "L" ? "Lampu hijau: lelaki sunat berlari-lari anak (Laju)" : "Lampu hijau: wanita berjalan seperti biasa", bad: false }
            : null,
    };
}
function kind2title() {
    return saieKind() === "haji" ? "Saie haji — perjalanan" : "Saie umrah — perjalanan";
}
function saieTarget() {
    return S.saieCount % 2 === 0 ? { x: 535, y: MASA.marwahY - 10 } : { x: 535, y: MASA.safaY + 10 };
}
function achTotal() {
    return ACH_LIST.filter((a) => !(a.only === "L" && S.gender !== "L")).length;
}
// =====================================================================
//  MEKANIK MELONTAR
// =====================================================================
function expectedJamrah() {
    if (isStep("aqabah", "aqabah2"))
        return "aqabah";
    if (isStep("ula"))
        return "ula";
    if (isStep("wusta"))
        return "wusta";
    return null;
}
function throwStepId() {
    const s = curStep();
    return s && ["aqabah", "ula", "wusta", "aqabah2"].includes(s.id) ? s.id : null;
}
function inThrowRange(j) {
    if (scene.id !== "mina")
        return false;
    const J = JAM[j];
    const dx = (P.x - J.x) / (J.rx + 150);
    const dy = (P.y - J.y) / (J.ry + 150);
    return dx * dx + dy * dy < 1;
}
function jamrahFront(j) {
    const J = JAM[j];
    return { x: J.x, y: J.y + J.ry + 70 };
}
function ensurePatch() {
    const mina = getScene("mina");
    const alive = mina.pebbles.filter((p) => p.alive).length;
    if (alive >= 14)
        return;
    for (let i = 0; i < 36; i++) {
        const a = rr(0, TAU);
        const r = Math.sqrt(rnd());
        mina.pebbles.push({ x: POS.mina.patch.x + Math.cos(a) * 84 * r, y: POS.mina.patch.y + Math.sin(a) * 44 * r, alive: true, s: rr(1.8, 2.8) });
    }
}
function throwAt(j) {
    const exp = expectedJamrah();
    const sid = throwStepId();
    if (!exp || !sid) {
        toast("Tiada lontaran diperlukan sekarang.");
        return;
    }
    if (exp !== j) {
        toast(isStep("aqabah") ? "Pada 10 Zulhijjah hanya Jamrah Aqabah dilontar." : `Ikut tertib: lontar ${JAM[exp].name} dahulu.`, "warn");
        SND.play("err");
        return;
    }
    const done = S.throws[sid] ?? 0;
    if (done + T.inflight >= 7 || T.throwCd > 0)
        return;
    if (S.pebbles <= 0) {
        toast("Batu kamu sudah habis. Kutip batu di Kawasan batu berhampiran stesen bas.", "warn");
        ensurePatch();
        return;
    }
    T.throwCd = 0.45;
    S.pebbles--;
    P.pose = "throw";
    T.poseT = 0.35;
    T.inflight++;
    if (done === 0 && T.inflight === 1) {
        showDoa("lontar", true);
        if (sid === "aqabah")
            toast("Talbiah dihentikan pada lontaran pertama di Jamrah Aqabah.", "info", 4200);
    }
    const J = JAM[j];
    const e = Math.hypot((P.x - J.x) / J.rx, (P.y - J.y) / J.ry);
    const edge = Math.max(0, e - 1) * ((J.rx + J.ry) / 2);
    const sigma = 5 + Math.max(0, edge - 30) * 0.22;
    const tx = J.x + gauss() * sigma * 1.2;
    const ty = J.y + gauss() * sigma * 0.7;
    const hit = ((tx - J.x) / J.rx) ** 2 + ((ty - J.y) / J.ry) ** 2 <= 1;
    const vx = J.x - P.x;
    const vy = J.y - P.y;
    const vm = Math.hypot(vx, vy) || 1;
    P.dx = vx / vm;
    P.dy = vy / vm;
    SND.play("throw");
    spawnStone(P.x + 6, P.y - 30, tx, ty, () => {
        T.inflight = Math.max(0, T.inflight - 1);
        if (throwStepId() !== sid)
            return;
        if (hit) {
            const n = (S.throws[sid] = (S.throws[sid] ?? 0) + 1);
            SND.play("hit");
            dust(tx, ty, "#d9d2bf");
            floatText(tx, ty - 24, `${n}/7`);
            if (n >= 7)
                finishThrows(sid, j);
        }
        else {
            SND.play("miss");
            dust(tx, ty, "#b8a98a");
            if (sid === "aqabah")
                T.aqMiss++;
            toast("Tersasar! Batu tidak masuk ke dalam takungan. Lontar sebiji lagi dan bergerak lebih dekat.", "warn", 3400);
        }
    });
}
function finishThrows(sid, j) {
    if (sid === "aqabah") {
        if (T.aqMiss === 0)
            ach("tepat");
        toast("Lontaran Jamrah Aqabah selesai. Seterusnya: selesaikan dam dan bercukur.", "ok", 5200);
    }
    else if (sid === "ula" || sid === "wusta") {
        toast(`${JAM[j].name} selesai. Sunat menghadap kiblat dan berdoa sebelum ke jamrah seterusnya.`, "ok", 5200);
    }
    else
        toast("Ketiga-tiga jamrah selesai untuk hari ini.", "ok", 4200);
    later(() => finishStep(sid), 450);
}
function throwCounter(sid, j) {
    const n = S.throws[sid] ?? 0;
    const inR = inThrowRange(j);
    return {
        title: `Lontar ${JAM[j].name}`,
        cur: n,
        max: 7,
        sub: inR ? "Tekan LONTAR. Semakin dekat dengan takungan, semakin tepat." : `Pergi ke ${JAM[j].name}.`,
        tag: { text: `Batu dalam beg: ${S.pebbles}`, bad: S.pebbles + n < 7 },
    };
}
// =====================================================================
//  MEKANIK WUKUF
// =====================================================================
function toggleWukuf() {
    if (T.wukuf.praying) {
        stopWukuf();
        return;
    }
    if (!insideArafah(P)) {
        toast("Kamu berada di luar sempadan Arafah! Wukuf tidak sah di sini. Bergerak ke timur melepasi papan kuning.", "bad", 5600);
        SND.play("err");
        return;
    }
    T.wukuf.praying = true;
    T.wukuf.cardT = 0;
    toast("Berwukuf… kekal diam, berdoa, berzikir dan beristighfar.", "info", 3600);
}
function stopWukuf(msg) {
    if (!T.wukuf.praying)
        return;
    T.wukuf.praying = false;
    P.pose = "stand";
    if (msg)
        toast(msg, "warn");
}
function updateWukuf(dt) {
    if (!isStep("wukuf")) {
        T.wukuf.praying = false;
        return;
    }
    if (!T.wukuf.praying)
        return;
    P.pose = "pray";
    S.wukuf = Math.min(1, S.wukuf + dt / 24);
    T.wukuf.cardT -= dt;
    if (T.wukuf.cardT <= 0) {
        T.wukuf.cardT = 6;
        const keys = ["arafah", "istighfar", "talbiah", "rabbana"];
        showDoa(keys[T.wukuf.idx++ % keys.length]);
    }
    if (S.wukuf >= 1) {
        T.wukuf.praying = false;
        P.pose = "stand";
        ach("arafah");
        toast("Alhamdulillah, wukuf selesai. Tunggu hingga matahari terbenam, kemudian bertolak ke Muzdalifah.", "ok", 6500);
        finishStep("wukuf");
    }
}
function wukufCounter() {
    const inside = insideArafah(P);
    return {
        title: "Wukuf di Arafah",
        cur: Math.floor(S.wukuf * 100),
        max: 100,
        unit: "%",
        pct: S.wukuf,
        sub: !inside ? "Kamu di luar sempadan Arafah!" : T.wukuf.praying ? "Sedang berdoa… kekal diam" : "Tekan BERDOA dan kekal diam",
        tag: inside ? { text: "Dalam sempadan Arafah", bad: false } : { text: "Luar sempadan — wukuf tidak sah", bad: true },
    };
}
// =====================================================================
//  TAMAT
// =====================================================================
function onQuizDone(kind, score, total) {
    if (kind === "umrah") {
        finishStep("quiz_umrah");
        return;
    }
    S.quiz = Math.max(S.quiz, score);
    if (score === total)
        ach("quiz");
    finishStep("quiz_final");
}
function onAllDone() {
    ach("selesai");
    saveGame();
    later(openCert, 1200);
}
function openCert() {
    const d = new Date();
    const tarikh = d.toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });
    openModal({
        kicker: "Sijil penyertaan",
        title: "Perjalanan haji selesai",
        cls: "cert",
        html: `<div class="cert-in">
<div class="cert-k">Dengan ini diakui bahawa</div>
<div class="cert-n">${esc(S.name)}</div>
<p>telah menyempurnakan <b>Simulasi Haji Tamattu'</b> — 8 bab dan ${TASKS.length} tugasan, dari Miqat Bir Ali hingga Tawaf Wada'.</p>
<div class="cert-s"><div><b>${S.stars}</b><span>bintang</span></div><div><b>${S.ach.length}/${achTotal()}</b><span>pencapaian</span></div><div><b>${S.quiz}/${QUIZ_FINAL.length}</b><span>kuiz akhir</span></div></div>
<p class="cert-d">Semoga Allah menerima ibadah kita. Haji mabrur tiada balasan baginya melainkan syurga (HR al-Bukhari dan Muslim).</p>
<div class="cert-f">${esc(tarikh)} · ${esc(CONFIG.credit)}</div></div>`,
        buttons: [
            { label: "Main semula", kind: "ghost", onClick: resetGame },
            { label: "Terus meneroka", kind: "primary" },
        ],
    });
}
function resetGame() {
    hush();
    removeKey(CONFIG.saveKey);
    const name = S.name;
    const g = S.gender;
    S = newSave(name, g);
    T.tawaf.active = false;
    T.saie.doaCount = 0;
    for (const id of Object.keys(SCENES))
        delete SCENES[id];
    rnd = mulberry32(87);
    applyOutfit();
    loadScene("miqat");
    renderMission();
    saveGame();
    later(() => banner(CHAPTERS[0]), 400);
}
// =====================================================================
//  FIZIK & PERLANGGARAN
// =====================================================================
function collide(p, r, solids) {
    for (const s of solids) {
        switch (s.t) {
            case "c": {
                const dx = p.x - s.x;
                const dy = p.y - s.y;
                const m = s.r + r;
                if (Math.abs(dx) > m || Math.abs(dy) > m)
                    break;
                const d = Math.hypot(dx, dy);
                if (d < m && d > 0.0001) {
                    p.x = s.x + (dx / d) * m;
                    p.y = s.y + (dy / d) * m;
                }
                break;
            }
            case "r": {
                if (p.x < s.x - r || p.x > s.x + s.w + r || p.y < s.y - r || p.y > s.y + s.h + r)
                    break;
                const cx = clamp(p.x, s.x, s.x + s.w);
                const cy = clamp(p.y, s.y, s.y + s.h);
                const dx = p.x - cx;
                const dy = p.y - cy;
                const d = Math.hypot(dx, dy);
                if (d < 0.0001) {
                    const l = p.x - s.x;
                    const rt = s.x + s.w - p.x;
                    const tp = p.y - s.y;
                    const bt = s.y + s.h - p.y;
                    const m = Math.min(l, rt, tp, bt);
                    if (m === l)
                        p.x = s.x - r;
                    else if (m === rt)
                        p.x = s.x + s.w + r;
                    else if (m === tp)
                        p.y = s.y - r;
                    else
                        p.y = s.y + s.h + r;
                }
                else if (d < r) {
                    p.x = cx + (dx / d) * r;
                    p.y = cy + (dy / d) * r;
                }
                break;
            }
            case "s": {
                const vx = s.x2 - s.x1;
                const vy = s.y2 - s.y1;
                const L = vx * vx + vy * vy;
                const t = L > 0 ? clamp(((p.x - s.x1) * vx + (p.y - s.y1) * vy) / L, 0, 1) : 0;
                const cx = s.x1 + vx * t;
                const cy = s.y1 + vy * t;
                const dx = p.x - cx;
                const dy = p.y - cy;
                const m = s.r + r;
                const d = Math.hypot(dx, dy);
                if (d < m && d > 0.0001) {
                    p.x = cx + (dx / d) * m;
                    p.y = cy + (dy / d) * m;
                }
                break;
            }
            case "d": {
                const dx = p.x - s.x;
                const dy = p.y - s.y;
                const lim = s.s + r * 1.25;
                const Lm = Math.abs(dx) + Math.abs(dy);
                if (Lm < lim) {
                    const pen = (lim - Lm) / 2;
                    p.x += (dx >= 0 ? 1 : -1) * pen;
                    p.y += (dy >= 0 ? 1 : -1) * pen;
                }
                break;
            }
            case "e": {
                const dx = (p.x - s.x) / (s.rx + r);
                const dy = (p.y - s.y) / (s.ry + r);
                const d = Math.hypot(dx, dy);
                if (d < 1 && d > 0.0001) {
                    p.x = s.x + (dx / d) * (s.rx + r);
                    p.y = s.y + (dy / d) * (s.ry + r);
                }
                break;
            }
        }
    }
}
// =====================================================================
//  TENAGA & AIR (diilhamkan oleh pemantauan kecergasan simulator HajSim)
// =====================================================================
function heatFactor() {
    const l = currentLight();
    if (l === "night")
        return 0.7;
    if (l === "dusk")
        return 1;
    // Masjidil Haram berbumbung sebahagiannya dan lantai marmar mataf sejuk
    return scene.id === "makkah" ? 1.15 : 1.7;
}
function updateTenaga(dt) {
    T.minumCd -= dt;
    if (!SET.tenaga)
        return;
    const k = CONFIG.tenaga;
    const still = !P.moving && T.busy <= 0;
    if (P.moving)
        S.tenaga -= (T.running ? k.laju : k.jalan) * heatFactor() * dt;
    else if (still || T.wukuf.praying)
        S.tenaga += k.rehat * dt;
    S.tenaga = clamp(S.tenaga, 0, 100);
    // amaran sekali bagi setiap paras; diset semula selepas pulih
    if (S.tenaga > 50)
        T.enWarn = 0;
    if (S.tenaga < 35 && T.enWarn < 1) {
        T.enWarn = 1;
        toast(S.air > 0
            ? "Tenaga rendah. Tekan Minum (F) untuk meneguk air, dan berdiri diam untuk berehat."
            : "Tenaga rendah dan botol kosong. Isi semula di tong air Zamzam, atau berdiri diam untuk berehat.", "warn", 5200);
        say("Tenaga rendah. Minum air dan berehat.", "ms");
    }
    if (S.tenaga < 15 && T.enWarn < 2) {
        T.enWarn = 2;
        toast("Terlalu letih! Kamu tidak boleh berlari. Awas strok haba: berteduh, minum dan berehat dahulu.", "bad", 6000);
    }
}
function actMinum() {
    if (!started || !SET.tenaga || modalOpen || overlayBusy || T.minumCd > 0)
        return;
    if (S.air <= 0) {
        toast("Botol air kosong. Isi semula di tong air Zamzam atau semasa menaiki bas.", "info", 4200);
        return;
    }
    T.minumCd = 1.2;
    S.air--;
    S.tenaga = Math.min(100, S.tenaga + CONFIG.tenaga.teguk);
    SND.play("pick");
    floatText(P.x, P.y - 44, `+${CONFIG.tenaga.teguk} tenaga`);
    refreshHUD();
}
function updatePlayer(dt) {
    const raw = getInput();
    const inp = R3.active ? input3D(raw, dt) : raw;
    const mag = Math.min(1, Math.hypot(inp.x, inp.y));
    const blocked = T.busy > 0 || overlayBusy || modalOpen;
    if (T.wukuf.praying && mag > 0.3 && !blocked)
        stopWukuf("Wukuf dihentikan. Tekan BERDOA semula dan kekal diam.");
    const tired = SET.tenaga && S.tenaga < 15;
    const wantRun = (runToggle || shiftHeld) && !tired;
    const slow = !SET.tenaga ? 1 : tired ? 0.65 : S.tenaga < 35 ? 0.85 : 1;
    const spd = blocked || T.wukuf.praying ? 0 : (wantRun ? CONFIG.runSpeed : CONFIG.walkSpeed) * mag * slow;
    const ox = P.x;
    const oy = P.y;
    if (spd > 0) {
        P.x += (inp.x / mag) * spd * dt;
        P.y += (inp.y / mag) * spd * dt;
    }
    for (const n of scene.npcs) {
        const q = n.p;
        if (q.pose === "sleep")
            continue;
        const dx = P.x - q.x;
        const dy = P.y - q.y;
        if (dx > 16 || dx < -16 || dy > 16 || dy < -16)
            continue;
        const d = Math.hypot(dx, dy);
        if (d < 14 && d > 0.01) {
            const push = (14 - d) * 0.85;
            P.x += (dx / d) * push;
            P.y += (dy / d) * push;
            if (wantRun && spd > 0 && T.bumpCd <= 0) {
                T.bumpCd = 0.8;
                T.tawaf.bumps++;
                if (T.tawaf.bumps % 4 === 3)
                    toast("Jaga adab — jangan menolak atau berasak-asak dengan jemaah lain.", "warn", 3600);
            }
        }
    }
    collide(P, 8, scene.solids);
    collide(P, 8, scene.solids);
    const b = scene.bounds;
    P.x = clamp(P.x, b.x0 + 10, b.x1 - 10);
    P.y = clamp(P.y, b.y0 + 10, b.y1 - 10);
    const vx = P.x - ox;
    const vy = P.y - oy;
    const sp = Math.hypot(vx, vy);
    P.moving = spd > 0 && sp > 0.12;
    if (P.moving) {
        P.dx = vx / sp;
        P.dy = vy / sp;
        P.walk += sp * 0.3;
    }
    T.running = wantRun && P.moving;
    if (T.poseT > 0) {
        T.poseT -= dt;
        if (T.poseT <= 0 && P.pose !== "pray")
            P.pose = "stand";
        else if (T.poseT <= 0)
            P.pose = "stand";
    }
    else if (!T.wukuf.praying && T.busy <= 0)
        P.pose = "stand";
}
function updateNPCs(dt) {
    for (const n of scene.npcs) {
        const p = n.p;
        const ox = p.x;
        const oy = p.y;
        switch (n.mode) {
            case "tawaf": {
                const near = Math.abs(p.x - P.x) < 22 && Math.abs(p.y - P.y) < 22 ? 0.35 : 1;
                n.a += n.w * dt * near;
                const r = n.rad + Math.sin(n.a * 3 + n.ph) * 6;
                p.x = Math.cos(n.a) * r;
                p.y = -Math.sin(n.a) * r;
                break;
            }
            case "lane": {
                const near = Math.abs(p.x - P.x) < 18 && Math.abs(p.y - P.y) < 18 ? 0.3 : 1;
                const v = n.sp * dt * n.dir * near;
                if (n.axis === "y") {
                    p.y += v;
                    if (p.y > n.hi)
                        n.dir = -1;
                    if (p.y < n.lo)
                        n.dir = 1;
                }
                else {
                    p.x += v;
                    if (p.x > n.hi)
                        n.dir = -1;
                    if (p.x < n.lo)
                        n.dir = 1;
                }
                break;
            }
            case "wander": {
                if (n.wait > 0) {
                    n.wait -= dt;
                    break;
                }
                n.cd -= dt;
                const dx = n.tx - p.x;
                const dy = n.ty - p.y;
                const d = Math.hypot(dx, dy);
                if (d < 4 || n.cd <= 0) {
                    n.wait = rr(1, 5);
                    n.cd = 9;
                    const t = n.pickT ? n.pickT() : { x: p.x, y: p.y };
                    n.tx = t.x;
                    n.ty = t.y;
                }
                else {
                    const s = Math.min(d, n.sp * dt);
                    p.x += (dx / d) * s;
                    p.y += (dy / d) * s;
                    collide(p, 7, scene.solids);
                }
                break;
            }
            case "thrower": {
                n.cd -= dt;
                if (n.cd <= 0) {
                    n.cd = rr(1.6, 4.6);
                    p.pose = "throw";
                    n.wait = 0.3;
                    if (inView(p.x, p.y, 60))
                        spawnStone(p.x + 6, p.y - 30, n.jx + rr(-0.7, 0.7) * n.lo, n.jy + rr(-0.6, 0.6) * n.hi, null);
                }
                if (n.wait > 0) {
                    n.wait -= dt;
                    if (n.wait <= 0)
                        p.pose = "stand";
                }
                break;
            }
            case "static":
                break;
        }
        if (n.mode === "tawaf" || n.mode === "lane" || n.mode === "wander") {
            const vx = p.x - ox;
            const vy = p.y - oy;
            const sp = Math.hypot(vx, vy);
            p.moving = sp > 0.02;
            if (p.moving) {
                p.dx = vx / sp;
                p.dy = vy / sp;
                p.walk += sp * 0.35;
            }
        }
    }
}
const stones = [];
const parts = [];
const floaters = [];
function spawnStone(x0, y0, x1, y1, cb) {
    const d = Math.hypot(x1 - x0, y1 - y0);
    stones.push({ x0, y0, x1, y1, t: 0, dur: 0.45 + d / 900, h: 40 + d * 0.18, cb });
}
function dust(x, y, col) {
    for (let i = 0; i < 8; i++) {
        const a = rr(0, TAU);
        parts.push({ x, y, vx: Math.cos(a) * rr(20, 50), vy: Math.sin(a) * rr(8, 22) - 10, t: 0, life: rr(0.4, 0.7), col, s: rr(1.5, 3) });
    }
}
function sparkle(x, y) {
    for (let i = 0; i < 18; i++) {
        const a = rr(0, TAU);
        parts.push({ x, y, vx: Math.cos(a) * rr(30, 80), vy: Math.sin(a) * rr(30, 80) - 30, t: 0, life: rr(0.6, 1.1), col: i % 2 ? "#f3d488" : "#ffffff", s: rr(1.5, 3.2) });
    }
}
function floatText(x, y, text) {
    floaters.push({ x, y, t: 0, text });
}
function updateFx(dt) {
    for (let i = stones.length - 1; i >= 0; i--) {
        const s = stones[i];
        s.t += dt / s.dur;
        if (s.t >= 1) {
            stones.splice(i, 1);
            s.cb?.();
        }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.t += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 60 * dt;
        if (p.t > p.life)
            parts.splice(i, 1);
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
        floaters[i].t += dt;
        if (floaters[i].t > 1.3)
            floaters.splice(i, 1);
    }
}
function updatePebbles() {
    if (!scene.pebbles.length)
        return;
    for (const pb of scene.pebbles) {
        if (!pb.alive)
            continue;
        if (Math.abs(pb.x - P.x) < 15 && Math.abs(pb.y - P.y) < 11) {
            pb.alive = false;
            S.pebbles++;
            SND.play("pick");
            floatText(P.x, P.y - 44, "+1 batu");
            if (!T.pickTip) {
                T.pickTip = true;
                toast("Batu dikutip! Saiznya kira-kira sebesar hujung jari. Kutip dengan berjalan di atasnya.", "info", 4200);
            }
            if (scene.id === "muzdalifah" && S.pebbles >= 28)
                ach("batu");
        }
    }
}
// =====================================================================
//  INTERAKSI
// =====================================================================
let bestInteract = null;
function findInteract() {
    let best = null;
    let bd = 1e9;
    for (const it of scene.interacts) {
        const d = it.test ? 0 : Math.hypot(P.x - it.x, P.y - it.y);
        const ok = it.test ? it.test(P) : d < it.r;
        if (!ok)
            continue;
        const en = it.enabled();
        const lk = !en && it.locked ? it.locked() : null;
        if (!en && !lk)
            continue;
        const score = d + (en ? 0 : 5000) + (it.id === "doa" ? 100 : 0);
        if (score < bd) {
            bd = score;
            best = it;
        }
    }
    return best;
}
function doInteract() {
    if (!started || modalOpen || overlayBusy || T.busy > 0)
        return;
    const it = bestInteract;
    if (!it) {
        toast("Tiada apa-apa untuk dilakukan di sini. Ikut anak panah kuning ke sasaran seterusnya.", "info", 3200);
        return;
    }
    if (it.enabled()) {
        SND.play("tap");
        it.action();
    }
    else {
        const m = it.locked ? it.locked() : null;
        if (m)
            toast(m, "info", 4200);
    }
}
// =====================================================================
//  KAMERA & LUKISAN
// =====================================================================
const canvas = el("world");
const ctx = canvas.getContext("2d");
const lightCv = document.createElement("canvas");
const lctx = lightCv.getContext("2d");
const miniCv = el("mini");
const mctx = miniCv.getContext("2d");
let W = 800;
let H = 600;
let DPR = 1;
let BASE_ZOOM = 1;
const cam = { x: 0, y: 0, zoom: 1 };
const FONT_D = '"Baloo Bhaijaan 2", "Trebuchet MS", sans-serif';
const FONT_B = 'Nunito, "Segoe UI", sans-serif';
function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(320, Math.round(r.width));
    H = Math.max(320, Math.round(r.height));
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    lightCv.width = Math.round(W / 2);
    lightCv.height = Math.round(H / 2);
    BASE_ZOOM = clamp(Math.min(W, H * 1.15) / 720, 0.6, 1.25);
    resize3D();
}
function toScreen(x, y) {
    return { x: (x - cam.x) * cam.zoom + W / 2, y: (y - cam.y) * cam.zoom + H / 2 };
}
function currentLight() {
    const st = curStep();
    if (scene.id === "muzdalifah")
        return "night";
    if (st && st.scene === scene.id && st.light)
        return st.light;
    return "day";
}
function render() {
    const z = cam.zoom;
    VIEW.x0 = cam.x - W / 2 / z;
    VIEW.x1 = cam.x + W / 2 / z;
    VIEW.y0 = cam.y - H / 2 / z;
    VIEW.y1 = cam.y + H / 2 / z;
    if (R3.active) {
        render3D();
        drawOverlay3D();
        return;
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = scene.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (W / 2 - cam.x * z), DPR * (H / 2 - cam.y * z));
    scene.ground(ctx);
    // batu di tanah
    for (const pb of scene.pebbles) {
        if (!pb.alive || !inView(pb.x, pb.y, 10))
            continue;
        ctx.fillStyle = "#8d877a";
        ell(ctx, pb.x, pb.y, pb.s + 0.6, pb.s * 0.75);
        ctx.fill();
        ctx.fillStyle = "#d5cfc1";
        ell(ctx, pb.x - 0.5, pb.y - 0.6, pb.s * 0.5, pb.s * 0.35);
        ctx.fill();
    }
    // sasaran & sorotan interaksi
    const target = started ? stepTarget() : null;
    if (target && SET.arrow)
        drawTargetRing(target);
    if (started && bestInteract && bestInteract.ring && bestInteract.enabled()) {
        const pulse = 0.5 + 0.5 * Math.sin(T.time * 5);
        ctx.strokeStyle = `rgba(255,255,255,${0.5 + pulse * 0.4})`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 5]);
        ell(ctx, bestInteract.x, bestInteract.y, 26 + pulse * 3, 11 + pulse);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    // susun ikut y
    const list = [];
    for (const pr of scene.props)
        list.push(pr);
    for (const n of scene.npcs)
        if (inView(n.p.x, n.p.y))
            list.push({ y: n.p.y, draw: (c) => drawPerson(c, n.p) });
    if (started)
        list.push({
            y: P.y,
            draw: (c) => {
                c.strokeStyle = "rgba(217,168,60,.95)";
                c.lineWidth = 2;
                ell(c, P.x, P.y, 12, 5);
                c.stroke();
                drawPerson(c, P);
            },
        });
    list.sort((a, b) => a.y - b.y);
    for (const d of list)
        d.draw(ctx);
    if (started) {
        ctx.globalAlpha = 0.28;
        drawPerson(ctx, P);
        ctx.globalAlpha = 1;
    }
    // batu terbang
    for (const s of stones) {
        const x = lerp(s.x0, s.x1, s.t);
        const y = lerp(s.y0, s.y1, s.t) - Math.sin(Math.PI * s.t) * s.h;
        ctx.fillStyle = "rgba(0,0,0,.18)";
        ell(ctx, x, lerp(s.y0 + 30, s.y1, s.t), 2, 1);
        ctx.fill();
        ctx.fillStyle = "#6f6a60";
        circ(ctx, x, y, 2.2);
        ctx.fill();
    }
    for (const p of parts) {
        ctx.globalAlpha = 1 - p.t / p.life;
        ctx.fillStyle = p.col;
        circ(ctx, p.x, p.y, p.s);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawLighting(currentLight());
    // lapisan skrin
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawLabels();
    for (const f of floaters) {
        const s = toScreen(f.x, f.y);
        ctx.globalAlpha = clamp(1.3 - f.t, 0, 1);
        ctx.font = `800 14px ${FONT_D}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(15,60,46,.85)";
        ctx.strokeText(f.text, s.x, s.y - f.t * 26);
        ctx.fillStyle = "#ffe08a";
        ctx.fillText(f.text, s.x, s.y - f.t * 26);
    }
    ctx.globalAlpha = 1;
    if (started) {
        drawNameTag();
        if (target && SET.arrow)
            drawArrow(target);
    }
}
function stepTarget() {
    const st = curStep();
    if (!st || st.scene !== scene.id)
        return null;
    if (st.travel)
        return scene.busPos;
    return st.target ? st.target() : null;
}
function drawTargetRing(t) {
    const pulse = 0.5 + 0.5 * Math.sin(T.time * 3.2);
    ctx.strokeStyle = `rgba(217,168,60,${0.55 + pulse * 0.4})`;
    ctx.lineWidth = 3;
    ell(ctx, t.x, t.y, 22 + pulse * 6, 9 + pulse * 2.5);
    ctx.stroke();
    const by = t.y - 64 - pulse * 6;
    ctx.fillStyle = "#d9a83c";
    circ(ctx, t.x, by, 10);
    ctx.fill();
    ctx.strokeStyle = "#fff6d6";
    ctx.lineWidth = 2;
    ctx.stroke();
    poly(ctx, [t.x - 5, by + 7, t.x + 5, by + 7, t.x, by + 15]);
    ctx.fillStyle = "#d9a83c";
    ctx.fill();
    ctx.fillStyle = "#3c2604";
    ctx.font = `800 13px ${FONT_D}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", t.x, by + 1);
}
function drawArrow(t) {
    const dx = t.x - P.x;
    const dy = t.y - P.y;
    const d = Math.hypot(dx, dy);
    if (d < 70)
        return;
    const a = Math.atan2(dy, dx);
    const s = toScreen(P.x, P.y - 20);
    const R = 54;
    const ax = s.x + Math.cos(a) * R;
    const ay = s.y + Math.sin(a) * R;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(a);
    ctx.fillStyle = "#f2c230";
    ctx.strokeStyle = "rgba(60,38,4,.85)";
    ctx.lineWidth = 2;
    poly(ctx, [13, 0, -8, -9, -4, 0, -8, 9]);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    const m = Math.round(d * scene.mPerPx);
    const txt = m >= 1000 ? (m / 1000).toFixed(1) + " km" : m + " m";
    ctx.font = `800 11px ${FONT_B}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lx = s.x + Math.cos(a) * (R + 20);
    const ly = s.y + Math.sin(a) * (R + 20);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(15,60,46,.85)";
    ctx.strokeText(txt, lx, ly);
    ctx.fillStyle = "#fff";
    ctx.fillText(txt, lx, ly);
}
function drawNameTag() {
    const s = toScreen(P.x, P.y - 46);
    ctx.font = `800 11.5px ${FONT_D}`;
    const w = ctx.measureText(S.name).width + 16;
    ctx.fillStyle = "#d9a83c";
    rrect(ctx, s.x - w / 2, s.y - 10, w, 19, 9.5);
    ctx.fill();
    ctx.strokeStyle = "#fff3c4";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#3c2604";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(S.name, s.x, s.y + 0.5);
}
function drawLabels() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const L of scene.labels) {
        if (!inView(L.x, L.y, 40))
            continue;
        if (L.kind === "small" && cam.zoom < 0.62)
            continue;
        const s = toScreen(L.x, L.y);
        const place = L.kind === "place";
        ctx.font = place ? `800 11px ${FONT_D}` : `700 10.5px ${FONT_B}`;
        const w = ctx.measureText(L.text).width + 16;
        const h = place ? 20 : 18;
        let bg = "rgba(255,255,255,.9)";
        let fg = "#1c2622";
        let bd = "rgba(0,0,0,.12)";
        if (place) {
            bg = "rgba(15,70,54,.92)";
            fg = "#ffffff";
            bd = "rgba(243,212,136,.7)";
        }
        else if (L.kind === "green") {
            bg = "#1f7a3f";
            fg = "#ffffff";
            bd = "rgba(255,255,255,.5)";
        }
        else if (L.kind === "warn") {
            bg = "#b5651d";
            fg = "#ffffff";
            bd = "rgba(255,255,255,.5)";
        }
        ctx.fillStyle = bg;
        rrect(ctx, s.x - w / 2, s.y - h / 2, w, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = bd;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = fg;
        ctx.fillText(L.text, s.x, s.y + 0.5);
    }
}
function drawLighting(light) {
    if (light === "day")
        return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (light === "dusk") {
        ctx.fillStyle = "rgba(255,124,48,.16)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(70,30,80,.13)";
        ctx.fillRect(0, 0, W, H);
        return;
    }
    const lw = lightCv.width;
    const lh = lightCv.height;
    const k = lw / W;
    lctx.globalCompositeOperation = "source-over";
    lctx.clearRect(0, 0, lw, lh);
    lctx.fillStyle = "rgba(8,14,36,.66)";
    lctx.fillRect(0, 0, lw, lh);
    lctx.globalCompositeOperation = "destination-out";
    const hole = (x, y, R, a) => {
        const s = toScreen(x, y);
        const sx = s.x * k;
        const sy = s.y * k;
        const r = R * cam.zoom * k;
        if (sx < -r || sy < -r || sx > lw + r || sy > lh + r)
            return;
        const g = lctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        g.addColorStop(0, `rgba(0,0,0,${a})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        lctx.fillStyle = g;
        lctx.fillRect(sx - r, sy - r, r * 2, r * 2);
    };
    for (const l of scene.lights)
        hole(l.x, l.y + 50, 170, 0.85);
    hole(P.x, P.y - 10, 110, 0.75);
    lctx.globalCompositeOperation = "source-over";
    ctx.drawImage(lightCv, 0, 0, W, H);
}
function drawMini() {
    const r = miniCv.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (w < 8 || h < 8)
        return;
    const pw = Math.round(w * DPR);
    const ph = Math.round(h * DPR);
    if (miniCv.width !== pw || miniCv.height !== ph) {
        miniCv.width = pw;
        miniCv.height = ph;
    }
    const b = scene.bounds;
    const s = Math.min(w / (b.x1 - b.x0), h / (b.y1 - b.y0));
    const ox = (w - (b.x1 - b.x0) * s) / 2;
    const oy = (h - (b.y1 - b.y0) * s) / 2;
    mctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    mctx.fillStyle = "#cdbb94";
    mctx.fillRect(0, 0, w, h);
    mctx.setTransform(DPR * s, 0, 0, DPR * s, DPR * (ox - b.x0 * s), DPR * (oy - b.y0 * s));
    scene.mini(mctx);
    mctx.fillStyle = "rgba(40,40,50,.45)";
    for (let i = 0; i < scene.npcs.length; i += 3) {
        const p = scene.npcs[i].p;
        mctx.fillRect(p.x - 4, p.y - 4, 8, 8);
    }
    const t = stepTarget();
    if (t) {
        mctx.strokeStyle = "#d9a83c";
        mctx.lineWidth = 3 / s;
        circ(mctx, t.x, t.y, 6 / s);
        mctx.stroke();
    }
    mctx.fillStyle = "#2f7de0";
    mctx.strokeStyle = "#ffffff";
    mctx.lineWidth = 1.6 / s;
    circ(mctx, P.x, P.y, 4.2 / s);
    mctx.fill();
    mctx.stroke();
    if (R3.active) {
        // arah pandangan kamera 3D
        const fx = -Math.sin(C3.yaw);
        const fy = -Math.cos(C3.yaw);
        const L = 90;
        mctx.fillStyle = "rgba(255,255,255,.35)";
        poly(mctx, [P.x, P.y, P.x + (fx * 0.9 - fy * 0.45) * L, P.y + (fy * 0.9 + fx * 0.45) * L, P.x + (fx * 0.9 + fy * 0.45) * L, P.y + (fy * 0.9 - fx * 0.45) * L]);
        mctx.fill();
    }
    else {
        // bingkai pandangan kamera
        mctx.strokeStyle = "rgba(255,255,255,.7)";
        mctx.lineWidth = 1 / s;
        mctx.strokeRect(VIEW.x0, VIEW.y0, VIEW.x1 - VIEW.x0, VIEW.y1 - VIEW.y0);
    }
}
function drawAvatar() {
    const cv = el("avatar");
    const c = cv.getContext("2d");
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, cv.width, cv.height);
    const q = { ...P, x: 0, y: 0, dx: 0, dy: 1, moving: false, pose: "stand", scale: 1 };
    c.setTransform(3.1, 0, 0, 3.1, cv.width / 2, cv.height * 0.98 + 18);
    drawPerson(c, q);
}
function drawGenderPreview(id, g) {
    const cv = el(id);
    const c = cv.getContext("2d");
    c.clearRect(0, 0, cv.width, cv.height);
    const q = mkPerson(g, true);
    q.skin = P.skin;
    q.hair = P.hair;
    q.dy = 1;
    q.dx = 0;
    c.setTransform(2.6, 0, 0, 2.6, cv.width / 2, cv.height - 6);
    drawPerson(c, q);
}
// =====================================================================
//  GELUNG UTAMA
// =====================================================================
let lastT = performance.now();
function loop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    T.time += dt;
    update(dt);
    render();
    requestAnimationFrame(loop);
}
function update(dt) {
    updateNPCs(dt);
    updateFx(dt);
    if (!started) {
        cam.zoom = BASE_ZOOM * 1.05;
        cam.x = Math.sin(T.time * 0.12) * 40 + 40;
        cam.y = 20 + Math.cos(T.time * 0.1) * 30;
        return;
    }
    T.bumpCd -= dt;
    T.throwCd -= dt;
    T.zamCd -= dt;
    if (T.busy > 0) {
        T.busy -= dt;
        if (T.busy <= 0) {
            P.pose = "stand";
            const f = T.busyCb;
            T.busyCb = null;
            f?.();
        }
    }
    updatePlayer(dt);
    updateTenaga(dt);
    updateTawaf(dt);
    updateSaie(dt);
    updateWukuf(dt);
    updatePebbles();
    const st = curStep();
    if (st && st.done && !modalOpen && !overlayBusy && st.done())
        advance();
    bestInteract = modalOpen || overlayBusy ? null : findInteract();
    if (bestInteract) {
        const en = bestInteract.enabled();
        setAct(en ? "on" : "lock", bestInteract.label(), bestInteract.icon);
    }
    else
        setAct("none", "INTERAKSI", "hand");
    const z = BASE_ZOOM * SET.zoom;
    cam.zoom = lerp(cam.zoom, z, Math.min(1, dt * 8));
    cam.x = lerp(cam.x, P.x, Math.min(1, dt * 6));
    // geser kamera sedikit ke utara kerana HUD atas lebih tebal daripada kawalan bawah
    cam.y = lerp(cam.y, P.y - (H * 0.08) / cam.zoom, Math.min(1, dt * 6));
    update3D(dt);
    T.hudT -= dt;
    if (T.hudT <= 0) {
        T.hudT = 0.12;
        refreshHUD();
    }
    T.miniT -= dt;
    if (T.miniT <= 0 && SET.mini) {
        T.miniT = 0.12;
        drawMini();
    }
    T.saveT -= dt;
    if (T.saveT <= 0) {
        T.saveT = 6;
        saveGame();
    }
}
// =====================================================================
//  MULA
// =====================================================================
let pickedGender = "L";
function setupStart(saved) {
    el("stTitle").textContent = CONFIG.title;
    el("stKick").textContent = CONFIG.subtitle;
    el("stCredit").textContent = CONFIG.credit;
    el("stStats").textContent = `${CHAPTERS.length} bab · ${TASKS.length} tugasan · 5 lokasi`;
    const name = el("inName");
    const gL = el("gL");
    const gP = el("gP");
    const pickG = (g) => {
        pickedGender = g;
        gL.setAttribute("aria-checked", String(g === "L"));
        gP.setAttribute("aria-checked", String(g === "P"));
        if (!name.dataset.touched)
            name.value = g === "L" ? "Ahmad" : "Aisyah";
    };
    name.addEventListener("input", () => (name.dataset.touched = "1"));
    gL.addEventListener("click", () => pickG("L"));
    gP.addEventListener("click", () => pickG("P"));
    drawGenderPreview("gLc", "L");
    drawGenderPreview("gPc", "P");
    pickG("L");
    const go = el("stGo");
    const cont = el("stCont");
    if (saved) {
        cont.hidden = false;
        const f = ALL_STEPS[Math.min(saved.step, ALL_STEPS.length - 1)];
        cont.textContent = `Sambung: ${saved.name} · Tugasan ${Math.min(f.ti + 1, TASKS.length)}/${TASKS.length}`;
        cont.onclick = () => startGame(saved);
        go.textContent = "Mula baharu";
        go.className = "btn ghost";
        cont.className = "btn primary";
    }
    go.onclick = () => {
        const n = name.value.trim().slice(0, 16) || (pickedGender === "L" ? "Ahmad" : "Aisyah");
        startGame(newSave(n, pickedGender));
    };
    el("stForm").addEventListener("submit", (e) => {
        e.preventDefault();
        go.click();
    });
}
function startGame(save) {
    SND.init();
    S = save;
    // simpanan lama (sebelum ciri tenaga) tiada medan ini
    if (typeof S.tenaga !== "number")
        S.tenaga = 100;
    if (typeof S.air !== "number")
        S.air = CONFIG.tenaga.botol;
    started = true;
    applyOutfit();
    const st = curStep();
    loadScene(st ? st.scene : S.scene);
    el("start").hidden = true;
    el("hud").classList.remove("pre");
    document.activeElement?.blur();
    renderMission();
    refreshHUD();
    if (window.innerWidth > 760 && window.innerHeight > 560)
        toggleMission(true);
    if (S.step === 0) {
        later(() => banner(CHAPTERS[0]), 500);
        later(() => toast("Ikut anak panah kuning ke sasaran. Butang INTERAKSI akan menyala apabila ada tindakan.", "info", 6500), 1600);
        say(`Assalamualaikum ${S.name}. Bab satu, ihram di miqat. ${curStep()?.text ?? ""}`, "ms", true);
    }
    else {
        toast(`Selamat kembali, ${S.name}. ${curStep()?.text ?? ""}`, "info", 5000);
        say(`Selamat kembali, ${S.name}. ${curStep()?.text ?? ""}`, "ms", true);
    }
    saveGame();
    if (SET.view3d)
        void set3D(true, true);
    else if (S.step < 3)
        later(() => toast("Cuba butang 3D di atas untuk paparan 3D. Pilih kamera Mata untuk berjalan seperti jemaah sebenar.", "info", 6500), 9000);
}
function boot(hot) {
    loadSettings();
    document.title = CONFIG.title;
    document.querySelectorAll("[data-ic]").forEach((n) => (n.innerHTML = ic(n.dataset.ic) + n.innerHTML));
    paintAudio();
    paintViewControls();
    applyMiniSetting();
    applyTenagaSetting();
    initInput();
    if (SET.gyro)
        void setGyro(true, true);
    resize();
    window.addEventListener("resize", resize);
    scene = getScene("makkah");
    const saved = loadJSON(CONFIG.saveKey);
    setupStart(validSave(saved) ? saved : null);
    renderMission();
    if (hot && validSave(hot))
        startGame(hot);
    requestAnimationFrame((t) => {
        lastT = t;
        loop(t);
    });
}
const HOT = window.claude?.hot;
HOT?.snapshot?.(() => (started ? S : null));
if (HOT?.ready)
    HOT.ready((d) => boot(d ?? null));
else
    boot(HOT?.data ?? null);
// Cangkuk ujian (untuk pembangun)
window.__jh = {
    get S() {
        return S;
    },
    P,
    T,
    get scene() {
        return scene.id;
    },
    get sc() {
        return scene;
    },
    step: () => curStep()?.id,
    tp: (x, y) => {
        P.x = x;
        P.y = y;
        cam.x = x;
        cam.y = y;
    },
    finish: () => advance(),
    models: MODELS3D,
    C3,
    R3,
    set3D: (on) => set3D(on, true),
    cycleCam: () => cycleCam(),
    load: (id) => loadScene(id),
    act: () => doInteract(),
    joy: (x, y) => {
        JOY.active = x !== 0 || y !== 0;
        JOY.x = x;
        JOY.y = y;
    },
};

})();
