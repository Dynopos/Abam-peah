# Teratak Rimba Abam Peah Resort: Laman Web Rasmi

Laman web statik (HTML, CSS, JavaScript tanpa proses build) untuk **Teratak Rimba Abam Peah Resort, Kuala Krai, Kelantan**.
Reka bentuk **Premium Bento Grid** bertema Gold, Silver dan Dark Navy, mobile-first, dan dibina untuk menukar pelawat
kepada **tempahan WhatsApp**.

Semua butang **Booking Now / WhatsApp** menuju ke: <https://hi.jomwasap.my/naksewateratak>

## Kandungan laman

| Bahagian | Isi |
|---|---|
| Nav (sticky) | Logo, menu (Pakej, Aktiviti, Galeri, Video, Lokasi, Soalan Lazim), butang Booking Now, menu hamburger di telefon |
| Hero (bento) | Gambar malam tepi sungai, tajuk, Booking Now, **voice note** gaya WhatsApp, logo premium, gambar sungai, statistik, lokasi |
| Pakej | 8 kad bento dengan gambar, harga, fasiliti, **BOOKING NOW** dan "Lihat Gambar" (modal galeri setiap pakej + poster harga asal). Penapis: Semua / Pondok / Glamping / Camping |
| Cara Tempah | 3 langkah ke WhatsApp |
| Aktiviti | Seminar, Kursus, Team Building, Camping, Program Sekolah, Family Day, Program Korporat |
| Kemudahan | Tepi sungai, Dewan BBQ, tandas berasingan, sewa khemah, sudut gerai jualan |
| Video | Video resort (dimampatkan, `preload="none"`) |
| Galeri | 22 gambar sebenar + lightbox (anak panah, leret, papan kekunci) |
| Lokasi | Kuala Krai, Kelantan, GPS 5.4984042, 102.3042285: peta Google, butang Google Maps / Waze / WhatsApp, penilaian Google 4.5★ (107 ulasan) |
| Tentang & Fakta Ringkas | Ringkasan resort + jadual fakta (untuk pelawat, Google dan enjin AI) |
| Soalan Lazim | 11 soalan (juga dalam data berstruktur FAQPage untuk Google) |
| Butang terapung | WhatsApp di penjuru kanan bawah, butang "ke atas" di kiri |

### Harga pakej

| Pakej | Harga |
|---|---|
| Pondok Haji Bakhil | RM100 / malam |
| Pondok Atas Jambatan (Do, Re, Mi, Sarip Dol) | RM130 / malam |
| Pondok Ajis | RM160 / malam |
| Pondok Sudin | RM160 / malam |
| Glamping Kak Peah | RM200 / malam |
| Pondok Abam Peah | RM300 / malam |
| Pondok P. Ramlee | RM330 / malam |
| Tapak Perkhemahan | RM10 dewasa, RM5 kanak-kanak 11–17 tahun, percuma 10 tahun ke bawah (sewa khemah RM30/hari) |

Harga dan fasiliti diambil daripada poster rasmi resort. Sila sahkan dengan pemilik sebelum terbit.

## Struktur fail

```
index.html             Laman utama (SEO, Open Graph, JSON-LD LodgingBusiness + FAQPage)
404.html               Halaman ralat
css/style.css          Gaya mobile-first (asas telefon, ≥700px tablet, ≥1024px desktop)
js/main.js             Menu, penapis pakej, modal, galeri/lightbox, voice note, animasi skrol
assets/img/            Gambar WebP dioptimumkan (-400/-800 potongan poster, -480/-960/-1600 foto sebenar,
                       poster-*-1200 poster harga asal, logo-*, og-image.jpg)
assets/video/          resort.mp4 (H.264, faststart) + poster.webp
assets/audio/          voice-note.ogg (Opus) + voice-note.m4a (AAC untuk iPhone/Safari)
favicon.svg, icon-192.png, icon-512.png, apple-touch-icon.png, site.webmanifest
robots.txt, sitemap.xml, llms.txt, netlify.toml, .nojekyll
```

## Tetapan penting

