import { EmptyState, SearchBar, Settings } from '@idiom/ui';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';

import { usePreferences, type Appearance } from '../src/preferences';

const appearances = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
] as const;

interface SearchableRow {
  key: string;
  terms: string;
  content: ReactNode;
}

interface SearchableSection {
  title: string;
  footer?: string;
  rows: SearchableRow[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { appearance, setAppearance, notifications, setNotifications, sounds, setSounds } =
    usePreferences();

  const sections: SearchableSection[] = [
    {
      title: 'Account',
      footer: 'Example account. All preferences stay on this device for this session.',
      rows: [
        {
          key: 'profile',
          terms: 'profile name directory',
          content: (
            <Settings.Link
              icon="person"
              label="Profile"
              description="Alex Morgan"
              onPress={() => router.push('/profile')}
              testID="profile-link"
            />
          ),
        },
        {
          key: 'email',
          terms: 'email alex@example.com',
          content: <Settings.Value label="Email" value="alex@example.com" />,
        },
        {
          key: 'privacy',
          terms: 'privacy analytics data',
          content: (
            <Settings.Link
              icon="privacy"
              label="Privacy"
              description="Choose what you share"
              onPress={() => router.push('/privacy')}
              testID="privacy-link"
            />
          ),
        },
      ],
    },
    {
      title: 'Preferences',
      rows: [
        {
          key: 'notifications',
          terms: 'notifications updates alerts',
          content: (
            <Settings.Toggle
              icon="notifications"
              label="Notifications"
              description={notifications ? 'Notifications are on' : 'Notifications are off'}
              value={notifications}
              onValueChange={setNotifications}
              testID="notifications-toggle"
            />
          ),
        },
        {
          key: 'appearance',
          terms: 'appearance theme light dark system',
          content: (
            <Settings.Picker<Appearance>
              icon="appearance"
              label="Appearance"
              description="Choose how Idiom looks"
              value={appearance}
              options={appearances}
              onValueChange={setAppearance}
              testID="appearance-picker"
            />
          ),
        },
        {
          key: 'sounds',
          terms: 'sounds audio feedback',
          content: (
            <Settings.Toggle
              icon="sound"
              label="Sounds"
              description="Play a sound for important updates"
              value={sounds}
              onValueChange={setSounds}
              testID="sounds-toggle"
            />
          ),
        },
      ],
    },
    {
      title: 'About',
      footer: 'Idiom · One API. Native conventions.\nCreated by Vorterlune.',
      rows: [
        {
          key: 'version',
          terms: 'version release 0.1.0',
          content: <Settings.Value icon="info" label="Version" value="0.1.0" />,
        },
        {
          key: 'licences',
          terms: 'licences licenses open source mit',
          content: (
            <Settings.Link
              icon="document"
              label="Licences"
              onPress={() => router.push('/licences')}
              testID="licences-link"
            />
          ),
        },
        {
          key: 'components',
          terms: 'component lab accessibility examples disabled long text tablet slots',
          content: (
            <Settings.Link
              icon="info"
              label="Component lab"
              description="Explore composition and accessibility"
              onPress={() => router.push('/components')}
              testID="components-link"
            />
          ),
        },
      ],
    },
  ];

  const search = query.trim().toLocaleLowerCase();
  const filtered = sections
    .map((section) => ({
      ...section,
      rows: section.rows.filter((row) =>
        `${section.title} ${row.terms}`.toLocaleLowerCase().includes(search),
      ),
    }))
    .filter((section) => section.rows.length > 0);

  return (
    <Settings.Screen
      title="Settings"
      testID="settings-screen"
      header={
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search settings"
          accessibilityLabel="Search settings"
          testID="settings-search"
        />
      }
    >
      {filtered.map((section) => (
        <Settings.Section
          key={section.title}
          title={section.title}
          {...(section.footer === undefined ? {} : { footer: section.footer })}
        >
          {section.rows.map((row) => (
            <RowContent key={row.key}>{row.content}</RowContent>
          ))}
        </Settings.Section>
      ))}
      {filtered.length === 0 && (
        <Settings.Section>
          <EmptyState
            title="No settings found"
            description="Try another search, or clear it to see every setting."
            icon="search"
            action={{ label: 'Clear search', onPress: () => setQuery('') }}
            testID="settings-empty"
          />
        </Settings.Section>
      )}
    </Settings.Screen>
  );
}

function RowContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
