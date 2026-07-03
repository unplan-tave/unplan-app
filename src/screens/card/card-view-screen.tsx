import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardCreateHeader } from '@/components/card/card-create-header';
import { CardToast } from '@/components/card/card-toast';
import { CardViewHeader } from '@/components/card/card-view-header';
import { PinViewBody } from '@/components/card/pin-view-body';
import { QueueCardViewBody } from '@/components/card/queue-card-view-body';
import { RecommendTimeModal } from '@/components/card/recommend-time-modal';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import { getConditionTagById } from '@/state/card/model';
import { useCardStore } from '@/state/card/use-card-store';

const SCREEN_MAX_WIDTH = 393;
const CONTENT_MAX_WIDTH = 353;
const CONTENT_TOP = 100;
const FORM_GAP = spacing[6];

type ToastState = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

export function CardViewScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const card = useCardStore((store) => store.cards.find((c) => c.id === cardId));
  const personalTags = useCardStore((store) => store.personalTags);
  const patchCard = useCardStore((store) => store.patchCard);
  const [isRecommendModalVisible, setIsRecommendModalVisible] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const handleBack = useCallback(() => router.back(), []);
  const handleEdit = useCallback(() => {
    router.push(`/card/card-detail?cardId=${cardId}`);
  }, [cardId]);

  const handleOpenRecommendModal = useCallback(() => {
    setIsRecommendModalVisible(true);
  }, []);

  const handleCloseRecommendModal = useCallback(() => {
    setIsRecommendModalVisible(false);
  }, []);

  const handleConfirmRecommendation = useCallback(() => {
    if (cardId == null) {
      return;
    }

    patchCard(cardId, { recommendationAcknowledged: true });
    setIsRecommendModalVisible(false);
    setToast({ message: '추천 시간을 확인했어요!', variant: 'confirm' });
  }, [cardId, patchCard]);

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
      router.back();
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
            <QueueCardViewBody card={card} onOpenRecommendModal={handleOpenRecommendModal} />
          ) : (
            <PinViewBody card={card} />
          )}
        </ScrollView>
      </View>

      {card.cardType === 'queue' ? (
        <>
          <RecommendTimeModal
            visible={isRecommendModalVisible}
            onClose={handleCloseRecommendModal}
            onConfirm={handleConfirmRecommendation}
          />
          {toast != null ? (
            <CardToast
              message={toast.message}
              variant={toast.variant}
              onClose={() => setToast(null)}
              onConfirm={() => setToast(null)}
            />
          ) : null}
        </>
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
