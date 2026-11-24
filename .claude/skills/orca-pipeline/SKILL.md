---
name: orca-pipeline
description: >-
  unplan-app 기능 개발을 Orca로 자동 연결하는 파이프라인. Claude(코디네이터)가 설계 → Codex 워커가
  구현·커밋·PR → GitHub 리뷰 봇이 리뷰(코디네이터는 결과를 읽고 판단) → Codex 워커가 수정 → 사용자 승인 → Codex가 머지까지 이어 간다.
  트리거 — "파이프라인으로 돌려줘", "orca 파이프라인", "설계하고 codex한테 넘겨", "/orca-pipeline".
  Orca 안에서 띄운 Claude 세션에서만 쓴다(Orca가 워커 완료 시 이 세션을 깨워야 하므로).
---

# Orca 파이프라인 (unplan-app)

| 단계 | 담당 | 모델 / 강도 |
|---|---|---|
| 1 설계 | Claude (이 세션, 코디네이터) | 세션 설정 그대로 |
| 2 구현·커밋·PR | Codex 워커 A | `gpt-6.2-sol` / `high` |
| 3 리뷰 | GitHub 봇(Claude Code Review Action) + 코디네이터 점검 | Action 설정 |
| 4 수정 | Codex 워커 B (A와 같은 worktree) | `gpt-6.2-sol` / `xhigh` |
| 5 머지 | Codex 워커 B, **사용자 승인 후** | 〃 |

4단계는 강도가 달라서 A에 `send`하지 않고 새 워커 B를 띄운다(`send`는 기존 워커의 모델·강도를 그대로 쓴다).

## 0. 시작 전

1. `orca status`로 runtime이 `ready`인지 확인한다. 아니면 사용자에게 Orca 앱을 열어 달라고 하고 멈춘다.
2. `orca skills get orchestration`을 **한 번** 읽는다. 아래 명령의 의미, wake 처리, 금지 사항(폴링 금지, 워커 터미널 직접 조작 금지)은 그 가이드를 따른다.
3. 작업 폴더: `WORK=${TMPDIR:-/tmp}/orca-pipeline/<slug>` (`<slug>`는 kebab-case 기능명). 명세 파일은 여기에 쓴다. 저장소 안에는 쓰지 않는다.

## 1. 설계 (Claude)

- `AGENTS.md`와 거기서 가리키는 `docs/architecture/*`, `docs/frontend/component-decomposition.md`를 기준으로 설계한다.
- 산출물: `$WORK/design.md` — 목표, 변경할 파일/폴더(레이어 규칙에 맞는 위치), 컴포넌트·hook·domain 분리, API boundary, 완료 기준.
- 사용자에게 설계 요약을 5~10줄로 보여 주고 **바로 2단계로 진행한다**. 사용자가 "설계 확인 후 진행"이라고 했을 때만 여기서 멈추고 승인을 기다린다.
- 브랜치 이름을 정한다: `feat/<slug>` · `fix/<slug>` · `refactor/<slug>` · `chore/<slug>` 중 하나.

## 2. 구현·커밋·PR (Codex 워커 A)

`$WORK/spec-impl.md`를 아래 템플릿으로 쓰고 워커를 띄운 뒤 **턴을 끝낸다**.

```bash
orca orchestration worker-start \
  --spec-file "$WORK/spec-impl.md" \
  --task-title "구현: <slug>" \
  --agent codex --model gpt-6.2-sol --effort high \
  --worktree new-child --name <slug> --base-branch origin/develop
```

receipt의 `dispatch_id`, worktree 경로를 `$WORK/state.md`에 적어 둔다.

### spec-impl.md 템플릿

```markdown
# 작업: <기능명> 구현 후 PR 생성

## 설계
<design.md 전문을 붙여 넣는다 — 워커는 코디네이터의 파일을 볼 수 없다>

## 규칙
- 저장소 루트의 AGENTS.md를 먼저 읽고 따른다(폴더 구조, 의존 방향, 디자인 토큰, primitive variant 확장 등).
- src/lib/api(Orval generated)는 수정하지 않는다.
- 설계 범위 밖의 파일은 건드리지 않는다. 설계와 다르게 가야 하면 ask로 코디네이터에게 묻는다.

## 절차
1. `npm ci`
2. 현재 브랜치 이름을 `<branch>`로 바꾼다: `git branch -m <branch>` (이 worktree는 Orca가 origin/develop 기준으로 만든 것이다).
3. 구현.
4. `npm run check` (type-check + oxlint + prettier --check) 통과. 실패하면 고친다. `npm run format`은 써도 된다.
5. 커밋: Conventional Commits + 한국어 요약 (예: `feat: 카드 검색 화면 추가`). 의미 단위로 나눠도 된다.
6. `git push -u origin <branch>`
7. PR 본문은 **`.github/pull_request_template.md`를 그대로 채운다.** 섹션을 빼거나 새로 만들지 않는다.
   - 템플릿을 `pr-body.md`로 복사해서 채운다. 맨 아래 HTML 주석도 지우지 않는다.
   - `작업 개요`: 무엇을 왜 바꿨는지, 설계와 달라진 점.
   - `변경 유형`: 해당 항목만 `[x]`.
   - `UI 변경 사항`: UI 변경이 없으면 `없음`. 있으면 변경된 화면을 적고, 스크린샷은 `추후 첨부`로 둔다.
   - `테스트`: **실제로 돌려서 통과한 것만** `[x]`. 시뮬레이터·기기 확인을 하지 않았으면 체크하지 않는다. 확인할 화면이 없으면 `해당 없음`에 `[x]`.
   - `환경변수/설정`: 해당 항목에 `[x]`, `필요한 값`은 없으면 `없음`.
   - `참고 사항`: 리뷰어가 봐야 할 점. 이슈가 있으면 `Closes #<번호>`를 여기에 넣는다.
   - `gh pr create --base develop --title "<커밋과 같은 형식>" --body-file pr-body.md` (draft 아님). `pr-body.md`는 커밋하지 않는다.
