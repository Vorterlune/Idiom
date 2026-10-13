import { Host } from '@expo/ui';
import type { ReactNode } from 'react';

import { useIdiomAppearance } from '../provider';

export function FormHost({ children }: { children: ReactNode }) {
  const { colorScheme, accentColor } = useIdiomAppearance();
  return (
    <Host
      matchContents={{ vertical: true }}
      ignoreSafeArea="all"
      colorScheme={colorScheme}
      style={{ width: '100%' }}
      {...(accentColor === undefined ? {} : { seedColor: accentColor })}
    >
      {children}
    </Host>
  );
}
