"""Turn the cut-out mascot PNGs into app-ready WebP poses (assets/brokey/).
Moods (~300px) get EDSR x2 super-resolution passes (2 passes = x4); the big stickers are just scaled down.
usage: python3 scripts/mascot3d/appassets.py [--fast | --model PATH_TO_EDSR_x2.pb | --index-only] [--passes N] [--max PX] [--out DIR] [--no-index] [name ...]"""
import os, sys, glob, time
import numpy as np, cv2
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'social', 'mascot3d')
OUT = os.path.join(ROOT, 'assets', 'brokey')
MAXPX = 900
PASSES = 2

def smooth_alpha(a, f=2):
    """upscale alpha and re-sharpen the edge so the sticker rim stays crisp"""
    a = cv2.resize(a, None, fx=f, fy=f, interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255
    a = cv2.GaussianBlur(a, (0, 0), 0.4 * f)
    a = np.clip((a - 0.5) * 2.2 + 0.5, 0, 1)
    return (a * 255).astype(np.uint8)

def sr_tiled(sr, img, tile=128, pad=12):
    """EDSR x2 in overlapping tiles: one big frame thrashes the CPU cache (minutes per image), tiles take seconds"""
    h, w = img.shape[:2]
    if max(h, w) <= 2 * tile: return sr.upsample(img)
    out = np.zeros((h * 2, w * 2, 3), np.uint8)
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad)
            y1, x1 = min(h, y + tile + pad), min(w, x + tile + pad)
            if img[y0:y1, x0:x1].min() == 255:  # pure backdrop, nothing to sharpen
                out[y * 2:min(h, y + tile) * 2, x * 2:min(w, x + tile) * 2] = 255
                continue
            up = sr.upsample(np.ascontiguousarray(img[y0:y1, x0:x1]))
            ty, tx = (y - y0) * 2, (x - x0) * 2
            th, tw = min(tile, h - y) * 2, min(tile, w - x) * 2
            out[y * 2:y * 2 + th, x * 2:x * 2 + tw] = up[ty:ty + th, tx:tx + tw]
    return out

