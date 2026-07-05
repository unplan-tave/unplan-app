# API 컨벤션

[← 컨벤션](./README.md) · [API boundary](../architecture/api-boundary.md)

## 생성 타입

- OpenAPI/Swagger 스펙을 서버 타입의 단일 진실 원천으로 둡니다.
- Orval 생성물은 `src/lib/api` 아래에 둡니다.
- 생성된 파일은 직접 수정하지 않습니다.

## 도메인 API wrapper

도메인 API wrapper는 다음을 담당합니다.

- generated API 호출
- response unwrap
- DTO -> ViewModel 변환
- domain error 정규화

화면은 generated API를 직접 호출하지 않고 domain API wrapper 또는 React Query hook 경계를 사용합니다.

도메인이 커지면 API boundary를 아래처럼 나눕니다.

```txt
src/domains/<domain>/api/
├── client.ts
├── mapper.ts
├── query-keys.ts
├── queries.ts
└── mutations.ts
```

- `queries.ts`: TanStack Query `use*Query`
- `mutations.ts`: TanStack Query `use*Mutation`
- `query-keys.ts`: query key factory
- `client.ts`: Orval generated API wrapper
- `mapper.ts`: DTO <-> ViewModel 변환

## 에러 처리

- 외부 입력 에러는 `unknown`으로 받고 타입 가드로 좁힙니다.
- 사용자에게 보여줄 메시지와 디버깅용 원본 에러를 분리합니다.
- 인증 만료, 네트워크 실패, validation 실패처럼 사용자 행동이 달라지는 에러는 구분 가능한 타입으로 정규화합니다.

## 환경변수

- public runtime 값은 `EXPO_PUBLIC_` 접두사를 사용합니다.
- secret은 앱 번들에 넣지 않습니다.
- 환경변수 접근은 가능한 한 `constants/config.ts` 같은 단일 경계로 모읍니다.
