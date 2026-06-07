# 확장 컨벤션

> [코어 컨벤션](./core.md)에서 다루지 않은 영역

[← 문서 목록](../README.md) · [코어 컨벤션](./core.md)

---

## 목차
1. [접근성 (Accessibility)](#1-접근성-accessibility)
2. [성능 최적화 규칙](#2-성능-최적화-규칙)
3. [애니메이션 컨벤션](#3-애니메이션-컨벤션)
4. [플랫폼 분기 처리](#4-플랫폼-분기-처리)
5. [Native 브릿지 / Widget 코드](#5-native-브릿지--widget-코드)
6. [폼 & 유효성 검사](#6-폼--유효성-검사)
7. [로컬 스토리지 계층](#7-로컬-스토리지-계층)
8. [환경 변수 & 시크릿 관리](#8-환경-변수--시크릿-관리)
9. [로깅 & 모니터링](#9-로깅--모니터링)
10. [보안 컨벤션](#10-보안-컨벤션)
11. [국제화(i18n) & 다국어](#11-국제화i18n--다국어)
12. [날짜 & 시간 처리](#12-날짜--시간-처리)
13. [이미지 & 에셋 관리](#13-이미지--에셋-관리)
14. [푸시 알림 컨벤션](#14-푸시-알림-컨벤션)
15. [딥링크 처리](#15-딥링크-처리)
16. [패키지 & 의존성 관리](#16-패키지--의존성-관리)
17. [CI/CD 컨벤션](#17-cicd-컨벤션)
18. [코드 리뷰 프로세스](#18-코드-리뷰-프로세스)
19. [문서화 컨벤션](#19-문서화-컨벤션)
20. [폴더 내 파일 한도 & 분리 기준](#20-폴더-내-파일-한도--분리-기준)

---

## 1. 접근성 (Accessibility)

```tsx
// ✅ 모든 터치 가능 요소에 accessibilityLabel 부여
<Pressable
  accessibilityLabel="일정 삭제"
  accessibilityRole="button"
  accessibilityHint="이 일정을 영구적으로 삭제합니다"
  onPress={handleDelete}
>
  <Icon name="trash" />
</Pressable>

// ✅ 아이콘만 있는 버튼은 반드시 label 제공
<Pressable accessibilityLabel="메뉴 열기" accessibilityRole="button">
  <HamburgerIcon />
</Pressable>

// ✅ 로딩 상태 알림
<ActivityIndicator
  accessibilityLabel="일정을 불러오는 중"
  accessibilityLiveRegion="polite"
/>

// ✅ 동적 텍스트 변경 알림
<Text
  accessibilityLiveRegion="polite"   // 변경 시 스크린리더 알림
  accessibilityRole="text"
>
  {statusMessage}
</Text>
```

### accessibilityRole 규칙
| 컴포넌트 | role |
|---------|------|
| 버튼, Pressable | `button` |
| 링크 | `link` |
| 텍스트 입력 | `none` (TextInput 자동 처리) |
| 체크박스 | `checkbox` |
| 탭 | `tab` |
| 헤더 | `header` |
| 이미지 | `image` (장식용은 `none`) |

### 최소 터치 영역
```tsx
// iOS HIG 기준: 44×44pt 이상
const styles = StyleSheet.create({
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

## 2. 성능 최적화 규칙

### 리렌더 최소화
```tsx
// ✅ 무거운 리스트는 항상 FlashList (Shopify) 사용
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={schedules}
  renderItem={({ item }) => <ScheduleCard schedule={item} />}
  estimatedItemSize={80}          // 필수 설정
  keyExtractor={(item) => item.id}
/>

// ✅ React.memo - props가 자주 바뀌지 않는 순수 컴포넌트
export const ScheduleCard = React.memo(function ScheduleCard({ schedule, onPress }: Props) {
  ...
}, (prev, next) => prev.schedule.id === next.schedule.id && prev.schedule.updatedAt === next.schedule.updatedAt);

// ✅ useCallback - 리스트 renderItem 내부 핸들러
const renderItem = useCallback(({ item }: { item: Schedule }) => (
  <ScheduleCard schedule={item} onPress={handlePress} />
), [handlePress]);

// ❌ 리스트 renderItem 내부 인라인 함수
<FlashList renderItem={({ item }) => <ScheduleCard schedule={item} />} /> // 매 렌더마다 새 함수 생성
```

### 이미지 최적화
```tsx
// ✅ expo-image 사용 (React Native Image 대신)
import { Image } from 'expo-image';

<Image
  source={uri}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"    // 캐시 정책 명시
  placeholder={blurhash}       // 로딩 중 placeholder
/>
```

### 무거운 연산
```ts
// ✅ useMemo로 메모이제이션
const sortedSchedules = useMemo(() =>
  [...schedules].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
  [schedules],
);

// ✅ 정말 무거운 연산은 별도 스레드 (react-native-quick-crypto, expo-task-manager)
// UI 스레드 블로킹 금지
```

### InteractionManager
```ts
// ✅ 화면 전환 애니메이션 완료 후 무거운 작업 실행
import { InteractionManager } from 'react-native';

useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    fetchHeavyData();
  });
  return () => task.cancel();
}, []);
```

---

## 3. 애니메이션 컨벤션

### 라이브러리 우선순위
```
1. react-native-reanimated v3   → 모든 제스처/트랜지션 (JS 스레드 탈출)
2. Animated (RN 내장)           → 단순 fade, 값 보간 (불가피한 경우만)
3. Lottie                       → 복잡한 일러스트 애니메이션
```

### Reanimated 패턴
```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

// ✅ shared value는 컴포넌트 바깥 or useMemo로 관리
function ScheduleCard() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // ✅ 마운트 시 fade-in
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 250 });
  }, []);

  // ✅ 제스처 피드백
  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        ...
      </Pressable>
    </Animated.View>
  );
}
```

### 애니메이션 상수
```ts
// constants/animation.ts
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  spring: {
    default: { damping: 15, stiffness: 150 },
    bouncy: { damping: 10, stiffness: 200 },
    gentle: { damping: 20, stiffness: 100 },
  },
} as const;
```

### 규칙
- `useNativeDriver: true` 는 Reanimated에서 자동 적용, RN Animated 사용 시 명시 필수
- 애니메이션 중 상태 변경은 `runOnJS()` 래핑 필수
- `reduce-motion` 접근성 설정 존중

```ts
import { useReducedMotion } from 'react-native-reanimated';

function useAnimation() {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : ANIMATION.duration.normal;
  ...
}
```

---

## 4. 플랫폼 분기 처리

```tsx
import { Platform } from 'react-native';

// ✅ StyleSheet 내 플랫폼 분기
const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

// ✅ 컴포넌트 분기 - 파일 수준
// ScheduleHeader.ios.tsx
// ScheduleHeader.android.tsx
// → RN이 자동으로 플랫폼별 파일 선택

// ✅ 단순 값 분기
const hitSlop = Platform.OS === 'ios' ? 8 : 12;

// ❌ JSX 내부 대규모 분기 금지 (가독성 저하)
return (
  <View>
    {Platform.OS === 'ios' ? (
      <LargeIOSComponent ... />
    ) : (
      <LargeAndroidComponent ... />
    )}
  </View>
);
// → 파일 분리 또는 플랫폼별 컴포넌트 분리로 해결
```

### Safe Area
```tsx
// ✅ 항상 SafeAreaView / useSafeAreaInsets 사용
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      ...
    </View>
  );
}
```

---

## 5. Native 브릿지 / Widget 코드

### Swift (WidgetKit) ↔ RN 데이터 공유
```ts
// services/storage/mmkv.ts

import { MMKV } from 'react-native-mmkv';

// App Group ID는 constants에서 관리
const APP_GROUP_ID = 'group.com.yourapp.scheduler';

export const sharedStorage = new MMKV({
  id: 'widget-shared',
  path: `${APP_GROUP_ID}`,   // iOS App Group 경로
});

// Widget에 노출할 데이터 구조 (Swift와 동일하게 유지)
interface WidgetData {
  todaySchedules: WidgetSchedule[];
  updatedAt: string;          // ISO string
}

interface WidgetSchedule {
  id: string;
  title: string;
  startAt: string;            // "HH:mm" 포맷 (Widget 표시용)
  color: string;              // hex
}

// 위젯 데이터 업데이트 (스케줄 변경 시마다 호출)
export function syncWidgetData(schedules: Schedule[]): void {
  const widgetData: WidgetData = {
    todaySchedules: schedules.slice(0, 5).map(toWidgetSchedule),
    updatedAt: new Date().toISOString(),
  };
  sharedStorage.set('widgetData', JSON.stringify(widgetData));
}
```

### 네이티브 모듈 규칙
```ts
// ✅ 네이티브 모듈 래핑: 항상 서비스 레이어로 추상화
// services/native/haptics.ts

import * as Haptics from 'expo-haptics';

export const hapticFeedback = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

// 컴포넌트에서 직접 Haptics 임포트 금지
// ✅ import { hapticFeedback } from '@/services/native/haptics';
// ❌ import * as Haptics from 'expo-haptics';
```

---

## 6. 폼 & 유효성 검사

### React Hook Form + Zod 패턴
```ts
// types/schedule.schema.ts - Zod 스키마가 타입의 단일 출처

import { z } from 'zod';

export const createScheduleSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이내로 입력해주세요'),
  startAt: z.date({ required_error: '시작 시간을 선택해주세요' }),
  endAt: z.date({ required_error: '종료 시간을 선택해주세요' }),
  memo: z.string().max(500).optional(),
}).refine(
  (data) => data.endAt > data.startAt,
  { message: '종료 시간은 시작 시간 이후여야 합니다', path: ['endAt'] },
);

// 타입은 Zod에서 추론 (interface 별도 정의 금지)
export type CreateScheduleFormData = z.infer<typeof createScheduleSchema>;
```

```tsx
// components/schedule/CreateScheduleForm.tsx

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createScheduleSchema, type CreateScheduleFormData } from '@/types/schedule.schema';

export function CreateScheduleForm({ onSubmit }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateScheduleFormData>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      title: '',
      memo: '',
    },
  });

  return (
    <View>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="일정 제목"
            accessibilityLabel="일정 제목 입력"
          />
        )}
      />
      {errors.title && (
        <Text style={styles.error}>{errors.title.message}</Text>
      )}

      <Button
        title="저장"
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting}
      />
    </View>
  );
}
```

---

## 7. 로컬 스토리지 계층

```
데이터 종류                    저장소
────────────────────────────────────────────
인증 토큰                    → MMKV (암호화)
사용자 설정/환경설정           → MMKV
위젯 공유 데이터              → MMKV (App Group)
오프라인 캐시 (대용량)         → WatermelonDB or SQLite
임시 상태 (세션)              → Zustand (메모리)
이미지/파일 캐시              → expo-file-system
```

```ts
// services/storage/index.ts - 스토리지 추상화

