import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

import { type FooterProps } from './footer.types';

export function Footer({ children, style }: FooterProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: 393,
    minHeight: 106,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    backgroundColor: colors.gray.white,
  },
});
