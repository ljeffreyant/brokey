#!/usr/bin/env python3
"""Sound for a story part: narrator (Kokoro wavs) + synthesized score, ambience and sfx, mixed to a wav, then muxed with the silent video.
  python3 scripts/make-story-audio.py p1            -> social/story/out/p1-audio.wav
  python3 scripts/make-story-audio.py p1 --mux      -> social/story/out/brokey-p1.mp4 (needs out/p1-silent.mp4)
Everything is generated from the timeline (cues, beats, moods); no samples, no network.
"""
import sys, json, wave, subprocess
from pathlib import Path
import numpy as np
from scipy import signal
from scipy.ndimage import uniform_filter1d

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
SD = ROOT / 'social' / 'story'
part = sys.argv[1]
tl = json.loads((SD / f'{part}.timeline.json').read_text())
DUR = tl['dur']
N = int((DUR + 1.5) * SR)
rng = np.random.default_rng(11)

# ---------- helpers ----------
def tt(n): return np.arange(n) / SR
def env(n, tau): return np.exp(-tt(n) / tau)
def ar(n, a, rel):  # attack-release envelope over n samples
    x = tt(n); e = np.minimum(1, x / max(a, 1e-4)) * np.clip((n / SR - x) / max(rel, 1e-4), 0, 1)
    return e
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return signal.sosfilt(signal.butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def noise(n): return rng.standard_normal(n).astype(np.float64)
def sine(f, n, ph=0.0): return np.sin(2 * np.pi * f * tt(n) + ph)
def sweep(f0, f1, n, k=5.0):
    x = tt(n); d = n / SR
    f = f1 + (f0 - f1) * np.exp(-x / (d / k))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def thud(f0, f1, dur, tau, amp=1.0):
    n = int(dur * SR); return amp * sweep(f0, f1, n) * env(n, tau)
def shelf_low(x, f, gain_db):  # RBJ low shelf
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f / SR; cw, sw = np.cos(w), np.sin(w); al = sw / 2 * np.sqrt(2)
    b0 = A * ((A + 1) - (A - 1) * cw + 2 * np.sqrt(A) * al); b1 = 2 * A * ((A - 1) - (A + 1) * cw); b2 = A * ((A + 1) - (A - 1) * cw - 2 * np.sqrt(A) * al)
    a0 = (A + 1) + (A - 1) * cw + 2 * np.sqrt(A) * al; a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - 2 * np.sqrt(A) * al
    return signal.lfilter([b0 / a0, b1 / a0, b2 / a0], [1, a1 / a0, a2 / a0], x)
def peak_eq(x, f, gain_db, q=1.0):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x)

def put(buf, x, t0, g=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), buf.shape[1] - i)
    if n <= 0: return
    buf[0, i:i + n] += x[:n] * g * np.sqrt((1 - pan) / 2) * 1.414
    buf[1, i:i + n] += x[:n] * g * np.sqrt((1 + pan) / 2) * 1.414

