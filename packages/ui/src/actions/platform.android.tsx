import {
  Column,
  Host,
  ModalBottomSheet,
  Text,
  TextButton,
  type ModalBottomSheetRef,
} from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  padding,
  testID as nativeTestID,
  verticalScroll,
} from '@expo/ui/jetpack-compose/modifiers';
import { useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useColors } from '../internal/colors';
import { useIdiomAppearance } from '../provider';
import type { NativeActionSheetProps } from './native';

export function NativeActionSheet({
  presented,
  title,
  message,
  actions,
  cancelLabel = 'Cancel',
  testID,
  onSelect,
  onCancel,
  onDismiss,
}: NativeActionSheetProps) {
  const { colorScheme, accentColor } = useIdiomAppearance();
  const colors = useColors();
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const [mounted, setMounted] = useState(presented);
  if (presented && !mounted) setMounted(true);

  useLayoutEffect(() => {
    if (presented || !mounted) return;
    let cancelled = false;
    const finish = () => {
      if (!cancelled) setMounted(false);
    };
    const hiding = sheetRef.current?.hide();
    if (hiding)
      hiding.then(finish, (error: unknown) => {
        if (__DEV__ && !cancelled) console.warn('[Idiom] ActionSheet: native hide failed.', error);
        finish();
      });
    else finish();
    return () => {
      cancelled = true;
    };
  }, [presented, mounted]);

  if (!mounted) return null;
  return (
    <Host
      style={styles.anchor}
      pointerEvents="none"
      colorScheme={colorScheme}
      {...(accentColor === undefined ? {} : { seedColor: accentColor })}
    >
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={onDismiss}
        properties={{ shouldDismissOnBackPress: true, shouldDismissOnClickOutside: true }}
      >
        <Column
          modifiers={[
            fillMaxWidth(),
            verticalScroll(),
            padding(16, 0, 16, 16),
            ...(testID ? [nativeTestID(testID)] : []),
          ]}
        >
          <Text style={{ typography: 'titleLarge' }}>{title}</Text>
          {message ? <Text color={colors.secondary}>{message}</Text> : null}
          {actions.map((action) => (
            <TextButton
              key={action.id}
              enabled={presented && !action.disabled}
              onClick={() => onSelect(action.id)}
              {...(action.destructive ? { colors: { contentColor: colors.error } } : {})}
              modifiers={[
                fillMaxWidth(),
                ...(testID ? [nativeTestID(`${testID}.action.${action.id}`)] : []),
              ]}
            >
              <Text>{action.label}</Text>
            </TextButton>
          ))}
          <TextButton
            enabled={presented}
            onClick={onCancel}
            modifiers={[fillMaxWidth(), ...(testID ? [nativeTestID(`${testID}.cancel`)] : [])]}
          >
            <Text>{cancelLabel}</Text>
          </TextButton>
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}

const styles = StyleSheet.create({ anchor: { position: 'absolute', width: 1, height: 1 } });
