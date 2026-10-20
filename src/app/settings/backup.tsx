import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { BackupError, BackupSummary, parseBackup } from '../../core';
import { currentBackupData, pickBackupText, saveBackup } from '../../export/backup-io';
import { ShareUnavailable } from '../../export/share';
import { useT } from '../../i18n';
import { defaultSettings, useStore } from '../../store';
import { useTheme } from '../../theme';
import { Page } from '../../ui/Page';
import { Sheet } from '../../ui/Sheet';
import { Txt } from '../../ui/Txt';
import { Btn, Card, SectionTitle } from '../../ui/kit';
import { haptic } from '../../ui/haptics';
import { formatDate, useFmt } from '../../ui/useFmt';
import type { BackupData } from '../../core';

type Pending = { data: BackupData; summary: BackupSummary };

export default function Backup() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const settings = useStore((s) => s.settings);
  const purchases = useStore((s) => s.purchases.length);
  const wishes = useStore((s) => s.wishes.length);
  const shame = useStore((s) => s.shame.length);
  const restoreBackup = useStore((s) => s.restoreBackup);
  const [busy, setBusy] = useState<null | 'save' | 'pick'>(null);
  const [msg, setMsg] = useState<null | { ok: boolean; text: string }>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  const save = async () => {
    if (busy) return;
    haptic.tap();
    setMsg(null);
    setBusy('save');
    try {
      await saveBackup();
      setMsg({ ok: true, text: t('bk.saved') });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof ShareUnavailable ? t('export.noShare') : t('bk.err.generic') });
    } finally {
      setBusy(null);
    }
  };

  const pick = async () => {
    if (busy) return;
    haptic.tap();
    setMsg(null);
    setBusy('pick');
    try {
      const text = await pickBackupText();
      if (text == null) return;
      setPending(parseBackup(text, defaultSettings()));
    } catch (e) {
      const c = e instanceof BackupError ? e.code : 'generic';
      const key = c === 'notJson' || c === 'notBackup' ? 'bk.err.notBackup' : (`bk.err.${c}` as never);
      setMsg({ ok: false, text: t(key) });
    } finally {
      setBusy(null);
    }
  };

  const confirm = () => {
    if (!pending) return;
    haptic.warn();
    restoreBackup({ ...pending.data, settings: { ...pending.data.settings, lastBackupTs: pending.summary.exportedAt || null } });
    setPending(null);
    setMsg({ ok: true, text: t('bk.done') });
  };

  const last = settings.lastBackupTs;
  const hasData = purchases + wishes + shame > 0;
  return (
    <Page title={t('bk.title')}>
      <Txt v="body" dim>
        {t('bk.intro')}
      </Txt>

      <SectionTitle>{t('bk.saveTitle')}</SectionTitle>
      <Card weight="quiet" inner={{ gap: 12, padding: 16 }}>
        <Txt v="bodyBold">{last ? t('bk.last', { date: formatDate(last, f.lang) }) : t('bk.never')}</Txt>
        <Txt v="small" dim>
          {t('bk.counts', { buys: purchases, wants: wishes, shame })}
        </Txt>
        <Btn label={busy === 'save' ? t('bk.working') : t('bk.save')} tone="primary" glyph="download" full disabled={!!busy} onPress={save} />
        {!hasData ? (
          <Txt v="small" faint>
            {t('bk.empty')}
          </Txt>
        ) : null}
      </Card>

      <SectionTitle>{t('bk.restoreTitle')}</SectionTitle>
      <Card weight="quiet" inner={{ gap: 12, padding: 16 }}>
        <Txt v="small" dim>
          {t('bk.restoreBody')}
        </Txt>
        <Btn label={busy === 'pick' ? t('bk.working') : t('bk.restore')} tone="card" glyph="doc" full disabled={!!busy} onPress={pick} />
      </Card>

      {msg ? (
        <View accessibilityLiveRegion="polite">
          <Txt v="bodyBold" color={msg.ok ? p.good : p.bad} align="center">
            {msg.text}
          </Txt>
        </View>
      ) : null}

      <Sheet visible={!!pending} onClose={() => setPending(null)} title={t('bk.confirmTitle')}>
        {pending ? (
          <View style={{ gap: 14, paddingBottom: 8 }}>
            <Txt v="body" dim>
              {t('bk.confirmBody', {
                buys: pending.summary.purchases,
                wallets: pending.summary.wallets,
                date: pending.summary.exportedAt ? formatDate(pending.summary.exportedAt, f.lang) : '?',
              })}
            </Txt>
            {pending.summary.dropped > 0 ? (
              <Txt v="small" dim>
                {t('bk.dropped', { n: pending.summary.dropped })}
              </Txt>
            ) : null}
            <Txt v="small" faint>
              {t('bk.lockNote')}
            </Txt>
            <Btn label={t('bk.confirmYes')} tone="danger" glyph="undo" full onPress={confirm} />
            <Btn label={t('common.cancel')} tone="card" full onPress={() => setPending(null)} />
          </View>
        ) : null}
      </Sheet>
    </Page>
  );
}