export const storage = {
  // 일반 키-값
  get: <T>(key: string): T | null => {
    const value = mmkv.getString(key);
    return value ? JSON.parse(value) : null;
  },
  set: <T>(key: string, value: T): void => {
    mmkv.set(key, JSON.stringify(value));
  },
  delete: (key: string): void => mmkv.delete(key),

  // 암호화 필요한 민감 정보
  secure: {
    getToken: (): string | null => secureStorage.getString('auth_token') ?? null,
    setToken: (token: string): void => secureStorage.set('auth_token', token),
    clearToken: (): void => secureStorage.delete('auth_token'),
  },
};
```

### 스토리지 키 관리
```ts
// constants/storageKeys.ts
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_SETTINGS: 'user_settings',
  SELECTED_DATE: 'selected_date',
  ONBOARDING_DONE: 'onboarding_done',
  WIDGET_DATA: 'widget_data',
} as const;

// ❌ 문자열 리터럴 직접 사용 금지
mmkv.set('auth_token', token);   // ❌
mmkv.set(STORAGE_KEYS.AUTH_TOKEN, token);  // ✅
```

---

## 8. 환경 변수 & 시크릿 관리

```bash
# 파일 구조
.env                    # 공통 기본값 (커밋 O, 비밀 없음)
.env.local              # 로컬 개발 (커밋 X, .gitignore)
.env.development        # dev 환경
.env.staging            # staging 환경
.env.production         # production (커밋 X)
.env.example            # 템플릿 (커밋 O, 값 없음)
```

```bash
# .env.example (팀원 온보딩 가이드)
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_APP_ENV=development

