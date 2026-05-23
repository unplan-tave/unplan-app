import { type TouchableOpacityProps } from 'react-native';

/** Condition 태그 종류 (피그마 기준) */
export type ConditionType = 'brain' | 'labor' | 'daily' | 'urgent' | 'rest' | 'core';

/** Personal 태그 크기 (피그마 기준) */
export type PersonalSize = 'min' | 'default' | 'max';

export type TagVariant = 'condition' | 'personal';

interface BaseTagProps extends TouchableOpacityProps {
  /** 태그 텍스트 */
  label: string;
}

export interface ConditionTagProps extends BaseTagProps {
  variant: 'condition';
  /** Condition 타입 — dot 색상 결정 */
  condition: ConditionType;
}

export interface PersonalTagProps extends BaseTagProps {
  variant: 'personal';
  condition?: never;
}

export type TagProps = ConditionTagProps | PersonalTagProps;
