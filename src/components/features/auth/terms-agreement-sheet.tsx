import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

export type TermsAgreementType = 'service' | 'privacy';

interface TermsAgreementSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: TermsAgreementType) => void;
}

/** 로그인 전 약관 전문을 선택해 열 수 있는 바텀시트입니다. */
export function TermsAgreementSheet({ visible, onClose, onSelect }: TermsAgreementSheetProps) {
  return (
    <BottomSheet visible={visible} contentStyle={styles.content} onClose={onClose}>
      <View style={styles.buttonList}>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => onSelect('service')}
        >
          <Typography variant="bodyM" color={colors.gray[800]}>
            {t('terms.service.title')}
          </Typography>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => onSelect('privacy')}
        >
          <Typography variant="bodyM" color={colors.gray[800]}>
            {t('terms.privacy.title')}
          </Typography>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[4],
    paddingBottom: spacing[15],
  },
  buttonList: {
    gap: spacing[2],
  },
  button: {
    height: spacing[10],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray.white,
    borderRadius: radius.xl,
    backgroundColor: colors.alpha.white50,
  },
});
