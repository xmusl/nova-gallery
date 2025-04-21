import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, Image, Pressable, ActivityIndicator, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ImageViewer } from '@/components/ImageViewer';
import { Stack } from 'expo-router';

const ITEMS_PER_PAGE = 50;

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [album, setAlbum] = useState<MediaLibrary.Album | null>(null);
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaLibrary.Asset | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadAssets = useCallback(async (after?: string) => {
    if (!album || (!after && isLoading) || (after && isLoadingMore)) return;

    try {
      if (after) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const { assets, hasNextPage } = await MediaLibrary.getAssetsAsync({
        first: ITEMS_PER_PAGE,
        after,
        album: {
          ...album,
          assetCount: album.assetCount || 0,
        },
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      setAssets((prev: MediaLibrary.Asset[]) => after ? [...prev, ...assets] : assets);
      setHasNextPage(hasNextPage);
    } catch (error) {
      console.error('Error loading album assets:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [album]);

  useEffect(() => {
    const initializeAlbum = async () => {
      if (!id) return;
      try {
        const albumData = await MediaLibrary.getAlbumAsync(id);
        if (albumData) {
          setAlbum(albumData);
          setIsLoading(true);
          const { assets, hasNextPage } = await MediaLibrary.getAssetsAsync({
            first: ITEMS_PER_PAGE,
            album: albumData,
            mediaType: MediaLibrary.MediaType.photo,
            sortBy: [MediaLibrary.SortBy.creationTime],
          });
          setAssets(assets);
          setHasNextPage(hasNextPage);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading album:', error);
        setIsLoading(false);
      }
    };

    initializeAlbum();
  }, [id]);

  const onEndReached = useCallback(() => {
    if (!hasNextPage || isLoadingMore || assets.length === 0) return;
    const lastAsset = assets[assets.length - 1];
    loadAssets(lastAsset.id);
  }, [hasNextPage, isLoadingMore, assets, loadAssets]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: selectedAsset?.creationTime ? new Date(selectedAsset.creationTime).toLocaleDateString() : 'Album' }} />
      <ThemedView style={styles.container}>
        <FlatList
          data={assets}
          numColumns={3}
          contentContainerStyle={styles.list}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isLoadingMore ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" />
            </View>
          ) : null}
          renderItem={({ item }) => (
            <Pressable
              style={styles.imageWrapper}
              onPress={() => setSelectedAsset(item)}
            >
              <Image
                source={{ uri: item.uri }}
                style={styles.image}
              />
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />

        <ImageViewer
          isVisible={!!selectedAsset}
          uri={selectedAsset?.uri || ''}
          asset={selectedAsset ?? undefined}
          onClose={() => setSelectedAsset(null)}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrapper: {
    flex: 1/3,
    aspectRatio: 1,
    padding: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  list: {
    gap: 2,
    padding: 2,
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
