/**
 * wallet.js  —  Patti King
 * Wallet / Coins page — open/close, tabs, fund, bonus, withdraw, offers
 * Depends on: common.js  (toast, setEl)
 */

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
  toast('₹' + price.toLocaleString('en-IN') + ' Fund adding...', 'success');
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
  const input     = document.getElementById('withdrawInput');
  const amt       = parseFloat(input?.value);
  const availEl   = document.getElementById('withdrawAvail');
  const winningEl = document.getElementById('winningVal');
  const currentWinning = parseFloat(
    (winningEl?.textContent || '').replace(/[^0-9.]/g, '')
  );
  if (!amt || amt < 100)         { toast('Minimum ₹100 required', 'error'); return; }
  if (amt > currentWinning)      { toast('Amount exceeds winnings ₹' + currentWinning.toLocaleString('en-IN'), 'error'); return; }
  const newWinning = currentWinning - amt;
  const fmt = '₹' + newWinning.toLocaleString('en-IN');
  if (winningEl) winningEl.textContent = fmt;
  if (availEl)   availEl.textContent   = fmt;
  if (input)     { input.max = newWinning; input.value = ''; }
  toast('🪙 ₹' + amt.toLocaleString('en-IN') + ' withdrawal submitted!', 'success');
}

/* ══════════════════════════════════════════
   INIT
   ══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const bal    = document.getElementById('coinsBalDisplay');
  const tabBal = document.getElementById('bonusDisplay');
  if (bal && tabBal) tabBal.textContent = bal.textContent;
});
