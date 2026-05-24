import { type ViewProps } from 'react-native';

/** Condition 태그 종류 (피그마 기준) */
export type ConditionType = 'brain' | 'labor' | 'daily' | 'urgent' | 'rest' | 'core';

export type TagVariant = 'condition' | 'personal';

interface BaseTagProps extends ViewProps {
  /** 태그 텍스트 */
  label: string;
  /** 제공 시에만 터치 피드백이 활성화됩니다 */
  onPress?: () => void;
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
