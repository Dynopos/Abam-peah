# Animasi & kesan premium

Semua animasi dalam `assets/starter/css/style.css` + `js/main.js`. Prinsip: halus, pantas (≤ 0.9 s), lengkung
`cubic-bezier(.2,.7,.2,1)` (`--ease`), dan **dimatikan sepenuhnya** di bawah `prefers-reduced-motion: reduce`.

| Kesan | Cara | Nota |
|---|---|---|
| Muncul semasa skrol | `.reveal` → `.is-in` oleh IntersectionObserver; `style="--d:.08s"` untuk lata (stagger) | Kelas `.js` pada `<html>` supaya tanpa JS kandungan tetap kelihatan |
| Ken Burns hero | `@keyframes kenburns` scale 1→1.1 selama 22 s, `alternate` | Pada `<img>` dalam `.tile__bg` |
| Logo terapung | `@keyframes float` translateY ±8px, 7 s | |
| Kilauan butang emas | `.btn--gold::after` gradien putih bergerak `translateX(-120%→120%)` semasa hover | |
| Angkat kad | `.pkg:hover{transform:translateY(-6px)}` + zum imej `scale(1.07)` | |
| Marquee kemudahan | Trek `ul.marquee__track{width:max-content}` dianimasi `translateX(-50%)`; JS **gandakan** item | Jangan animasi setiap `li` sendiri-sendiri — item akan bertindih |
| Titik berdenyut | `.eyebrow .dot` + `@keyframes pulse` | |
| Cincin WhatsApp | `.fab::before` + `@keyframes ring` | Butang terapung hijau WhatsApp + bingkai emas |
| Garis bawah menu | `::after` `scaleX(0→1)`; pautan aktif via IntersectionObserver | |
| Modal/lightbox | `@keyframes pop` + latar `backdrop-filter: blur` | |
| Nav kaca | `backdrop-filter: blur(18px)`; kelas `.is-scrolled` tambah bayang | |

Ujian: tangkap skrin dengan semua `.reveal` dipaksa `.is-in`, kerana tangkapan halaman penuh tidak menatal.
