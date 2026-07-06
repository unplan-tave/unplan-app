# API 컨벤션

[← 컨벤션](./README.md) · [API boundary](../architecture/api-boundary.md)

## 생성 타입

- OpenAPI/Swagger 스펙을 서버 타입의 단일 진실 원천으로 둡니다.
- Orval 생성물은 `src/lib/api` 아래에 둡니다.
- 생성된 파일은 직접 수정하지 않습니다.
- generated endpoint/model 파일은 `src/domains/<domain>/api/*` 밖에서 직접 참조하지 않습니다.
- `src/screens`, `src/components`, `src/hooks`는 `@/lib/api/endpoints`, `@/lib/api/model`을 직접 import하지 않습니다.

## 도메인 API wrapper

도메인 API wrapper는 다음을 담당합니다.

- generated API 호출
- response unwrap
- DTO -> ViewModel 변환
- domain error 정규화

화면은 generated API를 직접 호출하지 않고 domain API wrapper 또는 React Query hook 경계를 사용합니다.
Orval 생성 결과의 endpoint/model 구조가 바뀌더라도 영향은 `domains/<domain>/api`에서 흡수하고, screen/components/hooks 호출부는 domain model/ViewModel을 유지합니다.

API가 있는 도메인은 API boundary를 아래처럼 나눕니다. 단, 실제 책임이 있는 파일만 만듭니다.

```txt
src/domains/<domain>/api/
├── client.ts
├── mapper.ts
├── query-keys.ts
├── queries.ts
└── mutations.ts
```

- `client.ts`: Orval generated endpoint를 감싸는 domain API wrapper
- `mapper.ts`: DTO ↔ domain model/ViewModel 변환
- `query-keys.ts`: query key factory. query가 있을 때만 생성
- `queries.ts`: TanStack Query `use*Query`. query가 있을 때만 생성
- `mutations.ts`: TanStack Query `use*Mutation`. mutation hook이 필요할 때만 생성

API가 아직 없는 도메인에는 빈 `api/` 폴더를 만들지 않습니다. DTO 변환이 없거나 trivial하면 `mapper.ts`를 만들지 않을 수 있지만, screen/components에 generated DTO를 직접 노출하지 않는 boundary는 유지합니다.

`src/lib/api/client.ts`는 전역 API client이며, Orval generated endpoint/model은 `src/lib/api/endpoints`, `src/lib/api/model`에 유지합니다. `src/lib/auth`는 Kakao/Google SDK wrapper, token storage 같은 인프라이고 auth 도메인 정책은 `src/domains/auth`에 둡니다.

## 에러 처리

- 외부 입력 에러는 `unknown`으로 받고 타입 가드로 좁힙니다.
- 사용자에게 보여줄 메시지와 디버깅용 원본 에러를 분리합니다.
- 인증 만료, 네트워크 실패, validation 실패처럼 사용자 행동이 달라지는 에러는 구분 가능한 타입으로 정규화합니다.

## 환경변수

- public runtime 값은 `EXPO_PUBLIC_` 접두사를 사용합니다.
- secret은 앱 번들에 넣지 않습니다.
- 환경변수 접근은 가능한 한 `constants/config.ts` 같은 단일 경계로 모읍니다.
