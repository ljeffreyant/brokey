import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GROUPS, Purchase, categoryMeta, startOfDay } from '../core';
import { catLabel, groupLabel, useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { PurchaseRow } from '../ui/PurchaseRow';
import { Txt } from '../ui/Txt';
import { Chip, Field, Header } from '../ui/kit';
import { formatDate, formatDayName, useBudget, useFmt } from '../ui/useFmt';
import { groundShadow, lipOf } from '../ui/clay';

type Item = { k: 'h'; key: string; title: string; total: string } | { k: 'p'; key: string; p: Purchase; first: boolean; last: boolean };

export default function History() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const ins = useSafeAreaInsets();
  const { purchases, now, wallet, isAll } = useBudget();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<string>('all');
  const settingsLang = useStore((s) => s.settings.language);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return purchases
      .filter((x) => {
        const meta = categoryMeta(x.category);
        if (group !== 'all' && meta.group !== group) return false;
        if (!needle) return true;
        return (x.merchant ?? '').toLowerCase().includes(needle) || catLabel(t, meta).toLowerCase().includes(needle) || meta.label.toLowerCase().includes(needle);
      })
      .sort((a, b) => b.ts - a.ts);
  }, [purchases, q, group, t]);

  const items = useMemo(() => {
    const out: Item[] = [];
    const today = startOfDay(now);
    let i = 0;
    while (i < filtered.length) {
      const day = startOfDay(filtered[i].ts);
      const rows: Purchase[] = [];
      while (i < filtered.length && startOfDay(filtered[i].ts) === day) rows.push(filtered[i++]);
      const title = day === today ? t('home.today') : day === today - 86400000 ? t('home.yesterday') : `${formatDayName(day, settingsLang)} ${formatDate(day, settingsLang)}`;
      out.push({ k: 'h', key: `h${day}`, title, total: f.sum(rows.reduce((n, r) => n + r.amountCents, 0)) });
      rows.forEach((r, j) => out.push({ k: 'p', key: r.id, p: r, first: j === 0, last: j === rows.length - 1 }));
    }
    return out;
  }, [filtered, now, t, f, settingsLang]);

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: ins.top }}>
      <Header title={t('history.title')} sub={`${isAll ? t('wallet.all') : wallet?.name} · ${t.n('history.count', filtered.length)}`} onBack={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
      <View style={{ paddingHorizontal: 18, gap: 10, paddingBottom: 8 }}>
        <Field value={q} onChangeText={setQ} placeholder={t('history.search')} glyph="search" autoCorrect={false} autoCapitalize="none" returnKeyType="search" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 6, paddingRight: 18 }}>
          <Chip label={t('history.all')} on={group === 'all'} onPress={() => setGroup('all')} small />
          {GROUPS.map((g) => (
            <Chip key={g.id} label={groupLabel(t, g.id)} on={group === g.id} color={p.groups[g.id].bg} onPress={() => setGroup(g.id)} small />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={items}
        keyExtractor={(x) => x.key}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: ins.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Txt v="body" dim align="center">
              {purchases.length === 0 ? t('history.empty') : t('history.noMatch')}
            </Txt>
          </View>
        }
        renderItem={({ item }) =>
          item.k === 'h' ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 16, paddingBottom: 8, paddingHorizontal: 4 }}>
              <Txt v="label" dim>
                {item.title}
              </Txt>
              <Txt v="small" dim style={{ fontFamily: 'DMSans_700Bold' }}>
                {item.total}
              </Txt>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: p.card,
                borderTopLeftRadius: item.first ? 24 : 0,
                borderTopRightRadius: item.first ? 24 : 0,
                borderBottomLeftRadius: item.last ? 24 : 0,
                borderBottomRightRadius: item.last ? 24 : 0,
                marginBottom: item.last ? 6 : 0,
                overflow: 'hidden',
                boxShadow: [item.first ? `inset 0 2px 0 ${p.dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.9)'}` : '', item.last ? `0 5px 0 ${lipOf(p, p.card)}, ${groundShadow(p, 5)}` : ''].filter(Boolean).join(', ') || undefined,
              }}
            >
              <PurchaseRow p={item.p} showRoast onPress={() => router.push(`/purchase/${item.p.id}`)} />
            </View>
          )
        }
      />
    </View>
  );
}
