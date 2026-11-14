import axios from 'axios';
import { z } from 'zod';

import { Config } from '@/constants/config';
import { apiClient } from '@/lib/api/client';
import { assertDemoApiUrl } from '@/lib/demo-environment';
import { secureStorage } from '@/lib/storage/secure-storage';

import { createChatId } from '../model';

import type { ChatCandidate, ChatReply, ChatRequest, DemoSchedule } from '../model';

const candidateSchema = z.object({
  index: z.number().int().positive(),
  title: z.string(),
  date: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  location: z.string().nullable(),
  reason: z.string().optional(),
});
const replySchema = z
  .object({
    status: z.enum(['done', 'listed', 'recommended', 'question', 'selection', 'confirmation']),
    message: z.string(),
    date: z.string().optional(),
    candidates: z.array(candidateSchema).default([]),
    confirmation_token: z.string().optional(),
    target: candidateSchema.optional(),
  })
  .superRefine((reply, context) => {
    if (reply.status === 'confirmation' && (!reply.target || !reply.confirmation_token)) {
      context.addIssue({ code: 'custom', message: '삭제 확인에는 대상과 확인 토큰이 필요합니다.' });
    }
  });
const loginSchema = z.object({
  access_token: z.string().min(1),
  member_id: z.number(),
  nickname: z.string(),
  today: z.string(),
});

function toCandidate(dto: z.infer<typeof candidateSchema>): ChatCandidate {
  return {
    index: dto.index,
    title: dto.title,
    date: dto.date,
    startTime: dto.start_time,
    endTime: dto.end_time,
    location: dto.location,
    reason: dto.reason,
  };
}

export async function loginToDemo(user: 1 | 2) {
  assertDemoApiUrl(Config.apiUrl);
  // Fresh requests intentionally bypass the authenticated client's old session headers.
  const info = await axios.get<unknown>(`${Config.apiUrl}/demo/info`, { timeout: 10000 });
  z.object({ mode: z.literal('unplan-local-chatbot-demo') }).parse(info.data);
  const response = await axios.post<unknown>(
    `${Config.apiUrl}/demo/login?user=${user}`,
    {},
    { timeout: 10000 },
  );
  const data = loginSchema.parse(response.data);
  const key = `chatbot_demo_session_${data.member_id}`;
  const sessionId = (await secureStorage.get(key)) ?? createChatId();
  await secureStorage.set(key, sessionId);
  return {
    accessToken: data.access_token,
    memberId: data.member_id,
    nickname: data.nickname,
    today: data.today,
    sessionId,
  };
}

export async function submitChat(request: ChatRequest): Promise<ChatReply> {
  assertDemoApiUrl(Config.apiUrl);
  const response = await apiClient.post<unknown>('/demo/chat', {
    session_id: request.sessionId,
    request_id: request.requestId,
    ...(request.confirmationToken
      ? { confirmation_token: request.confirmationToken }
      : { message: request.message }),
  });
  const data = replySchema.parse(response.data);
  return {
    status: data.status,
    message: data.message,
    date: data.date,
    candidates: data.candidates.map(toCandidate),
    confirmationToken: data.confirmation_token,
    target: data.target ? toCandidate(data.target) : undefined,
  };
}

export async function fetchDemoSchedules(date: string): Promise<DemoSchedule[]> {
  assertDemoApiUrl(Config.apiUrl);
  const response = await apiClient.get<unknown>('/demo/schedules', { params: { date } });
  const data = z
    .array(
      z.object({
        schedule_id: z.number(),
        title: z.string(),
        start_time: z.string().nullable(),
        end_time: z.string().nullable(),
        location: z.string().nullable(),
        memo: z.string().nullable(),
      }),
    )
    .parse(response.data);
  return data.map((item) => ({
    id: item.schedule_id,
    title: item.title,
    startTime: item.start_time ?? '',
    endTime: item.end_time ?? '',
    location: item.location ?? '',
    memo: item.memo ?? '',
  }));
}

export function getChatError(error: unknown): string {
  if (error instanceof z.ZodError)
    return '서버 응답을 확인할 수 없습니다. 데모 서버를 확인한 후 다시 시도해 주세요.';
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    const parsed = z.object({ message: z.string() }).safeParse(data);
    if (parsed.success) return parsed.data.message;
    if (error.response?.status === 401 || error.response?.status === 403)
      return '로그인이 만료되었습니다. 데모 사용자로 다시 로그인해 주세요.';
    return '데모 서버에 연결하지 못했습니다. 서버 실행과 데모 주소를 확인해 주세요.';
  }
  return error instanceof Error ? error.message : '요청 처리 중 오류가 발생했습니다.';
}
