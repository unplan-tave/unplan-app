import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ProgressSegment, type ProgressSegmentValue } from '@/components/ui/ProgressSegment';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { useUpdateScheduleMutation } from '@/domains/schedule/api/mutations';
import { useSchedulesByDateQuery } from '@/domains/schedule/api/queries';
import { formatDateValue } from '@/lib/utils/date';

import type { ScheduleListItem, ScheduleStatus } from '@/domains/schedule/model';

type NotificationTab = 'all' | 'completed';

const ALARM_NOTIFICATIONS = [
  {
    id: 'sleep-record',
    title: '얼마나 잠들었나요?',
    description: '목표 기상 시각에 수면 기록 알림 발송',
  },
  {
    id: 'energy-record',
    title: '오늘 상태는 어떠신가요?',
    description:
      '목표 기상 시각에 에너지 기록 알림 발송\n목표 기상 시각 이후 6시간 간격으로 에너지 기록 알림 발송',
  },
] as const;

/** 알림 내역과 종료된 일정의 진행 상태를 확인하는 화면입니다. */
export function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<NotificationTab>('all');
  const schedulesQuery = useSchedulesByDateQuery(formatDateValue(new Date()));
  const updateScheduleMutation = useUpdateScheduleMutation();
  const completedSchedules = useMemo(
    () =>
      (schedulesQuery.data ?? [])
        .filter((schedule) => schedule.endTime.length > 0)
        .sort((first, second) => second.endTime.localeCompare(first.endTime)),
    [schedulesQuery.data],
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
      <View style={[styles.header, { paddingTop: insets.top + spacing[2] }]}>
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
          <View style={styles.notificationList}>
            {ALARM_NOTIFICATIONS.map((notification) => (
              <Card key={notification.id} disabled style={styles.notificationCard}>
                <Typography variant="bodyM" color={colors.gray[800]}>
                  {notification.title}
                </Typography>
                <Typography variant="bodyS" color={colors.gray[500]} style={styles.description}>
                  {notification.description}
                </Typography>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.completedSection}>
            <Typography variant="bodyM" color={colors.gray[500]}>
              일정을 완료하셨나요?
            </Typography>
            {completedSchedules.length > 0 ? (
              <View style={styles.scheduleList}>
                {completedSchedules.map((schedule) => (
                  <ScheduleStatusCard
                    key={schedule.id}
                    schedule={schedule}
                    disabled={updateScheduleMutation.isPending}
                    onChange={(value) => changeScheduleStatus(schedule.id, value)}
                  />
                ))}
              </View>
            ) : (
              <Typography variant="bodyS" color={colors.gray[400]}>
                종료된 일정이 없어요.
              </Typography>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
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

function ScheduleStatusCard({
  schedule,
  disabled,
  onChange,
}: {
  schedule: ScheduleListItem;
  disabled: boolean;
  onChange: (value: ProgressSegmentValue) => void;
}) {
  return (
    <Card disabled style={styles.scheduleCard}>
      <Typography variant="titleS" color={colors.gray[800]}>
        {schedule.title}
      </Typography>
      <Typography variant="bodyS" color={colors.gray[500]}>
        {schedule.date} {schedule.startTime} - {schedule.endTime}
      </Typography>
      <ProgressSegment value={toProgressSegmentValue(schedule.status)} onChange={onChange} />
      {disabled ? <View pointerEvents="auto" style={styles.disabledOverlay} /> : null}
    </Card>
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
    height: 88,
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
    gap: spacing[1],
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.gray.white,
    borderRadius: radius.md,
    backgroundColor: colors.gray.white,
    boxShadow: `0 0 ${spacing[6]}px ${colors.alpha.black12}`,
  },
  description: { lineHeight: 20 },
  completedSection: { gap: spacing[3] },
  scheduleList: { gap: spacing[2] },
  scheduleCard: {
    position: 'relative',
    gap: spacing[2],
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.gray.white,
    boxShadow: `0 0 ${spacing[12]}px ${colors.alpha.black12}`,
  },
  disabledOverlay: { ...StyleSheet.absoluteFill },
  pressed: { opacity: 0.72 },
});
