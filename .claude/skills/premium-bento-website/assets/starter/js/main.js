/* Premium Bento Website — interaksi laman (generik, tanpa kebergantungan).
   Tetapkan pautan WhatsApp di bawah; semua elemen [data-wa] akan menggunakannya. */
const BOOKING_URL = '{{WA_URL}}';

(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const IMG = 'assets/img/';

  /* ---------- Semua butang tempahan → satu pautan WhatsApp ---------- */
  if (!BOOKING_URL.includes('{{')) $$('[data-wa]').forEach(a => { a.href = BOOKING_URL; a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- Marquee: gandakan item untuk gelungan lancar (animasi translateX(-50%)) ---------- */
  const mq = $('#marquee');
  if (mq) [...mq.children].forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); mq.appendChild(c); });

  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Nav: bayang semasa skrol, menu telefon, pautan aktif ---------- */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu'), totop = $('.totop');
  const onScroll = () => { nav.classList.toggle('is-scrolled', scrollY > 10); totop && totop.classList.toggle('is-on', scrollY > 900); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const setMenu = open => { menu.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu'); };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  const links = $$('.menu a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(l => { const t = $(l.getAttribute('href')); if (t) spy.observe(t); });
  }

  /* ---------- Animasi muncul semasa skrol (hormati prefers-reduced-motion) ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('is-in'));

  /* ---------- Penapis kad ---------- */
  const pkgs = $('#pkgs');
  $$('[data-filter]').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    $$('[data-filter]').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    pkgs && pkgs.classList.toggle('is-filtered', f !== 'all');
    $$('.pkg', pkgs || document).forEach(c => { const show = f === 'all' || c.dataset.type === f; c.classList.toggle('is-hidden', !show); if (show) c.classList.add('is-in'); });
  }));

  /* ---------- Lapisan dialog: buka/tutup + perangkap fokus ---------- */
  let lastFocus = null;
  const openLayer = el => { lastFocus = document.activeElement; el.hidden = false; document.body.classList.add('lock'); $('[data-close]', el)?.focus(); };
  const closeLayer = el => { el.hidden = true; if (!$('.modal:not([hidden]), .lb:not([hidden])')) document.body.classList.remove('lock'); lastFocus?.focus?.(); };
  const trap = (el, e) => {
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', el).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  };
  const swipe = (el, prev, next) => {
    let x0 = null;
    el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) (dx > 0 ? prev : next)(); });
  };

  /* ---------- Lightbox (galeri + poster) ---------- */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbList = [], lbIdx = 0;
  const showLb = i => {
    lbIdx = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIdx].src; lbImg.alt = lbList[lbIdx].cap;
    lbCap.textContent = lbList[lbIdx].cap + (lbList.length > 1 ? `  ·  ${lbIdx + 1} / ${lbList.length}` : '');
    $('#lbPrev').hidden = $('#lbNext').hidden = lbList.length < 2;
  };
  const openLb = (list, i) => { lbList = list; showLb(i); openLayer(lb); };
  if (lb) {
    $('#lbPrev').addEventListener('click', () => showLb(lbIdx - 1));
    $('#lbNext').addEventListener('click', () => showLb(lbIdx + 1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-close]')) closeLayer(lb); });
    swipe(lbImg, () => showLb(lbIdx - 1), () => showLb(lbIdx + 1));
  }
  const galBtns = $$('#gallery [data-full]');
  const galItems = galBtns.map(b => ({ src: b.dataset.full, cap: b.dataset.cap || '' }));
  galBtns.forEach((b, i) => b.addEventListener('click', () => openLb(galItems, i)));

  /* ---------- Modal kad: imej daripada data-gallery, maklumat daripada kad itu sendiri ---------- */
  const modal = $('#modal');
  let mList = [], mIdx = 0, mName = '', mPoster = '';
  const big = n => n.includes('/') ? n : `${IMG}${n}-800.webp`;
  const small = n => n.includes('/') ? n : `${IMG}${n}-400.webp`;
  const showM = i => {
    mIdx = (i + mList.length) % mList.length;
    $('#mImg').src = big(mList[mIdx]); $('#mImg').alt = `${mName} — gambar ${mIdx + 1}`;
    $$('#mThumbs button').forEach((t, k) => t.classList.toggle('is-on', k === mIdx));
  };
  const openCard = card => {
    if (!modal || !card) return;
    mName = $('h3', card).textContent;
    $('#mName').textContent = mName;
    $('#mDesc').textContent = ($('.pkg__desc', card) || $('.tag', card))?.textContent || '';
    $('#mPrice').innerHTML = $('.price', card)?.innerHTML || '';
    $('#mFac').innerHTML = '';
    $$('.fac li', card).forEach(li => { const n = document.createElement('li'); n.textContent = li.textContent; $('#mFac').appendChild(n); });
    mList = (card.dataset.gallery || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!mList.length) mList = [$('.pkg__media img', card)?.getAttribute('src')].filter(Boolean);
    $('#mThumbs').innerHTML = mList.map((n, k) => `<button type="button" aria-label="Gambar ${k + 1}"><img src="${small(n)}" alt="" loading="lazy"></button>`).join('');
    $$('#mThumbs button').forEach((t, k) => t.addEventListener('click', () => showM(k)));
    mPoster = card.dataset.poster || '';
    $('#mPoster').hidden = !mPoster;
    $('#mWa').setAttribute('aria-label', 'Booking Now — ' + mName);
    showM(0); openLayer(modal);
  };
  $$('[data-open]').forEach(b => b.addEventListener('click', () => openCard(b.closest('.pkg'))));
  $$('.pkg__media').forEach(m => { m.style.cursor = 'zoom-in'; m.addEventListener('click', () => openCard(m.closest('.pkg'))); });
  if (modal) {
    $('#mPrev').addEventListener('click', () => showM(mIdx - 1));
    $('#mNext').addEventListener('click', () => showM(mIdx + 1));
    $('#mPoster').addEventListener('click', () => openLb([{ src: big(mPoster).replace('-800.webp', '-1200.webp'), cap: 'Poster harga rasmi — ' + mName }], 0));
    modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) closeLayer(modal); });
    swipe($('#mImg'), () => showM(mIdx - 1), () => showM(mIdx + 1));
  }

  document.addEventListener('keydown', e => {
    const top = lb && !lb.hidden ? lb : modal && !modal.hidden ? modal : null;
    if (!top) { if (e.key === 'Escape') setMenu(false); return; }
    trap(top, e);
    if (e.key === 'Escape') closeLayer(top);
    if (e.key === 'ArrowLeft') top === lb ? showLb(lbIdx - 1) : showM(mIdx - 1);
    if (e.key === 'ArrowRight') top === lb ? showLb(lbIdx + 1) : showM(mIdx + 1);
  });

  /* ---------- Peta: muat hanya bila hampir kelihatan ---------- */
  const map = $('#lokasi iframe[data-src]');
  if (map) {
    const load = () => { if (!map.src) map.src = map.dataset.src; };
    if ('IntersectionObserver' in window) { const mo = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { load(); mo.disconnect(); } }, { rootMargin: '400px' }); mo.observe(map); } else load();
  }
  const cp = $('#copyCoords');
  if (cp) cp.addEventListener('click', () => {
    const t = $('#coords').textContent;
    const done = () => { cp.textContent = 'Disalin ✓'; setTimeout(() => { cp.textContent = 'Salin'; }, 1800); };
    navigator.clipboard ? navigator.clipboard.writeText(t).then(done, () => prompt('Salin:', t)) : prompt('Salin:', t);
  });

  /* ---------- Video: jeda bila keluar skrin ---------- */
  const vid = $('video');
  if (vid && 'IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && !vid.paused) vid.pause(); }), { threshold: 0.2 }).observe(vid);

  /* ---------- Voice note (lihat references/voice-note.md) ---------- */
  const vn = $('#vn'), audio = $('#vnAudio');
  if (vn && audio) {
    const play = $('#vnPlay'), track = $('#vnTrack'), time = $('#vnTime');
    const fmt = s => { s = Math.max(0, Math.floor(isFinite(s) ? s : 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
    /* Chrome kadang-kadang melaporkan tempoh Opus/OGG sebagai Infinity → guna data-duration */
    const dur = () => (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : +audio.dataset.duration || 0;
    const sync = () => {
      const d = dur(), p = d ? Math.min(100, (audio.currentTime / d) * 100) : 0;
      track.style.setProperty('--p', p + '%');
      track.setAttribute('aria-valuenow', String(Math.round(p)));
      time.textContent = fmt(audio.paused && !audio.currentTime ? d : audio.currentTime);
    };
    const ready = () => { vn.hidden = false; sync(); };            // papar hanya jika audio boleh dimuat
    audio.addEventListener('loadedmetadata', ready);
    if (audio.readyState >= 1) ready();
    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('play', () => { vn.classList.add('is-playing'); play.setAttribute('aria-label', 'Jeda voice note'); });
    audio.addEventListener('pause', () => { vn.classList.remove('is-playing'); play.setAttribute('aria-label', 'Main voice note'); });
    audio.addEventListener('ended', () => { audio.currentTime = 0; sync(); });
    play.addEventListener('click', () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); });
    const seek = x => { const r = track.getBoundingClientRect(), d = dur(); if (d) audio.currentTime = Math.min(1, Math.max(0, (x - r.left) / r.width)) * d; sync(); };
    track.addEventListener('click', e => seek(e.clientX));
    track.addEventListener('keydown', e => {
      if (!dur()) return;
      if (e.key === 'ArrowRight') { audio.currentTime = Math.min(dur(), audio.currentTime + 3); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 3); e.preventDefault(); }
      if (e.key === ' ' || e.key === 'Enter') { play.click(); e.preventDefault(); }
      sync();
    });
    audio.addEventListener('play', () => vid && !vid.paused && vid.pause());
    vid && vid.addEventListener('play', () => !audio.paused && audio.pause());

    /* Auto-main: pelayar menyekat bunyi sebelum interaksi. Cuba terus; jika disekat, main pada
       sentuhan/klik/kekunci PERTAMA di mana-mana (bukan skrol). Sekali sahaja; jeda pelawat dihormati. */
    let started = false;
    const EVTS = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
    const disarm = () => { EVTS.forEach(t => document.removeEventListener(t, onFirst, true)); vn.classList.remove('is-waiting'); };
    audio.addEventListener('play', () => { started = true; disarm(); });
    function onFirst(e) {
      if (started) return disarm();
      if (e.type === 'keydown' && e.key === 'Escape') return;
      if (e.target.closest && e.target.closest('#vn, video')) return; // butang sendiri mengurus main/jeda
      audio.play().catch(() => {});
    }
    const arm = () => { if (started) return; vn.classList.add('is-waiting'); EVTS.forEach(t => document.addEventListener(t, onFirst, true)); };
    const p = audio.play();
    if (p && p.catch) p.catch(arm); else if (audio.paused) arm();
  }
})();
