"""Synthesises Brokey's little sound effects into assets/sfx/*.wav. Pure numpy, no samples, so there is nothing to license.
Run: python3 scripts/make-sfx.py"""
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 22050
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sfx')
rng = np.random.default_rng(42)


def t_(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, attack=0.004, decay=0.1):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype='band')
    return lfilter(b, a, x)


def lp(x, hz):
    b, a = butter(2, hz / (SR / 2))
    return lfilter(b, a, x)


def place(buf, x, at):
    i = int(at * SR)
    end = min(len(buf), i + len(x))
    buf[i:end] += x[: end - i]


def tone(freq, sec, harm=(1.0, 0.3, 0.1), attack=0.004, decay=0.12, vib=0.0, vibhz=6.0):
    t = t_(sec)
    f = freq * (1 + vib * np.sin(2 * np.pi * vibhz * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(h * np.sin(ph * (k + 1)) for k, h in enumerate(harm))
    out = y * env(len(t), attack, decay)
    r = min(len(out), int(0.014 * SR))  # release, so a note that is cut short never clicks
    out[-r:] *= np.linspace(1, 0, r)
    return out


def norm(x, peak=0.7):
    x = x - np.mean(x)
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def save(name, x):
    fade = int(0.006 * SR)
    x = x.copy()
    x[-fade:] *= np.linspace(1, 0, fade)
    wavfile.write(os.path.join(OUT, name + '.wav'), SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    print(f'{name}.wav  {len(x) / SR:.2f}s  {len(x) * 2 / 1024:.0f}KB')


def crunch(dur, bright=1.0):
    n = int(SR * dur)
    noise = rng.standard_normal(n)
    crackle = noise * (rng.random(n) > 0.82)
    body = bp(noise, 900, 3800 * bright)
    snap = bp(crackle, 1800, 9000)
    thump = np.sin(2 * np.pi * np.cumsum(np.linspace(150, 55, n)) / SR)
    e = env(n, 0.002, dur / 3.2)
    return (0.8 * body + 1.1 * snap) * e + 0.7 * thump * env(n, 0.002, 0.03)


# ---- chomp: two quick crunchy bites
chomp = np.zeros(int(SR * 0.42))
place(chomp, crunch(0.17), 0.0)
place(chomp, crunch(0.17, 0.85) * 0.8, 0.15)
save('chomp', norm(chomp, 0.75))

# ---- coin: two-note bling
coin = np.zeros(int(SR * 0.55))
place(coin, tone(1318.5, 0.5, (1, 0.25, 0.08), decay=0.1), 0.0)
place(coin, tone(1760.0, 0.45, (1, 0.3, 0.1), decay=0.12), 0.075)
save('coin', norm(coin, 0.6))

# ---- nope: sad wah-wah-wah-waaah
nope = np.zeros(int(SR * 0.95))
for i, (f, d, at) in enumerate([(233.1, 0.16, 0.0), (220.0, 0.16, 0.18), (207.7, 0.16, 0.36)]):
    place(nope, lp(tone(f, d, (1, 0.6, 0.35, 0.2), attack=0.012, decay=0.25), 1800), at)
last = tone(196.0, 0.5, (1, 0.6, 0.35, 0.2), attack=0.02, decay=0.22, vib=0.012, vibhz=5.5)
place(nope, lp(last, 1400), 0.54)
save('nope', norm(nope, 0.6))

# ---- fanfare: tiny arpeggio and a held top note with a sparkle
fan = np.zeros(int(SR * 1.2))
for f, at in [(523.25, 0.0), (659.25, 0.09), (783.99, 0.18)]:
    place(fan, tone(f, 0.25, (1, 0.4, 0.15, 0.08), decay=0.09), at)
place(fan, tone(1046.5, 0.8, (1, 0.35, 0.12, 0.06), attack=0.006, decay=0.18), 0.28)
place(fan, tone(1318.5, 0.6, (1, 0.2, 0.05), attack=0.006, decay=0.25) * 0.5, 0.32)
sp = np.zeros(int(SR * 0.5))
for k in range(7):
    place(sp, tone(2093 * (1 + 0.12 * k), 0.12, (1, 0.1), decay=0.04) * (0.5 - k * 0.05), 0.05 * k)
place(fan, sp * 0.5, 0.45)
save('fanfare', norm(fan, 0.6))

# ---- fridge: door thunk, rubber seal, magnet click
fr = np.zeros(int(SR * 0.5))
thud_n = int(SR * 0.22)
thud = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 48, thud_n)) / SR) * env(thud_n, 0.002, 0.07)
place(fr, thud, 0.0)
place(fr, lp(rng.standard_normal(int(SR * 0.1)), 500) * env(int(SR * 0.1), 0.001, 0.025) * 1.4, 0.0)
place(fr, bp(rng.standard_normal(int(SR * 0.16)), 1500, 4200) * env(int(SR * 0.16), 0.02, 0.06) * 0.35, 0.09)
place(fr, tone(2800, 0.03, (1,), attack=0.0005, decay=0.006) * 0.35, 0.2)
save('fridge', norm(fr, 0.7))

# ---- pop: a bubble
pn = int(SR * 0.16)
pop = np.sin(2 * np.pi * np.cumsum(np.linspace(380, 980, pn)) / SR) * env(pn, 0.002, 0.045)
save('pop', norm(pop, 0.6))
