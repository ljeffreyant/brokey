import React, { ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Txt } from './Txt';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** share of the screen height the sheet may use */
  maxH?: number;
}

/** A bottom sheet that springs up. Used for pickers and quick edits. */
export function Sheet({ visible, onClose, title, children, maxH = 0.86 }: SheetProps) {
  const p = useTheme();
  const ins = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const y = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      y.value = withSpring(0, { damping: 20, stiffness: 240, mass: 0.9 });
      return;
    }
    y.value = withTiming(1, { duration: 190 });
    const id = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(id);
  }, [visible]);

  const back = useAnimatedStyle(() => ({ opacity: 1 - y.value }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.value * (height * 0.9) }] }));

  if (!mounted) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(8,4,2,0.55)' }, back]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
        </Animated.View>
        <Animated.View
          style={[
            {
              backgroundColor: p.bg,
              borderTopLeftRadius: 34,
              borderTopRightRadius: 34,
              borderWidth: 2.5,
              borderBottomWidth: 0,
              borderColor: p.ink,
              maxHeight: height * maxH,
              paddingBottom: ins.bottom + 12,
            },
            sheet,
          ]}
        >
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
            <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: p.line }} />
          </View>
          {title ? (
            <View style={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 10 }}>
              <Txt v="title">{title}</Txt>
            </View>
          ) : null}
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
