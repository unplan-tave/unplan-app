const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { configureDemoVariant, validateDemoApiUrl } = require('./demo-config.cjs');

function original() {
  return {
    name: 'Unplan',
    slug: 'unplan',
    scheme: 'unplan',
    ios: { bundleIdentifier: 'com.unplan.app', infoPlist: {} },
    android: { package: 'com.unplan.app' },
    updates: { url: 'https://u.expo.dev/original-project' },
    extra: { eas: { projectId: 'original-project' } },
    plugins: [
      'expo-router',
      ['@react-native-google-signin/google-signin', {}],
      ['@react-native-kakao/core', {}],
    ],
  };
}
const env = {
  APP_VARIANT: 'demo',
  EXPO_PUBLIC_APP_ENV: 'demo',
  EXPO_PUBLIC_API_URL: 'http://127.0.0.1:18080',
};

test('ordinary app configuration remains identical', () => {
  const config = original();
  const before = structuredClone(config);
  configureDemoVariant(config, {});
  assert.deepEqual(config, before);
});
test('demo is a different app without the production EAS project or update URL', () => {
  const config = original();
  configureDemoVariant(config, env);
  assert.equal(config.name, 'Unplan Demo');
  assert.equal(config.ios.bundleIdentifier, 'com.unplan.app.chatbotdemo');
  assert.equal(config.android.package, 'com.unplan.app.chatbotdemo');
  assert.equal(config.scheme, 'unplan-chatbot-demo');
  assert.deepEqual(config.updates, { enabled: false });
  assert.equal(config.extra.eas, undefined);
  assert.deepEqual(config.plugins, ['expo-router']);
});
test('both demo switches are required', () => {
  assert.throws(() => configureDemoVariant(original(), { ...env, APP_VARIANT: undefined }));
  assert.throws(() =>
    configureDemoVariant(original(), { ...env, EXPO_PUBLIC_APP_ENV: 'production' }),
  );
});
test('existing EAS production and preview profiles cannot build a demo', () => {
  for (const EAS_BUILD_PROFILE of ['production', 'preview', 'development'])
    assert.throws(() => configureDemoVariant(original(), { ...env, EAS_BUILD_PROFILE }));
});
test('public production, development and deceptive addresses are rejected', () => {
  for (const url of [
    'https://dev-api.un-plan.com',
    'https://api.un-plan.com',
    'https://example.com',
    'http://localhost.evil.test',
    'http://127.0.0.1@evil.test',
    'http://192.168.0.2/path',
    'http://127.0.0.1?forward=production',
    'file:///demo',
  ])
    assert.throws(() => validateDemoApiUrl(url), url);
});
test('loopback and RFC1918 LAN hosts are supported', () => {
  for (const host of [
    'localhost',
    '127.0.0.1',
    '10.0.2.2',
    '192.168.0.20',
    '172.16.0.1',
    '172.31.255.254',
  ])
    assert.equal(validateDemoApiUrl(`http://${host}:18080/`), `http://${host}:18080`);
  for (const host of ['172.15.0.1', '172.32.0.1', '192.169.0.1', '0.0.0.0', '10.999.0.1'])
    assert.throws(() => validateDemoApiUrl(`http://${host}:18080`));
});
test('the local runner cannot dispatch build, update, submit or deploy commands', () => {
  const runner = fs.readFileSync(require.resolve('./demo-run.cjs'), 'utf8');
  assert.match(runner, /EXPO_NO_DOTENV: '1'/);
  assert.match(runner, /APP_VARIANT: 'demo'/);
  assert.match(runner, /require.resolve\('expo\/bin\/cli'\)/);
  assert.doesNotMatch(runner, /spawn\([^\n]*(?:eas|submit|deploy|update)/);
});

test('real default app config is identical to origin/develop when demo flags are absent', () => {
  const vm = require('node:vm');
  const { execFileSync } = require('node:child_process');
  const previous = execFileSync('git', ['show', 'origin/develop:app.config.js'], {
    encoding: 'utf8',
  });
  const current = fs.readFileSync(require.resolve('../app.config.js'), 'utf8');
  function evaluate(source) {
    const module = { exports: {} };
    vm.runInNewContext(source, {
      module,
      process: { env: {} },
      require: () => require('./demo-config.cjs'),
    });
    return JSON.parse(JSON.stringify(module.exports));
  }
  assert.deepEqual(evaluate(current), evaluate(previous));
});
