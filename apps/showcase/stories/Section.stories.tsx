import { EmptyState, Settings, type SettingsSectionProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';

import { appearanceArgs, appearanceArgTypes, inSettingsScreen, type HarnessArgs } from './harness';

type Args = SettingsSectionProps & HarnessArgs;

const meta = {
  title: 'Settings/Section',
  component: Settings.Section,
  decorators: [inSettingsScreen],
  args: {
    ...appearanceArgs,
    title: 'About',
    footer: 'Grouped preferences with native section spacing.',
    children: (
      <>
        <Settings.Value label="Version" value="0.1.0" />
        <Settings.Row
          label="Open source"
          description="Built with native UI controls"
          icon="document"
        />
      </>
    ),
  },
  argTypes: {
    ...appearanceArgTypes,
    title: { control: 'text' },
    footer: { control: 'text' },
    children: { control: false },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutHeading: Story = { args: { title: '', footer: '' } };
export const LongText: Story = {
  args: {
    title: 'Preferences shared across every device connected to this account',
    footer:
      'Changes to these preferences are reflected across connected devices. Increase the system font size and rotate the simulator to inspect how a longer native section footer remains readable.',
  },
};
export const EmptyContent: Story = {
  args: {
    title: 'Saved items',
    children: (
      <EmptyState
        title="No saved items"
        description="Save an item to add it to this section."
        icon="document"
      />
    ),
  },
};
