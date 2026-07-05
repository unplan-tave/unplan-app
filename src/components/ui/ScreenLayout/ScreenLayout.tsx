import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

import { type ScreenLayoutProps } from './screenLayout.types';

export function ScreenLayout({
  children,
  backgroundColor = colors.surface,
  contentStyle,
  footer,
  header,
  style,
  useSafeArea = true,
}: ScreenLayoutProps) {
  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <Container style={[styles.container, { backgroundColor }, style]}>
      {header}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
