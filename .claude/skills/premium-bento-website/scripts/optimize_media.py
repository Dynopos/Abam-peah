#!/usr/bin/env python3
"""Optimumkan aset sebenar pelanggan untuk laman Premium Bento.

Menghasilkan fail dalam <out>/assets/... dan ikon di <out>/:
  foto        → <nama>-480.webp, -960.webp (+ -1600.webp untuk --hero)
  potongan    → <nama>-400.webp, -800.webp  (daripada poster/kolaj, guna --crops JSON)
  poster      → poster-<nama>-1200.webp     (poster harga asal untuk lightbox)
  logo        → logo-320.webp, logo-720.webp, logo-720.jpg, og-image.jpg (1200x630),
                apple-touch-icon.png, icon-192.png, icon-512.png
  video       → assets/video/video.mp4 (H.264 CRF 27, faststart) + poster.webp
  voice note  → assets/audio/voice-note.ogg (salinan) + voice-note.m4a (AAC, untuk iPhone/Safari)

Contoh:
  python3 optimize_media.py --out ./site \\
      --photos foto/*.jpg --hero foto/sungai-malam.jpg \\
      --crops crops.json --posters poster/*.jpg \\
      --logo logo.png --video video.mp4 --audio voicenote.ogg

crops.json (koordinat piksel pada imej asal; tengok imej dahulu untuk menentukan kotak):
  {"ramlee-luar": {"file": "poster/290887.jpg", "box": [96, 89, 694, 536]}}

Nama fail output = nama fail asal (tanpa sambungan), huruf kecil, ruang → '-'.
Keperluan: Pillow (dengan WebP), ffmpeg (untuk video/audio).
"""
import argparse, glob, json, os, re, shutil, subprocess, sys
from PIL import Image, ImageOps

def slug(p):
    return re.sub(r'[^a-z0-9-]+', '-', os.path.splitext(os.path.basename(p))[0].lower()).strip('-')

def save_widths(im, out_dir, name, widths, q=78):
    os.makedirs(out_dir, exist_ok=True)
    made = []
    for w in widths:
        x = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        fn = os.path.join(out_dir, f'{name}-{w}.webp')
        x.save(fn, 'WEBP', quality=q, method=6)
        made.append((fn, x.size))
    return made

