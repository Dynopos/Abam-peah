/* GET /api/payment-status?order=TR...  — semak status sebenar daripada Bayarcash (bukan percaya redirect). */
import { config as bc, isConfigured, api, ORDER_RE, json } from '../lib/bayarcash.mjs';

const LABEL = { 0: 'new', 1: 'pending', 2: 'failed', 3: 'paid', 4: 'cancelled' };

export default async (req) => {
  const order = (new URL(req.url).searchParams.get('order') || '').trim().toUpperCase();
  if (!ORDER_RE.test(order)) return json({ error: 'No. tempahan tidak sah.' }, 400);
  const c = bc();
  if (!isConfigured(c)) return json({ error: 'Bayaran dalam talian belum diaktifkan.' }, 503);

  const r = await api(c, `/transactions?order_number=${encodeURIComponent(order)}`);
  if (!r.ok) return json({ error: 'Status tidak dapat disemak sekarang.' }, 502);
  const list = Array.isArray(r.data?.data) ? r.data.data.filter(t => String(t.order_number) === order) : [];
  if (!list.length) return json({ order_number: order, state: 'pending', status: null });

  /* Jika ada mana-mana cubaan berjaya, tempahan dibayar; jika tidak, ambil cubaan terkini */
  const ok = list.find(t => Number(t.status) === 3);
  const t = ok || list.sort((a, b) => String(b.updated_at || b.datetime).localeCompare(String(a.updated_at || a.datetime)))[0];
  return json({
    order_number: order,
    state: LABEL[Number(t.status)] || 'pending',
    status: Number(t.status),
    status_description: t.status_description || '',
    amount: Number(t.amount).toFixed(2),
    currency: t.currency || 'MYR',
    bank: t.payer_bank_name || '',
    reference: t.exchange_reference_number || '',
    datetime: t.updated_at || t.datetime || ''
  });
};
export const config = { path: '/api/payment-status' };
