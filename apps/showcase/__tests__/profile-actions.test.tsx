import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProfilePage from '../app/profile';
import { PreferencesProvider } from '../src/preferences';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }), { virtual: true });

beforeEach(() => {
  jest.useFakeTimers();
  jest
    .spyOn(View.prototype, 'measureInWindow')
    .mockImplementation((callback) => callback(0, 0, 320, 48));
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

async function openActions() {
  await fireEvent.press(screen.getByTestId('profile-actions-trigger'));
  await act(() => jest.runOnlyPendingTimers());
}

it('changes profile visibility through choices while preserving the direct controls', async () => {
  await render(
    <SafeAreaProvider>
      <PreferencesProvider>
        <ProfilePage />
      </PreferencesProvider>
    </SafeAreaProvider>,
  );
  const visibility = () => screen.getByRole('switch', { name: /Show profile in directory/ });
  expect(visibility()).not.toBeChecked();
  expect(screen.getByTestId('edit-profile-link')).toBeOnTheScreen();
  await openActions();
  await fireEvent.press(screen.getByTestId('profile-actions-sheet.cancel'));
  expect(visibility()).not.toBeChecked();
  expect(mockPush).not.toHaveBeenCalled();
  await openActions();
  await fireEvent.press(screen.getByTestId('profile-actions-sheet.action.visibility'));
  expect(visibility()).toBeChecked();
  await openActions();
  expect(screen.getByRole('button', { name: 'Hide profile from directory' })).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('profile-actions-sheet.action.visibility'));
  expect(visibility()).not.toBeChecked();
});

it('requests profile editing once through the action handler', async () => {
  await render(
    <SafeAreaProvider>
      <PreferencesProvider>
        <ProfilePage />
      </PreferencesProvider>
    </SafeAreaProvider>,
  );
  await openActions();
  const select = screen.getByTestId('profile-actions-sheet.action.edit').props.onPress;
  await act(() => {
    select();
    select();
  });
  expect(mockPush).toHaveBeenCalledTimes(1);
  expect(mockPush).toHaveBeenCalledWith('/profile-edit');
});
