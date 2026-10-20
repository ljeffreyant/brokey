import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mood } from '../art/mascot';
import { CURRENCIES, RoastLevel, currencyDef, parseAmountToCents } from '../core';
import { formatTyped } from '../core/keypad';
import { LANGUAGES, useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Brokey } from '../ui/Brokey';
import { Keypad } from '../ui/Keypad';
import { Say } from '../ui/Say';
import { RoastPicker } from '../ui/RoastPicker';
import { Txt } from '../ui/Txt';
import { Btn, Card, Chip, RoundBtn } from '../ui/kit';
import { haptic } from '../ui/haptics';
import { useFmt } from '../ui/useFmt';

/** Four quick steps. Theme lives in Settings, and the notification prompt waits until the first time you lock a want. */
const STEPS = ['welcome', 'money', 'budget', 'roast'] as const;
type Step = (typeof STEPS)[number];

/** 144 becomes 140, 96 stays 96, 600000 stays 600000. Keeps defaults looking like numbers a person would type. */
function niceRound(n: number): number {
  if (n <= 0) return 0;
  const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(n)) - 1));
  return Math.round(n / mag) * mag;
}

function priceStep(hsp: number): number {
  return hsp < 30 ? 1 : hsp < 500 ? 5 : hsp < 5000 ? 50 : 5000;
}

