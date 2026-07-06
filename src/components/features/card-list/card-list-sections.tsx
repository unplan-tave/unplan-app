import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

import { CardListGridItem } from './card-list-grid-item';

import type { CardListMonthSection } from '@/domains/schedule/list';
import type { PersonalTagOption } from '@/domains/schedule/model';

interface CardListSectionsProps {
  sections: CardListMonthSection[];
  personalTags: PersonalTagOption[];
  onCardPress: (cardId: string) => void;
}

export function CardListSections({ sections, personalTags, onCardPress }: CardListSectionsProps) {
  return sections.map((section) => (
    <View key={section.monthKey} style={styles.section}>
      <Typography variant="caption" color={colors.gray.white} style={styles.headerLabel}>
        {section.monthLabel}
      </Typography>
      <View style={styles.grid}>
        {section.cards.map((card) => (
          <View key={card.id} style={styles.gridItem}>
            <CardListGridItem card={card} personalTags={personalTags} onPress={onCardPress} />
          </View>
        ))}
      </View>
    </View>
  ));
}

const styles = StyleSheet.create({
  headerLabel: {
    textShadowColor: colors.alpha.black35,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  section: {
    gap: spacing[2],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  gridItem: {
    flexBasis: '48%',
    flexGrow: 1,
    maxWidth: '49%',
  },
});
