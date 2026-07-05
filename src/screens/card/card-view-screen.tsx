import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardCreateHeader } from '@/components/features/card/card-create-header';
import { CardToast } from '@/components/features/card/card-toast';
import { CardViewHeader } from '@/components/features/card-view/card-view-header';
import { PinViewBody } from '@/components/features/card-view/pin-view-body';
import { QueueViewBody } from '@/components/features/card-view/queue-view-body';
import { ConvertToPinBottomSheet } from '@/components/features/queue-to-pin/convert-to-pin-sheet';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import { type CardFormValues, getConditionTagById } from '@/domains/card/model';
import { useCardStore } from '@/domains/card/use-card-store';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const CONTENT_TOP = 100;
const FORM_GAP = spacing[6];

type ToastState = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

export function CardViewScreen() {
  const { cardId, toast: toastParam } = useLocalSearchParams<{ cardId: string; toast?: string }>();
  const card = useCardStore((store) => store.cards.find((c) => c.id === cardId));
  const personalTags = useCardStore((store) => store.personalTags);
  const createCard = useCardStore((store) => store.createCard);
  const convertQueueToPinCard = useCardStore((store) => store.convertQueueToPinCard);
  const [isConvertSheetVisible, setIsConvertSheetVisible] = useState(false);
  const [toast, setToast] = useState<ToastState>(() =>
    toastParam === 'created' ? { message: '핀카드가 생성됐어요!', variant: 'confirm' } : null,
  );

  const handleBack = useCallback(() => {
    router.replace('/(tabs)');
  }, []);
  const handleEdit = useCallback(() => {
    router.push(`/card/card-detail?cardId=${cardId}`);
  }, [cardId]);

  const handleOpenConvertSheet = useCallback(() => {
    setIsConvertSheetVisible(true);
  }, []);

  const handleConvert = useCallback(
    (values: CardFormValues, keepOriginal: boolean) => {
      if (cardId == null) return;

      setIsConvertSheetVisible(false);

      if (keepOriginal) {
        const newCard = createCard('pin', values);
        router.push(`/card/view?cardId=${newCard.id}&toast=created`);
      } else {
        convertQueueToPinCard(cardId, values);
        setToast({ message: '핀카드로 전환됐어요!', variant: 'confirm' });
      }
    },
    [cardId, createCard, convertQueueToPinCard],
  );

  const handleEditDuration = useCallback(() => {
    setIsConvertSheetVisible(false);
    router.push(`/card/card-detail?cardId=${cardId}`);
  }, [cardId]);

  useEffect(() => {
    if (toast == null) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, 3_000);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (card == null) {
      router.replace('/(tabs)');
    }
  }, [card]);

  if (card == null) {
    return null;
  }

  const conditionTag = getConditionTagById(card.conditionTagId);
  const cardPersonalTags = personalTags.filter((tag) => card.personalTagIds.includes(tag.id));

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
            <QueueViewBody card={card} onOpenConvertSheet={handleOpenConvertSheet} />
          ) : (
            <PinViewBody card={card} />
          )}
        </ScrollView>
      </View>

      <ConvertToPinBottomSheet
        visible={isConvertSheetVisible}
        card={card}
        onClose={() => setIsConvertSheetVisible(false)}
        onConvert={handleConvert}
        onEditDuration={handleEditDuration}
      />
      {toast != null ? (
        <CardToast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          onConfirm={() => setToast(null)}
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