# 서버에서만 사용 (클라이언트 노출 금지)
# EAS Secret에 등록: APP_STORE_CONNECT_API_KEY
```

```ts
// constants/config.ts - 환경변수 검증
const requiredEnvVars = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_APP_ENV',
] as const;

// 앱 시작 시 필수 환경변수 검증
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
});

export const Config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL!,
  env: process.env.EXPO_PUBLIC_APP_ENV as 'development' | 'staging' | 'production',
  isDev: process.env.EXPO_PUBLIC_APP_ENV === 'development',
  isProd: process.env.EXPO_PUBLIC_APP_ENV === 'production',
} as const;
```

---

## 9. 로깅 & 모니터링

### 로그 레벨 규칙
```ts
// services/logger.ts

import * as Sentry from '@sentry/react-native';
import { Config } from '@/constants/config';

export const logger = {
  // 개발 중 디버그 정보 (production 비활성)
  debug: (message: string, data?: unknown) => {
    if (Config.isDev) console.log(`[DEBUG] ${message}`, data);
  },

  // 일반 정보 로그
  info: (message: string, data?: unknown) => {
    if (Config.isDev) console.info(`[INFO] ${message}`, data);
    Sentry.addBreadcrumb({ message, data: data as Record<string, unknown>, level: 'info' });
  },

  // 경고 (비정상이지만 앱 동작은 가능)
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data);
    Sentry.addBreadcrumb({ message, level: 'warning' });
  },

  // 에러 (Sentry 전송)
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
    Sentry.captureException(error, { extra: { message } });
  },
};

