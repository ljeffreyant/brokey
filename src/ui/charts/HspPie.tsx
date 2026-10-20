import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Path, Pattern } from 'react-native-svg';
import { GroupId, GroupTotal } from '../../core';
import { useTheme } from '../../theme';
import { haptic } from '../haptics';

const CX = 100;
const CY = 100;
const R_OUT = 80;
const R_IN = 36;

const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (r: number, deg: number): [number, number] => [CX + Math.cos(rad(deg)) * r, CY + Math.sin(rad(deg)) * r];

/** A donut slice from a0 to a1 degrees (clockwise from 12 o'clock). */
export function slicePath(a0: number, a1: number, rOut = R_OUT, rIn = R_IN): string {
  const s = a0 - 90;
  const e = Math.min(a1, a0 + 359.9) - 90;
  const [x0, y0] = pt(rOut, s);
  const [x1, y1] = pt(rOut, e);
  const [x2, y2] = pt(rIn, e);
  const [x3, y3] = pt(rIn, s);
  const large = e - s > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return `M${f(x0)} ${f(y0)} A${rOut} ${rOut} 0 ${large} 1 ${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)} A${rIn} ${rIn} 0 ${large} 0 ${f(x3)} ${f(y3)} Z`;
}

export interface Wedge {
  group: GroupId;
  a0: number;
  a1: number;
  mid: number;
}

export function wedges(groups: Pick<GroupTotal, 'group' | 'share'>[]): Wedge[] {
  let acc = 0;
  const out: Wedge[] = [];
  for (const g of groups) {
    if (g.share <= 0) continue;
    const a0 = acc * 360;
    acc += g.share;
    const a1 = acc * 360;
    out.push({ group: g.group, a0, a1, mid: (a0 + a1) / 2 });
  }
  return out;
}

/** The week as an HSP tray: one wedge per ingredient group. Tap a wedge to look closer. */
export function HspPie({
  groups,
  size,
  selected,
  onSelect,
  animKey,
  children,
}: {
  groups: GroupTotal[];
  size: number;
  selected: GroupId | null;
  onSelect: (g: GroupId | null) => void;
  animKey: string | number;
  children?: React.ReactNode;
}) {
  const p = useTheme();
  const ws = useMemo(() => wedges(groups), [groups]);
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = 0;
    v.value = withDelay(60, withSpring(1, { damping: 13, stiffness: 90, mass: 0.9 }));
  }, [animKey, v]);
  const spin = useAnimatedStyle(() => ({
    opacity: Math.min(1, v.value * 1.6),
    transform: [{ rotate: `${(1 - v.value) * -50}deg` }, { scale: 0.82 + 0.18 * v.value }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ width: size, height: size }, spin]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <Pattern id="garlicDots" width={9} height={9} patternUnits="userSpaceOnUse">
              <Circle cx={2.5} cy={2.5} r={1.3} fill={p.groups.garlic.deep} opacity={0.75} />
              <Circle cx={7} cy={7} r={1.3} fill={p.groups.garlic.deep} opacity={0.75} />
            </Pattern>
          </Defs>
          {/* foil tray */}
          <Circle cx={CX} cy={CY + 3} r={96} fill={p.ink} />
          <Circle cx={CX} cy={CY} r={96} fill={p.card2} stroke={p.ink} strokeWidth={3} />
          <Circle cx={CX} cy={CY} r={89} fill="none" stroke={p.ink} strokeWidth={1.2} strokeOpacity={0.18} strokeDasharray="3 5" />
          {ws.length === 0 ? (
            <>
              <Circle cx={CX} cy={CY} r={(R_OUT + R_IN) / 2} fill="none" stroke={p.textFaint} strokeWidth={R_OUT - R_IN} strokeOpacity={0.22} />
              <Circle cx={CX} cy={CY} r={R_OUT} fill="none" stroke={p.ink} strokeWidth={3} strokeDasharray="6 7" />
            </>
          ) : (
            ws.map((w) => {
              const on = selected === w.group;
              const dx = on ? Math.cos(rad(w.mid - 90)) * 7 : 0;
              const dy = on ? Math.sin(rad(w.mid - 90)) * 7 : 0;
              const col = p.groups[w.group];
              return (
                <G key={w.group} transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`} onPress={() => { haptic.tap(); onSelect(on ? null : w.group); }}>
                  <Path d={slicePath(w.a0, w.a1)} fill={col.bg} stroke={p.ink} strokeWidth={3} strokeLinejoin="round" opacity={selected && !on ? 0.55 : 1} />
                  {w.group === 'garlic' ? <Path d={slicePath(w.a0, w.a1)} fill="url(#garlicDots)" opacity={selected && !on ? 0.55 : 1} /> : null}
                  {/* a little shine so the wedges feel like sauce */}
                  <Path d={slicePath(w.a0 + 2, Math.min(w.a1 - 2, w.a0 + 2 + 26), R_OUT - 7, R_OUT - 12)} fill="#FFFFFF" opacity={0.35} />
                </G>
              );
            })
          )}
          <Circle cx={CX} cy={CY} r={R_IN - 1.5} fill={p.card} stroke={p.ink} strokeWidth={3} />
        </Svg>
      </Animated.View>
      <View pointerEvents="none" style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center', width: size * 0.34, height: size * 0.34 }}>
        {children}
      </View>
    </View>
  );
}
