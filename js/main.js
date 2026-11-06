/* Teratak Rimba Abam Peah — interaksi laman
   Pautan tempahan (semua butang Booking Now / WhatsApp) */
const BOOKING_URL = 'https://hi.jomwasap.my/naksewateratak';

(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const IMG = 'assets/img/';

  /* Pastikan setiap butang tempahan menuju ke pautan yang sama */
  $$('[data-wa]').forEach(a => { a.href = BOOKING_URL; a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- Marquee: gandakan item untuk gelungan lancar ---------- */
  const mq = $('#marquee');
  if (mq) [...mq.children].forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); mq.appendChild(c); });

  /* ---------- Tahun footer ---------- */
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state, menu mobile, pautan aktif ---------- */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu'), totop = $('.totop');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 10);
    totop.classList.toggle('is-on', y > 900);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  const links = $$('.menu a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(l => { const t = $(l.getAttribute('href')); if (t) spy.observe(t); });
  }

  /* ---------- Reveal semasa skrol ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('is-in'));

  /* ---------- Data gambar setiap pakej (aset sebenar) ---------- */
  const PKG = {
    ramlee:     { poster: 'poster-ramlee',     photos: ['ramlee-luar', 'ramlee-tangga', 'ramlee-anjung2', 'ramlee-anjung', 'ramlee-ruang', 'ramlee-bilik'], extra: ['ramlee-tepi'] },
    abampeah:   { poster: 'poster-abampeah',   photos: ['abampeah-luar', 'abampeah-anjung', 'abampeah-bilik', 'abampeah-bilik2', 'abampeah-balkoni', 'abampeah-bilikair'], extra: ['abampeah-tepi'] },
    glamping:   { poster: 'poster-glamping',   photos: ['glamping-luar', 'glamping-dalam', 'glamping-katil', 'glamping-tapak'] },
    ajis:       { poster: 'poster-ajis',       photos: ['ajis-luar', 'ajis-depan', 'ajis-bilik', 'ajis-beranda', 'ajis-bilikair'] },
    sudin:      { poster: 'poster-sudin',      photos: ['sudin-luar', 'sudin-sisi', 'sudin-bilik', 'sudin-beranda', 'sudin-bilikair'] },
    jambatan:   { poster: 'poster-jambatan',   photos: ['jambatan-luar', 'jambatan-sisi', 'jambatan-bilik', 'jambatan-bilik2'] },
    hajibakhil: { poster: 'poster-hajibakhil', photos: ['hajibakhil-luar', 'hajibakhil-depan', 'hajibakhil-bilik', 'hajibakhil-bilik2'] },
    camping:    { poster: 'poster-camping',    photos: ['camping-tapak', 'camping-dewan-luar', 'camping-dewan2', 'camping-dewan'], extra: ['khemah-tapak', 'khemah-pasang'] }
  };
  /* Gambar sebenar (bukan potongan poster) hanya ada saiz 480/960 */
  const REAL = new Set(['ramlee-tepi', 'abampeah-tepi', 'khemah-tapak', 'khemah-pasang', 'sungai-malam', 'sungai-siang', 'sungai-kanak', 'family-day', 'gerai']);
  const big = n => IMG + n + (REAL.has(n) ? '-960.webp' : '-800.webp');
  const small = n => IMG + n + (REAL.has(n) ? '-480.webp' : '-400.webp');

  /* ---------- Penapis pakej ---------- */
  const pkgs = $('#pkgs');
  $$('[data-filter]').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    $$('[data-filter]').forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    pkgs.classList.toggle('is-filtered', f !== 'all');
    $$('.pkg', pkgs).forEach(card => {
      const show = f === 'all' || card.dataset.type === f;
      card.classList.toggle('is-hidden', !show);
      if (show) card.classList.add('is-in');
    });
  }));

  /* ---------- Fokus perangkap untuk dialog ---------- */
  let lastFocus = null;
  const openLayer = el => { lastFocus = document.activeElement; el.hidden = false; document.body.classList.add('lock'); const x = $('[data-close]', el); x && x.focus(); };
  const closeLayer = el => { el.hidden = true; if (!$('.modal:not([hidden]), .lb:not([hidden])')) document.body.classList.remove('lock'); lastFocus && lastFocus.focus && lastFocus.focus(); };
  const trap = (el, e) => {
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', el).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /* ---------- Modal pakej ---------- */
  const modal = $('#modal'), mImg = $('#mImg'), mThumbs = $('#mThumbs');
  let mList = [], mIdx = 0, mPoster = '', mName = '';
  const showM = i => {
    mIdx = (i + mList.length) % mList.length;
    mImg.src = big(mList[mIdx]);
    mImg.alt = mName + ' — gambar ' + (mIdx + 1);
    $$('button', mThumbs).forEach((t, k) => t.classList.toggle('is-on', k === mIdx));
  };
  const openPkg = id => {
    const card = $(`.pkg[data-id="${id}"]`), d = PKG[id];
    if (!card || !d) return;
    mName = $('h3', card).textContent;
    $('#mName').textContent = mName;
    const desc = $('.pkg__desc', card) || $('.tag', card);
    $('#mDesc').textContent = desc ? desc.textContent : '';
    $('#mPrice').innerHTML = $('.price', card).innerHTML;
    const fac = $$('.fac li', card).map(li => li.textContent);
    $$('.tier', card).forEach(t => fac.unshift(t.querySelector('span').firstChild.textContent.trim() + ' (' + t.querySelector('span small').textContent + '): ' + t.querySelector('b').textContent.replace('/orang', ' seorang')));
    $('#mFac').innerHTML = '';
    fac.forEach(t => { const li = document.createElement('li'); li.textContent = t; $('#mFac').appendChild(li); });
    $('#mWa').setAttribute('aria-label', 'Booking Now — ' + mName);
    mList = [...d.photos, ...(d.extra || [])];
    mPoster = d.poster;
    mThumbs.innerHTML = mList.map((n, k) => `<button type="button" aria-label="Gambar ${k + 1}"><img src="${small(n)}" alt="" loading="lazy"></button>`).join('');
    $$('button', mThumbs).forEach((t, k) => t.addEventListener('click', () => showM(k)));
    showM(0);
    openLayer(modal);
  };
  $$('[data-open]').forEach(b => b.addEventListener('click', () => openPkg(b.dataset.open)));
  $$('.pkg__media').forEach(m => { m.style.cursor = 'zoom-in'; m.addEventListener('click', () => openPkg(m.closest('.pkg').dataset.id)); });
  $('#mPrev').addEventListener('click', () => showM(mIdx - 1));
  $('#mNext').addEventListener('click', () => showM(mIdx + 1));
  $('#mPoster').addEventListener('click', () => openLb([{ src: IMG + mPoster + '-1200.webp', cap: 'Poster harga rasmi — ' + mName }], 0));
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) closeLayer(modal); });

  /* swipe pada gambar modal */
  const swipe = (el, prev, next) => {
    let x0 = null;
    el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) (dx > 0 ? prev : next)();
    });
  };
  swipe(mImg, () => showM(mIdx - 1), () => showM(mIdx + 1));

  /* ---------- Galeri + lightbox ---------- */
  const GALLERY = [
    ['sungai-malam', 'Suasana malam tepi sungai'],
    ['ramlee-luar', 'Pondok P. Ramlee'],
    ['sungai-siang', 'Mandi-manda di sungai'],
    ['glamping-dalam', 'Dalam Glamping Kak Peah'],
    ['abampeah-tepi', 'Pondok Abam Peah'],
    ['family-day', 'Family Day'],
    ['ajis-luar', 'Pondok Ajis'],
    ['jambatan-luar', 'Pondok Atas Jambatan'],
    ['khemah-pasang', 'Pasang khemah'],
    ['sudin-luar', 'Pondok Sudin'],
    ['abampeah-anjung', 'Anjung Pondok Abam Peah'],
    ['sungai-kanak', 'Tebing sungai'],
    ['glamping-luar', 'Glamping Kak Peah'],
    ['hajibakhil-luar', 'Pondok Haji Bakhil'],
    ['ramlee-tepi', 'Pondok P. Ramlee & laluan kayu'],
    ['camping-dewan2', 'Dewan BBQ'],
    ['khemah-tapak', 'Tapak perkhemahan'],
    ['jambatan-bilik', 'Bilik Pondok Atas Jambatan'],
    ['gerai', 'Sudut gerai jualan'],
    ['abampeah-bilik', 'Bilik Pondok Abam Peah'],
    ['camping-tapak', 'Tapak khemah berlantai simen'],
    ['sudin-bilik', 'Bilik Pondok Sudin']
  ];
  const gal = $('#gallery');
  const galItems = GALLERY.map(([n, cap]) => ({ src: big(n), cap }));
  gal.innerHTML = GALLERY.map(([n, cap], i) =>
    `<button type="button" data-i="${i}" data-cap="${cap}" aria-label="Buka gambar: ${cap}"><img src="${small(n)}" alt="${cap} — Teratak Rimba Abam Peah" loading="lazy"></button>`).join('');
  $$('button', gal).forEach(b => b.addEventListener('click', () => openLb(galItems, +b.dataset.i)));

  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let lbList = [], lbIdx = 0;
  const showLb = i => {
    lbIdx = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIdx].src; lbImg.alt = lbList[lbIdx].cap; lbCap.textContent = lbList[lbIdx].cap + (lbList.length > 1 ? `  ·  ${lbIdx + 1} / ${lbList.length}` : '');
    $('#lbPrev').hidden = $('#lbNext').hidden = lbList.length < 2;
  };
  function openLb(list, i) { lbList = list; showLb(i); openLayer(lb); }
  $('#lbPrev').addEventListener('click', () => showLb(lbIdx - 1));
  $('#lbNext').addEventListener('click', () => showLb(lbIdx + 1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-close]')) closeLayer(lb); });
  swipe(lbImg, () => showLb(lbIdx - 1), () => showLb(lbIdx + 1));

  document.addEventListener('keydown', e => {
    const top = !lb.hidden ? lb : !modal.hidden ? modal : null;
    if (!top) { if (e.key === 'Escape') setMenu(false); return; }
    trap(top, e);
    if (e.key === 'Escape') closeLayer(top);
    if (e.key === 'ArrowLeft') top === lb ? showLb(lbIdx - 1) : showM(mIdx - 1);
    if (e.key === 'ArrowRight') top === lb ? showLb(lbIdx + 1) : showM(mIdx + 1);
  });

  /* ---------- Peta: muat hanya bila hampir kelihatan ---------- */
  const map = $('#lokasi iframe');
  if (map) {
    const load = () => { if (!map.src) map.src = map.dataset.src; };
    if ('IntersectionObserver' in window) {
      const mo = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { load(); mo.disconnect(); } }, { rootMargin: '400px' });
      mo.observe(map);
    } else load();
  }

  /* ---------- Video: jeda bila keluar skrin ---------- */
  const vid = $('#resortVideo');
  if (vid && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && !vid.paused) vid.pause(); }), { threshold: 0.2 }).observe(vid);
  }

  /* ---------- Voice note ---------- */
  const vn = $('#vn'), audio = $('#vnAudio');
  if (vn && audio) {
    const play = $('#vnPlay'), track = $('#vnTrack'), time = $('#vnTime');
    const fmt = s => { s = Math.max(0, Math.floor(isFinite(s) ? s : 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
    /* Sesetengah pelayar melaporkan tempoh Opus sebagai Infinity; guna tempoh sandaran */
    const dur = () => (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : +audio.dataset.duration || 0;
    const sync = () => {
      const d = dur(), p = d ? Math.min(100, (audio.currentTime / d) * 100) : 0;
      track.style.setProperty('--p', p + '%');
      track.setAttribute('aria-valuenow', String(Math.round(p)));
      time.textContent = fmt(audio.paused && !audio.currentTime ? d : audio.currentTime);
    };
    /* Papar pemain hanya jika fail audio wujud & boleh dimainkan */
    const ready = () => { vn.hidden = false; sync(); };
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
    /* Jeda video jika voice note dimainkan (dan sebaliknya) */
    audio.addEventListener('play', () => vid && !vid.paused && vid.pause());
    vid && vid.addEventListener('play', () => !audio.paused && audio.pause());
  }
})();