def make_ir(sec=1.7, tau=0.5):
    n = int(sec * SR); x = noise(n) * np.exp(-tt(n) / tau)
    x = lp(x, 6500) ; x[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    ir = np.concatenate([np.zeros(int(0.018 * SR)), x]); return ir / np.sqrt(np.sum(ir ** 2))
IR_L, IR_R = make_ir(), make_ir()
def reverb(buf):
    return np.stack([signal.fftconvolve(buf[0], IR_L)[: buf.shape[1]], signal.fftconvolve(buf[1], IR_R)[: buf.shape[1]]])

# ---------- sfx (all return mono arrays) ----------
def s_knock(v=1.0):
    n = int(0.5 * SR); x = thud(190, 92, 0.5, 0.07, 1.0)
    x += 0.45 * bp(noise(n), 700, 1800) * env(n, 0.03) + 0.12 * sine(2300, n) * env(n, 0.05) + 0.06 * sine(3100, n) * env(n, 0.04)
    return 0.9 * x
def s_fknock(v=1.0):
    n = int(1.4 * SR); x = thud(78, 36, 1.4, 0.24, 1.2)
    x += 0.55 * lp(noise(n), 420) * env(n, 0.22)
    rat = sum(sine(f, n) * env(n, 0.14) * (0.5 + 0.5 * np.sin(2 * np.pi * (36 + f / 400) * tt(n))) for f in (1380, 2150, 3270, 4100))
    x += 0.07 * rat
    return 0.95 * x
def s_breath():
    out = np.zeros(int(4.4 * SR))
    for s0 in (0.0, 2.2):
        n = int(1.7 * SR); x = bp(noise(n), 500, 3200) * ar(n, 0.55, 0.95)
        x *= 0.65 + 0.35 * np.sin(2 * np.pi * 33 * tt(n)); out[int(s0 * SR): int(s0 * SR) + n] += 0.34 * x
    return out
def s_riser(d=1.4):
    n = int(d * SR); x = noise(n); y = np.zeros(n); seg = 2048
    for i in range(0, n - seg, seg):
        fc = 250 * (7000 / 250) ** (i / n); y[i:i + seg] = bp(x[i:i + seg], fc * 0.8, min(fc * 1.25, 20000), 1)
    return 0.55 * y * (tt(n) / d) ** 2.2
def s_hit():
    n = int(3.2 * SR); x = thud(95, 40, 3.2, 0.5, 1.3) + 0.9 * sine(41, n) * env(n, 1.4)
    x += sum(0.16 * sine(f, n) * env(n, 2.2) for f in (110, 116.5, 155.6, 233)) * np.minimum(1, tt(n) / 0.05)
    x += 0.5 * lp(noise(n), 1500) * env(n, 0.5)
    return 0.9 * x
def s_chime():  # the Brokey sign-off: bright, safe
    out = np.zeros(int(3.0 * SR))
    for i, f in enumerate((523.25, 659.25, 783.99, 1046.5)):
        n = int(2.4 * SR); m = sine(f * 2.0, n) * 1.6 * env(n, 0.25)
        x = np.sin(2 * np.pi * f * tt(n) + m) * env(n, 0.9) * 0.3
        d = int(i * 0.09 * SR); out[d:d + n] += x[: len(out) - d]
    return out
def s_tap():
    n = int(0.12 * SR); return 0.5 * sine(1100, n) * env(n, 0.012) + 0.3 * hp(noise(n), 3000) * env(n, 0.006) + 0.25 * thud(260, 120, 0.12, 0.03)
def s_ping():
    out = np.zeros(int(1.6 * SR))
    for d, f in ((0.0, 1318.5), (0.14, 1760.0)):
        n = int(1.3 * SR); m = sine(f * 3.5, n) * 2.2 * env(n, 0.12)
        x = np.sin(2 * np.pi * f * tt(n) + m) * env(n, 0.42) * 0.36
        i = int(d * SR); out[i:i + n] += x[: len(out) - i]
    return out
def s_sting():
    n = int(1.6 * SR); vib = 1 + 0.006 * np.sin(2 * np.pi * 5.6 * tt(n)); x = np.zeros(n)
    for f in (587.0, 622.3, 880.0):
        ph = 2 * np.pi * np.cumsum(f * vib * (1 - 0.03 * tt(n))) / SR
        x += sum(np.sin(h * ph) / h for h in (1, 2, 3, 4)) * 0.2
    x = lp(x, 3400) * ar(n, 0.05, 1.5) * np.exp(-tt(n) / 0.7)
    return 0.7 * x + np.pad(0.5 * thud(70, 40, 1.0, 0.25), (0, n - int(SR)))
def s_cup():
    n = int(0.4 * SR); x = 0.7 * thud(210, 120, 0.4, 0.05) + 0.25 * bp(noise(n), 1000, 3200) * env(n, 0.02)
    m = int(0.1 * SR); pop = 0.35 * sweep(420, 1200, m, 3) * env(m, 0.04); x[int(0.05 * SR): int(0.05 * SR) + m] += pop
    return x
def s_fries():
    n = int(0.7 * SR); x = 0.55 * hp(noise(n), 1500) * env(n, 0.05) + 0.55 * thud(160, 55, 0.7, 0.11)
    m = int(0.5 * SR); x[:m] += 0.28 * sweep(430, 190, m, 2.5) * env(m, 0.2)
    return x
def s_row():
    n = int(0.4 * SR); x = 0.35 * lp(noise(n), 2600) * ar(n, 0.07, 0.3) + 0.3 * bp(noise(n), 3000, 6500) * env(n, 0.008)
    x[: int(0.12 * SR)] += 0.14 * sine(880, int(0.12 * SR)) * env(int(0.12 * SR), 0.05)
    return x
def s_moan():
    n = int(2.0 * SR); x = np.zeros(n)
    for f0, g in ((96, 1.0), (84, 0.8), (112, 0.6)):
        f = f0 * (1 - 0.32 * tt(n) / 2.0) * (1 + 0.025 * np.sin(2 * np.pi * 5.1 * tt(n) + f0))
        x += g * signal.sawtooth(2 * np.pi * np.cumsum(f) / SR)
    form = bp(x, 380, 760) + 0.7 * bp(x, 800, 1500) + 0.3 * bp(x, 2200, 3200)
    form += 0.25 * bp(noise(n), 600, 2400)
    return 0.34 * form * ar(n, 0.35, 0.85) / 2.0
def s_steps(d):
    n = int(d * SR); out = np.zeros(n)
    for lay, (rate, g) in enumerate(((1.35, 1.0), (1.7, 0.7), (1.05, 0.8))):
        t = rng.uniform(0, 0.5)
        while t < d - 0.2:
            k = int(0.35 * SR); st = 0.55 * thud(115, 62, 0.35, 0.055) + 0.22 * lp(noise(k), 900) * ar(k, 0.01, 0.18)
            gg = g * (0.25 + 0.75 * (t / d)); i = int(t * SR); out[i:i + k] += st[: n - i] * gg
            t += 1 / rate * rng.uniform(0.82, 1.22)
    return out
def s_fdoor():
    n = int(0.8 * SR); x = 0.5 * bp(noise(n), 300, 1800) * env(n, 0.13) * np.minimum(1, tt(n) / 0.015) + 0.4 * np.pad(thud(130, 85, 0.5, 0.12), (0, n - int(0.5 * SR)))
    return x
def s_buzz():
    n = int(0.7 * SR); gate = ((tt(n) * 8) % 1 < 0.62) * (tt(n) < 0.58)
    return 0.45 * (np.sign(sine(168, n)) * 0.4 + sine(168, n)) * gate + 0.15 * lp(noise(n), 700) * gate
def s_ad():
    n = int(0.5 * SR); m = int(0.1 * SR)
    x = np.zeros(n); x[:m] += 0.4 * sweep(380, 1000, m, 2) * env(m, 0.05)
    for d, f in ((0.05, 2637), (0.09, 3136)):
        k = int(0.3 * SR); i = int(d * SR); x[i:i + k] += 0.1 * sine(f, k) * env(k, 0.09)
    return x
def s_glitch():
    n = int(0.3 * SR); x = noise(n); hold = 24; x = np.repeat(x[::hold], hold)[:n]
    gate = (rng.random(n // 600 + 1) > 0.35).repeat(600)[:n]
    return 0.3 * np.round(x * 4) / 4 * gate * ar(n, 0.005, 0.1)
def s_whoosh(d=0.35, up=True):
    n = int(d * SR); x = noise(n); y = np.zeros(n); seg = 1024
    for i in range(0, n - seg, seg):
        p = i / n; p = p if up else 1 - p; fc = 300 * (4500 / 300) ** p; y[i:i + seg] = bp(x[i:i + seg], fc * 0.7, fc * 1.4, 1)
    return 0.3 * y * np.sin(np.pi * np.arange(n) / n)
def s_dip(d=0.4):
    n = int(d * SR); return 0.3 * sweep(240, 55, n, 2.5) * ar(n, 0.02, d * 0.9)


def s_creak(d=1.3):
    n = int(d * SR); f = 300 + 260 * (tt(n) / d) ** 1.4 + 18 * np.sin(2 * np.pi * 9 * tt(n))
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * tt(n)))
    return 0.32 * bp(x, 450, 1700) * ar(n, 0.12, 0.45)
def s_whisper():
    out = np.zeros(int(1.6 * SR))
    for j, d0 in enumerate((0.0, 0.2, 0.42, 0.68)):
        n = int((0.16 + 0.04 * (j % 2)) * SR); x = bp(noise(n), 2200 + 600 * j, 6500) * ar(n, 0.03, 0.1)
        i = int(d0 * SR); out[i:i + n] += 0.5 * x
    return out
def s_slap():
    n = int(0.3 * SR); return 0.6 * thud(150, 70, 0.3, 0.06) + 0.4 * bp(noise(n), 1500, 5500) * env(n, 0.03)
def s_scream():
    n = int(0.55 * SR); f = (900 + 1100 * (tt(n) / 0.55) ** 0.8) * (1 + 0.04 * np.sin(2 * np.pi * 13 * tt(n)))
    x = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR); return 0.26 * bp(x, 900, 3800) * ar(n, 0.03, 0.2)
