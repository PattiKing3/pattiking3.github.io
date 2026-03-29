// ══════════════════════════════════════
// Patti King — Home Page JavaScript
// ══════════════════════════════════════

// ── Component Loader Utility ──
// header.html आणि footer.html load करण्यासाठी
function loadComponent(placeholderId, filePath, callback) {
  fetch(filePath)
    .then(res => res.text())
    .then(html => {
      document.getElementById(placeholderId).innerHTML = html;
      if (callback) callback();
    })
    .catch(err => console.error('Component load error:', filePath, err));
}

// ══ TOAST ══
let toastTimer = null;
function toast(msg, type) {
  if (!msg) return;
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.className = 'toast' + (type ? ' ' + type : '');
  el.classList.add('show');
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ══ BOTTOM NAV ══
function setNav(el, page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  if (page === 'wallet')      { window.location.href = 'wallet.html'; return; }
  if (page === 'lobby')       { window.location.href = 'game_lobby.html'; return; }
  if (page === 'friends')     { toast('Friends page coming soon...', ''); }
  if (page === 'leaderboard') { toast('Leaderboard coming soon...', ''); }
}

// ══ SIDE MENU ══
function openMenu()  {
  document.getElementById('sideMenu').classList.add('show');
  document.getElementById('menuOverlay').classList.add('show');
}
function closeMenu() {
  document.getElementById('sideMenu').classList.remove('show');
  document.getElementById('menuOverlay').classList.remove('show');
}
function menuNav(label) {
  closeMenu();
  const pageMap = {
    'My Profile':          'profile.html',
    'Settings':            'settings.html',
    'Transaction History': 'transactions.html',
    'Refer & Earn':        'refer.html',
    'Help & Support':      'help.html',
    'About':               'about.html',
  };
  if (pageMap[label]) { window.location.href = pageMap[label]; return; }
  if (label === 'Logout') { 
    if (typeof window.logoutUser === 'function') {
      window.logoutUser();
    } else {
      toast('Logout service is not ready...', 'error');
    }
    return; 
  }
  toast('Opening ' + label + '...', '');
}

// ══ CATEGORY TAB → Game Lobby ══
function openGLMode(mode) {
  window.location.href = 'game_lobby.html?mode=' + mode;
}
function goToWallet() { window.location.href = 'wallet.html'; }

// ══ NOTIFICATIONS ══
let unreadCount = 3;
function openNotif()  {
  document.getElementById('notifOverlay').classList.add('show');
  document.getElementById('notifPopup').classList.add('show');
}
function closeNotif() {
  document.getElementById('notifOverlay').classList.remove('show');
  document.getElementById('notifPopup').classList.remove('show');
}
function readNotif(el) {
  if (el.classList.contains('unread')) {
    el.classList.remove('unread');
    const dot = el.querySelector('.notif-unread-dot');
    if (dot) dot.remove();
    unreadCount = Math.max(0, unreadCount - 1);
    updateNotifBadge();
  }
}
function markAllRead() {
  document.querySelectorAll('.notif-row.unread').forEach(r => {
    r.classList.remove('unread');
    const d = r.querySelector('.notif-unread-dot');
    if (d) d.remove();
  });
  unreadCount = 0;
  updateNotifBadge();
  document.getElementById('notifCount').style.display = 'none';
}
function updateNotifBadge() {
  const dot   = document.getElementById('notifDot');
  const badge = document.getElementById('notifCount');
  if (unreadCount === 0) {
    if (dot)   dot.style.display   = 'none';
    if (badge) badge.style.display = 'none';
  } else {
    if (badge) badge.textContent = unreadCount + ' New';
  }
}

// ══ GAME PANEL TABS ══
function setGamePanel(el, mode) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + mode);
  if (panel) panel.classList.add('active');
}
function setCoinTab(el, type) {
  el.closest('.sub-tabs-row').querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#panel-coin-games .coin-sub-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('coin-' + type);
  if (panel) panel.classList.add('active');
}
function setTournTab(el, type) {
  el.closest('.sub-tabs-row').querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const msgs = {
    all: 'All Tournaments',
    free: 'Free Tournaments',
    gtd: 'GTD Tournaments',
    exclusive: 'Exclusive Tournaments'
  };
  toast(msgs[type] || type, '');
}
function setPracTab(el, type) {
  el.closest('.sub-tabs-row').querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#panel-practice .coin-sub-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('prac-' + type);
  if (panel) panel.classList.add('active');
}
function selectPbox(el) {
  const pb = el.closest('.ctc-players-box');
  if (pb) pb.querySelectorAll('.ctc-pbox').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// ══ COUNTDOWN (Featured Banner) ══
let totalSec = 3 * 3600 + 47 * 60 + 22;
function updateCountdown() {
  if (totalSec <= 0) return;
  totalSec--;
  document.getElementById('cdHr').textContent  = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  document.getElementById('cdMin').textContent = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  document.getElementById('cdSec').textContent = String(totalSec % 60).padStart(2, '0');
}
setInterval(updateCountdown, 1000);

// ══ CHALLENGERS TIMER ══
let chSec = 4 * 3600 + 39 * 60 + 34;
function updateChTimer() {
  if (chSec <= 0) return;
  chSec--;
  const h  = String(Math.floor(chSec / 3600)).padStart(2, '0');
  const m  = String(Math.floor((chSec % 3600) / 60)).padStart(2, '0');
  const s  = String(chSec % 60).padStart(2, '0');
  const el = document.getElementById('chTimer');
  if (el) el.textContent = h + ':' + m + ':' + s;
}
setInterval(updateChTimer, 1000);

// ══ POINTS SLIDER ══
const PT_STEPS = [
  { name: 'Micro', val: '0.05', max: '8,000',    fee: '4'   },
  { name: 'Low',   val: '0.10', max: '16,000',   fee: '8'   },
  { name: 'Mid',   val: '0.50', max: '80,000',   fee: '40'  },
  { name: 'High',  val: '1.00', max: '1,60,000', fee: '80'  },
  { name: 'Elite', val: '2.00', max: '3,20,000', fee: '160' },
];
let ptStep = 1, ptPlayers = 6, hDragging = false;

function selectPtPlayer(n) {
  ptPlayers = n;
  document.getElementById('ptPl6').classList.toggle('active', n === 6);
  document.getElementById('ptPl2').classList.toggle('active', n === 2);
}
function setHSlider(idx) {
  ptStep = Math.max(0, Math.min(PT_STEPS.length - 1, idx));
  const s   = PT_STEPS[ptStep];
  const pct = (ptStep / (PT_STEPS.length - 1)) * 100;
  const fill  = document.getElementById('pt-hs-fill');
  const thumb = document.getElementById('pt-hs-thumb');
  if (fill)  fill.style.width = pct + '%';
  if (thumb) { thumb.style.left = pct + '%'; thumb.textContent = '₹'; }
  document.querySelectorAll('.pt-hs-step').forEach(el =>
    el.classList.toggle('active', parseInt(el.dataset.idx) === ptStep)
  );
  const vn = document.getElementById('ptValNum');
  const mn = document.getElementById('ptMaxNum');
  const fn = document.getElementById('ptFeeNum');
  if (vn) vn.textContent = s.val;
  if (mn) mn.textContent = s.max;
  if (fn) fn.textContent = s.fee;
}
function stepHSlider(dir) { setHSlider(ptStep + dir); }
function startHDrag(e) { e.stopPropagation(); hDragging = true; moveHDrag(e); }
function moveHDrag(e) {
  if (!hDragging) return;
  const track = document.getElementById('pt-hs-track');
  if (!track) return;
  const rect    = track.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct     = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  setHSlider(Math.round(pct * (PT_STEPS.length - 1)));
}
document.addEventListener('mousemove', e => { if (hDragging) moveHDrag(e); });
document.addEventListener('touchmove', e => { if (hDragging) moveHDrag(e); }, { passive: true });
document.addEventListener('mouseup',  () => hDragging = false);
document.addEventListener('touchend', () => hDragging = false);

// ══ POOL SLIDER ══
const POOL_STEPS = ['5','10','25','50','100','250','500','1000','2500','5000'];
let poolStep = 0, poolVariant = 101, poolPlayers = 6, poolDragging = false;

function setPoolVariant(v) {
  poolVariant = v;
  document.getElementById('poolBtn101').classList.toggle('active', v === 101);
  document.getElementById('poolBtn201').classList.toggle('active', v === 201);
  document.getElementById('poolMaxPts').textContent = v;
  updatePoolUnified();
}
function selectPoolPlayer(el, n) {
  poolPlayers = n;
  document.getElementById('poolPl6').classList.toggle('active', n === 6);
  document.getElementById('poolPl2').classList.toggle('active', n === 2);
}
function updatePoolUnified() {
  const fee   = POOL_STEPS[poolStep];
  const pct   = (poolStep / (POOL_STEPS.length - 1)) * 100;
  const fill  = document.getElementById('poolUnifiedFill');
  const thumb = document.getElementById('poolUnifiedThumb');
  if (fill)  fill.style.width  = pct + '%';
  if (thumb) { thumb.style.left = pct + '%'; thumb.textContent = '₹'; }
  const fl = document.getElementById('poolFeeLeft');
  const fr = document.getElementById('poolFeeRight');
  if (fl) fl.textContent = fee;
  if (fr) fr.textContent = fee;
  document.getElementById('poolUnifiedTicks').querySelectorAll('.pt-hs-tick').forEach((t, i) =>
    t.classList.toggle('active', i <= poolStep)
  );
}
function stepPoolUnified(dir) {
  poolStep = Math.max(0, Math.min(POOL_STEPS.length - 1, poolStep + dir));
  updatePoolUnified();
}
function startPoolUnifiedDrag(e) { e.stopPropagation(); poolDragging = true; movePoolDrag(e); }
function movePoolDrag(e) {
  if (!poolDragging) return;
  const track = document.getElementById('poolUnifiedTrack');
  if (!track) return;
  const rect    = track.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct     = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  poolStep = Math.round(pct * (POOL_STEPS.length - 1));
  updatePoolUnified();
}
document.addEventListener('mousemove', e => { if (poolDragging) movePoolDrag(e); });
document.addEventListener('touchmove', e => { if (poolDragging) movePoolDrag(e); }, { passive: true });
document.addEventListener('mouseup',  () => poolDragging = false);
document.addEventListener('touchend', () => poolDragging = false);
function joinPoolNow() {
  toast('Joining Pool Rummy ' + poolVariant + ' — ' + poolPlayers + ' Players — ₹' + POOL_STEPS[poolStep] + ' Entry...', 'success');
}

// ══ DEALS SLIDER ══
const DEALS_STEPS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
let dealsStep = 0, dealsType = 2, dealsPlayers = 2, dealsDragging = false;

function setDealsType(n) {
  dealsType = n;
  document.getElementById('dealBtn2').classList.toggle('active', n === 2);
  document.getElementById('dealBtn6').classList.toggle('active', n === 6);
  setDealsSlider(dealsStep);
}
function selectDealsPlayer(n) {
  dealsPlayers = n;
  document.getElementById('dealsPl2').classList.toggle('active', n === 2);
  document.getElementById('dealsPl6').classList.toggle('active', n === 6);
}
function setDealsSlider(idx) {
  dealsStep = Math.max(0, Math.min(DEALS_STEPS.length - 1, idx));
  const fee   = DEALS_STEPS[dealsStep];
  const pct   = (dealsStep / (DEALS_STEPS.length - 1)) * 100;
  const fill  = document.getElementById('dealsFill');
  const thumb = document.getElementById('dealsThumb');
  if (fill)  fill.style.width  = pct + '%';
  if (thumb) { thumb.style.left = pct + '%'; thumb.textContent = '₹'; }
  const fl = document.getElementById('dealsFeeLeft');
  const fr = document.getElementById('dealsFeeRight');
  if (fl) fl.textContent = fee.toLocaleString('en-IN');
  if (fr) fr.textContent = fee.toLocaleString('en-IN');
  document.getElementById('dealsTicks').querySelectorAll('.pt-hs-tick').forEach((t, i) =>
    t.classList.toggle('active', i <= dealsStep)
  );
}
function stepDealsSlider(dir) { setDealsSlider(dealsStep + dir); }
function startDealsDrag(e) { e.stopPropagation(); dealsDragging = true; moveDealsDrag(e); }
function moveDealsDrag(e) {
  if (!dealsDragging) return;
  const track = document.getElementById('dealsTrack');
  if (!track) return;
  const rect    = track.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct     = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  setDealsSlider(Math.round(pct * (DEALS_STEPS.length - 1)));
}
document.addEventListener('mousemove', e => { if (dealsDragging) moveDealsDrag(e); });
document.addEventListener('touchmove', e => { if (dealsDragging) moveDealsDrag(e); }, { passive: true });
document.addEventListener('mouseup',  () => dealsDragging = false);
document.addEventListener('touchend', () => dealsDragging = false);
function playDealsNow() {
  toast('Joining Deals Rummy — ' + dealsType + ' Deals — ' + dealsPlayers + ' Players — ₹' + DEALS_STEPS[dealsStep].toLocaleString('en-IN') + ' Entry...', 'success');
}

// ══ INIT ══
document.addEventListener('DOMContentLoaded', () => {
  setHSlider(1);
  updatePoolUnified();
  setDealsSlider(0);

  const poolTrack  = document.getElementById('poolUnifiedTrack');
  const dealsTrack = document.getElementById('dealsTrack');
  if (poolTrack)  poolTrack.addEventListener('click',  e => { e.stopPropagation(); movePoolDrag(e); });
  if (dealsTrack) dealsTrack.addEventListener('click', e => { e.stopPropagation(); moveDealsDrag(e); });
});
