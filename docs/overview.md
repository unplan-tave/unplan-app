# Unplan 코드베이스 개요

> AI 스마트 스케줄러 앱(Unplan)의 전체 구조·구현 현황·인프라를 한 문서로 정리한 온보딩 문서입니다.
> 기준일: **2026-06-20** · 처음 합류하거나 전체 그림이 필요할 때 이 문서부터 읽으세요.

[← 문서 목록](./README.md) · [코어 컨벤션](./conventions/core.md) · [확장 컨벤션](./conventions/advanced.md) · [개발 체크리스트](./roadmap/development-checklist.md)

---

## 1. 한눈에 보기

| 항목 | 내용 |
|------|------|
| 제품 | Unplan — AI 스마트 스케줄러 (모바일) |
| 플랫폼 | iOS / Android (Expo, React Native) |
| 언어 | TypeScript (strict) |
| 프레임워크 | Expo SDK 56, React Native 0.85, React 19 |
| 라우팅 | Expo Router v56 (파일 기반, `src/app`) |
| 상태관리 | Zustand + Immer (클라이언트) · TanStack React Query (서버) |
| 네트워크 | Axios + Orval (OpenAPI → 타입/훅 자동생성) |
| 저장소 | expo-secure-store (민감정보) · react-native-mmkv (일반) |
| 인증 | 카카오 / 구글 소셜 로그인 (Apple 미구현) |
| 빌드/배포 | EAS Build + EAS Update(OTA), GitHub Actions CI/CD |
| 디자인 | Figma 기반 디자인 토큰 + primitive-first 컴포넌트 시스템 |
| 코드 규모 | `src` 기준 약 5,800 LOC (TS/TSX) |

**현재 단계:** 인증·온보딩 플로우는 동작하는 수준으로 구현됨. 메인 탭 화면(홈/일정/설정)은 아직 플레이스홀더. 백엔드 연동은 인증만 실제 연결되어 있고 나머지 도메인 API는 스캐폴딩 상태.

---

## 2. 기술 스택 상세

### 런타임 / 핵심
- **Expo SDK 56**, **React Native 0.85.3**, **React 19.2** — Expo의 CNG(Continuous Native Generation)/prebuild 워크플로우 사용. `ios/`·`android/` 디렉터리는 git에 커밋하지 않고 빌드 시 생성.
- **expo-router 56** — `src/app`을 라우트 루트로 사용(`app.config.js`의 `expo-router` 플러그인 `root: 'src/app'`). `typedRoutes` 실험 기능 활성화.
- **expo-updates** — OTA 업데이트(채널 기반).

### 상태 / 데이터
- **zustand 5 + immer 11** — 전역 클라이언트 상태. `create()` + `produce()` 패턴(미들웨어 없이 수동 immer).
- **@tanstack/react-query 5** — 서버 상태. `_layout.tsx`에서 `QueryClient` 전역 설정(retry 2, staleTime 5분).
- **axios 1.16** — `src/lib/api/client.ts` 단일 인스턴스. 요청 인터셉터로 Bearer 토큰 자동 주입.
- **orval 7** — OpenAPI 스펙 → React Query 훅 + 타입 자동생성(`npm run api:generate`).
- **react-hook-form 7 + zod 4 + @hookform/resolvers** — 폼/검증(설치됨, 본격 사용 전).

### UI / 기타
- **react-native-reanimated 4 + react-native-worklets + gesture-handler** — 애니메이션/제스처.
- **react-native-svg** — 아이콘/그래픽.
- **@sun-typeface/suit** — SUIT 한글 폰트(7 weight, `_layout.tsx`에서 로드).
- **date-fns 4** — 날짜 처리(한국어 로케일).
- **react-native-mmkv 4** — 빠른 KV 저장소.

---

## 3. 디렉터리 구조

