/* Teratak Rimba Abam Peah — borang Tempah & Bayar Online (CHIP Collect) */
import { PAKEJ, UNITS, quote, todayMY, addDays, nightDates, MAX_NIGHTS } from './pricing.mjs?v=20261107-4';

const WA = 'https://hi.jomwasap.my/naksewateratak';
const $ = s => document.querySelector(s);
const form = $('#bookForm');
if (form) init();

function init() {
  const f = {
    pakej: $('#bkPakej'), checkin: $('#bkIn'), nights: $('#bkNights'), units: $('#bkUnits'), tents: $('#bkTents'),
    adults: $('#bkAdults'), teens: $('#bkTeens'), children: $('#bkChildren'),
    name: $('#bkName'), email: $('#bkEmail'), phone: $('#bkPhone'), notes: $('#bkNotes'), agree: $('#bkAgree'),
    website: form.querySelector('[name="website"]')
  };
  const err = $('#bkErr'), pay = $('#bkPay'), payTxt = $('#bkPayTxt'), modeEl = $('#bkMode');
  let online = null; // null = belum tahu, true/false selepas /api/config

  const today = todayMY();
  f.checkin.min = today;
  f.checkin.max = addDays(today, 365);
  f.checkin.value = addDays(today, 1);
  f.nights.max = MAX_NIGHTS;

  const rm = n => 'RM' + Number(n).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = ymd => new Date(ymd + 'T00:00:00').toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const data = () => ({
    pakej: f.pakej.value, checkin: f.checkin.value, nights: f.nights.value, units: f.units.value, tents: f.tents.value,
    adults: f.adults.value, teens: f.teens.value, children: f.children.value
  });

  function syncFields() {
    const p = PAKEJ[f.pakej.value];
    const camping = p.type === 'camping';
    $('#bkUnitsF').hidden = camping || p.maxUnits < 2;
    f.units.max = p.maxUnits || 1;
    if (+f.units.value > (p.maxUnits || 1)) f.units.value = p.maxUnits || 1;
    $('#bkUnitsMax').textContent = p.maxUnits > 1 ? `maks. ${p.maxUnits}` : '';
    $('#bkTentsF').hidden = !p.tents;
    if (!p.tents) f.tents.value = 0;
  }

  function render() {
    const q = quote(data());
    $('#bkSumName').textContent = PAKEJ[f.pakej.value].name;
    $('#bkSumDates').textContent = q.checkout
      ? `${fmtDate(q.checkin)} → ${fmtDate(q.checkout)} · ${q.nights} malam`
      : (q.errors[0] || 'Pilih tarikh masuk');
    $('#bkLines').innerHTML = '';
    q.lines.forEach(l => {
      const li = document.createElement('li');
      li.innerHTML = '<span></span><b></b>';
      li.firstChild.textContent = l.label; li.lastChild.textContent = l.amount ? rm(l.amount) : 'PERCUMA';
      $('#bkLines').appendChild(li);
    });
    $('#bkTotal').textContent = rm(q.total);
    return q;
  }

  const showErr = msg => { err.textContent = msg; err.hidden = !msg; };

  /* ---------- Kalendar kekosongan ---------- */
  const cal = $('#bkCal'), calGrid = $('#calGrid'), calMonth = $('#calMonth'), availEl = $('#bkAvail');
  let avail = null;           // { pakej, total, busy: { date: n } }
  let month = today.slice(0, 7);
  const MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
  const wantUnits = () => Math.max(1, parseInt(f.units.value, 10) || 1);
  const freeOn = d => avail ? avail.total - (avail.busy[d] || 0) : Infinity;
  const isFull = d => freeOn(d) < wantUnits();
  function conflicts() {
    const q = quote(data());
    if (!avail || avail.pakej !== f.pakej.value || !q.checkout) return [];
    return nightDates(q.checkin, q.nights).filter(isFull);
  }

  async function loadAvail() {
    const pk = f.pakej.value;
    if (!UNITS[pk]) { avail = null; cal.hidden = true; return; }
    try {
      const r = await fetch(`/api/availability?pakej=${pk}&from=${today}&days=400`, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw 0;
      const a = await r.json();
      if (f.pakej.value !== pk) return;
      avail = { pakej: pk, total: a.total, busy: a.busy || {} };
      cal.hidden = false;
    } catch { avail = null; cal.hidden = true; }
    renderCal(); checkAvail();
  }

  function renderCal() {
    if (!avail) return;
    const [y, m] = month.split('-').map(Number);
    calMonth.textContent = `${MONTHS[m - 1]} ${y}`;
    $('#calPrev').disabled = month <= today.slice(0, 7);
    $('#calNext').disabled = month >= addDays(today, 365).slice(0, 7);
    const first = `${month}-01`;
    const lead = (new Date(first + 'T00:00:00Z').getUTCDay() + 6) % 7; // Isnin dahulu
    const q = quote(data());
    const sel = q.checkout ? new Set(nightDates(q.checkin, q.nights)) : new Set();
    const max = addDays(today, 365);
    let html = ['Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa', 'Ah'].map(d => `<span class="cal__dow">${d}</span>`).join('');
    html += '<span></span>'.repeat(lead);
    for (let d = first; d.slice(0, 7) === month; d = addDays(d, 1)) {
      const past = d < today || d > max, full = !past && isFull(d);
      const cls = ['cal__d', past ? 'is-past' : '', full ? 'is-full' : '', sel.has(d) ? 'is-sel' : '', d === q.checkin ? 'is-in' : ''].join(' ');
      const label = `${+d.slice(8)} ${MONTHS[m - 1]}${full ? ' — penuh' : ''}`;
      html += `<button type="button" class="${cls}" data-d="${d}" ${past ? 'disabled' : ''} aria-label="${label}">${+d.slice(8)}${avail.total > 1 && !past ? `<small>${Math.max(0, freeOn(d))}</small>` : ''}</button>`;
    }
    calGrid.innerHTML = html;
  }
  calGrid.addEventListener('click', e => {
    const b = e.target.closest('button[data-d]');
    if (!b || b.disabled) return;
    f.checkin.value = b.dataset.d;
    render(); renderCal(); checkAvail(); showErr('');
  });
  const shiftMonth = n => { const [y, m] = month.split('-').map(Number); const d = new Date(Date.UTC(y, m - 1 + n, 1)); month = d.toISOString().slice(0, 7); renderCal(); };
  $('#calPrev').addEventListener('click', () => shiftMonth(-1));
  $('#calNext').addEventListener('click', () => shiftMonth(1));

  function checkAvail() {
    if (!avail) { availEl.hidden = true; return []; }
    const c = conflicts();
    const q = quote(data());
    availEl.hidden = !q.checkout;
    availEl.className = 'avail ' + (c.length ? 'avail--no' : 'avail--ok');
    availEl.textContent = c.length
      ? `✕ Penuh pada ${c.slice(0, 4).map(d => fmtDate(d)).join(', ')}${c.length > 4 ? '…' : ''}. Sila pilih tarikh lain.`
      : `✓ Tarikh tersedia${avail.total > 1 ? ` (${wantUnits()} unit)` : ''}`;
    if (online !== false) pay.disabled = c.length > 0;
    return c;
  }

  const sameMonth = () => { if (f.checkin.value && f.checkin.value.slice(0, 7) !== month) { month = f.checkin.value.slice(0, 7); } };
  form.addEventListener('input', e => {
    if (e.target === f.pakej) { syncFields(); loadAvail(); }
    if (e.target === f.checkin) sameMonth();
    render(); renderCal(); checkAvail(); showErr('');
  });
  form.addEventListener('change', e => { if (e.target === f.pakej) { syncFields(); loadAvail(); } render(); renderCal(); checkAvail(); });

  /* Pautan "Tempah & bayar online" pada kad pakej / modal → pilih pakej & skrol ke borang */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-book]');
    if (!a || !PAKEJ[a.dataset.book]) return;
    e.preventDefault();
    const modal = $('#modal');
    if (modal && !modal.hidden) modal.querySelector('[data-close]')?.click();
    f.pakej.value = a.dataset.book;
    syncFields(); render(); loadAvail();
    $('#tempah').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => f.checkin.focus({ preventScroll: true }), 600);
  });

  /* Semak sama ada bayaran dalam talian aktif (Netlify Functions + kunci CHIP) */
  fetch('/api/config', { headers: { Accept: 'application/json' } })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(c => {
      online = !!c.enabled;
      if (online && c.mode === 'test') { modeEl.hidden = false; modeEl.textContent = 'Mod ujian — guna kunci ujian CHIP, tiada wang sebenar ditolak.'; }
      if (!online) offline();
    })
    .catch(() => { online = false; offline(); });

  function offline() {
    pay.disabled = false;
    payTxt.textContent = 'Tempah melalui WhatsApp';
    modeEl.hidden = false;
    modeEl.textContent = 'Bayaran online belum diaktifkan. Tekan butang di atas untuk tempah melalui WhatsApp.';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    showErr('');
    const q = render();
    if (online === false) { window.open(WA, '_blank', 'noopener'); return; }
    if (!q.ok) return showErr(q.errors[0]);
    if (checkAvail().length) return showErr('Tarikh dipilih sudah penuh. Sila pilih tarikh lain pada kalendar.');
    if (f.name.value.trim().length < 2) { f.name.focus(); return showErr('Sila masukkan nama penuh.'); }
    if (!f.email.checkValidity() || !f.email.value) { f.email.focus(); return showErr('Sila masukkan emel yang sah.'); }
    if (f.phone.value.replace(/\D/g, '').length < 9) { f.phone.focus(); return showErr('Sila masukkan nombor telefon yang sah.'); }
    if (!f.agree.checked) { f.agree.focus(); return showErr('Sila tandakan persetujuan Terma & Polisi.'); }

    pay.disabled = true; payTxt.textContent = 'Menyambung ke CHIP…';
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data(), name: f.name.value, email: f.email.value, phone: f.phone.value, notes: f.notes.value, agree: f.agree.checked, website: f.website.value })
      });
      const out = await res.json().catch(() => ({}));
      if (res.status === 409) loadAvail();
      if (!res.ok || !out.url) throw new Error(out.error || 'Maaf, bayaran tidak dapat dimulakan. Sila cuba lagi.');
      try {
        sessionStorage.setItem('tr-booking', JSON.stringify({ order: out.order_number, name: q.name, checkin: q.checkin, checkout: q.checkout, nights: q.nights, lines: q.lines, total: out.total }));
      } catch { /* storan mungkin disekat; halaman keputusan tetap berfungsi */ }
      window.location.assign(out.url);
    } catch (ex) {
      showErr(ex.message);
      pay.disabled = false; payTxt.textContent = 'Bayar Sekarang';
    }
  });

  syncFields(); render(); loadAvail();
}