8. **머지하지 않는다.**

## 완료 보고 (worker_done)
- PR URL과 번호, 브랜치명
- 변경 파일 목록
- `npm run check` 결과(마지막 출력 요약)
- 설계와 달라진 점 / 남은 TODO

`npm run check` 실패를 해결하지 못했거나 PR을 만들지 못했으면 실패(failed)로 보고한다.
```

## 3. 리뷰 (GitHub 봇 = Claude Code Review Action)

**PR에 남는 리뷰는 GitHub 봇(`github-actions`)이 쓴다.** 코디네이터는 PR에 리뷰·리뷰 코멘트를 직접 달지 않는다(사용자 계정으로 올라가기 때문). 봇은 `.github/workflows/claude-code-review.yml`이고, base 브랜치의 `REVIEW.md`대로 인라인 코멘트와 `## Claude 코드 리뷰` 요약 댓글을 남긴다.

봇이 도는 때:
- PR을 열 때(draft 제외) 자동으로 한 번.
- 그 뒤에는 PR 댓글 맨 앞에 `@claude review`를 쓸 때만. **푸시만으로는 다시 돌지 않는다.**

워커 A의 `worker_done`으로 깨어나면:

1. 실패 보고면 사용자에게 원인을 알리고 멈춘다(재시도는 사용자 판단).
2. **봇 리뷰를 기다린다.** 기준 시각 `SINCE`는 PR 생성 시각(`gh pr view <n> --json createdAt -q .createdAt`)이다. 아래는 한 번 실행해서 끝날 때까지 기다리는 명령이다(Orca mailbox를 건드리지 않으므로 orchestration의 "폴링 금지"와 무관하다).

   ```bash
   PR=<n>; SINCE=<ISO 시각>
   for i in $(seq 1 60); do
     body=$(gh pr view $PR --json comments --jq "[.comments[] | select(.author.login==\"github-actions\" and .createdAt > \"$SINCE\" and (.body|contains(\"## Claude 코드 리뷰\")))] | last | .body // empty")
     [ -n "$body" ] && { printf '%s\n' "$body" > "$WORK/review-1.md"; echo REVIEW_READY; break; }
     failed=$(gh run list --workflow claude-code-review.yml --limit 10 --json conclusion,createdAt --jq "[.[] | select(.createdAt > \"$SINCE\" and .conclusion==\"failure\")] | length")
     [ "$failed" != "0" ] && { echo REVIEW_FAILED; break; }
     sleep 30
   done
   ```
   - `REVIEW_FAILED`거나 30분 안에 결과가 없으면 사용자에게 알리고 멈춘다. 코디네이터가 대신 리뷰를 올리지 않는다.
3. 봇 요약의 기준 커밋이 현재 head SHA 앞 7자리와 같은지 확인한다. 다르면 `@claude review`로 다시 요청하고(4단계의 재리뷰 절차) 2번처럼 기다린다.
4. 인라인 코멘트도 모은다: `gh api repos/unplan-tave/unplan-app/pulls/<n>/comments --jq '.[] | select(.user.login=="github-actions[bot]") | "\(.path):\(.line)\n\(.body)"'` → `$WORK/review-1.md` 뒤에 붙인다.
5. **코디네이터 자체 점검(PR에 올리지 않음)** — 봇이 보지 않는 두 가지만 본다.
   - PR 본문이 `.github/pull_request_template.md` 섹션을 모두 갖췄는지, `테스트` 체크가 워커 보고와 맞는지.
   - 1단계 설계 대비 빠진 것.
   어긋난 것은 `$WORK/coordinator-notes.md`에 쓰고 4단계 명세에만 넣는다. 심각도는 `REVIEW.md` 표로 매긴다.
6. 봇의 `Questions`는 제품·설계 결정이므로 사용자에게 묻고 답을 받은 뒤 진행한다.
7. 봇 `Must Fix`가 `없음`이고 `coordinator-notes.md`도 비어 있으면 4단계를 건너뛰고 5단계로 간다. `Recommendations`(`low`)는 수정 대상이 아니다.

## 4. 수정 (Codex 워커 B, xhigh)

