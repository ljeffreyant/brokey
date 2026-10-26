import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useT } from '../i18n';
import { useTheme } from '../theme';
import { puff } from './clay';

function Fry({ on, i }: { on: boolean; i: number }) {
  const s = useSharedValue(on ? 1 : 0);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      s.value = on ? 1 : 0;
      return;
    }
    // a fry that just got eaten pops, then shrinks into its slot
    s.value = on ? withSpring(1, { damping: 9, stiffness: 300 }) : withSequence(withTiming(1.5, { duration: 110 }), withTiming(0, { duration: 260 }));
  }, [on]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 0.82 + s.value * 0.18 }, { rotate: `${(1 - s.value) * -14}deg` }], opacity: 0.28 + Math.min(1, s.value) * 0.72 }));
  return (
    <Animated.View
      style={[
        {
          width: 7,
          height: 20,
          borderRadius: 4,
          backgroundColor: on ? '#FFC83D' : '#FFFFFF',
          boxShadow: on ? 'inset 1.5px 0 0 rgba(255,255,255,0.6), inset -1.5px 0 0 rgba(160,90,0,0.35), 0 2px 0 #C98A10' : undefined,
          transform: [{ rotate: `${(i % 3) * 3 - 3}deg` }],
        },
        style,
      ]}
    />
  );
}

/** How much of the HSP is left, as nine chips on a dark clay tray. The mascot is a picture now, so the pile lives here. */
export function FryMeter({ left, total }: { left: number; total: number }) {
  const p = useTheme();
  const t = useT();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('home.fries', { n: left, total })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 32, paddingHorizontal: 13, borderRadius: 999, backgroundColor: p.ink, ...puff(p, p.ink, 3) }}
    >
      {Array.from({ length: total }, (_, i) => (
        <Fry key={i} on={i < left} i={i} />
      ))}
    </View>
  );
}
