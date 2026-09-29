import { Text } from '@expo/ui';
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
      textStyle={{
        fontSize: title ? 22 : 16,
        fontWeight: title ? '600' : 'normal',
        textAlign: 'center',
        ...(typeof color === 'string' ? { color } : {}),
      }}
    >
      {children}
    </Text>
  );
}
