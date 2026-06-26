import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { HeaderBack } from '@/components/ui/Header';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

const TERMS_COPY = {
  service: {
    title: 'terms.service.title',
    body: 'terms.service.body',
  },
  privacy: {
    title: 'terms.privacy.title',
    body: 'terms.privacy.body',
  },
} as const;

type TermsType = keyof typeof TERMS_COPY;

function isTermsType(value: unknown): value is TermsType {
  return value === 'service' || value === 'privacy';
}

export function TermsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const termsType = isTermsType(type) ? type : 'service';
  const copy = TERMS_COPY[termsType];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <HeaderBack onPress={router.back} />
        <Typography variant="titleS" color={colors.gray[900]} align="center" style={styles.title}>
          {t(copy.title)}
        </Typography>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Typography variant="bodyS" color={colors.gray[700]}>
          {t(copy.body)}
        </Typography>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing[2],
  },
  title: {
    position: 'absolute',
    right: spacing[16],
    left: spacing[16],
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[12],
  },
});
