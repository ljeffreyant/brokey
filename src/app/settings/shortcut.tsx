import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useT } from '../../i18n';
import { useTheme } from '../../theme';
import { Page } from '../../ui/Page';
import { Txt } from '../../ui/Txt';
import { Btn, Card } from '../../ui/kit';
import { haptic } from '../../ui/haptics';
import { puff } from '../../ui/clay';

export const SHORTCUT_LINK = 'brokey://log?amount=AMOUNT&merchant=MERCHANT&method=tap';
/** Just opens the log screen, for the Action Button, Back Tap or Siri. */
export const QUICK_LINK = 'brokey://log';

export default function Shortcut() {
  const p = useTheme();
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);
  const steps = ['sc.step1', 'sc.step2', 'sc.step3', 'sc.step4', 'sc.step5', 'sc.step6'] as const;
  return (
    <Page title={t('sc.title')}>
      <Txt v="body" dim>
        {t('sc.intro')}
      </Txt>
      <Card weight="quiet" inner={{ gap: 16, padding: 16 }}>
        {steps.map((k, i) => (
          <View key={k} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: p.accent2, alignItems: 'center', justifyContent: 'center', ...puff(p, p.accent2, 3) }}>
              <Txt v="num" size={15} color={p.onAccent2}>
                {i + 1}
              </Txt>
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Txt v="body">{t(k)}</Txt>
              {k === 'sc.step5' ? (
                <View style={{ gap: 8 }}>
                  <View style={{ backgroundColor: p.card2, borderRadius: 12, padding: 10, ...puff(p, p.card2, 2) }}>
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

      <Txt v="title" style={{ marginTop: 8 }}>
        {t('fast.title')}
      </Txt>
      <Txt v="body" dim>
        {t('fast.intro')}
      </Txt>
      <Card weight="quiet" inner={{ gap: 14, padding: 16 }}>
        {(['fast.s1', 'fast.s2', 'fast.s3', 'fast.s4'] as const).map((k, i) => (
          <View key={k} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: p.accent2, alignItems: 'center', justifyContent: 'center', ...puff(p, p.accent2, 3) }}>
              <Txt v="num" size={15} color={p.onAccent2}>
                {i + 1}
              </Txt>
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Txt v="body">{t(k)}</Txt>
              {k === 'fast.s1' ? (
                <View style={{ gap: 8 }}>
                  <View style={{ backgroundColor: p.card2, borderRadius: 12, padding: 10, ...puff(p, p.card2, 2) }}>
                    <Txt v="small" selectable style={{ fontFamily: 'DMSans_700Bold' }}>
                      {QUICK_LINK}
                    </Txt>
                  </View>
                  <Btn
                    label={quickCopied ? t('sc.copied') : t('fast.copy')}
                    tone="yellow"
                    glyph={quickCopied ? 'check' : 'copy'}
                    size="sm"
                    onPress={async () => {
                      await Clipboard.setStringAsync(QUICK_LINK);
                      haptic.good();
                      setQuickCopied(true);
                      setTimeout(() => setQuickCopied(false), 1800);
                    }}
                  />
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </Card>
      <Txt v="small" faint>
        {t('sc.caveat')}
      </Txt>
    </Page>
  );
}
