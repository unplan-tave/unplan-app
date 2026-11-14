import { create } from 'zustand';

interface DemoSession {
  sessionId: string | null;
  nickname: string;
  selectedDate: string | null;
  setSession: (sessionId: string, nickname: string, today: string) => void;
  selectDate: (date: string) => void;
}

export const useDemoSessionStore = create<DemoSession>((set) => ({
  sessionId: null,
  nickname: '',
  selectedDate: null,
  setSession: (sessionId, nickname, today) => set({ sessionId, nickname, selectedDate: today }),
  selectDate: (selectedDate) => set({ selectedDate }),
}));
