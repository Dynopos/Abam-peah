# Deploy

## Netlify (disyorkan — wajib untuk bayaran/kalendar)
- `netlify.toml`: `publish = "."`, `[functions] directory = "netlify/functions"`, `node_bundler = "esbuild"`; header
  cache untuk `/assets/*`; `no-store` + `noindex` untuk `bayaran.html`, `admin.html`; redirect 404 untuk `/netlify/*`
  dan `/.claude/*` (jangan terbitkan kod sumber/skill).
- Pemboleh ubah persekitaran (pemilik masukkan sendiri, tanda *secret*; jangan sekali-kali minta dalam chat):
  `CHIP_SECRET_KEY`, `CHIP_BRAND_ID`, `CHIP_MODE=test` (padam bila live), `ADMIN_PASSWORD`.
- Netlify MCP: `create-new-project` → `update-forms enabled` → `deploy-site` memberi arahan `npx @netlify/mcp …`.
  Dalam persekitaran berproksi, jalankan dengan `NODE_USE_ENV_PROXY=1` (fetch Node tidak membaca HTTPS_PROXY), dan
  hos `api.netlify.com` + `netlify-mcp.netlify.app` perlu dibenarkan. Semak `get-deploy-for-site`: `state: ready`,
  senarai fungsi, `secret_scan_result` kosong.
- Deploy manual tidak dipaut ke GitHub — cadangkan pemilik *Link repository* supaya setiap push deploy sendiri.

## Domain sendiri
- Netlify → Domain management → Add domain (+ `www`). DNS: **A `@` → `75.2.60.5`**, **CNAME `www` →
  `<projek>.netlify.app`**. Padam rekod A GitHub Pages (`185.199.108–111.153`). HTTPS automatik.
- Perangkap sebenar: pemilik menyambung domain ke **GitHub Pages** (fail `CNAME` muncul dalam repo) → laman nampak
  sama tetapi `/api/*` 404 → borang bayaran jatuh balik ke WhatsApp. Semak `git log` untuk commit "Create CNAME".

## GitHub Pages (laman statik sahaja)
Settings → Pages → Deploy from a branch → `/ (root)`, fail `.nojekyll`. Semua laluan relatif. Tiada fungsi pelayan.

## Cache
Versi pada pautan: `style.css?v=YYYYMMDD-n`, `main.js?v=…`, dan **import modul** (`pricing.mjs?v=…`). Naikkan setiap
kali fail berubah supaya telefon pelawat tidak guna salinan lama.