def s_poof():
    n = int(0.9 * SR); x = noise(n); y = np.zeros(n); seg = 1024
    for i in range(0, n - seg, seg):
        fc = 6000 * (500 / 6000) ** (i / n); y[i:i + seg] = lp(x[i:i + seg], fc, 1)
    y = 0.5 * y * env(n, 0.22)
    y += 0.3 * sweep(900, 200, n, 4) * env(n, 0.18)
    for _ in range(14):
        d = rng.uniform(0.03, 0.8); k = int(0.12 * SR); i = int(d * SR); y[i:i + k] += 0.12 * sine(rng.uniform(2800, 6400), k) * env(k, 0.04)
    return y
def s_softchime():
    n = int(1.8 * SR); out = np.zeros(n)
    for d, f in ((0, 659.25), (0.1, 987.77)):
        m = sine(f * 2, n) * 1.2 * env(n, 0.2); x = np.sin(2 * np.pi * f * tt(n) + m) * env(n, 0.5) * 0.3; i = int(d * SR); out[i:] += x[: n - i]
    return out
def s_rumble(d=2.6):
    n = int(d * SR); x = lp(noise(n), 95, 3) * 6 + 0.9 * sine(38, n) * (0.7 + 0.3 * np.sin(2 * np.pi * 6 * tt(n))) + 0.4 * sine(57, n)
    return 0.55 * x * ar(n, 0.8, 1.2)
