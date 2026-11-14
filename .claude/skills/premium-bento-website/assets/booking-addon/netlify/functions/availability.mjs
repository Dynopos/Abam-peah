/* GET /api/availability?pakej=ramlee&from=YYYY-MM-DD&days=180
   Pulangkan bilangan unit yang sibuk bagi setiap tarikh (malam). Tiada maklumat peribadi. */
import { UNITS, todayMY } from '../../js/pricing.mjs';
import { availability, isDate } from '../lib/slots.mjs';
import { json } from '../lib/common.mjs';

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const pakej = q.get('pakej') || '';
  if (!UNITS[pakej]) return json({ error: 'Pakej tidak sah.' }, 400);
  const from = isDate(q.get('from') || '') ? q.get('from') : todayMY();
  const days = Math.min(Math.max(parseInt(q.get('days') || '180', 10) || 180, 1), 400);
  try {
    return json({ pakej, from, days, ...(await availability(pakej, from, days)) });
  } catch (e) {
    console.error('availability', e);
    return json({ error: 'Kekosongan tidak dapat disemak sekarang.' }, 503);
  }
};
export const config = { path: '/api/availability' };
