/**
 * Unplan Design System — Typography Tokens
 * 폰트: SUIT (https://sunn.us/suit/)
 *
 * 설치: npm install @sun-typeface/suit
 * 로드: src/app/_layout.tsx 의 useFonts() (fontFamilyWeight 키와 동일한 이름으로 등록)
 *
 * Figma 기준 스케일 (단위: px → pt, 1:1 대응)
 * ┌──────────┬──────┬────────┬────────────┬──────────────┐
 * │ Token    │ size │ weight │ lineHeight │ letterSpacing│
 * ├──────────┼──────┼────────┼────────────┼──────────────┤
 * │ display  │  32  │  800   │   51.2     │   -0.64      │
 * │ titleL   │  24  │  700   │   33.6     │   -0.48      │
 * │ titleM   │  20  │  700   │   32.0     │   -0.40      │
 * │ titleS   │  18  │  600   │   28.8     │   -0.36      │
 * │ bodyM    │  16  │  400   │   25.6     │   -0.32      │
 * │ bodyS    │  14  │  300   │   22.4     │   -0.28      │
 * │ caption  │  12  │  200   │   19.2     │   -0.24      │
 * └──────────┴──────┴────────┴────────────┴──────────────┘
 */

import { type TextStyle } from 'react-native';

/** SUIT weight별 폰트 패밀리 이름 (개별 파일 로드 시 사용) */
export const fontFamilyWeight = {
  extraLight: 'SUIT-ExtraLight', // 200
  light: 'SUIT-Light', // 300
  regular: 'SUIT-Regular', // 400
  medium: 'SUIT-Medium', // 500
  semiBold: 'SUIT-SemiBold', // 600
  bold: 'SUIT-Bold', // 700
  extraBold: 'SUIT-ExtraBold', // 800
} as const;

type TypographyStyle = Required<
  Pick<TextStyle, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing' | 'fontFamily'>
>;

export const typography = {
  display: {
    fontFamily: fontFamilyWeight.extraBold,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 51.2,
    letterSpacing: -0.64,
  },
  titleL: {
    fontFamily: fontFamilyWeight.bold,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 33.6,
    letterSpacing: -0.48,
  },
  titleM: {
    fontFamily: fontFamilyWeight.bold,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  titleS: {
    fontFamily: fontFamilyWeight.semiBold,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28.8,
    letterSpacing: -0.36,
  },
  bodyM: {
    fontFamily: fontFamilyWeight.regular,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 25.6,
    letterSpacing: -0.32,
  },
  bodyS: {
    fontFamily: fontFamilyWeight.light,
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 22.4,
    letterSpacing: -0.28,
  },
  caption: {
    fontFamily: fontFamilyWeight.extraLight,
    fontSize: 12,
    fontWeight: '200',
    lineHeight: 19.2,
    letterSpacing: -0.24,
  },
} as const satisfies Record<string, TypographyStyle>;

export type TypographyVariant = keyof typeof typography;
