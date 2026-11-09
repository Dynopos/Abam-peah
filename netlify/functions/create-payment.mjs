/* POST /api/create-payment — pegang tarikh, cipta Purchase CHIP dan pulangkan checkout_url.
   Jumlah SENTIASA dikira semula di pelayan daripada js/pricing.mjs. */
import { quote } from '../../js/pricing.mjs';
import { holdBooking, releaseBooking, attachToOrder, HOLD_MS } from '../lib/slots.mjs';
import { config as chip, isConfigured, api, sen } from '../lib/chip.mjs';
import { orderNumber, recordForm, siteUrl, json, normalisePhone } from '../lib/common.mjs';

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Kaedah tidak dibenarkan.' }, 405);
  const c = chip();
  if (!isConfigured(c)) return json({ error: 'Bayaran dalam talian belum diaktifkan. Sila tempah melalui WhatsApp.' }, 503);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'Data tidak sah.' }, 400); }
  if (body.website) return json({ error: 'Ditolak.' }, 400); // honeypot

  const q = quote(body);
  const name = clean(body.name, 100);
  const email = clean(body.email, 190).toLowerCase();
  const phone = normalisePhone(body.phone);
  const notes = clean(body.notes, 500);
  const errors = [...q.errors];
  if (name.length < 2) errors.push('Sila masukkan nama penuh.');
  if (!EMAIL_RE.test(email)) errors.push('Sila masukkan emel yang sah (resit akan dihantar ke emel ini).');
  if (!phone) errors.push('Sila masukkan nombor telefon Malaysia yang sah.');
  if (body.agree !== true) errors.push('Sila bersetuju dengan Terma, Polisi Pembatalan & Polisi Privasi.');
  if (errors.length) return json({ error: errors[0], errors }, 422);

  const order = orderNumber();
  const base = siteUrl(req).replace(/\/$/, '');

  /* 1) Pegang tarikh (atomik) sebelum bayaran — tolak jika sudah ditempah */
  let hold;
  try {
    hold = await holdBooking({
      order, pakej: q.pakej, checkin: q.checkin, nights: q.nights, units: q.units || 1,
      info: { nama: name, emel: email, telefon: phone, catatan: notes, jumlah: q.total.toFixed(2), tetamu: { dewasa: q.adults, remaja: q.teens, kanak: q.children }, khemah: q.tents, mod: c.mode }
    });
  } catch (e) {
    console.error('holdBooking', e);
    return json({ error: 'Kekosongan tidak dapat disemak sekarang. Sila cuba lagi atau tempah melalui WhatsApp.' }, 503);
  }
  if (!hold.ok) return json({ error: `Maaf, ${q.name} sudah ditempah pada sebahagian tarikh dipilih. Sila pilih tarikh lain.`, code: 'unavailable' }, 409);

  /* 2) Cipta Purchase CHIP. Tamat serentak dengan pegangan tarikh (due_strict) supaya tiada bayaran selepas tarikh dilepaskan. */
  const back = `${base}/bayaran.html?order=${order}`;
  const payload = {
    brand_id: c.brandId,
    reference: order,
    client: { email, full_name: name, phone: '+' + phone },
    purchase: {
      currency: 'MYR',
      language: 'ms',
      timezone: 'Asia/Kuala_Lumpur',
      due_strict: true,
      notes: `${q.name} · ${q.checkin} → ${q.checkout} (${q.nights} malam) · Unit: ${hold.units.join(', ')}`.slice(0, 1000),
      products: q.lines.filter(l => l.amount > 0).map(l => ({ name: l.label.slice(0, 256), price: sen(l.amount), quantity: '1' }))
    },
    due: Math.floor((Date.now() + HOLD_MS - 60e3) / 1000),
    success_callback: `${base}/api/chip-callback`,
    success_redirect: back,
    failure_redirect: `${back}&r=gagal`,
    cancel_redirect: `${base}/#tempah`,
    send_receipt: true,
    creator_agent: 'TeratakRimba/1.0',
    platform: 'web'
  };
  if (c.methods.length) payload.payment_method_whitelist = c.methods;

  const r = await api(c, '/purchases/', { method: 'POST', body: payload });
  if (!r.ok || !r.data?.checkout_url) {
    console.error('CHIP purchase gagal', r.status, JSON.stringify(r.data).slice(0, 600));
    await releaseBooking(order, 'intent-failed').catch(() => {});
    return json({ error: 'Maaf, sistem bayaran tidak dapat dihubungi. Sila cuba lagi atau tempah melalui WhatsApp.' }, 502);
  }
  await attachToOrder(order, { purchase_id: r.data.id, is_test: !!r.data.is_test }).catch(e => console.error('attachToOrder', e));

  await recordForm(base, 'tempahan', {
    status: 'MENUNGGU BAYARAN', order_number: order, purchase_id: r.data.id || '',
    pakej: q.name, unit_fizikal: hold.units.join(', '), tarikh_masuk: q.checkin, tarikh_keluar: q.checkout, malam: q.nights, unit: q.units,
    dewasa: q.adults, remaja_11_17: q.teens, kanak_bawah_10: q.children, sewa_khemah: q.tents,
    jumlah_rm: q.total.toFixed(2), nama: name, emel: email, telefon: phone, catatan: notes, mod: r.data.is_test ? 'test' : 'live'
  });

  return json({ url: r.data.checkout_url, order_number: order, total: q.total, mode: r.data.is_test ? 'test' : 'live' });
};
export const config = { path: '/api/create-payment' };
