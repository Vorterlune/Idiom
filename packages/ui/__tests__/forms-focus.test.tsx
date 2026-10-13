import { act, renderHook } from '@testing-library/react-native';
import { Keyboard, ScrollView, TextInput, View } from 'react-native';

import { useFocusedField } from '../src/forms/useFocusedField';

/** Supply native window geometry without reproducing the wrapper's scroll algorithm. */
function nativeGeometry({ fieldTop = 450, fieldHeight = 100, inputTop = 470 } = {}) {
  const viewport = new View({});
  viewport.measureInWindow = jest.fn((callback) => callback(0, 50, 360, 700));
  const container = new View({});
  container.measureInWindow = jest.fn((callback) => callback(0, fieldTop, 360, fieldHeight));
  const input = new TextInput({});
  input.measureInWindow = jest.fn((callback) => callback(16, inputTop, 328, 48));
  const scroll = new ScrollView({});
  scroll.scrollTo = jest.fn();
  return { viewport, container, input, scroll };
}

describe('focused form field visibility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Keyboard, 'metrics').mockReturnValue({
      screenX: 0,
      screenY: 400,
      width: 360,
      height: 400,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('moves an obscured field above the keyboard using the measured window coordinates', async () => {
    const native = nativeGeometry();
    const { result } = await renderHook(useFocusedField);
    result.current.viewportRef.current = native.viewport;
    result.current.scrollRef.current = native.scroll;
    await act(() => {
      result.current.focusField({ container: native.container, input: native.input });
      jest.runOnlyPendingTimers();
    });
    expect(native.scroll.scrollTo).toHaveBeenCalledTimes(1);
    expect(native.scroll.scrollTo).toHaveBeenCalledWith({ y: 162, animated: true });
  });

  it('keeps the input visible when long help or errors make its whole field taller than the viewport', async () => {
    const native = nativeGeometry({ fieldHeight: 700, inputTop: 470 });
    const { result } = await renderHook(useFocusedField);
    result.current.viewportRef.current = native.viewport;
    result.current.scrollRef.current = native.scroll;
    await act(() => {
      result.current.focusField({ container: native.container, input: native.input });
      jest.runOnlyPendingTimers();
    });
    // Only reveal the input rather than scrolling to the bottom of an oversized error block.
    expect(native.scroll.scrollTo).toHaveBeenCalledWith({ y: 130, animated: true });
  });

  it('does not move an already visible field', async () => {
    const native = nativeGeometry({ fieldTop: 100, fieldHeight: 120 });
    const { result } = await renderHook(useFocusedField);
    result.current.viewportRef.current = native.viewport;
    result.current.scrollRef.current = native.scroll;
    await act(() => {
      result.current.focusField({ container: native.container, input: native.input });
      jest.runOnlyPendingTimers();
    });
    expect(native.scroll.scrollTo).not.toHaveBeenCalled();
  });

  it('ignores delayed native measurements after the field has lost focus', async () => {
    const native = nativeGeometry();
    let measured: Parameters<View['measureInWindow']>[0] | undefined;
    native.container.measureInWindow = jest.fn((callback) => {
      measured = callback;
    });
    const { result } = await renderHook(useFocusedField);
    result.current.viewportRef.current = native.viewport;
    result.current.scrollRef.current = native.scroll;
    await act(() => {
      result.current.focusField({ container: native.container, input: native.input });
      jest.runOnlyPendingTimers();
      result.current.blurField(native.input);
      measured?.(0, 450, 360, 100);
    });
    expect(native.scroll.scrollTo).not.toHaveBeenCalled();
  });
});
