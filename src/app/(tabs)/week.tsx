import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GroupId,
  RoastLevel,
  addDays,
  buildRecap,
  categoryMeta,
  dailySpend,
  groupMeta,
  purchasesBetween,
  regretStats,
  startOfDay,
  startOfWeek,
  worstRegretCategories,
} from '../../core';
import { Mood } from '../../art/mascot';
import { catLabel, groupLabel, useT } from '../../i18n';
import { useTheme } from '../../theme';
import { Brokey } from '../../ui/Brokey';
import { IconDisc } from '../../ui/CatIcon';
import { Glyph } from '../../ui/Glyph';
import { PurchaseRow } from '../../ui/PurchaseRow';
import { Txt } from '../../ui/Txt';
import { HspPie } from '../../ui/charts/HspPie';
import { DayBar, SauceBars } from '../../ui/charts/SauceBars';
import { haptic } from '../../ui/haptics';
import { Btn, Card, Row, SectionTitle } from '../../ui/kit';
import { formatDate, formatDayName, useBudget, useFmt } from '../../ui/useFmt';
import { useWeekModel } from '../../ui/useWeekModel';
import { useStore } from '../../store';

function Section({ i, children }: { i: number; children: React.ReactNode }) {
  return <Animated.View entering={FadeInDown.delay(80 + i * 70).springify().damping(16)}>{children}</Animated.View>;
}

