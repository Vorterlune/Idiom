import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import EditProfilePage from '../app/profile-edit';
import ProfilePage from '../app/profile';
import { PreferencesProvider } from '../src/preferences';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, push: mockPush }) }), {
  virtual: true,
});

function ProfileNavigation({ editing }: { editing: boolean }) {
  return (
    <SafeAreaProvider>
      <PreferencesProvider>{editing ? <EditProfilePage /> : <ProfilePage />}</PreferencesProvider>
    </SafeAreaProvider>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('showcase profile editing', () => {
  it('validates drafts, saves once, and preserves profile visibility across navigation', async () => {
    const result = await render(<ProfileNavigation editing={false} />);
    const visibility = screen.getByRole('switch', { name: /Show profile in directory/ });
    if (Platform.OS === 'ios') await fireEvent(visibility, 'isOnChange', true);
    else await fireEvent.press(visibility);
    await fireEvent.press(screen.getByTestId('edit-profile-link'));
    expect(mockPush).toHaveBeenCalledWith('/profile-edit');

    await result.rerender(<ProfileNavigation editing />);
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('Alex Morgan');
    expect(screen.getByLabelText('Email')).toHaveDisplayValue('alex@example.com');
    await fireEvent.changeText(screen.getByLabelText('Name'), '   ');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'invalid');
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByText('Enter your name.')).toBeOnTheScreen();
    expect(screen.getByText('Enter a valid email address.')).toBeOnTheScreen();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(mockBack).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Name'), '  Taylor Kim  ');
    await fireEvent.changeText(screen.getByLabelText('Email'), '  taylor@example.com  ');
    await fireEvent(screen.getByLabelText('Email'), 'submitEditing');
    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(screen.queryByText('Enter your name.')).toBeNull();
    expect(screen.queryByText('Enter a valid email address.')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    await act(() => {
      jest.advanceTimersByTime(650);
    });
    expect(mockBack).toHaveBeenCalledTimes(1);

    await result.rerender(<ProfileNavigation editing={false} />);
    expect(screen.getByLabelText('Name')).toHaveAccessibilityValue({ text: 'Taylor Kim' });
    expect(screen.getByLabelText('Email')).toHaveAccessibilityValue({ text: 'taylor@example.com' });
    expect(
      screen.getByRole('switch', { name: /Show profile in directory/, checked: true }),
    ).toBeOnTheScreen();
    await result.rerender(<ProfileNavigation editing />);
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('Taylor Kim');
    expect(screen.getByLabelText('Email')).toHaveDisplayValue('taylor@example.com');
  });

  it('discards an unsaved draft and cancels a pending save when leaving the editor', async () => {
    const result = await render(<ProfileNavigation editing />);
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Unsaved draft');
    await result.rerender(<ProfileNavigation editing={false} />);
    expect(screen.getByLabelText('Name')).toHaveAccessibilityValue({ text: 'Alex Morgan' });

    await result.rerender(<ProfileNavigation editing />);
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('Alex Morgan');
    await fireEvent.changeText(screen.getByLabelText('Name'), 'Cancelled save');
    await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    await result.rerender(<ProfileNavigation editing={false} />);
    await act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByLabelText('Name')).toHaveAccessibilityValue({ text: 'Alex Morgan' });
    expect(screen.getByLabelText('Email')).toHaveAccessibilityValue({ text: 'alex@example.com' });
    expect(mockBack).not.toHaveBeenCalled();
  });
});
