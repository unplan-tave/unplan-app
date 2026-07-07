import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ConditionMeter } from '@/components/domain/condition/condition-meter';
import {
  HomeAddBottomSheet,
  type RecommendationItem,
} from '@/components/features/home/home-add-bottom-sheet';
import { HomeBackground } from '@/components/features/home/home-background';
import { HomeBottomNav } from '@/components/features/home/home-bottom-nav';
import { TimelineCard } from '@/components/features/home/timeline-card';
import { OnboardingNotificationModal } from '@/components/features/onboarding/onboarding-notification-modal';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { useUpdateAlarmSettingsMutation } from '@/domains/member/api/mutations';
import { useSchedulesByDateQuery } from '@/domains/schedule/api/queries';
import { toCardItemsFromScheduleList } from '@/domains/schedule/card-mapper';
import { getCardPersonalTagLabels } from '@/domains/schedule/list';
import { getConditionTagById, type CardItem } from '@/domains/schedule/model';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';
import { t } from '@/lib/i18n';

import type { AlarmSettings } from '@/domains/member/model';

const WEEKDAY_LABELS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const EMPTY_HOME_CARD_HEIGHT = 108;
const HOME_STATUS_COLUMN_WIDTH = 112;
const HOME_DIVIDER_WIDTH = 107;
const HOME_MESSAGE_BOX_WIDTH = 226;
const HOME_TIMELINE_LEFT = 108;
const HOME_TIMELINE_WIDTH = 273;
const HOME_TIMELINE_LINE_LEFT = 43;
const HOME_TIMELINE_LINE_BOTTOM = 240;
const HOME_CURRENT_TIME_LEFT = 104;
const HOME_CURRENT_TIME_BADGE_HEIGHT = 22;
const HOME_TIMELINE_GAP = spacing[2];
const CURRENT_TIME_GAP_FROM_ADD_CARD = spacing[10];
const HOME_TIMELINE_CARD_LIST_TOP = 106.69;
const ADD_CARD_TOP =
  HOME_TIMELINE_CARD_LIST_TOP + EMPTY_HOME_CARD_HEIGHT * 2 + HOME_TIMELINE_GAP * 2;
const CURRENT_TIME_TOP = ADD_CARD_TOP + EMPTY_HOME_CARD_HEIGHT + CURRENT_TIME_GAP_FROM_ADD_CARD;

