/** 수면 기록 query key factory입니다. */
export const sleepQueryKeys = {
  all: ['sleep'] as const,
  detail: (sleepId: number) => [...sleepQueryKeys.all, sleepId] as const,
};
