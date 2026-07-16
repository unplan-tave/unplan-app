# Git 컨벤션

[← 컨벤션](./README.md)

## 브랜치

- 기본 통합 브랜치는 `develop`입니다.
- 구조 리팩터링은 기능 작업 브랜치와 섞지 않습니다.
- 브랜치는 작업 범위가 드러나게 짓습니다.

예:

```txt
refactor/docs-ia-conventions
refactor/state-to-domains
feature/card-list
fix/auth-refresh
```

## 커밋

Conventional Commits를 사용합니다.

```txt
docs: split convention documents
refactor: move state modules to domains
fix: guard dev route in production
```

## PR

- 한 PR은 자기 범위만 처리합니다.
- 다음 PR 범위에 해당하는 변경은 TODO나 후속 작업으로 남깁니다.
- 코드 이동 PR에서는 기능 변경을 섞지 않습니다.
- 문서 변경 PR에서는 코드 import를 수정하지 않습니다.

## 리뷰 전 체크

- 변경 범위가 PR 제목과 맞는가
- 사용자 변경사항을 되돌리지 않았는가
- 생성 파일을 직접 수정하지 않았는가
- 링크와 명령 검증 결과를 남겼는가
