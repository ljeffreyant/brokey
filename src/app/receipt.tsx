import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { FRY_COUNT } from '../art/mascot';
import { reportVerdict } from '../export/pdf';
import { buildReceipt } from '../export/receipt';
import { buildReport, monthStartOf } from '../export/report';
import { ShareUnavailable, exportFileName, shareImage } from '../export/share';
import { useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { RECEIPT_W, Receipt } from '../ui/Receipt';
import { Txt } from '../ui/Txt';
import { Btn, Header, RoundBtn } from '../ui/kit';
import { haptic } from '../ui/haptics';
import { useLeave } from '../ui/nav';
import { formatMonth, useNow } from '../ui/useFmt';
import { puff } from '../ui/clay';

const SLOT_H = 30;
const LINES = 22;
const PRINT_MS = 2600;

export default function ReceiptScreen() {
  const p = useTheme();
  const t = useT();
  const leave = useLeave();
  const ins = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const params = useLocalSearchParams<{ month?: string; wallet?: string }>();
  const purchases = useStore((s) => s.purchases);
  const wishes = useStore((s) => s.wishes);
  const shame = useStore((s) => s.shame);
  const wallets = useStore((s) => s.wallets);
  const settings = useStore((s) => s.settings);
  const now = useNow(60000);
  const month = params.month ? monthStartOf(Number(params.month)) : monthStartOf(now);
  const walletId = params.wallet ?? settings.activeWalletId;

  const report = useMemo(
    () => buildReport({ purchases, wishes, shame, wallets, walletId, settings: { unit: settings.unit, hourlyCents: settings.hourlyCents, weekStartsOn: settings.weekStartsOn, currency: settings.currency, language: settings.language }, month, now }),
    [purchases, wishes, shame, wallets, walletId, settings, month, now],
  );
  const model = useMemo(() => buildReceipt(report, t, formatMonth(month, settings.language)), [report, t, month, settings.language]);
  const verdict = reportVerdict(report);
  const fries = report.count === 0 ? FRY_COUNT : Math.max(0, Math.round(FRY_COUNT * (1 - Math.min(1, verdict.ratio))));

  // layout: the stage is whatever room is left between the header and the buttons
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [paperH, setPaperH] = useState(0);
  const scale = stage.w && paperH ? Math.min(1.15, (stage.w * 0.86) / RECEIPT_W, (stage.h - SLOT_H - 48) / paperH) : 1;
  const shownH = paperH * scale;

  const reveal = useSharedValue(reduce ? 1 : 0);
  const shownSv = useSharedValue(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const printTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<View>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const stopTicks = () => {
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  };

  const print = useCallback(() => {
    stopTicks();
    cancelAnimation(reveal);
    if (safeTimer.current) clearTimeout(safeTimer.current);
    if (reduce) {
      reveal.value = 1;
      return;
    }
    // safety net: whatever happens to the animation, the paper is never left hidden
    safeTimer.current = setTimeout(() => {
      reveal.value = 1;
    }, PRINT_MS + 1200);
    reveal.value = 0;
    reveal.value = withTiming(1, { duration: PRINT_MS, easing: Easing.steps(LINES, true) });
    let n = 0;
    tick.current = setInterval(() => {
      n += 1;
      haptic.soft();
      if (n >= LINES) {
        stopTicks();
        haptic.good();
      }
    }, PRINT_MS / LINES);
  }, [reduce, reveal]);

  // Start printing once, the first time the paper has been measured. Later re-measures (fonts, wrapping)
  // must not cancel it, which is what made the receipt stay blank on a real phone.
  const started = useRef(false);
  useEffect(() => {
    if (!paperH || started.current) return;
    started.current = true;
    printTimer.current = setTimeout(() => print(), 350);
  }, [paperH, print]);
  useEffect(
    () => () => {
      started.current = false;
      stopTicks();
      if (printTimer.current) clearTimeout(printTimer.current);
      if (safeTimer.current) clearTimeout(safeTimer.current);
    },
    [],
  );
  useEffect(() => {
    shownSv.value = shownH;
  }, [shownH, shownSv]);

  // Printing is a curtain the colour of the stage that slides off the paper, top first.
  // Only a transform is animated (no layout props), so it behaves the same on web and on device.
  const coverStyle = useAnimatedStyle(() => ({ transform: [{ translateY: reveal.value * shownSv.value }] }));
  const ready = stage.w > 0 && paperH > 0;

  const share = async () => {
    if (saving) return;
    haptic.tap();
    setErr(null);
    setSaving(true);
    try {
      stopTicks();
      cancelAnimation(reveal);
      reveal.value = 1;
      await new Promise((r) => setTimeout(r, 120));
      const width = 1080;
      const uri = await captureRef(stageRef, { format: 'png', quality: 1, result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile', width, height: Math.round((width * stage.h) / Math.max(1, stage.w)) });
      await shareImage(uri, exportFileName(['Brokey', 'receipt', new Date(month).getFullYear(), String(new Date(month).getMonth() + 1).padStart(2, '0')], 'png'));
    } catch (e) {
      setErr(e instanceof ShareUnavailable ? t('export.noShare') : t('receipt.failed'));
    } finally {
      setSaving(false);
    }
  };

  const stageFill = p.groups.chips.bg;
  const onStage = p.groups.chips.fg;

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: ins.top }}>
      <Header title={t('receipt.title')} onBack={leave} />
      <View
        ref={stageRef}
        collapsable={false}
        onLayout={(e: LayoutChangeEvent) => setStage({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        style={{ flex: 1, marginHorizontal: 18, borderRadius: 28, backgroundColor: stageFill, overflow: 'hidden', alignItems: 'center', ...puff(p, stageFill, 3) }}
      >
        {/* printer */}
        <View style={{ width: '88%', height: SLOT_H, marginTop: 14, borderRadius: 15, backgroundColor: p.ink, alignItems: 'center', justifyContent: 'flex-end', zIndex: 3 }}>
          <View style={{ width: '92%', height: 7, borderRadius: 4, backgroundColor: '#000', marginBottom: 5, opacity: 0.85 }} />
        </View>
        {/* paper grows out of the slot */}
        <View style={{ width: RECEIPT_W * scale, height: paperH ? shownH : undefined, overflow: 'hidden', marginTop: -6, zIndex: 1, opacity: ready ? 1 : 0 }}>
          <View
            style={{
              width: RECEIPT_W,
              // scale about the top-left corner, written as translate pairs so no transformOrigin is needed
              transform: [{ translateX: -RECEIPT_W / 2 }, { translateY: -paperH / 2 }, { scale }, { translateX: RECEIPT_W / 2 }, { translateY: paperH / 2 }],
            }}
            onLayout={(e) => setPaperH(Math.round(e.nativeEvent.layout.height))}
          >
            <Receipt model={model} mood={verdict.mood} friesLeft={fries} />
          </View>
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: shownH + 2, backgroundColor: stageFill }, coverStyle]} />
        </View>
        <View style={{ position: 'absolute', bottom: 10, alignSelf: 'center' }}>
          <Txt v="small" color={onStage} style={{ opacity: 0.7, fontFamily: 'DMSans_700Bold' }}>
            brokey
          </Txt>
        </View>
      </View>
      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: ins.bottom + 14, gap: 10 }}>
        {err ? (
          <Txt v="small" color={p.bad} align="center">
            {err}
          </Txt>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Btn label={saving ? t('receipt.saving') : t('receipt.share')} glyph="share" tone="primary" onPress={share} disabled={saving} full />
          </View>
          <RoundBtn glyph="undo" label={t('receipt.print')} onPress={() => print()} fill={p.card} size={52} />
        </View>
      </View>
    </View>
  );
}
