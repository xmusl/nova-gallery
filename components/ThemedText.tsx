import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Fonts, FontSizes, FontWeights } from '@/constants/Typography';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'heading';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'heading' ? styles.heading : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * 1.5,
    fontFamily: Fonts.body,
    fontWeight: FontWeights.regular,
  },
  defaultSemiBold: {
    fontSize: FontSizes.base,
    lineHeight: FontSizes.base * 1.5,
    fontFamily: Fonts.body,
    fontWeight: FontWeights.semibold,
  },
  title: {
    fontSize: FontSizes['3xl'],
    lineHeight: FontSizes['3xl'] * 1.2,
    fontFamily: Fonts.heading,
    fontWeight: FontWeights.bold,
  },
  subtitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.heading,
    fontWeight: FontWeights.medium,
  },
  heading: {
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.heading,
    fontWeight: FontWeights.bold,
  },
  link: {
    fontSize: FontSizes.base,
    lineHeight: 30,
    color: '#0a7ea4',
    fontFamily: Fonts.body,
    fontWeight: FontWeights.medium,
  },
});
