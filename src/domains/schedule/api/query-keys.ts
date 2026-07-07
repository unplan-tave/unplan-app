export const scheduleQueryKeys = {
  all: ['schedule'] as const,
  lists: () => [...scheduleQueryKeys.all, 'list'] as const,
  byDate: (date: string) => [...scheduleQueryKeys.lists(), 'date', date] as const,
  byWeek: (date: string) => [...scheduleQueryKeys.lists(), 'week', date] as const,
  byMonth: (month: string) => [...scheduleQueryKeys.lists(), 'month', month] as const,
  search: (params: unknown) => [...scheduleQueryKeys.lists(), 'search', params] as const,
  details: () => [...scheduleQueryKeys.all, 'detail'] as const,
  detail: (scheduleId: number) => [...scheduleQueryKeys.details(), scheduleId] as const,
};
