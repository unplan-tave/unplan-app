import { Controller, type Control } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import {
  type ConditionTagOption,
  type PersonalTagOption,
  type CardFormValues,
} from '@/domains/schedule/model';

const CONTENT_MAX_WIDTH = 353;
const REQUIRED_MARK_SIZE = 14;
const ADD_TAG_PADDING_H = 5;
const ADD_TAG_PADDING_V = 1;

export function CardFormHeader({
  control,
  primaryTag,
  personalTags,
  tagFeedback,
  showTitleError,
  onOpenConditionTag,
  onOpenPersonalTags,
}: {
  control: Control<CardFormValues>;
  primaryTag: ConditionTagOption;
  personalTags: PersonalTagOption[];
  tagFeedback: 'none' | 'success' | 'error';
  showTitleError: boolean;
  onOpenConditionTag: () => void;
  onOpenPersonalTags: () => void;
}) {
  return (
    <View style={styles.head}>
      <View style={styles.titleRow}>
        <Controller
          control={control}
          name="title"
          rules={{
            validate: (value) => (value ?? '').trim().length > 0,
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              accessibilityLabel="일정 제목 입력"
              value={value}
              placeholder="일정 제목"
              placeholderTextColor={showTitleError ? colors.secondary : colors.gray[400]}
              style={[
                styles.titleInput,
                (value ?? '').trim().length > 0 && styles.titleInputFilled,
                showTitleError && styles.titleInputError,
              ]}
              onChangeText={onChange}
            />
          )}
        />
        <Typography variant="display" color={colors.secondary} style={styles.requiredTitle}>
          *
        </Typography>
      </View>
      <View style={styles.tagRow}>
        <Tag
          variant="condition"
          condition={primaryTag.id}
          label={primaryTag.label}
          accessibilityLabel="조건 태그 변경"
          onPress={onOpenConditionTag}
        />
        <Pressable
          accessibilityLabel="개인 태그 선택"
          accessibilityRole="button"
          style={({ pressed }) => [styles.addPersonalTag, pressed && styles.pressed]}
          onPress={onOpenPersonalTags}
        >
          <Typography variant="tag" color={colors.gray[700]} style={styles.tagText}>
            + 개인태그
          </Typography>
        </Pressable>
        {personalTags.map((tag) => (
          <Tag
            key={tag.id}
            variant="personal"
            label={tag.label}
            accessibilityLabel={`${tag.label} 개인 태그 편집`}
            onPress={onOpenPersonalTags}
          />
        ))}
      </View>
      <TagFeedback state={tagFeedback} />
    </View>
  );
}

function TagFeedback({ state }: { state: 'none' | 'success' | 'error' }) {
  if (state === 'error') {
    return (
      <Typography variant="tag" color={colors.secondary} style={styles.feedbackText}>
        어울리는 컨디션 태그를 찾지 못했어요. 직접 선택해 주세요
      </Typography>
    );
  }

  if (state === 'success') {
    return (
      <Typography variant="tag" color={colors.gray[300]} style={styles.feedbackText}>
        일정 제목을 바탕으로 어울리는 컨디션 태그를 골랐어요!
      </Typography>
    );
  }

  return <View style={styles.feedbackSpacer} />;
}

const styles = StyleSheet.create({
  head: {
    width: '100%',
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[1],
  },
  titleInput: {
    ...typography.display,
    minWidth: 0,
    maxWidth: CONTENT_MAX_WIDTH - spacing[8],
    flexShrink: 1,
    padding: spacing[0],
    color: colors.gray[800],
  },
  titleInputFilled: {
    color: colors.gray[900],
  },
  titleInputError: {
    color: colors.secondary,
  },
  requiredTitle: {
    width: REQUIRED_MARK_SIZE,
    lineHeight: 38,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    overflow: 'hidden',
  },
  addPersonalTag: {
    minHeight: 20,
    justifyContent: 'center',
    paddingHorizontal: ADD_TAG_PADDING_H,
    paddingVertical: ADD_TAG_PADDING_V,
    borderRadius: radius.xs,
    backgroundColor: colors.gray[200],
    opacity: 0.5,
  },
  tagText: {
    opacity: 0.6,
  },
  feedbackSpacer: {
    height: 19,
  },
  feedbackText: {
    height: 19,
  },
  pressed: {
    opacity: 0.72,
  },
});
