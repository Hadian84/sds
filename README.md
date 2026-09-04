# WEBSITE RESMI & PORTAL AKADEMIK SMP NEGERI 1 SEGAH

Website modern, responsif, dan interaktif untuk **SMP NEGERI 1 SEGAH** (Kabupaten Berau, Kalimantan Timur) yang dilengkapi dengan Website Publik dan Portal Login Multi-Peran (Admin, Guru, Siswa) terintegrasi dengan **Google Firebase Cloud Database** dan visualisasi data interaktif menggunakan **Chart.js**.

---

## 🚀 Fitur Unggulan

### 1. Website Publik (`index.html`)
- **Header & Navigasi**: Logo resmi, status Akreditasi A, NPSN 30401089, kontak Segah Berau, dan tombol akses cepat Portal Login.
- **Hero Banner Interaktif**: Dilengkapi statistik animasi counter (Jumlah Siswa, Guru & Tendik, Prestasi Juara, Akreditasi BAN-S/M).
- **Profil Sekolah & Sambutan Kepala Sekolah**: Selayang pandang, foto pimpinan, visi, misi, dan nilai karakter sekolah Adiwiyata.
- **Warta & Berita Sekolah**: Kategori Berita Utama, Prestasi, Pengumuman, dan Kegiatan. Dilengkapi filter kategori dinamis dan modal baca artikel lengkap (*article reader modal*).
- **Pojok Prestasi Siswa & Guru**: Galeri piala dan medali tingkat Kabupaten Berau, Provinsi Kalimantan Timur, dan Nasional (OSN, O2SN, FLS2N, Pramuka).
- **Dewan Guru & Tenaga Kependidikan**: Profil guru, gelar, mata pelajaran yang diampu, dan kualifikasi pendidikan.
- **Sarana & Prasarana**: Lab Komputer modern, Lab IPA terpadu, Perpustakaan Cendekia, Lapangan serbaguna, Taman Adiwiyata, dan Ruang UKS.
- **Informasi PPDB 2026/2027**: Rincian jalur pendaftaran (Zonasi, Prestasi, Afirmasi, Mutasi) dan persyaratan berkas.
- **Formulir Kontak & Lokasi**: Form kirim pesan interaktif, alamat lengkap Jl. Tepian Buah Ilir Kab. Berau, email, telepon, dan jam kerja.

### 2. Portal Login Terpadu (`login.html`)
- **Pilihan Peran Dinamis**: Admin, Guru, Siswa.
- **Dual Mode Firebase Cloud + Simulasi Lokal**: Langsung berfungsi seketika (*out-of-the-box*) dan siap dihubungkan ke Firebase Console proyek Anda.
- **Modal Konfigurasi Firebase**: Memudahkan pengisian API Key, Project ID, dan kredensial Firebase langsung dari peramban (browser).

### 3. Portal Administrator (`portal-admin.html`)
- **Dashboard Statistik (Chart.js)**:
  - Grafik Distribusi Siswa per Tingkat Kelas (VII, VIII, IX).
  - Grafik Tren Capaian Prestasi Sekolah Tahunan (2023 - 2026).
  - Grafik Rasio Kehadiran Seluruh Sekolah (Hadir, Sakit, Izin, Alpa).
- **Manajemen Berita & Pengumuman**: Tambah berita baru, pratinjau thumbnail, jumlah pembaca (*views*), dan hapus berita.
- **Manajemen Prestasi**: Tambah data kejuaraan, nama peraih, tingkat perlombaan, dan dokumentasi foto.
- **Data Guru & Staf (Didukung Import & Ekspor Excel)**:
  - Tombol **Import Excel**: Unggah berkas `.xlsx`, `.xls`, atau `.csv` dengan pratinjau tabel interaktif sebelum disimpan.
  - Pilihan metode: Tambahkan ke data yang ada (*Append*) atau Gantikan seluruh data (*Replace All*).
  - Tombol **Unduh Format Excel**: Mengunduh template `.xlsx` yang telah disesuaikan kolomnya (NIP, Nama, Mapel, Jabatan, Email, No HP, Pendidikan).
  - Tombol **Ekspor Excel**: Mengunduh data seluruh dewan guru aktif ke dalam berkas Excel (`.xlsx`).
  - Formulir manual tambah data & hapus data guru.
