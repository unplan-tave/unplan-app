export interface MemberProfile {
  name: string;
  nickname: string;
  email: string;
  hasCompletedOnboarding: boolean;
}

export interface MemberProfileUpdateInput {
  name?: string;
  nickname?: string;
  email?: string;
}
