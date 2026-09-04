/**
 * SMP NEGERI 1 SEGAH - Authentication & Session Service
 * Mendukung Firebase Auth asli dan Login Otentikasi Cepat (Admin, Guru, Siswa)
 */

const AUTH_STORAGE_KEY = 'SMPN1_ACTIVE_SESSION';

// Daftar Akun Demo Resmi SMPN 1 Segah
const DEMO_ACCOUNTS = {
  admin: {
    uid: "usr-admin-01",
    email: "admin@smpn1segah.sch.id",
    password: "admin123",
    role: "admin",
    displayName: "Administrator Sekolah",
    subTitle: "Staf Tata Usaha / IT",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  guru: {
    uid: "usr-guru-01",
    email: "guru@smpn1segah.sch.id",
    password: "guru123",
    role: "guru",
    displayName: "Bambang Sutrisno, S.Pd",
    nip: "19830514 200801 1 009",
    subject: "Matematika",
    subTitle: "Waka Kurikulum / Guru Matematika",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  siswa: {
    uid: "usr-siswa-01",
    email: "siswa@smpn1segah.sch.id",
    password: "siswa123",
    role: "siswa",
    studentId: "std-01",
    displayName: "Muhammad Rizky",
    nisn: "0098765432",
    class: "VIII-A",
    subTitle: "Siswa Kelas VIII-A",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
  }
};

const Auth = {
  // Ambil sesi user yang sedang aktif
  getCurrentUser() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  // Simpan sesi ke localStorage
  setSession(user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  },

  // Login dengan Email & Password (Mendukung Firebase Auth & Akun Demo)
  async login(email, password, selectedRole = null) {
    email = email.trim().toLowerCase();

    // 1. Cek kecocokan dengan akun demo terlebih dahulu untuk kemudahan pengujian
    for (const key in DEMO_ACCOUNTS) {
      const acc = DEMO_ACCOUNTS[key];
      if (acc.email.toLowerCase() === email && acc.password === password) {
        if (selectedRole && acc.role !== selectedRole) {
          throw new Error(`Email ini terdaftar sebagai ${acc.role.toUpperCase()}, bukan ${selectedRole.toUpperCase()}`);
        }
        this.setSession(acc);
        return acc;
      }
    }

    // 1.5. Cek database Akun Siswa (untuk peran Siswa)
    if (!selectedRole || selectedRole === 'siswa') {
      try {
        const studentAccounts = await DB.getStudentAccounts();
        const stdAcc = studentAccounts.find(a => 
          (a.email.toLowerCase() === email || a.username.toLowerCase() === email || a.nisn === email) && 
          a.password === password
        );
        if (stdAcc) {
          if (stdAcc.status === 'Nonaktif') {
            throw new Error("Akun siswa Anda sedang dinonaktifkan oleh Administrator Sekolah. Silakan hubungi tata usaha.");
          }
          // Update last login
          stdAcc.lastLogin = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
          await DB.saveStudentAccount(stdAcc);

          const sessionUser = {
            uid: stdAcc.id,
            email: stdAcc.email,
            role: "siswa",
            studentId: stdAcc.studentId || "std-01",
            displayName: stdAcc.name,
            nisn: stdAcc.nisn,
            class: stdAcc.class,
            subTitle: `Siswa Kelas ${stdAcc.class}`,
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
          };
          this.setSession(sessionUser);
          return sessionUser;
        }
      } catch (err) {
        if (err.message.includes("dinonaktifkan")) throw err;
        console.warn("Pemeriksaan akun siswa lokal:", err);
      }
    }

    // 2. Jika Firebase aktif, gunakan Firebase Auth
    if (isRealFirebaseActive && firebaseAuth) {
      try {
        const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
        const fbUser = userCredential.user;
        
        // Buat objek sesi
        const sessionUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          role: selectedRole || 'siswa',
          displayName: fbUser.displayName || email.split('@')[0],
          subTitle: `Pengguna ${selectedRole || 'Siswa'}`,
          avatar: fbUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
        };

        this.setSession(sessionUser);
        return sessionUser;
      } catch (err) {
        throw new Error(err.message || "Gagal masuk melalui Firebase Authentication");
      }
    }

    throw new Error("Email atau kata sandi tidak cocok. Gunakan tombol 'Masuk Cepat Demo' untuk menguji portal.");
  },

  // Login Cepat Demo untuk evaluasi
  quickDemoLogin(role) {
    const account = DEMO_ACCOUNTS[role];
    if (account) {
      this.setSession(account);
      this.redirectToPortal(role);
      return account;
    }
    throw new Error("Role tidak valid");
  },

  // Navigasi ke portal sesuai role
  redirectToPortal(role) {
    switch (role) {
      case 'admin':
        window.location.href = 'portal-admin.html';
        break;
      case 'guru':
        window.location.href = 'portal-guru.html';
        break;
      case 'siswa':
        window.location.href = 'portal-siswa.html';
        break;
      default:
        window.location.href = 'index.html';
    }
  },

  // Proteksi Halaman (Role Guard)
  guard(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) {
      // Belum login, lempar ke halaman login
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}&role=${requiredRole}`;
      return false;
    }

    if (user.role !== requiredRole) {
      // Role tidak cocok, arahkan ke portal yang benar
      alert(`Akses ditolak. Halaman ini khusus untuk ${requiredRole.toUpperCase()}. Anda diarahkan ke portal ${user.role.toUpperCase()}.`);
      this.redirectToPortal(user.role);
      return false;
    }

    this.renderUserProfile(user);
    return true;
  },

  // Tampilkan data profil user di sidebar dan topbar
  renderUserProfile(user) {
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.displayName || 'Pengguna');
    document.querySelectorAll('.user-role-display').forEach(el => el.textContent = (user.subTitle || user.role).toUpperCase());
    document.querySelectorAll('.user-email-display').forEach(el => el.textContent = user.email || '-');
    document.querySelectorAll('.user-avatar-img').forEach(el => {
      if (el.tagName === 'IMG') {
        el.src = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
      }
    });
  },

  // Logout
  async logout() {
    if (isRealFirebaseActive && firebaseAuth) {
      try {
        await firebaseAuth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = 'login.html';
  }
};
