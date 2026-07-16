import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardCreateHeader } from '@/components/domain/schedule/card-create-header';
import { CardToast } from '@/components/domain/schedule/card-toast';
import { DueDurationSheet } from '@/components/domain/schedule/due-duration-sheet';
import { CardForm } from '@/components/features/create-card/card-form';
import { DateOnlyGuideModal } from '@/components/features/create-card/date-only-guide-modal';
import { DateTimeSheet } from '@/components/features/create-card/date-time-sheet';
import { LocationSheet } from '@/components/features/create-card/location-sheet';
import { RepeatCustomSheet } from '@/components/features/create-card/repeat-custom-sheet';
import { RepeatPresetSheet } from '@/components/features/create-card/repeat-preset-sheet';
import { TagPickerSheet } from '@/components/features/create-card/tag-picker-sheet';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';

import { useCardCreateForm } from './hooks/use-card-create-form';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const CONTENT_TOP = 100;
const FORM_GAP = spacing[6];

export function CardCreateScreen() {
  const {
    scrollRef,
    headerProps,
    formProps,
    tagPickerProps,
    dateTimeSheetProps,
    dateOnlyGuideProps,
    dueDurationSheetProps,
    repeatPresetSheetProps,
    repeatCustomSheetProps,
    locationSheetProps,
    toastProps,
  } = useCardCreateForm();

  return (
    <ScreenLayout
      backgroundColor={colors.surface}
      contentStyle={styles.screenContent}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <View style={styles.canvas}>
        <CardCreateHeader {...headerProps} />

        <ScrollView
          ref={scrollRef}
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <CardForm {...formProps} />
        </ScrollView>

        <TagPickerSheet {...tagPickerProps} />
        <DateTimeSheet {...dateTimeSheetProps} />
        <DateOnlyGuideModal {...dateOnlyGuideProps} />
        <DueDurationSheet {...dueDurationSheetProps} />
        <RepeatPresetSheet {...repeatPresetSheetProps} />
        <RepeatCustomSheet {...repeatCustomSheetProps} />
        <LocationSheet {...locationSheetProps} />
      </View>
      {toastProps != null ? <CardToast {...toastProps} /> : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  canvas: {
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH,
    flex: 1,
    alignSelf: 'center',
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: FORM_GAP,
    paddingTop: CONTENT_TOP,
    paddingBottom: spacing[16],
  },
});
