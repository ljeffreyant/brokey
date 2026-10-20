import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { ClipPath, Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { useTheme } from '../../theme';
import { Txt } from '../Txt';
import { haptic } from '../haptics';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Bottle geometry, in a 44 x 126 box (the top 18 units are headroom for squirts).
const VB = '0 -18 44 126';
const VB_W = 44;
const VB_H = 126;
const BODY_TOP = 30;
const BODY_BOTTOM = 104;
const BODY_H = BODY_BOTTOM - BODY_TOP;
const BODY = 'M10 32 Q10 25 16 23 L28 23 Q34 25 34 32 L36 96 Q36 105 28 105 L16 105 Q8 105 8 96 Z';

export interface DayBar {
  key: string;
  label: string;
  value: string;
  cents: number;
  future: boolean;
  today: boolean;
}

function Bottle({ i, frac, over, future, selected, cid, colors, glass, ink }: {
  i: number;
  frac: number;
  over: boolean;
  future: boolean;
  selected: boolean;
  cid: string;
  colors: { ok: string; over: string };
  glass: string;
  ink: string;
}) {
  const level = useSharedValue(0);
  const lift = useSharedValue(0);
  useEffect(() => {
    level.value = withDelay(120 + i * 70, withSpring(Math.min(1, frac), { damping: 11, stiffness: 110, mass: 0.8 }));
  }, [frac, i, level]);
  useEffect(() => {
    lift.value = withSpring(selected ? 1 : 0, { damping: 10, stiffness: 190 });
  }, [selected, lift]);

  const sauce = over ? colors.over : colors.ok;
  const props = useAnimatedProps(() => {
    const h = BODY_H * Math.max(0, level.value);
    return { y: BODY_BOTTOM - h, height: h + 2 };
  });
  const wrap = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * lift.value }, { scale: 1 + 0.1 * lift.value }] }));

  return (
    <Animated.View style={[{ width: '100%', aspectRatio: VB_W / VB_H, opacity: future ? 0.5 : 1 }, wrap]}>
      <Svg width="100%" height="100%" viewBox={VB}>
        <Defs>
          <ClipPath id={cid}>
            <Path d={BODY} />
          </ClipPath>
        </Defs>
        {/* squirt when you went over */}
        {over ? (
          <G>
            <Path d="M22 3 Q22 -6 17 -9" stroke={ink} strokeWidth={5.4} strokeLinecap="round" fill="none" />
            <Path d="M22 3 Q22 -6 17 -9" stroke={sauce} strokeWidth={3} strokeLinecap="round" fill="none" />
            <Circle cx={12} cy={-11} r={2.4} fill={sauce} stroke={ink} strokeWidth={1.5} />
            <Circle cx={29} cy={-6} r={1.9} fill={sauce} stroke={ink} strokeWidth={1.5} />
          </G>
        ) : null}
        {/* nozzle + cap */}
        <Path d="M19 4 L25 4 L26 14 L18 14 Z" fill={sauce} stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
        <Path d="M15.5 13 L28.5 13 L31 24 L13 24 Z" fill={sauce} stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
        {/* glass */}
        <Path d={BODY} fill={glass} />
        <G clipPath={`url(#${cid})`}>
          <AnimatedRect x={0} width={44} fill={sauce} animatedProps={props} />
        </G>
        <Path d={BODY} fill="none" stroke={ink} strokeWidth={2.6} strokeLinejoin="round" />
        <Path d="M13.5 38 L14.5 78" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" opacity={0.55} />
        {/* label with a face */}
        <Rect x={12} y={47} width={20} height={25} rx={7} fill="#FFF6E6" stroke={ink} strokeWidth={1.7} />
        {future ? (
          <G stroke={ink} strokeWidth={1.5} strokeLinecap="round" fill="none">
            <Path d="M15.6 56.4 Q17.8 58.4 20 56.4" />
            <Path d="M24 56.4 Q26.2 58.4 28.4 56.4" />
            <Path d="M20 62 L24 62" />
          </G>
        ) : (
          <G>
            <Ellipse cx={17.4} cy={56.2} rx={1.7} ry={2.1} fill={ink} />
            <Ellipse cx={26.6} cy={56.2} rx={1.7} ry={2.1} fill={ink} />
            <Ellipse cx={14.4} cy={60.6} rx={2} ry={1.2} fill="#FF8FAA" opacity={0.85} />
            <Ellipse cx={29.6} cy={60.6} rx={2} ry={1.2} fill="#FF8FAA" opacity={0.85} />
            {over ? (
              <Ellipse cx={22} cy={63.4} rx={1.6} ry={2.2} fill="#7A1E1E" stroke={ink} strokeWidth={1} />
            ) : (
              <Path d="M19.6 61.4 Q22 64.6 24.4 61.4" stroke={ink} strokeWidth={1.6} strokeLinecap="round" fill="none" />
            )}
          </G>
        )}
      </Svg>
    </Animated.View>
  );
}

