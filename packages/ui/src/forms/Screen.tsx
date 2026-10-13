import { Button } from '@expo/ui';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '../internal/colors';
import type { FormScreenProps } from '../types';
import { FormContext } from './context';
import { ErrorMessage } from './ErrorMessage';
import { FormHost } from './Host';
import { useFocusedField } from './useFocusedField';

export function FormScreen({
  children,
  title,
  submitLabel,
  onSubmit,
  safeAreaEdges = ['top', 'right', 'bottom', 'left'],
  submitting = false,
  submitDisabled = false,
  error,
  testID,
}: FormScreenProps) {
  useSafeAreaInsets();
  const colors = useColors();
  const { scrollRef, viewportRef, onScroll, focusField, blurField, revealFocusedField } =
    useFocusedField();
  const requestSubmit = useCallback(() => {
    if (submitting || submitDisabled) return;
    Keyboard.dismiss();
    onSubmit();
  }, [onSubmit, submitting, submitDisabled]);
  const context = useMemo(
    () => ({ submitting, requestSubmit, focusField, blurField, revealFocusedField }),
    [submitting, requestSubmit, focusField, blurField, revealFocusedField],
  );
  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[styles.screen, { backgroundColor: colors.background }]}
      {...(testID ? { testID } : {})}
    >
      <FormContext value={context}>
        <View
          ref={viewportRef}
          collapsable={false}
          style={styles.viewport}
          onLayout={revealFocusedField}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.content}
            contentInsetAdjustmentBehavior="never"
            automaticallyAdjustContentInsets={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            scrollEventThrottle={16}
            onScroll={onScroll}
            onContentSizeChange={revealFocusedField}
          >
            {title ? (
              <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
            ) : null}
            {children}
            <View style={styles.actions}>
              <ErrorMessage error={error} {...(testID ? { testID: `${testID}.error` } : {})} />
              <FormHost>
                <Button
                  label={submitLabel}
                  disabled={submitting || submitDisabled}
                  onPress={requestSubmit}
                  {...(testID ? { testID: `${testID}.submit` } : {})}
                />
              </FormHost>
              {submitting ? (
                <ActivityIndicator
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityLabel={submitLabel}
                  accessibilityState={{ busy: true }}
                  color={colors.accent}
                  {...(testID ? { testID: `${testID}.pending` } : {})}
                />
              ) : null}
            </View>
          </ScrollView>
        </View>
      </FormContext>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  viewport: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 24, paddingBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#000' },
  actions: { gap: 12 },
});
