/* Story engine: window.seek(t) puts the page at time t. The timeline is injected by make-story.ts. */
const TL = __TL__;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, d) => clamp((t - a) / d);
const E = {
  lin: t => t,
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  io: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { const s = 1.7; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
  pop: t => { const s = 2.4; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
};
const $ = id => document.getElementById(id);
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
window.DURATION = TL.dur;
const els = TL.scenes.map(s => $('sc-' + s.n));
const FPS = TL.fps;

function applyCam(scene, cam) {
  scene.querySelectorAll('.L').forEach(L => {
    const z = parseFloat(L.dataset.z || '1');
    const s = 1 + (cam.s - 1) * (0.5 + 0.7 * z);
    L.style.transform = `translate(${(-cam.x * z).toFixed(2)}px,${(-cam.y * z).toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${cam.r.toFixed(3)}deg)`;
  });
}
function hand(t, k = 1) {
  return { x: k * (5 * Math.sin(t * 1.7) + 3 * Math.sin(t * 3.3 + 1)), y: k * (6 * Math.sin(t * 1.3 + 2) + 2.5 * Math.sin(t * 2.9)), r: k * 0.35 * Math.sin(t * 1.1 + 0.5) };
}
const ease = (name, p) => (E[name] || E.io)(p);

/* ---- per-shot context ---- */
function ctxFor(sc, el, t) {
  const r = t - sc.a, d = sc.b - sc.a;
  const times = k => sc.cues.filter(c => c.k === k).map(c => c.t);
  return {
    t, r, d, el, sc,
    q: id => el.querySelector('[data-id="' + id + '"]'),
    times,
    first: k => { const a = times(k); return a.length ? a[0] : null; },
    count: k => times(k).filter(x => x <= t).length,
    /* decaying bounce after the latest cue of kind k, 0..1 */
    env: (k, win = 0.35) => {
      let v = 0;
      times(k).forEach(x => { const q = t - x; if (q >= 0 && q < win) v = Math.max(v, Math.sin(q / win * Math.PI) * (1 - q / win) * 1.6); });
      return Math.min(1, v);
    },
    since: k => { const a = times(k).filter(x => x <= t); return a.length ? t - a[a.length - 1] : -1; },
  };
}
const setT = (e, tr, op) => { if (!e) return; if (tr !== null) e.style.transform = tr; if (op !== undefined) e.style.opacity = op; };

/* ---- shots: animate elements, return an additive camera offset ---- */
const SHOTS = {
  door(c) {
    const kb = c.env('knock', 0.35);
    const zm = c.q('zm');
    setT(zm, `translate(${-kb * 12}px,${kb * 10}px) scale(${1 + kb * 0.035}) rotate(${Math.sin(c.t * 2) * 0.8}deg)`);
    setT(c.q('bk'), `translate(${Math.sin(c.t * 17) * 1.6}px,${Math.sin(c.t * 23) * 1.2}px) rotate(${Math.sin(c.t * 9) * 0.7 - kb * 1.4}deg)`);
    const fl = c.q('flick'); if (fl) fl.style.opacity = hash(Math.floor(c.t * 12)) > 0.86 ? 0.22 : 0;
    return { x: -kb * 7, y: kb * 5 };
  },
  doorclose(c) {
    const kb = c.env('knock', 0.4);
    const b0 = c.first('breath');
    const br = c.q('breath');
    if (br) br.style.opacity = b0 === null ? 0 : clamp(Math.sin((c.t - b0) * 2.4) * 0.9, 0, 0.8) * prog(c.t, b0, 0.4);
    setT(c.q('zc'), `translate(${Math.sin(c.t * 2.2) * 5 - kb * 10}px,${Math.sin(c.t * 1.7) * 6 + kb * 8}px) scale(${1 + kb * 0.03}) rotate(${Math.sin(c.t * 1.3) * 0.7}deg)`);
    return { x: -kb * 9, y: kb * 7 };
  },
  title(c) {
    const p = E.pop(prog(c.r, 0.12, 0.55));
    const shake = Math.max(0, 1 - c.r / 0.5) * 14;
    setT(c.q('tt'), `translate(${(hash(Math.floor(c.t * 30)) - 0.5) * shake}px,${(hash(Math.floor(c.t * 31) + 4) - 0.5) * shake}px) scale(${0.7 + 0.3 * p})`, clamp(p * 1.4));
    setT(c.q('ts'), null, E.out(prog(c.r, 0.9, 0.5)));
    const g = c.q('tglow'); if (g) g.style.opacity = 0.55 + 0.25 * Math.sin(c.t * 3);
    return { x: 0, y: 0 };
  },
  couch(c) {
    const f = c.q('faceglow'); if (f) f.style.opacity = 0.78 + 0.2 * Math.sin(c.t * 6.3) * Math.sin(c.t * 2.1) + (hash(Math.floor(c.t * 18)) > 0.9 ? -0.18 : 0);
    const bk = c.q('bk'); setT(bk, `translate(0,${Math.sin(c.t * 1.9) * 3}px) scale(${1 + Math.sin(c.t * 1.9) * 0.006},${1 - Math.sin(c.t * 1.9) * 0.008})`);
    const a0 = c.first('ad'), ad = c.q('adtag');
    if (ad) { const p = a0 === null ? 0 : E.pop(prog(c.t, a0, 0.4)); setT(ad, `scale(${0.4 + 0.6 * p}) rotate(${-4 + (1 - p) * 10}deg)`, a0 === null ? 0 : clamp(p * 2)); }
    return {};
  },
  phone(c) {
    const tap = c.first('tap') ?? 99, ping = c.first('ping') ?? 99;
    const ph = c.q('ph');
    const lift = c.sc.cues.length ? 0 : 0;
    setT(ph, `rotate(${-4 + Math.sin(c.t * 1.2) * 0.5}deg) translateY(${Math.sin(c.t * 1.5) * 4}px)`);
    // the hand: slides in, presses, leaves
    const mit = c.q('mitt');
    const inP = E.out(prog(c.t, tap - 1.0, 0.8)), pressP = prog(c.t, tap - 0.06, 0.06), outP = E.in(prog(c.t, tap + 0.5, 0.6));
    if (mit) { const y = 330 * (1 - inP) + 110 * outP, x = 160 * (1 - inP) + 80 * outP; setT(mit, `translate(${x}px,${y - pressP * 22 * (1 - outP)}px) rotate(${-12 + inP * 6}deg)`, c.t < tap - 1.0 ? 0 : 1); }
    const btn = c.q('btn'), ok = c.q('okmsg');
    const pr = prog(c.t, tap, 0.08);
    if (btn) setT(btn, `translateY(${pr * 10 * (c.t < tap + 0.3 ? 1 : 0)}px) scale(${1 - pr * 0.03})`, c.t >= tap + 0.08 ? 0 : 1);
    if (ok) setT(ok, null, c.t >= tap + 0.08 ? 1 : 0);
    const nt = c.q('notif');
    if (nt) { const p = E.back(prog(c.t, ping, 0.5)); setT(nt, `translateY(${(-170 + p * 250) * (c.t >= ping ? 1 : 0)}px)`, c.t >= ping ? 1 : 0); }
    const gl = c.q('redtint'); const s0 = c.first('sting');
    if (gl) gl.style.opacity = s0 === null ? 0 : clamp(1 - (c.t - s0) / 1.2, 0, 1) * 0.45 * (c.t >= s0 ? 1 : 0);
    return {};
  },
  cups(c) {
    const ts = c.times('cup');
    for (let i = 0; i < 5; i++) {
      const e = c.q('cup' + i); if (!e) continue;
      const t0 = ts[i] ?? 999, p = E.pop(prog(c.t, t0, 0.38)), sq = c.t >= t0 ? 1 : 0;
      setT(e, `translateY(${(1 - p) * -160}px) scale(${1 + (1 - p) * 0.06},${1 - (1 - p) * 0.12})`, sq ? clamp((c.t - t0) * 12) : 0);
    }
    c.el.querySelectorAll('.tl').forEach((e, i) => { e.style.opacity = i < c.count('cup') ? 1 : 0; });
    const bk = c.q('bk'); setT(bk, `translate(${Math.sin(c.t * 1.1) * 3}px,${Math.sin(c.t * 1.9) * 2}px) rotate(${Math.sin(c.t * 0.8) * 0.8}deg)`);
    return {};
  },
  list(c) {
    const rows = c.times('row'), turn = c.first('turn');
    for (let i = 0; i < 5; i++) {
      const e = c.q('row' + i); if (!e) continue;
      const t0 = i === 0 ? c.sc.a + 0.9 : (rows[i - 1] ?? 999);
      const p = E.back(prog(c.t, t0, 0.35));
      setT(e, `translateX(${(1 - p) * 640}px)`, c.t >= t0 ? 1 : 0);
      const z = c.q('zface' + i);
      if (z) z.style.opacity = turn !== null && c.t >= turn + i * 0.12 ? 1 : 0;
    }
    const g = c.q('greentint'); if (g) g.style.opacity = turn === null ? 0 : clamp(prog(c.t, turn, 0.6) * 0.5);
    const bk = c.q('bk'); setT(bk, `translate(${Math.sin(c.t * 15) * 1.6}px,${Math.sin(c.t * 21) * 1.2}px)`);
    return {};
  },
  street(c) {
    const st = c.first('steps') ?? 0.5;
    c.el.querySelectorAll('.zw').forEach((e, i) => {
      const sp = parseFloat(e.dataset.sp || '1'), x0 = parseFloat(e.dataset.x || '0'), y0 = parseFloat(e.dataset.y || '0'), s0 = parseFloat(e.dataset.s || '1');
      const still = c.q('walkers') && c.q('walkers').dataset.still === '1';
      const k = (still ? 0.78 : clamp((c.t - st) / 7)) * sp;
      const bob = still ? Math.sin(c.t * 1.1 + i) * 0.4 : Math.sin(c.t * 3.2 * sp + i * 1.7);
      const sc = s0 * (1 + k * 1.25);
      setT(e, `translate(${x0 + (parseFloat(e.dataset.dx || '0')) * k * 100}px,${y0 + k * 300 + Math.abs(bob) * -12}px) scale(${sc}) rotate(${bob * 3.4}deg)`);
    });
    const bk = c.q('bk'); setT(bk, `translate(${Math.sin(c.t * 14) * 1.4}px,${Math.sin(c.t * 19) * 1}px)`);
    const lamp = c.q('lamp'); if (lamp) lamp.style.opacity = 0.8 + 0.2 * (hash(Math.floor(c.t * 9)) > 0.8 ? 0.2 : 1);
    return {};
  },
  fridge(c) {
    const l0 = c.first('lcd'), lcd = c.q('lcd');
    if (lcd) {
      let secs = 86399 - (l0 === null ? 0 : Math.max(0, c.t - l0));
      if (c.sc.cues.some(q => q.k === 'fridgeend')) secs = 3;
      const pad = n => String(Math.floor(n)).padStart(2, '0');
      lcd.textContent = `${pad(secs / 3600)}:${pad((secs % 3600) / 60)}:${pad(secs % 60)}`;
    }
    const d0 = c.first('fdoor'), hz = c.q('doorwrap');
    if (hz) { const p = d0 === null ? 1 : E.io(prog(c.t, d0, 0.9)); hz.style.opacity = 1 - 0.0; }
    const items = c.q('items'); if (items) setT(items, null, d0 === null ? 0 : clamp((c.t - d0 - 0.2) * 3));
    const bk = c.q('bk'); setT(bk, `translate(0,${Math.sin(c.t * 1.6) * 3}px)`);
    const fg = c.q('fog'); if (fg) fg.style.opacity = 0.5 + 0.1 * Math.sin(c.t * 1.3);
    const fk = c.q('flick'); if (fk) fk.style.opacity = hash(Math.floor(c.t * 10)) > 0.9 ? 0.14 : 0;
    return {};
  },
  fridgedoor(c) {
    const kb = c.env('fknock', 0.42);
    const n = c.count('fknock');
    const dr = c.q('fdr');
    const sx = (hash(Math.floor(c.t * 30)) - 0.5) * 2;
    setT(dr, `translate(${kb * sx * 10}px,${-kb * 6}px) scale(${1 + kb * 0.02 + n * 0.004},${1 + kb * 0.01})`);
    const gl = c.q('glowline'); if (gl) gl.style.opacity = clamp(0.25 + n * 0.22 + kb * 0.5);
    const lcd = c.q('lcd'); if (lcd) { const secs = Math.max(0, 3 - Math.floor((c.t - c.sc.a) / 1.2)); lcd.textContent = `00:00:0${secs}`; }
    const dents = c.q('dents'); if (dents) dents.style.opacity = clamp(n / 3);
    const lt = c.q('kitchen'); if (lt) lt.style.opacity = 0.78 + (hash(Math.floor(c.t * 11)) > 0.9 ? -0.3 : 0);
    const bk = c.q('bk'); setT(bk, `translate(${Math.sin(c.t * 20) * 1.8 - kb * 6}px,${Math.sin(c.t * 25) * 1.2}px) scale(${1 + kb * 0.015})`);
    return { x: -kb * 8 * sx, y: kb * 6 };
  },
  table(c) {
    const b = c.q('moth'); if (b) setT(b, `translate(${Math.sin(c.t * 1.7) * 60}px,${Math.sin(c.t * 2.3) * 36}px) rotate(${Math.sin(c.t * 9) * 12}deg) scaleX(${0.7 + 0.3 * Math.abs(Math.sin(c.t * 22))})`);
    const bz = c.first('buzz'), w = c.q('wal');
    if (w) { const q = bz === null ? 99 : c.t - bz; setT(w, `translate(${q >= 0 && q < 0.5 ? Math.sin(q * 70) * 6 : 0}px,0)`); }
    const lamp = c.q('lampL'); if (lamp) lamp.style.opacity = 0.9 + (hash(Math.floor(c.t * 8)) > 0.88 ? -0.4 : 0);
    const bk = c.q('bk'); setT(bk, `translate(0,${Math.sin(c.t * 1.2) * 3}px)`);
    return {};
  },

  fridgeopen(c) {
    const g = c.q('fglow'); if (g) g.style.opacity = 0.75 + 0.25 * Math.sin(c.t * 3.1) * (hash(Math.floor(c.t * 14)) > 0.93 ? 0.4 : 1);
    const blink = hash(Math.floor(c.t * 5) + 7) > 0.9 ? 0.12 : 1;
    ['snk', 'hph'].forEach((id, i) => { const e = c.q(id); setT(e, `rotate(${Math.sin(c.t * 1.7 + i * 2) * 2.2}deg) translateY(${Math.sin(c.t * 2.3 + i) * 5}px)`); });
    ['snkeyes', 'hpheyes'].forEach(id => { const e = c.q(id); if (e) e.style.transform = `scaleY(${blink})`; });
    const w = c.times('whisper');
    ['w1', 'w2'].forEach((id, i) => { const e = c.q(id); if (!e) return; const t0 = w[i] ?? 999, p = E.pop(prog(c.t, t0, 0.35)), out = 1 - prog(c.t, t0 + 2.4, 0.4);
      setT(e, `scale(${0.5 + 0.5 * p}) translateY(${Math.sin(c.t * 3 + i) * 5}px)`, c.t >= t0 ? clamp(p * 2) * out : 0); });
    const bk = c.q('bk'); setT(bk, `translate(${Math.sin(c.t * 18) * 1.3}px,${Math.sin(c.t * 22) * 1}px)`);
    return {};
  },
  lifecycle(c) {
    const st = c.times('step');
    for (let i = 0; i < 4; i++) {
      const e = c.q('p' + i); if (!e) continue;
      const t0 = st[i] ?? 999, p = E.back(prog(c.t, t0, 0.42)), hit = c.t >= t0 ? Math.max(0, 1 - (c.t - t0) / 0.3) : 0;
      setT(e, `translateX(${(1 - p) * 1000}px) rotate(${(1 - p) * 6}deg) scale(${1 + hit * 0.03})`, c.t >= t0 ? 1 : 0);
    }
    c.el.querySelectorAll('.ar').forEach((a, i) => { const t0 = (st[i + 1] ?? 999) + 0.05; a.style.opacity = c.t >= t0 ? 1 : 0; });
    const z = c.el.querySelector('[data-id="p3"] .zz'); if (z) z.style.transform = `rotate(${Math.sin(c.t * 3) * 2}deg)`;
    return { y: c.env('step', 0.3) * 4 };
  },
  choice(c) {
    const no = c.first('no'), yes = c.first('yes'), poof = c.first('poof'), calm = c.first('calm');
    const bub = (id, t0) => { const e = c.q(id); if (!e) return; const p = E.pop(prog(c.t, t0 ?? 999, 0.3)); setT(e, `scale(${0.4 + 0.6 * p})`, t0 !== null && c.t >= t0 ? clamp(p * 2) * (1 - prog(c.t, t0 + 1.8, 0.3)) : 0); };
    bub('sayno', no); bub('sayyes', yes);
    const snk = c.q('snk');
    if (snk) {
      if (poof === null || c.t < poof) { setT(snk, `translate(${Math.sin(c.t * 40) * 3}px,${Math.sin(c.t * 33) * 2}px) rotate(${Math.sin(c.t * 9) * 3}deg)`, 1); }
      else { const q = prog(c.t, poof, 0.35); setT(snk, `scale(${1 + q * 0.7}) rotate(${q * 14}deg)`, 1 - E.out(q)); }
    }
    c.el.querySelectorAll('.cf').forEach((e, i) => {
      if (poof === null || c.t < poof) { e.style.opacity = 0; return; }
      const q = c.t - poof, a = parseFloat(e.dataset.a), s = parseFloat(e.dataset.s), d = E.out(clamp(q / 0.9)) * 420 * s;
      e.style.opacity = q < 1.6 ? 1 - prog(q, 1.0, 0.6) : 0;
      e.style.transform = `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + q * q * 120}px) rotate(${q * (i % 2 ? 420 : -380)}deg)`;
    });
    const hp = c.q('hph');
    if (hp) setT(hp, `translateY(${Math.sin(c.t * 1.4) * 6}px) rotate(${Math.sin(c.t * 1.1) * (calm !== null && c.t >= calm ? 1 : 2.5)}deg)`);
    const e1 = c.el.querySelector('#' + (c.q('hpe1') || {}).id), e2 = c.q('hpe2');
    const sw = calm !== null && c.t >= calm; if (c.q('hpe1')) c.q('hpe1').style.opacity = sw ? 0 : 1; if (e2) e2.style.opacity = sw ? 1 : 0;
    const bk = c.q('bk'); setT(bk, `translate(0,${Math.sin(c.t * 1.8) * 3}px)`);
    return {};
  },
  notif(c) {
    const ping = c.first('ping'), sting = c.first('sting');
    const n = c.q('ncard'); if (n) { const p = E.pop(prog(c.t, ping ?? 999, 0.4)); setT(n, `scale(${0.5 + 0.5 * p}) translateY(${(1 - p) * -60}px) rotate(${Math.sin(c.t * 30) * (1 - p) * 3}deg)`, ping !== null && c.t >= ping ? clamp(p * 2) : 0); }
    const secs = Math.max(0, 86400 - Math.floor((c.t - (ping ?? c.t)) * 600));
    const pad = x => String(Math.floor(x)).padStart(2, '0'); const cn = c.q('ncount'); if (cn) cn.textContent = `${pad(secs / 3600)}:${pad((secs % 3600) / 60)}:${pad(secs % 60)}`;
    const f = c.q('nflash'); if (f) f.style.opacity = sting === null ? 0 : Math.max(0, 1 - Math.max(0, c.t - sting) / 1.0) * (c.t >= sting ? 0.8 : 0);
    const bk = c.q('bk'); setT(bk, `translate(${Math.sin(c.t * 15) * 1.6}px,${Math.sin(c.t * 19) * 1.2}px)`);
    return {};
  },
  boss(c) {
    const b = c.q('bossbody'); const sm = c.first('smash'), cry = c.first('cry');
    const bt = `translateY(${Math.sin(c.t * 0.9) * 9}px) scale(${1 + Math.sin(c.t * 0.9) * 0.01 + (sm !== null && c.t >= sm ? 0.03 : 0)})`;
    setT(b, bt); const bc = c.q('bossbodyc'); const cron = cry !== null && c.t >= cry;
    if (bc) { setT(bc, bt, cron ? 1 : 0); b.style.opacity = cron ? 0 : 1; }
    const cr = c.q('cracks'); if (cr) cr.style.opacity = sm !== null && c.t >= sm ? 1 : 0;
    const bf = c.q('bflash'); if (bf) bf.style.opacity = sm !== null && c.t >= sm ? Math.max(0, 1 - (c.t - sm) / 0.45) : 0;
    const T = c.q('tears');
    if (T) {
      if (!T.children.length) { for (let i = 0; i < 28; i++) { const d = document.createElement('div'); d.style.cssText = 'position:absolute;width:26px;height:44px;border-radius:50% 50% 50% 50%/62% 62% 38% 38%;background:#7FD4FF;border:4px solid #24120A;opacity:0'; T.appendChild(d); }
        const fl = document.createElement('div'); fl.style.cssText = 'position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(180deg,rgba(110,200,255,.75),rgba(60,140,230,.9));border-top:8px solid #24120A'; fl.className = 'flood'; T.appendChild(fl); }
      const on = cry !== null && c.t >= cry;
      Array.from(T.children).forEach((d, i) => { if (d.className === 'flood') { d.style.height = on ? Math.min(420, (c.t - cry) * 90) + 'px' : '0px'; return; }
        if (!on) { d.style.opacity = 0; return; }
        const left = i % 2 === 0, ex = left ? 344 : 743, ph = (((c.t - cry) * 1.25 + hash(i) * 3) % 1);
        d.style.opacity = ph < 0.9 ? 1 : 0; d.style.left = ex + (hash(i + 3) - 0.5) * 70 + 'px'; d.style.top = 640 + ph * ph * 820 + 'px'; });
    }
    return sm !== null && c.t >= sm ? { x: (hash(Math.floor(c.t * 30)) - 0.5) * 26 * Math.max(0, 1 - (c.t - sm) / 0.8), y: (hash(Math.floor(c.t * 29) + 3) - 0.5) * 26 * Math.max(0, 1 - (c.t - sm) / 0.8) } : {};
  },
  stamps(c) {
    const cards = c.times('card'), st = c.times('stamp'), sfl = c.q('sflash'); let fl = 0;
    for (let i = 0; i < 4; i++) {
      const e = c.q('sc' + i); if (!e) continue;
      const t0 = cards[i] ?? 999, p = E.pop(prog(c.t, t0, 0.38)), s0 = st[i] ?? 999, hit = c.t >= s0 ? Math.max(0, 1 - (c.t - s0) / 0.25) : 0;
      setT(e, `scale(${(0.5 + 0.5 * p) * (1 + hit * 0.05)}) translate(${hit * (hash(Math.floor(c.t * 40) + i) - 0.5) * 16}px,${hit * 8}px)`, c.t >= t0 ? clamp(p * 2) : 0);
      const stmp = c.q('st' + i); const q = E.in(prog(c.t, s0, 0.13));
      if (stmp) setT(stmp, `rotate(-14deg) scale(${2.4 - 1.4 * q})`, c.t >= s0 ? 1 : 0);
      const sad = c.t >= s0; const z1 = c.q('sz' + i), z2 = c.q('sy' + i); if (z1) z1.style.opacity = sad ? 0 : 1; if (z2) z2.style.opacity = sad ? 1 : 0;
      if (c.t >= s0 && c.t < s0 + 0.12) fl = Math.max(fl, 0.5);
    }
    if (sfl) sfl.style.opacity = fl;
    return { y: Math.max(0, 1 - Math.min(...st.map(x => Math.abs(c.t - x)).concat([9])) / 0.2) * 5 };
  },
  dawn(c) {
    const f0 = c.first('fries'), sp = c.q('sparks'); if (sp) sp.style.opacity = f0 === null ? 0 : Math.max(0, 1 - Math.abs(c.t - f0 - 0.4) / 0.9);
    const bk = c.q('bk'); setT(bk, `translate(0,${Math.sin(c.t * 1.6) * 4}px) scale(${1 + Math.sin(c.t * 1.6) * 0.006})`);
    const ss = c.q('stampsky'); if (ss) setT(ss, `translateX(${Math.sin(c.t * 0.4) * 24}px)`);
    return {};
  },
  appshow(c) {
    ['ph1', 'ph0', 'ph2'].forEach((id, i) => { const e = c.q(id); if (!e) return; const rot = { ph0: -9, ph1: 0, ph2: 9 }[id]; const p = E.back(prog(c.r, 0.15 + i * 0.28, 0.5));
      setT(e, `translateY(${(1 - p) * 700 + Math.sin(c.t * 1.5 + i) * 6}px) rotate(${rot}deg)`, clamp((c.r - 0.15 - i * 0.28) * 6)); });
    return {};
  },
  bnpl(c) {
    const pay = c.times('pay'), bz = c.first('buzz'), hd = c.first('hand');
    c.el.querySelectorAll('.pp').forEach((e, i) => { const on = c.t >= (pay[i] ?? 999); e.style.opacity = on ? 1 : 0.4; e.style.background = on ? '#FFD23F' : '#FFFDF6'; e.style.transform = on ? `scale(${1 + Math.max(0, 1 - (c.t - pay[i]) / 0.25) * 0.25})` : 'none'; });
    const ph = c.q('bph'); const q = bz === null ? 99 : c.t - bz; setT(ph, `rotate(${-3 + (q >= 0 && q < 0.7 ? Math.sin(q * 90) * 1.6 : 0)}deg) translateY(${Math.sin(c.t * 1.4) * 5}px)`);
    const h = c.q('bhand'); if (h) { const p = hd === null ? 0 : E.out(prog(c.t, hd, 1.1)); setT(h, `translateY(${(1 - p) * 260}px) rotate(${Math.sin(c.t * 5) * 3}deg)`, hd === null ? 0 : clamp(p * 3)); }
    const g = c.q('bglow'); if (g) g.style.opacity = 0.55 + 0.25 * Math.sin(c.t * 4);
    return { x: q >= 0 && q < 0.7 ? Math.sin(q * 80) * 4 : 0 };
  },
  rescue(c) {
    const ro = c.first('roast'), cr = c.first('cry');
    const rb = c.q('rb'); if (rb) { const p = E.pop(prog(c.t, ro ?? 999, 0.35)); setT(rb, `scale(${0.4 + 0.6 * p})`, ro !== null && c.t >= ro ? clamp(p * 2) : 0); }
    const sad = cr !== null && c.t >= cr;
    [['rz1', 'rz1c'], ['rz2', 'rz2c']].forEach(([a, b], i) => { const A = c.q(a), B = c.q(b); if (!A || !B) return;
      const tr = `rotate(${Math.sin(c.t * 2 + i) * 1.4}deg) translateY(${sad ? 24 + Math.sin(c.t * 9 + i) * 3 : Math.sin(c.t * 3 + i) * 5}px)`;
      A.style.opacity = sad ? 0 : 1; B.style.opacity = sad ? 1 : 0; A.style.transform = tr; B.style.transform = tr; });
    const bk = c.q('bk'); setT(bk, `translate(0,${Math.sin(c.t * 2.2) * 4}px) rotate(${Math.sin(c.t * 1.2) * 0.8}deg)`);
    return {};
  },
  tag(c) {
    const p = E.pop(prog(c.r, 0.2, 0.6));
    setT(c.q('tmas'), `scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * -10}deg)`, clamp(p * 2));
    setT(c.q('twm'), null, E.out(prog(c.r, 0.7, 0.4)));
    setT(c.q('tcta'), `scale(${0.8 + 0.2 * E.pop(prog(c.r, 1.3, 0.5))})`, clamp((c.r - 1.3) * 4));
    setT(c.q('tlk'), null, E.out(prog(c.r, 1.7, 0.4)));
    setT(c.q('tnx'), null, E.out(prog(c.r, 2.3, 0.5)));
    return {};
  },
};

/* ---- HUD ---- */
function hud(t) {
  const cur = TL.scenes.find(s => t >= s.a && t < s.b) || TL.scenes[TL.scenes.length - 1];
  const bare = cur.shot === 'title' || cur.shot === 'tag';
  const lab = TL.labels.find(l => t >= l.a && t < l.b);
  const L = $('label');
  L.style.display = lab && !bare ? 'block' : 'none';
  if (lab) { L.textContent = lab.txt; L.style.opacity = clamp((t - lab.a) / 0.35); }
  // fries
  let n = TL.fries.length ? TL.fries[0].n : 9, hitT = -9, prevN = n;
  TL.fries.forEach(f => { if (f.t <= t) { if (f.n < n) hitT = f.t; prevN = n; n = f.n; } });
  const F = $('fries');
  F.style.display = bare ? 'none' : 'flex';
  const hitP = hitT > -5 ? clamp((t - hitT) / 0.6) : 1;
  let html = '';
  for (let i = 0; i < 9; i++) {
    const on = i < n, lost = i >= n && i < prevN && hitP < 1;
    html += `<i class="${on ? 'on' : ''}${lost ? ' lost' : ''}" style="height:${40 + (i % 3) * 4}px;${lost ? `opacity:${1 - hitP};transform:translateY(${hitP * 30}px) rotate(${hitP * 26}deg)` : ''}"></i>`;
  }
  if (F.dataset.h !== html) { F.innerHTML = html; F.dataset.h = html; }
  F.style.transform = hitP < 1 ? `translate(${Math.sin(hitP * 60) * 8 * (1 - hitP)}px,0)` : 'none';
  // caption
  const cp = TL.caps.find(x => t >= x.a && t < x.b);
  const C = $('cap').firstElementChild;
  $('cap').style.display = cp ? 'flex' : 'none';
  $('capshade').style.opacity = bare ? 0 : 1;
  if (cp) { if (C.dataset.h !== cp.html) { C.innerHTML = cp.html; C.dataset.h = cp.html; } const q = clamp((t - cp.a) / 0.12); C.style.opacity = q; C.style.transform = `scale(${1.05 - 0.05 * q})`; }
}

/* ---- transitions ---- */
function fxLayer(t) {
  const fl = $('flash'), gl = $('glitch');
  let blk = 0, wht = 0, gli = 0;
  TL.fx.forEach(f => {
    if (f.k === 'dip') { if (t >= f.t - f.d && t < f.t) blk = Math.max(blk, (t - (f.t - f.d)) / f.d); else if (t >= f.t && t < f.t + f.d) blk = Math.max(blk, 1 - (t - f.t) / f.d); }
    if (f.k === 'flash' && t >= f.t && t < f.t + f.d) wht = Math.max(wht, 1 - (t - f.t) / f.d);
    if (f.k === 'glitch' && t >= f.t && t < f.t + 0.3) gli = 1;
  });
  // fade out at the very end
  if (t > TL.dur - 0.5) blk = Math.max(blk, (t - (TL.dur - 0.5)) / 0.5);
  if (t < 0.15) blk = Math.max(blk, 1 - t / 0.15);
  fl.style.background = wht > 0 ? '#fff' : '#000';
  fl.style.opacity = Math.max(blk, wht);
  const stage = $('stage');
  if (gli) {
    const fi = Math.floor(t * FPS);
    const bars = [];
    for (let i = 0; i < 5; i++) { const y = hash(fi * 7 + i) * 1800, h = 20 + hash(fi * 3 + i + 9) * 120, dx = (hash(fi * 11 + i) - 0.5) * 180; bars.push(`<div style="position:absolute;left:0;right:0;top:${y}px;height:${h}px;background:${i % 2 ? 'rgba(255,40,90,.55)' : 'rgba(40,230,255,.5)'};transform:translateX(${dx}px);mix-blend-mode:screen"></div>`); }
    gl.innerHTML = bars.join(''); gl.style.display = 'block';
    stage.style.transform = `translate(${(hash(fi) - 0.5) * 24}px,0)`;
  } else { gl.style.display = 'none'; stage.style.transform = 'none'; }
}

window.seek = function (t) {
  TL.scenes.forEach((s, i) => {
    const on = t >= s.a && t < s.b;
    els[i].style.display = on ? 'block' : 'none';
    if (!on) return;
    const r = t - s.a, d = s.b - s.a;
    const c = ctxFor(s, els[i], t);
    const h = hand(t, s.cam.hand ?? 1);
    const p = ease(s.cam.ease || 'io', prog(r, 0, d));
    const f = s.cam.from, to = s.cam.to;
    const add = (SHOTS[s.shot] && SHOTS[s.shot](c)) || {};
    // mascot: swap to the lower-fries version once the fries cue passes
    const fc = c.first('fries'), b1 = c.q('bk'), b2 = c.q('bk2');
    if (b2) { const sw = fc !== null && t >= fc; b1.style.opacity = sw ? 0 : 1; b2.style.opacity = sw ? 1 : 0; b2.style.transform = b1.style.transform; }
    applyCam(els[i], { x: f[0] + (to[0] - f[0]) * p + h.x + (add.x || 0), y: f[1] + (to[1] - f[1]) * p + h.y + (add.y || 0), s: f[2] + (to[2] - f[2]) * p + (add.s || 0), r: f[3] + (to[3] - f[3]) * p + h.r + (add.r || 0) });
  });
  hud(t);
  fxLayer(t);
};
window.seek(0);
