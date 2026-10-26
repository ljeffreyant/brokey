import React, { useEffect, useState } from 'react';
import { Modal, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../theme';
import { Brokey } from './Brokey';
import { Burst } from './Burst';
import { Txt } from './Txt';
import { Btn } from './kit';
import { haptic } from './haptics';
import { sfx } from './sfx';

/** A full-screen "you did the good thing" moment. */
export function Celebrate({ visible, title, body, cta, onClose }: { visible: boolean; title: string; body: string; cta: string; onClose: () => void }) {
  const p = useTheme();
  const { width: W } = useWindowDimensions();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!visible) return;
    haptic.good();
    sfx.play('fanfare');
    const a = setTimeout(() => setN((x) => x + 1), 250);
    const b = setTimeout(() => setN((x) => x + 1), 700);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [visible]);
  if (!visible) return null;
  const c = p.weather.sunny;
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: c.field, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <Animated.View entering={FadeIn.delay(80)} style={{ alignItems: 'center' }}>
          <Brokey mood="proud" pose="party" width={Math.min(W * 0.7, 280)} />
          <Burst x={W * 0.5 - 24} y={90} trigger={n} count={22} radius={W * 0.46} size={9} gravity={0.7} colors={['#FFF6E6', p.accent, '#7CC8FF', '#24120A', '#FF9E8F']} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(350)} style={{ alignItems: 'center', gap: 8 }}>
          <Txt v="display" color={c.text} align="center">
            {title}
          </Txt>
          <Txt v="body" color={c.textDim} align="center">
            {body}
          </Txt>
        </Animated.View>
        <Btn label={cta} tone="dark" size="lg" onPress={onClose} style={{ alignSelf: 'stretch', marginTop: 8 }} />
      </View>
    </Modal>
  );
}
