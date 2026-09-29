import { useIdiomAppearance } from '../provider';

export function useColors() {
  const { colorScheme, accentColor } = useIdiomAppearance();
  const dark = colorScheme === 'dark';
  return {
    background: dark ? '#000000' : '#F2F2F7',
    surface: dark ? '#1C1C1E' : '#FFFFFF',
    text: dark ? '#FFFFFF' : '#000000',
    secondary: dark ? '#AEAEB2' : '#636366',
    separator: dark ? '#38383A' : '#D1D1D6',
    accent: accentColor ?? (dark ? '#0A84FF' : '#007AFF'),
  };
}
