import { fireEvent, render, screen } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PrivacyPage from '../app/privacy';
import { PreferencesProvider, usePreferences } from '../src/preferences';

function SeedAndInspect() {
  const preferences = usePreferences();
  useEffect(() => {
    preferences.setAppearance('dark');
    preferences.setNotifications(false);
    preferences.setSounds(false);
    preferences.setAnalytics(true);
    preferences.setPublicProfile(true);
    preferences.setProfile({ name: 'Taylor Kim', email: 'taylor@example.com' });
    // Seed once; later renders inspect application state after the dialog action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View>
      <Text testID="preferences-state">
        {JSON.stringify({
          appearance: preferences.appearance,
          notifications: preferences.notifications,
          sounds: preferences.sounds,
          analytics: preferences.analytics,
          publicProfile: preferences.publicProfile,
          profile: preferences.profile,
        })}
      </Text>
    </View>
  );
}

it('cancels without changes, then resets preferences while retaining the edited profile', async () => {
  await render(
    <SafeAreaProvider>
      <PreferencesProvider>
        <SeedAndInspect />
        <PrivacyPage />
      </PreferencesProvider>
    </SafeAreaProvider>,
  );
  const original = screen.getByTestId('preferences-state').props.children;
  await fireEvent.press(screen.getByTestId('reset-preferences-action'));
  expect(screen.getByText('Reset preferences?')).toBeOnTheScreen();
  await fireEvent.press(screen.getByTestId('reset-preferences-dialog.cancel'));
  expect(screen.getByTestId('preferences-state').props.children).toBe(original);
  expect(screen.queryByTestId('reset-preferences-dialog.confirm')).toBeNull();
  await fireEvent.press(screen.getByTestId('reset-preferences-action'));
  await fireEvent.press(screen.getByTestId('reset-preferences-dialog.confirm'));
  expect(JSON.parse(screen.getByTestId('preferences-state').props.children)).toEqual({
    appearance: 'system',
    notifications: true,
    sounds: true,
    analytics: false,
    publicProfile: false,
    profile: { name: 'Taylor Kim', email: 'taylor@example.com' },
  });
  expect(screen.queryByTestId('reset-preferences-dialog.confirm')).toBeNull();
});
