import * as MediaLibrary from 'expo-media-library';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photo, setPhoto] = useState<MediaLibrary.Asset | null>(null);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    (async () => {
      const asset = await MediaLibrary.getAssetInfoAsync(id);
      setPhoto(asset);
    })();
  }, [id]);

  if (!photo) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const imageHeight = (height * 0.8);
  const scale = imageHeight / photo.height;
  const imageWidth = photo.width * scale;

  return (
    <>
      <Stack.Screen 
        options={{
          title: new Date(photo.creationTime).toLocaleDateString(),
          headerShown: true,
        }} 
      />
      <ThemedView style={styles.container}>
        <Image
          source={{ uri: photo.uri }}
          style={[styles.image, { width: imageWidth, height: imageHeight }]}
          resizeMode="contain"
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: '#ccc',
  },
});