def s_smash():
    n = int(1.6 * SR); x = 0.6 * hp(noise(n), 2500) * env(n, 0.3) + 0.8 * thud(75, 34, 1.6, 0.3)
    for _ in range(70):
        d = rng.uniform(0.0, 1.1) ** 1.4; k = int(0.14 * SR); i = int(d * SR)
        if i + k < n: x[i:i + k] += 0.14 * sine(rng.uniform(3000, 9000), k) * env(k, rng.uniform(0.02, 0.07))
    return 0.9 * x
def s_cry(d=1.3):
    n = int(d * SR); f = 640 - 240 * (tt(n) / d) + 28 * np.sin(2 * np.pi * 6.5 * tt(n))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return 0.22 * x * ar(n, 0.15, 0.6)
def s_drip():
    n = int(0.12 * SR); f = rng.uniform(900, 1500); return 0.3 * sweep(f * 1.5, f * 0.8, n, 3) * env(n, 0.03)
def s_stamp():
    n = int(0.6 * SR); x = thud(170, 55, 0.6, 0.09, 1.1) + 0.55 * bp(noise(n), 700, 3200) * env(n, 0.035) + 0.25 * hp(noise(n), 4000) * env(n, 0.012)
    return 0.95 * x
def s_coin():
    n = int(0.5 * SR); x = np.zeros(n)
    for d, f in ((0, 2093), (0.07, 3136)):
        k = int(0.4 * SR); i = int(d * SR); x[i:i + k] += 0.2 * (sine(f, k) + 0.4 * sine(f * 2.76, k)) * env(k, 0.1)
    return x
def s_sparkle():
    out = np.zeros(int(0.9 * SR))
    for j, f in enumerate((1568, 1976, 2349, 3136)):
        k = int(0.5 * SR); i = int(j * 0.06 * SR); out[i:i + k] += 0.14 * (sine(f, k) + 0.3 * sine(f * 2, k)) * env(k, 0.16)
    return out
