import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { useT } from '../i18n';
import { useStore } from '../store';
import { PALETTES, PALETTE_IDS, PaletteId, Palette, useTheme } from '../theme';
import { Glyph } from './Glyph';
import { Txt } from './Txt';
import { Slab } from './kit';
import { haptic } from './haptics';
import { dent, mix, puff } from './clay';

type Choice = PaletteId | 'system';

function Mini({ pal }: { pal: Palette }) {
  return (
    <View style={{ height: 86, borderRadius: 14, backgroundColor: pal.bg, overflow: 'hidden', padding: 8, gap: 5, ...puff(pal, pal.bg, 2) }}>
      <View style={{ height: 24, borderRadius: 9, backgroundColor: pal.weather.sunny.field, ...puff(pal, pal.weather.sunny.field, 2) }} />
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <View style={{ flex: 1, height: 14, borderRadius: 6, backgroundColor: pal.card, ...puff(pal, pal.card, 2) }} />
        <View style={{ width: 22, height: 14, borderRadius: 6, backgroundColor: pal.groups.chilli.bg, ...puff(pal, pal.groups.chilli.bg, 2) }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <View style={{ width: 22, height: 14, borderRadius: 6, backgroundColor: pal.groups.chips.bg, ...puff(pal, pal.groups.chips.bg, 2) }} />
        <View style={{ flex: 1, height: 14, borderRadius: 6, backgroundColor: pal.card, ...puff(pal, pal.card, 2) }} />
      </View>
    </View>
  );
}

/** Every sauce theme, or follow the phone. Changing it re-themes the whole app on the spot. */
export function ThemePicker() {
  const p = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  const theme = useStore((s) => s.settings.theme) as Choice;
  const update = useStore((s) => s.updateSettings);
  const w = Math.floor((width - 36 - 12) / 2);
  const items: { id: Choice; name: string; tag: string; pal: Palette | null }[] = [
    ...PALETTE_IDS.map((id) => ({ id: id as Choice, name: t(`theme.${id}` as never), tag: t(`theme.${id}.tag` as never), pal: PALETTES[id] as Palette | null })),
    { id: 'system', name: t('theme.system'), tag: t('theme.system.tag'), pal: null },
  ];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {items.map((it) => {
        const on = theme === it.id;
        return (
          <Pressable
            key={it.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={it.name}
            onPress={() => {
              haptic.tap();
              update({ theme: it.id });
            }}
            style={{ width: w }}
          >
            <Slab r={24} depth={5} fill={on ? mix(p.card, p.accent, 0.14) : p.card} ink={on ? p.accentDeep : undefined} style={{ flex: 1 }} inner={{ flex: 1, padding: 8, gap: 8 }}>
              {it.pal ? (
                <Mini pal={it.pal} />
              ) : (
                <View style={{ height: 86, flexDirection: 'row', borderRadius: 16, overflow: 'hidden', ...dent(p, 0.8) }}>
                  <View style={{ flex: 1, backgroundColor: PALETTES.garlic.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Glyph name="home" size={22} color={PALETTES.garlic.text} />
                  </View>
                  <View style={{ flex: 1, backgroundColor: PALETTES.kebab.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Glyph name="moon" size={22} color={PALETTES.kebab.text} />
                  </View>
                </View>
              )}
              <View style={{ paddingHorizontal: 4, paddingBottom: 2 }}>
                <Txt v="bodyBold" style={{ fontSize: 15 }} numberOfLines={1}>
                  {it.name}
                </Txt>
                <Txt v="small" faint numberOfLines={2} style={{ fontSize: 11.5, lineHeight: 15 }}>
                  {it.tag}
                </Txt>
              </View>
              {on ? (
                <View style={{ position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 13, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center', ...puff(p, p.accent, 2) }}>
                  <Glyph name="check" size={14} color={p.onAccent} stroke={3.2} />
                </View>
              ) : null}
            </Slab>
          </Pressable>
        );
      })}
    </View>
  );
}
