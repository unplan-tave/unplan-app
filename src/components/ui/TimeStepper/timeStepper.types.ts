import { type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export type TimeStepperVariant = 'plain' | 'action';
export type TimeStepperTone = 'default' | 'error';

export interface TimeStepperProps {
  label?: string;
  alertMessage?: string;
  disabled?: boolean;
  /** 'plain'(기본) — 평면 아이콘 / 'action' — 원형 버튼(− 회색, + 강조색) */
  variant?: TimeStepperVariant;
  /** 'error' — 겹침 등 오류 상태를 빨간 톤으로 표시 (action variant에서 컨테이너까지 적용) */
  tone?: TimeStepperTone;
  /** 감소 버튼만 비활성화. 미지정 시 `disabled`를 따릅니다. */
  decreaseDisabled?: boolean;
  /** 증가 버튼만 비활성화. 미지정 시 `disabled`를 따릅니다. */
  increaseDisabled?: boolean;
  onDecrease?: PressableProps['onPress'];
  onIncrease?: PressableProps['onPress'];
  style?: StyleProp<ViewStyle>;
}
