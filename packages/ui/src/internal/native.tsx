import { Host, RNHostView } from '@expo/ui';
import { createContext, useContext, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useIdiomAppearance } from '../provider';

export const ContentWidthContext = createContext(320);
export function useContentWidth() {
  return useContext(ContentWidthContext);
}

export function NativeHost({
  children,
  style,
  decorative = false,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  decorative?: boolean;
}) {
  const { colorScheme, accentColor } = useIdiomAppearance();
  return (
    <Host
      matchContents={{ vertical: true }}
      colorScheme={colorScheme}
      {...(accentColor === undefined ? {} : { seedColor: accentColor })}
      {...(style === undefined ? {} : { style })}
      {...(decorative
        ? {
            pointerEvents: 'none' as const,
            accessible: false,
            importantForAccessibility: 'no-hide-descendants' as const,
            accessibilityElementsHidden: true,
          }
        : {})}
    >
      {children}
    </Host>
  );
}

export function NativeSlot({ children }: { children: ReactNode }) {
  return (
    <RNHostView matchContents>
      <View
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {children}
      </View>
    </RNHostView>
  );
}
