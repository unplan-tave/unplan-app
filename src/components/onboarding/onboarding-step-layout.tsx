import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomCTA } from '@/components/ui/BottomCTA';
import { HomeIndicator } from '@/components/ui/Footer';
import { HeaderProgress } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

interface OnboardingStepLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  note?: string;
  progress: number;
  ctaDisabled?: boolean;
  ctaCaption?: string | null;
  onConfirm: () => void;
}

export function OnboardingStepLayout({
  children,
  title,
  subtitle,
  note,
  progress,
  ctaDisabled = false,
  ctaCaption = t('common.skip'),
  onConfirm,
}: OnboardingStepLayoutProps) {
  const router = useRouter();

  return (
    <ScreenLayout
      backgroundColor={colors.onboardingBackground}
      header={
        <HeaderProgress progress={progress} onBackPress={router.back} style={styles.header} />
      }
      footer={
        <View style={styles.footer}>
          <BottomCTA
            label={t('common.confirm')}
            caption={ctaCaption}
            disabled={ctaDisabled}
            variant="primary"
            onPress={onConfirm}
          />
          <HomeIndicator />
        </View>
      }
      contentStyle={styles.content}
    >
      <View style={styles.head}>
        <Typography variant="titleL" align="center" color={colors.gray[900]} style={styles.title}>
          {title}
        </Typography>
        <Typography variant="bodyM" align="center" color={colors.gray[700]}>
          {subtitle}
        </Typography>
        {note ? (
          <Typography variant="bodyS" align="center" color={colors.secondary} style={styles.note}>
            {note}
          </Typography>
        ) : null}
      </View>
      {children}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing[3],
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing[5],
  },
  head: {
    width: '100%',
    alignItems: 'center',
    marginTop: 39,
    gap: spacing[1],
  },
  title: {
    minHeight: 68,
  },
  note: {
    marginTop: spacing[2],
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    gap: spacing[1],
  },
});
