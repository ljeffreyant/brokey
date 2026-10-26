import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { RoastLevel, sampleRoast } from '../core';
import { useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Glyph } from './Glyph';
import { Sheet } from './Sheet';
import { Txt } from './Txt';
import { Btn, Slab } from './kit';
import { haptic } from './haptics';
import { useFmt } from './useFmt';
import { mix, puff } from './clay';

const LEVELS: RoastLevel[] = ['mild', 'medium', 'unhinged'];

/** Three cards with a sample line each. Unhinged asks for an 18+ confirmation the first time. */
export function RoastPicker({ value, onChange }: { value: RoastLevel; onChange: (l: RoastLevel) => void }) {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const [gate, setGate] = useState(false);

  const samples = useMemo(
    () => Object.fromEntries(LEVELS.map((l) => [l, sampleRoast(l, false, f.unit, settings.language, f.fmt)])) as Record<RoastLevel, string>,
    [f.unit, settings.language, f.fmt],
  );

  const pick = (l: RoastLevel) => {
    haptic.tap();
    if (l === 'unhinged' && !settings.adultConfirmed) {
      setGate(true);
      return;
    }
    onChange(l);
  };

  return (
    <View style={{ gap: 12 }}>
      {LEVELS.map((l) => {
        const on = value === l;
        return (
          <Pressable key={l} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={t(`ob.roast.${l}` as never)} onPress={() => pick(l)}>
            <Slab r={24} depth={5} fill={on ? mix(p.card, p.accent, 0.14) : p.card} ink={on ? p.accentDeep : undefined} inner={{ padding: 14, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: l === 'mild' ? p.groups.chips.bg : l === 'medium' ? p.groups.meat.bg : p.groups.chilli.bg, alignItems: 'center', justifyContent: 'center', ...puff(p, l === 'mild' ? p.groups.chips.bg : l === 'medium' ? p.groups.meat.bg : p.groups.chilli.bg, 3) }}>
                  <Glyph name={l === 'mild' ? 'smile' : l === 'medium' ? 'eye' : 'flame'} size={18} color={l === 'mild' ? '#24120A' : '#FFF6E6'} stroke={2.4} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt v="heading">{t(`ob.roast.${l}` as never)}</Txt>
                  <Txt v="small" dim>
                    {t(`ob.roast.${l}.sub` as never)}
                  </Txt>
                </View>
                {on ? (
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center', ...puff(p, p.accent, 2) }}>
                    <Glyph name="check" size={15} color={p.onAccent} stroke={3.2} />
                  </View>
                ) : null}
              </View>
              <View style={{ backgroundColor: p.card2, borderRadius: 14, padding: 10 }}>
                <Txt v="small" style={{ fontSize: 13.5, lineHeight: 19 }}>
                  {samples[l]}
                </Txt>
              </View>
            </Slab>
          </Pressable>
        );
      })}
      <Sheet visible={gate} onClose={() => setGate(false)} title={t('ob.roast.gateTitle')}>
        <View style={{ gap: 14, paddingBottom: 8 }}>
          <Txt v="body" dim>
            {t('ob.roast.gateBody')}
          </Txt>
          <Btn
            label={t('ob.roast.gateYes')}
            tone="danger"
            full
            onPress={() => {
              haptic.warn();
              update({ adultConfirmed: true });
              onChange('unhinged');
              setGate(false);
            }}
          />
          <Btn label={t('ob.roast.gateNo')} tone="card" full onPress={() => setGate(false)} />
        </View>
      </Sheet>
    </View>
  );
}
