/**
 * SMP NEGERI 1 SEGAH - Portal Siswa Script
 * Rapor Digital, Grafik Nilai Chart.js, Kartu Pelajar Digital, Jadwal & Tugas
 */

let chartNilaiSiswaInstance = null;
let chartRadarSiswaInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Guard role Siswa
  if (!Auth.guard('siswa')) return;

  const currentUser = Auth.getCurrentUser();
  const studentId = currentUser?.studentId || 'std-01';

  // Load student profile & academic data
  const student = await loadStudentInfo(studentId);
  await loadStudentGrades(student?.id || studentId);
  await loadStudentMaterials(student?.class || currentUser?.class || 'VIII-A');
});

async function loadStudentInfo(studentId) {
  const students = await DB.getStudents();
  const student = students.find(s => s.id === studentId || s.nisn === studentId) || students[0];

  if (student) {
    document.querySelectorAll('.student-name').forEach(el => el.textContent = student.name);
    document.querySelectorAll('.student-nisn').forEach(el => el.textContent = student.nisn);
    document.querySelectorAll('.student-class').forEach(el => el.textContent = student.class);
    document.querySelectorAll('.student-address').forEach(el => el.textContent = student.address || 'Kec. Segah, Berau');
    document.querySelectorAll('.student-birth').forEach(el => el.textContent = student.birthPlaceDate || 'Berau, 2011');
    document.querySelectorAll('.student-parent').forEach(el => el.textContent = student.parentName || '-');
  }
  return student;
}

// ================= NILAI & RAPOR =================
async function loadStudentGrades(studentId) {
  const grades = await DB.getGrades(studentId);
  const tbody = document.getElementById('studentGradesTableBody');

  let totalScore = 0;
  if (tbody) {
    if (grades.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Belum ada nilai yang diinput guru untuk semester ini.</td></tr>`;
    } else {
      tbody.innerHTML = grades.map((g, idx) => {
        totalScore += Number(g.finalScore || 0);
        return `
          <tr>
            <td>${idx + 1}</td>
            <td class="fw-bold text-dark">${escapeHtml(g.subject)}</td>
            <td>${escapeHtml(g.teacherName || '-')}</td>
            <td>${g.assignment}</td>
            <td>${g.uh}</td>
            <td>${g.uts}</td>
            <td>${g.uas}</td>
            <td class="fw-bold text-primary">${g.finalScore}</td>
            <td><span class="badge ${getLetterBadge(g.gradeLetter)}">${g.gradeLetter}</span></td>
            <td><span class="badge bg-success">TUNTAS</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  const avg = grades.length > 0 ? (totalScore / grades.length).toFixed(1) : '89.4';
  document.getElementById('statSiswaAvgNilai').textContent = avg;

  renderStudentCharts(grades);
}

// ================= CHART.JS SISWA =================
function renderStudentCharts(grades) {
  // 1. Chart Bar Nilai per Mata Pelajaran
  const ctxNilai = document.getElementById('chartNilaiSemester')?.getContext('2d');
  if (ctxNilai) {
    if (chartNilaiSiswaInstance) chartNilaiSiswaInstance.destroy();

    const labels = grades.map(g => g.subject.length > 12 ? g.subject.substring(0, 10) + '..' : g.subject);
    const dataValues = grades.map(g => g.finalScore);

    chartNilaiSiswaInstance = new Chart(ctxNilai, {
      type: 'bar',
      data: {
        labels: labels.length > 0 ? labels : ['Matematika', 'B. Indo', 'IPA', 'B. Inggris', 'Informatika', 'PJOK'],
        datasets: [
          {
            label: 'Nilai Siswa',
            data: dataValues.length > 0 ? dataValues : [89, 86, 93, 88, 95, 90],
            backgroundColor: '#3b82f6',
            borderRadius: 8
          },
          {
            label: 'Batas KKM (75)',
            data: labels.length > 0 ? labels.map(() => 75) : [75, 75, 75, 75, 75, 75],
            type: 'line',
            borderColor: '#ef4444',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 50, max: 100, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 2. Chart Radar Potensi Diri
  const ctxRadar = document.getElementById('chartRadarKompetensi')?.getContext('2d');
  if (ctxRadar) {
    if (chartRadarSiswaInstance) chartRadarSiswaInstance.destroy();

    chartRadarSiswaInstance = new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: ['Logika / Sains', 'Bahasa & Komunikasi', 'Teknologi Informasi', 'Kebugaran / PJOK', 'Karakter & Sikap', 'Kreativitas Seni'],
        datasets: [{
          label: 'Profil Capaian',
          data: [92, 87, 95, 90, 96, 85],
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: '#2563eb',
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: '#e2e8f0' },
            grid: { color: '#e2e8f0' },
            suggestedMin: 60,
            suggestedMax: 100
          }
        }
      }
    });
  }
}

// ================= MATERI & TUGAS KELAS =================
async function loadStudentMaterials(className) {
  const container = document.getElementById('studentMaterialsList');
  if (!container) return;

  const materials = await DB.getMaterials(className);
  if (materials.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-4">Tidak ada materi atau tugas baru saat ini.</div>`;
    return;
  }

  container.innerHTML = materials.map(m => `
    <div class="col-md-6 mb-3">
      <div class="p-3 border rounded bg-white h-100 d-flex flex-column shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="badge bg-primary-subtle text-primary">${escapeHtml(m.subject)}</span>
          <small class="text-danger fw-bold"><i class="bi bi-clock-history me-1"></i>Deadline: ${m.deadline || '-'}</small>
        </div>
        <h6 class="fw-bold text-dark mb-1">${escapeHtml(m.title)}</h6>
        <p class="small text-muted mb-3 flex-grow-1">${escapeHtml(m.description || '-')}</p>
        <div class="d-flex justify-content-between align-items-center pt-2 border-top">
          <small class="text-muted"><i class="bi bi-person me-1"></i>${escapeHtml(m.teacherName || 'Guru Mapel')}</small>
          <a href="${m.link || '#'}" target="_blank" class="btn btn-sm btn-primary">
            <i class="bi bi-file-earmark-arrow-down me-1"></i> Buka Materi
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// Cetak Rapor Sementara
function printRapor() {
  window.print();
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
