import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Tag } from '@/components/ui/Tag';
import { type ConditionType } from '@/components/ui/Tag/tag.types';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, typography, type TypographyVariant } from '@/constants/theme';

const TYPOGRAPHY_VARIANTS = Object.keys(typography) as TypographyVariant[];

const CONDITION_TAGS: { condition: ConditionType; label: string }[] = [
  { condition: 'brain', label: '두뇌 활동' },
  { condition: 'labor', label: '단순 노동' },
  { condition: 'daily', label: '일상 작업' },
  { condition: 'urgent', label: '긴급 처리' },
  { condition: 'rest', label: '기력 회복' },
  { condition: 'core', label: '핵심 작업' },
];

export function PlaygroundScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="titleL">Design System Playground</Typography>
        <Typography variant="bodyS" color={colors.text.secondary}>
          개발용 화면 — Typography, Tag 컴포넌트 미리보기
        </Typography>

        <View style={styles.section}>
          <Typography variant="titleS">Typography</Typography>
          {TYPOGRAPHY_VARIANTS.map((variant) => (
            <View key={variant} style={styles.typographyRow}>
              <Typography
                variant="caption"
                color={colors.text.tertiary}
                style={styles.variantLabel}
              >
                {variant}
              </Typography>
              <Typography variant={variant}>Unplan 스마트 스케줄러 {variant}</Typography>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Typography variant="titleS">Tag — Condition</Typography>
          <View style={styles.tagRow}>
            {CONDITION_TAGS.map(({ condition, label }) => (
              <Tag key={condition} variant="condition" condition={condition} label={label} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="titleS">Tag — Personal</Typography>
          <View style={styles.tagRow}>
            <Tag variant="personal" label="개인 일정" />
            <Tag variant="personal" label="메모" />
            <Tag variant="personal" label="루틴" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing[4],
    gap: spacing[6],
  },
  section: {
    gap: spacing[3],
  },
  typographyRow: {
    gap: spacing[1],
    paddingBottom: spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  variantLabel: {
    textTransform: 'uppercase',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
});
