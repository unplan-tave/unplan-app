export const memberQueryKeys = {
  all: ['member'] as const,
  profile: () => [...memberQueryKeys.all, 'profile'] as const,
  alarmSettings: () => [...memberQueryKeys.all, 'alarm-settings'] as const,
};