// ❌ console.log 직접 사용 금지 (ESLint no-console 규칙)
// ✅ logger.debug / logger.info / logger.warn / logger.error
```

### Sentry 컨벤션
```ts
// 사용자 컨텍스트 설정 (로그인 시)
Sentry.setUser({ id: user.id, email: user.email });

// 커스텀 태그 (필터링용)
Sentry.setTag('app_env', Config.env);
Sentry.setTag('feature', 'ai_recommendation');

// 트랜잭션 추적 (성능 모니터링)
const transaction = Sentry.startTransaction({ name: 'fetch_ai_schedule' });
// ... 작업
transaction.finish();
```

---

## 10. 보안 컨벤션

```ts
// ✅ 토큰 저장: expo-secure-store (Keychain/Keystore)
import * as SecureStore from 'expo-secure-store';

// ❌ AsyncStorage에 토큰 저장 절대 금지 (평문 저장됨)
await AsyncStorage.setItem('token', accessToken);  // ❌

// ✅
await SecureStore.setItemAsync('auth_token', accessToken);  // ✅

// ✅ API 키 클라이언트 번들 포함 금지
// EXPO_PUBLIC_ 접두사 없이 → 서버사이드에서만 사용

// ✅ 민감 데이터 로그 출력 금지
logger.info('로그인 성공', { userId: user.id });  // ✅
logger.info('로그인 성공', { token: accessToken });  // ❌

// ✅ 딥링크 파라미터 검증 (신뢰하지 않는 입력)
const { token } = useLocalSearchParams();
if (!isValidToken(token)) {
  router.replace('/login');
  return;
}

// ✅ 화면 캡처 방지 (결제, 민감 정보 화면)
import { preventScreenCapture, allowScreenCapture } from 'expo-screen-capture';
useEffect(() => {
  preventScreenCapture();
  return () => allowScreenCapture();
}, []);
```

### Certificate Pinning (프로덕션)
```ts
// 백엔드팀과 협의하여 구현
// react-native-ssl-pinning 또는 커스텀 네이티브 모듈
```

---

## 11. 국제화(i18n) & 다국어

```ts
// 초기 앱이 한국어 전용이더라도 i18n 구조는 처음부터 적용

