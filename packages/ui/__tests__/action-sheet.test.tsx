import * as Compose from '@expo/ui/jetpack-compose';
import * as SwiftUI from '@expo/ui/swift-ui';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Dimensions, Platform, View } from 'react-native';

import { ActionSheet, IdiomProvider, type ActionSheetProps } from '../src';

type Measure = Parameters<View['measureInWindow']>[0];
function nativeView(x = 80, y = 150, width = 140, height = 48) {
  const view = new View({});
  view.measureInWindow = jest.fn((callback) => callback(x, y, width, height));
  return view;
}

function props(): ActionSheetProps {
  return {
    open: true,
    title: 'Profile actions',
    message: 'Choose an action.',
    anchorRef: { current: nativeView() },
    onOpenChange: jest.fn(),
    testID: 'sheet',
    actions: [
      { id: 'edit', label: 'Edit profile', onPress: jest.fn() },
      { id: 'delete', label: 'Delete draft', destructive: true, onPress: jest.fn() },
      { id: 'disabled', label: 'Unavailable', disabled: true, onPress: jest.fn() },
    ],
  };
}

/** Inject native geometry at the RN view ref, rather than mocking positioning logic. */
async function settleAnchor(origin = nativeView(20, 40, 400, 800)) {
  if (Platform.OS !== 'ios') return;
  const container = screen.getByTestId('sheet.anchor-container');
  jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(origin.measureInWindow);
  await act(() => {
    container.props.onLayout();
    jest.runOnlyPendingTimers();
  });
}

