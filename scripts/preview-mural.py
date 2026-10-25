#!/usr/bin/env python3
"""Profile-grid preview and posting-order contact sheet for the mural.
  python3 scripts/preview-mural.py   -> social/teasers/grid-preview.png (3x2 as the profile shows it) + sheet.png (posting order 1..6)
"""
from pathlib import Path
from PIL import Image
TD = Path(__file__).resolve().parent.parent / 'social' / 'teasers'
GRID = [['t6-app', 't5-fries', 't4-fridge'], ['t3-tram', 't2-board', 't1-shop']]
ORDER = ['t1-shop', 't2-board', 't3-tram', 't4-fridge', 't5-fries', 't6-app']
def im(n): return Image.open(TD / f'{n}.png').convert('RGB')
gw, gh = 360, 480
g = Image.new('RGB', (3 * gw + 8, 2 * gh + 4), (255, 255, 255))
for r, row in enumerate(GRID):
    for c, n in enumerate(row): g.paste(im(n).resize((gw, gh), Image.LANCZOS), (c * (gw + 4), r * (gh + 4)))
g.save(TD / 'grid-preview.png')
tw, th = 360, 480
s = Image.new('RGB', (3 * (tw + 10) + 10, 2 * (th + 10) + 10), (20, 14, 30))
for i, n in enumerate(ORDER): s.paste(im(n).resize((tw, th), Image.LANCZOS), (10 + (i % 3) * (tw + 10), 10 + (i // 3) * (th + 10)))
s.save(TD / 'sheet.png'); print('wrote grid-preview.png, sheet.png')
