import { useQuery } from '@tanstack/react-query';

import { scheduleQueryKeys } from '@/domains/schedule/api/query-keys';

import { fetchDemoSchedules } from './client';

export function useDemoSchedulesQuery(date: string, enabled: boolean) {
  return useQuery({
    queryKey: [...scheduleQueryKeys.lists(), 'chatbot-demo', date],
    queryFn: () => fetchDemoSchedules(date),
    enabled: enabled && !!date,
  });
}