def open_rgb(path):
    return ImageOps.exif_transpose(Image.open(path)).convert('RGB')

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print('  ! gagal:', ' '.join(cmd[:3]), r.stderr[-300:], file=sys.stderr)
    return r.returncode == 0

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', required=True, help='Folder akar laman')
    ap.add_argument('--photos', nargs='*', default=[], help='Foto sebenar (glob dibenarkan)')
    ap.add_argument('--hero', nargs='*', default=[], help='Foto hero (dapat saiz 1600 juga)')
    ap.add_argument('--crops', help='Fail JSON potongan daripada poster/kolaj')
    ap.add_argument('--posters', nargs='*', default=[], help='Poster harga asal')
    ap.add_argument('--logo', help='Logo PNG/JPG')
    ap.add_argument('--logo-box', help='Potong logo: x1,y1,x2,y2 (pilihan)')
    ap.add_argument('--video')
    ap.add_argument('--audio', help='Voice note (ogg/mp3/m4a/wav)')
    a = ap.parse_args()

    img_dir = os.path.join(a.out, 'assets', 'img')
    expand = lambda xs: [f for x in xs for f in (sorted(glob.glob(x)) or [x])]
    report = []

    for p in expand(a.hero):
        for fn, sz in save_widths(open_rgb(p), img_dir, slug(p), [480, 960, 1600]): report.append((fn, sz))
    for p in expand(a.photos):
        for fn, sz in save_widths(open_rgb(p), img_dir, slug(p), [480, 960]): report.append((fn, sz))
    if a.crops:
        spec = json.load(open(a.crops))
        base = os.path.dirname(os.path.abspath(a.crops))
        for name, s in spec.items():
            src = s['file'] if os.path.isabs(s['file']) else os.path.join(base, s['file'])
            im = open_rgb(src).crop(tuple(s['box']))
            for fn, sz in save_widths(im, img_dir, name, [400, 800]): report.append((fn, sz))
    for p in expand(a.posters):
        for fn, sz in save_widths(open_rgb(p), img_dir, 'poster-' + slug(p), [1200], q=80): report.append((fn, sz))

    if a.logo:
        L = Image.open(a.logo).convert('RGB')
        if a.logo_box: L = L.crop(tuple(int(v) for v in a.logo_box.split(',')))
        for w in (320, 720):
            x = L.resize((w, round(L.height * w / L.width)), Image.LANCZOS)
            x.save(os.path.join(img_dir, f'logo-{w}.webp'), 'WEBP', quality=85, method=6); report.append((f'logo-{w}.webp', x.size))
        L.resize((720, round(L.height * 720 / L.width)), Image.LANCZOS).save(os.path.join(img_dir, 'logo-720.jpg'), quality=85, optimize=True)
        # OG 1200x630: muat logo di tengah latar navy
        og = Image.new('RGB', (1200, 630), (7, 26, 51)); t = L.copy(); t.thumbnail((1100, 580))
        og.paste(t, ((1200 - t.width) // 2, (630 - t.height) // 2)); og.save(os.path.join(img_dir, 'og-image.jpg'), quality=82, optimize=True)
        side = min(L.size); sq = L.crop(((L.width - side) // 2, (L.height - side) // 2, (L.width + side) // 2, (L.height + side) // 2))
        for n, s in (('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512)):
            sq.resize((s, s), Image.LANCZOS).quantize(256).save(os.path.join(a.out, n), optimize=True)
        report.append(('ikon + og-image.jpg', (1200, 630)))

    if a.video:
        vd = os.path.join(a.out, 'assets', 'video'); os.makedirs(vd, exist_ok=True)
        mp4 = os.path.join(vd, 'video.mp4')
        if run(['ffmpeg', '-v', 'error', '-y', '-i', a.video, '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', mp4]):
            tmp = os.path.join(vd, '_poster.jpg')
            run(['ffmpeg', '-v', 'error', '-y', '-ss', '3', '-i', mp4, '-frames:v', '1', '-q:v', '3', tmp])
            if os.path.exists(tmp):
                Image.open(tmp).save(os.path.join(vd, 'poster.webp'), 'WEBP', quality=78); os.remove(tmp)
            report.append((mp4, f'{os.path.getsize(a.video) // 1024} KB → {os.path.getsize(mp4) // 1024} KB'))

    if a.audio:
        ad = os.path.join(a.out, 'assets', 'audio'); os.makedirs(ad, exist_ok=True)
        if os.path.getsize(a.audio) == 0:
            print('  ! Fail audio KOSONG (0 bait) — minta pelanggan muat naik semula.', file=sys.stderr)
        else:
            ogg = os.path.join(ad, 'voice-note.ogg')
            if a.audio.lower().endswith('.ogg'): shutil.copy(a.audio, ogg)
            else: run(['ffmpeg', '-v', 'error', '-y', '-i', a.audio, '-c:a', 'libopus', '-b:a', '64k', ogg])
            run(['ffmpeg', '-v', 'error', '-y', '-i', a.audio, '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', os.path.join(ad, 'voice-note.m4a')])
            r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.audio], capture_output=True, text=True)
            report.append(('voice-note.ogg + .m4a', f'tempoh {r.stdout.strip()} s → letak dalam data-duration'))

    for fn, info in report: print(f'{os.path.relpath(fn, a.out) if os.path.isabs(fn) or fn.startswith(a.out) else fn}: {info}')
    print(f'\n{len(report)} aset dihasilkan. Saiz sebenar (lebar × tinggi) di atas → guna untuk atribut width/height & srcset.')

if __name__ == '__main__':
    main()
