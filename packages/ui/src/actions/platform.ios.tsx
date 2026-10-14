import { Button, ConfirmationDialog, Host, Text } from '@expo/ui/swift-ui';
import { accessibilityHidden, disabled, frame, opacity } from '@expo/ui/swift-ui/modifiers';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { useIdiomAppearance } from '../provider';
import type { NativeActionSheetProps } from './native';

type Anchor = { left: number; top: number; width: number; height: number };

export function NativeActionSheet({
  presented,
  anchorRef,
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
  const { width, height } = useWindowDimensions();
  const originRef = useRef<View>(null);
  const request = useRef({ generation: 0 });
  const pendingFrame = useRef<number | null>(null);
  const warned = useRef(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const nativePresented = presented && anchor !== null;
  const visible = useRef(nativePresented);
  useLayoutEffect(() => {
    visible.current = nativePresented;
  }, [nativePresented]);

  const measure = useCallback(() => {
    const generation = ++request.current.generation;
    if (pendingFrame.current !== null) cancelAnimationFrame(pendingFrame.current);
    if (!presented) return;
    pendingFrame.current = requestAnimationFrame(() => {
      pendingFrame.current = null;
      const trigger = anchorRef.current;
      const origin = originRef.current;
      const valid = () =>
        generation === request.current.generation && trigger === anchorRef.current;
      const unavailable = () => {
        if (!valid()) return;
        setAnchor(null);
        if (__DEV__ && !warned.current) {
          warned.current = true;
          console.warn(
            `[Idiom] ActionSheet "${title}": anchorRef must reference a mounted, measurable RN trigger.`,
          );
        }
      };
      if (!trigger || !origin) {
        unavailable();
        return;
      }
      origin.measureInWindow((originX, originY, originWidth, originHeight) => {
        if (!valid()) return;
        trigger.measureInWindow((x, y, triggerWidth, triggerHeight) => {
          if (!valid()) return;
          if (
            ![originX, originY, x, y, originWidth, originHeight, triggerWidth, triggerHeight].every(
              Number.isFinite,
            ) ||
            originWidth <= 0 ||
            originHeight <= 0 ||
            triggerWidth <= 0 ||
            triggerHeight <= 0
          ) {
            unavailable();
            return;
          }
          setAnchor({
            left: x - originX,
            top: y - originY,
            width: triggerWidth,
            height: triggerHeight,
          });
        });
      });
    });
  }, [anchorRef, presented, title]);

  useLayoutEffect(() => {
    const sequence = request.current;
    measure();
    return () => {
      sequence.generation++;
      if (pendingFrame.current !== null) cancelAnimationFrame(pendingFrame.current);
      pendingFrame.current = null;
    };
  }, [measure, width, height]);

  return (
    <View
      ref={originRef}
      collapsable={false}
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      onLayout={measure}
      testID={testID ? `${testID}.anchor-container` : undefined}
    >
      {anchor && (
        <Host
          style={[styles.anchor, anchor]}
          pointerEvents="none"
          ignoreSafeArea="all"
          colorScheme={colorScheme}
          {...(accentColor === undefined ? {} : { seedColor: accentColor })}
        >
          <ConfirmationDialog
            title={title}
            titleVisibility="visible"
            isPresented={nativePresented}
            onIsPresentedChange={(next) => {
              if (!next && visible.current) onDismiss();
            }}
            {...(testID ? { testID } : {})}
          >
            <ConfirmationDialog.Trigger>
              <Text
                modifiers={[
                  frame({ width: anchor.width, height: anchor.height }),
                  opacity(0),
                  accessibilityHidden(),
                ]}
              >
                {' '}
              </Text>
            </ConfirmationDialog.Trigger>
            <ConfirmationDialog.Actions>
              {actions.map((action) => (
                <Button
                  key={action.id}
                  label={action.label}
                  role={action.destructive ? 'destructive' : 'default'}
                  modifiers={[disabled(Boolean(action.disabled))]}
                  onPress={() => onSelect(action.id)}
                  {...(testID ? { testID: `${testID}.action.${action.id}` } : {})}
                />
              ))}
              <Button
                label={cancelLabel}
                role="cancel"
                onPress={onCancel}
                {...(testID ? { testID: `${testID}.cancel` } : {})}
              />
            </ConfirmationDialog.Actions>
            {message ? (
              <ConfirmationDialog.Message>
                <Text>{message}</Text>
              </ConfirmationDialog.Message>
            ) : null}
          </ConfirmationDialog>
        </Host>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ anchor: { position: 'absolute' } });
