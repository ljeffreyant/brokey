import { Linking, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useT } from '../../i18n';
import { ensurePermission, hasPermission, setWeeklyRecap } from '../../notify';
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
    hasPermission().then((ok) => setBlocked(!ok && Platform.OS !== 'web' && (settings.notifyWish || settings.notifyWeekly)));
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

  return (
    <Page title={t('notifs.title')}>
      <Card inner={{ padding: 4 }}>
        <Row title={t('notifs.wish')} sub={t('notifs.wishSub')} glyph="snow" right={<Toggle value={settings.notifyWish} onChange={setWish} label={t('notifs.wish')} />} />
        <Row title={t('notifs.weekly')} sub={t('notifs.weeklySub')} glyph="chart" right={<Toggle value={settings.notifyWeekly} onChange={setWeekly} label={t('notifs.weekly')} />} />
      </Card>
      {blocked ? (
        <Card fill="#FFE3DD" inner={{ gap: 10 }}>
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
