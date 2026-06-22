# 개발 진행 체크리스트 (디자인·API·프론트 병행)

> ⚠️ **전제 변경 (2026-06-20):** 이 문서는 원래 "ERD만 있고 디자인 없을 때 프론트가 선행"하는 가이드로 시작했습니다.
> 현재는 **디자인(Figma) · API · 프론트엔드가 동시에 진행**되고 있고, **API 개발 중 ERD가 계속 수정**될 수 있습니다.
> 따라서 더 이상 "확정된 ERD를 보고 타입을 미리 다 짜두는" 접근은 위험하며, 변경에 강한 구조를 우선합니다.
> 아래 [§0 병행 개발 원칙](#0-병행-개발-원칙-erd가-계속-바뀐다)을 먼저 읽으세요. 이후 Phase 설명은 참고용 히스토리입니다.

[← 문서 목록](../README.md) · [개요](../overview.md) · [코어 컨벤션](../conventions/core.md) · [확장 컨벤션](../conventions/advanced.md)

---

## 0. 병행 개발 원칙 (ERD가 계속 바뀐다)

디자인·API·프론트가 동시에 굴러가고 ERD가 불안정한 상황에서 프론트가 깨지지 않으려면, **불안정한 것에 직접 의존하지 않는 것**이 핵심입니다.

### 0-1. 타입은 손으로 짜지 말고 생성한다

- ERD/DTO 타입을 `state/*/model.ts`에 **수기로 미리 박아두지 않는다.** ERD가 바뀌면 전부 따라 수정해야 함.
- 대신 **Orval로 OpenAPI 스펙에서 자동생성**(`npm run api:generate`)한다. 스펙이 바뀌면 재생성만 하면 됨.
  - `src/lib/api/endpoints/**`, `src/lib/api/model/**`는 **생성물이므로 직접 수정 금지**(이미 ESLint ignore).
  - 백엔드와 **OpenAPI(Swagger) 스펙을 단일 진실 원천(SSOT)**으로 합의한다. ERD 문서가 아니라 스펙이 기준.

### 0-2. 서버 타입과 화면 타입을 분리한다 (Anti-Corruption Layer)

- 생성된 서버 타입(`*Dto`, `*Response`)을 화면/컴포넌트에서 **직접 쓰지 않는다.**
- 화면은 프론트 전용 **ViewModel**만 보고, 서버 타입 → ViewModel 변환을 `state/<domain>` 안의 얇은 매퍼 한 곳에 둔다.
- 효과: ERD/DTO 필드명이 바뀌어도 **매퍼 한 군데만 고치면** 화면 코드는 그대로. (이미 `state/auth/api.ts`가 `BackendSocialLoginResponse` → `AuthSession`으로 unwrap하는 패턴을 쓰고 있음 — 이걸 도메인 전반의 기본값으로 삼는다.)

### 0-3. 불안정 영역은 늦게, 안정 영역은 먼저

| 지금 적극 진행해도 안전 (ERD 영향 적음) | ERD 안정될 때까지 얇게만 | 
|---|---|
| 디자인 토큰 / `components/ui` primitive | 도메인 모델 타입 (생성+매퍼로 처리) |
| 네비게이션·라우팅 골격 | 화면-서버 바인딩(React Query 훅 연결) |
| 화면 레이아웃/인터랙션(목 데이터 기반) | 영속 스키마(MMKV에 DTO 통째 저장 금지) |

- 화면은 **목(mock)/고정 데이터로 먼저** 만들고, 스펙이 굳으면 React Query 훅으로 갈아끼운다.
- MMKV/SecureStore에 **서버 DTO를 그대로 저장하지 않는다.** 스키마가 바뀌면 마이그레이션 지옥. 꼭 필요한 최소 필드만 저장.

### 0-4. 변경을 흡수하는 운영 루틴

- 백엔드 스펙 변경 시: ① `npm run api:generate` 재생성 → ② `npm run type-check`로 **터지는 지점 = 영향 범위 자동 식별** → ③ 매퍼/훅만 수정.
- 그래서 **strict TS + 생성 타입**이 곧 회귀 안전망. 손으로 짠 타입이 많을수록 이 안전망이 무력화됨.
- PR 단위로 "스펙 버전(OpenAPI version)"을 명시해 프론트/백 간 어긋남을 추적.

> 한 줄 요약: **ERD가 흔들려도 화면이 안 흔들리게.** 생성 타입으로 받아서, 매퍼로 끊고, 화면은 ViewModel만 본다.

---

## 진행 상황

> **2026-06-20 기준 · 실제 레포 상태로 갱신.** 코드베이스 전체 그림은 [개요 문서](../overview.md) 참고.
>
> 이 로드맵은 "디자인 전 선행 작업" 가이드로 작성됐으나, 이후 디자인(Figma) 일부가 나오면서
> 인증·온보딩 실제 구현과 디자인 시스템 선구현이 진행됐습니다. 아래는 그 현황입니다.

| Phase | 항목 | 상태 |
|-------|------|------|
| 1 | 프로젝트 뼈대 세우기 | ✅ 완료 (feature 중심 구조, ESLint/Prettier/Husky, CI/CD) |
| 2 | ERD → 타입 정의 | 🟡 진행 중 (Orval로 API 모델 자동생성, 도메인 타입은 일부) |
| 3 | API 레이어 구축 | 🟡 진행 중 (axios client + 인터셉터 + Orval 생성 완료, 401 refresh 미구현) |
| 4 | 네비게이션 구조 | ✅ 완료 (index 스플래시 분기 + auth + onboarding + tabs) |
| 5 | 디자인 토큰 선(先)정의 | ✅ 완료 (colors/typography/spacing/theme + SUIT 폰트) |
| 6 | 공통 컴포넌트 | ✅ 대부분 완료 (`components/ui` 30+ primitive 선구현, 일부 화면 미연결) |
| 7 | 스토어 & 비즈니스 로직 | 🟡 진행 중 (auth/onboarding store 동작, schedule/task 미착수) |
| 8 | 화면 구현 | 🟡 인증·온보딩 실구현 / 홈·일정·설정은 플레이스홀더 |
| 9 | 백엔드 연동 | 🟡 인증·온보딩 실연동, 일정 등 나머지 도메인 미연동 |

### Phase별 체크리스트

- [x] **Phase 1** — Expo SDK 56 세팅, 패키지, ESLint/Prettier/Husky, 폴더 구조, EAS/CI
- [~] **Phase 2** — Orval로 API 모델 자동생성 (도메인/Zod 스키마는 확장 필요)
- [~] **Phase 3** — axios client + 인터셉터 + Orval React Query 훅 생성 (생성 훅 미사용, 401 refresh TODO)
- [x] **Phase 4** — Expo Router (index 분기 + auth + onboarding + tabs)
- [x] **Phase 5** — colors/typography/spacing/theme 디자인 토큰 + SUIT 폰트
- [x] **Phase 6** — Typography 등 `components/ui` primitive 선구현 (다수 화면 미연결)
- [~] **Phase 7** — auth/onboarding store 완료, schedule/task 스토어 미착수
- [x] **Phase 8** — 인증·온보딩 화면 실구현, 홈/일정/설정 플레이스홀더
- [~] **Phase 9** — 카카오/구글 소셜 로그인·온보딩 서버 저장 실연동, 일정 API·MSW 미설정

> 범례: `[x]` 완료 · `[~]` 진행 중 · `[ ]` 미착수

### 이 로드맵 이후 실제로 추가된 것 (원문 계획에 없던 항목)

- 카카오 · 구글 **소셜 로그인** 실연동 (SDK 초기화, 에러 정규화, 디바이스 ID)
- **온보딩 플로우** (recovery → sleep → activity → transport) + 수면 컨디션 분류
- **Orval** 기반 OpenAPI → 타입/훅 자동생성 파이프라인
- **EAS + GitHub Actions** OTA/네이티브 빌드 분기 CI/CD
- **SUIT 폰트** 및 디자인 토큰/primitive 시스템 선구현

---

## 개요

```
초기 상황:  ERD O  |  디자인(Figma) X        → "디자인 전 프론트 선행" (이 문서의 원래 전제)
현재 상황:  디자인 · API · 프론트 동시 진행  |  ERD는 API 개발 중 계속 변경 가능
목표:       ERD/스펙이 바뀌어도 화면이 깨지지 않는 구조로, 세 트랙을 병행 진행
```

> 운영 전략은 [§0 병행 개발 원칙](#0-병행-개발-원칙-erd가-계속-바뀐다)을 기준으로 합니다.
> 아래 Phase들은 초기 선행 작업 기록이며, 상태값은 위 [진행 상황](#진행-상황) 표를 최신으로 봅니다.

---

## Phase 1: 프로젝트 뼈대 세우기 (1~2일) ✅

### 1-1. 프로젝트 초기 설정

```bash
# Expo 프로젝트 생성
npx create-expo-app@latest scheduler-app --template blank-typescript

# 필수 패키지 한번에 설치
npx expo install \
  expo-router \
  react-native-safe-area-context \
  react-native-screens \
  expo-constants \
  expo-linking \
  expo-status-bar

# 상태관리 & 서버상태
npm install zustand immer @tanstack/react-query axios

# 스타일링 & 애니메이션
npx expo install react-native-reanimated react-native-gesture-handler

# 폼
npm install react-hook-form zod @hookform/resolvers

# 유틸
npm install date-fns

# 개발 도구
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint-plugin-import eslint-plugin-react-hooks prettier \
  lint-staged husky
```

### 1-2. 폴더 구조 생성
```bash
mkdir -p src/{app,components/{common,schedule,task,ai},hooks,stores,services/{api,storage,native},types,utils,constants,assets/{fonts,images,icons}}
```

### 1-3. tsconfig.json 절대 경로 설정
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

### 1-4. ESLint / Prettier / Husky 세팅
- [코어 컨벤션 §15](../conventions/core.md#15-eslint--prettier-설정) 설정 그대로 적용
- `npx husky init` 후 pre-commit 훅 연결

---

## Phase 2: ERD → 타입 정의 (1일) 🟡

> ERD만 있어도 가장 먼저, 가장 확실하게 할 수 있는 작업

### 2-1. ERD를 TypeScript 타입으로 변환

ERD의 각 테이블 → 인터페이스 1:1 매핑

```ts
// src/types/schedule.types.ts

// DB 테이블 구조 그대로
export interface Schedule {
  id: string;             // UUID
  userId: string;
  title: string;
  description?: string;
  startAt: string;        // ISO 8601 (서버 기준)
  endAt: string;
  isAllDay: boolean;
  colorTag?: string;
  status: ScheduleStatus;
  aiGenerated: boolean;
  recurrenceRule?: string; // RRULE 형식
  createdAt: string;
  updatedAt: string;
}

export type ScheduleStatus = 'scheduled' | 'in_progress' | 'done' | 'skipped' | 'rescheduled';

// API 요청 DTO (CREATE)
export interface CreateScheduleDTO {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  isAllDay?: boolean;
  colorTag?: string;
}

// API 요청 DTO (UPDATE) - id 제외 전부 optional
export interface UpdateScheduleDTO extends Partial<Omit<CreateScheduleDTO, never>> {
  status?: ScheduleStatus;
}

// 프론트 전용 가공 타입
export interface ScheduleViewModel {
  id: string;
  title: string;
  startAt: Date;          // string → Date 변환
  endAt: Date;
  duration: number;       // 분 단위 계산값
  status: ScheduleStatus;
  colorTag: string;
  isAiGenerated: boolean;
}
```

```ts
// src/types/task.types.ts
export interface Task {
  id: string;
  scheduleId?: string;    // 일정에 연결된 태스크
  userId: string;
  title: string;
  priority: TaskPriority;
  isCompleted: boolean;
  estimatedMinutes?: number;
  dueAt?: string;
  order: number;          // 수동 정렬 순서
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
```

```ts
// src/types/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  condition: number;      // 0-100, 오늘의 컨디션
  preferences: UserPreferences;
}

export interface UserPreferences {
  workStartHour: number;  // 기본 업무 시작 시간
  workEndHour: number;
  notificationsEnabled: boolean;
  aiSuggestionsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}
```

```ts
// src/types/api.types.ts - 공통 API 응답 래퍼
export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
}
```

### 2-2. Zod 스키마 작성
```ts
// src/types/schedule.schema.ts
import { z } from 'zod';

export const createScheduleSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100),
  startAt: z.date(),
  endAt: z.date(),
  isAllDay: z.boolean().default(false),
  description: z.string().max(500).optional(),
}).refine((d) => d.endAt > d.startAt, {
  message: '종료 시간은 시작 시간 이후여야 합니다',
  path: ['endAt'],
});

export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;
```

---

## Phase 3: API 레이어 구축 (1~2일) 🟡

> 백엔드 API 스펙이 나오는 즉시 (ERD 기반으로 미리 구조만 잡아도 됨)

### 3-1. API 클라이언트 세팅
```ts
// src/services/api/client.ts
import axios from 'axios';
import { Config } from '@/constants/config';

export const apiClient = axios.create({
  baseURL: Config.apiUrl,
  timeout: 10_000,
});

// 인터셉터 설정 ([코어 컨벤션 §8](../conventions/core.md#8-api--비동기-처리) 참조)
```

### 3-2. API 함수 → Mock 데이터로 먼저 구현
```ts
// src/services/api/schedule.api.ts

import { apiClient } from './client';
import type { Schedule, CreateScheduleDTO, UpdateScheduleDTO } from '@/types/schedule.types';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';

// 실제 API가 없어도 함수 시그니처(타입)를 먼저 확정
export const scheduleApi = {
  getByDate: (date: string): Promise<Schedule[]> =>
    apiClient.get(`/schedules?date=${date}`),

  getById: (id: string): Promise<Schedule> =>
    apiClient.get(`/schedules/${id}`),

  create: (dto: CreateScheduleDTO): Promise<Schedule> =>
    apiClient.post('/schedules', dto),

  update: (id: string, dto: UpdateScheduleDTO): Promise<Schedule> =>
    apiClient.patch(`/schedules/${id}`, dto),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/schedules/${id}`),

  aiReschedule: (scheduleId: string): Promise<Schedule[]> =>
    apiClient.post(`/schedules/${scheduleId}/ai-reschedule`),
};
```

### 3-3. Mock 서버 또는 Mock 데이터 준비
```ts
// src/__mocks__/schedule.mock.ts
import type { Schedule } from '@/types/schedule.types';

export function createMockSchedule(overrides?: Partial<Schedule>): Schedule {
  return {
    id: 'mock-id-' + Math.random().toString(36).slice(2),
    userId: 'user-1',
    title: '테스트 일정',
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 3600000).toISOString(),
    isAllDay: false,
    status: 'scheduled',
    aiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export const mockSchedules: Schedule[] = [
  createMockSchedule({ title: '오전 스탠드업 미팅', startAt: '2025-01-15T09:00:00Z' }),
  createMockSchedule({ title: '점심 약속', startAt: '2025-01-15T12:00:00Z' }),
  createMockSchedule({ title: '코드 리뷰', startAt: '2025-01-15T15:00:00Z', status: 'done' }),
];
```

### 3-4. React Query 훅 작성
```ts
// src/hooks/useSchedule.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '@/services/api/schedule.api';

export const scheduleKeys = {
  all: ['schedules'] as const,
  byDate: (date: string) => ['schedules', 'date', date] as const,
  detail: (id: string) => ['schedules', id] as const,
};

export function useSchedulesByDate(date: string) {
  return useQuery({
    queryKey: scheduleKeys.byDate(date),
    queryFn: () => scheduleApi.getByDate(date),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}
```

---

## Phase 4: 네비게이션 구조 구축 (0.5일) ✅

> 디자인 없이도 화면 흐름은 기획서로 파악 가능

```tsx
// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
```

```tsx
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="schedule" options={{ title: '일정' }} />
      <Tabs.Screen name="task" options={{ title: '태스크' }} />
      <Tabs.Screen name="settings" options={{ title: '설정' }} />
    </Tabs>
  );
}
```

---

## Phase 5: 디자인 토큰 선(先) 정의 (1일) ⬜

> 디자인 나오기 전에 팀 내에서 임시 확정. 디자인 나오면 값만 교체

### 5-1. 색상 시스템 초안 잡기
```ts
// src/constants/colors.ts
// 디자인 전: 기능 중심 시맨틱 토큰으로 정의
// 실제 값은 디자인 나오면 교체 (변수명은 유지)

export const colors = {
  // 브랜드
  primary: '#5B6EF7',       // 메인 컬러 (임시)
  primaryLight: '#EEF0FE',
  primaryDark: '#3D4EC4',

  // 시맨틱
  surface: '#FFFFFF',
  background: '#F7F8FC',
  surfaceElevated: '#FFFFFF',

  // 텍스트
  text: {
    primary: '#1A1D2E',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    disabled: '#D1D5DB',
    inverse: '#FFFFFF',
  },

  // 상태
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',

  // 경계
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',

  // 일정 컬러 태그
  scheduleColors: {
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
  },

  // 다크모드
  dark: {
    primary: '#818CF8',
    surface: '#1E2030',
    background: '#151623',
    text: {
      primary: '#F3F4F8',
      secondary: '#9CA3AF',
    },
    border: '#374151',
  },
} as const;
```

### 5-2. 타이포그래피 & 스페이싱 확정
```ts
// src/constants/theme.ts
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius  = { sm: 6, md: 12, lg: 16, xl: 24, full: 9999 } as const;

export const typography = {
  size: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 24, xxl: 28, display: 34 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
```

---

## Phase 6: 공통 컴포넌트 구현 (2~3일) ⬜

> 디자인 없이 기능 중심으로 먼저 구현. 나중에 스타일만 덮어쓰면 됨

### 우선순위 순서

**반드시 먼저 (디자인과 무관):**
```
1. Button (primary, secondary, ghost, danger 변형)
2. TextInput (label, error state 포함)
3. Typography (Text 래퍼 - 폰트 시스템 통일)
4. LoadingSpinner / SkeletonLoader
5. ErrorBoundary
6. Toast / SnackBar (알림 시스템)
7. Modal / BottomSheet
8. EmptyState
```

**디자인 나오면 구현:**
```
9. 도메인 특화 컴포넌트 (ScheduleCard, TaskItem 등)
10. 복잡한 인터랙션 컴포넌트
```

### Button 컴포넌트 예시 (기능 우선 구현)
```tsx
// src/components/common/Button/Button.tsx

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  accessibilityLabel,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled || isLoading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled || isLoading, busy: isLoading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        (isDisabled || isLoading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.label, styles[`label_${variant}`]]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
```

---

## Phase 7: 스토어 & 비즈니스 로직 구현 (2일) 🟡

> UI 없이도 완성 가능한 부분

```ts
// src/stores/scheduleStore.ts - [코어 컨벤션 §6](../conventions/core.md#6-상태-관리-컨벤션) 패턴 적용

// src/stores/userStore.ts
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
}
// ...

// src/stores/appStore.ts (글로벌 UI 상태)
interface AppState {
  isOnline: boolean;
  activeToast: Toast | null;
  theme: 'light' | 'dark' | 'system';
}
```

### 유틸 함수 구현
```ts
// src/utils/date.utils.ts     → 날짜 포맷, 파싱, 비교
// src/utils/schedule.utils.ts → 일정 관련 순수 함수 (duration 계산 등)
// src/utils/validation.utils.ts → 공통 검증 함수
// src/utils/color.utils.ts    → 색상 변환, 컬러태그 처리
```

---

## Phase 8: 화면 Placeholder 구현 (1일) ✅

> 실제 UI는 없지만 라우팅 & 데이터 흐름 검증용

```tsx
// src/app/(tabs)/index.tsx
export default function HomeScreen() {
  const selectedDate = useScheduleStore((s) => s.selectedDate);
  const { data: schedules, isLoading } = useSchedulesByDate(selectedDate);

  // 데이터 흐름만 연결, UI는 나중에
  return (
    <SafeAreaView>
      <Text>홈 화면 (디자인 대기중)</Text>
      <Text>날짜: {selectedDate}</Text>
      {isLoading && <Text>로딩중...</Text>}
      {schedules?.map((s) => (
        <Text key={s.id}>{s.title}</Text>
      ))}
    </SafeAreaView>
  );
}
```

---

## Phase 9: 백엔드 연동 준비 (병행) ⬜

### API 스펙 협의 체크리스트
```
백엔드와 사전에 합의해야 할 것들:

[ ] 날짜/시간 형식: ISO 8601 UTC 기준 통일
[ ] 페이지네이션 방식: cursor 기반 vs offset 기반
[ ] 에러 응답 형식: { statusCode, message, error }
[ ] 인증 방식: JWT Bearer 토큰
[ ] 토큰 갱신 방식: refresh token 엔드포인트
[ ] API 버전 관리: /v1/ prefix
[ ] 파일 업로드 방식: presigned URL vs multipart
[ ] WebSocket 필요 여부: 실시간 알림 등
[ ] CORS 설정
[ ] 개발/스테이징 서버 URL 공유
```

### MSW (Mock Service Worker) 설정 (개발 효율 극대화)
```ts
// src/__mocks__/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockSchedules } from './schedule.mock';

export const handlers = [
  http.get('/schedules', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const filtered = mockSchedules.filter((s) => s.startAt.startsWith(date ?? ''));
    return HttpResponse.json(filtered);
  }),

  http.post('/schedules', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'new-id', ...body }, { status: 201 });
  }),
];

