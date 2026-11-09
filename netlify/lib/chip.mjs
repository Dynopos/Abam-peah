/* CHIP Collect (chip-in.asia) — pembantu sebelah pelayan sahaja.
   Rahsia dibaca daripada pemboleh ubah persekitaran Netlify (JANGAN letak dalam kod):
     CHIP_SECRET_KEY   Secret API key (Authorization: Bearer). Kunci UJIAN → bayaran ujian; kunci LIVE → bayaran sebenar.
     CHIP_BRAND_ID     Brand ID (UUID)
     CHIP_MODE         (pilihan) "test" untuk paparkan notis "Mod ujian" pada borang
     CHIP_METHODS      (pilihan) kod kaedah dipisah koma, cth. "fpx,duitnow_qr,visa,mastercard"
*/
import { createVerify } from 'node:crypto';
import { env } from './common.mjs';

export function config() {
  return {
    secret: env('CHIP_SECRET_KEY'),
    brandId: env('CHIP_BRAND_ID'),
    mode: env('CHIP_MODE') === 'test' ? 'test' : 'live',
    methods: env('CHIP_METHODS').split(',').map(s => s.trim()).filter(Boolean),
    apiBase: (env('CHIP_API_BASE') || 'https://gate.chip-in.asia/api/v1').replace(/\/$/, '')
  };
}
export const isConfigured = c => Boolean(c.secret && c.brandId);

export async function api(c, path, { method = 'GET', body } = {}) {
  const res = await fetch(c.apiBase + path, {
    method,
    headers: { Authorization: `Bearer ${c.secret}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

/* Kunci awam syarikat untuk mengesahkan success_callback (stabil — disimpan dalam memori) */
let cachedKey = null;
export async function publicKey(c) {
  if (cachedKey) return cachedKey;
  const r = await api(c, '/public_key/');
  if (!r.ok) throw new Error('Gagal mendapatkan kunci awam CHIP: ' + r.status);
  const pem = typeof r.data === 'string' ? r.data : (r.data?.public_key || '');
  if (!pem.includes('BEGIN')) throw new Error('Kunci awam CHIP tidak sah');
  cachedKey = pem.replace(/\\n/g, '\n').trim();
  return cachedKey;
}

/* X-Signature = base64( RSA PKCS#1 v1.5 ( SHA-256( badan mentah ) ) ) */
export function verifySignature(rawBody, signatureB64, pem) {
  if (!signatureB64 || !pem) return false;
  try {
    const v = createVerify('RSA-SHA256');
    v.update(rawBody);
    v.end();
    return v.verify(pem, Buffer.from(signatureB64, 'base64'));
  } catch { return false; }
}

/* Status CHIP → keadaan ringkas untuk halaman keputusan */
export function stateOf(status) {
  if (['paid', 'cleared', 'settled'].includes(status)) return 'paid';
  if (['cancelled', 'expired', 'blocked', 'released'].includes(status)) return 'cancelled';
  if (['refunded', 'pending_refund', 'chargeback'].includes(status)) return 'refunded';
  if (status === 'error') return 'failed';
  return 'pending';
}
export const sen = rm => Math.round(Number(rm) * 100);
export const rm = sen => (Number(sen || 0) / 100).toFixed(2);
