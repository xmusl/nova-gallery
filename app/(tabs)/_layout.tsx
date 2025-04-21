import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Fonts, FontSizes } from '@/constants/Typography';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: colorScheme === 'dark' ? 'rgba(21,23,24,0.8)' : 'rgba(255,255,255,0.8)',
          height: 60,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Photos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="photo.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="albums"
        options={{
          title: 'Albums',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
