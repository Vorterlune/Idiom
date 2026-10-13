import { Form, type FormTextFieldProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import {
  appearanceArgs,
  appearanceArgTypes,
  inFormSection,
  longDescription,
  longLabel,
  type HarnessArgs,
} from './harness';

type Args = FormTextFieldProps & HarnessArgs;

const meta = {
  title: 'Form/TextField',
  component: Form.TextField,
  decorators: [inFormSection],
  args: {
    ...appearanceArgs,
    label: 'Name',
    kind: 'name',
    value: 'Alex Morgan',
    description: 'Shown on your profile',
    placeholder: 'Enter your name',
    error: '',
    disabled: false,
    returnKeyType: 'done',
    onChangeText: action('onChangeText'),
    onBlur: action('onBlur'),
  },
  argTypes: {
    ...appearanceArgTypes,
    label: { control: 'text' },
    value: { control: 'text' },
    kind: { control: 'select', options: ['text', 'name', 'email'] },
    description: { control: 'text' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    returnKeyType: { control: 'select', options: ['next', 'done'] },
    onChangeText: { control: false },
    onBlur: { control: false },
    onSubmitEditing: { control: false },
  },
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs<Args>();
    return (
      <Form.TextField
        {...args}
        value={value}
        onChangeText={(nextValue) => {
          updateArgs({ value: nextValue });
          args.onChangeText(nextValue);
        }}
      />
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Email: Story = {
  args: {
    label: 'Email',
    kind: 'email',
    value: 'alex@example.com',
    placeholder: 'name@example.com',
    description: 'Used for account updates',
  },
};
export const Empty: Story = { args: { value: '' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithError: Story = { args: { value: '', error: 'Enter your name.' } };
export const LongText: Story = {
  args: {
    label: longLabel,
    description: longDescription,
    error: 'Check this value before saving.',
  },
};
export const ExplicitAccessibility: Story = {
  args: {
    accessibilityLabel: 'Public profile name',
    accessibilityHint: 'Enter the name that other members should see',
  },
};
export const SubmitOverride: Story = {
  args: { onSubmitEditing: action('custom.onSubmitEditing') },
};
export const ParentIgnoresEdits: Story = {
  render: (args) => <Form.TextField {...args} onChangeText={action('ignored.onChangeText')} />,
};
export const ParentTransformsEdits: Story = {
  render: function Render(args) {
    const [{ value }, updateArgs] = useArgs<Args>();
    return (
      <Form.TextField
        {...args}
        value={value}
        onChangeText={(nextValue) => {
          updateArgs({ value: nextValue.toUpperCase() });
          args.onChangeText(nextValue);
        }}
      />
    );
  },
};