```
src/
├── app/              # 라우트 + 레이아웃만 (thin layer, 화면 로직 금지)
│   ├── _layout.tsx       # 루트: 폰트 로드, SDK 초기화, Provider, Stack
│   ├── index.tsx         # 스플래시 → 세션/온보딩 판단 후 분기 진입점
│   ├── (auth)/           # 로그인
│   ├── onboarding/        # recovery → sleep → activity → transport
│   └── (tabs)/           # 홈 · 일정 · 설정
├── screens/          # 라우트가 렌더링하는 실제 화면 구현 (<domain>/*-screen.tsx)
│   ├── auth/ home/ schedule/ settings/ onboarding/
├── components/
│   ├── ui/               # 전역 base primitive
│   ├── domain/           # 여러 feature에서 재사용되는 도메인 표현
│   └── features/         # 화면명/플로우명 기준 조합 컴포넌트
├── domains/          # 도메인 타입 + store + api wrapper + 순수 로직
│   ├── auth/
│   ├── onboarding/
│   └── card/
├── lib/              # 앱 전역 인프라 / 크로스컷팅
│   ├── api/              # client, mutator, endpoints(생성), model(생성)
│   ├── auth/             # google-sdk, kakao-sdk, token-storage
│   ├── storage/          # secure-storage, mmkv-storage
│   ├── device/           # device-id
│   ├── i18n/             # 간이 t() 번역기
│   └── utils/            # date 등
├── hooks/            # 앱 전역 훅 (use-auth)
├── constants/        # config, 디자인 토큰(colors/typography/spacing/theme)
└── translations/     # ko.ts (번역 키-값)
```

**구조 원칙(AGENTS.md / core.md):** `app`은 route/layout만, 화면은 `screens`, 재사용 primitive는 `components/ui`, 도메인 표현은 `components/domain`, 화면/플로우 조합은 `components/features/<screen-or-flow>`, 도메인 로직은 `domains/<domain>`, 인프라는 `lib`. 라우트 파일은 `export { XScreen as default } from '@/screens/...'` 형태의 1줄 재노출을 우선한다.

---

## 4. 앱 부팅 & 네비게이션 흐름

1. **`app/_layout.tsx`** — SUIT 폰트 로드, `configureGoogleAuthSDK()` / `initializeKakaoAuthSDK()` 호출, `useOnboardingStore.hydrateOnboarding()` + `useAuthStore.hydrateSession()` 실행. 폰트 로드 전까지 `null` 렌더.
2. **`app/index.tsx`** — `SplashScreen` 표시 → 세션 hydration 완료 후 분기:
   - 미인증 → `/login`
   - 인증 O, 온보딩 미완료 → `/onboarding/recovery`
   - 인증 O, 온보딩 완료 → `/(tabs)`
   - `hasNavigatedRef`로 중복 네비게이션 방지.
3. **로그인**(`screens/auth/login-screen.tsx`) — 카카오/구글 로그인 핸들러. 성공 시 온보딩 완료 여부에 따라 `/(tabs)` 또는 `/onboarding/recovery`로 이동. Apple 로그인은 비활성(`handleUnavailableLogin`).
4. **온보딩** — `recovery → sleep → activity → transport` 순서. 각 단계는 `push`, 마지막 transport에서 `completeOnboarding()` 호출 후 `/(tabs)`로 `replace`.

---

## 5. 도메인별 구현 현황

### 5.1 인증 (auth) — ✅ 동작
- **`lib/auth/kakao-sdk.ts` / `google-sdk.ts`** — SDK 지연 초기화 + 설정 누락 시 graceful 경고/전용 에러 클래스(`KakaoSDKConfigError`, `GoogleSDKConfigError`).
- **`domains/auth/social-login.ts`** — `loginWithKakao()` / `loginWithGoogle()`. 카카오톡 미설치 시 카카오계정 로그인 폴백, 취소/네트워크/SDK/설정/알수없음으로 에러 정규화(`SocialLoginError`).
- **`domains/auth/api.ts`** — `submitSocialLogin()`이 `/auth/{provider}`로 토큰 전송, 응답 래퍼 unwrap.
- **`domains/auth/use-auth-store.ts`** — `setSession` / `hydrateSession` / `logout`. 토큰은 SecureStore에 저장.
- **`hooks/use-auth.ts`** — store 셀렉터 묶음.
- **`lib/device/device-id.ts`** — UUID 디바이스 ID 생성·영속(SecureStore), 폴백 포함.

### 5.2 온보딩 (onboarding) — ✅ API 연동
- **`domains/onboarding/use-onboarding-store.ts`** — 회복 수단, 목표 수면시간, 집중/졸림/수면 시간대, 이동수단 선택과 제출 상태 관리. 서버 저장 성공 후 완료 플래그를 MMKV에 저장.
- **`domains/onboarding/api.ts`** — 프론트 모델을 생성 DTO로 변환하고 최초 온보딩 단일 저장 API를 호출.
- **`domains/onboarding/sleep-condition.ts`** — 수면 분(minute)을 risk/lack/good/excess로 분류(Figma 스펙 반영).