// locales/ko.ts
export const ko = {
  schedule: {
    title: '오늘의 일정',
    empty: '등록된 일정이 없어요',
    createButton: '일정 추가',
    deleteConfirm: '이 일정을 삭제할까요?',
  },
  common: {
    confirm: '확인',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    loading: '불러오는 중...',
    error: '오류가 발생했습니다',
  },
} as const;

// ❌ 컴포넌트에 하드코딩 금지
<Text>오늘의 일정</Text>  // ❌

// ✅
<Text>{t('schedule.title')}</Text>  // ✅
```

```ts
// hooks/useTranslation.ts (i18next or 직접 구현)
import { useTranslation } from 'react-i18next';

export function useT() {
  const { t } = useTranslation();
  return t;
}
```

---

## 12. 날짜 & 시간 처리

### 라이브러리 선택
```
date-fns (권장)    → 경량, 트리쉐이킹, TypeScript 완전 지원
dayjs              → 작은 번들, Moment 대체
luxon              → 타임존 복잡한 경우

❌ moment.js → 번들 크기 크고 레거시
```

### 규칙
```ts
// utils/date.utils.ts

import { format, parseISO, isToday, isTomorrow, startOfDay, endOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';

// ✅ 서버 ↔ 앱 경계에서만 변환
// 서버: ISO string → 앱 내부: Date 객체
export function parseServerDate(isoString: string): Date {
  return parseISO(isoString);
}

// ✅ 표시용 포맷팅 함수는 utils에만 (컴포넌트에서 직접 format 금지)
export function formatScheduleTime(date: Date): string {
  return format(date, 'HH:mm', { locale: ko });
}

export function formatScheduleDate(date: Date): string {
  if (isToday(date)) return '오늘';
  if (isTomorrow(date)) return '내일';
  return format(date, 'M월 d일 (EEE)', { locale: ko });
}

// ✅ 타임존: 앱 전체에서 UTC 기준으로 처리
//           표시할 때만 로컬 타임존 변환
// ✅ 날짜 비교는 항상 Date 객체로 (문자열 비교 금지)
const isAfter = scheduleA.endAt > scheduleB.startAt;  // ❌ (문자열 비교)
const isAfter = schedule.endAt.getTime() > now.getTime();  // ✅
```

---

## 13. 이미지 & 에셋 관리

### 파일 구조
```
assets/
├── fonts/
│   ├── Pretendard-Regular.otf
│   └── Pretendard-Bold.otf
├── images/
│   ├── onboarding/
│   │   ├── step1@1x.png
│   │   ├── step1@2x.png
│   │   └── step1@3x.png
│   └── empty/
│       └── empty-schedule.png
└── icons/
    ├── tab/
    └── action/
```

### 에셋 타입 정의
```ts
// constants/images.ts - 타입 안전한 에셋 참조
export const Images = {
  onboarding: {
    step1: require('@/assets/images/onboarding/step1.png'),
    step2: require('@/assets/images/onboarding/step2.png'),
  },
  empty: {
    schedule: require('@/assets/images/empty/empty-schedule.png'),
  },
} as const;

// ❌ 컴포넌트에서 직접 require
<Image source={require('../../assets/images/empty.png')} />  // ❌

// ✅
<Image source={Images.empty.schedule} />  // ✅
```

### SVG 아이콘
```tsx
// SVG는 react-native-svg + @svgr/webpack 또는 expo 플러그인으로 컴포넌트화
// components/common/Icon/Icon.tsx

type IconName = 'calendar' | 'task' | 'ai' | 'settings' | 'plus' | 'trash';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color = colors.text.primary }: IconProps) {
  const IconComponent = iconMap[name];
  return <IconComponent width={size} height={size} fill={color} />;
}
```

---

## 14. 푸시 알림 컨벤션

```ts
// services/notifications/index.ts

import * as Notifications from 'expo-notifications';

// 알림 카테고리 (일관된 액션)
export const NOTIFICATION_CATEGORIES = {
  SCHEDULE_REMINDER: 'schedule_reminder',
  AI_SUGGESTION: 'ai_suggestion',
  TASK_DUE: 'task_due',
} as const;

