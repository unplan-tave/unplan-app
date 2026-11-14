import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Path } from 'react-native-svg';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

const starters = [
  {
    icon: 'condition',
    title: '나에게 맞는 시간',
    detail: '공부할 여유를 찾아볼까요?',
    prompt: '내일 공부 1시간 언제 하면 좋아?',
  },
  {
    icon: 'plus',
    title: '말로 일정 추가',
    detail: '떠오른 계획을 가볍게 남겨요',
    prompt: '내일 오후 3시부터 4시까지 팀 회의 추가해줘',
  },
  {
    icon: 'list',
    title: '하루 일정 살펴보기',
    detail: '내일의 흐름을 한눈에',
    prompt: '내일 일정 보여줘',
  },
] as const;

export function AssistantMark({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.mark, small && styles.smallMark]}>
      <Svg width={small ? 18 : 34} height={small ? 18 : 34} viewBox="0 0 32 32">
        <Path
          d="M16 2C17.8 11.2 20.8 14.2 30 16C20.8 17.8 17.8 20.8 16 30C14.2 20.8 11.2 17.8 2 16C11.2 14.2 14.2 11.2 16 2Z"
          fill={colors.primary}
        />
      </Svg>
    </View>
  );
}

export function ChatWelcome({ onChoose }: { onChoose: (text: string) => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <RadialGradient id="chatWelcomeGlow">
              <Stop offset="0" stopColor={colors.conditionGraph.edge} stopOpacity={0.8} />
              <Stop offset="1" stopColor={colors.onboardingMutedBackground} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="44%" r="125" fill="url(#chatWelcomeGlow)" />
        </Svg>
        <AssistantMark />
        <Typography variant="caption" color={colors.primary} style={styles.eyebrow}>
          UNPLAN ASSISTANT
        </Typography>
        <Typography variant="titleL" align="center">
          조금 더 여유로운 하루,{'\n'}함께 만들어볼까요?
        </Typography>
        <Typography variant="bodyS" color={colors.text.secondary} align="center">
          일정 정리부터 나에게 맞는 시간까지.{'\n'}하고 싶은 일을 편하게 이야기해 주세요.
        </Typography>
      </View>
      <View style={styles.starters}>
        {starters.map((item) => (
          <Card
            key={item.title}
            onPress={() => onChoose(item.prompt)}
            style={styles.starter}
            accessibilityLabel={`${item.title}: ${item.prompt}`}
          >
            <View style={styles.icon}>
              <Icon name={item.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.copy}>
              <Typography variant="bodyM">{item.title}</Typography>
              <Typography variant="caption" color={colors.text.secondary}>
                {item.detail}
              </Typography>
            </View>
            <Icon name="arrowRight" size={18} color={colors.gray[400]} />
          </Card>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[6], paddingBottom: spacing[4] },
  hero: {
    alignItems: 'center',
    gap: spacing[3],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: radius.sheet,
    backgroundColor: colors.alpha.white80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: spacing.px,
    borderColor: colors.gray.white,
  },
  smallMark: { width: 30, height: 30, borderRadius: radius.full },
  eyebrow: { letterSpacing: 2 },
  starters: { gap: spacing[2] },
  starter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius['2xl'],
    borderColor: colors.alpha.white80,
    backgroundColor: colors.alpha.white80,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.panel,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.appIconBackground,
  },
  copy: { flex: 1, gap: spacing[1] },
});
