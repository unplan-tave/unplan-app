import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';

import type { ChatCandidate, ChatMessage } from '@/domains/schedule/chat/model';

interface Props {
  message: ChatMessage;
  active: boolean;
  onSelect: (index: number) => void;
  onConfirm: (token: string) => void;
}

export function ChatMessageCard({ message, active, onSelect, onConfirm }: Props) {
  const { reply } = message;
  return (
    <Card accessibilityRole="text" style={[styles.card, message.role === 'user' && styles.user]}>
      <Typography variant="caption" color={colors.text.secondary}>
        {message.role === 'user' ? '나' : '일정 비서'}
      </Typography>
      <Typography variant="bodyM" selectable>
        {message.text}
      </Typography>
      {reply?.candidates.map((candidate) => (
        <View key={candidate.index} style={styles.candidate}>
          <CandidateSummary candidate={candidate} />
          {reply.status === 'selection' || reply.status === 'recommended' ? (
            <Button
              label={
                reply.status === 'recommended'
                  ? '이 시간에 일정 반영'
                  : `${candidate.index}번째 일정 선택`
              }
              disabled={!active}
              onPress={() => onSelect(candidate.index)}
            />
          ) : null}
        </View>
      ))}
      {reply?.target ? <CandidateSummary candidate={reply.target} /> : null}
      {reply?.confirmationToken ? (
        <Button
          label="이 일정 삭제 확인"
          disabled={!active}
          onPress={() => onConfirm(reply.confirmationToken ?? '')}
        />
      ) : null}
    </Card>
  );
}

function CandidateSummary({ candidate }: { candidate: ChatCandidate }) {
  return (
    <View style={styles.candidate}>
      <Typography variant="bodyM">
        {candidate.index}. {candidate.title}
      </Typography>
      <Typography variant="caption" color={colors.text.secondary}>
        {[
          candidate.date,
          `${candidate.startTime ?? ''}–${candidate.endTime ?? ''}`,
          candidate.location,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Typography>
      {candidate.reason ? (
        <Typography variant="bodyS" color={colors.text.secondary}>
          {candidate.reason}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing[4], gap: spacing[2], marginRight: spacing[6] },
  user: {
    backgroundColor: colors.alpha.primary20,
    marginRight: spacing[0],
    marginLeft: spacing[6],
  },
  candidate: { gap: spacing[1] },
});
