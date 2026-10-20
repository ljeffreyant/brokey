import React, { useState } from 'react';
import { View } from 'react-native';
import { GROUPS, GroupId, categoriesIn } from '../../core';
import { catLabel, groupLabel, useT } from '../../i18n';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { IconDisc } from '../../ui/CatIcon';
import { NewCategorySheet } from '../../ui/CategoryPicker';
import { Page } from '../../ui/Page';
import { Txt } from '../../ui/Txt';
import { Btn, Card, Row, SectionTitle } from '../../ui/kit';
import { haptic } from '../../ui/haptics';

export default function CategorySettings() {
  const p = useTheme();
  const t = useT();
  const hidden = useStore((s) => s.hiddenCats);
  const custom = useStore((s) => s.customCats);
  const setHidden = useStore((s) => s.setCategoryHidden);
  const removeCustom = useStore((s) => s.removeCustomCategory);
  const [creating, setCreating] = useState(false);
  const [group, setGroup] = useState<GroupId>('chips');

  return (
    <Page title={t('cats.title')} sub={t('cats.sub')}>
      <Btn label={t('cats.new')} glyph="plus" tone="yellow" onPress={() => setCreating(true)} />

      <SectionTitle>{t('cats.custom')}</SectionTitle>
      {custom.length === 0 ? (
        <Txt v="small" dim>
          {t('cats.none')}
        </Txt>
      ) : (
        <Card inner={{ padding: 4 }}>
          {custom.map((c) => (
            <Row
              key={c.id}
              title={c.label}
              sub={groupLabel(t, c.group)}
              right={<Btn label={t('common.delete')} tone="card" size="sm" glyph="trash" onPress={() => { haptic.warn(); removeCustom(c.id); }} />}
            />
          ))}
        </Card>
      )}

      {GROUPS.map((g) => {
        const all = categoriesIn(g.id, []);
        const builtin = all.filter((c) => c.builtin);
        return (
          <View key={g.id}>
            <SectionTitle>{`${t('cats.builtin')} · ${groupLabel(t, g.id)}`}</SectionTitle>
            <Card inner={{ padding: 4 }}>
              {builtin.map((c) => {
                const off = hidden.includes(c.id);
                return (
                  <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 12, opacity: off ? 0.5 : 1 }}>
                    <IconDisc id={c.icon} size={40} color={p.groups[c.group].bg} ring />
                    <Txt v="bodyBold" style={{ flex: 1 }} numberOfLines={1}>
                      {catLabel(t, c)}
                    </Txt>
                    <Btn label={off ? t('cats.show') : t('cats.hide')} tone={off ? 'yellow' : 'card'} size="sm" onPress={() => { haptic.tap(); setHidden(c.id, !off); }} />
                  </View>
                );
              })}
            </Card>
          </View>
        );
      })}

      <NewCategorySheet visible={creating} group={group} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); setGroup('chips'); }} />
    </Page>
  );
}
