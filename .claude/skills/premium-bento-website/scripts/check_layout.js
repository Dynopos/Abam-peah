/* Semak laman di pelbagai saiz skrin: teks terpotong / melimpah, imej rosak, ralat konsol,
   pautan WhatsApp tidak konsisten, dan pemegang {{...}} yang tertinggal.
   Guna:  node check_layout.js http://localhost:8000/ [WA_URL] [--shots DIR]
   Perlu Playwright (require('playwright')). Sambungan ke google.com disekat supaya ujian tidak tergantung. */
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8000/';
const wa = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : null;
const si = process.argv.indexOf('--shots'), shots = si > 0 ? process.argv[si + 1] : null;
const WIDTHS = [320, 360, 390, 412, 768, 1024, 1440];

(async () => {
  const b = await chromium.launch();
  let fail = 0;
  for (const w of WIDTHS) {
    const p = await b.newPage({ viewport: { width: w, height: 860 } });
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => m.type() === 'error' && !/ERR_FAILED|google/i.test(m.text()) && errs.push(m.text()));
    await p.route(u => /google\.com|gstatic|googleapis/.test(u.hostname), r => r.abort());
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(800);
    for (const scale of [1, 1.15]) { // 1.15 ≈ tetapan "fon besar" telefon
      const r = await p.evaluate(([scale, wa]) => {
        document.querySelectorAll('.reveal').forEach(e => e.classList.add('is-in'));
        if (scale > 1) document.querySelectorAll('body *').forEach(e => {
          if ([...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) { const fs = parseFloat(getComputedStyle(e).fontSize); e.style.fontSize = fs * scale + 'px'; }
        });
        const bad = [];
        document.querySelectorAll('h1,h2,h3,p,span,b,strong,small,a,button,li,dt,dd,summary,figcaption,label').forEach(e => {
          if (e.closest('.marquee,.modal,.lb,.menu,svg,.vn__track,[hidden]')) return;
          const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return;
          const er = e.getBoundingClientRect(); if (!er.width) return;
          if (er.right > innerWidth + 1) { bad.push('KELUAR SKRIN: ' + e.textContent.trim().slice(0, 40)); return; }
          for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
            const s = getComputedStyle(a);
            if (s.overflowX !== 'visible' && !['auto', 'scroll'].includes(s.overflowX)) {
              const ar = a.getBoundingClientRect();
              if (er.right > ar.right + 1 || er.left < ar.left - 1) bad.push('TERPOTONG: ' + e.textContent.trim().slice(0, 40));
              break;
            }
          }
        });
        const imgs = [...document.images].filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0).map(i => i.src);
        const waBad = wa ? [...document.querySelectorAll('[data-wa]')].filter(a => a.href !== wa).length : 0;
        const ph = (document.documentElement.outerHTML.match(/\{\{[^}]{1,60}\}\}/g) || []).slice(0, 5);
        return { overflow: document.documentElement.scrollWidth - innerWidth, bad: [...new Set(bad)].slice(0, 8), imgs, waBad, waCount: document.querySelectorAll('[data-wa]').length, ph };
      }, [scale, wa]);
      const ok = !r.overflow && !r.bad.length && !r.imgs.length && !r.waBad && !r.ph.length && !errs.length;
      if (!ok) fail++;
      console.log(`${ok ? '✓' : '✗'} ${w}px teks×${scale}`, ok ? `(${r.waCount} butang WhatsApp)` : JSON.stringify({ ...r, errs }));
    }
    if (shots && (w === 390 || w === 1440)) await p.screenshot({ path: `${shots}/laman-${w}.png`, fullPage: true });
    await p.close();
  }
  await b.close();
  console.log(fail ? `\n${fail} semakan gagal.` : '\nSemua semakan lulus.');
  process.exit(fail ? 1 : 0);
})();
