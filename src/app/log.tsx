import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PayMethod, allStickers, categorizeMerchant, categoryMeta, currencyDef, parseAmountToCents } from '../core';
import { formatTyped } from '../core/keypad';
import { catLabel, useT } from '../i18n';
import { LogResult, useStore } from '../store';
import { useTheme } from '../theme';
import { CategoryPicker } from '../ui/CategoryPicker';
import { IconDisc } from '../ui/CatIcon';
import { EatScene } from '../ui/EatScene';
import { Glyph } from '../ui/Glyph';
import { Keypad } from '../ui/Keypad';
import { StickerArt } from '../ui/StickerArt';
import { Txt } from '../ui/Txt';
import { Btn, Chip, Field, PressSlab, RoundBtn, Slab } from '../ui/kit';
import { haptic } from '../ui/haptics';
import { useLeave } from '../ui/nav';
import { useBudget, useFmt } from '../ui/useFmt';
import { Brokey } from '../ui/Brokey';

const METHODS: { id: PayMethod; key: 'method.tap' | 'method.card' | 'method.cash' | 'method.bnpl' }[] = [
  { id: 'tap', key: 'method.tap' },
  { id: 'card', key: 'method.card' },
  { id: 'cash', key: 'method.cash' },
  { id: 'bnpl', key: 'method.bnpl' },
];