- **Data Siswa & Rombel (21 Kelas: VII-A s/d VII-G, VIII-A s/d VIII-G, IX-A s/d IX-G)**:
  - **Dukungan 21 Rombel Lengkap**: Mengelola data siswa tingkat VII (A s/d G), tingkat VIII (A s/d G), dan tingkat IX (A s/d G).
  - **Filter Pencarian & Kelas Cepat**: Cari siswa berdasarkan nama atau NISN, serta saring tampilan berdasarkan masing-masing rombel kelas atau seluruh kelas.
  - **Tombol Import Excel**: Unggah berkas data siswa format `.xlsx`, `.xls`, atau `.csv` dengan pratinjau tabel interaktif sebelum disimpan.
  - **Pilihan metode**: Tambahkan ke data yang ada (*Append*) atau Gantikan seluruh data (*Replace All*).
  - **Tombol Unduh Format Excel**: Mengunduh template `.xlsx` data siswa (NISN, Nama, Kelas, Jenis Kelamin, Email, No HP, Alamat, TTL, Nama Orang Tua) yang mendukung kelas VII-A s/d IX-G.
  - **Tombol Ekspor Excel**: Mengunduh data seluruh siswa aktif ke dalam berkas Excel (`.xlsx`).
  - Formulir manual tambah siswa baru & hapus data siswa.
- **Manajemen Akun Siswa & Password (Didukung Import & Ekspor Excel)**:
  - **Tabel Akun Terpadu**: Menampilkan daftar akun siswa dengan filter rombel kelas (VII-A s/d IX-G), kolom NISN/Username, Nama Lengkap, Kelas, Email, Status Akun (Aktif/Nonaktif), Tanggal Pembuatan, dan Password.
  - **Keamanan & Penglihatan Password**: Password disamarkan secara default (`••••••••`) dengan tombol intip (*eye icon*), tombol global **"Lihat Semua Password"**, dan tombol 1-klik **Salin Password**.
  - **Tombol Import Excel**: Mengunggah berkas Excel (`.xlsx`, `.xls`, `.csv`) untuk membuat akun atau memperbarui kata sandi banyak siswa sekaligus dengan pratinjau tabel interaktif sebelum disimpan.
  - **Pilihan Metode Import**: Tambahkan & Perbarui (*Append / Update*) atau Gantikan seluruh data (*Replace All*).
  - **Tombol Unduh Format Excel**: Mengunduh template `.xlsx` akun siswa (NISN, Nama Siswa, Kelas, Username, Email, Kata Sandi, Status).
  - **Ubah & Reset Password**: Modal interaktif untuk mengganti password siswa dengan validasi keamanan dan tombol generate password acak yang kuat.
  - **Buat Akun Otomatis**: Tombol 1-klik untuk men-generate akun siswa otomatis bagi seluruh siswa yang belum memiliki akun dengan format password bawaan `Siswa@NISN`.
  - **Tambah Akun Manual**: Form pendaftaran akun siswa baru terintegrasi dengan 21 kelas dan daftar siswa.
  - **Toggle Status Akun**: Mengaktifkan atau menonaktifkan izin login siswa sewaktu-waktu.
  - **Ekspor Akun ke Excel**: Ekspor daftar seluruh akun dan password siswa ke file `.xlsx` untuk diserahkan ke wali kelas / orang tua.
  - **Login Interoperable**: Siswa dapat langsung masuk di halaman `login.html` menggunakan NISN atau Email dan password yang telah diatur Admin.
- **Sinkronisasi Firebase Cloud**: Tombol 1-klik untuk mengunggah dan menyinkronkan seluruh database lokal ke Cloud Firestore.

### 4. Portal Guru Pengajar (`portal-guru.html`)
- **Dashboard Guru**: Beban mengajar mingguan (24 JP), ringkasan murid binaan, dan rata-rata kelas.
- **Grafik Komponen Nilai Siswa (Chart.js)**: Visualisasi perbandingan nilai Tugas, Ulangan Harian (UH), UTS, dan UAS per murid.
- **Input & Kelola Nilai**:
  - Filter 21 Kelas: Seluruh kelas VII (A s/d G), VIII (A s/d G), dan IX (A s/d G) serta Mata Pelajaran.
  - Penghitungan otomatis Nilai Akhir `(Tugas 20% + UH 20% + UTS 30% + UAS 30%)`.
  - Penentuan otomatis Predikat (A, B, C, D) dan Status KKM (Tuntas / Remidi).
  - Penyimpanan langsung ke database & tombol cetak leger nilai (*print*).
