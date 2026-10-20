import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useT } from '../../i18n';
import { useTheme } from '../../theme';
import { Page } from '../../ui/Page';
import { Txt } from '../../ui/Txt';
import { Btn, Card } from '../../ui/kit';
import { haptic } from '../../ui/haptics';

export const SHORTCUT_LINK = 'brokey://log?amount=AMOUNT&merchant=MERCHANT&method=tap';

export default function Shortcut() {
  const p = useTheme();
  const t = useT();
  const [copied, setCopied] = useState(false);
  const steps = ['sc.step1', 'sc.step2', 'sc.step3', 'sc.step4', 'sc.step5', 'sc.step6'] as const;
  return (
    <Page title={t('sc.title')}>
      <Txt v="body" dim>
        {t('sc.intro')}
      </Txt>
      <Card inner={{ gap: 16, padding: 16 }}>
        {steps.map((k, i) => (
          <View key={k} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: p.accent2, borderWidth: 2.5, borderColor: p.ink, alignItems: 'center', justifyContent: 'center' }}>
              <Txt v="num" size={15} color={p.onAccent2}>
                {i + 1}
              </Txt>
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Txt v="body">{t(k)}</Txt>
              {k === 'sc.step5' ? (
                <View style={{ gap: 8 }}>
                  <View style={{ backgroundColor: p.card2, borderRadius: 12, borderWidth: 2, borderColor: p.ink, padding: 10 }}>
                    <Txt v="small" selectable style={{ fontFamily: 'DMSans_700Bold' }}>
                      {SHORTCUT_LINK.replace(/&/g, '&\u200b')}
                    </Txt>
                  </View>
                  <Btn
                    label={copied ? t('sc.copied') : t('sc.copy')}
                    tone="yellow"
                    glyph={copied ? 'check' : 'copy'}
                    size="sm"
                    onPress={async () => {
                      await Clipboard.setStringAsync(SHORTCUT_LINK);
                      haptic.good();
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1800);
                    }}
                  />
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </Card>
      <Txt v="small" dim>
        {t('sc.note')}
      </Txt>
      <Txt v="small" faint>
        {t('sc.caveat')}
      </Txt>
    </Page>
  );
}
