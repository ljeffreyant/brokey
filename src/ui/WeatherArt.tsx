import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { WeatherColor, WeatherId } from '../theme';

/** gradients shared by every shape in one Svg: each Svg needs its own copy of the defs */
function WDefs() {
  return (
    <Defs>
      <RadialGradient id="sunG" cx="38%" cy="32%" rx="78%" ry="78%">
        <Stop offset="0" stopColor="#FFFDEB" />
        <Stop offset="0.55" stopColor="#FFE46B" />
        <Stop offset="1" stopColor="#FFC22E" />
      </RadialGradient>
      <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </RadialGradient>
      <LinearGradient id="cloudW" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFFFFF" />
        <Stop offset="1" stopColor="#DDE9F4" />
      </LinearGradient>
      <LinearGradient id="cloudG" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#F1E8DB" />
        <Stop offset="1" stopColor="#C9BCAA" />
      </LinearGradient>
      <LinearGradient id="cloudD" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#A89684" />
        <Stop offset="1" stopColor="#6F5E50" />
      </LinearGradient>
    </Defs>
  );
}

const CLOUD = {
  w: { grad: 'cloudW', lip: '#BFD2E4' },
  g: { grad: 'cloudG', lip: '#A8998A' },
  d: { grad: 'cloudD', lip: '#4E4036' },
} as const;

/** A puffy clay cloud: each lobe is lit from above and sits on a darker underside. */
function Cloud({ x, y, s, tone }: { x: number; y: number; s: number; tone: keyof typeof CLOUD }) {
  const parts: [number, number, number][] = [
    [0, 0, 22],
    [26, -10, 28],
    [58, 0, 22],
    [28, 8, 24],
  ];
  const c = CLOUD[tone];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <G transform="translate(0 6)">
        {parts.map((q, i) => <Circle key={`l${i}`} cx={q[0]} cy={q[1]} r={q[2]} fill={c.lip} />)}
        <Rect x={-24} y={-2} width={106} height={32} rx={16} fill={c.lip} />
      </G>
      {parts.map((q, i) => <Circle key={`f${i}`} cx={q[0]} cy={q[1]} r={q[2]} fill={`url(#${c.grad})`} />)}
      <Rect x={-24} y={-4} width={106} height={32} rx={16} fill={`url(#${c.grad})`} />
      <Ellipse cx={18} cy={-14} rx={13} ry={5} fill="#FFFFFF" opacity={0.55} transform="rotate(-18 18 -14)" />
    </G>
  );
}

/** A glowing clay sun with a soft face. */
function Sun({ x, y, r, ray }: { x: number; y: number; r: number; ray: string }) {
  const rays = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180);
  const brown = '#5A2B0A';
  return (
    <G>
      <Circle cx={x} cy={y} r={r * 2.1} fill="url(#glow)" />
      {rays.map((a, i) => (
        <Line key={i} x1={x + Math.cos(a) * (r + 12)} y1={y + Math.sin(a) * (r + 12)} x2={x + Math.cos(a) * (r + 27)} y2={y + Math.sin(a) * (r + 27)} stroke={ray} strokeWidth={9} strokeLinecap="round" />
      ))}
      <Circle cx={x} cy={y + 5} r={r} fill="#E0A416" />
      <Circle cx={x} cy={y} r={r} fill="url(#sunG)" />
      <Ellipse cx={x - r * 0.36} cy={y - r * 0.55} rx={r * 0.36} ry={r * 0.17} fill="#FFFFFF" opacity={0.6} transform={`rotate(-28 ${x - r * 0.36} ${y - r * 0.55})`} />
      <Circle cx={x - r * 0.34} cy={y - r * 0.06} r={r * 0.08} fill={brown} />
      <Circle cx={x + r * 0.34} cy={y - r * 0.06} r={r * 0.08} fill={brown} />
      <Circle cx={x - r * 0.54} cy={y + r * 0.24} r={r * 0.15} fill="#FF9E8F" opacity={0.8} />
      <Circle cx={x + r * 0.54} cy={y + r * 0.24} r={r * 0.15} fill="#FF9E8F" opacity={0.8} />
      <Path d={`M${x - r * 0.2} ${y + r * 0.22} Q${x} ${y + r * 0.44} ${x + r * 0.2} ${y + r * 0.22}`} stroke={brown} strokeWidth={3.2} strokeLinecap="round" fill="none" />
    </G>
  );
}

function Rain({ w, h, color }: { w: number; h: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: t.value * 46 }, { translateX: -t.value * 14 }] }));
  const drops: [number, number][] = [];
  for (let i = 0; i < 14; i++) drops.push([(i * 83) % w, ((i * 47) % 180) + 60]);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width={w} height={h}>
        {drops.map((d, i) => (
          <Line key={i} x1={d[0]} y1={d[1]} x2={d[0] - 6} y2={d[1] + 20} stroke={color} strokeWidth={4} strokeLinecap="round" opacity={0.65} />
        ))}
      </Svg>
    </Animated.View>
  );
}

function Spin({ children, ms }: { children: React.ReactNode; ms: number }) {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withDelay(0, withRepeat(withTiming(360, { duration: ms, easing: Easing.linear }), -1));
  }, []);
  const s = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s]}>
      {children}
    </Animated.View>
  );
}

/** The "money weather" behind Brokey: a clay sun, soft clouds or rain. */
export function WeatherArt({ weather, c, w, h }: { weather: WeatherId; c: WeatherColor; w: number; h: number }) {
  const sunX = w * 0.87;
  const sunY = 118;
  const dots: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) dots.push([18 + i * 17, h - 130 + j * 17, Math.max(0.8, 5.4 - (i + j) * 0.55)]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        <WDefs />
        {dots.map((d, i) => <Circle key={i} cx={d[0]} cy={d[1]} r={d[2]} fill={c.blob} />)}
        <Circle cx={w * 0.12} cy={h * 0.4} r={46} fill={c.blob} opacity={0.5} />
      </Svg>
      {weather === 'sunny' ? (
        <Spin ms={90000}>
          <Svg width={w} height={h}>
            <WDefs />
            <Sun x={sunX} y={sunY} r={34} ray={c.blob} />
          </Svg>
        </Spin>
      ) : null}
      {weather === 'mild' ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <WDefs />
          <Sun x={sunX + 6} y={sunY - 6} r={30} ray={c.blob} />
          <Cloud x={sunX - 38} y={sunY + 26} s={0.8} tone="w" />
        </Svg>
      ) : null}
      {weather === 'tight' ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <WDefs />
          <Cloud x={sunX - 24} y={sunY - 12} s={0.95} tone="g" />
          <Cloud x={w * 0.08} y={sunY + 70} s={0.55} tone="g" />
        </Svg>
      ) : null}
      {weather === 'broke' ? (
        <>
          <Rain w={w} h={h} color={c.textDim} />
          <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
            <WDefs />
            <Cloud x={sunX - 30} y={sunY - 24} s={1} tone="d" />
            <Cloud x={w * 0.06} y={sunY + 56} s={0.6} tone="d" />
          </Svg>
        </>
      ) : null}
    </View>
  );
}
