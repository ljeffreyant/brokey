import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WishItem, categoryMeta, coolingProgress, formatRemaining, remainingMs, totalDitchedCents, wishPhase } from '../../core';
import { catLabel, useT } from '../../i18n';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { Brokey } from '../../ui/Brokey';
import { Celebrate } from '../../ui/Celebrate';
import { Drawer, EmptyShelf, Fridge, Shelf } from '../../ui/Fridge';
import { Ladder } from '../../ui/Ladder';
import { IconDisc } from '../../ui/CatIcon';
import { Txt } from '../../ui/Txt';
import { Btn, Card, Group, RoundBtn } from '../../ui/kit';
import { haptic } from '../../ui/haptics';
import { formatDate, useFmt, useNow } from '../../ui/useFmt';
import { maybeAskForReview } from '../../ui/review';

function WishCard({ w, now, onDitch, onBuy }: { w: WishItem; now: number; onDitch: () => void; onBuy: () => void }) {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const meta = categoryMeta(w.category);
  const ready = wishPhase(w, now) === 'ready';
  const prog = coolingProgress(w, now);
  return (
    <Animated.View entering={FadeInDown} layout={LinearTransition}>
      <Card r={20} inner={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconDisc id={meta.icon} size={52} color={p.groups[meta.group].bg} ring />
          <View style={{ flex: 1 }}>
            <Txt v="heading" numberOfLines={2}>
              {w.label}
            </Txt>
            <Txt v="small" dim>
              {catLabel(t, meta)}
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt v="num">{f.hspNum(w.amountCents)}</Txt>
            <Txt v="small" dim>
              {f.money(w.amountCents)}
            </Txt>
          </View>
        </View>
        <View>
          <View style={{ height: 16, borderRadius: 8, backgroundColor: p.card2, borderWidth: 2.2, borderColor: p.ink, overflow: 'hidden' }}>
            <View style={{ width: `${Math.round(prog * 100)}%`, height: '100%', backgroundColor: ready ? p.good : p.info }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Txt v="small" color={ready ? p.good : p.textDim} style={{ fontFamily: 'DMSans_700Bold' }}>
              {ready ? t('cool.ready') : t('cool.left', { time: formatRemaining(remainingMs(w, now)) })}
            </Txt>
            <Txt v="small" faint>
              {Math.round(prog * 100)}%
            </Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn label={t('cool.ditch')} tone="yellow" full style={{ flex: 1 }} onPress={onDitch} />
          <Btn label={ready ? t('cool.stillWant') : t('cool.cave')} tone="card" full style={{ flex: 1 }} onPress={onBuy} />
        </View>
      </Card>
    </Animated.View>
  );
}

export default function Cooling() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const ins = useSafeAreaInsets();
  const now = useNow(20000);
  const wishes = useStore((s) => s.wishes);
  const decideWish = useStore((s) => s.decideWish);
  const [party, setParty] = useState<null | { cents: number }>(null);

  const active = useMemo(() => wishes.filter((w) => w.status === 'cooling').sort((a, b) => a.unlockTs - b.unlockTs), [wishes]);
  const past = useMemo(() => wishes.filter((w) => w.status !== 'cooling').sort((a, b) => (b.decidedTs ?? 0) - (a.decidedTs ?? 0)).slice(0, 10), [wishes]);
  const saved = totalDitchedCents(wishes);
  const ditchedN = wishes.filter((w) => w.status === 'ditched').length;

  const ditch = (w: WishItem) => {
    decideWish(w.id, 'ditched');
    setParty({ cents: w.amountCents });
  };
  const buy = (w: WishItem) => {
    haptic.medium();
    router.push({ pathname: '/log', params: { wish: w.id } });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={{ paddingTop: ins.top + 8, paddingHorizontal: 18, paddingBottom: 150, gap: 14 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt v="display">{t('cool.title')}</Txt>
          <Txt v="small" dim>
            {t('cool.sub')}
          </Txt>
        </View>
        <RoundBtn glyph="plus" label={t('want.title')} fill={p.accent2} color={p.onAccent2} onPress={() => router.push('/want')} />
      </View>

      <Fridge
        freezer={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Brokey mood={saved > 0 ? 'proud' : 'ok'} width={96} />
            <View style={{ flex: 1 }}>
              <Txt v="label" color={p.fridge.onDoor} style={{ opacity: 0.7 }}>
                {t('cool.saved')}
              </Txt>
              <Txt v="display" color={p.fridge.onDoor} numberOfLines={1} adjustsFontSizeToFit>
                {f.hsp(saved)}
              </Txt>
              <Txt v="small" color={p.fridge.onDoor} style={{ fontFamily: 'DMSans_700Bold' }}>
                {f.sum(saved)} · {t.n('cool.ditchedN', ditchedN)}
              </Txt>
            </View>
          </View>
        }
        drawer={
          past.length > 0 ? (
            <Drawer title={t('cool.past')}>
              <Group>
                {past.map((w) => {
                  const meta = categoryMeta(w.category);
                  return (
                    <View key={w.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
                      <IconDisc id={meta.icon} size={42} color={p.groups[meta.group].bg} ring />
                      <View style={{ flex: 1 }}>
                        <Txt v="bodyBold" numberOfLines={1}>
                          {w.label}
                        </Txt>
                        <Txt v="small" dim>
                          {formatDate(w.decidedTs ?? w.createdTs, f.lang)}
                        </Txt>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Txt v="small" color={w.status === 'ditched' ? p.good : p.textDim} style={{ fontFamily: 'DMSans_700Bold' }}>
                          {w.status === 'ditched' ? t('cool.ditched') : t('cool.bought')}
                        </Txt>
                        <Txt v="small" faint>
                          {f.money(w.amountCents)}
                        </Txt>
                      </View>
                    </View>
                  );
                })}
              </Group>
            </Drawer>
          ) : undefined
        }
      >
        {active.length === 0 ? (
          <EmptyShelf>
            <Txt v="heading" align="center" color={p.onAccent2}>
              {t('cool.emptyTitle')}
            </Txt>
            <Txt v="small" align="center" color={p.onAccent2} style={{ opacity: 0.8 }}>
              {t('cool.emptyBody')}
            </Txt>
            <Btn label={t('want.title')} glyph="snow" tone="primary" style={{ alignSelf: 'center' }} onPress={() => router.push('/want')} />
          </EmptyShelf>
        ) : (
          active.map((w) => (
            <Shelf key={w.id}>
              <WishCard w={w} now={now} onDitch={() => ditch(w)} onBuy={() => buy(w)} />
            </Shelf>
          ))
        )}
      </Fridge>

      <Ladder savedCents={saved} />

      <Celebrate
        visible={!!party}
        title={t('cool.partyTitle')}
        body={t('cool.partyBody', { amount: party ? f.money(party.cents) : '' })}
        cta={t('cool.partyCta')}
        onClose={() => {
          setParty(null);
          // a good moment: you just talked yourself out of a buy
          setTimeout(() => maybeAskForReview(), 900);
        }}
      />
    </ScrollView>
  );
}