- **Presensi / Absensi Harian**: Perekaman status Hadir (H), Sakit (S), Izin (I), Alpa (A) per tanggal untuk 21 rombel kelas beserta catatan khusus siswa.
- **Modul & Tugas Pembelajaran**: Unggah materi belajar dengan sasaran kelas tertentu (VII-A s/d IX-G) atau Semua Kelas.
- **Jadwal Mengajar Mingguan**: Jadwal tatap muka dari Senin s.d. Jumat.

### 5. Portal Siswa Terpadu (`portal-siswa.html`)
- **Biodata & Capaian Belajar**: Nilai rata-rata semester, peringkat di kelas, dan persentase kehadiran.
- **Grafik Capaian Akademik (Chart.js)**:
  - Grafik Batang Nilai Mata Pelajaran dibandingkan garis ambang batas KKM (75).
  - Grafik Radar Analisis Potensi Diri (Sains, Bahasa, IT, PJOK, Karakter, Seni).
- **Rapor Digital Semester**: Tabel nilai lengkap seluruh mapel dengan predikat dan tombol cetak dokumen resmi rapor sementara.
- **Kartu Pelajar Digital**: Desain kartu identitas siswa resmi dengan foto, nomor NISN, stempel sekolah, barcode, dan tombol cetak langsung.
- **Materi & Tugas Belajar**: Unduh materi modul dan instruksi tugas dari guru.
- **Jadwal Pelajaran Mingguan**: Jadwal belajar kelas VIII-A lengkap per jam pelajaran.
- **Rekapitulasi Kehadiran**: Rincian hari hadir, sakit, izin, dan alpa.

---

## 🔑 Kredensial Akun Pengujian (Demo)

Anda dapat memasukkan kredensial berikut secara manual pada formulir login:

| Peran (Role) | Email Login | Kata Sandi | Halaman Portal |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smpn1segah.sch.id` | `admin123` | `portal-admin.html` |
| **Guru Pengajar** | `guru@smpn1segah.sch.id` | `guru123` | `portal-guru.html` |
| **Siswa Terpadu** | `siswa@smpn1segah.sch.id` | `siswa123` | `portal-siswa.html` |

---

## 🛠️ Panduan Integrasi Google Firebase

Website ini telah dilengkapi arsitektur **Dual-Mode Adapter**:
1. **Mode Default (Simulasi Lokal)**: Langsung berjalan lancar tanpa konfigurasi awal dengan data sampel sekolah SMP Negeri 1 Segah.
2. **Mode Firebase Live Cloud**:
   - Buat proyek di [Firebase Console](https://console.firebase.google.com/).
   - Aktifkan **Cloud Firestore** dan **Authentication** (metode *Email/Password*).
   - Buka file `js/firebase-config.js` dan ganti `DEFAULT_FIREBASE_CONFIG` dengan konfigurasi proyek Anda:
     ```javascript
     const DEFAULT_FIREBASE_CONFIG = {
       apiKey: "AIzaSy...",
       authDomain: "smpn1segah-berau.firebaseapp.com",
       projectId: "smpn1segah-berau",
       storageBucket: "smpn1segah-berau.appspot.com",
       messagingSenderId: "123456789012",
       appId: "1:123456789012:web:..."
     };
     ```
   - Atau cukup klik tombol **"Firebase"** pada halaman Login atau di menu Admin Portal, lalu tempelkan kredensial Anda dan klik **Simpan & Hubungkan**.
   - Di Portal Admin, klik tombol **"Sinkronkan ke Firebase"** untuk mengunggah seluruh data ke Cloud Firestore dalam 1 klik!

---

## 💻 Cara Menjalankan Website

1. Buka folder `E:\sds3` di komputer Anda.
2. Klik ganda file `index.html` untuk membuka Website Publik di browser (Chrome, Edge, Firefox, Safari).
3. Untuk masuk ke portal, klik tombol **"Portal Login"** di pojok kanan atas atau buka file `login.html`.
4. Anda juga dapat menjalankannya melalui web server lokal seperti ekstensi **VS Code Live Server** atau Node HTTP Server:
   ```bash
   npx serve .
   ```

---
*Dikembangkan dengan standar HTML5 modern, CSS3 kustom, Bootstrap 5.3.3, JavaScript ES6, Chart.js, dan Google Firebase.*
