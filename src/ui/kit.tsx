import React, { ReactNode, useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useT } from '../i18n';
import { Palette, radius, useTheme } from '../theme';
import { Glyph, GlyphName } from './Glyph';
import { Txt } from './Txt';
import { haptic } from './haptics';

// ---------------------------------------------------------------- Slab

/**
 * Not everything on a screen should shout. The one thing you came for gets a thick outline and a deep shadow,
 * supporting cards sit in the middle, and small info panels are a thin line with a whisper of shadow.
 */
export type Weight = 'hero' | 'normal' | 'quiet';
export const WEIGHTS: Record<Weight, { border: number; depth: number }> = {
  hero: { border: 3.5, depth: 6 },
  normal: { border: 2.5, depth: 4 },
  quiet: { border: 1.75, depth: 2 },
};

export interface SlabProps {
  children?: ReactNode;
  fill?: string;
  ink?: string;
  r?: number;
  weight?: Weight;
  depth?: number;
  border?: number;
  style?: StyleProp<ViewStyle>;
  inner?: StyleProp<ViewStyle>;
}

/** A sticker: ink outline plus a hard offset shadow, the look of the whole app. */
export function Slab({ children, fill, ink, r = 22, weight = 'normal', depth = WEIGHTS[weight].depth, border = WEIGHTS[weight].border, style, inner }: SlabProps) {
  const p = useTheme();
  const i = ink ?? p.ink;
  return (
    <View style={[{ paddingBottom: depth }, style]}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: depth, bottom: 0, borderRadius: r, backgroundColor: i }} />
      <View style={[{ borderRadius: r, backgroundColor: fill ?? p.card, borderWidth: border, borderColor: i, overflow: 'hidden' }, inner]}>{children}</View>
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

/** A Slab that physically presses down. */
export function PressSlab({ children, fill, ink, r = 22, weight = 'normal', depth = WEIGHTS[weight].depth, border = WEIGHTS[weight].border, style, inner, onPress, onLongPress, disabled, tone = 'soft', label, hitSlop }: PressSlabProps) {
  const p = useTheme();
  const i = ink ?? p.ink;
  const down = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: down.value * depth }],
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
        down.value = withSpring(0, { damping: 11, stiffness: 520, mass: 0.6 });
      }}
      onPress={() => {
        if (tone !== 'none') haptic[tone]();
        onPress?.();
      }}
      onLongPress={onLongPress}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
    >
      <View style={{ paddingBottom: depth }}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: depth, bottom: 0, borderRadius: r, backgroundColor: i }} />
        <Animated.View style={[{ borderRadius: r, backgroundColor: fill ?? p.card, borderWidth: border, borderColor: i, overflow: 'hidden' }, anim, inner]}>{children}</Animated.View>
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
    <PressSlab fill={c.fill} r={h / 2.4} depth={size === 'sm' ? 3 : 5} onPress={onPress} disabled={disabled} label={label} style={[full ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' }, style]} inner={{ height: h, paddingHorizontal: compact ? 8 : size === 'sm' ? 16 : 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
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
    <PressSlab fill={fill} r={999} depth={on ? 2 : 3} border={2} onPress={onPress} tone="tap" label={label} inner={{ paddingHorizontal: small ? 12 : 15, height: small ? 34 : 40, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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

// ---------------------------------------------------------------- Toggle

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  const p = useTheme();
  const t = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    t.value = withSpring(value ? 1 : 0, { damping: 14, stiffness: 380 });
  }, [value]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(t.value, [0, 1], [p.card2, p.good]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: 3 + t.value * 22 }] }));
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
      <Animated.View style={[{ width: 54, height: 32, borderRadius: 16, borderWidth: 2.5, borderColor: p.ink, justifyContent: 'center' }, track]}>
        <Animated.View style={[{ width: 22, height: 22, borderRadius: 11, backgroundColor: p.card, borderWidth: 2.5, borderColor: p.ink }, knob]} />
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------- Segmented

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  const p = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: p.card2, borderRadius: 18, padding: 4, borderWidth: 2.5, borderColor: p.ink, gap: 4 }}>
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
            style={{ flex: 1, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? p.accent2 : 'transparent', borderWidth: on ? 2 : 0, borderColor: p.ink }}
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
    <PressSlab fill={fill ?? p.card} r={size / 2} depth={3} border={2.5} onPress={onPress} label={label} tone="tap" inner={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
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
        <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: tint ?? p.card2, borderWidth: 2, borderColor: p.ink, alignItems: 'center', justifyContent: 'center' }}>
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
    <Slab depth={4} r={22}>
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
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: p.card, borderRadius: 18, borderWidth: 2.5, borderColor: p.ink, paddingHorizontal: 14, minHeight: 50 }, style]}>
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
