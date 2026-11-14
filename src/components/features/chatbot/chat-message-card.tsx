import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

import { AssistantMark } from './chat-welcome';

import type { ChatCandidate, ChatMessage } from '@/domains/schedule/chat/model';

interface Props {
  message: ChatMessage;
  active: boolean;
  onSelect: (index: number) => void;
  onConfirm: (token: string) => void;
}

export function ChatMessageCard({ message, active, onSelect, onConfirm }: Props) {
  const { reply } = message;
  const user = message.role === 'user';
  return (
    <View style={[styles.message, user && styles.userMessage]}>
      {!user ? (
        <View style={styles.identity}>
          <AssistantMark small />
          <Typography variant="tag" color={colors.text.secondary}>
            UNPLAN
          </Typography>
          {reply?.status === 'done' ? (
            <View style={styles.complete}>
              <Icon name="done" size={14} color={colors.primary} />
              <Typography variant="caption" color={colors.primary}>
                반영 완료
              </Typography>
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={[styles.bubble, user && styles.userBubble]}>
        <Typography
          variant="bodyM"
          color={user ? colors.gray.white : colors.text.primary}
          selectable
        >
          {message.text}
        </Typography>
      </View>
      {reply?.candidates.map((candidate) => (
        <Card key={candidate.index} accessibilityRole="text" style={styles.candidate}>
          <View style={styles.candidateHeading}>
            <View style={styles.number}>
              <Typography variant="tag" color={colors.primary}>
                {candidate.index.toString().padStart(2, '0')}
              </Typography>
            </View>
            <Typography variant="tag" color={colors.text.secondary}>
              {reply.status === 'recommended' ? '추천 시간' : '일정'}
            </Typography>
          </View>
          <CandidateSummary candidate={candidate} />
          {reply.status === 'selection' || reply.status === 'recommended' ? (
            <Button
              label={reply.status === 'recommended' ? '이 시간에 일정 추가' : '이 일정 선택'}
              variant="primary"
              fullWidth
              disabled={!active}
              onPress={() => onSelect(candidate.index)}
              style={styles.action}
            />
          ) : null}
        </Card>
      ))}
      {reply?.target ? (
        <Card accessibilityRole="text" style={styles.candidate}>
          <Typography variant="tag" color={colors.secondary}>
            삭제할 일정 확인
          </Typography>
          <CandidateSummary candidate={reply.target} />
        </Card>
      ) : null}
      {reply?.confirmationToken ? (
        <Button
          label="이 일정 삭제 확인"
          disabled={!active}
          onPress={() => onConfirm(reply.confirmationToken ?? '')}
          style={styles.deleteButton}
          textStyle={styles.deleteText}
        />
      ) : null}
    </View>
  );
}

function CandidateSummary({ candidate }: { candidate: ChatCandidate }) {
  return (
    <View style={styles.summary}>
      <Typography variant="titleS">{candidate.title}</Typography>
      <Typography variant="bodyM" color={colors.primary}>
        {candidate.startTime
          ? `${candidate.startTime}${candidate.endTime ? ` – ${candidate.endTime}` : ''}`
          : '시간 미정'}
      </Typography>
      <Typography variant="caption" color={colors.text.secondary}>
        {[candidate.date, candidate.location].filter(Boolean).join(' · ')}
      </Typography>
      {candidate.reason ? (
        <View style={styles.reason}>
          <Typography variant="bodyS" color={colors.text.secondary}>
            {candidate.reason}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  message: { gap: spacing[2], alignSelf: 'flex-start', width: '94%' },
  userMessage: { alignSelf: 'flex-end', width: 'auto', maxWidth: '88%' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  complete: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginLeft: 'auto' },
  bubble: {
    padding: spacing[4],
    borderRadius: radius['2xl'],
    borderTopLeftRadius: radius['2xs'],
    backgroundColor: colors.gray.white,
  },
  userBubble: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xs'],
    backgroundColor: colors.primary,
  },
  candidate: {
    padding: spacing[4],
    gap: spacing[3],
    borderRadius: radius['2xl'],
    borderColor: colors.alpha.primary20,
  },
  candidateHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  number: {
    backgroundColor: colors.appIconBackground,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  summary: { gap: spacing[1] },
  reason: {
    marginTop: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: spacing.px,
    borderTopColor: colors.border,
  },
  action: { minHeight: 44 },
  deleteButton: {
    minHeight: 44,
    backgroundColor: colors.alpha.secondary10,
    borderColor: colors.alpha.secondary10,
  },
  deleteText: { color: colors.secondary },
});
