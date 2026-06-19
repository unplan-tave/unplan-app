const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;

// TODO: Set EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY in .env.local/EAS env before iOS prebuild/build.
// The fallback is a non-secret placeholder so Expo config can still be evaluated locally.
const kakaoNativeAppKeyForNativeConfig = kakaoNativeAppKey ?? 'TODO_KAKAO_NATIVE_APP_KEY';
const googleIosUrlSchemeForNativeConfig =
  googleIosUrlScheme ?? 'com.googleusercontent.apps.TODO_GOOGLE_IOS_URL_SCHEME';

module.exports = {
  expo: {
    name: 'Unplan',
    slug: 'scheduler-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'unplan',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.unplan.app',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
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
    updates: {
      url: 'https://u.expo.dev/a6983ac6-260d-4677-90cb-0112e5050b79',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    plugins: [
      './plugins/with-kakao-maven-repository',
      './plugins/with-google-modular-headers',
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
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: googleIosUrlSchemeForNativeConfig,
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
