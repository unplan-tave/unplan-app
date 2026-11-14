const assert = require('node:assert/strict');
const { loadChatClient, loadSource } = require('./load-app-source.cjs');
const { validateDemoApiUrl } = require('./demo-config.cjs');

async function main() {
  const url = validateDemoApiUrl(process.env.DEMO_API_URL || 'http://127.0.0.1:18080');
  const { client, apiClient } = loadChatClient(url);
  const session = await client.loginToDemo(1);
  apiClient.defaults.headers.common.Authorization = `Bearer ${session.accessToken}`;
  const before = await client.fetchDemoSchedules(session.today);
  const { createChatId } = loadSource('src/domains/schedule/chat/model.ts');
  // Server-side recurring-request rejection never calls Gemini. This is a real server test, not AI evidence.
  const request = {
    sessionId: session.sessionId,
    requestId: createChatId(),
    message: '매주 월요일 팀 회의 추가해줘',
  };
  const reply = await client.submitChat(request);
  assert.equal(reply.status, 'question');
  assert.match(reply.message, /반복/);
  assert.deepEqual(await client.submitChat(request), reply);
  const after = await client.fetchDemoSchedules(session.today);
  assert.deepEqual(after, before);
  const second = await client.loginToDemo(2);
  assert.notEqual(second.memberId, session.memberId);
  assert.notEqual(second.sessionId, session.sessionId);
  console.info(
    'PASS: actual app API source → demo handshake → JWT login → real schedule query → safe chat response → identical retry → unchanged DB; two isolated users.',
  );
  console.info('Gemini and actual screen interactions were not exercised.');
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
