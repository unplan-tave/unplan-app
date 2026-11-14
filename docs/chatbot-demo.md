# 기존 Unplan 앱의 로컬 챗봇 데모

`unplan-app`의 `origin/develop` 커밋 `662be69`를 별도 작업 사본에 클론한 뒤 `feature/local-chatbot-demo` 브랜치에서 구현했다. 서버 작업과 앱 작업은 각각의 Git 저장소에 있다. 현재 폴더 배치는 다음과 같다.

```text
unplan-server/                 # 서버: feature/local-chatbot-demo
  unplan-app-demo/             # 앱: feature/local-chatbot-demo, 별도 .git
```

서버와 앱은 각각 원격 저장소의 `feature/local-chatbot-demo` 브랜치로 공유한다. PR 병합, EAS build/update/submit/deploy, TestFlight 제출은 별도다.

## 다른 PC에서 받기

새 작업 폴더에서 아래 명령으로 서버와 앱을 함께 받는다. 두 저장소 접근 권한이 있는 GitHub 계정이 필요하다.

```powershell
git clone --branch feature/local-chatbot-demo https://github.com/unplan-tave/unplan-server.git
cd unplan-server
git clone --branch feature/local-chatbot-demo https://github.com/unplan-tave/unplan-app.git unplan-app-demo
```

아래 Windows 실행 절차를 따른다. API 키와 DB 데이터는 Git에 포함되지 않으므로 새 PC에서 따로 준비한다. 작업 후 각 저장소에서 커밋과 `git push`를 하고, 다른 PC에서는 해당 브랜치에서 `git pull --ff-only`로 이어간다.

## 기존 배포 앱과의 분리

| 항목 | 기존 앱 | 데모 |
| --- | --- | --- |
| 앱 이름 | Unplan | Unplan Demo |
| iOS bundle ID / Android package | `com.unplan.app` | `com.unplan.app.chatbotdemo` |
| URL scheme | `unplan` | `unplan-chatbot-demo` |
| EAS 프로젝트 | 기존 설정 유지 | 기존 project ID 제거 |
| OTA 업데이트 | 기존 설정 유지 | `updates.enabled=false`, 기존 업데이트 URL 없음 |
| 로그인 | 기존 소셜 로그인 | 서버 `demo` 프로필 전용 테스트 계정 1/2 |
| 토큰 키 | 기존 이름 | `chatbot_demo_` 접두어 |
| 서버 | 기존 환경 설정 | localhost·RFC1918 사설 IP만 허용 |
| DB | 기존 환경 설정 | 로컬 `unplan_chatbot_demo` |

`APP_VARIANT=demo`와 `EXPO_PUBLIC_APP_ENV=demo`가 함께 있어야 데모 설정이 유효하다. 데모 플래그가 없으면 기존 `app.config.js`의 출력이 `origin/develop`과 동일함을 테스트했다. 데모를 기존 EAS production/preview/development 프로필로 실행하려 하면 설정 단계에서 거부한다. **데모 실행에는 `npm run demo:*` 명령만 사용한다.** 이 명령은 로컬 Expo만 실행한다.

데모 실행기는 기존 `.env` 자동 로딩을 끄고 주소를 `DEMO_API_URL`로 받는다. `https://dev-api.un-plan.com` 등 공인 서버 주소는 거부한다. 로그인 전에 `/demo/info` 응답의 `mode=unplan-local-chatbot-demo`를 확인하므로 같은 PC의 일반 서버에 잘못 연결해도 데모 로그인으로 이어지지 않는다. 앱에 Gemini 키를 넣지 않는다.

데모에서는 소셜 SDK 초기화를 건너뛰고 온보딩 없이 시작한다. 필요한 네이티브 모듈은 실제 사용 시에만 로딩하도록 조정했다. 네이티브 데모의 MMKV 용도인 클라이언트 설정은 메모리에, 인증은 별도 키의 SecureStore에 둔다. 웹 미리보기 인증은 해당 origin의 sessionStorage를 사용한다. 기존 로그인 저장소와 기능을 공유하지 않는다.

## 실행 — Windows PowerShell

Node.js, Java 21, Docker Desktop이 필요하다. 이 작업에서는 Node 26.3.0과 npm 11.16.0을 사용했다. 앱과 서버를 각각 다른 터미널에서 실행한다.

**터미널 1 — 서버 저장소 루트:**

