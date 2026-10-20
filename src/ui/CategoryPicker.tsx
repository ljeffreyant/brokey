import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { searchIcons } from '../art/icons';
import { CategoryMeta, GROUPS, GroupId, allCategories, categoriesIn, categoryMeta } from '../core';
import { catLabel, groupBlurb, groupLabel, useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { CatIcon } from './CatIcon';
import { Glyph } from './Glyph';
import { Sheet } from './Sheet';
import { Txt } from './Txt';
import { Btn, Chip, Field, PressSlab } from './kit';
import { haptic } from './haptics';

const GROUP_ICON: Record<GroupId, string> = { chips: 'chips', meat: 'hsp', garlic: 'cocktail', chilli: 'tee', bbq: 'house' };

function Cell({ meta, on, w, onPress }: { meta: CategoryMeta; on: boolean; w: number; onPress: () => void }) {
  const p = useTheme();
  const t = useT();
  const g = p.groups[meta.group];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={catLabel(t, meta)}
      onPress={() => {
        haptic.soft();
        onPress();
      }}
      style={{ width: w, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2 }}
    >
      <View
        style={{
          width: w - 14,
          height: w - 14,
          borderRadius: 24,
          backgroundColor: on ? g.bg : p.card,
          borderWidth: 2.5,
          borderColor: p.ink,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: on ? 1.06 : 1 }, { rotate: on ? '-3deg' : '0deg' }],
        }}
      >
        <CatIcon id={meta.icon} size={(w - 14) * 0.72} />
      </View>
      <Txt v="small" align="center" numberOfLines={2} style={{ marginTop: 6, fontFamily: 'DMSans_700Bold', fontSize: 12, lineHeight: 15 }} color={on ? p.text : p.textDim}>
        {catLabel(t, meta)}
      </Txt>
    </Pressable>
  );
}

export interface CategoryPickerProps {
  value?: string;
  onPick: (id: string) => void;
  /** bottom padding so the last row clears whatever floats over it */
  bottomPad?: number;
}

