import React from 'react';
import { View } from 'react-native';
import { Mood } from '../art/mascot';
import { useTheme } from '../theme';
import { Brokey } from './Brokey';
import { Txt } from './Txt';
import { Slab } from './kit';

export const ROAST_CARD_W = 360;
export const ROAST_CARD_H = 450;

/** The picture people post: the amount, Brokey in his mood, and what he said. Fixed size, so it looks the same on every phone. */
export const RoastCard = React.forwardRef<View, { field: string; mood: Mood; friesLeft: number; amountLabel: string; moneyLabel: string; roast: string }>(function RoastCard(
  { field, mood, friesLeft, amountLabel, moneyLabel, roast },
  ref,
) {
  const p = useTheme();
  return (
    <View ref={ref} collapsable={false} style={{ width: ROAST_CARD_W, height: ROAST_CARD_H, backgroundColor: field, alignItems: 'center', paddingTop: 22, paddingHorizontal: 22 }}>
      <View style={{ backgroundColor: p.ink, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Txt v="title" color="#FFF6E6">
          {amountLabel}
        </Txt>
        <Txt v="small" color="#E5C3A6" style={{ fontFamily: 'DMSans_700Bold' }}>
          {moneyLabel}
        </Txt>
      </View>
      <View style={{ marginTop: 6 }}>
        <Brokey mood={mood} width={212} still friesLeft={friesLeft} />
      </View>
      <Slab weight="hero" r={24} fill={p.card} style={{ alignSelf: 'stretch', marginTop: 8 }} inner={{ padding: 16, justifyContent: 'center' }}>
        <Txt v="heading" size={19} style={{ lineHeight: 25 }} align="center">
          {roast}
        </Txt>
      </Slab>
      <Txt v="small" color={p.ink} style={{ fontFamily: 'DMSans_700Bold', opacity: 0.55, marginTop: 12, letterSpacing: 1 }}>
        brokey
      </Txt>
    </View>
  );
});
