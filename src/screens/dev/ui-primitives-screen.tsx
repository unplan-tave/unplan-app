import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { BottomCTA } from '@/components/ui/BottomCTA';
import {
  ActionListBottomSheet,
  AddScheduleBottomSheet,
  TimePickerBottomSheet,
} from '@/components/ui/BottomSheet';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Card, CardTagList } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { ConditionCard } from '@/components/ui/ConditionCard';
import { Footer, FooterCTA, FooterGNB, HomeIndicator } from '@/components/ui/Footer';
import { GNB } from '@/components/ui/GNB';
import {
  Header,
  HeaderBack,
  HeaderCancel,
  HeaderCardList,
  HeaderCondition,
  HeaderHome,
  HeaderProgress,
  HeaderSearch,
  HeaderStatusSummary,
} from '@/components/ui/Header';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Input, InputRecommendation, InputRow } from '@/components/ui/Input';
import {
  CardDetailModal,
  ConfirmModal,
  Modal,
  ModalActions,
  ProgressModal,
  ScheduleEditModal,
  StepperModal,
} from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressSegment } from '@/components/ui/ProgressSegment';
import { RecommendCard } from '@/components/ui/RecommendCard';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { StatusBar as UIStatusBar } from '@/components/ui/StatusBar';
import { Tag } from '@/components/ui/Tag';
import { TextField } from '@/components/ui/TextField';
import { TimeStepper } from '@/components/ui/TimeStepper';
import { Typography } from '@/components/ui/Typography';
import { ViewModeButton } from '@/components/ui/ViewModeButton';
import { colors } from '@/constants/theme';

type SheetKind = 'actions' | 'add' | 'time' | null;
type ModalKind = 'base' | 'confirm' | 'progress' | 'stepper' | 'schedule' | 'detail' | null;

const ICON_NAMES: IconName[] = [
  'plus',
  'minus',
  'search',
  'maximize',
  'arrowLeft',
  'arrowRight',
  'arrowDown',
  'chevronDown',
  'bell',
  'cancel',
  'done',
  'edit',
  'sort',
  'toggle',
  'home',
  'list',
  'condition',
  'setting',
];

