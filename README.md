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
  menyentuh / klik di mana-mana pada halaman buat kali pertama (pelayar menyekat audio auto-main sebelum
  pengguna berinteraksi). Dimainkan sekali sahaja. Untuk matikan auto-main, buang blok "Auto-main" dalam `js/main.js`.
- **Lokasi & penilaian:** koordinat dan teks "4.5 · 107 ulasan" ada dalam `index.html` (hero dan bahagian Lokasi). Kemas kini bilangan ulasan sekali-sekala.
- **Cache pelayar:** pautan CSS/JS dalam `index.html` ada nombor versi (`style.css?v=20261106-1`).
  Naikkan nombor itu setiap kali `css/style.css` atau `js/main.js` diubah.
- **Domain:** URL kanonik, Open Graph, `robots.txt` dan `sitemap.xml` menggunakan
  `https://teratakrimbaabampeah.my/` (domain rasmi, dihoskan di Netlify). Jika domain bertukar, cari & ganti
  alamat ini dalam `index.html`, `sitemap.xml`, `robots.txt` dan `llms.txt`.

## Bayaran Online (CHIP Collect)

Borang **Tempah & Bayar Online** (`#tempah`) — untuk **pondok & glamping** — membolehkan pelanggan memilih pakej, tarikh, bilangan malam / unit / tetamu
dan sewa khemah, kemudian membuat **bayaran penuh** melalui **CHIP** (chip-in.asia): FPX, DuitNow QR, kad atau e-wallet
(mengikut kaedah yang aktif dalam akaun CHIP).

### Cara ia berfungsi
1. Pelanggan isi borang → `POST /api/create-payment` (Netlify Function).
2. Pelayan **mengira semula jumlah** daripada `js/pricing.mjs` (harga daripada pelayar tidak dipercayai), mencipta
   no. tempahan `TRyymmddXXXXXX`, **memegang tarikh 30 minit**, kemudian mencipta *Purchase* CHIP (`POST /purchases/`,
   jumlah dalam **sen**, `reference` = no. tempahan, `due_strict` = tamat serentak dengan pegangan tarikh).
3. Pelanggan dibawa ke `checkout_url` CHIP untuk membayar.
4. CHIP menghantar `success_callback` ke `/api/chip-callback` — **tandatangan `X-Signature` (RSA-SHA256) disahkan**
   dengan kunci awam CHIP sebelum tarikh ditutup.
5. Pelanggan kembali ke `bayaran.html`, yang menyemak status sebenar melalui `/api/payment-status` (`GET /purchases/{id}/`).
6. Setiap tempahan & keputusan bayaran direkod dalam **Netlify Forms** (`tempahan` dan `bayaran`) — boleh dihantar ke emel pemilik.
   Resit bayaran dihantar kepada pelanggan oleh CHIP (`send_receipt`).

| Fail | Fungsi |
|---|---|
| `js/pricing.mjs` | Jadual harga, unit & pengiraan — **satu sumber** untuk borang dan pelayan |
| `js/booking.js` | Borang, kalendar kekosongan, ringkasan harga, hantar ke pelayan |
| `netlify/functions/create-payment.mjs` | Pegang tarikh & cipta Purchase CHIP |
| `netlify/functions/chip-callback.mjs` | Terima & sahkan `success_callback` CHIP |
| `netlify/functions/payment-status.mjs` | Semak status Purchase |
| `netlify/functions/config.mjs` | Beritahu borang sama ada bayaran online aktif |
| `netlify/lib/chip.mjs` | Panggilan API CHIP, kunci awam & pengesahan tandatangan |
| `netlify/lib/common.mjs` | No. tempahan, nombor telefon, Netlify Forms |
| `netlify/lib/slots.mjs` | Kekosongan: pegang / sahkan / lepaskan tarikh (Netlify Blobs) |
| `netlify/functions/availability.mjs` | Kekosongan awam untuk kalendar borang |
| `netlify/functions/admin.mjs` | API halaman admin (dilindungi `ADMIN_PASSWORD`) |
| `admin.html` | Halaman admin kekosongan & senarai tempahan |
| `bayaran.html` | Halaman keputusan bayaran |
| `terma.html` | Terma, Polisi Pembatalan & Bayaran Balik, Polisi Privasi (PDPA) |

