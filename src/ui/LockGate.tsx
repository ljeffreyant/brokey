import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { unlock } from '../lock';
import { useT } from '../i18n';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { Brokey } from './Brokey';
import { Txt } from './Txt';
import { Btn } from './kit';

/** How long the app can sit in the background before it asks again. Quick app switches do not nag. */
const GRACE_MS = 30_000;

/** Covers everything with a lock screen when "Lock with Face ID" is on. Opens on a cold start and after a while away. */
export function LockGate() {
  const p = useTheme();
  const t = useT();
  const ins = useSafeAreaInsets();
  const lockApp = useStore((s) => s.settings.lockApp && s.settings.onboarded);
  const update = useStore((s) => s.updateSettings);
  const native = Platform.OS === 'ios' || Platform.OS === 'android';
  const [locked, setLocked] = useState(lockApp && native);
  const [msg, setMsg] = useState<string | null>(null);
  const busy = useRef(false);
  const leftAt = useRef<number | null>(null);

  const ask = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setMsg(null);
    const r = await unlock(t('lock.reason'));
    busy.current = false;
    if (r === 'ok') setLocked(false);
    else if (r === 'unavailable') {
      // never lock someone out of their own money: if the phone cannot do it, switch the lock off
      update({ lockApp: false });
      setLocked(false);
    } else if (r === 'failed') setMsg(t('lock.failed'));
  }, [t, update]);

  useEffect(() => {
    if (!native) return;
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') {
        if (leftAt.current == null) leftAt.current = Date.now();
      } else if (s === 'active') {
        const gone = leftAt.current == null ? 0 : Date.now() - leftAt.current;
        leftAt.current = null;
        if (useStore.getState().settings.lockApp && gone > GRACE_MS) setLocked(true);
      }
    });
    return () => sub.remove();
  }, [native]);

  useEffect(() => {
    if (!lockApp) setLocked(false);
  }, [lockApp]);

  useEffect(() => {
    if (locked) ask();
  }, [locked, ask]);

  if (!locked) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: p.bg, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: ins.top, paddingBottom: ins.bottom, paddingHorizontal: 28, zIndex: 100 }]}>
      <Brokey mood="ok" width={200} still />
      <Txt v="display" align="center">
        {t('lock.title')}
      </Txt>
      {msg ? (
        <Txt v="small" color={p.bad} align="center">
          {msg}
        </Txt>
      ) : null}
      <Btn label={t('lock.cta')} size="lg" tone="primary" onPress={ask} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}