```powershell
$env:DEMO_GEMINI_API_KEY = "발급받은 Gemini API 키"
.\scripts\demo.ps1
```

PowerShell 실행 정책으로 스크립트가 차단되면 정책 변경 없이 아래 명령을 사용한다.

```powershell
docker compose --env-file .env.example -f compose.demo.yml up -d --wait
.\gradlew.bat bootRun '--args=--spring.profiles.active=demo --spring.config.import=optional:file:.env.demo[.properties]'
```

**터미널 2 — 앱 저장소:**

```powershell
cd unplan-app-demo
npm ci --ignore-scripts
npm run demo:web
```

브라우저에서 **http://localhost:18081** → 데모 사용자 1 선택 → 기존 Unplan 홈 → **AI로 일정 관리 · DEMO** 버튼 → 채팅 화면으로 이동한다. 직접 진입 주소는 `http://localhost:18081/demo-login`이다.

이미 서버/Expo가 실행 중이면 같은 포트로 중복 실행하지 않는다. 종료는 실행 중인 각 터미널의 `Ctrl+C`다. DB 볼륨은 유지되므로 재실행 후에도 일정이 남는다.

서버 기본 주소는 `http://127.0.0.1:18080`이다. 포트를 바꿨다면 앱에서도 지정한다.

```powershell
$env:DEMO_API_URL = "http://127.0.0.1:18082"
npm run demo:web
```

`DEMO_API_URL`에는 공개 API 키나 토큰을 포함하지 않는다. 이 값은 앱에 포함되는 주소다. 실제 Gemini 키는 서버에만 둔다.

## 아이폰에서 시연하기

아이폰과 PC를 같은 Wi-Fi에 연결한다. `192.168.0.20`은 예시이므로 실제 PC의 사설 IP로 바꾼다. 서버를 먼저 해당 주소로 다시 실행한다.

서버 터미널:

```powershell
$env:DEMO_BIND_ADDRESS = "192.168.0.20"
$env:DEMO_GEMINI_API_KEY = "발급받은 Gemini API 키"
.\scripts\demo.ps1
```

앱 터미널:

```powershell
$env:DEMO_API_URL = "http://192.168.0.20:18080"
npm run demo:start
```

이 명령은 Expo Go용 개발 서버를 띄운다. SDK 56과 호환되는 Expo Go에서 QR로 열어 로컬 개발 버전을 시도할 수 있다. 같은 Wi-Fi, PC 방화벽, iOS 로컬 네트워크 허용 여부를 확인한다. `127.0.0.1`은 아이폰 자신을 가리키므로 실기기에서는 사용할 수 없다. Expo Go는 개발용 실행이며 별도 `Unplan Demo` 앱 설치 또는 TestFlight 배포가 아니다.

Mac과 전체 Xcode가 있는 환경에서 별도 앱을 로컬 빌드하려면:

```sh
export DEMO_API_URL=http://192.168.0.20:18080
npm run demo:ios
```

데모에만 로컬 HTTP 접속용 ATS 설정을 적용했다. 이 명령으로 생성되는 앱 ID는 `com.unplan.app.chatbotdemo`다. 서명 설정과 기기 선택은 해당 Mac 개발 환경에서 필요하다. 별도의 TestFlight 앱을 원하면 데모 bundle ID용 App Store Connect 앱·서명·EAS 프로젝트를 준비해야 하며, 이번 작업에서는 생성하거나 업로드하지 않았다.

## 시연 시나리오

실제 Gemini 키 설정 후:

1. “내일 오후 3시부터 4시까지 팀 회의 추가해줘” → 저장된 일정 목록 반영.
2. “내일 일정 보여줘” → 실제 조회 결과.
3. “내일 팀 회의 한 시간 미뤄줘” → 오후 4~5시.
4. “그 회의 장소를 홍대입구로 바꿔줘” → 목록의 장소 확인.
5. **홈** 버튼 → 기존 타임라인에서 같은 날짜의 변경 결과 확인. 일정 탭에서도 같은 데이터 조회.
6. 다시 채팅 → “내일 오후 6시에 운동 추가해줘” → 소요시간 질문 → “한 시간”.
7. “내일 팀 회의 삭제해줘” → 후보가 있으면 선택 → 대상 내용 확인 → **이 일정 삭제 확인** 버튼. 확인 전에는 유지.
8. **계정** → 사용자 2 → 사용자 1의 일정이 보이지 않는지 확인.

