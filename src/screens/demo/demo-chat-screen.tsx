import { Redirect, router } from 'expo-router';
import { useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ChatMessageCard } from '@/components/features/chatbot/chat-message-card';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { TextField } from '@/components/ui/TextField';
import { Typography } from '@/components/ui/Typography';
import { Config } from '@/constants/config';
import { colors, spacing } from '@/constants/theme';
import { CHAT_EXAMPLES } from '@/domains/schedule/chat/model';

import { useDemoChat } from './hooks/use-demo-chat';

export function DemoChatScreen() {
  const chat = useDemoChat();
  const scroll = useRef<ScrollView>(null);
  if (!Config.isDemo) return <Redirect href="/" />;
  if (!chat.sessionId || !chat.isAuthenticated) return <Redirect href="/demo-login" />;

  return (
    <ScreenLayout contentStyle={styles.container}>
      <View style={styles.header}>
        <Button label="홈" style={styles.compactButton} onPress={() => router.replace('/(tabs)')} />
        <View style={styles.title}>
          <Typography variant="titleS">AI 일정 비서</Typography>
          <Typography variant="caption" color={colors.text.secondary}>
            {chat.nickname} · DEMO · Asia/Seoul
          </Typography>
        </View>
        <Button
          label="계정"
          style={styles.compactButton}
          disabled={chat.isPending}
          onPress={() => router.replace('/demo-login')}
        />
      </View>
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scroll}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        >
          {chat.messages.map((message, index) => (
            <ChatMessageCard
              key={message.id}
              message={message}
              active={index === chat.messages.length - 1 && !chat.isPending && !chat.failure}
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
            <ActivityIndicator accessibilityLabel="일정 요청 처리 중" color={colors.primary} />
          ) : null}
          {chat.failure ? (
            <Card style={styles.error} accessibilityRole="alert">
              <Typography color={colors.secondary}>{chat.failure.message}</Typography>
              <Button label="동일 요청 다시 시도" disabled={chat.isPending} onPress={chat.retry} />
            </Card>
          ) : null}
          <View style={styles.dateToolbar}>
            <Button style={styles.compactButton} label="전날" onPress={() => chat.moveDate(-1)} />
            <Typography variant="bodyM">{chat.selectedDate}</Typography>
            <Button style={styles.compactButton} label="다음날" onPress={() => chat.moveDate(1)} />
            <Button
              style={styles.compactButton}
              label="새로고침"
              disabled={chat.isListLoading}
              onPress={chat.refresh}
            />
          </View>
          <Typography variant="titleS">실제 저장된 일정</Typography>
          {chat.listError ? (
            <Typography color={colors.secondary}>
              일정을 조회하지 못했습니다. 새로고침해 주세요.
            </Typography>
          ) : null}
          {!chat.isListLoading && !chat.listError && !chat.schedules.length ? (
            <Typography color={colors.text.secondary}>등록된 일정이 없습니다.</Typography>
          ) : null}
          {chat.schedules.map((schedule) => (
            <Card key={schedule.id} accessibilityRole="text" style={styles.schedule}>
              <Typography variant="bodyM">{schedule.title}</Typography>
              {schedule.location ? (
                <Typography variant="bodyS" color={colors.text.secondary}>
                  {schedule.location}
                </Typography>
              ) : null}
              <Typography variant="caption" color={colors.primary}>
                {schedule.startTime || '시간 미정'}
                {schedule.endTime ? `–${schedule.endTime}` : ''}
              </Typography>
            </Card>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          style={styles.exampleStrip}
          contentContainerStyle={styles.examples}
          keyboardShouldPersistTaps="handled"
        >
          {CHAT_EXAMPLES.map((example) => (
            <Button
              key={example}
              label={example}
              style={styles.exampleButton}
              disabled={chat.isPending}
              onPress={() => chat.setText(example)}
            />
          ))}
        </ScrollView>
        <View style={styles.composer}>
          <TextField
            variant="long"
            width="100%"
            accessibilityLabel="채팅 메시지"
            placeholder="내일 오후 3시에 팀 회의 추가해줘"
            placeholderTextColor={colors.text.secondary}
            value={chat.text}
            onChangeText={chat.setText}
            disabled={chat.isPending}
            maxLength={2000}
            style={styles.input}
            multiline
          />
          <Button
            label="보내기"
            style={styles.compactButton}
            variant="primary"
            disabled={chat.isPending || !chat.text.trim()}
            onPress={() => chat.send()}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 393, alignSelf: 'center', padding: spacing[4] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  title: { flex: 1, minWidth: 0, gap: spacing[1] },
  compactButton: {
    width: 'auto',
    minWidth: 44,
    minHeight: 44,
    flexShrink: 0,
    alignSelf: 'center',
    paddingHorizontal: spacing[3],
  },
  dateToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[2],
  },
  exampleButton: {
    width: 'auto',
    maxWidth: 280,
    height: 'auto',
    minHeight: 44,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  body: { flex: 1, minHeight: 0 },
  messages: { gap: spacing[3], paddingVertical: spacing[3] },
  exampleStrip: { flexGrow: 0 },
  examples: { gap: spacing[2], paddingVertical: spacing[2] },
  error: { padding: spacing[3], gap: spacing[3], borderColor: colors.secondary },
  schedule: { padding: spacing[4], gap: spacing[1] },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  input: { flex: 1, width: 0, minWidth: 0, maxHeight: 140 },
});
