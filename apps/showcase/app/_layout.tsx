import { IdiomProvider } from '@idiom/ui';
import { Stack } from 'expo-router';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PreferencesProvider, usePreferences } from '../src/preferences';

function ShowcaseNavigation() {
  const { appearance } = usePreferences();
  const systemAppearance = useColorScheme();
  const dark = (appearance === 'system' ? systemAppearance : appearance) === 'dark';

  return (
    <IdiomProvider appearance={appearance}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: dark ? '#1c1c1e' : '#ffffff' },
          headerTintColor: dark ? '#ffffff' : '#171717',
          contentStyle: { backgroundColor: dark ? '#000000' : '#f2f2f7' },
          headerBackTitle: 'Settings',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
        <Stack.Screen name="licences" options={{ title: 'Licences' }} />
        <Stack.Screen name="components" options={{ title: 'Component lab' }} />
      </Stack>
    </IdiomProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PreferencesProvider>
        <ShowcaseNavigation />
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}
