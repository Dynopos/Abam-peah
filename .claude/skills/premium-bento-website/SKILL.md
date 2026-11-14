---
name: premium-bento-website
description: Bina, perkemas atau klon laman web premium gaya Bento Grid (Gold, Silver & Dark Navy) untuk resort, homestay, chalet, glamping, tapak perkhemahan, kafe, butik atau perniagaan tempatan Malaysia — lengkap dengan voice note gaya WhatsApp (auto-main pada sentuhan pertama), animasi premium (reveal, Ken Burns, marquee, kilauan emas), butang Booking Now WhatsApp, galeri + lightbox, video, peta, SEO & GEO (JSON-LD, llms.txt, geo-tag), dan pilihan Tempah & Bayar Online (CHIP) dengan kalendar kekosongan serta halaman admin, kemudian deploy ke Netlify/GitHub Pages. Gunakan skill ini setiap kali pengguna mahu "buat website", "landing page resort/homestay", "website macam Teratak Rimba", "letak voice note dalam web", "tambah animasi", "bento", "booking WhatsApp", "web premium emas navy", atau menghantar logo/poster harga/gambar/video perniagaan untuk dijadikan laman web — walaupun mereka tidak menyebut "bento" atau "skill".
---

# Premium Bento Website

Skill ini merangkum cara membina laman Teratak Rimba Abam Peah Resort (Kuala Krai) — laman premium yang matlamatnya
**menukar pelawat kepada tempahan WhatsApp/bayaran**, bukan sekadar galeri. Kod dalam `assets/` telah diuji pada
laman sebenar; gunakannya sebagai titik mula dan sesuaikan kepada perniagaan baharu.

Pengguna biasanya pemilik perniagaan, bukan pengaturcara, dan berbual dalam Bahasa Melayu santai. Balas dalam BM,
terangkan dengan ringkas, dan beritahu dengan jelas apa yang **mereka** perlu buat sendiri (kunci API, DNS).

## Aliran kerja

### 1. Kumpul & semak aset sebenar
Minta / buka: logo, poster harga (biasanya kolaj gambar + harga + fasiliti), foto sebenar, video, voice note,
pautan WhatsApp, lokasi (koordinat GPS / pautan Google Maps), ulasan Google. **Gunakan aset sebenar, bukan foto stok.**
- Fail HTML lama yang besar sering membenam gambar sebagai base64 — ekstrak dan bandingkan dengan foto asal.
- Buat helaian kenalan (contact sheet) dan **lihat** setiap poster untuk menentukan kotak potongan gambar dan
  membaca harga/fasiliti. Harga & fasiliti datang **daripada poster/pemilik sahaja**; jangan tambah fasiliti yang
  hanya "nampak" dalam gambar. Jika ejaan nama berbeza antara laman lama dan poster, ikut poster dan sahkan.
- Semak saiz fail muat naik (voice note 0 bait pernah berlaku → minta muat naik semula).
- Jangan buang kandungan atau fungsi laman sedia ada — kekalkan teks, bahagian dan ciri lama sambil menaik taraf.

### 2. Optimumkan media
```bash
python3 scripts/optimize_media.py --out <laman> --hero <foto-hero> --photos <foto...> \
    --crops crops.json --posters <poster...> --logo <logo> --video <video> --audio <voicenote>
```
Ia mencetak saiz sebenar setiap output — guna untuk `width`/`height` dan `srcset` (jangan teka).

