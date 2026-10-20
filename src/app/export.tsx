import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useT } from '../i18n';
import { buildReport, monthStartOf, addMonths } from '../export/report';
import { buildReportHtml, reportVerdict } from '../export/pdf';
import { ShareUnavailable, exportFileName, sharePdf, shareXlsx } from '../export/share';
import { buildWorkbook } from '../export/xlsx/build';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Brokey } from '../ui/Brokey';
import { Glyph, GlyphName } from '../ui/Glyph';
import { Txt } from '../ui/Txt';
import { Chip, Header, PressSlab, RoundBtn, Slab } from '../ui/kit';
import { useNow } from '../ui/useFmt';
import { formatMonth, useFmt } from '../ui/useFmt';
import { useLeave } from '../ui/nav';
import { haptic } from '../ui/haptics';

type Busy = null | 'xlsx' | 'pdf';

export default function ExportScreen() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const leave = useLeave();
  const ins = useSafeAreaInsets();
  const params = useLocalSearchParams<{ month?: string; wallet?: string }>();
  const purchases = useStore((s) => s.purchases);
  const wishes = useStore((s) => s.wishes);
  const shame = useStore((s) => s.shame);
  const wallets = useStore((s) => s.wallets);
  const settings = useStore((s) => s.settings);
  const now = useNow(60000);
  const live = useMemo(() => wallets.filter((w) => !w.archived), [wallets]);

  const thisMonth = monthStartOf(now);
  const [month, setMonth] = useState(() => (params.month ? monthStartOf(Number(params.month)) : thisMonth));
  const [walletId, setWalletId] = useState<string>(() => params.wallet ?? settings.activeWalletId);
  const [busy, setBusy] = useState<Busy>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null);

  const firstTs = useMemo(() => purchases.reduce((m, x) => Math.min(m, x.ts), settings.startedTs || now), [purchases, settings.startedTs, now]);
  const earliest = monthStartOf(Math.min(firstTs, now));
  const canPrev = month > earliest;
  const canNext = month < thisMonth;

  const report = useMemo(
    () => buildReport({ purchases, wishes, shame, wallets, walletId, settings: { unit: settings.unit, hourlyCents: settings.hourlyCents, weekStartsOn: settings.weekStartsOn, currency: settings.currency, language: settings.language }, month, now }),
    [purchases, wishes, shame, wallets, walletId, settings, month, now],
  );
  const verdict = reportVerdict(report);

  const stem = (ext: string) => exportFileName(['Brokey', new Date(month).getFullYear(), String(new Date(month).getMonth() + 1).padStart(2, '0'), report.walletName ?? 'All'], ext);

  const run = async (kind: Exclude<Busy, null>) => {
    if (busy) return;
    haptic.tap();
    setMsg(null);
    setBusy(kind);
    try {
      await new Promise((r) => setTimeout(r, 40)); // let the spinner paint before the heavy part
      if (kind === 'xlsx') await shareXlsx(buildWorkbook(report, { t, now }), stem('xlsx'));
      else await sharePdf(buildReportHtml(report, { t, now }), stem('pdf'));
      setMsg({ kind: 'ok', text: t('export.done') });
    } catch (e) {
      setMsg({ kind: 'bad', text: e instanceof ShareUnavailable ? t('export.noShare') : t('export.failed') });
    } finally {
      setBusy(null);
    }
  };

  const goMonth = (n: number) => {
    haptic.tap();
    setMsg(null);
    setMonth((m) => addMonths(m, n));
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: ins.top }}>
      <Header title={t('export.title')} sub={t('export.sub')} onBack={leave} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: ins.bottom + 40, gap: 14 }}>
        {/* month and wallet */}
        <Slab fill={p.groups.chips.bg} depth={5} r={26} inner={{ padding: 14, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <RoundBtn glyph="back" label={t('export.prev')} onPress={() => goMonth(-1)} fill={canPrev ? p.card : p.card2} color={canPrev ? p.text : p.textFaint} size={42} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Txt v="title" color={p.groups.chips.fg} numberOfLines={1} align="center">
                {formatMonth(month, settings.language)}
              </Txt>
            </View>
            <RoundBtn glyph="right" label={t('export.next')} onPress={() => goMonth(1)} fill={canNext ? p.card : p.card2} color={canNext ? p.text : p.textFaint} size={42} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Brokey mood={verdict.mood} width={74} still friesLeft={Math.max(0, Math.round(9 * (1 - Math.min(1, verdict.ratio))))} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt v="heading" color={p.groups.chips.fg}>
                {f.sum(report.spentCents)}
              </Txt>
              <Txt v="small" color={p.groups.chips.fg} style={{ opacity: 0.8 }}>
                {t.n('history.count', report.count)} · {f.hsp(report.spentCents)}
              </Txt>
            </View>
          </View>
        </Slab>

        {live.length > 1 ? (
          <View style={{ gap: 8 }}>
            <Txt v="label" dim style={{ paddingHorizontal: 4 }}>
              {t('export.wallet')}
            </Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 18 }}>
              <Chip label={t('wallet.all')} on={walletId === 'all'} onPress={() => setWalletId('all')} small />
              {live.map((w) => (
                <Chip key={w.id} label={w.name} on={walletId === w.id} color={w.color} onPress={() => setWalletId(w.id)} small />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {report.count === 0 ? (
          <Txt v="small" dim style={{ paddingHorizontal: 4 }}>
            {t('export.empty')}
          </Txt>
        ) : null}

        <Action glyph="grid" bg={p.groups.chips.bg} fg={p.groups.chips.fg} title={t('export.xlsx')} body={t('export.xlsxBody')} cta={t('export.share')} busy={busy === 'xlsx'} disabled={!!busy} onPress={() => run('xlsx')} making={t('export.making')} />
        <Action glyph="doc" bg={p.groups.chilli.bg} fg={p.groups.chilli.fg} title={t('export.pdf')} body={t('export.pdfBody')} cta={t('export.share')} busy={busy === 'pdf'} disabled={!!busy} onPress={() => run('pdf')} making={t('export.making')} />
        <Action glyph="list" bg={p.groups.meat.bg} fg={p.groups.meat.fg} title={t('export.receipt')} body={t('export.receiptBody')} cta={t('export.open')} busy={false} disabled={!!busy} onPress={() => router.push({ pathname: '/receipt', params: { month: String(month), wallet: walletId } })} making="" />

        {msg ? (
          <Txt v="bodyBold" color={msg.kind === 'ok' ? p.good : p.bad} align="center" accessibilityLiveRegion="polite">
            {msg.text}
          </Txt>
        ) : null}
        <Txt v="small" faint align="center" style={{ paddingHorizontal: 12 }}>
          {t('export.private')}
        </Txt>
      </ScrollView>
    </View>
  );
}

function Action({ glyph, bg, fg, title, body, cta, busy, disabled, onPress, making }: { glyph: GlyphName; bg: string; fg: string; title: string; body: string; cta: string; busy: boolean; disabled: boolean; onPress: () => void; making: string }) {
  const p = useTheme();
  return (
    <PressSlab depth={5} r={26} onPress={onPress} disabled={disabled} label={title} inner={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: bg, borderWidth: 2.5, borderColor: p.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Glyph name={glyph} size={28} color={fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt v="heading" numberOfLines={1}>
          {title}
        </Txt>
        <Txt v="small" dim numberOfLines={3}>
          {body}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
          {busy ? <ActivityIndicator size="small" color={p.text} /> : null}
          <Txt v="small" style={{ fontFamily: 'DMSans_700Bold' }} color={p.accent}>
            {busy ? making : cta}
          </Txt>
          {!busy ? <Glyph name="right" size={14} color={p.accent} /> : null}
        </View>
      </View>
    </PressSlab>
  );
}
