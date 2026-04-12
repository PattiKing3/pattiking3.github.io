/**
 * wallet.js  —  Patti King
 * Wallet / Coins page — open/close, tabs, fund, bonus, withdraw, offers
 * Depends on: common.js  (toast, setEl)
 */
// १. Firebase कडून डेटाबेस (db) आणि ऑथेंटिकेशन (auth) मिळवा
import { db, auth } from './firebase.js';

// २. Firestore ची महत्त्वाची फंक्शन्स इम्पॉर्ट करा
import { 
    doc, 
    runTransaction, 
    collection, 
    serverTimestamp, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function createTransaction(amount, type, category, status, description) {
    const user = auth.currentUser;
    if (!user) return; // युजर लॉगिन नसेल तर थांबवा

    const userRef = doc(db, "users", user.uid); // युजरचे डॉक्युमेंट
    const transRef = doc(collection(db, "users", user.uid, "transactions")); // नवीन ट्रान्झॅक्शनची जागा

    try {
        // ३. Transaction सुरू करा - हे एकाच वेळी सर्व बदल सुरक्षितपणे करते
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw "User profile not found!";

            let currentBalance = userDoc.data().coins || 0;
            let currentWinnings = userDoc.data().coins_winning || 0;
            let newBalance = currentBalance;
            let newWinnings = currentWinnings;

            // ४. विथड्रॉवल लॉजिक: विनिंग बॅलन्स मधून पैसे कमी करा
            if (category === 'withdraw' && (status === 'pending' || status === 'initial')) {
                if (currentWinnings < amount) throw "Insufficient Winning Balance!";
                newWinnings -= amount;
            } 
            // ५. डिपॉझिट किंवा गेम विनिंग: बॅलन्स वाढवा (Success स्टेटस असेल तरच)
            else if ((category === 'deposit' || category === 'game_win') && status === 'success') {
                newBalance += amount;
            }
            // ६. गेम लॉस: टोटल बॅलन्स मधून पैसे कमी करा
            else if (category === 'game_loss') {
                if (currentBalance < amount) throw "Insufficient Balance!";
                newBalance -= amount;
            }

            // ७. डेटाबेसमध्ये अपडेट करा
            transaction.update(userRef, { 
                coins: newBalance,
                coins_winning: newWinnings 
            });

            // ८. ट्रान्झॅक्शन हिस्ट्रीमध्ये रेकॉर्ड लिहा
            transaction.set(transRef, {
                amount: amount,
                type: type,
                category: category,
                status: status,
                description: description,
                timestamp: serverTimestamp(), // सर्व्हरची वेळ
                txnId: "TXN" + Date.now()
            });
        });
        toast(`${category} successful!`, 'success');
    } catch (e) {
        toast(e, 'error');
    }
}
/* ══════════════════════════════════════════
   OPEN / CLOSE
   ══════════════════════════════════════════ */
function openCoins() {
  document.getElementById('coinsOverlay').classList.add('show');
}

function closeCoins() {
  document.getElementById('coinsOverlay').classList.remove('show');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const first = document.querySelector('.nav-item');
  if (first) first.classList.add('active');
}

function reloadCoins() { openCoins(); }

/* ══════════════════════════════════════════
   WALLET TABS  (Winnings ↔ Bonus)
   ══════════════════════════════════════════ */
function switchWalletTab(tab) {
  document.getElementById('tabWinning')?.classList.toggle('active', tab === 'winning');
  document.getElementById('tabBonus')?.classList.toggle('active',   tab === 'bonus');
  document.getElementById('withdrawPanel')?.classList.toggle('show', tab === 'winning');
  document.getElementById('bonusPanel')?.classList.toggle('show',    tab === 'bonus');
}

/* ══════════════════════════════════════════
   ADD FUND — PACKS
   ══════════════════════════════════════════ */
function buyCoins(amount, price) {
    createTransaction(amount, 'credit', 'deposit', 'success', `Purchased ₹${price} pack`);
}

/* ══════════════════════════════════════════
   ADD FUND — MANUAL INPUT
   ══════════════════════════════════════════ */
function validateManualFund(input) {
  const hint = document.getElementById('manualFundHint');
  const val  = parseFloat(input.value);
  if (input.value && val < 25) {
    hint?.classList.add('error');
    if (hint) hint.textContent = '⚠ Minimum ₹25 required';
  } else {
    hint?.classList.remove('error');
    if (hint) hint.textContent = 'Minimum amount: ₹25';
  }
}

function doManualAddFund() {
  const inp = document.getElementById('manualFundInput');
  const val = parseFloat(inp?.value);
  if (!val || val < 25) { toast('Please enter minimum ₹25 amount!', 'error'); return; }
  toast('Adding ₹' + val.toLocaleString('en-IN') + ' to your wallet...', 'success');
  if (inp) inp.value = '';
}

/* ══════════════════════════════════════════
   OFFERS
   ══════════════════════════════════════════ */
function applyOffer(code) {
  toast('Offer Code "' + code + '" Applied! 🎉', 'success');
}

/* ══════════════════════════════════════════
   BONUS INFO MODAL
   ══════════════════════════════════════════ */
function showBonusInfo() {
  const bal    = document.getElementById('bonusDisplay');
  const infoEl = document.getElementById('bonusInfoBal');
  if (bal && infoEl) infoEl.textContent = '🎁 ' + bal.textContent + ' Bonus';
  document.getElementById('bonusInfoOverlay')?.classList.add('show');
}
function hideBonusInfo() {
  document.getElementById('bonusInfoOverlay')?.classList.remove('show');
}

/* ══════════════════════════════════════════
   BONUS CLAIM
   ══════════════════════════════════════════ */
function claimBonus(btn, amt) {
  if (!btn || btn.disabled) return;
  btn.textContent = 'Claimed';
  btn.disabled    = true;
  btn.classList.add('claimed');
  const bonusEl = document.getElementById('bonusDisplay');
  const panelEl = document.getElementById('bonusPanelAmt');
  const infoEl  = document.getElementById('bonusInfoBal');
  if (bonusEl) {
    const cur = parseInt(bonusEl.textContent.replace(/,/g, '')) || 0;
    const neo = (cur + amt).toLocaleString('en-IN');
    bonusEl.textContent   = neo;
    if (panelEl) panelEl.textContent = '₹' + neo;
    if (infoEl)  infoEl.textContent  = '🎁 ₹' + neo + ' Bonus';
  }
  toast('🎁 ₹' + amt + ' Bonus claimed!', 'success');
}

/* ══════════════════════════════════════════
   WITHDRAW
   ══════════════════════════════════════════ */
function doWithdraw() {
    const input = document.getElementById('withdrawInput');
    const amt = parseFloat(input?.value);
    if (!amt || amt < 100) { toast('Minimum ₹100 required', 'error'); return; }
    
    createTransaction(amt, 'debit', 'withdraw', 'pending', 'Bank Withdrawal Request');
    if (input) input.value = '';
}

/* ══════════════════════════════════════════
   INIT
   ══════════════════════════════════════════ */
function syncWalletUI() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (document.getElementById('coinsBalDisplay')) 
                        document.getElementById('coinsBalDisplay').textContent = (data.coins || 0).toLocaleString('en-IN');
                    if (document.getElementById('winningVal')) 
                        document.getElementById('winningVal').textContent = '₹' + (data.coins_winning || 0).toLocaleString('en-IN');
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', syncWalletUI);
window.buyCoins = buyCoins;
window.doWithdraw = doWithdraw;
