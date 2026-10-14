import * as Compose from '@expo/ui/jetpack-compose';
import * as SwiftUI from '@expo/ui/swift-ui';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { ConfirmationDialog, IdiomProvider, type ConfirmationDialogProps } from '../src';

const base: ConfirmationDialogProps = {
  open: true,
  title: 'Reset preferences?',
  message: 'Your profile will be retained.',
  confirmLabel: 'Reset',
  onOpenChange: () => {},
  onConfirm: () => {},
  testID: 'confirmation',
};

function nativeDismiss() {
  if (Platform.OS === 'ios') {
    const alert = screen.getByTestId('confirmation');
    return () => alert.props.onIsPresentedChange(false);
  }
  const alert = screen.getByTestId('confirmation');
  return () => alert.props.onDismissRequest();
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('confirmation presentation', () => {
  it('opens on request with default labels and optional message', async () => {
    const result = await render(<ConfirmationDialog {...base} open={false} />);
    expect(screen.queryByText(base.title)).toBeNull();
    await result.rerender(<ConfirmationDialog {...base} />);
    expect(screen.getByText(base.title)).toBeOnTheScreen();
    expect(screen.getByText('Your profile will be retained.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeOnTheScreen();
  });

  it('requests closure before confirming and ignores duplicate native events', async () => {
    const calls: string[] = [];
    const onOpenChange = jest.fn(() => calls.push('close'));
    const onConfirm = jest.fn(() => calls.push('confirm'));
    await render(
      <ConfirmationDialog {...base} onOpenChange={onOpenChange} onConfirm={onConfirm} />,
    );
    const confirm = screen.getByTestId('confirmation.confirm').props.onPress;
    const dismiss = nativeDismiss();
    await act(() => {
      confirm();
      confirm();
      dismiss();
      dismiss();
      jest.advanceTimersByTime(100);
    });
    expect(calls).toEqual(['close', 'confirm']);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByTestId('confirmation.confirm')).toBeNull();
  });

  it('lets a queued Confirm activation resolve a native dismissal notification', async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn();
    await render(
      <ConfirmationDialog {...base} onOpenChange={onOpenChange} onConfirm={onConfirm} />,
    );
    const confirm = screen.getByTestId('confirmation.confirm').props.onPress;
    const dismiss = nativeDismiss();
    await act(() => {
      dismiss();
      confirm();
      jest.advanceTimersByTime(100);
    });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancels once without running the action', async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn();
    await render(
      <ConfirmationDialog {...base} onOpenChange={onOpenChange} onConfirm={onConfirm} />,
    );
    const cancel = screen.getByTestId('confirmation.cancel').props.onPress;
    const confirm = screen.getByTestId('confirmation.confirm').props.onPress;
    const dismiss = nativeDismiss();
    await act(() => {
      cancel();
      dismiss();
      confirm();
      jest.advanceTimersByTime(100);
    });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('handles repeated native dismissal without running the action', async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn();
    await render(
      <ConfirmationDialog {...base} onOpenChange={onOpenChange} onConfirm={onConfirm} />,
    );
    const dismiss = nativeDismiss();
    await act(() => {
      dismiss();
      dismiss();
      jest.advanceTimersByTime(100);
    });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('stays closed when the application ignores a closure request', async () => {
    const onOpenChange = jest.fn();
    const result = await render(<ConfirmationDialog {...base} onOpenChange={onOpenChange} />);
    await fireEvent.press(screen.getByTestId('confirmation.cancel'));
    await result.rerender(
      <ConfirmationDialog {...base} title="An unrelated update" onOpenChange={onOpenChange} />,
    );
    expect(screen.queryByTestId('confirmation.confirm')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('reopens after a false-to-true transition and ignores events from the previous presentation', async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn();
    const props = { ...base, onOpenChange, onConfirm };
    const result = await render(<ConfirmationDialog {...props} />);
    const staleConfirm = screen.getByTestId('confirmation.confirm').props.onPress;
    const staleDismiss = nativeDismiss();
    await fireEvent.press(screen.getByTestId('confirmation.cancel'));
    await result.rerender(<ConfirmationDialog {...props} open={false} />);
    await result.rerender(<ConfirmationDialog {...props} />);
    await act(() => {
      staleConfirm();
      staleDismiss();
      jest.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('confirmation.confirm')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('confirmation.confirm'));
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes programmatically without callbacks and cancels queued dismissal', async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn();
    const props = { ...base, onOpenChange, onConfirm };
    const result = await render(<ConfirmationDialog {...props} />);
    const staleConfirm = screen.getByTestId('confirmation.confirm').props.onPress;
    await act(nativeDismiss());
    await result.rerender(<ConfirmationDialog {...props} open={false} />);
    await act(() => {
      staleConfirm();
      jest.advanceTimersByTime(100);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('ignores native events after unmount', async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn();
    const result = await render(
      <ConfirmationDialog {...base} onOpenChange={onOpenChange} onConfirm={onConfirm} />,
    );
    const confirm = screen.getByTestId('confirmation.confirm').props.onPress;
    const dismiss = nativeDismiss();
    await act(dismiss);
    await result.unmount();
    await act(() => {
      confirm();
      dismiss();
      jest.advanceTimersByTime(100);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('uses current callbacks while a presentation is open', async () => {
    const original = jest.fn();
    const latest = jest.fn();
    const result = await render(<ConfirmationDialog {...base} onConfirm={original} />);
    const confirm = screen.getByTestId('confirmation.confirm').props.onPress;
    await result.rerender(<ConfirmationDialog {...base} onConfirm={latest} />);
    await act(confirm);
    expect(original).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it('supports custom labels without message content', async () => {
    await render(
      <ConfirmationDialog
        {...base}
        message=""
        cancelLabel="Stay signed in"
        confirmLabel="Sign out"
      />,
    );
    expect(screen.getByRole('button', { name: 'Stay signed in' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeOnTheScreen();
    expect(screen.queryByText('Your profile will be retained.')).toBeNull();
  });

  it('forwards local appearance and accent to the host', async () => {
    const host = Platform.OS === 'ios' ? jest.spyOn(SwiftUI, 'Host') : jest.spyOn(Compose, 'Host');
    await render(
      <IdiomProvider appearance="dark" accentColor="#a33b80">
        <ConfirmationDialog {...base} destructive />
      </IdiomProvider>,
    );
    const properties = host.mock.calls.at(-1)?.[0];
    expect(properties?.colorScheme).toBe('dark');
    expect(properties?.seedColor).toBe('#a33b80');
    if (Platform.OS === 'ios') {
      expect(screen.getByTestId('confirmation.confirm').props.nativeRole).toBe('destructive');
      expect(screen.getByTestId('confirmation.cancel').props.nativeRole).toBe('cancel');
    } else {
      expect(screen.getByTestId('confirmation.confirm').props.colors.contentColor).toBe('#b3261e');
    }
    host.mockRestore();
  });
});
