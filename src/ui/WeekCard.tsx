import React from 'react';
import { View } from 'react-native';
import { Mood } from '../art/mascot';
import { useTheme } from '../theme';
import { Brokey } from './Brokey';
import { Txt } from './Txt';
import { puff } from './clay';

export interface WeekCardModel {
  kicker: string;
  range: string;
  big: string;
  unit: string;
  money: string;
  chip: string;
  chipOver: boolean;
  verdict: string;
  stats: { label: string; value: string }[];
  mood: Mood;
  friesLeft: number;
  field: string;
  blob: string;
  text: string;
  textDim: string;
}

/** Card designed on a 360 x 640 canvas (9:16, story size). Everything scales with `width`, so the same card is the preview and the exported picture. */
export const WEEK_CARD_RATIO = 16 / 9;

/** Longer words get a smaller size so a stat tile never cuts a word in half. */
const statSize = (v: string) => (v.length <= 7 ? 18 : v.length <= 10 ? 14 : 12);

export function WeekCard({ model, width }: { model: WeekCardModel; width: number }) {
  const p = useTheme();
  const k = width / 360;
  const s = (n: number) => Math.round(n * k * 100) / 100;
  const chipBg = model.chipOver ? p.groups.chilli.bg : p.groups.chips.bg;
  const chipFg = model.chipOver ? '#FFFFFF' : '#2B1608';
  const fixed = { allowFontScaling: false } as const;
  return (
    <View style={{ width, height: width * WEEK_CARD_RATIO, backgroundColor: model.field, overflow: 'hidden', paddingHorizontal: s(22), paddingTop: s(26), paddingBottom: s(22) }}>
      {/* soft blobs behind everything */}
      <View style={{ position: 'absolute', right: s(-70), top: s(60), width: s(240), height: s(240), borderRadius: s(120), backgroundColor: model.blob, opacity: 0.55 }} />
      <View style={{ position: 'absolute', left: s(-60), top: s(330), width: s(170), height: s(170), borderRadius: s(85), backgroundColor: model.blob, opacity: 0.4 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt v="heading" color={model.text} size={s(20)} style={{ letterSpacing: s(1.5) }} {...fixed}>
          BROKEY
        </Txt>
        <View style={{ borderRadius: 999, backgroundColor: p.card, paddingHorizontal: s(12), height: s(28), justifyContent: 'center', ...puff(p, p.card, 3) }}>
          <Txt v="small" size={s(12)} color={p.text} style={{ fontFamily: 'DMSans_700Bold' }} {...fixed}>
            {model.range}
          </Txt>
        </View>
      </View>

      <View style={{ alignItems: 'center', marginTop: s(6) }}>
        <Brokey mood={model.mood} width={s(214)} still friesLeft={model.friesLeft} />
      </View>

      <View style={{ alignItems: 'center', marginTop: s(2) }}>
        <Txt v="label" color={model.textDim} size={s(12)} {...fixed}>
          {model.kicker}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: s(8), marginTop: s(2) }}>
          <Txt v="hero" size={s(84)} color={model.text} numberOfLines={1} adjustsFontSizeToFit {...fixed}>
            {model.big}
          </Txt>
          <Txt v="title" size={s(28)} color={model.text} {...fixed}>
            {model.unit}
          </Txt>
        </View>
        <Txt v="small" size={s(14)} color={model.textDim} style={{ fontFamily: 'DMSans_700Bold', marginTop: s(2) }} {...fixed}>
          {model.money}
        </Txt>
        <View style={{ marginTop: s(10), backgroundColor: chipBg, borderRadius: 999, paddingHorizontal: s(14), height: s(30), justifyContent: 'center', ...puff(p, chipBg, 3) }}>
          <Txt v="small" size={s(14)} color={chipFg} style={{ fontFamily: 'DMSans_700Bold' }} {...fixed}>
            {model.chip}
          </Txt>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ backgroundColor: p.card, borderRadius: s(18), padding: s(14), ...puff(p, p.card, 3) }}>
        <Txt v="bodyBold" size={s(15)} color={p.text} numberOfLines={3} {...fixed}>
          {model.verdict}
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: s(8), marginTop: s(10) }}>
        {model.stats.map((st) => (
          <View key={st.label} style={{ flex: 1, backgroundColor: p.card2, borderRadius: s(14), paddingVertical: s(9), paddingHorizontal: s(8), ...puff(p, p.card2, 3) }}>
            <Txt v="label" size={s(9)} color={p.textDim} numberOfLines={1} style={{ letterSpacing: s(0.3) }} {...fixed}>
              {st.label}
            </Txt>
            <Txt v="num" size={s(statSize(st.value))} color={p.text} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ marginTop: s(3) }} {...fixed}>
              {st.value}
            </Txt>
          </View>
        ))}
      </View>
    </View>
  );
}