export function HomeScreen() {
  const params = useLocalSearchParams<{ onboardingNotification?: string }>();
  const [now, setNow] = useState(() => new Date());
  const [isAddSheetVisible, setIsAddSheetVisible] = useState(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState<string | null>(null);
  const updateAlarmSettingsMutation = useUpdateAlarmSettingsMutation();
  const personalTags = useScheduleStore((store) => store.personalTags);
  const homeDate = useMemo(() => getHomeDateLabel(now), [now]);
  const todayDate = useMemo(() => formatDateValue(now), [now]);
  const schedulesByDateQuery = useSchedulesByDateQuery(todayDate);
  const cards = useMemo(
    () => toCardItemsFromScheduleList(schedulesByDateQuery.data ?? [], personalTags),
    [personalTags, schedulesByDateQuery.data],
  );
  const currentTimeLabel = useMemo(() => formatTimeLabel(now), [now]);
  const timelineCards = useMemo(
    () => cards.filter((card) => card.cardType === 'pin').slice(0, 3),
    [cards],
  );
  const recommendations = useMemo<RecommendationItem[]>(() => [], []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (params.onboardingNotification === '1') {
      setIsNotificationModalVisible(true);
    }
  }, [params.onboardingNotification]);

  const closeNotificationModal = useCallback(() => {
    setIsNotificationModalVisible(false);
    setNotificationErrorMessage(null);
    router.replace('/(tabs)');
  }, []);

  const updateNotificationSettings = useCallback(
    (enabled: boolean) => {
      if (updateAlarmSettingsMutation.isPending) {
        return;
      }

      const nextSettings: AlarmSettings = {
        scheduleEndAlarmOn: enabled,
        conditionRecordAlarmOn: enabled,
        recommendAlarmOn: enabled,
      };

      setNotificationErrorMessage(null);
      updateAlarmSettingsMutation.mutate(nextSettings, {
        onSuccess: closeNotificationModal,
        onError: () => setNotificationErrorMessage(t('onboarding.notification.saveError')),
      });
    },
    [closeNotificationModal, updateAlarmSettingsMutation],
  );

  const handleCreateCard = useCallback(() => {
    setIsAddSheetVisible(false);
    router.push('/card/card-detail');
  }, []);

  const handleOpenAddSheet = useCallback(() => {
    setIsAddSheetVisible(true);
  }, []);

  const handleCloseAddSheet = useCallback(() => {
    setIsAddSheetVisible(false);
  }, []);

  const handleDismissRecommendation = useCallback((cardId: string) => {
    void cardId;
  }, []);

  const handleAddRecommendation = useCallback((cardId: string) => {
    void cardId;
    setIsAddSheetVisible(false);
  }, []);

  const handleViewQueue = useCallback(() => {
    setIsAddSheetVisible(false);
    router.navigate('/schedule');
  }, []);

  const handleNavItemPress = useCallback((value: string) => {
    if (value === 'home') {
      router.navigate('/(tabs)');
      return;
    }

    if (value === 'setting') {
      router.navigate('/settings');
      return;
    }

    router.navigate('/schedule');
  }, []);

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.content}
      useSafeArea={false}
    >
      <StatusBar style="light" />
      <HomeBackground />
      <View style={styles.canvas}>
        <View style={styles.timeline}>
          <View style={styles.timelineLine} />
          {timelineCards.length === 0 ? (
            <>
              <TimelineCard time="00:00" title="" range="" status="placeholder" />
              <TimelineCard time="00:00" title="" range="" status="placeholder" />
            </>
          ) : (
            timelineCards.map((card) => {
              const conditionTag = getConditionTagById(card.conditionTagId);
              const cardPersonalTagLabels = getCardPersonalTagLabels(card, personalTags);

              return (
                <TimelineCard
                  key={card.id}
                  time={getTimelineTime(card)}
                  title={card.title}
                  range={getTimelineRange(card)}
                  status="progress"
                  tags={[
                    {
                      label: conditionTag.label,
                      variant: 'condition' as const,
                      condition: card.conditionTagId,
                    },
                    ...cardPersonalTagLabels.map((label) => ({
                      label,
                      variant: 'personal' as const,
                    })),
                  ]}
                  onPress={() => router.push(`/card/view?cardId=${card.id}`)}
                />
              );
            })
          )}
          <TimelineCard
            time="00:00"
            title="일정을 추가해 볼까요?"
            range="00:00 - 00:00"
            tags={[{ label: '일상 작업', variant: 'condition', condition: 'daily' }]}
            onPress={handleCreateCard}
          />
        </View>

        <View style={styles.currentTime}>
          <View style={styles.currentTimeBadge}>
            <Typography variant="caption" color={colors.gray.white}>
              {currentTimeLabel}
            </Typography>
          </View>
          <View style={styles.currentLine} />
        </View>

        <View style={styles.header}>
          <View style={styles.statusColumn}>
            <View style={styles.viewBadge}>
              <Typography variant="bodyS" color={colors.alpha.white80}>
                daily view
              </Typography>
              <Icon name="maximize" size={10} color={colors.alpha.white80} />
            </View>
            <Typography variant="bodyS" color={colors.gray.white}>
              {homeDate.year}
            </Typography>
            <View style={styles.dateRow}>
              <Typography variant="bodyM" color={colors.gray.white}>
                {homeDate.date}
              </Typography>
              <Icon name="chevronDown" size={18} color={colors.gray.white} />
            </View>
            <View style={styles.divider} />
            <Typography variant="titleL" color={colors.gray.white} style={styles.conditionPrompt}>
              컨디션{'\n'}입력하기
            </Typography>
            <ConditionMeter label="Body" value="0%" progress={0} />
            <ConditionMeter label="Mind" value="0%" progress={0} />
            <ConditionMeter label="Sleep" value="0h 0m" progress={0} />
          </View>
          <View style={styles.messageBox}>
            <Typography
              variant="titleL"
              color={colors.gray.white}
              align="right"
              style={styles.message}
            >
              오늘의 컨디션과 일정을 입력하고, 나에게 맞는 추천을 받아보세요.
            </Typography>
          </View>
        </View>

        <View style={styles.footer}>
          <HomeBottomNav onAddPress={handleOpenAddSheet} onItemPress={handleNavItemPress} />
        </View>
      </View>
      <HomeAddBottomSheet
        visible={isAddSheetVisible}
        recommendations={recommendations}
        onClose={handleCloseAddSheet}
        onCreatePress={handleCreateCard}
        onDismissRecommendation={handleDismissRecommendation}
        onRecommendationAddPress={handleAddRecommendation}
        onViewQueuePress={handleViewQueue}
      />
      <OnboardingNotificationModal
        visible={isNotificationModalVisible}
        isSubmitting={updateAlarmSettingsMutation.isPending}
        errorMessage={notificationErrorMessage}
        onAllow={() => updateNotificationSettings(true)}
        onDeny={() => updateNotificationSettings(false)}
      />
    </ScreenLayout>
  );
}

