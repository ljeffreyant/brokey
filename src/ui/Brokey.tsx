import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FRY_COUNT, MASCOT_TILT, Mood, fryBase, fryPresent, mascot } from '../art/mascot';
import { viewBoxOf } from '../art/scene';
import { SceneView } from '../art/SceneView';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { Burst } from './Burst';
import { haptic } from './haptics';

export interface BrokeyProps {
  mood: Mood;
  width: number;
  friesLeft?: number;
  /** bump to make him hop */
  poke?: number;
  /** bump to make him get chomped (shake) */
  chomp?: number;
  /** bump to open wide and chew three times */
  munch?: number;
  /** no idle animation, for thumbnails */
  still?: boolean;
  onPress?: () => void;
  seed?: number;
}

const SEED = 7;

/**
 * Pivot offsets for rotating or scaling around a point (px from the top-left of a w x h layer).
 * Done with translate pairs instead of `transformOrigin`: Reanimated 4.5 on RN 0.86 throws
 * "Transform origin must have exactly 3 values" for animated views that carry it.
 * Usage: [...around(p).enter, { rotate }, ...around(p).leave]
 */
function around(origin: [number, number], w: number, h: number) {
  const dx = origin[0] - w / 2;
  const dy = origin[1] - h / 2;
  return {
    enter: [{ translateX: dx }, { translateY: dy }] as const,
    leave: [{ translateX: -dx }, { translateY: -dy }] as const,
  };
}

function useLoop(from: number, to: number, ms: number, delay = 0) {
  const v = useSharedValue(from);
  useEffect(() => {
    v.value = from;
    v.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(to, { duration: ms, easing: Easing.inOut(Easing.sin) }),
          withTiming(from, { duration: ms, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  }, []);
  return v;
}

function SwayFry({
  scene,
  group,
  width,
  height,
  origin,
  amp,
  ms,
  delay,
  still,
}: {
  scene: ReturnType<typeof mascot>;
  group: string;
  width: number;
  height: number;
  origin: [number, number];
  amp: number;
  ms: number;
  delay: number;
  still?: boolean;
}) {
  const a = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    a.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(amp, { duration: ms, easing: Easing.inOut(Easing.sin) }),
          withTiming(-amp, { duration: ms, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [still]);
  const pv = around(origin, width, height);
  const style = useAnimatedStyle(() => ({ transform: [...pv.enter, { rotate: `${a.value}deg` }, ...pv.leave] }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <SceneView scene={scene} width={width} groups={[group]} />
    </Animated.View>
  );
}

function Blinker({ scene, width, height, originY, still }: { scene: ReturnType<typeof mascot>; width: number; height: number; originY: number; still?: boolean }) {
  const sy = useSharedValue(1);
  useEffect(() => {
    if (still) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (!alive) return;
        sy.value = withSequence(withTiming(0.08, { duration: 70 }), withTiming(1, { duration: 120 }));
        // sometimes a double blink
        if (Math.random() < 0.25) sy.value = withSequence(withTiming(0.08, { duration: 70 }), withTiming(1, { duration: 100 }), withDelay(120, withSequence(withTiming(0.08, { duration: 70 }), withTiming(1, { duration: 120 }))));
        loop();
      }, 2200 + Math.random() * 3200);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [still]);
  const pv = around([width / 2, originY], width, height);
  const style = useAnimatedStyle(() => ({ transform: [...pv.enter, { scaleY: sy.value }, ...pv.leave] }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <SceneView scene={scene} width={width} groups={['eyes']} />
    </Animated.View>
  );
}


/** Where his mouth is, as a fraction of the drawing's width, for things that need to fly into it. */
export const MOUTH = { x: 136 / 268, y: 200 / 268 };

function Munch({ trigger, x, y, w }: { trigger: number; x: number; y: number; w: number }) {
  const o = useSharedValue(0);
  useEffect(() => {
    if (trigger <= 0) return;
    o.value = withSequence(
      withTiming(1, { duration: 170, easing: Easing.out(Easing.quad) }),
      withDelay(280, withTiming(0.3, { duration: 140 })),
      withTiming(1, { duration: 140 }),
      withTiming(0.3, { duration: 140 }),
      withTiming(1, { duration: 140 }),
      withTiming(0.3, { duration: 140 }),
      withTiming(0, { duration: 180 }),
    );
  }, [trigger]);
  const h = w * 0.78;
  const style = useAnimatedStyle(() => ({ opacity: o.value > 0.02 ? 1 : 0, transform: [{ scaleY: Math.max(o.value, 0.01) }, { scaleX: 0.72 + 0.28 * o.value }] }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h }, style]}>
      <Svg width={w} height={h} viewBox="0 0 100 78">
        <Ellipse cx={50} cy={39} rx={44} ry={34} fill="#24120A" />
        <Ellipse cx={50} cy={39} rx={38} ry={28} fill="#4A1710" />
        <Path d="M22 56 Q50 34 78 56 Q66 70 50 70 Q34 70 22 56Z" fill="#FF6B7A" />
        <Path d="M30 14 Q50 24 70 14" stroke="#FFF6E6" strokeWidth={5} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}

function GhostFry({ scene, group, width, height, origin, onDone }: { scene: ReturnType<typeof mascot>; group: string; width: number; height: number; origin: [number, number]; onDone: () => void }) {
  const t = useSharedValue(0);
  const dir = useMemo(() => (origin[0] < width / 2 ? -1 : 1), [origin, width]);
  useEffect(() => {
    t.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
    const id = setTimeout(onDone, 720);
    return () => clearTimeout(id);
  }, []);
  const pv = around(origin, width, height);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.7, 1], [1, 1, 0]),
    transform: [
      { translateX: dir * width * 0.28 * t.value },
      { translateY: -width * 0.32 * t.value + width * 0.5 * t.value * t.value },
      ...pv.enter,
      { rotate: `${dir * 260 * t.value}deg` },
      ...pv.leave,
    ],
  }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <SceneView scene={scene} width={width} groups={[group]} />
    </Animated.View>
  );
}

