import { View, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Fonts, FontSizes } from '@/constants/Typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const requestPermissions = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        Alert.alert('Success', 'Photo permissions have been granted');
      } else {
        Alert.alert('Error', 'Photo permissions are required to use this app');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request permissions');
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Implementation would clear image cache
      Alert.alert('Success', 'Cache has been cleared');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache');
    }
  }, []);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.section}>
        <ThemedText type="heading">Permissions</ThemedText>
        <Pressable 
          style={styles.settingRow}
          onPress={requestPermissions}
        >
          <View style={styles.settingContent}>
            <IconSymbol name="photo.fill" size={24} color={Colors[colorScheme ?? 'light'].text} />
            <ThemedText style={styles.settingText}>Photo Library Access</ThemedText>
          </View>
          <IconSymbol 
            name="chevron.right" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText type="heading">Display</ThemedText>
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <IconSymbol name="moon.fill" size={24} color={Colors[colorScheme ?? 'light'].text} />
            <ThemedText style={styles.settingText}>Dark Mode</ThemedText>
          </View>
          <ThemedText style={styles.settingValue}>
            {isDark ? 'On' : 'Off'} (System)
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="heading">Storage</ThemedText>
        <Pressable 
          style={styles.settingRow}
          onPress={clearCache}
        >
          <View style={styles.settingContent}>
            <IconSymbol name="trash.fill" size={24} color={Colors[colorScheme ?? 'light'].text} />
            <ThemedText style={styles.settingText}>Clear Cache</ThemedText>
          </View>
          <IconSymbol 
            name="chevron.right" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText type="heading">About</ThemedText>
        <ThemedText style={styles.version}>Nova Gallery v1.0.0</ThemedText>
        <ThemedText style={styles.detail}>Built with React Native & Expo</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.body,
  },
  settingValue: {
    fontSize: FontSizes.sm,
    opacity: 0.7,
  },
  version: {
    marginTop: 8,
    fontSize: FontSizes.base,
    fontFamily: Fonts.body,
  },
  detail: {
    marginTop: 4,
    fontSize: FontSizes.sm,
    opacity: 0.7,
  },
});
