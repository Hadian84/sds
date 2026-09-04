/**
 * SMP NEGERI 1 SEGAH - Portal Administrator Script
 * Menangani Chart.js, Manajemen Berita, Prestasi, Guru, Siswa, dan Pengaturan Firebase
 */

let chartSiswaInstance = null;
let chartPrestasiInstance = null;
let chartKehadiranInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Guard role Admin
  if (!Auth.guard('admin')) return;

  // Render Charts & Metrics
  await refreshAdminDashboard();

  // Load Data Tables
  await loadAdminNewsTable();
  await loadAdminAchievementsTable();
  await loadAdminTeachersTable();
  await loadAdminStudentsTable();
  await loadAdminStudentAccountsTable();

  // Event Listeners Formulir
  initAdminForms();
  initFirebaseSettingsModal();
  initTeacherExcelImportHandlers();
  initStudentExcelImportHandlers();
  initStudentAccountForms();
  initStudentAccountExcelImportHandlers();
});

// Refresh Dashboard KPI & Charts
async function refreshAdminDashboard() {
  const news = await DB.getNews();
  const achievements = await DB.getAchievements();
  const teachers = await DB.getTeachers();
  const students = await DB.getStudents();

  document.getElementById('statTotalSiswa').textContent = students.length || 0;
  document.getElementById('statTotalGuru').textContent = teachers.length || 0;
  document.getElementById('statTotalBerita').textContent = news.length || 0;
  document.getElementById('statTotalPrestasi').textContent = achievements.length || 0;

  renderAdminCharts(students, achievements);
}

