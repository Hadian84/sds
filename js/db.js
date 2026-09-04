/**
 * SMP NEGERI 1 SEGAH - Database Service Layer
 * Menyediakan fungsi CRUD untuk Berita, Prestasi, Guru, Siswa, Nilai, Presensi, dan Materi.
 * Beroperasi di Firestore jika online/dikonfigurasi, atau LocalStorage dengan data realistis.
 */

const DB_KEYS = {
  NEWS: 'smpn1_news',
  ACHIEVEMENTS: 'smpn1_achievements',
  TEACHERS: 'smpn1_teachers',
  STUDENTS: 'smpn1_students',
  GRADES: 'smpn1_grades',
  ATTENDANCE: 'smpn1_attendance',
  MATERIALS: 'smpn1_materials',
  STUDENT_ACCOUNTS: 'smpn1_student_accounts'
};

// Daftar Seluruh Rombongan Belajar (Kelas) SMP Negeri 1 Segah: VII, VIII, dan IX (Kelas A sampai dengan G)
const SCHOOL_CLASSES = [
  "VII-A", "VII-B", "VII-C", "VII-D", "VII-E", "VII-F", "VII-G",
  "VIII-A", "VIII-B", "VIII-C", "VIII-D", "VIII-E", "VIII-F", "VIII-G",
  "IX-A", "IX-B", "IX-C", "IX-D", "IX-E", "IX-F", "IX-G"
];

