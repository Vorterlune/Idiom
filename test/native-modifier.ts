import type { ViewProps } from 'react-native';

export type TestModifier = {
  name: string;
  args: readonly unknown[];
};

export const modifier =
  (name: string) =>
  (...args: readonly unknown[]): TestModifier => ({
    name,
    args,
  });

// Project only the documented native accessibility contract into the JS renderer.
// These mocks do not simulate native layout, gesture handling, or announcements.
export function swiftAccessibility(modifiers: readonly TestModifier[] = []): ViewProps {
  const result: ViewProps = {};
  for (const { name, args } of modifiers) {
    const value = args[0];
    if (name === 'accessibilityLabel' && typeof value === 'string')
      result.accessibilityLabel = value;
    if (name === 'accessibilityHint' && typeof value === 'string') result.accessibilityHint = value;
    if (name === 'accessibilityValue' && typeof value === 'string')
      result.accessibilityValue = { text: value };
    if (name === 'accessibilityIdentifier' && typeof value === 'string') result.testID = value;
    if (name === 'disabled') result.accessibilityState = { disabled: value !== false };
    if (name === 'accessibilityHidden') result.accessibilityElementsHidden = value !== false;
    if (name === 'accessibilityElement') result.accessible = true;
    if (name === 'accessibilityAddTraits' && Array.isArray(value)) {
      if (value.includes('isSelected')) {
        result.accessibilityState = { ...result.accessibilityState, selected: true };
      }
      if (value.includes('isHeader')) result.accessibilityRole = 'header';
    }
  }
  return result;
}
