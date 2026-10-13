import { Settings, type SettingsPickerProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import {
  appearanceArgs,
  commonArgTypes,
  inSettingsSection,
  longDescription,
  longLabel,
  type HarnessArgs,
} from './harness';

type Args = SettingsPickerProps & HarnessArgs;

const meta = {
  title: 'Settings/Picker',
  component: Settings.Picker,
  decorators: [inSettingsSection],
  args: {
    ...appearanceArgs,
    label: 'Sync frequency',
    description: 'Choose how often to refresh',
    icon: 'sound',
    disabled: false,
    value: 'daily',
    options: [
      { label: 'Hourly', value: 'hourly' },
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
    ],
    onValueChange: action('onValueChange'),
  },
  argTypes: {
    ...commonArgTypes,
    value: { control: 'text' },
    options: { control: 'object' },
    onValueChange: { control: false },
  },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs<Args>();
    return (
      <Settings.Picker
        {...args}
        value={value}
        onValueChange={(nextValue) => {
          updateArgs({ value: nextValue });
          args.onValueChange(nextValue);
        }}
      />
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const LongText: Story = {
  args: {
    label: longLabel,
    description: longDescription,
    options: [
      { label: 'Refresh every day when a connection is available', value: 'daily' },
      { label: 'Refresh every week while the application is in use', value: 'weekly' },
    ],
  },
};
export const EmptyOptions: Story = { args: { options: [], value: '' } };
