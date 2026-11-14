/* POST /api/chip-callback — success_callback CHIP (dihantar apabila Purchase dibayar).
   X-Signature (RSA-SHA256) disahkan terhadap badan MENTAH sebelum data dipercayai. Idempoten. */
import { config as chip, publicKey, verifySignature, stateOf, rm } from '../lib/chip.mjs';
import { confirmBooking, releaseBooking } from '../lib/slots.mjs';
import { recordForm, siteUrl, json, ORDER_RE } from '../lib/common.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Kaedah tidak dibenarkan.' }, 405);
  const c = chip();
  const raw = Buffer.from(await req.arrayBuffer());
  let ok = false;
  try { ok = verifySignature(raw, req.headers.get('x-signature'), await publicKey(c)); }
  catch (e) { console.error('Kunci awam CHIP', e); return json({ error: 'Pengesahan tidak dapat dibuat.' }, 503); }
  if (!ok) { console.warn('Callback CHIP: tandatangan tidak sah'); return json({ error: 'Tandatangan tidak sah.' }, 400); }

  let p;
  try { p = JSON.parse(raw.toString('utf8')); } catch { return json({ error: 'Data tidak sah.' }, 400); }
  const order = String(p.reference || '');
  if (!ORDER_RE.test(order)) return json({ received: true, ignored: 'reference' });

  const state = stateOf(p.status);
  const amount = rm(p.payment?.amount ?? p.purchase?.total);
  const method = p.transaction_data?.payment_method || '';
  console.log('Callback CHIP', order, p.status, amount, method);

  let note = '';
  try {
    if (state === 'paid') {
      const r = await confirmBooking(order, { purchase_id: p.id, paid_amount: amount, payment_method: method });
      if (r.conflicts?.length) note = ` — KONFLIK TARIKH: ${r.conflicts.join(', ')} (hubungi pelanggan: tukar tarikh / bayaran balik)`;
    } else if (state === 'cancelled') {
      await releaseBooking(order, 'cancelled');
    }
  } catch (e) { console.error('Kemas kini kalendar gagal', order, e); note = ' — kalendar tidak dikemas kini, semak admin'; }

  await recordForm(siteUrl(req), 'bayaran', {
    keputusan: (state === 'paid' ? 'BERJAYA' : `STATUS: ${p.status}`) + note,
    order_number: order, purchase_id: p.id, amount, currency: p.purchase?.currency || 'MYR',
    payment_method: method, payer_name: p.client?.full_name || '', payer_email: p.client?.email || '',
    status: p.status, mod: p.is_test ? 'test' : 'live'
  });
  return json({ received: true });
};
export const config = { path: '/api/chip-callback' };