function dismissal() {
  if (Platform.OS === 'ios') {
    const native = screen.getByTestId('sheet');
    return () => native.props.onIsPresentedChange(false);
  }
  const native = jest.mocked(Compose.ModalBottomSheet).mock.calls.at(-1)![0];
  return () => native.onDismissRequest();
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Compose, 'ModalBottomSheet');
  jest.spyOn(Compose, 'Host');
  jest.spyOn(SwiftUI, 'Host');
  const dialog = SwiftUI.ConfirmationDialog;
  Object.assign(jest.spyOn(SwiftUI, 'ConfirmationDialog'), {
    Trigger: dialog.Trigger,
    Actions: dialog.Actions,
    Message: dialog.Message,
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('ActionSheet controlled choices', () => {
  it('supports a custom cancellation label without a message', async () => {
    await render(<ActionSheet {...props()} message="" cancelLabel="Keep profile" />);
    await settleAnchor();
    expect(screen.queryByText('Choose an action.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Keep profile' })).toBeOnTheScreen();
  });
  it('presents text actions, message, defaults, and disabled state', async () => {
    await render(<ActionSheet {...props()} />);
    await settleAnchor();
    expect(screen.getByText('Profile actions')).toBeOnTheScreen();
    expect(screen.getByText('Choose an action.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
    const destructive = screen.getByTestId('sheet.action.delete');
    if (Platform.OS === 'ios') expect(destructive.props.nativeRole).toBe('destructive');
    else expect(destructive.props.colors.contentColor).toBe('#b3261e');
  });

  it('closes before invoking one action, despite duplicate selections and dismissal', async () => {
    const calls: string[] = [];
    const base = props();
    base.onOpenChange = jest.fn(() => calls.push('close'));
    base.actions[0]!.onPress = jest.fn(() => calls.push('edit'));
    await render(<ActionSheet {...base} />);
    await settleAnchor();
    const select = screen.getByTestId('sheet.action.edit').props.onPress;
    const dismiss = dismissal();
    await act(() => {
      dismiss();
      select();
      select();
      dismiss();
      jest.runOnlyPendingTimers();
    });
    expect(calls).toEqual(['close', 'edit']);
    expect(base.onOpenChange).toHaveBeenCalledWith(false);
    expect(base.actions[1]!.onPress).not.toHaveBeenCalled();
  });

  it('does not resolve disabled actions, including a stale event after an action becomes disabled', async () => {
    const base = props();
    const result = await render(<ActionSheet {...base} />);
    await settleAnchor();
    await act(() => screen.getByTestId('sheet.action.disabled').props.onPress());
    const edit = screen.getByTestId('sheet.action.edit').props.onPress;
    await result.rerender(
      <ActionSheet {...base} actions={base.actions.map((item) => ({ ...item, disabled: true }))} />,
    );
    await act(edit);
    expect(base.onOpenChange).not.toHaveBeenCalled();
    base.actions.forEach((item) => expect(item.onPress).not.toHaveBeenCalled());
  });

  it.each(['cancel', 'dismiss'])('handles %s once without invoking an action', async (kind) => {
    const base = props();
    await render(<ActionSheet {...base} />);
    await settleAnchor();
    const cancel = screen.getByTestId('sheet.cancel').props.onPress;
    const dismiss = dismissal();
    const select = screen.getByTestId('sheet.action.edit').props.onPress;
    await act(() => {
      if (kind === 'cancel') cancel();
      dismiss();
      dismiss();
      jest.runOnlyPendingTimers();
      select();
    });
    expect(base.onOpenChange).toHaveBeenCalledTimes(1);
    base.actions.forEach((item) => expect(item.onPress).not.toHaveBeenCalled());
  });

  it('uses the latest handler for a stable action ID and ignores a removed action', async () => {
    const base = props();
    const result = await render(<ActionSheet {...base} />);
    await settleAnchor();
    const edit = screen.getByTestId('sheet.action.edit').props.onPress;
    const removed = screen.getByTestId('sheet.action.delete').props.onPress;
    const onPress = jest.fn();
    await result.rerender(
      <ActionSheet
        {...base}
        actions={[{ ...base.actions[0]!, label: 'Updated label', onPress }]}
      />,
    );
    await act(removed);
    expect(base.onOpenChange).not.toHaveBeenCalled();
    await act(edit);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(base.actions[0]!.onPress).not.toHaveBeenCalled();
  });

  it('stays resolved until false-to-true reopening, then ignores old presentation callbacks', async () => {
    const base = props();
    const result = await render(<ActionSheet {...base} />);
    await settleAnchor();
    const stale = screen.getByTestId('sheet.action.edit').props.onPress;
    const staleDismiss = dismissal();
    await fireEvent.press(screen.getByTestId('sheet.cancel'));
    await result.rerender(<ActionSheet {...base} message="Unrelated update" />);
    expect(screen.queryByTestId('sheet.action.edit')).toBeNull();
    await result.rerender(<ActionSheet {...base} open={false} />);
    await result.rerender(<ActionSheet {...base} />);
    await settleAnchor();
    await act(() => {
      stale();
      staleDismiss();
      jest.runOnlyPendingTimers();
    });
    expect(base.onOpenChange).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByTestId('sheet.action.edit'));
    expect(base.onOpenChange).toHaveBeenCalledTimes(2);
    expect(base.actions[0]!.onPress).toHaveBeenCalledTimes(1);
  });

  it.each(['close', 'unmount'])(
    'ignores pending dismissal and selection after external %s',
    async (kind) => {
      const base = props();
      const result = await render(<ActionSheet {...base} />);
      await settleAnchor();
      const stale = screen.getByTestId('sheet.action.edit').props.onPress;
      await act(dismissal());
      if (kind === 'close') await result.rerender(<ActionSheet {...base} open={false} />);
      else await result.unmount();
      await act(() => {
        stale();
        jest.runOnlyPendingTimers();
      });
      expect(base.onOpenChange).not.toHaveBeenCalled();
      expect(base.actions[0]!.onPress).not.toHaveBeenCalled();
    },
  );

  it.each(['empty', 'duplicate'])('warns and suppresses %s action lists', async (kind) => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const base = props();
    const actions = kind === 'empty' ? [] : [base.actions[0]!, base.actions[0]!];
    await render(<ActionSheet {...base} actions={actions} />);
    await act(() => jest.runOnlyPendingTimers());
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(kind === 'empty' ? 'at least one' : 'unique'),
    );
    expect(screen.queryByText('Edit profile')).toBeNull();
  });

  it('forwards appearance and accent to the native host', async () => {
    await render(
      <IdiomProvider appearance="dark" accentColor="#a33b80">
        <ActionSheet {...props()} />
      </IdiomProvider>,
    );
    await settleAnchor();
    const host = jest
      .mocked(Platform.OS === 'ios' ? SwiftUI.Host : Compose.Host)
      .mock.calls.at(-1)![0];
    expect(host.colorScheme).toBe('dark');
    expect(host.seedColor).toBe('#a33b80');
  });
});

