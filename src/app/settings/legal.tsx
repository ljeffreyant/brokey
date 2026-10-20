import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, View } from 'react-native';
import { PRIVACY_URL, TERMS_URL } from '../../config';
import { useT } from '../../i18n';
import { PRIVACY, TERMS } from '../../legal';
import { Page } from '../../ui/Page';
import { Txt } from '../../ui/Txt';
import { Btn, Card } from '../../ui/kit';

/** Reads the same text that is published on the website. */
export default function Legal() {
  const t = useT();
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const isTerms = doc === 'terms';
  const d = isTerms ? TERMS : PRIVACY;
  return (
    <Page title={isTerms ? t('legal.terms') : t('legal.privacy')} sub={t('legal.updated', { date: d.updated })}>
      <Card weight="quiet" inner={{ gap: 16, padding: 18 }}>
        <Txt v="body">{d.intro}</Txt>
        {d.sections.map((s) => (
          <View key={s.heading} style={{ gap: 6 }}>
            <Txt v="heading">{s.heading}</Txt>
            {s.body.map((para, i) => (
              <Txt key={i} v="body" dim>
                {para}
              </Txt>
            ))}
          </View>
        ))}
      </Card>
      <Btn label={t('legal.openWeb')} tone="card" glyph="external" full onPress={() => Linking.openURL(isTerms ? TERMS_URL : PRIVACY_URL).catch(() => {})} />
    </Page>
  );
}
