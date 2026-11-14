import { useRef, useState } from 'react';

import { Config } from '@/constants/config';
import { useAuthStore } from '@/domains/auth/use-auth-store';
import { getChatError } from '@/domains/schedule/chat/api/client';
import { useChatMutation } from '@/domains/schedule/chat/api/mutations';
import { useDemoSchedulesQuery } from '@/domains/schedule/chat/api/queries';
import { createChatId } from '@/domains/schedule/chat/model';
import { useDemoSessionStore } from '@/domains/schedule/chat/use-demo-session-store';
import { addDays, formatDateValue } from '@/lib/utils/date';

import type { ChatMessage, ChatRequest } from '@/domains/schedule/chat/model';

export function useDemoChat() {
  const sessionId = useDemoSessionStore((state) => state.sessionId);
  const nickname = useDemoSessionStore((state) => state.nickname);
  const selectedDate = useDemoSessionStore((state) => state.selectedDate);
  const selectDate = useDemoSessionStore((state) => state.selectDate);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '안녕하세요. 일정 관리와 시간 추천을 도와드릴게요. “내일 공부 1시간 언제 하면 좋아?”처럼 물어보세요.',
    },
  ]);
  const [failure, setFailure] = useState<{ request: ChatRequest; message: string } | null>(null);
  const lock = useRef(false);
  const mutation = useChatMutation();
  const scheduleQuery = useDemoSchedulesQuery(
    selectedDate ?? '',
    Config.isDemo && isAuthenticated && !!sessionId,
  );

  async function execute(request: ChatRequest, isRetry = false) {
    if (lock.current) return;
    lock.current = true;
    setFailure(null);
    if (!isRetry) {
      setMessages((previous) => [
        ...previous,
        { id: createChatId(), role: 'user', text: request.message ?? '이 일정 삭제 확인' },
      ]);
      setText('');
    }
    try {
      const reply = await mutation.mutateAsync(request);
      if (reply.date) selectDate(reply.date);
      setMessages((previous) => [
        ...previous,
        { id: createChatId(), role: 'assistant', text: reply.message, reply },
      ]);
      // Also refresh on read/clarification so the displayed list always comes from the DB.
      await scheduleQuery.refetch();
    } catch (error: unknown) {
      setFailure({ request, message: getChatError(error) });
    } finally {
      lock.current = false;
    }
  }

  function send(message = text) {
    if (!sessionId || !message.trim()) return;
    void execute({ sessionId, requestId: createChatId(), message: message.trim() });
  }
  function confirm(confirmationToken: string) {
    if (!sessionId || failure) return;
    void execute({ sessionId, requestId: createChatId(), confirmationToken });
  }
  function moveDate(offset: number) {
    if (selectedDate)
      selectDate(formatDateValue(addDays(new Date(`${selectedDate}T12:00:00`), offset)));
  }

  return {
    sessionId,
    nickname,
    isAuthenticated,
    selectedDate,
    text,
    setText,
    messages,
    isPending: mutation.isPending,
    failure,
    schedules: scheduleQuery.data ?? [],
    isListLoading: scheduleQuery.isFetching,
    listError: scheduleQuery.isError,
    send,
    confirm,
    moveDate,
    retry: () => {
      if (failure) void execute(failure.request, true);
    },
    refresh: () => void scheduleQuery.refetch(),
  };
}