### Mengaktifkan bayaran (perlu Netlify — GitHub Pages tidak boleh menjalankan fungsi pelayan)
1. **Portal CHIP** (<https://portal.chip-in.asia>) → *Collect → Developers*:
   - **API keys** → salin **Secret key** (mula dengan kunci **ujian / test**);
   - **Brands** → salin **Brand ID**.
2. **Netlify → teratak-rimba-abam-peah → Project configuration → Environment variables** → tambah (tanda *secret* untuk kunci):

   | Nama | Nilai |
   |---|---|
   | `CHIP_SECRET_KEY` | Secret API key (ujian dahulu, kemudian live) |
   | `CHIP_BRAND_ID` | Brand ID |
   | `CHIP_MODE` | `test` semasa menguji (papar notis "Mod ujian") — **padam** bila guna kunci live |
   | `CHIP_METHODS` | *(pilihan)* hadkan kaedah, cth. `fpx,duitnow_qr,visa,mastercard` |
   | `ADMIN_PASSWORD` | Kata laluan halaman `/admin.html` (min. 8 aksara) |

3. *Deploys → Trigger deploy*.
4. **Netlify → Forms → Form notifications** → tambah emel pemilik untuk borang `tempahan` dan `bayaran`.
5. Uji dengan kunci ujian: kad berjaya `4444 3333 2222 1111` (CVC `123`, tarikh luput akan datang); tukar CVC untuk
   menguji kegagalan. Kemudian tukar `CHIP_SECRET_KEY` kepada kunci **live**, padam `CHIP_MODE`, dan deploy semula.

Tanpa kunci (atau di GitHub Pages), borang secara automatik bertukar kepada butang **Tempah melalui WhatsApp**.

### Kalendar kekosongan & halaman admin

- **Pelanggan** melihat kalendar dalam borang: tarikh penuh dipangkah merah; bagi Pondok Atas Jambatan, angka kecil
  menunjukkan bilangan unit kosong. Butang bayar dimatikan jika tarikh penuh, dan pelayan menyemak semula.
- **Semasa bayaran**, tarikh dipegang **30 minit** (penguncian atomik setiap unit & malam dalam Netlify Blobs —
  dua pelanggan tidak boleh memegang unit sama). Bayaran **berjaya** → tarikh ditutup kekal; **gagal / batal**
  atau tamat 30 minit → tarikh dibuka semula.
- **Pemilik** buka `/admin.html` (kata laluan = `ADMIN_PASSWORD`):
  - pilih unit (10 unit: 6 pondok, glamping, 4 Pondok Atas Jambatan — Do, Re, Mi, Sarip Dol);
  - tekan tarikh kosong → **Tutup** (untuk tempahan WhatsApp / walk-in, dengan catatan);
  - tekan tarikh merah → **Buka semula**; tekan tarikh emas → lihat butiran tempahan online;
  - borang *Tutup / Buka Julat Tarikh* untuk banyak malam sekali;
  - senarai **Tempahan Online Terkini** dengan status (Dibayar / Menunggu / Gagal / KONFLIK).
- Tetapkan `ADMIN_PASSWORD` (sekurang-kurangnya 8 aksara, kata laluan kuat) di Netlify → Environment variables.
- Data disimpan dalam Netlify → *Data & Storage → Blobs* → store `kekosongan`.
- Tapak Perkhemahan tiada had unit dan tidak menggunakan kalendar.

### Menukar harga
Ubah `js/pricing.mjs` **dan** kad pakej / FAQ / JSON-LD dalam `index.html`, kemudian naikkan nombor versi `?v=` bagi
`js/booking.js` dan import `pricing.mjs` di dalamnya.

> **Tapak Perkhemahan tidak dibayar online** — bayaran manual di tapak (`online: false` dalam `js/pricing.mjs`);
> kad camping memaparkan "Bayaran di tapak" dan tempahan slot melalui WhatsApp. Pelayan menolak bayaran online untuk camping.
>
> **Perlu disahkan pemilik sebelum production:** kandungan Polisi Pembatalan dalam `terma.html` ialah draf.

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

## Deploy ke Netlify (laman utama)

**Laman rasmi:** <https://teratakrimbaabampeah.my> (alamat Netlify: <https://teratak-rimba-abam-peah.netlify.app>) — projek Netlify `teratak-rimba-abam-peah`
(pasukan *borhanlimapos*). Netlify Forms aktif.

**Domain `teratakrimbaabampeah.my` → Netlify** (bayaran online hanya berfungsi di Netlify, bukan GitHub Pages):
1. Netlify → projek → *Domain management → Add a domain* → `teratakrimbaabampeah.my` (tambah juga `www`).
2. Di panel DNS pendaftar domain: rekod **A** `@` → `75.2.60.5`; rekod **CNAME** `www` → `teratak-rimba-abam-peah.netlify.app`.
   Padam rekod A GitHub Pages (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`).
3. GitHub → repo → *Settings → Pages* → buang custom domain / matikan Pages.
4. HTTPS dikeluarkan automatik oleh Netlify selepas DNS bertukar (biasanya beberapa minit hingga 24 jam).

**Deploy automatik (disyorkan):** Netlify → projek → *Project configuration → Build & deploy → Link repository* →
GitHub → `Dynopos/Abam-peah` → branch produksi. Build command: *(kosong)*. Publish directory: `.`
Selepas dipaut, setiap `git push` akan deploy sendiri.


Diperlukan untuk Bayaran Online — lihat bahagian *Bayaran Online* di atas.

*Add new site → Import an existing project → GitHub* → pilih repo. Build command: *(kosong)*. Publish directory: `.`

## Pratonton tempatan

```
python3 -m http.server 8000
```
Buka <http://localhost:8000>.
