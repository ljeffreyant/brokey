import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FRIES_TOTAL, Purchase, WishItem, categoryMeta, forecastRunOut, nextUnitMode, regretCue, regretQueue, startOfDay, wishPhase } from '../../core';
import { catLabel, useT } from '../../i18n';
import { useStore } from '../../store';
import { Glyph } from '../../ui/Glyph';
import { Brokey } from '../../ui/Brokey';
import { IconDisc } from '../../ui/CatIcon';
import { PurchaseRow } from '../../ui/PurchaseRow';
import { Sheet } from '../../ui/Sheet';
import { Txt } from '../../ui/Txt';
import { WeatherArt } from '../../ui/WeatherArt';
import { Btn, Card, Group, PressSlab, RoundBtn, SectionTitle, Slab } from '../../ui/kit';
import { haptic } from '../../ui/haptics';
import { formatDate, formatDayName, useBudget, useFmt, useNow } from '../../ui/useFmt';
import { useTheme } from '../../theme';
import { weatherOf } from '../../ui/weather';
import { sfx } from '../../ui/sfx';

export default function Home() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const ins = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { wallet, live, budget, purchases, now, isAll } = useBudget();
  const wishes = useStore((s) => s.wishes);
  const setActiveWallet = useStore((s) => s.setActiveWallet);
  const answerRegret = useStore((s) => s.answerRegret);
  const addShame = useStore((s) => s.addShame);
  const [pick, setPick] = useState(false);
  const roastLevel = useStore((s) => s.settings.roastLevel);
  const unitMode = useStore((s) => s.settings.unitMode);
  const hourlyCents = useStore((s) => s.settings.hourlyCents);
  const updateSettings = useStore((s) => s.updateSettings);
  const [quipN, setQuipN] = useState(0);
  const [poke, setPoke] = useState(0);
  const [heroH, setHeroH] = useState(520);

  const weather = weatherOf(budget.remainingCents, budget.budgetCents);
  const wc = p.weather[weather];
  const mood = purchases.length === 0 ? 'happy' : budget.mood;
  const bw = Math.min(width * (purchases.length === 0 ? 0.5 : 0.6), purchases.length === 0 ? 190 : 232);

  const safe = budget.safeTodayCents;
  const quip = t.pick(`quip.${mood}` as never, quipN + (budget.dayIndex * 3 + purchases.length));

  const week = useMemo(() => purchases.filter((x) => x.ts >= budget.weekStart && x.ts < budget.weekEnd).sort((a, b) => b.ts - a.ts), [purchases, budget.weekStart, budget.weekEnd]);
  const groups = useMemo(() => {
    const out: { day: number; items: Purchase[] }[] = [];
    for (const x of week) {
      const d = startOfDay(x.ts);
      const last = out[out.length - 1];
      if (last && last.day === d) last.items.push(x);
      else out.push({ day: d, items: [x] });
    }
    return out;
  }, [week]);

  const due = useMemo(() => regretQueue(purchases, now, 1)[0], [purchases, now]);
  const forecast = useMemo(() => forecastRunOut(budget, now), [budget, now]);
  const forecastLine = forecast
    ? forecast.inDays === 0
      ? t(`forecast.today.${roastLevel}` as never)
      : forecast.inDays === 1
        ? t(`forecast.tomorrow.${roastLevel}` as never)
        : t(`forecast.${roastLevel}` as never, { day: formatDayName(forecast.runOutTs, f.lang) })
    : null;
  const cooling = wishes.filter((w) => w.status === 'cooling');
  const ready = cooling.filter((w) => wishPhase(w, now) === 'ready').length;
  const today = startOfDay(now);

  const dayTitle = useCallback(
    (d: number) => (d === today ? t('home.today') : d === today - 86400000 ? t('home.yesterday') : `${formatDayName(d, f.lang)} ${formatDate(d, f.lang)}`),
    [today, t, f.lang],
  );

  const onRegret = (x: Purchase, r: 'worth' | 'meh' | 'nah') => {
    r === 'worth' ? haptic.good() : r === 'meh' ? haptic.soft() : haptic.warn();
    sfx.play(regretCue(r));
    answerRegret(x.id, r);
    if (r === 'nah') {
      const meta = categoryMeta(x.category);
      addShame({ label: x.merchant || catLabel(t, meta), amountCents: x.amountCents, category: x.category, source: 'regret', purchaseId: x.id });
    }
  };

  /** tap the big number to flip how prices are shown; without an hourly rate it takes you to set one */
  const cycleUnit = () => {
    haptic.tap();
    if (!hourlyCents) {
      router.push('/settings/money');
      return;
    }
    updateSettings({ unitMode: nextUnitMode(unitMode, true) });
  };

  const heroTop = ins.top + 10;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
      {/* ------------------------------------------------ hero */}
      <View
        onLayout={(e) => setHeroH(e.nativeEvent.layout.height)}
        style={{ backgroundColor: wc.field, borderBottomLeftRadius: 44, borderBottomRightRadius: 44, borderBottomWidth: 3, borderColor: p.ink, paddingTop: heroTop, paddingBottom: 26, overflow: 'hidden' }}
      >
        <WeatherArt weather={weather} c={wc} ink={p.ink} w={width} h={heroH} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }}>
          <PressSlab fill={p.card} r={24} depth={3} border={2.5} onPress={() => setPick(true)} label={t('wallet.switch')} inner={{ height: 46, paddingLeft: 6, paddingRight: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconDisc id={isAll ? 'wallet' : wallet?.icon ?? 'hsp'} size={34} color={isAll ? p.accent2 : wallet?.color} ring />
            <Txt v="bodyBold" numberOfLines={1} style={{ maxWidth: width * 0.4 }}>
              {isAll ? t('wallet.all') : wallet?.name}
            </Txt>
            <Glyph name="down" size={16} color={p.textDim} />
          </PressSlab>
          <RoundBtn glyph="gear" label={t('settings.title')} onPress={() => router.push('/settings')} />
        </View>

        <View style={{ alignItems: 'center', marginTop: 18, paddingHorizontal: 20 }}>
          <Txt v="label" color={wc.textDim}>
            {budget.remainingCents <= 0 ? t('home.budgetGone') : safe < 0 ? t('home.overToday') : t('home.safeToday')}
          </Txt>
          <Pressable
            onPress={cycleUnit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`${f.hspNum(budget.remainingCents <= 0 ? budget.remainingCents : safe)} ${f.unitTag(0)}`.trim()}
            accessibilityHint={t('home.switchUnit')}
            style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}
          >
            <Txt v="hero" color={wc.text} adjustsFontSizeToFit numberOfLines={1}>
              {f.hspNum(budget.remainingCents <= 0 ? budget.remainingCents : safe)}
            </Txt>
            {f.unitTag(0) ? (
              <Txt v="title" color={wc.text}>
                {f.unitTag(0)}
              </Txt>
            ) : null}
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <View style={{ backgroundColor: p.ink, borderRadius: 999, paddingHorizontal: 12, height: 30, justifyContent: 'center' }}>
              <Txt v="small" color="#FFF6E6" style={{ fontFamily: 'DMSans_700Bold' }}>
                ≈ {f.sum(budget.remainingCents <= 0 ? budget.remainingCents : safe)}
              </Txt>
            </View>
            <View style={{ backgroundColor: p.ink, borderRadius: 999, paddingHorizontal: 12, height: 30, justifyContent: 'center' }}>
              <Txt v="small" color="#FFF6E6" style={{ fontFamily: 'DMSans_700Bold' }}>
                {t('home.fries', { n: budget.friesLeft, total: FRIES_TOTAL })}
              </Txt>
            </View>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Brokey
            mood={mood}
            width={bw}
            friesLeft={budget.friesLeft}
            poke={poke}
            onPress={() => {
              setPoke((n) => n + 1);
              setQuipN((n) => n + 1);
            }}
          />
        </View>

        <View style={{ alignItems: 'center', marginTop: 14, paddingHorizontal: 28 }}>
          <View style={{ width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: p.ink, marginBottom: -3 }} />
          <Slab weight="quiet" r={20} fill={p.card} inner={{ paddingHorizontal: 16, paddingVertical: 11 }}>
            <Txt v="small" align="center" numberOfLines={3} style={{ fontFamily: 'DMSans_700Bold' }}>
              {quip}
            </Txt>
          </Slab>
        </View>

        {purchases.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Btn label={t('home.emptyCta')} glyph="plus" tone="dark" onPress={() => router.push('/log')} />
          </View>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 18, paddingTop: 18, gap: 14 }}>
        {/* ------------------------------------------------ stats */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat label={t('home.statSpent')} value={f.hspNum(budget.spentWeekCents)} sub={f.sum(budget.spentWeekCents)} />
          <Stat label={t('home.statLeft')} value={f.hspNum(budget.remainingCents)} sub={f.sum(budget.remainingCents)} bad={budget.remainingCents < 0} />
          <Stat label={t('home.statDays')} value={String(budget.daysLeft)} sub={budget.streak > 1 ? t('home.streak', { n: budget.streak }) : t('home.statWeek')} />
        </View>

        {/* ------------------------------------------------ pace check */}
        {forecastLine ? (
          <Animated.View entering={FadeInDown.springify().damping(16)} layout={LinearTransition}>
            <Slab weight="quiet" r={20} fill={p.card} inner={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14 }}>
              <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: wc.field, borderWidth: 2, borderColor: p.ink, alignItems: 'center', justifyContent: 'center' }}>
                <Glyph name="chart" size={18} color={wc.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt v="label" dim>
                  {t('forecast.title')}
                </Txt>
                <Txt v="small" style={{ fontFamily: 'DMSans_700Bold' }}>
                  {forecastLine}
                </Txt>
              </View>
            </Slab>
          </Animated.View>
        ) : null}

        {/* ------------------------------------------------ regret check-in */}
        {due ? (
          <Animated.View key={due.id} entering={FadeInDown.springify().damping(16)} exiting={FadeOutLeft.duration(220)} layout={LinearTransition}>
            <Card weight="hero" fill={p.accent2} inner={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <IconDisc id={categoryMeta(due.category).icon} size={46} color={p.card} ring />
                <View style={{ flex: 1 }}>
                  <Txt v="label" color={p.onAccent2} style={{ opacity: 0.7 }}>
                    {t('home.checkin')}
                  </Txt>
                  <Txt v="heading" color={p.onAccent2}>
                    {t('home.regretQ', { what: due.merchant || catLabel(t, categoryMeta(due.category)), amount: f.money(due.amountCents) })}
                  </Txt>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <MiniBtn label={t('regret.worth')} onPress={() => onRegret(due, 'worth')} fill={p.card} />
                <MiniBtn label={t('regret.meh')} onPress={() => onRegret(due, 'meh')} fill={p.card} />
                <MiniBtn label={t('regret.nope')} onPress={() => onRegret(due, 'nah')} fill={p.accent} fg={p.onAccent} />
              </View>
            </Card>
          </Animated.View>
        ) : null}

        {/* ------------------------------------------------ cooling */}
        {cooling.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(60)} layout={LinearTransition}>
            <PressSlab fill={p.card} r={24} onPress={() => router.navigate('/cooling')} label={t('tab.cool')} inner={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: p.info, borderWidth: 2, borderColor: p.ink, alignItems: 'center', justifyContent: 'center' }}>
                <Glyph name="snow" size={24} color={p.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt v="heading">{t.n('home.cooling', cooling.length)}</Txt>
                {ready > 0 ? (
                  <Txt v="small" color={p.good} style={{ fontFamily: 'DMSans_700Bold' }}>
                    {t('home.coolingReady', { n: ready })}
                  </Txt>
                ) : (
                  <Txt v="small" dim>
                    {t('home.coolingSub')}
                  </Txt>
                )}
              </View>
              <Glyph name="right" size={18} color={p.textFaint} />
            </PressSlab>
          </Animated.View>
        ) : null}

        {/* ------------------------------------------------ diary */}
        <View>
          <SectionTitle
            right={
              <Pressable onPress={() => router.push('/history')} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('home.seeAll')}>
                <Txt v="small" color={p.accent} style={{ fontFamily: 'DMSans_700Bold' }}>
                  {t('home.seeAll')}
                </Txt>
              </Pressable>
            }
          >
            {t('home.week')}
          </SectionTitle>
          {groups.length === 0 ? (
            <Card inner={{ alignItems: 'center', gap: 10, paddingVertical: 24 }}>
              <Txt v="heading" align="center">
                {t('home.emptyTitle')}
              </Txt>
              <Txt v="small" dim align="center">
                {t('home.emptyBody')}
              </Txt>
            </Card>
          ) : (
            groups.map((g) => (
              <View key={g.day} style={{ marginBottom: 14 }}>
                <Txt v="small" dim style={{ marginBottom: 6, marginLeft: 6, fontFamily: 'DMSans_700Bold' }}>
                  {dayTitle(g.day)}
                </Txt>
                <Group>
                  {g.items.map((x) => (
                    <PurchaseRow key={x.id} p={x} showRoast onPress={() => router.push({ pathname: '/purchase/[id]', params: { id: x.id } })} />
                  ))}
                </Group>
              </View>
            ))
          )}
        </View>
      </View>

      {/* ------------------------------------------------ wallet picker */}
      <Sheet visible={pick} onClose={() => setPick(false)} title={t('wallet.pickTitle')}>
        <View style={{ gap: 10, paddingBottom: 8 }}>
          {live.length > 1 ? <WalletPickRow id="all" name={t('wallet.all')} sub={t('wallet.allSub')} icon="wallet" color={p.accent2} on={isAll} onPress={() => { setActiveWallet('all'); setPick(false); }} /> : null}
          {live.map((w) => (
            <WalletPickRow key={w.id} id={w.id} name={w.name} sub={f.sum(Math.max(0, 0))} hideSub icon={w.icon} color={w.color} on={!isAll && wallet?.id === w.id} onPress={() => { setActiveWallet(w.id); setPick(false); }} />
          ))}
          <Btn label={t('wallet.manage')} tone="card" glyph="gear" full onPress={() => { setPick(false); router.push('/settings/wallets'); }} />
        </View>
      </Sheet>
    </ScrollView>
  );
}

