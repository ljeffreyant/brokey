import { Linking, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n';
import { ensurePermission, permissionDenied, setWeeklyRecap } from '../../notify';
import { useStore } from '../../store';
import { Page } from '../../ui/Page';
import { Txt } from '../../ui/Txt';
import { Btn, Card, Row, Toggle } from '../../ui/kit';

export default function NotificationSettings() {
  const t = useT();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    permissionDenied().then((no) => setBlocked(no && Platform.OS !== 'web' && (settings.notifyWish || settings.notifyWeekly)));
  }, [settings.notifyWish, settings.notifyWeekly]);

  const setWish = async (on: boolean) => {
    if (on && !(await ensurePermission())) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    update({ notifyWish: on });
  };

  const setWeekly = async (on: boolean) => {
    const ok = await setWeeklyRecap(on, settings.language);
    if (on && !ok) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    update({ notifyWeekly: on });
  };

  const setFlag = async (key: 'notifyPace' | 'notifyRecurring' | 'notifyEvening', on: boolean) => {
    if (on && !(await ensurePermission())) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    update({ [key]: on });
  };

  return (
    <Page title={t('notifs.title')}>
      <Card weight="quiet" inner={{ padding: 4 }}>
        <Row title={t('notifs.wish')} sub={t('notifs.wishSub')} glyph="snow" right={<Toggle value={settings.notifyWish} onChange={setWish} label={t('notifs.wish')} />} />
        <Row title={t('notifs.weekly')} sub={t('notifs.weeklySub')} glyph="chart" right={<Toggle value={settings.notifyWeekly} onChange={setWeekly} label={t('notifs.weekly')} />} />
        <Row title={t('notifs.pace')} sub={t('notifs.paceSub')} glyph="chart" right={<Toggle value={settings.notifyPace} onChange={(v) => setFlag('notifyPace', v)} label={t('notifs.pace')} />} />
        <Row title={t('notifs.recurring')} sub={t('notifs.recurringSub')} glyph="coins" right={<Toggle value={settings.notifyRecurring} onChange={(v) => setFlag('notifyRecurring', v)} label={t('notifs.recurring')} />} />
        <Row title={t('notifs.evening')} sub={t('notifs.eveningSub')} glyph="moon" right={<Toggle value={settings.notifyEvening} onChange={(v) => setFlag('notifyEvening', v)} label={t('notifs.evening')} />} />
      </Card>
      {blocked ? (
        <Card weight="quiet" fill="#FFE3DD" inner={{ gap: 10 }}>
          <Txt v="small" color="#5A1A10" style={{ fontFamily: 'DMSans_700Bold' }}>
            {t('notifs.denied')}
          </Txt>
          <Btn label={t('settings.title')} tone="card" size="sm" onPress={() => Linking.openSettings().catch(() => {})} />
        </Card>
      ) : null}
      <Txt v="small" dim>
        {t('notifs.local')}
      </Txt>
    </Page>
  );
}
