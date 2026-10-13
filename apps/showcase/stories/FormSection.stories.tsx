import { Form, type FormSectionProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import { appearanceArgs, appearanceArgTypes, inFormScreen, type HarnessArgs } from './harness';

type Args = FormSectionProps & HarnessArgs & { value: string };

function WrappedField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  return <Form.TextField label="Name" kind="name" value={value} onChangeText={onChangeText} />;
}

const meta = {
  title: 'Form/Section',
  component: Form.Section,
  decorators: [inFormScreen],
  args: {
    ...appearanceArgs,
    title: 'Your account',
    footer: 'Profile details stay controlled by the application.',
    children: <></>,
    value: 'Alex Morgan',
  },
  argTypes: {
    ...appearanceArgTypes,
    title: { control: 'text' },
    footer: { control: 'text' },
    children: { control: false },
    value: { control: 'text' },
  },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs<Args>();
    return (
      <Form.Section {...args}>
        <>
          <WrappedField
            value={value}
            onChangeText={(nextValue) => {
              updateArgs({ value: nextValue });
              action('name.onChangeText')(nextValue);
            }}
          />
        </>
      </Form.Section>
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutHeading: Story = { args: { title: '', footer: '' } };
export const LongText: Story = {
  args: {
    title: 'Profile details visible to everyone in your organization',
    footer:
      'Update these details to keep your profile current. Increase the system text size and rotate the simulator to verify that the heading, field labels, help text, and footer remain readable.',
  },
};
