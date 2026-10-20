import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { useT } from '../i18n';
import { useStore } from '../store';
import { PALETTES, PaletteId, Palette, useTheme } from '../theme';
import { Glyph } from './Glyph';
import { Txt } from './Txt';
import { haptic } from './haptics';

type Choice = PaletteId | 'system';

function Mini({ pal }: { pal: Palette }) {
  return (
    <View style={{ height: 86, borderRadius: 14, backgroundColor: pal.bg, borderWidth: 2, borderColor: pal.ink, overflow: 'hidden', padding: 8, gap: 5 }}>
      <View style={{ height: 24, borderRadius: 9, backgroundColor: pal.weather.sunny.field, borderWidth: 2, borderColor: pal.ink }} />
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <View style={{ flex: 1, height: 14, borderRadius: 6, backgroundColor: pal.card, borderWidth: 1.5, borderColor: pal.ink }} />
        <View style={{ width: 22, height: 14, borderRadius: 6, backgroundColor: pal.groups.chilli.bg, borderWidth: 1.5, borderColor: pal.ink }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <View style={{ width: 22, height: 14, borderRadius: 6, backgroundColor: pal.groups.chips.bg, borderWidth: 1.5, borderColor: pal.ink }} />
        <View style={{ flex: 1, height: 14, borderRadius: 6, backgroundColor: pal.card, borderWidth: 1.5, borderColor: pal.ink }} />
      </View>
    </View>
  );
}

/** Garlic, BBQ, 3AM Kebab Shop, or follow the phone. Changing it re-themes the whole app on the spot. */
export function ThemePicker() {
  const p = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  const theme = useStore((s) => s.settings.theme) as Choice;
  const update = useStore((s) => s.updateSettings);
  const w = Math.floor((width - 36 - 12) / 2);
  const items: { id: Choice; name: string; tag: string; pal: Palette | null }[] = [
    { id: 'garlic', name: t('theme.garlic'), tag: t('theme.garlic.tag'), pal: PALETTES.garlic },
    { id: 'bbq', name: t('theme.bbq'), tag: t('theme.bbq.tag'), pal: PALETTES.bbq },
    { id: 'kebab', name: t('theme.kebab'), tag: t('theme.kebab.tag'), pal: PALETTES.kebab },
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
            <View style={{ position: 'absolute', left: 0, right: 0, top: 4, bottom: -4, borderRadius: 22, backgroundColor: p.ink }} />
            <View style={{ backgroundColor: p.card, borderRadius: 22, borderWidth: on ? 3.5 : 2.5, borderColor: on ? p.accent : p.ink, padding: 8, gap: 8 }}>
              {it.pal ? (
                <Mini pal={it.pal} />
              ) : (
                <View style={{ height: 86, flexDirection: 'row', borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: p.ink }}>
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
                <View style={{ position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 13, backgroundColor: p.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: p.ink }}>
                  <Glyph name="check" size={14} color={p.onAccent} stroke={3.2} />
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
