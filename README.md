# Unplan 앱 · 로컬 챗봇 데모

기존 앱 화면에 데모 전용 로그인과 AI 일정 채팅을 연결한 로컬 작업 브랜치입니다.

- 브랜치: `feature/local-chatbot-demo` (`origin/develop` 기준)
- [실행 방법·분리 정책·검증 결과](docs/chatbot-demo.md)
- [기존 앱 개발 문서](docs/README.md)

```sh
npm ci --ignore-scripts
npm run demo:web
```

먼저 별도의 Spring 서버 저장소에서 `demo` 프로필을 실행해야 합니다. 브라우저 주소는 `http://localhost:18081`입니다. 실제 자연어 처리에는 **서버의** `DEMO_GEMINI_API_KEY`가 필요하며, 앱에 키를 넣지 않습니다.
