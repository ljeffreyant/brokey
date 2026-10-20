import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { FRY_COUNT } from '../art/mascot';
import { addDays, categoryMeta, dailySpend, noSpendDays, startOfWeek } from '../core';
import { ShareUnavailable, exportFileName, shareImage } from '../export/share';
import { catLabel, useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Txt } from '../ui/Txt';
import { WEEK_CARD_RATIO, WeekCard, WeekCardModel } from '../ui/WeekCard';
import { Btn, Header } from '../ui/kit';
import { haptic } from '../ui/haptics';
import { useLeave } from '../ui/nav';
import { formatDate, useBudget, useFmt } from '../ui/useFmt';
import { useWeekModel } from '../ui/useWeekModel';

const EXPORT_W = 1080;

/** A story-sized picture of one week, made to be shared. */
export default function RecapScreen() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const leave = useLeave();
  const ins = useSafeAreaInsets();
  const params = useLocalSearchParams<{ week?: string }>();
  const weekStartsOn = useStore((s) => s.settings.weekStartsOn);
  const { budget, purchases, now } = useBudget();
  const weekStart = params.week ? startOfWeek(Number(params.week), weekStartsOn) : startOfWeek(now, weekStartsOn);
  const { recap, wc, over, mood, verdict } = useWeekModel(weekStart, budget.budgetCents, purchases);
  const daily = useMemo(() => dailySpend(purchases, weekStart), [purchases, weekStart]);

  const model: WeekCardModel = useMemo(() => {
    const topMeta = recap.topCategory ? categoryMeta(recap.topCategory.category) : null;
    const big = recap.biggest;
    return {
      kicker: t('recap.kicker'),
      range: t('week.range', { a: formatDate(weekStart, f.lang), b: formatDate(addDays(weekStart, 6), f.lang) }),
      big: f.hspNum(recap.spentCents),
      unit: f.hspLabel(recap.spentCents),
      money: recap.budgetCents > 0 ? `${f.sum(recap.spentCents)} · ${t('week.ofBudget', { budget: f.hsp(recap.budgetCents) })}` : f.sum(recap.spentCents),
      chip: recap.budgetCents <= 0 ? t('week.noBudget') : over ? t('week.overBy', { amount: f.hsp(-recap.leftCents) }) : t('week.spare', { amount: f.hsp(recap.leftCents) }),
      chipOver: over,
      verdict,
      stats: [
        { label: t('recap.noSpend'), value: String(noSpendDays(daily, weekStart, now)) },
        { label: t('recap.biggest'), value: big ? f.sum(big.amountCents) : '-' },
        { label: t('recap.top'), value: topMeta ? catLabel(t, topMeta) : '-' },
      ],
      mood,
      friesLeft: recap.budgetCents > 0 ? Math.max(0, Math.round(FRY_COUNT * (1 - Math.min(1, recap.spentCents / recap.budgetCents)))) : FRY_COUNT,
      field: wc.field,
      blob: wc.blob,
      text: wc.text,
      textDim: wc.textDim,
    };
  }, [recap, over, verdict, mood, wc, daily, weekStart, now, t, f]);

  // the card fits whatever room is left between the header and the button
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const cardW = stage.w ? Math.floor(Math.min(stage.w, stage.h / WEEK_CARD_RATIO)) : 0;
  const cardRef = useRef<View>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const share = async () => {
    if (saving || !cardW) return;
    haptic.tap();
    setErr(null);
    setSaving(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile', width: EXPORT_W, height: Math.round(EXPORT_W * WEEK_CARD_RATIO) });
      const d = new Date(weekStart);
      await shareImage(uri, exportFileName(['Brokey', 'week', d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')], 'png'));
    } catch (e) {
      setErr(e instanceof ShareUnavailable ? t('export.noShare') : t('recap.failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: ins.top }}>
      <Header title={t('recap.title')} onBack={leave} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 8 }} onLayout={(e: LayoutChangeEvent) => setStage({ w: e.nativeEvent.layout.width - 36, h: e.nativeEvent.layout.height - 16 })}>
        {cardW > 0 ? (
          <View style={{ borderRadius: 22, borderWidth: 2.5, borderColor: p.ink, overflow: 'hidden' }}>
            <View ref={cardRef} collapsable={false}>
              <WeekCard model={model} width={cardW - 5} />
            </View>
          </View>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: ins.bottom + 14, gap: 8 }}>
        {err ? (
          <Txt v="small" color={p.bad} align="center">
            {err}
          </Txt>
        ) : null}
        <Btn label={saving ? t('recap.saving') : t('recap.share')} glyph="share" tone="primary" onPress={share} disabled={saving} full />
      </View>
    </View>
  );
}
