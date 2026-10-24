#!/usr/bin/env python3
"""Brokey launch video, step 2. Renders video/index.html frame by frame, mixes the app's own sounds, encodes mp4.
  python3 scripts/render-launch-video.py            full render -> video/brokey-launch.mp4
  python3 scripts/render-launch-video.py --encode-only  re-mix audio and re-encode from existing frames
  python3 scripts/render-launch-video.py --sheet    contact sheet of key frames only -> video/sheet.png
"""
import asyncio, json, os, subprocess, sys
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
VID = ROOT / 'video'
FPS = 30
W, H = 1080, 1920

async def open_page(p):
    b = await p.chromium.launch()
    pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
    await pg.goto('file://' + str(VID / 'index.html'))
    await pg.evaluate('document.fonts.ready')
    await pg.wait_for_timeout(400)
    return b, pg

async def worker(p, frames, outdir):
    b, pg = await open_page(p)
    for i in frames:
        await pg.evaluate(f'seek({i / FPS})')
        await pg.screenshot(path=str(outdir / f'f{i:04d}.png'), type='png')
    await b.close()

async def main():
    sheet = '--sheet' in sys.argv
    async with async_playwright() as p:
        b, pg = await open_page(p)
        dur = await pg.evaluate('window.DURATION')
        cues = await pg.evaluate('window.CUES')
        await b.close()
        total = int(dur * FPS)
        outdir = VID / ('sheetframes' if sheet else 'frames')
        outdir.mkdir(exist_ok=True)
        if '--encode-only' not in sys.argv:
            for f in outdir.glob('f*.png'): f.unlink()
        if sheet:
            times = [1.4, 2.8, 4.3, 5.8, 7.3, 8.8, 9.9, 12.6, 13.5, 17.2, 18.1, 20.0, 22.8, 23.5, 24.5, 6.5]
            frames = sorted({min(total - 1, int(t * FPS)) for t in times})
        else:
            frames = list(range(total))
        n = 2
        if '--encode-only' not in sys.argv:
            await asyncio.gather(*[worker(p, frames[k::n], outdir) for k in range(n)])
    if sheet:
        from PIL import Image
        files = sorted(outdir.glob('f*.png'))
        cols = 8
        tw, th = 270, 480
        rows = (len(files) + cols - 1) // cols
        im = Image.new('RGB', (cols * tw, rows * th), 'white')
        for i, f in enumerate(files):
            t = Image.open(f).convert('RGB').resize((tw, th))
            im.paste(t, ((i % cols) * tw, (i // cols) * th))
        im.save(VID / 'sheet.png')
        print('sheet', len(files), 'frames')
        return
    # audio: place each cue at its time
    sfx = ROOT / 'assets' / 'sfx'
    whoosh = VID / 'whoosh.wav'
    if not whoosh.exists():  # synthesized scene-change swoosh (the app has no whoosh of its own)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anoisesrc=d=0.45:c=pink:a=0.6:r=44100',
                        '-af', 'highpass=f=350,lowpass=f=4500,afade=t=in:d=0.22,afade=t=out:st=0.22:d=0.23', str(whoosh)], check=True)
    src = lambda n: str(whoosh) if n == 'whoosh' else str(sfx / f'{n}.wav')
    inputs, filters, labels = [], [], []
    for k, (t, name, vol) in enumerate(cues):
        inputs += ['-i', src(name)]
        ms = int(t * 1000)
        filters.append(f'[{k + 1}:a]volume={vol},adelay={ms}|{ms}[a{k}]')
        labels.append(f'[a{k}]')
    fc = ';'.join(filters) + ';' + ''.join(labels) + f'amix=inputs={len(labels)}:normalize=0,alimiter=limit=0.95,apad=whole_dur={dur}[aout]'
    out = VID / 'brokey-launch.mp4'
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', str(outdir / 'f%04d.png'), *inputs,
           '-filter_complex', fc, '-map', '0:v', '-map', '[aout]', '-t', str(dur),
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', str(FPS),
           '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart', str(out)]
    subprocess.run(cmd, check=True)
    print('wrote', out, round(out.stat().st_size / 1e6, 1), 'MB')

asyncio.run(main())
