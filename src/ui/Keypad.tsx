import React from 'react';
import { View } from 'react-native';
import { pressKey } from '../core/keypad';
import { useTheme } from '../theme';
import { Glyph } from './Glyph';
import { Txt } from './Txt';
import { PressSlab } from './kit';
import { haptic } from './haptics';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'x', '0', 'del'] as const;

export function Keypad({ value, onChange, zeroDecimal, keyH = 54 }: { value: string; onChange: (v: string) => void; zeroDecimal?: boolean; keyH?: number }) {
  const p = useTheme();
  const zd = !!zeroDecimal;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
      {KEYS.map((k) => {
        const key = k === 'x' ? (zd ? '000' : '.') : k;
        return (
          <PressSlab
            key={k}
            fill={k === 'del' ? p.card2 : p.card}
            r={18}
            depth={3}
           
            tone="tap"
            label={key === 'del' ? 'Delete' : key}
            onPress={() => onChange(pressKey(value, key, zd))}
            onLongPress={k === 'del' ? () => { haptic.medium(); onChange(''); } : undefined}
            style={{ width: '31%' }}
            inner={{ height: keyH, alignItems: 'center', justifyContent: 'center' }}
          >
            {k === 'del' ? <Glyph name="back" size={24} color={p.text} /> : (
              <Txt v="title" size={k === 'x' && zd ? 20 : 26}>
                {k === 'x' ? (zd ? '000' : '.') : k}
              </Txt>
            )}
          </PressSlab>
        );
      })}
    </View>
  );
}
