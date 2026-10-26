import React, { ReactNode, useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useT } from '../i18n';
import { Palette, radius, useTheme } from '../theme';
import { dent, groundShadow, lipOf, mix, puff, sheen } from './clay';
import { Glyph, GlyphName } from './Glyph';
import { Txt } from './Txt';
import { haptic } from './haptics';

// ---------------------------------------------------------------- Slab

/**
 * Soft 3D clay, the same material as the mascot. Not everything on a screen should be as puffy as everything else:
 * the one thing you came for is thick, supporting cards sit in the middle, small info panels are barely lifted.
 */
export type Weight = 'hero' | 'normal' | 'quiet';
export const WEIGHTS: Record<Weight, { depth: number }> = {
  hero: { depth: 8 },
  normal: { depth: 5 },
  quiet: { depth: 3 },
};

export interface SlabProps {
  children?: ReactNode;
  fill?: string;
  /** override the colour of the clay's underside */
  ink?: string;
  r?: number;
  weight?: Weight;
  depth?: number;
  /** a little highlight blob on top, for buttons */
  gloss?: boolean;
  style?: StyleProp<ViewStyle>;
  inner?: StyleProp<ViewStyle>;
}

/** The top edge catches the light, the bottom is shaded. Drawn over the children so nothing hides it. */
function Sheen({ r, fill, depth, gloss }: { r: number; fill: string; depth: number; gloss?: boolean }) {
  const p = useTheme();
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: r, boxShadow: sheen(p, fill, depth) }}>
      {gloss ? <View style={{ position: 'absolute', top: 5, left: Math.min(r * 0.7, 26), width: '24%', height: 5, borderRadius: 3, backgroundColor: p.dark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.62)' }} /> : null}
    </View>
  );
}

/** A lump of clay: a face sitting on a darker lip, with a soft shadow on the ground. */
export function Slab({ children, fill, ink, r = 22, weight = 'normal', depth = WEIGHTS[weight].depth, gloss, style, inner }: SlabProps) {
  const p = useTheme();
  const f = fill ?? p.card;
  return (
    <View style={[{ paddingBottom: depth }, style]}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: depth, bottom: 0, borderRadius: r, backgroundColor: ink ?? lipOf(p, f), boxShadow: groundShadow(p, depth, weight === 'quiet' ? 0.6 : 1) }} />
      <View style={[{ borderRadius: r, backgroundColor: f, overflow: 'hidden' }, inner]}>
        {children}
        <Sheen r={r} fill={f} depth={depth} gloss={gloss} />
      </View>
    </View>
  );
}

export interface PressSlabProps extends SlabProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  tone?: 'tap' | 'soft' | 'medium' | 'none';
  label?: string;
  hitSlop?: number;
}

/** A Slab that physically presses down into its lip. */
export function PressSlab({ children, fill, ink, r = 22, weight = 'normal', depth = WEIGHTS[weight].depth, gloss, style, inner, onPress, onLongPress, disabled, tone = 'soft', label, hitSlop }: PressSlabProps) {
  const p = useTheme();
  const f = fill ?? p.card;
  const down = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: down.value * (depth - 1) }],
  }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => {
        down.value = withTiming(1, { duration: 60 });
      }}
      onPressOut={() => {
        down.value = withSpring(0, { damping: 9, stiffness: 520, mass: 0.6 });
      }}
      onPress={() => {
        if (tone !== 'none') haptic[tone]();
        onPress?.();
      }}
      onLongPress={onLongPress}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
    >
      <View style={{ paddingBottom: depth }}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: depth, bottom: 0, borderRadius: r, backgroundColor: ink ?? lipOf(p, f), boxShadow: groundShadow(p, depth) }} />
        <Animated.View style={[{ borderRadius: r, backgroundColor: f, overflow: 'hidden' }, anim, inner]}>
          {children}
          <Sheen r={r} fill={f} depth={depth} gloss={gloss} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------- Button

export type BtnTone = 'primary' | 'yellow' | 'card' | 'dark' | 'danger';

function toneColors(p: Palette, tone: BtnTone) {
  switch (tone) {
    case 'primary':
      return { fill: p.accent, fg: p.onAccent };
    case 'yellow':
      return { fill: p.accent2, fg: p.onAccent2 };
    case 'danger':
      return { fill: p.bad, fg: p.onAccent };
    case 'dark':
      return p.dark ? { fill: p.text, fg: p.bg } : { fill: p.ink, fg: p.card };
    default:
      return { fill: p.card, fg: p.text };
  }
}

