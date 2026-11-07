/* Kekosongan tarikh — disimpan dalam Netlify Blobs (store "kekosongan").
 *
 * Setiap (unit, malam) ialah satu kunci:  slot/<unit>/<YYYY-MM-DD>
 *   metadata: { state: 'hold' | 'booked' | 'blocked', order?, note?, expires?, at }
 * Rekod tempahan online:                  order/<NO_TEMPAHAN>   (JSON)
 *
 * Tuntutan slot menggunakan tulisan bersyarat ATOMIK (onlyIfNew / onlyIfMatch), jadi dua pelanggan
 * tidak boleh memegang unit & malam yang sama serentak. 'hold' tamat selepas HOLD_MS jika tidak dibayar.
 */
import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import { UNITS, ALL_UNITS, nightDates, addDays, todayMY } from '../../js/pricing.mjs';

export const HOLD_MS = 30 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const isDate = d => DATE_RE.test(d) && !Number.isNaN(Date.parse(d + 'T00:00:00Z'));
export const isUnit = u => ALL_UNITS.includes(u);

export const store = () => getStore({ name: 'kekosongan', consistency: 'strong' });
const slotKey = (unit, date) => `slot/${unit}/${date}`;
/* Kandungan unik bagi setiap tulisan supaya ETag sentiasa berubah (ETag dikira daripada kandungan) */
const body = m => JSON.stringify({ ...m, v: randomUUID() });
const orderKey = order => `order/${order}`;

export const isLive = (m, now = Date.now()) =>
  !!m && (m.state === 'booked' || m.state === 'blocked' || (m.state === 'hold' && Number(m.expires) > now));

async function meta(s, unit, date) {
  const r = await s.getMetadata(slotKey(unit, date));
  return r ? { etag: r.etag, m: r.metadata || {} } : null;
}

/* Tuntut satu slot untuk tempahan. true jika berjaya (atau sudah dimiliki tempahan yang sama). */
async function claim(s, unit, date, m) {
  const key = slotKey(unit, date);
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await s.set(key, body(m), { metadata: m, onlyIfNew: true });
    if (r.modified) return true;
    const cur = await meta(s, unit, date);
    if (!cur) continue; // dipadam di antara — cuba lagi
    const owned = m.order && cur.m.order === m.order && cur.m.state !== 'blocked';
    if (owned || !isLive(cur.m)) {
      const w = await s.set(key, body(m), { metadata: m, onlyIfMatch: cur.etag });
      if (w.modified) return true;
      continue; // berubah serentak — semak semula
    }
    return false;
  }
  return false;
}

async function releaseSlot(s, unit, date, order) {
  const cur = await meta(s, unit, date);
  if (cur && order && cur.m.order === order && cur.m.state !== 'blocked') await s.delete(slotKey(unit, date));
}

/* Peta kesibukan bagi satu pakej: { total, busy: { 'YYYY-MM-DD': bilangan unit sibuk } } */
export async function availability(pakej, from, days) {
  const s = store(), units = UNITS[pakej] || [];
  const to = addDays(from, days);
  const busy = {}, now = Date.now();
  for (const unit of units) {
    const { blobs } = await s.list({ prefix: `slot/${unit}/` });
    const keys = blobs.map(b => b.key).filter(k => { const d = k.slice(-10); return d >= from && d < to; });
    const metas = await Promise.all(keys.map(k => s.getMetadata(k)));
    metas.forEach((r, i) => { if (r && isLive(r.metadata, now)) { const d = keys[i].slice(-10); busy[d] = (busy[d] || 0) + 1; } });
  }
  return { total: units.length, busy };
}

/* Pegang unit untuk tempahan (sebelum bayaran). */
export async function holdBooking({ order, pakej, checkin, nights, units: want = 1, info = {} }) {
  const s = store();
  const dates = nightDates(checkin, nights);
  const m = { state: 'hold', order, expires: Date.now() + HOLD_MS, at: new Date().toISOString() };
  const chosen = [];
  for (const unit of UNITS[pakej] || []) {
    if (chosen.length >= want) break;
    const got = [];
    let ok = true;
    for (const d of dates) {
      if (await claim(s, unit, d, m)) got.push(d);
      else { ok = false; break; }
    }
    if (ok) chosen.push(unit);
    else await Promise.all(got.map(d => releaseSlot(s, unit, d, order)));
  }
  if (chosen.length < want) {
    await Promise.all(chosen.flatMap(u => dates.map(d => releaseSlot(s, u, d, order))));
    return { ok: false };
  }
  await s.setJSON(orderKey(order), { order, pakej, units: chosen, dates, checkin, nights, status: 'hold', created: new Date().toISOString(), ...info });
  return { ok: true, units: chosen, dates };
}

