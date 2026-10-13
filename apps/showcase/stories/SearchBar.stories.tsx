import { SearchBar, type SearchBarProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import { appearanceArgs, appearanceArgTypes, Standalone, type HarnessArgs } from './harness';

type Args = SearchBarProps & HarnessArgs;

const meta = {
  title: 'SearchBar',
  component: SearchBar,
  args: {
    ...appearanceArgs,
    value: '',
    placeholder: 'Search preferences',
    disabled: false,
    onChangeText: action('onChangeText'),
    onSubmit: action('onSubmit'),
  },
  argTypes: {
    ...appearanceArgTypes,
    value: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    onChangeText: { control: false },
    onSubmit: { control: false },
  },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs<Args>();
    return (
      <Standalone>
        <SearchBar
          {...args}
          value={value}
          onChangeText={(nextValue) => {
            updateArgs({ value: nextValue });
            args.onChangeText(nextValue);
          }}
        />
      </Standalone>
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithText: Story = { args: { value: 'Notifications' } };
export const Disabled: Story = { args: { value: 'Managed search', disabled: true } };
export const LongText: Story = {
  args: {
    value: 'A long search query for preferences across all of your devices',
    placeholder: 'Search across account, privacy, notifications, and application preferences',
  },
};
