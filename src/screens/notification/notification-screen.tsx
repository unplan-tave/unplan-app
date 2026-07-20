import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompletedScheduleCard } from '@/components/features/notification/completed-schedule-card';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { type ProgressSegmentValue } from '@/components/ui/ProgressSegment';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { withScheduleDetailPersonalTags } from '@/domains/schedule/api/mapper';
import { useUpdateScheduleMutation } from '@/domains/schedule/api/mutations';
import { useScheduleDetailQueries, useSchedulesByDateQuery } from '@/domains/schedule/api/queries';
import { hasScheduleEnded } from '@/domains/schedule/model';
import { formatDateValue } from '@/lib/utils/date';

import type { ScheduleListItem, ScheduleStatus } from '@/domains/schedule/model';

type NotificationTab = 'all' | 'completed';

const ALARM_NOTIFICATIONS = [
  {
    id: 'sleep-record',
    title: '얼마나 잠들었나요?',
    href: '/sleep/measure',
  },
  {
    id: 'energy-record',
    title: '오늘 상태는 어떠신가요?',
    href: '/energy/measure',
  },
] as const;

/** 알림 내역과 종료된 일정의 진행 상태를 확인하는 화면입니다. */
export function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<NotificationTab>('all');
  const schedulesQuery = useSchedulesByDateQuery(formatDateValue(new Date()));
  const scheduleDetailQueries = useScheduleDetailQueries(
    (schedulesQuery.data ?? []).map((schedule) => schedule.id),
    true,
  );
  const updateScheduleMutation = useUpdateScheduleMutation();
  const schedulesWithPersonalTags = useMemo(
    () =>
      withScheduleDetailPersonalTags(
        schedulesQuery.data ?? [],
        scheduleDetailQueries.flatMap((query) => (query.data == null ? [] : [query.data])),
      ),
    [scheduleDetailQueries, schedulesQuery.data],
  );
  const endedSchedules = useMemo(
    () =>
      schedulesWithPersonalTags
        .filter((schedule) => schedule.endTime.length > 0 && hasScheduleEnded(schedule))
        .sort((first, second) => second.endTime.localeCompare(first.endTime)),
    [schedulesWithPersonalTags],
  );

  const changeScheduleStatus = (scheduleId: number, value: ProgressSegmentValue) => {
    if (updateScheduleMutation.isPending) return;

    updateScheduleMutation.mutate({ scheduleId, data: { status: toScheduleStatus(value) } });
  };

  return (
    <ScreenLayout
      backgroundColor={colors.surface}
      contentStyle={styles.content}
      useSafeArea={false}
    >
      <View style={[styles.header, { height: insets.top + spacing[12], paddingTop: insets.top }]}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          hitSlop={spacing[2]}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
          onPress={() => router.back()}
        >
          <Icon name="arrowLeft" size={24} color={colors.gray[700]} />
        </Pressable>
        <Typography variant="bodyM" color={colors.gray[600]} align="center" style={styles.title}>
          알림
        </Typography>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing[8] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabs}>
          <NotificationTabButton
            active={tab === 'all'}
            label="전체"
            onPress={() => setTab('all')}
          />
          <NotificationTabButton
            active={tab === 'completed'}
            label="완료"
            onPress={() => setTab('completed')}
          />
        </View>

        {tab === 'all' ? (
          <>
            <View style={styles.notificationList}>
              {ALARM_NOTIFICATIONS.map((notification) => (
                <Card
                  key={notification.id}
                  accessibilityLabel={`${notification.title} 입력`}
                  variant="glass"
                  style={styles.notificationCard}
                  onPress={() => router.push(notification.href)}
                >
                  <Typography variant="bodyM" color={colors.gray[800]}>
                    {notification.title}
                  </Typography>
                  <Icon name="arrowRight" size={24} color={colors.gray[700]} />
                </Card>
              ))}
            </View>
            <CompletedSchedules
              schedules={endedSchedules}
              isLoading={schedulesQuery.isLoading}
              isError={schedulesQuery.isError}
              disabled={updateScheduleMutation.isPending}
              onChange={changeScheduleStatus}
            />
          </>
        ) : (
          <CompletedSchedules
            schedules={endedSchedules}
            isLoading={schedulesQuery.isLoading}
            isError={schedulesQuery.isError}
            disabled={updateScheduleMutation.isPending}
            onChange={changeScheduleStatus}
          />
        )}
        {updateScheduleMutation.isError ? (
          <Typography variant="bodyS" color={colors.secondary}>
            일정 상태를 변경하지 못했어요. 다시 시도해 주세요.
          </Typography>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}

function CompletedSchedules({
  schedules,
  isLoading,
  isError,
  disabled,
  onChange,
}: {
  schedules: ScheduleListItem[];
  isLoading: boolean;
  isError: boolean;
  disabled: boolean;
  onChange: (scheduleId: number, value: ProgressSegmentValue) => void;
}) {
  if (isLoading) {
    return (
      <Typography variant="bodyS" color={colors.gray[400]}>
        종료된 일정을 불러오는 중이에요.
      </Typography>
    );
  }

  if (isError) {
    return (
      <Typography variant="bodyS" color={colors.secondary}>
        종료된 일정을 불러오지 못했어요.
      </Typography>
    );
  }

  if (schedules.length === 0) return null;

  return (
    <View style={styles.scheduleList}>
      {schedules.map((schedule) => (
        <CompletedScheduleCard
          key={schedule.id}
          schedule={schedule}
          disabled={disabled}
          progressValue={toProgressSegmentValue(schedule.status)}
          onChange={(value) => onChange(schedule.id, value)}
        />
      ))}
    </View>
  );
}

function NotificationTabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.tabButton,
        active && styles.activeTabButton,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Typography
        variant="bodyS"
        color={active ? colors.chip.selectedText : colors.gray[500]}
        align="center"
      >
        {label}
      </Typography>
    </Pressable>
  );
}

function toProgressSegmentValue(status: ScheduleStatus): ProgressSegmentValue {
  if (status === 'done') return 'done';
  if (status === 'inProgress') return 'ongoing';
  return 'todo';
}

function toScheduleStatus(value: ProgressSegmentValue): ScheduleStatus {
  if (value === 'done') return 'done';
  if (value === 'ongoing') return 'inProgress';
  return 'todo';
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  headerButton: {
    width: spacing[6],
    height: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
  scrollContent: { gap: spacing[6], paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  tabs: { flexDirection: 'row', gap: spacing[1] },
  tabButton: {
    flex: 1,
    minHeight: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
  },
  activeTabButton: { backgroundColor: colors.alpha.primary20 },
  notificationList: { gap: spacing[2] },
  notificationCard: {
    minHeight: spacing[10],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.gray.white,
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
    boxShadow: `0 0 ${spacing[6]}px ${colors.alpha.blueGray15}`,
  },
  scheduleList: { gap: spacing[2] },
  pressed: { opacity: 0.72 },
});
