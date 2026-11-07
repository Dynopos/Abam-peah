/* /api/admin — halaman admin kekosongan. Dilindungi kata laluan ADMIN_PASSWORD (pemboleh ubah Netlify).
   Header: X-Admin-Key: <kata laluan>
   GET  ?action=calendar&from=YYYY-MM-DD&days=42
   GET  ?action=orders
   POST { action: 'block' | 'unblock' | 'free', unit, dates: [...], note } */
import { timingSafeEqual, createHash } from 'node:crypto';
import { addDays, todayMY } from '../../js/pricing.mjs';
import { calendar, listOrders, setSlots, isDate, isUnit } from '../lib/slots.mjs';
import { json } from '../lib/bayarcash.mjs';

const env = k => (globalThis.Netlify?.env?.get?.(k) ?? process.env[k] ?? '').trim();
const h = v => createHash('sha256').update(String(v)).digest();
const wait = ms => new Promise(r => setTimeout(r, ms));

export default async (req) => {
  const pass = env('ADMIN_PASSWORD');
  if (pass.length < 8) return json({ error: 'Admin belum diaktifkan. Tetapkan ADMIN_PASSWORD (sekurang-kurangnya 8 aksara) di Netlify.' }, 503);
  if (!timingSafeEqual(h(req.headers.get('x-admin-key') || ''), h(pass))) { await wait(800); return json({ error: 'Kata laluan salah.' }, 401); }

  try {
    if (req.method === 'GET') {
      const q = new URL(req.url).searchParams;
      const action = q.get('action');
      if (action === 'calendar') {
        const from = isDate(q.get('from') || '') ? q.get('from') : todayMY();
        const days = Math.min(Math.max(parseInt(q.get('days') || '42', 10) || 42, 1), 120);
        return json(await calendar(from, days));
      }
      if (action === 'orders') return json({ orders: await listOrders(50) });
      if (action === 'ping') return json({ ok: true });
      return json({ error: 'Tindakan tidak sah.' }, 400);
    }
    if (req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      if (!['block', 'unblock', 'free'].includes(b.action)) return json({ error: 'Tindakan tidak sah.' }, 400);
      if (!isUnit(b.unit)) return json({ error: 'Unit tidak sah.' }, 400);
      let dates = Array.isArray(b.dates) ? b.dates.filter(isDate) : [];
      if (b.from && b.to && isDate(b.from) && isDate(b.to) && b.to >= b.from) {
        dates = []; for (let d = b.from; d <= b.to && dates.length < 120; d = addDays(d, 1)) dates.push(d);
      }
      if (!dates.length || dates.length > 120) return json({ error: 'Tarikh tidak sah (maksimum 120 hari sekali).' }, 400);
      return json(await setSlots({ unit: b.unit, dates, action: b.action, note: b.note }));
    }
    return json({ error: 'Kaedah tidak dibenarkan.' }, 405);
  } catch (e) {
    console.error('admin', e);
    return json({ error: 'Ralat pelayan: ' + (e.message || e) }, 500);
  }
};
export const config = { path: '/api/admin' };
