import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Header, HeaderBack } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useNicknameEdit } from './hooks/use-nickname-edit';

export function NicknameScreen() {
  const edit = useNicknameEdit();

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Header
          title={t('settings.nickname.title')}
          left={<HeaderBack accessibilityLabel={t('common.cancel')} onPress={edit.cancel} />}
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !edit.canSubmit }}
              disabled={!edit.canSubmit}
              hitSlop={spacing[2]}
              style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
              onPress={edit.submit}
            >
              <Typography
                variant="bodyM"
                color={edit.canSubmit ? colors.chip.selectedText : colors.gray[300]}
              >
                {edit.isSubmitting ? t('common.saving') : t('common.done')}
              </Typography>
            </Pressable>
          }
          style={styles.header}
        />
        <View style={styles.content}>
          <TextInput
            autoFocus
            accessibilityLabel={t('settings.nickname.inputLabel')}
            value={edit.nickname}
            placeholder={edit.placeholder}
            placeholderTextColor={colors.gray[400]}
            maxLength={edit.maxLength}
            returnKeyType="done"
            style={[styles.input, edit.errorMessage != null && styles.inputError]}
            onChangeText={edit.updateNickname}
            onSubmitEditing={edit.submit}
          />
          {edit.errorMessage ? (
            <Typography variant="bodyS" color={colors.secondary} accessibilityLiveRegion="polite">
              {edit.errorMessage}
            </Typography>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  keyboard: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing[4],
  },
  doneButton: {
    minWidth: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
  input: {
    width: '100%',
    height: 58,
    paddingHorizontal: spacing[4],
    borderRadius: radius.sm,
    backgroundColor: colors.gray.white,
    color: colors.gray[700],
    fontFamily: 'SUIT-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  pressed: {
    opacity: 0.72,
  },
});
