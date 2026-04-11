// ══════════════════════════════════════
// Patti King — Firebase Auth (Home Page)
// ══════════════════════════════════════

import { initializeApp }            from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc }   from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// ════════════════════════════════════════
// 👇 Firebase Config — येथे आपले config paste करा
// ════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "AIzaSyD8UtspjdYhTY_LmileM0NZcE_24-C5Ask",
  authDomain:        "patti-king3.firebaseapp.com",
  projectId:         "patti-king3",
  storageBucket:     "patti-king3.firebasestorage.app",
  messagingSenderId: "369645745216",
  appId:             "1:369645745216:web:b9c636a56df1821e435ba5"
};
// ════════════════════════════════════════

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Auth State Changed ──
// १. बॅक बटण ब्लॉक करणे (सर्वात आधी)
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};
// २. त्यानंतर तुमचे Auth State Logic
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const d = snap.data();

      // नाव short करा (First + Last Initial)
      const parts = (d.name || "").split(" ");
      const short = parts[0] + (parts[1] ? " " + parts[1][0] + "." : "");

      // Header मध्ये update करा
      const headerName  = document.getElementById('headerPlayerName');
      const headerLevel = document.getElementById('headerPlayerLevel');
      if (headerName)  headerName.textContent  = short;
      if (headerLevel) headerLevel.textContent = "★ " + (d.level || "Silver Member");

      // Side Menu मध्ये update करा
      const menuName  = document.getElementById('menuPlayerName');
      const menuLevel = document.getElementById('menuPlayerLevel');
      if (menuName)  menuName.textContent  = short;
      if (menuLevel) menuLevel.textContent = "★ " + (d.level || "Silver Member");

      // Balance update करा
      const balanceEl = document.getElementById('balanceAmt');
      if (balanceEl) balanceEl.textContent = parseInt(d.coins || 0).toLocaleString('en-IN');
    }
  } catch (e) {
    console.error("Firestore error:", e);
  }
});

// ── Logout Function ──
window.logoutUser = () => {
  signOut(auth).then(() => {
    window.location.href = "../index.html"; // Redirect to login page
  }).catch((error) => {
    console.error("Logout error:", error);
  });
};
