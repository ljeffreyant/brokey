"""Export each sticker (main component + its confetti) as a transparent PNG. usage: python3 scripts/mascot3d/export.py"""
import numpy as np, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
from cut import cut, OUT, defringe

NAMES = {
  ('sheet-a', 1): 'smug-run', ('sheet-a', 4): 'wink-sit', ('sheet-a', 23): 'cheer-jump', ('sheet-a', 25): 'phew',
  ('sheet-b', 3): 'cheer-jump-b', ('sheet-b', 4): 'worried-calc', ('sheet-b', 26): 'run-b', ('sheet-b', 25): 'tile',
}
os.makedirs(f'{OUT}/stickers', exist_ok=True)
for sheet in ['sheet-a', 'sheet-b']:
    im, l2, comps = cut(sheet)
    big = {i: (sl, a) for i, sl, a in comps if a > 300000}
    for i, (sl, a) in big.items():
        name = NAMES.get((sheet, i))
        if not name: continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        pad = 0 if name == 'tile' else 150
        # include small comps (confetti, coins) that sit near this sticker
        ids = [i]
        for j, sj, aj in comps:
            if j == i or aj > 300000: continue
            jy0, jy1, jx0, jx1 = sj[0].start, sj[0].stop, sj[1].start, sj[1].stop
            if jx0 > x0 - pad and jx1 < x1 + pad and jy0 > y0 - pad and jy1 < y1 + pad: ids.append(j)
        m = np.isin(l2, ids)
        ys, xs = np.where(m)
        cy0, cy1, cx0, cx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        m = m[cy0:cy1, cx0:cx1]
        rgb = np.asarray(im)[cy0:cy1, cx0:cx1]
        if name != 'tile':
            m = ndi.binary_erosion(m, iterations=2)          # drop the yellow fringe
            rgb = defringe(rgb, m)
            a_ = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
            out = Image.fromarray(np.dstack([rgb, np.asarray(a_)]), 'RGBA')
        else:
            out = Image.fromarray(rgb)
        out.save(f'{OUT}/stickers/{name}.png')
        print(name, out.size)
