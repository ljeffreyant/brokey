import type { RoastBanks } from './roasts';

// Bank roast Bahasa Indonesia. Mild = teman yang usil tapi sayang, Medium = grup chat, Unhinged = grup chat jam 3 pagi.
// Tanpa nama merek, tanpa ejekan soal tubuh (BODY kosong). Placeholder: {amt} {units} {n} {work} {unit}

export const ID: RoastBanks = {
  BASE: {
    coffee: {
      mild: ['Kopi. Wajar, anak kuliahan butuh bahan bakar.', 'Segelas kopi, sekitar {units}. Pelan-pelan ya.', 'Kopi tercatat. Baristanya sudah hafal namamu, itu pertanda baik atau buruk?'],
      medium: ['Kopi lagi. Yang bikin kecanduan bukan kafeinnya, tapi gelasnya.', '{amt} buat air biji kopi panas. Berani.', 'Di rumah ada teko, lho. Cuma ngingetin.'],
      unhinged: ['{amt} buat segelas kopi. Kamu biayain teras orang, padahal kamu sendiri masih ngekos.', 'Air biji panas {amt}. Kopi sachet di kampus gratis, dasar boros.', 'Kopi lagi. Kepribadianmu 40% susu oat, 60% utang.'],
    },
    matcha: {
      mild: ['Matcha! Hijau banget, mahal juga {amt}.', 'Matcha tercatat. Semoga enak.', 'Sedikit matcha buat nyenengin diri. Kata kuncinya: sedikit.'],
      medium: ['Matcha. Niat banget buat difoto.', '{amt} buat megang minuman hijau di depan kamera. Ikonik, mahal.', 'Kamu bukan suka matcha, kamu suka ide dirimu minum matcha.'],
      unhinged: ['Matcha, {amt}. Rasanya kayak rumput dan kamu tahu itu.', 'Kamu bayar {amt} buat air rumput biar orang kira kamu tenang. Kamu nggak tenang, kamu bokek.', 'Era matcha girl habisin {units} kamu. Rumputnya sepadan?'],
    },
    bubbletea: {
      mild: ['Boba! Manis, dan lumayan mahal.', 'Boba tercatat. Mutiaranya mungkin sepadan.', 'Momen boba. Diterima.'],
      medium: ['{amt} buat gula dan tapioka. Berani.', 'Boba lagi. Nguyah tabunganmu satu mutiara demi satu mutiara.', 'Less ice, 50% gula, 100% uang kosmu.'],
      unhinged: ['Kamu ngunyah tabungan sendiri lewat sedotan gede. {amt}.', 'Boba itu cuma jeli mahal pakai sedotan dan kamu punya masalah.', 'Bola tapioka {amt}. Nggak seenak itu, kamu cuma nggak bisa nahan diri.'],
    },
    snacks: {
      mild: ['Camilan. Kecil, tapi menumpuk.', 'Camilan tercatat. Lapar itu nyata.', 'Camilan kecil, struk kecil. Awasi terus.'],
      medium: ['Nggak pernah cuma camilan. Minggu ini sudah {n} kali.', 'Camilan itu pembunuh anggaran yang diam-diam. Ingat itu.', '{amt} di rak minimarket. Nggak ada yang sepadan.'],
      unhinged: ['{amt} buat sebungkus angin isi enam keripik.', 'Kamu lagi dicopet sama bungkus keripik.', 'Camilan. Iya, dompetmu berdarah karena seribu sayatan kecil, bagus.'],
    },
    fastfood: {
      mild: ['Jajan cepat saji tercatat. Pasti enak.', 'Cepat saji. Terjadi pada yang terbaik sekalipun.', 'Mampir drive-thru sebentar. Lain kali air putih mungkin?'],
      medium: ['Cepat saji lagi? Di rumah ada makanan, lho.', '{amt} buat makan yang bakal kamu lupa hari Kamis.', 'Drive-thru berterima kasih atas donasimu.'],
      unhinged: ['{amt} buat cepat saji. Tahu kan harga ayam utuh di pasar?', 'Cepat saji, soalnya masak katanya terlalu susah. Indah.', 'Aplikasi cepat saji megang lebih banyak uangmu daripada rekening tabunganmu.'],
    },
    delivery: {
      mild: ['Pesan antar tercatat. Ongkirnya yang jadi makanan utama.', 'Pesan antar! Praktis, tapi mahal.', 'Ada yang nganterin makanan. Enak. Lain kali cek biayanya.'],
      medium: ['{amt} buat makanan yang datang dingin plus biaya layanan. Berani.', 'Ongkir, biaya layanan, biaya pesanan kecil. Kamu bayar buat nggak ngapa-ngapain.', 'Pintu depanmu sekarang kayak mesin penjual otomatis.'],
      unhinged: ['Kamu bayar orang asing {amt} buat nyetir empat kilo karena nggak mau jalan ke kulkas.', 'Ongkir, biaya layanan, biaya pesanan kecil, tip. Pajak males, sudah ditagih.', 'Pesan antar padahal tempatnya dua menit jalan kaki. Males kelas atas.'],
    },
    dineout: {
      mild: ['Makan di luar tercatat. Semoga seru.', 'Makan di restoran! Nikmati, ingat anggaran.', 'Malam makan di luar! Nikmati, besok mi instan.'],
      medium: ['{amt} buat makan di luar. Ayam utuh di pasar jauh lebih murah, cuma bilang.', 'Makan di luar lagi. Dapurmu merasa dicuekin.', 'Dapurmu diam-diam menangis.'],
      unhinged: ['{units} buat sepiring yang nggak bisa difoto tanpa lampu bagus. Lain kali rebus pasta.', 'Patungan tetap rugi. Itu bakat.', 'Makan mewah pakai uang mahasiswa. Dirimu di masa depan sudah nangis di depan mi instan.'],
    },
    groceries: {
      mild: ['Belanja bahan! Masak sendiri memang jalan yang benar.', 'Wah, udah dewasa. Belanjanya bagus.', 'Belanja tercatat. Ini pengeluaran yang baik.'],
      medium: ['Belanja bahan. Mantap. Masak lebih murah dari pesan antar, siapa sangka.', 'Belanja beneran. Diam-diam bangga sama kamu.', 'Kulkas: penuh. Dompet: agak tipis. Tetap menang.'],
      unhinged: ['Belanja bahan. Akhirnya pengeluaran yang nggak bikin aku pengin nangis. Lanjut.', 'Belanja orang dewasa beneran. Aku terharu.', 'Kamu beli makanan beneran. Bintang emas buatmu.'],
    },
    drinks: {
      mild: ['Minum-minum tercatat. Semoga malamnya seru.', 'Beberapa gelas. Tagihannya jangan kelewatan.', 'Malam minum! Ingat selingi dengan air putih.'],
      medium: ['{amt} buat minum. Untungnya mabuknya gratis.', 'Kamu traktir satu putaran? Dengan penghasilanmu?', 'Pre-drink di rumah lebih murah, kamu tahu itu.'],
      unhinged: ['{amt} buat sedih-sedihan di bar. Di rumah juga bisa gratis.', 'Kamu traktir satu putaran. SATU PUTARAN. Serius dong.', 'Dua teko dan kamu bilang cuma hari Selasa biasa. Rekeningmu akan ingat.'],
    },
    nightout: {
      mild: ['Malam keluar tercatat. Semoga seru.', 'Malam besar! Kenangannya tak ternilai, struknya tidak.', 'Keluar malam. Kamu pantas, mungkin.'],
      medium: ['Tiket masuk, minum, ongkos pulang, kebab. Klasik {amt}.', 'Keluar malam itu cara mahal buat kehilangan hape.', 'Kebab jam dua pagi itu mungkin {units} penyesalan.'],
      unhinged: ['{amt} buat joget jelek di tempat gelap dan kehilangan jaket. Sepadan? Nggak yakin.', 'Kamu habisin {units} supaya bisa nangis di jok belakang jam 3 pagi. Bertumbuh.', 'Hati dan dompetmu lagi di situasi penyanderaan.'],
    },
    rideshare: {
      mild: ['Perjalanan tercatat. Praktis, tapi mahal.', 'Naik ojek online. Kadang memang harus.', 'Ongkos jalan menumpuk, awasi terus.'],
      medium: ['{amt} buat perjalanan yang bisa naik angkutan umum.', 'Tarif naik: karena kamu nggak bisa nunggu enam menit.', 'Ada angkutan umum. Lewat situ. Murah.'],
      unhinged: ['{amt} buat naik ojek. Angkutan umumnya persis di depan.', 'Kamu bayar tarif naik biar nggak telat empat menit. Tetap telat.', 'Naik ojek? Kamu punya kaki. Pakai.'],
    },
    clothes: {
      mild: ['Baju baru! Semoga anggaranmu juga muat.', 'Baju tercatat. Semoga dapat yang bagus.', 'Belanja dikit. Jangan jadi kebiasaan.'],
      medium: ['{amt} buat baju. Kamu punya lemari, kan?', 'Keranjang nganggur seminggu lalu kamu nyerah. Klasik.', 'Kamu nggak butuh hoodie hitam lagi. Sudah punya empat.'],
      unhinged: ['{amt} buat atasan yang dipakai sekali lalu jadi piama.', 'Outfit baru! Dibayar pakai uang makan minggu depan.', 'Kamu beli baju yang dipakai dua kali. Namanya fast fashion, dan itu bikin kamu bokek.'],
    },
    tech: {
      mild: ['Beli gadget tercatat. Semoga berguna.', 'Gadget! Pastikan beneran perlu.', 'Beli teknologi. Jangan lupa garansinya.'],
      medium: ['{amt} buat gadget yang dipakai dua minggu. Pedas.', 'Earphone kabel? Niat banget.', 'Gadget lagi buat laci gadget yang sudah mati.'],
      unhinged: ['{units} buat gadget yang bakal teronggok di laci sebelum Oktober. Cantik.', 'Kamu beli earphone kabel di 2026. Itu kepribadian, dan mahal.', 'Fiturnya banyak yang nggak bakal kamu pakai. Persis kayak keanggotaan gym-mu.'],
    },
    beauty: {
      mild: ['Beli kecantikan tercatat. Merawat diri itu penting.', 'Skincare! Semoga cocok.', 'Kamu kinclong, dompetmu kelihatan capek.'],
      medium: ['{amt} buat skincare. Jujur, mukamu sudah oke.', 'Serum lagi. Rutinitas dua belas langkah itu mahal.', 'Kasir toko kosmetik hafal namamu. Itu bukan pamer.'],
      unhinged: ['{amt} buat serum yang pakai tutup. Kamu dikibulin sebuah botol.', 'Kamu beli karena orang asing di internet bilang bagus. Dia dibayar.', 'Mukamu lebih mahal dari uang kos, dan kelihatannya sama saja.'],
    },
    random: {
      mild: ['Beli acak tercatat. Kadang terjadi.', 'Sedikit impulsif. Kita semua pernah.', 'Pembelian acak, dicatat.'],
      medium: ['Itu tadi apa sih? Jujur, kamu sendiri nggak tahu.', '{amt} buat sesuatu yang nggak bakal kamu ingat.', 'Aura "nanti pasti dipakai" kuat banget di sini.'],
      unhinged: ['{amt} buat barang receh. Begini caranya jadi bokek.', 'Pembelian impulsif terdeteksi. Bro, kamu ngapain.', 'Kamu beli karena barangnya ada. Itu bukan alasan, itu gejala.'],
    },
    subscription: {
      mild: ['Langganan tercatat. Cek mana yang benar-benar dipakai.', 'Satu langganan. Pastikan layak dipertahankan.', 'Langganan dicatat. Batalkan yang terlupa.'],
      medium: ['Langganan lagi. Sudah dibuka bulan ini?', 'Kamu bayar enam hal dan cuma pakai dua.', 'Langganan itu pembunuh diam-diam. Waktunya audit.'],
      unhinged: ['Kamu bayar bulanan buat hal yang kamu lupa punya. Selamat, kamu tuan tanah aplikasi.', '{amt} sebulan buat nonton satu acara sekali. Komitmen buang-buang yang mengesankan.', 'Batalkan satu hari ini. Serius. Cuma 40 detik.'],
    },
    uni: {
      mild: ['Biaya kuliah tercatat. Pendidikan memang mahal.', 'Urusan kampus. Semoga berguna.', 'Uang buku. Lain kali cek yang bekas.'],
      medium: ['{amt} buat buku yang cuma dibuka dua kali. Selamat datang di kampus.', 'Biaya kuliah, hadeh. Setidaknya pengeluaran sungguhan.', 'Sudah cek perpustakaan? Mungkin gratis di sana.'],
      unhinged: ['{amt} buat buku yang PDF-nya ada gratis di internet. Cari akal, kamu mahasiswa.', 'Kuliah itu penipuan dan kamu bayar pakai uang makan.', 'Dosennya nulis buku itu dan sekarang lebih kaya. Kamu lebih miskin. Begitulah sistemnya.'],
    },
    health: {
      mild: ['Pengeluaran kesehatan tercatat. Investasi bagus.', 'Merawat diri. Bagus.', 'Biaya kesehatan itu wajar. Bagus sudah menjaga diri.'],
      medium: ['Soal kesehatan boleh. Oke, aku nggak bakal ngeledek.', 'Oke, yang ini bagus. Lanjut.', 'Pengeluaran wajar. Nggak ada yang perlu dilihat.'],
      unhinged: ['Yang ini kuloloskan. Kesehatan bukan pamer, itu kebutuhan.', 'Oke. Yang itu boleh. Jangan terbiasa.', 'Pengeluaran bertanggung jawab. Aku nggak tahu harus gimana.'],
    },
    other: {
      mild: ['Tercatat. Setiap rupiah berarti.', 'Dicatat. Belanja yang bijak.', 'Satu lagi buat buku catatan.'],
      medium: ['{amt} melayang. Semoga sepadan.', 'Tercatat. Aku bakal ingat ini.', 'Kamu habis {amt}. Buat apa? Siapa tahu.'],
      unhinged: ['{amt}. Hilang. Seperti harga diri dan tabunganmu.', 'Aku nggak tahu itu apa, tapi harganya {units}. Wow.', 'Uang keluar. Saldo rekeningmu merintih.'],
    },
  },
  OVER: {
    mild: ['Anggaran minggu ini habis. Santai dulu beberapa hari ke depan.', 'Minggu ini kelewat. Tenang, makan di rumah saja.', 'Anggaran habis. Minggu depan kita lebih baik.'],
    medium: ['Minggu ini habis. Sekarang kamu pakai uang minggu depan.', 'Lewat anggaran. Kamu resmi ngutang ke dirimu di masa depan.', 'Anggaran: habis. Alasan: sedang dimuat.'],
    unhinged: ['Minggu ini jebol. Gosong total. Makan kentang di sela-sela sofa.', 'Sekarang kamu bokek. Bukan kiasan. Jangan buka aplikasi bank.', 'Lewat anggaran. Bro. {n} kali minggu ini dan sekarang kamu penerima sedekah.'],
  },
  BIG: {
    mild: ['Ini lumayan besar: {units}. Pastikan sepadan.', '{units} sekaligus. Semoga sudah direncanakan.', 'Pembelian gede. Tarik napas dulu.'],
    medium: ['{units} sekali bayar. Jujur, kamu butuh nggak?', '{amt} itu sama dengan {work} hidupmu. Hilang.', 'Itu {units}. Bisa buat makan seharian penuh.'],
    unhinged: ['{units}. SEKALI BAYAR. Serius, deh.', '{amt} itu {work} kerja, hilang buat barang yang kamu lupa hari Jumat.', 'Kamu bisa beli {units} paket HSP sungguhan. Kamu pilih ini. Menarik.'],
  },
  REPEAT: {
    mild: ['Itu sudah {n} kali minggu ini. Mungkin atur tempo.', 'Sudah {n} kali minggu ini. Sepertinya jadi pola.', 'Lagi? Aku mulai lihat kebiasaan.'],
    medium: ['{n} kali minggu ini. Itu bukan hadiah lagi, itu gaya hidup.', '{n} kali dalam seminggu. Polanya kuat.', 'Kamu punya kebiasaan yang mahal.'],
    unhinged: ['{n} kali minggu ini. Itu masalah. Kamu punya masalah.', 'Yang ke-{n}, minggu ini. Aku nggak marah, aku khawatir.', 'Sekalian aja pindah tinggal di sana.'],
  },
  LATE: {
    mild: ['Belanja larut malam. Lain kali tidur dulu.', 'Sudah malam. Keputusan sekarang itu keputusan ngantuk.', 'Belanja malam dicatat. Mungkin tunggu pagi.'],
    medium: ['Belanja larut malam. Kamu jam 3 pagi selera jelek.', 'Nggak ada yang bagus dibeli setelah tengah malam. Tanya keranjangmu.', 'Kamu yang ngantuk habis {amt}. Kamu yang bangun kesal.'],
    unhinged: ['{amt} jam segini? Tidur, dasar biang kerok.', 'Belanja tengah malam bikin kamu punya drone tapi nggak punya uang kos.', 'Yang buka jam 2 pagi cuma ide jelek dan drive-thru.'],
  },
  BNPL: {
    mild: ['Bayar nanti tetap bayar. Hari ini dihitung penuh.'],
    medium: ['Bayar nanti itu cuma bayar lebih parah. Hari ini kuhitung penuh {amt}.'],
    unhinged: ['Bayar nanti? Bro, itu pinjaman dengan logo lucu. Penuh {amt} dihitung.'],
  },
  BODY: {},
  WANT: {
    mild: ['Tidur dulu. Kalau besok masih mau, mungkin oke.', 'Kasih sehari. Dorongannya biasanya hilang.', 'Biarkan dingin. Kamu bisa beli nanti.'],
    medium: ['Masukkan kulkas. Masa tenang itu gratis.', 'Kamu mau sekarang. Hari Kamis masih mau?', 'Keranjang bisa nunggu. Uang kos nggak bisa.'],
    unhinged: ['Jelas nggak malam ini. Balik lagi kalau otakmu sudah balik.', 'Kamu mau karena bosan. Jalan-jalan sana.', 'Impuls terdeteksi. Dikunci di freezer.'],
  },
};
