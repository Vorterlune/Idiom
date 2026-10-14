import { Alert, Button, Host, Text } from '@expo/ui/swift-ui';
import { accessibilityHidden, frame, opacity } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet } from 'react-native';

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
  return (
    <Host
      style={styles.anchor}
      pointerEvents="none"
      ignoreSafeArea="all"
      colorScheme={colorScheme}
      {...(accentColor === undefined ? {} : { seedColor: accentColor })}
    >
      <Alert
        title={title}
        isPresented={presented}
        onIsPresentedChange={(visible) => {
          if (!visible) onDismiss();
        }}
        {...(testID ? { testID } : {})}
      >
        <Alert.Trigger>
          <Text modifiers={[frame({ width: 1, height: 1 }), opacity(0), accessibilityHidden()]}>
            {' '}
          </Text>
        </Alert.Trigger>
        <Alert.Actions>
          <Button
            label={cancelLabel}
            role="cancel"
            onPress={onCancel}
            {...(testID ? { testID: `${testID}.cancel` } : {})}
          />
          <Button
            label={confirmLabel}
            role={destructive ? 'destructive' : 'default'}
            onPress={onConfirm}
            {...(testID ? { testID: `${testID}.confirm` } : {})}
          />
        </Alert.Actions>
        {message ? (
          <Alert.Message>
            <Text>{message}</Text>
          </Alert.Message>
        ) : null}
      </Alert>
    </Host>
  );
}

const styles = StyleSheet.create({ anchor: { position: 'absolute', width: 1, height: 1 } });
