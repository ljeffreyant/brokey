"""Cel post-process: comic halftone in the shadows, soft bloom, grain, vignette (numpy + OpenCV)."""
import numpy as np
import cv2

_cache = {}

def _lattice(h, w, s):
    k = (h, w, s)
    if k not in _cache:
        y, x = np.mgrid[0:h, 0:w].astype(np.float32)
        c = s_ = np.float32(np.cos(np.deg2rad(45)))
        u = (x + y) * c / s
        v = (y - x) * c / s
        fu, fv = u - np.floor(u) - 0.5, v - np.floor(v) - 0.5
        _cache[k] = np.sqrt(fu * fu + fv * fv)
        _cache[(h, w, 'grain')] = None
    return _cache[k]

def cel(rgb, s=9.0, tint=(34, 20, 70), strength=0.55, grain=0.045, bloom=0.0, vignette=0.0, seed=1, split=0.0, thresh=0.5):
    """rgb: HxWx3 uint8 array. returns uint8 array."""
    a = rgb.astype(np.float32) / 255.0
    h, w, _ = a.shape
    lum = a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    small = cv2.resize(lum, (w // 3, h // 3), interpolation=cv2.INTER_AREA)
    small = cv2.GaussianBlur(small, (0, 0), s * 0.55 / 3)
    sm = cv2.resize(small, (w, h), interpolation=cv2.INTER_LINEAR)
    d = _lattice(h, w, s)
    r = np.clip((thresh - sm) / max(thresh - 0.06, 0.1), 0, 1) * 0.74
    aa = np.clip((r - d) * s * 0.9 + 0.5, 0, 1)[..., None]
    t = np.array(tint, dtype=np.float32) / 255.0
    dark = a * (1 - strength) + t * strength * 0.55
    out = a * (1 - aa) + dark * aa
    if bloom > 0:
        hi = np.clip(lum - 0.70, 0, 1)[..., None] * a
        hs = cv2.resize(hi, (w // 4, h // 4), interpolation=cv2.INTER_AREA)
        bl = cv2.resize(cv2.GaussianBlur(hs, (0, 0), 9), (w, h), interpolation=cv2.INTER_LINEAR)
        out = 1 - (1 - out) * (1 - np.clip(bl * 3, 0, 1) * bloom)
    if split > 0:  # tiny chromatic aberration
        m = int(round(split))
        out[:, m:, 0] = out[:, :-m, 0].copy()
        out[:, :-m, 2] = out[:, m:, 2].copy()
    if vignette > 0:
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        rr = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
        out = out * (1 - vignette * np.clip(rr - 0.5, 0, 1)[..., None])
    if grain > 0:
        rng = np.random.default_rng(seed)
        g = rng.normal(0, grain, (h // 2, w // 2)).astype(np.float32)
        g = cv2.resize(g, (w, h), interpolation=cv2.INTER_NEAREST)
        out = out + g[..., None]
    return (np.clip(out, 0, 1) * 255).astype(np.uint8)