- **Pautan tempahan:** `js/main.js` → `const BOOKING_URL = '...'`. Semua elemen bertanda `data-wa`
  dikemas kini secara automatik. (Pautan dalam `index.html` dan JSON-LD juga sudah sama.)
- **Harga / fasiliti:** sunting terus kad `<article class="pkg">` dalam `index.html`. Modal "Lihat Gambar"
  membaca fasiliti daripada kad yang sama, jadi hanya satu tempat perlu dikemas kini.
  Kemas kini juga jadual `makesOffer` dan FAQ dalam JSON-LD jika harga berubah.
- **Gambar setiap pakej (modal):** senarai dalam `js/main.js` → `const PKG`.
- **Galeri:** senarai dalam `js/main.js` → `const GALLERY`.
- **Voice note:** ganti `assets/audio/voice-note.ogg` dan `voice-note.m4a` (nama sama). Kemas kini
  `data-duration="45"` pada `<audio id="vnAudio">` (tempoh dalam saat). Voice note dimainkan bila pelawat
  menekan butang main (pelayar tidak membenarkan audio auto-main tanpa sentuhan pengguna).
- **Lokasi & penilaian:** koordinat dan teks "4.5 · 107 ulasan" ada dalam `index.html` (hero dan bahagian Lokasi). Kemas kini bilangan ulasan sekali-sekala.
- **Cache pelayar:** pautan CSS/JS dalam `index.html` ada nombor versi (`style.css?v=20261106-1`).
  Naikkan nombor itu setiap kali `css/style.css` atau `js/main.js` diubah.
- **Domain:** URL kanonik, Open Graph, `robots.txt` dan `sitemap.xml` menggunakan
  `https://dynopos.github.io/Abam-peah/`. Jika guna domain sendiri, cari & ganti alamat ini.

## SEO & GEO

- **SEO (Google):** tajuk & meta description berkata kunci, H1 dengan nama + lokasi, canonical, hreflang,
  Open Graph/Twitter, data berstruktur JSON-LD (`WebSite`, `WebPage`, `LodgingBusiness`/`Campground` dengan
  setiap pondok sebagai `Accommodation` + harga `Offer`, `FAQPage`, `VideoObject`), `sitemap.xml` (termasuk
  gambar & video), fon dimuat tanpa menyekat paparan.
- **GEO (enjin AI: ChatGPT, Gemini, Perplexity, Claude):** bahagian *Tentang & Fakta Ringkas* (`#tentang`),
  11 soalan lazim berbentuk soal-jawab, `llms.txt` lengkap, `robots.txt` membenarkan semua perayap AI,
  tarikh "Dikemas kini" untuk kesegaran maklumat.
- **Geo-tag lokasi:** `geo.region` (MY-03 Kelantan), `geo.position`, `ICBM`, `GeoCoordinates` 5.4984042, 102.3042285.
- **Bila harga / fasiliti berubah:** kemas kini kad pakej, soalan lazim (HTML **dan** JSON-LD `FAQPage`),
  bahagian Fakta Ringkas, `llms.txt`, dan tarikh `dateModified` / "Dikemas kini".

### Selepas laman diterbitkan
1. Daftar laman di **Google Search Console** → hantar `sitemap.xml`.
2. Daftar di **Bing Webmaster Tools** (Bing juga digunakan oleh ChatGPT & Copilot).
3. Letak pautan laman web ini dalam **Google Business Profile** "Teratak Rimba Abam Peah".
4. Pastikan nama, lokasi dan pautan WhatsApp sama di Facebook, TikTok, Instagram dan direktori pelancongan.

## Deploy ke GitHub Pages

1. Gabungkan (merge) branch ini ke `main`.
2. Repo → *Settings → Pages* → *Source: Deploy from a branch* → branch `main`, folder `/ (root)` → *Save*.
3. Laman akan tersedia di `https://dynopos.github.io/Abam-peah/` dalam 1–2 minit.

Semua laluan adalah relatif, jadi laman juga berfungsi di domain sendiri atau sub-folder.

## Deploy ke Netlify

*Add new site → Import an existing project → GitHub* → pilih repo. Build command: *(kosong)*. Publish directory: `.`

## Pratonton tempatan

```
python3 -m http.server 8000
```
Buka <http://localhost:8000>.
