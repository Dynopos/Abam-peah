/* Pembantu umum sebelah pelayan (bebas gateway). */
import { randomBytes } from 'node:crypto';

export const env = k => (globalThis.Netlify?.env?.get?.(k) ?? process.env[k] ?? '').trim();

/* No. tempahan: TR + YYMMDD + 6 aksara rawak (tanpa huruf mengelirukan) */
export function orderNumber(now = new Date()) {
  const d = new Date(now.getTime() + 8 * 3600e3).toISOString().slice(2, 10).replace(/-/g, '');
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return `TR${d}${[...randomBytes(6)].map(x => A[x % A.length]).join('')}`;
}
export const ORDER_RE = /^TR\d{6}[A-Z0-9]{6}$/;

/* Nombor telefon Malaysia → 60XXXXXXXXX ('' jika tidak sah) */
export function normalisePhone(raw) {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '6' + d;
  if (!d.startsWith('60')) d = '60' + d;
  return /^60\d{8,11}$/.test(d) ? d : '';
}

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
