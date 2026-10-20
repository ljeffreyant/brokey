import React from 'react';
import { View } from 'react-native';
import { useT } from '../../i18n';
import { Brokey } from '../../ui/Brokey';
import { Page } from '../../ui/Page';
import { Txt } from '../../ui/Txt';
import { Card } from '../../ui/kit';

export default function Widgets() {
  const t = useT();
  return (
    <Page title={t('widgets.title')}>
      <Card inner={{ alignItems: 'center', gap: 10, paddingVertical: 22 }}>
        <View style={{ marginBottom: -6 }}>
          <Brokey mood="tempted" width={150} still />
        </View>
        <Txt v="body" dim align="center">
          {t('widgets.body')}
        </Txt>
      </Card>
    </Page>
  );
}
