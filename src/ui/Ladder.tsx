import React from 'react';
import { View } from 'react-native';
import { RungId, ladderState } from '../core';
import { useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Glyph } from './Glyph';
import { Txt } from './Txt';
import { Card } from './kit';
import { useFmt } from './useFmt';

/** The four rungs, with how far you are to the next one. Fed by what you walked away from in the fridge. */
export function Ladder({ savedCents }: { savedCents: number }) {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const priceCents = useStore((s) => s.settings.unit.priceCents);
  const st = ladderState(savedCents, priceCents);
  const name = (id: RungId) => t(`sticker.ladder-${id}.title` as never);
  return (
    <Card weight="quiet" inner={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <Txt v="heading">{t('ladder.title')}</Txt>
        {st.next ? (
          <Txt v="small" dim numberOfLines={1} style={{ flexShrink: 1 }}>
            {t('ladder.toGo', { amount: f.sum(st.toGoCents) })}
          </Txt>
        ) : null}
      </View>
      <View>
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(st.progress * 100) }} style={{ height: 16, borderRadius: 8, borderWidth: 2.5, borderColor: p.ink, backgroundColor: p.card2, overflow: 'hidden' }}>
          <View style={{ width: `${Math.max(st.progress > 0 ? 4 : 0, st.progress * 100)}%`, height: '100%', backgroundColor: p.accent2, borderRightWidth: st.progress > 0 && st.progress < 1 ? 2.5 : 0, borderColor: p.ink }} />
        </View>
        <Txt v="small" dim style={{ marginTop: 6 }}>
          {st.next ? `${t('ladder.next', { name: name(st.next.id) })} · ${t('ladder.of', { saved: f.sum(Math.min(savedCents, st.next.cents)), target: f.sum(st.next.cents) })}` : t('ladder.top')}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {st.rungs.map((r) => (
          <View key={r.id} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                borderWidth: 2.5,
                borderColor: p.ink,
                backgroundColor: r.reached ? p.accent2 : p.card2,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: r.reached ? 1 : 0.6,
              }}
            >
              {r.reached ? <Glyph name="check" size={15} color={p.onAccent2} /> : null}
            </View>
            <Txt v="small" size={10.5} align="center" numberOfLines={2} color={r.reached ? p.text : p.textFaint} style={{ fontFamily: 'DMSans_700Bold' }}>
              {name(r.id)}
            </Txt>
            <Txt v="small" size={10} align="center" faint>
              {r.units}
            </Txt>
          </View>
        ))}
      </View>
    </Card>
  );
}
