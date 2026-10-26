import React, { memo, useEffect, useRef, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { FRY_COUNT, Mood } from '../art/mascot';
import { poseFor } from '../art/moodPoses';
import { POSE_SIZE, POSE_SRC, PoseId } from '../art/poses';
import { useTheme } from '../theme';
import { Burst } from './Burst';
import { haptic } from './haptics';

export interface BrokeyProps {
  mood: Mood;
  width: number;
  /** a specific 3D pose, for moments that are not one of the eight moods */
  pose?: PoseId;
  /** how many of the nine fries are left; when it drops, a few crumbs fly off his head */
  friesLeft?: number;
  /** bump to make him hop (and flip to his next pose for the mood) */
  poke?: number;
  /** bump to make him get chomped (shake) */
  chomp?: number;
  /** bump to open wide and chew three times */
  munch?: number;
  /** no idle animation, for thumbnails and share cards */
  still?: boolean;
  onPress?: () => void;
  seed?: number;
}

/** the drawing area is a bit taller than wide so his shadow fits under his feet */
export const BROKEY_ASPECT = 1.04;
/** poses are exported at 2x of the sticker sheet, none is wider than this */
const POSE_REF = 600;
/** Where his mouth is, as a fraction of the width, for things that need to fly into it. */
export const MOUTH = { x: 0.56, y: 0.67 };

/** Rotating or scaling about a point without `transformOrigin` (Reanimated 4.5 on RN 0.86 rejects it on animated views). */
function around(origin: [number, number], w: number, h: number) {
  const dx = origin[0] - w / 2;
  const dy = origin[1] - h / 2;
  return {
    enter: [{ translateX: dx }, { translateY: dy }] as const,
    leave: [{ translateX: -dx }, { translateY: -dy }] as const,
  };
}

function useLoop(from: number, to: number, ms: number, run: boolean, delay = 0) {
  const v = useSharedValue(from);
  useEffect(() => {
    v.value = from;
    if (!run) return;
    v.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(to, { duration: ms, easing: Easing.inOut(Easing.sin) }), withTiming(from, { duration: ms, easing: Easing.inOut(Easing.sin) })), -1),
    );
  }, [run]);
  return v;
}

function Sprite({ pose, width, fade }: { pose: PoseId; width: number; fade: boolean }) {
  const [pw, ph] = POSE_SIZE[pose];
  const k = width / POSE_REF;
  const iw = pw * k;
  const ih = ph * k;
  const img = <Image source={POSE_SRC[pose]} style={{ width: iw, height: ih }} resizeMode="contain" accessibilityIgnoresInvertColors />;
  const pos = { position: 'absolute', bottom: 0, left: (width - iw) / 2, width: iw, height: ih } as const;
  if (!fade) return <View style={pos}>{img}</View>;
  return (
    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)} style={pos}>
      {img}
    </Animated.View>
  );
}