정보 보완, 대상 검색·선택, 반복 일정 제한, 삭제 확인, 중복 실행 방지는 서버가 담당한다. 앱은 세션 ID와 요청 ID를 전달한다. 오류의 **동일 요청 다시 시도**는 원래 ID·본문을 유지한다. 새 메시지 전송은 새로운 요청이다. 처리 결과를 받지 못했다면 먼저 동일 요청 재시도로 결과를 확인한다.

생성·수정·삭제 완료 시 앱의 기존 schedule 및 AI recommendation 캐시를 무효화한다. 기존 일/주/월·검색·상세 화면이 동일한 데모 서버 상태를 다시 조회한다. 채팅 화면은 별도 `/demo/schedules` 조회로 제목·시각·장소를 보여 준다. 변경된 날짜를 공유해 홈에서도 해당 날짜를 선택한다.

홈에서 데모 범위 밖인 측정·추천·메모 자동 조회와 온보딩 팝업은 건너뛰지만, 기존 화면과 일정 조회는 재사용한다. 기능은 데모 플래그에서만 활성화되고 일반 실행에서는 데모 경로를 리다이렉트한다.

## 검증 결과와 제한

실행한 검사:

- `npm run check`: TypeScript, ESLint, Prettier 전부 통과.
- `npm run test:demo`: **13개 통과**. 기존 실제 Expo 설정 불변, 별도 앱 ID·OTA/EAS 분리, 주소 제한, 기존 빌드 프로필 차단, API DTO 매핑, 삭제 확인 응답 검증, 재전송 본문 동일성, 기존 일정 캐시 갱신 확인. API 계약 테스트는 대체 응답을 사용한다.
- `npm run demo:export`: 웹 번들·정적 경로 생성 성공.
- iOS JavaScript/Hermes 번들 생성 성공. 설치 가능한 IPA 빌드 성공을 의미하지 않는다.
- `expo prebuild --platform ios --no-install`: iOS 프로젝트 생성 성공. 생성 결과에서 demo bundle ID·scheme, `EXUpdatesEnabled=false`, 기존 업데이트 URL 부재를 확인했다. CocoaPods 설치·컴파일·서명은 하지 않았다.
- `npm run demo:smoke`: **실제 앱 API 소스**를 실행해 실제 로컬 서버의 데모 환경 확인, JWT 로그인, DB 일정 조회, 서버의 반복 제한 응답, 동일 요청 재전송, 두 사용자·세션 분리를 확인했다. 플랫폼 저장소만 메모리로 대체하며, Gemini와 화면 렌더링은 실행하지 않는다.
- Spring 전체 테스트 **289개 통과**. 실제 PostgreSQL의 전용 테스트 DB에서도 챗봇 관련 **25개 통과**. 새 데모 확인 API와 웹 CORS 사전 요청 검증 포함.
- Expo 웹 서버 `http://localhost:18081/demo-login` 응답 200 확인.

아직 검증하지 못한 부분:

- 서버에 실제 Gemini 키가 없어 실제 자연어 처리 및 한국어 문맥 해석은 미검증이다. 키가 없으면 오류 안내를 표시하며 가짜 AI 성공 모드는 없다.
- 브라우저 도구가 `browser access host is unavailable`로 연결되지 않아 실제 클릭·레이아웃·키보드·반응형 화면 확인은 미완료다.
- 전체 Xcode와 시뮬레이터가 없는 환경이므로 iOS 네이티브 컴파일·실기기 설치·Expo Go 실기기 실행·TestFlight는 미검증이다.
- PowerShell 명령은 제공했으며 macOS에서 Windows 실행을 직접 검증하지는 않았다.

재현:

```sh
npm run check
npm run test:demo
npm run demo:export
# 로컬 Spring demo 서버 실행 후, 실제 Google 호출 없이 연결 확인
npm run demo:smoke
```

iOS JS 번들 재현 (Mac/Linux):

```sh
APP_VARIANT=demo EXPO_PUBLIC_APP_ENV=demo EXPO_PUBLIC_API_URL=http://127.0.0.1:18080 EXPO_NO_DOTENV=1 EXPO_NO_TELEMETRY=1 npx expo export --platform ios --output-dir dist-demo-ios
```

관련 공식 문서: [Expo 앱 변형](https://docs.expo.dev/build-reference/variants/), [환경변수 처리](https://docs.expo.dev/guides/environment-variables/), [앱 설정](https://docs.expo.dev/versions/latest/config/app/).
