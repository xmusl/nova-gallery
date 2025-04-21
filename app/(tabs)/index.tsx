import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, View, Pressable, Alert, Share, Platform } from 'react-native';
import { Link } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { GestureDetector, PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Search } from '@/components/Search';
import { useFavorites } from '@/hooks/useFavorites';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ImageViewer } from '@/components/ImageViewer';

const ITEMS_PER_PAGE = 50; // Increased from 30

const SortTypes = {
  DATE_DESC: 'Date (newest)',
  DATE_ASC: 'Date (oldest)',
  // ...
} as const;

const GalleryScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const [media, setMedia] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaLibrary.Asset | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [sortType, setSortType] = useState<keyof typeof SortTypes>('DATE_DESC');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const scale = useSharedValue(1);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, toggleFavorite } = useFavorites();

  const loadMedia = useCallback(async (after?: string) => {
    if (loadingMore || (after && !hasMore)) return;
    
    try {
      if (after) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setPage(1);
      }

      const { assets, hasNextPage } = await MediaLibrary.getAssetsAsync({
        first: ITEMS_PER_PAGE,
        after,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [sortType === 'DATE_ASC' ? [MediaLibrary.SortBy.creationTime, false] : [MediaLibrary.SortBy.creationTime, true]]
      });

      // Filter assets based on search query
      const filteredAssets = searchQuery
        ? assets.filter(asset => 
            asset.filename.toLowerCase().includes(searchQuery.toLowerCase()))
        : assets;

      setMedia(prev => after ? [...prev, ...filteredAssets] : filteredAssets);
      setHasMore(hasNextPage);
      if (after) {
        setPage(p => p + 1);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sortType, searchQuery]); // Add sortType and searchQuery to dependencies

  const onLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    const lastItem = media[media.length - 1];
    if (lastItem) {
      loadMedia(lastItem.id);
    }
  }, [loadMedia, media, loadingMore, hasMore]);

  useEffect(() => {
    MediaLibrary.requestPermissionsAsync().then(({ granted }) => {
      if (granted) loadMedia();
    });
  }, [loadMedia]);

  const pinchHandler = useCallback((event: PinchGestureHandlerGestureEvent) => {
    'worklet';
    scale.value = withSpring(Math.max(0.5, Math.min(event.nativeEvent.scale, 2)));
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const showSortOptions = () => {
    Alert.alert(
      'Sort Photos',
      'Choose sorting order',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: SortTypes.DATE_DESC,
          onPress: () => {
            setSortType('DATE_DESC');
            loadMedia(); // Reload with new sort
          }
        },
        {
          text: SortTypes.DATE_ASC,
          onPress: () => {
            setSortType('DATE_ASC');
            loadMedia(); // Reload with new sort
          }
        }
      ]
    );
  };

  const handleSelectPhoto = (id: string) => {
    if (isSelectionMode) {
      setSelectedPhotos((prev: Set<string>) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else {
      const asset = media.find(item => item.id === id);
      setSelectedAsset(asset ?? null);
    }
  };

  const handleDelete = async () => {
    if (selectedPhotos.size === 0) return;
    const success = await MediaLibrary.deleteAssetsAsync(Array.from(selectedPhotos));
    if (success) {
      setSelectedPhotos(new Set());
      setIsSelectionMode(false);
      loadMedia(); // Reload gallery
    }
  };

  const handleShare = async () => {
    if (selectedPhotos.size === 0) return;
    const assets = media.filter(item => selectedPhotos.has(item.id));
    try {
      if (Platform.OS === 'ios') {
        // For iOS, we need to share one at a time due to Share API limitations
        const promises = assets.map(asset => 
          Share.share({ url: asset.uri })
        );
        await Promise.all(promises);
      } else {
        // On Android, share first item only since multiple sharing is not well supported
        await Share.share({
          url: assets[0].uri
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={showSortOptions}>
          <MaterialIcons name="sort" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </Pressable>
        <View style={styles.headerActions}>
          {isSelectionMode ? (
            <>
              <Pressable onPress={handleShare} style={styles.headerButton}>
                <MaterialIcons name="share" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.headerButton}>
                <MaterialIcons name="delete" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </Pressable>
              <Pressable onPress={() => setIsSelectionMode(false)} style={styles.headerButton}>
                <MaterialIcons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setIsSelectionMode(true)} style={styles.headerButton}>
              <MaterialIcons name="select-all" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </Pressable>
          )}
        </View>
      </View>
      <Search onSearch={setSearchQuery} />

      <PinchGestureHandler onGestureEvent={pinchHandler}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <FlatList
            data={media}
            numColumns={3}
            contentContainerStyle={styles.list}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.2} // Decreased from 0.5 to prevent too early triggering
            removeClippedSubviews={true} // Changed to true for better performance
            maxToRenderPerBatch={10} // Decreased from 30 for smoother scrolling
            windowSize={5} // Decreased from 21 for better memory usage
            updateCellsBatchingPeriod={100}
            initialNumToRender={30}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" />
                  <ThemedText style={styles.loaderText}>Loading more...</ThemedText>
                </View>
              ) : null
            }
            ListEmptyComponent={
              !loading && (
                <View style={styles.emptyContainer}>
                  <ThemedText>No photos found</ThemedText>
                </View>
              )
            }
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.imageWrapper,
                  selectedPhotos.has(item.id) && styles.selectedImage
                ]}
                onPress={() => handleSelectPhoto(item.id)}
                onLongPress={() => setIsSelectionMode(true)}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.image}
                />
                {selectedPhotos.has(item.id) && (
                  <View style={styles.checkmark}>
                    <MaterialIcons name="check-circle" size={24} color={Colors[colorScheme ?? 'light'].tint} />
                  </View>
                )}
                {favorites.has(item.id) && (
                  <MaterialIcons
                    name="favorite"
                    size={24}
                    color="#ff0000"
                    style={styles.favoriteIcon}
                  />
                )}
              </Pressable>
            )}
            keyExtractor={item => item.id}
          />
        </Animated.View>
      </PinchGestureHandler>

      <ImageViewer
        isVisible={!!selectedAsset}
        uri={selectedAsset?.uri || ''}
        asset={selectedAsset || undefined}
        onClose={() => setSelectedAsset(null)}
      />
    </ThemedView>
  );
}

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    gap: 2,
    padding: 2,
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
  loader: {
    padding: 20,
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 8,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  selectedImage: {
    opacity: 0.7,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  favoriteIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
