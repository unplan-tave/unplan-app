import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';

const LOCATION_TEXT_MAX_LENGTH = 200;

interface LocationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
}

export function LocationSheet({ visible, onClose, onSelect }: LocationBottomSheetProps) {
  const searchInputRef = useRef<TextInput>(null);
  const [location, setLocation] = useState('');
  const canDone = location.trim().length > 0;

  const handleSheetShow = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!visible) {
      setLocation('');
    }
  }, [visible]);

  const handleDone = () => {
    if (!canDone) {
      return;
    }

    onSelect(location.trim());
  };

  return (
    <BottomSheet
      visible={visible}
      avoidKeyboard
      contentStyle={styles.sheet}
      onClose={onClose}
      onShow={handleSheetShow}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="위치 선택 취소"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Typography variant="bodyM" color={colors.primary}>
            취소
          </Typography>
        </Pressable>
        <Typography
          pointerEvents="none"
          variant="bodyM"
          color={colors.gray[900]}
          align="center"
          style={styles.headerTitle}
        >
          위치
        </Typography>
        <Pressable
          accessibilityLabel="위치 선택 완료"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canDone }}
          disabled={!canDone}
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={handleDone}
        >
          <Typography variant="bodyM" color={canDone ? colors.primary : colors.gray[400]}>
            완료
          </Typography>
        </Pressable>
      </View>

      <View style={styles.card}>
        <TextInput
          ref={searchInputRef}
          accessibilityLabel="위치 입력"
          value={location}
          placeholder="위치를 입력해주세요"
          placeholderTextColor={colors.gray[400]}
          returnKeyType="done"
          maxLength={LOCATION_TEXT_MAX_LENGTH}
          autoCorrect={false}
          style={styles.locationInput}
          onChangeText={setLocation}
          onSubmitEditing={handleDone}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[15],
  },
  header: {
    width: '100%',
    maxWidth: 369,
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
  },
  headerAction: {
    zIndex: 2,
    minWidth: 33,
    minHeight: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  card: {
    width: '100%',
    padding: spacing[3],
    borderRadius: radius.panel,
    backgroundColor: colors.alpha.white50,
  },
  locationInput: {
    ...typography.bodyS,
    width: '100%',
    maxWidth: 329,
    height: spacing[10],
    alignSelf: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white50,
    color: colors.gray[800],
  },
  pressed: {
    opacity: 0.72,
  },
});
