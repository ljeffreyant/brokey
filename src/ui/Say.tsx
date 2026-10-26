import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Txt } from './Txt';
import { lipOf, puff } from './clay';

/** A speech bubble with a little tail pointing back at the mascot. */
export function Say({ children, style, text }: { children?: ReactNode; text?: string; style?: StyleProp<ViewStyle> }) {
  const p = useTheme();
  return (
    <View style={[{ flex: 1 }, style]}>
      <View style={{ backgroundColor: p.card, borderRadius: 20, padding: 13, ...puff(p, p.card, 3) }}>
        {text ? (
          <Txt v="bodyBold" style={{ fontSize: 15, lineHeight: 21 }}>
            {text}
          </Txt>
        ) : (
          children
        )}
      </View>
      <View
        style={{
          position: 'absolute',
          left: -8,
          top: '50%',
          marginTop: -7,
          width: 14,
          height: 14,
          backgroundColor: p.card,
          borderRadius: 4,
          boxShadow: `-2px 3px 0 ${lipOf(p, p.card)}`,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}
