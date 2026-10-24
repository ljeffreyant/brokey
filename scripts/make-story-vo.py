#!/usr/bin/env python3
"""Narrator lines for a story part: Kokoro v0.19 via sherpa-onnx (offline), one wav per line + durations.json.
  python3 scripts/make-story-vo.py p1 [--sid 5] [--speed 1.0]
Needs: pip install sherpa-onnx==1.12.26 (2.0.0 wants a lexicon) and the model in /tmp/tts/kokoro-en-v0_19.
"""
import sys, json, wave
from pathlib import Path
import numpy as np
import sherpa_onnx

ROOT = Path(__file__).resolve().parent.parent
part = sys.argv[1]
sid = int(sys.argv[sys.argv.index('--sid') + 1]) if '--sid' in sys.argv else 5
speed = float(sys.argv[sys.argv.index('--speed') + 1]) if '--speed' in sys.argv else 1.0
M = Path('/tmp/tts/kokoro-en-v0_19')
vd = ROOT / 'social' / 'story' / 'vo' / part
script = json.loads((vd / 'script.json').read_text())
cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(), kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
    model=str(M / 'model.onnx'), voices=str(M / 'voices.bin'), tokens=str(M / 'tokens.txt'), data_dir=str(M / 'espeak-ng-data')), num_threads=2), max_num_sentences=1)
tts = sherpa_onnx.OfflineTts(cfg)
durs = json.loads((vd / 'durations.json').read_text()) if (vd / 'durations.json').exists() else {}
for i, line in enumerate(script):
    f = vd / f"{line['key']}.wav"
    if f.exists() and line['key'] in durs and '--force' not in sys.argv:
        continue
    a = tts.generate(line['text'], sid=sid, speed=speed)
    x = np.array(a.samples, dtype=np.float32)
    # trim silence at both ends (keep a hair)
    thr = 0.012
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx): x = x[max(0, idx[0] - int(0.03 * a.sample_rate)): idx[-1] + int(0.06 * a.sample_rate)]
    with wave.open(str(f), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(a.sample_rate)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    durs[line['key']] = round(len(x) / a.sample_rate, 3)
    (vd / 'durations.json').write_text(json.dumps(durs, indent=1))
    print(f"{i + 1}/{len(script)} {line['key']} {durs[line['key']]:.2f}s  {line['text']}", flush=True)
print('total narration', round(sum(durs.values()), 1), 's')
