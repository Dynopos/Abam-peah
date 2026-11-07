/* Teratak Rimba Abam Peah — jadual harga & pengiraan tempahan.
   SATU sumber kebenaran: digunakan oleh pelayar (borang) DAN pelayan (netlify/functions).
   Pelayan sentiasa mengira semula jumlah — jumlah daripada pelayar tidak dipercayai. */

export const KHEMAH_RM = 30;          // sewa khemah (add-on) seunit / malam
export const MAX_NIGHTS = 14;
export const MAX_DAYS_AHEAD = 365;

export const PAKEJ = {
  ramlee:     { name: 'Pondok P. Ramlee',     type: 'pondok',   price: 330, maxUnits: 1, maxGuests: 10 },
  abampeah:   { name: 'Pondok Abam Peah',     type: 'pondok',   price: 300, maxUnits: 1 },
  glamping:   { name: 'Glamping Kak Peah',    type: 'glamping', price: 200, maxUnits: 1, tents: true },
  ajis:       { name: 'Pondok Ajis',          type: 'pondok',   price: 160, maxUnits: 1 },
  sudin:      { name: 'Pondok Sudin',         type: 'pondok',   price: 160, maxUnits: 1 },
  jambatan:   { name: 'Pondok Atas Jambatan', type: 'pondok',   price: 130, maxUnits: 4 },
  hajibakhil: { name: 'Pondok Haji Bakhil',   type: 'pondok',   price: 100, maxUnits: 1 },
  camping:    { name: 'Tapak Perkhemahan',    type: 'camping',  adult: 10, teen: 5, child: 0, tents: true }
};

const int = (v, d = 0) => { const n = Number.parseInt(v, 10); return Number.isFinite(n) ? n : d; };

/* Tarikh hari ini di Malaysia (UTC+8) dalam format YYYY-MM-DD */
export function todayMY(now = new Date()) {
  return new Date(now.getTime() + 8 * 3600e3).toISOString().slice(0, 10);
}
export function addDays(ymd, n) {
  const d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10);
}
const diffDays = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 864e5);
const money = n => Math.round(n * 100) / 100;

/**
 * Kira sebut harga.
 * input: { pakej, checkin:'YYYY-MM-DD', nights, units, adults, teens, children, tents }
 * return: { ok, errors[], pakej, name, checkin, checkout, nights, units, adults, teens, children, tents, lines[], total }
 */
export function quote(input = {}, now = new Date()) {
  const errors = [];
  const id = String(input.pakej || '');
  const p = PAKEJ[id];
  if (!p) return { ok: false, errors: ['Sila pilih pakej.'], lines: [], total: 0 };

  const checkin = String(input.checkin || '');
  const nights = int(input.nights, 1);
  const today = todayMY(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkin) || Number.isNaN(Date.parse(checkin + 'T00:00:00Z'))) errors.push('Sila pilih tarikh masuk.');
  else {
    if (checkin < today) errors.push('Tarikh masuk tidak boleh sebelum hari ini.');
    if (diffDays(today, checkin) > MAX_DAYS_AHEAD) errors.push('Tempahan dalam talian dibuka sehingga 12 bulan ke hadapan.');
  }
  if (nights < 1 || nights > MAX_NIGHTS) errors.push(`Bilangan malam mesti antara 1 dan ${MAX_NIGHTS}.`);

  const units = p.type === 'camping' ? 0 : int(input.units, 1);
  if (p.type !== 'camping' && (units < 1 || units > p.maxUnits)) errors.push(`Bilangan unit mesti antara 1 dan ${p.maxUnits}.`);

  const adults = int(input.adults, 0), teens = int(input.teens, 0), children = int(input.children, 0);
  const tents = p.tents ? int(input.tents, 0) : 0;
  for (const [v, label] of [[adults, 'dewasa'], [teens, 'kanak-kanak 11–17 tahun'], [children, 'kanak-kanak 10 tahun ke bawah']])
    if (v < 0 || v > 300) errors.push(`Bilangan ${label} tidak sah.`);
  if (tents < 0 || tents > 50) errors.push('Bilangan sewa khemah tidak sah.');
  const guests = adults + teens + children;
  if (guests < 1) errors.push('Sila masukkan bilangan tetamu.');
  if (p.type === 'camping' && adults + teens < 1) errors.push('Tapak perkhemahan memerlukan sekurang-kurangnya 1 dewasa atau remaja.');
  if (p.maxGuests && guests > p.maxGuests * units) errors.push(`${p.name} memuatkan sehingga ${p.maxGuests} orang.`);

  const lines = [];
  if (p.type === 'camping') {
    if (adults) lines.push({ label: `Dewasa × ${adults} × ${nights} malam`, amount: money(adults * p.adult * nights) });
    if (teens) lines.push({ label: `Kanak-kanak 11–17 tahun × ${teens} × ${nights} malam`, amount: money(teens * p.teen * nights) });
    if (children) lines.push({ label: `Kanak-kanak 10 tahun ke bawah × ${children}`, amount: 0 });
  } else {
    lines.push({ label: `${p.name}${units > 1 ? ' × ' + units + ' unit' : ''} × ${nights} malam`, amount: money(p.price * units * nights) });
  }
  if (tents) lines.push({ label: `Sewa khemah × ${tents} × ${nights} malam`, amount: money(tents * KHEMAH_RM * nights) });
  const total = money(lines.reduce((s, l) => s + l.amount, 0));
  if (!errors.length && total <= 0) errors.push('Jumlah bayaran mesti lebih daripada RM0.');

  return {
    ok: errors.length === 0, errors, pakej: id, name: p.name,
    checkin, checkout: errors.length ? '' : addDays(checkin, nights), nights, units, adults, teens, children, tents,
    lines, total
  };
}