### 5.3 메인 탭 (home / schedule / settings) — 🟡 진행 중
- 홈·일정은 플레이스홀더이며, 설정에는 로그아웃과 개발용 온보딩 초기화 기능이 연결됨.

---

## 6. API 레이어

- **클라이언트**: `lib/api/client.ts` — `Config.apiUrl` 기반 axios. 요청 인터셉터가 SecureStore의 access token을 Bearer로 주입. 응답 인터셉터에 **401 refresh-token 재시도 TODO**(미구현).
- **Orval 자동생성**: `orval.config.ts`가 `OPENAPI_SPEC_URL`에서 스펙을 받아 `src/lib/api/endpoints`(태그별 React Query 훅)와 `src/lib/api/model`(타입)을 생성. 커스텀 mutator(`orval-mutator.ts`)로 공용 axios 인스턴스 재사용. 두 디렉터리는 ESLint ignore 대상.
- 생성된 태그: `auth-controller`, `daily-memo`, `onboarding`, `setting-onboarding`, `schedule-crud`, `test-controller`.
- 온보딩은 `domains/onboarding/api.ts`, 인증은 `domains/auth/api.ts`의 수기 래퍼를 통해 생성 함수를 사용함.

---

## 7. 디자인 시스템

- **토큰**: `constants/colors.ts`, `typography.ts`, `spacing.ts`, `theme.ts`. `constants/index.ts`와 `theme.ts`에서 재노출(`colors`, `typography`, `spacing`, `radius`, 타입). 화면/컴포넌트는 토큰만 참조 → 디자인 변경 시 값만 교체.
- **폰트**: SUIT(7 weight). `fontFamilyWeight` 맵으로 weight별 패밀리 관리.
- **컴포넌트(`components/ui`)**: Typography, Button, Input/TextField, Card, Chip/ChipGroup, Tag, Header(다수 변형), Footer, GNB, BottomCTA, BottomSheet(여러 종류), Modal(여러 종류), Calendar, ProgressBar/Segment, TimeStepper, ConditionCard, RecommendCard, ScreenLayout, StatusBar, ViewModeButton, AppIcon, Icon, BrandLogo 등 30+개.
- **규칙(primitive-first)**: 새 UI는 기존 primitive를 먼저 기반으로 구현. primitive가 부족하면 도메인 컴포넌트에서 중복 구현하지 말고 primitive를 확장. `components/ui`만 배럴 export(`index.ts`) 허용.
- ⚠️ **현재 다수 primitive가 화면에서 미사용**(Figma 기반 선구현). §9 참고.

---

## 8. 인프라 / 빌드 / 배포

