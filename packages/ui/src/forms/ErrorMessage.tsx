import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text } from 'react-native';

import { useColors } from '../internal/colors';

export function ErrorMessage({ error, testID }: { error: string | undefined; testID?: string }) {
  const colors = useColors();
  const previous = useRef(error);
  useEffect(() => {
    if (error && error !== previous.current && Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibilityWithOptions(error, { queue: true });
    }
    previous.current = error;
  }, [error]);
  if (!error) return null;
  return (
    <Text
      accessibilityLiveRegion="polite"
      style={[styles.error, { color: colors.error }]}
      {...(testID ? { testID } : {})}
    >
      {error}
    </Text>
  );
}

const styles = StyleSheet.create({ error: { fontSize: 15, flexShrink: 1 } });
