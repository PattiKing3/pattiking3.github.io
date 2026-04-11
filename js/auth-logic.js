// ════════════════════════════════════════
// Patti King — Firebase Configuration & Auth Logic
// ════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  createUserWithEmailAndPassword, updateProfile,
  signInWithEmailAndPassword, fetchSignInMethodsForEmail, signOut,
  signInWithPhoneNumber, RecaptchaVerifier
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// ── Firestore: User Save / Update ──
async function saveUser(user) {
  try {
    const ref  = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:       user.uid,
        name:      user.displayName || "Player",
        email:     user.email       || "",
        mobile:    user.phoneNumber || "",
        coins:     1000,
        level:     "Bronze",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
    } else {
      await updateDoc(ref, { lastLogin: serverTimestamp() });
    }
  } catch (e) {
    console.error("Firestore error:", e);
  }
}

// ── Phone OTP Send ──
window._firebaseSendPhoneOTP = async function(phone) {
  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          window.recaptchaVerifier = null;
        }
      });
      await window.recaptchaVerifier.render();
    }

    const phoneNumber = '+91' + phone;
    window.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);

    document.getElementById('otpSection').style.display = 'block';
    document.getElementById('loginBtn').style.display = 'block';
    const btn = document.getElementById('sendOtpBtn');
    btn.textContent = 'Sent ✓';
    btn.disabled = true;
    btn.classList.add('sent');
    setTimeout(() => document.querySelectorAll('.otp-box')[0].focus(), 100);
    toast('✓ OTP sent to +91' + phone, 'success');
    startLoginTimer(30);

  } catch (err) {
    console.error("Phone OTP error:", err.code);
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    if (err.code === 'auth/invalid-phone-number') {
      toast('Invalid phone number. Please check and try again.', 'error');
    } else if (err.code === 'auth/too-many-requests') {
      toast('Too many attempts. Please wait a while.', 'error');
    } else {
      toast('OTP send failed: ' + err.code, 'error');
    }
  }
};

// ── Logout Function ──
window.logoutUser = () => {
  if (typeof toast === 'function') toast('Logging out...', '');
  signOut(auth).then(() => {
    // Redirect to login or landing page
    window.location.replace("../index.html"); 
  }).catch((error) => {
    console.error("Logout error:", error);
    if (typeof toast === 'function') toast('Logout failed!', 'error');
  });
};

// ── Phone OTP Verify ──
window._firebaseVerifyPhoneOTP = async function(otp) {
  try {
    if (!window.confirmationResult) {
      toast('Please send OTP first.', 'error');
      return;
    }
    const result = await window.confirmationResult.confirm(otp);
    const user   = result.user;
    const name   = user.displayName || 'Player';
    await saveUser(user);
    toast('✓ Mobile Login Successful!', 'success');
    setTimeout(() => showSuccess(name), 600);

  } catch (err) {
    console.error("OTP verify error:", err.code);
    if (err.code === 'auth/invalid-verification-code') {
      toast('❌ Invalid OTP! Please try again.', 'error');
    } else if (err.code === 'auth/code-expired') {
      toast('OTP expired. Please request a new one.', 'error');
    } else {
      toast('Verification failed: ' + err.code, 'error');
    }
    const boxes = document.querySelectorAll('.otp-box');
    boxes.forEach(b => { b.style.borderColor = 'rgba(220,80,80,0.5)'; });
    setTimeout(() => boxes.forEach(b => {
      b.style.borderColor = '';
      b.classList.remove('filled');
      b.value = '';
    }), 1500);
    boxes[0].focus();
  }
};

// ── Google Login ──
window._firebaseGoogleLogin = async function() {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const isGitHubPages = window.location.hostname.includes('github.io');
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isGitHubPages || isMobile) {
      toast('Redirecting to Google...', '');
      await signInWithRedirect(auth, provider);
    } else {
      const result = await signInWithPopup(auth, provider);
      const user   = result.user;
      const name   = user.displayName || "Player";
      await saveUser(user);
      toast('✓ ' + name + ' — Google Login Successful!', 'success');
      setTimeout(() => showSuccess(name), 600);
    }
  } catch (err) {
    console.error("Google login error:", err.code);
    if (err.code === 'auth/popup-closed-by-user') {
      toast('Login cancelled.', '');
    } else if (err.code === 'auth/unauthorized-domain') {
      toast('Domain not authorized. Check Firebase Console.', 'error');
    } else {
      toast('Error: ' + (err.code || err.message), 'error');
    }
  }
};

// ── Redirect Result Handle (GitHub Pages / Mobile) ──
try {
  const result = await getRedirectResult(auth);
  if (result && result.user) {
    const user = result.user;
    const name = user.displayName || "Player";
    await saveUser(user);
    toast('✓ ' + name + ' — Google Login Successful!', 'success');
    setTimeout(() => showSuccess(name), 600);
  }
} catch (err) {
  if (err.code !== 'auth/no-auth-event') {
    console.error("Redirect error:", err.code);
  }
}

// ── Email/Password Register ──
window._firebaseRegister = async function(name, email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await saveUser({ ...cred.user, displayName: name });
    closeRegModal();
    toast('✓ Account created! Welcome, ' + name + '!', 'success');
    setTimeout(() => showSuccess(name), 600);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      toast('This Email is already registered!', 'error');
    } else if (err.code === 'auth/weak-password') {
      toast('Password is too weak. Use at least 6 characters.', 'error');
    } else if (err.code === 'auth/invalid-email') {
      toast('Please enter a valid Email ID.', 'error');
    } else {
      toast('Error: ' + err.code, 'error');
    }
  }
};

// ── User Exists Check ──
window._firebaseCheckUser = async function(identifier) {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (phoneRegex.test(identifier)) return true; // Phone — always allow OTP
  try {
    const methods = await fetchSignInMethodsForEmail(auth, identifier);
    return methods.length > 0;
  } catch (err) {
    return false;
  }
};

// ── Password Login ──
window._firebasePasswordLogin = async function(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    const name = user.displayName || email.split('@')[0];
    await saveUser(user);
    toast('✓ ' + name + ' — Login Successful!', 'success');
    setTimeout(() => showSuccess(name), 600);
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      toast('❌ User does not exist! Please create a new account.', 'error');
    } else if (err.code === 'auth/wrong-password') {
      toast('❌ Incorrect Password! Please try again.', 'error');
    } else if (err.code === 'auth/too-many-requests') {
      toast('Too many attempts. Please wait a while.', 'error');
    } else {
      toast('Login error: ' + err.code, 'error');
    }
  }
};
