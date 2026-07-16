import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { spacing } from '@/constants/theme';

import { CARD_META_LINE_HEIGHT } from './card-list-typography';

export function CardListMetaRow({
  primary,
  secondary,
  color,
  dividerColor,
}: {
  primary: string;
  secondary: string | null;
  color: string;
  dividerColor: string;
}) {
  return (
    <View style={styles.row}>
      <Typography variant="caption" color={color} numberOfLines={1} style={styles.text}>
        {primary}
      </Typography>
      {secondary != null ? (
        <>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          <Typography variant="caption" color={color} numberOfLines={1} style={styles.text}>
            {secondary}
          </Typography>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  text: {
    lineHeight: CARD_META_LINE_HEIGHT,
  },
  divider: {
    width: 1,
    height: 10,
  },
});