// 백엔드 없이 프론트 개발 완전히 독립적으로 진행 가능
```

---

## 전체 타임라인 요약

```
Week 1
├── Day 1-2:  프로젝트 세팅 + CI/CD 구성 (Phase 1, [확장 컨벤션 §17](../conventions/advanced.md#17-cicd-컨벤션))
├── Day 3:    ERD → 타입 정의 (Phase 2)
├── Day 4-5:  API 레이어 + Mock 데이터 (Phase 3)

Week 2
├── Day 1:    네비게이션 구조 (Phase 4)
├── Day 2:    디자인 토큰 임시 확정 (Phase 5)
├── Day 3-5:  공통 컴포넌트 구현 (Phase 6)

Week 3
├── Day 1-2:  스토어 & 비즈니스 로직 (Phase 7)
├── Day 3:    화면 Placeholder (Phase 8)
├── Day 4-5:  백엔드 연동 테스트 (Phase 9)

Week 4~
└── 디자인 나오는 즉시 → 공통 컴포넌트 스타일 교체 → 화면 구현
```

---

## 디자인이 나왔을 때 할 것들

```
1. 디자인 토큰 실제 값 교체
   colors.ts, theme.ts 값을 Figma 토큰으로 교체
   → 컴포넌트는 토큰만 참조하므로 전체 스타일이 한번에 변경됨

2. 공통 컴포넌트 스타일 완성
   기능은 이미 구현됨. StyleSheet만 업데이트

3. 도메인 컴포넌트 구현
   ScheduleCard, TaskItem 등 디자인 의존 컴포넌트

4. 화면 구현
   Placeholder → 실제 UI로 교체

5. 애니메이션 & 마이크로인터랙션 추가
```

---

## 백엔드 ERD만 있을 때 바로 할 수 없는 것

```
❌ 실제 화면 픽셀 구현
❌ 정확한 컴포넌트 props 확정 (일부)
❌ 애니메이션 방향
❌ 아이콘/이미지 에셋
✅ 나머지 전부
```
