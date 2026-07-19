/** 컨디션 점수에 맞는 메인 화면 안내 문구를 반환합니다. */
export function getConditionHeroCopy(score: number): string {
  if (score >= 80) {
    return '오늘의 컨디션 흐름이 안정적이에요.\n계획한 일정을 이어가도 좋아요.';
  }

  if (score >= 60) {
    return '오늘은 무리하지 않고\n중요한 일부터 차분히 해보세요.';
  }

  if (score >= 40) {
    return '조금 지친 하루예요.\n작은 일부터 가볍게 시작해봐요.';
  }

  return '회복이 먼저 필요한 날이에요.\n잠시 쉬어가도 괜찮아요.';
}