export function UiPrimitivesScreen() {
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [chipValue, setChipValue] = useState<string | string[] | undefined>('queue');
  const [progressValue, setProgressValue] = useState<'todo' | 'ongoing' | 'done'>('todo');
  const [gnbValue, setGnbValue] = useState('home');

  const calendarDays = useMemo(() => createCalendarDays(), []);

  return (
    <ScreenLayout backgroundColor={colors.surface}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Brand">
          <View style={styles.row}>
            <AppIcon size={72} />
            <BrandLogo color={colors.gray[900]} size="medium" variant="combined" />
          </View>
        </Section>

        <Section title="Typography">
          <Typography variant="display" color={colors.gray[800]}>
            Display
          </Typography>
          <Typography variant="titleL" color={colors.gray[800]}>
            Title L
          </Typography>
          <Typography variant="titleM" color={colors.gray[800]}>
            Title M
          </Typography>
          <Typography variant="titleS" color={colors.gray[800]}>
            Title S
          </Typography>
          <Typography variant="bodyM" color={colors.gray[600]}>
            Body M - 계획하지 말고 unplan 하세요
          </Typography>
          <Typography variant="bodyS" color={colors.gray[500]}>
            Body S - 계획하지 말고 unplan 하세요
          </Typography>
          <Typography variant="caption" color={colors.gray[400]}>
            Caption - 계획하지 말고 unplan 하세요
          </Typography>
        </Section>

        <Section title="Icon">
          <View style={styles.iconGrid}>
            {ICON_NAMES.map((name) => (
              <View key={name} style={styles.iconItem}>
                <Icon name={name} size={24} color={colors.gray[700]} />
                <Typography variant="caption" color={colors.gray[500]} align="center">
                  {name}
                </Typography>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Button">
          <Button label="Default" />
          <Button label="Primary" variant="primary" />
          <Button label="Glass" variant="glass" />
          <Button label="Disabled" disabled />
          <BottomCTA label="확인" caption="다음에 할래요" />
          <BottomCTA label="계속하기" variant="primary" caption={null} />
        </Section>

        <Section title="Tag / Chip">
          <View style={styles.row}>
            <Tag variant="condition" condition="core" label="핵심 작업" />
            <Tag variant="condition" condition="rest" label="기력 회복" />
            <Tag variant="personal" label="과제" />
          </View>
          <View style={styles.row}>
            <Chip label="큐 카드" selected />
            <Chip label="완료" />
            <Chip label="검색" iconName="search" />
          </View>
          <ChipGroup
            items={[
              { label: '큐 카드', value: 'queue' },
              { label: '핀 카드', value: 'pin' },
              { label: '완료', value: 'done' },
            ]}
            value={chipValue}
            onChange={setChipValue}
          />
        </Section>

        <Section title="TextField / Input">
          <TextField placeholder="한 줄" width="100%" />
          <TextField variant="long" placeholder="긴 입력" width="100%" />
          <View style={styles.row}>
            <TextField variant="time" label="17:30" rightLabel="18:40" width={140} />
            <TextField variant="duration" label="10분" width={120} />
            <TextField variant="add" width={48} />
          </View>
          <Input
            label="일정"
            fieldProps={{ placeholder: '일정 제목', width: '100%' }}
            recommendation="자격증 공부를 추가해보세요"
          />
          <InputRow label="추천">
            <InputRecommendation label="자격증 공부" />
            <InputRecommendation label="치과 검진" />
          </InputRow>
        </Section>

        <Section title="Card">
          <Card style={styles.scheduleCard}>
            <Typography variant="titleM" color={colors.gray[800]}>
              일정 제목
            </Typography>
            <Typography variant="bodyM" color={colors.gray[500]}>
              17:30 - 18:40
            </Typography>
            <CardTagList
              tags={[
                { label: '핵심 작업', variant: 'condition', condition: 'core' },
                { label: '과제', variant: 'personal' },
                { label: '중성마녀~', variant: 'personal' },
              ]}
            />
            <ProgressSegment value={progressValue} onChange={setProgressValue} />
          </Card>
          <ConditionCard
            title="컨디션 카드"
            description="오늘의 작업 상태를 표시합니다."
            condition="brain"
          />
          <RecommendCard
            title="추천 카드"
            description="잠깐 쉬는 게 어떨까요?"
            caption="AI 추천"
            iconName="done"
          />
        </Section>

        <Section title="Progress">
          <ProgressBar value={42} />
          <ProgressSegment value={progressValue} onChange={setProgressValue} />
          <TimeStepper label="10분 추가" alertMessage="일정 시간이 겹칠 수 있어요" />
          <View style={styles.row}>
            <ViewModeButton mode="weekly" />
            <ViewModeButton mode="monthly" />
            <ViewModeButton mode="daily" />
          </View>
        </Section>

        <Section title="Header">
          <Header
            title="Unplan"
            subtitle="오늘의 일정"
            left={<HeaderBack />}
            right={<HeaderSearch />}
          />
          <HeaderHome greeting="계획하지 말고 unplan 하세요" />
          <HeaderProgress progress={0.42} />
          <HeaderCancel />
          <HeaderCondition title="오늘 컨디션" condition="daily" />
          <HeaderCardList title="큐 카드" count={4} actionLabel="전체 보기" />
          <HeaderStatusSummary label="진행률" value="37%" caption="오늘 완료" />
        </Section>

        <Section title="Calendar">
          <Calendar days={calendarDays} selectedDate={calendarDays[9]?.date} />
        </Section>

        <Section title="Navigation / Footer">
          <UIStatusBar />
          <GNB value={gnbValue} onChange={setGnbValue} onAddPress={() => setSheet('add')} />
          <Footer>
            <FooterGNB
              items={[
                { label: '홈', value: 'home', iconName: 'home' },
                { label: '목록', value: 'list', iconName: 'list' },
                { label: '설정', value: 'setting', iconName: 'setting' },
              ]}
              value={gnbValue}
              onChange={setGnbValue}
            />
            <FooterCTA label="저장" />
            <HomeIndicator />
          </Footer>
        </Section>

        <Section title="BottomSheet">
          <Button label="ActionListBottomSheet" onPress={() => setSheet('actions')} />
          <Button label="AddScheduleBottomSheet" onPress={() => setSheet('add')} />
          <Button label="TimePickerBottomSheet" onPress={() => setSheet('time')} />
        </Section>

        <Section title="Modal">
          <View style={styles.buttonGrid}>
            <Button label="Modal" onPress={() => setModal('base')} />
            <Button label="ConfirmModal" onPress={() => setModal('confirm')} />
            <Button label="ProgressModal" onPress={() => setModal('progress')} />
            <Button label="StepperModal" onPress={() => setModal('stepper')} />
            <Button label="ScheduleEditModal" onPress={() => setModal('schedule')} />
            <Button label="CardDetailModal" onPress={() => setModal('detail')} />
          </View>
        </Section>
      </ScrollView>

      <ActionListBottomSheet
        visible={sheet === 'actions'}
        title="작업 선택"
        items={[
          { label: '수정', caption: '일정 내용을 수정합니다.' },
          { label: '삭제', destructive: true },
        ]}
        onClose={() => setSheet(null)}
      />
      <AddScheduleBottomSheet
        visible={sheet === 'add'}
        title="새로 만들기"
        titleFieldProps={{ placeholder: '일정 제목' }}
        timeFieldProps={{ variant: 'time', label: '17:30', rightLabel: '18:40' }}
        onAddPress={() => setSheet(null)}
        onClose={() => setSheet(null)}
      />
      <TimePickerBottomSheet
        visible={sheet === 'time'}
        title="시간 선택"
        value="17:30"
        options={['09:00', '13:00', '17:30', '21:00']}
        onSelect={() => setSheet(null)}
        onClose={() => setSheet(null)}
      />

      <Modal visible={modal === 'base'} onClose={() => setModal(null)}>
        <Typography variant="titleM" color={colors.gray[700]} align="center">
          기본 모달
        </Typography>
        <ModalActions onCancel={() => setModal(null)} onConfirm={() => setModal(null)} />
      </Modal>
      <ConfirmModal
        visible={modal === 'confirm'}
        title="일정을 삭제할까요?"
        description="삭제한 일정은 되돌릴 수 없습니다."
        onConfirm={() => setModal(null)}
        onClose={() => setModal(null)}
      />
      <ProgressModal
        visible={modal === 'progress'}
        title="진행 중"
        description="일정을 정리하고 있어요."
        progress={62}
        onClose={() => setModal(null)}
      />
      <StepperModal
        visible={modal === 'stepper'}
        title="시간 조정"
        label="10분 추가"
        onClose={() => setModal(null)}
      />
      <ScheduleEditModal
        visible={modal === 'schedule'}
        titleFieldProps={{ placeholder: '일정 제목' }}
        startFieldProps={{ variant: 'time', label: '17:30' }}
        endFieldProps={{ variant: 'time', label: '18:40' }}
        onSave={() => setModal(null)}
        onClose={() => setModal(null)}
      />
      <CardDetailModal
        visible={modal === 'detail'}
        title="일정 제목"
        description="17:30 - 18:40"
        status={progressValue}
        onStatusChange={setProgressValue}
        onClose={() => setModal(null)}
      />
    </ScreenLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Typography variant="titleS" color={colors.gray[800]}>
        {title}
      </Typography>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function createCalendarDays() {
  const baseDate = new Date(2026, 0, 26);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + index);

    return {
      date,
      disabled: index < 5 || index > 35,
      schedules:
        index % 3 === 0
          ? [
              { id: `${index}-1`, title: '일정' },
              { id: `${index}-2`, title: '일정' },
              { id: `${index}-3`, title: '일정' },
              { id: `${index}-4`, title: '일정' },
            ]
          : index % 5 === 0
            ? [
                { id: `${index}-1`, title: '일정' },
                { id: `${index}-2`, title: '일정' },
              ]
            : [],
    };
  });
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    padding: 20,
    paddingBottom: 64,
  },
  section: {
    gap: 12,
  },
  sectionBody: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.alpha.white70,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconItem: {
    width: 72,
    alignItems: 'center',
    gap: 4,
  },
  scheduleCard: {
    width: 216,
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  buttonGrid: {
    gap: 8,
  },
});
