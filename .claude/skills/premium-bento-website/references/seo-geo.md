# SEO (Google) & GEO (enjin AI + geo-tag)

## Dalam `<head>`
- `<title>`: Nama | Tawaran utama Bandar, Negeri. Meta description ≤ 160 aksara dengan harga & bukti sosial.
- `canonical`, `hreflang` (`ms-MY` + `x-default`), Open Graph + Twitter (`og-image.jpg` 1200×630 + `og:image:alt`).
- Geo-tag: `geo.region` (ISO 3166-2, cth. Kelantan `MY-03`, Selangor `MY-10`, Terengganu `MY-11`, Pahang `MY-06`),
  `geo.placename`, `geo.position "lat;lng"`, `ICBM "lat, lng"`, `place:location:*`.
- H1 mesti mengandungi nama + lokasi; letak sebagai `.h1-kicker` kecil di atas slogan supaya reka bentuk kekal.

## Data berstruktur JSON-LD (`@graph`)
Jana dengan skrip Python (`json.dumps(..., ensure_ascii=False)`) supaya sah — jangan tulis tangan. Sahkan dengan
`json.loads` selepas menulis. Nod:
1. `WebSite` dan `WebPage` (`dateModified`, `primaryImageOfPage`, `speakable` → bahagian Tentang & FAQ).
2. Perniagaan: jenis sesuai (`LodgingBusiness`/`Campground`/`TouristAttraction`, `Restaurant`, `LocalBusiness`…),
   `alternateName` (semua ejaan nama), `address`, `geo`, `hasMap`, `priceRange`, `amenityFeature`, `knowsAbout`,
   `containsPlace` (setiap unit sebagai `Accommodation` dengan `bed`, `occupancy`, `amenityFeature`),
   `makesOffer` (`Offer` + `UnitPriceSpecification`, `itemOffered` → `@id` unit), `potentialAction: ReserveAction`
   → URL WhatsApp, `paymentAccepted`.
3. `FAQPage` — teks **sama persis** dengan soalan lazim yang kelihatan (jana kedua-duanya daripada satu senarai).
4. `VideoObject` jika ada video.
- **Jangan** masukkan `aggregateRating` daripada ulasan yang dipaparkan sendiri — Google menganggapnya
  "self-serving" untuk LocalBusiness. Paparkan ★ ulasan sebagai teks biasa sahaja.

## Kandungan untuk GEO (ChatGPT, Gemini, Perplexity, Claude, Copilot)
- Bahagian **"Tentang <Nama>"** dengan perenggan pembuka faktual (`.about__lead`) + jadual **Fakta Ringkas** `<dl>`:
  nama, jenis, lokasi, GPS, julat harga, pilihan, kemudahan, program, penilaian, cara tempah, tarikh dikemas kini.
- Soalan lazim 8–12 soalan yang orang benar-benar tanya (paling murah? untuk keluarga besar? aircond? dekat sungai?
  boleh bayar online? lokasi?). Jawapan lengkap, menyebut nama tempat.
- `llms.txt` di akar: H1, ringkasan `>` blockquote, fakta, pakej & harga, FAQ ringkas, pautan.
- `robots.txt`: `Allow` semua + senarai eksplisit GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot,
  Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Bingbot, CCBot, meta-externalagent;
  `Disallow: /api/`, `/bayaran.html`, `/admin.html`; baris `Sitemap:`.
- `sitemap.xml` dengan `image:image` (gambar utama) dan `video:video`.

## Selepas terbit (beritahu pemilik — mereka yang perlu buat)
Google Search Console + hantar sitemap; Bing Webmaster Tools (digunakan ChatGPT/Copilot); letak URL dalam
Google Business Profile; nama/WhatsApp konsisten di semua media sosial. Bila domain bertukar, cari & ganti URL dalam
`index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`.
