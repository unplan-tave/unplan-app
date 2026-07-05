# 의존 방향

[← 문서 목록](../README.md) · [폴더 구조](./folder-structure.md)

## 기본 방향

```txt
screens/* -> components/features/*
components/features/* -> components/domain/*
components/domain/* -> components/ui/*

screens/* -> domains/*
components/features/* -> domains/*
components/domain/* -> domains/*

domains/* -> components/* 금지
```

## 레이어별 책임

| 레이어 | 위치 | 참조 가능 | 금지 |
|--------|------|-----------|------|
| Route | `src/app` | `screens` | 화면 구현, API/store 직접 접근 |
| Screen | `src/screens` | `components`, `domains`, `hooks`, `lib` | route 파일에 구현 누수 |
| Feature UI | `src/components/features` | `components/domain`, `components/ui`, `domains` | API/store 직접 접근 |
| Domain UI | `src/components/domain` | `components/ui`, `domains` | 특정 화면 플로우 의존 |
| UI primitive | `src/components/ui` | `constants`, React Native primitive | domain 지식, routing, store |
| Domain logic | `src/domains` | `lib`, `constants` | `components` 참조 |
| Infra | `src/lib` | 외부 SDK, generated API | 특정 화면/feature 의존 |

## Feature끼리 import 금지

`components/features/add-pin-card`가 `components/features/card-list`를 직접 import하지 않습니다.

공유가 필요하면 다음 중 하나로 이동합니다.

- 도메인 표현 컴포넌트라면 `components/domain/<domain>`
- 도메인 지식이 없다면 `components/ui`
- 순수 로직이라면 `domains/<domain>`

## 현재 코드와의 차이

현재 코드에는 `src/state`와 `components/features/card/*` 구조가 남아 있습니다. 이 PR에서는 문서 원칙만 정리하고, 실제 이동은 후속 PR에서 처리합니다.
