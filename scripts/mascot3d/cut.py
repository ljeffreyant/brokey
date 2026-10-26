"""Cut the 3D Brokey sticker sheets into transparent PNGs.
Background = yellow gradient connected to the sheet border; each sticker has a white outline so the flood fill stops there.
usage: python3 scripts/mascot3d/cut.py"""
import numpy as np, colorsys, sys, os
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

SRC = 'social/mascot3d/src'
OUT = 'social/mascot3d'
os.makedirs(OUT, exist_ok=True)

def bgmask(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(-1); mn = a.min(-1)
    sat = (mx - mn) / (mx + 1e-6)
    # yellow-ish: r high, g a bit lower, b low
    return (r > 0.80) & (g > 0.62) & (g < 0.88) & (b < 0.45) & (sat > 0.45)

def cut(name):
    im = Image.open(f'{SRC}/{name}.jpg').convert('RGB')
    W, H = im.size
    bg = bgmask(im)
    lab, n = ndi.label(bg)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    isbg = np.isin(lab, list(border))
    fg = ~isbg
    fg = ndi.binary_opening(fg, iterations=2)
    fg = ndi.binary_fill_holes(fg)
    l2, n2 = ndi.label(fg)
    objs = ndi.find_objects(l2)
    comps = []
    for i, sl in enumerate(objs):
        area = int((l2[sl] == i + 1).sum())
        if area < 1500: continue
        comps.append((i + 1, sl, area))
    return im, l2, comps

if __name__ == '__main__':
    for name in ['sheet-a', 'sheet-b']:
        im, l2, comps = cut(name)
        print(name, im.size, len(comps))
        for i, sl, area in comps:
            y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
            print(f'  comp {i}: bbox x{x0}-{x1} y{y0}-{y1} area {area}')


def defringe(rgb, mask, width=4):
    """The sticker outline is white, but JPEG bleed from the yellow sheet tints its rim. Push rim pixels back toward white."""
    from scipy import ndimage as ndi
    d = ndi.distance_transform_edt(mask)
    rim = (d > 0) & (d <= width)
    a = rgb.astype(np.float32)
    light = (a[..., 0] > 205) & (a[..., 1] > 185)
    k = np.clip(1 - (d - 0.5) / width, 0, 1)[..., None] * 0.9
    out = np.where((rim & light)[..., None], a * (1 - k) + 255 * k, a)
    return out.clip(0, 255).astype(np.uint8)
