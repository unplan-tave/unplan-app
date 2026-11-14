// Tests execute the actual TypeScript API boundary. Only platform storage/config are injected.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadSource(file, imports = {}) {
  const output = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(
    (name) => imports[name] ?? require(name),
    module,
    module.exports,
  );
  return module.exports;
}

function loadChatClient(apiUrl) {
  const axios = require('axios');
  const { validateDemoApiUrl } = require('./demo-config.cjs');
  const apiClient = axios.create({ baseURL: apiUrl, timeout: 10000 });
  const storage = new Map();
  const client = loadSource('src/domains/schedule/chat/api/client.ts', {
    '@/constants/config': { Config: { isDemo: true, apiUrl } },
    '@/lib/api/client': { apiClient },
    '@/lib/demo-environment': { assertDemoApiUrl: validateDemoApiUrl },
    '@/lib/storage/secure-storage': {
      secureStorage: {
        get: async (k) => storage.get(k) ?? null,
        set: async (k, v) => storage.set(k, v),
      },
    },
    '../model': loadSource('src/domains/schedule/chat/model.ts'),
  });
  return { client, apiClient, storage };
}
module.exports = { loadSource, loadChatClient };