// Data Awal Realistis untuk SMP Negeri 1 Segah
const INITIAL_DATA = {
  news: [
    {
      id: "news-01",
      title: "SMP Negeri 1 Segah Raih Juara 1 Lomba Cerdas Cermat Sains Tingkat Kabupaten Berau 2026",
      category: "Prestasi",
      date: "2026-08-28",
      author: "Humas SMPN 1 Segah",
      views: 342,
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80",
      excerpt: "Tim sains SMP Negeri 1 Segah berhasil mengungguli 24 sekolah perwakilan kecamatan se-Kabupaten Berau dalam ajang kompetisi sains tahunan.",
      content: "<p>Kabar membanggakan kembali dipersembahkan oleh putra-putri berprestasi SMP Negeri 1 Segah. Pada perlombaan Cerdas Cermat Sains yang diselenggarakan oleh Dinas Pendidikan Kabupaten Berau bertempat di Tanjung Redeb, kontingen sekolah kita berhasil menyabet gelar Juara 1 Umum.</p><p>Kepala SMP Negeri 1 Segah, Hadi Permana, S.Pd, M.Pd, menyampaikan apresiasi setinggi-tingginya kepada para siswa pembina sains Bpk. Ahmad Fauzi, S.Si yang telah tekun membimbing para siswa hingga berhasil menembus tingkat provinsi.</p>",
      featured: true
    },
    {
      id: "news-02",
      title: "Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027 Telah Resmi Dibuka",
      category: "Pengumuman",
      date: "2026-08-15",
      author: "Panitia PPDB",
      views: 520,
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
      excerpt: "Jalur zonasi, afirmasi, prestasi, dan perpindahan tugas orang tua telah dibuka mulai 1 Agustus secara daring dan luring.",
      content: "<p>SMP Negeri 1 Segah secara resmi membuka pendaftaran Peserta Didik Baru (PPDB) untuk Tahun Ajaran 2026/2027. Tersedia kuota sebanyak 6 rombel (rombongan belajar) dengan fasilitas pembelajaran berbasis digital dan lingkungan sekolah Adiwiyata yang asri.</p><p>Orang tua/wali murid dapat mendaftarkan calon siswa baru melalui loket pelayanan PPDB di ruang tata usaha sekolah atau melalui portal daring dengan menyiapkan fotokopi Kartu Keluarga, Akta Kelahiran, dan Surat Keterangan Lulus (SKL) SD/MI.</p>",
      featured: true
    },
    {
      id: "news-03",
      title: "Gerakan Sekolah Sehat & Gotong Royong Adiwiyata Menjaga Kelestarian Hutan Segah",
      category: "Kegiatan",
      date: "2026-08-10",
      author: "Tim Adiwiyata",
      views: 215,
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
      excerpt: "Seluruh civitas akademika SMP Negeri 1 Segah melaksanakan penanaman 200 bibit pohon endemik Kalimantan dan bersih lingkungan berkala.",
      content: "<p>Sebagai sekolah yang berada di wilayah kaya keanekaragaman hayati Kecamatan Segah, SMP Negeri 1 Segah senantiasa menanamkan kepedulian lingkungan hidup kepada para murid sejak dini melalui Gerakan Sekolah Adiwiyata Mandiri.</p><p>Kegiatan gotong royong ini meliputi penanaman pohon ulin dan meranti, pemilahan sampah organik dan anorganik, serta pemanfaatan pupuk kompos untuk taman apotek hidup sekolah.</p>",
      featured: false
    },
    {
      id: "news-04",
      title: "Peringatan Hari Pramuka ke-65 Berlangsung Khidmat di Lapangan Utama SMPN 1 Segah",
      category: "Kegiatan",
      date: "2026-08-14",
      author: "Pembina Pramuka",
      views: 180,
      image: "https://images.unsplash.com/photo-1526786220381-1d21eedf92bf?w=800&auto=format&fit=crop&q=80",
      excerpt: "Upacara peringatan Hari Pramuka diwarnai atraksi pionering tongkat bambu dan parade yel-yel kebangsaan oleh Gugus Depan Segah.",
      content: "<p>Peringatan Hari Pramuka ke-65 di SMPN 1 Segah berlangsung meriah dan penuh semangat kepanduan. Puluhan regu penggalang putra dan putri menunjukkan keterampilan simpul, morse, serta baris-berbaris di hadapan pembina upacara dan dewan guru.</p>",
      featured: false
    }
  ],

  achievements: [
    {
      id: "ach-01",
      title: "Juara 1 Cerdas Cermat Sains SMP se-Kabupaten Berau",
      category: "Akademik",
      level: "Kabupaten",
      year: "2026",
      winnerName: "Muhammad Rizky, Amanda Putri, Dimas Pratama",
      rank: "Juara 1",
      image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop&q=80",
      description: "Mengharumkan nama Kecamatan Segah dalam Olimpiade Cerdas Cermat Sains Dinas Pendidikan Berau."
    },
    {
      id: "ach-02",
      title: "Medali Emas Pencak Silat Seni Tunggal Putra O2SN",
      category: "Olahraga",
      level: "Provinsi",
      year: "2025",
      winnerName: "Fajar Ramadhan",
      rank: "Medali Emas",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
      description: "Berhasil melaju mewakili Kalimantan Timur ke ajang O2SN Tingkat Nasional di Jakarta."
    },
    {
      id: "ach-03",
      title: "Juara 2 Tari Tradisional Kreasi Dayak FLS2N",
      category: "Seni & Budaya",
      level: "Kabupaten",
      year: "2025",
      winnerName: "Sanggar Seni Tari Putri Segah (6 Siswi)",
      rank: "Juara 2",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80",
      description: "Penampilan memukau tari kreasi pedalaman khas pesisir dan hulu Sungai Segah."
    },
    {
      id: "ach-04",
      title: "Gugus Depan Tergiat & Juara Umum LT III Kwartir Cabang Berau",
      category: "Pramuka",
      level: "Kabupaten",
      year: "2025",
      winnerName: "Regu Rajawali & Regu Melati SMPN 1 Segah",
      rank: "Juara Umum",
      image: "https://images.unsplash.com/photo-1526786220381-1d21eedf92bf?w=800&auto=format&fit=crop&q=80",
      description: "Meraih 7 piala emas dalam berbagai mata lomba kepramukaan dan survival alam terbuka."
    }
  ],

  teachers: [
    {
      id: "tch-01",
      nip: "19720412 199802 1 004",
      name: "Hadi Permana, S.Pd, M.Pd",
      subject: "Kepala Sekolah",
      role: "Kepala Sekolah",
      email: "kepsek@smpn1segah.sch.id",
      phone: "0812-5401-9988",
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
      education: "S2 Manajemen Pendidikan (Univ. Mulawarman)"
    },
    {
      id: "tch-02",
      nip: "19830514 200801 1 009",
      name: "Bambang Sutrisno, S.Pd",
      subject: "Matematika",
      role: "Waka Kurikulum",
      email: "guru@smpn1segah.sch.id", // Akun demo guru
      phone: "0813-4712-3456",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      education: "S1 Pendidikan Matematika (Univ. Negeri Yogyakarta)"
    },
    {
      id: "tch-03",
      nip: "19850720 201001 2 018",
      name: "Siti Rahmawati, M.Pd",
      subject: "Bahasa Indonesia",
      role: "Wali Kelas VII-A",
      email: "siti.rahmawati@smpn1segah.sch.id",
      phone: "0821-5088-7744",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      education: "S2 Pendidikan Bahasa Indonesia"
    },
    {
      id: "tch-04",
      nip: "19890918 201402 1 005",
      name: "Ahmad Fauzi, S.Si",
      subject: "Ilmu Pengetahuan Alam (IPA)",
      role: "Pembina OSN Sains",
      email: "ahmad.fauzi@smpn1segah.sch.id",
      phone: "0852-4411-2233",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      education: "S1 Biologi MIPA"
    },
    {
      id: "tch-05",
      nip: "19910305 201603 2 007",
      name: "Dewi Anggraeni, S.Pd",
      subject: "Bahasa Inggris",
      role: "Wali Kelas VIII-A",
      email: "dewi.anggraeni@smpn1segah.sch.id",
      phone: "0812-7788-9900",
      photo: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80",
      education: "S1 Pendidikan Bahasa Inggris"
    },
    {
      id: "tch-06",
      nip: "19931122 201903 1 006",
      name: "Hendra Saputra, S.Pd",
      subject: "PJOK",
      role: "Pembina OSIS & Olahraga",
      email: "hendra.saputra@smpn1segah.sch.id",
      phone: "0853-9900-1122",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      education: "S1 Pendidikan Kepelatihan Olahraga"
    },
    {
      id: "tch-07",
      nip: "19940810 202012 2 015",
      name: "Nurul Hidayah, S.Kom",
      subject: "Informatika",
      role: "Kepala Lab Komputer",
      email: "nurul.hidayah@smpn1segah.sch.id",
      phone: "0822-3344-5566",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      education: "S1 Teknik Informatika"
    }
  ],

  students: [
    {
      id: "std-01",
      nisn: "0098765432",
      nis: "240801",
      name: "Muhammad Rizky",
      class: "VIII-A",
      gender: "Laki-laki",
      email: "siswa@smpn1segah.sch.id", // Akun demo siswa
      phone: "0821-9988-7711",
      address: "Jl. Poros Segah RT 03, Kec. Segah",
      birthPlaceDate: "Berau, 12 Mei 2011",
      parentName: "H. Sukardi",
      attendanceRate: 98,
      avgScore: 89.4
    },
    {
      id: "std-02",
      nisn: "0098765433",
      nis: "240802",
      name: "Amanda Putri Cantika",
      class: "VIII-A",
      gender: "Perempuan",
      email: "amanda.putri@smpn1segah.sch.id",
      phone: "0821-9988-7712",
      address: "Desa Tepian Buah, Kec. Segah",
      birthPlaceDate: "Tanjung Redeb, 04 Juli 2011",
      parentName: "Bambang Wijaya",
      attendanceRate: 100,
      avgScore: 92.1
    },
    {
      id: "std-03",
      nisn: "0098765434",
      nis: "240803",
      name: "Dimas Aditya Pratama",
      class: "VIII-A",
      gender: "Laki-laki",
      email: "dimas.aditya@smpn1segah.sch.id",
      phone: "0821-9988-7713",
      address: "Jl. Pendidikan No. 14 Segah",
      birthPlaceDate: "Segah, 22 Agustus 2011",
      parentName: "Suryono",
      attendanceRate: 95,
      avgScore: 86.8
    },
    {
      id: "std-04",
      nisn: "0098765435",
      nis: "240804",
      name: "Zahra Aurelia",
      class: "VIII-B",
      gender: "Perempuan",
      email: "zahra.aurelia@smpn1segah.sch.id",
      phone: "0821-9988-7714",
      address: "Desa Harapan Jaya, Kec. Segah",
      birthPlaceDate: "Berau, 15 September 2011",
      parentName: "Iskandar",
      attendanceRate: 96,
      avgScore: 88.0
    },
    {
      id: "std-05",
      nisn: "0098765436",
      nis: "230715",
      name: "Fajar Ramadhan",
      class: "IX-A",
      gender: "Laki-laki",
      email: "fajar.ramadhan@smpn1segah.sch.id",
      phone: "0821-9988-7715",
      address: "Jl. Poros Segah RT 01",
      birthPlaceDate: "Segah, 03 Oktober 2010",
      parentName: "Rahmat",
      attendanceRate: 94,
      avgScore: 85.5
    },
    {
      id: "std-06",
      nisn: "0098765437",
      nis: "250920",
      name: "Nabila Syakieb",
      class: "VII-A",
      gender: "Perempuan",
      email: "nabila.syakieb@smpn1segah.sch.id",
      phone: "0821-9988-7716",
      address: "Desa Bukit Makmur, Kec. Segah",
      birthPlaceDate: "Berau, 18 Januari 2012",
      parentName: "Mahmud",
      attendanceRate: 97,
      avgScore: 90.2
    },
    {
      id: "std-07",
      nisn: "0098765438",
      nis: "250921",
      name: "Arya Bagus Pratama",
      class: "VII-B",
      gender: "Laki-laki",
      email: "arya.bagus@smpn1segah.sch.id",
      phone: "0821-9988-7717",
      address: "Jl. Poros Segah RT 02, Kec. Segah",
      birthPlaceDate: "Berau, 14 Februari 2012",
      parentName: "Bambang P.",
      attendanceRate: 98,
      avgScore: 88.5
    },
    {
      id: "std-08",
      nisn: "0098765439",
      nis: "250922",
      name: "Citra Kirana Dewi",
      class: "VII-C",
      gender: "Perempuan",
      email: "citra.kirana@smpn1segah.sch.id",
      phone: "0821-9988-7718",
      address: "Desa Tepian Buah, Kec. Segah",
      birthPlaceDate: "Tanjung Redeb, 20 Maret 2012",
      parentName: "Surya Dharma",
      attendanceRate: 96,
      avgScore: 89.2
    },
    {
      id: "std-09",
      nisn: "0098765440",
      nis: "250923",
      name: "Daffa Al-Fatih",
      class: "VII-D",
      gender: "Laki-laki",
      email: "daffa.alfatih@smpn1segah.sch.id",
      phone: "0821-9988-7719",
      address: "Desa Gunung Sari, Kec. Segah",
      birthPlaceDate: "Segah, 11 April 2012",
      parentName: "Fathurrahman",
      attendanceRate: 95,
      avgScore: 87.0
    },
    {
      id: "std-10",
      nisn: "0098765441",
      nis: "250924",
      name: "Eka Safitri",
      class: "VII-E",
      gender: "Perempuan",
      email: "eka.safitri@smpn1segah.sch.id",
      phone: "0821-9988-7720",
      address: "Jl. Trans Segah No. 45",
      birthPlaceDate: "Berau, 05 Mei 2012",
      parentName: "Subhan",
      attendanceRate: 97,
      avgScore: 91.0
    },
    {
      id: "std-11",
      nisn: "0098765442",
      nis: "250925",
      name: "Farhan Maulana",
      class: "VII-F",
      gender: "Laki-laki",
      email: "farhan.maulana@smpn1segah.sch.id",
      phone: "0821-9988-7721",
      address: "Desa Punan Malinau, Kec. Segah",
      birthPlaceDate: "Segah, 19 Juni 2012",
      parentName: "Maulana Malik",
      attendanceRate: 94,
      avgScore: 85.8
    },
    {
      id: "std-12",
      nisn: "0098765443",
      nis: "250926",
      name: "Gita Gutawa Putri",
      class: "VII-G",
      gender: "Perempuan",
      email: "gita.putri@smpn1segah.sch.id",
      phone: "0821-9988-7722",
      address: "Desa Batu Rajang, Kec. Segah",
      birthPlaceDate: "Tanjung Redeb, 08 Juli 2012",
      parentName: "Kurnia Sandi",
      attendanceRate: 99,
      avgScore: 92.4
    },
    {
      id: "std-13",
      nisn: "0098765444",
      nis: "240805",
      name: "Gilang Ramadhan",
      class: "VIII-C",
      gender: "Laki-laki",
      email: "gilang.ramadhan@smpn1segah.sch.id",
      phone: "0821-9988-7723",
      address: "Jl. Pendidikan No. 8 Segah",
      birthPlaceDate: "Segah, 17 Agustus 2011",
      parentName: "Agus Salim",
      attendanceRate: 96,
      avgScore: 88.0
    },
    {
      id: "std-14",
      nisn: "0098765445",
      nis: "240806",
      name: "Hani Fitriani",
      class: "VIII-D",
      gender: "Perempuan",
      email: "hani.fitriani@smpn1segah.sch.id",
      phone: "0821-9988-7724",
      address: "Desa Harapan Jaya, Kec. Segah",
      birthPlaceDate: "Berau, 23 September 2011",
      parentName: "Yudi Hartono",
      attendanceRate: 97,
      avgScore: 89.5
    },
    {
      id: "std-15",
      nisn: "0098765446",
      nis: "240807",
      name: "Ihsan Kamil",
      class: "VIII-E",
      gender: "Laki-laki",
      email: "ihsan.kamil@smpn1segah.sch.id",
      phone: "0821-9988-7725",
      address: "Desa Bukit Makmur RT 04",
      birthPlaceDate: "Segah, 30 Oktober 2011",
      parentName: "Kamiludin",
      attendanceRate: 95,
      avgScore: 86.2
    },
    {
      id: "std-16",
      nisn: "0098765447",
      nis: "240808",
      name: "Jessica Maharani",
      class: "VIII-F",
      gender: "Perempuan",
      email: "jessica.maharani@smpn1segah.sch.id",
      phone: "0821-9988-7726",
      address: "Jl. Poros Segah KM 3",
      birthPlaceDate: "Tanjung Redeb, 12 Desember 2011",
      parentName: "Irwan Susanto",
      attendanceRate: 98,
      avgScore: 90.8
    },
    {
      id: "std-17",
      nisn: "0098765448",
      nis: "240809",
      name: "Kevin Julio",
      class: "VIII-G",
      gender: "Laki-laki",
      email: "kevin.julio@smpn1segah.sch.id",
      phone: "0821-9988-7727",
      address: "Desa Pandan Sari, Kec. Segah",
      birthPlaceDate: "Berau, 01 Januari 2011",
      parentName: "Juliansyah",
      attendanceRate: 93,
      avgScore: 84.7
    },
    {
      id: "std-18",
      nisn: "0098765449",
      nis: "230716",
      name: "Larasati Wulandari",
      class: "IX-B",
      gender: "Perempuan",
      email: "larasati.wulandari@smpn1segah.sch.id",
      phone: "0821-9988-7728",
      address: "Jl. Poros Segah RT 05",
      birthPlaceDate: "Berau, 21 Februari 2010",
      parentName: "Wahyudi",
      attendanceRate: 99,
      avgScore: 93.1
    },
    {
      id: "std-19",
      nisn: "0098765450",
      nis: "230717",
      name: "Mario Teguh Kurniawan",
      class: "IX-C",
      gender: "Laki-laki",
      email: "mario.kurniawan@smpn1segah.sch.id",
      phone: "0821-9988-7729",
      address: "Desa Tepian Buah No. 20",
      birthPlaceDate: "Segah, 15 Maret 2010",
      parentName: "Kurniawan",
      attendanceRate: 95,
      avgScore: 87.4
    },
    {
      id: "std-20",
      nisn: "0098765451",
      nis: "230718",
      name: "Nadia Stefanie",
      class: "IX-D",
      gender: "Perempuan",
      email: "nadia.stefanie@smpn1segah.sch.id",
      phone: "0821-9988-7730",
      address: "Desa Harapan Jaya, Kec. Segah",
      birthPlaceDate: "Tanjung Redeb, 09 April 2010",
      parentName: "Stefanus",
      attendanceRate: 98,
      avgScore: 91.5
    },
    {
      id: "std-21",
      nisn: "0098765452",
      nis: "230719",
      name: "Oki Setiana Dewi",
      class: "IX-E",
      gender: "Perempuan",
      email: "oki.setiana@smpn1segah.sch.id",
      phone: "0821-9988-7731",
      address: "Jl. Trans Segah RT 02",
      birthPlaceDate: "Berau, 27 Mei 2010",
      parentName: "Setiawan",
      attendanceRate: 96,
      avgScore: 88.9
    },
    {
      id: "std-22",
      nisn: "0098765453",
      nis: "230720",
      name: "Panji Petualang",
      class: "IX-F",
      gender: "Laki-laki",
      email: "panji.petualang@smpn1segah.sch.id",
      phone: "0821-9988-7732",
      address: "Desa Gunung Sari RT 03",
      birthPlaceDate: "Segah, 18 Juni 2010",
      parentName: "Sudirman",
      attendanceRate: 94,
      avgScore: 86.0
    },
    {
      id: "std-23",
      nisn: "0098765454",
      nis: "230721",
      name: "Qori Sandioriva",
      class: "IX-G",
      gender: "Perempuan",
      email: "qori.sandioriva@smpn1segah.sch.id",
      phone: "0821-9988-7733",
      address: "Desa Bukit Makmur, Kec. Segah",
      birthPlaceDate: "Tanjung Redeb, 03 Juli 2010",
      parentName: "Mansyur",
      attendanceRate: 97,
      avgScore: 90.0
    }
  ],

  grades: [
    {
      id: "grd-01",
      studentId: "std-01",
      studentName: "Muhammad Rizky",
      class: "VIII-A",
      subject: "Matematika",
      teacherName: "Bambang Sutrisno, S.Pd",
      assignment: 88,
      uh: 85,
      uts: 90,
      uas: 92,
      finalScore: 89,
      gradeLetter: "A",
      semester: "Ganjil 2026/2027"
    },
    {
      id: "grd-02",
      studentId: "std-01",
      studentName: "Muhammad Rizky",
      class: "VIII-A",
      subject: "Bahasa Indonesia",
      teacherName: "Siti Rahmawati, M.Pd",
      assignment: 85,
      uh: 84,
      uts: 88,
      uas: 87,
      finalScore: 86,
      gradeLetter: "B",
      semester: "Ganjil 2026/2027"
    },
    {
      id: "grd-03",
      studentId: "std-01",
      studentName: "Muhammad Rizky",
      class: "VIII-A",
      subject: "Ilmu Pengetahuan Alam (IPA)",
      teacherName: "Ahmad Fauzi, S.Si",
      assignment: 92,
      uh: 90,
      uts: 95,
      uas: 94,
      finalScore: 93,
      gradeLetter: "A",
      semester: "Ganjil 2026/2027"
    },
    {
      id: "grd-04",
      studentId: "std-01",
      studentName: "Muhammad Rizky",
      class: "VIII-A",
      subject: "Bahasa Inggris",
      teacherName: "Dewi Anggraeni, S.Pd",
      assignment: 86,
      uh: 88,
      uts: 90,
      uas: 88,
      finalScore: 88,
      gradeLetter: "A",
      semester: "Ganjil 2026/2027"
    },
    {
      id: "grd-05",
      studentId: "std-01",
      studentName: "Muhammad Rizky",
      class: "VIII-A",
      subject: "Informatika",
      teacherName: "Nurul Hidayah, S.Kom",
      assignment: 95,
      uh: 92,
      uts: 96,
      uas: 95,
      finalScore: 95,
      gradeLetter: "A",
      semester: "Ganjil 2026/2027"
    },
    {
      id: "grd-06",
      studentId: "std-01",
      studentName: "Muhammad Rizky",
      class: "VIII-A",
      subject: "Pendidikan Jasmani & Olahraga",
      teacherName: "Hendra Saputra, S.Pd",
      assignment: 90,
      uh: 90,
      uts: 88,
      uas: 90,
      finalScore: 90,
      gradeLetter: "A",
      semester: "Ganjil 2026/2027"
    }
  ],

  attendance: [
    {
      id: "att-01",
      date: "2026-09-04",
      class: "VIII-A",
      subject: "Matematika",
      records: [
        { studentId: "std-01", studentName: "Muhammad Rizky", status: "H", note: "Tepat waktu" },
        { studentId: "std-02", studentName: "Amanda Putri Cantika", status: "H", note: "Tepat waktu" },
        { studentId: "std-03", studentName: "Dimas Aditya Pratama", status: "H", note: "Tepat waktu" }
      ]
    },
    {
      id: "att-02",
      date: "2026-09-03",
      class: "VIII-A",
      subject: "Bahasa Inggris",
      records: [
        { studentId: "std-01", studentName: "Muhammad Rizky", status: "H", note: "Tepat waktu" },
        { studentId: "std-02", studentName: "Amanda Putri Cantika", status: "H", note: "Tepat waktu" },
        { studentId: "std-03", studentName: "Dimas Aditya Pratama", status: "I", note: "Izin keperluan keluarga" }
      ]
    }
  ],

  materials: [
    {
      id: "mat-01",
      title: "Modul Teorema Pythagoras dan Penerapannya",
      subject: "Matematika",
      class: "VIII-A",
      teacherName: "Bambang Sutrisno, S.Pd",
      date: "2026-09-01",
      link: "https://drive.google.com/sample-pythagoras-modul.pdf",
      description: "Pelajari materi halaman 14-25, kerjakan latihan soal no 1-5 di buku tugas.",
      deadline: "2026-09-08"
    },
    {
      id: "mat-02",
      title: "Sistem Peredaran Darah pada Manusia (Slide & Video Interaktif)",
      subject: "Ilmu Pengetahuan Alam (IPA)",
      class: "VIII-A",
      teacherName: "Ahmad Fauzi, S.Si",
      date: "2026-08-29",
      link: "https://drive.google.com/sample-ipa-peredaran-darah.pdf",
      description: "Simak diagram kerja jantung dan pembuluh darah. Tugas rangkuman mandiri.",
      deadline: "2026-09-05"
    },
    {
      id: "mat-03",
      title: "Descriptive Text: Describing Historical Places in East Kalimantan",
      subject: "Bahasa Inggris",
      class: "VIII-A",
      teacherName: "Dewi Anggraeni, S.Pd",
      date: "2026-08-25",
      link: "https://drive.google.com/sample-descriptive-text.pdf",
      description: "Write a short paragraph about Derawan Island or Keraton Sambaliung using adjectives.",
      deadline: "2026-09-02"
    }
  ],

  studentAccounts: [
    {
      id: "usr-std-01",
      studentId: "std-01",
      nisn: "0098765432",
      name: "Muhammad Rizky",
      class: "VIII-A",
      username: "0098765432",
      email: "siswa@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-04 10:15"
    },
    {
      id: "usr-std-02",
      studentId: "std-02",
      nisn: "0098765433",
      name: "Amanda Putri Cantika",
      class: "VIII-A",
      username: "0098765433",
      email: "amanda.putri@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-03 14:20"
    },
    {
      id: "usr-std-03",
      studentId: "std-03",
      nisn: "0098765434",
      name: "Dimas Aditya Pratama",
      class: "VIII-A",
      username: "0098765434",
      email: "dimas.aditya@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-01 09:40"
    },
    {
      id: "usr-std-04",
      studentId: "std-04",
      nisn: "0098765435",
      name: "Zahra Aurelia",
      class: "VIII-B",
      username: "0098765435",
      email: "zahra.aurelia@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-08-28 11:10"
    },
    {
      id: "usr-std-05",
      studentId: "std-05",
      nisn: "0098765436",
      name: "Fajar Ramadhan",
      class: "IX-A",
      username: "0098765436",
      email: "fajar.ramadhan@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-08-30 08:30"
    },
    {
      id: "usr-std-06",
      studentId: "std-06",
      nisn: "0098765437",
      name: "Nabila Syakieb",
      class: "VII-A",
      username: "0098765437",
      email: "nabila.syakieb@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-02 13:05"
    },
    {
      id: "usr-std-07",
      studentId: "std-07",
      nisn: "0098765438",
      name: "Arya Bagus Pratama",
      class: "VII-B",
      username: "0098765438",
      email: "arya.bagus@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-03 08:15"
    },
    {
      id: "usr-std-08",
      studentId: "std-08",
      nisn: "0098765439",
      name: "Citra Kirana Dewi",
      class: "VII-C",
      username: "0098765439",
      email: "citra.kirana@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-02 10:20"
    },
    {
      id: "usr-std-09",
      studentId: "std-09",
      nisn: "0098765440",
      name: "Daffa Al-Fatih",
      class: "VII-D",
      username: "0098765440",
      email: "daffa.alfatih@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-01 11:00"
    },
    {
      id: "usr-std-10",
      studentId: "std-10",
      nisn: "0098765441",
      name: "Eka Safitri",
      class: "VII-E",
      username: "0098765441",
      email: "eka.safitri@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-03 13:45"
    },
    {
      id: "usr-std-11",
      studentId: "std-11",
      nisn: "0098765442",
      name: "Farhan Maulana",
      class: "VII-F",
      username: "0098765442",
      email: "farhan.maulana@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-08-31 09:30"
    },
    {
      id: "usr-std-12",
      studentId: "std-12",
      nisn: "0098765443",
      name: "Gita Gutawa Putri",
      class: "VII-G",
      username: "0098765443",
      email: "gita.putri@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-04 07:45"
    },
    {
      id: "usr-std-13",
      studentId: "std-13",
      nisn: "0098765444",
      name: "Gilang Ramadhan",
      class: "VIII-C",
      username: "0098765444",
      email: "gilang.ramadhan@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-02 14:10"
    },
    {
      id: "usr-std-14",
      studentId: "std-14",
      nisn: "0098765445",
      name: "Hani Fitriani",
      class: "VIII-D",
      username: "0098765445",
      email: "hani.fitriani@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-03 15:00"
    },
    {
      id: "usr-std-15",
      studentId: "std-15",
      nisn: "0098765446",
      name: "Ihsan Kamil",
      class: "VIII-E",
      username: "0098765446",
      email: "ihsan.kamil@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-08-29 10:50"
    },
    {
      id: "usr-std-16",
      studentId: "std-16",
      nisn: "0098765447",
      name: "Jessica Maharani",
      class: "VIII-F",
      username: "0098765447",
      email: "jessica.maharani@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-01 16:20"
    },
    {
      id: "usr-std-17",
      studentId: "std-17",
      nisn: "0098765448",
      name: "Kevin Julio",
      class: "VIII-G",
      username: "0098765448",
      email: "kevin.julio@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-02 08:40"
    },
    {
      id: "usr-std-18",
      studentId: "std-18",
      nisn: "0098765449",
      name: "Larasati Wulandari",
      class: "IX-B",
      username: "0098765449",
      email: "larasati.wulandari@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-04 09:10"
    },
    {
      id: "usr-std-19",
      studentId: "std-19",
      nisn: "0098765450",
      name: "Mario Teguh Kurniawan",
      class: "IX-C",
      username: "0098765450",
      email: "mario.kurniawan@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-08-30 11:30"
    },
    {
      id: "usr-std-20",
      studentId: "std-20",
      nisn: "0098765451",
      name: "Nadia Stefanie",
      class: "IX-D",
      username: "0098765451",
      email: "nadia.stefanie@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-03 14:05"
    },
    {
      id: "usr-std-21",
      studentId: "std-21",
      nisn: "0098765452",
      name: "Oki Setiana Dewi",
      class: "IX-E",
      username: "0098765452",
      email: "oki.setiana@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-02 12:50"
    },
    {
      id: "usr-std-22",
      studentId: "std-22",
      nisn: "0098765453",
      name: "Panji Petualang",
      class: "IX-F",
      username: "0098765453",
      email: "panji.petualang@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-08-31 15:15"
    },
    {
      id: "usr-std-23",
      studentId: "std-23",
      nisn: "0098765454",
      name: "Qori Sandioriva",
      class: "IX-G",
      username: "0098765454",
      email: "qori.sandioriva@smpn1segah.sch.id",
      password: "siswa123",
      status: "Aktif",
      createdAt: "2026-08-01",
      lastLogin: "2026-09-04 10:00"
    }
  ]
};

