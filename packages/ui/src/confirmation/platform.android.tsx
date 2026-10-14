import { AlertDialog, Host, Text, TextButton } from '@expo/ui/jetpack-compose';
import { testID as nativeTestID } from '@expo/ui/jetpack-compose/modifiers';
import { StyleSheet } from 'react-native';

import { useColors } from '../internal/colors';
import { useIdiomAppearance } from '../provider';
import type { NativeConfirmationDialogProps } from './native';

export function NativeConfirmationDialog({
  presented,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  testID,
  onConfirm,
  onCancel,
  onDismiss,
}: NativeConfirmationDialogProps) {
  const { colorScheme, accentColor } = useIdiomAppearance();
  const colors = useColors();
  if (!presented) return null;
  return (
    <Host
      style={styles.anchor}
      pointerEvents="none"
      colorScheme={colorScheme}
      {...(accentColor === undefined ? {} : { seedColor: accentColor })}
    >
      <AlertDialog
        onDismissRequest={onDismiss}
        {...(testID ? { modifiers: [nativeTestID(testID)] } : {})}
      >
        <AlertDialog.Title>
          <Text>{title}</Text>
        </AlertDialog.Title>
        {message ? (
          <AlertDialog.Text>
            <Text>{message}</Text>
          </AlertDialog.Text>
        ) : null}
        <AlertDialog.ConfirmButton>
          <TextButton
            onClick={onConfirm}
            {...(destructive ? { colors: { contentColor: colors.error } } : {})}
            {...(testID ? { modifiers: [nativeTestID(`${testID}.confirm`)] } : {})}
          >
            <Text>{confirmLabel}</Text>
          </TextButton>
        </AlertDialog.ConfirmButton>
        <AlertDialog.DismissButton>
          <TextButton
            onClick={onCancel}
            {...(testID ? { modifiers: [nativeTestID(`${testID}.cancel`)] } : {})}
          >
            <Text>{cancelLabel}</Text>
          </TextButton>
        </AlertDialog.DismissButton>
      </AlertDialog>
    </Host>
  );
}

const styles = StyleSheet.create({ anchor: { position: 'absolute', width: 1, height: 1 } });
