import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

import { type BottomSheetHandleProps } from './bottomSheet.types';

export function BottomSheetHandle({ style }: BottomSheetHandleProps) {
  return <View style={[styles.handle, style]} />;
}

const styles = StyleSheet.create({
  handle: {
    width: 72,
    height: 4,
    alignSelf: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.gray[200],
  },
});