export const getOrder = order => store().get(orderKey(order), { type: 'json' });

/* Bayaran berjaya → tukar hold kepada booked (idempoten). Pulangkan senarai konflik (jika ada). */
export async function confirmBooking(order, extra = {}) {
  const s = store();
  const rec = await getOrder(order);
  if (!rec) return { ok: false, missing: true };
  const conflicts = [];
  const m = { state: 'booked', order, at: new Date().toISOString() };
  for (const unit of rec.units) for (const d of rec.dates) {
    if (!(await claim(s, unit, d, m))) conflicts.push(`${unit} ${d}`);
  }
  const status = conflicts.length ? 'paid-conflict' : 'paid';
  if (rec.status !== status || extra.transaction_id) {
    await s.setJSON(orderKey(order), { ...rec, ...extra, status, conflicts, paid_at: rec.paid_at || new Date().toISOString() });
  }
  return { ok: !conflicts.length, conflicts, rec };
}

/* Bayaran gagal / dibatalkan → lepaskan hold (tidak menyentuh tempahan yang sudah dibayar). */
export async function releaseBooking(order, status = 'released') {
  const s = store();
  const rec = await getOrder(order);
  if (!rec || String(rec.status).startsWith('paid')) return false;
  await Promise.all(rec.units.flatMap(u => rec.dates.map(d => releaseSlot(s, u, d, order))));
  await s.setJSON(orderKey(order), { ...rec, status, released_at: new Date().toISOString() });
  return true;
}

/* ---------- Admin ---------- */
export async function calendar(from, days) {
  const s = store(), to = addDays(from, days), now = Date.now();
  const units = {}, orders = {};
  for (const unit of ALL_UNITS) {
    units[unit] = {};
    const { blobs } = await s.list({ prefix: `slot/${unit}/` });
    const keys = blobs.map(b => b.key).filter(k => { const d = k.slice(-10); return d >= from && d < to; });
    const metas = await Promise.all(keys.map(k => s.getMetadata(k)));
    metas.forEach((r, i) => {
      if (!r || !isLive(r.metadata, now)) return;
      const m = r.metadata;
      units[unit][keys[i].slice(-10)] = { state: m.state, order: m.order || '', note: m.note || '', expires: m.expires || null };
      if (m.order) orders[m.order] = true;
    });
  }
  const recs = await Promise.all(Object.keys(orders).map(o => getOrder(o)));
  recs.forEach(r => { if (r) orders[r.order] = summary(r); });
  return { from, days, units, orders };
}

export async function setSlots({ unit, dates, action, note = '' }) {
  const s = store();
  const done = [], skipped = [];
  for (const d of dates) {
    const cur = await meta(s, unit, d);
    if (action === 'block') {
      const ok = await claim(s, unit, d, { state: 'blocked', note: String(note).slice(0, 120), at: new Date().toISOString() });
      (ok ? done : skipped).push(d);
    } else if (action === 'unblock') {
      if (cur && cur.m.state === 'blocked') { await s.delete(slotKey(unit, d)); done.push(d); } else skipped.push(d);
    } else if (action === 'free') { // kosongkan slot tempahan online (cth. selepas bayaran balik)
      if (cur) { await s.delete(slotKey(unit, d)); done.push(d); } else skipped.push(d);
    }
  }
  return { done, skipped };
}

const summary = r => ({
  order: r.order, pakej: r.pakej, units: r.units, checkin: r.checkin, nights: r.nights, status: r.status,
  nama: r.nama || '', telefon: r.telefon || '', emel: r.emel || '', jumlah: r.jumlah || '', created: r.created, conflicts: r.conflicts || []
});

export async function listOrders(limit = 40) {
  const s = store();
  const { blobs } = await s.list({ prefix: 'order/' });
  const keys = blobs.map(b => b.key).sort().reverse().slice(0, limit); // no. tempahan bermula dengan tarikh
  const recs = await Promise.all(keys.map(k => s.get(k, { type: 'json' })));
  return recs.filter(Boolean).map(summary);
}

export { todayMY };
