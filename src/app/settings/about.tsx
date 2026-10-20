import React from 'react';
import { View } from 'react-native';
import { APP_VERSION } from '../../config';
import { useT } from '../../i18n';
import { Brokey } from '../../ui/Brokey';
import { Page } from '../../ui/Page';
import { Txt } from '../../ui/Txt';
import { Card } from '../../ui/kit';

export default function About() {
  const t = useT();
  return (
    <Page title={t('about.title')} sub={t('about.version', { v: APP_VERSION })}>
      <Card weight="quiet" inner={{ alignItems: 'center', gap: 12, paddingVertical: 22 }}>
        <Brokey mood="happy" width={190} />
        <View style={{ gap: 10 }}>
          <Txt v="body" align="center">
            {t('about.what')}
          </Txt>
          <Txt v="small" dim align="center">
            {t('about.notAdvice')}
          </Txt>
          <Txt v="small" faint align="center">
            {t('about.credits')}
          </Txt>
        </View>
      </Card>
    </Page>
  );
}
