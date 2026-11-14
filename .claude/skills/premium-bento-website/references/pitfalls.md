# Pengajaran daripada projek sebenar (semak sebelum serah)

| Gejala | Punca | Pembetulan |
|---|---|---|
| HTML 12 MB, lambat | Gambar/video dibenam base64 | Ekstrak ke `assets/`, WebP + srcset, video CRF 27 `faststart`, `preload="none"` |
| Jarak antara seksyen hilang | `.wrap{padding:0 24px}` dalam media query menindih `padding-top` `.section` | Guna `padding-inline` |
| "RM10" / label terpotong di telefon | Statistik hero separuh lebar | Penuh lebar `<700px`; `min-width:0` pada anak grid |
| Halaman lebih lebar dari skrin | Anak grid `1fr` = `minmax(auto,1fr)`; `<input type=date>`; pautan panjang | `minmax(0,1fr)`, `min-width:0`, `width:100%`, `overflow-wrap:anywhere` |
| Modal terpotong di telefon | Lajur grid ikut lebar barisan thumbnail | `grid-template-columns:minmax(0,1fr)` |
| Panel masih kelihatan selepas `hidden` | `display:grid/flex` menindih atribut `hidden` | `[hidden]{display:none!important}` |
| Butang anak panah muncul untuk 1 gambar | `.nav-btn{display:grid}` menindih `hidden` | `.nav-btn[hidden]{display:none}` |
| Logo herot | `height` atribut tanpa `height:auto` | `img{height:auto}` bila hanya `width` ditetapkan dalam CSS |
| Legend fieldset pelik | `float` legend dalam fieldset grid | Fieldset `display:block` + `div` grid di dalam |
| Marquee bertindih | Animasi setiap `li` | Animasi trek, gandakan item, `translateX(-50%)` |
| "Infinity:NaN" pada voice note | Tempoh Opus tidak diketahui | `data-duration` sandaran |
| Lagu tak auto-main | Dasar pelayar | Main pada interaksi pertama (lihat voice-note.md) — terangkan kepada pemilik |
| Dua orang dapat tarikh sama | ETag sama (kandungan kosong) / pelayan Blobs tempatan tidak atomik | Kandungan unik; uji melalui perantara bersiri |
| Bayaran online "tak jalan" | Domain ke GitHub Pages / kunci belum dimasukkan | Semak DNS & env vars dahulu |
| Fasiliti tidak tepat | Ditambah daripada gambar | Hanya fasiliti pada poster; label tekaan (cth. "gerai") minta pemilik sahkan |
| Ejaan nama berbeza (AJS/Ajis, Saip/Sarip) | Laman lama vs poster | Ikut poster, tanya pemilik sekali |
