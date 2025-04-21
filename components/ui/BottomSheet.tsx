import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

type Props = {
  children: React.ReactNode;
  translateY: Animated.SharedValue<number>;
  onPositionChange?: (isOpen: boolean) => void;
};

export function BottomSheet({ children, translateY, onPositionChange }: Props) {
  const insets = useSafeAreaInsets();

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateY.value = Math.max(
        MAX_TRANSLATE_Y,
        Math.min(0, context.startY + event.translationY)
      );
    },
    onEnd: () => {
      const isOpen = translateY.value < -SCREEN_HEIGHT / 3;
      if (isOpen) {
        translateY.value = withSpring(MAX_TRANSLATE_Y);
      } else {
        translateY.value = withSpring(0);
      }
      if (onPositionChange) {
        runOnJS(onPositionChange)(isOpen);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View 
        style={[
          styles.bottomSheet, 
          animatedStyle, 
          { paddingBottom: insets.bottom + 20 }
        ]}
      >
        <View style={styles.dragHandle} />
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    top: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 2,
  },
});
