import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = {
  name: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
  color?: string;
};

export function IconButton({ name, onPress, size = 24, style, color }: Props) {
  const colorScheme = useColorScheme();
  const iconColor = color ?? Colors[colorScheme ?? 'light'].text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <MaterialIcons name={name} size={size} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
