function validateDemoApiUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('데모 서버 주소를 올바르게 설정해 주세요.');
  }
  const host = url.hostname;
  const octets = host.split('.').map(Number);
  const ipv4 =
    /^\d+\.\d+\.\d+\.\d+$/.test(host) &&
    octets.every((n) => Number.isInteger(n) && n >= 0 && n <= 255);
  const local =
    host === 'localhost' ||
    (ipv4 &&
      (octets[0] === 127 ||
        octets[0] === 10 ||
        (octets[0] === 192 && octets[1] === 168) ||
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)));
  if (
    !local ||
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== '/'
  ) {
    throw new Error(
      '데모는 localhost 또는 사설 IP의 데모 서버만 사용합니다. 운영·개발 서버 주소는 사용할 수 없습니다.',
    );
  }
  return url.origin;
}

function configureDemoVariant(config, env) {
  const variant = env.APP_VARIANT === 'demo';
  const runtime = env.EXPO_PUBLIC_APP_ENV === 'demo';
  if (!variant && !runtime) return;
  if (!variant || !runtime)
    throw new Error('APP_VARIANT와 EXPO_PUBLIC_APP_ENV를 모두 demo로 설정해야 합니다.');
  if (env.EAS_BUILD_PROFILE && !env.EAS_BUILD_PROFILE.startsWith('demo'))
    throw new Error('데모는 기존 EAS 빌드 프로필을 사용할 수 없습니다.');
  validateDemoApiUrl(env.EXPO_PUBLIC_API_URL);
  config.name = 'Unplan Demo';
  config.slug = 'unplan-chatbot-demo';
  config.scheme = 'unplan-chatbot-demo';
  config.ios.bundleIdentifier = 'com.unplan.app.chatbotdemo';
  config.android.package = 'com.unplan.app.chatbotdemo';
  config.ios.infoPlist.NSLocalNetworkUsageDescription = '로컬 일정 챗봇 데모 서버에 연결합니다.';
  config.ios.infoPlist.NSAppTransportSecurity = {
    NSAllowsArbitraryLoads: true,
    NSAllowsLocalNetworking: true,
  };
  config.updates = { enabled: false };
  config.extra = { demo: true };
  config.runtimeVersion = 'chatbot-demo-1';
  config.plugins = config.plugins.filter(
    (p) =>
      !['@react-native-kakao/core', '@react-native-google-signin/google-signin'].includes(
        typeof p === 'string' ? p : p[0],
      ),
  );
}

module.exports = { validateDemoApiUrl, configureDemoVariant };
