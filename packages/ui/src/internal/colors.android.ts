import { useMaterialColors } from '@expo/ui/jetpack-compose';

import { useIdiomAppearance } from '../provider';

export function useColors() {
  const { colorScheme, accentColor } = useIdiomAppearance();
  const palette = useMaterialColors({
    colorScheme,
    ...(accentColor === undefined ? {} : { seedColor: accentColor }),
  });
  return {
    background: palette.surface,
    surface: palette.surfaceContainer,
    text: palette.onSurface,
    secondary: palette.onSurfaceVariant,
    separator: palette.outlineVariant,
    accent: palette.primary,
  };
}
