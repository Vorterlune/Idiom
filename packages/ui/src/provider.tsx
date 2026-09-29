import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import type { IdiomProviderProps } from './types';

type Preferences = Pick<IdiomProviderProps, 'appearance' | 'accentColor'>;
const PreferencesContext = createContext<Preferences>({});

export function IdiomProvider({
  children,
  appearance = 'system',
  accentColor,
}: IdiomProviderProps) {
  const preferences = useMemo(
    () => ({ appearance, ...(accentColor === undefined ? {} : { accentColor }) }),
    [appearance, accentColor],
  );
  return <PreferencesContext value={preferences}>{children}</PreferencesContext>;
}

export function useIdiomAppearance() {
  const preferences = useContext(PreferencesContext);
  const system = useColorScheme();
  const colorScheme =
    preferences.appearance === 'light' || preferences.appearance === 'dark'
      ? preferences.appearance
      : system === 'dark'
        ? 'dark'
        : 'light';
  return {
    colorScheme,
    appearance: preferences.appearance ?? 'system',
    accentColor: preferences.accentColor,
  };
}
