import { Settings, type SettingsRowProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, Text, View } from 'react-native';
import { action } from 'storybook/actions';

import {
  appearanceArgs,
  commonArgTypes,
  inSettingsSection,
  longDescription,
  longLabel,
  type HarnessArgs,
} from './harness';

type Args = SettingsRowProps & HarnessArgs;

const styles = StyleSheet.create({
  badge: { borderRadius: 6, backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#334155', fontSize: 13, fontWeight: '600' },
});

const meta = {
  title: 'Settings/Row',
  component: Settings.Row,
  decorators: [inSettingsSection],
  args: {
    ...appearanceArgs,
    label: 'Account',
    description: 'Manage your personal details',
    icon: 'person',
    disabled: false,
  },
  argTypes: { ...commonArgTypes, trailing: { control: false }, onPress: { control: false } },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pressable: Story = {
  args: { label: 'Run sample action', onPress: action('onPress') },
};
export const Disabled: Story = {
  args: { label: 'Unavailable action', disabled: true, onPress: action('onPress') },
};
export const LongText: Story = { args: { label: longLabel, description: longDescription } };
export const CustomTrailing: Story = {
  args: {
    label: 'Preview release',
    description: 'Display-only React Native content in the trailing slot',
    trailing: (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>v0.1</Text>
      </View>
    ),
  },
};
