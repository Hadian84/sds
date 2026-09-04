/**
 * SMP NEGERI 1 SEGAH - Portal Guru Script
 * Input Nilai, Presensi Kelas, Upload Materi/Tugas, Chart.js Analitik Siswa
 */

let chartNilaiKelasInstance = null;
let chartPresensiKelasInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Guard role Guru
  if (!Auth.guard('guru')) return;

  const currentUser = Auth.getCurrentUser();
  if (currentUser) {
    document.getElementById('guruMapelBadge').textContent = currentUser.subject || 'Matematika';
    document.getElementById('guruNipText').textContent = currentUser.nip || '19830514 200801 1 009';
  }

  // Load awal
  await loadGuruDashboard();
  await loadStudentsForGrading('VIII-A');
  await loadAttendanceForClass('VIII-A');
  await loadMaterialsForGuru();

  initGuruForms();
});

async function loadGuruDashboard() {
  const students = await DB.getStudents();
  const grades = await DB.getGrades(null, 'VIII-A');

  // Hitung rata-rata nilai kelas VIII-A
  let totalScore = 0;
  grades.forEach(g => totalScore += Number(g.finalScore || 0));
  const avg = grades.length > 0 ? (totalScore / grades.length).toFixed(1) : '88.5';

  document.getElementById('statGuruSiswa').textContent = students.filter(s => s.class === 'VIII-A').length || 32;
  document.getElementById('statGuruAvgNilai').textContent = avg;

  renderGuruCharts(grades);
}

