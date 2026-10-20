import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { fonts, useTheme } from '../theme';

export type Variant = 'hero' | 'display' | 'title' | 'heading' | 'body' | 'bodyBold' | 'small' | 'label' | 'num';

const V: Record<Variant, TextStyle> = {
  hero: { fontFamily: fonts.display, fontSize: 64, lineHeight: 66, letterSpacing: -2 },
  display: { fontFamily: fonts.display, fontSize: 38, lineHeight: 40, letterSpacing: -1 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 29, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.displayBold, fontSize: 19, lineHeight: 23, letterSpacing: -0.2 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  bodyBold: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: fonts.bodyMedium, fontSize: 13.5, lineHeight: 19 },
  label: { fontFamily: fonts.bodyBold, fontSize: 11.5, lineHeight: 14, letterSpacing: 1.1, textTransform: 'uppercase' },
  num: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.5 },
};

export interface TxtProps extends TextProps {
  v?: Variant;
  color?: string;
  dim?: boolean;
  faint?: boolean;
  align?: TextStyle['textAlign'];
  size?: number;
  glow?: boolean;
  style?: StyleProp<TextStyle>;
}

/** The one text component. Pulls colour and font from the theme so nothing is hard-coded in screens. */
export function Txt({ v = 'body', color, dim, faint, align, size, glow, style, ...rest }: TxtProps) {
  const p = useTheme();
  const base = V[v];
  const c = color ?? (faint ? p.textFaint : dim ? p.textDim : p.text);
  const shadow: TextStyle | null =
    p.glow && glow && (v === 'hero' || v === 'display' || v === 'title')
      ? { textShadowColor: c, textShadowRadius: 14, textShadowOffset: { width: 0, height: 0 } }
      : null;
  return (
    <Text
      {...rest}
      allowFontScaling={rest.allowFontScaling ?? true}
      maxFontSizeMultiplier={rest.maxFontSizeMultiplier ?? 1.3}
      style={[base, { color: c }, align ? { textAlign: align } : null, size ? { fontSize: size, lineHeight: Math.round(size * 1.1) } : null, shadow, style]}
    />
  );
}