`$WORK/spec-fix.md`를 쓰고 워커 A의 worktree에서 새 워커를 띄운 뒤 **턴을 끝낸다**.

```bash
orca orchestration worker-start \
  --spec-file "$WORK/spec-fix.md" \
  --task-title "리뷰 수정: <slug>" \
  --agent codex --model gpt-6.2-sol --effort xhigh \
  --worktree branch:<branch>
```

워커 B가 시작되면 워커 A는 `orca orchestration worker-release --dispatch <A의 dispatch_id>`로 정리한다.

### spec-fix.md 템플릿

```markdown
# 작업: PR #<n> 리뷰 반영

브랜치 `<branch>` (이 worktree에 체크아웃되어 있음). AGENTS.md 규칙을 따른다.

## 원래 설계
<design.md 전문>

## 리뷰 지적 사항
<review-N.md 전문 (봇 요약 + 인라인 코멘트)>

## 코디네이터 점검 (PR 본문·설계 대비)
<coordinator-notes.md 전문, 없으면 "없음">

## 절차
1. `Must Fix`(critical·high·medium) 항목은 모두 고친다. `Recommendations`(low)는 고치지 않아도 되고, 고쳤다면 보고에 적는다.
2. 리뷰 범위 밖의 리팩터링은 하지 않는다.
3. `npm run check` 통과.
4. 커밋(`fix: 리뷰 반영 - <요약>` 형식) 후 `git push`.
5. PR 본문이 지적됐거나 이번 수정으로 `테스트`·`작업 개요`가 달라졌으면 `.github/pull_request_template.md` 형식을 유지한 채 `gh pr edit <n> --body-file pr-body.md`로 고친다.
6. **머지하지 않는다.** 머지는 코디네이터가 별도로 지시한다.

## 완료 보고 (worker_done)
- 항목 번호별 처리 결과(고침 / 안 고침+이유)
- 추가 커밋 해시
- `npm run check` 결과
```

워커 B의 `worker_done`으로 깨어나면 봇 재리뷰를 요청한다.

1. `SINCE=$(date -u +%Y-%m-%dT%H:%M:%SZ)` 를 먼저 잡고, `gh pr comment <n> --body "@claude review"`로 봇을 다시 돌린다. (이 트리거 댓글 하나만 사용자 계정으로 남는다. 리뷰 내용은 봇이 쓴다.)
2. 3단계 2~4번과 같이 기다리고 모아서 `$WORK/review-2.md`에 둔다. 코디네이터 자체 점검(3단계 5번)도 다시 한다.
3. 남은 `Must Fix`나 자체 점검 항목이 있으면 같은 워커 B에 보낸다(강도 그대로 xhigh). `send`에는 파일 옵션이 없어서 본문으로 넘긴다:
   `orca orchestration send --to dispatch:<B의 dispatch_id> --subject "리뷰 2차" --body "$(cat "$WORK/review-2.md" "$WORK/coordinator-notes.md")"`
4. **수정 라운드는 최대 2회.** 2회 뒤에도 `Must Fix`가 남으면 사용자에게 상황을 보고하고 멈춘다.

## 5. 머지 (사용자 승인 → Codex 워커 B)

1. 사용자에게 보고한다: PR 링크, 리뷰 라운드 수, 남은 `Recommendations`·`Questions`, CI 상태(`gh pr checks <n>`).
2. **"머지할까요?"라고 묻고 턴을 끝낸다.** 사용자의 명시적인 승인(이 채팅에서 사용자가 직접 쓴 말)이 있어야 다음으로 간다.
3. 승인 후 워커 B에 보낸다(4단계를 건너뛰어 B가 없으면, 같은 옵션으로 `worker-start --worktree branch:<branch>` 하여 띄운다):

   ```bash
   orca orchestration send --to dispatch:<B의 dispatch_id> --subject "머지" --body "사용자 승인됨. 1) gh pr checks <n> --watch 로 CI가 모두 통과할 때까지 기다린다. 실패하면 머지하지 말고 실패 체크 이름과 로그 요약을 failed로 보고한다. 2) 통과하면 gh pr merge <n> --merge 로 머지한다(merge commit 방식, 브랜치 삭제 안 함). 3) 머지된 커밋 해시를 worker_done으로 보고한다."
   ```
4. `worker_done`으로 깨어나면 `gh pr view <n> --json state,mergeCommit`으로 머지를 확인하고 사용자에게 최종 보고한다. 끝난 워커는 `worker-release`로 정리한다.

## 규칙

- 코디네이터(Claude)는 이 파이프라인에서 코드를 직접 고치거나 커밋·푸시·머지하지 않는다. 수정은 항상 Codex 워커에게 보낸다.
- 코디네이터는 PR에 리뷰·리뷰 코멘트를 쓰지 않는다. PR에 남기는 것은 `@claude review` 트리거 댓글뿐이다.
- 워커의 `ask`(질문)는 설계·규칙으로 답할 수 있으면 `orca orchestration reply`로 답하고, 제품 결정이면 사용자에게 묻는다.
- 단계가 바뀔 때마다 사용자에게 한두 줄로 진행 상황을 남긴다.
