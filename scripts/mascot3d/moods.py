"""Cut the 5x7 mood sheet into one transparent sticker per cell. usage: python3 scripts/mascot3d/moods.py"""
import numpy as np, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
from cut import cut, OUT, defringe

NAMES = [
 'wave','joy','wink-thumb','content','kiss',
 'shades-coin','shrug-sad','calc-worry','piggy-hug','kiss-heart',
 'piggy-calm','neutral','nervous','coins-happy','broke',
 'puzzled','party','shrug-meh','thumbs-up','smug',
 'worried','shock','cry','angry-red','sleepy',
 'sad','gasp','shout','cheeky','hips-smirk',
 'juggle','panic-run','peekaboo','hungry-fork','wave-happy',
]
COLS, ROWS = 5, 7
im, l2, comps = cut('moods')
H, W = l2.shape
cells = {}
for i, sl, a in comps:
    m = l2 == i
    ys, xs = np.where(m)
    c = (min(int(xs.mean() // (W / COLS)), COLS - 1), min(int(ys.mean() // (H / ROWS)), ROWS - 1))
    cells.setdefault(c, []).append(i)
os.makedirs(f'{OUT}/moods', exist_ok=True)
print('cells', len(cells))
for (cx, cy), ids in sorted(cells.items(), key=lambda kv: (kv[0][1], kv[0][0])):
    m = np.isin(l2, ids)
    ys, xs = np.where(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    m = ndi.binary_erosion(m[y0:y1, x0:x1], iterations=1)
    rgb = np.asarray(im)[y0:y1, x0:x1]
    rgb = defringe(rgb, m)
    a_ = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))
    out = Image.fromarray(np.dstack([rgb, np.asarray(a_)]), 'RGBA')
    name = NAMES[cy * COLS + cx]
    out.save(f'{OUT}/moods/{name}.png')
    print(f'{cy*COLS+cx+1:2d} {name:12s} {out.size} comps={len(ids)}')
