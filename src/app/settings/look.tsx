import React from 'react';
import { View } from 'react-native';
import { LANGUAGES, useT } from '../../i18n';
import { useStore } from '../../store';
import { Page } from '../../ui/Page';
import { ThemePicker } from '../../ui/ThemePicker';
import { Txt } from '../../ui/Txt';
import { Chip, SectionTitle } from '../../ui/kit';

export default function Look() {
  const t = useT();
  const lang = useStore((s) => s.settings.language);
  const setLanguage = useStore((s) => s.setLanguage);
  return (
    <Page title={t('look.title')}>
      <SectionTitle>{t('look.theme')}</SectionTitle>
      <ThemePicker />
      <SectionTitle>{t('look.language')}</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {LANGUAGES.map((l) => (
          <Chip key={l.id} label={l.native} on={lang === l.id} onPress={() => setLanguage(l.id)} />
        ))}
      </View>
      {lang !== 'en' ? (
        <Txt v="small" dim>
          {t('look.langNote')}
        </Txt>
      ) : null}
    </Page>
  );
}
