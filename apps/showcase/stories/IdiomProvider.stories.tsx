import { IdiomProvider, SearchBar, Settings, type IdiomProviderProps } from '@idiom/ui';
import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from 'storybook/actions';
import { useArgs } from 'storybook/preview-api';

import { appearanceArgs, appearanceArgTypes, type HarnessArgs } from './harness';

type Args = IdiomProviderProps & HarnessArgs & { notifications: boolean; searchText: string };

const meta = {
  title: 'IdiomProvider',
  component: IdiomProvider,
  args: { ...appearanceArgs, notifications: true, searchText: '', children: null },
  argTypes: {
    ...appearanceArgTypes,
    accentColor: { control: 'color' },
    children: { control: false },
    notifications: { control: 'boolean' },
    searchText: { control: 'text' },
  },
  render: function Render(args) {
    const [{ notifications, searchText }, updateArgs] = useArgs<Args>();
    return (
      <IdiomProvider {...args}>
        <Settings.Screen
          title="Appearance preview"
          safeAreaEdges={[]}
          header={
            <SearchBar
              value={searchText}
              placeholder="Try the accent color"
              onChangeText={(value) => {
                updateArgs({ searchText: value });
                action('search.onChangeText')(value);
              }}
              onSubmit={action('search.onSubmit')}
            />
          }
        >
          <Settings.Section
            title="Preview"
            footer="Change appearance and accent color in Controls to update the provider."
          >
            <Settings.Toggle
              label="Notifications"
              icon="notifications"
              value={notifications}
              onValueChange={(value) => {
                updateArgs({ notifications: value });
                action('notifications.onValueChange')(value);
              }}
            />
            <Settings.Link label="Account" icon="person" onPress={action('account.onPress')} />
            <Settings.Value label="Version" value="0.1.0" />
          </Settings.Section>
        </Settings.Screen>
      </IdiomProvider>
    );
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<typeof meta>;

export const System: Story = {};
export const Light: Story = { args: { appearance: 'light' } };
export const Dark: Story = { args: { appearance: 'dark' } };
export const AccentOverride: Story = { args: { accentColor: '#9c27b0' } };
