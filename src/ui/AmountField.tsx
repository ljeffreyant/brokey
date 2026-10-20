import React, { useEffect, useState } from 'react';
import { StyleProp, TextInput, View, ViewStyle } from 'react-native';
import { parseAmountToCents } from '../core';
import { fonts, useTheme } from '../theme';
import { Txt } from './Txt';

/** A money input. Shows what you type, hands back cents. */
export function AmountField({
  cents,
  onChange,
  symbol,
  placeholder,
  style,
  label,
  allowEmpty,
}: {
  cents: number | null;
  onChange: (cents: number | null) => void;
  symbol?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  label: string;
  allowEmpty?: boolean;
}) {
  const p = useTheme();
  const [text, setText] = useState(cents && cents > 0 ? String(cents / 100) : '');
  // keep in sync when the value is changed from outside (for example switching wallets)
  useEffect(() => {
    const cur = parseAmountToCents(text.replace(',', '.')) ?? 0;
    if ((cents ?? 0) !== cur) setText(cents && cents > 0 ? String(cents / 100) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cents]);
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: p.card, borderRadius: 18, borderWidth: 2.5, borderColor: p.ink, paddingHorizontal: 14, minHeight: 50 }, style]}>
      {symbol ? (
        <Txt v="bodyBold" dim>
          {symbol}
        </Txt>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        value={text}
        onChangeText={(v) => {
          const clean = v.replace(/[^0-9.,]/g, '');
          setText(clean);
          const c = parseAmountToCents(clean.replace(',', '.'));
          onChange(c === null || clean === '' ? (allowEmpty ? null : 0) : c);
        }}
        placeholder={placeholder}
        placeholderTextColor={p.textFaint}
        keyboardType="decimal-pad"
        inputMode="decimal"
        style={{ flex: 1, fontFamily: fonts.bodyMedium, fontSize: 17, color: p.text, paddingVertical: 10, outlineStyle: 'none' } as never}
      />
    </View>
  );
}
