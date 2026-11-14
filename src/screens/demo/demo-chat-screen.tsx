import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ChatMessageCard } from '@/components/features/chatbot/chat-message-card';
import { AssistantMark, ChatWelcome } from '@/components/features/chatbot/chat-welcome';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { TextField } from '@/components/ui/TextField';
import { Typography } from '@/components/ui/Typography';
import { Config } from '@/constants/config';
import { colors, radius, spacing } from '@/constants/theme';

import { useDemoChat } from './hooks/use-demo-chat';

const shortcuts = [
  { label: '시간 추천', prompt: '내일 공부 1시간 언제 하면 좋아?' },
  { label: '할 일 추천', prompt: '내일 할 일 추천해줘' },
  { label: '일정 조회', prompt: '내일 일정 보여줘' },
];

export function DemoChatScreen() {
  const chat = useDemoChat();
  const scroll = useRef<ScrollView>(null);
  const [showSchedules, setShowSchedules] = useState(false);
  const started = chat.messages.length > 1;
  if (!Config.isDemo) return <Redirect href="/" />;
  if (!chat.sessionId || !chat.isAuthenticated) return <Redirect href="/demo-login" />;

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingMutedBackground}
      contentStyle={styles.container}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="홈으로 돌아가기"
          onPress={() => router.replace('/(tabs)')}
          style={styles.iconButton}
        >
          <Icon name="arrowLeft" size={22} />
        </Pressable>
        <View style={styles.title}>
          <Typography variant="titleS">일정 비서</Typography>
          <Typography variant="caption" color={colors.text.secondary}>
            당신의 하루에, 조금 더 여유를
          </Typography>
        </View>
        <Button
          label="계정"
          style={styles.account}
          disabled={chat.isPending}
          onPress={() => router.replace('/demo-login')}
        />
      </View>
      <View style={styles.schedulePanel}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="저장된 일정 펼치기"
          accessibilityState={{ expanded: showSchedules }}
          onPress={() => setShowSchedules(!showSchedules)}
          style={styles.scheduleToggle}
        >
          <Icon name="list" size={18} color={colors.primary} />
          <Typography variant="caption" style={styles.flex}>
            {chat.selectedDate} · 저장된 일정
          </Typography>
          {chat.isListLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Typography variant="tag" color={chat.listError ? colors.secondary : colors.primary}>
              {chat.listError ? '조회 오류' : `${chat.schedules.length}개`}
            </Typography>
          )}
          <Icon
            name={showSchedules ? 'chevronUp' : 'chevronDown'}
            size={16}
            color={colors.text.secondary}
          />
        </Pressable>
        {showSchedules ? (
          <View style={styles.scheduleDetails}>
            <View style={styles.dateToolbar}>
              <Button label="전날" style={styles.smallButton} onPress={() => chat.moveDate(-1)} />
              <Button label="다음날" style={styles.smallButton} onPress={() => chat.moveDate(1)} />
              <Button
                label="새로고침"
                style={styles.smallButton}
                disabled={chat.isListLoading}
                onPress={chat.refresh}
              />
            </View>
            <ScrollView style={styles.scheduleList} contentContainerStyle={styles.scheduleItems}>
              {chat.listError ? (
                <Typography variant="bodyS" color={colors.secondary}>
                  일정을 불러오지 못했어요. 새로고침해 주세요.
                </Typography>
              ) : null}
              {!chat.isListLoading && !chat.listError && !chat.schedules.length ? (
                <Typography variant="bodyS" color={colors.text.secondary}>
                  아직 비어 있는 하루예요.
                </Typography>
              ) : null}
              {chat.schedules.map((schedule) => (
                <View key={schedule.id} style={styles.scheduleRow}>
                  <View style={styles.timelineDot} />
                  <View style={styles.flex}>
                    <Typography variant="bodyS">{schedule.title}</Typography>
                    <Typography variant="caption" color={colors.text.secondary}>
                      {schedule.startTime || '시간 미정'}
                      {schedule.endTime ? `–${schedule.endTime}` : ''}
                      {schedule.location ? ` · ${schedule.location}` : ''}
                    </Typography>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scroll}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (started) scroll.current?.scrollToEnd({ animated: true });
          }}
        >
          {!started ? (
            <ChatWelcome onChoose={chat.setText} />
          ) : (
            <View style={styles.conversationLabel}>
              <Typography variant="caption" color={colors.text.secondary}>
                하루를 정리하는 대화
              </Typography>
            </View>
          )}
          {chat.messages
            .filter((message) => message.id !== 'welcome')
            .map((message, index, messages) => (
              <ChatMessageCard
                key={message.id}
                message={message}
                active={index === messages.length - 1 && !chat.isPending && !chat.failure}
                onSelect={(index) =>
                  chat.send(
                    message.reply?.status === 'recommended'
                      ? `${index}번째 추천 시간에 일정 반영해줘`
                      : `${index}번째 일정`,
                  )
                }
                onConfirm={chat.confirm}
              />
            ))}
          {chat.isPending ? (
            <View style={styles.thinking} accessibilityLiveRegion="polite">
              <AssistantMark small />
              <ActivityIndicator size="small" color={colors.primary} />
              <Typography variant="bodyS" color={colors.text.secondary}>
                일정을 살펴보고 있어요
              </Typography>
            </View>
          ) : null}
          {chat.failure ? (
            <Card style={styles.error} accessibilityRole="alert">
              <Typography variant="bodyS" color={colors.secondary}>
                {chat.failure.message}
              </Typography>
              <Button label="다시 시도" onPress={chat.retry} disabled={chat.isPending} />
            </Card>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.exampleStrip}
            contentContainerStyle={styles.examples}
            keyboardShouldPersistTaps="handled"
          >
            {shortcuts.map((item) => (
              <Button
                key={item.label}
                label={item.label}
                style={styles.chip}
                disabled={chat.isPending}
                onPress={() => chat.setText(item.prompt)}
              />
            ))}
          </ScrollView>
          <View style={styles.composer}>
            <TextField
              variant="long"
              width="100%"
              accessibilityLabel="채팅 메시지"
              placeholder="어떤 하루를 보내고 싶나요?"
              placeholderTextColor={colors.text.secondary}
              value={chat.text}
              onChangeText={chat.setText}
              disabled={chat.isPending}
              maxLength={2000}
              style={styles.input}
              multiline
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="메시지 보내기"
              accessibilityState={{ disabled: chat.isPending || !chat.text.trim() }}
              disabled={chat.isPending || !chat.text.trim()}
              onPress={() => chat.send()}
              style={({ pressed }) => [
                styles.send,
                (chat.isPending || !chat.text.trim()) && styles.sendDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Icon name="arrowRight" size={22} color={colors.gray.white} />
            </Pressable>
          </View>
          <Typography variant="caption" color={colors.text.secondary} align="center">
            추천은 선택한 뒤 반영돼요. 삭제 전에는 한 번 더 확인해요.
          </Typography>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.alpha.white80,
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, gap: spacing[0] },
  account: {
    width: 'auto',
    minHeight: 44,
    paddingHorizontal: spacing[3],
    backgroundColor: colors.alpha.transparent,
    borderWidth: 0,
  },
  schedulePanel: {
    backgroundColor: colors.alpha.white80,
    borderBottomWidth: spacing.px,
    borderBottomColor: colors.border,
  },
  scheduleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 44,
    paddingHorizontal: spacing[6],
  },
  scheduleDetails: { paddingHorizontal: spacing[6], paddingBottom: spacing[4], gap: spacing[3] },
  dateToolbar: { flexDirection: 'row', gap: spacing[2] },
  smallButton: { flex: 1, width: 'auto', minHeight: 44, backgroundColor: colors.surface },
  scheduleList: { maxHeight: 160 },
  scheduleItems: { gap: spacing[3] },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  timelineDot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.primary },
  flex: { flex: 1 },
  body: { flex: 1, minHeight: 0 },
  messages: { padding: spacing[5], gap: spacing[5], flexGrow: 1 },
  conversationLabel: { alignItems: 'center', paddingVertical: spacing[2] },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  error: {
    padding: spacing[4],
    gap: spacing[3],
    borderColor: colors.secondary,
    borderRadius: radius['2xl'],
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[2],
    backgroundColor: colors.alpha.white80,
  },
  exampleStrip: { flexGrow: 0 },
  examples: { gap: spacing[2], paddingTop: spacing[3] },
  chip: {
    width: 'auto',
    minHeight: 44,
    paddingHorizontal: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    padding: spacing[2],
    borderRadius: radius['2xl'],
    backgroundColor: colors.gray.white,
    borderWidth: spacing.px,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    width: 0,
    minWidth: 0,
    maxHeight: 120,
    backgroundColor: colors.alpha.transparent,
    paddingHorizontal: spacing[2],
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: radius.panel,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginBottom: spacing[1],
  },
  sendDisabled: { backgroundColor: colors.gray[300] },
  pressed: { opacity: 0.72 },
});