function BrokeyBase({ mood, width, friesLeft = FRY_COUNT, poke = 0, chomp = 0, munch = 0, still, onPress, seed = SEED }: BrokeyProps) {
  const scene = useMemo(() => mascot(mood, seed, friesLeft), [mood, seed, friesLeft]);
  const [vx, vy, vw, vh] = viewBoxOf(scene);
  const k = width / vw;
  const height = vh * k;

  // scene point -> pixel, including the little lean the drawing has
  const toPx = (x: number, y: number): [number, number] => {
    const a = (MASCOT_TILT[mood] * Math.PI) / 180;
    const dx = x - 120;
    const dy = y - 230;
    const rx = 120 + dx * Math.cos(a) - dy * Math.sin(a);
    const ry = 230 + dx * Math.sin(a) + dy * Math.cos(a);
    return [(rx - vx) * k, (ry - vy) * k];
  };

  // ---- idle: bob + breathe ----
  const bob = useLoop(0, -4, 1150);
  const breathe = useLoop(1, 1.02, 1150, 120);
  const lean = useLoop(-0.8, 0.8, 2300);

  // ---- poke (hop) and chomp (shake) ----
  const hop = useSharedValue(0);
  const shk = useSharedValue(0);
  const pop = useSharedValue(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) return;
    hop.value = 0;
    hop.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.quad) });
  }, [poke]);
  useEffect(() => {
    if (first.current) return;
    shk.value = 0;
    shk.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) });
  }, [chomp]);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    pop.value = 0;
    pop.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) });
  }, [mood]);

  const root = useAnimatedStyle(() => {
    const h = hop.value;
    const hy = interpolate(h, [0, 0.4, 0.78, 1], [0, -width * 0.14, 0, 0]);
    const hsy = interpolate(h, [0, 0.12, 0.4, 0.78, 0.88, 1], [1, 0.9, 1.07, 0.88, 1.03, 1]);
    const hsx = interpolate(h, [0, 0.12, 0.4, 0.78, 0.88, 1], [1, 1.07, 0.95, 1.1, 0.98, 1]);
    const s = shk.value;
    const wob = Math.sin(s * Math.PI * 6) * (1 - s);
    const pp = interpolate(pop.value, [0, 0.3, 1], [1, 1.06, 1]);
    return {
      transform: [
        { translateY: bob.value + hy },
        { translateX: wob * width * 0.025 },
        { rotate: `${lean.value + wob * 6}deg` },
        { scaleX: hsx * (1 - 0.1 * Math.sin(s * Math.PI)) * pp },
        { scaleY: hsy * breathe.value * (1 + 0.04 * Math.sin(s * Math.PI)) * pp },
      ],
    };
  });

  // ---- fries that just got eaten fly off ----
  const prevFries = useRef(friesLeft);
  const prevScene = useRef(scene);
  const [ghosts, setGhosts] = useState<{ key: string; idx: number; scene: ReturnType<typeof mascot> }[]>([]);
  const [crumbs, setCrumbs] = useState<{ n: number; x: number; y: number }>({ n: 0, x: 0, y: 0 });
  useEffect(() => {
    const before = prevFries.current;
    if (friesLeft < before) {
      const old = prevScene.current;
      const gone: number[] = [];
      for (let i = 0; i < FRY_COUNT; i++) if (fryPresent(i, before) && !fryPresent(i, friesLeft)) gone.push(i);
      setGhosts((g) => [...g, ...gone.map((idx) => ({ key: `${idx}-${Date.now()}`, idx, scene: old }))]);
      if (gone.length) {
        const [bx, by] = fryBase(gone[0]);
        const [px, py] = toPx(bx, by - 60);
        setCrumbs((c) => ({ n: c.n + 1, x: px, y: py }));
      }
    }
    prevFries.current = friesLeft;
    prevScene.current = scene;
  }, [friesLeft, scene]);

  const eyeY = (167 - vy) * k;
  const layers = scene.groups;
  const body = (
    <Animated.View style={[{ width, height }, root]}>
      <View style={{ width, height }}>
        {layers.map((g) => {
          if (g.startsWith('fry')) {
            const idx = parseInt(g.slice(3), 10);
            const [bx, by] = fryBase(idx);
            const origin = toPx(bx, by);
            return (
              <SwayFry
                key={g}
                scene={scene}
                group={g}
                width={width}
                height={height}
                origin={origin}
                amp={1.6 + (idx % 3) * 0.7}
                ms={1500 + idx * 130}
                delay={idx * 90}
                still={still}
              />
            );
          }
          if (g === 'eyes') return <Blinker key={g} scene={scene} width={width} height={height} originY={eyeY} still={still} />;
          return (
            <View key={g} pointerEvents="none" style={StyleSheet.absoluteFill}>
              <SceneView scene={scene} width={width} groups={[g]} />
            </View>
          );
        })}
        {ghosts.map((gh) => (
          <GhostFry
            key={gh.key}
            scene={gh.scene}
            group={`fry${gh.idx}`}
            width={width}
            height={height}
            origin={toPx(...fryBase(gh.idx))}
            onDone={() => setGhosts((g) => g.filter((x) => x.key !== gh.key))}
          />
        ))}
        <Munch trigger={munch} x={toPx(122, 192)[0]} y={toPx(122, 192)[1]} w={width * 0.2} />
        <Burst x={crumbs.x} y={crumbs.y} trigger={crumbs.n} count={10} radius={width * 0.28} size={width * 0.035} />
      </View>
    </Animated.View>
  );

  const handle = () => {
    haptic.soft();
    onPress?.();
  };
  return onPress ? (
    <Pressable onPress={handle} accessibilityRole="button" accessibilityLabel="Brokey">
      {body}
    </Pressable>
  ) : (
    body
  );
}

export const Brokey = memo(BrokeyBase);
