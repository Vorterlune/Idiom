import { createContext, useContext, useState, type ReactNode } from 'react';

export type Appearance = 'system' | 'light' | 'dark';

export interface Profile {
  name: string;
  email: string;
}

interface Preferences {
  appearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  sounds: boolean;
  setSounds: (enabled: boolean) => void;
  analytics: boolean;
  setAnalytics: (enabled: boolean) => void;
  publicProfile: boolean;
  setPublicProfile: (enabled: boolean) => void;
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>('system');
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: 'Alex Morgan',
    email: 'alex@example.com',
  });

  return (
    <PreferencesContext.Provider
      value={{
        appearance,
        setAppearance,
        notifications,
        setNotifications,
        sounds,
        setSounds,
        analytics,
        setAnalytics,
        publicProfile,
        setPublicProfile,
        profile,
        setProfile,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const preferences = useContext(PreferencesContext);
  if (!preferences) {
    throw new Error('Showcase preferences must be inside PreferencesProvider.');
  }
  return preferences;
}
