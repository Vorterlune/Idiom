import type { ReactNode } from 'react';
import { createElement } from 'react';
import { Platform, Text as RNText, View } from 'react-native';

type Props = { children?: ReactNode; label?: string; [key: string]: unknown };

const container = (name: string) => {
  function NativeContainer(props: Props) {
    return createElement(View, props, props.children);
  }
  NativeContainer.displayName = name;
  return NativeContainer;
};

export const Host = container('Universal.Host');
export const RNHostView = container('Universal.RNHostView');
export const Column = container('Universal.Column');
export const Row = container('Universal.Row');
export const ScrollView = container('Universal.ScrollView');
export const Icon = Object.assign(container('Universal.Icon'), {
  select: (names: { ios: unknown; android: unknown }) =>
    Platform.OS === 'ios' ? names.ios : names.android,
});
export const Divider = container('Universal.Divider');

export function Text(props: Props) {
  return <RNText {...props}>{props.children}</RNText>;
}

export function Button(props: Props) {
  return (
    <View {...props} accessible accessibilityRole="button">
      {props.children ?? <RNText>{props.label}</RNText>}
    </View>
  );
}
