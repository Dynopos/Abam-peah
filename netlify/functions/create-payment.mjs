/* POST /api/create-payment — cipta payment intent Bayarcash v3 dan pulangkan URL bayaran.
   Jumlah SENTIASA dikira semula di pelayan daripada js/pricing.mjs. */
import { quote } from '../../js/pricing.mjs';
import { config as bc, isConfigured, api, intentChecksum, orderNumber, recordForm, siteUrl, json, normalisePhone } from '../lib/bayarcash.mjs';

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;
export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Kaedah tidak dibenarkan.' }, 405);
  const c = bc();
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
  const payload = {
    payment_channel: c.channel,
    portal_key: c.portalKey,
    order_number: order,
    amount: q.total,
    payer_name: name,
    payer_email: email,
    payer_telephone_number: Number(phone),
    return_url: `${base}/bayaran.html`,
    callback_url: `${base}/api/bayarcash-callback`
  };
  payload.checksum = intentChecksum(payload, c.secret);

  const r = await api(c, '/payment-intents', { method: 'POST', body: payload });
  if (!r.ok || !r.data?.url) {
    console.error('Bayarcash payment-intent gagal', r.status, JSON.stringify(r.data).slice(0, 500));
    return json({ error: 'Maaf, sistem bayaran tidak dapat dihubungi. Sila cuba lagi atau tempah melalui WhatsApp.' }, 502);
  }

  await recordForm(base, 'tempahan', {
    status: 'MENUNGGU BAYARAN', order_number: order, payment_intent: r.data.id || '',
    pakej: q.name, tarikh_masuk: q.checkin, tarikh_keluar: q.checkout, malam: q.nights, unit: q.units,
    dewasa: q.adults, remaja_11_17: q.teens, kanak_bawah_10: q.children, sewa_khemah: q.tents,
    jumlah_rm: q.total.toFixed(2), nama: name, emel: email, telefon: phone, catatan: notes, mod: c.mode
  });

  return json({ url: r.data.url, order_number: order, total: q.total, mode: c.mode });
};
export const config = { path: '/api/create-payment' };