function getHomeDateLabel(date: Date) {
  const year = String(date.getFullYear());
  const month = padTimeUnit(date.getMonth() + 1);
  const day = padTimeUnit(date.getDate());
  const weekday = WEEKDAY_LABELS[date.getDay()];

  return {
    year,
    date: `${month}.${day}.${weekday}`,
  };
}

function formatTimeLabel(date: Date) {
  return `${padTimeUnit(date.getHours())}:${padTimeUnit(date.getMinutes())}`;
}

function padTimeUnit(value: number) {
  return String(value).padStart(2, '0');
}

function formatDateValue(date: Date) {
  return `${date.getFullYear()}.${padTimeUnit(date.getMonth() + 1)}.${padTimeUnit(date.getDate())}`;
}

function getTimelineTime(card: CardItem) {
  return card.timeStart || '00:00';
}

function getTimelineRange(card: CardItem) {
  if (!card.timeFilled) {
    return '00:00 - 00:00';
  }

  return `${card.timeStart || '00:00'} - ${card.timeEnd || '00:00'}`;
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    maxWidth: 393,
    flex: 1,
    alignSelf: 'center',
  },
  header: {
    position: 'absolute',
    top: spacing[16],
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
  },
  statusColumn: {
    width: HOME_STATUS_COLUMN_WIDTH,
  },
  viewBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[1],
    paddingHorizontal: spacing[1],
    borderRadius: radius['2xs'],
    backgroundColor: colors.alpha.white10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  divider: {
    width: HOME_DIVIDER_WIDTH,
    height: 1,
    marginTop: spacing[1],
    backgroundColor: colors.alpha.white50,
  },
  conditionPrompt: {
    marginTop: spacing[2],
    marginBottom: spacing[3],
  },
  messageBox: {
    width: HOME_MESSAGE_BOX_WIDTH,
    alignItems: 'flex-end',
  },
  message: {
    width: '100%',
  },
  timeline: {
    position: 'absolute',
    top: HOME_TIMELINE_CARD_LIST_TOP,
    left: HOME_TIMELINE_LEFT,
    width: HOME_TIMELINE_WIDTH,
    gap: spacing[2],
  },
  timelineLine: {
    position: 'absolute',
    top: -HOME_TIMELINE_CARD_LIST_TOP,
    bottom: -HOME_TIMELINE_LINE_BOTTOM,
    left: HOME_TIMELINE_LINE_LEFT,
    width: 1,
    backgroundColor: colors.alpha.black12,
  },
  currentTime: {
    position: 'absolute',
    top: CURRENT_TIME_TOP,
    left: HOME_CURRENT_TIME_LEFT,
    right: -spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 4,
  },
  currentTimeBadge: {
    minHeight: HOME_CURRENT_TIME_BADGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[1],
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
  },
  currentLine: {
    flex: 1,
    height: 2,
    marginLeft: 0,
    backgroundColor: colors.secondary,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing[2],
    zIndex: 3,
    paddingHorizontal: spacing[5],
  },
});
