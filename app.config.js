const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;

// TODO: Set EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY in .env.local/EAS env before iOS prebuild/build.
// The fallback is a non-secret placeholder so Expo config can still be evaluated locally.
const kakaoNativeAppKeyForNativeConfig = kakaoNativeAppKey ?? 'TODO_KAKAO_NATIVE_APP_KEY';

module.exports = {
  expo: {
    name: 'scheduler-app',
    slug: 'scheduler-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'scheduler-app',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.unplan.app',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      package: 'com.unplan.app',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: [
      './plugins/with-kakao-maven-repository',
      ['expo-router', { root: 'src/app' }],
      'expo-status-bar',
      [
        'expo-secure-store',
        {
          faceIDPermission: 'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
        },
      ],
      [
        '@react-native-kakao/core',
        {
          nativeAppKey: kakaoNativeAppKeyForNativeConfig,
          ios: {
            handleKakaoOpenUrl: true,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: 'a6983ac6-260d-4677-90cb-0112e5050b79',
      },
    },
  },
};
