import { ActionSheet, type ActionSheetProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import { appearanceArgs, appearanceArgTypes, type HarnessArgs } from './harness';

type Args = ActionSheetProps &
  HarnessArgs & {
    accentColor?: string;
    ignoreClosure: boolean;
    showExternalClose: boolean;
  };

const edit = { id: 'edit', label: 'Edit profile', onPress: action('action.edit') };
const visibility = {
  id: 'visibility',
  label: 'Hide profile from directory',
  onPress: action('action.visibility'),
};

const meta = {
  title: 'ActionSheet',
  component: ActionSheet,
  args: {
    ...appearanceArgs,
    open: false,
    title: 'Profile actions',
    anchorRef: { current: null },
    message: 'Choose what you would like to do with this profile.',
    actions: [edit, visibility],
    cancelLabel: 'Cancel',
    onOpenChange: action('onOpenChange'),
    testID: 'action-sheet-story',
    ignoreClosure: false,
    showExternalClose: false,
  },
  argTypes: {
    ...appearanceArgTypes,
    accentColor: { control: 'color' },
    open: { control: 'boolean' },
    title: { control: 'text' },
    message: { control: 'text' },
    cancelLabel: { control: 'text' },
    actions: { control: false },
    anchorRef: { control: false },
    onOpenChange: { control: false },
    ignoreClosure: { control: 'boolean' },
    showExternalClose: { control: false },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<Args>();
    const anchorRef = useRef<View>(null);
    const [selections, setSelections] = useState(0);
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
        <Pressable
          ref={anchorRef}
          collapsable={false}
          accessibilityRole="button"
          style={styles.trigger}
          onPress={() => updateArgs({ open: true })}
          testID="open-action-sheet"
        >
          <Text style={styles.triggerLabel}>Open actions</Text>
        </Pressable>
        <Text style={styles.text}>Selected actions: {selections}</Text>
        <Text style={styles.text}>
          Rotate the device to check the trigger anchor. Cancel must not increment the count.
        </Text>
        {args.ignoreClosure && (
          <Pressable accessibilityRole="button" onPress={() => updateArgs({ open: false })}>
            <Text style={styles.text}>Reset open state</Text>
          </Pressable>
        )}
        <ActionSheet
          {...args}
          anchorRef={anchorRef}
          actions={args.actions.map((item) => ({
            ...item,
            onPress: () => {
              setSelections((count) => count + 1);
              item.onPress();
            },
          }))}
          onOpenChange={(open) => {
            args.onOpenChange(open);
            if (!args.ignoreClosure) updateArgs({ open });
          }}
        />
      </View>
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Destructive: Story = {
  args: {
    actions: [
      edit,
      { id: 'delete', label: 'Delete draft', destructive: true, onPress: action('action.delete') },
    ],
  },
};
export const Disabled: Story = { args: { actions: [{ ...edit, disabled: true }, visibility] } };
export const LongContent: Story = {
  args: {
    title: 'Choose one of the available actions for this demonstration profile',
    message:
      'Increase the system font size and rotate the device. The title, actions, and cancellation must remain usable when the content exceeds the available height.',
    actions: Array.from({ length: 15 }, (_, index) => ({
      id: `item-${index}`,
      label: `Demonstration action ${index + 1} with a longer accessible label`,
      onPress: action(`action.${index + 1}`),
    })),
  },
};
export const Dark: Story = { args: { appearance: 'dark' } };
export const Accent: Story = { args: { accentColor: '#a33b80' } };
export const ExternalClosure: Story = { args: { showExternalClose: true } };
export const IgnoredClosure: Story = { args: { ignoreClosure: true } };

const styles = StyleSheet.create({
  canvas: { flex: 1, padding: 20, gap: 16 },
  trigger: { alignSelf: 'flex-start', padding: 12, borderRadius: 10, backgroundColor: '#315da8' },
  triggerLabel: { color: '#fff', fontSize: 16 },
  text: { color: '#777' },
});