if (Platform.OS === 'ios')
  describe('iOS action anchor geometry', () => {
    it('positions the native anchor relative to the measured overlay origin', async () => {
      await render(<ActionSheet {...props()} />);
      await settleAnchor();
      const host = jest.mocked(SwiftUI.Host).mock.calls.at(-1)![0];
      expect(host.style).toContainEqual({ left: 60, top: 110, width: 140, height: 48 });
      const dialog = jest.mocked(SwiftUI.ConfirmationDialog).mock.calls.at(-1)![0];
      expect(dialog.titleVisibility).toBe('visible');
    });

    it('warns and suppresses an unavailable or zero-size trigger', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const base = props();
      base.anchorRef.current = null;
      const result = await render(<ActionSheet {...base} />);
      await settleAnchor();
      expect(warn).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Edit profile')).toBeNull();
      await result.rerender(<ActionSheet {...base} open={false} />);
      base.anchorRef.current = nativeView(0, 0, 0, 0);
      await result.rerender(<ActionSheet {...base} />);
      await settleAnchor();
      expect(screen.queryByText('Edit profile')).toBeNull();
      expect(base.onOpenChange).not.toHaveBeenCalled();
    });

    it('remeasures after rotation and ignores older measurements', async () => {
      const base = props();
      const callbacks: Measure[] = [];
      base.anchorRef.current!.measureInWindow = jest.fn((callback) => {
        callbacks.push(callback);
      });
      await render(<ActionSheet {...base} />);
      await settleAnchor();
      const before = Dimensions.get('window');
      await act(() =>
        Dimensions.set({ window: { ...before, width: before.height, height: before.width } }),
      );
      await act(() => jest.runOnlyPendingTimers());
      expect(callbacks.length).toBeGreaterThanOrEqual(2);
      await act(() => {
        callbacks.at(-1)?.(200, 300, 100, 60);
        callbacks[0]!(1, 1, 1, 1);
      });
      expect(jest.mocked(SwiftUI.Host).mock.calls.at(-1)![0].style).toContainEqual({
        left: 180,
        top: 260,
        width: 100,
        height: 60,
      });
      await act(() => Dimensions.set({ window: before }));
    });

    it('ignores measurements completing after programmatic closure or unmount', async () => {
      const base = props();
      let callback: Measure | undefined;
      base.anchorRef.current!.measureInWindow = jest.fn((next) => {
        callback = next;
      });
      const result = await render(<ActionSheet {...base} />);
      await settleAnchor();
      await result.rerender(<ActionSheet {...base} open={false} />);
      await act(() => callback?.(80, 150, 140, 48));
      expect(screen.queryByText('Edit profile')).toBeNull();
      await result.unmount();
      await act(() => callback?.(80, 150, 140, 48));
      expect(base.onOpenChange).not.toHaveBeenCalled();
    });
  });

if (Platform.OS === 'android')
  describe('Android native hide lifecycle', () => {
    it('retains the native sheet until hide completes and ignores completion after reopening', async () => {
      const completes: (() => void)[] = [];
      const hide = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            completes.push(resolve);
          }),
      );
      const base = props();
      const result = await render(<ActionSheet {...base} />);
      const native = jest.mocked(Compose.ModalBottomSheet).mock.calls.at(-1)![0];
      if (!native.ref || typeof native.ref === 'function' || !native.ref.current)
        throw new Error('Missing native ref');
      native.ref.current.hide = hide;
      await result.rerender(<ActionSheet {...base} open={false} />);
      expect(hide).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Edit profile')).toBeOnTheScreen();
      await result.rerender(<ActionSheet {...base} />);
      await act(() => completes[0]!());
      expect(screen.getByText('Edit profile')).toBeOnTheScreen();
      const reopened = jest.mocked(Compose.ModalBottomSheet).mock.calls.at(-1)![0];
      if (!reopened.ref || typeof reopened.ref === 'function' || !reopened.ref.current)
        throw new Error('Missing native ref');
      reopened.ref.current.hide = hide;
      await result.rerender(<ActionSheet {...base} open={false} />);
      await act(() => completes[1]!());
      expect(screen.queryByText('Edit profile')).toBeNull();
      expect(base.onOpenChange).not.toHaveBeenCalled();
    });
  });
