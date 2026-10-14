import { ConfirmationDialog, type ConfirmationDialogProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import { appearanceArgs, appearanceArgTypes, type HarnessArgs } from './harness';

type Args = ConfirmationDialogProps &
  HarnessArgs & {
    accentColor?: string;
    showExternalClose: boolean;
    showKeyboard: boolean;
    ignoreClosure: boolean;
  };

const meta = {
  title: 'ConfirmationDialog',
  component: ConfirmationDialog,
  args: {
    ...appearanceArgs,
    open: false,
    title: 'Reset preferences?',
    message: 'Restore settings defaults while keeping your name and email.',
    confirmLabel: 'Reset preferences',
    cancelLabel: 'Cancel',
    destructive: false,
    onOpenChange: action('onOpenChange'),
    onConfirm: action('onConfirm'),
    testID: 'confirmation-story',
    showExternalClose: false,
    showKeyboard: false,
    ignoreClosure: false,
  },
  argTypes: {
    ...appearanceArgTypes,
    accentColor: { control: 'color' },
    open: { control: 'boolean' },
    title: { control: 'text' },
    message: { control: 'text' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    destructive: { control: 'boolean' },
    onOpenChange: { control: false },
    onConfirm: { control: false },
    showExternalClose: { control: false },
    showKeyboard: { control: false },
    ignoreClosure: { control: 'boolean' },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<Args>();
    const [confirmations, setConfirmations] = useState(0);
    const [draft, setDraft] = useState('Keyboard test');
    useEffect(() => {
      if (!args.open || !args.showExternalClose) return;
      const timer = setTimeout(() => {
        updateArgs({ open: false });
        action('parent.closed')();
      }, 3000);
      return () => clearTimeout(timer);
    }, [args.open, args.showExternalClose, updateArgs]);
    return (
      <View style={styles.canvas}>
        <Button
          title="Open confirmation"
          onPress={() => updateArgs({ open: true })}
          testID="open-confirmation"
        />
        <Text style={styles.text}>Confirmed actions: {confirmations}</Text>
        <Text style={styles.text}>
          {args.showExternalClose
            ? 'The parent closes this dialog after three seconds.'
            : 'Close and reopen to verify a fresh presentation.'}
        </Text>
        {args.ignoreClosure && (
          <Button title="Reset open state" onPress={() => updateArgs({ open: false })} />
        )}
        {args.showKeyboard && (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            style={styles.input}
            testID="confirmation-keyboard-input"
          />
        )}
        <ConfirmationDialog
          {...args}
          onOpenChange={(open) => {
            args.onOpenChange(open);
            if (!args.ignoreClosure) updateArgs({ open });
          }}
          onConfirm={() => {
            setConfirmations((count) => count + 1);
            args.onConfirm();
          }}
        />
      </View>
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Destructive: Story = { args: { destructive: true } };
export const CustomLabels: Story = {
  args: { title: 'Leave this session?', confirmLabel: 'Sign out', cancelLabel: 'Stay signed in' },
};
export const LongContent: Story = {
  args: {
    title: 'Restore all of your preferences to the original application defaults?',
    message:
      'Your notification, sound, appearance, analytics, and directory visibility preferences will be restored to their original values. Your edited profile name and email will remain available for the current session. You can change these preferences again after closing this confirmation.',
    confirmLabel: 'Restore preference defaults',
    cancelLabel: 'Keep current preferences',
    destructive: true,
  },
};
export const Dark: Story = { args: { appearance: 'dark' } };
export const Accent: Story = { args: { accentColor: '#a33b80' } };
export const ExternalClosure: Story = { args: { showExternalClose: true } };
export const IgnoredClosure: Story = { args: { ignoreClosure: true } };
export const Keyboard: Story = { args: { showKeyboard: true } };

const styles = StyleSheet.create({
  canvas: { flex: 1, padding: 20, gap: 16 },
  text: { color: '#777' },
  input: { borderWidth: 1, borderColor: '#777', color: '#777', borderRadius: 8, padding: 12 },
});