function WalletPickRow({ name, sub, hideSub, icon, color, on, onPress }: { id: string; name: string; sub: string; hideSub?: boolean; icon: string; color: string; on: boolean; onPress: () => void }) {
  const p = useTheme();
  return (
    <PressSlab fill={on ? p.accent2 : p.card} r={22} depth={3} onPress={onPress} label={name} inner={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <IconDisc id={icon} size={44} color={color} ring />
      <View style={{ flex: 1 }}>
        <Txt v="bodyBold" color={on ? p.onAccent2 : p.text}>
          {name}
        </Txt>
        {hideSub ? null : (
          <Txt v="small" color={on ? p.onAccent2 : p.textDim}>
            {sub}
          </Txt>
        )}
      </View>
      {on ? <Glyph name="check" size={20} color={p.onAccent2} stroke={3} /> : null}
    </PressSlab>
  );
}

function Stat({ label, value, sub, bad }: { label: string; value: string; sub: string; bad?: boolean }) {
  const p = useTheme();
  return (
    <Slab weight="quiet" r={20} style={{ flex: 1 }} inner={{ paddingVertical: 11, paddingHorizontal: 12 }}>
      <Txt v="label" dim size={10}>
        {label}
      </Txt>
      <Txt v="num" size={value.length > 6 ? 18 : 26} color={bad ? p.bad : p.text} numberOfLines={1} adjustsFontSizeToFit style={{ marginTop: value.length > 6 ? 8 : 3 }}>
        {value}
      </Txt>
      <Txt v="small" faint size={12} numberOfLines={1}>
        {sub}
      </Txt>
    </Slab>
  );
}

function MiniBtn({ label, onPress, fill, fg }: { label: string; onPress: () => void; fill: string; fg?: string }) {
  const p = useTheme();
  return (
    <PressSlab fill={fill} r={16} depth={3} border={2.2} onPress={onPress} label={label} style={{ flex: 1 }} inner={{ height: 42, alignItems: 'center', justifyContent: 'center' }}>
      <Txt v="small" color={fg ?? p.text} style={{ fontFamily: 'DMSans_700Bold' }}>
        {label}
      </Txt>
    </PressSlab>
  );
}
