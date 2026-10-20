import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mood } from '../../art/mascot';
import { Regret, categoryMeta } from '../../core';
import { catLabel, useT } from '../../i18n';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { Brokey } from '../../ui/Brokey';
import { IconDisc } from '../../ui/CatIcon';
import { CategoryPicker } from '../../ui/CategoryPicker';
import { Sheet } from '../../ui/Sheet';
import { Txt } from '../../ui/Txt';
import { Btn, Card, Chip, RoundBtn } from '../../ui/kit';
import { haptic } from '../../ui/haptics';
import { formatClock, formatDate, formatDayName, useFmt } from '../../ui/useFmt';

export default function PurchaseDetail() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const ins = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const purchase = useStore((s) => s.purchases.find((x) => x.id === id));
  const wallets = useStore((s) => s.wallets);
  const shame = useStore((s) => s.shame.find((x) => x.purchaseId === id));
  const answerRegret = useStore((s) => s.answerRegret);
  const addShame = useStore((s) => s.addShame);
  const removeShame = useStore((s) => s.removeShame);
  const removePurchase = useStore((s) => s.removePurchase);
  const updatePurchase = useStore((s) => s.updatePurchase);
  const [catOpen, setCatOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  if (!purchase) {
    return (
      <View style={{ flex: 1, backgroundColor: p.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <Txt v="heading" align="center">
          {t('detail.notFound')}
        </Txt>
        <Btn label={t('common.close')} onPress={close} />
      </View>
    );
  }

  const meta = categoryMeta(purchase.category);
  const g = p.groups[meta.group];
  const wallet = wallets.find((w) => w.id === purchase.walletId);
  const title = purchase.merchant || catLabel(t, meta);
  const work = f.work(purchase.amountCents);
  const answer = purchase.regret;
  const mood: Mood = answer === 'nah' ? 'sad' : answer === 'worth' ? 'happy' : 'sideeye';

  const answerKey = (r: Regret) => (r === 'worth' ? 'regret.worth' : r === 'meh' ? 'regret.meh' : 'regret.nope');
  const choose = (r: Regret) => {
    r === 'worth' ? haptic.good() : r === 'meh' ? haptic.soft() : haptic.warn();
    answerRegret(purchase.id, r);
    if (r === 'nah' && !shame) {
      addShame({ label: title, amountCents: purchase.amountCents, category: purchase.category, source: 'regret', purchaseId: purchase.id });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: Math.max(ins.top, 12) + 6, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <RoundBtn glyph="close" label={t('common.close')} onPress={close} />
        </View>

        <Animated.View entering={FadeInDown.springify().damping(15)} style={{ alignItems: 'center', gap: 6 }}>
          <IconDisc id={meta.icon} size={104} color={g.bg} ring />
          <Txt v="title" align="center" style={{ marginTop: 6 }}>
            {title}
          </Txt>
          {purchase.merchant ? (
            <Txt v="small" dim>
              {catLabel(t, meta)}
            </Txt>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).springify().damping(15)}>
          <Card fill={g.bg} inner={{ alignItems: 'center', paddingVertical: 18, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Txt v="hero" size={58} color={g.fg}>
                {f.hspNum(purchase.amountCents)}
              </Txt>
              <Txt v="title" color={g.fg}>
                {f.hspLabel(purchase.amountCents)}
              </Txt>
            </View>
            <Txt v="bodyBold" color={g.fg}>
              {f.money(purchase.amountCents)}
              {work ? ` · ${work}` : ''}
            </Txt>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify().damping(15)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <Chip label={`${formatDayName(purchase.ts, f.lang, 'short')} ${formatDate(purchase.ts, f.lang)} · ${formatClock(purchase.ts, f.lang)}`} glyph="calendar" small />
          <Chip label={t('detail.via', { method: t(`method.${purchase.method}` as never) })} glyph="coins" small />
          {wallet ? <Chip label={wallet.name} glyph="wallet" small /> : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(170).springify().damping(15)} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          <Brokey mood={mood} width={92} still />
          <View style={{ flex: 1, backgroundColor: p.card, borderRadius: 20, borderWidth: 2.5, borderColor: p.ink, padding: 14, marginBottom: 18 }}>
            <Txt v="label" faint size={10.5}>
              {t('detail.roastLabel')}
            </Txt>
            <Txt v="bodyBold" style={{ fontSize: 15, lineHeight: 21, marginTop: 2 }}>
              {purchase.roast || t('detail.noRoast')}
            </Txt>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).springify().damping(15)}>
          <Card inner={{ padding: 16, gap: 12 }}>
            <Txt v="heading">{t('detail.was')}</Txt>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['worth', 'meh', 'nah'] as Regret[]).map((r) => {
                const on = answer === r;
                return (
                  <Btn
                    key={r}
                    label={t(answerKey(r))}
                    tone={on ? (r === 'nah' ? 'danger' : r === 'meh' ? 'yellow' : 'primary') : 'card'}
                    style={{ flex: 1 }}
                    full
                    onPress={() => choose(r)}
                  />
                );
              })}
            </View>
            {shame ? (
              <View style={{ gap: 8 }}>
                <Txt v="small" dim>
                  {t('detail.onShelf')}
                </Txt>
                <Btn label={t('detail.offShelf')} tone="card" glyph="shelf" full onPress={() => removeShame(shame.id)} />
              </View>
            ) : answer ? (
              <Btn label={t('detail.addShelf')} tone="card" glyph="shelf" full onPress={() => { haptic.warn(); addShame({ label: title, amountCents: purchase.amountCents, category: purchase.category, source: 'regret', purchaseId: purchase.id }); }} />
            ) : null}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(270).springify().damping(15)} style={{ gap: 10 }}>
          <Btn label={t('detail.changeCat')} tone="card" glyph="grid" full onPress={() => setCatOpen(true)} />
          <Btn label={t('detail.delete')} tone="danger" glyph="trash" full onPress={() => setDelOpen(true)} />
        </Animated.View>
      </ScrollView>

      <Sheet visible={catOpen} onClose={() => setCatOpen(false)} title={t('detail.catTitle')} maxH={0.9}>
        <View style={{ height: 460, marginHorizontal: -20 }}>
          <CategoryPicker
            value={purchase.category}
            onPick={(cid) => {
              haptic.good();
              updatePurchase(purchase.id, { category: cid });
              setCatOpen(false);
            }}
          />
        </View>
      </Sheet>

      <Sheet visible={delOpen} onClose={() => setDelOpen(false)} title={t('detail.deleteTitle')}>
        <View style={{ gap: 14, paddingBottom: 8 }}>
          <Txt v="body" dim>
            {t('detail.deleteBody')}
          </Txt>
          <Btn
            label={t('detail.deleteYes')}
            tone="danger"
            glyph="trash"
            full
            onPress={() => {
              haptic.warn();
              setDelOpen(false);
              removePurchase(purchase.id);
              close();
            }}
          />
          <Btn label={t('detail.keep')} tone="card" full onPress={() => setDelOpen(false)} />
        </View>
      </Sheet>
    </View>
  );
}
