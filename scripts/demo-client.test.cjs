const { test } = require('node:test');
const assert = require('node:assert/strict');
const { QueryClient } = require('@tanstack/react-query');
const { loadSource } = require('./load-app-source.cjs');

const candidate = {
  index: 1,
  title: '팀 회의',
  date: '2026-11-04',
  start_time: '15:00',
  end_time: '16:00',
  location: '홍대입구',
};

function apiBoundary(response) {
  return loadSource('src/domains/schedule/chat/api/client.ts', {
    '@/constants/config': { Config: { isDemo: true, apiUrl: 'http://127.0.0.1:18080' } },
    '@/lib/api/client': {
      apiClient: {
        post: async (...args) => {
          response.requests.push(args);
          return { data: response.data };
        },
      },
    },
    '@/lib/demo-environment': { assertDemoApiUrl: require('./demo-config.cjs').validateDemoApiUrl },
    '@/lib/storage/secure-storage': { secureStorage: {} },
    '../model': loadSource('src/domains/schedule/chat/model.ts'),
  });
}
test('actual API mapper preserves candidate content and server confirmation token', async () => {
  const response = {
    requests: [],
    data: {
      status: 'confirmation',
      message: '삭제할까요?',
      target: candidate,
      confirmation_token: 'server-only-token',
    },
  };
  const client = apiBoundary(response);
  const result = await client.submitChat({
    sessionId: 'session',
    requestId: 'request',
    message: '회의 삭제',
  });
  assert.equal(result.target.startTime, '15:00');
  assert.equal(result.target.location, '홍대입구');
  assert.equal(result.confirmationToken, 'server-only-token');
  assert.deepEqual(response.requests[0][1], {
    session_id: 'session',
    request_id: 'request',
    message: '회의 삭제',
  });
});
test('retry serializes the identical execution ID and confirmation body', async () => {
  const response = { requests: [], data: { status: 'done', message: '삭제했습니다.' } };
  const client = apiBoundary(response);
  const request = {
    sessionId: 'session',
    requestId: 'one-execution',
    confirmationToken: 'confirm',
  };
  await client.submitChat(request);
  await client.submitChat(request);
  assert.deepEqual(response.requests[0], response.requests[1]);
  assert.equal(response.requests[0][1].message, undefined);
});
test('malformed server output is never accepted as successful completion', async () => {
  const client = apiBoundary({
    requests: [],
    data: { status: 'success-ish', message: '저장했어요' },
  });
  await assert.rejects(client.submitChat({ sessionId: 's', requestId: 'r', message: '등록' }));
});
test('completed chat invalidates existing home, list, detail and recommendation caches', async () => {
  const queryClient = new QueryClient();
  const scheduleKeys = loadSource('src/domains/schedule/api/query-keys.ts');
  const aiKeys = loadSource('src/domains/ai-recommendation/api/query-keys.ts');
  const mutation = loadSource('src/domains/schedule/chat/api/mutations.ts', {
    '@/domains/schedule/api/query-keys': scheduleKeys,
    '@/domains/ai-recommendation/api/query-keys': aiKeys,
    './client': { submitChat: () => {} },
  });
  const keys = [
    scheduleKeys.scheduleQueryKeys.byDate('2026-11-04'),
    scheduleKeys.scheduleQueryKeys.detail(1),
    ['schedule', 'search'],
    aiKeys.aiRecommendationQueryKeys.all,
  ];
  keys.forEach((key) => queryClient.setQueryData(key, ['old']));
  await mutation.refreshChatSchedules(queryClient, {
    status: 'question',
    message: '몇 시간인가요?',
  });
  keys.forEach((key) => assert.equal(queryClient.getQueryState(key).isInvalidated, false));
  await mutation.refreshChatSchedules(queryClient, { status: 'done', message: '저장했습니다.' });
  keys.forEach((key) => assert.equal(queryClient.getQueryState(key).isInvalidated, true));
  queryClient.clear();
});

test('a deletion button cannot be offered without the actual target and confirmation token', async () => {
  const client = apiBoundary({
    requests: [],
    data: { status: 'confirmation', message: '삭제할까요?' },
  });
  await assert.rejects(client.submitChat({ sessionId: 's', requestId: 'r', message: '삭제' }));
});


test('recommendations preserve server-generated time and reason without implying completion', async () => {
  const client = apiBoundary({
    requests: [],
    data: {
      status: 'recommended',
      message: '가능한 시간입니다. 아직 추가하지 않았어요.',
      date: candidate.date,
      candidates: [{ ...candidate, reason: '수면·제외 시간과 일정 앞뒤 15분을 반영했습니다.' }],
    },
  });
  const reply = await client.submitChat({ sessionId: 's', requestId: 'r', message: '내일 공부 언제 할까?' });
  assert.equal(reply.status, 'recommended');
  assert.equal(reply.candidates[0].startTime, '15:00');
  assert.match(reply.candidates[0].reason, /15분/);
  assert.equal(reply.confirmationToken, undefined);
});
