/* Teratak Rimba Abam Peah — borang Tempah & Bayar Online (Bayarcash FPX) */
import { PAKEJ, quote, todayMY, addDays, MAX_NIGHTS } from './pricing.mjs?v=20261107-2';

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

  form.addEventListener('input', e => { if (e.target === f.pakej) syncFields(); render(); showErr(''); });
  form.addEventListener('change', e => { if (e.target === f.pakej) syncFields(); render(); });

  /* Pautan "Tempah & bayar online" pada kad pakej / modal → pilih pakej & skrol ke borang */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-book]');
    if (!a || !PAKEJ[a.dataset.book]) return;
    e.preventDefault();
    const modal = $('#modal');
    if (modal && !modal.hidden) modal.querySelector('[data-close]')?.click();
    f.pakej.value = a.dataset.book;
    syncFields(); render();
    $('#tempah').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => f.checkin.focus({ preventScroll: true }), 600);
  });

  /* Semak sama ada bayaran dalam talian aktif (Netlify Functions + kunci Bayarcash) */
  fetch('/api/config', { headers: { Accept: 'application/json' } })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(c => {
      online = !!c.enabled;
      if (online && c.mode !== 'production') { modeEl.hidden = false; modeEl.textContent = 'Mod ujian (sandbox) — tiada wang sebenar ditolak.'; }
      if (!online) offline();
    })
    .catch(() => { online = false; offline(); });

  function offline() {
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
    if (f.name.value.trim().length < 2) { f.name.focus(); return showErr('Sila masukkan nama penuh.'); }
    if (!f.email.checkValidity() || !f.email.value) { f.email.focus(); return showErr('Sila masukkan emel yang sah.'); }
    if (f.phone.value.replace(/\D/g, '').length < 9) { f.phone.focus(); return showErr('Sila masukkan nombor telefon yang sah.'); }
    if (!f.agree.checked) { f.agree.focus(); return showErr('Sila tandakan persetujuan Terma & Polisi.'); }

    pay.disabled = true; payTxt.textContent = 'Menyambung ke Bayarcash…';
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data(), name: f.name.value, email: f.email.value, phone: f.phone.value, notes: f.notes.value, agree: f.agree.checked, website: f.website.value })
      });
      const out = await res.json().catch(() => ({}));
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

  syncFields(); render();
}