export default function Onboarding() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const ins = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const settings = useStore((s) => s.settings);
  const setLanguage = useStore((s) => s.setLanguage);
  const setCurrency = useStore((s) => s.setCurrency);
  const updateSettings = useStore((s) => s.updateSettings);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [step, setStep] = useState<Step>('welcome');
  const [budget, setBudget] = useState('');
  const [level, setLevel] = useState<RoastLevel>('medium');
  const [poke, setPoke] = useState(0);

  const cur = currencyDef(settings.currency);
  const zd = !!cur.zeroDecimal;
  const hspMajor = Math.round(settings.unit.priceCents / 100);
  const budgetCents = parseAmountToCents(budget) ?? 0;
  const idx = STEPS.indexOf(step);
  const tight = H < 720;

  // a sensible first guess for the weekly budget: about eight HSPs
  useEffect(() => {
    if (step === 'budget' && budget === '') setBudget(String(niceRound(hspMajor * 8)));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (d: 1 | -1) => {
    haptic.tap();
    setStep(STEPS[Math.max(0, Math.min(STEPS.length - 1, idx + d))]);
  };

  const setPrice = (major: number) => {
    const v = Math.max(1, major);
    updateSettings({ unit: { ...settings.unit, priceCents: v * 100 } });
  };

  const finish = () => {
    haptic.good();
    // wish reminders stay on by default; iOS is only asked when the first want is locked
    completeOnboarding({ roastLevel: level, adultConfirmed: settings.adultConfirmed }, { budgetMode: 'manual', manualWeeklyCents: budgetCents });
    router.replace('/home');
  };

  const next = () => {
    if (step === 'roast') return finish();
    go(1);
  };

  const mood: Mood = step === 'welcome' ? 'happy' : step === 'money' ? 'tempted' : step === 'budget' ? 'sideeye' : level === 'unhinged' ? 'shock' : level === 'mild' ? 'happy' : 'sideeye';

  const say = step === 'money' ? t('ob.money.say') : step === 'budget' ? t('ob.budget.say') : step === 'roast' ? t('ob.roast.say') : '';

  const ctaLabel = step === 'welcome' ? t('ob.welcome.cta') : step === 'roast' ? t('ob.done.cta') : t('common.next');
  const ctaDisabled = step === 'budget' && budgetCents <= 0;

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: ins.top }}>
      {/* top bar: back + progress */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 8, height: 60 }}>
        {idx > 0 ? <RoundBtn glyph="back" label={t('common.back')} onPress={() => go(-1)} size={42} /> : <View style={{ width: 42 }} />}
        <View style={{ flex: 1, flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
          {STEPS.map((s, i) => (
            <View key={s} style={{ width: i === idx ? 26 : 9, height: 9, borderRadius: 5, backgroundColor: i === idx ? p.accent2 : i < idx ? p.ink : p.line, borderWidth: i === idx ? 2 : 0, borderColor: p.ink }} />
          ))}
        </View>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 18, paddingBottom: 16 }}>
        <Animated.View key={step} entering={FadeInRight.springify().damping(18)} exiting={FadeOutLeft.duration(140)} style={{ flexGrow: 1, gap: 14 }}>
          {step === 'welcome' ? (
            <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Brokey mood={mood} width={Math.min(W * (tight ? 0.52 : 0.72), 290)} poke={poke} onPress={() => setPoke((n) => n + 1)} />
              <Txt v="display" align="center">
                {t('ob.welcome.hi')}
              </Txt>
              <Txt v="body" dim align="center" style={{ maxWidth: 330 }}>
                {t('ob.welcome.body')}
              </Txt>
              <Txt v="label" dim style={{ marginTop: 8 }}>
                {t('ob.welcome.lang')}
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {LANGUAGES.map((l) => (
                  <Chip key={l.id} label={l.native} on={settings.language === l.id} onPress={() => setLanguage(l.id)} small />
                ))}
              </View>
            </View>
          ) : null}

          {step !== 'welcome' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Brokey mood={mood} width={tight ? 84 : 104} poke={poke} still={false} />
              <Say text={say} />
            </View>
          ) : null}

          {step === 'money' ? (
            <View style={{ gap: 14 }}>
              <Txt v="label" dim>
                {t('ob.money.currency')}
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CURRENCIES.map((c) => (
                  <Chip key={c.code} label={`${c.code} ${c.symbol}`} on={settings.currency === c.code} onPress={() => setCurrency(c.code)} small />
                ))}
              </View>
              <Card inner={{ alignItems: 'center', gap: 8, paddingVertical: 18 }}>
                <Txt v="label" dim>
                  {t('ob.money.price')}
                </Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                  <RoundBtn glyph="minus" label="-" onPress={() => setPrice(hspMajor - priceStep(hspMajor))} />
                  <Txt v="hero" size={52} adjustsFontSizeToFit numberOfLines={1} style={{ minWidth: 120, textAlign: 'center' }}>
                    {f.money(settings.unit.priceCents)}
                  </Txt>
                  <RoundBtn glyph="plus" label="+" onPress={() => setPrice(hspMajor + priceStep(hspMajor))} />
                </View>
                <Txt v="small" dim align="center" style={{ maxWidth: 280 }}>
                  {t('ob.money.hint')}
                </Txt>
              </Card>
            </View>
          ) : null}

          {step === 'budget' ? (
            <View style={{ gap: 14 }}>
              <View style={{ alignItems: 'center', gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Txt v="title" dim>
                    {cur.symbol}
                  </Txt>
                  <Txt v="hero" size={58} color={budgetCents > 0 ? p.text : p.textFaint} adjustsFontSizeToFit numberOfLines={1}>
                    {budget ? formatTyped(budget, settings.language) : '0'}
                  </Txt>
                </View>
                <Txt v="small" dim>
                  {budgetCents > 0 ? t('ob.budget.approx', { hsp: f.hsp(budgetCents) }) : t('ob.budget.zero')}
                </Txt>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
                {[0.5, 1, 1.5, 2].map((m) => {
                  const v = niceRound(hspMajor * 8 * m);
                  return <Chip key={m} label={f.money(v * 100)} on={parseAmountToCents(budget) === v * 100} onPress={() => setBudget(String(v))} small />;
                })}
              </View>
              <Keypad value={budget} onChange={setBudget} zeroDecimal={zd} keyH={tight ? 44 : 52} />
            </View>
          ) : null}

          {step === 'roast' ? (
            <RoastPicker
              value={level}
              onChange={(l) => {
                setLevel(l);
                setPoke((n) => n + 1);
              }}
            />
          ) : null}
        </Animated.View>
      </ScrollView>

      <View style={{ paddingHorizontal: 18, paddingBottom: Math.max(ins.bottom, 14), paddingTop: 8, gap: 8 }}>
        <Btn label={ctaLabel} size="lg" full tone={step === 'roast' ? 'primary' : 'dark'} disabled={ctaDisabled} onPress={next} />
      </View>
    </View>
  );
}