// 알림 채널 (Android)
export async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('schedule', {
      name: '일정 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
    await Notifications.setNotificationChannelAsync('ai', {
      name: 'AI 추천',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

// 알림 권한 요청 → 앱 시작이 아닌 '필요한 순간'에 요청
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
```

### 알림 데이터 구조
```ts
// 알림 payload 타입 정의 (딥링크 연동)
interface ScheduleNotificationData {
  type: 'schedule_reminder';
  scheduleId: string;
  deepLink: string;   // '/schedule/123'
}

interface AINotificationData {
  type: 'ai_suggestion';
  suggestionId: string;
}

type NotificationData = ScheduleNotificationData | AINotificationData;
```

---

## 15. 딥링크 처리

```ts
// app/_layout.tsx - Expo Router가 대부분 처리
// 추가 처리가 필요한 경우

// constants/deeplinks.ts
export const DEEP_LINK_SCHEME = 'smartscheduler://';

export const DeepLinks = {
  schedule: (id: string) => `/schedule/${id}`,
  task: (id: string) => `/task/${id}`,
  aiSuggestion: (id: string) => `/ai/suggestion/${id}`,
} as const;

// 딥링크 파라미터 항상 검증
function ScheduleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // ✅ 파라미터 검증
  if (!id || !isValidUUID(id)) {
    return <ErrorScreen message="잘못된 접근입니다" />;
  }
  ...
}
```

---

## 16. 패키지 & 의존성 관리

### 패키지 추가 기준
```
1. 해당 기능을 직접 구현하는 비용 > 패키지 유지보수 비용?
2. Expo SDK에 이미 포함되어 있는가? (중복 금지)
3. RN 버전 호환성 확인
4. 마지막 커밋이 6개월 이내인가?
5. 주간 다운로드 수가 충분한가? (생태계 건강도)
6. TypeScript 타입 정의 포함인가?
```

### package.json 관리
```json
{
  "scripts": {
    "postinstall": "patch-package"   // 패치 자동 적용
  }
}
```

```
// 버전 고정 규칙
dependencies:   "^" 허용 (마이너 자동 업데이트)
                단, 네이티브 모듈은 정확한 버전 고정 (~1.2.3 또는 1.2.3)
devDependencies: "^" 허용

// 업데이트 주기
- 매주: 보안 패치 확인 (npm audit)
- 격주: 마이너 업데이트 검토
- 분기: Expo SDK 메이저 업그레이드 검토
```

### 패키지 추가 시 커밋 규칙
```bash
chore(deps): add react-native-reanimated v3.8.0

- 이유: 제스처 기반 일정 드래그 앤 드롭 구현
- 대안 검토: Animated API (JS 스레드 한계로 제외)
- 번들 영향: +45KB gzip
```

---

## 17. CI/CD 컨벤션

### GitHub Actions 브랜치별 워크플로
```yaml
# .github/workflows/

# PR/Push → develop, main: 린트 + 타입체크 + 테스트
ci.yml

# develop 머지: EAS Preview 빌드 (내부 테스트용)
preview-build.yml

# v*.*.* 태그 또는 수동 트리거: EAS Production 빌드
release.yml
```

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test --if-present
```

### EAS 빌드 프로파일
```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production"
    }
  }
}
```

### 스토어 제출 자동화 정책
```
현재 단계:
  - release.yml은 production build만 실행한다.
  - App Store / Play Store submit 자동화는 비활성화한다.

출시 직전 활성화:
  - App Store Connect API 키 연결
  - ascAppId 확인
  - eas.json submit.production 설정 추가
  - release.yml에 eas submit 단계 추가
```

### OTA 업데이트 정책
```
OTA 가능 (JS/에셋 변경):
  - 버그 수정, UI 텍스트 변경, 비즈니스 로직 변경

앱스토어 제출 필요 (네이티브 변경):
  - 새 네이티브 모듈 추가
  - app.json 권한 변경
  - Expo SDK 업그레이드
  - iOS 설정 변경

OTA 배포 채널:
  develop → preview 채널
  main    → production 채널
```

---

## 18. 코드 리뷰 프로세스

### PR 템플릿
```markdown
<!-- .github/pull_request_template.md -->

## 변경 내용
<!-- 무엇을 왜 변경했는지 -->

## 스크린샷 / 영상
<!-- UI 변경이 있다면 Before/After -->

## 체크리스트
- [ ] 타입 에러 없음 (`npm run type-check`)
- [ ] 린트 통과 (`npm run lint`)
- [ ] 테스트 통과 / 추가함
- [ ] 접근성 속성 추가함
- [ ] 에러 처리 고려함
- [ ] 성능 영향 고려함 (리렌더, 메모이제이션)
- [ ] 스토리지 키 상수 사용함

## 리뷰어에게
<!-- 집중해서 봐야 할 부분, 의사결정 배경 -->
```

### 리뷰 기준
```
Blocker (머지 불가):
  - 타입 안전성 위반 (any, as 남용)
  - 보안 취약점 (토큰 노출, 검증 누락)
  - 크래시 가능성이 있는 코드
  - 컨벤션 위반 (ESLint가 잡지 못한 것)

Warning (논의 필요):
  - 성능 이슈 가능성
  - 테스트 누락
  - 복잡도 높은 로직에 주석 없음

Suggestion (선택):
  - 코드 개선 제안
  - 더 나은 패턴 제안
```

### 리뷰 코멘트 접두사
```
[Blocker] 반드시 수정해야 합니다
[Warning] 논의가 필요합니다
[Suggestion] 이런 방법도 있어요
[Question] 이 코드의 의도가 궁금합니다
[Praise] 이 부분 좋네요!
```

---

## 19. 문서화 컨벤션

### README.md 필수 섹션
```markdown
# 앱 이름

## 개발 환경 설정
## 환경변수 설정
## 실행 방법
## 빌드 방법
## 폴더 구조
## 주요 기술 스택
## 배포 프로세스
## 트러블슈팅
```

### 컴포넌트 문서화 (JSDoc)
```tsx
/**
 * 하루 일정 목록을 표시하는 카드 컴포넌트
 *
 * @example
 * <ScheduleCard
 *   schedule={schedule}
 *   onPress={(id) => router.push(`/schedule/${id}`)}
 * />
 */
export function ScheduleCard({ schedule, onPress }: ScheduleCardProps) { ... }
```

### 아키텍처 결정 기록 (ADR)
```markdown
<!-- docs/adr/001-state-management.md -->

# ADR 001: 상태 관리 라이브러리 선택

## 상태
결정됨 (2025-01-01)

## 컨텍스트
전역 상태 관리 라이브러리 선택이 필요함

## 결정
Zustand + React Query 조합 선택

## 근거
- Redux: 보일러플레이트 과다
- Jotai: 팀 학습 곡선
- Zustand: 최소한의 API, 좋은 TypeScript 지원
- React Query: 서버 상태 캐싱 최적화

## 결과
서버 상태와 클라이언트 상태 명확히 분리됨
```

---

## 20. 폴더 내 파일 한도 & 분리 기준

```txt
기본 단위: route/screen/domain

screens/<domain>/: 화면 파일 8개 초과 시 하위 도메인 폴더 분리
components/<domain>/: 파일 8개 초과 시 하위 도메인 폴더 분리
hooks/: 파일 8개 초과 시 목적별 분리 (query/, form/, interaction/)
lib/utils/: 파일 8개 초과 시 model 성격 기준으로 분리
__tests__ 또는 *.test.ts(x): 테스트 파일 10개 초과 시 단위별 분리 (screen/, hooks/, api/)

state store 규칙:
- 스토어 1개 = 파일 1개
- 도메인 스토어는 state/<domain>/use-*-store.ts에 둔다
- 도메인 모델은 state/<domain>/model.ts에 둔다

전역 승격 기준:
- 2개 이상 화면군에서 재사용
- 특정 화면군 도메인 지식이 없음
- 위 조건을 만족할 때만 components/ui 또는 lib/* 로 이동
```

### 컴포넌트 복잡도 한도
```txt
한 컴포넌트 파일: 최대 200줄
한 함수/훅: 최대 80줄
중첩 삼항 연산자: 최대 1단계
JSX 깊이: 최대 5단계 (초과 시 컴포넌트 분리)
```