def upscale(path, sr, passes=None):
    """sr=None means a fast Lanczos x2 (for quick iteration); pass the EDSR model for the real thing"""
    im = Image.open(path).convert('RGBA')
    arr = np.asarray(im)
    rgb, a = arr[..., :3].astype(np.float32), arr[..., 3:4].astype(np.float32) / 255
    on_white = (rgb * a + 255 * (1 - a)).astype(np.uint8)
    bgr = cv2.cvtColor(on_white, cv2.COLOR_RGB2BGR)
    n = passes or PASSES
    big = bgr
    for _ in range(n):
        big = sr_tiled(sr, big) if sr else cv2.resize(big, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
    big = cv2.cvtColor(big, cv2.COLOR_BGR2RGB)
    alpha = smooth_alpha(arr[..., 3], 2 ** n)
    return Image.fromarray(np.dstack([big, alpha]), 'RGBA')

def save(im, name):
    w, h = im.size
    s = MAXPX / max(w, h)
    if s < 1:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    tmp = os.path.join(OUT, name + '.tmp.webp')
    im.save(tmp, 'WEBP', quality=90, method=6, alpha_quality=100)
    os.replace(tmp, os.path.join(OUT, name + '.webp'))  # swap in whole, the app may be reading it
    return im.size

def main():
    global MAXPX, PASSES, OUT
    args = [a for a in sys.argv[1:] if a != '--no-index']
    model = os.environ.get('EDSR', '')
    for flag in ('--passes', '--max', '--out'):
        if flag in args:
            i = args.index(flag); v = args[i + 1]; del args[i:i + 2]
            if flag == '--passes': PASSES = int(v)
            elif flag == '--max': MAXPX = int(v)
            else: OUT = os.path.abspath(v)
    if '--model' in args:
        i = args.index('--model'); model = args[i + 1]; del args[i:i + 2]
    sr = None
    if '--fast' in args:
        args.remove('--fast')
    else:
        # needs opencv-contrib 4.x (the 5.x wheels ship an empty dnn_superres)
        sr = cv2.dnn_superres.DnnSuperResImpl_create()
        sr.readModel(model); sr.setModel('edsr', 2)
    os.makedirs(OUT, exist_ok=True)
    moods = sorted(glob.glob(f'{SRC}/moods/*.png'))
    # the big open-lid stickers are a different box design from the 35 moods, so they stay out of the app for now
    stick = [p for p in sorted(glob.glob(f'{SRC}/stickers/*.png')) if '--stickers' in sys.argv and not p.endswith('tile.png')]
    if '--stickers' in args: args.remove('--stickers')
    first = ['wave-happy', 'neutral', 'hips-smirk', 'sad', 'broke', 'shock', 'shades-coin', 'cheeky']  # the mood defaults go first
    moods.sort(key=lambda p: (first.index(os.path.basename(p)[:-4]) if os.path.basename(p)[:-4] in first else 99, p))
    for p in moods + stick:
        n = os.path.basename(p)[:-4]
        if args and n not in args: continue
        t = time.time()
        if p in stick:
            im = Image.open(p).convert('RGBA')
        else:
            im = upscale(p, sr)
        size = save(im, n)
        print(f'{n:14s} {size} {os.path.getsize(os.path.join(OUT, n + ".webp")) // 1024}KB {time.time() - t:.1f}s', flush=True)

def write_index():
    """src/art/poses.ts: static requires (metro needs literals) plus each pose's pixel size for the aspect ratio"""
    names = sorted(f[:-5] for f in os.listdir(OUT) if f.endswith('.webp') and '.tmp.' not in f)
    ident = lambda n: n.replace('-', '_')
    lines = ['// generated by scripts/mascot3d/appassets.py, do not edit', "import type { ImageSourcePropType } from 'react-native';", '',
             'export const POSE_IDS = [' + ', '.join(f"'{n}'" for n in names) + '] as const;', 'export type PoseId = (typeof POSE_IDS)[number];', '',
             'export const POSE_SRC: Record<PoseId, ImageSourcePropType> = {']
    for n in names:
        lines.append(f"  '{n}': require('../../assets/brokey/{n}.webp'),")
    lines += ['};', '', '/** intrinsic size in px, for aspect ratio */', 'export const POSE_SIZE: Record<PoseId, [number, number]> = {']
    for n in names:
        w, h = Image.open(os.path.join(OUT, n + '.webp')).size
        lines.append(f"  '{n}': [{w}, {h}],")
    lines += ['};', '']
    open(os.path.join(ROOT, 'src', 'art', 'poses.ts'), 'w').write('\n'.join(lines))
    print('wrote src/art/poses.ts', len(names), 'poses')

def write_thumbs():
    """src/art/poseThumbs.ts: tiny inline WebP data URIs of each mood's default pose, for the PDF (it is an HTML string, no asset loader)"""
    import base64, io
    # keep in step with the first entry of each mood in src/art/moodPoses.ts
    default = {'happy': 'wave-happy', 'ok': 'neutral', 'sideeye': 'hips-smirk', 'sad': 'sad', 'broke': 'broke', 'shock': 'shock', 'proud': 'shades-coin', 'tempted': 'cheeky'}
    lines = ['// generated by scripts/mascot3d/appassets.py, do not edit', "import type { Mood } from './mascot';", '', 'export const POSE_THUMB: Record<Mood, string> = {']
    for mood, pose in default.items():
        im = Image.open(os.path.join(OUT, pose + '.webp')).convert('RGBA')
        im.thumbnail((260, 260), Image.LANCZOS)
        b = io.BytesIO(); im.save(b, 'WEBP', quality=86, method=6, alpha_quality=100)
        lines.append(f"  {mood}: 'data:image/webp;base64,{base64.b64encode(b.getvalue()).decode()}',")
    lines += ['};', '']
    open(os.path.join(ROOT, 'src', 'art', 'poseThumbs.ts'), 'w').write('\n'.join(lines))
    print('wrote src/art/poseThumbs.ts')

if '--index-only' not in sys.argv:
    main()
if '--no-index' not in sys.argv:
    write_index()
    write_thumbs()
