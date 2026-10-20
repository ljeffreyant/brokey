import React from 'react';
import { useT } from '../../i18n';
import { useStore } from '../../store';
import { Page } from '../../ui/Page';
import { RoastPicker } from '../../ui/RoastPicker';

export default function RoastSettings() {
  const t = useT();
  const level = useStore((s) => s.settings.roastLevel);
  const update = useStore((s) => s.updateSettings);
  return (
    <Page title={t('roastset.title')}>
      <RoastPicker value={level} onChange={(l) => update({ roastLevel: l })} />
    </Page>
  );
}
