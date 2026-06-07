# 코어 컨벤션

> AI 스마트 스케줄러 앱 | Expo + TypeScript + iOS-first

[← 문서 목록](../README.md) · [확장 컨벤션](./advanced.md) · [개발 체크리스트](../roadmap/pre-design-checklist.md)

---

## 목차
1. [프로젝트 구조](#1-프로젝트-구조)
2. [네이밍 컨벤션](#2-네이밍-컨벤션)
3. [TypeScript 컨벤션](#3-typescript-컨벤션)
4. [컴포넌트 작성 규칙](#4-컴포넌트-작성-규칙)
5. [스타일링 컨벤션](#5-스타일링-컨벤션)
6. [상태 관리 컨벤션](#6-상태-관리-컨벤션)
7. [훅(Hooks) 컨벤션](#7-훅hooks-컨벤션)
8. [API / 비동기 처리](#8-api--비동기-처리)
9. [네비게이션 컨벤션](#9-네비게이션-컨벤션)
10. [파일 & Import 규칙](#10-파일--import-규칙)
11. [Git 컨벤션](#11-git-컨벤션)
12. [에러 처리](#12-에러-처리)
13. [테스트 컨벤션](#13-테스트-컨벤션)
14. [주석 & 문서화](#14-주석--문서화)
15. [ESLint / Prettier 설정](#15-eslint--prettier-설정)

---

## 1. 프로젝트 구조

```txt
src/
├── app/                        # Expo Router 라우트 파일만 위치
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   └── login.tsx           # re-export only
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # re-export only
│   │   └── settings.tsx        # re-export only
│   └── schedule/
│       └── [id].tsx            # re-export only
│
├── screens/                    # 라우트가 렌더링하는 화면 구현
│   ├── auth/
│   │   └── login-screen.tsx
│   ├── onboarding/
│   │   ├── recovery-screen.tsx
│   │   └── sleep-screen.tsx
│   └── schedule/
│       └── schedule-screen.tsx
│
├── components/                 # 재사용 컴포넌트
│   ├── ui/                     # 전역 base primitive / 디자인 시스템
│   ├── auth/                   # 인증 화면군 조합 컴포넌트
│   └── onboarding/             # 온보딩 화면군 조합 컴포넌트
│
├── state/                      # 앱 상태, 도메인 모델, store
│   ├── auth/
│   │   ├── model.ts
│   │   └── use-auth-store.ts
│   └── onboarding/
│       ├── model.ts
│       └── use-onboarding-store.ts
│
├── lib/                        # 앱 전역 인프라/크로스컷팅
│   ├── api/
│   ├── auth/
│   ├── i18n/
│   ├── storage/
│   └── utils/
│
├── hooks/                      # 앱 전역 hook
├── constants/
├── types/
├── translations/
└── assets/
```

**규칙:**
- `app/`은 Expo Router route/layout 파일만 담당한다.
- 화면 구현은 `screens/<domain>/*-screen.tsx`에 둔다.
- 전역 base primitive는 `components/ui`에 둔다.
- 화면군에서 재사용되는 조합 컴포넌트는 `components/<domain>`에 둔다.
- 앱 상태, 도메인 모델, store는 `state/<domain>`에 둔다.
- 앱 전역 hook은 `hooks/`에 둔다.
- 새 컴포넌트는 기존 `components/ui` primitive를 먼저 기반으로 구현한다. primitive가 부족하면 도메인 컴포넌트에서 중복 구현하지 말고 primitive를 확장한다.
- 배럴 export(`index.ts`)는 기본 금지하되, `components/ui`처럼 import 경로 안정성이 필요한 base primitive에는 제한적으로 허용한다.

---


## 2. 네이밍 컨벤션

### 파일명
| 대상 | 규칙 | 예시 |
|------|------|------|
| 라우트 파일(`src/app`) | Expo Router 규칙 준수 | `index.tsx`, `[id].tsx`, `_layout.tsx` |
| Screen 파일(`src/screens`) | kebab-case + `-screen.tsx` | `schedule-detail-screen.tsx` |
| 컴포넌트 파일 | kebab-case 또는 기존 `components/ui` 폴더 규칙 유지 | `social-login-button.tsx` |
| 훅 파일 | kebab-case, `use-` 접두사 | `use-schedule-filter.ts` |
| store 파일(`src/state`) | kebab-case, `use-*-store.ts` | `use-schedule-store.ts` |
| API 파일 | 단일 `api.ts` 또는 도메인별 kebab-case | `api.ts`, `schedule-api.ts` |
| 모델 파일(`src/state`) | 단일 `model.ts` | `model.ts` |
| 유틸 파일 | kebab-case | `format-schedule-time.ts` |
| 전역 상수 파일 | camelCase 또는 kebab-case 일관 유지 | `colors.ts`, `storage-keys.ts` |
| 테스트 파일 | 대상파일명.test.ts(x) | `schedule-card.test.tsx` |

### 변수 & 함수
```ts
// ✅ 변수: camelCase
const scheduleList: Schedule[] = [];
const isLoading = false;

// ✅ 함수: camelCase, 동사+명사
const fetchSchedule = async () => {};
const handlePressCard = () => {};
const formatDate = (date: Date): string => {};

// ✅ 컴포넌트: PascalCase
const ScheduleCard = () => {};

// ✅ 타입/인터페이스: PascalCase
type ScheduleStatus = 'pending' | 'done' | 'skipped';
interface ScheduleCardProps { ... }

// ✅ 상수: UPPER_SNAKE_CASE
const MAX_TASK_COUNT = 20;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// ✅ Enum: PascalCase (값도 PascalCase)
enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}
```

### 이벤트 핸들러
```ts
// ✅ handle + 동사 or handle + 명사 + 동사
const handlePress = () => {};
const handleScheduleCreate = () => {};
const handleTaskDelete = (id: string) => {};

// Props로 전달할 때는 on 접두사
interface Props {
  onPress: () => void;
  onScheduleCreate: (data: CreateScheduleDTO) => void;
}
```

### Boolean 변수
```ts
// ✅ is / has / can / should 접두사
const isLoading = false;
const hasPermission = true;
const canReschedule = true;
const shouldShowAITip = false;
```

---


## 3. TypeScript 컨벤션

### 기본 원칙
```ts
// ✅ any 절대 금지. unknown 사용 후 타입 가드
const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) { ... }
};

// ✅ interface vs type
// - 객체 형태(컴포넌트 Props, API 응답) → interface
// - Union, Intersection, Tuple, 유틸리티 타입 → type
interface ScheduleCardProps {
  schedule: Schedule;
  onPress: (id: string) => void;
}

type ScheduleStatus = 'active' | 'done' | 'skipped';
type PartialSchedule = Partial<Schedule>;
```

### DTO 분리 패턴
```ts
// types/schedule.types.ts

// 서버에서 받는 원본 데이터
interface Schedule {
  id: string;
  title: string;
  startAt: string;   // ISO string (서버 형식)
  endAt: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

// 생성 요청 DTO
interface CreateScheduleDTO {
  title: string;
  startAt: string;
  endAt: string;
}

// 수정 요청 DTO
interface UpdateScheduleDTO extends Partial<CreateScheduleDTO> {
  id: string;
}

// 프론트 UI 전용 가공 타입 (서버 타입과 혼용 금지)
interface ScheduleViewModel {
  id: string;
  title: string;
  startAt: Date;     // Date 객체로 변환
  endAt: Date;
  duration: number;  // 계산된 값
  status: ScheduleStatus;
}
```

### Null 처리
```ts
// ✅ optional chaining + nullish coalescing 적극 사용
const title = schedule?.title ?? '제목 없음';

// ✅ Non-null assertion(!) 금지. 대신 early return 또는 타입 가드
// ❌
const id = schedule!.id;

// ✅
if (!schedule) return null;
const id = schedule.id;
```

### Generic 사용
```ts
// API 응답 공통 래퍼
interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

// 페이지네이션
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  hasNext: boolean;
}
```

---

## 4. 컴포넌트 작성 규칙

### 기본 구조 (순서 엄수)
```tsx
// components/schedule/ScheduleCard/ScheduleCard.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// 외부 라이브러리
import Animated, { FadeIn } from 'react-native-reanimated';

// 내부 절대 경로 import
import { colors } from '@/constants/colors';
import { formatTime } from '@/utils/date.utils';
import type { Schedule } from '@/types/schedule.types';

// 타입 정의 (Props는 컴포넌트 바로 위)
interface ScheduleCardProps {
  schedule: Schedule;
  isSelected?: boolean;
  onPress: (id: string) => void;
  onLongPress?: (id: string) => void;
}

// 컴포넌트 (function declaration 선호)
export function ScheduleCard({
  schedule,
  isSelected = false,
  onPress,
  onLongPress,
}: ScheduleCardProps) {
  // 1. 상태
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. 훅
  const { theme } = useTheme();

  // 3. 파생 값 (useMemo)
  const duration = useMemo(
    () => calculateDuration(schedule.startAt, schedule.endAt),
    [schedule.startAt, schedule.endAt],
  );

  // 4. 핸들러 (useCallback)
  const handlePress = useCallback(() => {
    onPress(schedule.id);
  }, [onPress, schedule.id]);

  // 5. 조건부 early return
  if (!schedule) return null;

  // 6. 렌더
  return (
    <Animated.View entering={FadeIn}>
      <Pressable
        style={[styles.container, isSelected && styles.selected]}
        onPress={handlePress}
        onLongPress={() => onLongPress?.(schedule.id)}
      >
        <Text style={styles.title}>{schedule.title}</Text>
        <Text style={styles.time}>{formatTime(schedule.startAt)}</Text>
      </Pressable>
    </Animated.View>
  );
}

// 스타일은 컴포넌트 하단에
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  selected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  time: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
  },
});
```

### 컴포넌트 분리 기준
```
한 컴포넌트가 아래 중 2개 이상이면 분리한다:
- 100줄 초과
- 로직(상태, 훅)이 3개 이상
- 명확히 구분되는 UI 영역이 존재
- 재사용 가능성이 보임
```

### Props 규칙
```tsx
// ✅ Props spreading 금지 (타입 안전성 저하)
// ❌
<Component {...props} />

// ✅ 명시적으로 전달
<Component title={props.title} onPress={props.onPress} />

// ✅ children 타입
interface Props {
  children: React.ReactNode;        // 일반적인 경우
  children: React.ReactElement;     // 단일 React 요소만 허용
}
```

---

## 5. 스타일링 컨벤션

### 기본 규칙
```tsx
// ✅ StyleSheet.create() 항상 사용 (성능 최적화)
// ❌ 인라인 스타일 금지 (동적 값 제외)
<View style={{ padding: 16, backgroundColor: 'white' }} /> // ❌

// ✅ 예외: 동적 값만 인라인 허용
<View style={[styles.container, { opacity: animatedValue }]} />
```

### 디자인 토큰 (theme.ts)
```ts
// constants/colors.ts
export const colors = {
  primary: '#5B6EF7',
  primaryLight: '#EEF0FE',

  surface: '#FFFFFF',
  background: '#F7F8FC',

  text: {
    primary: '#1A1D2E',
    secondary: '#6B7280',
    disabled: '#C4C9D4',
  },

  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',

  // 다크모드
  dark: {
    surface: '#1E2030',
    background: '#151623',
    text: {
      primary: '#F3F4F8',
      secondary: '#9CA3AF',
    },
  },
} as const;

// constants/theme.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
```

### 스타일 명명 규칙
```ts
const styles = StyleSheet.create({
  // 레이아웃: container, wrapper, inner, row, column
  container: {},
  headerRow: {},

  // 상태: selected, disabled, active, focused
  containerSelected: {},
  buttonDisabled: {},

  // 수식어: small, large, primary, secondary
  textPrimary: {},
  buttonSmall: {},
});
```

---

## 6. 상태 관리 컨벤션

### Zustand 스토어 패턴
```ts
// stores/scheduleStore.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVStorage } from '@/services/storage/mmkv';
import type { Schedule, CreateScheduleDTO } from '@/types/schedule.types';

// 상태와 액션 타입 분리
interface ScheduleState {
  schedules: Schedule[];
  selectedDate: string;           // YYYY-MM-DD
  isLoading: boolean;
  error: string | null;
}

interface ScheduleActions {
  setSelectedDate: (date: string) => void;
  addSchedule: (dto: CreateScheduleDTO) => Promise<void>;
  updateSchedule: (id: string, dto: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  fetchSchedules: (date: string) => Promise<void>;
  reset: () => void;
}

type ScheduleStore = ScheduleState & ScheduleActions;

const initialState: ScheduleState = {
  schedules: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,
};

export const useScheduleStore = create<ScheduleStore>()(
  immer(
    persist(
      (set, get) => ({
        ...initialState,

        setSelectedDate: (date) => {
          set((state) => {
            state.selectedDate = date;
          });
        },

        fetchSchedules: async (date) => {
          set((state) => { state.isLoading = true; state.error = null; });
          try {
            const data = await scheduleApi.getByDate(date);
            set((state) => { state.schedules = data; });
          } catch (err) {
            set((state) => { state.error = '스케줄을 불러오지 못했습니다.'; });
          } finally {
            set((state) => { state.isLoading = false; });
          }
        },

        reset: () => set(initialState),
      }),
      {
        name: 'schedule-store',
        storage: createJSONStorage(() => MMKVStorage),
        // 민감하지 않은 것만 persist
        partialize: (state) => ({ selectedDate: state.selectedDate }),
      },
    ),
  ),
);

// 셀렉터는 스토어 외부에 정의 (리렌더 최적화)
export const selectTodaySchedules = (state: ScheduleStore) =>
  state.schedules.filter((s) => s.date === state.selectedDate);
```

### 서버 상태 vs 클라이언트 상태
```
서버 상태 (API 데이터)     → TanStack Query (React Query)
클라이언트 UI 상태         → Zustand
폼 상태                   → React Hook Form
컴포넌트 로컬 상태         → useState / useReducer
```

### React Query 패턴
```ts
// hooks/useSchedule.ts

export function useSchedules(date: string) {
  return useQuery({
    queryKey: ['schedules', date],
    queryFn: () => scheduleApi.getByDate(date),
    staleTime: 1000 * 60 * 5,    // 5분
    gcTime: 1000 * 60 * 30,      // 30분
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: (_, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (error) => {
      // 에러 토스트 처리
    },
  });
}
```

---

## 7. 훅(Hooks) 컨벤션

```ts
// hooks/useTaskReorder.ts

// ✅ 훅은 단일 책임 원칙
// ✅ 반환값: 객체 형태로 명시적 이름 부여
export function useTaskReorder(initialTasks: Task[]) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isDragging, setIsDragging] = useState(false);

  const reorderTask = useCallback((fromIndex: number, toIndex: number) => {
    setTasks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const resetOrder = useCallback(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  return {
    tasks,
    isDragging,
    setIsDragging,
    reorderTask,
    resetOrder,
  };
}
```

### 훅 규칙
- 훅 파일 하나당 훅 하나
- 반환값이 2개 이상이면 객체로 반환 (배열 반환 금지, `useState` 예외)
- 컴포넌트 내부에서 useCallback / useMemo 의존성 배열 항상 명시
- 커스텀 훅 내부에서 직접 UI 렌더 로직 포함 금지

---

## 8. API / 비동기 처리

### API 클라이언트
```ts
// services/api/client.ts

import axios from 'axios';
import { tokenStorage } from '@/services/storage/mmkv';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // 토큰 갱신 또는 로그아웃 처리
    }
    return Promise.reject(error);
  },
);
```

### API 함수 패턴
```ts
// services/api/schedule.api.ts

export const scheduleApi = {
  getByDate: (date: string): Promise<Schedule[]> =>
    apiClient.get(`/schedules?date=${date}`),

  create: (dto: CreateScheduleDTO): Promise<Schedule> =>
    apiClient.post('/schedules', dto),

  update: (id: string, dto: UpdateScheduleDTO): Promise<Schedule> =>
    apiClient.patch(`/schedules/${id}`, dto),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/schedules/${id}`),
};
```

### 환경변수
```
// .env.local (로컬 개발)
EXPO_PUBLIC_API_URL=http://localhost:3000

// .env.production
EXPO_PUBLIC_API_URL=https://api.yourapp.com

// 규칙: 클라이언트에서 접근하는 변수는 EXPO_PUBLIC_ 접두사 필수
//       비밀 키는 절대 EXPO_PUBLIC_ 사용 금지
```

---

## 9. 네비게이션 컨벤션

### Expo Router (파일 기반)
```txt
src/app/
├── _layout.tsx                   # 루트 레이아웃
├── (auth)/
│   ├── _layout.tsx
│   └── login.tsx                 # route file (re-export only)
├── (tabs)/
│   ├── _layout.tsx               # 탭 레이아웃
│   ├── index.tsx                 # route file (re-export only)
│   └── schedule.tsx              # route file (re-export only)
└── schedule/
    └── [id].tsx                  # route file (re-export only)
```

### 라우트 파일 규칙
```tsx
// src/app/(tabs)/schedule.tsx
export { ScheduleScreen as default } from '@/screens/schedule/schedule-screen';
```

- `src/app` 내부 파일에는 화면 로직, API 호출, 상태 관리 코드를 넣지 않는다.
- 라우트 파일은 기본적으로 `screens`의 screen을 re-export하는 thin layer로 유지한다.
- 예외는 `_layout.tsx`, `+not-found.tsx`처럼 라우팅 자체 구성이 필요한 파일뿐이다.

### 라우터 사용
```tsx
import { router, useLocalSearchParams } from 'expo-router';

router.push('/schedule/123');
router.replace('/(tabs)/');
router.back();

const { id } = useLocalSearchParams<{ id: string }>();
```

---

## 10. 파일 & Import 규칙

### 절대 경로 설정 (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Import 순서 (eslint-plugin-import로 강제)
```ts
// 1. React / React Native 코어
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

// 2. 외부 라이브러리 (알파벳순)
import { useQuery } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';

// 3. 내부 절대 경로 (@/) - 알파벳순
import { Button } from '@/components/ui/button';
import { colors } from '@/constants/colors';
import { useScheduleStore } from '@/state/schedule/use-schedule-store';

// 4. 같은 폴더 내부 상대 경로
import { ScheduleHeader } from './schedule-header';

// 5. type import
import type { Schedule } from '@/state/schedule/model';
```

### 경로 사용 규칙
- `src/app`은 route/layout 외 파일을 두지 않는다.
- 화면은 `@/screens/<domain>/...`에서 import한다.
- 상태와 도메인 모델은 `@/state/<domain>/...`에서 import한다.
- 전역 hook은 `@/hooks/...`에서 import한다.
- base primitive는 `@/components/ui/...`에서 import한다.
- 화면군 조합 컴포넌트는 `@/components/<domain>/...`에서 import한다.
- 같은 폴더 안의 작은 private helper만 상대 경로(`./`, `../`)를 사용한다.

### 배럴 파일 (index.ts)
- 기본 정책: 배럴 export 금지.
- 예외: `components/ui`처럼 전역 UI 프리미티브 집합에 한해 제한적으로 허용 가능.
- Fast Refresh 안정성을 위해 screen/state/domain 폴더에 광범위한 배럴 파일을 만들지 않는다.

---


## 11. Git 컨벤션

### 브랜치 전략 (GitHub Flow 기반)
```
main                    # 프로덕션 (배포 가능한 상태 항상 유지)
├── develop             # 개발 통합 브랜치
├── feat/schedule-ai    # 기능 개발
├── fix/calendar-crash  # 버그 수정
├── chore/update-deps   # 의존성, 설정 변경
└── hotfix/login-error  # 긴급 수정
```

### 커밋 메시지 (Conventional Commits)
```
<type>(<scope>): <subject>

[body]

[footer]
```

| type | 용도 |
|------|------|
| feat | 새 기능 |
| fix | 버그 수정 |
| chore | 빌드, 설정, 패키지 관련 |
| refactor | 기능 변경 없는 코드 개선 |
| style | 포맷팅, 세미콜론 등 코드 의미 없는 변경 |
| test | 테스트 추가/수정 |
| docs | 문서 변경 |
| perf | 성능 개선 |

```bash
# 예시
feat(schedule): AI 자동 일정 재배치 기능 추가
fix(task): 완료 상태 체크박스 클릭 시 크래시 수정
chore(deps): react-native-reanimated 3.8.0 업그레이드
refactor(store): scheduleStore immer 미들웨어 적용
```

### PR 규칙
- PR 단위: 기능 하나 또는 버그 하나
- PR 크기: 변경 파일 10개 이하, 변경 라인 400줄 이하 권장
- PR 제목: 커밋 메시지 형식 동일
- 셀프 리뷰 후 PR 오픈

---

## 12. 에러 처리

### Error Boundary
```tsx
// components/common/ErrorBoundary.tsx
import React from 'react';

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorScreen />;
    }
    return this.props.children;
  }
}
```

### 에러 처리 계층
```
컴포넌트 에러    → ErrorBoundary
API 에러        → React Query onError + 토스트 알림
전역 에러        → Sentry (production)
네트워크 에러    → axios interceptor → 사용자 안내 메시지
```

---

## 13. 테스트 컨벤션

### 테스트 파일 위치
```
컴포넌트 테스트  → __tests__/ScheduleCard.test.tsx  (컴포넌트 폴더 내)
훅 테스트       → __tests__/useSchedule.test.ts
유틸 테스트      → utils/__tests__/date.utils.test.ts
```

### 작성 규칙
```tsx
// Given-When-Then 패턴
describe('ScheduleCard', () => {
  it('일정 제목이 올바르게 렌더링된다', () => {
    // Given
    const schedule = createMockSchedule({ title: '헬스장' });

    // When
    const { getByText } = render(<ScheduleCard schedule={schedule} onPress={jest.fn()} />);

    // Then
    expect(getByText('헬스장')).toBeTruthy();
  });

  it('onPress 호출 시 스케줄 id를 전달한다', () => {
    const onPress = jest.fn();
    const schedule = createMockSchedule({ id: 'abc-123' });

    const { getByRole } = render(<ScheduleCard schedule={schedule} onPress={onPress} />);
    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledWith('abc-123');
  });
});
```

---

## 14. 주석 & 문서화

```ts
// ✅ 코드가 왜 이렇게 작성됐는지 설명하는 주석
// iOS에서 ScrollView 내 TextInput 포커스 시 레이아웃이 밀리는 버그 대응
// ref: https://github.com/facebook/react-native/issues/XXXXX
const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';

// ✅ 복잡한 비즈니스 로직에 JSDoc
/**
 * AI 추천 우선순위 점수를 계산합니다.
 * @param task - 태스크 객체
 * @param userCondition - 현재 사용자 컨디션 (0-100)
 * @returns 0-100 사이의 우선순위 점수
 */
export function calculateAIPriority(task: Task, userCondition: number): number {
  ...
}

// ❌ 코드를 그대로 설명하는 주석 금지
// count를 1 증가시킴
setCount(count + 1);
```

---

## 15. ESLint / Prettier 설정

포맷·린트 규칙은 **레포 설정 파일이 단일 진실 원천**입니다. 아래 파일을 직접 참조하세요.

| 파일 | 역할 |
|------|------|
| `eslint.config.js` | TypeScript, import 순서, React Hooks 규칙 |
| `.prettierrc` | 코드 포맷 (따옴표, 세미콜론, 줄 길이 등) |
| `package.json` → `scripts` | `lint`, `format`, `type-check` |
| `package.json` → `lint-staged` | 커밋 전 자동 검사 |
| `.husky/pre-commit` | Husky 훅 연결 |

문서와 설정이 다를 경우 **설정 파일을 따릅니다.**

---

## 빠른 참조 카드

| 항목 | 규칙 |
|------|------|
| 컴포넌트 | PascalCase, function declaration |
| 파일명 | 컴포넌트 PascalCase, 나머지 camelCase |
| 훅 | use 접두사, 반환값 객체 |
| 이벤트 핸들러 | handle 접두사 (내부), on 접두사 (Props) |
| Boolean | is/has/can/should 접두사 |
| 상수 | UPPER_SNAKE_CASE |
| 타입/인터페이스 | PascalCase, Props는 컴포넌트 바로 위 |
| any | 절대 금지 |
| 스타일 | StyleSheet.create(), 인라인 금지 |
| 서버 상태 | React Query |
| 전역 상태 | Zustand + immer |
| 커밋 | Conventional Commits |
