import { IdiomProvider, Settings, type IdiomProviderProps } from '@idiom/ui';
import type { Decorator } from '@storybook/react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

export type HarnessArgs = {
  appearance: NonNullable<IdiomProviderProps['appearance']>;
};

export const appearanceArgs: HarnessArgs = { appearance: 'system' };

export const appearanceArgTypes = {
  appearance: {
    control: { type: 'select' as const },
    options: ['system', 'light', 'dark'],
    description: 'Appearance supplied by the story canvas IdiomProvider.',
  },
};

export const commonArgTypes = {
  ...appearanceArgTypes,
  label: { control: { type: 'text' as const } },
  description: { control: { type: 'text' as const } },
  disabled: { control: { type: 'boolean' as const } },
  icon: {
    control: { type: 'select' as const },
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
};

function IdiomCanvas({ children, appearance, accentColor }: IdiomProviderProps & HarnessArgs) {
  const systemAppearance = useColorScheme();
  const dark = appearance === 'dark' || (appearance === 'system' && systemAppearance === 'dark');
  return (
    <IdiomProvider appearance={appearance} {...(accentColor === undefined ? {} : { accentColor })}>
      <View style={[styles.canvas, { backgroundColor: dark ? '#000000' : '#f2f2f7' }]}>
        {children}
      </View>
    </IdiomProvider>
  );
}

export const withIdiom: Decorator = (Story, { args }) => {
  const appearance =
    args.appearance === 'light' || args.appearance === 'dark' ? args.appearance : 'system';
  return (
    <IdiomCanvas
      appearance={appearance}
      {...(typeof args.accentColor === 'string' ? { accentColor: args.accentColor } : {})}
    >
      <Story />
    </IdiomCanvas>
  );
};

export const inSettingsScreen: Decorator = (Story) => (
  <Settings.Screen safeAreaEdges={[]}>
    <Story />
  </Settings.Screen>
);

export const inSettingsSection: Decorator = (Story) => (
  <Settings.Screen safeAreaEdges={[]}>
    <Settings.Section>
      <Story />
    </Settings.Section>
  </Settings.Screen>
);

export function Standalone({ children }: { children: ReactNode }) {
  return <View style={styles.standalone}>{children}</View>;
}

export const longLabel =
  'A deliberately long preference label that stays readable when the system text size is increased';
export const longDescription =
  'Descriptions can span several lines. Increase the device font size and rotate the simulator to inspect native typography, wrapping, and the bounded content width without shortening the setting.';

const styles = StyleSheet.create({
  canvas: { flex: 1 },
  standalone: { flex: 1, padding: 20, width: '100%', maxWidth: 720, alignSelf: 'center' },
});
