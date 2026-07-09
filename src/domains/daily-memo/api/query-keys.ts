export const dailyMemoQueryKeys = {
  all: ['daily-memo'] as const,
  byDate: (date: string) => [...dailyMemoQueryKeys.all, 'date', date] as const,
};
