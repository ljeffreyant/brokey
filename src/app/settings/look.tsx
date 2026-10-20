import React from 'react';
import { View } from 'react-native';
import { LANGUAGES, useT } from '../../i18n';
import { useStore } from '../../store';
import { Page } from '../../ui/Page';
import { ThemePicker } from '../../ui/ThemePicker';
import { Txt } from '../../ui/Txt';
import { Card, Chip, Row, SectionTitle, Toggle } from '../../ui/kit';
import { haptic } from '../../ui/haptics';
import { sfx } from '../../ui/sfx';

export default function Look() {
  const t = useT();
  const lang = useStore((s) => s.settings.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const sounds = useStore((s) => s.settings.sounds !== false);
  const haptics = useStore((s) => s.settings.haptics !== false);
  const update = useStore((s) => s.updateSettings);
  return (
    <Page title={t('look.title')}>
      <SectionTitle>{t('look.theme')}</SectionTitle>
      <ThemePicker />
      <SectionTitle>{t('look.feel')}</SectionTitle>
      <Card weight="quiet" inner={{ padding: 4 }}>
        <Row
          title={t('look.sounds')}
          sub={t('look.soundsSub')}
          right={
            <Toggle
              value={sounds}
              label={t('look.sounds')}
              onChange={(v) => {
                update({ sounds: v });
                if (v) setTimeout(() => sfx.play('pop'), 60);
              }}
            />
          }
        />
        <Row
          title={t('look.haptics')}
          sub={t('look.hapticsSub')}
          right={
            <Toggle
              value={haptics}
              label={t('look.haptics')}
              onChange={(v) => {
                update({ haptics: v });
                if (v) setTimeout(() => haptic.medium(), 60);
              }}
            />
          }
        />
      </Card>
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
