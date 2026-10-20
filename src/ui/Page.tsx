import { useRouter } from 'expo-router';
import React, { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Header } from './kit';

/** The frame every settings sub-screen shares: back button, title, scrolling body. */
export function Page({ title, sub, children, right, onBack, gap = 14 }: { title: string; sub?: string; children: ReactNode; right?: ReactNode; onBack?: () => void; gap?: number }) {
  const p = useTheme();
  const router = useRouter();
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, paddingTop: ins.top }}>
      <Header title={title} sub={sub} right={right} onBack={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')))} />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: ins.bottom + 40, gap }}>
        {children}
      </ScrollView>
    </View>
  );
}
