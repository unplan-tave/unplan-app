# 테스트 컨벤션

[← 컨벤션](./README.md)

## 우선순위

테스트는 위험도와 안정성에 맞춰 추가합니다.

1. 도메인 순수 로직
2. DTO -> ViewModel mapper
3. validation
4. store action
5. 사용자 흐름 통합 테스트

## 순수 로직

날짜 비교, 라벨 매핑, 검색/정렬, 추천 규칙 같은 순수 함수는 `domains/<domain>`에 두고 테스트합니다.

기능 작업이 계속 흔들리는 동안 모든 PR에 테스트를 강제하지 않습니다. 기능이 안정된 뒤 도메인 단위로 모아서 추가합니다.

## 테스트 파일

```txt
domains/schedule/search.ts
domains/schedule/search.test.ts
```

- 대상 파일과 같은 폴더에 둡니다.
- 테스트 이름은 사용자 관찰 결과나 business rule 기준으로 작성합니다.
- implementation detail에 과하게 결합하지 않습니다.

## 검증 명령

가능한 경우 PR 설명에 실행한 명령을 남깁니다.

```bash
npm run lint
npm run type-check
```

문서만 변경한 PR은 링크/검색 검증으로 충분할 수 있습니다.
