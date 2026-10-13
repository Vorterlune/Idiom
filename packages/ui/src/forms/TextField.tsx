import { RNHostView } from '@expo/ui';
import { useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useColors } from '../internal/colors';
import type { FormTextFieldProps } from '../types';
import { InFormSection, useFormContext } from './context';
import { ErrorMessage } from './ErrorMessage';
import { FormHost } from './Host';

export function FormTextField({
  ref,
  label,
  value,
  onChangeText,
  kind = 'text',
  description,
  error,
  placeholder,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  onBlur,
  onSubmitEditing,
  returnKeyType = 'done',
}: FormTextFieldProps) {
  const form = useFormContext();
  const inSection = useContext(InFormSection);
  const colors = useColors();
  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);
  const isDisabled = disabled || form.submitting;
  const hint = [description, accessibilityHint, error ? `Error: ${error}` : undefined]
    .filter(Boolean)
    .join('. ');
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        if (!isDisabled) inputRef.current?.focus();
      },
      blur: () => inputRef.current?.blur(),
    }),
    [isDisabled],
  );
  const { blurField } = form;
  useEffect(() => {
    const input = inputRef.current;
    return () => blurField(input);
  }, [blurField]);
  const content = (
    <RNHostView matchContents={{ vertical: true }}>
      <View
        ref={containerRef}
        collapsable={false}
        accessible={false}
        onLayout={form.revealFocusedField}
        style={[
          styles.field,
          {
            backgroundColor: inSection ? 'transparent' : colors.surface,
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
      >
        <Text accessible={false} style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(text) => {
            if (!isDisabled && text !== value) onChangeText(text);
          }}
          editable={!isDisabled}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: isDisabled }}
          {...(hint ? { accessibilityHint: hint } : {})}
          {...(placeholder === undefined ? {} : { placeholder })}
          placeholderTextColor={colors.secondary}
          selectionColor={colors.accent}
          keyboardType={kind === 'email' ? 'email-address' : 'default'}
          autoCapitalize={kind === 'email' ? 'none' : kind === 'name' ? 'words' : 'sentences'}
          autoCorrect={kind === 'text'}
          autoComplete={kind === 'email' ? 'email' : kind === 'name' ? 'name' : 'off'}
          returnKeyType={returnKeyType}
          submitBehavior="submit"
          onFocus={() => {
            if (inputRef.current && containerRef.current)
              form.focusField({ input: inputRef.current, container: containerRef.current });
          }}
          onBlur={() => {
            form.blurField(inputRef.current);
            onBlur?.();
          }}
          onSubmitEditing={() => {
            if (isDisabled) return;
            if (onSubmitEditing) onSubmitEditing();
            else if (returnKeyType === 'done') form.requestSubmit();
          }}
          style={[
            styles.input,
            { color: colors.text, borderColor: error ? colors.error : colors.separator },
          ]}
          {...(testID ? { testID } : {})}
        />
        {description ? (
          <Text style={[styles.description, { color: colors.secondary }]}>{description}</Text>
        ) : null}
        <ErrorMessage error={error} {...(testID ? { testID: `${testID}.error` } : {})} />
      </View>
    </RNHostView>
  );
  return inSection ? content : <FormHost>{content}</FormHost>;
}

const styles = StyleSheet.create({
  field: { width: '100%', padding: 16, gap: 6 },
  label: { fontSize: 17, fontWeight: '500' },
  input: {
    minHeight: 48,
    fontSize: 17,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  description: { fontSize: 15 },
});
