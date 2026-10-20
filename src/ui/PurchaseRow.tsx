import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Purchase, categoryMeta } from '../core';
import { catLabel, useT } from '../i18n';
import { useTheme } from '../theme';
import { IconDisc } from './CatIcon';
import { Txt } from './Txt';
import { haptic } from './haptics';
import { formatClock, useFmt } from './useFmt';

export const PurchaseRow = memo(function PurchaseRow({ p, onPress, showRoast }: { p: Purchase; onPress?: () => void; showRoast?: boolean }) {
  const th = useTheme();
  const t = useT();
  const f = useFmt();
  const meta = categoryMeta(p.category);
  const g = th.groups[meta.group];
  const title = p.merchant || catLabel(t, meta);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} ${f.money(p.amountCents)}`}
      onPress={() => {
        haptic.tap();
        onPress?.();
      }}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: pressed ? th.card2 : 'transparent' })}
    >
      <IconDisc id={meta.icon} size={48} color={g.bg} ring />
      <View style={{ flex: 1 }}>
        <Txt v="bodyBold" numberOfLines={1}>
          {title}
        </Txt>
        <Txt v="small" dim numberOfLines={1}>
          {p.merchant ? `${catLabel(t, meta)} · ` : ''}
          {formatClock(p.ts, f.lang)}
        </Txt>
        {showRoast && p.roast ? (
          <Txt v="small" faint numberOfLines={2} style={{ marginTop: 2 }}>
            {p.roast}
          </Txt>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Txt v="num" size={19}>
          {f.hspNum(p.amountCents)}
        </Txt>
        <Txt v="small" dim>
          {f.money(p.amountCents)}
        </Txt>
      </View>
    </Pressable>
  );
});

