/* GET /api/payment-status?order=TR... — semak status sebenar Purchase terus daripada CHIP (bukan percaya redirect). */
import { config as chip, isConfigured, api, stateOf, rm } from '../lib/chip.mjs';
import { getOrder, confirmBooking } from '../lib/slots.mjs';
import { ORDER_RE, json } from '../lib/common.mjs';

export default async (req) => {
  const order = (new URL(req.url).searchParams.get('order') || '').trim().toUpperCase();
  if (!ORDER_RE.test(order)) return json({ error: 'No. tempahan tidak sah.' }, 400);
  const c = chip();
  if (!isConfigured(c)) return json({ error: 'Bayaran dalam talian belum diaktifkan.' }, 503);

  const rec = await getOrder(order).catch(() => null);
  if (!rec?.purchase_id) return json({ order_number: order, state: 'pending', status: null });

  const r = await api(c, `/purchases/${encodeURIComponent(rec.purchase_id)}/`);
  if (!r.ok) return json({ error: 'Status tidak dapat disemak sekarang.' }, 502);
  const p = r.data, state = stateOf(p.status);

  /* Status disahkan terus daripada CHIP → pastikan tarikh ditutup walaupun callback lewat */
  if (state === 'paid' && String(p.reference) === order) {
    await confirmBooking(order, { purchase_id: p.id, paid_amount: rm(p.payment?.amount ?? p.purchase?.total) }).catch(e => console.error('confirmBooking', e));
  }
  return json({
    order_number: order,
    state,
    status: p.status,
    amount: rm(p.payment?.amount ?? p.purchase?.total),
    currency: p.purchase?.currency || 'MYR',
    method: p.transaction_data?.payment_method || '',
    reference: p.id,
    datetime: p.payment?.paid_on ? new Date(p.payment.paid_on * 1000).toISOString() : ''
  });
};
export const config = { path: '/api/payment-status' };
