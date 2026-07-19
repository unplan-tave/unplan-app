import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import type { SocialProvider } from '@/domains/auth/model';

type SocialLoginButtonProvider = SocialProvider | 'apple';

interface SocialLoginButtonProps {
  label: string;
  provider: SocialLoginButtonProvider;
  disabled?: boolean;
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

const socialLoginIcons = {
  google: require('../../../../assets/images/auth/google-login.png'),
  kakao: require('../../../../assets/images/auth/kakao-login.png'),
} as const;

export function SocialLoginButton({
  label,
  provider,
  disabled = false,
  onPress,
}: SocialLoginButtonProps) {
  const theme = providerStyles[provider];
  const iconSource = provider === 'apple' ? null : socialLoginIcons[provider];

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundColor, borderColor: theme.borderColor },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        {iconSource ? (
          <Image
            source={iconSource}
            resizeMode="contain"
            style={provider === 'google' ? styles.googleIcon : styles.kakaoIcon}
          />
        ) : (
          <Typography variant="bodyS" color={theme.color} align="center" style={styles.appleIcon}>
            {theme.icon}
          </Typography>
        )}
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
  googleIcon: {
    width: 20,
    height: 20,
  },
  kakaoIcon: {
    width: 18,
    height: 18,
  },
  label: {
    minWidth: 155,
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.5,
  },
});
