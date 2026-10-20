import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import { SUPPORT_EMAIL, AUTH_ENABLED, WIDGETS_AVAILABLE } from '../../config';
import { currencyDef } from '../../core';
import { LANGUAGES, useT } from '../../i18n';
import { canLock, unlock } from '../../lock';
import { useStore } from '../../store';
import { PALETTES, useTheme } from '../../theme';
import { Brokey } from '../../ui/Brokey';
import { Page } from '../../ui/Page';
import { Sheet } from '../../ui/Sheet';
import { Txt } from '../../ui/Txt';
import { Btn, Card, Group, Row, SectionTitle, Toggle } from '../../ui/kit';
import { haptic } from '../../ui/haptics';
import { useFmt } from '../../ui/useFmt';

export default function Settings() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const settings = useStore((s) => s.settings);
  const wallets = useStore((s) => s.wallets);
  const resetAll = useStore((s) => s.resetAll);
  const updateSettings = useStore((s) => s.updateSettings);
  const [wipe, setWipe] = useState(false);
  const [lockErr, setLockErr] = useState<string | null>(null);
  const live = wallets.filter((w) => !w.archived).length;
  const themeName = settings.theme === 'system' ? t('theme.system') : t(`theme.${settings.theme}` as never);
  const langName = LANGUAGES.find((l) => l.id === settings.language)?.native ?? '';
  const go = (path: string) => router.push(path as never);
  const setLock = async (on: boolean) => {
    setLockErr(null);
    if (!on) return updateSettings({ lockApp: false });
    if (!(await canLock())) return setLockErr(t('lock.unavailable'));
    // prove it works before turning it on, so you cannot lock yourself out
    const r = await unlock(t('lock.reason'));
    if (r === 'ok') updateSettings({ lockApp: true });
    else if (r === 'unavailable') setLockErr(t('lock.unavailable'));
  };

  return (
    <Page title={t('settings.title')}>
      <Card weight="quiet" fill={p.accent2} inner={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12 }}>
        <Brokey mood="happy" width={92} still />
        <View style={{ flex: 1 }}>
          <Txt v="heading" color={p.onAccent2}>
            {t('settings.profile.local')}
          </Txt>
          <Txt v="small" color={p.onAccent2} style={{ opacity: 0.8 }}>
            {t('settings.profile.localSub')}
          </Txt>
        </View>
      </Card>

      <SectionTitle>{t('settings.sec.money')}</SectionTitle>
      <Group>
        <Row title={t('settings.wallets')} sub={t.n('settings.wallets.sub', live)} glyph="wallet" tint={p.groups.chips.bg} onPress={() => go('/settings/wallets')} />
        <Row
          title={t('settings.money')}
          sub={t('settings.money.sub', { cur: currencyDef(settings.currency).code, unit: f.unit.singular, price: f.money(f.unit.priceCents) })}
          glyph="coins"
          tint={p.groups.meat.bg}
          onPress={() => go('/settings/money')}
        />
      </Group>

      <SectionTitle>{t('settings.sec.look')}</SectionTitle>
      <Group>
        <Row title={t('settings.look')} sub={t('settings.look.sub', { theme: themeName, lang: langName })} glyph="globe" tint={p.groups.garlic.bg} onPress={() => go('/settings/look')} />
        <Row title={t('settings.roast')} sub={t(`ob.roast.${settings.roastLevel}` as never)} glyph="flame" tint={p.groups.chilli.bg} onPress={() => go('/settings/roast')} />
      </Group>

      <SectionTitle>{t('settings.sec.alerts')}</SectionTitle>
      <Group>
        <Row title={t('settings.notifs')} sub={t('settings.notifs.sub')} glyph="bell" onPress={() => go('/settings/notifications')} />
        <Row title={t('settings.cats')} sub={t('settings.cats.sub')} glyph="grid" onPress={() => go('/settings/categories')} />
      </Group>

      <SectionTitle>{t('settings.sec.fast')}</SectionTitle>
      <Group>
        <Row title={t('settings.shortcut')} sub={t('settings.shortcut.sub')} glyph="phone" onPress={() => go('/settings/shortcut')} />
        {WIDGETS_AVAILABLE ? (
          <Row title={t('settings.widgets')} sub={t('settings.widgets.sub')} glyph="sparkle" onPress={() => go('/settings/widgets')} />
        ) : null}
      </Group>

      <SectionTitle>{t('settings.sec.yours')}</SectionTitle>
      <Group>
        <Row title={t('settings.export')} sub={t('settings.export.sub')} glyph="share" onPress={() => go('/export')} />
        <Row title={t('settings.backup')} sub={t('settings.backup.sub')} glyph="download" onPress={() => go('/settings/backup')} />
        {Platform.OS !== 'web' ? (
          <Row title={t('settings.lock')} sub={t('settings.lock.sub')} glyph="shield" right={<Toggle value={settings.lockApp} onChange={setLock} label={t('settings.lock')} />} />
        ) : null}
        {AUTH_ENABLED ? (
          <Row title={t('settings.account')} sub={t('settings.account.sub')} glyph="user" onPress={() => go('/settings/account')} />
        ) : null}
      </Group>

      {lockErr ? (
        <Txt v="small" color={p.bad}>
          {lockErr}
        </Txt>
      ) : null}

      <SectionTitle>{t('settings.sec.about')}</SectionTitle>
      <Group>
        <Row title={t('settings.terms')} glyph="doc" onPress={() => router.push({ pathname: '/settings/legal', params: { doc: 'terms' } } as never)} />
        <Row title={t('settings.privacy')} glyph="shield" onPress={() => router.push({ pathname: '/settings/legal', params: { doc: 'privacy' } } as never)} />
        <Row title={t('settings.support')} glyph="mail" onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Brokey`).catch(() => {})} />
        <Row title={t('settings.about')} glyph="info" onPress={() => go('/settings/about')} />
      </Group>

      <SectionTitle>{' '}</SectionTitle>
      <Group>
        <Row title={t('settings.reset')} sub={t('settings.reset.sub')} glyph="trash" danger onPress={() => setWipe(true)} />
      </Group>

      <Sheet visible={wipe} onClose={() => setWipe(false)} title={t('settings.resetTitle')}>
        <View style={{ gap: 14, paddingBottom: 8 }}>
          <Txt v="body" dim>
            {t('settings.resetBody')}
          </Txt>
          <Btn
            label={t('settings.resetYes')}
            tone="danger"
            glyph="trash"
            full
            onPress={() => {
              haptic.warn();
              setWipe(false);
              resetAll();
              router.replace('/onboarding');
            }}
          />
          <Btn label={t('common.cancel')} tone="card" full onPress={() => setWipe(false)} />
        </View>
      </Sheet>
    </Page>
  );
}
