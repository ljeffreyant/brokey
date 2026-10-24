#!/usr/bin/env python3
"""Stills and video for the Broke Apocalypse story reels (cel look from scripts/cel.py).
  python3 scripts/render-story.py still p1 12.0 out.png [--raw] [--crop]   one frame; --crop = 1080x1350 feed crop
  python3 scripts/render-story.py sheet p1 out.png [cols]                 one frame per shot, as a contact sheet
  python3 scripts/render-story.py video p1 [--workers 2] [--chunk 6]      silent mp4 -> social/story/out/p1-silent.mp4
"""
import asyncio, sys, io, json, subprocess, shutil, time
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
import cel

ROOT = Path(__file__).resolve().parent.parent
SD = ROOT / 'social' / 'story'
W, H = 1080, 1920

def look(png_bytes, seed=1):
    im = np.asarray(Image.open(io.BytesIO(png_bytes)).convert('RGB'))
    return cel.cel(im, seed=seed, bloom=0.25, vignette=0.28, split=2, thresh=0.42)

async def open_page(p, part):
    b = await p.chromium.launch()
    pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
    await pg.goto('file://' + str(SD / f'{part}.html'))
    await pg.evaluate('document.fonts.ready')
    await pg.wait_for_timeout(500)
    return b, pg

async def still(part, t, out, raw=False, crop=False):
    async with async_playwright() as p:
        b, pg = await open_page(p, part)
        await pg.evaluate(f'seek({t})')
        png = await pg.screenshot(type='png')
        await b.close()
    im = Image.open(io.BytesIO(png)).convert('RGB') if raw else Image.fromarray(look(png))
    if crop: im = im.crop((0, 285, W, 1635))
    im.save(out)
    print('wrote', out)

async def sheet(part, out, cols=4):
    tl = json.loads((SD / f'{part}.timeline.json').read_text())
    tiles = []
    async with async_playwright() as p:
        b, pg = await open_page(p, part)
        for s in tl['scenes']:
            t = s['a'] + min(0.75 * (s['b'] - s['a']), 6.0)
            await pg.evaluate(f'seek({t})')
            png = await pg.screenshot(type='png')
            tiles.append((s, t, Image.fromarray(look(png)).resize((360, 640), Image.LANCZOS)))
        await b.close()
    rows = (len(tiles) + cols - 1) // cols
    sh = Image.new('RGB', (cols * 370 + 10, rows * 674 + 10), (20, 14, 30))
    d = ImageDraw.Draw(sh)
    for i, (s, t, im) in enumerate(tiles):
        x, y = 10 + (i % cols) * 370, 10 + (i // cols) * 674
        sh.paste(im, (x, y))
        d.text((x + 6, y + 648), f"{s['n']} {s['shot']} t={t:.1f}", fill=(255, 230, 160))
    sh.save(out)
    print('wrote', out, f'({len(tiles)} shots)')

async def chunk_worker(part, jobs, fps, seg_dir, q):
    async with async_playwright() as p:
        b, pg = await open_page(p, part)
        while True:
            try: ci, f0, f1 = q.pop(0)
            except IndexError: break
            seg = seg_dir / f'seg_{ci:03d}.mp4'
            if seg.exists(): continue
            tmp = seg_dir / f'seg_{ci:03d}.part.mp4'
            ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                                   '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', str(tmp)], stdin=subprocess.PIPE)
            for f in range(f0, f1):
                await pg.evaluate(f'seek({f / fps})')
                png = await pg.screenshot(type='png')
                ff.stdin.write(look(png, seed=f + 1).tobytes())
                jobs['done'] += 1
            ff.stdin.close(); ff.wait()
            tmp.rename(seg)
        await b.close()

async def video(part, workers=2, chunk=6.0):
    tl = json.loads((SD / f'{part}.timeline.json').read_text())
    fps = tl['fps']; n = int(round(tl['dur'] * fps))
    seg_dir = SD / 'out' / f'{part}-seg'; seg_dir.mkdir(parents=True, exist_ok=True)
    per = int(chunk * fps)
    q = [(i, a, min(a + per, n)) for i, a in enumerate(range(0, n, per))]
    jobs = {'done': 0}
    t0 = time.time()
    async def prog():
        while jobs['done'] < n:
            await asyncio.sleep(30)
            d = jobs['done']; el = time.time() - t0
            print(f'  {d}/{n} frames, {el:.0f}s, eta {el / max(d, 1) * (n - d):.0f}s', flush=True)
    pt = asyncio.create_task(prog())
    await asyncio.gather(*[chunk_worker(part, jobs, fps, seg_dir, q) for _ in range(workers)])
    pt.cancel()
    lst = seg_dir / 'list.txt'
    lst.write_text(''.join(f"file '{s.name}'\n" for s in sorted(seg_dir.glob('seg_*.mp4')) if '.part' not in s.name))
    out = SD / 'out' / f'{part}-silent.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', str(out)], check=True)
    print('wrote', out, f'{n} frames in {time.time() - t0:.0f}s')

async def frames(part, ts, out):
    tiles = []
    async with async_playwright() as p:
        b, pg = await open_page(p, part)
        for t in ts:
            await pg.evaluate(f'seek({t})')
            tiles.append(Image.fromarray(look(await pg.screenshot(type='png'))).resize((360, 640), Image.LANCZOS))
        await b.close()
    sh = Image.new('RGB', (len(tiles) * 370 + 10, 660), (20, 14, 30))
    for i, im in enumerate(tiles): sh.paste(im, (10 + i * 370, 10))
    sh.save(out); print('wrote', out)

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[0] == 'still': asyncio.run(still(a[1], float(a[2]), a[3], '--raw' in a, '--crop' in a))
    elif a[0] == 'sheet': asyncio.run(sheet(a[1], a[2], int(a[3]) if len(a) > 3 else 4))
    elif a[0] == 'frames': asyncio.run(frames(a[1], [float(x) for x in a[2].split(',')], a[3]))
    elif a[0] == 'video':
        wk = int(a[a.index('--workers') + 1]) if '--workers' in a else 2
        ch = float(a[a.index('--chunk') + 1]) if '--chunk' in a else 6.0
        asyncio.run(video(a[1], wk, ch))
