import { Modal, StyleSheet, Image, Dimensions, Pressable, Share, View } from 'react-native';
import { PinchGestureHandler, PinchGestureHandlerGestureEvent, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from './ThemedText';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { formatFileSize, formatDate } from '@/utils/format';
import { Fonts, FontSizes } from '@/constants/Typography';

const { width: WINDOW_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

type AssetWithMetadata = MediaLibrary.Asset & {
  fileSize?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  uri: string;
  asset?: MediaLibrary.Asset;
};

export function ImageViewer({ isVisible, onClose, uri, asset }: Props) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const insets = useSafeAreaInsets();
  const [metadata, setMetadata] = useState<AssetWithMetadata | null>(null);
  const bottomSheetTranslateY = useSharedValue(0);

  useEffect(() => {
    if (asset?.id) {
      MediaLibrary.getAssetInfoAsync(asset.id).then(setMetadata);
    }
  }, [asset]);

  const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive: (event) => {
      'worklet';
      scale.value = savedScale.value * event.scale;
    },
    onEnd: () => {
      'worklet';
      savedScale.value = scale.value;
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const handleShare = async () => {
    try {
      await Share.share({
        url: uri,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleInfoPress = () => {
    bottomSheetTranslateY.value = withSpring(MAX_TRANSLATE_Y);
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={[styles.header, { marginTop: insets.top }]}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="white" />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.shareButton}>
              <MaterialIcons name="share" size={24} color="white" />
            </Pressable>
          </View>

          {/* Image */}
          <PinchGestureHandler onGestureEvent={pinchHandler}>
            <Animated.View style={[styles.imageContainer, animatedStyle]}>
              <Image source={{ uri }} style={styles.image} resizeMode="contain" />
            </Animated.View>
          </PinchGestureHandler>

          {/* Info Button */}
          <Pressable 
            style={[styles.infoButton, { bottom: insets.bottom + 20 }]}
            onPress={handleInfoPress}
          >
            <MaterialIcons name="info" size={24} color="white" />
          </Pressable>

          {/* Bottom Sheet */}
          {metadata && (
            <BottomSheet translateY={bottomSheetTranslateY}>
              <View style={styles.infoSection}>
                <ThemedText style={styles.infoTitle}>Information</ThemedText>
                <View style={styles.infoRow}>
                  <MaterialIcons name="calendar-today" size={20} color="white" />
                  <ThemedText style={styles.infoText}>
                    {formatDate(metadata.creationTime)}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="photo-size-select-actual" size={20} color="white" />
                  <ThemedText style={styles.infoText}>
                    {metadata.width} × {metadata.height}
                  </ThemedText>
                </View>
                {metadata.fileSize && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="storage" size={20} color="white" />
                    <ThemedText style={styles.infoText}>
                      {formatFileSize(metadata.fileSize)}
                    </ThemedText>
                  </View>
                )}
                {metadata.location && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={20} color="white" />
                    <ThemedText style={styles.infoText}>
                      {metadata.location.latitude.toFixed(6)}, {metadata.location.longitude.toFixed(6)}
                    </ThemedText>
                  </View>
                )}
              </View>
            </BottomSheet>
          )}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    width: WINDOW_WIDTH,
    height: SCREEN_HEIGHT,
  },
  infoButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  infoSection: {
    gap: 16,
  },
  infoTitle: {
    color: 'white',
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    color: 'white',
    fontSize: FontSizes.base,
    fontFamily: Fonts.body,
  },
});
