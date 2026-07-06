import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardCreateHeader } from '@/components/domain/schedule/card-create-header';
import { CardToast } from '@/components/domain/schedule/card-toast';
import { CardViewHeader } from '@/components/features/card-view/card-view-header';
import { PinViewBody } from '@/components/features/card-view/pin-view-body';
import { QueueViewBody } from '@/components/features/card-view/queue-view-body';
import { ConvertToPinBottomSheet } from '@/components/features/queue-to-pin/convert-to-pin-sheet';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';

import { useCardViewScreen } from './hooks/use-card-view-screen';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const CONTENT_TOP = 100;
const FORM_GAP = spacing[6];

export function CardViewScreen() {
  const {
    card,
    conditionTag,
    cardPersonalTags,
    isConvertSheetVisible,
    toast,
    handleBack,
    handleEdit,
    openConvertSheet,
    closeConvertSheet,
    handleConvert,
    handleEditDuration,
    closeToast,
  } = useCardViewScreen();

  if (card == null || conditionTag == null) {
    return null;
  }

  return (
    <ScreenLayout
      backgroundColor={colors.surface}
      contentStyle={styles.screenContent}
      useSafeArea={false}
    >
      <StatusBar style="dark" />
      <View style={styles.canvas}>
        <CardCreateHeader
          variant="view"
          cardType={card.cardType}
          doneEnabled
          onClose={handleBack}
          onDone={handleEdit}
        />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <CardViewHeader
            title={card.title}
            conditionTag={conditionTag}
            personalTags={cardPersonalTags}
          />

          {card.cardType === 'queue' ? (
            <QueueViewBody card={card} onOpenConvertSheet={openConvertSheet} />
          ) : (
            <PinViewBody card={card} />
          )}
        </ScrollView>
      </View>

      <ConvertToPinBottomSheet
        visible={isConvertSheetVisible}
        card={card}
        onClose={closeConvertSheet}
        onConvert={handleConvert}
        onEditDuration={handleEditDuration}
      />
      {toast != null ? (
        <CardToast
          message={toast.message}
          variant={toast.variant}
          onClose={closeToast}
          onConfirm={closeToast}
        />
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenContent: {
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
