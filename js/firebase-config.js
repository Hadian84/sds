/**
 * SMP NEGERI 1 SEGAH - Firebase Configuration & Dual Mode Handler
 * Mendukung Real Firebase (Auth & Firestore) dan Mode Simulasi Demo (LocalStorage)
 */

// Konfigurasi default Firebase (Ganti dengan konfigurasi Firebase Console Anda)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemoKeySMPN1SegahBerau2026Placeholder",
  authDomain: "smpn1segah-berau.firebaseapp.com",
  projectId: "smpn1segah-berau",
  storageBucket: "smpn1segah-berau.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Cek apakah user telah menyimpan konfigurasi kustom di localStorage
function getActiveFirebaseConfig() {
  const custom = localStorage.getItem('SMPN1_FIREBASE_CONFIG');
  if (custom) {
    try {
      return JSON.parse(custom);
    } catch (e) {
      console.error("Format konfigurasi tersimpan tidak valid:", e);
    }
  }
  return DEFAULT_FIREBASE_CONFIG;
}

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let isRealFirebaseActive = false;

// Inisialisasi Firebase
function initFirebaseApp() {
  const config = getActiveFirebaseConfig();
  
  // Cek apakah API key masih placeholder bawaan
  const isPlaceholder = !config.apiKey || 
                        config.apiKey.includes("DemoKey") || 
                        config.apiKey.includes("AIzaSyDemoKey");

  if (typeof firebase !== 'undefined' && !isPlaceholder) {
    try {
      if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(config);
      } else {
        firebaseApp = firebase.app();
      }
      firebaseAuth = firebase.auth();
      firebaseDb = firebase.firestore();
      isRealFirebaseActive = true;
      console.log("%c[Firebase]%c Terhubung ke proyek Firebase: " + config.projectId, "color: #10b981; font-weight: bold;", "color: inherit;");
    } catch (err) {
      console.warn("[Firebase] Gagal menghubungkan ke Firebase, mengaktifkan Mode Lokal:", err.message);
      isRealFirebaseActive = false;
    }
  } else {
    console.log("%c[Database]%c Menggunakan Mode Simulasi Data Lokal (Buka Pengaturan Firebase di Portal untuk menghubungkan database Firebase asli)", "color: #2563eb; font-weight: bold;", "color: inherit;");
    isRealFirebaseActive = false;
  }

  // Update UI badge jika elemen ada di halaman
  updateFirebaseStatusBadge();
}

// Simpan konfigurasi baru dari modal pengaturan
function saveCustomFirebaseConfig(configObj) {
  try {
    localStorage.setItem('SMPN1_FIREBASE_CONFIG', JSON.stringify(configObj));
    return true;
  } catch (e) {
    console.error("Gagal menyimpan config:", e);
    return false;
  }
}

// Reset konfigurasi ke demo
function resetFirebaseConfig() {
  localStorage.removeItem('SMPN1_FIREBASE_CONFIG');
  location.reload();
}

// Update status badge di navbar/header
function updateFirebaseStatusBadge() {
  const badges = document.querySelectorAll('.firebase-status-badge');
  badges.forEach(badge => {
    if (isRealFirebaseActive) {
      badge.className = 'firebase-indicator connected firebase-status-badge';
      badge.innerHTML = '<span class="firebase-dot"></span> Firebase Live Cloud';
    } else {
      badge.className = 'firebase-indicator demo firebase-status-badge';
      badge.innerHTML = '<span class="firebase-dot"></span> Firebase Ready (Mode Lokal Demo)';
    }
  });
}

// Jalankan saat script selesai dimuat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFirebaseApp);
} else {
  initFirebaseApp();
}
