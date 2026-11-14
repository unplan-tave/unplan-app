const { spawn } = require('node:child_process');
const { validateDemoApiUrl } = require('./demo-config.cjs');

const mode = process.argv[2];
const commands = {
  start: ['start', '--port', '18081', '--go'],
  web: ['start', '--web', '--localhost', '--port', '18081'],
  export: ['export', '--platform', 'web', '--output-dir', 'dist-demo'],
  ios: ['run:ios', '--port', '18081'],
};
if (!commands[mode]) throw new Error('지원 명령: start, web, export, ios');
const env = {
  ...process.env,
  APP_VARIANT: 'demo',
  EXPO_PUBLIC_APP_ENV: 'demo',
  EXPO_PUBLIC_API_URL: validateDemoApiUrl(process.env.DEMO_API_URL || 'http://127.0.0.1:18080'),
  BROWSER: 'none',
  EXPO_NO_DOTENV: '1',
  EXPO_NO_TELEMETRY: '1',
};
// The runner executes only local Expo commands, never EAS build/update/submit/deploy.
const child = spawn(process.execPath, [require.resolve('expo/bin/cli'), ...commands[mode]], {
  env,
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 1));