function BrokeyBase({ mood, width, pose, friesLeft = FRY_COUNT, poke = 0, chomp = 0, munch = 0, still, onPress }: BrokeyProps) {
  const p = useTheme();
  const reduce = useReducedMotion();
  const live = !still && !reduce;
  const H = width * BROKEY_ASPECT;
  const spriteBox = width; // the sprite area, sitting on the bottom of the frame
  const bottomPad = H - spriteBox;

  // ---- which pose ----
  // the variant belongs to a mood, so a new mood always starts on its first pose
  const [vs, setVs] = useState({ m: mood, n: 0 });
  const variant = vs.m === mood ? vs.n : 0;
  const [chewing, setChewing] = useState<PoseId | null>(null);
  const firstPoke = useRef(true);
  useEffect(() => {
    if (firstPoke.current) {
      firstPoke.current = false;
      return;
    }
    setVs((s) => ({ m: mood, n: (s.m === mood ? s.n : 0) + 1 }));
  }, [poke]);
  const shown: PoseId = chewing ?? pose ?? poseFor(mood, variant);

  // ---- idle: bob, breathe, sway (all about his feet) ----
  const bob = useLoop(0, -width * 0.014, 1150, live);
  const breathe = useLoop(1, 1.022, 1150, live, 120);
  const sway = useLoop(-0.9, 0.9, 2300, live);

  // ---- poke (hop), chomp (shake), mood change (pop), munch (chew squash) ----
  const hop = useSharedValue(0);
  const shk = useSharedValue(0);
  const pop = useSharedValue(0);
  const chew = useSharedValue(0);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) return;
    hop.value = 0;
    hop.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.quad) });
  }, [poke]);
  useEffect(() => {
    if (!mounted.current) return;
    shk.value = 0;
    shk.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) });
  }, [chomp]);
  useEffect(() => {
    if (!mounted.current) return;
    pop.value = 0;
    pop.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) });
  }, [mood, pose]);
  useEffect(() => {
    if (!mounted.current || munch <= 0) return;
    setChewing('hungry-fork');
    const t1 = setTimeout(() => setChewing('content'), 330);
    const t2 = setTimeout(() => setChewing(null), 1500);
    chew.value = 0;
    chew.value = withDelay(330, withTiming(1, { duration: 1000, easing: Easing.linear }));
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [munch]);
  useEffect(() => {
    mounted.current = true;
  }, []);

  const feet: [number, number] = [width / 2, spriteBox];
  const pv = around(feet, width, spriteBox);
  const root = useAnimatedStyle(() => {
    const h = hop.value;
    const hy = interpolate(h, [0, 0.4, 0.78, 1], [0, -width * 0.16, 0, 0]);
    const hsy = interpolate(h, [0, 0.12, 0.4, 0.78, 0.88, 1], [1, 0.9, 1.07, 0.88, 1.03, 1]);
    const hsx = interpolate(h, [0, 0.12, 0.4, 0.78, 0.88, 1], [1, 1.07, 0.95, 1.1, 0.98, 1]);
    const s = shk.value;
    const wob = Math.sin(s * Math.PI * 6) * (1 - s);
    const pp = interpolate(pop.value, [0, 0.3, 1], [1, 1.05, 1]);
    const c = chew.value > 0 && chew.value < 1 ? Math.sin(chew.value * Math.PI * 6) : 0;
    return {
      transform: [
        { translateY: bob.value + hy },
        { translateX: wob * width * 0.025 },
        ...pv.enter,
        { rotate: `${sway.value + wob * 6}deg` },
        { scaleX: hsx * (1 - 0.1 * Math.sin(s * Math.PI)) * pp * (1 + 0.025 * c) },
        { scaleY: hsy * breathe.value * (1 + 0.04 * Math.sin(s * Math.PI)) * pp * (1 - 0.045 * Math.abs(c)) },
        ...pv.leave,
      ],
    };
  });
  // the shadow shrinks and fades as he rises
  const shadow = useAnimatedStyle(() => {
    const up = -(bob.value + interpolate(hop.value, [0, 0.4, 0.78, 1], [0, -width * 0.16, 0, 0])) / (width * 0.16);
    return { opacity: 1 - Math.min(up, 1) * 0.5, transform: [{ scaleX: 1 - Math.min(up, 1) * 0.28 }] };
  });

  // ---- fries that just got eaten: a few fly off his head ----
  const prevFries = useRef(friesLeft);
  const [crumbs, setCrumbs] = useState(0);
  const [flung, setFlung] = useState<number[]>([]);
  useEffect(() => {
    if (friesLeft < prevFries.current && mounted.current) {
      setCrumbs((n) => n + 1);
      const id = Date.now();
      setFlung((f) => [...f, id]);
      setTimeout(() => setFlung((f) => f.filter((x) => x !== id)), 800);
    }
    prevFries.current = friesLeft;
  }, [friesLeft]);

  const body = (
    <View style={{ width, height: H }}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: width * 0.14, bottom: -width * 0.015, width: width * 0.72, height: width * 0.13 }, shadow]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 18" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id="g" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={p.dark ? '#000' : '#5A2A00'} stopOpacity={p.dark ? 0.55 : 0.34} />
              <Stop offset="0.6" stopColor={p.dark ? '#000' : '#5A2A00'} stopOpacity={p.dark ? 0.25 : 0.14} />
              <Stop offset="1" stopColor={p.dark ? '#000' : '#5A2A00'} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={50} cy={9} rx={50} ry={9} fill="url(#g)" />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 0, bottom: bottomPad, width, height: spriteBox }, root]}>
        <Sprite key={shown} pose={shown} width={width} fade={live} />
        {flung.map((id) => (
          <FlungFry key={id} w={width} />
        ))}
        <Burst x={width * 0.5} y={width * 0.2} trigger={crumbs} count={9} radius={width * 0.3} size={width * 0.035} colors={['#FFD23F', '#FFB02E', '#7A3517', '#FFF6C9']} />
      </Animated.View>
    </View>
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

/** a single chip flicked off the top of the pile */
function FlungFry({ w }: { w: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.7, 1], [1, 1, 0]),
    transform: [{ translateX: w * 0.3 * t.value }, { translateY: -w * 0.34 * t.value + w * 0.55 * t.value * t.value }, { rotate: `${240 * t.value}deg` }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: w * 0.5, top: w * 0.16, width: w * 0.04, height: w * 0.17, borderRadius: w * 0.02, backgroundColor: '#FFC83D', borderBottomWidth: 0 }, style]}
    />
  );
}

export const Brokey = memo(BrokeyBase);
