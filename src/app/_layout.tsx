import React, { useEffect } from 'react';
import { View } from 'react-native';
import { ErrorBoundaryProps, Stack, usePathname, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { useStore } from '../store';
import { ThemeProvider, useTheme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { useAuth, startAutoSync } from '../auth/store';
import { initNotifications } from '../notify';
import { CrashScreen } from '../ui/CrashScreen';
import { LockGate } from '../ui/LockGate';
import { useSmartAlerts } from '../ui/useSmartAlerts';
import { sfx } from '../ui/sfx';

function Shell() {
  const p = useTheme();
  const router = useRouter();
  const path = usePathname();
  const onboarded = useStore((s) => s.settings.onboarded);
  useSmartAlerts();

  useEffect(() => {
    if (!onboarded && path !== '/onboarding') router.replace('/onboarding');
  }, [onboarded, path]);

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <StatusBar style={p.statusBar} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: p.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="log" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="want" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="purchase/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="export" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="receipt" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      <LockGate />
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });
  const hydrated = useStore((s) => s.hydrated);
  useEffect(() => {
    if (hydrated) sfx.preload();
  }, [hydrated]);
  useEffect(() => {
    initNotifications();
    useAuth.getState().init();
    return startAutoSync();
  }, []);
  if (!loaded || !hydrated) return <View style={{ flex: 1, backgroundColor: '#16110E' }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Shell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** If any screen throws while drawing, show this instead of a white screen. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CrashScreen error={error} retry={retry} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
