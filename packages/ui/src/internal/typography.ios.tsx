import { Text } from '@expo/ui/swift-ui';
import {
  accessibilityAddTraits,
  font,
  foregroundStyle,
  multilineTextAlignment,
} from '@expo/ui/swift-ui/modifiers';
import type { ColorValue } from 'react-native';

export function NativeText({
  children,
  title = false,
  color,
}: {
  children: string;
  title?: boolean;
  color: ColorValue;
}) {
  return (
    <Text
      modifiers={[
        font({ textStyle: title ? 'title2' : 'body', weight: title ? 'semibold' : 'regular' }),
        foregroundStyle({ type: 'color', color }),
        multilineTextAlignment('center'),
        ...(title ? [accessibilityAddTraits(['isHeader'])] : []),
      ]}
    >
      {children}
    </Text>
  );
}
