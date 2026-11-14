import { useMutation, useQueryClient } from '@tanstack/react-query';

import { aiRecommendationQueryKeys } from '@/domains/ai-recommendation/api/query-keys';
import { scheduleQueryKeys } from '@/domains/schedule/api/query-keys';

import { submitChat } from './client';

import type { ChatReply } from '../model';
import type { QueryClient } from '@tanstack/react-query';

export async function refreshChatSchedules(queryClient: QueryClient, reply: ChatReply) {
  if (reply.status !== 'done') return;
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: scheduleQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: aiRecommendationQueryKeys.all }),
  ]);
}

export function useChatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitChat,
    retry: false,
    onSuccess: (reply) => refreshChatSchedules(queryClient, reply),
  });
}
