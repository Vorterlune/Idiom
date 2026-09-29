import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { Settings } from '../src';

type Appearance = 'system' | 'light' | 'dark';
const options = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const;

function PickerExample({
  value = 'system',
  disabled = false,
  onValueChange,
}: {
  value?: Appearance;
  disabled?: boolean;
  onValueChange: (value: Appearance) => void;
}) {
  return (
    <SafeAreaProvider>
      <Settings.Screen>
        <Settings.Section title="Preferences">
          <Settings.Picker
            label="Appearance"
            value={value}
            options={options}
            onValueChange={onValueChange}
            disabled={disabled}
            testID="appearance"
          />
        </Settings.Section>
      </Settings.Screen>
    </SafeAreaProvider>
  );
}

async function choose(value: Appearance) {
  await fireEvent.press(screen.getByTestId('appearance'));
  if (Platform.OS === 'ios') {
    await fireEvent.press(screen.getByTestId(`appearance.option.${value}`));
  } else {
    await fireEvent(screen.getByTestId(`appearance.option.${value}`), 'click');
  }
}

describe('controlled picker', () => {
  it('emits one changed value and retains its selection until the caller updates it', async () => {
    const onValueChange = jest.fn();
    const result = await render(<PickerExample onValueChange={onValueChange} />);
    expect(screen.getByTestId('appearance')).toHaveAccessibilityValue({ text: 'System' });

    await choose('dark');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('dark');
    expect(screen.getByTestId('appearance')).toHaveAccessibilityValue({ text: 'System' });

    await result.rerender(<PickerExample value="dark" onValueChange={onValueChange} />);
    expect(screen.getByTestId('appearance')).toHaveAccessibilityValue({ text: 'Dark' });
  });

  it('does not emit when the current option is selected', async () => {
    const onValueChange = jest.fn();
    await render(<PickerExample onValueChange={onValueChange} />);
    await choose('system');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not interact while disabled', async () => {
    const onValueChange = jest.fn();
    await render(<PickerExample disabled onValueChange={onValueChange} />);
    expect(screen.getByTestId('appearance')).toBeDisabled();
    await fireEvent.press(screen.getByTestId('appearance'));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  if (Platform.OS === 'ios') {
    it('keeps the selected native menu option controlled when the caller declines a change', async () => {
      const onValueChange = jest.fn();
      const result = await render(<PickerExample onValueChange={onValueChange} />);
      await choose('dark');
      await fireEvent.press(screen.getByTestId('appearance'));
      expect(screen.getByTestId('appearance.option.system')).toBeSelected();
      expect(screen.getByTestId('appearance.option.dark')).not.toBeSelected();
      expect(onValueChange).toHaveBeenCalledTimes(1);

      await fireEvent(screen.getByRole('menu'), 'accessibilityEscape');
      await result.rerender(<PickerExample value="dark" onValueChange={onValueChange} />);
      await fireEvent.press(screen.getByTestId('appearance'));
      expect(screen.getByTestId('appearance.option.dark')).toBeSelected();
      expect(screen.getByTestId('appearance.option.system')).not.toBeSelected();
    });

    it('dismisses the native menu without committing a selection', async () => {
      const onValueChange = jest.fn();
      await render(<PickerExample onValueChange={onValueChange} />);
      await fireEvent.press(screen.getByTestId('appearance'));
      await fireEvent(screen.getByRole('menu'), 'accessibilityEscape');
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.getByTestId('appearance')).toHaveAccessibilityValue({ text: 'System' });
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('ignores a native toggle event containing the unchanged value', async () => {
      const onValueChange = jest.fn();
      await render(<Settings.Toggle label="Notifications" value onValueChange={onValueChange} />);
      await fireEvent(screen.getByRole('switch'), 'isOnChange', true);
      expect(onValueChange).not.toHaveBeenCalled();
    });
  } else {
    it('keeps the native selection indicator tied to the controlled value', async () => {
      const onValueChange = jest.fn();
      const result = await render(<PickerExample onValueChange={onValueChange} />);
      await choose('dark');
      await fireEvent.press(screen.getByTestId('appearance'));
      expect(
        within(screen.getByTestId('appearance.option.system')).getByLabelText('Selected'),
      ).toBeOnTheScreen();
      expect(
        within(screen.getByTestId('appearance.option.dark')).queryByLabelText('Selected'),
      ).toBeNull();

      await result.rerender(<PickerExample value="dark" onValueChange={onValueChange} />);
      expect(
        within(screen.getByTestId('appearance.option.dark')).getByLabelText('Selected'),
      ).toBeOnTheScreen();
      expect(
        within(screen.getByTestId('appearance.option.system')).queryByLabelText('Selected'),
      ).toBeNull();
      expect(onValueChange).toHaveBeenCalledTimes(1);
    });

    it('dismisses the menu without committing a change', async () => {
      const onValueChange = jest.fn();
      await render(<PickerExample onValueChange={onValueChange} />);
      await fireEvent.press(screen.getByTestId('appearance'));
      expect(screen.getByRole('button', { name: 'Appearance', expanded: true })).toBeOnTheScreen();
      await fireEvent(screen.getByRole('menu'), 'dismissRequest');
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.getByRole('button', { name: 'Appearance', expanded: false })).toBeOnTheScreen();
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('closes an open menu if the setting becomes disabled', async () => {
      const onValueChange = jest.fn();
      const result = await render(<PickerExample onValueChange={onValueChange} />);
      await fireEvent.press(screen.getByTestId('appearance'));
      expect(screen.getByRole('menu')).toBeOnTheScreen();
      await result.rerender(<PickerExample disabled onValueChange={onValueChange} />);
      expect(screen.queryByRole('menu')).toBeNull();
      expect(onValueChange).not.toHaveBeenCalled();
    });
  }
});
