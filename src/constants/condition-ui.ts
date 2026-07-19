import { type ImageSourcePropType } from 'react-native';

import { type getConditionScoreTheme } from '@/domains/condition/score-theme';

export const CONDITION_CALENDAR_WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const CONDITION_CALENDAR_DAYS_PER_WEEK = 7;

export const CONDITION_GRAPH_CARD_HEIGHT = 260;
export const CONDITION_GRAPH_TOGGLE_HEIGHT = 28;
export const CONDITION_METRIC_CARD_HEIGHT = 83;
export const CONDITION_METRIC_GAUGE_HEIGHT = 4;
export const CONDITION_HERO_SCORE = { fontSize: 84, lineHeight: 84, letterSpacing: -4 } as const;
export const CONDITION_SUMMARY_PANEL = {
  dividerWidth: 107,
  scoreFontSize: 56,
  scoreLineHeight: 84,
  scoreLetterSpacing: -4.48,
} as const;
export const CONDITION_RECOMMENDATION_HEADER_SPACER_WIDTH = 32;
export const CONDITION_RECOMMENDATION_EMPTY_CARD_HEIGHT = 202;
export const CONDITION_RECOMMENDATION_EMPTY_CARD_GAP = 10;
export const CONDITION_RECOMMENDATION_EMPTY_ICON_SIZE = 96;
export const CONDITION_RECOMMENDATION_EMPTY_DESCRIPTION_MAX_WIDTH = 276;

export const CONDITION_SCORE_BACKGROUND_SOURCES = {
  excellent: require('../../assets/images/condition/condition-100.png'),
  good: require('../../assets/images/condition/condition-80.png'),
  steady: require('../../assets/images/condition/condition-60.png'),
  low: require('../../assets/images/condition/condition-40.png'),
  critical: require('../../assets/images/condition/condition-20.png'),
} satisfies Record<ReturnType<typeof getConditionScoreTheme>['tone'], ImageSourcePropType>;