### 3. Bina laman daripada templat
Salin `assets/starter/` (index.html, css/style.css, js/main.js) ke akar laman, kemudian isi setiap `{{PEMEGANG}}`.
Bahagian lazim (susun ikut keperluan): nav sticky → hero bento (foto, H1, CTA, **voice note**, logo, statistik,
lokasi + ★ ulasan, marquee) → pakej (kad bento: gambar, harga, fasiliti, Lihat Gambar, **BOOKING NOW**) →
tempah 3 langkah → aktiviti/program → kemudahan → video → galeri → lokasi (peta, Google Maps, Waze, salin GPS) →
tentang & fakta ringkas → soalan lazim → CTA → footer → butang WhatsApp terapung.
- `references/design-system.md` — token warna/fon, susun atur grid bento, isi kad, elemen penukaran.
- `references/animations.md` — senarai animasi dan cara melaksanakannya dengan betul.
- `references/voice-note.md` — fail audio (OGG + M4A), `data-duration`, dasar auto-main pelayar & cara menerangkannya.
- `css/style.css` starter ialah fail penuh laman asal (termasuk gaya borang tempahan, kalendar, kemudahan) —
  buang gaya yang tidak digunakan jika mahu, tetapi kekalkan token & komponen teras.

### 4. SEO & GEO
Ikut `references/seo-geo.md`: meta + geo-tag, H1 bernama & berlokasi, JSON-LD dijana skrip (perniagaan + unit +
tawaran + FAQPage sama persis dengan FAQ yang kelihatan + VideoObject), bahagian Tentang + Fakta Ringkas,
`llms.txt`, `robots.txt` yang membenarkan perayap AI, `sitemap.xml` bergambar, `site.webmanifest`, `404.html`.

### 5. (Pilihan) Tempah & Bayar Online + kalendar kekosongan
Hanya jika pemilik mahu bayaran online. Tanya: gateway apa (akaun merchant atas nama mereka), bayaran penuh atau
deposit, pakej mana yang dibayar di tapak. Kemudian salin `assets/booking-addon/` dan ikut
`references/booking-payments.md`. Perlu Netlify (GitHub Pages tidak boleh menjalankan fungsi pelayan).

### 6. Uji sebelum serah
```bash
python3 -m http.server 8000 &          # atau pelayan dev dengan fungsi tiruan untuk add-on
node scripts/check_layout.js http://localhost:8000/ "<WA_URL>" --shots <folder>
```
Semak 7 lebar skrin × saiz teks biasa & 115% (tetapan fon besar telefon): tiada teks terpotong, tiada limpahan,
imej tidak rosak, tiada ralat konsol, semua `[data-wa]` → URL sama, tiada `{{` tertinggal. Lihat tangkapan skrin
sendiri (desktop & 390 px) — banyak masalah hanya ketara secara visual. Semak juga `references/pitfalls.md`.
Uji voice note (main, jeda, auto-main pada tap) dan modal/lightbox. Jangan dakwa sesuatu "berfungsi live" jika anda
hanya menguji secara tempatan — nyatakan apa yang diuji dan di mana.

### 7. Deploy & serah
Ikut `references/deploy.md` (Netlify disyorkan; domain, DNS, env vars, cache-busting `?v=`). Tulis `README.md`
dalam BM: kandungan laman, harga, struktur fail, cara menukar harga/gambar/voice note/pautan WhatsApp, deploy.
Commit dengan mesej jelas. Akhiri dengan senarai ringkas perkara yang **pemilik perlu sahkan atau lakukan**
(harga/fasiliti, label tekaan, polisi pembatalan, kunci API, DNS, Google Search Console).

## Prinsip
- **Tempahan dahulu**: setiap skrin ada jalan ke WhatsApp/bayar dalam satu ketikan.
- **Aset sebenar & fakta pemilik**: jangan reka harga, fasiliti, ulasan, alamat atau polisi; tandakan draf.
- **Mobile-first & pantas**: kebanyakan pelawat dari telefon; WebP + srcset, `loading="lazy"`, peta dimuat bila
  hampir kelihatan, fon tidak menyekat, video `preload="none"`.
- **Boleh diakses**: `alt` deskriptif, `aria-label`, fokus dalam dialog, Escape menutup, `prefers-reduced-motion`.
- **Rahsia di pelayan sahaja**: kunci gateway & kata laluan admin dalam env vars Netlify yang dimasukkan pemilik.
