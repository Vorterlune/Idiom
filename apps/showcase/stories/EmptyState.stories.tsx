import { EmptyState, type EmptyStateProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from 'storybook/actions';

import { appearanceArgs, appearanceArgTypes, Standalone, type HarnessArgs } from './harness';

type Args = EmptyStateProps & HarnessArgs;

const meta = {
  title: 'EmptyState',
  component: EmptyState,
  args: {
    ...appearanceArgs,
    title: 'Nothing saved yet',
    description: 'Your saved items will appear here.',
    icon: 'document',
  },
  argTypes: {
    ...appearanceArgTypes,
    title: { control: 'text' },
    description: { control: 'text' },
    icon: {
      control: 'select',
      options: [
        'person',
        'notifications',
        'appearance',
        'sound',
        'privacy',
        'info',
        'document',
        'search',
      ],
    },
    action: { control: false },
  },
  render: (args) => (
    <Standalone>
      <EmptyState {...args} />
    </Standalone>
  ),
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = {
  args: { action: { label: 'Add sample item', onPress: action('action.onPress') } },
};
export const LongText: Story = {
  args: {
    title: 'No items match the search across your saved preferences',
    description:
      'Try another search phrase, change the filters, or return later after items have been added. Increase the system text size to inspect how this explanatory text wraps.',
    action: { label: 'Clear the current filters', onPress: action('action.onPress') },
  },
};
