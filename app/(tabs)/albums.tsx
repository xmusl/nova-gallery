import { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, FlatList, Alert, ActionSheetIOS, Image } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Fonts, FontSizes, FontWeights } from '@/constants/Typography';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AlbumWithPreview = MediaLibrary.Album & {
  previewAsset?: MediaLibrary.Asset;
};

export default function AlbumsScreen() {
  const insets = useSafeAreaInsets();
  const [albums, setAlbums] = useState<AlbumWithPreview[]>([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is needed to view albums');
      return;
    }

    try {
      const albums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true
      });

      const albumsWithPreviews = await Promise.all(
        albums.map(async (album) => {
          try {
            const { assets, totalCount } = await MediaLibrary.getAssetsAsync({
              first: 1,
              album: album,
              sortBy: [MediaLibrary.SortBy.creationTime],
            });

            return {
              ...album,
              previewAsset: assets[0],
              assetCount: totalCount
            };
          } catch (error) {
            console.error(`Error loading preview for album ${album.title}:`, error);
            return album;
          }
        })
      );

      setAlbums(albumsWithPreviews.sort((a, b) => (b.assetCount || 0) - (a.assetCount || 0)));
    } catch (error) {
      console.error('Error loading albums:', error);
      Alert.alert('Error', 'Failed to load albums');
    }
  };

  const createAlbum = async () => {
    try {
      const result = await new Promise<string | undefined>((resolve) => {
        Alert.prompt(
          'Create Album',
          'Enter album name:',
          [
            {
              text: 'Cancel',
              onPress: () => resolve(undefined),
              style: 'cancel',
            },
            {
              text: 'Create',
              onPress: (name?: string) => resolve(name?.trim()),
            },
          ],
          'plain-text'
        );
      });

      if (!result) return;

      await MediaLibrary.createAlbumAsync(result);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      loadAlbums(); // Refresh albums list
    } catch (error) {
      console.error('Error creating album:', error);
      Alert.alert('Error', 'Failed to create album');
    }
  };

  const handleAlbumPress = (albumId: string) => {
    router.push({
      pathname: '/album/[id]',
      params: { id: albumId }
    });
  };

  const handleAlbumLongPress = async (album: MediaLibrary.Album) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Delete Album'],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          try {
            await MediaLibrary.deleteAlbumsAsync([album]);
            loadAlbums(); // Refresh the list
          } catch (error) {
            Alert.alert('Error', 'Failed to delete album');
          }
        }
      }
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <ThemedText style={styles.headerTitle}>Albums</ThemedText>
        <Pressable 
          onPress={createAlbum} 
          style={({ pressed }) => [
            styles.createButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <MaterialIcons name="add" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </Pressable>
      </View>

      <FlatList
        data={albums}
        numColumns={2}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable 
            style={({ pressed }) => [
              styles.album,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => handleAlbumPress(item.id)}
            onLongPress={() => handleAlbumLongPress(item)}
          >
            <View style={styles.albumPreview}>
              {item.previewAsset ? (
                <Image
                  source={{ uri: item.previewAsset.uri }}
                  style={styles.previewImage}
                />
              ) : (
                <MaterialIcons 
                  name="photo-library" 
                  size={40} 
                  color={Colors[colorScheme ?? 'light'].text} 
                />
              )}
            </View>
            <ThemedText style={styles.albumTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.albumCount}>{item.assetCount} photos</ThemedText>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons 
              name="photo-album" 
              size={48} 
              color={Colors[colorScheme ?? 'light'].icon} 
            />
            <ThemedText style={styles.emptyText}>No albums yet</ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: FontSizes['3xl'],
    fontFamily: Fonts.heading,
    fontWeight: FontWeights.bold,
  },
  list: {
    padding: 12,
  },
  album: {
    flex: 1/2,
    margin: 8,
    alignItems: 'center',
  },
  albumPreview: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  albumCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: FontSizes.base,
    opacity: 0.7,
  }
});
