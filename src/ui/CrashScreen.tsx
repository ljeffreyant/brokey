import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveBackup } from '../export/backup-io';
import { ShareUnavailable } from '../export/share';
import { useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Brokey } from './Brokey';
import { Txt } from './Txt';
import { Btn } from './kit';

/**
 * What people see instead of a white screen if something throws while drawing. It never blames them:
 * try again, save a copy of the data, or (last resort, two taps) start fresh.
 */
export function CrashScreen({ error, retry }: { error: Error; retry: () => void | Promise<void> }) {
  const p = useTheme();
  const t = useT();
  const ins = useSafeAreaInsets();
  const [note, setNote] = useState<string | null>(null);
  const [sure, setSure] = useState(false);

  const backup = async () => {
    try {
      await saveBackup();
      setNote(t('bk.saved'));
    } catch (e) {
      setNote(e instanceof ShareUnavailable ? t('export.noShare') : t('bk.err.generic'));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: ins.top }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16, paddingBottom: ins.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center' }}>
          <Brokey mood="sad" width={190} still />
        </View>
        <Txt v="display" align="center">
          {t('crash.title')}
        </Txt>
        <Txt v="body" dim align="center">
          {t('crash.body')}
        </Txt>
        <Btn label={t('crash.retry')} tone="primary" size="lg" full onPress={() => retry()} />
        <Btn label={t('bk.save')} tone="card" glyph="download" full onPress={backup} />
        {note ? (
          <View accessibilityLiveRegion="polite">
            <Txt v="small" dim align="center">
              {note}
            </Txt>
          </View>
        ) : null}

        {sure ? (
          <View style={{ gap: 10, marginTop: 8 }}>
            <Txt v="small" color={p.bad} align="center">
              {t('crash.resetSure')}
            </Txt>
            <Btn
              label={t('crash.resetYes')}
              tone="danger"
              glyph="trash"
              full
              onPress={() => {
                useStore.getState().resetAll();
                setSure(false);
                void retry();
              }}
            />
            <Btn label={t('common.cancel')} tone="card" full onPress={() => setSure(false)} />
          </View>
        ) : (
          <Txt v="small" faint align="center" onPress={() => setSure(true)} accessibilityRole="button" style={{ textDecorationLine: 'underline', paddingVertical: 8 }}>
            {t('crash.reset')}
          </Txt>
        )}

        <Txt v="small" faint align="center" selectable numberOfLines={3}>
          {String(error?.message ?? error).slice(0, 180)}
        </Txt>
      </ScrollView>
    </View>
  );
}
