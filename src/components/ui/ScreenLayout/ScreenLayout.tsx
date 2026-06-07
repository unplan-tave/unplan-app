import { SafeAreaView, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

import { type ScreenLayoutProps } from './screenLayout.types';

export function ScreenLayout({
  children,
  backgroundColor = colors.surface,
  contentStyle,
  footer,
  header,
  style,
}: ScreenLayoutProps) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      {header}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer}
    </SafeAreaView>
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
