import { Settings, type SettingsLinkProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from 'storybook/actions';

import {
  appearanceArgs,
  commonArgTypes,
  inSettingsSection,
  longDescription,
  longLabel,
  type HarnessArgs,
} from './harness';

type Args = SettingsLinkProps & HarnessArgs;

const meta = {
  title: 'Settings/Link',
  component: Settings.Link,
  decorators: [inSettingsSection],
  args: {
    ...appearanceArgs,
    label: 'Privacy',
    description: 'Review privacy preferences',
    icon: 'privacy',
    disabled: false,
    onPress: action('onPress'),
  },
  argTypes: { ...commonArgTypes, onPress: { control: false } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const LongText: Story = { args: { label: longLabel, description: longDescription } };