export default function Week() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const ins = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const settings = useStore((s) => s.settings);
  const allPurchases = useStore((s) => s.purchases);
  const { budget, purchases, wallet, isAll, now } = useBudget();
  const [offset, setOffset] = useState(0);
  const [sel, setSel] = useState(0);
  const [group, setGroup] = useState<GroupId | null>(null);

  const ws = settings.weekStartsOn;
  const thisWeek = startOfWeek(now, ws);
  const weekStart = addDays(thisWeek, offset * 7);
  const weekEnd = addDays(weekStart, 7);
  const earliest = useMemo(() => startOfWeek(Math.min(settings.startedTs, ...purchases.map((x) => x.ts)), ws), [settings.startedTs, purchases, ws]);
  const canPrev = weekStart > earliest;
  const canNext = offset < 0;

  const { recap, wc, over, frac, mood, verdict } = useWeekModel(weekStart, budget.budgetCents, purchases);
  const daily = useMemo(() => dailySpend(purchases, weekStart), [purchases, weekStart]);
  const allowance = Math.floor(budget.budgetCents / 7);
  const today = startOfDay(now);

  // default the selected day: today for this week, otherwise the priciest day
  useEffect(() => {
    if (offset === 0) setSel(Math.min(6, Math.max(0, Math.round((today - weekStart) / 86400000))));
    else setSel(daily.indexOf(Math.max(...daily)));
    setGroup(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const days: DayBar[] = daily.map((cents, i) => {
    const ts = addDays(weekStart, i);
    const future = ts > today;
    return { key: String(ts), label: formatDayName(ts, f.lang, 'short'), value: future ? '·' : f.hspNum(cents), cents, future, today: ts === today };
  });

  const label = offset === 0 ? t('week.thisWeek') : offset === -1 ? t('week.lastWeek') : t('week.range', { a: formatDate(weekStart, f.lang), b: formatDate(addDays(weekEnd, -1), f.lang) });
  const range = t('week.range', { a: formatDate(weekStart, f.lang), b: formatDate(addDays(weekEnd, -1), f.lang) });

  // selected day
  const selTs = addDays(weekStart, sel);
  const selCents = daily[sel] ?? 0;
  const selList = useMemo(() => purchasesBetween(purchases, selTs, addDays(selTs, 1)).sort((a, b) => b.ts - a.ts), [purchases, selTs]);
  const selFuture = selTs > today;

  const total = recap.spentCents;
  const gSel = group ? recap.byGroup.find((g) => g.group === group) : null;
  const pieSize = Math.min(W - 36 - 32, 280);

  const rs = useMemo(() => regretStats(allPurchases), [allPurchases]);
  const worst = useMemo(() => worstRegretCategories(allPurchases)[0], [allPurchases]);

  const nav = (d: number) => {
    haptic.tap();
    setOffset((o) => o + d);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 18, paddingBottom: 150, gap: 6 }} showsVerticalScrollIndicator={false}>
      {/* ---------------------------------------------------------- header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Txt v="display">{t('week.title')}</Txt>
          <Txt v="small" dim numberOfLines={1}>
            {isAll ? t('wallet.all') : wallet?.name} · {range}
          </Txt>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('week.prev')}
          disabled={!canPrev}
          onPress={() => nav(-1)}
          style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2.5, borderColor: p.ink, backgroundColor: p.card, alignItems: 'center', justifyContent: 'center', opacity: canPrev ? 1 : 0.35 }}
        >
          <Glyph name="back" size={20} color={p.text} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('week.next')}
          disabled={!canNext}
          onPress={() => nav(1)}
          style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2.5, borderColor: p.ink, backgroundColor: p.card, alignItems: 'center', justifyContent: 'center', opacity: canNext ? 1 : 0.35 }}
        >
          <Glyph name="right" size={20} color={p.text} />
        </Pressable>
      </View>

      {/* ---------------------------------------------------------- hero */}
      <Section i={0}>
        <Card weight="hero" fill={wc.field} style={{ marginTop: 8 }} inner={{ padding: 18, paddingRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 6 }}>
              <Txt v="label" color={wc.textDim}>
                {label}
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <Txt v="hero" size={52} color={wc.text} adjustsFontSizeToFit numberOfLines={1}>
                  {f.hspNum(total)}
                </Txt>
                <Txt v="title" size={22} color={wc.text}>
                  {f.hspLabel(total)}
                </Txt>
              </View>
              <Txt v="small" color={wc.textDim} style={{ fontFamily: 'DMSans_700Bold' }}>
                {f.sum(total)} · {recap.budgetCents > 0 ? t('week.ofBudget', { budget: f.hsp(recap.budgetCents) }) : t('week.noBudget')}
              </Txt>
              {recap.budgetCents > 0 ? (
                <View style={{ height: 14, borderRadius: 7, borderWidth: 2.5, borderColor: p.ink, backgroundColor: 'rgba(255,255,255,0.45)', marginTop: 12, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.max(3, frac * 100)}%`, height: '100%', backgroundColor: over ? p.groups.chilli.bg : p.groups.chips.bg, borderRightWidth: 2.5, borderColor: p.ink }} />
                </View>
              ) : null}
            </View>
            <Brokey mood={mood} width={112} still={offset !== 0} />
          </View>
          <View style={{ backgroundColor: p.card, borderRadius: 16, borderWidth: 2.5, borderColor: p.ink, padding: 12, marginTop: 14, marginRight: 10 }}>
            <Txt v="bodyBold" style={{ fontSize: 14.5, lineHeight: 20 }}>
              {verdict}
            </Txt>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <View style={{ backgroundColor: over ? p.groups.chilli.bg : p.groups.chips.bg, borderRadius: 999, borderWidth: 2, borderColor: p.ink, paddingHorizontal: 10, height: 26, justifyContent: 'center' }}>
                <Txt v="small" size={12} color={over ? '#FFFFFF' : '#2B1608'} style={{ fontFamily: 'DMSans_700Bold' }}>
                  {recap.budgetCents <= 0 ? t('week.noBudget') : over ? t('week.overBy', { amount: f.hsp(-recap.leftCents) }) : t('week.spare', { amount: f.hsp(recap.leftCents) })}
                </Txt>
              </View>
              <View style={{ backgroundColor: p.card2, borderRadius: 999, borderWidth: 2, borderColor: p.ink, paddingHorizontal: 10, height: 26, justifyContent: 'center' }}>
                <Txt v="small" size={12} color={p.text} style={{ fontFamily: 'DMSans_700Bold' }}>
                  {t.n('week.buys', recap.count)}
                </Txt>
              </View>
            </View>
          </View>
        </Card>
      </Section>

      {recap.count > 0 ? (
        <Section i={1}>
          <Btn
            label={t('recap.share')}
            glyph="share"
            tone="card"
            size="sm"
            onPress={() => {
              haptic.tap();
              router.push({ pathname: '/recap', params: { week: String(weekStart) } });
            }}
          />
        </Section>
      ) : null}

      {/* ---------------------------------------------------------- sauce bottles */}
      <Section i={1}>
        <SectionTitle>{t('week.bottles')}</SectionTitle>
        <Card weight="quiet" inner={{ padding: 14 }}>
          <Txt v="small" dim style={{ marginBottom: 10 }}>
            {t('week.bottlesSub')}
          </Txt>
          <SauceBars days={days} allowanceCents={allowance} selected={sel} onSelect={setSel} width={W - 36 - 28} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <View style={{ width: 22, borderTopWidth: 2, borderStyle: 'dashed', borderColor: p.ink, opacity: 0.6 }} />
            <Txt v="small" dim>
              {t('week.allowance')} {f.hsp(allowance)}
            </Txt>
          </View>
          <View style={{ height: 2.5, backgroundColor: p.line, borderRadius: 2, marginVertical: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Txt v="heading">
              {formatDayName(selTs, f.lang, 'long')} {formatDate(selTs, f.lang)}
            </Txt>
            <Txt v="num">{selFuture ? '' : f.hsp(selCents)}</Txt>
          </View>
          <Txt v="small" dim style={{ marginTop: 2 }}>
            {selFuture
              ? t('week.dayFuture')
              : selCents === 0
                ? t('week.dayNone')
                : allowance > 0 && selCents > allowance
                  ? t('week.dayOver', { amount: f.hsp(selCents - allowance) })
                  : allowance > 0
                    ? t('week.dayUnder', { amount: f.hsp(allowance - selCents) })
                    : f.sum(selCents)}
          </Txt>
          {selList.length > 0 ? (
            <View style={{ marginTop: 8, marginHorizontal: -14 }}>
              {selList.slice(0, 4).map((x) => (
                <PurchaseRow key={x.id} p={x} onPress={() => router.push(`/purchase/${x.id}`)} />
              ))}
              {selList.length > 4 ? (
                <Txt v="small" faint align="center" style={{ marginTop: 4 }}>
                  +{selList.length - 4}
                </Txt>
              ) : null}
            </View>
          ) : null}
        </Card>
      </Section>

      {/* ---------------------------------------------------------- the tray */}
      <Section i={2}>
        <SectionTitle>{t('week.tray')}</SectionTitle>
        <Card weight="quiet" inner={{ padding: 16, alignItems: 'center' }}>
          <Txt v="small" dim style={{ alignSelf: 'flex-start', marginBottom: 6 }}>
            {t('week.traySub')}
          </Txt>
          <HspPie groups={recap.byGroup} size={pieSize} selected={group} onSelect={setGroup} animKey={`${weekStart}-${total}`}>
            {total === 0 ? (
              <Txt v="small" dim align="center" style={{ fontSize: 11, lineHeight: 13 }}>
                {t('week.trayEmpty')}
              </Txt>
            ) : gSel ? (
              <>
                <Txt v="num" size={22}>
                  {Math.round(gSel.share * 100)}%
                </Txt>
                <Txt v="small" dim style={{ fontSize: 10.5, lineHeight: 12 }} numberOfLines={1}>
                  {groupLabel(t, gSel.group)}
                </Txt>
              </>
            ) : (
              <>
                <Txt v="num" size={22} adjustsFontSizeToFit numberOfLines={1}>
                  {f.hspNum(total)}
                </Txt>
                <Txt v="small" dim style={{ fontSize: 10.5, lineHeight: 12 }}>
                  {f.hspLabel(total)}
                </Txt>
              </>
            )}
          </HspPie>
          <View style={{ alignSelf: 'stretch', marginTop: 14, gap: 2 }}>
            {recap.byGroup.map((g) => {
              const on = group === g.group;
              return (
                <Pressable
                  key={g.group}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    haptic.tap();
                    setGroup(on ? null : g.group);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 14, backgroundColor: on ? p.card2 : 'transparent', borderWidth: on ? 2 : 0, borderColor: p.ink, opacity: g.cents === 0 ? 0.5 : 1 }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: p.groups[g.group].bg, borderWidth: 2.5, borderColor: p.ink }} />
                  <View style={{ flex: 1 }}>
                    <Txt v="bodyBold" style={{ fontSize: 15, lineHeight: 19 }}>
                      {groupLabel(t, g.group)}
                    </Txt>
                    <Txt v="small" faint style={{ fontSize: 12, lineHeight: 15 }}>
                      {groupMeta(g.group).blurb && t(`group.${g.group}.blurb` as never)}
                    </Txt>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Txt v="num" size={17}>
                      {f.hspNum(g.cents)}
                    </Txt>
                    <Txt v="small" faint style={{ fontSize: 12, lineHeight: 14 }}>
                      {Math.round(g.share * 100)}%
                    </Txt>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </Section>

      {/* ---------------------------------------------------------- top categories */}
      {recap.byCategory.length > 0 ? (
        <Section i={3}>
          <SectionTitle>{t('week.top')}</SectionTitle>
          <Card inner={{ padding: 6 }}>
            {recap.byCategory.slice(0, 5).map((c, i) => {
              const meta = categoryMeta(c.category);
              const w = recap.byCategory[0].cents > 0 ? c.cents / recap.byCategory[0].cents : 0;
              return (
                <View key={c.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, paddingHorizontal: 10 }}>
                  <IconDisc id={meta.icon} size={44} color={p.groups[meta.group].bg} ring />
                  <View style={{ flex: 1, gap: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Txt v="bodyBold" numberOfLines={1} style={{ flex: 1 }}>
                        {catLabel(t, meta)}
                      </Txt>
                      <Txt v="num" size={18}>
                        {f.hspNum(c.cents)}
                      </Txt>
                    </View>
                    <View style={{ height: 9, borderRadius: 5, backgroundColor: p.card2, borderWidth: 1.5, borderColor: p.ink, overflow: 'hidden' }}>
                      <View style={{ width: `${Math.max(6, w * 100)}%`, height: '100%', backgroundColor: meta.group === 'garlic' ? p.groups.garlic.deep : p.groups[meta.group].bg, borderRightWidth: i === 0 && w === 1 ? 0 : 1.5, borderColor: p.ink }} />
                    </View>
                  </View>
                </View>
              );
            })}
          </Card>
        </Section>
      ) : null}

      {/* ---------------------------------------------------------- regret */}
      <Section i={4}>
        <SectionTitle>{t('week.regret')}</SectionTitle>
        <Card weight="quiet" inner={{ padding: 16, gap: 12 }}>
          {rs.answered === 0 ? (
            <Txt v="body" dim>
              {t('week.regretEmpty')}
            </Txt>
          ) : (
            <>
              <Txt v="small" dim>
                {t('week.regretSub')}
              </Txt>
              <View style={{ flexDirection: 'row', height: 30, borderRadius: 15, borderWidth: 2.5, borderColor: p.ink, overflow: 'hidden' }}>
                {([['worth', p.good], ['meh', p.groups.chips.bg], ['nah', p.groups.chilli.bg]] as const).map(([k, c], i) => (
                  <View key={k} style={{ flex: Math.max(rs[k], 0.0001), backgroundColor: c, borderLeftWidth: i > 0 && rs[k] > 0 ? 2.5 : 0, borderColor: p.ink }} />
                ))}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {([['worth', 'regret.worth'], ['meh', 'regret.meh'], ['nah', 'regret.nope']] as const).map(([k, tk]) => (
                  <View key={k} style={{ alignItems: 'center', flex: 1 }}>
                    <Txt v="display" size={28}>
                      {rs[k]}
                    </Txt>
                    <Txt v="label" dim size={10.5}>
                      {t(tk)}
                    </Txt>
                  </View>
                ))}
              </View>
              {rs.regretCents > 0 ? (
                <Txt v="bodyBold" style={{ fontSize: 14.5 }}>
                  {t('week.regretLost', { amount: f.hsp(rs.regretCents) })}
                </Txt>
              ) : null}
              {worst ? (
                <Txt v="small" dim>
                  {t('week.regretWorst', { cat: catLabel(t, categoryMeta(worst.category)).toLowerCase() })}
                </Txt>
              ) : null}
            </>
          )}
        </Card>
      </Section>

      {/* ---------------------------------------------------------- export */}
      <Section i={5}>
        <View style={{ marginTop: 14 }}>
          <Card inner={{ padding: 6 }}>
            <Row title={t('week.export')} sub={t('week.exportSub')} glyph="share" onPress={() => router.push('/export')} right={<Glyph name="right" size={18} color={p.textDim} />} />
          </Card>
        </View>
      </Section>
    </ScrollView>
  );
}
