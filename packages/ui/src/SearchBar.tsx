import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useColors } from './internal/colors';
import { SemanticSymbol } from './internal/icons';
import { NativeHost } from './internal/native';
import type { SearchBarProps } from './types';

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  disabled = false,
  onSubmit,
  accessibilityLabel,
  testID,
}: SearchBarProps) {
  const colors = useColors();
  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface, opacity: disabled ? 0.5 : 1 }]}
    >
      <NativeHost decorative style={styles.icon}>
        <SemanticSymbol name="search" size={20} color={colors.secondary} />
      </NativeHost>
      <TextInput
        value={value}
        onChangeText={(text) => {
          if (!disabled && text !== value) onChangeText(text);
        }}
        onSubmitEditing={() => {
          if (!disabled) onSubmit?.();
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.secondary}
        selectionColor={colors.accent}
        editable={!disabled}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        accessibilityRole="search"
        accessibilityState={{ disabled }}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.input, { color: colors.text }]}
        {...(testID ? { testID } : {})}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => {
            if (!disabled) onChangeText('');
          }}
          style={styles.clear}
          {...(testID ? { testID: `${testID}.clear` } : {})}
        >
          <Text accessible={false} style={[styles.clearText, { color: colors.secondary }]}>
            ×
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Platform.OS === 'android' ? 28 : 12,
    minHeight: 48,
    paddingStart: 12,
  },
  icon: { width: 22 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 17,
  },
  clear: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 25 },
});