def s_wind(d=3.5):
    n = int(d * SR); return 0.3 * bp(noise(n), 200, 900) * ar(n, 1.2, 1.5) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * tt(n)))

# ---------- layers (whole length, shaped later) ----------
def layer_pad(freqs, gains, trem=0.18):
    x = np.zeros(N)
    for f, g in zip(freqs, gains):
        for dt in (-0.9, 0.0, 1.1): x += g * np.sin(2 * np.pi * (f + dt * f / 400) * tt(N) + rng.uniform(0, 6.28))
    x *= 0.75 + 0.25 * np.sin(2 * np.pi * trem * tt(N))
    return lp(x, 1400) / 3
def layer_drone():
    x = 0.8 * sine(55, N) + 0.5 * sine(110.3, N) + 0.22 * sine(77.8, N) + 0.18 * sine(164.8 * 1.003, N)
    x *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * tt(N))
    return x + 0.5 * lp(noise(N), 140, 3) * 4
def layer_heart(bpm):
    x = np.zeros(N); per = 60 / bpm; t = 0.2
    lub = thud(70, 48, 0.3, 0.07, 1.0); dub = thud(62, 42, 0.3, 0.08, 0.7)
    while t < DUR + 1:
        i = int(t * SR); k = min(len(lub), N - i)
        if k > 0: x[i:i + k] += lub[:k]
        j = i + int(0.27 * per * SR); k = min(len(dub), N - j)
        if k > 0: x[j:j + k] += dub[:k]
        t += per
    return x
def layer_notes(scale, octave_mul, density, tau, bright, seed):
    r = np.random.default_rng(seed); x = np.zeros(N); t = 0.6
    while t < DUR:
        f = r.choice(scale) * octave_mul; n = int(min(4.0, tau * 5) * SR)
        note = sum(g * np.sin(2 * np.pi * f * h * tt(n)) for h, g in ((1, 1.0), (2, 0.4 * bright), (3, 0.22 * bright), (4.2, 0.09 * bright))) * env(n, tau)
        note *= np.minimum(1, tt(n) / 0.004)
        i = int(t * SR); k = min(n, N - i)
        if k > 0: x[i:i + k] += note[:k] * 0.5
        t += r.uniform(1.3, 2.7) / density
    return x

# ---------- timeline -> control curves ----------
MOODS = {  # pad_calm, pad_minor, drone, heart_slow, heart_fast, notes_calm, notes_dark, room
    'silence': (0.0, 0.0, 0.05, 0.0, 0.0, 0.0, 0.0, 0.5),
    'calm': (0.55, 0.0, 0.08, 0.0, 0.0, 0.55, 0.0, 0.5),
    'uneasy': (0.15, 0.5, 0.35, 0.0, 0.0, 0.0, 0.55, 0.5),
    'dread': (0.0, 0.4, 0.85, 0.5, 0.0, 0.0, 0.5, 0.5),
    'panic': (0.0, 0.3, 1.0, 0.0, 1.0, 0.0, 0.2, 0.5),
    'hope': (0.5, 0.0, 0.1, 0.0, 0.0, 0.5, 0.0, 0.5),
}
CR = 50
def curve(idx):
    m = int((DUR + 1.5) * CR) + 1; c = np.zeros(m)
    for b in tl['beats']:
        c[int(b['a'] * CR): int(b['b'] * CR) + 1] = MOODS[b['bed']][idx]
    c[int(tl['beats'][-1]['b'] * CR):] = MOODS[tl['beats'][-1]['bed']][idx]
    c = uniform_filter1d(c, int(CR * 1.2))
    return np.interp(np.arange(N) / SR, np.arange(m) / CR, c)

