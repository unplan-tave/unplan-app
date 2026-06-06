import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import {
  type ActionTextFieldProps,
  type EditableTextFieldProps,
  type TextFieldProps,
} from './textField.types';

const DEFAULT_WIDTH = 263;

export function TextField(props: TextFieldProps) {
  const variant = props.variant ?? 'short';

  if (variant === 'short' || variant === 'long') {
    const {
      width = DEFAULT_WIDTH,
      disabled = false,
      style,
      textStyle,
      placeholderTextColor,
      variant: excludedVariant,
      ...inputProps
    } = props as EditableTextFieldProps;
    void excludedVariant;

    return (
      <View style={[styles.container, variant === 'long' && styles.long, { width }, style]}>
        <TextInput
          editable={!disabled}
          placeholderTextColor={placeholderTextColor ?? colors.gray[300]}
          style={[styles.input, disabled && styles.disabledText, textStyle]}
          numberOfLines={variant === 'short' ? 1 : undefined}
          {...inputProps}
        />
      </View>
    );
  }

  const {
    width = DEFAULT_WIDTH,
    disabled = false,
    style,
    textStyle,
    label,
    rightLabel,
    onPress,
    accessibilityLabel,
    variant: excludedVariant,
    ...pressableProps
  } = props as ActionTextFieldProps;
  void excludedVariant;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        variant === 'add' && styles.add,
        { width },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      {renderDisplayContent(variant, label, rightLabel, disabled, textStyle)}
    </Pressable>
  );
}

function renderDisplayContent(
  variant: TextFieldProps['variant'],
  label: string | undefined,
  rightLabel: string | undefined,
  disabled: boolean,
  textStyle: TextFieldProps['textStyle'],
) {
  const textColor = disabled ? colors.gray[300] : colors.gray[600];

  if (variant === 'add') {
    return <Icon name="plus" size={20} color={colors.gray[600]} disabled={disabled} />;
  }

  if (variant === 'reminder') {
    return (
      <>
        <Typography
          variant="bodyM"
          color={textColor}
          numberOfLines={1}
          style={[styles.displayText, textStyle]}
        >
          {label ?? '시작 n분 전'}
        </Typography>
        <View style={styles.verticalDivider} />
        <Icon name="bell" size={20} color={textColor} disabled={disabled} />
      </>
    );
  }

  return (
    <>
      <Typography
        variant="bodyM"
        color={textColor}
        numberOfLines={1}
        style={[styles.displayText, textStyle]}
      >
        {label}
      </Typography>
      {rightLabel ? (
        <>
          <View style={styles.verticalDivider} />
          <Typography variant="bodyM" color={textColor} numberOfLines={1} style={textStyle}>
            {rightLabel}
          </Typography>
        </>
      ) : null}
      <Icon name="chevronDown" size={20} color={textColor} disabled={disabled} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.gray[200],
  },
  long: {
    minHeight: 49.6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  add: {
    height: 42,
    justifyContent: 'center',
    opacity: 0.5,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    color: colors.gray[600],
    fontFamily: 'SUIT-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 25.6,
    letterSpacing: -0.32,
    includeFontPadding: false,
  },
  displayText: {
    flex: 1,
    minWidth: 0,
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.gray[400],
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.gray[300],
  },
  pressed: {
    opacity: 0.72,
  },
});
