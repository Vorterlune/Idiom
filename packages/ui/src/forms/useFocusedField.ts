import { useCallback, useEffect, useRef } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  type TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { FocusedField } from './context';

/** Keep the native input visible across the separate Yoga roots inside RNHostView. */
export function useFocusedField() {
  const scrollRef = useRef<ScrollView>(null);
  const viewportRef = useRef<View>(null);
  const focused = useRef<FocusedField | null>(null);
  const scrollOffset = useRef(0);
  const keyboardTop = useRef<number | undefined>(Keyboard.metrics()?.screenY);
  const pendingFrame = useRef<number | null>(null);
  const generation = useRef(0);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  }, []);

  const cancelMeasurements = useCallback(() => {
    generation.current++;
    if (pendingFrame.current !== null) cancelAnimationFrame(pendingFrame.current);
  }, []);

  const revealFocusedField = useCallback(() => {
    const request = ++generation.current;
    if (pendingFrame.current !== null) cancelAnimationFrame(pendingFrame.current);
    pendingFrame.current = requestAnimationFrame(() => {
      pendingFrame.current = null;
      const field = focused.current;
      const viewport = viewportRef.current;
      if (!field || !viewport) return;
      viewport.measureInWindow((_x, viewportTop, _width, viewportHeight) => {
        const visibleTop = viewportTop + 12;
        const visibleBottom =
          Math.min(viewportTop + viewportHeight, keyboardTop.current ?? Infinity) - 12;
        if (visibleBottom <= visibleTop) return;
        const reveal = (top: number, height: number) => {
          if (request !== generation.current || field !== focused.current || !scrollRef.current)
            return;
          const delta =
            top + height > visibleBottom
              ? top + height - visibleBottom
              : top < visibleTop
                ? top - visibleTop
                : 0;
          if (Math.abs(delta) > 1) {
            scrollRef.current.scrollTo({
              y: Math.max(0, scrollOffset.current + delta),
              animated: true,
            });
          }
        };
        field.container.measureInWindow((_fieldX, top, _fieldWidth, height) => {
          if (height <= visibleBottom - visibleTop) reveal(top, height);
          else
            field.input.measureInWindow((_inputX, inputTop, _inputWidth, inputHeight) =>
              reveal(inputTop, inputHeight),
            );
        });
      });
    });
  }, []);

  const focusField = useCallback(
    (field: FocusedField) => {
      focused.current = field;
      revealFocusedField();
    },
    [revealFocusedField],
  );

  const blurField = useCallback((input: TextInput | null) => {
    if (focused.current?.input === input) {
      focused.current = null;
      generation.current++;
    }
  }, []);

  useEffect(() => {
    const updateKeyboard = (event: import('react-native').KeyboardEvent) => {
      keyboardTop.current = event.endCoordinates.screenY;
      revealFocusedField();
    };
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow',
      updateKeyboard,
    );
    // Automatic iOS keyboard insets also move the native scroll offset. Recheck
    // against the settled viewport after that adjustment has completed.
    const settled =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardDidChangeFrame', updateKeyboard)
        : undefined;
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTop.current = undefined;
      revealFocusedField();
    });
    return () => {
      show.remove();
      settled?.remove();
      hide.remove();
      cancelMeasurements();
    };
  }, [revealFocusedField, cancelMeasurements]);

  return { scrollRef, viewportRef, onScroll, focusField, blurField, revealFocusedField };
}