print('layers...', flush=True)
music = np.zeros((2, N))
def addm(x, g, pan=0.0): put(music, x * g, 0, 1.0, pan)
addm(layer_pad([130.81, 196.0, 246.94, 329.63], [1, 0.8, 0.6, 0.5]) * curve(0), 0.55, -0.1)
addm(layer_pad([110.0, 164.81, 220.0, 261.63], [1, 0.8, 0.6, 0.5], 0.13) * curve(1), 0.6, 0.1)
addm(layer_drone() * curve(2), 0.5)
addm(layer_heart(66) * curve(3), 0.9)
addm(layer_heart(112) * curve(4), 0.8)
addm(layer_notes([261.63, 329.63, 392.0, 440.0, 523.25], 1.0, 1.0, 1.0, 1.0, 5) * curve(5), 0.34, -0.25)
addm(layer_notes([110.0, 130.81, 164.81, 196.0, 220.0], 1.0, 0.8, 1.6, 0.6, 9) * curve(6), 0.5, 0.25)
room = lp(noise(N), 500) * 0.012 * curve(7)
music[0] += room; music[1] += np.roll(room, 300)

print('sfx...', flush=True)
sfx = np.zeros((2, N)); sfx_dry = np.zeros((2, N))
scene_of = lambda t: next((s for s in tl['scenes'] if s['a'] <= t < s['b']), tl['scenes'][-1])
beat_end = lambda t: next((b['b'] for b in tl['beats'] if b['a'] <= t < b['b']), DUR)
for c in tl['sfx']:
    t, k = c['t'], c['k']; sc = scene_of(t)
    if k == 'knock': put(sfx, s_knock(), t, 0.9)
    elif k == 'fknock': put(sfx, s_fknock(), t, 1.0)
    elif k == 'breath': put(sfx, s_breath(), t, 0.7, -0.1)
    elif k == 'stinger':
        if sc['shot'] == 'tag': put(sfx, s_chime(), t, 0.9)
        else: put(sfx, s_riser(1.3), t - 1.25, 0.8); put(sfx, s_hit(), t, 0.95)
    elif k == 'tap': put(sfx_dry, s_tap(), t, 0.9, 0.2)
    elif k == 'ping': put(sfx, s_ping(), t, 0.8, 0.15)
    elif k == 'sting': put(sfx, s_sting(), t, 0.7)
    elif k == 'cup': put(sfx_dry, s_cup(), t, 0.9, rng.uniform(-0.4, 0.4))
    elif k == 'fries':
        prev = [f['n'] for f in tl['fries'] if f['t'] < t - 1e-6]
        up = prev and float(c.get('v', 0)) > prev[-1]
        put(sfx_dry, s_sparkle() if up else s_fries(), t, 0.8 if up else 0.9)
    elif k == 'fopen': put(sfx, s_creak(), t, 0.85); put(sfx, s_fdoor(), t + 0.05, 0.8)
    elif k == 'whisper': put(sfx, s_whisper(), t, 0.7, rng.uniform(-0.5, 0.5))
    elif k == 'step': put(sfx_dry, s_slap(), t, 0.95)
    elif k == 'no': put(sfx_dry, s_ad(), t, 0.5)
    elif k == 'yes': put(sfx_dry, s_ad(), t, 0.5, 0.2)
    elif k == 'poof': put(sfx, s_scream(), t - 0.4, 0.9); put(sfx, s_poof(), t, 0.95)
    elif k == 'calm': put(sfx, s_softchime(), t, 0.7)
    elif k == 'rumble': put(sfx, s_rumble(), t, 0.9)
    elif k == 'smash': put(sfx, s_smash(), t, 1.0)
    elif k == 'roast': put(sfx, s_ad(), t, 0.7); put(sfx, s_softchime(), t + 0.05, 0.4)
    elif k == 'cry':
        put(sfx, s_cry(), t, 0.8)
        d = 0.5
        while t + d < beat_end(t) + 0.5 and d < 5.5: put(sfx_dry, s_drip(), t + d, 0.6, rng.uniform(-0.4, 0.4)); d += rng.uniform(0.18, 0.5)
    elif k == 'card': put(sfx_dry, s_row(), t, 0.8)
    elif k == 'stamp': put(sfx, s_stamp(), t, 1.0)
    elif k == 'pay': put(sfx_dry, s_coin(), t, 0.8)
    elif k == 'hand': put(sfx, s_riser(1.0), t - 0.2, 0.55); put(sfx, thud(90, 45, 1.2, 0.25, 0.8), t + 0.6, 0.8)
    elif k == 'hush': put(sfx_dry, s_wind(beat_end(t) - t), t, 0.8)
    elif k == 'pop': put(sfx_dry, s_ad(), t, 0.8, rng.uniform(-0.4, 0.4))
    elif k == 'row': put(sfx_dry, s_row(), t, 0.9, 0.1)
    elif k == 'turn': put(sfx, s_moan(), t, 0.95)
    elif k == 'steps': put(sfx_dry, s_steps(beat_end(t) - t), t, 0.7)
    elif k == 'fdoor': put(sfx, s_fdoor(), t, 0.9)
    elif k == 'buzz': put(sfx_dry, s_buzz(), t, 0.8, 0.3)
    elif k == 'ad': put(sfx_dry, s_ad(), t, 0.9)
    elif k == 'hum':
        d = beat_end(t) - t + 0.3; n = int(d * SR); x = 0.13 * sine(60, n) + 0.09 * sine(120.5, n) + 0.05 * sine(181, n) + 0.03 * lp(noise(n), 260)
        x *= ar(n, 0.4, 0.4) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.7 * tt(n))); put(sfx_dry, x, t, 1.0)
    elif k == 'tv':
        d = beat_end(t) - t; n = int(d * SR); x = 0.012 * bp(noise(n), 4000, 9000) * ar(n, 0.3, 0.3); put(sfx_dry, x, t, 1.0)
