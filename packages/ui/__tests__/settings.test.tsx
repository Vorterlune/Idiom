import type { ReactNode } from 'react';
import { Platform, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Settings } from '../src';

const options = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const;

function SettingsPage({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <Settings.Screen title="Settings">
        <Settings.Section title="Preferences">{children}</Settings.Section>
      </Settings.Screen>
    </SafeAreaProvider>
  );
}

async function changeToggle(value: boolean) {
  const toggle = screen.getByRole('switch', { name: 'Notifications' });
  if (Platform.OS === 'ios') await fireEvent(toggle, 'isOnChange', value);
  else await fireEvent.press(toggle);
}

describe('settings composition', () => {
  it('renders wrapper components, fragments, conditionals, and documented RN slots', async () => {
    function AccountRows() {
      return <Settings.Value label="Email" value="hello@example.com" testID="email" />;
    }

    function Example({ showDetails }: { showDetails: boolean }) {
      return (
        <SafeAreaProvider>
          <Settings.Screen title="Settings" header={<Text>Search and filter settings</Text>}>
            <Settings.Section title="Account" footer="Your account information">
              <>
                <AccountRows />
                {showDetails ? (
                  <Settings.Value label="Version" value="0.1.0" testID="version" />
                ) : null}
                <Settings.Row label="Plan" trailing={<Text>Personal</Text>} testID="plan" />
              </>
            </Settings.Section>
          </Settings.Screen>
        </SafeAreaProvider>
      );
    }

    const result = await render(<Example showDetails={false} />);
    expect(screen.getByRole('header', { name: 'Settings' })).toBeOnTheScreen();
    expect(screen.getByText('Search and filter settings')).toBeOnTheScreen();
    expect(screen.getByText('Account')).toBeOnTheScreen();
    expect(screen.getByTestId('email')).toHaveAccessibilityValue({ text: 'hello@example.com' });
    expect(screen.getByTestId('plan')).toBeOnTheScreen();
    expect(screen.queryByTestId('version')).toBeNull();

    await result.rerender(<Example showDetails />);
    expect(screen.getByTestId('version')).toHaveAccessibilityValue({ text: '0.1.0' });
  });

  it('keeps read-only values noninteractive', async () => {
    await render(
      <SettingsPage>
        <Settings.Value label="Version" value="0.1.0" />
      </SettingsPage>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('switch')).toBeNull();
  });
});

describe('controlled settings', () => {
  it('emits one toggle change and waits for its controlled value to update', async () => {
    const onValueChange = jest.fn();
    const result = await render(
      <SettingsPage>
        <Settings.Toggle label="Notifications" value={false} onValueChange={onValueChange} />
      </SettingsPage>,
    );

    await changeToggle(true);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('switch', { name: 'Notifications', checked: false })).toBeOnTheScreen();

    await result.rerender(
      <SettingsPage>
        <Settings.Toggle label="Notifications" value onValueChange={onValueChange} />
      </SettingsPage>,
    );
    expect(screen.getByRole('switch', { name: 'Notifications', checked: true })).toBeOnTheScreen();
    await changeToggle(false);
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange).toHaveBeenLastCalledWith(false);
  });

  it('does not toggle a disabled preference', async () => {
    const onValueChange = jest.fn();
    await render(
      <SettingsPage>
        <Settings.Toggle
          label="Notifications"
          value={false}
          disabled
          onValueChange={onValueChange}
        />
      </SettingsPage>,
    );

    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeDisabled();
    await changeToggle(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('uses a custom accessible label and hint without duplicating switch targets', async () => {
    await render(
      <SettingsPage>
        <Settings.Toggle
          label="Notifications"
          description="Receive important updates"
          accessibilityLabel="Allow notifications"
          accessibilityHint="Changes notification delivery"
          value
          onValueChange={jest.fn()}
        />
      </SettingsPage>,
    );

    expect(screen.getAllByRole('switch')).toHaveLength(1);
    expect(
      screen.getByRole('switch', { name: 'Allow notifications', checked: true }),
    ).toBeOnTheScreen();
    expect(screen.getByHintText('Changes notification delivery')).toBeOnTheScreen();
  });

  it.each(['Row', 'Link'] as const)(
    '%s invokes its press handler once and respects disabled state',
    async (name) => {
      const onPress = jest.fn();
      const Component = Settings[name];
      const result = await render(
        <SettingsPage>
          <Component label="Privacy" onPress={onPress} testID="privacy" />
        </SettingsPage>,
      );

      await fireEvent.press(screen.getByTestId('privacy'));
      expect(onPress).toHaveBeenCalledTimes(1);
      await result.rerender(
        <SettingsPage>
          <Component label="Privacy" onPress={onPress} disabled testID="privacy" />
        </SettingsPage>,
      );
      expect(screen.getByTestId('privacy')).toBeDisabled();
      await fireEvent.press(screen.getByTestId('privacy'));
      expect(onPress).toHaveBeenCalledTimes(1);
    },
  );
});

describe('picker validation', () => {
  it.each([
    { name: 'empty options', value: 'system', choices: [], warning: 'at least one item' },
    { name: 'missing selection', value: 'missing', choices: options, warning: 'match an option' },
    {
      name: 'duplicate option values',
      value: 'system',
      choices: [
        { label: 'One', value: 'system' },
        { label: 'Two', value: 'system' },
      ],
      warning: 'unique',
    },
  ])(
    'disables $name and explains the invalid contract in development',
    async ({ value, choices, warning }) => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const onValueChange = jest.fn();
      try {
        await render(
          <SettingsPage>
            <Settings.Picker
              label="Appearance"
              value={value}
              options={choices}
              onValueChange={onValueChange}
              testID="appearance"
            />
          </SettingsPage>,
        );
        expect(screen.getByTestId('appearance')).toBeDisabled();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining(warning));
        await fireEvent.press(screen.getByTestId('appearance'));
        expect(onValueChange).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    },
  );
});
