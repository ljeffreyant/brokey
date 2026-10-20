import React, { useState } from 'react';
import { View } from 'react-native';
import { dayTs } from '../core/week';
import { useT } from '../i18n';
import { Sheet } from './Sheet';
import { Chip } from './kit';
import { haptic } from './haptics';
import { formatDate, formatDayName, useFmt } from './useFmt';

/** How far back the picker lists days. */
export const PAST_DAYS = 30;

export { dayTs, daysAgoOf } from '../core/week';

/** Today / Yesterday / Pick a day, plus a sheet with the last 30 days. */
export function DayChips({ daysAgo, onChange }: { daysAgo: number; onChange: (n: number) => void }) {
  const t = useT();
  const f = useFmt();
  const [open, setOpen] = useState(false);
  const name = (n: number) => `${formatDayName(dayTs(n), f.lang, 'short')} ${formatDate(dayTs(n), f.lang)}`;
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip small label={t('log.today')} on={daysAgo === 0} onPress={() => onChange(0)} />
        <Chip small label={t('log.yesterday')} on={daysAgo === 1} onPress={() => onChange(1)} />
        <Chip small glyph="calendar" label={daysAgo > 1 ? name(daysAgo) : t('log.pickDay')} on={daysAgo > 1} onPress={() => setOpen(true)} />
      </View>
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('log.pickDayTitle')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 }}>
          {Array.from({ length: PAST_DAYS }, (_, n) => (
            <Chip
              key={n}
              small
              on={daysAgo === n}
              label={n === 0 ? t('log.today') : n === 1 ? t('log.yesterday') : name(n)}
              onPress={() => {
                haptic.soft();
                onChange(n);
                setOpen(false);
              }}
            />
          ))}
        </View>
      </Sheet>
    </>
  );
}
