export interface ChatCandidate {
  index: number;
  title: string;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  reason?: string;
}

export interface ChatReply {
  status: 'done' | 'listed' | 'recommended' | 'question' | 'selection' | 'confirmation';
  message: string;
  date?: string;
  candidates: ChatCandidate[];
  confirmationToken?: string;
  target?: ChatCandidate;
}

export interface ChatRequest {
  sessionId: string;
  requestId: string;
  message?: string;
  confirmationToken?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  reply?: ChatReply;
}

export interface DemoSchedule {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  memo: string;
}

export const CHAT_EXAMPLES = [
  '내일 학교 공부 1시간 해야 하는데 언제 하는 게 좋아?',
  '내일 할 일 추천해줘',
  '내일 오후 3시부터 4시까지 팀 회의 추가해줘',
  '내일 일정 보여줘',
  '내일 팀 회의 한 시간 미뤄줘',
  '그 회의 장소를 홍대입구로 바꿔줘',
  '내일 팀 회의 삭제해줘',
] as const;

export function createChatId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  // These IDs identify requests, not authentication or delete authorization tokens.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16);
    return (char === 'x' ? value : (value & 3) | 8).toString(16);
  });
}
