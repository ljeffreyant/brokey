import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BudgetState } from '../core';
import { useT } from '../i18n';
import { useTheme } from '../theme';
import { Brokey, MOUTH } from './Brokey';
import { Burst } from './Burst';
import { CatIcon } from './CatIcon';
import { Txt } from './Txt';
import { Btn, Slab } from './kit';
import { haptic } from './haptics';
import { useFmt } from './useFmt';
import { weatherOf } from './weather';

export interface EatInput {
  iconId: string;
  amountCents: number;
  roast: string;
  before: BudgetState;
  after: BudgetState;
  newStickers: string[];
}

function useTypewriter(text: string, run: boolean, ms = 22) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    setN(0);
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, ms);
    return () => clearInterval(id);
  }, [run, text, ms]);
  return { shown: text.slice(0, n), done: n >= text.length, skip: () => setN(text.length) };
}

/**
 * The payoff. The thing you bought flies into his mouth, he chews, fries fly off, the colour of the day shifts,
 * and then he says something rude about it.
 */
export function EatScene({ input, onDone, onUndo }: { input: EatInput; onDone: () => void; onUndo: () => void }) {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const ins = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const bw = Math.min(W * 0.74, 310);
  const bh = (bw * 276) / 268;
  const left = (W - bw) / 2;
  const top = Math.max(ins.top + 70, H * 0.17);
  const mouthX = left + MOUTH.x * bw;
  const mouthY = top + MOUTH.y * bh;
  const foodSize = Math.min(W * 0.36, 150);

  const wBefore = p.weather[weatherOf(input.before.remainingCents, input.before.budgetCents)];
  const wAfter = p.weather[weatherOf(input.after.remainingCents, input.after.budgetCents)];

  const [mood, setMood] = useState<'tempted' | 'shock' | BudgetState['mood']>('tempted');
  const [fries, setFries] = useState(input.before.friesLeft);
  const [munch, setMunch] = useState(0);
  const [chomp, setChomp] = useState(0);
  const [burst, setBurst] = useState(0);
  const [showRoast, setShowRoast] = useState(false);
  const [showChip, setShowChip] = useState(false);
  const [foodGone, setFoodGone] = useState(false);

  const fly = useSharedValue(0);
  const bg = useSharedValue(0);
  const rise = useSharedValue(0);
  const chip = useSharedValue(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => {
    haptic.medium();
    fly.value = withDelay(250, withTiming(1, { duration: 700, easing: Easing.in(Easing.cubic) }));
    at(420, () => setMunch((n) => n + 1));
    at(950, () => {
      setFoodGone(true);
      setFries(input.after.friesLeft);
      setChomp((n) => n + 1);
      setBurst((n) => n + 1);
      setMood('shock');
      haptic.heavy();
    });
    at(1250, () => haptic.soft());
    at(1530, () => haptic.soft());
    at(1810, () => haptic.soft());
    at(1900, () => {
      setMood(input.after.mood);
      setShowChip(true);
      chip.value = withSpring(1, { damping: 9, stiffness: 190 });
      bg.value = withTiming(1, { duration: 900 });
      haptic.tap();
    });
    at(2250, () => {
      setShowRoast(true);
      rise.value = withSpring(1, { damping: 15, stiffness: 160 });
    });
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const tw = useTypewriter(input.roast, showRoast, 20);

  const field = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(bg.value, [0, 1], [wBefore.field, wAfter.field]) }));
  const foodStyle = useAnimatedStyle(() => {
    const k = fly.value;
    const sx = W / 2;
    const sy = H + foodSize;
    const cx = sx + (mouthX - sx) * 0.15;
    const cy = H * 0.55;
    const x = (1 - k) * (1 - k) * sx + 2 * (1 - k) * k * cx + k * k * mouthX;
    const y = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * cy + k * k * mouthY;
    const s = interpolate(k, [0, 0.7, 1], [1.2, 0.9, 0.22]);
    return {
      opacity: k > 0 ? 1 : 0,
      transform: [{ translateX: x - foodSize / 2 }, { translateY: y - foodSize / 2 }, { rotate: `${k * 520}deg` }, { scale: s }],
    };
  });
  const chipStyle = useAnimatedStyle(() => ({
    opacity: chip.value,
    transform: [{ translateY: -chip.value * 14 }, { scale: 0.6 + chip.value * 0.4 }, { rotate: '-4deg' }],
  }));
  const bubble = useAnimatedStyle(() => ({ opacity: rise.value, transform: [{ translateY: (1 - rise.value) * 40 }] }));

  const allDone = showRoast && tw.done;
  const cost = input.amountCents;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, field]}>
      <View style={{ position: 'absolute', left, top, width: bw, height: bh }}>
        <Brokey mood={mood} width={bw} friesLeft={fries} munch={munch} chomp={chomp} />
      </View>

      {!foodGone ? (
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: foodSize, height: foodSize }, foodStyle]}>
          <CatIcon id={input.iconId} size={foodSize} />
        </Animated.View>
      ) : null}

      <Burst x={mouthX} y={mouthY} trigger={burst} count={14} radius={bw * 0.5} size={bw * 0.04} gravity={0.8} colors={['#FFD23F', '#FFF6E6', '#EE3B2B', '#B56D36']} />

      {showChip ? (
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: top - 52, alignItems: 'center' }, chipStyle]}>
          <View style={{ backgroundColor: p.ink, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 22, flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Txt v="title" color="#FFF6E6">
              -{f.hspNum(cost)} {f.unit.singular}
            </Txt>
            <Txt v="small" color="#E5C3A6" style={{ fontFamily: 'DMSans_700Bold' }}>
              {f.money(cost)}
            </Txt>
          </View>
        </Animated.View>
      ) : null}

      {showRoast ? (
        <Animated.View style={[{ position: 'absolute', left: 20, right: 20, bottom: ins.bottom + 22 }, bubble]}>
          <Pressable onPress={tw.skip} accessibilityRole="button" accessibilityLabel={input.roast}>
            <Slab depth={4} r={26} fill={p.card} inner={{ padding: 18, minHeight: 92, justifyContent: 'center' }}>
              <Txt v="heading" size={20} style={{ lineHeight: 26 }}>
                {tw.shown}
                <Txt v="heading" size={20} color="transparent">
                  {input.roast.slice(tw.shown.length)}
                </Txt>
              </Txt>
            </Slab>
          </Pressable>
          <View style={{ marginTop: 16, opacity: allDone ? 1 : 0.0, gap: 10 }} pointerEvents={allDone ? 'auto' : 'none'}>
            <Btn label={t('eat.fair')} tone="primary" size="lg" full onPress={onDone} />
            <Pressable onPress={onUndo} accessibilityRole="button" hitSlop={10} style={{ alignSelf: 'center', paddingVertical: 4 }}>
              <Txt v="small" color={wAfter.textDim} style={{ fontFamily: 'DMSans_700Bold', textDecorationLine: 'underline' }}>
                {t('eat.undo')}
              </Txt>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

export const _s = withSequence;
