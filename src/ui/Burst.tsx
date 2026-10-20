import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export interface BurstProps {
  /** centre of the burst, in the parent's pixel space */
  x: number;
  y: number;
  /** change this number to fire a burst */
  trigger: number;
  colors?: string[];
  count?: number;
  radius?: number;
  size?: number;
  /** 0..1, how much the pieces fall under gravity */
  gravity?: number;
  duration?: number;
}

interface P {
  angle: number;
  dist: number;
  size: number;
  color: string;
  spin: number;
  round: boolean;
}

function Piece({ p, trigger, gravity, duration, x, y }: { p: P; trigger: number; gravity: number; duration: number; x: number; y: number }) {
  const t = useSharedValue(1);
  useEffect(() => {
    if (trigger <= 0) return;
    t.value = 0;
    t.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
  }, [trigger]);
  const style = useAnimatedStyle(() => {
    const dx = Math.cos(p.angle) * p.dist * t.value;
    const dy = Math.sin(p.angle) * p.dist * t.value + gravity * 60 * t.value * t.value;
    return {
      opacity: t.value >= 1 ? 0 : 1 - t.value * t.value,
      transform: [{ translateX: dx }, { translateY: dy }, { rotate: `${p.spin * t.value}deg` }, { scale: 1 - 0.4 * t.value }],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x - p.size / 2,
          top: y - p.size / 2,
          width: p.size,
          height: p.size,
          borderRadius: p.round ? p.size / 2 : 2,
          backgroundColor: p.color,
          borderWidth: 1.5,
          borderColor: '#24120A',
        },
        style,
      ]}
    />
  );
}

/** A little pop of crumbs, sparkles or coins. Fires whenever `trigger` changes. */
export function Burst({
  x,
  y,
  trigger,
  colors = ['#FFD23F', '#E8A515', '#FFF2A0'],
  count = 9,
  radius = 60,
  size = 9,
  gravity = 0.6,
  duration = 650,
}: BurstProps) {
  const pieces = useMemo<P[]>(() => {
    // fixed pseudo-random so every burst looks hand-flicked but identical
    let s = 12345;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.7 - Math.PI / 2,
      dist: radius * (0.55 + rnd() * 0.7),
      size: size * (0.7 + rnd() * 0.7),
      color: colors[i % colors.length],
      spin: (rnd() - 0.5) * 420,
      round: rnd() > 0.6,
    }));
  }, [count, radius, size, colors.join(',')]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Piece key={i} p={p} trigger={trigger} gravity={gravity} duration={duration} x={x} y={y} />
      ))}
    </View>
  );
}