### 환경변수 (`.env.local`, `.env.example`)
| 키 | 용도 |
|----|------|
| `EXPO_PUBLIC_API_URL` | API 베이스 URL |
| `OPENAPI_SPEC_URL` | Orval 입력(Swagger JSON) |
| `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY` | 카카오 Native App Key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` / `_IOS_CLIENT_ID` / `_IOS_URL_SCHEME` | 구글 OAuth |
| `EXPO_PUBLIC_APP_ENV` | development / staging / production |

> Admin Key·Client Secret 등 비밀값은 앱 번들에 절대 포함하지 않음(.env.example에 명시).

### 네이티브 설정
- **`app.config.js`** — 앱명 `Unplan`, slug `unplan`, bundle/package `com.unplan.app`, scheme `unplan`. Expo plugins: 카카오 maven 레포(커스텀 플러그인), 구글 modular headers(커스텀 플러그인), expo-router, secure-store, kakao core, google-signin. `runtimeVersion.policy: appVersion`, EAS projectId 포함.
- **커스텀 플러그인(`plugins/`)** — `with-kakao-maven-repository.js`, `with-google-modular-headers.js`(iOS Pod 설정).

### EAS (`eas.json`)
- 프로필: `development`, `development-simulator`, `preview`(internal, preview 채널), `production`(autoIncrement, production 채널). `appVersionSource: remote`.

### CI/CD (`.github/workflows`)
- **`ci.yml`** — PR/푸시(develop·main)에서 `quality` 잡(type-check, lint, test --if-present). develop 푸시 시 변경 경로를 감지(`detect-preview-changes`)하여:
  - 네이티브 변경 없음 → **OTA 업데이트**(`eas update --channel preview`)
  - 네이티브 변경 있음(또는 수동 강제) → **Android preview 빌드 + iOS 시뮬레이터 빌드**
- **`release.yml`** — `v*.*.*` 태그 푸시 시 `eas build --profile production --platform all`.

### 코드 품질 게이트
- ESLint(flat config) + Prettier + Husky(pre-commit) + lint-staged. 커밋 시 `eslint --fix --max-warnings 0` + `prettier --write`.
- 스크립트: `type-check`, `lint`, `lint:fix`, `format`, `api:generate`.

---

## 9. 코드 리뷰 요약 (확장성 · 유지보수 · 불필요 코드)

### 잘 되어 있는 점
- 책임이 명확히 분리된 feature 중심 구조(app=라우트 / screens / components / state / lib)와 thin route layer.
- 인증 인프라가 견고: SecureStore(민감)·MMKV(일반) 분리, SDK 지연초기화 가드, 소셜 로그인 에러 정규화, 디바이스 ID 영속.
- 타입 안전성(strict TS, 경로 alias) + 자동화(Orval, ESLint/Prettier/Husky) + 정교한 CI(OTA/네이티브 빌드 분기).
- 디자인 토큰 + primitive-first 컨벤션으로 디자인 변경에 강함.

### 정리하면 좋은 점 (불필요 / 중복)
1. **미사용 UI primitive 다수** — `Input`, `Modal`, `BottomSheet`, `Calendar`, `GNB`, `ConditionCard`, `RecommendCard`, `ProgressBar`, `ProgressSegment`, `StatusBar`, `TimeStepper`, `ViewModeButton`, `ChipGroup`, `AppIcon`, `Tag` 등이 화면에서 전혀 사용되지 않음. 디자인 선반영 의도라면 OK지만, 화면 구현이 임박하지 않았다면 드리프트/유지보수 부담. 살릴 것·뺄 것을 트래킹 권장.
2. **Orval 생성 훅 활용 범위 제한** — 인증·온보딩은 수기 래퍼에서 생성 함수를 사용하지만, 나머지 도메인은 아직 화면과 연결되지 않음.
3. **타입 중복/데드코드** — `domains/auth/model.ts`의 `Schedule`, `ApiError` 인터페이스가 미사용. `ApiResponse`는 생성 모델과 개념 중복.
4. **미구현 TODO** — axios 401 refresh 재시도. 백엔드 계약 확정 시 처리 필요.
5. **테스트 부재** — CI는 `npm test --if-present`를 돌리지만 테스트 프레임워크/스크립트가 전혀 없음(devDeps에도 없음). 검증 공백.
6. **네이밍 잔재** — `package.json`의 `name: scheduler-app`, MMKV id `scheduler-app-storage`가 리브랜딩된 `Unplan`과 불일치.
7. **빈 디렉터리 마커** — `src/lib/hooks/.gitkeep`(빈 폴더), `src/lib/i18n/.gitkeep`·`src/lib/auth/.gitkeep`(이미 파일 있어 불필요).
8. **i18n 한계** — 단일 로케일 + 보간/복수형 없는 간이 `t()`. 현 단계엔 충분하나 확장 시 한계.

> 위 항목은 동작을 막는 버그가 아니라 정리/결정이 필요한 부채입니다. 우선순위: API 소스 일원화(2) → 데드코드 제거(3,6,7) → 테스트 도입(5) → 미사용 컴포넌트 정책(1).

---

## 10. 다음 단계 제안

- 백엔드 API 계약 확정 후: 나머지 도메인의 Orval 연동과 401 refresh 구현.
- 홈/일정/설정 화면을 선구현된 primitive로 실제 구현.
- 테스트 환경(예: Jest + RNTL) 도입 및 CI에 연결.
- 데드코드/네이밍 정리 + 미사용 컴포넌트 정책 결정.

---

*문서 자동 점검: 본 문서는 2026-06-20 기준 코드 스냅샷을 반영합니다. 구조·구현이 바뀌면 함께 갱신하세요.*
