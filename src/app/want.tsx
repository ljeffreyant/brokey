import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categorizeMerchant, categoryMeta, currencyDef, findShameMatch, parseAmountToCents, recommendedCoolingHours, shameMatchLine, wantNudge } from '../core';
import { formatTyped } from '../core/keypad';
import { catLabel, useT } from '../i18n';
import { ensurePermission } from '../notify';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Brokey } from '../ui/Brokey';
import { CategoryPicker } from '../ui/CategoryPicker';
import { IconDisc } from '../ui/CatIcon';
import { Keypad } from '../ui/Keypad';
import { Sheet } from '../ui/Sheet';
import { Txt } from '../ui/Txt';
import { Btn, Card, Chip, Field, RoundBtn, Segmented } from '../ui/kit';
import { useLeave } from '../ui/nav';
import { haptic } from '../ui/haptics';
import { useFmt } from '../ui/useFmt';
import { sfx } from '../ui/sfx';
import { puff } from '../ui/clay';

export default function Want() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const leave = useLeave();
  const ins = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const settings = useStore((s) => s.settings);
  const shame = useStore((s) => s.shame);
  const addWish = useStore((s) => s.addWish);

  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('random');
  const [catTouched, setCatTouched] = useState(false);
  const [pickCat, setPickCat] = useState(false);
  const [hours, setHours] = useState<24 | 48 | 72>(24);
  const [hoursTouched, setHoursTouched] = useState(false);
  const [done, setDone] = useState<null | { hours: number }>(null);
  const seed = useMemo(() => Math.floor(Math.random() * 1000), []);

  const cents = parseAmountToCents(amount) ?? 0;
  const zeroDecimal = !!currencyDef(settings.currency).zeroDecimal;
  const tight = H < 740;
  const tiny = H < 680;

  useEffect(() => {
    if (!catTouched && label.length > 2) {
      const g = categorizeMerchant(label);
      if (g) setCat(g);
    }
  }, [label, catTouched]);
  useEffect(() => {
    if (!hoursTouched && cents > 0) setHours(recommendedCoolingHours(cents));
  }, [cents, hoursTouched]);

  const match = useMemo(() => (label.trim().length > 3 ? findShameMatch(label, shame) : null), [label, shame]);
  const nudge = useMemo(() => wantNudge(settings.roastLevel, seed, settings.language), [settings.roastLevel, seed, settings.language]);
  const meta = categoryMeta(cat);

  const submit = async () => {
    if (cents <= 0) return;
    if (settings.notifyWish) await ensurePermission();
    addWish(label.trim() || t('want.something'), cents, cat, hours);
    haptic.good();
    sfx.play('fridge');
    setDone({ hours });
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: p.weather.sunny.field, paddingTop: ins.top, paddingBottom: ins.bottom + 20, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center', gap: 18 }}>
        <Animated.View entering={FadeIn.delay(100)}>
          <Brokey mood="proud" width={Math.min(W * 0.7, 280)} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300)} style={{ alignItems: 'center', gap: 8 }}>
          <Txt v="display" color={p.weather.sunny.text} align="center">
            {t('want.lockedTitle')}
          </Txt>
          <Txt v="body" color={p.weather.sunny.textDim} align="center">
            {t('want.lockedBody', { h: done.hours })}
          </Txt>
        </Animated.View>
        <Btn label={t('want.lockedCta')} size="lg" tone="dark" onPress={() => leave()} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: ins.top }}>
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <RoundBtn glyph="close" label={t('common.close')} onPress={() => leave()} />
        <Txt v="title" style={{ flex: 1 }} numberOfLines={1}>
          {t('want.title')}
        </Txt>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12, gap: tiny ? 8 : 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Brokey mood="tempted" width={tiny ? 64 : tight ? 90 : 118} still={false} />
          <View style={{ flex: 1, backgroundColor: p.card, borderRadius: 20, padding: 12, ...puff(p, p.card, 3) }}>
            <Txt v="small" style={{ fontFamily: 'DMSans_700Bold' }}>
              {nudge}
            </Txt>
          </View>
        </View>

        <Field value={label} onChangeText={setLabel} placeholder={t('want.whatPh')} glyph="edit" maxLength={48} />

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Chip label={catLabel(t, meta)} on color={p.groups[meta.group].bg} onPress={() => setPickCat(true)} right={<IconDisc id={meta.icon} size={24} color="transparent" />} />
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Txt v="title" dim>
              {currencyDef(settings.currency).symbol}
            </Txt>
            <Txt v="display" color={cents > 0 ? p.text : p.textFaint} numberOfLines={1} adjustsFontSizeToFit>
              {amount ? formatTyped(amount, settings.language) : '0'}
            </Txt>
          </View>
        </View>
        {cents > 0 ? (
          <Txt v="small" dim align="right" style={{ marginTop: -8 }}>
            = {f.hsp(cents)}
            {!f.workMode && f.work(cents) ? ` · ${f.work(cents)}` : ''}
          </Txt>
        ) : null}

        {match ? (
          <Animated.View entering={FadeInDown}>
            <Card fill={p.accent} inner={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Txt v="label" color={p.onAccent}>
                  {t('want.shelfMatch')}
                </Txt>
                <Txt v="small" color={p.onAccent} style={{ fontFamily: 'DMSans_700Bold' }}>
                  {t('want.shelfLine', { match: match.label, what: label.trim() })}
                </Txt>
              </View>
            </Card>
          </Animated.View>
        ) : null}

        <View style={{ gap: 6 }}>
          <Txt v="label" dim>
            {t('want.coolFor')}
          </Txt>
          <Segmented
            value={String(hours) as '24' | '48' | '72'}
            options={[
              { id: '24', label: t('want.h24') },
              { id: '48', label: t('want.h48') },
              { id: '72', label: t('want.h72') },
            ]}
            onChange={(v) => {
              setHoursTouched(true);
              setHours(parseInt(v, 10) as 24 | 48 | 72);
            }}
          />
        </View>

        <Keypad value={amount} onChange={setAmount} zeroDecimal={zeroDecimal} keyH={tiny ? 36 : tight ? 42 : 48} />
      </ScrollView>

      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: ins.bottom + 12 }}>
        <Btn label={t('want.cta')} glyph="snow" size="lg" full disabled={cents <= 0} onPress={submit} />
      </View>

      <Sheet visible={pickCat} onClose={() => setPickCat(false)} title={t('want.catTitle')} maxH={0.9}>
        <View style={{ height: H * 0.62, marginHorizontal: -20 }}>
          <CategoryPicker
            value={cat}
            onPick={(id) => {
              setCat(id);
              setCatTouched(true);
              setPickCat(false);
            }}
          />
        </View>
      </Sheet>
    </View>
  );
}

export const _sm = shameMatchLine;
