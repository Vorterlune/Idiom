import { Settings, type SettingsToggleProps } from '@idiom/ui';
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

type Args = SettingsToggleProps & HarnessArgs;

const meta = {
  title: 'Settings/Toggle',
  component: Settings.Toggle,
  decorators: [inSettingsSection],
  args: {
    ...appearanceArgs,
    label: 'Notifications',
    description: 'Receive updates about your account',
    icon: 'notifications',
    disabled: false,
    value: true,
    onValueChange: action('onValueChange'),
  },
  argTypes: { ...commonArgTypes, value: { control: 'boolean' }, onValueChange: { control: false } },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs<Args>();
    return (
      <Settings.Toggle
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
export const Off: Story = { args: { value: false } };
export const Disabled: Story = {
  args: { disabled: true, description: 'Managed by a sample policy' },
};
export const LongText: Story = { args: { label: longLabel, description: longDescription } };
