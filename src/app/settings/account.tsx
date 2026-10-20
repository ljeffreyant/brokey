import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { authAvailable } from '../../auth/client';
import { useAuth } from '../../auth/store';
import { useT } from '../../i18n';
import { useTheme } from '../../theme';
import { Brokey } from '../../ui/Brokey';
import { Page } from '../../ui/Page';
import { Sheet } from '../../ui/Sheet';
import { Txt } from '../../ui/Txt';
import { Btn, Card, Field } from '../../ui/kit';
import { formatClock, formatDate, useFmt } from '../../ui/useFmt';

export default function Account() {
  const p = useTheme();
  const t = useT();
  const f = useFmt();
  const router = useRouter();
  const a = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [del, setDel] = useState(false);

  // No project configured: say so plainly instead of showing a dead form.
  if (!authAvailable) {
    return (
      <Page title={t('account.title')}>
        <Card weight="quiet" inner={{ alignItems: 'center', gap: 10, paddingVertical: 22 }}>
          <Brokey mood="ok" width={150} still />
          <Txt v="heading" align="center">
            {t('account.localTitle')}
          </Txt>
          <Txt v="body" dim align="center">
            {t('account.localBody')}
          </Txt>
        </Card>
        <Btn label={t('settings.export')} tone="yellow" glyph="share" onPress={() => router.push('/export' as never)} />
      </Page>
    );
  }

  const when = a.lastSyncedTs ? `${formatDate(a.lastSyncedTs, f.lang)} ${formatClock(a.lastSyncedTs, f.lang)}` : null;

  return (
    <Page title={t('account.title')}>
      {a.status === 'signedIn' ? (
        <>
          <Card weight="quiet" inner={{ gap: 6 }}>
            <Txt v="label" dim>
              {t('settings.profile.in')}
            </Txt>
            <Txt v="heading">{t('account.signedInAs', { email: a.email ?? '' })}</Txt>
            <Txt v="small" dim>
              {when ? t('account.synced', { time: when }) : t('account.neverSynced')}
            </Txt>
          </Card>
          <Btn label={t('account.syncNow')} glyph="undo" tone="yellow" disabled={a.busy} onPress={() => a.syncNow()} />
          <Btn label={t('account.signOut')} glyph="logout" tone="card" onPress={() => a.signOut()} />
          <Card weight="quiet" inner={{ gap: 10 }}>
            <Txt v="small" dim>
              {t('account.deleteSub')}
            </Txt>
            <Btn label={t('account.delete')} glyph="trash" tone="danger" onPress={() => setDel(true)} />
          </Card>
        </>
      ) : (
        <>
          <Txt v="body" dim>
            {t('account.why')}
          </Txt>
          {!sent ? (
            <View style={{ gap: 12 }}>
              <Field value={email} onChangeText={setEmail} placeholder={t('account.emailPh')} glyph="mail" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" />
              <Btn
                label={t('account.sendCode')}
                full
                disabled={a.busy || !/.+@.+\..+/.test(email.trim())}
                onPress={async () => {
                  if (await a.sendCode(email)) setSent(true);
                }}
              />
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <Txt v="body">{t('account.codeSent', { email: email.trim() })}</Txt>
              <Field value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder={t('account.codePh')} glyph="lock" keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code" maxLength={6} />
              <Btn label={t('account.verify')} full disabled={a.busy || code.length < 6} onPress={() => a.verify(email, code)} />
              <Btn label={t('account.useOther')} tone="card" full onPress={() => { setSent(false); setCode(''); }} />
            </View>
          )}
        </>
      )}
      {a.error ? (
        <Txt v="small" color={p.bad}>
          {a.error}
        </Txt>
      ) : null}

      <Sheet visible={del} onClose={() => setDel(false)} title={t('account.deleteTitle')}>
        <View style={{ gap: 14, paddingBottom: 8 }}>
          <Txt v="body" dim>
            {t('account.deleteBody')}
          </Txt>
          <Btn
            label={t('account.deleteYes')}
            tone="danger"
            glyph="trash"
            full
            disabled={a.busy}
            onPress={async () => {
              if (await a.deleteAccount()) setDel(false);
            }}
          />
          <Btn label={t('common.cancel')} tone="card" full onPress={() => setDel(false)} />
        </View>
      </Sheet>

      <Sheet visible={!!a.conflict} onClose={() => {}} title={t('account.conflictTitle')}>
        <View style={{ gap: 14, paddingBottom: 8 }}>
          <Txt v="body" dim>
            {t('account.conflictBody')}
          </Txt>
          <Btn label={t('account.useCloud')} tone="yellow" full disabled={a.busy} onPress={() => a.resolveConflict('cloud')} />
          <Btn label={t('account.usePhone')} tone="card" full disabled={a.busy} onPress={() => a.resolveConflict('phone')} />
        </View>
      </Sheet>
    </Page>
  );
}