# transitions
for f in tl['fx']:
    if f['k'] == 'glitch': put(sfx_dry, s_glitch(), f['t'], 0.9)
    elif f['k'] == 'dip': put(sfx_dry, s_dip(), f['t'] - f['d'], 0.7)
for s in tl['scenes'][1:]:
    if s['tr'] == 'cut' and s['shot'] not in ('title',): put(sfx_dry, s_whoosh(0.28, True), s['a'] - 0.2, 0.55)

print('narrator...', flush=True)
vo = np.zeros((2, N))
vdir = SD / 'vo' / part
for v in tl['vo']:
    with wave.open(str(vdir / f"{v['key']}.wav")) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768; sr = w.getframerate()
    x = signal.resample_poly(x, SR, sr)
    x = hp(x, 70); x = shelf_low(x, 200, 4.5); x = peak_eq(x, 2800, 2.5, 0.9); x = peak_eq(x, 7500, -2.5, 0.8)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    x = np.tanh(x * 1.7) / np.tanh(1.7)
    x *= np.minimum(1, np.minimum(tt(len(x)) / 0.008, (len(x) / SR - tt(len(x))) / 0.03))
    put(vo, x, v['t'], 1.0)

print('mix...', flush=True)
wet = lambda b, g: reverb(b) * g
vo_env = uniform_filter1d(np.abs(vo[0]), int(0.18 * SR))
duck = 1 - 0.5 * np.clip(vo_env / 0.06, 0, 1); duck = uniform_filter1d(duck, int(0.25 * SR))
mix = vo * 1.0 + wet(vo, 0.16) + music * duck * 0.85 + wet(music, 0.18) + sfx * (1 - 0.18 * np.clip(vo_env / 0.06, 0, 1)) + wet(sfx, 0.22) + sfx_dry
mix = mix[:, : int((DUR + 0.2) * SR)]
fo = int(0.7 * SR); mix[:, -fo:] *= np.linspace(1, 0, fo)
mix *= 0.9 / (np.max(np.abs(mix)) + 1e-9)
mix = np.tanh(mix * 1.15) / np.tanh(1.15) * 0.95
out = SD / 'out' / f'{part}-audio.wav'; out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype(np.int16).tobytes())
rms = np.sqrt(np.mean(mix ** 2)); print('wrote', out, f'peak {np.max(np.abs(mix)):.2f} rms {20 * np.log10(rms):.1f} dB')

if '--mux' in sys.argv:
    vid = SD / 'out' / f'{part}-silent.mp4'; fin = SD / 'out' / f'brokey-{part}.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(vid), '-i', str(out), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-maxrate', '8M', '-bufsize', '16M', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
                    '-af', 'loudnorm=I=-15:TP=-1.5:LRA=9', '-shortest', '-movflags', '+faststart', str(fin)], check=True)
    print('wrote', fin)
