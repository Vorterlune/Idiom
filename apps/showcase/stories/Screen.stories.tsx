import { SearchBar, Settings, type SettingsScreenProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, Text, View } from 'react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import { appearanceArgs, appearanceArgTypes, type HarnessArgs } from './harness';

type Args = SettingsScreenProps & HarnessArgs & { searchText: string };

const meta = {
  title: 'Settings/Screen',
  component: Settings.Screen,
  args: {
    ...appearanceArgs,
    title: 'Preferences',
    safeAreaEdges: [],
    searchText: '',
    children: (
      <>
        <Settings.Section title="Account">
          <Settings.Row label="Profile" icon="person" />
          <Settings.Link label="Privacy" icon="privacy" onPress={action('privacy.onPress')} />
        </Settings.Section>
        <Settings.Section title="About">
          <Settings.Value label="Version" value="0.1.0" />
        </Settings.Section>
      </>
    ),
  },
  argTypes: {
    ...appearanceArgTypes,
    title: { control: 'text' },
    children: { control: false },
    header: { control: false },
    safeAreaEdges: { control: false },
    searchText: { control: 'text', description: 'Controlled query in the Search header example.' },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CustomHeader: Story = {
  render: (args) => (
    <Settings.Screen
      {...args}
      header={
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Account status</Text>
          <Text style={styles.bannerText}>
            This custom header is ordinary React Native content above the scrolling settings.
          </Text>
        </View>
      }
    />
  ),
};
export const SearchHeader: Story = {
  render: function Render(args) {
    const [{ searchText }, updateArgs] = useArgs<Args>();
    return (
      <Settings.Screen
        {...args}
        header={
          <SearchBar
            value={searchText}
            placeholder="Try the search header"
            onChangeText={(value) => {
              updateArgs({ searchText: value });
              action('header.onChangeText')(value);
            }}
            onSubmit={action('header.onSubmit')}
          />
        }
      />
    );
  },
};
export const LongTitle: Story = {
  args: { title: 'Preferences for all of your connected devices' },
};

const styles = StyleSheet.create({
  banner: { padding: 16, backgroundColor: '#dbeafe', borderRadius: 12, gap: 6 },
  bannerTitle: { fontSize: 18, fontWeight: '600', color: '#1e3a8a' },
  bannerText: { fontSize: 16, color: '#1e3a8a' },
});
