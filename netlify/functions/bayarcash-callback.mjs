/* POST /api/bayarcash-callback — callback pelayan-ke-pelayan Bayarcash v3.
   Checksum disahkan sebelum data dipercayai. Bayarcash cuba semula 5 kali jika bukan HTTP 200. */
import { config as bc, verifyCallback, recordForm, siteUrl, json } from '../lib/bayarcash.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Kaedah tidak dibenarkan.' }, 405);
  const c = bc();
  let cb = {};
  const type = req.headers.get('content-type') || '';
  try {
    if (type.includes('application/json')) cb = await req.json();
    else cb = Object.fromEntries(new URLSearchParams(await req.text()));
  } catch { return json({ error: 'Data tidak sah.' }, 400); }

  if (!verifyCallback(cb, c.secret)) {
    console.warn('Callback Bayarcash: checksum tidak sah', cb.order_number);
    return json({ error: 'Checksum tidak sah.' }, 400);
  }

  const paid = String(cb.status) === '3';
  console.log('Callback Bayarcash', cb.order_number, cb.status, cb.status_description, cb.amount);
  await recordForm(siteUrl(req), 'bayaran', {
    keputusan: paid ? 'BERJAYA' : `TIDAK BERJAYA (${cb.status_description || cb.status})`,
    order_number: cb.order_number, amount: cb.amount, currency: cb.currency,
    transaction_id: cb.transaction_id, exchange_reference_number: cb.exchange_reference_number,
    payer_name: cb.payer_name || '', payer_email: cb.payer_email || '', payer_bank_name: cb.payer_bank_name,
    status: cb.status, status_description: cb.status_description, mod: c.mode
  });
  return json({ received: true });
};
export const config = { path: '/api/bayarcash-callback' };
