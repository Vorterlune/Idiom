import { Form, type FormScreenProps, type FormTextFieldRef } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { useRef } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import { appearanceArgs, appearanceArgTypes, type HarnessArgs } from './harness';

type Args = FormScreenProps &
  HarnessArgs & {
    name: string;
    email: string;
    emailError: string;
    showEmail: boolean;
    fieldsDisabled: boolean;
    showResetAction: boolean;
    extraFields: string[];
  };

const meta = {
  title: 'Form/Screen',
  component: Form.Screen,
  args: {
    ...appearanceArgs,
    title: 'Edit profile',
    safeAreaEdges: [],
    submitLabel: 'Save changes',
    onSubmit: action('onSubmit'),
    submitting: false,
    submitDisabled: false,
    error: '',
    children: <></>,
    name: 'Alex Morgan',
    email: 'alex@example.com',
    emailError: '',
    showEmail: true,
    fieldsDisabled: false,
    showResetAction: false,
    extraFields: [],
  },
  argTypes: {
    ...appearanceArgTypes,
    title: { control: 'text' },
    submitLabel: { control: 'text' },
    submitting: { control: 'boolean' },
    submitDisabled: { control: 'boolean' },
    error: { control: 'text' },
    children: { control: false },
    safeAreaEdges: { control: false },
    onSubmit: { control: false },
    name: { control: 'text' },
    email: { control: 'text' },
    emailError: { control: 'text' },
    showEmail: { control: 'boolean' },
    fieldsDisabled: { control: 'boolean' },
    showResetAction: { control: 'boolean' },
    extraFields: { control: false },
  },
  render: function Render(args) {
    const [{ name, email, extraFields }, updateArgs] = useArgs<Args>();
    const emailField = useRef<FormTextFieldRef>(null);

    const form = (
      <Form.Screen {...args}>
        <Form.Section
          title="Your account"
          footer="Use Next to focus Email, then Done to request submission. Submission is recorded in Actions."
        >
          <>
            <Form.TextField
              label="Name"
              kind="name"
              value={name}
              disabled={args.fieldsDisabled}
              returnKeyType={args.showEmail ? 'next' : 'done'}
              {...(args.showEmail ? { onSubmitEditing: () => emailField.current?.focus() } : {})}
              onChangeText={(value) => {
                updateArgs({ name: value });
                action('name.onChangeText')(value);
              }}
              testID="form-story-name"
            />
            {args.showEmail && (
              <Form.TextField
                ref={emailField}
                label="Email"
                kind="email"
                value={email}
                description="Used for account updates"
                error={args.emailError}
                disabled={args.fieldsDisabled}
                onChangeText={(value) => {
                  updateArgs({ email: value });
                  action('email.onChangeText')(value);
                }}
                testID="form-story-email"
              />
            )}
          </>
        </Form.Section>
        {extraFields.length > 0 && (
          <Form.Section
            title="Keyboard and scrolling"
            footer="Focus the final field, change the text size, and verify that both the field and Save remain reachable."
          >
            {extraFields.map((value, index) => (
              <Form.TextField
                key={index}
                label={`Additional field ${index + 1}`}
                value={value}
                onChangeText={(nextValue) => {
                  updateArgs({
                    extraFields: extraFields.map((previous, field) =>
                      field === index ? nextValue : previous,
                    ),
                  });
                  action(`extraFields.${index}.onChangeText`)(nextValue);
                }}
                testID={`form-story-additional-${index + 1}`}
              />
            ))}
          </Form.Section>
        )}
      </Form.Screen>
    );

    if (!args.showResetAction) return form;
    return (
      <View style={styles.canvas}>
        <Button
          title="Reset draft from parent"
          onPress={() => {
            updateArgs({ name: 'Alex Morgan', email: 'alex@example.com' });
            action('parent.resetDraft')();
          }}
        />
        {form}
      </View>
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NextAndDone: Story = {};
export const Pending: Story = { args: { submitting: true } };
export const FailedSubmission: Story = {
  args: { error: 'Your profile could not be saved. Try again when your connection is restored.' },
};
export const SubmitDisabled: Story = { args: { submitDisabled: true } };
export const DisabledFields: Story = { args: { fieldsDisabled: true } };
export const LongErrors: Story = {
  args: {
    emailError:
      'This email address is already associated with another account. Enter a different address or contact your account administrator for help before saving your changes.',
    error:
      'We could not save your profile because some account details need your attention. Review the highlighted field and try again. Your current draft is still available.',
  },
};
export const ParentDrivenReset: Story = { args: { showResetAction: true } };
export const ConditionalFields: Story = { args: { showEmail: false } };
export const LongScrolling: Story = {
  args: { extraFields: Array.from({ length: 12 }, (_, index) => `Sample ${index + 1}`) },
};

const styles = StyleSheet.create({ canvas: { flex: 1 } });
