import { type TextProps } from 'react-native';

import { type TypographyVariant } from '@/constants/theme';

export interface TypographyProps extends TextProps {
  /** 피그마 타이포그래피 스케일 */
  variant?: TypographyVariant;
  /** 색상 — colors 객체의 text.* 키 또는 hex 문자열 */
  color?: string;
  /** 텍스트 정렬 */
  align?: 'left' | 'center' | 'right';
}
