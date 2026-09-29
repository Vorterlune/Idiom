import { Host } from '@expo/ui';
import { createContext, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '../internal/colors';
import { ContentWidthContext } from '../internal/native';
import { useIdiomAppearance } from '../provider';
import type { SettingsScreenProps } from '../types';
import { ScreenLayout } from './platform';

export const InSettingsContext = createContext(false);

export function SettingsScreen({
  children,
  title,
  header,
  safeAreaEdges = ['top', 'right', 'bottom', 'left'],
  testID,
}: SettingsScreenProps) {
  // Deliberately require an application-owned provider rather than creating a second coordinate space.
  useSafeAreaInsets();
  const colors = useColors();
  const { colorScheme, accentColor } = useIdiomAppearance();
  const window = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number>();
  const width = measuredWidth ?? Math.min(window.width, 720);
  return (
    <SafeAreaView
      edges={safeAreaEdges}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      {...(testID ? { testID } : {})}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        {...(Platform.OS === 'ios' ? { behavior: 'padding' as const } : {})}
      >
        <View
          style={styles.content}
          onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)}
        >
          {title ? (
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
          ) : null}
          {header === undefined || header === null ? null : (
            <View style={styles.header}>{header}</View>
          )}
          <Host
            style={styles.flex}
            colorScheme={colorScheme}
            ignoreSafeArea="all"
            {...(accentColor === undefined ? {} : { seedColor: accentColor })}
          >
            <ContentWidthContext value={Math.max(1, width - 32)}>
              <InSettingsContext value={true}>
                <ScreenLayout>{children}</ScreenLayout>
              </InSettingsContext>
            </ContentWidthContext>
          </Host>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
  title: {
    fontSize: 32,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
});