// Inisialisasi Database Lokal jika belum ada
function initLocalDatabase() {
  if (!localStorage.getItem(DB_KEYS.NEWS)) {
    localStorage.setItem(DB_KEYS.NEWS, JSON.stringify(INITIAL_DATA.news));
  }
  if (!localStorage.getItem(DB_KEYS.ACHIEVEMENTS)) {
    localStorage.setItem(DB_KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_DATA.achievements));
  }
  if (!localStorage.getItem(DB_KEYS.TEACHERS)) {
    localStorage.setItem(DB_KEYS.TEACHERS, JSON.stringify(INITIAL_DATA.teachers));
  }

  // Periksa & sinkronkan data siswa agar selalu mencakup kelas VII, VIII, IX (A s/d G)
  const existingStudentsRaw = localStorage.getItem(DB_KEYS.STUDENTS);
  if (!existingStudentsRaw) {
    localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(INITIAL_DATA.students));
  } else {
    try {
      const existingStudents = JSON.parse(existingStudentsRaw);
      if (Array.isArray(existingStudents) && existingStudents.length < 20) {
        const existingIds = new Set(existingStudents.map(s => s.id));
        const newStudentsToAdd = INITIAL_DATA.students.filter(s => !existingIds.has(s.id));
        const mergedStudents = [...existingStudents, ...newStudentsToAdd];
        localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(mergedStudents));
      }
    } catch (e) {
      localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(INITIAL_DATA.students));
    }
  }

  // Periksa & sinkronkan akun siswa
  const existingAccountsRaw = localStorage.getItem(DB_KEYS.STUDENT_ACCOUNTS);
  if (!existingAccountsRaw) {
    localStorage.setItem(DB_KEYS.STUDENT_ACCOUNTS, JSON.stringify(INITIAL_DATA.studentAccounts));
  } else {
    try {
      const existingAccounts = JSON.parse(existingAccountsRaw);
      if (Array.isArray(existingAccounts) && existingAccounts.length < 20) {
        const existingAccIds = new Set(existingAccounts.map(a => a.id));
        const newAccsToAdd = INITIAL_DATA.studentAccounts.filter(a => !existingAccIds.has(a.id));
        const mergedAccs = [...existingAccounts, ...newAccsToAdd];
        localStorage.setItem(DB_KEYS.STUDENT_ACCOUNTS, JSON.stringify(mergedAccs));
      }
    } catch (e) {
      localStorage.setItem(DB_KEYS.STUDENT_ACCOUNTS, JSON.stringify(INITIAL_DATA.studentAccounts));
    }
  }

  if (!localStorage.getItem(DB_KEYS.GRADES)) {
    localStorage.setItem(DB_KEYS.GRADES, JSON.stringify(INITIAL_DATA.grades));
  }
  if (!localStorage.getItem(DB_KEYS.ATTENDANCE)) {
    localStorage.setItem(DB_KEYS.ATTENDANCE, JSON.stringify(INITIAL_DATA.attendance));
  }
  if (!localStorage.getItem(DB_KEYS.MATERIALS)) {
    localStorage.setItem(DB_KEYS.MATERIALS, JSON.stringify(INITIAL_DATA.materials));
  }
}