/** Group tabs (Treats / Food / Going out / Shopping / Basics) over a grid of cartoon category icons. */
export function CategoryPicker({ value, onPick, bottomPad = 20 }: CategoryPickerProps) {
  const p = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  const hidden = useStore((s) => s.hiddenCats);
  const purchases = useStore((s) => s.purchases);
  const custom = useStore((s) => s.customCats);
  const [group, setGroup] = useState<GroupId>(value ? categoryMeta(value).group : 'meat');
  const [creating, setCreating] = useState(false);
  const cols = 4;
  const w = Math.floor((width - 36) / cols);

  const usuals = useMemo(() => {
    const n = new Map<string, number>();
    for (const x of purchases) n.set(x.category, (n.get(x.category) ?? 0) + 1);
    return [...n.entries()]
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => categoryMeta(id))
      .filter((m) => !hidden.includes(m.id));
  }, [purchases, hidden]);

  const list = useMemo(() => categoriesIn(group, hidden), [group, hidden, custom]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 18, paddingBottom: 6 }}>
        {GROUPS.map((gr) => {
          const on = gr.id === group;
          const c = p.groups[gr.id];
          return (
            <PressSlab
              key={gr.id}
              fill={on ? c.bg : p.card}
              r={20}
              depth={on ? 1 : 3}
              border={2.5}
              tone="tap"
              label={groupLabel(t, gr.id)}
              onPress={() => setGroup(gr.id)}
              style={{ flex: 1 }}
              inner={{ paddingVertical: 8, alignItems: 'center', gap: 2 }}
            >
              <CatIcon id={GROUP_ICON[gr.id]} size={30} />
              <Txt v="label" size={10} color={on ? c.fg : p.textDim} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ letterSpacing: 0.3 }}>
                {groupLabel(t, gr.id)}
              </Txt>
            </PressSlab>
          );
        })}
      </View>
      <Txt v="small" dim align="center" style={{ marginBottom: 2 }}>
        {groupBlurb(t, group)}
      </Txt>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
        {usuals.length > 0 ? (
          <View style={{ marginBottom: 6 }}>
            <Txt v="label" dim style={{ marginVertical: 8, marginLeft: 4 }}>
              {t('pick.usuals')}
            </Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {usuals.map((m) => (
                <Chip key={m.id} label={catLabel(t, m)} on={value === m.id} color={p.groups[m.group].bg} onPress={() => onPick(m.id)} />
              ))}
            </ScrollView>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {list.map((m) => (
            <Cell key={m.id} meta={m} w={w} on={value === m.id} onPress={() => onPick(m.id)} />
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('pick.new')}
            onPress={() => {
              haptic.tap();
              setCreating(true);
            }}
            style={{ width: w, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2 }}
          >
            <View style={{ width: w - 14, height: w - 14, borderRadius: 24, borderWidth: 2.5, borderColor: p.textFaint, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
              <Glyph name="plus" size={26} color={p.textDim} stroke={3} />
            </View>
            <Txt v="small" align="center" dim style={{ marginTop: 6, fontFamily: 'DMSans_700Bold', fontSize: 12 }}>
              {t('pick.new')}
            </Txt>
          </Pressable>
        </View>
      </ScrollView>
      <NewCategorySheet
        visible={creating}
        group={group}
        onClose={() => setCreating(false)}
        onCreated={(id) => {
          setCreating(false);
          onPick(id);
        }}
      />
    </View>
  );
}

/** Make your own category: a name, a group (which roasts it borrows), and any of the 117 icons. */
export function NewCategorySheet({ visible, group, onClose, onCreated }: { visible: boolean; group: GroupId; onClose: () => void; onCreated: (id: string) => void }) {
  const p = useTheme();
  const t = useT();
  const add = useStore((s) => s.addCustomCategory);
  const [name, setName] = useState('');
  const [g, setG] = useState<GroupId>(group);
  const [icon, setIcon] = useState('star');
  const [q, setQ] = useState('');
  const icons = useMemo(() => searchIcons(q), [q]);
  React.useEffect(() => {
    if (visible) setG(group);
  }, [visible, group]);
  const ok = name.trim().length > 0;
  return (
    <Sheet visible={visible} onClose={onClose} title={t('pick.newTitle')}>
      <View style={{ gap: 14, paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 68, height: 68, borderRadius: 24, backgroundColor: p.groups[g].bg, borderWidth: 2.5, borderColor: p.ink, alignItems: 'center', justifyContent: 'center' }}>
            <CatIcon id={icon} size={50} />
          </View>
          <Field value={name} onChangeText={setName} placeholder={t('pick.namePh')} maxLength={22} style={{ flex: 1 }} autoCapitalize="sentences" />
        </View>
        <View>
          <Txt v="label" dim style={{ marginBottom: 8 }}>
            {t('pick.which')}
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {GROUPS.map((gr) => (
              <Chip key={gr.id} small label={groupLabel(t, gr.id)} on={g === gr.id} color={p.groups[gr.id].bg} onPress={() => setG(gr.id)} />
            ))}
          </View>
          <Txt v="small" faint style={{ marginTop: 6 }}>
            {t('pick.whichHint')}
          </Txt>
        </View>
        <Field value={q} onChangeText={setQ} placeholder={t('pick.searchIcons')} glyph="search" autoCapitalize="none" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {icons.map((d) => (
            <Pressable
              key={d.id}
              accessibilityRole="button"
              accessibilityLabel={d.label}
              accessibilityState={{ selected: icon === d.id }}
              onPress={() => {
                haptic.tap();
                setIcon(d.id);
              }}
              style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: icon === d.id ? p.accent2 : p.card, borderWidth: 2.2, borderColor: p.ink, alignItems: 'center', justifyContent: 'center' }}
            >
              <CatIcon id={d.id} size={42} />
            </Pressable>
          ))}
        </View>
        <Btn
          label={t('pick.create')}
          full
          glyph="check"
          disabled={!ok}
          onPress={() => {
            const meta = add(name, g, icon);
            setName('');
            setQ('');
            haptic.good();
            onCreated(meta.id);
          }}
        />
      </View>
    </Sheet>
  );
}

export const _all = allCategories;
