/**
 * SMP NEGERI 1 SEGAH - Public Website Script
 * Menghubungkan tampilan publik dengan data dinamis DB (Berita, Prestasi, Guru, dsb.)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Inisialisasi komponen
  initNavbarScroll();
  initCounters();
  await loadPublicNews();
  await loadPublicAchievements();
  await loadPublicTeachers();
  initContactForm();
});

// Efek Navbar saat di-scroll
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar-main');
  const backToTop = document.querySelector('.btn-back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
      backToTop?.classList.add('show');
    } else {
      navbar?.classList.remove('scrolled');
      backToTop?.classList.remove('show');
    }
  });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Animasi Angka Statistik
function initCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.getAttribute('data-target');
        let count = 0;
        const speed = target / 35;
        const updateCount = () => {
          count += speed;
          if (count < target) {
            entry.target.innerText = Math.ceil(count);
            setTimeout(updateCount, 30);
          } else {
            entry.target.innerText = target + (entry.target.getAttribute('data-suffix') || '');
          }
        };
        updateCount();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ================= LOAD BERITA PUBLIK =================
let allNewsData = [];

async function loadPublicNews() {
  const container = document.getElementById('public-news-list');
  if (!container) return;

  try {
    allNewsData = await DB.getNews();
    renderNewsCards(allNewsData);
  } catch (err) {
    console.error("Gagal memuat berita:", err);
    container.innerHTML = `<div class="col-12 text-center text-muted py-4">Gagal memuat berita sekolah.</div>`;
  }
}

function renderNewsCards(newsList) {
  const container = document.getElementById('public-news-list');
  if (!container) return;

  if (newsList.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-4">Belum ada berita yang dipublikasikan.</div>`;
    return;
  }

  container.innerHTML = newsList.slice(0, 6).map(item => `
    <div class="col-lg-4 col-md-6" data-category="${item.category}">
      <div class="custom-card h-100 d-flex flex-column">
        <div class="news-img-holder">
          <img src="${item.image || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800'}" alt="${item.title}" loading="lazy">
          <span class="position-absolute top-0 start-0 m-3 badge news-badge ${getCategoryBadgeClass(item.category)}">
            ${item.category}
          </span>
        </div>
        <div class="p-4 d-flex flex-column flex-grow-1">
          <div class="news-meta mb-2">
            <span><i class="bi bi-calendar-event me-1"></i>${formatIndonesianDate(item.date)}</span>
            <span><i class="bi bi-eye me-1"></i>${item.views || 0}</span>
          </div>
          <h5 class="fw-bold mb-2 flex-grow-0" style="font-size: 1.1rem; line-height: 1.4;">
            <a href="javascript:void(0)" onclick="openNewsModal('${item.id}')" class="text-dark hover-primary text-decoration-none">
              ${escapeHtml(item.title)}
            </a>
          </h5>
          <p class="text-muted small mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHtml(item.excerpt || item.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...')}
          </p>
          <div class="pt-2 border-top mt-auto d-flex align-items-center justify-content-between">
            <span class="small text-muted"><i class="bi bi-person me-1"></i>${item.author || 'Humas'}</span>
            <button class="btn btn-sm btn-link text-primary fw-bold text-decoration-none p-0" onclick="openNewsModal('${item.id}')">
              Baca Selengkapnya <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Filter Berita
function filterNews(category, btn) {
  document.querySelectorAll('.news-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (category === 'all') {
    renderNewsCards(allNewsData);
  } else {
    const filtered = allNewsData.filter(n => n.category.toLowerCase() === category.toLowerCase());
    renderNewsCards(filtered);
  }
}

// Modal Detail Berita
function openNewsModal(newsId) {
  const item = allNewsData.find(n => n.id === newsId);
  if (!item) return;

  // Increment views
  item.views = (item.views || 0) + 1;
  DB.updateNews(item.id, { views: item.views });

  const modalTitle = document.getElementById('newsModalTitle');
  const modalCategory = document.getElementById('newsModalCategory');
  const modalDate = document.getElementById('newsModalDate');
  const modalAuthor = document.getElementById('newsModalAuthor');
  const modalImage = document.getElementById('newsModalImage');
  const modalContent = document.getElementById('newsModalContent');

  if (modalTitle) modalTitle.textContent = item.title;
  if (modalCategory) {
    modalCategory.textContent = item.category;
    modalCategory.className = `badge ${getCategoryBadgeClass(item.category)}`;
  }
  if (modalDate) modalDate.textContent = formatIndonesianDate(item.date);
  if (modalAuthor) modalAuthor.textContent = item.author || 'Admin SMPN 1 Segah';
  if (modalImage) modalImage.src = item.image || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800';
  if (modalContent) modalContent.innerHTML = item.content || `<p>${item.excerpt}</p>`;

  const modalEl = document.getElementById('newsDetailModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

// ================= LOAD PRESTASI PUBLIK =================
let allAchievementsData = [];

async function loadPublicAchievements() {
  const container = document.getElementById('public-achievements-list');
  if (!container) return;

  try {
    allAchievementsData = await DB.getAchievements();
    renderAchievementCards(allAchievementsData);
  } catch (err) {
    console.error("Gagal memuat prestasi:", err);
    container.innerHTML = `<div class="col-12 text-center text-muted py-4">Gagal memuat data prestasi sekolah.</div>`;
  }
}

function renderAchievementCards(achList) {
  const container = document.getElementById('public-achievements-list');
  if (!container) return;

  if (achList.length === 0) {
    container.innerHTML = `<div class="col-12 text-center text-muted py-4">Belum ada prestasi yang dicatat.</div>`;
    return;
  }

  container.innerHTML = achList.map(item => `
    <div class="col-lg-3 col-md-6">
      <div class="custom-card h-100 position-relative d-flex flex-column">
        <div style="height: 180px; overflow: hidden; position: relative;">
          <img src="${item.image || 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800'}" alt="${item.title}" style="width:100%; height:100%; object-fit:cover;">
          <span class="achievement-badge-level bg-warning text-dark">
            <i class="bi bi-award-fill me-1"></i>${item.level}
          </span>
        </div>
        <div class="p-4 d-flex flex-column flex-grow-1">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="achievement-icon-trophy">
              <i class="bi bi-trophy-fill"></i>
            </div>
            <div>
              <span class="badge bg-primary-subtle text-primary fw-bold" style="font-size:0.75rem;">${item.category}</span>
              <div class="small text-muted"><i class="bi bi-calendar3 me-1"></i>Tahun ${item.year}</div>
            </div>
          </div>
          <h6 class="fw-bold mb-2 text-dark" style="line-height: 1.4;">${escapeHtml(item.title)}</h6>
          <p class="small text-muted mb-2 flex-grow-1">${escapeHtml(item.description || '')}</p>
          <div class="p-2 bg-light rounded text-center mt-2 border">
            <small class="text-muted d-block" style="font-size: 0.72rem;">Peraih Prestasi:</small>
            <strong class="text-primary small">${escapeHtml(item.winnerName)}</strong>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function filterAchievements(category, btn) {
  document.querySelectorAll('.ach-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (category === 'all') {
    renderAchievementCards(allAchievementsData);
  } else {
    const filtered = allAchievementsData.filter(a => a.category.toLowerCase() === category.toLowerCase());
    renderAchievementCards(filtered);
  }
}

// ================= LOAD GURU PUBLIK =================
async function loadPublicTeachers() {
  const container = document.getElementById('public-teachers-list');
  if (!container) return;

  try {
    const teachers = await DB.getTeachers();
    container.innerHTML = teachers.slice(0, 8).map(t => `
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="custom-card text-center h-100">
          <div class="teacher-card-top"></div>
          <div class="px-3 pb-4">
            <img src="${t.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}" alt="${t.name}" class="teacher-avatar mb-3">
            <h6 class="fw-bold text-dark mb-1">${escapeHtml(t.name)}</h6>
            <div class="badge bg-primary-subtle text-primary mb-2">${escapeHtml(t.subject)}</div>
            <p class="small text-muted mb-2" style="font-size:0.8rem;">${escapeHtml(t.role || 'Tenaga Pendidik')}</p>
            <div class="small text-muted border-top pt-2" style="font-size:0.75rem;">
              <i class="bi bi-mortarboard me-1 text-secondary"></i>${escapeHtml(t.education || 'S1 Pendidikan')}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

// ================= FORM KONTAK =================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Mengirim...`;
    btn.disabled = true;

    setTimeout(() => {
      alert("Terima kasih! Pesan Anda telah berhasil dikirimkan ke Humas SMP Negeri 1 Segah. Kami akan segera menghubungi Anda.");
      form.reset();
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 1000);
  });
}

// Helper Utilities
function formatIndonesianDate(dateStr) {
  if (!dateStr) return '-';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  } catch (e) {
    return dateStr;
  }
}

function getCategoryBadgeClass(cat) {
  switch (cat?.toLowerCase()) {
    case 'prestasi': return 'bg-success text-white';
    case 'pengumuman': return 'bg-danger text-white';
    case 'kegiatan': return 'bg-info text-white';
    default: return 'bg-primary text-white';
  }
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
