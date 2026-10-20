import React from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '../../ui/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="cooling" />
      <Tabs.Screen name="shelf" />
      <Tabs.Screen name="week" />
    </Tabs>
  );
}
