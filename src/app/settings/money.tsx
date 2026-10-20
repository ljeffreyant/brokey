import React from 'react';
import { View } from 'react-native';
import { CURRENCIES, UNIT_PRESETS, currencyDef, formatMoney } from '../../core';
import { useT } from '../../i18n';
import { moneyFmt, useStore } from '../../store';
import { useTheme } from '../../theme';
import { AmountField } from '../../ui/AmountField';
import { Page } from '../../ui/Page';
import { Txt } from '../../ui/Txt';
import { Card, Chip, RoundBtn, Row, SectionTitle, Segmented, Toggle } from '../../ui/kit';
import { useFmt } from '../../ui/useFmt';

function priceStep(major: number): number {
  return major < 30 ? 1 : major < 500 ? 5 : major < 5000 ? 50 : 5000;
}

export default function MoneySettings() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const settings = useStore((s) => s.settings);
  const setCurrency = useStore((s) => s.setCurrency);
  const update = useStore((s) => s.updateSettings);
  const hasBuys = useStore((s) => s.purchases.length > 0);
  const cur = currencyDef(settings.currency);
  const mode = settings.unitMode ?? 'hsp';
  const major = Math.round(settings.unit.priceCents / 100);
  const setPrice = (v: number) => update({ unit: { ...settings.unit, priceCents: Math.max(1, v) * 100 } });
  const sample = 123450 * (cur.zeroDecimal ? 1 : 1);

  return (
    <Page title={t('money.title')}>
      <SectionTitle>{t('money.currency')}</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {CURRENCIES.map((c) => (
          <Chip key={c.code} label={`${c.code} ${c.symbol}`} on={settings.currency === c.code} onPress={() => setCurrency(c.code)} small />
        ))}
      </View>
      {hasBuys ? (
        <Txt v="small" faint style={{ marginTop: 8 }}>
          {t('money.currencyNote')}
        </Txt>
      ) : null}

      <SectionTitle>{t('money.showAs')}</SectionTitle>
      <Segmented
        value={mode}
        options={[
          { id: 'hsp', label: t('money.mode.hsp') },
          { id: 'work', label: t('money.mode.work') },
        ]}
        onChange={(v) => update({ unitMode: v })}
      />
      {mode === 'work' ? (
        <Txt v="small" dim style={{ marginTop: 8 }} color={settings.hourlyCents ? undefined : p.bad}>
          {settings.hourlyCents ? t('money.workOn', { rate: f.money(settings.hourlyCents) }) : t('money.workHint')}
        </Txt>
      ) : null}

      {mode === 'hsp' ? (
        <>
          <SectionTitle>{t('money.unit')}</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {UNIT_PRESETS.map((u) => (
              <Chip key={u.id} label={u.singular} on={settings.unit.id === u.id} onPress={() => update({ unit: u.id === 'hsp' ? { ...u, priceCents: cur.hsp * 100 } : u })} small />
            ))}
          </View>
          <Card weight="quiet" inner={{ alignItems: 'center', gap: 8, paddingVertical: 16 }}>
            <Txt v="label" dim>
              {t('money.price', { unit: settings.unit.singular })}
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
              <RoundBtn glyph="minus" label="-" onPress={() => setPrice(major - priceStep(major))} />
              <Txt v="hero" size={44} adjustsFontSizeToFit numberOfLines={1} style={{ minWidth: 120, textAlign: 'center' }}>
                {f.money(settings.unit.priceCents)}
              </Txt>
              <RoundBtn glyph="plus" label="+" onPress={() => setPrice(major + priceStep(major))} />
            </View>
          </Card>
        </>
      ) : null}

      <SectionTitle>{t('money.hourly')}</SectionTitle>
      <AmountField label={t('money.hourly')} cents={settings.hourlyCents} onChange={(c) => update({ hourlyCents: c && c > 0 ? c : null })} symbol={cur.symbol} placeholder={t('money.hourlyPh')} allowEmpty />
      <Txt v="small" dim style={{ marginTop: -6 }}>
        {t('money.hourlyHelp')}
      </Txt>

      <SectionTitle>{t('money.preview')}</SectionTitle>
      <Card weight="quiet" inner={{ padding: 4 }}>
        <Row title={t('money.showCents')} sub={t('money.showCentsSub')} right={<Toggle value={settings.showCents} onChange={(v) => update({ showCents: v })} label={t('money.showCents')} />} />
        <Row title={t('money.round')} sub={t('money.roundSub')} right={<Toggle value={settings.roundSummaries} onChange={(v) => update({ roundSummaries: v })} label={t('money.round')} />} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, alignItems: 'baseline' }}>
          <Txt v="small" dim>
            {formatMoney(sample, { fmt: moneyFmt(settings) })}
          </Txt>
          <Txt v="num" size={20}>
            {formatMoney(sample, { fmt: moneyFmt(settings, true) })}
          </Txt>
        </View>
      </Card>

      <SectionTitle>{t('money.weekStart')}</SectionTitle>
      <Segmented
        value={String(settings.weekStartsOn) as '1' | '0' | '6'}
        options={[
          { id: '1', label: t('day.mon') },
          { id: '0', label: t('day.sun') },
          { id: '6', label: t('day.sat') },
        ]}
        onChange={(v) => update({ weekStartsOn: Number(v) })}
      />
    </Page>
  );
}
