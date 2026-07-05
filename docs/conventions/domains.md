# Domains 컨벤션

[← 컨벤션](./README.md) · [API boundary](../architecture/api-boundary.md)

## 이름

도메인 로직의 최상위 폴더명은 `domains`를 사용합니다.

- `state`는 store만 담기에는 적절하지만, 현재 역할보다 좁습니다.
- `model`은 store/api/validation까지 담기에는 좁으므로 최상위 폴더명으로 쓰지 않습니다.

도메인 로직은 `src/domains` 아래에 둡니다.

## 기본 파일

| 파일 | 역할 |
|------|------|
| `model.ts` | 프론트 도메인 타입, ViewModel, enum/union 타입 |
| `api.ts` | Orval 생성 API wrapper, DTO -> ViewModel 변환 |
| `use-*-store.ts` | Zustand store |
| `validation.ts` | 도메인 검증 로직 |
| `routes.ts` | 해당 도메인의 route 상수 |
| `*.ts` | 날짜 계산, 라벨 매핑, 검색, 정렬 등 순수 로직 |

## 참조 규칙

- `domains`는 어디서든 참조할 수 있습니다.
- `domains`는 `components`를 참조하면 안 됩니다.
- 도메인 순수 로직은 React component나 hook에 의존하지 않습니다.
- 서버 DTO는 domain boundary에서 ViewModel로 변환합니다.

## 예시

```txt
src/domains/card/
├── model.ts
├── api.ts
├── use-card-store.ts
├── validation.ts
├── routes.ts
├── search.ts
└── recurrence.ts
```