export interface BtnProps {
  label: string;
  onPress?: () => void;
  tone?: BtnTone;
  glyph?: GlyphName;
  size?: 'md' | 'lg' | 'sm';
  full?: boolean;
  /** tighter side padding, for several buttons in one row */
  compact?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Btn({ label, onPress, tone = 'primary', glyph, size = 'md', full, compact, disabled, style }: BtnProps) {
  const p = useTheme();
  const c = toneColors(p, tone);
  const h = size === 'lg' ? 62 : size === 'sm' ? 40 : 52;
  const fs = size === 'lg' ? 20 : size === 'sm' ? 14.5 : 17;
  return (
    <PressSlab fill={c.fill} r={h / 2.2} depth={size === 'sm' ? 4 : 6} gloss onPress={onPress} disabled={disabled} label={label} style={[full ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' }, style]} inner={{ height: h, paddingHorizontal: compact ? 8 : size === 'sm' ? 16 : 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
      {glyph ? <Glyph name={glyph} size={fs + 3} color={c.fg} /> : null}
      <Txt v="heading" color={c.fg} size={fs} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
        {label}
      </Txt>
    </PressSlab>
  );
}

// ---------------------------------------------------------------- Chip

export interface ChipProps {
  label: string;
  on?: boolean;
  onPress?: () => void;
  glyph?: GlyphName;
  color?: string;
  small?: boolean;
  right?: ReactNode;
}

export function Chip({ label, on, onPress, glyph, color, small, right }: ChipProps) {
  const p = useTheme();
  const fill = on ? color ?? p.accent2 : p.card;
  const fg = on ? (color ? p.ink : p.onAccent2) : p.text;
  return (
    <PressSlab fill={fill} r={999} depth={on ? 3 : 4} gloss={on} onPress={onPress} tone="tap" label={label} inner={{ paddingHorizontal: small ? 12 : 15, height: small ? 34 : 40, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {glyph ? <Glyph name={glyph} size={16} color={fg} stroke={2.6} /> : null}
      <Txt v="small" color={fg} style={{ fontFamily: 'DMSans_700Bold' }} numberOfLines={1}>
        {label}
      </Txt>
      {right}
    </PressSlab>
  );
}

// ---------------------------------------------------------------- Card

export function Card({ children, style, inner, fill, weight = 'normal', depth, r = 24 }: { children?: ReactNode; style?: StyleProp<ViewStyle>; inner?: StyleProp<ViewStyle>; fill?: string; weight?: Weight; depth?: number; r?: number }) {
  return (
    <Slab fill={fill} weight={weight} depth={depth ?? WEIGHTS[weight].depth} r={r} style={style} inner={[{ padding: 16 }, inner]}>
      {children}
    </Slab>
  );
}

// ---------------------------------------------------------------- Meter

/** A progress bar: a groove pressed into the surface with a glossy lump of clay filling it. */
export function Meter({ frac, fill, track, h = 16, min = 0.05, style, label }: { frac: number; fill: string; track?: string; h?: number; min?: number; style?: StyleProp<ViewStyle>; label?: string }) {
  const p = useTheme();
  const pct = frac <= 0 ? 0 : Math.max(min, Math.min(1, frac)) * 100;
  return (
    <View
      accessibilityRole={label ? 'progressbar' : undefined}
      accessibilityLabel={label}
      accessibilityValue={label ? { min: 0, max: 100, now: Math.round(Math.min(1, Math.max(0, frac)) * 100) } : undefined}
      style={[{ height: h, borderRadius: h / 2, backgroundColor: track ?? p.card2, overflow: 'hidden', ...dent(p) }, style]}
    >
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: h / 2, backgroundColor: fill, boxShadow: sheen(p, fill, Math.max(2, Math.round(h / 8))) }} />
    </View>
  );
}

// ---------------------------------------------------------------- Toggle

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  const p = useTheme();
  const t = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    t.value = withSpring(value ? 1 : 0, { damping: 14, stiffness: 380 });
  }, [value]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(t.value, [0, 1], [mix(p.card2, p.dark ? '#000000' : '#8A4A12', 0.1), p.good]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: 4 + t.value * 22 }] }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => {
        haptic.tap();
        onChange(!value);
      }}
      hitSlop={8}
    >
      <Animated.View style={[{ width: 56, height: 34, borderRadius: 17, justifyContent: 'center', ...dent(p, 1.2) }, track]}>
        <Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: p.dark ? '#F4E9D8' : '#FFFFFF', ...puff(p, p.dark ? '#F4E9D8' : '#FFFFFF', 3) }, knob]} />
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------- Segmented

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  const p = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: p.card2, borderRadius: 20, padding: 4, gap: 4, ...dent(p) }}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            accessibilityState={{ selected: on }}
            onPress={() => {
              haptic.tap();
              onChange(o.id);
            }}
            style={{ flex: 1, height: 38, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? p.accent2 : 'transparent', ...(on ? puff(p, p.accent2, 3) : null) }}
          >
            <Txt v="small" color={on ? p.onAccent2 : p.textDim} style={{ fontFamily: 'DMSans_700Bold' }}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------- Screen + header