// ================= CHART.JS UNTUK GURU =================
function renderGuruCharts(grades) {
  // 1. Chart Komponen Nilai Siswa Kelas VIII-A
  const ctxNilai = document.getElementById('chartNilaiKelas')?.getContext('2d');
  if (ctxNilai) {
    if (chartNilaiKelasInstance) chartNilaiKelasInstance.destroy();

    const sampleGrades = grades.length > 0 ? grades.slice(0, 5) : [
      { studentName: 'M. Rizky', assignment: 88, uh: 85, uts: 90, uas: 92 },
      { studentName: 'Amanda P.', assignment: 92, uh: 90, uts: 94, uas: 95 },
      { studentName: 'Dimas A.', assignment: 85, uh: 82, uts: 86, uas: 88 }
    ];

    chartNilaiKelasInstance = new Chart(ctxNilai, {
      type: 'bar',
      data: {
        labels: sampleGrades.map(g => g.studentName.split(' ')[0]),
        datasets: [
          { label: 'Tugas', data: sampleGrades.map(g => g.assignment), backgroundColor: '#60a5fa' },
          { label: 'UH', data: sampleGrades.map(g => g.uh), backgroundColor: '#34d399' },
          { label: 'UTS', data: sampleGrades.map(g => g.uts), backgroundColor: '#fbbf24' },
          { label: 'UAS', data: sampleGrades.map(g => g.uas), backgroundColor: '#818cf8' }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12 } }
        },
        scales: {
          y: { min: 60, max: 100, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 2. Chart Kehadiran Kelas (Doughnut)
  const ctxPresensi = document.getElementById('chartPresensiKelas')?.getContext('2d');
  if (ctxPresensi) {
    if (chartPresensiKelasInstance) chartPresensiKelasInstance.destroy();

    chartPresensiKelasInstance = new Chart(ctxPresensi, {
      type: 'pie',
      data: {
        labels: ['Hadir (30)', 'Sakit (1)', 'Izin (1)', 'Alpa (0)'],
        datasets: [{
          data: [30, 1, 1, 0],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12 } }
        }
      }
    });
  }
}

// ================= TAB 1: INPUT NILAI SISWA =================
async function loadStudentsForGrading(className) {
  const tbody = document.getElementById('gradingTableBody');
  if (!tbody) return;

  const allStudents = await DB.getStudents();
  const students = allStudents.filter(s => s.class === className);
  const grades = await DB.getGrades(null, className);

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4"><i class="bi bi-info-circle me-1"></i> Belum ada data siswa di kelas <strong>${escapeHtml(className)}</strong>. Anda dapat mengimpor atau menambahkan siswa di Portal Admin.</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map((std, idx) => {
    // Cari nilai yang tersimpan untuk murid ini
    const g = grades.find(item => item.studentId === std.id && item.subject === 'Matematika') || {
      assignment: 85,
      uh: 85,
      uts: 88,
      uas: 90,
      finalScore: 87,
      gradeLetter: 'B'
    };

    return `
      <tr data-student-id="${std.id}">
        <td>${idx + 1}</td>
        <td>
          <div class="fw-bold text-dark">${escapeHtml(std.name)}</div>
          <small class="text-muted">NISN: ${escapeHtml(std.nisn)}</small>
        </td>
        <td><input type="number" min="0" max="100" class="form-control form-control-sm input-tugas" value="${g.assignment}" style="width: 75px;" onchange="recalculateRow(this)"></td>
        <td><input type="number" min="0" max="100" class="form-control form-control-sm input-uh" value="${g.uh}" style="width: 75px;" onchange="recalculateRow(this)"></td>
        <td><input type="number" min="0" max="100" class="form-control form-control-sm input-uts" value="${g.uts}" style="width: 75px;" onchange="recalculateRow(this)"></td>
        <td><input type="number" min="0" max="100" class="form-control form-control-sm input-uas" value="${g.uas}" style="width: 75px;" onchange="recalculateRow(this)"></td>
        <td class="fw-bold text-primary cell-final">${g.finalScore || 87}</td>
        <td><span class="badge ${getLetterBadge(g.gradeLetter || 'B')} cell-letter">${g.gradeLetter || 'B'}</span></td>
        <td>
          <span class="badge ${Number(g.finalScore || 87) >= 75 ? 'bg-success' : 'bg-danger'} cell-status">
            ${Number(g.finalScore || 87) >= 75 ? 'TUNTAS' : 'REMIDI'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function recalculateRow(inputEl) {
  const row = inputEl.closest('tr');
  const tugas = Number(row.querySelector('.input-tugas').value) || 0;
  const uh = Number(row.querySelector('.input-uh').value) || 0;
  const uts = Number(row.querySelector('.input-uts').value) || 0;
  const uas = Number(row.querySelector('.input-uas').value) || 0;

  const finalScore = Math.round((tugas * 0.2) + (uh * 0.2) + (uts * 0.3) + (uas * 0.3));
  let letter = 'D';
  if (finalScore >= 90) letter = 'A';
  else if (finalScore >= 80) letter = 'B';
  else if (finalScore >= 70) letter = 'C';

  row.querySelector('.cell-final').textContent = finalScore;
  const letterEl = row.querySelector('.cell-letter');
  letterEl.textContent = letter;
  letterEl.className = `badge ${getLetterBadge(letter)} cell-letter`;

  const statusEl = row.querySelector('.cell-status');
  if (finalScore >= 75) {
    statusEl.textContent = 'TUNTAS';
    statusEl.className = 'badge bg-success cell-status';
  } else {
    statusEl.textContent = 'REMIDI';
    statusEl.className = 'badge bg-danger cell-status';
  }
}

async function saveAllGrades() {
  const selectedClass = document.getElementById('selectGradingClass').value;
  const rows = document.querySelectorAll('#gradingTableBody tr');
  const btn = document.getElementById('btnSaveGrades');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan Nilai...`;
  btn.disabled = true;

  try {
    for (const row of rows) {
      const studentId = row.getAttribute('data-student-id');
      const studentName = row.querySelector('.fw-bold').textContent;
      const assignment = Number(row.querySelector('.input-tugas').value);
      const uh = Number(row.querySelector('.input-uh').value);
      const uts = Number(row.querySelector('.input-uts').value);
      const uas = Number(row.querySelector('.input-uas').value);

      await DB.saveGrade({
        studentId,
        studentName,
        class: selectedClass,
        subject: "Matematika",
        teacherName: Auth.getCurrentUser()?.displayName || "Bambang Sutrisno, S.Pd",
        assignment,
        uh,
        uts,
        uas,
        semester: "Ganjil 2026/2027"
      });
    }

    alert(`Nilai Matematika Kelas ${selectedClass} berhasil disimpan ke database!`);
    await loadGuruDashboard();
  } catch (err) {
    alert("Gagal menyimpan nilai: " + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ================= TAB 2: PRESENSI / ABSENSI =================
async function loadAttendanceForClass(className) {
  const tbody = document.getElementById('attendanceTableBody');
  if (!tbody) return;

  const students = (await DB.getStudents()).filter(s => s.class === className);
  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4"><i class="bi bi-info-circle me-1"></i> Belum ada siswa terdaftar di kelas <strong>${escapeHtml(className)}</strong> untuk dicatat presensinya.</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map((std, idx) => `
      <td>${idx + 1}</td>
      <td>
        <div class="fw-bold text-dark">${escapeHtml(std.name)}</div>
        <small class="text-muted">NISN: ${escapeHtml(std.nisn)}</small>
      </td>
      <td class="text-center">
        <div class="btn-group" role="group">
          <input type="radio" class="btn-check" name="att-${std.id}" id="att-h-${std.id}" value="H" checked>
          <label class="btn btn-outline-success btn-sm" for="att-h-${std.id}">H</label>

          <input type="radio" class="btn-check" name="att-${std.id}" id="att-s-${std.id}" value="S">
          <label class="btn btn-outline-primary btn-sm" for="att-s-${std.id}">S</label>

          <input type="radio" class="btn-check" name="att-${std.id}" id="att-i-${std.id}" value="I">
          <label class="btn btn-outline-warning btn-sm" for="att-i-${std.id}">I</label>

          <input type="radio" class="btn-check" name="att-${std.id}" id="att-a-${std.id}" value="A">
          <label class="btn btn-outline-danger btn-sm" for="att-a-${std.id}">A</label>
        </div>
      </td>
      <td>
        <input type="text" class="form-control form-control-sm input-att-note" placeholder="Keterangan (opsional)">
      </td>
    </tr>
  `).join('');
}

async function saveDailyAttendance() {
  const selectedClass = document.getElementById('selectAttClass').value;
  const attDate = document.getElementById('attDateInput').value || new Date().toISOString().split('T')[0];
  const rows = document.querySelectorAll('#attendanceTableBody tr');

  const records = [];
  rows.forEach(r => {
    const studentId = r.getAttribute('data-student-id');
    const studentName = r.querySelector('.fw-bold').textContent;
    const status = r.querySelector(`input[name="att-${studentId}"]:checked`)?.value || 'H';
    const note = r.querySelector('.input-att-note')?.value || '';
    records.push({ studentId, studentName, status, note });
  });

  await DB.saveAttendance({
    date: attDate,
    class: selectedClass,
    subject: "Matematika",
    records
  });

  alert(`Presensi Kelas ${selectedClass} untuk tanggal ${attDate} berhasil disimpan!`);
}

// ================= TAB 3: MATERI & TUGAS =================
async function loadMaterialsForGuru() {
  const container = document.getElementById('guruMaterialsList');
  if (!container) return;

  const materials = await DB.getMaterials();
  if (materials.length === 0) {
    container.innerHTML = `<div class="text-center text-muted py-4">Belum ada materi pembelajaran yang diunggah.</div>`;
    return;
  }

  container.innerHTML = materials.map(m => `
    <div class="col-md-6 mb-3">
      <div class="p-3 border rounded bg-light h-100 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="badge bg-primary-subtle text-primary">${escapeHtml(m.subject)} - ${escapeHtml(m.class)}</span>
          <small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${m.date}</small>
        </div>
        <h6 class="fw-bold text-dark mb-1">${escapeHtml(m.title)}</h6>
        <p class="small text-muted mb-2 flex-grow-1">${escapeHtml(m.description || '-')}</p>
        <div class="d-flex justify-content-between align-items-center pt-2 border-top">
          <small class="text-danger fw-bold"><i class="bi bi-clock me-1"></i>Batas: ${m.deadline || '-'}</small>
          <a href="${m.link || '#'}" target="_blank" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-download me-1"></i> Unduh Modul
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function initGuruForms() {
  const formMat = document.getElementById('formAddMaterial');
  formMat?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('matTitle').value;
    const matClass = document.getElementById('matClass').value;
    const link = document.getElementById('matLink').value;
    const deadline = document.getElementById('matDeadline').value;
    const description = document.getElementById('matDesc').value;

    await DB.addMaterial({
      title,
      subject: "Matematika",
      class: matClass,
      teacherName: Auth.getCurrentUser()?.displayName || "Bambang Sutrisno, S.Pd",
      date: new Date().toISOString().split('T')[0],
      link,
      deadline,
      description
    });

    bootstrap.Modal.getInstance(document.getElementById('modalAddMaterial'))?.hide();
    formMat.reset();
    await loadMaterialsForGuru();
    alert("Materi / Tugas berhasil dibagikan kepada siswa!");
  });
}

// Helpers
function getLetterBadge(l) {
  switch (l) {
    case 'A': return 'bg-success';
    case 'B': return 'bg-primary';
    case 'C': return 'bg-warning text-dark';
    default: return 'bg-danger';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