initLocalDatabase();

// Objek API Terpadu (DB)
const DB = {
  // ================= BERITA =================
  async getNews() {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        const snap = await firebaseDb.collection('news').orderBy('date', 'desc').get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          return list;
        }
      } catch (err) {
        console.warn("Gagal membaca berita Firestore, fallback ke lokal:", err);
      }
    }
    const data = localStorage.getItem(DB_KEYS.NEWS);
    if (!data) return INITIAL_DATA.news;
    let list = JSON.parse(data);
    let updated = false;
    list = list.map(item => {
      if (item.content && item.content.includes("Mulyadi")) {
        item.content = item.content.replace(/Drs\.\s*H\.\s*Mulyadi,\s*M\.Pd/g, "Hadi Permana, S.Pd, M.Pd");
        updated = true;
      }
      return item;
    });
    if (updated) localStorage.setItem(DB_KEYS.NEWS, JSON.stringify(list));
    return list;
  },

  async addNews(item) {
    const newItem = {
      id: item.id || 'news-' + Date.now(),
      views: 1,
      ...item
    };

    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('news').doc(newItem.id).set(newItem);
      } catch (e) {
        console.error("Firestore news error:", e);
      }
    }

    const current = await this.getNews();
    current.unshift(newItem);
    localStorage.setItem(DB_KEYS.NEWS, JSON.stringify(current));
    return newItem;
  },

  async updateNews(id, updateData) {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('news').doc(id).update(updateData);
      } catch (e) {
        console.error("Firestore update news error:", e);
      }
    }
    const current = await this.getNews();
    const idx = current.findIndex(n => n.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updateData };
      localStorage.setItem(DB_KEYS.NEWS, JSON.stringify(current));
      return current[idx];
    }
    return null;
  },

  async deleteNews(id) {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('news').doc(id).delete();
      } catch (e) {
        console.error("Firestore delete news error:", e);
      }
    }
    const current = await this.getNews();
    const filtered = current.filter(n => n.id !== id);
    localStorage.setItem(DB_KEYS.NEWS, JSON.stringify(filtered));
    return true;
  },

  // ================= PRESTASI =================
  async getAchievements() {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        const snap = await firebaseDb.collection('achievements').get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          return list;
        }
      } catch (err) {
        console.warn("Gagal membaca prestasi Firestore:", err);
      }
    }
    const data = localStorage.getItem(DB_KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : INITIAL_DATA.achievements;
  },

  async addAchievement(item) {
    const newItem = { id: item.id || 'ach-' + Date.now(), ...item };
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('achievements').doc(newItem.id).set(newItem);
      } catch (e) {
        console.error(e);
      }
    }
    const current = await this.getAchievements();
    current.unshift(newItem);
    localStorage.setItem(DB_KEYS.ACHIEVEMENTS, JSON.stringify(current));
    return newItem;
  },

  async deleteAchievement(id) {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('achievements').doc(id).delete();
      } catch (e) {
        console.error(e);
      }
    }
    const current = await this.getAchievements();
    const filtered = current.filter(a => a.id !== id);
    localStorage.setItem(DB_KEYS.ACHIEVEMENTS, JSON.stringify(filtered));
    return true;
  },

  // ================= GURU & STAF =================
  async getTeachers() {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        const snap = await firebaseDb.collection('teachers').get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          return list;
        }
      } catch (err) {
        console.warn(err);
      }
    }
    const data = localStorage.getItem(DB_KEYS.TEACHERS);
    if (!data) return INITIAL_DATA.teachers;
    let list = JSON.parse(data);
    let updated = false;
    list = list.map(t => {
      if (t.name && t.name.includes("Mulyadi")) {
        t.name = "Hadi Permana, S.Pd, M.Pd";
        updated = true;
      }
      return t;
    });
    if (updated) localStorage.setItem(DB_KEYS.TEACHERS, JSON.stringify(list));
    return list;
  },

  async addTeacher(teacher) {
    const item = { id: teacher.id || 'tch-' + Date.now(), ...teacher };
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('teachers').doc(item.id).set(item);
      } catch (e) {
        console.error(e);
      }
    }
    const current = await this.getTeachers();
    current.push(item);
    localStorage.setItem(DB_KEYS.TEACHERS, JSON.stringify(current));
    return item;
  },

  async deleteTeacher(id) {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('teachers').doc(id).delete();
      } catch (e) {
        console.error(e);
      }
    }
    const current = await this.getTeachers();
    const filtered = current.filter(t => t.id !== id);
    localStorage.setItem(DB_KEYS.TEACHERS, JSON.stringify(filtered));
    return true;
  },

  async addTeachersBatch(teachersList, mode = 'append') {
    let current = (mode === 'replace') ? [] : await this.getTeachers();

    const newItems = teachersList.map((t, idx) => ({
      id: t.id || 'tch-' + Date.now() + '-' + idx,
      nip: t.nip || '-',
      name: t.name || 'Guru Baru',
      subject: t.subject || 'Mata Pelajaran',
      role: t.role || 'Tenaga Pendidik',
      email: t.email || '',
      phone: t.phone || '',
      photo: t.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      education: t.education || 'S1 Pendidikan'
    }));

    if (mode === 'replace') {
      current = newItems;
    } else {
      current.push(...newItems);
    }

    if (isRealFirebaseActive && firebaseDb) {
      try {
        const batch = firebaseDb.batch();
        if (mode === 'replace') {
          const snap = await firebaseDb.collection('teachers').get();
          snap.forEach(doc => batch.delete(doc.ref));
        }
        newItems.forEach(item => {
          const ref = firebaseDb.collection('teachers').doc(item.id);
          batch.set(ref, item);
        });
        await batch.commit();
      } catch (e) {
        console.error("Firebase batch teacher error:", e);
      }
    }

    localStorage.setItem(DB_KEYS.TEACHERS, JSON.stringify(current));
    return newItems;
  },

  // ================= SISWA =================
  async getStudents() {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        const snap = await firebaseDb.collection('students').get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          return list;
        }
      } catch (err) {
        console.warn(err);
      }
    }
    const data = localStorage.getItem(DB_KEYS.STUDENTS);
    return data ? JSON.parse(data) : INITIAL_DATA.students;
  },

  async addStudent(student) {
    const item = { id: student.id || 'std-' + Date.now(), ...student };
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('students').doc(item.id).set(item);
      } catch (e) {
        console.error(e);
      }
    }
    const current = await this.getStudents();
    current.push(item);
    localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(current));
    return item;
  },

  async deleteStudent(id) {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('students').doc(id).delete();
      } catch (e) {
        console.error(e);
      }
    }
    const current = await this.getStudents();
    const filtered = current.filter(s => s.id !== id);
    localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(filtered));
    return true;
  },

  async addStudentsBatch(studentsList, mode = 'append') {
    let current = (mode === 'replace') ? [] : await this.getStudents();

    const newItems = studentsList.map((s, idx) => ({
      id: s.id || 'std-' + Date.now() + '-' + idx,
      nisn: s.nisn || '-',
      nis: s.nis || String(240800 + idx + 1),
      name: s.name || 'Siswa Baru',
      class: s.class || 'VII-A',
      gender: s.gender || 'Laki-laki',
      email: s.email || '',
      phone: s.phone || '',
      address: s.address || 'Kec. Segah, Berau',
      birthPlaceDate: s.birthPlaceDate || 'Berau, 2011',
      parentName: s.parentName || '-',
      attendanceRate: Number(s.attendanceRate) || 100,
      avgScore: Number(s.avgScore) || 85
    }));

    if (mode === 'replace') {
      current = newItems;
    } else {
      current.push(...newItems);
    }

    if (isRealFirebaseActive && firebaseDb) {
      try {
        const batch = firebaseDb.batch();
        if (mode === 'replace') {
          const snap = await firebaseDb.collection('students').get();
          snap.forEach(doc => batch.delete(doc.ref));
        }
        newItems.forEach(item => {
          const ref = firebaseDb.collection('students').doc(item.id);
          batch.set(ref, item);
        });
        await batch.commit();
      } catch (e) {
        console.error("Firebase batch student error:", e);
      }
    }

    localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(current));
    return newItems;
  },

  // ================= NILAI =================
  async getGrades(studentId = null, classFilter = null) {
    let grades = [];
    if (isRealFirebaseActive && firebaseDb) {
      try {
        let q = firebaseDb.collection('grades');
        if (studentId) q = q.where('studentId', '==', studentId);
        const snap = await q.get();
        if (!snap.empty) {
          snap.forEach(doc => grades.push({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn(err);
      }
    }
    if (grades.length === 0) {
      const data = localStorage.getItem(DB_KEYS.GRADES);
      grades = data ? JSON.parse(data) : INITIAL_DATA.grades;
    }

    if (studentId) {
      grades = grades.filter(g => g.studentId === studentId);
    }
    if (classFilter) {
      grades = grades.filter(g => g.class === classFilter);
    }
    return grades;
  },

  async saveGrade(gradeData) {
    const finalScore = Math.round((Number(gradeData.assignment) * 0.2) + 
                                  (Number(gradeData.uh) * 0.2) + 
                                  (Number(gradeData.uts) * 0.3) + 
                                  (Number(gradeData.uas) * 0.3));
    let letter = 'D';
    if (finalScore >= 90) letter = 'A';
    else if (finalScore >= 80) letter = 'B';
    else if (finalScore >= 70) letter = 'C';

    const item = {
      id: gradeData.id || 'grd-' + Date.now(),
      finalScore,
      gradeLetter: letter,
      ...gradeData
    };

    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('grades').doc(item.id).set(item);
      } catch (e) {
        console.error(e);
      }
    }

    const current = await this.getGrades();
    const idx = current.findIndex(g => g.id === item.id);
    if (idx !== -1) {
      current[idx] = item;
    } else {
      current.push(item);
    }
    localStorage.setItem(DB_KEYS.GRADES, JSON.stringify(current));
    return item;
  },

  // ================= PRESENSI / ABSENSI =================
  async getAttendance(classFilter = null) {
    let list = [];
    if (isRealFirebaseActive && firebaseDb) {
      try {
        let q = firebaseDb.collection('attendance');
        if (classFilter) q = q.where('class', '==', classFilter);
        const snap = await q.get();
        if (!snap.empty) {
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn(e);
      }
    }
    if (list.length === 0) {
      const data = localStorage.getItem(DB_KEYS.ATTENDANCE);
      list = data ? JSON.parse(data) : INITIAL_DATA.attendance;
    }
    if (classFilter) {
      list = list.filter(a => a.class === classFilter);
    }
    return list;
  },

  async saveAttendance(record) {
    const item = { id: record.id || 'att-' + Date.now(), ...record };
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('attendance').doc(item.id).set(item);
      } catch (e) {
        console.error(e);
      }
    }
    const current = await this.getAttendance();
    current.unshift(item);
    localStorage.setItem(DB_KEYS.ATTENDANCE, JSON.stringify(current));
    return item;
  },

  // ================= MATERI & TUGAS =================
  async getMaterials(classFilter = null) {
    let list = [];
    if (isRealFirebaseActive && firebaseDb) {
      try {
        let q = firebaseDb.collection('materials');
        if (classFilter) q = q.where('class', '==', classFilter);
        const snap = await q.get();
        if (!snap.empty) {
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn(e);
      }
    }
    if (list.length === 0) {
      const data = localStorage.getItem(DB_KEYS.MATERIALS);
      list = data ? JSON.parse(data) : INITIAL_DATA.materials;
    }
    if (classFilter) {
      list = list.filter(m => m.class === classFilter || m.class === 'Semua Kelas');
    }
    return list;
  },

  async addMaterial(mat) {
    const item = { id: mat.id || 'mat-' + Date.now(), ...mat };
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('materials').doc(item.id).set(item);
      } catch (e) {
        console.error(e);
      }
    }
    const current = await this.getMaterials();
    current.unshift(item);
    localStorage.setItem(DB_KEYS.MATERIALS, JSON.stringify(current));
    return item;
  },

  // ================= MANAJEMEN AKUN SISWA =================
  async getStudentAccounts() {
    let list = [];
    if (isRealFirebaseActive && firebaseDb) {
      try {
        const snap = await firebaseDb.collection('student_accounts').get();
        if (!snap.empty) {
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          return list;
        }
      } catch (e) {
        console.warn(e);
      }
    }
    const data = localStorage.getItem(DB_KEYS.STUDENT_ACCOUNTS);
    return data ? JSON.parse(data) : INITIAL_DATA.studentAccounts;
  },

  async saveStudentAccount(acc) {
    const item = {
      id: acc.id || 'usr-std-' + Date.now(),
      studentId: acc.studentId || '',
      nisn: acc.nisn || '',
      name: acc.name || '',
      class: acc.class || '',
      username: acc.username || acc.nisn || '',
      email: acc.email || `${acc.nisn}@smpn1segah.sch.id`,
      password: acc.password || 'siswa123',
      status: acc.status || 'Aktif',
      createdAt: acc.createdAt || new Date().toISOString().split('T')[0],
      lastLogin: acc.lastLogin || '-'
    };

    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('student_accounts').doc(item.id).set(item);
      } catch (e) {
        console.error(e);
      }
    }

    const current = await this.getStudentAccounts();
    const idx = current.findIndex(a => a.id === item.id || a.nisn === item.nisn);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...item };
    } else {
      current.push(item);
    }
    localStorage.setItem(DB_KEYS.STUDENT_ACCOUNTS, JSON.stringify(current));
    return item;
  },

  async updateStudentPassword(accountId, newPassword) {
    const current = await this.getStudentAccounts();
    const idx = current.findIndex(a => a.id === accountId);
    if (idx !== -1) {
      current[idx].password = newPassword;
      if (isRealFirebaseActive && firebaseDb) {
        try {
          await firebaseDb.collection('student_accounts').doc(accountId).update({ password: newPassword });
        } catch (e) {
          console.error(e);
        }
      }
      localStorage.setItem(DB_KEYS.STUDENT_ACCOUNTS, JSON.stringify(current));
      return current[idx];
    }
    throw new Error("Akun siswa tidak ditemukan.");
  },

  async toggleStudentAccountStatus(accountId) {
    const current = await this.getStudentAccounts();
    const idx = current.findIndex(a => a.id === accountId);
    if (idx !== -1) {
      current[idx].status = current[idx].status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      if (isRealFirebaseActive && firebaseDb) {
        try {
          await firebaseDb.collection('student_accounts').doc(accountId).update({ status: current[idx].status });
        } catch (e) {
          console.error(e);
        }
      }
      localStorage.setItem(DB_KEYS.STUDENT_ACCOUNTS, JSON.stringify(current));
      return current[idx];
    }
    throw new Error("Akun siswa tidak ditemukan.");
  },

  async deleteStudentAccount(accountId) {
    if (isRealFirebaseActive && firebaseDb) {
      try {
        await firebaseDb.collection('student_accounts').doc(accountId).delete();
      } catch (e) {
        console.error(e);
      }
    }
    const current = await this.getStudentAccounts();
    const filtered = current.filter(a => a.id !== accountId);
    localStorage.setItem(DB_KEYS.STUDENT_ACCOUNTS, JSON.stringify(filtered));
    return true;
  },

  async autoGenerateStudentAccounts() {
    const students = await this.getStudents();
    const accounts = await this.getStudentAccounts();
    let generatedCount = 0;

    for (const s of students) {
      const exists = accounts.find(a => a.nisn === s.nisn || a.studentId === s.id);
      if (!exists) {
        const newAcc = {
          id: 'usr-std-' + (s.id || Date.now() + Math.floor(Math.random() * 1000)),
          studentId: s.id,
          nisn: s.nisn,
          name: s.name,
          class: s.class,
          username: s.nisn,
          email: s.email || `${s.nisn}@smpn1segah.sch.id`,
          password: 'siswa' + (s.nisn ? s.nisn.slice(-4) : '123'),
          status: 'Aktif',
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: '-'
        };
        accounts.push(newAcc);
        generatedCount++;
        if (isRealFirebaseActive && firebaseDb) {
          try {
            await firebaseDb.collection('student_accounts').doc(newAcc.id).set(newAcc);
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    localStorage.setItem(DB_KEYS.STUDENT_ACCOUNTS, JSON.stringify(accounts));
    return { generatedCount, totalAccounts: accounts.length };
  },

  async addStudentAccountsBatch(accountsList, mode = 'append') {
    let current = (mode === 'replace') ? [] : await this.getStudentAccounts();
    const students = await this.getStudents();
    const newOrUpdatedItems = [];

    for (let i = 0; i < accountsList.length; i++) {
      const a = accountsList[i];
      const nisn = String(a.nisn || a.NISN || '').trim();
      const name = String(a.name || a.Nama || a['Nama Siswa'] || 'Siswa').trim();
      const stdClass = String(a.class || a.Kelas || 'VII-A').trim().toUpperCase();
      const username = String(a.username || a.Username || a['Username Login'] || nisn).trim();
      const email = String(a.email || a.Email || (nisn ? `${nisn}@smpn1segah.sch.id` : '')).trim();
      const password = String(a.password || a.Password || a['Kata Sandi'] || a['Kata Sandi (Password)'] || 'siswa123').trim();
      const status = String(a.status || a.Status || 'Aktif').trim();

      // Cari relasi siswa yang cocok di database
      const matchedStudent = students.find(s => (nisn && s.nisn === nisn) || (name && s.name.toLowerCase() === name.toLowerCase()));
      const studentId = matchedStudent ? matchedStudent.id : (a.studentId || '');

      const existingIdx = (mode === 'replace') ? -1 : current.findIndex(item => 
        (nisn && item.nisn === nisn) || 
        (username && item.username.toLowerCase() === username.toLowerCase())
      );

      if (existingIdx !== -1) {
        current[existingIdx] = {
          ...current[existingIdx],
          name: name || current[existingIdx].name,
          class: stdClass || current[existingIdx].class,
          username: username || current[existingIdx].username,
          email: email || current[existingIdx].email,
          password: password || current[existingIdx].password,
          status: (status.toLowerCase() === 'nonaktif') ? 'Nonaktif' : 'Aktif',
          studentId: studentId || current[existingIdx].studentId
        };
        newOrUpdatedItems.push(current[existingIdx]);
      } else {
        const newAcc = {
          id: a.id || 'usr-std-' + (studentId || Date.now() + '-' + i),
          studentId,
          nisn,
          name,
          class: stdClass,
          username,
          email,
          password,
          status: (status.toLowerCase() === 'nonaktif') ? 'Nonaktif' : 'Aktif',
          createdAt: a.createdAt || new Date().toISOString().split('T')[0],
          lastLogin: a.lastLogin || '-'
        };
        current.push(newAcc);
        newOrUpdatedItems.push(newAcc);
      }
    }

    if (isRealFirebaseActive && firebaseDb) {
      try {
        const batch = firebaseDb.batch();
        if (mode === 'replace') {
          const snap = await firebaseDb.collection('student_accounts').get();
          snap.forEach(doc => batch.delete(doc.ref));
        }
        current.forEach(item => {
          const ref = firebaseDb.collection('student_accounts').doc(item.id);
          batch.set(ref, item);
        });
        await batch.commit();
      } catch (e) {
        console.error("Firebase batch student accounts error:", e);
      }
    }

    localStorage.setItem(DB_KEYS.STUDENT_ACCOUNTS, JSON.stringify(current));
    return { count: newOrUpdatedItems.length, total: current.length };
  },

  // ================= SINKRONISASI KE FIREBASE =================
  // Fitur untuk mengunggah seluruh data lokal ke Firebase Firestore dengan 1 klik
  async syncAllToFirebase() {
    if (!isRealFirebaseActive || !firebaseDb) {
      throw new Error("Koneksi Firebase belum aktif. Masukkan konfigurasi Firebase yang valid terlebih dahulu.");
    }

    const batch = firebaseDb.batch();
    
    // Berita
    const news = await this.getNews();
    news.forEach(n => {
      const ref = firebaseDb.collection('news').doc(n.id);
      batch.set(ref, n);
    });

    // Prestasi
    const achievements = await this.getAchievements();
    achievements.forEach(a => {
      const ref = firebaseDb.collection('achievements').doc(a.id);
      batch.set(ref, a);
    });

    // Guru
    const teachers = await this.getTeachers();
    teachers.forEach(t => {
      const ref = firebaseDb.collection('teachers').doc(t.id);
      batch.set(ref, t);
    });

    // Siswa
    const students = await this.getStudents();
    students.forEach(s => {
      const ref = firebaseDb.collection('students').doc(s.id);
      batch.set(ref, s);
    });

    // Nilai
    const grades = await this.getGrades();
    grades.forEach(g => {
      const ref = firebaseDb.collection('grades').doc(g.id);
      batch.set(ref, g);
    });

    // Materi
    const materials = await this.getMaterials();
    materials.forEach(m => {
      const ref = firebaseDb.collection('materials').doc(m.id);
      batch.set(ref, m);
    });

    // Akun Siswa
    const studentAccounts = await this.getStudentAccounts();
    studentAccounts.forEach(sa => {
      const ref = firebaseDb.collection('student_accounts').doc(sa.id);
      batch.set(ref, sa);
    });

    await batch.commit();
    return true;
  },

  // ================= DAFTAR KELAS SEKOLAH =================
  getSchoolClasses() {
    return [...SCHOOL_CLASSES];
  }
};