export function Screen({ children, bg, noInsets }: { children: ReactNode; bg?: string; noInsets?: boolean }) {
  const p = useTheme();
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: bg ?? p.bg, paddingTop: noInsets ? 0 : ins.top }}>
      <StatusBar style={p.statusBar} />
      {children}
    </View>
  );
}

export function RoundBtn({ glyph, onPress, label, fill, size = 44, color }: { glyph: GlyphName; onPress: () => void; label: string; fill?: string; size?: number; color?: string }) {
  const p = useTheme();
  return (
    <PressSlab fill={fill ?? p.card} r={size / 2} depth={4} gloss onPress={onPress} label={label} tone="tap" inner={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Glyph name={glyph} size={size * 0.46} color={color ?? p.text} />
    </PressSlab>
  );
}

export function Header({ title, onBack, right, glyph = 'back', sub }: { title?: string; onBack?: () => void; right?: ReactNode; glyph?: GlyphName; sub?: string }) {
  const t = useT();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {onBack ? <RoundBtn glyph={glyph} onPress={onBack} label={glyph === 'close' ? t('common.close') : t('common.back')} /> : null}
      <View style={{ flex: 1 }}>
        {title ? (
          <Txt v="title" numberOfLines={1}>
            {title}
          </Txt>
        ) : null}
        {sub ? (
          <Txt v="small" dim numberOfLines={2}>
            {sub}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10, paddingHorizontal: 4 }}>
      <Txt v="label" dim>
        {children}
      </Txt>
      {right}
    </View>
  );
}

export function Divider() {
  const p = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: p.line }} />;
}

/** A tappable settings-style row. */
export function Row({ title, sub, glyph, right, onPress, danger, tint }: { title: string; sub?: string; glyph?: GlyphName; right?: ReactNode; onPress?: () => void; danger?: boolean; tint?: string }) {
  const p = useTheme();
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, minHeight: 56 }}>
      {glyph ? (
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: tint ?? p.card2, alignItems: 'center', justifyContent: 'center', ...puff(p, tint ?? p.card2, 3) }}>
          <Glyph name={glyph} size={18} color={danger ? p.bad : tint ? p.ink : p.text} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Txt v="bodyBold" color={danger ? p.bad : undefined} numberOfLines={2}>
          {title}
        </Txt>
        {sub ? (
          <Txt v="small" dim numberOfLines={3}>
            {sub}
          </Txt>
        ) : null}
      </View>
      {right ?? (onPress ? <Glyph name="right" size={18} color={p.textFaint} /> : null)}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => ({ backgroundColor: pressed ? p.card2 : 'transparent' })}
    >
      {body}
    </Pressable>
  );
}

/** Rows grouped in one sticker card with hairlines between. */
export function Group({ children }: { children: ReactNode }) {
  const p = useTheme();
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <Slab depth={5} r={24}>
      {kids.map((k, i) => (
        <View key={i}>
          {i > 0 ? <View style={{ height: 1.5, backgroundColor: p.line, marginLeft: 14 }} /> : null}
          {k}
        </View>
      ))}
    </Slab>
  );
}

export { radius };

// ---------------------------------------------------------------- Field

import { TextInput, TextInputProps } from 'react-native';

export function Field({ value, onChangeText, placeholder, glyph, style, inputStyle, ...rest }: TextInputProps & { glyph?: GlyphName; style?: StyleProp<ViewStyle>; inputStyle?: StyleProp<import('react-native').TextStyle> }) {
  const p = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: p.dark ? p.card2 : p.card, borderRadius: 20, paddingHorizontal: 14, minHeight: 52, ...dent(p) }, style]}>
      {glyph ? <Glyph name={glyph} size={18} color={p.textFaint} /> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={p.textFaint}
        selectionColor={p.accent}
        maxFontSizeMultiplier={1.3}
        style={[{ flex: 1, fontFamily: 'DMSans_500Medium', fontSize: 16, color: p.text, paddingVertical: 10, outlineStyle: 'none' } as never, inputStyle]}
        {...rest}
      />
    </View>
  );
}
