/**
 * schedule query key factory입니다.
 * list/search/detail 캐시 계층을 고정해 mutation 후 invalidate 범위를 명확히 합니다.
 */
export const scheduleQueryKeys = {
  all: ['schedule'] as const,
  lists: () => [...scheduleQueryKeys.all, 'list'] as const,
  byDate: (date: string) => [...scheduleQueryKeys.lists(), 'date', date] as const,
  byWeek: (date: string) => [...scheduleQueryKeys.lists(), 'week', date] as const,
  byMonth: (month: string) => [...scheduleQueryKeys.lists(), 'month', month] as const,
  searches: () => [...scheduleQueryKeys.all, 'search'] as const,
  search: (params: unknown) => [...scheduleQueryKeys.searches(), params] as const,
  dailyMessages: () => [...scheduleQueryKeys.all, 'daily-message'] as const,
  dailyMessage: (date: string) => [...scheduleQueryKeys.dailyMessages(), date] as const,
  details: () => [...scheduleQueryKeys.all, 'detail'] as const,
  detail: (scheduleId: number) => [...scheduleQueryKeys.details(), scheduleId] as const,
  personalTags: () => [...scheduleQueryKeys.all, 'personal-tags'] as const,
  tagRecommendation: (title: string) =>
    [...scheduleQueryKeys.all, 'tag-recommendation', title] as const,
};
