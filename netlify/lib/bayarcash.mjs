/* Bayarcash v3 — pembantu sebelah pelayan sahaja.
   Rahsia dibaca daripada pemboleh ubah persekitaran Netlify (JANGAN letak dalam kod):
     BAYARCASH_PAT          Personal Access Token (Authorization: Bearer)
     BAYARCASH_SECRET       API secret key (untuk checksum HMAC SHA256)
     BAYARCASH_PORTAL_KEY   Portal key
     BAYARCASH_ENV          "sandbox" (lalai) atau "production"
     BAYARCASH_CHANNEL      Saluran bayaran (lalai 1 = FPX)
*/
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const env = k => (globalThis.Netlify?.env?.get?.(k) ?? process.env[k] ?? '').trim();

export function config() {
  const mode = env('BAYARCASH_ENV') === 'production' ? 'production' : 'sandbox';
  return {
    mode,
    pat: env('BAYARCASH_PAT'),
    secret: env('BAYARCASH_SECRET'),
    portalKey: env('BAYARCASH_PORTAL_KEY'),
    channel: Number.parseInt(env('BAYARCASH_CHANNEL') || '1', 10) || 1,
    apiBase: env('BAYARCASH_API_BASE') || (mode === 'production'
      ? 'https://api.console.bayar.cash/v3'
      : 'https://api.console.bayarcash-sandbox.com/v3')
  };
}
export const isConfigured = c => Boolean(c.pat && c.secret && c.portalKey);

/* Checksum Bayarcash: trim setiap nilai → susun ikut kunci → gabung dengan "|" → HMAC SHA256 */
export function checksum(fields, secret) {
  const str = Object.keys(fields).sort().map(k => String(fields[k] ?? '').trim()).join('|');
  return createHmac('sha256', secret).update(str).digest('hex');
}
export const intentChecksum = (p, secret) => checksum({
  payment_channel: p.payment_channel, order_number: p.order_number, amount: p.amount,
  payer_name: p.payer_name, payer_email: p.payer_email
}, secret);

const V3_CB_FIELDS = ['transaction_id', 'exchange_reference_number', 'exchange_transaction_id', 'order_number',
  'currency', 'amount', 'payer_bank_name', 'status', 'status_description'];
export function verifyCallback(cb, secret) {
  if (!cb || !cb.checksum || !secret) return false;
  const fields = Object.fromEntries(V3_CB_FIELDS.map(k => [k, cb[k]]));
  const a = Buffer.from(checksum(fields, secret)), b = Buffer.from(String(cb.checksum));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function api(c, path, { method = 'GET', body } = {}) {
  const res = await fetch(c.apiBase + path, {
    method,
    headers: { Authorization: `Bearer ${c.pat}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

/* No. tempahan: TR + YYMMDD + 6 aksara rawak (tanpa huruf mengelirukan) */
export function orderNumber(now = new Date()) {
  const d = new Date(now.getTime() + 8 * 3600e3).toISOString().slice(2, 10).replace(/-/g, '');
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const r = [...randomBytes(6)].map(x => A[x % A.length]).join('');
  return `TR${d}${r}`;
}
export const ORDER_RE = /^TR\d{6}[A-Z0-9]{6}$/;

/* Rekod ke Netlify Forms (papan pemuka + notifikasi emel kepada pemilik). Gagal secara senyap. */
export async function recordForm(siteUrl, formName, fields) {
  if (!siteUrl) return false;
  try {
    const body = new URLSearchParams({ 'form-name': formName, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v ?? '')])) });
    const r = await fetch(siteUrl.replace(/\/$/, '') + '/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    return r.ok;
  } catch { return false; }
}

export const siteUrl = req => env('SITE_URL') || env('URL') || new URL(req.url).origin;
export const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

/* Nombor telefon Malaysia → 60XXXXXXXXX ('' jika tidak sah) */
export function normalisePhone(raw) {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '6' + d;
  if (!d.startsWith('60')) d = '60' + d;
  return /^60\d{8,11}$/.test(d) ? d : '';
}