/** Seven sauce bottles, one per day. The level is how much of the day's allowance you used. Over it, the bottle squirts. */
export function SauceBars({
  days,
  allowanceCents,
  selected,
  onSelect,
  width,
}: {
  days: DayBar[];
  allowanceCents: number;
  selected: number;
  onSelect: (i: number) => void;
  width: number;
}) {
  const p = useTheme();
  const cw = width / 7;
  const maxCents = Math.max(0, ...days.map((d) => d.cents));
  // The bottle is full at 1.4x the allowance, or at the biggest day if that is bigger.
  const scaleMax = Math.max(allowanceCents * 1.4, maxCents, 100);
  const aFrac = allowanceCents / scaleMax;
  const bw = cw - 6;
  const bh = (bw * VB_H) / VB_W;
  // y of the allowance line inside the bottle row
  const scale = bw / VB_W;
  const lineY = (BODY_BOTTOM - BODY_H * Math.min(1, aFrac) + 18) * scale;

  return (
    <View style={{ width }}>
      <View style={{ height: bh, flexDirection: 'row' }}>
        {days.map((d, i) => {
          const over = allowanceCents > 0 && d.cents > allowanceCents;
          return (
            <Pressable
              key={d.key}
              accessibilityRole="button"
              accessibilityState={{ selected: i === selected }}
              accessibilityLabel={`${d.label}, ${d.value}`}
              onPress={() => {
                haptic.tap();
                onSelect(i);
              }}
              style={{ width: cw, alignItems: 'center', justifyContent: 'flex-end' }}
            >
              <View style={{ width: bw }}>
                <Bottle
                  i={i}
                  frac={d.cents / scaleMax}
                  over={over}
                  future={d.future}
                  selected={i === selected}
                  cid={`sb${i}`}
                  colors={{ ok: p.groups.chips.bg, over: p.groups.chilli.bg }}
                  glass={p.card}
                  ink={p.ink}
                />
              </View>
            </Pressable>
          );
        })}
        {allowanceCents > 0 ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: lineY, height: 0, borderTopWidth: 2, borderStyle: 'dashed', borderColor: p.ink, opacity: 0.55 }} />
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        {days.map((d, i) => {
          const on = i === selected;
          return (
            <View key={d.key} style={{ width: cw, alignItems: 'center', gap: 3 }}>
              <View style={{ minWidth: cw - 8, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? p.accent2 : 'transparent', borderWidth: on ? 2 : 0, borderColor: p.ink }}>
                <Txt v="label" size={10.5} color={on ? p.onAccent2 : d.today ? p.text : p.textDim} style={{ letterSpacing: 0.4 }}>
                  {d.label}
                </Txt>
              </View>
              <Txt v="small" size={11} faint={d.future} dim={!d.future} style={{ fontFamily: 'DMSans_700Bold' }}>
                {d.value}
              </Txt>
            </View>
          );
        })}
      </View>
    </View>
  );
}
