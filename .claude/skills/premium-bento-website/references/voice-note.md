# Voice note (pemain gaya WhatsApp)

Pemain kecil dalam hero yang memainkan rakaman suara pemilik — memberi sentuhan peribadi dan meningkatkan kepercayaan.
Kod: HTML dalam `assets/starter/index.html` (`#vn`), CSS `.vn*` dalam `assets/starter/css/style.css`,
JS dalam blok "Voice note" `assets/starter/js/main.js`.

## Fail audio
- Sediakan **dua format**: `voice-note.ogg` (Opus, kecil) **dan** `voice-note.m4a` (AAC). Safari/iPhone lama tidak memainkan
  OGG, jadi `<source>` M4A ialah sandaran. `scripts/optimize_media.py --audio fail.ogg` menghasilkan kedua-duanya.
- Semak saiz fail selepas pelanggan muat naik — **fail 0 bait** pernah berlaku (muat naik gagal). Minta muat naik semula
  dan bina pemain dahulu; ia kekal tersembunyi (`hidden`) sehingga `loadedmetadata` berlaku, jadi laman tidak rosak.
- Tetapkan `data-duration="<saat>"` pada `<audio>`: Chrome kadang-kadang melaporkan tempoh Opus sebagai `Infinity`,
  yang memaparkan "Infinity:NaN". JS menggunakan nilai sandaran ini.

## Auto-main — terangkan kepada pelanggan
Pelanggan hampir pasti akan bertanya "kenapa lagu tak auto play". Jawapan jujur: **semua pelayar (Chrome, Safari)
menyekat bunyi sebelum pelawat menyentuh halaman** — tiada laman boleh memaksanya. Penyelesaian yang dilaksanakan:
1. Cuba `audio.play()` sebaik dimuat (berjaya pada sesetengah pelayar desktop yang "kenal" laman itu).
2. Jika ditolak (`NotAllowedError`), pasang pendengar pada `pointerdown`, `pointerup`, `touchend`, `click`, `keydown`
   (fasa *capture*) dan mainkan pada interaksi **pertama** di mana-mana. Tatal (scroll) **tidak** dikira oleh pelayar.
3. Abaikan interaksi pada butang voice note sendiri dan pada `<video>` (elak main lalu terus jeda).
4. Sekali sahaja: selepas `play` berlaku, buang pendengar. Jika pelawat jeda, jangan main semula.
5. Cincin emas berdenyut (`.vn.is-waiting`) pada butang main sebagai petunjuk visual sementara menunggu.
6. Video dan voice note saling menjeda supaya dua bunyi tidak bertindih.

Ujian: Playwright dengan `--autoplay-policy=user-gesture-required` → semasa dibuka `paused:true` + `is-waiting`;
selepas `touchscreen.tap()` → `paused:false`; tekan jeda → kekal dijeda selepas tap lain.

Untuk mematikan auto-main: buang blok "Auto-main" dalam `main.js`. Untuk gelung: tambah atribut `loop`.
