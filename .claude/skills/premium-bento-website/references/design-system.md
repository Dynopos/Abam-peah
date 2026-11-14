# Sistem reka bentuk Premium Bento (Gold · Silver · Dark Navy)

## Token (`:root` dalam style.css)
- Navy: `--navy-950 #040d1c`, `--navy-900 #071a33` (latar), `--navy-800/700/600`.
- Emas: `--gold #d4ad5f`, `--gold-hi #f4dc9f`, `--gold-lo #9c7638`; gradien logam `--g-gold` (5 hentian) untuk
  butang, harga, teks `<em>` (dengan `background-clip:text`).
- Perak: `--silver #c9d3df`, `--g-silver` untuk nombor langkah.
- Tipografi: **Cormorant Garamond** (tajuk, serif mewah), **Cinzel** (eyebrow/huruf besar, padan logo klasik),
  **Manrope** (badan). Dimuat dengan `rel=preload … onload` supaya tidak menyekat paparan.
- Jejari: 28/22/16/12 px. Tile ada bingkai gradien emas→perak melalui `::before` + mask.

Untuk jenama lain, tukar token warna sahaja — susun atur kekal. Ambil warna daripada logo pelanggan.

## Grid bento
Mobile-first: satu lajur → `≥700px` 6 lajur / 2 lajur kad → `≥1024px` 12 lajur.
- **Hero**: tile utama 7/12 × 3 baris (foto + H1 + CTA + voice note), logo 5/12, foto kecil, lokasi, statistik 4 nilai.
  Di telefon: statistik & foto **penuh lebar** (separuh lebar memotong "RM10" dan teks label).
- **Pakej**: `pkg--feature` 8/12 mendatar, `pkg--tall` 4/12 × 2 baris, `pkg` 4/12, `pkg--wide` 6/12 mendatar,
  `pkg--camp` mendatar. Pastikan setiap baris berjumlah 12 — jika tidak, ada lubang. Semasa ditapis, `.is-filtered`
  menjadikan semua kad 4/12.
- **Aktiviti**: 1 kad besar 6/12 × 2 baris + campuran kad bergambar dan kad ikon; elak kad ikon tinggi yang kosong.
- **Kemudahan**: 4 kad kecil 2×2 + 1 kad bergambar tinggi di kanan.

## Kandungan kad pakej
Gambar sebenar (potong dari poster jika itu sahaja yang ada), lencana, tag, nama (serif), fasiliti bertanda ✓ —
**hanya fasiliti yang tertulis pada poster/pengesahan pemilik**, harga besar emas, butang "Lihat Gambar"
(modal galeri + poster harga asal) dan **BOOKING NOW** (WhatsApp). Kad yang dibayar di tapak (cth. camping):
tunjuk "Bayaran di tapak" dan bukan butang bayar online.

## Elemen penukaran (laman ini untuk tempahan, bukan galeri)
Butang Booking Now di nav, hero, setiap kad, modal, langkah, video, lokasi, CTA akhir, footer, dan butang terapung.
Semua `[data-wa]` menghala ke satu URL. Bahagian "Tempah dalam 3 langkah" dan bukti sosial (★ ulasan Google).
