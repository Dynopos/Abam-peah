# Tempahan: WhatsApp, bayaran online (CHIP) & kalendar kekosongan

## Lalai: WhatsApp-first
Setiap butang tempahan ialah `<a data-wa="…">` ke satu URL WhatsApp (cth. `https://hi.jomwasap.my/…` atau
`https://wa.me/60…`). `main.js` menetapkan semuanya daripada `BOOKING_URL`. Ini cukup untuk kebanyakan pelanggan.

## Tambahan: Tempah & Bayar Online + kalendar (`assets/booking-addon/`)
Versi lengkap yang telah diuji (CHIP Collect + Netlify Functions + Netlify Blobs). Salin ke laman dan sesuaikan:

| Fail | Sesuaikan |
|---|---|
| `js/pricing.mjs` | `PAKEJ` (harga, jenis, `maxUnits`, `maxGuests`, `tents`, `online:false` untuk bayar di tapak), `UNITS` (unit fizikal setiap pakej), `UNIT_LABEL` |
| `js/booking.js` | Pautan WhatsApp `WA` |
| `netlify/functions/*` , `netlify/lib/*` | Biasanya tiada perubahan |
| `admin.html`, `bayaran.html`, `terma.html` | Nama, logo, **polisi pembatalan — sahkan dengan pemilik** |
| `netlify.toml`, `package.json` | `@netlify/blobs` |
Tambah juga ke `index.html`: bahagian `#tempah` (borang + kalendar + ringkasan), `<form name="tempahan">` dan
`<form name="bayaran">` tersembunyi (Netlify Forms), pautan `[data-book]` pada kad, dan
`<script type="module" src="js/booking.js">`. Rujuk laman Teratak Rimba (repo `Dynopos/Abam-peah`) sebagai contoh.

### Aliran
1. Borang → `POST /api/create-payment`. Pelayan **mengira semula jumlah** (jangan percaya pelayar), sahkan nama/emel/
   telefon MY/persetujuan terma, honeypot `website`.
2. **Pegang tarikh 30 minit** secara atomik (lihat di bawah) → 409 jika penuh.
3. CHIP `POST /purchases/`: harga dalam **sen**, `reference` = no. tempahan `TRyymmddXXXXXX`, `due` = tamat pegangan,
   `purchase.due_strict: true` (tiada bayaran selepas tarikh dilepaskan), `send_receipt`, redirect ke `bayaran.html`.
4. `/api/chip-callback`: sahkan `X-Signature` (RSA PKCS#1 v1.5 SHA-256 atas badan **mentah**) dengan `GET /public_key/`
   → `confirmBooking`. Idempoten.
5. `bayaran.html` → `/api/payment-status` → `GET /purchases/{id}/` (jangan percaya redirect); jika dibayar, sahkan juga.
6. Rekod ke Netlify Forms (notifikasi emel pemilik). Tanpa kunci CHIP, `/api/config` → `enabled:false` dan butang
   bertukar ke "Tempah melalui WhatsApp" (jadi laman masih berfungsi di GitHub Pages).
Gateway lain (Bayarcash, ToyyibPay, Billplz, SenangPay) — gantikan `netlify/lib/chip.mjs` + 3 fungsi; selebihnya sama.
Gunakan skill gateway berkenaan untuk medan & tandatangan tepat.

### Kalendar kekosongan (Netlify Blobs, store `kekosongan`, `consistency:'strong'`)
- Satu kunci setiap unit & malam: `slot/<unit>/<YYYY-MM-DD>`, metadata `{state: hold|booked|blocked, order, expires}`.
- Tuntut dengan `set(key, body, {onlyIfNew:true})`; jika wujud & hold tamat atau milik tempahan sama →
  `onlyIfMatch: etag`. **Kandungan mesti unik setiap tulisan** (ETag dikira daripada kandungan — kandungan kosong
  menjadikan semua ETag sama dan `onlyIfMatch` tidak bermakna).
- Pelbagai unit (cth. 4 pondok sama jenis): pilih unit yang kosong untuk SEMUA malam; lepaskan tuntutan separa.
- `/api/availability` (awam, tiada data peribadi) → kalendar borang: tarikh penuh dipangkah, bilangan unit kosong,
  butang bayar dimatikan.
- `/admin.html` + `/api/admin` (header `X-Admin-Key` = `ADMIN_PASSWORD`, banding `timingSafeEqual`, lengah 800 ms bila
  salah): tutup/buka tarikh (tempahan WhatsApp/walk-in), julat tarikh, lihat & kosongkan tempahan, senarai tempahan.

### Ujian tempatan (wajib sebelum deploy)
`BlobsServer` daripada `@netlify/blobs/dist/server.js` + `NETLIFY_BLOBS_CONTEXT` (base64 `{edgeURL, uncachedEdgeURL,
siteID, token}`). Pelayan tempatan itu **tidak atomik** — letak perantara HTTP bersiri di hadapannya untuk meniru
Netlify. Tiruan CHIP: jana pasangan kunci RSA, `GET /public_key/` pulangkan PEM, tandatangan callback. Uji: 6 permintaan
serentak untuk unit sama → tepat 1 berjaya; bayaran berjaya/gagal; hold tamat diambil alih; callback diubah → 400.
