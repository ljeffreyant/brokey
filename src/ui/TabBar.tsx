import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useRouter } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '../i18n';
import { useTheme } from '../theme';
import { Glyph, GlyphName } from './Glyph';
import { Txt } from './Txt';
import { PressSlab, Slab } from './kit';
import { haptic } from './haptics';
import { puff } from './clay';

const TABS: { name: string; glyph: GlyphName; key: 'tab.home' | 'tab.cool' | 'tab.shelf' | 'tab.week' }[] = [
  { name: 'home', glyph: 'home', key: 'tab.home' },
  { name: 'cooling', glyph: 'snow', key: 'tab.cool' },
  { name: 'shelf', glyph: 'shelf', key: 'tab.shelf' },
  { name: 'week', glyph: 'chart', key: 'tab.week' },
];

function TabItem({ glyph, label, on, onPress }: { glyph: GlyphName; label: string; on: boolean; onPress: () => void }) {
  const p = useTheme();
  const s = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    s.value = withSpring(on ? 1 : 0, { damping: 13, stiffness: 320 });
  }, [on]);
  const pill = useAnimatedStyle(() => ({ transform: [{ scale: 0.6 + s.value * 0.4 }], opacity: s.value }));
  const icon = useAnimatedStyle(() => ({ transform: [{ translateY: -s.value * 1.5 }, { scale: 1 + s.value * 0.08 }] }));
  return (
    <Pressable accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: on }} onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 60 }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[{ position: 'absolute', width: 52, height: 34, borderRadius: 17, backgroundColor: p.accent2, top: -6, ...puff(p, p.accent2, 3) }, pill]} />
        <Animated.View style={icon}>
          <Glyph name={glyph} size={22} color={on ? p.onAccent2 : p.textDim} stroke={on ? 2.6 : 2.2} />
        </Animated.View>
        <Txt v="label" size={9.5} color={on ? p.text : p.textFaint} style={{ marginTop: 9, letterSpacing: 0.6 }}>
          {label}
        </Txt>
      </View>
    </Pressable>
  );
}

/** Floating sticker tab bar with the big log button in the middle. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const p = useTheme();
  const t = useT();
  const router = useRouter();
  const ins = useSafeAreaInsets();
  const wob = useSharedValue(0);
  useEffect(() => {
    wob.value = withRepeat(withSequence(withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1300, easing: Easing.inOut(Easing.sin) })), -1);
  }, []);
  const fab = useAnimatedStyle(() => ({ transform: [{ translateY: -wob.value * 3 }, { rotate: `${(wob.value - 0.5) * 4}deg` }] }));

  const current = state.routes[state.index]?.name;
  const go = (name: string) => {
    haptic.tap();
    const r = state.routes.find((x) => x.name === name);
    if (!r) return;
    const ev = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
    if (current !== name && !ev.defaultPrevented) navigation.navigate(name as never);
  };
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(ins.bottom, 10), paddingHorizontal: 14 }}>
      <View style={{ paddingBottom: 2 }}>
        <Slab r={34} depth={6} weight="hero" inner={{ flexDirection: 'row', alignItems: 'center', height: 68, paddingHorizontal: 6 }}>
          {left.map((x) => (
            <TabItem key={x.name} glyph={x.glyph} label={t(x.key)} on={current === x.name} onPress={() => go(x.name)} />
          ))}
          <View style={{ width: 84 }} />
          {right.map((x) => (
            <TabItem key={x.name} glyph={x.glyph} label={t(x.key)} on={current === x.name} onPress={() => go(x.name)} />
          ))}
        </Slab>
        <Animated.View style={[{ position: 'absolute', alignSelf: 'center', top: -28 }, fab]}>
          <PressSlab fill={p.accent} r={38} depth={7} gloss onPress={() => router.push('/log')} tone="medium" label={t('tab.log')} inner={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
            <Glyph name="plus" size={36} color={p.onAccent} stroke={3.4} />
          </PressSlab>
        </Animated.View>
      </View>
    </View>
  );
}
