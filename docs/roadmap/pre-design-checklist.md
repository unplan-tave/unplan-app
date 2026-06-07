# 디자인 전 개발 체크리스트

> ERD만 있고 Figma가 없을 때, 디자인 나오기 전에 프론트엔드가 선행할 작업

[← 문서 목록](../README.md) · [코어 컨벤션](../conventions/core.md) · [확장 컨벤션](../conventions/advanced.md)

---

## 진행 상황

> 2026-05-29 기준 · 레포 현재 상태 반영

| Phase | 항목 | 상태 |
|-------|------|------|
| 1 | 프로젝트 뼈대 세우기 | ✅ 완료 (feature 중심 구조로 정리) |
| 2 | ERD → 타입 정의 | 🟡 진행 중 (기본 타입만 존재, 도메인 타입 확장 필요) |
| 3 | API 레이어 구축 | 🟡 진행 중 (`lib/api/client.ts` 구성 완료) |
| 4 | 네비게이션 구조 | ✅ 완료 (auth + tabs, route thin layer 적용) |
| 5 | 디자인 토큰 선(先)정의 | 🟡 진행 중 (`constants` 토큰 구성됨, 값/스키마 고도화 필요) |
| 6 | 공통 컴포넌트 | 🟡 진행 중 (`Typography`, `Tag` 구현 및 `components/ui` 이동) |
| 7 | 스토어 & 비즈니스 로직 | 🟡 진행 중 (`state/auth/use-auth-store.ts` 기준 정리) |
| 8 | 화면 Placeholder | ✅ 완료 (auth/home/schedule/settings/playground 기본 화면 분리) |
| 9 | 백엔드 연동 준비 | ⬜ 미완 |

### Phase별 체크리스트

- [x] **Phase 1** — Expo 세팅, 패키지, ESLint/Prettier/Husky, 폴더 구조
- [ ] **Phase 2** — ERD 전체 타입, Zod 스키마
- [ ] **Phase 3** — API 함수, Mock 데이터, React Query 훅
- [x] **Phase 4** — Expo Router (auth, tabs)
- [ ] **Phase 5** — `colors.ts`, `theme.ts` 디자인 토큰
- [ ] **Phase 6** — Button, TextInput, Typography 등 공통 컴포넌트
- [ ] **Phase 7** — schedule/task 스토어, 유틸 함수
- [x] **Phase 8** — 데이터 흐름 연결된 Placeholder 화면
- [ ] **Phase 9** — API 스펙 협의, MSW 설정

---

## 개요

```
현재 상황:  ERD(백엔드 데이터 모델) O  |  디자인(Figma) X
목표:       디자인 나올 때 바로 화면 개발 시작할 수 있는 상태 만들기
```

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
