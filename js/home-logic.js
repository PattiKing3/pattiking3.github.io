// ══════════════════════════════════════
// Patti King — Firebase Auth (Home Page)
// ══════════════════════════════════════

import { initializeApp }            from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc }   from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyD8UtspjdYhTY_LmileM0NZcE_24-C5Ask",
  authDomain:        "patti-king3.firebaseapp.com",
  projectId:         "patti-king3",
  storageBucket:     "patti-king3.firebasestorage.app",
  messagingSenderId: "369645745216",
  appId:             "1:369645745216:web:b9c636a56df1821e435ba5"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Back बटण ब्लॉक ──
history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};

// ── Auth State ──
// Firebase ला थोडा वेळ लागतो redirect result process करायला.
// म्हणून आपण एक "ready" flag ठेवतो.
// जर 3 सेकंदात user आला नाही तरच login page वर पाठवतो.

let redirectTimeout = null;

onAuthStateChanged(auth, async (user) => {
  // Timeout cancel करा — user आला म्हणजे redirect result process झाला
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
    redirectTimeout = null;
  }

  if (!user) {
    // ⚠️ लगेच redirect नको — Google Redirect login असेल तर
    // Firebase ला auth state set करायला 1-2 seconds लागतात.
    // म्हणून 3 seconds wait करतो.
    redirectTimeout = setTimeout(() => {
      // 3 seconds नंतरही user नाही → खरोखर logged out
      window.location.replace("../index.html");
    }, 3000);
    return;
  }

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const d = snap.data();

      // नाव short करा (First + Last Initial)
      const parts = (d.name || user.displayName || "Player").split(" ");
      const short = parts[0] + (parts[1] ? " " + parts[1][0] + "." : "");

      // Header update
      const headerName  = document.getElementById('headerPlayerName');
      const headerLevel = document.getElementById('headerPlayerLevel');
      if (headerName)  headerName.textContent  = short;
      if (headerLevel) headerLevel.textContent = "★ " + (d.level || "Silver Member");

      // Side Menu update
      const menuName  = document.getElementById('menuPlayerName');
      const menuLevel = document.getElementById('menuPlayerLevel');
      if (menuName)  menuName.textContent  = short;
      if (menuLevel) menuLevel.textContent = "★ " + (d.level || "Silver Member");

      // Balance update
      const balanceEl = document.getElementById('balanceAmt');
      if (balanceEl) balanceEl.textContent = parseInt(d.coins || 0).toLocaleString('en-IN');

    } else {
      // Firestore मध्ये user नाही (नवीन Google user असेल)
      // Display name वापरा
      const name = user.displayName || user.email?.split('@')[0] || "Player";
      const parts = name.split(" ");
      const short = parts[0] + (parts[1] ? " " + parts[1][0] + "." : "");

      const headerName = document.getElementById('headerPlayerName');
      if (headerName) headerName.textContent = short;

      const menuName = document.getElementById('menuPlayerName');
      if (menuName) menuName.textContent = short;
    }
  } catch (e) {
    console.error("Firestore error:", e);
  }
});

// ── Logout Function ──
window.logoutUser = () => {
  signOut(auth).then(() => {
    window.location.href = "../index.html";
  }).catch((error) => {
    console.error("Logout error:", error);
  });
};
