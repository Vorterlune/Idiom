import { Settings, type SettingsValueProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';

import {
  appearanceArgs,
  commonArgTypes,
  inSettingsSection,
  longDescription,
  longLabel,
  type HarnessArgs,
} from './harness';

type Args = SettingsValueProps & HarnessArgs;

const meta = {
  title: 'Settings/Value',
  component: Settings.Value,
  decorators: [inSettingsSection],
  args: { ...appearanceArgs, label: 'Version', value: '0.1.0', icon: 'info', disabled: false },
  argTypes: { ...commonArgTypes, value: { control: 'text' } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const LongText: Story = {
  args: {
    label: longLabel,
    description: longDescription,
    value: 'A long account value that wraps within the native row',
  },
};