// ================= CHART.JS CHARTS =================
function renderAdminCharts(students, achievements) {
  // 1. Chart Siswa per Tingkat Kelas
  const ctxSiswa = document.getElementById('chartSiswaPerTingkat')?.getContext('2d');
  if (ctxSiswa) {
    if (chartSiswaInstance) chartSiswaInstance.destroy();

    const countVII = students.filter(s => s.class.startsWith('VII')).length || 45;
    const countVIII = students.filter(s => s.class.startsWith('VIII')).length || 52;
    const countIX = students.filter(s => s.class.startsWith('IX')).length || 48;

    chartSiswaInstance = new Chart(ctxSiswa, {
      type: 'bar',
      data: {
        labels: ['Kelas VII', 'Kelas VIII', 'Kelas IX'],
        datasets: [{
          label: 'Jumlah Siswa Aktif',
          data: [countVII, countVIII, countIX],
          backgroundColor: ['#3b82f6', '#0d9488', '#f59e0b'],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 2. Chart Prestasi Tahunan (Line Chart)
  const ctxPrestasi = document.getElementById('chartPrestasiTahunan')?.getContext('2d');
  if (ctxPrestasi) {
    if (chartPrestasiInstance) chartPrestasiInstance.destroy();

    chartPrestasiInstance = new Chart(ctxPrestasi, {
      type: 'line',
      data: {
        labels: ['2023', '2024', '2025', '2026'],
        datasets: [{
          label: 'Jumlah Juara & Medali',
          data: [8, 14, 19, 24],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 3. Chart Rasio Kehadiran (Doughnut Chart)
  const ctxKehadiran = document.getElementById('chartRasioKehadiran')?.getContext('2d');
  if (ctxKehadiran) {
    if (chartKehadiranInstance) chartKehadiranInstance.destroy();

    chartKehadiranInstance = new Chart(ctxKehadiran, {
      type: 'doughnut',
      data: {
        labels: ['Hadir (96%)', 'Sakit (2%)', 'Izin (1.5%)', 'Alpa (0.5%)'],
        datasets: [{
          data: [96, 2, 1.5, 0.5],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        }
      }
    });
  }
}

// ================= MANAJEMEN BERITA =================
async function loadAdminNewsTable() {
  const tbody = document.getElementById('adminNewsTableBody');
  if (!tbody) return;

  const news = await DB.getNews();
  tbody.innerHTML = news.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${item.image || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=100'}" class="rounded" style="width: 44px; height: 44px; object-fit: cover;">
          <div>
            <div class="fw-bold text-dark">${escapeHtml(item.title)}</div>
            <small class="text-muted"><i class="bi bi-eye me-1"></i>${item.views || 0} kali dibaca</small>
          </div>
        </div>
      </td>
      <td><span class="badge ${getCategoryBadgeClass(item.category)}">${item.category}</span></td>
      <td>${item.date}</td>
      <td>${escapeHtml(item.author || 'Humas')}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteNewsItem('${item.id}')" title="Hapus">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteNewsItem(id) {
  if (confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
    await DB.deleteNews(id);
    await loadAdminNewsTable();
    await refreshAdminDashboard();
    alert("Berita berhasil dihapus.");
  }
}

// ================= MANAJEMEN PRESTASI =================
async function loadAdminAchievementsTable() {
  const tbody = document.getElementById('adminAchTableBody');
  if (!tbody) return;

  const achievements = await DB.getAchievements();
  tbody.innerHTML = achievements.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <div class="fw-bold text-dark">${escapeHtml(item.title)}</div>
        <small class="text-muted">${escapeHtml(item.winnerName)}</small>
      </td>
      <td><span class="badge bg-primary-subtle text-primary">${item.category}</span></td>
      <td><span class="badge bg-warning text-dark">${item.level}</span></td>
      <td>${item.year}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteAchItem('${item.id}')" title="Hapus">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteAchItem(id) {
  if (confirm("Hapus data prestasi ini?")) {
    await DB.deleteAchievement(id);
    await loadAdminAchievementsTable();
    await refreshAdminDashboard();
  }
}

// ================= MANAJEMEN GURU =================
async function loadAdminTeachersTable() {
  const tbody = document.getElementById('adminTeachersTableBody');
  if (!tbody) return;

  const teachers = await DB.getTeachers();
  tbody.innerHTML = teachers.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${item.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="rounded-circle" style="width: 38px; height: 38px; object-fit: cover;">
          <div>
            <div class="fw-bold text-dark">${escapeHtml(item.name)}</div>
            <small class="text-muted">NIP: ${escapeHtml(item.nip)}</small>
          </div>
        </div>
      </td>
      <td><span class="badge bg-info-subtle text-info">${escapeHtml(item.subject)}</span></td>
      <td>${escapeHtml(item.role || '-')}</td>
      <td>${escapeHtml(item.phone || '-')}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteTeacherItem('${item.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteTeacherItem(id) {
  if (confirm("Hapus data guru ini?")) {
    await DB.deleteTeacher(id);
    await loadAdminTeachersTable();
    await refreshAdminDashboard();
  }
}

// ================= MANAJEMEN SISWA =================
let allAdminStudentsCache = [];

async function loadAdminStudentsTable() {
  const tbody = document.getElementById('adminStudentsTableBody');
  if (!tbody) return;

  allAdminStudentsCache = await DB.getStudents();
  filterAdminStudentsTable();
}

function filterAdminStudentsTable() {
  const query = (document.getElementById('searchAdminStudentInput')?.value || '').toLowerCase().trim();
  const selectedClass = document.getElementById('filterAdminStudentClassSelect')?.value || 'all';
  const tbody = document.getElementById('adminStudentsTableBody');
  const countEl = document.getElementById('summaryAdminStudentCount');
  if (!tbody) return;

  const filtered = allAdminStudentsCache.filter(item => {
    const matchQuery = !query || 
      (item.name && item.name.toLowerCase().includes(query)) || 
      (item.nisn && item.nisn.toLowerCase().includes(query));
    
    const matchClass = (selectedClass === 'all') || (item.class === selectedClass);
    return matchQuery && matchClass;
  });

  if (countEl) {
    countEl.textContent = `Total: ${filtered.length} Siswa ${selectedClass !== 'all' ? `(Kelas ${selectedClass})` : 'Terdaftar'}`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4"><i class="bi bi-info-circle me-1"></i> Tidak ada data siswa yang cocok dengan kriteria pencarian/kelas.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>
        <div class="fw-bold text-dark">${escapeHtml(item.name)}</div>
        <small class="text-muted">NISN: ${escapeHtml(item.nisn)}</small>
      </td>
      <td><span class="badge bg-primary-subtle text-primary fw-bold">${escapeHtml(item.class)}</span></td>
      <td>${escapeHtml(item.gender)}</td>
      <td><span class="badge bg-success-subtle text-success">${item.attendanceRate || 95}%</span></td>
      <td><strong>${item.avgScore || 85}</strong></td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteStudentItem('${item.id}')" title="Hapus Siswa">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteStudentItem(id) {
  if (confirm("Hapus data siswa ini?")) {
    await DB.deleteStudent(id);
    await loadAdminStudentsTable();
    await refreshAdminDashboard();
  }
}

// ================= INITIALIZE FORMS =================
function initAdminForms() {
  // Tambah Berita
  const formNews = document.getElementById('formAddNews');
  formNews?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('newsTitle').value;
    const category = document.getElementById('newsCategory').value;
    const author = document.getElementById('newsAuthor').value || 'Humas SMPN 1 Segah';
    const image = document.getElementById('newsImage').value || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800';
    const excerpt = document.getElementById('newsExcerpt').value;
    const content = document.getElementById('newsContent').value;
    const date = new Date().toISOString().split('T')[0];

    await DB.addNews({ title, category, author, image, excerpt, content, date });
    bootstrap.Modal.getInstance(document.getElementById('modalAddNews'))?.hide();
    formNews.reset();
    await loadAdminNewsTable();
    await refreshAdminDashboard();
    alert("Berita baru berhasil diterbitkan!");
  });

  // Tambah Prestasi
  const formAch = document.getElementById('formAddAch');
  formAch?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('achTitle').value;
    const category = document.getElementById('achCategory').value;
    const level = document.getElementById('achLevel').value;
    const year = document.getElementById('achYear').value;
    const winnerName = document.getElementById('achWinner').value;
    const rank = document.getElementById('achRank').value;
    const image = document.getElementById('achImage').value || 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800';
    const description = document.getElementById('achDesc').value;

    await DB.addAchievement({ title, category, level, year, winnerName, rank, image, description });
    bootstrap.Modal.getInstance(document.getElementById('modalAddAch'))?.hide();
    formAch.reset();
    await loadAdminAchievementsTable();
    await refreshAdminDashboard();
    alert("Prestasi berhasil ditambahkan!");
  });

  // Tambah Guru
  const formTeacher = document.getElementById('formAddTeacher');
  formTeacher?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nip = document.getElementById('teacherNip').value;
    const name = document.getElementById('teacherName').value;
    const subject = document.getElementById('teacherSubject').value;
    const role = document.getElementById('teacherRole').value;
    const email = document.getElementById('teacherEmail').value;
    const phone = document.getElementById('teacherPhone').value;
    const photo = document.getElementById('teacherPhoto').value || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
    const education = document.getElementById('teacherEdu').value;

    await DB.addTeacher({ nip, name, subject, role, email, phone, photo, education });
    bootstrap.Modal.getInstance(document.getElementById('modalAddTeacher'))?.hide();
    formTeacher.reset();
    await loadAdminTeachersTable();
    await refreshAdminDashboard();
    alert("Data Guru berhasil ditambahkan!");
  });

  // Tambah Siswa
  const formStudent = document.getElementById('formAddStudent');
  formStudent?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nisn = document.getElementById('stdNisn').value;
    const name = document.getElementById('stdName').value;
    const stdClass = document.getElementById('stdClass').value;
    const gender = document.getElementById('stdGender').value;
    const email = document.getElementById('stdEmail').value;
    const phone = document.getElementById('stdPhone').value;
    const address = document.getElementById('stdAddress').value;

    await DB.addStudent({
      nisn,
      name,
      class: stdClass,
      gender,
      email,
      phone,
      address,
      attendanceRate: 100,
      avgScore: 85
    });
    bootstrap.Modal.getInstance(document.getElementById('modalAddStudent'))?.hide();
    formStudent.reset();
    await loadAdminStudentsTable();
    await refreshAdminDashboard();
    alert("Data Siswa berhasil ditambahkan!");
  });
}

// ================= MODAL FIREBASE SETTINGS =================
function initFirebaseSettingsModal() {
  const currentConfig = getActiveFirebaseConfig();
  const inputApiKey = document.getElementById('fbApiKey');
  const inputProjectId = document.getElementById('fbProjectId');
  const inputAuthDomain = document.getElementById('fbAuthDomain');
  const inputStorageBucket = document.getElementById('fbStorageBucket');
  const inputAppId = document.getElementById('fbAppId');

  if (inputApiKey) inputApiKey.value = currentConfig.apiKey || '';
  if (inputProjectId) inputProjectId.value = currentConfig.projectId || '';
  if (inputAuthDomain) inputAuthDomain.value = currentConfig.authDomain || '';
  if (inputStorageBucket) inputStorageBucket.value = currentConfig.storageBucket || '';
  if (inputAppId) inputAppId.value = currentConfig.appId || '';

  const formFb = document.getElementById('formFirebaseConfig');
  formFb?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newConfig = {
      apiKey: inputApiKey.value.trim(),
      projectId: inputProjectId.value.trim(),
      authDomain: inputAuthDomain.value.trim(),
      storageBucket: inputStorageBucket.value.trim(),
      appId: inputAppId.value.trim()
    };

    saveCustomFirebaseConfig(newConfig);
    alert("Konfigurasi Firebase berhasil disimpan! Halaman akan dimuat ulang untuk menghubungkan ke Firebase.");
    location.reload();
  });
}

// Sinkronisasi data lokal ke Firebase
async function syncToFirebaseCloud() {
  if (!confirm("Unggah seluruh data lokal (Berita, Prestasi, Guru, Siswa, Nilai) ke database Firebase Firestore?")) return;
  try {
    const btn = document.getElementById('btnSyncFirebase');
    if (btn) btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyinkronkan...`;
    await DB.syncAllToFirebase();
    alert("Selamat! Seluruh data berhasil tersinkronisasi ke Firebase Firestore.");
  } catch (err) {
    alert("Gagal sinkronisasi: " + err.message);
  } finally {
    const btn = document.getElementById('btnSyncFirebase');
    if (btn) btn.innerHTML = `<i class="bi bi-cloud-upload me-1"></i> Sinkronkan ke Firebase`;
  }
}

// Helper Utilities
function getCategoryBadgeClass(cat) {
  switch (cat?.toLowerCase()) {
    case 'prestasi': return 'bg-success';
    case 'pengumuman': return 'bg-danger';
    case 'kegiatan': return 'bg-info';
    default: return 'bg-primary';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ================= IMPORT & EKSPOR EXCEL GURU =================
let parsedTeachersFromExcel = [];

function initTeacherExcelImportHandlers() {
  const dropZone = document.getElementById('dropZoneExcelTeacher');
  const fileInput = document.getElementById('inputExcelTeacherFile');
  if (!dropZone || !fileInput) return;

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('border-primary', 'bg-white');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-primary', 'bg-white');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleTeacherExcelFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleTeacherExcelFile(e.target.files[0]);
    }
  });
}

function handleTeacherExcelFile(file) {
  const labelFile = document.getElementById('selectedTeacherFileName');
  const previewArea = document.getElementById('previewExcelTeacherArea');
  const tbody = document.getElementById('tbodyPreviewExcelTeacher');
  const countBadge = document.getElementById('badgeCountTeacherPreview');
  const btnExecute = document.getElementById('btnExecuteImportTeacher');

  if (labelFile) {
    labelFile.innerHTML = `<i class="bi bi-file-earmark-check-fill text-success me-1"></i> File terpilih: <strong>${escapeHtml(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      if (typeof XLSX === 'undefined') {
        throw new Error("Library SheetJS (XLSX) belum selesai dimuat. Pastikan koneksi internet aktif.");
      }

      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (rawRows.length === 0) {
        alert("File Excel kosong atau tidak memiliki data yang dapat dibaca.");
        return;
      }

      // Format dan sanitasi data guru
      parsedTeachersFromExcel = rawRows.map(row => {
        const nip = String(row.NIP || row.nip || row['No. Induk'] || row['Nomor Induk'] || '-').trim();
        const name = String(row.Nama || row.nama || row['Nama Lengkap'] || row['Nama Guru'] || row['Name'] || '').trim();
        const subject = String(row.Mapel || row.mapel || row['Mata Pelajaran'] || row.Subject || '-').trim();
        const role = String(row.Jabatan || row.jabatan || row.Role || row.Tugas || row['Jabatan / Tugas'] || 'Tenaga Pendidik').trim();
        const email = String(row.Email || row.email || '').trim();
        const phone = String(row['No HP'] || row['No. HP'] || row.Telepon || row.telepon || row.phone || row.HP || row['Nomor HP'] || '').trim();
        const education = String(row.Pendidikan || row.pendidikan || row.Education || 'S1 Pendidikan').trim();
        const photo = String(row.Foto || row.foto || row.Photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400').trim();

        return { nip, name, subject, role, email, phone, education, photo };
      }).filter(t => t.name.length > 0);

      if (parsedTeachersFromExcel.length === 0) {
        alert("Tidak ada baris data guru yang valid. Pastikan kolom 'Nama' atau 'Nama Lengkap' terisi.");
        return;
      }

      // Render ke tabel pratinjau
      if (tbody) {
        tbody.innerHTML = parsedTeachersFromExcel.map((t, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><code>${escapeHtml(t.nip)}</code></td>
            <td class="fw-bold text-dark">${escapeHtml(t.name)}</td>
            <td><span class="badge bg-primary-subtle text-primary">${escapeHtml(t.subject)}</span></td>
            <td>${escapeHtml(t.role)}</td>
            <td>${escapeHtml(t.email || '-')}</td>
            <td>${escapeHtml(t.phone || '-')}</td>
            <td><small>${escapeHtml(t.education)}</small></td>
          </tr>
        `).join('');
      }

      if (countBadge) {
        countBadge.textContent = `${parsedTeachersFromExcel.length} Baris Data Ditemukan`;
      }
      previewArea?.classList.remove('d-none');
      if (btnExecute) btnExecute.disabled = false;

    } catch (err) {
      console.error("Gagal membaca Excel:", err);
      alert("Terjadi kesalahan saat memproses file Excel: " + err.message);
    }
  };

  reader.readAsArrayBuffer(file);
}

// Eksekusi Simpan Data Import ke Database
async function executeTeacherImport() {
  if (parsedTeachersFromExcel.length === 0) {
    alert("Tidak ada data guru yang siap diimpor.");
    return;
  }

  const mode = document.querySelector('input[name="importTeacherMode"]:checked')?.value || 'append';
  const btn = document.getElementById('btnExecuteImportTeacher');
  const originalText = btn.innerHTML;
  const countImported = parsedTeachersFromExcel.length;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan Data...`;

  try {
    await DB.addTeachersBatch(parsedTeachersFromExcel, mode);

    // Refresh Tampilan
    await loadAdminTeachersTable();
    await refreshAdminDashboard();

    // Tutup Modal
    const modalEl = document.getElementById('modalImportExcelTeacher');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();

    // Reset Form Modal
    parsedTeachersFromExcel = [];
    const fileInput = document.getElementById('inputExcelTeacherFile');
    if (fileInput) fileInput.value = '';
    const labelFile = document.getElementById('selectedTeacherFileName');
    if (labelFile) labelFile.innerHTML = '';
    document.getElementById('previewExcelTeacherArea')?.classList.add('d-none');
    btn.disabled = true;

    alert(`Selamat! Sebanyak ${countImported} data guru berhasil diimpor ke dalam database ${mode === 'replace' ? '(seluruh data guru sebelumnya telah diperbarui)' : ''}.`);
  } catch (err) {
    alert("Gagal mengimpor data: " + err.message);
  } finally {
    btn.innerHTML = originalText;
  }
}

// Unduh Format Template Excel (.xlsx)
function downloadTeacherExcelTemplate() {
  if (typeof XLSX === 'undefined') {
    alert("Library SheetJS sedang dimuat, silakan coba sesaat lagi.");
    return;
  }

  const sampleData = [
    {
      NIP: "19830514 200801 1 009",
      Nama: "Bambang Sutrisno, S.Pd",
      Mapel: "Matematika",
      Jabatan: "Waka Kurikulum / Wali Kelas VIII-A",
      Email: "bambang.sutrisno@smpn1segah.sch.id",
      "No HP": "0813-4712-3456",
      Pendidikan: "S1 Pendidikan Matematika (UNY)"
    },
    {
      NIP: "19850720 201001 2 018",
      Nama: "Siti Rahmawati, M.Pd",
      Mapel: "Bahasa Indonesia",
      Jabatan: "Wali Kelas VII-A",
      Email: "siti.rahmawati@smpn1segah.sch.id",
      "No HP": "0821-5088-7744",
      Pendidikan: "S2 Pendidikan Bahasa Indonesia"
    },
    {
      NIP: "19890918 201402 1 005",
      Nama: "Ahmad Fauzi, S.Si",
      Mapel: "IPA",
      Jabatan: "Pembina OSN Sains",
      Email: "ahmad.fauzi@smpn1segah.sch.id",
      "No HP": "0852-4411-2233",
      Pendidikan: "S1 Biologi MIPA"
    },
    {
      NIP: "19940810 202012 2 015",
      Nama: "Nurul Hidayah, S.Kom",
      Mapel: "Informatika",
      Jabatan: "Kepala Lab Komputer",
      Email: "nurul.hidayah@smpn1segah.sch.id",
      "No HP": "0822-3344-5566",
      Pendidikan: "S1 Teknik Informatika"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  ws['!cols'] = [
    { wch: 25 },
    { wch: 28 },
    { wch: 20 },
    { wch: 35 },
    { wch: 32 },
    { wch: 18 },
    { wch: 32 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Format Data Guru");
  XLSX.writeFile(wb, "Format_Import_Guru_SMPN1_Segah.xlsx");
}

// Ekspor Data Guru Aktif ke File Excel
async function exportTeacherToExcel() {
  if (typeof XLSX === 'undefined') {
    alert("Library SheetJS sedang dimuat, silakan coba sesaat lagi.");
    return;
  }

  const teachers = await DB.getTeachers();
  if (teachers.length === 0) {
    alert("Belum ada data guru untuk diekspor.");
    return;
  }

  const exportData = teachers.map((t, idx) => ({
    No: idx + 1,
    NIP: t.nip || '-',
    "Nama Lengkap": t.name || '-',
    "Mata Pelajaran": t.subject || '-',
    "Jabatan / Tugas": t.role || '-',
    Email: t.email || '-',
    "Nomor HP / WhatsApp": t.phone || '-',
    "Pendidikan Terakhir": t.education || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 28 },
    { wch: 22 },
    { wch: 32 },
    { wch: 30 },
    { wch: 18 },
    { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Guru SMPN 1 Segah");
  XLSX.writeFile(wb, "Data_Guru_SMPN1_Segah_2026.xlsx");
}

// ================= IMPORT & EKSPOR EXCEL SISWA =================
let parsedStudentsFromExcel = [];

function initStudentExcelImportHandlers() {
  const dropZone = document.getElementById('dropZoneExcelStudent');
  const fileInput = document.getElementById('inputExcelStudentFile');
  if (!dropZone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('border-primary', 'bg-white');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-primary', 'bg-white');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleStudentExcelFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleStudentExcelFile(e.target.files[0]);
    }
  });
}

function handleStudentExcelFile(file) {
  const labelFile = document.getElementById('selectedStudentFileName');
  const previewArea = document.getElementById('previewExcelStudentArea');
  const tbody = document.getElementById('tbodyPreviewExcelStudent');
  const countBadge = document.getElementById('badgeCountStudentPreview');
  const btnExecute = document.getElementById('btnExecuteImportStudent');

  if (labelFile) {
    labelFile.innerHTML = `<i class="bi bi-file-earmark-check-fill text-primary me-1"></i> File terpilih: <strong>${escapeHtml(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      if (typeof XLSX === 'undefined') {
        throw new Error("Library SheetJS (XLSX) belum selesai dimuat. Pastikan koneksi internet aktif.");
      }

      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (rawRows.length === 0) {
        alert("File Excel kosong atau tidak memiliki data yang dapat dibaca.");
        return;
      }

      // Format dan sanitasi data siswa
      parsedStudentsFromExcel = rawRows.map(row => {
        const nisn = String(row.NISN || row.nisn || row['No. NISN'] || row['Nomor NISN'] || '-').trim();
        const nis = String(row.NIS || row.nis || '').trim();
        const name = String(row.Nama || row.nama || row['Nama Lengkap'] || row['Nama Siswa'] || row['Name'] || '').trim();
        let stdClass = String(row.Kelas || row.kelas || row.Class || 'VII-A').trim().toUpperCase();
        if (!stdClass.includes('-') && stdClass.length >= 3) {
          stdClass = stdClass.replace(/(VII|VIII|IX)([A-Z])/i, '$1-$2');
        }
        
        let gender = String(row['Jenis Kelamin'] || row.gender || row.Gender || row.JK || row.jk || 'Laki-laki').trim();
        if (gender.toUpperCase() === 'L' || gender.toUpperCase().startsWith('LAKI')) gender = 'Laki-laki';
        else if (gender.toUpperCase() === 'P' || gender.toUpperCase().startsWith('PEREMPUAN')) gender = 'Perempuan';

        const email = String(row.Email || row.email || '').trim();
        const phone = String(row['No HP'] || row['No. HP'] || row.Telepon || row.telepon || row.phone || row.HP || row['Nomor HP'] || '').trim();
        const address = String(row.Alamat || row.alamat || row.Address || 'Kec. Segah, Berau').trim();
        const birthPlaceDate = String(row.TTL || row.ttl || row['Tempat Tanggal Lahir'] || 'Berau, 2011').trim();
        const parentName = String(row['Nama Orang Tua'] || row['Orang Tua'] || row.Wali || row['Nama Wali'] || '-').trim();
        const attendanceRate = Number(row.Kehadiran || row['Tingkat Kehadiran'] || 100);
        const avgScore = Number(row['Nilai Rata-rata'] || row.Nilai || row['Rata-rata'] || 85);

        return { nisn, nis, name, class: stdClass, gender, email, phone, address, birthPlaceDate, parentName, attendanceRate, avgScore };
      }).filter(s => s.name.length > 0);

      if (parsedStudentsFromExcel.length === 0) {
        alert("Tidak ada baris data siswa yang valid. Pastikan kolom 'Nama' atau 'Nama Siswa' terisi.");
        return;
      }

      // Render ke tabel pratinjau
      if (tbody) {
        tbody.innerHTML = parsedStudentsFromExcel.map((s, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><code>${escapeHtml(s.nisn)}</code></td>
            <td class="fw-bold text-dark">${escapeHtml(s.name)}</td>
            <td><span class="badge bg-primary-subtle text-primary">${escapeHtml(s.class)}</span></td>
            <td>${escapeHtml(s.gender)}</td>
            <td>${escapeHtml(s.phone || '-')}</td>
            <td>${escapeHtml(s.parentName)}</td>
          </tr>
        `).join('');
      }

      if (countBadge) {
        countBadge.textContent = `${parsedStudentsFromExcel.length} Siswa Siap Diimpor`;
      }
      previewArea?.classList.remove('d-none');
      if (btnExecute) btnExecute.disabled = false;

    } catch (err) {
      console.error("Gagal membaca Excel siswa:", err);
      alert("Terjadi kesalahan saat memproses file Excel: " + err.message);
    }
  };

  reader.readAsArrayBuffer(file);
}

// Eksekusi Simpan Data Import Siswa ke Database
async function executeStudentImport() {
  if (parsedStudentsFromExcel.length === 0) {
    alert("Tidak ada data siswa yang siap diimpor.");
    return;
  }

  const mode = document.querySelector('input[name="importStudentMode"]:checked')?.value || 'append';
  const btn = document.getElementById('btnExecuteImportStudent');
  const originalText = btn.innerHTML;
  const countImported = parsedStudentsFromExcel.length;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan Data...`;

  try {
    await DB.addStudentsBatch(parsedStudentsFromExcel, mode);

    // Refresh Tampilan Siswa & Charts
    await loadAdminStudentsTable();
    await refreshAdminDashboard();

    // Tutup Modal
    const modalEl = document.getElementById('modalImportExcelStudent');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();

    // Reset Form Modal
    parsedStudentsFromExcel = [];
    const fileInput = document.getElementById('inputExcelStudentFile');
    if (fileInput) fileInput.value = '';
    const labelFile = document.getElementById('selectedStudentFileName');
    if (labelFile) labelFile.innerHTML = '';
    document.getElementById('previewExcelStudentArea')?.classList.add('d-none');
    btn.disabled = true;

    alert(`Selamat! Sebanyak ${countImported} data peserta didik berhasil diimpor ke dalam database ${mode === 'replace' ? '(seluruh data siswa sebelumnya telah digantikan)' : ''}.`);
  } catch (err) {
    alert("Gagal mengimpor data siswa: " + err.message);
  } finally {
    btn.innerHTML = originalText;
  }
}

// Unduh Format Template Excel Siswa (.xlsx)
function downloadStudentExcelTemplate() {
  if (typeof XLSX === 'undefined') {
    alert("Library SheetJS sedang dimuat, silakan coba sesaat lagi.");
    return;
  }

  const sampleStudents = [
    {
      NISN: "0098765432",
      Nama: "Muhammad Rizky",
      Kelas: "VIII-A",
      "Jenis Kelamin": "Laki-laki",
      Email: "siswa@smpn1segah.sch.id",
      "No HP": "0821-9988-7711",
      Alamat: "Jl. Poros Segah RT 03, Kec. Segah",
      TTL: "Berau, 12 Mei 2011",
      "Nama Orang Tua": "H. Sukardi"
    },
    {
      NISN: "0098765437",
      Nama: "Nabila Syakieb",
      Kelas: "VII-A",
      "Jenis Kelamin": "Perempuan",
      Email: "nabila.syakieb@smpn1segah.sch.id",
      "No HP": "0821-9988-7716",
      Alamat: "Desa Bukit Makmur, Kec. Segah",
      TTL: "Berau, 18 Januari 2012",
      "Nama Orang Tua": "Mahmud"
    },
    {
      NISN: "0098765443",
      Nama: "Gita Gutawa Putri",
      Kelas: "VII-G",
      "Jenis Kelamin": "Perempuan",
      Email: "gita.putri@smpn1segah.sch.id",
      "No HP": "0821-9988-7722",
      Alamat: "Desa Batu Rajang, Kec. Segah",
      TTL: "Tanjung Redeb, 08 Juli 2012",
      "Nama Orang Tua": "Kurnia Sandi"
    },
    {
      NISN: "0098765444",
      Nama: "Gilang Ramadhan",
      Kelas: "VIII-C",
      "Jenis Kelamin": "Laki-laki",
      Email: "gilang.ramadhan@smpn1segah.sch.id",
      "No HP": "0821-9988-7723",
      Alamat: "Jl. Pendidikan No. 8 Segah",
      TTL: "Segah, 17 Agustus 2011",
      "Nama Orang Tua": "Agus Salim"
    },
    {
      NISN: "0098765436",
      Nama: "Fajar Ramadhan",
      Kelas: "IX-A",
      "Jenis Kelamin": "Laki-laki",
      Email: "fajar.ramadhan@smpn1segah.sch.id",
      "No HP": "0821-9988-7715",
      Alamat: "Jl. Poros Segah RT 01",
      TTL: "Segah, 03 Oktober 2010",
      "Nama Orang Tua": "Rahmat"
    },
    {
      NISN: "0098765454",
      Nama: "Qori Sandioriva",
      Kelas: "IX-G",
      "Jenis Kelamin": "Perempuan",
      Email: "qori.sandioriva@smpn1segah.sch.id",
      "No HP": "0821-9988-7733",
      Alamat: "Desa Bukit Makmur, Kec. Segah",
      TTL: "Tanjung Redeb, 03 Juli 2010",
      "Nama Orang Tua": "Mansyur"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleStudents);
  ws['!cols'] = [
    { wch: 16 }, // NISN
    { wch: 28 }, // Nama
    { wch: 12 }, // Kelas
    { wch: 16 }, // Jenis Kelamin
    { wch: 30 }, // Email
    { wch: 18 }, // No HP
    { wch: 36 }, // Alamat
    { wch: 26 }, // TTL
    { wch: 24 }  // Nama Orang Tua
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Format Data Siswa");
  XLSX.writeFile(wb, "Format_Import_Siswa_SMPN1_Segah.xlsx");
}

// Ekspor Seluruh Data Siswa Aktif ke File Excel
async function exportStudentToExcel() {
  if (typeof XLSX === 'undefined') {
    alert("Library SheetJS sedang dimuat, silakan coba sesaat lagi.");
    return;
  }

  const students = await DB.getStudents();
  if (students.length === 0) {
    alert("Belum ada data siswa untuk diekspor.");
    return;
  }

  const exportData = students.map((s, idx) => ({
    No: idx + 1,
    NISN: s.nisn || '-',
    NIS: s.nis || '-',
    "Nama Lengkap": s.name || '-',
    Kelas: s.class || '-',
    "Jenis Kelamin": s.gender || '-',
    Email: s.email || '-',
    "Nomor HP / WA": s.phone || '-',
    Alamat: s.address || '-',
    "Tempat Tanggal Lahir": s.birthPlaceDate || '-',
    "Nama Orang Tua": s.parentName || '-',
    "Kehadiran (%)": (s.attendanceRate || 100) + '%',
    "Nilai Rata-rata": s.avgScore || 85
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 12 },
    { wch: 28 },
    { wch: 12 },
    { wch: 16 },
    { wch: 28 },
    { wch: 18 },
    { wch: 35 },
    { wch: 25 },
    { wch: 22 },
    { wch: 15 },
    { wch: 15 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Siswa SMPN 1 Segah");
  XLSX.writeFile(wb, "Data_Siswa_SMPN1_Segah_2026.xlsx");
}

// ================= MANAJEMEN AKUN & PASSWORD SISWA =================
let allStudentAccountsCache = [];
let areAllPasswordsVisible = false;

async function loadAdminStudentAccountsTable() {
  const tbody = document.getElementById('adminStudentAccountsTableBody');
  const countEl = document.getElementById('summaryAccountCount');
  const selectStudent = document.getElementById('selectExistingStudentForAccount');
  if (!tbody) return;

  allStudentAccountsCache = await DB.getStudentAccounts();
  const students = await DB.getStudents();

  // Isi dropdown siswa pada modal tambah akun
  if (selectStudent) {
    selectStudent.innerHTML = `<option value="">-- Pilih Siswa atau Isi Manual --</option>` + 
      students.map(s => `<option value="${s.id}" data-nisn="${s.nisn}" data-name="${escapeHtml(s.name)}" data-class="${s.class}" data-email="${s.email || ''}">
        ${escapeHtml(s.name)} (${s.class}) - NISN: ${s.nisn}
      </option>`).join('');
  }

  renderStudentAccountsTable(allStudentAccountsCache);

  if (countEl) {
    countEl.textContent = `Total: ${allStudentAccountsCache.length} Akun Terdaftar`;
  }
}

function renderStudentAccountsTable(accounts) {
  const tbody = document.getElementById('adminStudentAccountsTableBody');
  if (!tbody) return;

  if (accounts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Belum ada akun siswa yang terdaftar. Klik "Generate Akun Otomatis" atau "Buat Akun Baru".</td></tr>`;
    return;
  }

  tbody.innerHTML = accounts.map((acc, idx) => {
    const isMasked = !areAllPasswordsVisible;
    const maskedPwd = '••••••••';
    const rawPwd = acc.password || 'siswa123';

    return `
      <tr data-account-id="${acc.id}" data-class="${acc.class}" data-status="${acc.status}">
        <td>${idx + 1}</td>
        <td>
          <div class="fw-bold text-dark">${escapeHtml(acc.name)}</div>
          <small class="text-muted font-monospace">NISN: ${escapeHtml(acc.nisn)}</small>
        </td>
        <td><span class="badge bg-primary-subtle text-primary">${escapeHtml(acc.class)}</span></td>
        <td>
          <div class="small fw-semibold text-dark">${escapeHtml(acc.username || acc.nisn)}</div>
          <small class="text-muted">${escapeHtml(acc.email || '-')}</small>
        </td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span class="font-monospace fw-bold pwd-display-text ${isMasked ? 'text-muted' : 'text-primary'}" data-password="${escapeHtml(rawPwd)}">
              ${isMasked ? maskedPwd : escapeHtml(rawPwd)}
            </span>
            <button type="button" class="btn btn-sm btn-link p-0 text-secondary" onclick="toggleSinglePasswordRow(this, '${escapeHtml(rawPwd)}')" title="Lihat Password">
              <i class="bi ${isMasked ? 'bi-eye' : 'bi-eye-slash'}"></i>
            </button>
            <button type="button" class="btn btn-sm btn-link p-0 text-secondary" onclick="copyPasswordToClipboard('${escapeHtml(rawPwd)}')" title="Salin Password">
              <i class="bi bi-clipboard"></i>
            </button>
          </div>
        </td>
        <td>
          <span class="badge ${acc.status === 'Aktif' ? 'bg-success' : 'bg-secondary'}">
            ${acc.status || 'Aktif'}
          </span>
        </td>
        <td><small class="text-muted">${acc.lastLogin || '-'}</small></td>
        <td class="text-center">
          <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-primary" onclick="openEditStudentPasswordModal('${acc.id}')" title="Ubah Password">
              <i class="bi bi-key-fill"></i>
            </button>
            <button type="button" class="btn btn-outline-warning text-dark" onclick="resetStudentPasswordToDefault('${acc.id}', '${escapeHtml(acc.name)}')" title="Reset ke siswa123">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="toggleStudentAccountStatusAction('${acc.id}')" title="Aktif/Nonaktifkan">
              <i class="bi ${acc.status === 'Aktif' ? 'bi-toggle-on text-success' : 'bi-toggle-off'}"></i>
            </button>
            <button type="button" class="btn btn-outline-danger" onclick="deleteStudentAccountAction('${acc.id}', '${escapeHtml(acc.name)}')" title="Hapus Akun">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle lihat 1 password di baris tabel
function toggleSinglePasswordRow(btn, realPassword) {
  const span = btn.parentElement.querySelector('.pwd-display-text');
  const icon = btn.querySelector('i');
  if (span.textContent.trim() === '••••••••') {
    span.textContent = realPassword;
    span.classList.remove('text-muted');
    span.classList.add('text-primary');
    icon.className = 'bi bi-eye-slash';
  } else {
    span.textContent = '••••••••';
    span.classList.add('text-muted');
    span.classList.remove('text-primary');
    icon.className = 'bi bi-eye';
  }
}

// Toggle lihat semua password
function toggleShowAllStudentPasswords() {
  areAllPasswordsVisible = !areAllPasswordsVisible;
  const btn = document.getElementById('btnToggleAllPasswords');
  if (btn) {
    btn.innerHTML = areAllPasswordsVisible ? 
      `<i class="bi bi-eye-slash me-1"></i> Sembunyikan Semua Password` : 
      `<i class="bi bi-eye me-1"></i> Lihat Semua Password`;
  }
  filterStudentAccountsTable();
}

// Salin Password ke Clipboard
function copyPasswordToClipboard(pwd) {
  navigator.clipboard.writeText(pwd).then(() => {
    alert("Kata sandi berhasil disalin: " + pwd);
  }).catch(() => {
    prompt("Salin password berikut:", pwd);
  });
}

// Filter Tabel Akun Siswa
function filterStudentAccountsTable() {
  const query = (document.getElementById('searchStudentAccountInput')?.value || '').toLowerCase();
  const selectedClass = document.getElementById('filterClassAccountSelect')?.value || 'all';
  const selectedStatus = document.getElementById('filterStatusAccountSelect')?.value || 'all';

  const filtered = allStudentAccountsCache.filter(acc => {
    const matchQuery = !query || 
      acc.name.toLowerCase().includes(query) || 
      acc.nisn.toLowerCase().includes(query) || 
      (acc.username && acc.username.toLowerCase().includes(query)) ||
      (acc.email && acc.email.toLowerCase().includes(query));

    const matchClass = (selectedClass === 'all') || (acc.class === selectedClass);
    const matchStatus = (selectedStatus === 'all') || (acc.status === selectedStatus);

    return matchQuery && matchClass && matchStatus;
  });

  renderStudentAccountsTable(filtered);
}

// Event form dan modal akun siswa
function initStudentAccountForms() {
  // Form Buat Akun Siswa
  const formAdd = document.getElementById('formAddStudentAccount');
  formAdd?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nisn = document.getElementById('accStdNisn').value.trim();
    const name = document.getElementById('accStdName').value.trim();
    const stdClass = document.getElementById('accStdClass').value;
    const username = document.getElementById('accStdUsername').value.trim() || nisn;
    const email = document.getElementById('accStdEmail').value.trim() || `${nisn}@smpn1segah.sch.id`;
    const password = document.getElementById('accStdPassword').value.trim() || 'siswa123';
    const status = document.getElementById('accStdStatus').value;
    const studentId = document.getElementById('selectExistingStudentForAccount').value || '';

    await DB.saveStudentAccount({
      studentId,
      nisn,
      name,
      class: stdClass,
      username,
      email,
      password,
      status,
      createdAt: new Date().toISOString().split('T')[0]
    });

    bootstrap.Modal.getInstance(document.getElementById('modalAddStudentAccount'))?.hide();
    formAdd.reset();
    await loadAdminStudentAccountsTable();
    alert(`Akun portal untuk ${name} (Password: ${password}) berhasil disimpan! Siswa dapat langsung login.`);
  });

  // Form Edit Password Siswa
  const formEditPwd = document.getElementById('formEditStudentPassword');
  formEditPwd?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const accountId = document.getElementById('editPasswordAccountId').value;
    const newPassword = document.getElementById('inputNewStudentPassword').value.trim();

    if (!newPassword) {
      alert("Kata sandi baru tidak boleh kosong.");
      return;
    }

    try {
      await DB.updateStudentPassword(accountId, newPassword);
      bootstrap.Modal.getInstance(document.getElementById('modalEditStudentPassword'))?.hide();
      await loadAdminStudentAccountsTable();
      alert(`Kata sandi berhasil diperbarui menjadi: "${newPassword}". Siswa dapat langsung menggunakannya untuk login.`);
    } catch (err) {
      alert("Gagal mengubah password: " + err.message);
    }
  });
}

// Buka Modal Edit Password
function openEditStudentPasswordModal(accountId) {
  const acc = allStudentAccountsCache.find(a => a.id === accountId);
  if (!acc) return;

  document.getElementById('editPasswordAccountId').value = acc.id;
  document.getElementById('editPasswordStudentName').textContent = acc.name;
  document.getElementById('editPasswordStudentClass').textContent = acc.class;
  document.getElementById('editPasswordStudentNisn').textContent = acc.nisn;
  document.getElementById('editPasswordStudentUsername').textContent = acc.username || acc.nisn;
  document.getElementById('inputNewStudentPassword').value = acc.password || 'siswa123';

  const modal = new bootstrap.Modal(document.getElementById('modalEditStudentPassword'));
  modal.show();
}

// Reset Password ke Default
async function resetStudentPasswordToDefault(accountId, studentName) {
  if (confirm(`Reset kata sandi akun ${studentName} ke default ("siswa123")?`)) {
    await DB.updateStudentPassword(accountId, "siswa123");
    await loadAdminStudentAccountsTable();
    alert(`Kata sandi ${studentName} berhasil direset menjadi "siswa123".`);
  }
}

// Toggle Status Aktif/Nonaktif
async function toggleStudentAccountStatusAction(accountId) {
  const updated = await DB.toggleStudentAccountStatus(accountId);
  await loadAdminStudentAccountsTable();
  alert(`Status akun ${updated.name} diubah menjadi: ${updated.status}.`);
}

// Hapus Akun Siswa
async function deleteStudentAccountAction(accountId, studentName) {
  if (confirm(`Hapus kredensial login untuk ${studentName}? (Siswa tidak akan dapat login sampai dibuatkan akun kembali)`)) {
    await DB.deleteStudentAccount(accountId);
    await loadAdminStudentAccountsTable();
    alert(`Akun siswa ${studentName} telah dihapus.`);
  }
}

// Generate Akun Otomatis dari Data Siswa
async function autoGenerateAllStudentAccounts() {
  if (!confirm("Otomatis buatkan akun portal & password untuk semua siswa di database yang belum memiliki akun?")) return;
  const result = await DB.autoGenerateStudentAccounts();
  await loadAdminStudentAccountsTable();
  if (result.generatedCount > 0) {
    alert(`Berhasil membuat ${result.generatedCount} akun siswa baru! Total akun sekarang: ${result.totalAccounts}. Password dibuat otomatis dengan format siswa[4-digit-nisn] atau siswa123.`);
  } else {
    alert(`Semua siswa (${result.totalAccounts} siswa) telah memiliki akun portal aktif.`);
  }
}

// Otomatis isi form saat pilih siswa di modal tambah akun
function fillStudentAccountFormFromSelect(studentId) {
  if (!studentId) return;
  const select = document.getElementById('selectExistingStudentForAccount');
  const opt = select.options[select.selectedIndex];
  if (!opt) return;

  const nisn = opt.getAttribute('data-nisn') || '';
  const name = opt.getAttribute('data-name') || '';
  const stdClass = opt.getAttribute('data-class') || 'VII-A';
  const email = opt.getAttribute('data-email') || `${nisn}@smpn1segah.sch.id`;

  document.getElementById('accStdNisn').value = nisn;
  document.getElementById('accStdName').value = name;
  document.getElementById('accStdClass').value = stdClass;
  document.getElementById('accStdUsername').value = nisn;
  document.getElementById('accStdEmail').value = email;
}

// Acak Password Generator
function generateRandomPassword(targetInputId) {
  const words = ['segah', 'berau', 'cendekia', 'cerdas', 'kaltim', 'juara', 'hebat'];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const pass = randomWord + randomNum;
  const target = document.getElementById(targetInputId);
  if (target) target.value = pass;
}

// Ekspor Akun Siswa & Password ke Excel
async function exportStudentAccountsToExcel() {
  if (typeof XLSX === 'undefined') {
    alert("Library SheetJS sedang dimuat, silakan coba sesaat lagi.");
    return;
  }

  const accounts = await DB.getStudentAccounts();
  if (accounts.length === 0) {
    alert("Belum ada data akun siswa untuk diekspor.");
    return;
  }

  const exportData = accounts.map((a, idx) => ({
    No: idx + 1,
    NISN: a.nisn || '-',
    "Nama Siswa": a.name || '-',
    Kelas: a.class || '-',
    "Username Login": a.username || a.nisn || '-',
    "Email Login": a.email || '-',
    "Kata Sandi (Password)": a.password || 'siswa123',
    Status: a.status || 'Aktif',
    "Login Terakhir": a.lastLogin || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 28 },
    { wch: 12 },
    { wch: 18 },
    { wch: 30 },
    { wch: 22 },
    { wch: 12 },
    { wch: 18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Kredensial Akun Siswa");
  XLSX.writeFile(wb, "Data_Akun_Password_Siswa_SMPN1_Segah.xlsx");
}

// ================= IMPORT EXCEL AKUN SISWA =================
let parsedStudentAccountsFromExcel = [];

function initStudentAccountExcelImportHandlers() {
  const dropZone = document.getElementById('dropZoneExcelStudentAccount');
  const fileInput = document.getElementById('inputExcelStudentAccountFile');
  if (!dropZone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('border-warning', 'bg-white');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-warning', 'bg-white');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleStudentAccountExcelFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleStudentAccountExcelFile(e.target.files[0]);
    }
  });
}

function handleStudentAccountExcelFile(file) {
  const labelFile = document.getElementById('selectedStudentAccountFileName');
  const previewArea = document.getElementById('previewExcelStudentAccountArea');
  const tbody = document.getElementById('tbodyPreviewExcelStudentAccount');
  const countBadge = document.getElementById('badgeCountStudentAccountPreview');
  const btnExecute = document.getElementById('btnExecuteImportStudentAccount');

  if (labelFile) {
    labelFile.innerHTML = `<i class="bi bi-file-earmark-check me-1"></i> Berkas terpilih: <strong>${escapeHtml(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData || jsonData.length === 0) {
        alert("File Excel kosong atau tidak terbaca.");
        return;
      }

      parsedStudentAccountsFromExcel = jsonData.map((row) => {
        const nisn = String(row.NISN || row.nisn || row.Nisn || '').trim();
        const name = String(row['Nama Siswa'] || row.Nama || row.nama || row.Name || 'Siswa').trim();
        let stdClass = String(row.Kelas || row.kelas || row.Class || 'VII-A').trim().toUpperCase();
        const username = String(row['Username Login'] || row.Username || row.username || nisn).trim();
        const email = String(row['Email Login'] || row.Email || row.email || (nisn ? `${nisn}@smpn1segah.sch.id` : '')).trim();
        const password = String(row['Kata Sandi (Password)'] || row['Kata Sandi'] || row.Password || row.password || 'siswa123').trim();
        let status = String(row.Status || row.status || 'Aktif').trim();
        if (status.toLowerCase() === 'nonaktif') status = 'Nonaktif';
        else status = 'Aktif';

        return { nisn, name, class: stdClass, username, email, password, status };
      }).filter(a => a.name.length > 0 || a.nisn.length > 0 || a.username.length > 0);

      if (parsedStudentAccountsFromExcel.length === 0) {
        alert("Tidak ada baris data akun siswa yang valid. Pastikan kolom NISN atau Nama terisi.");
        return;
      }

      // Render pratinjau tabel
      if (tbody) {
        tbody.innerHTML = parsedStudentAccountsFromExcel.map((a, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><code>${escapeHtml(a.nisn)}</code></td>
            <td class="fw-bold text-dark">${escapeHtml(a.name)}</td>
            <td><span class="badge bg-primary-subtle text-primary">${escapeHtml(a.class)}</span></td>
            <td><code>${escapeHtml(a.username)}</code></td>
            <td>${escapeHtml(a.email)}</td>
            <td class="font-monospace fw-bold text-warning-emphasis">${escapeHtml(a.password)}</td>
            <td><span class="badge ${a.status === 'Aktif' ? 'bg-success' : 'bg-secondary'}">${escapeHtml(a.status)}</span></td>
          </tr>
        `).join('');
      }

      if (countBadge) {
        countBadge.textContent = `${parsedStudentAccountsFromExcel.length} Akun Siap Diimpor`;
      }
      previewArea?.classList.remove('d-none');
      if (btnExecute) btnExecute.disabled = false;

    } catch (err) {
      console.error("Gagal membaca Excel akun siswa:", err);
      alert("Terjadi kesalahan saat memproses file Excel: " + err.message);
    }
  };

  reader.readAsArrayBuffer(file);
}

// Eksekusi Simpan Data Import Akun Siswa ke Database
async function executeStudentAccountImport() {
  if (parsedStudentAccountsFromExcel.length === 0) {
    alert("Tidak ada data akun siswa yang siap diimpor.");
    return;
  }

  const mode = document.querySelector('input[name="importStudentAccountMode"]:checked')?.value || 'append';
  const btn = document.getElementById('btnExecuteImportStudentAccount');
  const originalText = btn.innerHTML;
  const countImported = parsedStudentAccountsFromExcel.length;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan Akun...`;

  try {
    const result = await DB.addStudentAccountsBatch(parsedStudentAccountsFromExcel, mode);

    // Refresh tabel akun siswa
    await loadAdminStudentAccountsTable();

    // Tutup modal
    const modalEl = document.getElementById('modalImportExcelStudentAccount');
    bootstrap.Modal.getInstance(modalEl)?.hide();

    // Reset formulir & preview
    parsedStudentAccountsFromExcel = [];
    const fileInput = document.getElementById('inputExcelStudentAccountFile');
    if (fileInput) fileInput.value = '';
    const labelFile = document.getElementById('selectedStudentAccountFileName');
    if (labelFile) labelFile.innerHTML = '';
    document.getElementById('previewExcelStudentAccountArea')?.classList.add('d-none');
    btn.disabled = true;

    alert(`Selamat! Sebanyak ${countImported} akun siswa berhasil diimpor & disimpan ke database ${mode === 'replace' ? '(seluruh akun siswa lama telah digantikan)' : '(akun baru ditambahkan dan password akun lama diperbarui)'}. Siswa dapat langsung login menggunakan NISN/Username dan kata sandi baru!`);
  } catch (err) {
    alert("Gagal mengimpor akun siswa: " + err.message);
  } finally {
    btn.innerHTML = originalText;
  }
}

// Unduh Format Template Excel Akun Siswa (.xlsx)
function downloadStudentAccountExcelTemplate() {
  if (typeof XLSX === 'undefined') {
    alert("Library SheetJS sedang dimuat, silakan coba sesaat lagi.");
    return;
  }

  const sampleAccounts = [
    {
      NISN: "0098765432",
      "Nama Siswa": "Muhammad Rizky",
      Kelas: "VIII-A",
      "Username Login": "0098765432",
      "Email Login": "siswa@smpn1segah.sch.id",
      "Kata Sandi (Password)": "siswa123",
      Status: "Aktif"
    },
    {
      NISN: "0098765437",
      "Nama Siswa": "Nabila Syakieb",
      Kelas: "VII-A",
      "Username Login": "0098765437",
      "Email Login": "nabila.syakieb@smpn1segah.sch.id",
      "Kata Sandi (Password)": "siswa123",
      Status: "Aktif"
    },
    {
      NISN: "0098765443",
      "Nama Siswa": "Gita Gutawa Putri",
      Kelas: "VII-G",
      "Username Login": "0098765443",
      "Email Login": "gita.putri@smpn1segah.sch.id",
      "Kata Sandi (Password)": "siswa123",
      Status: "Aktif"
    },
    {
      NISN: "0098765444",
      "Nama Siswa": "Gilang Ramadhan",
      Kelas: "VIII-C",
      "Username Login": "0098765444",
      "Email Login": "gilang.ramadhan@smpn1segah.sch.id",
      "Kata Sandi (Password)": "siswa123",
      Status: "Aktif"
    },
    {
      NISN: "0098765436",
      "Nama Siswa": "Fajar Ramadhan",
      Kelas: "IX-A",
      "Username Login": "0098765436",
      "Email Login": "fajar.ramadhan@smpn1segah.sch.id",
      "Kata Sandi (Password)": "siswa123",
      Status: "Aktif"
    },
    {
      NISN: "0098765454",
      "Nama Siswa": "Qori Sandioriva",
      Kelas: "IX-G",
      "Username Login": "0098765454",
      "Email Login": "qori.sandioriva@smpn1segah.sch.id",
      "Kata Sandi (Password)": "siswa123",
      Status: "Aktif"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleAccounts);
  ws['!cols'] = [
    { wch: 16 }, // NISN
    { wch: 28 }, // Nama Siswa
    { wch: 12 }, // Kelas
    { wch: 20 }, // Username Login
    { wch: 32 }, // Email Login
    { wch: 24 }, // Kata Sandi (Password)
    { wch: 14 }  // Status
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Akun Siswa");
  XLSX.writeFile(wb, "Format_Import_Akun_Siswa_SMPN1_Segah.xlsx");
}