export default function Log() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const leave = useLeave();
  const ins = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const params = useLocalSearchParams<{ amount?: string; merchant?: string; method?: string; cat?: string; wish?: string }>();
  const settings = useStore((s) => s.settings);
  const wallets = useStore((s) => s.wallets);
  const logPurchase = useStore((s) => s.logPurchase);
  const removePurchase = useStore((s) => s.removePurchase);
  const decideWish = useStore((s) => s.decideWish);
  const wishes = useStore((s) => s.wishes);
  const markSeen = useStore((s) => s.markStickersSeen);

  const { budget } = useBudget();
  const live = useMemo(() => wallets.filter((w) => !w.archived), [wallets]);
  const startWallet = live.find((w) => w.id === settings.activeWalletId)?.id ?? live[0]?.id;
  const zeroDecimal = !!currencyDef(settings.currency).zeroDecimal;

  const fromLink = !!(params.amount || params.merchant);
  const guessed = params.cat ?? (params.merchant ? categorizeMerchant(params.merchant) ?? undefined : undefined);
  const [cat, setCat] = useState<string | undefined>(guessed ?? undefined);
  const [amount, setAmount] = useState(params.amount ? String(params.amount) : '');
  const [merchant, setMerchant] = useState(params.merchant ?? '');
  const [method, setMethod] = useState<PayMethod>((['tap', 'card', 'cash', 'bnpl'] as string[]).includes(params.method ?? '') ? (params.method as PayMethod) : 'tap');
  const [daysAgo, setDaysAgo] = useState(0);
  const [walletId, setWalletId] = useState(startWallet);
  const [phase, setPhase] = useState<'what' | 'how'>(guessed && params.amount ? 'how' : 'what');
  const [eat, setEat] = useState<null | { res: LogResult; iconId: string }>(null);
  const [stickers, setStickers] = useState<string[]>([]);

  // A cooled-off wish the person still wants goes straight to the eating scene.
  useEffect(() => {
    if (!params.wish) return;
    const w = wishes.find((x) => x.id === params.wish);
    if (!w || w.status !== 'cooling') return;
    const res = decideWish(w.id, 'bought');
    if (res) setEat({ res, iconId: categoryMeta(w.category).icon });
  }, []);

  const x = useSharedValue(phase === 'how' ? 1 : 0);
  useEffect(() => {
    x.value = withSpring(phase === 'how' ? 1 : 0, { damping: 20, stiffness: 190, mass: 0.9 });
  }, [phase]);
  const whatStyle = useAnimatedStyle(() => ({ opacity: 1 - x.value * 0.9, transform: [{ translateX: -x.value * W * 0.25 }] }));
  const howStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - x.value) * W }] }));

  const cents = parseAmountToCents(amount) ?? 0;
  const meta = cat ? categoryMeta(cat) : null;
  const tight = H < 740;
  const safe = Math.max(budget.safeTodayCents, 0);
  const reactMood = cents <= 0 ? 'tempted' : cents <= safe ? 'ok' : cents <= safe + budget.dailyAllowanceCents ? 'sideeye' : 'shock';

  const feed = () => {
    if (!cat || cents <= 0) return;
    const ts = Date.now() - daysAgo * 86400000;
    const res = logPurchase({ amountCents: cents, category: cat, merchant, method, ts, source: fromLink ? 'shortcut' : 'manual', walletId });
    setEat({ res, iconId: categoryMeta(cat).icon });
  };

  const finish = () => {
    if (!eat) return;
    const ids = eat.res.newStickers;
    markSeen(ids);
    if (ids.length) setStickers(ids);
    else leave();
  };

  const stickerDefs = useMemo(() => allStickers(), []);
  const dayLabel = daysAgo === 0 ? t('log.today') : daysAgo === 1 ? t('log.yesterday') : t('log.twoDays');
  const shown = formatTyped(amount, settings.language);
  const sym = currencyDef(settings.currency).symbol;
  const workLine = cents > 0 ? f.work(cents) : null;

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: ins.top }}>
      {/* ------------------------------------------------ phase 1: what */}
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: ins.top, bottom: 0 }, whatStyle]} pointerEvents={phase === 'what' ? 'auto' : 'none'}>
        <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <RoundBtn glyph="close" label={t('common.close')} onPress={() => leave()} />
          <View style={{ flex: 1 }}>
            <Txt v="title" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {t('log.what')}
            </Txt>
          </View>
          <Chip small label={t('log.notYet')} glyph="snow" onPress={() => router.replace('/want')} />
        </View>
        <CategoryPicker
          value={cat}
          bottomPad={ins.bottom + 24}
          onPick={(id) => {
            setCat(id);
            setTimeout(() => setPhase('how'), 140);
          }}
        />
      </Animated.View>

      {/* ------------------------------------------------ phase 2: how much */}
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: ins.top, bottom: 0, backgroundColor: p.bg }, howStyle]} pointerEvents={phase === 'how' ? 'auto' : 'none'}>
        <View style={{ paddingHorizontal: 18, paddingTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <RoundBtn glyph="back" label={t('common.back')} onPress={() => setPhase('what')} />
          <Pressable onPress={() => setPhase('what')} accessibilityRole="button" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {meta ? <IconDisc id={meta.icon} size={44} color={p.groups[meta.group].bg} ring /> : null}
            <View style={{ flex: 1 }}>
              <Txt v="heading" numberOfLines={1}>
                {meta ? catLabel(t, meta) : ''}
              </Txt>
              <Txt v="small" dim>
                {t('log.tapToChange')}
              </Txt>
            </View>
          </Pressable>
          <Chip small label={dayLabel} glyph="calendar" onPress={() => setDaysAgo((d) => (d + 1) % 3)} />
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, gap: 12 }} showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <Field value={merchant} onChangeText={setMerchant} placeholder={t('log.where')} glyph="edit" maxLength={40} returnKeyType="done" />
          {live.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {live.map((w) => (
                <Chip key={w.id} small label={w.name} on={walletId === w.id} color={w.color} onPress={() => setWalletId(w.id)} />
              ))}
            </ScrollView>
          ) : null}
        </ScrollView>

        <View style={{ alignItems: 'center', paddingVertical: tight ? 4 : 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, maxWidth: W - 36 }}>
            <Txt v="display" size={tight ? 34 : 42} dim>
              {sym}
            </Txt>
            <Txt v="hero" size={tight ? 54 : 70} adjustsFontSizeToFit numberOfLines={1} color={cents > 0 ? p.text : p.textFaint}>
              {amount ? shown : '0'}
            </Txt>
          </View>
          <View style={{ minHeight: 30, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {cents > 0 ? (
              <>
                <View style={{ backgroundColor: p.accent2, borderRadius: 999, borderWidth: 2, borderColor: p.ink, paddingHorizontal: 12, height: 30, justifyContent: 'center' }}>
                  <Txt v="small" color={p.onAccent2} style={{ fontFamily: 'DMSans_700Bold' }}>
                    = {f.hsp(cents)}
                  </Txt>
                </View>
                {workLine ? (
                  <Txt v="small" dim style={{ fontFamily: 'DMSans_700Bold' }}>
                    {workLine}
                  </Txt>
                ) : null}
              </>
            ) : (
              <Txt v="small" faint>
                {t('log.typeIt')}
              </Txt>
            )}
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 18, paddingBottom: ins.bottom + 14, gap: tight ? 8 : 12 }}>
          {!tight ? (
            <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 100 }}>
              <Brokey mood={reactMood} width={Math.min(150, H * 0.17)} friesLeft={budget.friesLeft} />
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
            {METHODS.map((m) => (
              <Chip key={m.id} small label={t(m.key)} on={method === m.id} onPress={() => setMethod(m.id)} />
            ))}
          </View>
          <Keypad value={amount} onChange={setAmount} zeroDecimal={zeroDecimal} keyH={tight ? 44 : 54} />
          <Btn label={t('log.feed')} size="lg" full tone="primary" disabled={cents <= 0 || !cat} onPress={feed} />
        </View>
      </Animated.View>

      {/* ------------------------------------------------ the payoff */}
      {eat ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
          <EatScene
            input={{ iconId: eat.iconId, amountCents: eat.res.purchase.amountCents, roast: eat.res.roast, before: eat.res.before, after: eat.res.after, newStickers: eat.res.newStickers }}
            onDone={finish}
            onUndo={() => {
              removePurchase(eat.res.purchase.id);
              haptic.soft();
              setEat(null);
            }}
          />
        </View>
      ) : null}

      {stickers.length > 0 ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(8,4,2,0.72)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <Animated.View>
            <Slab depth={5} r={30} fill={p.card} inner={{ padding: 24, alignItems: 'center', gap: 12 }}>
              <Txt v="label" color={p.accent}>
                {t('sticker.new')}
              </Txt>
              {stickers.slice(0, 1).map((id) => {
                const def = stickerDefs.find((d) => d.id === id);
                return (
                  <View key={id} style={{ alignItems: 'center', gap: 10 }}>
                    <StickerArt art={def?.art ?? 'coin'} size={120} index={stickerDefs.findIndex((d) => d.id === id)} />
                    <Txt v="title" align="center">
                      {t(`sticker.${id}.title` as never)}
                    </Txt>
                    <Txt v="body" dim align="center">
                      {t(`sticker.${id}.blurb` as never)}
                    </Txt>
                  </View>
                );
              })}
              <Btn label={t('sticker.nice')} tone="yellow" onPress={() => leave()} style={{ alignSelf: 'center', marginTop: 6 }} />
            </Slab>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

export const _g = [Glyph, PressSlab];
