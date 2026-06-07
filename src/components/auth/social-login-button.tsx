import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

type SocialProvider = 'apple' | 'google' | 'kakao';

interface SocialLoginButtonProps {
  label: string;
  provider: SocialProvider;
  onPress: () => void;
}

const providerStyles = {
  apple: {
    backgroundColor: '#000000',
    borderColor: '#000000',
    color: colors.gray.white,
    icon: 'Apple',
  },
  google: {
    backgroundColor: colors.gray.white,
    borderColor: '#747775',
    color: '#1F1F1F',
    icon: 'G',
  },
  kakao: {
    backgroundColor: '#FEE500',
    borderColor: '#FEE500',
    color: '#191919',
    icon: '●',
  },
} as const;

export function SocialLoginButton({ label, provider, onPress }: SocialLoginButtonProps) {
  const theme = providerStyles[provider];

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundColor, borderColor: theme.borderColor },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        <Typography
          variant={provider === 'apple' ? 'bodyS' : 'titleS'}
          color={provider === 'google' ? '#4285F4' : theme.color}
          align="center"
          style={provider === 'apple' ? styles.appleIcon : undefined}
        >
          {theme.icon}
        </Typography>
      </View>
      <Typography variant="titleM" color={theme.color} align="center" style={styles.label}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  iconBox: {
    width: 40,
    alignItems: 'center',
  },
  appleIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    minWidth: 155,
  },
  pressed: {
    opacity: 0.72,
  },
});
