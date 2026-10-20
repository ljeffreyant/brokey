import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { WeatherColor, WeatherId } from '../theme';

function Cloud({ x, y, s, fill, ink }: { x: number; y: number; s: number; fill: string; ink: string }) {
  const parts: [number, number, number][] = [
    [0, 0, 22],
    [26, -10, 28],
    [58, 0, 22],
    [28, 8, 24],
  ];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {parts.map((c, i) => <Circle key={`o${i}`} cx={c[0]} cy={c[1]} r={c[2] + 3.4} fill={ink} />)}
      <Path d="M-22 6H80V26H-22z" fill={ink} />
      {parts.map((c, i) => <Circle key={`f${i}`} cx={c[0]} cy={c[1]} r={c[2]} fill={fill} />)}
      <Path d="M-20 6H78V23H-20z" fill={fill} />
    </G>
  );
}

function Sun({ x, y, r, fill, ink, ray }: { x: number; y: number; r: number; fill: string; ink: string; ray: string }) {
  const rays = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180);
  return (
    <G>
      {rays.map((a, i) => (
        <Line key={i} x1={x + Math.cos(a) * (r + 10)} y1={y + Math.sin(a) * (r + 10)} x2={x + Math.cos(a) * (r + 26)} y2={y + Math.sin(a) * (r + 26)} stroke={ray} strokeWidth={7} strokeLinecap="round" />
      ))}
      <Circle cx={x} cy={y} r={r + 3.4} fill={ink} />
      <Circle cx={x} cy={y} r={r} fill={fill} />
      <Circle cx={x - r * 0.34} cy={y - r * 0.08} r={r * 0.075} fill={ink} />
      <Circle cx={x + r * 0.34} cy={y - r * 0.08} r={r * 0.075} fill={ink} />
      <Circle cx={x - r * 0.52} cy={y + r * 0.22} r={r * 0.14} fill="#FF9E8F" opacity={0.85} />
      <Circle cx={x + r * 0.52} cy={y + r * 0.22} r={r * 0.14} fill="#FF9E8F" opacity={0.85} />
      <Path d={`M${x - r * 0.2} ${y + r * 0.2} Q${x} ${y + r * 0.42} ${x + r * 0.2} ${y + r * 0.2}`} stroke={ink} strokeWidth={3} strokeLinecap="round" fill="none" />
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

/** The "money weather" behind Brokey: sun, cloud or rain, drawn in the same sticker style. */
export function WeatherArt({ weather, c, ink, w, h }: { weather: WeatherId; c: WeatherColor; ink: string; w: number; h: number }) {
  const sunX = w * 0.82;
  const sunY = 118;
  const dots: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) dots.push([18 + i * 17, h - 130 + j * 17, Math.max(0.8, 5.4 - (i + j) * 0.55)]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        {dots.map((d, i) => <Circle key={i} cx={d[0]} cy={d[1]} r={d[2]} fill={c.blob} />)}
        <Circle cx={w * 0.12} cy={h * 0.4} r={46} fill={c.blob} opacity={0.5} />
      </Svg>
      {weather === 'sunny' ? (
        <>
          <Spin ms={90000}>
            <Svg width={w} height={h}>
              <Sun x={sunX} y={sunY} r={34} fill="#FFF6C9" ink={ink} ray={c.blob} />
            </Svg>
          </Spin>
        </>
      ) : null}
      {weather === 'mild' ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Sun x={sunX + 6} y={sunY - 6} r={30} fill="#FFF6C9" ink={ink} ray={c.blob} />
          <Cloud x={sunX - 50} y={sunY + 22} s={0.8} fill="#FFFDF6" ink={ink} />
        </Svg>
      ) : null}
      {weather === 'tight' ? (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Cloud x={sunX - 44} y={sunY} s={0.95} fill="#E7DCCB" ink={ink} />
          <Cloud x={w * 0.08} y={sunY + 70} s={0.55} fill="#EFE4D2" ink={ink} />
        </Svg>
      ) : null}
      {weather === 'broke' ? (
        <>
          <Rain w={w} h={h} color={c.textDim} />
          <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
            <Cloud x={sunX - 54} y={sunY - 6} s={1} fill="#8C7A6A" ink={ink} />
            <Cloud x={w * 0.06} y={sunY + 56} s={0.6} fill="#A08D7C" ink={ink} />
          </Svg>
        </>
      ) : null}
    </View>
  );
}
